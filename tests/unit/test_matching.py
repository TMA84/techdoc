from tests._pkg_loader import import_module

matching = import_module("ha_bridge.matching")
EntityCandidate = matching.EntityCandidate
suggest_matches = matching.suggest_matches

_PV_METRICS = [
    {
        "key": "pv_yield_kwh",
        "name": "Jahresertrag",
        "unit": "kWh",
        "kind": "sum",
        "device_classes": ["energy"],
        "hints": ["ertrag", "yield", "erzeugung"],
    },
    {
        "key": "pv_grid_export_kwh",
        "name": "Einspeisung",
        "unit": "kWh",
        "kind": "sum",
        "device_classes": ["energy"],
        "hints": ["einspeisung", "export"],
    },
    {
        "key": "heatpump_cop",
        "name": "COP",
        "unit": None,
        "kind": "mean",
        "device_classes": [],
        "hints": ["cop", "leistungszahl"],
    },
]


def test_matches_by_name_hint_and_device_class():
    entities = [
        EntityCandidate("sensor.wr_ertrag", "Wechselrichter Ertrag", "energy", "total_increasing", "kWh"),
        EntityCandidate("sensor.wr_einspeisung", "Netzeinspeisung", "energy", "total_increasing", "kWh"),
        EntityCandidate("sensor.wr_power", "Wechselrichter Leistung", "power", "measurement", "W"),
    ]

    suggestions = {s.metric_key: s for s in suggest_matches(_PV_METRICS, entities)}

    assert suggestions["pv_yield_kwh"].entity_id == "sensor.wr_ertrag"
    assert suggestions["pv_grid_export_kwh"].entity_id == "sensor.wr_einspeisung"
    assert "heatpump_cop" not in suggestions  # no candidate entity has a compatible name/kind


def test_wrong_state_class_is_never_suggested_even_with_matching_name():
    """A "measurement" sensor can never satisfy a "sum" metric (see the
    aggregation bug this heuristic must not repeat) — even a perfect name
    match must not be suggested if the state_class is incompatible."""
    entities = [
        EntityCandidate("sensor.pv_ertrag_instant", "Ertrag", "energy", "measurement", "kWh"),
    ]
    suggestions = suggest_matches(_PV_METRICS, entities)
    assert suggestions == []


def test_mean_metric_matches_measurement_entity():
    entities = [
        EntityCandidate("sensor.hp_cop", "Wärmepumpe COP", None, "measurement", None),
    ]
    suggestions = {s.metric_key: s for s in suggest_matches(_PV_METRICS, entities)}
    assert suggestions["heatpump_cop"].entity_id == "sensor.hp_cop"


def test_no_suggestion_below_minimum_score():
    entities = [
        EntityCandidate("sensor.unrelated", "Garagentor Status", None, "total_increasing", "kWh"),
    ]
    suggestions = suggest_matches(_PV_METRICS, entities)
    assert suggestions == []


def test_empty_entities_yields_no_suggestions():
    assert suggest_matches(_PV_METRICS, []) == []
