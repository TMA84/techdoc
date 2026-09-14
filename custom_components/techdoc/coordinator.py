"""Coordinator that periodically recomputes the dashboard counters.

From Phase 4 onward this also triggers the analysis/anomaly engines; for
now it aggregates the counters shown by the global sensors and maintains a
single persistent notification listing plants whose inspection is due or
due soon (Fristenüberwachung/Erinnerungen, spec sections 24/25).
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import timedelta

from homeassistant.components import persistent_notification
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .analysis_runner import async_analyze_all_plants
from .const import DEFAULT_ANALYSIS_INTERVAL_MINUTES, DOMAIN
from .db.engine import Database
from .db.repository import add_days

_LOGGER = logging.getLogger(__name__)

_REMINDER_HORIZON_DAYS = 30
_REMINDER_NOTIFICATION_ID = f"{DOMAIN}_faellige_pruefungen"


@dataclass(slots=True)
class TechDocData:
    plants_total: int
    findings_open: int
    inspections_due: int
    anomalies_open: int


class TechDocCoordinator(DataUpdateCoordinator[TechDocData]):
    def __init__(self, hass: HomeAssistant, database: Database) -> None:
        super().__init__(
            hass,
            logger=_LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=DEFAULT_ANALYSIS_INTERVAL_MINUTES),
        )
        self._database = database

    async def _async_update_data(self) -> TechDocData:
        repo = self._database.repository
        today_iso = dt_util.now().date().isoformat()

        await async_analyze_all_plants(self.hass, self._database)

        plants_total = await self._database.async_run(repo.count_plants)
        findings_open = await self._database.async_run(repo.count_findings_open)
        inspections_due = await self._database.async_run(repo.count_inspections_due, today_iso)
        anomalies_open = await self._database.async_run(repo.count_anomalies_open)

        await self._async_update_due_reminder(today_iso)

        return TechDocData(
            plants_total=plants_total,
            findings_open=findings_open,
            inspections_due=inspections_due,
            anomalies_open=anomalies_open,
        )

    async def _async_update_due_reminder(self, today_iso: str) -> None:
        repo = self._database.repository
        horizon_iso = add_days(today_iso, _REMINDER_HORIZON_DAYS)
        plants_due = await self._database.async_run(repo.list_plants_due, horizon_iso)

        if not plants_due:
            persistent_notification.async_dismiss(self.hass, _REMINDER_NOTIFICATION_ID)
            return

        lines = [
            f"- **{plant.name}**: {plant.next_inspection}"
            + (" (überfällig)" if plant.next_inspection and plant.next_inspection < today_iso else "")
            for plant in plants_due
        ]
        persistent_notification.async_create(
            self.hass,
            message="Folgende Anlagen benötigen in Kürze eine Prüfung:\n" + "\n".join(lines),
            title="TechDoc: Prüfungen fällig",
            notification_id=_REMINDER_NOTIFICATION_ID,
        )
