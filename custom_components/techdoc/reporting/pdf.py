"""PDF report generation (spec sections 29-30).

Pure function: takes already-assembled plain data (dicts) and returns PDF
bytes. No Home Assistant or database access here — reports.py assembles the
input from the repository — so this module is unit testable on its own and
runs synchronously in an executor job.
"""
from __future__ import annotations

import io
from xml.sax.saxutils import escape as _esc

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

_STYLES = getSampleStyleSheet()


def build_inspection_report_pdf(
    plant: dict,
    inspection: dict,
    items: list[dict],
    findings: list[dict],
    measurements: list[dict],
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, title=f"Prüfbericht {plant['name']}")

    story = [
        Paragraph("Prüfbericht", _STYLES["Title"]),
        Paragraph(_esc(plant["name"]), _STYLES["Heading2"]),
        Spacer(1, 0.3 * cm),
        _key_value_table(
            [
                ("Hersteller", plant.get("manufacturer") or "-"),
                ("Modell", plant.get("model") or "-"),
                ("Seriennummer", plant.get("serial_number") or "-"),
                ("Prüfdatum", inspection["date"]),
                ("Prüfer", inspection.get("inspector") or "-"),
                ("Prüfungsart", inspection.get("type") or "-"),
                ("Status", inspection.get("status") or "-"),
                ("Nächste Prüfung", inspection.get("next_due_date") or "-"),
            ]
        ),
        Spacer(1, 0.5 * cm),
        Paragraph("Prüfpunkte", _STYLES["Heading3"]),
        _items_table(items),
        Spacer(1, 0.5 * cm),
    ]

    if measurements:
        story += [
            Paragraph("Messwerte", _STYLES["Heading3"]),
            _measurements_table(measurements),
            Spacer(1, 0.5 * cm),
        ]

    if findings:
        story += [Paragraph("Mängel", _STYLES["Heading3"]), _findings_table(findings)]
    else:
        story += [Paragraph("Keine Mängel festgestellt.", _STYLES["Normal"])]

    doc.build(story)
    return buffer.getvalue()


def build_annual_report_pdf(year: int, plants_summary: list[dict]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, title=f"TechDoc Jahresbericht {year}")

    story = [
        Paragraph(f"TechDoc &ndash; Haustechnik-Jahresbericht {year}", _STYLES["Title"]),
        Spacer(1, 0.3 * cm),
        _key_value_table(
            [
                ("Anlagen", str(len(plants_summary))),
                (
                    "Durchgeführte Prüfungen",
                    str(sum(p.get("inspections_count", 0) for p in plants_summary)),
                ),
                ("Offene Mängel", str(sum(p.get("findings_open", 0) for p in plants_summary))),
                (
                    "Erkannte Anomalien",
                    str(sum(p.get("anomalies_count", 0) for p in plants_summary)),
                ),
            ]
        ),
        Spacer(1, 0.5 * cm),
        Paragraph("Anlagenübersicht", _STYLES["Heading3"]),
        _plants_summary_table(plants_summary),
    ]
    doc.build(story)
    return buffer.getvalue()


def _key_value_table(rows: list[tuple[str, str]]) -> Table:
    table = Table(rows, colWidths=[5 * cm, 10 * cm])
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
            ]
        )
    )
    return table


def _items_table(items: list[dict]) -> Table:
    header = ["Prüfpunkt", "Status", "Kommentar"]
    rows = [header] + [[i["text"], i["state"], i.get("comment") or ""] for i in items]
    return _styled_table(rows, [8 * cm, 3 * cm, 5 * cm])


def _measurements_table(measurements: list[dict]) -> Table:
    header = ["Kennzahl", "Wert", "Einheit", "Zeitpunkt"]
    rows = [header] + [
        [m["metric_key"], f"{m['value']:g}", m.get("unit") or "", m["recorded_at"]]
        for m in measurements
    ]
    return _styled_table(rows, [5 * cm, 3 * cm, 2 * cm, 6 * cm])


def _findings_table(findings: list[dict]) -> Table:
    header = ["Beschreibung", "Priorität", "Status", "Frist"]
    rows = [header] + [
        [f["description"], f["priority"], f["status"], f.get("due_date") or "-"] for f in findings
    ]
    return _styled_table(rows, [7 * cm, 3 * cm, 3 * cm, 3 * cm])


def _plants_summary_table(plants_summary: list[dict]) -> Table:
    header = ["Anlage", "Typ", "Status", "Prüfungen", "Offene Mängel", "Anomalien"]
    rows = [header] + [
        [
            p["name"],
            p.get("plant_type_name", "-"),
            p.get("status", "-"),
            str(p.get("inspections_count", 0)),
            str(p.get("findings_open", 0)),
            str(p.get("anomalies_count", 0)),
        ]
        for p in plants_summary
    ]
    return _styled_table(rows, [4 * cm, 3 * cm, 2 * cm, 2.5 * cm, 3 * cm, 2.5 * cm])


def _styled_table(rows: list[list[str]], col_widths: list[float]) -> Table:
    table = Table(rows, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#03a9f4")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return table
