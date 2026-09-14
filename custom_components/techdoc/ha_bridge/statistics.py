"""Read-only bridge to the recorder's long-term statistics.

We never duplicate raw history into our own database (spec section 10) —
only per-period totals/averages are read here, and only completed periods
get cached as `measurement` rows by metrics.py.
"""
from __future__ import annotations

from datetime import datetime

from homeassistant.components.recorder.statistics import (
    list_statistic_ids,
    statistics_during_period,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.recorder import get_instance


async def async_available_statistic_ids(hass: HomeAssistant) -> list[str]:
    """Entity/statistic ids that have long-term statistics recorded."""
    rows = await get_instance(hass).async_add_executor_job(list_statistic_ids, hass)
    return sorted(row["statistic_id"] for row in rows)


async def async_metric_total(
    hass: HomeAssistant,
    entity_id: str,
    start: datetime,
    end: datetime,
) -> float | None:
    """Sum of a cumulative ("sum"-class) statistic's change over [start, end).

    Used for yield/consumption-style metrics (PV-Jahresertrag, Wallbox
    Ladeenergie, ...). Uses the recorder's own "change" statistic, which
    already accounts for meter resets, instead of naively diffing raw sums.
    """
    result = await get_instance(hass).async_add_executor_job(
        statistics_during_period, hass, start, end, {entity_id}, "month", None, {"change"}
    )
    rows = result.get(entity_id)
    if not rows:
        return None
    changes = [row["change"] for row in rows if row.get("change") is not None]
    return sum(changes) if changes else None


async def async_metric_mean(
    hass: HomeAssistant,
    entity_id: str,
    start: datetime,
    end: datetime,
) -> float | None:
    """Mean of a "mean"-class statistic over [start, end).

    Used for state-style metrics (COP, Vorlauftemperatur, ...).
    """
    result = await get_instance(hass).async_add_executor_job(
        statistics_during_period, hass, start, end, {entity_id}, "month", None, {"mean"}
    )
    rows = result.get(entity_id)
    if not rows:
        return None
    means = [row["mean"] for row in rows if row.get("mean") is not None]
    return sum(means) / len(means) if means else None
