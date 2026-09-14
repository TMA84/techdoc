# Architektur & Entwicklungsplan — TechDoc (Haustechnik-Prüfdokumentation)

Dieses Dokument ist der verbindliche Architekturplan für die Home-Assistant-Integration
`techdoc` ("TechDoc"). Es wurde vor Beginn der Implementierung erstellt und wird bei
größeren Architekturentscheidungen fortgeschrieben.

## 1. Architekturentscheidung: Custom Integration (kein Add-on)

**Entscheidung:** Home-Assistant **Custom Integration**, verteilt über HACS, mit einem
eigenen Sidebar-Panel (`panel_custom`) als Frontend. Kein Add-on.

**Begründung:**

- Add-ons laufen nur auf HA OS/Supervised, in eigenen Docker-Containern ohne direkten
  Python-Zugriff auf `hass`. Jede Kopplung an Entities, Recorder/Statistics,
  Config-Entries und Services müsste über die REST/WebSocket-API laufen.
- Eine Integration läuft auf allen Installationsarten (Core, Container, Supervised, OS),
  ist HACS-installierbar und hat nativen, asynchronen Zugriff auf `hass.states`,
  `recorder.statistics`, `entity_registry`, Service-Registry.
- Für den Dashboard-Charakter (Sidebar-Panel, eigene Views) wird
  `panel_custom.async_register_panel` mit einer eigenen Web-Component genutzt — das
  etablierte Muster für datenintensive Custom Integrations mit eigenem UI.
- Persistenz: eigene SQLite-Datei unter `hass.config.path("techdoc.db")`,
  bewusst getrennt von der Recorder-DB, mit eigenem, leichtgewichtigem
  Migrationssystem (nummerierte SQL-Skripte + `schema_version`-Tabelle). Zugriff nur
  über Executor-Jobs (kein blockierender I/O im Event-Loop).
- **Korrektur gegenüber der ursprünglichen Anforderung:** Der `config_flow` dient nur
  der Ersteinrichtung (ein Config Entry). Die laufende Verwaltung von Anlagen,
  Prüfungen und Checklisten läuft über eine eigene `websocket_api`, bedient vom Panel —
  ein `config_flow` ist für CRUD-lastige Datenpflege das falsche Werkzeug.
- Historische Daten: kein eigenes Duplizieren — Zugriff über `recorder.statistics` /
  `recorder.history`; selbst berechnete Kennzahlen optional über
  `async_add_external_statistics` im HA-Energie-Dashboard sichtbar machen.
- PDF-Erzeugung: **ReportLab** (BSD-lizenziert, reines Python, keine System-Bibliotheken
  wie libpango/cairo nötig), ausgeführt im Executor. Revidierte Entscheidung
  gegenüber dem ursprünglichen Plan (WeasyPrint): WeasyPrint benötigt zur Laufzeit
  native System-Libraries (Pango/Cairo/GDK-Pixbuf), die auf Home Assistant OS nicht
  garantiert vorhanden sind und sich über `manifest.json`-`requirements` (reines pip)
  nicht nachinstallieren lassen — ein Risiko für "läuft auf allen
  Installationsarten". ReportLab ist ein reines Python-Package ohne diese Abhängigkeit.

## 2. Datenmodell

```text
Building 1───* Plant *───1 PlantType
Plant 1───* Component
Plant 1───* SensorMapping ──── HA entity_id
Plant 1───* Threshold
PlantType 1───* ChecklistTemplate 1───* ChecklistItemTemplate
Plant 1───* Inspection
Inspection 1───* InspectionItem ──(optional)── ChecklistItemTemplate
Inspection 1───* Measurement
Inspection 1───* Finding
Inspection 1───* Document (Fotos/Protokolle)
Plant 1───* Maintenance
Plant 1───* AnalysisResult 1───* Anomaly
Plant 1───* Document
```

Vollständiges Schema: siehe
[`custom_components/techdoc/db/migrations/0001_initial.sql`](../custom_components/techdoc/db/migrations/0001_initial.sql).

