# TechDoc

Home-Assistant Custom Integration zur Dokumentation, Prüfung und
Betriebsanalyse von Haustechnik-Anlagen (PV, Wärmepumpe, Wallbox,
Batteriespeicher, Solarthermie, Sauna, Heizung, Lüftung, Klima,
Warmwasser, Elektro, Wasser, Beleuchtung, frei definierbare Anlagentypen).

Architektur, Datenmodell und Entwicklungsplan: siehe [`docs/architecture.md`](docs/architecture.md).

## Status

Alle sechs geplanten Phasen sind in einer ersten, funktionsfähigen Version umgesetzt:

- **Anlagenverwaltung**: Gebäude, Anlagentypen (inkl. frei definierbarer eigener Typen), Anlagen, Komponenten
- **Prüfungen**: Checklisten-Vorlagen, Prüfdurchführung, Messwerte, Mängel, Fristenüberwachung mit Home-Assistant-Erinnerung
- **Dokumente**: Upload/Download mit Path-Traversal-Schutz (content-addressed Storage)
- **HA-Anbindung**: Sensor-Zuordnung je Kennzahl, Jahresvergleich über `recorder.statistics` (keine Datenduplizierung, Cache für abgeschlossene Jahre)
- **Analyse**: konfigurierbare Plausibilitätsregeln, robuste Anomalieerkennung (Median/MAD/modifizierter Z-Score), Konfidenz- und Schweregrad-Berechnung, Basis-Datenqualitätsprüfung ("Sensor nicht verfügbar")
- **Reporting**: Prüfbericht- und Jahresbericht-PDF (ReportLab), abgelegt als Dokument
- **Sidebar-Panel** (Lit/TypeScript, siehe [`frontend-src/`](frontend-src/)): Anlagen (mit Detailansicht:
  Prüfungen, Mängel, Anomalien, Kennzahlen/Sensor-Zuordnung, Dokumente, Berichte) und eine
  anlagenübergreifende Mängel-Übersicht; kartenbasiertes Layout im Home-Assistant-Theme, sichtbare
  Fehlermeldungen statt stiller Fehlschläge

### Bekannte Einschränkungen (nächste Schritte)

- Das Panel hat zwei Tabs (Anlagen inkl. Detailansicht, Mängel) statt der vollen, separaten
  Tab-Struktur aus Abschnitt 41 der Spezifikation (Dashboard/Analysen/Dokumente/Einstellungen
  als eigene Views).
- Datenqualitätsprüfung deckt bisher nur "Sensor nicht verfügbar" ab; Dauer-Null-Werte,
  Einheitswechsel und Datenlücken sind noch nicht implementiert.
- Ein erkannter Anomalie-Status (bestätigt/nicht relevant) wird beim nächsten Analyse-Lauf
  zurückgesetzt, wenn die Abweichung weiterhin besteht (siehe Kommentar in `analysis_runner.py`).
- Keine automatisierten Home-Assistant-Integrationstests (Config Flow, Coordinator, Sensor-Entities)
  mit `pytest-homeassistant-custom-component` — nur die HA-unabhängige Kernlogik ist per Unit-Test
  abgedeckt, plus ein manueller Import-Check gegen das echte `homeassistant`-Paket (siehe unten).
- Kein Entity-Picker im Panel für die Sensor-Zuordnung (Freitext-Eingabe der `entity_id`).
- Noch keine Veröffentlichung als HACS-Repository (nur `hacs.json` als Grundlage vorhanden).

## Installation (manuelles Deployment)

1. `custom_components/techdoc/` in das `custom_components/`-Verzeichnis
   deiner Home-Assistant-Konfiguration kopieren (z. B. per Samba-Share oder
   SSH-Add-on).
2. Home Assistant neu starten (installiert dabei automatisch die Abhängigkeit `reportlab`).
3. **Einstellungen → Geräte & Dienste → Integration hinzufügen** → "TechDoc".
4. Das Panel "TechDoc" erscheint in der Seitenleiste.

## Nutzung

1. Im Panel unter "Anlagen" eine Anlage anlegen (Anlagentyp wählen — für PV ist bereits
   eine Standard-Checkliste sowie Standard-Plausibilitätsregeln hinterlegt). Über
   "Bearbeiten" lassen sich Name/Anlagentyp nachträglich ändern, über "Löschen" die
   Anlage inkl. aller zugehörigen Prüfungen, Mängel, Dokumente und Sensor-Zuordnungen
   entfernen (mit Bestätigungsabfrage).
