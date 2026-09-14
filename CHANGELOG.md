# Changelog

All notable changes to TechDoc are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and version numbers
follow [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`,
starting at `0.x.y` while the integration is still pre-1.0 (breaking changes
possible in minor releases until `1.0.0`).

## [Unreleased]

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
