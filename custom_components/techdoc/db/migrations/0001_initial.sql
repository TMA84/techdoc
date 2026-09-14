-- Initial schema for techdoc.
-- Multi-building capable from the start; V1 UI may only expose a single building.

CREATE TABLE building (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    notes TEXT
);

CREATE TABLE plant_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    icon TEXT,
    is_custom INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE plant (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building_id INTEGER NOT NULL REFERENCES building(id) ON DELETE CASCADE,
    plant_type_id INTEGER NOT NULL REFERENCES plant_type(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    year_built INTEGER,
    install_date TEXT,
    location TEXT,
    power_kw REAL,
    nominal_power_kw REAL,
    warranty_until TEXT,
    installer TEXT,
    contact TEXT,
    inspection_interval_months INTEGER,
    last_inspection TEXT,
    next_inspection TEXT,
    status TEXT NOT NULL DEFAULT 'unknown',
    notes TEXT
);

CREATE TABLE component (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL REFERENCES plant(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT
);

CREATE TABLE sensor_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL REFERENCES plant(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    unit TEXT,
    aggregation TEXT NOT NULL DEFAULT 'sum',
    UNIQUE(plant_id, metric_key)
);

CREATE TABLE threshold (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER REFERENCES plant(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    min_value REAL,
    max_value REAL,
    target_value REAL,
    tolerance REAL,
    unit TEXT
);

CREATE TABLE checklist_template (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_type_id INTEGER NOT NULL REFERENCES plant_type(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE checklist_item_template (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    checklist_template_id INTEGER NOT NULL REFERENCES checklist_template(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    text TEXT NOT NULL,
    requires_measurement INTEGER NOT NULL DEFAULT 0,
    unit TEXT
);

CREATE TABLE inspection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL REFERENCES plant(id) ON DELETE CASCADE,
    checklist_template_id INTEGER REFERENCES checklist_template(id) ON DELETE SET NULL,
    date TEXT NOT NULL,
    inspector TEXT,
    type TEXT NOT NULL DEFAULT 'sonstige',
    status TEXT NOT NULL DEFAULT 'offen',
    next_due_date TEXT,
    signature_ref TEXT
);

CREATE TABLE inspection_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inspection_id INTEGER NOT NULL REFERENCES inspection(id) ON DELETE CASCADE,
    template_item_id INTEGER REFERENCES checklist_item_template(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'nicht_geprueft',
    comment TEXT
);

CREATE TABLE measurement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL REFERENCES plant(id) ON DELETE CASCADE,
    inspection_item_id INTEGER REFERENCES inspection_item(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT,
    recorded_at TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual'
);

CREATE TABLE finding (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL REFERENCES plant(id) ON DELETE CASCADE,
    inspection_id INTEGER REFERENCES inspection(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    category TEXT,
    priority TEXT NOT NULL DEFAULT 'mittel',
    date TEXT NOT NULL,
    responsible TEXT,
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'offen',
    resolved_at TEXT,
    comment TEXT
);

CREATE TABLE maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL REFERENCES plant(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    type TEXT,
    description TEXT,
    performed_by TEXT
);

CREATE TABLE document (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER REFERENCES plant(id) ON DELETE CASCADE,
    inspection_id INTEGER REFERENCES inspection(id) ON DELETE CASCADE,
    finding_id INTEGER REFERENCES finding(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    filename TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    uploaded_at TEXT NOT NULL
);

CREATE TABLE plausibility_rule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_type_id INTEGER REFERENCES plant_type(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    operator TEXT NOT NULL,
    threshold_value REAL,
    severity TEXT NOT NULL DEFAULT 'mittel',
    enabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE analysis_result (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL REFERENCES plant(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL,
    period_key TEXT NOT NULL,
    computed_at TEXT NOT NULL,
    metrics_json TEXT NOT NULL,
    UNIQUE(plant_id, period_type, period_key)
);

CREATE TABLE anomaly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    analysis_result_id INTEGER NOT NULL REFERENCES analysis_result(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    severity TEXT NOT NULL,
    confidence REAL NOT NULL,
    description TEXT NOT NULL,
    possible_causes_json TEXT,
    status TEXT NOT NULL DEFAULT 'offen'
);

CREATE INDEX idx_plant_building ON plant(building_id);
CREATE INDEX idx_inspection_plant ON inspection(plant_id);
CREATE INDEX idx_finding_plant_status ON finding(plant_id, status);
CREATE INDEX idx_measurement_plant_metric ON measurement(plant_id, metric_key, recorded_at);
CREATE INDEX idx_analysis_result_plant ON analysis_result(plant_id, period_type);
