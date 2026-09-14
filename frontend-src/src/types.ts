/**
 * Minimal HomeAssistant frontend contract we actually rely on. Deliberately
 * not importing the full `home-assistant-frontend` types package here — it
 * is a large, HA-core-version-coupled dependency, and this panel only ever
 * touches `callWS` and the auth token for the raw-fetch upload endpoint.
 */
export interface HomeAssistant {
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  auth: { data: { access_token: string } };
}

export interface PlantType {
  id: number;
  key: string;
  name: string;
  icon: string | null;
  is_custom: boolean;
}

export interface Plant {
  id: number;
  building_id: number;
  plant_type_id: number;
  name: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  year_built: number | null;
  install_date: string | null;
  location: string | null;
  power_kw: number | null;
  nominal_power_kw: number | null;
  warranty_until: string | null;
  installer: string | null;
  contact: string | null;
  inspection_interval_months: number | null;
  last_inspection: string | null;
  next_inspection: string | null;
  status: string;
  notes: string | null;
}

export interface Inspection {
  id: number;
  plant_id: number;
  checklist_template_id: number | null;
  date: string;
  inspector: string | null;
  type: string;
  status: string;
  next_due_date: string | null;
  signature_ref: string | null;
}

export interface Finding {
  id: number;
  plant_id: number;
  inspection_id: number | null;
  description: string;
  category: string | null;
  priority: string;
  date: string;
  responsible: string | null;
  due_date: string | null;
  status: string;
  resolved_at: string | null;
  comment: string | null;
}

export interface SensorMapping {
  id: number;
  plant_id: number;
  metric_key: string;
  entity_id: string;
  unit: string | null;
  aggregation: string;
}

export interface Anomaly {
  id: number;
  analysis_result_id: number;
  metric_key: string;
  severity: "info" | "niedrig" | "mittel" | "hoch" | "kritisch";
  confidence: number;
  description: string;
  possible_causes_json: string | null;
  status: string;
}

export interface DocumentRecord {
  id: number;
  plant_id: number | null;
  inspection_id: number | null;
  finding_id: number | null;
  type: string;
  filename: string;
  content_hash: string;
  uploaded_at: string;
}

export interface MetricCatalogueEntry {
  key: string;
  name: string;
  unit: string | null;
  kind: "sum" | "mean";
}

export type MetricCatalogue = Record<string, MetricCatalogueEntry[]>;

export interface YearlyTotalsResult {
  totals: Record<string, number>;
  unit: string | null;
}
