"""Configurable plausibility rules (spec sections 12-13, 38).

Rules are rows in the `plausibility_rule` table (see db/models.py
`PlausibilityRule`) — this module only implements the operators. Nothing
here is hardcoded per plant type; default rules are *seeded* as data (see
const.py DEFAULT_PLAUSIBILITY_RULES), never branched on in code.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class RuleContext:
    value: float
    reference_mean: float | None = None
    reference_stddev: float | None = None
    previous_period_value: float | None = None
    ratio_value: float | None = None  # for the "ratio" operator: value / ratio_value


@dataclass(slots=True)
class RuleViolation:
    rule_id: int
    metric_key: str
    operator: str
    severity: str
    message: str


def evaluate_rule(rule, context: RuleContext) -> RuleViolation | None:
    """`rule` is a db.models.PlausibilityRule (or anything with the same
    metric_key/operator/threshold_value/severity/id attributes)."""
    threshold = rule.threshold_value
    operator = rule.operator

    if operator == "lt":
        if threshold is None:
            return None
        triggered = context.value < threshold
        message = f"{rule.metric_key} = {context.value:g} liegt unter dem Grenzwert {threshold:g}"

    elif operator == "gt":
        if threshold is None:
            return None
        triggered = context.value > threshold
        message = f"{rule.metric_key} = {context.value:g} liegt über dem Grenzwert {threshold:g}"

    elif operator == "pct_deviation":
        if threshold is None or not context.reference_mean:
            return None
        deviation = abs(context.value - context.reference_mean) / context.reference_mean
        triggered = deviation > threshold
        message = (
            f"{rule.metric_key} weicht {deviation * 100:.0f} % vom historischen Mittel "
            f"({context.reference_mean:.1f}) ab"
        )

    elif operator == "std_dev":
        if threshold is None or not context.reference_mean or not context.reference_stddev:
            return None
        z = abs(context.value - context.reference_mean) / context.reference_stddev
        triggered = z > threshold
        message = f"{rule.metric_key} weicht {z:.1f} Standardabweichungen vom Mittel ab"

    elif operator == "yoy_change":
        if threshold is None or not context.previous_period_value:
            return None
        change = abs(context.value - context.previous_period_value) / context.previous_period_value
        triggered = change > threshold
        message = f"{rule.metric_key} veränderte sich {change * 100:.0f} % gegenüber der Vorperiode"

    elif operator == "ratio":
        if threshold is None or not context.ratio_value:
            return None
        ratio = context.value / context.ratio_value
        triggered = (ratio < threshold) if threshold < 1 else (ratio > threshold)
        message = f"Verhältnis für {rule.metric_key} = {ratio:.2f} liegt außerhalb des Grenzwerts {threshold:g}"

    else:
        return None

    if not triggered:
        return None

    return RuleViolation(
        rule_id=rule.id,
        metric_key=rule.metric_key,
        operator=operator,
        severity=rule.severity,
        message=message,
    )
