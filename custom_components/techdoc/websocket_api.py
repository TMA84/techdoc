"""WebSocket commands backing the sidebar panel's CRUD operations.

Registered once at hass-level (async_setup). Because manifest.json declares
single_config_entry, there is always at most one config entry to resolve.
"""
from __future__ import annotations

import dataclasses

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import DOMAIN, PLANT_TYPE_METRICS
from .db.engine import Database
from .metrics import async_yearly_totals
from .reports import async_generate_annual_report, async_generate_inspection_report


def _get_database(hass: HomeAssistant) -> Database:
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    return entry.runtime_data.database


def _get_runtime_data(hass: HomeAssistant):
    return hass.config_entries.async_entries(DOMAIN)[0].runtime_data


def _as_dicts(objects) -> list[dict]:
    return [dataclasses.asdict(obj) for obj in objects]


async def _async_request_refresh(hass: HomeAssistant) -> None:
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    await entry.runtime_data.coordinator.async_request_refresh()


# -- plant types & plants ------------------------------------------------


@websocket_api.websocket_command({vol.Required("type"): "techdoc/plant_type_list"})
@websocket_api.async_response
async def ws_plant_type_list(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    plant_types = await database.async_run(database.repository.list_plant_types)
    connection.send_result(msg["id"], _as_dicts(plant_types))


@websocket_api.websocket_command({vol.Required("type"): "techdoc/plant_list"})
@websocket_api.async_response
async def ws_plant_list(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    plants = await database.async_run(database.repository.list_plants)
    connection.send_result(msg["id"], _as_dicts(plants))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/plant_create",
        vol.Required("name"): str,
        vol.Required("plant_type_id"): int,
        vol.Optional("manufacturer"): str,
        vol.Optional("model"): str,
        vol.Optional("location"): str,
        vol.Optional("inspection_interval_months"): int,
    }
)
@websocket_api.async_response
async def ws_plant_create(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    repo = database.repository
    building_id = await database.async_run(repo.get_or_create_default_building)
    extra_fields = {
        key: msg[key]
        for key in ("manufacturer", "model", "location", "inspection_interval_months")
        if key in msg
    }
    plant_id = await database.async_run(
        repo.create_plant, building_id, msg["plant_type_id"], msg["name"], **extra_fields
    )
    await _async_request_refresh(hass)
    connection.send_result(msg["id"], {"id": plant_id})


# -- sensor mappings & HA statistics ----------------------------------------


@websocket_api.websocket_command({vol.Required("type"): "techdoc/metric_catalogue"})
@websocket_api.async_response
async def ws_metric_catalogue(hass: HomeAssistant, connection, msg) -> None:
    connection.send_result(msg["id"], PLANT_TYPE_METRICS)


@websocket_api.websocket_command(
    {vol.Required("type"): "techdoc/sensor_mapping_list", vol.Required("plant_id"): int}
)
@websocket_api.async_response
async def ws_sensor_mapping_list(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    mappings = await database.async_run(database.repository.list_sensor_mappings, msg["plant_id"])
    connection.send_result(msg["id"], _as_dicts(mappings))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/sensor_mapping_upsert",
        vol.Required("plant_id"): int,
        vol.Required("metric_key"): str,
        vol.Required("entity_id"): str,
        vol.Optional("unit"): str,
        vol.Optional("aggregation"): str,
    }
)
@websocket_api.async_response
async def ws_sensor_mapping_upsert(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    extra_fields = {key: msg[key] for key in ("unit", "aggregation") if key in msg}
    mapping_id = await database.async_run(
        database.repository.upsert_sensor_mapping,
        msg["plant_id"],
        msg["metric_key"],
        msg["entity_id"],
        **extra_fields,
    )
    connection.send_result(msg["id"], {"id": mapping_id})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/sensor_mapping_delete",
        vol.Required("mapping_id"): int,
    }
)
@websocket_api.async_response
async def ws_sensor_mapping_delete(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    await database.async_run(database.repository.delete_sensor_mapping, msg["mapping_id"])
    connection.send_result(msg["id"], {})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/plant_metric_yearly",
        vol.Required("plant_id"): int,
        vol.Required("metric_key"): str,
        vol.Optional("first_year"): int,
    }
)
@websocket_api.async_response
async def ws_plant_metric_yearly(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    repo = database.repository
    mappings = await database.async_run(repo.list_sensor_mappings, msg["plant_id"])
    mapping = next((m for m in mappings if m.metric_key == msg["metric_key"]), None)
    if mapping is None:
        connection.send_error(msg["id"], "no_mapping", "Kein Sensor für diese Kennzahl zugeordnet")
        return

    plant = await database.async_run(repo.get_plant, msg["plant_id"])
    first_year = msg.get("first_year") or (
        plant.year_built if plant and plant.year_built else dt_util.now().year
    )

    totals = await async_yearly_totals(
        hass,
        database,
        msg["plant_id"],
        msg["metric_key"],
        mapping.entity_id,
        mapping.unit,
        first_year,
    )
    connection.send_result(msg["id"], {"totals": totals, "unit": mapping.unit})


# -- anomalies ---------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/anomaly_list",
        vol.Optional("plant_id"): int,
        vol.Optional("status"): str,
    }
)
@websocket_api.async_response
async def ws_anomaly_list(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    anomalies = await database.async_run(
        database.repository.list_anomalies, msg.get("plant_id"), msg.get("status")
    )
    connection.send_result(msg["id"], _as_dicts(anomalies))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/anomaly_update_status",
        vol.Required("anomaly_id"): int,
        vol.Required("status"): str,
    }
)
@websocket_api.async_response
async def ws_anomaly_update_status(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    await database.async_run(
        database.repository.update_anomaly_status, msg["anomaly_id"], msg["status"]
    )
    connection.send_result(msg["id"], {})


# -- reports ------------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/report_generate_inspection",
        vol.Required("inspection_id"): int,
    }
)
@websocket_api.async_response
async def ws_report_generate_inspection(hass: HomeAssistant, connection, msg) -> None:
    runtime = _get_runtime_data(hass)
    document_id = await async_generate_inspection_report(
        hass, runtime.database, runtime.document_storage, msg["inspection_id"]
    )
    connection.send_result(msg["id"], {"document_id": document_id})


