# SuperGrocery

A sleek, fast grocery list addon for [Home Assistant](https://www.home-assistant.io/). Runs as a native HA addon with its own sidebar panel — no external services, no cloud sync, just a clean UI backed by a local SQLite database.

## Features

- **8 categories** — Produce, Dairy, Meat, Bakery, Pantry, Frozen, Beverages, Other — each with a distinct color
- **Add items** with name, quantity, unit, and category
- **Check off** items with an animated checkbox; checked items fade to the bottom
- **Edit** any item inline via the pencil icon
- **Delete** individual items or **clear all checked** at once
- **Category filter** pills to focus on one section at a time
- **Remaining count** shown in the header
- Sleek dark UI that feels at home in HA's sidebar
- Data persists in `/data/grocery.db` — survives addon restarts and HA reboots

## Installation

### 1. Add this repository to Home Assistant

Go to **Settings → Add-ons → ⋮ (top-right) → Repositories** and paste:

```
https://github.com/slipslol/SuperGrocery
```

### 2. Install the addon

Refresh the addon store, find **SuperGrocery**, and click **Install**.

### 3. Start it

Click **Start**. The **Grocery** panel will appear in your HA sidebar automatically.

## Requirements

- Home Assistant OS or Supervised installation (Supervisor required for addons)
- amd64 or aarch64 architecture

## Development

The addon is a plain Python/Flask app — no build step needed.

```
grocery-list/
  config.yaml          # HA addon metadata
  Dockerfile           # python:3.11-alpine + flask
  app/
    server.py          # REST API + static file serving
    static/
      index.html
      style.css
      app.js
```

To run locally for testing:

```bash
cd grocery-list/app
pip install flask
python3 server.py
# Open http://localhost:8099
```

## License

MIT
