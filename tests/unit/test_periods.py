from datetime import datetime

import pytest

from tests._pkg_loader import import_module

periods_module = import_module("ha_bridge.periods")
period_bounds = periods_module.period_bounds

_NOW = datetime(2026, 3, 15, 14, 30)


def test_today():
    assert period_bounds("today", _NOW) == (datetime(2026, 3, 15), datetime(2026, 3, 16))


def test_yesterday():
    assert period_bounds("yesterday", _NOW) == (datetime(2026, 3, 14), datetime(2026, 3, 15))


def test_last_7_days():
    start, end = period_bounds("last_7_days", _NOW)
    assert start == datetime(2026, 3, 8)
    assert end == datetime(2026, 3, 16)


def test_current_month():
    assert period_bounds("current_month", _NOW) == (datetime(2026, 3, 1), datetime(2026, 4, 1))


def test_last_month():
    assert period_bounds("last_month", _NOW) == (datetime(2026, 2, 1), datetime(2026, 3, 1))


def test_last_month_across_year_boundary():
    jan = datetime(2026, 1, 15)
    assert period_bounds("last_month", jan) == (datetime(2025, 12, 1), datetime(2026, 1, 1))


def test_current_year():
    assert period_bounds("current_year", _NOW) == (datetime(2026, 1, 1), datetime(2027, 1, 1))


def test_last_year():
    assert period_bounds("last_year", _NOW) == (datetime(2025, 1, 1), datetime(2026, 1, 1))


def test_since_commissioning_requires_since():
    with pytest.raises(ValueError):
        period_bounds("since_commissioning", _NOW)


def test_since_commissioning():
    install_date = datetime(2023, 6, 1)
    start, end = period_bounds("since_commissioning", _NOW, since=install_date)
    assert start == install_date
    assert end == datetime(2026, 3, 16)


def test_unknown_period_raises():
    with pytest.raises(ValueError):
        period_bounds("does_not_exist", _NOW)
