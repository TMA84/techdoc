"""Compute and cache per-plant yearly metric totals from HA statistics.

Completed past years are cached permanently in `measurement` (source
"ha_sensor") since their value can never change again; only the current,
still-in-progress year is re-queried against the recorder on every call.
This avoids re-scanning the full history on every dashboard refresh (spec
section 34: no unconditional full re-analysis).
"""
from __future__ import annotations

from datetime import datetime

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .db.engine import Database
from .ha_bridge.statistics import async_metric_total

_YEAR_END_MARKER = "-12-31"


async def async_yearly_totals(
    hass: HomeAssistant,
    database: Database,
    plant_id: int,
    metric_key: str,
    entity_id: str,
    unit: str | None,
    first_year: int,
) -> dict[int, float]:
    """Return {year: total} for first_year..current_year (inclusive)."""
    repo = database.repository
    current_year = dt_util.now().year

    cached = await database.async_run(repo.list_measurements, plant_id, metric_key)
    cached_by_year = {
        int(m.recorded_at[:4]): m.value
        for m in cached
        if m.source == "ha_sensor" and m.recorded_at.endswith(_YEAR_END_MARKER)
    }

    totals: dict[int, float] = {}
    for year in range(first_year, current_year + 1):
        if year != current_year and year in cached_by_year:
            totals[year] = cached_by_year[year]
            continue

        start = dt_util.as_utc(datetime(year, 1, 1))
        end = dt_util.as_utc(datetime(year + 1, 1, 1))
        total = await async_metric_total(hass, entity_id, start, end)
        if total is None:
            continue

        totals[year] = total
        if year != current_year:
            await database.async_run(
                repo.add_measurement,
                plant_id,
                metric_key,
                total,
                f"{year}{_YEAR_END_MARKER}",
                unit,
                None,
                "ha_sensor",
            )
    return totals
