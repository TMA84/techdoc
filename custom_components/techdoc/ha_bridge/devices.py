"""Device/entity discovery for the sensor-mapping UI.

Lets the panel offer "pick your device, then pick which of its sensors is
the yield/COP/whatever" instead of requiring the user to know and type an
exact entity_id from memory.
"""
from __future__ import annotations

from dataclasses import dataclass

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er


@dataclass(slots=True)
class DeviceSummary:
    id: str
    name: str


@dataclass(slots=True)
class DeviceEntitySummary:
    entity_id: str
    name: str
    device_class: str | None
    state_class: str | None
    unit: str | None


def list_devices(hass: HomeAssistant) -> list[DeviceSummary]:
    """All devices that have at least one entity with recorder statistics.

    Devices without any statistics-eligible entity would be a dead end in
    the mapping UI, so they are filtered out up front.
    """
    device_registry = dr.async_get(hass)
    entity_registry = er.async_get(hass)

    devices = []
    for device in device_registry.devices:
        entities = er.async_entries_for_device(entity_registry, device.id)
        if any(_state_class(hass, entry.entity_id) is not None for entry in entities):
            devices.append(
                DeviceSummary(id=device.id, name=device.name_by_user or device.name or device.id)
            )
    devices.sort(key=lambda d: d.name.lower())
    return devices


def list_device_entities(hass: HomeAssistant, device_id: str) -> list[DeviceEntitySummary]:
    """Statistics-eligible entities (i.e. those with a `state_class`) for a device."""
    entity_registry = er.async_get(hass)
    summaries = []
    for entry in er.async_entries_for_device(entity_registry, device_id):
        state = hass.states.get(entry.entity_id)
        if state is None or state.attributes.get("state_class") is None:
            continue
        summaries.append(
            DeviceEntitySummary(
                entity_id=entry.entity_id,
                name=entry.name or state.attributes.get("friendly_name") or entry.entity_id,
                device_class=state.attributes.get("device_class"),
                state_class=state.attributes.get("state_class"),
                unit=state.attributes.get("unit_of_measurement"),
            )
        )
    summaries.sort(key=lambda e: e.name.lower())
    return summaries


def _state_class(hass: HomeAssistant, entity_id: str) -> str | None:
    state = hass.states.get(entity_id)
    return state.attributes.get("state_class") if state else None
