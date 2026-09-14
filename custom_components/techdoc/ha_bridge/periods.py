"""Named period → [start, end) datetime resolution (spec section 10).

Pure datetime arithmetic, deliberately free of Home Assistant imports so it
is unit testable on its own; ha_bridge/statistics.py feeds these bounds into
the recorder's statistics API.
"""
from __future__ import annotations

from datetime import datetime, timedelta

PERIOD_KEYS = (
    "today",
    "yesterday",
    "last_7_days",
    "last_30_days",
    "current_month",
    "last_month",
    "current_year",
    "last_year",
    "since_commissioning",
)


def _next_month(moment: datetime) -> datetime:
    if moment.month == 12:
        return moment.replace(year=moment.year + 1, month=1)
    return moment.replace(month=moment.month + 1)


def _prev_month(moment: datetime) -> datetime:
    if moment.month == 1:
        return moment.replace(year=moment.year - 1, month=12)
    return moment.replace(month=moment.month - 1)


def period_bounds(
    period_key: str, now: datetime, since: datetime | None = None
) -> tuple[datetime, datetime]:
    """Return the [start, end) window for a named period, relative to `now`.

    `since` (e.g. a plant's install_date) is required for "since_commissioning".
    """
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    if period_key == "today":
        return today, today + timedelta(days=1)
    if period_key == "yesterday":
        return today - timedelta(days=1), today
    if period_key == "last_7_days":
        return today - timedelta(days=7), today + timedelta(days=1)
    if period_key == "last_30_days":
        return today - timedelta(days=30), today + timedelta(days=1)
    if period_key == "current_month":
        start = today.replace(day=1)
        return start, _next_month(start)
    if period_key == "last_month":
        current_start = today.replace(day=1)
        return _prev_month(current_start), current_start
    if period_key == "current_year":
        start = today.replace(month=1, day=1)
        return start, start.replace(year=start.year + 1)
    if period_key == "last_year":
        start = today.replace(month=1, day=1, year=today.year - 1)
        return start, start.replace(year=start.year + 1)
    if period_key == "since_commissioning":
        if since is None:
            raise ValueError("period 'since_commissioning' requires an install date")
        return since, today + timedelta(days=1)

    raise ValueError(f"Unbekannter Zeitraum: {period_key!r} (bekannt: {PERIOD_KEYS})")
