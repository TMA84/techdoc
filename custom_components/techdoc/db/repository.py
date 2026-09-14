"""Plain sqlite3 data access layer.

Deliberately free of any Home Assistant imports so it can be unit tested with
a throwaway in-memory database, and wrapped by db/engine.py for use from
async HA code via the executor.
"""
from __future__ import annotations

import sqlite3
from datetime import date, timedelta
from pathlib import Path

from .models import (
    AnalysisResult,
    Anomaly,
    Building,
    ChecklistItemTemplate,
    ChecklistTemplate,
    Document,
    Finding,
    Inspection,
    InspectionItem,
    Maintenance,
    Measurement,
    Plant,
    PlantType,
    PlausibilityRule,
    SensorMapping,
)

_MIGRATIONS_DIR = Path(__file__).parent / "migrations"


def open_connection(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def add_months(date_iso: str, months: int) -> str:
    """Add a number of months to an ISO date, clamping the day if needed."""
    year, month, day = (int(part) for part in date_iso.split("-"))
    month_index = month - 1 + months
    new_year = year + month_index // 12
    new_month = month_index % 12 + 1
    for candidate_day in range(day, 0, -1):
        try:
            return date(new_year, new_month, candidate_day).isoformat()
        except ValueError:
            continue
    raise ValueError(f"Cannot compute date for {date_iso} + {months} months")


def add_days(date_iso: str, days: int) -> str:
    year, month, day = (int(part) for part in date_iso.split("-"))
    return (date(year, month, day) + timedelta(days=days)).isoformat()


def run_migrations(conn: sqlite3.Connection, migrations_dir: Path = _MIGRATIONS_DIR) -> None:
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL, "
        "filename TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    )
    applied = {row["filename"] for row in conn.execute("SELECT filename FROM schema_version")}

    for path in sorted(migrations_dir.glob("*.sql")):
        if path.name in applied:
            continue
        version = int(path.name.split("_", 1)[0])
        with conn:
            conn.executescript(path.read_text(encoding="utf-8"))
            conn.execute(
                "INSERT INTO schema_version (version, filename) VALUES (?, ?)",
                (version, path.name),
            )


class Repository:
    """CRUD operations for Phase 1 (Building, PlantType, Plant)."""

    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn

    # -- plant types ---------------------------------------------------

    def seed_default_plant_types(self, defaults: list[dict[str, str]]) -> None:
        with self._conn:
            for entry in defaults:
                self._conn.execute(
                    "INSERT OR IGNORE INTO plant_type (key, name, icon, is_custom) "
                    "VALUES (?, ?, ?, 0)",
                    (entry["key"], entry["name"], entry.get("icon")),
                )

    def list_plant_types(self) -> list[PlantType]:
        rows = self._conn.execute("SELECT * FROM plant_type ORDER BY is_custom, name").fetchall()
        return [PlantType.from_row(row) for row in rows]

    def create_plant_type(self, key: str, name: str, icon: str | None = None) -> int:
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO plant_type (key, name, icon, is_custom) VALUES (?, ?, ?, 1)",
                (key, name, icon),
            )
            return cur.lastrowid

    def seed_default_checklists(self, defaults: dict[str, list[str]]) -> None:
        for plant_type_key, item_texts in defaults.items():
            row = self._conn.execute(
                "SELECT id FROM plant_type WHERE key = ?", (plant_type_key,)
            ).fetchone()
            if row is None:
                continue
            plant_type_id = row["id"]
            already_seeded = self._conn.execute(
                "SELECT id FROM checklist_template WHERE plant_type_id = ?", (plant_type_id,)
            ).fetchone()
            if already_seeded is not None:
                continue
            template_id = self.create_checklist_template(plant_type_id, "Standard-Prüfung")
            for order, text in enumerate(item_texts, start=1):
                self.add_checklist_item_template(template_id, text, sort_order=order)

    # -- buildings -------------------------------------------------------

    def list_buildings(self) -> list[Building]:
        rows = self._conn.execute("SELECT * FROM building ORDER BY id").fetchall()
        return [Building.from_row(row) for row in rows]

    def create_building(self, name: str, address: str | None = None, notes: str | None = None) -> int:
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO building (name, address, notes) VALUES (?, ?, ?)",
                (name, address, notes),
            )
            return cur.lastrowid

    def get_or_create_default_building(self) -> int:
        row = self._conn.execute("SELECT id FROM building ORDER BY id LIMIT 1").fetchone()
        if row is not None:
            return row["id"]
        return self.create_building(name="Hauptgebäude")

    # -- plants ------------------------------------------------------------

    def create_plant(self, building_id: int, plant_type_id: int, name: str, **fields) -> int:
        columns = ["building_id", "plant_type_id", "name", *fields.keys()]
        placeholders = ", ".join("?" for _ in columns)
        values = [building_id, plant_type_id, name, *fields.values()]
        with self._conn:
            cur = self._conn.execute(
                f"INSERT INTO plant ({', '.join(columns)}) VALUES ({placeholders})",
                values,
            )
            return cur.lastrowid

    def list_plants(self, building_id: int | None = None) -> list[Plant]:
        if building_id is None:
            rows = self._conn.execute("SELECT * FROM plant ORDER BY name").fetchall()
        else:
            rows = self._conn.execute(
                "SELECT * FROM plant WHERE building_id = ? ORDER BY name", (building_id,)
            ).fetchall()
        return [Plant.from_row(row) for row in rows]

    def get_plant(self, plant_id: int) -> Plant | None:
        row = self._conn.execute("SELECT * FROM plant WHERE id = ?", (plant_id,)).fetchone()
        return Plant.from_row(row) if row else None

    def update_plant(self, plant_id: int, **fields) -> None:
        if not fields:
            return
        assignments = ", ".join(f"{key} = ?" for key in fields)
        with self._conn:
            self._conn.execute(
                f"UPDATE plant SET {assignments} WHERE id = ?",
                [*fields.values(), plant_id],
            )

    def delete_plant(self, plant_id: int) -> None:
        with self._conn:
            self._conn.execute("DELETE FROM plant WHERE id = ?", (plant_id,))

    # -- sensor mappings ---------------------------------------------------

    def upsert_sensor_mapping(
        self,
        plant_id: int,
        metric_key: str,
        entity_id: str,
        unit: str | None = None,
        aggregation: str = "sum",
    ) -> int:
        with self._conn:
            self._conn.execute(
                "INSERT INTO sensor_mapping (plant_id, metric_key, entity_id, unit, aggregation) "
                "VALUES (?, ?, ?, ?, ?) "
                "ON CONFLICT(plant_id, metric_key) DO UPDATE SET "
                "entity_id = excluded.entity_id, unit = excluded.unit, aggregation = excluded.aggregation",
                (plant_id, metric_key, entity_id, unit, aggregation),
            )
            return self._conn.execute(
                "SELECT id FROM sensor_mapping WHERE plant_id = ? AND metric_key = ?",
                (plant_id, metric_key),
            ).fetchone()["id"]

    def list_sensor_mappings(self, plant_id: int) -> list[SensorMapping]:
        rows = self._conn.execute(
            "SELECT * FROM sensor_mapping WHERE plant_id = ? ORDER BY metric_key", (plant_id,)
        ).fetchall()
        return [SensorMapping.from_row(row) for row in rows]

    def delete_sensor_mapping(self, mapping_id: int) -> None:
        with self._conn:
            self._conn.execute("DELETE FROM sensor_mapping WHERE id = ?", (mapping_id,))

    # -- plausibility rules --------------------------------------------------

    def create_plausibility_rule(
        self,
        metric_key: str,
        operator: str,
        threshold_value: float | None,
        plant_type_id: int | None = None,
        severity: str = "mittel",
        enabled: bool = True,
    ) -> int:
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO plausibility_rule "
                "(plant_type_id, metric_key, operator, threshold_value, severity, enabled) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (plant_type_id, metric_key, operator, threshold_value, severity, int(enabled)),
            )
            return cur.lastrowid

    def list_plausibility_rules(
        self, plant_type_id: int | None = None, metric_key: str | None = None
    ) -> list[PlausibilityRule]:
        query = "SELECT * FROM plausibility_rule WHERE enabled = 1"
        params: list = []
        if plant_type_id is not None:
            query += " AND (plant_type_id = ? OR plant_type_id IS NULL)"
            params.append(plant_type_id)
        if metric_key is not None:
            query += " AND metric_key = ?"
            params.append(metric_key)
        rows = self._conn.execute(query, params).fetchall()
        return [PlausibilityRule.from_row(row) for row in rows]

    def update_plausibility_rule(self, rule_id: int, **fields) -> None:
        if not fields:
            return
        if "enabled" in fields:
            fields["enabled"] = int(fields["enabled"])
        assignments = ", ".join(f"{key} = ?" for key in fields)
        with self._conn:
            self._conn.execute(
                f"UPDATE plausibility_rule SET {assignments} WHERE id = ?",
                [*fields.values(), rule_id],
            )

    def delete_plausibility_rule(self, rule_id: int) -> None:
        with self._conn:
            self._conn.execute("DELETE FROM plausibility_rule WHERE id = ?", (rule_id,))

    def seed_default_plausibility_rules(self, defaults: dict[str, list[dict]]) -> None:
        for plant_type_key, rules in defaults.items():
            row = self._conn.execute(
                "SELECT id FROM plant_type WHERE key = ?", (plant_type_key,)
            ).fetchone()
            if row is None:
                continue
            plant_type_id = row["id"]
            already_seeded = self._conn.execute(
                "SELECT id FROM plausibility_rule WHERE plant_type_id = ?", (plant_type_id,)
            ).fetchone()
            if already_seeded is not None:
                continue
            for rule in rules:
                self.create_plausibility_rule(
                    rule["metric_key"],
                    rule["operator"],
                    rule["threshold_value"],
                    plant_type_id=plant_type_id,
                    severity=rule.get("severity", "mittel"),
                )

    # -- analysis results & anomalies ----------------------------------------

    def save_analysis_result(
        self, plant_id: int, period_type: str, period_key: str, computed_at: str, metrics_json: str
    ) -> int:
        with self._conn:
            self._conn.execute(
                "INSERT INTO analysis_result (plant_id, period_type, period_key, computed_at, metrics_json) "
                "VALUES (?, ?, ?, ?, ?) "
                "ON CONFLICT(plant_id, period_type, period_key) DO UPDATE SET "
                "computed_at = excluded.computed_at, metrics_json = excluded.metrics_json",
                (plant_id, period_type, period_key, computed_at, metrics_json),
            )
            return self._conn.execute(
                "SELECT id FROM analysis_result WHERE plant_id = ? AND period_type = ? AND period_key = ?",
                (plant_id, period_type, period_key),
            ).fetchone()["id"]

    def list_analysis_results(self, plant_id: int) -> list[AnalysisResult]:
        rows = self._conn.execute(
            "SELECT * FROM analysis_result WHERE plant_id = ? ORDER BY period_key DESC", (plant_id,)
        ).fetchall()
        return [AnalysisResult.from_row(row) for row in rows]

    def clear_anomalies_for_result(self, analysis_result_id: int) -> None:
        with self._conn:
            self._conn.execute(
                "DELETE FROM anomaly WHERE analysis_result_id = ?", (analysis_result_id,)
            )

    def create_anomaly(
        self,
        analysis_result_id: int,
        metric_key: str,
        severity: str,
        confidence: float,
        description: str,
        possible_causes_json: str | None = None,
    ) -> int:
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO anomaly "
                "(analysis_result_id, metric_key, severity, confidence, description, possible_causes_json, status) "
                "VALUES (?, ?, ?, ?, ?, ?, 'offen')",
                (analysis_result_id, metric_key, severity, confidence, description, possible_causes_json),
            )
            return cur.lastrowid

    def list_anomalies(self, plant_id: int | None = None, status: str | None = None) -> list[Anomaly]:
        query = (
            "SELECT anomaly.* FROM anomaly "
            "JOIN analysis_result ON analysis_result.id = anomaly.analysis_result_id WHERE 1=1"
        )
        params: list = []
        if plant_id is not None:
            query += " AND analysis_result.plant_id = ?"
            params.append(plant_id)
        if status is not None:
            query += " AND anomaly.status = ?"
            params.append(status)
        query += " ORDER BY anomaly.id DESC"
        rows = self._conn.execute(query, params).fetchall()
        return [Anomaly.from_row(row) for row in rows]

    def update_anomaly_status(self, anomaly_id: int, status: str) -> None:
        with self._conn:
            self._conn.execute("UPDATE anomaly SET status = ? WHERE id = ?", (status, anomaly_id))

    # -- checklist templates -------------------------------------------------

    def create_checklist_template(self, plant_type_id: int, name: str, version: int = 1) -> int:
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO checklist_template (plant_type_id, name, version) VALUES (?, ?, ?)",
                (plant_type_id, name, version),
            )
            return cur.lastrowid

    def list_checklist_templates(self, plant_type_id: int | None = None) -> list[ChecklistTemplate]:
        if plant_type_id is None:
            rows = self._conn.execute("SELECT * FROM checklist_template ORDER BY name").fetchall()
        else:
            rows = self._conn.execute(
                "SELECT * FROM checklist_template WHERE plant_type_id = ? ORDER BY name",
                (plant_type_id,),
            ).fetchall()
        return [ChecklistTemplate.from_row(row) for row in rows]

    def add_checklist_item_template(
        self,
        checklist_template_id: int,
        text: str,
        sort_order: int = 0,
        requires_measurement: bool = False,
        unit: str | None = None,
    ) -> int:
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO checklist_item_template "
                "(checklist_template_id, sort_order, text, requires_measurement, unit) "
                "VALUES (?, ?, ?, ?, ?)",
                (checklist_template_id, sort_order, text, int(requires_measurement), unit),
            )
            return cur.lastrowid

    def list_checklist_item_templates(self, checklist_template_id: int) -> list[ChecklistItemTemplate]:
        rows = self._conn.execute(
            "SELECT * FROM checklist_item_template WHERE checklist_template_id = ? "
            "ORDER BY sort_order, id",
            (checklist_template_id,),
        ).fetchall()
        return [ChecklistItemTemplate.from_row(row) for row in rows]

    # -- inspections -----------------------------------------------------

    def create_inspection(
        self,
        plant_id: int,
        date_iso: str,
        type: str = "sonstige",
        inspector: str | None = None,
        checklist_template_id: int | None = None,
    ) -> int:
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO inspection (plant_id, checklist_template_id, date, inspector, type, status) "
                "VALUES (?, ?, ?, ?, ?, 'offen')",
                (plant_id, checklist_template_id, date_iso, inspector, type),
            )
            inspection_id = cur.lastrowid
            if checklist_template_id is not None:
                for item_template in self.list_checklist_item_templates(checklist_template_id):
                    self._conn.execute(
                        "INSERT INTO inspection_item (inspection_id, template_item_id, text, state) "
                        "VALUES (?, ?, ?, 'nicht_geprueft')",
                        (inspection_id, item_template.id, item_template.text),
                    )
            return inspection_id

    def list_inspections(self, plant_id: int) -> list[Inspection]:
        rows = self._conn.execute(
            "SELECT * FROM inspection WHERE plant_id = ? ORDER BY date DESC, id DESC", (plant_id,)
        ).fetchall()
        return [Inspection.from_row(row) for row in rows]

    def get_inspection(self, inspection_id: int) -> Inspection | None:
        row = self._conn.execute(
            "SELECT * FROM inspection WHERE id = ?", (inspection_id,)
        ).fetchone()
        return Inspection.from_row(row) if row else None

    def list_inspection_items(self, inspection_id: int) -> list[InspectionItem]:
        rows = self._conn.execute(
            "SELECT * FROM inspection_item WHERE inspection_id = ? ORDER BY id", (inspection_id,)
        ).fetchall()
        return [InspectionItem.from_row(row) for row in rows]

    def add_inspection_item(self, inspection_id: int, text: str) -> int:
        """Add a free-form item not backed by a checklist template."""
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO inspection_item (inspection_id, text, state) VALUES (?, ?, 'nicht_geprueft')",
                (inspection_id, text),
            )
            return cur.lastrowid

    def update_inspection_item(
        self, item_id: int, state: str, comment: str | None = None
    ) -> None:
        with self._conn:
            self._conn.execute(
                "UPDATE inspection_item SET state = ?, comment = ? WHERE id = ?",
                (state, comment, item_id),
            )

    def complete_inspection(self, inspection_id: int, next_due_date: str | None = None) -> None:
        inspection = self.get_inspection(inspection_id)
        if inspection is None:
            raise ValueError(f"Inspection {inspection_id} not found")

        if next_due_date is None:
            plant = self.get_plant(inspection.plant_id)
            if plant is not None and plant.inspection_interval_months:
                next_due_date = add_months(inspection.date, plant.inspection_interval_months)

        with self._conn:
            self._conn.execute(
                "UPDATE inspection SET status = 'abgeschlossen', next_due_date = ? WHERE id = ?",
                (next_due_date, inspection_id),
            )
            self._conn.execute(
                "UPDATE plant SET last_inspection = ?, next_inspection = ? WHERE id = ?",
                (inspection.date, next_due_date, inspection.plant_id),
            )

    # -- measurements ------------------------------------------------------

    def add_measurement(
        self,
        plant_id: int,
        metric_key: str,
        value: float,
        recorded_at: str,
        unit: str | None = None,
        inspection_item_id: int | None = None,
        source: str = "manual",
    ) -> int:
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO measurement "
                "(plant_id, inspection_item_id, metric_key, value, unit, recorded_at, source) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (plant_id, inspection_item_id, metric_key, value, unit, recorded_at, source),
            )
            return cur.lastrowid

    def list_measurements(self, plant_id: int, metric_key: str | None = None) -> list[Measurement]:
        if metric_key is None:
            rows = self._conn.execute(
                "SELECT * FROM measurement WHERE plant_id = ? ORDER BY recorded_at", (plant_id,)
            ).fetchall()
        else:
            rows = self._conn.execute(
                "SELECT * FROM measurement WHERE plant_id = ? AND metric_key = ? ORDER BY recorded_at",
                (plant_id, metric_key),
            ).fetchall()
        return [Measurement.from_row(row) for row in rows]

    # -- findings ------------------------------------------------------------

    def create_finding(
        self,
        plant_id: int,
        description: str,
        date_iso: str,
        category: str | None = None,
        priority: str = "mittel",
        responsible: str | None = None,
        due_date: str | None = None,
        inspection_id: int | None = None,
    ) -> int:
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO finding "
                "(plant_id, inspection_id, description, category, priority, date, responsible, due_date, status) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'offen')",
                (plant_id, inspection_id, description, category, priority, date_iso, responsible, due_date),
            )
            return cur.lastrowid

    def list_findings(
        self, plant_id: int | None = None, status: str | None = None
    ) -> list[Finding]:
        query = "SELECT * FROM finding WHERE 1=1"
        params: list = []
        if plant_id is not None:
            query += " AND plant_id = ?"
            params.append(plant_id)
        if status is not None:
            query += " AND status = ?"
            params.append(status)
        query += " ORDER BY date DESC, id DESC"
        rows = self._conn.execute(query, params).fetchall()
        return [Finding.from_row(row) for row in rows]

    def update_finding_status(
        self,
        finding_id: int,
        status: str,
        resolved_at: str | None = None,
        comment: str | None = None,
    ) -> None:
        with self._conn:
            self._conn.execute(
                "UPDATE finding SET status = ?, resolved_at = ?, comment = COALESCE(?, comment) WHERE id = ?",
                (status, resolved_at, comment, finding_id),
            )

    # -- maintenance -----------------------------------------------------

    def create_maintenance(
        self,
        plant_id: int,
        date_iso: str,
        type: str | None = None,
        description: str | None = None,
        performed_by: str | None = None,
    ) -> int:
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO maintenance (plant_id, date, type, description, performed_by) "
                "VALUES (?, ?, ?, ?, ?)",
                (plant_id, date_iso, type, description, performed_by),
            )
            return cur.lastrowid

    def list_maintenance(self, plant_id: int) -> list[Maintenance]:
        rows = self._conn.execute(
            "SELECT * FROM maintenance WHERE plant_id = ? ORDER BY date DESC, id DESC", (plant_id,)
        ).fetchall()
        return [Maintenance.from_row(row) for row in rows]

    # -- documents -----------------------------------------------------------

    def create_document(
        self,
        type: str,
        filename: str,
        content_hash: str,
        uploaded_at: str,
        plant_id: int | None = None,
        inspection_id: int | None = None,
        finding_id: int | None = None,
    ) -> int:
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO document "
                "(plant_id, inspection_id, finding_id, type, filename, content_hash, uploaded_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (plant_id, inspection_id, finding_id, type, filename, content_hash, uploaded_at),
            )
            return cur.lastrowid

    def get_document(self, document_id: int) -> Document | None:
        row = self._conn.execute("SELECT * FROM document WHERE id = ?", (document_id,)).fetchone()
        return Document.from_row(row) if row else None

    def list_documents(
        self,
        plant_id: int | None = None,
        inspection_id: int | None = None,
        finding_id: int | None = None,
    ) -> list[Document]:
        query = "SELECT * FROM document WHERE 1=1"
        params: list = []
        for column, value in (
            ("plant_id", plant_id),
            ("inspection_id", inspection_id),
            ("finding_id", finding_id),
        ):
            if value is not None:
                query += f" AND {column} = ?"
                params.append(value)
        query += " ORDER BY uploaded_at DESC"
        rows = self._conn.execute(query, params).fetchall()
        return [Document.from_row(row) for row in rows]

    def delete_document(self, document_id: int) -> None:
        with self._conn:
            self._conn.execute("DELETE FROM document WHERE id = ?", (document_id,))

    # -- dashboard counters -------------------------------------------------

    def count_plants(self) -> int:
        return self._conn.execute("SELECT COUNT(*) AS c FROM plant").fetchone()["c"]

    def count_findings_open(self) -> int:
        return self._conn.execute(
            "SELECT COUNT(*) AS c FROM finding WHERE status = 'offen'"
        ).fetchone()["c"]

    def count_anomalies_open(self) -> int:
        return self._conn.execute(
            "SELECT COUNT(*) AS c FROM anomaly WHERE status = 'offen'"
        ).fetchone()["c"]

    def count_inspections_due(self, today_iso: str) -> int:
        return self._conn.execute(
            "SELECT COUNT(*) AS c FROM plant WHERE next_inspection IS NOT NULL AND next_inspection <= ?",
            (today_iso,),
        ).fetchone()["c"]

    def list_plants_due(self, horizon_iso: str) -> list[Plant]:
        """Plants whose next inspection is overdue or due by `horizon_iso`."""
        rows = self._conn.execute(
            "SELECT * FROM plant WHERE next_inspection IS NOT NULL AND next_inspection <= ? "
            "ORDER BY next_inspection",
            (horizon_iso,),
        ).fetchall()
        return [Plant.from_row(row) for row in rows]
