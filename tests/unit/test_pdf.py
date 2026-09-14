from tests._pkg_loader import import_module

pdf = import_module("reporting.pdf")


def _sample_plant():
    return {
        "name": "Dach-PV",
        "manufacturer": "Fa. Sonne & Co",
        "model": "SunMax 10",
        "serial_number": "SN-123",
    }


def _sample_inspection():
    return {
        "date": "2026-03-12",
        "inspector": "Max Mustermann",
        "type": "Jahresprüfung",
        "status": "abgeschlossen",
        "next_due_date": "2027-03-12",
    }


def test_inspection_report_produces_valid_pdf_bytes():
    content = pdf.build_inspection_report_pdf(
        _sample_plant(),
        _sample_inspection(),
        items=[{"text": "Module optisch geprüft", "state": "OK", "comment": None}],
        findings=[],
        measurements=[{"metric_key": "pv_yield_kwh", "value": 8920.0, "unit": "kWh", "recorded_at": "2026-12-31"}],
    )
    assert content.startswith(b"%PDF-1.")
    assert len(content) > 500


def test_inspection_report_handles_findings_and_special_characters():
    plant = _sample_plant()
    plant["name"] = "PV & Speicher <Süd>"
    content = pdf.build_inspection_report_pdf(
        plant,
        _sample_inspection(),
        items=[],
        findings=[
            {
                "description": "Sicherung <F3> defekt & muss ersetzt werden",
                "priority": "hoch",
                "status": "offen",
                "due_date": "2026-04-01",
            }
        ],
        measurements=[],
    )
    assert content.startswith(b"%PDF-1.")


def test_annual_report_produces_valid_pdf_bytes():
    plants_summary = [
        {
            "name": "Dach-PV",
            "plant_type_name": "PV-Anlage",
            "status": "ok",
            "inspections_count": 2,
            "findings_open": 0,
            "anomalies_count": 1,
        }
    ]
    content = pdf.build_annual_report_pdf(2026, plants_summary)
    assert content.startswith(b"%PDF-1.")
    assert len(content) > 500


def test_annual_report_handles_empty_plant_list():
    content = pdf.build_annual_report_pdf(2026, [])
    assert content.startswith(b"%PDF-1.")
