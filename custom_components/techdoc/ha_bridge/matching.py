"""Best-effort matching of a device's entities to a plant type's metric
catalogue (`const.PLANT_TYPE_METRICS`). A suggestion is only ever offered
for the user to explicitly apply — never auto-saved — so a wrong guess
just means "nothing suggested" or "pick a different one", not silent
mis-mapping.

Pure data in, pure data out — no Home Assistant imports — so this is fully
unit testable on its own.
"""
from __future__ import annotations

from dataclasses import dataclass

_STATE_CLASS_KIND = {
    "measurement": "mean",
    "total": "sum",
    "total_increasing": "sum",
}

_MIN_SCORE = 2.0


@dataclass(slots=True)
class EntityCandidate:
    entity_id: str
    name: str
    device_class: str | None
    state_class: str | None
    unit: str | None


@dataclass(slots=True)
class MetricSuggestion:
    metric_key: str
    metric_name: str
    entity_id: str
    entity_name: str
    score: float


def _normalize(text: str) -> set[str]:
    cleaned = "".join(char if char.isalnum() else " " for char in text.lower())
    return {token for token in cleaned.split() if token}


def score_candidate(entity: EntityCandidate, metric: dict) -> float | None:
    """None means "definitely not usable for this metric", not "0 points" —
    a state_class/kind mismatch always yields no statistics data (see
    metrics.async_yearly_totals), so such a candidate must never be offered."""
    expected_kind = metric.get("kind", "sum")
    if _STATE_CLASS_KIND.get(entity.state_class) != expected_kind:
        return None

    score = 0.0

    # Unit match is a weak signal on its own (many unrelated metrics share
    # "kWh"), so it counts for less than an explicit device_class or name hint.
    expected_unit = metric.get("unit")
    if expected_unit and entity.unit == expected_unit:
        score += 1.0

    if entity.device_class and entity.device_class in (metric.get("device_classes") or []):
        score += 2.0

    hints: list[str] = metric.get("hints") or []
    name_tokens = _normalize(entity.name)
    hint_tokens: set[str] = set()
    for hint in hints:
        hint_tokens |= _normalize(hint)
    score += len(hint_tokens & name_tokens) * 1.5

    lowered_name = entity.name.lower()
    if any(hint in lowered_name for hint in hints):
        score += 1.0

    return score


def suggest_matches(metrics: list[dict], entities: list[EntityCandidate]) -> list[MetricSuggestion]:
    """The single best-scoring candidate per metric, if any clears the
    minimum bar — at most one suggestion per metric_key."""
    suggestions = []
    for metric in metrics:
        best_entity: EntityCandidate | None = None
        best_score = -1.0
        for entity in entities:
            score = score_candidate(entity, metric)
            if score is not None and score > best_score:
                best_score = score
                best_entity = entity
        if best_entity is not None and best_score >= _MIN_SCORE:
            suggestions.append(
                MetricSuggestion(
                    metric_key=metric["key"],
                    metric_name=metric["name"],
                    entity_id=best_entity.entity_id,
                    entity_name=best_entity.name,
                    score=best_score,
                )
            )
    return suggestions
