"""Ties sensor mappings, cached yearly metrics, plausibility rules and the
anomaly engine together into one per-plant analysis pass (Phase 4).

Triggered by the coordinator's periodic refresh and by the `run_analysis`
service. A plant with no sensor mappings simply produces no metrics/
anomalies — this module never fabricates data.
"""
from __future__ import annotations

import json

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .analysis.rules_engine import RuleContext, evaluate_rule
from .analysis.stats import mean_stddev
from .anomaly.engine import detect_anomaly
from .db.engine import Database
from .metrics import async_yearly_totals

_RULE_VIOLATION_CONFIDENCE = 1.0  # a rule breach is a deterministic fact, not a statistical estimate
_UNAVAILABLE_STATES = ("unavailable", "unknown")


def _check_data_quality(hass: HomeAssistant, entity_id: str) -> str | None:
    """Basic data-quality check (spec section 48): is the mapped entity
    currently available at all? Deeper checks (permanently-zero values, unit
    changes, gaps in history) are not yet implemented."""
    state = hass.states.get(entity_id)
    if state is None:
        return f"Sensor {entity_id} existiert nicht (mehr) in Home Assistant."
    if state.state in _UNAVAILABLE_STATES:
        return f"Sensor {entity_id} ist aktuell nicht verfügbar ({state.state})."
    return None


async def async_analyze_plant(hass: HomeAssistant, database: Database, plant_id: int) -> dict:
    """Run plausibility + anomaly analysis for one plant's mapped metrics.

    Persists an analysis_result (+ anomaly rows) for the current year and
    returns a {metric_key: summary} dict.
    """
    repo = database.repository
    plant = await database.async_run(repo.get_plant, plant_id)
    if plant is None:
        return {}

    mappings = await database.async_run(repo.list_sensor_mappings, plant_id)
    rules = await database.async_run(repo.list_plausibility_rules, plant.plant_type_id)
    current_year = dt_util.now().year
    first_year = plant.year_built or (current_year - 5)

    metrics_summary: dict[str, dict] = {}
    anomalies: list[dict] = []

    for mapping in mappings:
        data_quality_issue = _check_data_quality(hass, mapping.entity_id)
        if data_quality_issue is not None:
            anomalies.append(
                {
                    "metric_key": mapping.metric_key,
                    "severity": "niedrig",
                    "confidence": 1.0,
                    "description": data_quality_issue,
                    "possible_causes": [
                        "Sensor/Integration offline",
                        "Gerät nicht erreichbar",
                        "Entity wurde umbenannt oder entfernt",
                    ],
                }
            )
            continue

        totals = await async_yearly_totals(
            hass,
            database,
            plant_id,
            mapping.metric_key,
            mapping.entity_id,
            mapping.unit,
            first_year,
            aggregation=mapping.aggregation,
        )
        if current_year not in totals:
            continue

        current_value = totals[current_year]
        reference_values = [value for year, value in totals.items() if year != current_year]

        anomaly_result = detect_anomaly(mapping.metric_key, current_value, reference_values)
        metrics_summary[mapping.metric_key] = {
            "current_value": current_value,
            "is_anomaly": anomaly_result.is_anomaly,
            "severity": anomaly_result.severity.value,
            "confidence": anomaly_result.confidence,
        }
        if anomaly_result.is_anomaly:
            anomalies.append(
                {
                    "metric_key": mapping.metric_key,
                    "severity": anomaly_result.severity.value,
                    "confidence": anomaly_result.confidence,
                    "description": anomaly_result.description,
                    "possible_causes": anomaly_result.possible_causes,
                }
            )

        reference_mean, reference_stddev = (
            mean_stddev(reference_values) if reference_values else (None, None)
        )
        previous_year_value = totals.get(current_year - 1)
        for rule in (r for r in rules if r.metric_key == mapping.metric_key):
            violation = evaluate_rule(
                rule,
                RuleContext(
                    value=current_value,
                    reference_mean=reference_mean,
                    reference_stddev=reference_stddev,
                    previous_period_value=previous_year_value,
                ),
            )
            if violation is not None:
                anomalies.append(
                    {
                        "metric_key": violation.metric_key,
                        "severity": violation.severity,
                        "confidence": _RULE_VIOLATION_CONFIDENCE,
                        "description": violation.message,
                        "possible_causes": [],
                    }
                )

    result_id = await database.async_run(
        repo.save_analysis_result,
        plant_id,
        "year",
        str(current_year),
        dt_util.utcnow().isoformat(),
        json.dumps(metrics_summary),
    )
    # Recomputing always replaces prior anomaly rows for this period, so an
    # operator's "bestaetigt"/"nicht_relevant" status resets to "offen" on the
    # next cycle if the condition still holds. Acceptable for now; a future
    # phase could diff by (metric_key, severity) to preserve status instead.
    await database.async_run(repo.clear_anomalies_for_result, result_id)
    for anomaly in anomalies:
        await database.async_run(
            repo.create_anomaly,
            result_id,
            anomaly["metric_key"],
            anomaly["severity"],
            anomaly["confidence"],
            anomaly["description"],
            json.dumps(anomaly["possible_causes"]),
        )

    return metrics_summary


async def async_analyze_all_plants(hass: HomeAssistant, database: Database) -> None:
    plants = await database.async_run(database.repository.list_plants)
    for plant in plants:
        await async_analyze_plant(hass, database, plant.id)
