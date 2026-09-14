"""Constants for the TechDoc (Haustechnik-Pruefdokumentation) integration."""
from __future__ import annotations

DOMAIN = "techdoc"

DB_FILENAME = "techdoc.db"
DOCUMENTS_SUBDIR = "techdoc_documents"

PLATFORMS = ["sensor"]

PANEL_URL_PATH = "techdoc"
PANEL_TITLE = "TechDoc"
PANEL_ICON = "mdi:home-lightning-bolt-outline"

DEFAULT_ANALYSIS_INTERVAL_MINUTES = 60

# Suggested metric_key catalogue per built-in plant type (spec section 37).
# Purely UI convenience for the sensor-mapping form — any plant (including
# custom plant types) can still be mapped to an arbitrary free-form
# metric_key, so this list never limits what is possible, only what is
# pre-suggested.
#
# "hints" and "device_classes" feed the best-effort entity-suggestion
# heuristic in ha_bridge/matching.py: a device's sensor is only ever
# *suggested*, never auto-applied without the user clicking "Übernehmen".
PLANT_TYPE_METRICS: dict[str, list[dict]] = {
    "pv": [
        {
            "key": "pv_yield_kwh",
            "name": "Jahresertrag",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": ["ertrag", "yield", "erzeugung", "produktion", "production", "generated"],
        },
        {
            "key": "pv_self_consumption_kwh",
            "name": "Eigenverbrauch",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": ["eigenverbrauch", "self consumption", "self-consumption"],
        },
        {
            "key": "pv_grid_export_kwh",
            "name": "Einspeisung",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": ["einspeisung", "export", "feed in", "feed-in", "feedin"],
        },
        {
            "key": "pv_grid_import_kwh",
            "name": "Netzbezug",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": ["netzbezug", "bezug", "import", "grid consumption"],
        },
    ],
    "heatpump": [
        {
            "key": "heatpump_power_kwh",
            "name": "Stromverbrauch",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": ["stromverbrauch", "power consumption", "electrical energy", "verbrauch"],
        },
        {
            "key": "heatpump_heat_kwh",
            "name": "Wärmeerzeugung",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": ["wärme", "waerme", "heat", "thermal energy", "wärmemenge", "waermemenge"],
        },
        {
            "key": "heatpump_cop",
            "name": "COP",
            "unit": None,
            "kind": "mean",
            "device_classes": [],
            "hints": ["cop", "leistungszahl", "coefficient of performance"],
        },
        {
            "key": "heatpump_flow_temp",
            "name": "Vorlauftemperatur",
            "unit": "°C",
            "kind": "mean",
            "device_classes": ["temperature"],
            "hints": ["vorlauf", "flow temperature", "flow temp"],
        },
    ],
    "wallbox": [
        {
            "key": "wallbox_energy_kwh",
            "name": "Ladeenergie",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": ["ladeenergie", "charging energy", "charged energy", "energy session"],
        },
    ],
    "battery": [
        {
            "key": "battery_charge_kwh",
            "name": "Ladeenergie",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": ["ladeenergie", "charge energy", "laden", "charging"],
        },
        {
            "key": "battery_discharge_kwh",
            "name": "Entladeenergie",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": ["entladeenergie", "discharge energy", "entladen", "discharging"],
        },
    ],
    "solar_thermal": [
        {
            "key": "solar_thermal_yield_kwh",
            "name": "Solarertrag",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": ["solarertrag", "solar yield", "kollektor", "collector"],
        },
    ],
}

# Default plausibility rules per built-in plant type (spec section 38).
# Purely a starting point — fully editable/deletable through the panel, and
# analysis/rules_engine.py never branches on plant type itself.
DEFAULT_PLAUSIBILITY_RULES: dict[str, list[dict]] = {
    "pv": [
        {"metric_key": "pv_yield_kwh", "operator": "lt", "threshold_value": 0, "severity": "kritisch"},
        {"metric_key": "pv_yield_kwh", "operator": "yoy_change", "threshold_value": 0.3, "severity": "mittel"},
    ],
    "heatpump": [
        {"metric_key": "heatpump_cop", "operator": "lt", "threshold_value": 2.0, "severity": "hoch"},
        {"metric_key": "heatpump_cop", "operator": "gt", "threshold_value": 7.0, "severity": "niedrig"},
    ],
    "wallbox": [
        {"metric_key": "wallbox_energy_kwh", "operator": "lt", "threshold_value": 0, "severity": "mittel"},
    ],
    "battery": [
        {"metric_key": "battery_charge_kwh", "operator": "lt", "threshold_value": 0, "severity": "mittel"},
    ],
    "solar_thermal": [
        {"metric_key": "solar_thermal_yield_kwh", "operator": "lt", "threshold_value": 0, "severity": "mittel"},
    ],
}

# Seed data for built-in plant types. Users can add further custom plant types
# at runtime; this list only pre-populates common cases so the UI is not empty
# on first use.
DEFAULT_PLANT_TYPES: list[dict[str, str]] = [
    {"key": "pv", "name": "Photovoltaikanlage", "icon": "mdi:solar-power"},
    {"key": "solar_thermal", "name": "Solarthermieanlage", "icon": "mdi:solar-panel"},
    {"key": "heatpump", "name": "Wärmepumpe", "icon": "mdi:heat-pump"},
    {"key": "wallbox", "name": "Wallbox / Ladeinfrastruktur", "icon": "mdi:ev-station"},
    {"key": "battery", "name": "Batteriespeicher", "icon": "mdi:battery-high"},
    {"key": "sauna", "name": "Sauna", "icon": "mdi:thermometer-high"},
    {"key": "heating", "name": "Heizungsanlage", "icon": "mdi:radiator"},
    {"key": "ventilation", "name": "Lüftungsanlage", "icon": "mdi:fan"},
    {"key": "climate", "name": "Klimaanlage", "icon": "mdi:air-conditioner"},
    {"key": "hot_water", "name": "Warmwasserbereitung", "icon": "mdi:water-boiler"},
    {"key": "circulation_pump", "name": "Zirkulationspumpe", "icon": "mdi:pump"},
    {"key": "electrical", "name": "Elektroanlage", "icon": "mdi:electric-switch"},
    {"key": "water", "name": "Wasseranlage", "icon": "mdi:water-pump"},
    {"key": "lighting", "name": "Beleuchtung", "icon": "mdi:ceiling-light"},
]

# Seed checklists for the built-in plant types that ship with a concrete
# example in the spec. Users create their own checklists for every other
# plant type (built-in or custom) through the panel.
DEFAULT_CHECKLISTS: dict[str, list[str]] = {
    "pv": [
        "Module optisch geprüft",
        "Module auf Beschädigungen geprüft",
        "Verkabelung geprüft",
        "Steckverbindungen geprüft",
        "Wechselrichter geprüft",
        "Fehlerhistorie geprüft",
        "Überspannungsschutz geprüft",
        "Sicherungen geprüft",
        "Erdung geprüft",
        "Ertragsdaten geprüft",
        "Jahresertrag plausibel",
        "Anomalien vorhanden",
        "Dokumentation aktualisiert",
    ],
}
