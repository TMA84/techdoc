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
            "hints": [
                "ertrag",
                "yield",
                "erzeugung",
                "produktion",
                "production",
                "generated",
                "pv energy",
                "pv total energy",
                "total pv energy",
                "solar energy",
            ],
        },
        {
            "key": "pv_self_consumption_kwh",
            "name": "Eigenverbrauch",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": [
                "eigenverbrauch",
                "self consumption",
                "self-consumption",
                "pv consumption",
                "consumption from pv",
            ],
        },
        {
            "key": "pv_grid_export_kwh",
            "name": "Einspeisung",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": [
                "einspeisung",
                "export",
                "feed in",
                "feed-in",
                "feedin",
                "pv to grid",
                "exported energy",
                "grid feed in",
            ],
        },
        {
            "key": "pv_grid_import_kwh",
            "name": "Netzbezug",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": [
                "netzbezug",
                "bezug",
                "import",
                "grid consumption",
                "grid to load",
                "purchased energy",
                "imported energy",
                "from grid",
            ],
        },
    ],
    # Many heat pumps report separate sensors per operating mode (Heizen /
    # Raumheizung vs. Warmwasser / Brauchwasser) rather than one combined
    # total — both the "_heating_"/"_hotwater_" split metrics and the plain
    # combined ones are offered, since which exist depends on the specific
    # heat pump integration. The combined metrics' hints lean toward
    # "gesamt"/"total" wording so they don't grab one of the two split
    # sensors when a device exposes all three.
    "heatpump": [
        {
            "key": "heatpump_power_kwh",
            "name": "Stromverbrauch (gesamt)",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": [
                "strom gesamt",
                "stromverbrauch gesamt",
                "gesamtverbrauch",
                "total power consumption",
                "total energy consumption",
            ],
        },
        {
            "key": "heatpump_power_heating_kwh",
            "name": "Stromverbrauch Heizen",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": [
                "strom heizen",
                "strom heizung",
                "stromverbrauch heizen",
                "stromverbrauch heizung",
                "heizstrom",
                "power heating",
                "electrical energy heating",
            ],
        },
        {
            "key": "heatpump_power_hotwater_kwh",
            "name": "Stromverbrauch Warmwasser",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": [
                "strom warmwasser",
                "stromverbrauch warmwasser",
                "brauchwasserstrom",
                "power hot water",
                "electrical energy hot water",
                "electrical energy dhw",
            ],
        },
        {
            "key": "heatpump_heat_kwh",
            "name": "Wärmeerzeugung (gesamt)",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": [
                "wärme gesamt",
                "waerme gesamt",
                "wärmemenge gesamt",
                "waermemenge gesamt",
                "total thermal energy",
                "total heat energy",
            ],
        },
        {
            "key": "heatpump_heat_heating_kwh",
            "name": "Wärmeerzeugung Heizen",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": [
                "wärme heizen",
                "wärme heizung",
                "waerme heizen",
                "waerme heizung",
                "wärmemenge heizen",
                "wärmemenge heizung",
                "heizwärme",
                "heizwaerme",
                "heat output heating",
                "heat generated heating",
                "thermal energy heating",
            ],
        },
        {
            "key": "heatpump_heat_hotwater_kwh",
            "name": "Wärmeerzeugung Warmwasser",
            "unit": "kWh",
            "kind": "sum",
            "device_classes": ["energy"],
            "hints": [
                "wärme warmwasser",
                "waerme warmwasser",
                "wärmemenge warmwasser",
                "heat output hot water",
                "heat generated hot water",
                "heat generated domestic hot water",
                "thermal energy hot water",
                "thermal energy dhw",
            ],
        },
        {
            "key": "heatpump_cop",
            "name": "COP (gesamt)",
            "unit": None,
            "kind": "mean",
            "device_classes": [],
            "hints": ["cop gesamt", "jaz gesamt", "coefficient of performance"],
        },
        {
            "key": "heatpump_cop_heating",
            "name": "COP Heizen",
            "unit": None,
            "kind": "mean",
            "device_classes": [],
            "hints": [
                "cop heizen",
                "cop heizung",
                "jaz heizen",
                "jaz heizung",
                "leistungszahl heizen",
                "leistungszahl heizung",
                "heating cop",
            ],
        },
        {
            "key": "heatpump_cop_hotwater",
            "name": "COP Warmwasser",
            "unit": None,
            "kind": "mean",
            "device_classes": [],
            "hints": ["cop warmwasser", "jaz warmwasser", "leistungszahl warmwasser", "hot water cop", "dhw cop"],
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
        {"metric_key": "heatpump_cop_heating", "operator": "lt", "threshold_value": 2.0, "severity": "hoch"},
        {"metric_key": "heatpump_cop_heating", "operator": "gt", "threshold_value": 7.0, "severity": "niedrig"},
        {"metric_key": "heatpump_cop_hotwater", "operator": "lt", "threshold_value": 1.5, "severity": "hoch"},
        {"metric_key": "heatpump_cop_hotwater", "operator": "gt", "threshold_value": 5.0, "severity": "niedrig"},
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
