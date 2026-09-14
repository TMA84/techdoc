"""Typed dataclasses for the core entities used in Phase 1.

These mirror the schema in migrations/0001_initial.sql. Additional entities
(Inspection, Finding, ...) are added here as the corresponding phases land.
"""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass


@dataclass(slots=True)
class Building:
    id: int
    name: str
    address: str | None
    notes: str | None

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Building":
        return cls(id=row["id"], name=row["name"], address=row["address"], notes=row["notes"])


@dataclass(slots=True)
class PlantType:
    id: int
    key: str
    name: str
    icon: str | None
    is_custom: bool

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "PlantType":
        return cls(
            id=row["id"],
            key=row["key"],
            name=row["name"],
            icon=row["icon"],
            is_custom=bool(row["is_custom"]),
        )


@dataclass(slots=True)
class Plant:
    id: int
    building_id: int
    plant_type_id: int
    name: str
    manufacturer: str | None
    model: str | None
    serial_number: str | None
    year_built: int | None
    install_date: str | None
    location: str | None
    power_kw: float | None
    nominal_power_kw: float | None
    warranty_until: str | None
    installer: str | None
    contact: str | None
    inspection_interval_months: int | None
    last_inspection: str | None
    next_inspection: str | None
    status: str
    notes: str | None

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Plant":
        return cls(**{key: row[key] for key in row.keys()})


@dataclass(slots=True)
class ChecklistTemplate:
    id: int
    plant_type_id: int
    name: str
    version: int

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "ChecklistTemplate":
        return cls(**{key: row[key] for key in row.keys()})


@dataclass(slots=True)
class ChecklistItemTemplate:
    id: int
    checklist_template_id: int
    sort_order: int
    text: str
    requires_measurement: bool
    unit: str | None

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "ChecklistItemTemplate":
        data = {key: row[key] for key in row.keys()}
        data["requires_measurement"] = bool(data["requires_measurement"])
        return cls(**data)


@dataclass(slots=True)
class Inspection:
    id: int
    plant_id: int
    checklist_template_id: int | None
    date: str
    inspector: str | None
    type: str
    status: str
    next_due_date: str | None
    signature_ref: str | None

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Inspection":
        return cls(**{key: row[key] for key in row.keys()})


@dataclass(slots=True)
class InspectionItem:
    id: int
    inspection_id: int
    template_item_id: int | None
    text: str
    state: str
    comment: str | None

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "InspectionItem":
        return cls(**{key: row[key] for key in row.keys()})


@dataclass(slots=True)
class Measurement:
    id: int
    plant_id: int
    inspection_item_id: int | None
    metric_key: str
    value: float
    unit: str | None
    recorded_at: str
    source: str

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Measurement":
        return cls(**{key: row[key] for key in row.keys()})


@dataclass(slots=True)
class Finding:
    id: int
    plant_id: int
    inspection_id: int | None
    description: str
    category: str | None
    priority: str
    date: str
    responsible: str | None
    due_date: str | None
    status: str
    resolved_at: str | None
    comment: str | None

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Finding":
        return cls(**{key: row[key] for key in row.keys()})


@dataclass(slots=True)
class Maintenance:
    id: int
    plant_id: int
    date: str
    type: str | None
    description: str | None
    performed_by: str | None

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Maintenance":
        return cls(**{key: row[key] for key in row.keys()})


@dataclass(slots=True)
class SensorMapping:
    id: int
    plant_id: int
    metric_key: str
    entity_id: str
    unit: str | None
    aggregation: str

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "SensorMapping":
        return cls(**{key: row[key] for key in row.keys()})


@dataclass(slots=True)
class PlausibilityRule:
    id: int
    plant_type_id: int | None
    metric_key: str
    operator: str
    threshold_value: float | None
    severity: str
    enabled: bool

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "PlausibilityRule":
        data = {key: row[key] for key in row.keys()}
        data["enabled"] = bool(data["enabled"])
        return cls(**data)


@dataclass(slots=True)
class AnalysisResult:
    id: int
    plant_id: int
    period_type: str
    period_key: str
    computed_at: str
    metrics_json: str

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "AnalysisResult":
        return cls(**{key: row[key] for key in row.keys()})


@dataclass(slots=True)
class Anomaly:
    id: int
    analysis_result_id: int
    metric_key: str
    severity: str
    confidence: float
    description: str
    possible_causes_json: str | None
    status: str

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Anomaly":
        return cls(**{key: row[key] for key in row.keys()})


@dataclass(slots=True)
class Document:
    id: int
    plant_id: int | None
    inspection_id: int | None
    finding_id: int | None
    type: str
    filename: str
    content_hash: str
    uploaded_at: str

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Document":
        return cls(**{key: row[key] for key in row.keys()})
