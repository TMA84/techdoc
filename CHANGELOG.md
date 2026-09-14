# Changelog

All notable changes to TechDoc are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and version numbers
follow [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`,
starting at `0.x.y` while the integration is still pre-1.0 (breaking changes
possible in minor releases until `1.0.0`).

## [Unreleased]

## [0.7.0] - 2026-09-14

Ran a full end-to-end test directly against a real, complex production
Home Assistant instance over the websocket API (create plant → map sensor
→ fetch yearly totals → run an inspection → generate/download a report →
clean up) to find actual usability gaps, rather than continuing to patch
reactively based on bug reports alone.

### Fixed

- Sensor mapping showed no data anywhere unless the user happened to know
  the plain-looking `metric_key` text was a clickable link to a hidden
  "Jahresvergleich" popup — the mapping list now shows the entity's current
  live value and its yearly comparison inline, automatically, for every
  mapped metric (no click required); a metric with no statistics yet just
  shows "keine Langzeitstatistik verfügbar" instead of nothing.
- Widened `pv_yield_kwh`/`pv_self_consumption_kwh` hints
  (`"generation"`/`"pv generation"` and `"direct energy consumption"` word
  forms) after verifying against a real "SH"-integration PV/battery
  inverter — the previous hint set matched none of its sensors
  ("Total PV generation", "Daily direct energy consumption"), so it never
  suggested a match despite obviously-correct sensors existing.

## [0.6.4] - 2026-09-14

### Fixed

- Documents/reports opened as a forced download instead of viewing inline
  in the browser, and could silently fail to open at all: `DocumentDownloadView`
  now sends an explicit `Content-Disposition: inline` (with a human-readable
  filename derived from the document type, RFC 6266-encoded for
  umlauts/non-ASCII) instead of leaving the header unset, and the panel now
  opens the new tab synchronously on click, only navigating it once the
  signed URL comes back — doing `window.open()` after an `await` has no
  user-gesture context left, so browsers were silently blocking it as a
  popup.

## [0.6.3] - 2026-09-14

### Fixed

- Document/report download links always returned 401: a plain
  `<a href="/api/techdoc/documents/…">` has no way to carry the
  Authorization header a browser normally attaches for `hass.callWS`/
  `fetch` calls, so the request hit `DocumentDownloadView`'s `requires_auth`
  check with no credentials. Links now request a short-lived signed URL via
  Home Assistant's own built-in `auth/sign_path` websocket command (the
  same mechanism HA's frontend uses for camera/media downloads) before
  opening, instead of using the raw API path directly.

## [0.6.2] - 2026-09-14

### Fixed

- Widened the `PLANT_TYPE_METRICS` hint vocabulary in `const.py` after
  validating the matcher against a real, complex production Home Assistant
  instance (multiple heat pump, PV inverter, wallbox, and battery
  integrations). The strict phrase-match gate added in 0.6.1 was correct in
  principle but too narrow in practice: real entities frequently use a
  different word form than the hint (e.g. a heat pump reporting "Wärme
  Heizung"/"COP Heizung" — noun form — where the catalogue only had
  "wärmemenge heizen"/"cop heizen" — verb form), so no suggestion appeared
  at all despite an unambiguous sensor existing. Heat pump, PV, wallbox, and
  battery hints now cover both word forms and common English/German
  synonyms actually seen in the wild (Luxtronik-style, GoSungrow, evcc).
  Manually verified: all 6 real heat-pump metrics with a corresponding
  sensor, all 4 PV metrics, and the wallbox/battery charge metrics now
  match correctly with no false positives introduced.

## [0.6.1] - 2026-09-14

### Fixed

- Sensor-mapping suggestions were unreliable across all plant types: a
  candidate could be suggested purely from `device_class`/unit matching a
  metric, with no actual name evidence — so e.g. a heat pump's generic
  "Stromverbrauch (gesamt)" catalogue entry could grab one of its
  Heizen/Warmwasser-specific sensors just because both are `energy`/kWh, and
  in general any energy sensor could be suggested for an unrelated energy
  metric. A matching hint phrase in the entity's name is now a *required*
  gate (`ha_bridge/matching.py`) — device_class/unit/token-overlap are only
  tie-breakers between candidates that already passed that gate, never
  sufficient on their own. Added the split heat-pump metrics'
  (Heizen/Warmwasser for power, heat output, and COP) hints with the
  quantity-specific wording needed to tell them apart (both previously
  shared only the generic "heizen"/"warmwasser" word, which isn't enough to
  distinguish a power sensor from a heat-output sensor in the same mode).

## [0.6.0] - 2026-09-14

### Added

- Automatic sensor-mapping suggestions: after picking a device, the panel
  now proposes matches for the plant type's metric catalogue (e.g. "Jahresertrag
  → Wechselrichter Ertrag") based on the entity's name, `device_class`, unit,
  and `state_class`/aggregation compatibility (`ha_bridge/matching.py`, unit
  tested; new `techdoc/device_entity_suggestions` websocket command). A
  suggestion is only ever applied by clicking "Übernehmen" — never silently
  auto-mapped — and an entity whose statistic kind (sum/mean) doesn't match
  the metric is never suggested regardless of how well its name matches.

## [0.5.0] - 2026-09-14

### Added

- Sensor mapping now offers a device picker: pick a Home Assistant device,
  then pick one of its statistics-eligible sensors, instead of typing an
  `entity_id` from memory (the free-text field remains as a fallback for
  entities not tied to a device). Backed by new `techdoc/device_list` and
  `techdoc/device_entities` websocket commands
  (`ha_bridge/devices.py`, using `device_registry`/`entity_registry`).

### Changed

- Aggregation ("sum" vs "mean") and unit for a sensor mapping are no longer
  a manual choice — `techdoc/sensor_mapping_upsert` now derives them
  server-side from the entity's own `state_class`/`unit_of_measurement`
  attributes, which is both less work and can't be set inconsistently with
  the entity's actual statistic type.

## [0.4.0] - 2026-09-14

### Fixed

- Sensor-mapped metrics were never actually retrieving data: the yearly
  totals lookup always queried the recorder's cumulative ("sum"/"change")
  statistics, regardless of a metric's real kind, and the panel never sent
  the `aggregation` field it was mapped with either (it always defaulted
  to "sum" server-side). Any metric that is actually a "mean"-class
  statistic (COP, temperatures, ...) therefore always came back empty.
  The panel's sensor-mapping form now lets you pick "Summe" or
  "Mittelwert" explicitly, and that choice is sent and used to query the
  matching statistic type.
- The panel's error banner showed `[object Object]` for websocket errors
  raised via `connection.send_error` (e.g. "no such mapping"), since
  `hass.callWS` rejects with a plain `{code, message}` object, not a native
  `Error` — `guarded()` now reads `.message` off both.
- `techdoc/plant_metric_yearly` now checks upfront whether the mapped
  entity exists and actually has Home Assistant long-term statistics at
  all, returning a clear, specific error instead of silently reporting "no
  data" when e.g. the entity has no `state_class` set.

## [0.3.0] - 2026-09-14

### Added

- Edit and delete plants from the panel: `techdoc/plant_update` and
  `techdoc/plant_delete` websocket commands (backed by the existing
  `repository.update_plant`/`delete_plant`), inline edit form and a delete
  button with a confirmation prompt (deleting a plant cascades to all its
  inspections, findings, documents, and sensor mappings).

## [0.2.0] - 2026-09-14

### Added

- Sidebar panel rewritten in Lit + TypeScript (`frontend-src/`, bundled with
  esbuild to a single ES module), replacing the vanilla-JS/no-build panel:
  card-based layout using Home Assistant's own theme CSS custom properties,
  colored status/severity badges, and a visible error banner so a failed
  action (validation error, backend exception) is never silently swallowed.
- `frontend-src/smoke-test.mjs`: jsdom-based runtime smoke test that mounts
  `<techdoc-panel>` with a fake `hass` and asserts it registers and renders
  both tabs; wired up as `npm run verify` (typecheck + build + smoke).

### Fixed

- `techdoc/inspection_create` websocket command: the schema declared both
  the command discriminator and the inspection's own "type" (Prüfungsart)
  field as `"type"`. A JSON object can only have one key with that name, so
  the discriminator was getting silently overwritten — this broke command
  routing for that call. The inspection-type field is now sent as
  `inspection_type` on the wire (mapped to the same `type` DB column
  server-side); the old vanilla-JS panel had the same bug (TypeScript's
  duplicate-object-key check caught it during the rewrite).

## [0.1.0] - 2026-09-14

Initial release. Implements all six planned phases in a first working version:

### Added

- Plant management: buildings, plant types (built-in + freely definable custom
  types), plants, components.
- Inspections: checklist templates, inspection execution, measurements,
  findings, maintenance log, automatic next-due-date calculation, Home
  Assistant persistent-notification reminders.
- Document management with content-addressed, path-traversal-safe storage
  (upload/download via HTTP views).
- Home Assistant sensor mapping per metric, yearly comparison via
  `recorder.statistics` with caching of completed years (no raw-history
  duplication).
- Configurable plausibility rules and robust anomaly detection
  (median/MAD/modified z-score) with confidence and severity scoring; basic
  data-quality check ("sensor unavailable").
- PDF reporting (inspection report, annual report) via ReportLab, stored as
  documents.
- Sidebar panel (vanilla-JS web component): plants (with inspections,
  findings, sensor mapping, anomalies, documents, report buttons) and a
  cross-plant findings overview.
- Services: `run_analysis`, `start`, `complete`, `add_finding`,
  `close_finding`, `generate_report`.

### Known limitations

See the "Bekannte Einschränkungen" section in [README.md](README.md).
