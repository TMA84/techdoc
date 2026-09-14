import sqlite3

import pytest

from tests._db_loader import import_db_module

repository_module = import_db_module("repository")
Repository = repository_module.Repository
run_migrations = repository_module.run_migrations


@pytest.fixture
def repo() -> Repository:
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    run_migrations(conn)
    return Repository(conn)


def test_seed_and_list_plant_types(repo):
    repo.seed_default_plant_types(
        [{"key": "pv", "name": "Photovoltaikanlage", "icon": "mdi:solar-power"}]
    )
    types = repo.list_plant_types()
    assert [t.key for t in types] == ["pv"]


def test_seed_is_idempotent(repo):
    defaults = [{"key": "pv", "name": "Photovoltaikanlage", "icon": None}]
    repo.seed_default_plant_types(defaults)
    repo.seed_default_plant_types(defaults)
    assert len(repo.list_plant_types()) == 1


def test_create_and_list_plant(repo):
    building_id = repo.create_building("Hauptgebäude")
    plant_type_id = repo.create_plant_type("pool", "Pooltechnik")

    plant_id = repo.create_plant(
        building_id, plant_type_id, "Pool-Filteranlage", manufacturer="Aqua GmbH"
    )

    plants = repo.list_plants(building_id)
    assert len(plants) == 1
    assert plants[0].id == plant_id
    assert plants[0].manufacturer == "Aqua GmbH"


def test_get_or_create_default_building_reuses_existing(repo):
    first = repo.get_or_create_default_building()
    second = repo.get_or_create_default_building()
    assert first == second
    assert len(repo.list_buildings()) == 1


def test_update_and_delete_plant(repo):
    building_id = repo.get_or_create_default_building()
    plant_type_id = repo.create_plant_type("pool", "Pooltechnik")
    plant_id = repo.create_plant(building_id, plant_type_id, "Pool")

    repo.update_plant(plant_id, status="ok", notes="frisch gewartet")
    plant = repo.get_plant(plant_id)
    assert plant.status == "ok"
    assert plant.notes == "frisch gewartet"

    repo.delete_plant(plant_id)
    assert repo.get_plant(plant_id) is None


def test_dashboard_counters(repo):
    building_id = repo.get_or_create_default_building()
    plant_type_id = repo.create_plant_type("pv", "PV-Anlage")
    repo.create_plant(
        building_id,
        plant_type_id,
        "Dach-PV",
        next_inspection="2020-01-01",
        status="ok",
    )

    assert repo.count_plants() == 1
    assert repo.count_inspections_due("2026-01-01") == 1
    assert repo.count_inspections_due("2019-01-01") == 0
    assert repo.count_findings_open() == 0
    assert repo.count_anomalies_open() == 0


def test_seed_default_checklists_creates_template_with_items(repo):
    repo.seed_default_plant_types([{"key": "pv", "name": "Photovoltaikanlage", "icon": None}])
    repo.seed_default_checklists({"pv": ["Module optisch geprüft", "Wechselrichter geprüft"]})

    pv_type = repo.list_plant_types()[0]
    templates = repo.list_checklist_templates(pv_type.id)
    assert len(templates) == 1

    items = repo.list_checklist_item_templates(templates[0].id)
    assert [i.text for i in items] == ["Module optisch geprüft", "Wechselrichter geprüft"]


def test_seed_default_checklists_is_idempotent(repo):
    repo.seed_default_plant_types([{"key": "pv", "name": "Photovoltaikanlage", "icon": None}])
    defaults = {"pv": ["Punkt A"]}
    repo.seed_default_checklists(defaults)
    repo.seed_default_checklists(defaults)

    pv_type = repo.list_plant_types()[0]
    assert len(repo.list_checklist_templates(pv_type.id)) == 1


def test_seed_default_checklists_skips_unknown_plant_type(repo):
    repo.seed_default_checklists({"does_not_exist": ["Punkt A"]})
    assert repo.list_checklist_templates() == []


def test_add_months_clamps_short_months():
    add_months = repository_module.add_months
    assert add_months("2026-01-31", 1) == "2026-02-28"
    assert add_months("2026-03-15", 12) == "2027-03-15"
    assert add_months("2026-11-30", 3) == "2027-02-28"