2. Anlage anklicken → **Gerät wählen** (z. B. den Wechselrichter): TechDoc schlägt anhand
   von Name, Einheit und `device_class` der Sensoren automatisch passende Zuordnungen vor
   (z. B. "Jahresertrag → Wechselrichter Ertrag") — per Klick auf "Übernehmen" übernommen,
   ohne `entity_id` oder Kennzahl von Hand einzutippen. Für alles, was nicht automatisch
   erkannt wird, bleibt die manuelle Zuordnung (Kennzahl eingeben + Sensor aus der
   Geräteliste wählen oder Entity-ID direkt eintippen als Fallback für Sensoren ohne
   Gerätezuordnung). Ob es sich um eine Summe (Energie/Ertrag) oder einen Mittelwert
   (COP, Temperatur) handelt, wird in beiden Fällen automatisch aus dem
   `state_class`-Attribut des Sensors erkannt — nie eine Vermutung, sondern nur ein
   Vorschlag, den man ablehnen/überschreiben kann. Voraussetzung ist, dass die Entity in
   Home Assistant überhaupt Langzeitstatistiken führt
   (`state_class: measurement/total/total_increasing`); ist das nicht der Fall, meldet das
   Panel das explizit statt einfach "keine Daten" zu zeigen. Danach ist der
   Jahresvergleich über den Kennzahl-Link abrufbar.
3. Prüfung starten, Checkliste/Messwerte erfassen, abschließen → nächster Prüftermin wird
   automatisch aus dem Prüfintervall berechnet; 30 Tage vorher erscheint eine
   Persistent Notification in Home Assistant.
4. Mängel werden pro Anlage erfasst und in einer globalen Mängel-Übersicht verwaltet.
5. Nach jedem Coordinator-Lauf (stündlich, oder per Service `run_analysis`) werden
   Plausibilitätsregeln und Anomalieerkennung für alle Anlagen mit Sensor-Zuordnung neu berechnet.
6. Prüfbericht bzw. Jahresbericht direkt im Panel als PDF erzeugen und herunterladen.

### Bereitgestellte Services

| Service | Zweck |
|---|---|
| `techdoc.run_analysis` | Sofortige Neuberechnung aller Kennzahlen/Anomalien |
| `techdoc.start` | Neue Prüfung anlegen |
| `techdoc.complete` | Prüfung abschließen, nächsten Termin berechnen |
| `techdoc.add_finding` | Mangel erfassen |
| `techdoc.close_finding` | Mangel als erledigt markieren |
| `techdoc.generate_report` | PDF-Bericht (Prüfung oder Jahresbericht) erzeugen |

### Neue Anlagentypen/Kennzahlen ergänzen

Anlagentypen werden vom Benutzer im Panel angelegt (`plant_type_create`-Pfad über
`create_plant_type` in `db/repository.py`) — keine Codeänderung nötig. Eine neue
Kennzahl ist einfach ein neuer `metric_key`-String in einem Sensor-Mapping; für
UI-Vorschläge und automatische Zuordnungsvorschläge kann `const.py`s
`PLANT_TYPE_METRICS` erweitert werden (`hints`/`device_classes` je Eintrag steuern,
wonach `ha_bridge/matching.py` beim Vorschlagen sucht). Für Wärmepumpen sind z. B.
sowohl kombinierte (`heatpump_power_kwh`, `heatpump_heat_kwh`, `heatpump_cop`) als
auch nach Heizen/Warmwasser getrennte Kennzahlen (`heatpump_power_heating_kwh` /
`_hotwater_kwh`, `heatpump_heat_heating_kwh` / `_hotwater_kwh`,
`heatpump_cop_heating` / `_hotwater`) hinterlegt, je nachdem, was die eigene
Wärmepumpen-Integration an Sensoren liefert. Ein eigener Analyzer mit
anlagenspezifischer Logik kommt als neue Datei unter `analysis/plugins/`
(vorgesehen für eine spätere Ausbaustufe), ohne bestehenden Code zu ändern.

