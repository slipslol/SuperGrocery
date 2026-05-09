import json
import os
import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

_data_dir = "/data" if os.path.isdir("/data") else os.path.dirname(__file__)
DB_PATH = os.environ.get("GROCERY_DB", os.path.join(_data_dir, "grocery.db"))
STATIC = os.path.join(os.path.dirname(__file__), "static")

MIME = {
    ".html": "text/html; charset=utf-8",
    ".css":  "text/css",
    ".js":   "application/javascript",
    ".ico":  "image/x-icon",
}


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS items (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                name       TEXT    NOT NULL,
                quantity   TEXT    NOT NULL DEFAULT '1',
                unit       TEXT    NOT NULL DEFAULT '',
                category   TEXT    NOT NULL DEFAULT 'Other',
                checked    INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(fmt % args)

    # ── helpers ──────────────────────────────────────────────

    def send_json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def send_no_content(self):
        self.send_response(204)
        self.end_headers()

    def send_error_json(self, status, msg):
        self.send_json({"error": msg}, status)

    def read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length)) if length else {}

    # ── routing ───────────────────────────────────────────────

    def do_GET(self):
        path = urlparse(self.path).path

        if path in ("/", "/index.html"):
            ingress_path = self.headers.get("X-Ingress-Path", "")
            with open(os.path.join(STATIC, "index.html"), encoding="utf-8") as f:
                html = f.read().replace("__INGRESS_PATH__", ingress_path)
            body = html.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", len(body))
            self.end_headers()
            self.wfile.write(body)
            return

        if path.startswith("/static/"):
            self._serve_static(path[len("/static/"):])
            return

        if path == "/api/items":
            with get_db() as conn:
                rows = conn.execute(
                    "SELECT * FROM items ORDER BY checked, category, name"
                ).fetchall()
            self.send_json([dict(r) for r in rows])
            return

        self.send_error_json(404, "not found")

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/items":
            data = self.read_json()
            name = (data.get("name") or "").strip()
            if not name:
                self.send_error_json(400, "name required")
                return
            with get_db() as conn:
                cur = conn.execute(
                    "INSERT INTO items (name, quantity, unit, category) VALUES (?, ?, ?, ?)",
                    (name, data.get("quantity", "1"), data.get("unit", ""), data.get("category", "Other")),
                )
                row = conn.execute("SELECT * FROM items WHERE id = ?", (cur.lastrowid,)).fetchone()
            self.send_json(dict(row), 201)
            return
        self.send_error_json(404, "not found")

    def do_PUT(self):
        path = urlparse(self.path).path
        parts = path.strip("/").split("/")
        if len(parts) == 3 and parts[0] == "api" and parts[1] == "items":
            try:
                item_id = int(parts[2])
            except ValueError:
                self.send_error_json(400, "invalid id")
                return
            data = self.read_json()
            allowed = {"name", "quantity", "unit", "category", "checked"}
            fields, values = [], []
            for key in allowed:
                if key in data:
                    fields.append(f"{key} = ?")
                    values.append(data[key])
            if not fields:
                self.send_error_json(400, "nothing to update")
                return
            values.append(item_id)
            with get_db() as conn:
                conn.execute(f"UPDATE items SET {', '.join(fields)} WHERE id = ?", values)
                row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
            if not row:
                self.send_error_json(404, "not found")
                return
            self.send_json(dict(row))
            return
        self.send_error_json(404, "not found")

    def do_DELETE(self):
        path = urlparse(self.path).path
        parts = path.strip("/").split("/")

        if len(parts) == 3 and parts[0] == "api" and parts[1] == "items":
            if parts[2] == "checked":
                with get_db() as conn:
                    conn.execute("DELETE FROM items WHERE checked = 1")
                self.send_no_content()
                return
            try:
                item_id = int(parts[2])
            except ValueError:
                self.send_error_json(400, "invalid id")
                return
            with get_db() as conn:
                conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
            self.send_no_content()
            return

        self.send_error_json(404, "not found")

    def _serve_static(self, filename):
        filepath = os.path.join(STATIC, filename)
        if not os.path.isfile(filepath):
            self.send_error_json(404, "not found")
            return
        ext = os.path.splitext(filename)[1]
        mime = MIME.get(ext, "application/octet-stream")
        with open(filepath, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    init_db()
    print(f"DB: {DB_PATH}")
    print("Listening on http://localhost:8099")
    HTTPServer(("0.0.0.0", 8099), Handler).serve_forever()