@websocket_api.websocket_command(
    {vol.Required("type"): "techdoc/report_generate_annual", vol.Required("year"): int}
)
@websocket_api.async_response
async def ws_report_generate_annual(hass: HomeAssistant, connection, msg) -> None:
    runtime = _get_runtime_data(hass)
    document_id = await async_generate_annual_report(
        hass, runtime.database, runtime.document_storage, msg["year"]
    )
    connection.send_result(msg["id"], {"document_id": document_id})


# -- checklist templates ---------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/checklist_template_list",
        vol.Optional("plant_type_id"): int,
    }
)
@websocket_api.async_response
async def ws_checklist_template_list(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    templates = await database.async_run(
        database.repository.list_checklist_templates, msg.get("plant_type_id")
    )
    connection.send_result(msg["id"], _as_dicts(templates))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/checklist_template_create",
        vol.Required("plant_type_id"): int,
        vol.Required("name"): str,
    }
)
@websocket_api.async_response
async def ws_checklist_template_create(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    template_id = await database.async_run(
        database.repository.create_checklist_template, msg["plant_type_id"], msg["name"]
    )
    connection.send_result(msg["id"], {"id": template_id})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/checklist_item_template_list",
        vol.Required("checklist_template_id"): int,
    }
)
@websocket_api.async_response
async def ws_checklist_item_template_list(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    items = await database.async_run(
        database.repository.list_checklist_item_templates, msg["checklist_template_id"]
    )
    connection.send_result(msg["id"], _as_dicts(items))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/checklist_item_template_add",
        vol.Required("checklist_template_id"): int,
        vol.Required("text"): str,
        vol.Optional("sort_order"): int,
        vol.Optional("requires_measurement"): bool,
        vol.Optional("unit"): str,
    }
)
@websocket_api.async_response
async def ws_checklist_item_template_add(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    extra_fields = {
        key: msg[key]
        for key in ("sort_order", "requires_measurement", "unit")
        if key in msg
    }
    item_id = await database.async_run(
        database.repository.add_checklist_item_template,
        msg["checklist_template_id"],
        msg["text"],
        **extra_fields,
    )
    connection.send_result(msg["id"], {"id": item_id})


# -- inspections -----------------------------------------------------------


@websocket_api.websocket_command(
    {vol.Required("type"): "techdoc/inspection_list", vol.Required("plant_id"): int}
)
@websocket_api.async_response
async def ws_inspection_list(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    inspections = await database.async_run(database.repository.list_inspections, msg["plant_id"])
    connection.send_result(msg["id"], _as_dicts(inspections))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/inspection_get",
        vol.Required("inspection_id"): int,
    }
)
@websocket_api.async_response
async def ws_inspection_get(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    repo = database.repository
    inspection = await database.async_run(repo.get_inspection, msg["inspection_id"])
    if inspection is None:
        connection.send_error(msg["id"], "not_found", "Prüfung nicht gefunden")
        return
    items = await database.async_run(repo.list_inspection_items, msg["inspection_id"])
    connection.send_result(
        msg["id"], {"inspection": dataclasses.asdict(inspection), "items": _as_dicts(items)}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/inspection_create",
        vol.Required("plant_id"): int,
        vol.Required("date"): str,
        # Named "inspection_type" on the wire (not "type") because a
        # websocket message can only have one "type" key — that key is
        # already the command discriminator required by websocket_api.
        vol.Optional("inspection_type"): str,
        vol.Optional("inspector"): str,
        vol.Optional("checklist_template_id"): int,
    }
)
@websocket_api.async_response
async def ws_inspection_create(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    extra_fields = {}
    if "inspection_type" in msg:
        extra_fields["type"] = msg["inspection_type"]
    for key in ("inspector", "checklist_template_id"):
        if key in msg:
            extra_fields[key] = msg[key]
    inspection_id = await database.async_run(
        database.repository.create_inspection, msg["plant_id"], msg["date"], **extra_fields
    )
    await _async_request_refresh(hass)
    connection.send_result(msg["id"], {"id": inspection_id})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/inspection_item_update",
        vol.Required("item_id"): int,
        vol.Required("state"): str,
        vol.Optional("comment"): str,
    }
)
@websocket_api.async_response
async def ws_inspection_item_update(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    await database.async_run(
        database.repository.update_inspection_item,
        msg["item_id"],
        msg["state"],
        msg.get("comment"),
    )
    connection.send_result(msg["id"], {})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/inspection_complete",
        vol.Required("inspection_id"): int,
        vol.Optional("next_due_date"): str,
    }
)
@websocket_api.async_response
async def ws_inspection_complete(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    await database.async_run(
        database.repository.complete_inspection,
        msg["inspection_id"],
        msg.get("next_due_date"),
    )
    await _async_request_refresh(hass)
    connection.send_result(msg["id"], {})


# -- findings ----------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/finding_list",
        vol.Optional("plant_id"): int,
        vol.Optional("status"): str,
    }
)
@websocket_api.async_response
async def ws_finding_list(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    findings = await database.async_run(
        database.repository.list_findings, msg.get("plant_id"), msg.get("status")
    )
    connection.send_result(msg["id"], _as_dicts(findings))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/finding_create",
        vol.Required("plant_id"): int,
        vol.Required("description"): str,
        vol.Required("date"): str,
        vol.Optional("category"): str,
        vol.Optional("priority"): str,
        vol.Optional("responsible"): str,
        vol.Optional("due_date"): str,
        vol.Optional("inspection_id"): int,
    }
)
@websocket_api.async_response
async def ws_finding_create(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    extra_fields = {
        key: msg[key]
        for key in ("category", "priority", "responsible", "due_date", "inspection_id")
        if key in msg
    }
    finding_id = await database.async_run(
        database.repository.create_finding,
        msg["plant_id"],
        msg["description"],
        msg["date"],
        **extra_fields,
    )
    await _async_request_refresh(hass)
    connection.send_result(msg["id"], {"id": finding_id})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/finding_update_status",
        vol.Required("finding_id"): int,
        vol.Required("status"): str,
        vol.Optional("resolved_at"): str,
        vol.Optional("comment"): str,
    }
)
@websocket_api.async_response
async def ws_finding_update_status(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    await database.async_run(
        database.repository.update_finding_status,
        msg["finding_id"],
        msg["status"],
        msg.get("resolved_at"),
        msg.get("comment"),
    )
    await _async_request_refresh(hass)
    connection.send_result(msg["id"], {})


# -- documents ---------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): "techdoc/document_list",
        vol.Optional("plant_id"): int,
        vol.Optional("inspection_id"): int,
        vol.Optional("finding_id"): int,
    }
)
@websocket_api.async_response
async def ws_document_list(hass: HomeAssistant, connection, msg) -> None:
    database = _get_database(hass)
    documents = await database.async_run(
        database.repository.list_documents,
        msg.get("plant_id"),
        msg.get("inspection_id"),
        msg.get("finding_id"),
    )
    connection.send_result(msg["id"], _as_dicts(documents))


def async_register_websocket_commands(hass: HomeAssistant) -> None:
    for handler in (
        ws_plant_type_list,
        ws_plant_list,
        ws_plant_create,
        ws_metric_catalogue,
        ws_sensor_mapping_list,
        ws_sensor_mapping_upsert,
        ws_sensor_mapping_delete,
        ws_plant_metric_yearly,
        ws_anomaly_list,
        ws_anomaly_update_status,
        ws_report_generate_inspection,
        ws_report_generate_annual,
        ws_checklist_template_list,
        ws_checklist_template_create,
        ws_checklist_item_template_list,
        ws_checklist_item_template_add,
        ws_inspection_list,
        ws_inspection_get,
        ws_inspection_create,
        ws_inspection_item_update,
        ws_inspection_complete,
        ws_finding_list,
        ws_finding_create,
        ws_finding_update_status,
        ws_document_list,
    ):
        websocket_api.async_register_command(hass, handler)
