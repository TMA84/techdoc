import pytest

from tests._pkg_loader import import_module

stats = import_module("analysis.stats")


def test_median_and_mad():
    values = [8420, 8910, 8950, 8720]
    assert stats.median(values) == pytest.approx(8815.0)
    assert stats.mad(values) >= 0


def test_modified_z_score_flags_outlier():
    reference = [8420, 8910, 8950, 8720, 8830, 8900]
    z_normal = stats.modified_z_score(8850, reference)
    z_outlier = stats.modified_z_score(3000, reference)
    assert abs(z_normal) < 3.5
    assert abs(z_outlier) > 3.5


def test_modified_z_score_none_for_empty_or_zero_spread():
    assert stats.modified_z_score(10, []) is None
    assert stats.modified_z_score(10, [5, 5, 5, 5]) is None


def test_iqr_bounds_insufficient_data_returns_infinite():
    assert stats.iqr_bounds([1, 2, 3]) == (float("-inf"), float("inf"))


def test_iqr_bounds_flags_outlier():
    values = [10, 11, 12, 11, 10, 12, 50]
    lower, upper = stats.iqr_bounds(values)
    assert 50 > upper
    assert 11 > lower and 11 < upper


def test_mean_stddev_single_value():
    mean, stddev = stats.mean_stddev([5.0])
    assert mean == 5.0
    assert stddev == 0.0


def test_relative_deviation():
    assert stats.relative_deviation(80, 100) == pytest.approx(-0.2)
    assert stats.relative_deviation(10, 0) is None