## Entwicklung

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements_test.txt
.venv/bin/python -m pytest -q
```

Die Unit-Tests in `tests/unit/` prüfen die komplette HA-unabhängige Kernlogik
(Datenbank/Repository, robuste Statistik, Plausibilitätsregeln, Anomalieerkennung,
Zeitraum-Berechnung, PDF-Erzeugung, Dokumenten-Storage) direkt, ohne dass
Home Assistant installiert sein muss — siehe `tests/_db_loader.py` bzw.
`tests/_pkg_loader.py` für den Import-Mechanismus, der die
`homeassistant`-Abhängigkeit der Paket-`__init__.py` umgeht.

Zusätzlich empfiehlt sich ein Import-Check gegen das echte `homeassistant`-Paket,
um API-Nutzung (Config-Entry-Runtime-Data, Panel-Registrierung, Recorder-Statistics,
WebSocket-Commands, Services) gegen die real installierte Version zu verifizieren:

```bash
.venv/bin/pip install homeassistant
PYTHONPATH=. .venv/bin/python -c "import custom_components.techdoc"
```

Echte Home-Assistant-Integrationstests (Config Flow, Coordinator, Sensor-Entities)
mit `pytest-homeassistant-custom-component` sind als nächster Schritt vorgesehen.

### Frontend (Panel)

Das Panel ist in TypeScript/Lit geschrieben (Quelle: [`frontend-src/`](frontend-src/)) und
wird zu einem einzelnen, gebündelten ES-Modul kompiliert, das direkt unter
`custom_components/techdoc/panel/techdoc-panel.js` liegt und mit ausgeliefert wird —
`frontend-src/` selbst ist nicht Teil der Integration, nur der Build-Output.

```bash
cd frontend-src
npm install
npm run verify   # typecheck + build + jsdom-Smoke-Test (mountet <techdoc-panel> mit Fake-hass)
```

Nach jeder Änderung an `frontend-src/src/**` muss `npm run build` (oder `npm run verify`)
laufen und der aktualisierte `panel/techdoc-panel.js` mit committet werden.

## Backup

Die gesamte Anwendungsdatenbank liegt als einzelne SQLite-Datei unter
`<config>/techdoc.db`, hochgeladene Dokumente unter
`<config>/techdoc_documents/`. Beides ist über Home Assistants
reguläre Backup-Funktion (vollständiges Backup des `config/`-Verzeichnisses)
mit abgedeckt; kein separater Backup-Mechanismus nötig.

## Fehlerbehebung

- **Panel bleibt leer / Fehler in der Browser-Konsole**: Cache leeren (der Panel-JS-Pfad
  wird ohne Cache-Header ausgeliefert, sollte aber bei Änderungen an der Datei ohnehin
  sofort greifen); prüfen, ob die Integration erfolgreich eingerichtet wurde.
- **`reportlab` fehlt / Import-Fehler bei PDF-Erzeugung**: Home Assistant neu starten,
  damit die in `manifest.json` deklarierte Abhängigkeit nachinstalliert wird.
- **Erinnerungen erscheinen nicht**: Erinnerungen laufen über eine persistente
  Home-Assistant-Benachrichtigung (`persistent_notification`), die bei jedem
  Coordinator-Lauf aktualisiert wird — erst nach dem ersten Lauf sichtbar.

## Versionierung & Releases

TechDoc folgt [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).
Solange die Version `0.x.y` ist, können auch Minor-Releases (`0.1.0` → `0.2.0`)
noch breaking changes enthalten; ab `1.0.0` gilt SemVer strikt.

- Die aktuelle Version steht in `custom_components/techdoc/manifest.json`
  (Feld `version`) — das ist die für HACS/Home Assistant maßgebliche Quelle.
- Jede Version wird in [CHANGELOG.md](CHANGELOG.md) dokumentiert.
- Jeder Release bekommt einen Git-Tag (`vMAJOR.MINOR.PATCH`, z. B. `v0.1.0`)
  sowie ein zugehöriges GitHub-Release — das ist die Voraussetzung dafür, dass
  HACS die Version als installierbar erkennt.

**Ablauf für einen neuen Release:**

1. `manifest.json`-Version anheben.
2. Neuen Abschnitt in `CHANGELOG.md` ergänzen (unter `[Unreleased]` einsortieren,
   dann beim Release umbenennen in `[MAJOR.MINOR.PATCH] - YYYY-MM-DD`).
3. Commit, Tag (`git tag -a vX.Y.Z -m "..."`), Push von Commit und Tag.
4. GitHub-Release aus dem Tag erstellen (z. B. `gh release create vX.Y.Z`).

## Lizenz

[MIT](LICENSE) — Copyright (c) 2026 Tobias Malcherek.
