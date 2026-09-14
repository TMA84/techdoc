"""Robust statistics helpers (spec section 15).

Median, MAD, modified z-score, IQR bounds — pure math, no Home Assistant or
database dependency, so the anomaly/plausibility logic built on top of this
is fully unit testable.
"""
from __future__ import annotations

import statistics


def median(values: list[float]) -> float:
    return statistics.median(values)


def mad(values: list[float]) -> float:
    """Median absolute deviation (unscaled)."""
    center = median(values)
    return statistics.median([abs(v - center) for v in values])


def modified_z_score(value: float, reference: list[float]) -> float | None:
    """Iglewicz & Hoaglin's modified z-score.

    Returns None if there is no reference data or the reference has zero
    spread (MAD == 0), since a z-score is not meaningful in that case.
    """
    if not reference:
        return None
    mad_value = mad(reference)
    if mad_value == 0:
        return None
    return 0.6745 * (value - median(reference)) / mad_value


def iqr_bounds(values: list[float], k: float = 1.5) -> tuple[float, float]:
    """Tukey's IQR fence. Returns (-inf, inf) if there isn't enough data for
    a meaningful quartile split (fewer than 4 points)."""
    if len(values) < 4:
        return float("-inf"), float("inf")

    sorted_values = sorted(values)
    midpoint = len(sorted_values) // 2
    lower_half = sorted_values[:midpoint]
    upper_half = sorted_values[-midpoint:]
    q1 = statistics.median(lower_half)
    q3 = statistics.median(upper_half)
    iqr = q3 - q1
    return q1 - k * iqr, q3 + k * iqr


def mean_stddev(values: list[float]) -> tuple[float, float]:
    mean = statistics.mean(values)
    stddev = statistics.pstdev(values) if len(values) > 1 else 0.0
    return mean, stddev


def relative_deviation(value: float, reference: float) -> float | None:
    if not reference:
        return None
    return (value - reference) / reference
