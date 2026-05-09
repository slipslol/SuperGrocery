# SuperGrocery

A sleek, mobile-first grocery list addon for [Home Assistant](https://www.home-assistant.io/). Runs as a native HA addon with its own sidebar panel — no external services, no cloud sync, just a clean UI backed by a local SQLite database.

## Features

- **Browse & Search** — 260+ pre-seeded American grocery items organized by category (Produce, Dairy, Meat, Bakery, Pantry, Frozen, Beverages, Other)
- **Smart search** — type to filter items instantly; add any custom item that doesn't exist
- **Category filters** — tap pills to browse by section; each category has a distinct color
- **Store filter** — filter the browse view by store
- **Item details** — edit quantity, unit, notes, category, and preferred store per item
- **Emoji icons** — 100+ item-to-emoji mappings with category fallback
- **Guided shopping flow**:
  1. Browse and tap `+` to build your list
  2. Tap **Ready to Shop** → choose your store
  3. **Shop mode** — large tap targets, grouped by category, progress bar in the header
  4. Auto-advances to the done screen when everything is checked off (or tap **Finish** early)
  5. **Start New List** clears everything · **Same List Next Trip** keeps items and unchecks for next time
- Confetti + haptic feedback on completion
- **Responsive** — phone, tablet, and two-panel desktop layout (≥1024px)
- Data persists in `/data/grocery.db` — survives addon restarts and HA reboots

## Supported Stores

Kroger · Publix · Aldi · Walmart · Target · Costco · Whole Foods

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

- Home Assistant OS or Supervised (Supervisor required for addons)
- amd64 or aarch64 architecture

## Development

No build step needed — pure Python stdlib + vanilla HTML/CSS/JS.

```
grocery-list/
  config.yaml          # HA addon metadata
  Dockerfile           # python:3.11-alpine
  app/
    server.py          # REST API + static file serving (stdlib only)
    static/
      index.html
      style.css
      app.js
```

To run locally:

```bash
cd grocery-list/app
python3 server.py
# Open http://localhost:8099
```

## Changelog

### v1.0.3
- Full guided shopping flow: build list → pick store → shop mode → done screen
- Shopping mode with large tap targets, category groupings, and header progress bar
- Auto-transitions to done screen when all items are checked off
- Confetti celebration + haptic feedback on completion
- "Same List Next Trip" unchecks all items for reuse
- "Ready to Shop" floating CTA button
- Whole Foods store added

### v1.0.2
- Search bar with instant filtering and custom item creation
- Store filter (Kroger, Publix, Aldi, Walmart, Target, Costco)
- Item notes, quantity, unit, and per-item store preference
- Responsive two-panel desktop layout
- 260+ pre-seeded American grocery items with emoji icons

### v1.0.1
- Fixed HA ingress path injection
- Removed Flask dependency (pure Python stdlib)

### v1.0.0
- Initial release

## License

MIT
