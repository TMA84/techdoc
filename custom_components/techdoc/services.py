"""Services exposed by the integration."""
from __future__ import annotations

from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .reports import async_generate_annual_report, async_generate_inspection_report

SERVICE_RUN_ANALYSIS = "run_analysis"
SERVICE_START = "start"
SERVICE_COMPLETE = "complete"
SERVICE_ADD_FINDING = "add_finding"
SERVICE_CLOSE_FINDING = "close_finding"
SERVICE_GENERATE_REPORT = "generate_report"


def _today_iso() -> str:
    return dt_util.now().date().isoformat()


def _get_runtime_data(hass: HomeAssistant):
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        raise HomeAssistantError("TechDoc ist nicht eingerichtet")
    return entries[0].runtime_data


def async_register_services(hass: HomeAssistant) -> None:
    async def _async_run_analysis(call: ServiceCall) -> None:
        for entry in hass.config_entries.async_entries(DOMAIN):
            await entry.runtime_data.coordinator.async_request_refresh()

    async def _async_start(call: ServiceCall) -> ServiceResponse:
        runtime = _get_runtime_data(hass)
        database = runtime.database
        inspection_id = await database.async_run(
            database.repository.create_inspection,
            call.data["plant_id"],
            call.data.get("date", _today_iso()),
            type=call.data.get("type", "sonstige"),
            inspector=call.data.get("inspector"),
            checklist_template_id=call.data.get("checklist_template_id"),
        )
        await runtime.coordinator.async_request_refresh()
        return {"inspection_id": inspection_id}

    async def _async_complete(call: ServiceCall) -> None:
        runtime = _get_runtime_data(hass)
        database = runtime.database
        await database.async_run(
            database.repository.complete_inspection,
            call.data["inspection_id"],
            next_due_date=call.data.get("next_due_date"),
        )
        await runtime.coordinator.async_request_refresh()

    async def _async_add_finding(call: ServiceCall) -> ServiceResponse:
        runtime = _get_runtime_data(hass)
        database = runtime.database
        finding_id = await database.async_run(
            database.repository.create_finding,
            call.data["plant_id"],
            call.data["description"],
            call.data.get("date", _today_iso()),
            category=call.data.get("category"),
            priority=call.data.get("priority", "mittel"),
            responsible=call.data.get("responsible"),
            due_date=call.data.get("due_date"),
            inspection_id=call.data.get("inspection_id"),
        )
        await runtime.coordinator.async_request_refresh()
        return {"finding_id": finding_id}

    async def _async_close_finding(call: ServiceCall) -> None:
        runtime = _get_runtime_data(hass)
        database = runtime.database
        await database.async_run(
            database.repository.update_finding_status,
            call.data["finding_id"],
            "erledigt",
            resolved_at=_today_iso(),
            comment=call.data.get("comment"),
        )
        await runtime.coordinator.async_request_refresh()

    async def _async_generate_report(call: ServiceCall) -> ServiceResponse:
        runtime = _get_runtime_data(hass)
        if "inspection_id" in call.data:
            document_id = await async_generate_inspection_report(
                hass, runtime.database, runtime.document_storage, call.data["inspection_id"]
            )
        elif "year" in call.data:
            document_id = await async_generate_annual_report(
                hass, runtime.database, runtime.document_storage, call.data["year"]
            )
        else:
            raise HomeAssistantError("Entweder 'inspection_id' oder 'year' muss angegeben werden")
        return {"document_id": document_id}

    hass.services.async_register(DOMAIN, SERVICE_RUN_ANALYSIS, _async_run_analysis)
    hass.services.async_register(
        DOMAIN, SERVICE_START, _async_start, supports_response=SupportsResponse.OPTIONAL
    )
    hass.services.async_register(DOMAIN, SERVICE_COMPLETE, _async_complete)
    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_FINDING,
        _async_add_finding,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(DOMAIN, SERVICE_CLOSE_FINDING, _async_close_finding)
    hass.services.async_register(
        DOMAIN,
        SERVICE_GENERATE_REPORT,
        _async_generate_report,
        supports_response=SupportsResponse.OPTIONAL,
    )
