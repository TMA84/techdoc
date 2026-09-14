"""Severity classification and confidence scoring (spec sections 17, 40).

Confidence must be derived from concrete, inspectable inputs — how many
reference periods back the comparison and how tight their spread is —
never invented or hardcoded per case.
"""
from __future__ import annotations

from enum import Enum


class Severity(str, Enum):
    INFO = "info"
    NIEDRIG = "niedrig"
    MITTEL = "mittel"
    HOCH = "hoch"
    KRITISCH = "kritisch"


MIN_REFERENCE_PERIODS = 3
_SAMPLE_SIZE_SATURATION = 7  # periods at/above this no longer add confidence


def confidence_from_reference(n_reference_periods: int, relative_spread: float | None) -> float:
    """0..1 confidence from sample size and relative spread (MAD/median).

    Fewer than MIN_REFERENCE_PERIODS periods of history → 0 (insufficient
    data; callers should surface this as "⚪ keine ausreichende Datenbasis"
    rather than an anomaly verdict).
    """
    if n_reference_periods < MIN_REFERENCE_PERIODS:
        return 0.0

    sample_confidence = min(
        1.0, (n_reference_periods - MIN_REFERENCE_PERIODS + 1) / _SAMPLE_SIZE_SATURATION
    )
    spread_confidence = 0.5 if relative_spread is None else max(0.0, 1.0 - min(relative_spread, 1.0))

    return round(sample_confidence * 0.5 + spread_confidence * 0.5, 2)


def severity_from_deviation(abs_relative_deviation: float, confidence: float) -> Severity:
    """Map |relative deviation| to a severity, capped by low confidence."""
    if confidence <= 0:
        return Severity.INFO

    if abs_relative_deviation < 0.10:
        base = Severity.INFO
    elif abs_relative_deviation < 0.20:
        base = Severity.NIEDRIG
    elif abs_relative_deviation < 0.30:
        base = Severity.MITTEL
    elif abs_relative_deviation < 0.45:
        base = Severity.HOCH
    else:
        base = Severity.KRITISCH

    if confidence < 0.5 and base in (Severity.HOCH, Severity.KRITISCH):
        return Severity.MITTEL
    return base