`metric_key` (z. B. `pv_yield_kwh`, `heatpump_cop`, `wallbox_energy_kwh`) ist der
generische Haken, über den Anlagentypen, Sensor-Mappings, Thresholds, Regeln und
Analyzer-Plugins entkoppelt zusammenspielen — neue Anlagentypen benötigen keine
Schemaänderung, nur neue `plant_type`-/`metric_key`-Datensätze und optional ein neues
Analyzer-Plugin.

## 3. Komponentenübersicht

```text
custom_components/techdoc/
├── __init__.py              # Setup, Entry-Unload, Service-Registrierung
├── manifest.json
├── const.py
├── config_flow.py           # nur Ersteinrichtung (Single Config Entry)
├── coordinator.py           # DataUpdateCoordinator: periodische Re-Analyse
├── db/
│   ├── engine.py            # HA-Anbindung, Migrationen, Executor-Wrapper
│   ├── repository.py        # reine SQL-Logik, HA-unabhängig, unit-testbar
│   ├── models.py            # Dataclasses
│   └── migrations/0001_initial.sql
├── websocket_api.py          # CRUD-Kommandos fürs Panel
├── sensor.py, binary_sensor.py
├── services.py, services.yaml
├── strings.json, translations/de.json, translations/en.json
└── panel/techdoc-panel.js    # gebündeltes Panel (Build-Output, siehe frontend-src/)

frontend-src/                  # Lit/TypeScript-Quelle des Panels, baut nach panel/ (s. Abschnitt 6)
tests/unit/                   # HA-unabhängige Tests (Repository, Analyse-Statistik)
tests/integration/            # pytest-homeassistant-custom-component (spätere Phasen)
docs/architecture.md           # dieses Dokument
```

Analyse- und Anomalie-Module (`analysis/`, `anomaly/`) folgen ab Phase 4 dem gleichen
Plugin-Prinzip: neue Anlagentypen werden durch neue Dateien in `analysis/plugins/`
ergänzt, ohne bestehenden Code zu ändern.

## 4. Home-Assistant-Integration

- **Config Flow:** einmalig "TechDoc hinzufügen" → legt DB an,
  keine weitere Abfrage. Options Flow für globale Einstellungen (Analyseintervall,
  Konfidenzschwellen) folgt in späterer Phase.
- **Anlagenverwaltung, Sensor-Mapping, Checklisten, Regeln:** über Panel +
  `websocket_api`-Commands, die auf `db/repository.py` aufsetzen.
- **Sensoren:** dynamisch je Anlage (Status, Anomalie-Flag, letzte/nächste Prüfung) plus
  globale Zähler-Sensoren für Anlagenanzahl, offene Mängel, fällige Prüfungen und
  offene Anomalien (siehe `sensor.py`).
- **Services:** `start`, `complete`, `add_finding`, `close_finding`, `run_analysis`,
  `generate_report` (schrittweise ab Phase 2/4 implementiert).
- **Historische Daten:** ausschließlich über `recorder.statistics`/`history`.

## 5. Analysekonzept

- **Plausibilitätsprüfung:** deklarative Regeln in `plausibility_rule`
  (`<`, `>`, `%_deviation`, `std_dev`, `yoy_change`, `ratio`), je Anlagentyp mit
  Default-Regeln vorbelegt, vollständig editierbar.
- **Anomalieerkennung (v1, ohne Cloud/ML-Pflicht):** robuste Statistik — gleitender
  Mittelwert, Median, MAD, Z-Score, IQR — je `metric_key`, mit saisonalem
  Vergleichsfenster (z. B. Juni ggü. historischem Juni-Mittel).
- **Konfidenz:** Funktion aus Anzahl Vergleichsperioden, Streuung der
  Referenzverteilung und Datenqualität. Bei zu wenig Datenpunkten: "⚪ keine
  ausreichende Datenbasis" statt erfundener Werte.
- **Schweregrade:** INFO/NIEDRIG/MITTEL/HOCH/KRITISCH aus Abweichungsgröße und
  Konfidenz; Ursachen werden immer als "mögliche Ursachen" formuliert, nie als
  Diagnose.
- **Datenqualitätsprüfung** als eigene Kategorie (Sensor unavailable, Dauer-Null,
  Einheitswechsel, Lücken).
