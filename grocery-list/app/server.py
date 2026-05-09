import os
import sqlite3
from flask import Flask, request, jsonify, send_file

DB_PATH = "/data/grocery.db"
STATIC = os.path.join(os.path.dirname(__file__), "static")

app = Flask(__name__, static_folder=STATIC)


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


@app.route("/")
def index():
    ingress_path = request.headers.get("X-Ingress-Path", "")
    with open(os.path.join(STATIC, "index.html")) as f:
        html = f.read()
    return html.replace("__INGRESS_PATH__", ingress_path)


@app.route("/static/<path:filename>")
def static_files(filename):
    return app.send_static_file(filename)


@app.route("/api/items", methods=["GET"])
def get_items():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM items ORDER BY checked, category, name"
        ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/items", methods=["POST"])
def add_item():
    data = request.get_json()
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name required"}), 400
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO items (name, quantity, unit, category) VALUES (?, ?, ?, ?)",
            (name, data.get("quantity", "1"), data.get("unit", ""), data.get("category", "Other")),
        )
        row = conn.execute("SELECT * FROM items WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(dict(row)), 201


@app.route("/api/items/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    data = request.get_json()
    allowed = {"name", "quantity", "unit", "category", "checked"}
    fields, values = [], []
    for key in allowed:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])
    if not fields:
        return jsonify({"error": "nothing to update"}), 400
    values.append(item_id)
    with get_db() as conn:
        conn.execute(f"UPDATE items SET {', '.join(fields)} WHERE id = ?", values)
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(dict(row))


@app.route("/api/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    with get_db() as conn:
        conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
    return "", 204


@app.route("/api/items/checked", methods=["DELETE"])
def clear_checked():
    with get_db() as conn:
        conn.execute("DELETE FROM items WHERE checked = 1")
    return "", 204


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=8099, debug=False)
