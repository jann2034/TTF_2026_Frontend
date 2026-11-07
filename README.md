# Access — community-powered accessibility

A mobile-first React hackathon prototype with plain CSS, a working map, location search, live issues, reviews, points, and achievements. Built from the supplied mobile screenshots; Figma file access was unavailable.

## Run

Requires Node.js 20.19+ or 22+ and npm.

```sh
npm install
npm run dev
```

Open the URL printed by Vite. To try on your phone on the same Wi-Fi, use `npm run dev -- --host 0.0.0.0` and open your computer's network address on the displayed port. Browser geolocation normally requires HTTPS or localhost; other demo features work over local HTTP.

```sh
npm run build                 # Production files in dist/
npm run preview               # Serve the production build
npm test                      # Data and HTTP adapter tests
npx playwright install chromium
npm run test:e2e              # Phone and desktop browser journeys
```

## Included

- OpenStreetMap with wheelchair-score markers, pan/zoom, category filters, and geolocation.
- Name/address search, recent-search suggestions, and empty states.
- Location details with community averages, amenities, obstacles, and reviews.
- Temporary issue reporting, one confirmation per demo user, and resolution.
- Reviews with 1–5-star ratings, feature selection, and optional text. Conflicting selections are mutually exclusive.
- Configurable review points, profile drawer, and dynamic achievement unlocking.
- Persistent local demo data and an interchangeable HTTP API adapter.
- Bundled fonts and illustrations; schematic map fallback when tiles fail.

Save/share and settings are explicitly previews, as requested. The five demo locations around Salzburg, including **Axess Hotel**, have illustrative information and distances. They are not verified accessibility guidance. Search covers the API dataset, not a worldwide geocoder.

## Project structure

```text
src/
  api/
    seed.js           Demo places, feature catalog, achievement rules
    mockApi.js        Async API with localStorage persistence
    client.js         Mock/HTTP switch and fetch adapter
  components/
    Icon.jsx          Lucide icon registry
    UI.jsx            Shared controls, ratings, chips, accessible modal
    MapView.jsx       Leaflet map and markers
    ReportDialog.jsx  Add/confirm/resolve temporary issues
  pages/
    Explore.jsx       Nearby places and categories
    Search.jsx        Name/address search
    LocationDetails.jsx
    Review.jsx
    Achievements.jsx
    Settings.jsx
  App.jsx             Routing, shared data, drawer, notifications
  main.jsx            Entry point
  styles.css          Plain CSS; mobile overrides at the end
public/               Favicon and local schematic map
tests/                API tests and Playwright browser journeys
docs/api-contract.md  Backend integration reference
```

## Connect your backend

Copy `.env.example` to `.env.local`:

```dotenv
VITE_API_MODE=http
VITE_API_BASE_URL=http://localhost:3000/api
```

Restart Vite after environment changes. All screens use one `api` object; implement [the API contract](docs/api-contract.md) to connect them without UI changes. Configure backend CORS for the frontend origin. Authentication is not included; add your chosen headers/session handling in `src/api/client.js` when ready. Real rewards and validation should be controlled by the server.

## Customize

- Brand color: `--blue` in `src/styles.css`, currently `#174298`.
- Places, coordinates, amenities and obstacles: `src/api/seed.js`.
- Mock review reward: `VITE_REVIEW_POINTS=25` in `.env.local`. The UI reads the API's `pointsAwarded` response, so real mode uses your backend's reward.
- Achievement thresholds: `achievementList()` in `src/api/seed.js`.
- Reset demo: remove `access-demo-v1` from browser localStorage and reload. Saved data takes precedence over seed edits.
- Routing uses URL hashes, so static hosting needs no route rewrites.

## Map and demo limitations

Leaflet uses standard OpenStreetMap tiles with attribution and no API key. If a tile fails, the app switches to the local **illustrated demo map**. The layers button also switches maps; the compass returns to the seeded neighborhood. The fallback is schematic, not geographically accurate. Observe the [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/) and choose an appropriate provider before scaling.

The mock API runs inside the browser, persists only on that browser/device, and does not synchronize users. A resolved vote removes a report immediately, matching the requested prototype. Real moderation, expiry, consensus, login, and abuse prevention belong in the backend. Distances are seed labels rather than live calculations.

The UI provides keyboard focus styles, labeled controls, dialog focus trapping, a skip link, reduced-motion support, and screen-reader notifications. Tests exercise review rewards/persistence, achievements, reports, map markers, categories, search, and menu dismissal on phone and desktop layouts.
