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
    """None means "not a candidate at all" for this metric — used both for a
    state_class/kind mismatch (would never yield statistics data anyway, see
    metrics.async_yearly_totals) and for the absence of any matching hint
    phrase in the entity's name.

    A hint match is a *required* gate, not just a scoring bonus: device_class
    and unit alone (e.g. "some energy sensor in kWh") are true of many
    unrelated entities on the same device, so they must never be sufficient
    to suggest a mapping by themselves — that produced wrong suggestions in
    practice (e.g. a heat pump's plain "Stromverbrauch" catalogue entry
    grabbing one of its Heizen/Warmwasser-specific sensors just because both
    are energy/kWh). Once a hint phrase is confirmed present, device_class/
    unit/token-overlap only break ties between remaining candidates.
    """
    expected_kind = metric.get("kind", "sum")
    if _STATE_CLASS_KIND.get(entity.state_class) != expected_kind:
        return None

    hints: list[str] = metric.get("hints") or []
    lowered_name = entity.name.lower()
    if not any(hint in lowered_name for hint in hints):
        return None

    score = 3.0

    name_tokens = _normalize(entity.name)
    hint_tokens: set[str] = set()
    for hint in hints:
        hint_tokens |= _normalize(hint)
    score += len(hint_tokens & name_tokens) * 0.25

    expected_unit = metric.get("unit")
    if expected_unit and entity.unit == expected_unit:
        score += 0.5

    if entity.device_class and entity.device_class in (metric.get("device_classes") or []):
        score += 0.5

    return score


def suggest_matches(metrics: list[dict], entities: list[EntityCandidate]) -> list[MetricSuggestion]:
    """The single best-scoring candidate per metric — every candidate
    already had to clear the mandatory hint-phrase gate in
    score_candidate(), so there is no separate minimum-score threshold here."""
    suggestions = []
    for metric in metrics:
        best_entity: EntityCandidate | None = None
        best_score = -1.0
        for entity in entities:
            score = score_candidate(entity, metric)
            if score is not None and score > best_score:
                best_score = score
                best_entity = entity
        if best_entity is not None:
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
