from tests._pkg_loader import import_module

severity_module = import_module("analysis.severity")
Severity = severity_module.Severity
confidence_from_reference = severity_module.confidence_from_reference
severity_from_deviation = severity_module.severity_from_deviation


def test_confidence_zero_below_minimum_periods():
    assert confidence_from_reference(2, 0.05) == 0.0


def test_confidence_increases_with_more_periods_and_tighter_spread():
    low = confidence_from_reference(3, 0.5)
    high = confidence_from_reference(7, 0.05)
    assert high > low
    assert 0.0 <= low <= 1.0
    assert 0.0 <= high <= 1.0


def test_severity_thresholds_increase_with_deviation():
    confidence = 1.0
    assert severity_from_deviation(0.05, confidence) == Severity.INFO
    assert severity_from_deviation(0.15, confidence) == Severity.NIEDRIG
    assert severity_from_deviation(0.25, confidence) == Severity.MITTEL
    assert severity_from_deviation(0.35, confidence) == Severity.HOCH
    assert severity_from_deviation(0.50, confidence) == Severity.KRITISCH


def test_low_confidence_caps_high_severities():
    assert severity_from_deviation(0.50, 0.3) == Severity.MITTEL
    assert severity_from_deviation(0.35, 0.3) == Severity.MITTEL


def test_zero_confidence_is_always_info():
    assert severity_from_deviation(0.9, 0.0) == Severity.INFO
