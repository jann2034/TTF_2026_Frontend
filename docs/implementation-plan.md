# Access implementation plan

## Design and scope

Build the requested hackathon prototype in React JavaScript with plain CSS, blue #174298, a light theme, accessible controls, and mobile-first layouts. Use the supplied screenshots as the reference because the Figma account cannot access the file. Retain the map, wheelchair score markers, search, rounded location sheet, overview/reviews tabs, and requested contribution flows. On desktop, use a sidebar beside the map. The supplied repository contained only a README.

## Architecture

Vite, React, Leaflet, and Lucide icons. Screens in src/pages; reusable UI in src/components; data and network boundary in src/api. No component styling framework. Mock API persists to localStorage and shares a contract with an HTTP fetch client. Backend controls rewards; configurable mock rewards mirror that behavior. Fictional venues around Salzburg are clearly labeled demo data. OpenStreetMap tiles with attribution and a local schematic fallback keep the presentation usable without tiles.

## Tasks

- [x] Data boundary: seeded locations, feature catalog, reviews, temporary reports, profile, achievements; persistent mock and configurable HTTP client. Test search, average ratings, validation, points, confirmation, resolution, and persistence.
- [x] UI: responsive map, search/recent results, category filters, location overview/reviews, report/vote dialogs, review form, menu, achievements, mock settings. Handle pending/empty/error states and keyboard focus.
- [x] Verification: production build, unit tests, mobile and desktop browser flows, screenshots, README and API contract.

## Verified results

- Production build passed; 8 API tests and 10 browser tests passed.
- Browser journeys ran at 390×844 and 1440×960, with screenshots visually inspected.
- Review findings addressed: accurate step-free labels, selected mobile pins above the sheet, stronger secondary-text contrast, unobstructed mobile search, and correct map fallback layering.
- Source remains local and uncommitted in the supplied repository checkout. Local preview runs at http://127.0.0.1:5180/.

## Review focus

Empty search results; storage failures; invalid ratings and conflicting features; duplicate clicks/votes; network errors and unavailable map tiles. Submissions must preserve entered data on error, prevent concurrent duplicates, and only announce points returned by the API.

## Rulings

Use this fresh local checkout directly; no existing user edits require isolation. Deliver repository files and a local preview; external deployment is outside the user's repository-project request. Use sensible defaults already authorized by the detailed brief without additional design approval gates.