def _setup_plant_with_checklist(repo, interval_months: int = 12):
    building_id = repo.get_or_create_default_building()
    plant_type_id = repo.create_plant_type("pv", "PV-Anlage")
    plant_id = repo.create_plant(
        building_id, plant_type_id, "Dach-PV", inspection_interval_months=interval_months
    )
    template_id = repo.create_checklist_template(plant_type_id, "Jahresprüfung")
    repo.add_checklist_item_template(template_id, "Module optisch geprüft", sort_order=1)
    repo.add_checklist_item_template(template_id, "Wechselrichter geprüft", sort_order=2)
    return plant_id, template_id


def test_create_inspection_copies_checklist_items(repo):
    plant_id, template_id = _setup_plant_with_checklist(repo)

    inspection_id = repo.create_inspection(
        plant_id, "2026-03-12", type="Jahresprüfung", checklist_template_id=template_id
    )

    items = repo.list_inspection_items(inspection_id)
    assert [item.text for item in items] == ["Module optisch geprüft", "Wechselrichter geprüft"]
    assert all(item.state == "nicht_geprueft" for item in items)


def test_complete_inspection_computes_next_due_date_from_plant_interval(repo):
    plant_id, template_id = _setup_plant_with_checklist(repo, interval_months=12)
    inspection_id = repo.create_inspection(plant_id, "2026-03-12", checklist_template_id=template_id)

    repo.complete_inspection(inspection_id)

    inspection = repo.get_inspection(inspection_id)
    plant = repo.get_plant(plant_id)
    assert inspection.status == "abgeschlossen"
    assert inspection.next_due_date == "2027-03-12"
    assert plant.last_inspection == "2026-03-12"
    assert plant.next_inspection == "2027-03-12"


def test_complete_inspection_honors_explicit_next_due_date(repo):
    plant_id, template_id = _setup_plant_with_checklist(repo)
    inspection_id = repo.create_inspection(plant_id, "2026-03-12", checklist_template_id=template_id)

    repo.complete_inspection(inspection_id, next_due_date="2026-06-01")

    assert repo.get_inspection(inspection_id).next_due_date == "2026-06-01"


def test_finding_lifecycle(repo):
    plant_id, _ = _setup_plant_with_checklist(repo)
    finding_id = repo.create_finding(
        plant_id, "Sicherung defekt", "2026-03-12", priority="hoch", due_date="2026-04-01"
    )

    assert repo.count_findings_open() == 1
    open_findings = repo.list_findings(plant_id=plant_id, status="offen")
    assert len(open_findings) == 1

    repo.update_finding_status(finding_id, "erledigt", resolved_at="2026-03-20", comment="ersetzt")

    assert repo.count_findings_open() == 0
    finding = repo.list_findings(plant_id=plant_id)[0]
    assert finding.status == "erledigt"
    assert finding.comment == "ersetzt"


def test_measurements_are_recorded_per_metric(repo):
    plant_id, _ = _setup_plant_with_checklist(repo)
    repo.add_measurement(plant_id, "pv_yield_kwh", 8920.0, "2026-12-31", unit="kWh")
    repo.add_measurement(plant_id, "pv_yield_kwh", 9110.0, "2025-12-31", unit="kWh")

    values = repo.list_measurements(plant_id, "pv_yield_kwh")
    assert [m.value for m in values] == [9110.0, 8920.0]


def test_maintenance_log(repo):
    plant_id, _ = _setup_plant_with_checklist(repo)
    repo.create_maintenance(plant_id, "2026-05-01", type="Wartung", performed_by="Fa. Muster")

    entries = repo.list_maintenance(plant_id)
    assert len(entries) == 1
    assert entries[0].performed_by == "Fa. Muster"


def test_add_days():
    assert repository_module.add_days("2026-01-01", 30) == "2026-01-31"
    assert repository_module.add_days("2026-02-01", -1) == "2026-01-31"


def test_list_plants_due_includes_overdue_and_upcoming(repo):
    building_id = repo.get_or_create_default_building()
    plant_type_id = repo.create_plant_type("pv", "PV-Anlage")
    overdue_id = repo.create_plant(
        building_id, plant_type_id, "PV overdue", next_inspection="2026-01-01"
    )
    upcoming_id = repo.create_plant(
        building_id, plant_type_id, "PV upcoming", next_inspection="2026-01-20"
    )
    repo.create_plant(building_id, plant_type_id, "PV far away", next_inspection="2027-01-01")
    repo.create_plant(building_id, plant_type_id, "PV no date")

    due = repo.list_plants_due("2026-01-31")

    assert {p.id for p in due} == {overdue_id, upcoming_id}


