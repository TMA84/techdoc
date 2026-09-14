"""Anomaly detection over a plant's per-period metric history (spec 14-18, 39-40).

Compares a current period's value against a seasonally-matched reference set
(e.g. "all previous years" for an annual PV total, or "all previous Junes"
for a monthly one) using robust statistics, and classifies the result with a
severity + confidence + a static catalogue of *possible* (never asserted)
causes. Avoiding false positives (spec section 47) is the primary design
goal: below MIN_REFERENCE_PERIODS of history, this always reports "no
anomaly, insufficient data" rather than guessing.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from ..analysis.severity import (
    MIN_REFERENCE_PERIODS,
    Severity,
    confidence_from_reference,
    severity_from_deviation,
)
from ..analysis.stats import mad, median, modified_z_score

_Z_SCORE_THRESHOLD = 3.5  # Iglewicz & Hoaglin's recommended cutoff for the modified z-score

POSSIBLE_CAUSES: dict[str, list[str]] = {
    "pv_yield_kwh": [
        "Verschattung",
        "Verschmutzung der Module",
        "technische Störung",
        "Wechselrichterproblem",
        "außergewöhnliche Wetterbedingungen",
    ],
    "solar_thermal_yield_kwh": [
        "Verschattung oder Verschmutzung der Kollektoren",
        "Regelungsproblem",
        "außergewöhnliche Wetterbedingungen",
    ],
    "heatpump_cop": [
        "verschmutzter Wärmetauscher",
        "falsche Betriebsparameter",
        "Kältemittelproblem",
        "Sensorfehler",
        "ungünstige Betriebsbedingungen",
    ],
    "wallbox_energy_kwh": [
        "geänderte Nutzungsgewohnheiten",
        "abgebrochener Ladevorgang",
        "Fahrzeugwechsel",
        "technische Störung der Wallbox",
    ],
}
_DEFAULT_CAUSES = [
    "ungewöhnliche Betriebsbedingungen",
    "Sensor- oder Messfehler",
    "technische Störung",
]


@dataclass(slots=True)
class AnomalyResult:
    metric_key: str
    is_anomaly: bool
    severity: Severity
    confidence: float
    relative_deviation: float | None
    current_value: float
    reference_median: float | None
    description: str
    possible_causes: list[str] = field(default_factory=list)


def detect_anomaly(
    metric_key: str, current_value: float, reference_values: list[float]
) -> AnomalyResult:
    n = len(reference_values)

    if n < MIN_REFERENCE_PERIODS:
        return AnomalyResult(
            metric_key=metric_key,
            is_anomaly=False,
            severity=Severity.INFO,
            confidence=0.0,
            relative_deviation=None,
            current_value=current_value,
            reference_median=None,
            description="Keine ausreichende Datenbasis für eine belastbare Analyse.",
        )

    ref_median = median(reference_values)
    ref_mad = mad(reference_values)
    relative_spread = (ref_mad / ref_median) if ref_median else None
    z = modified_z_score(current_value, reference_values)
    relative_deviation = (current_value - ref_median) / ref_median if ref_median else None

    confidence = confidence_from_reference(n, relative_spread)
    if z is not None:
        is_anomaly = abs(z) >= _Z_SCORE_THRESHOLD
    else:
        # A z-score of None means zero spread in the reference (ref_mad == 0).
        # A perfectly constant history that is suddenly different is itself
        # the clearest possible anomaly signal, so treat any deviation from
        # it as anomalous rather than silently skipping the check.
        is_anomaly = ref_mad == 0 and current_value != ref_median

    if not is_anomaly or relative_deviation is None:
        severity = Severity.INFO
    else:
        severity = severity_from_deviation(abs(relative_deviation), confidence)

    return AnomalyResult(
        metric_key=metric_key,
        is_anomaly=is_anomaly,
        severity=severity,
        confidence=confidence,
        relative_deviation=relative_deviation,
        current_value=current_value,
        reference_median=ref_median,
        description=_describe(metric_key, current_value, ref_median, relative_deviation),
        possible_causes=POSSIBLE_CAUSES.get(metric_key, _DEFAULT_CAUSES) if is_anomaly else [],
    )


def _describe(
    metric_key: str, current_value: float, ref_median: float | None, relative_deviation: float | None
) -> str:
    if relative_deviation is None or ref_median is None:
        return "Keine ausreichende Datenbasis für eine belastbare Analyse."
    direction = "unter" if relative_deviation < 0 else "über"
    return (
        f"{metric_key}: aktueller Wert {current_value:.1f} liegt "
        f"{abs(relative_deviation) * 100:.0f} % {direction} dem historischen Mittel ({ref_median:.1f})."
    )
