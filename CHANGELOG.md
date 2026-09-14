# Changelog

All notable changes to TechDoc are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and version numbers
follow [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`,
starting at `0.x.y` while the integration is still pre-1.0 (breaking changes
possible in minor releases until `1.0.0`).

## [Unreleased]

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
