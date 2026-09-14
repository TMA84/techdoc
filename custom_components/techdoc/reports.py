"""Assembles report data from the repository and renders it via
reporting/pdf.py, storing the result as a Document (spec sections 29-30) so
it shows up alongside a plant's other files.
"""
from __future__ import annotations

import dataclasses

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .db.engine import Database
from .documents import DocumentStorage
from .reporting.pdf import build_annual_report_pdf, build_inspection_report_pdf


async def async_generate_inspection_report(
    hass: HomeAssistant,
    database: Database,
    document_storage: DocumentStorage,
    inspection_id: int,
) -> int:
    repo = database.repository
    inspection = await database.async_run(repo.get_inspection, inspection_id)
    if inspection is None:
        raise ValueError(f"Inspection {inspection_id} not found")

    plant = await database.async_run(repo.get_plant, inspection.plant_id)
    items = await database.async_run(repo.list_inspection_items, inspection_id)
    all_findings = await database.async_run(repo.list_findings, inspection.plant_id)
    findings = [f for f in all_findings if f.inspection_id == inspection_id]
    measurements = await database.async_run(repo.list_measurements, inspection.plant_id)

    content = await hass.async_add_executor_job(
        build_inspection_report_pdf,
        dataclasses.asdict(plant),
        dataclasses.asdict(inspection),
        [dataclasses.asdict(item) for item in items],
        [dataclasses.asdict(finding) for finding in findings],
        [dataclasses.asdict(measurement) for measurement in measurements],
    )

    stored_filename, content_hash = await hass.async_add_executor_job(
        document_storage.save, content, f"pruefbericht_{inspection_id}.pdf"
    )
    return await database.async_run(
        repo.create_document,
        "Prüfprotokoll",
        stored_filename,
        content_hash,
        dt_util.utcnow().isoformat(),
        plant.id,
        inspection_id,
        None,
    )


async def async_generate_annual_report(
    hass: HomeAssistant, database: Database, document_storage: DocumentStorage, year: int
) -> int:
    repo = database.repository
    plants = await database.async_run(repo.list_plants)
    plant_type_names = {pt.id: pt.name for pt in await database.async_run(repo.list_plant_types)}

    plants_summary = []
    for plant in plants:
        inspections = await database.async_run(repo.list_inspections, plant.id)
        findings_open = await database.async_run(repo.list_findings, plant.id, "offen")
        anomalies = await database.async_run(repo.list_anomalies, plant.id, "offen")
        plants_summary.append(
            {
                "name": plant.name,
                "plant_type_name": plant_type_names.get(plant.plant_type_id, "-"),
                "status": plant.status,
                "inspections_count": sum(1 for i in inspections if i.date.startswith(str(year))),
                "findings_open": len(findings_open),
                "anomalies_count": len(anomalies),
            }
        )

    content = await hass.async_add_executor_job(build_annual_report_pdf, year, plants_summary)
    stored_filename, content_hash = await hass.async_add_executor_job(
        document_storage.save, content, f"jahresbericht_{year}.pdf"
    )
    return await database.async_run(
        repo.create_document,
        "Jahresbericht",
        stored_filename,
        content_hash,
        dt_util.utcnow().isoformat(),
        None,
        None,
        None,
    )