- **Performance:** geplante Analyse (Coordinator-Intervall) plus on-demand per Service;
  inkrementelle Berechnung, Zwischenergebnisse in `analysis_result` gecacht.

## 6. UI-Konzept

Sidebar-Panel "TechDoc", umgesetzt in **Lit + TypeScript** (Quelle in
`frontend-src/`, Build via esbuild zu einem einzelnen ES-Modul-Bundle unter
`custom_components/techdoc/panel/techdoc-panel.js`):

- `techdoc-panel` (Root): globale Statistik-Kacheln (Anlagen/offene Mängel/
  offene Anomalien), Tab-Navigation, hält Overview-State (Anlagen, Anlagentypen,
  Mängel, Anomalien, Kennzahlen-Katalog), zeigt Fehler-Banner bei fehlgeschlagenen
  Aktionen statt sie stillschweigend zu verschlucken.
- `techdoc-plant-list`: Anlagenliste (mit Bearbeiten/Löschen je Anlage,
  inkl. Bestätigungsabfrage vor dem Löschen) + "Anlage anlegen"-Formular.
- `techdoc-plant-detail`: Prüfungen, Mängel, Kennzahlen/Sensor-Zuordnung
  (inkl. Jahresvergleich), Anomalien, Dokumente der ausgewählten Anlage.
- `techdoc-findings-overview`: anlagenübergreifende Mängel-Übersicht.
- `techdoc-status-badge`: farbige Status-/Schweregrad-Pille.
- Styling nutzt Home-Assistants eigene CSS-Custom-Properties (Karten,
  Farben, Typografie folgen dem aktiven Theme) statt HA-Frontend-Komponenten
  zu importieren — bleibt dadurch ein kleines, abhängigkeitsarmes Bundle.
- Jede mutierende Aktion läuft über `guarded()` (`frontend-src/src/errors.ts`):
  Fehler werden als sichtbares Banner angezeigt statt zu verschwinden.

Aktuell zwei Tabs (Anlagen inkl. Detailansicht, Mängel) statt der vollen
Tab-Struktur aus der Projektbeschreibung (Dashboard/Analysen/Dokumente/
Einstellungen als eigene Views) — siehe "Bekannte Einschränkungen" in der
README. Mobile-Feinschliff und lokaler Draft-State gegen Datenverlust bei
Verbindungsabbruch stehen noch aus.

## 7. Entwicklungsplan

| Phase | Inhalt | Testbares Ergebnis | Status |
|---|---|---|---|
| 1 – Grundsystem | Integration-Skelett, Config Flow, DB-Schema+Migrationen, Anlagenverwaltung (CRUD via websocket_api), rudimentäres Dashboard-Panel | Anlage anlegen/anzeigen in HA | **fertig** |
| 2 – Prüfungen | Prüfungen, Checklisten-Vorlagen, Messwerte, Mängel, Fristen, Dokumente/Fotos | vollständiger Prüfzyklus durchführbar | **fertig** |
| 3 – HA-Daten | Sensor-Mapping-UI, Statistics-/History-Anbindung, Jahresertragsberechnung, Kennzahlen je Anlagentyp | echte HA-Sensordaten im Anlagen-Detail sichtbar | **fertig** |
| 4 – Analyse | Plausibilitäts-Engine, Anomalieerkennung, Konfidenz/Schweregrad, Basis-Datenqualitätsprüfung | Anomalie mit Erklärung + Konfidenz im Dashboard | **fertig** (Datenqualität bisher nur "Sensor nicht verfügbar"; Dauer-Null/Einheitswechsel/Lücken offen) |
| 5 – Reporting | Prüfbericht-PDF, Jahresbericht | PDF-Export funktionsfähig | **fertig** |
| 6 – Optimierung | Performance, Mobile-Feinschliff, Tests, README | CI-grüne Testsuite, vollständige Doku | **teilweise**: README fertig, Performance-Grundprinzipien (Caching, Executor-Jobs) von Anfang an eingehalten, umfassende Unit-Testsuite (siehe unten), Panel als Lit/TypeScript-Rewrite mit Build-Pipeline + jsdom-Smoke-Test umgesetzt — Mobile-Feinschliff und echte HA-Integrationstests mit `pytest-homeassistant-custom-component` stehen noch aus |
