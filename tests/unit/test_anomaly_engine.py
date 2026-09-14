from tests._pkg_loader import import_module

engine = import_module("anomaly.engine")
Severity = import_module("analysis.severity").Severity


def test_insufficient_data_never_flags_anomaly():
    result = engine.detect_anomaly("pv_yield_kwh", 6820, [8720, 9110])
    assert result.is_anomaly is False
    assert result.confidence == 0.0
    assert result.severity == Severity.INFO
    assert "keine ausreichende" in result.description.lower()


def test_normal_value_within_history_is_not_an_anomaly():
    reference = [8420, 8910, 8950, 8720, 8830, 8900]
    result = engine.detect_anomaly("pv_yield_kwh", 8850, reference)
    assert result.is_anomaly is False
    assert result.severity == Severity.INFO


def test_severely_low_yield_is_flagged_as_anomaly_with_causes():
    reference = [8420, 8910, 8950, 8720, 8830, 8900]
    result = engine.detect_anomaly("pv_yield_kwh", 3000, reference)
    assert result.is_anomaly is True
    assert result.severity in (Severity.HOCH, Severity.KRITISCH)
    assert result.confidence > 0
    assert "Verschattung" in result.possible_causes


def test_unknown_metric_key_falls_back_to_default_causes():
    reference = [10, 10, 10, 10, 10, 10]
    result = engine.detect_anomaly("custom_metric", 1, reference)
    assert result.is_anomaly is True
    assert result.possible_causes == engine._DEFAULT_CAUSES


def test_description_mentions_direction_and_percentage():
    reference = [100, 100, 100, 100]
    result = engine.detect_anomaly("pv_yield_kwh", 50, reference)
    assert "unter" in result.description
    assert "50" in result.description