def test_plausibility_rule_crud(repo):
    plant_type_id = repo.create_plant_type("pv", "PV-Anlage")
    rule_id = repo.create_plausibility_rule(
        "pv_yield_kwh", "lt", 0, plant_type_id=plant_type_id, severity="kritisch"
    )

    rules = repo.list_plausibility_rules(plant_type_id=plant_type_id)
    assert len(rules) == 1
    assert rules[0].id == rule_id

    repo.update_plausibility_rule(rule_id, enabled=False)
    assert repo.list_plausibility_rules(plant_type_id=plant_type_id) == []

    repo.update_plausibility_rule(rule_id, enabled=True)
    repo.delete_plausibility_rule(rule_id)
    assert repo.list_plausibility_rules(plant_type_id=plant_type_id) == []


def test_seed_default_plausibility_rules_is_idempotent(repo):
    repo.seed_default_plant_types([{"key": "pv", "name": "Photovoltaikanlage", "icon": None}])
    defaults = {"pv": [{"metric_key": "pv_yield_kwh", "operator": "lt", "threshold_value": 0}]}

    repo.seed_default_plausibility_rules(defaults)
    repo.seed_default_plausibility_rules(defaults)

    pv_type = repo.list_plant_types()[0]
    assert len(repo.list_plausibility_rules(plant_type_id=pv_type.id)) == 1


def test_analysis_result_upsert_and_anomalies(repo):
    plant_id, _ = _setup_plant_with_checklist(repo)

    result_id = repo.save_analysis_result(plant_id, "year", "2026", "2026-03-12T10:00:00", "{}")
    same_id = repo.save_analysis_result(
        plant_id, "year", "2026", "2026-03-13T10:00:00", '{"pv_yield_kwh": 8920}'
    )
    assert result_id == same_id
    assert len(repo.list_analysis_results(plant_id)) == 1

    anomaly_id = repo.create_anomaly(
        result_id, "pv_yield_kwh", "hoch", 0.8, "Ertrag deutlich unter Erwartung", "[]"
    )
    anomalies = repo.list_anomalies(plant_id=plant_id)
    assert len(anomalies) == 1
    assert anomalies[0].id == anomaly_id

    repo.update_anomaly_status(anomaly_id, "bestaetigt")
    assert repo.list_anomalies(plant_id=plant_id, status="bestaetigt")[0].id == anomaly_id

    repo.clear_anomalies_for_result(result_id)
    assert repo.list_anomalies(plant_id=plant_id) == []


def test_upsert_sensor_mapping_creates_then_updates(repo):
    plant_id, _ = _setup_plant_with_checklist(repo)

    mapping_id = repo.upsert_sensor_mapping(plant_id, "pv_yield_kwh", "sensor.pv_yield", unit="kWh")
    assert len(repo.list_sensor_mappings(plant_id)) == 1

    same_id = repo.upsert_sensor_mapping(
        plant_id, "pv_yield_kwh", "sensor.pv_yield_v2", unit="kWh", aggregation="sum"
    )
    assert same_id == mapping_id
    mappings = repo.list_sensor_mappings(plant_id)
    assert len(mappings) == 1
    assert mappings[0].entity_id == "sensor.pv_yield_v2"


def test_delete_sensor_mapping(repo):
    plant_id, _ = _setup_plant_with_checklist(repo)
    mapping_id = repo.upsert_sensor_mapping(plant_id, "pv_yield_kwh", "sensor.pv_yield")

    repo.delete_sensor_mapping(mapping_id)

    assert repo.list_sensor_mappings(plant_id) == []


def test_documents_can_be_attached_and_listed(repo):
    plant_id, _ = _setup_plant_with_checklist(repo)
    doc_id = repo.create_document(
        "Datenblatt", "wechselrichter.pdf", "abc123", "2026-03-12T10:00:00", plant_id=plant_id
    )

    docs = repo.list_documents(plant_id=plant_id)
    assert len(docs) == 1
    assert docs[0].id == doc_id

    repo.delete_document(doc_id)
    assert repo.list_documents(plant_id=plant_id) == []
