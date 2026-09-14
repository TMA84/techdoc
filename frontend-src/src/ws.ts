/**
 * Typed wrappers around the techdoc websocket API (see
 * custom_components/techdoc/websocket_api.py — command names and payload
 * shapes must stay in sync with that file).
 */
import type {
  Anomaly,
  Device,
  DeviceEntity,
  DocumentRecord,
  Finding,
  HomeAssistant,
  Inspection,
  MetricCatalogue,
  Plant,
  PlantType,
  SensorMapping,
  YearlyTotalsResult,
} from "./types";

export const fetchPlantTypes = (hass: HomeAssistant): Promise<PlantType[]> =>
  hass.callWS({ type: "techdoc/plant_type_list" });

export const fetchPlants = (hass: HomeAssistant): Promise<Plant[]> =>
  hass.callWS({ type: "techdoc/plant_list" });

export const createPlant = (
  hass: HomeAssistant,
  name: string,
  plantTypeId: number
): Promise<{ id: number }> =>
  hass.callWS({ type: "techdoc/plant_create", name, plant_type_id: plantTypeId });

export const updatePlant = (
  hass: HomeAssistant,
  plantId: number,
  fields: { name?: string; plant_type_id?: number }
): Promise<void> =>
  hass.callWS({ type: "techdoc/plant_update", plant_id: plantId, ...fields });

export const deletePlant = (hass: HomeAssistant, plantId: number): Promise<void> =>
  hass.callWS({ type: "techdoc/plant_delete", plant_id: plantId });

export const fetchMetricCatalogue = (hass: HomeAssistant): Promise<MetricCatalogue> =>
  hass.callWS({ type: "techdoc/metric_catalogue" });

export const fetchDevices = (hass: HomeAssistant): Promise<Device[]> =>
  hass.callWS({ type: "techdoc/device_list" });

export const fetchDeviceEntities = (hass: HomeAssistant, deviceId: string): Promise<DeviceEntity[]> =>
  hass.callWS({ type: "techdoc/device_entities", device_id: deviceId });

export const fetchInspections = (hass: HomeAssistant, plantId: number): Promise<Inspection[]> =>
  hass.callWS({ type: "techdoc/inspection_list", plant_id: plantId });

export const createInspection = (
  hass: HomeAssistant,
  plantId: number,
  date: string,
  inspectionType?: string,
  inspector?: string
): Promise<{ id: number }> =>
  hass.callWS({
    type: "techdoc/inspection_create",
    plant_id: plantId,
    date,
    inspection_type: inspectionType,
    inspector,
  });

export const completeInspection = (hass: HomeAssistant, inspectionId: number): Promise<void> =>
  hass.callWS({ type: "techdoc/inspection_complete", inspection_id: inspectionId });

export const fetchFindings = (
  hass: HomeAssistant,
  plantId?: number,
  status?: string
): Promise<Finding[]> =>
  hass.callWS({ type: "techdoc/finding_list", plant_id: plantId, status });

export const createFinding = (
  hass: HomeAssistant,
  plantId: number,
  description: string,
  date: string,
  priority: string
): Promise<{ id: number }> =>
  hass.callWS({ type: "techdoc/finding_create", plant_id: plantId, description, date, priority });

export const updateFindingStatus = (
  hass: HomeAssistant,
  findingId: number,
  status: string,
  resolvedAt?: string
): Promise<void> =>
  hass.callWS({
    type: "techdoc/finding_update_status",
    finding_id: findingId,
    status,
    resolved_at: resolvedAt,
  });

export const fetchSensorMappings = (hass: HomeAssistant, plantId: number): Promise<SensorMapping[]> =>
  hass.callWS({ type: "techdoc/sensor_mapping_list", plant_id: plantId });

export const upsertSensorMapping = (
  hass: HomeAssistant,
  plantId: number,
  metricKey: string,
  entityId: string,
  unit?: string
): Promise<{ id: number; aggregation: string; unit: string | null }> =>
  hass.callWS({
    type: "techdoc/sensor_mapping_upsert",
    plant_id: plantId,
    metric_key: metricKey,
    entity_id: entityId,
    unit,
  });

export const deleteSensorMapping = (hass: HomeAssistant, mappingId: number): Promise<void> =>
  hass.callWS({ type: "techdoc/sensor_mapping_delete", mapping_id: mappingId });

export const fetchPlantMetricYearly = (
  hass: HomeAssistant,
  plantId: number,
  metricKey: string
): Promise<YearlyTotalsResult> =>
  hass.callWS({ type: "techdoc/plant_metric_yearly", plant_id: plantId, metric_key: metricKey });

export const fetchAnomalies = (
  hass: HomeAssistant,
  plantId?: number,
  status?: string
): Promise<Anomaly[]> => hass.callWS({ type: "techdoc/anomaly_list", plant_id: plantId, status });

export const updateAnomalyStatus = (
  hass: HomeAssistant,
  anomalyId: number,
  status: string
): Promise<void> => hass.callWS({ type: "techdoc/anomaly_update_status", anomaly_id: anomalyId, status });

export const fetchDocuments = (hass: HomeAssistant, plantId: number): Promise<DocumentRecord[]> =>
  hass.callWS({ type: "techdoc/document_list", plant_id: plantId });

export const generateInspectionReport = (
  hass: HomeAssistant,
  inspectionId: number
): Promise<{ document_id: number }> =>
  hass.callWS({ type: "techdoc/report_generate_inspection", inspection_id: inspectionId });

export const generateAnnualReport = (
  hass: HomeAssistant,
  year: number
): Promise<{ document_id: number }> =>
  hass.callWS({ type: "techdoc/report_generate_annual", year });

export async function uploadDocument(
  hass: HomeAssistant,
  plantId: number,
  file: File,
  docType: string
): Promise<{ id: number; filename: string }> {
  const body = new FormData();
  body.append("file", file);
  body.append("type", docType || "Sonstiges");
  body.append("plant_id", String(plantId));

  const response = await fetch("/api/techdoc/documents", {
    method: "POST",
    headers: { Authorization: `Bearer ${hass.auth.data.access_token}` },
    body,
  });
  if (!response.ok) {
    throw new Error(`Upload fehlgeschlagen (${response.status})`);
  }
  return response.json();
}
