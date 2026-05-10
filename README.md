# SuperGrocery

A sleek, mobile-first grocery list addon for [Home Assistant](https://www.home-assistant.io/). Runs as a native HA addon with its own sidebar panel — no external services, no cloud sync, just a clean UI backed by a local SQLite database.

## Features

- **260+ pre-seeded items** — organized by category (Produce, Dairy, Meat, Bakery, Pantry, Frozen, Beverages, Other)
- **Smart search** — type to filter instantly; add any custom item not already in the list
- **Category pills** — tap to browse by section; each category has a distinct color and emoji
- **Emoji icons** — 100+ item-to-emoji mappings with category fallback
- **Guided 4-step shopping flow**:
  1. **Browse** — tap items to add them to your list; "Clear all" button in the header
  2. **Review** — adjust qty (−/+ stepper), add notes, see Kroger price estimates per item and a running total
  3. **Shop** — large tap targets, grouped by category, progress bar in the header; auto-advances to Done when everything is checked
  4. **Done** — confetti + haptic feedback; start a new list or shop the same list again
- **Kroger pricing** — optional live price estimates via the Kroger Products API (requires free developer credentials); set your nearest store by zip code directly from the Review screen — no HA config change needed
- **Price caching** — estimated prices are cached in the local database (6-hour TTL)
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

## Optional: Kroger Price Estimates

1. Create a free account at [developer.kroger.com](https://developer.kroger.com) and register an app to get a **Client ID** and **Client Secret**
2. In HA → Settings → Add-ons → SuperGrocery → Configuration, set `kroger_client_id` and `kroger_client_secret`
3. On first visit to the **Review** screen, a banner prompts you to enter your zip code and select your nearest store — no further configuration needed
4. Prices appear as `~$X.XX` badges next to each item and sum to an estimated total

## Requirements

- Home Assistant OS or Supervised (Supervisor required for addons)
- amd64 or aarch64 architecture

## Development

No build step — pure Python stdlib + vanilla HTML/CSS/JS.

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

### v1.0.5
- **Kroger store picker in-app** — the Review screen now shows a zip code search banner when no store is configured; pick from nearby Kroger-family stores (Kroger, Ralphs, Fred Meyer, King Soopers, etc.) without touching HA config
- Saved store location is persisted in the local database; switching stores busts the price cache so prices re-fetch at the new location
- Fixed: Kroger Products API requires a `locationId` to return prices — `nationalPrice` alone is unreliable; all price lookups now use the saved location
- Removed `filter.chain` restriction from location search so all Kroger-owned banners appear
- Added `POST /api/kroger/location` endpoint for in-app store selection

### v1.0.4
- New 4-step guided flow: Browse → Review → Shop → Done
- Browse screen: items show name + emoji only; qty/unit/notes reset to defaults when added
- "Clear all" button in the build header (hidden when list is empty)
- Review step: inline qty stepper (−/+), notes editing, Kroger price badge per item, estimated total
- Shop step: large tap targets, category groupings, progress bar; auto-advances to Done
- Kroger Products API integration — configure Client ID and Secret in addon options
- Price cache: 6-hour TTL stored in SQLite; `/api/kroger/test` diagnostic endpoint
- Fixed: Kroger price extraction bug where empty `price: {}` short-circuited `nationalPrice` lookup
- Fixed: HA addon schema changed from `str` to `str?` so blank Kroger fields don't fail config validation
- Fixed: seeded qty/unit/notes no longer bleed into the Review screen

### v1.0.3
- Full guided shopping flow: build list → shop mode → done screen
- Shopping mode with large tap targets, category groupings, and header progress bar
- Auto-transitions to done screen when all items are checked off
- Confetti celebration + haptic feedback on completion
- "Same List Next Trip" unchecks all items for reuse
- "Ready to Shop" floating CTA button

### v1.0.2
- Search bar with instant filtering and custom item creation
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
