# TechDoc panel frontend (Lit + TypeScript)

Source for the sidebar panel. Builds to a single bundled ES module at
`../custom_components/techdoc/panel/techdoc-panel.js`, which is what Home
Assistant actually loads at runtime (via `panel_custom`) — this directory is
**not** shipped with the integration, only the build output is.

## Build

```bash
npm install
npm run build       # one-off production build (minified)
npm run watch        # rebuild on change (unminified, inline sourcemaps)
npm run typecheck    # tsc --noEmit
```

## Structure

- `types.ts` — plain TypeScript interfaces mirroring the Python dataclasses
  in `db/models.py`, plus a minimal `HomeAssistant` interface (deliberately
  not depending on the full `home-assistant-frontend` package).
- `ws.ts` — typed wrappers around every `techdoc/*` websocket command (see
  `websocket_api.py`) and the document upload endpoint.
- `styles.ts` — shared CSS (cards, rows, forms, tabs) built on Home
  Assistant's own CSS custom properties, so the panel matches the active
  theme without importing any HA components.
- `techdoc-status-badge.ts` — small colored status/severity pill.
- `techdoc-plant-list.ts` — plant table + "create plant" form.
- `techdoc-plant-detail.ts` — inspections, findings, sensor mapping +
  yearly comparison, anomalies, documents for the selected plant.
- `techdoc-findings-overview.ts` — cross-plant open-findings list.
- `techdoc-panel.ts` — root element registered as `<techdoc-panel>`, owns
  top-level state (plants, plant types, findings, anomalies, metric
  catalogue) and wires the above together.

State flows one level at a time: the root fetches overview data and passes
it down as properties; children fetch their own detail data and dispatch a
`techdoc-changed` (or `plant-select` / `plant-created`) event that bubbles
up to trigger a root-level refresh — no global store, no framework beyond Lit.
