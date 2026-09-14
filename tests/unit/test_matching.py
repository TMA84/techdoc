from tests._pkg_loader import import_module

matching = import_module("ha_bridge.matching")
EntityCandidate = matching.EntityCandidate
suggest_matches = matching.suggest_matches

const = import_module("const")
HEATPUMP_METRICS = const.PLANT_TYPE_METRICS["heatpump"]

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


def test_device_class_and_unit_match_alone_is_never_enough():
    """Regression test: an entity that matches kind/device_class/unit but
    has no relevant word in its name must never be suggested — this is
    exactly what caused a heat pump's generic "Stromverbrauch" catalogue
    entry to grab one of its Heizen/Warmwasser-specific sensors in practice."""
    entities = [
        EntityCandidate("sensor.unrelated_energy", "Garagentor Energiezähler", "energy", "total_increasing", "kWh"),
    ]
    suggestions = suggest_matches(_PV_METRICS, entities)
    assert suggestions == []


def test_empty_entities_yields_no_suggestions():
    assert suggest_matches(_PV_METRICS, []) == []


def test_heatpump_splits_heating_and_hotwater_sensors_correctly():
    """Regression test for a real user report: a heat pump exposing
    separate Heizen/Warmwasser sensors must get each mapped to its own
    metric, not conflated or dropped."""
    entities = [
        EntityCandidate(
            "sensor.wp_stromverbrauch_heizen", "WP Stromverbrauch Heizen", "energy", "total_increasing", "kWh"
        ),
        EntityCandidate(
            "sensor.wp_stromverbrauch_warmwasser",
            "WP Stromverbrauch Warmwasser",
            "energy",
            "total_increasing",
            "kWh",
        ),
        EntityCandidate(
            "sensor.wp_waermemenge_heizen", "WP Wärmemenge Heizen", "energy", "total_increasing", "kWh"
        ),
        EntityCandidate(
            "sensor.wp_waermemenge_warmwasser",
            "WP Wärmemenge Warmwasser",
            "energy",
            "total_increasing",
            "kWh",
        ),
        EntityCandidate("sensor.wp_cop_heizen", "WP COP Heizen", None, "measurement", None),
        EntityCandidate("sensor.wp_cop_warmwasser", "WP COP Warmwasser", None, "measurement", None),
    ]

    suggestions = {s.metric_key: s for s in suggest_matches(HEATPUMP_METRICS, entities)}

    assert suggestions["heatpump_power_heating_kwh"].entity_id == "sensor.wp_stromverbrauch_heizen"
    assert suggestions["heatpump_power_hotwater_kwh"].entity_id == "sensor.wp_stromverbrauch_warmwasser"
    assert suggestions["heatpump_heat_heating_kwh"].entity_id == "sensor.wp_waermemenge_heizen"
    assert suggestions["heatpump_heat_hotwater_kwh"].entity_id == "sensor.wp_waermemenge_warmwasser"
    assert suggestions["heatpump_cop_heating"].entity_id == "sensor.wp_cop_heizen"
    assert suggestions["heatpump_cop_hotwater"].entity_id == "sensor.wp_cop_warmwasser"
    # No combined "gesamt" sensor exists in this fixture, so the plain
    # (non-split) metrics must not grab one of the split sensors instead.
    assert "heatpump_power_kwh" not in suggestions
    assert "heatpump_heat_kwh" not in suggestions
    assert "heatpump_cop" not in suggestions
