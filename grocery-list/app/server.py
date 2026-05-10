import base64
import datetime
import json
import os
import sqlite3
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

_data_dir = "/data" if os.path.isdir("/data") else os.path.dirname(__file__)
DB_PATH = os.environ.get("GROCERY_DB", os.path.join(_data_dir, "grocery.db"))
STATIC = os.path.join(os.path.dirname(__file__), "static")

MIME = {".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "application/javascript"}

SEED_ITEMS = [
    # Produce
    ("Apples", "1", "bag", "Produce"), ("Bananas", "1", "bunch", "Produce"),
    ("Oranges", "1", "bag", "Produce"), ("Lemons", "4", "", "Produce"),
    ("Limes", "4", "", "Produce"), ("Strawberries", "1", "pint", "Produce"),
    ("Blueberries", "1", "pint", "Produce"), ("Raspberries", "1", "pint", "Produce"),
    ("Red Grapes", "1", "bag", "Produce"), ("Green Grapes", "1", "bag", "Produce"),
    ("Watermelon", "1", "", "Produce"), ("Cantaloupe", "1", "", "Produce"),
    ("Peaches", "4", "", "Produce"), ("Pears", "4", "", "Produce"),
    ("Plums", "4", "", "Produce"), ("Cherries", "1", "lb", "Produce"),
    ("Pineapple", "1", "", "Produce"), ("Mango", "2", "", "Produce"),
    ("Avocado", "2", "", "Produce"), ("Tomatoes", "4", "", "Produce"),
    ("Cherry Tomatoes", "1", "pint", "Produce"), ("Cucumber", "2", "", "Produce"),
    ("Zucchini", "2", "", "Produce"), ("Broccoli", "1", "head", "Produce"),
    ("Cauliflower", "1", "head", "Produce"), ("Carrots", "1", "bag", "Produce"),
    ("Celery", "1", "bunch", "Produce"), ("Bell Peppers", "3", "", "Produce"),
    ("Jalapeños", "3", "", "Produce"), ("Spinach", "1", "bag", "Produce"),
    ("Kale", "1", "bunch", "Produce"), ("Romaine Lettuce", "1", "head", "Produce"),
    ("Cabbage", "1", "head", "Produce"), ("Mushrooms", "8", "oz", "Produce"),
    ("Onions", "3", "", "Produce"), ("Red Onion", "1", "", "Produce"),
    ("Green Onions", "1", "bunch", "Produce"), ("Garlic", "1", "head", "Produce"),
    ("Potatoes", "5", "lb", "Produce"), ("Sweet Potatoes", "3", "", "Produce"),
    ("Green Beans", "1", "lb", "Produce"), ("Corn on the Cob", "4", "", "Produce"),
    ("Asparagus", "1", "bunch", "Produce"), ("Brussels Sprouts", "1", "lb", "Produce"),
    ("Beets", "1", "bunch", "Produce"), ("Edamame", "1", "bag", "Produce"),
    # Dairy
    ("Whole Milk", "1", "gal", "Dairy"), ("2% Milk", "1", "gal", "Dairy"),
    ("Almond Milk", "1", "half-gal", "Dairy"), ("Oat Milk", "1", "half-gal", "Dairy"),
    ("Half & Half", "1", "pt", "Dairy"), ("Heavy Cream", "1", "pt", "Dairy"),
    ("Sour Cream", "1", "container", "Dairy"), ("Greek Yogurt", "32", "oz", "Dairy"),
    ("Plain Yogurt", "32", "oz", "Dairy"), ("Flavored Yogurt Cups", "6", "pack", "Dairy"),
    ("Butter", "1", "lb", "Dairy"), ("Cream Cheese", "8", "oz", "Dairy"),
    ("Cheddar Cheese", "8", "oz", "Dairy"), ("Shredded Cheddar", "8", "oz", "Dairy"),
    ("Mozzarella", "8", "oz", "Dairy"), ("Parmesan", "1", "container", "Dairy"),
    ("Swiss Cheese", "8", "oz", "Dairy"), ("Provolone", "8", "oz", "Dairy"),
    ("Pepper Jack", "8", "oz", "Dairy"), ("Colby Jack", "8", "oz", "Dairy"),
    ("American Cheese Slices", "1", "pkg", "Dairy"), ("Cottage Cheese", "16", "oz", "Dairy"),
    ("Ricotta", "15", "oz", "Dairy"), ("Eggs", "1", "dozen", "Dairy"),
    ("String Cheese", "1", "pkg", "Dairy"), ("Coffee Creamer", "1", "bottle", "Dairy"),
    # Meat
    ("Chicken Breast", "2", "lb", "Meat"), ("Chicken Thighs", "2", "lb", "Meat"),
    ("Chicken Wings", "2", "lb", "Meat"), ("Whole Chicken", "1", "", "Meat"),
    ("Ground Beef 80/20", "2", "lb", "Meat"), ("Ground Beef 90/10", "2", "lb", "Meat"),
    ("Ground Turkey", "1", "lb", "Meat"), ("Ground Pork", "1", "lb", "Meat"),
    ("Ribeye Steak", "2", "", "Meat"), ("NY Strip Steak", "2", "", "Meat"),
    ("Sirloin Steak", "2", "", "Meat"), ("Flank Steak", "1", "lb", "Meat"),
    ("Chuck Roast", "3", "lb", "Meat"), ("Pork Chops", "4", "", "Meat"),
    ("Pork Tenderloin", "1", "", "Meat"), ("Baby Back Ribs", "1", "rack", "Meat"),
    ("Bacon", "1", "pkg", "Meat"), ("Turkey Bacon", "1", "pkg", "Meat"),
    ("Ham", "1", "lb", "Meat"), ("Deli Turkey", "1", "lb", "Meat"),
    ("Deli Ham", "1", "lb", "Meat"), ("Hot Dogs", "1", "pkg", "Meat"),
    ("Bratwurst", "1", "pkg", "Meat"), ("Italian Sausage", "1", "pkg", "Meat"),
    ("Breakfast Sausage", "1", "pkg", "Meat"), ("Pepperoni", "1", "pkg", "Meat"),
    ("Salmon Fillet", "1", "lb", "Meat"), ("Tilapia", "1", "lb", "Meat"),
    ("Shrimp", "1", "lb", "Meat"), ("Cod", "1", "lb", "Meat"),
    ("Tuna Steak", "2", "", "Meat"), ("Canned Tuna", "3", "cans", "Meat"),
    ("Lamb Chops", "4", "", "Meat"),
    # Bakery
    ("White Bread", "1", "loaf", "Bakery"), ("Whole Wheat Bread", "1", "loaf", "Bakery"),
    ("Sourdough Bread", "1", "loaf", "Bakery"), ("Rye Bread", "1", "loaf", "Bakery"),
    ("Brioche", "1", "loaf", "Bakery"), ("Bagels", "1", "pkg", "Bakery"),
    ("English Muffins", "1", "pkg", "Bakery"), ("Croissants", "4", "", "Bakery"),
    ("Dinner Rolls", "1", "pkg", "Bakery"), ("Hamburger Buns", "1", "pkg", "Bakery"),
    ("Hot Dog Buns", "1", "pkg", "Bakery"), ("Flour Tortillas", "1", "pkg", "Bakery"),
    ("Corn Tortillas", "1", "pkg", "Bakery"), ("Pita Bread", "1", "pkg", "Bakery"),
    ("Naan", "1", "pkg", "Bakery"), ("Baguette", "1", "", "Bakery"),
    ("Blueberry Muffins", "4", "", "Bakery"), ("Donuts", "1", "dozen", "Bakery"),
    ("Cinnamon Rolls", "1", "pkg", "Bakery"), ("Biscuits", "1", "can", "Bakery"),
    # Pantry
    ("All-Purpose Flour", "5", "lb", "Pantry"), ("Sugar", "4", "lb", "Pantry"),
    ("Brown Sugar", "2", "lb", "Pantry"), ("Powdered Sugar", "2", "lb", "Pantry"),
    ("Honey", "1", "jar", "Pantry"), ("Maple Syrup", "1", "bottle", "Pantry"),
    ("Olive Oil", "1", "bottle", "Pantry"), ("Vegetable Oil", "1", "bottle", "Pantry"),
    ("Coconut Oil", "1", "jar", "Pantry"), ("Apple Cider Vinegar", "1", "bottle", "Pantry"),
    ("White Vinegar", "1", "bottle", "Pantry"), ("Balsamic Vinegar", "1", "bottle", "Pantry"),
    ("Soy Sauce", "1", "bottle", "Pantry"), ("Worcestershire Sauce", "1", "bottle", "Pantry"),
    ("Hot Sauce", "1", "bottle", "Pantry"), ("Ketchup", "1", "bottle", "Pantry"),
    ("Mustard", "1", "bottle", "Pantry"), ("Mayonnaise", "1", "jar", "Pantry"),
    ("Ranch Dressing", "1", "bottle", "Pantry"), ("Italian Dressing", "1", "bottle", "Pantry"),
    ("Pasta Sauce", "1", "jar", "Pantry"), ("Tomato Paste", "1", "can", "Pantry"),
    ("Canned Diced Tomatoes", "2", "cans", "Pantry"), ("Chicken Broth", "32", "oz", "Pantry"),
    ("Beef Broth", "32", "oz", "Pantry"), ("Coconut Milk", "1", "can", "Pantry"),
    ("Canned Black Beans", "2", "cans", "Pantry"), ("Canned Kidney Beans", "2", "cans", "Pantry"),
    ("Canned Chickpeas", "2", "cans", "Pantry"), ("Canned Corn", "2", "cans", "Pantry"),
    ("Canned Salmon", "2", "cans", "Pantry"), ("Peanut Butter", "1", "jar", "Pantry"),
    ("Almond Butter", "1", "jar", "Pantry"), ("Jelly", "1", "jar", "Pantry"),
    ("Jam", "1", "jar", "Pantry"), ("Saltine Crackers", "1", "box", "Pantry"),
    ("Graham Crackers", "1", "box", "Pantry"), ("Ritz Crackers", "1", "box", "Pantry"),
    ("Spaghetti", "1", "lb", "Pantry"), ("Penne Pasta", "1", "lb", "Pantry"),
    ("Rotini Pasta", "1", "lb", "Pantry"), ("Macaroni", "1", "lb", "Pantry"),
    ("Fettuccine", "1", "lb", "Pantry"), ("White Rice", "5", "lb", "Pantry"),
    ("Brown Rice", "2", "lb", "Pantry"), ("Jasmine Rice", "2", "lb", "Pantry"),
    ("Quinoa", "1", "bag", "Pantry"), ("Oatmeal", "1", "container", "Pantry"),
    ("Granola", "1", "bag", "Pantry"), ("Cereal", "1", "box", "Pantry"),
    ("Pancake Mix", "1", "box", "Pantry"), ("Baking Powder", "1", "can", "Pantry"),
    ("Baking Soda", "1", "box", "Pantry"), ("Salt", "1", "container", "Pantry"),
    ("Black Pepper", "1", "container", "Pantry"), ("Garlic Powder", "1", "jar", "Pantry"),
    ("Onion Powder", "1", "jar", "Pantry"), ("Cumin", "1", "jar", "Pantry"),
    ("Paprika", "1", "jar", "Pantry"), ("Chili Powder", "1", "jar", "Pantry"),
    ("Italian Seasoning", "1", "jar", "Pantry"), ("Oregano", "1", "jar", "Pantry"),
    ("Cinnamon", "1", "jar", "Pantry"), ("Vanilla Extract", "1", "bottle", "Pantry"),
    ("Chocolate Chips", "1", "bag", "Pantry"), ("Cocoa Powder", "1", "container", "Pantry"),
    ("Coffee", "1", "bag", "Pantry"), ("Tea Bags", "1", "box", "Pantry"),
    ("Mac and Cheese", "3", "boxes", "Pantry"), ("Ramen Noodles", "6", "packs", "Pantry"),
    ("Protein Powder", "1", "container", "Pantry"), ("Bread Crumbs", "1", "container", "Pantry"),
    ("Cornstarch", "1", "box", "Pantry"), ("Chicken Noodle Soup", "2", "cans", "Pantry"),
    ("Tomato Soup", "2", "cans", "Pantry"),
    # Frozen
    ("Frozen Pizza", "2", "", "Frozen"), ("Frozen Burritos", "1", "box", "Frozen"),
    ("Tater Tots", "1", "bag", "Frozen"), ("French Fries", "1", "bag", "Frozen"),
    ("Frozen Waffles", "1", "box", "Frozen"), ("Frozen Pancakes", "1", "box", "Frozen"),
    ("Frozen Vegetable Mix", "1", "bag", "Frozen"), ("Frozen Peas", "1", "bag", "Frozen"),
    ("Frozen Corn", "1", "bag", "Frozen"), ("Frozen Broccoli", "1", "bag", "Frozen"),
    ("Frozen Edamame", "1", "bag", "Frozen"), ("Frozen Spinach", "1", "box", "Frozen"),
    ("Ice Cream", "1", "half-gal", "Frozen"), ("Frozen Yogurt", "1", "container", "Frozen"),
    ("Popsicles", "1", "box", "Frozen"), ("Ice Cream Bars", "1", "box", "Frozen"),
    ("Frozen Chicken Nuggets", "1", "bag", "Frozen"), ("Frozen Fish Sticks", "1", "box", "Frozen"),
    ("Frozen Shrimp", "1", "bag", "Frozen"), ("Frozen Meatballs", "1", "bag", "Frozen"),
    ("Frozen Lasagna", "1", "", "Frozen"), ("Frozen Fruit Mix", "1", "bag", "Frozen"),
    ("Frozen Breakfast Sandwiches", "1", "box", "Frozen"),
    # Beverages
    ("Water Bottles", "1", "case", "Beverages"), ("Sparkling Water", "1", "case", "Beverages"),
    ("Orange Juice", "1", "half-gal", "Beverages"), ("Apple Juice", "1", "half-gal", "Beverages"),
    ("Cranberry Juice", "1", "bottle", "Beverages"), ("Lemonade", "1", "half-gal", "Beverages"),
    ("Iced Tea", "1", "half-gal", "Beverages"), ("Green Tea", "1", "box", "Beverages"),
    ("Sports Drink", "6", "pack", "Beverages"), ("Energy Drink", "4", "pack", "Beverages"),
    ("Soda (Cola)", "1", "12-pack", "Beverages"), ("Diet Soda", "1", "12-pack", "Beverages"),
    ("Root Beer", "1", "12-pack", "Beverages"), ("Ginger Ale", "1", "12-pack", "Beverages"),
    ("Beer", "1", "12-pack", "Beverages"), ("Red Wine", "1", "bottle", "Beverages"),
    ("White Wine", "1", "bottle", "Beverages"), ("Hard Seltzer", "1", "12-pack", "Beverages"),
    ("Kombucha", "4", "pack", "Beverages"), ("Hot Cocoa Mix", "1", "box", "Beverages"),
    # Other
    ("Paper Towels", "1", "pack", "Other"), ("Toilet Paper", "1", "pack", "Other"),
    ("Dish Soap", "1", "bottle", "Other"), ("Laundry Detergent", "1", "bottle", "Other"),
    ("Dryer Sheets", "1", "box", "Other"), ("Trash Bags", "1", "box", "Other"),
    ("Zip Lock Bags (Gallon)", "1", "box", "Other"), ("Zip Lock Bags (Sandwich)", "1", "box", "Other"),
    ("Aluminum Foil", "1", "roll", "Other"), ("Plastic Wrap", "1", "roll", "Other"),
    ("Parchment Paper", "1", "roll", "Other"), ("Sponges", "1", "pack", "Other"),
    ("Hand Soap", "1", "bottle", "Other"), ("Tissues", "1", "box", "Other"),
    ("Napkins", "1", "pack", "Other"), ("Cleaning Spray", "1", "bottle", "Other"),
    ("Shampoo", "1", "bottle", "Other"), ("Conditioner", "1", "bottle", "Other"),
    ("Body Wash", "1", "bottle", "Other"), ("Toothpaste", "1", "tube", "Other"),
]

# ── Kroger API ───────────────────────────────────────────────
_kroger_token_cache = {'token': None, 'expires_at': 0.0}


def _load_options():
    try:
        with open('/data/options.json', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        pass
    # Fallback: environment variables (local development)
    return {
        'kroger_client_id':     os.environ.get('KROGER_CLIENT_ID', ''),
        'kroger_client_secret': os.environ.get('KROGER_CLIENT_SECRET', ''),
        'kroger_location_id':   os.environ.get('KROGER_LOCATION_ID', ''),
    }


def _get_kroger_token():
    opts = _load_options()
    cid  = (opts.get('kroger_client_id')     or '').strip()
    csec = (opts.get('kroger_client_secret') or '').strip()
    if not cid or not csec:
        return None
    now = time.time()
    if _kroger_token_cache['token'] and now < _kroger_token_cache['expires_at'] - 60:
        return _kroger_token_cache['token']
    creds = base64.b64encode(f"{cid}:{csec}".encode()).decode()
    req = urllib.request.Request(
        'https://api.kroger.com/v1/connect/oauth2/token',
        data=b'grant_type=client_credentials&scope=product.compact',
        headers={
            'Authorization': f'Basic {creds}',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        _kroger_token_cache['token'] = data['access_token']
        _kroger_token_cache['expires_at'] = now + data.get('expires_in', 1800)
        return _kroger_token_cache['token']
    except Exception as e:
        print(f"Kroger token error: {e}")
        return None


def _kroger_fetch_price(name, location_id=''):
    if not location_id:
        location_id = (_get_pref('kroger_location_id') or '').strip()
    token = _get_kroger_token()
    if not token:
        return None
    words = name.strip().split()
    term = ' '.join(words[:3])
    params = {'filter.term': term, 'filter.limit': '5'}
    if location_id:
        params['filter.locationId'] = location_id
    url = 'https://api.kroger.com/v1/products?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json',
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        products = data.get('data', [])
        if not products:
            return None

        # Scan all returned products and pick the lowest-priced one with a valid price
        best_price = best_promo = best_img = None
        for prod in products:
            for itm in prod.get('items', []):
                for key in ('price', 'nationalPrice'):
                    p = itm.get(key)
                    if isinstance(p, dict) and p.get('regular'):
                        regular = p['regular']
                        if best_price is None or regular < best_price:
                            best_price = regular
                            pv = p.get('promo')
                            best_promo = pv if pv and pv > 0 and pv < regular else None
                            # grab image from this product
                            best_img = ''
                            for img in prod.get('images', []):
                                if img.get('perspective') == 'front':
                                    for sz in img.get('sizes', []):
                                        if sz.get('size') == 'medium':
                                            best_img = sz.get('url', '')
                                            break
                                    if best_img:
                                        break
                        break

        return {'price': best_price, 'promo': best_promo, 'image_url': best_img or ''}
    except Exception as e:
        print(f"Kroger search error: {e}")
        return None


# ── Database ─────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _get_pref(key):
    try:
        with get_db() as conn:
            row = conn.execute("SELECT value FROM prefs WHERE key=?", (key,)).fetchone()
        return row['value'] if row else None
    except Exception:
        return None


def _set_pref(key, value):
    with get_db() as conn:
        conn.execute("INSERT OR REPLACE INTO prefs (key, value) VALUES (?, ?)", (key, value))


def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS items (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                name           TEXT    NOT NULL,
                quantity       TEXT    NOT NULL DEFAULT '1',
                unit           TEXT    NOT NULL DEFAULT '',
                category       TEXT    NOT NULL DEFAULT 'Other',
                checked        INTEGER NOT NULL DEFAULT 0,
                in_list        INTEGER NOT NULL DEFAULT 0,
                notes          TEXT    NOT NULL DEFAULT '',
                store          TEXT    NOT NULL DEFAULT '',
                kroger_price   REAL,
                kroger_promo   REAL,
                kroger_img     TEXT    NOT NULL DEFAULT '',
                kroger_updated TEXT    NOT NULL DEFAULT '',
                created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Migrate older DBs
        for col, defn in [
            ("in_list",        "INTEGER NOT NULL DEFAULT 0"),
            ("notes",          "TEXT NOT NULL DEFAULT ''"),
            ("store",          "TEXT NOT NULL DEFAULT ''"),
            ("kroger_price",   "REAL"),
            ("kroger_promo",   "REAL"),
            ("kroger_img",     "TEXT NOT NULL DEFAULT ''"),
            ("kroger_updated", "TEXT NOT NULL DEFAULT ''"),
        ]:
            try:
                conn.execute(f"ALTER TABLE items ADD COLUMN {col} {defn}")
            except Exception:
                pass

        conn.execute("""
            CREATE TABLE IF NOT EXISTS prefs (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL DEFAULT ''
            )
        """)

        count = conn.execute("SELECT COUNT(*) FROM items").fetchone()[0]
        if count == 0:
            conn.executemany(
                "INSERT INTO items (name, quantity, unit, category) VALUES (?, ?, ?, ?)",
                SEED_ITEMS,
            )
            print(f"Seeded {len(SEED_ITEMS)} items")


# ── HTTP handler ─────────────────────────────────────────────
class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(fmt % args)

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

    def do_GET(self):
        path = urlparse(self.path).path

        # ── Static files
        if path in ("/", "/index.html"):
            ingress = self.headers.get("X-Ingress-Path", "")
            with open(os.path.join(STATIC, "index.html"), encoding="utf-8") as f:
                body = f.read().replace("__HA_BASE__", ingress).encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", len(body))
            self.end_headers()
            self.wfile.write(body)
            return

        if path.startswith("/static/"):
            self._serve_static(path[len("/static/"):])
            return

        # ── Kroger status
        if path == "/api/kroger/status":
            opts     = _load_options()
            enabled  = bool((opts.get('kroger_client_id') or '').strip())
            opts_loc = (opts.get('kroger_location_id') or '').strip()
            pref_loc = (_get_pref('kroger_location_id') or '').strip()
            has_loc  = bool(opts_loc or pref_loc)
            store_name = '' if opts_loc else (_get_pref('kroger_store_name') or '')
            self.send_json({'enabled': enabled, 'has_location': has_loc, 'store_name': store_name})
            return

        # ── Kroger saved location  GET /api/kroger/location
        if path == "/api/kroger/location":
            opts     = _load_options()
            opts_loc = (opts.get('kroger_location_id') or '').strip()
            pref_loc = (_get_pref('kroger_location_id') or '').strip()
            store_name = '' if opts_loc else (_get_pref('kroger_store_name') or '')
            self.send_json({
                'location_id': opts_loc or pref_loc,
                'store_name': store_name,
                'source': 'options' if opts_loc else ('pref' if pref_loc else 'none'),
            })
            return

        # ── Kroger connection test  GET /api/kroger/test
        if path == "/api/kroger/test":
            opts = _load_options()
            cid  = (opts.get('kroger_client_id')     or '').strip()
            csec = (opts.get('kroger_client_secret') or '').strip()
            loc  = (opts.get('kroger_location_id')   or '').strip()
            if not cid or not csec:
                self.send_json({'step': 'config', 'ok': False,
                                'error': 'kroger_client_id or kroger_client_secret not set in addon options'})
                return
            # Step 1: get token
            creds = base64.b64encode(f"{cid}:{csec}".encode()).decode()
            req = urllib.request.Request(
                'https://api.kroger.com/v1/connect/oauth2/token',
                data=b'grant_type=client_credentials&scope=product.compact',
                headers={'Authorization': f'Basic {creds}',
                         'Content-Type': 'application/x-www-form-urlencoded'},
            )
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    token_data = json.loads(resp.read())
                token = token_data.get('access_token')
                if not token:
                    self.send_json({'step': 'auth', 'ok': False,
                                    'error': 'No access_token in response', 'raw': token_data})
                    return
            except Exception as e:
                self.send_json({'step': 'auth', 'ok': False, 'error': str(e)})
                return
            # Step 2: search for a product
            params = {'filter.term': 'Milk', 'filter.limit': '1'}
            if loc:
                params['filter.locationId'] = loc
            url = 'https://api.kroger.com/v1/products?' + urllib.parse.urlencode(params)
            req2 = urllib.request.Request(url, headers={
                'Authorization': f'Bearer {token}', 'Accept': 'application/json'})
            try:
                with urllib.request.urlopen(req2, timeout=10) as resp:
                    prod_data = json.loads(resp.read())
                products = prod_data.get('data', [])
                if not products:
                    self.send_json({'step': 'search', 'ok': False,
                                    'error': 'No products returned', 'has_location': bool(loc)})
                    return
                prod = products[0]
                items = prod.get('items', [])
                price_info = None
                for itm in items:
                    for key in ('price', 'nationalPrice'):
                        p = itm.get(key)
                        if isinstance(p, dict) and p.get('regular'):
                            price_info = {key: p}
                            break
                    if price_info:
                        break
                self.send_json({
                    'step': 'search', 'ok': True,
                    'product': prod.get('description'),
                    'has_location': bool(loc),
                    'price_found': price_info is not None,
                    'price_info': price_info,
                    'raw_items': items[:1],
                })
            except Exception as e:
                self.send_json({'step': 'search', 'ok': False, 'error': str(e)})
            return

        # ── Kroger location search  GET /api/kroger/locations?zip=XXXXX
        if path == "/api/kroger/locations":
            qs = dict(urllib.parse.parse_qsl(urlparse(self.path).query))
            zip_code = (qs.get('zip') or '').strip()
            if not zip_code:
                self.send_error_json(400, "zip required")
                return
            token = _get_kroger_token()
            if not token:
                self.send_error_json(503, "Kroger credentials not configured")
                return
            lurl = 'https://api.kroger.com/v1/locations?' + urllib.parse.urlencode({
                'filter.zipCode.near': zip_code,
                'filter.limit': '5',
                'filter.radiusInMiles': '10',
            })
            req = urllib.request.Request(lurl, headers={
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json',
            })
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read())
                locs = []
                for loc in data.get('data', []):
                    addr = loc.get('address', {})
                    locs.append({
                        'locationId': loc.get('locationId'),
                        'name': loc.get('name'),
                        'address': f"{addr.get('addressLine1','')}, {addr.get('city','')}, {addr.get('state','')}",
                    })
                self.send_json(locs)
            except Exception as e:
                print(f"Kroger locations error: {e}")
                self.send_error_json(502, f"Kroger locations error: {e}")
            return

        # ── Price lookup for a single item  GET /api/items/{id}/price
        parts = path.strip("/").split("/")
        if len(parts) == 4 and parts[0] == "api" and parts[1] == "items" and parts[3] == "price":
            try:
                item_id = int(parts[2])
            except ValueError:
                self.send_error_json(400, "invalid id")
                return
            with get_db() as conn:
                row = conn.execute("SELECT * FROM items WHERE id=?", (item_id,)).fetchone()
            if not row:
                self.send_error_json(404, "not found")
                return
            item = dict(row)

            # Serve from cache if fresh (< 6 hours)
            updated = item.get('kroger_updated', '')
            if updated and item.get('kroger_price') is not None:
                try:
                    age = (datetime.datetime.utcnow() -
                           datetime.datetime.fromisoformat(updated)).total_seconds()
                    if age < 21600:
                        self.send_json(item)
                        return
                except Exception:
                    pass

            opts   = _load_options()
            loc    = (opts.get('kroger_location_id') or '').strip()
            result = _kroger_fetch_price(item['name'], loc)
            now_iso = datetime.datetime.utcnow().isoformat()

            if result and result.get('price') is not None:
                with get_db() as conn:
                    conn.execute(
                        "UPDATE items SET kroger_price=?, kroger_promo=?, kroger_img=?, kroger_updated=? WHERE id=?",
                        (result['price'], result['promo'], result['image_url'], now_iso, item_id),
                    )
                    row = conn.execute("SELECT * FROM items WHERE id=?", (item_id,)).fetchone()
                self.send_json(dict(row))
            else:
                # Mark attempted to avoid hammering the API for items with no match
                with get_db() as conn:
                    conn.execute("UPDATE items SET kroger_updated=? WHERE id=?", (now_iso, item_id))
                self.send_json(item)
            return

        # ── All items
        if path == "/api/items":
            with get_db() as conn:
                rows = conn.execute("SELECT * FROM items ORDER BY category, name").fetchall()
            self.send_json([dict(r) for r in rows])
            return

        self.send_error_json(404, "not found")

    def do_POST(self):
        if urlparse(self.path).path == "/api/kroger/location":
            data = self.read_json()
            loc_id     = (data.get('location_id') or '').strip()
            store_name = (data.get('store_name')  or '').strip()
            _set_pref('kroger_location_id', loc_id)
            _set_pref('kroger_store_name', store_name)
            # Clear cached prices so they re-fetch with the new store's location
            with get_db() as conn:
                conn.execute("UPDATE items SET kroger_price=NULL, kroger_promo=NULL, kroger_updated=''")
            self.send_json({'ok': True, 'location_id': loc_id, 'store_name': store_name})
            return

        if urlparse(self.path).path == "/api/items":
            data = self.read_json()
            name = (data.get("name") or "").strip()
            if not name:
                self.send_error_json(400, "name required")
                return
            with get_db() as conn:
                cur = conn.execute(
                    "INSERT INTO items (name, quantity, unit, category, in_list, notes, store) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (name, data.get("quantity", "1"), data.get("unit", ""),
                     data.get("category", "Other"), 1 if data.get("in_list") else 0,
                     data.get("notes", ""), data.get("store", "")),
                )
                row = conn.execute("SELECT * FROM items WHERE id=?", (cur.lastrowid,)).fetchone()
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
            allowed = {"name", "quantity", "unit", "category", "checked", "in_list", "notes", "store"}
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
                conn.execute(f"UPDATE items SET {', '.join(fields)} WHERE id=?", values)
                row = conn.execute("SELECT * FROM items WHERE id=?", (item_id,)).fetchone()
            if not row:
                self.send_error_json(404, "not found")
                return
            self.send_json(dict(row))
            return
        self.send_error_json(404, "not found")

    def do_DELETE(self):
        path = urlparse(self.path).path
        parts = path.strip("/").split("/")

        if parts == ["api", "items", "checked"]:
            with get_db() as conn:
                conn.execute("UPDATE items SET in_list=0, checked=0 WHERE in_list=1 AND checked=1")
            self.send_no_content()
            return

        if parts == ["api", "list"]:
            with get_db() as conn:
                conn.execute("UPDATE items SET in_list=0, checked=0 WHERE in_list=1")
            self.send_no_content()
            return

        if parts == ["api", "list", "uncheck"]:
            with get_db() as conn:
                conn.execute("UPDATE items SET checked=0 WHERE in_list=1")
            self.send_no_content()
            return

        if len(parts) == 3 and parts[0] == "api" and parts[1] == "items":
            try:
                item_id = int(parts[2])
            except ValueError:
                self.send_error_json(400, "invalid id")
                return
            with get_db() as conn:
                conn.execute("DELETE FROM items WHERE id=?", (item_id,))
            self.send_no_content()
            return

        self.send_error_json(404, "not found")

    def _serve_static(self, filename):
        filepath = os.path.join(STATIC, filename)
        if not os.path.isfile(filepath):
            self.send_error_json(404, "not found")
            return
        ext = os.path.splitext(filename)[1]
        with open(filepath, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", MIME.get(ext, "application/octet-stream"))
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    init_db()
    print(f"DB: {DB_PATH}")
    print("Listening on http://localhost:8099")
    HTTPServer(("0.0.0.0", 8099), Handler).serve_forever()
