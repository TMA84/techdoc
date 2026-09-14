"""Global dashboard counter sensors.

Per-plant sensors (status, next inspection, ...) are added in Phase 2 once
inspections exist to report on.
"""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import TechDocCoordinator, TechDocData


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: TechDocCoordinator = entry.runtime_data.coordinator
    async_add_entities(
        [
            TechDocCounterSensor(
                coordinator, entry.entry_id, "plants_total", "Anlagen", "mdi:home-city-outline"
            ),
            TechDocCounterSensor(
                coordinator,
                entry.entry_id,
                "findings_open",
                "Offene Mängel",
                "mdi:alert-circle-outline",
            ),
            TechDocCounterSensor(
                coordinator,
                entry.entry_id,
                "inspections_due",
                "Prüfungen fällig",
                "mdi:calendar-alert",
            ),
            TechDocCounterSensor(
                coordinator,
                entry.entry_id,
                "anomalies_open",
                "Anomalien",
                "mdi:chart-bell-curve-cumulative",
            ),
        ]
    )


class TechDocCounterSensor(CoordinatorEntity[TechDocCoordinator], SensorEntity):
    """Simple counter sensor backed by a TechDocData attribute."""

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_native_unit_of_measurement = None

    def __init__(
        self,
        coordinator: TechDocCoordinator,
        entry_id: str,
        data_key: str,
        name: str,
        icon: str,
    ) -> None:
        super().__init__(coordinator)
        self._data_key = data_key
        self._attr_unique_id = f"{entry_id}_{data_key}"
        self._attr_name = name
        self._attr_icon = icon

    @property
    def native_value(self) -> int | None:
        data: TechDocData | None = self.coordinator.data
        if data is None:
            return None
        return getattr(data, self._data_key)
