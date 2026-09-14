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
- **Sidebar-Panel** (Vanilla-JS-Webcomponent): Anlagen, Prüfungen, Mängel, Anomalien, Kennzahlen/Sensor-Zuordnung, Dokumente, Berichte

### Bekannte Einschränkungen (nächste Schritte)

- Das Panel ist ein einzelnes, handgeschriebenes Web-Component (kein Lit/Build-Schritt) mit zwei Tabs
  (Anlagen inkl. Detailansicht, Mängel) statt der vollen, separaten Tab-Struktur aus Abschnitt 41
  der Spezifikation (Dashboard/Analysen/Dokumente/Einstellungen als eigene Views).
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
   eine Standard-Checkliste sowie Standard-Plausibilitätsregeln hinterlegt).
2. Anlage anklicken → Sensoren zuordnen (Kennzahl + `entity_id`, z. B. `pv_yield_kwh` →
   `sensor.pv_jahresertrag`) → Jahresvergleich über den Kennzahl-Link abrufbar.
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
UI-Vorschläge kann `const.py`s `PLANT_TYPE_METRICS` erweitert werden. Ein eigener
Analyzer mit anlagenspezifischer Logik kommt als neue Datei unter `analysis/plugins/`
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
