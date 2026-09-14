from tests._db_loader import import_db_module
from tests._pkg_loader import import_module

rules_engine = import_module("analysis.rules_engine")
RuleContext = rules_engine.RuleContext
evaluate_rule = rules_engine.evaluate_rule

models = import_db_module("models")
PlausibilityRule = models.PlausibilityRule


def _rule(operator: str, threshold_value: float | None, metric_key: str = "pv_yield_kwh"):
    return PlausibilityRule(
        id=1,
        plant_type_id=None,
        metric_key=metric_key,
        operator=operator,
        threshold_value=threshold_value,
        severity="mittel",
        enabled=True,
    )


def test_lt_rule_triggers_below_zero_yield():
    """"Jahresertrag > 0" (spec section 38) is a minimum check: violated
    when the value falls *below* the threshold, so it maps to operator "lt"."""
    rule = _rule("lt", 0)
    violation = evaluate_rule(rule, RuleContext(value=-5))
    assert violation is not None
    assert violation.severity == "mittel"


def test_lt_rule_does_not_trigger_when_satisfied():
    rule = _rule("lt", 0)
    assert evaluate_rule(rule, RuleContext(value=100)) is None


def test_gt_rule_triggers_above_maximum():
    rule = _rule("gt", 100)
    assert evaluate_rule(rule, RuleContext(value=150)) is not None
    assert evaluate_rule(rule, RuleContext(value=50)) is None


def test_lt_rule():
    rule = _rule("lt", 2.5, metric_key="heatpump_cop")
    assert evaluate_rule(rule, RuleContext(value=2.0)) is not None
    assert evaluate_rule(rule, RuleContext(value=3.0)) is None


def test_pct_deviation_rule():
    rule = _rule("pct_deviation", 0.2)
    triggered = evaluate_rule(rule, RuleContext(value=60, reference_mean=100))
    not_triggered = evaluate_rule(rule, RuleContext(value=90, reference_mean=100))
    assert triggered is not None
    assert not_triggered is None


def test_pct_deviation_without_reference_mean_is_skipped():
    rule = _rule("pct_deviation", 0.2)
    assert evaluate_rule(rule, RuleContext(value=60)) is None


def test_std_dev_rule():
    rule = _rule("std_dev", 2.0)
    triggered = evaluate_rule(
        rule, RuleContext(value=200, reference_mean=100, reference_stddev=10)
    )
    assert triggered is not None
    assert "Standardabweichungen" in triggered.message


def test_yoy_change_rule():
    rule = _rule("yoy_change", 0.3)
    triggered = evaluate_rule(rule, RuleContext(value=50, previous_period_value=100))
    assert triggered is not None


def test_ratio_rule_lower_bound():
    rule = _rule("ratio", 0.8)
    triggered = evaluate_rule(rule, RuleContext(value=70, ratio_value=100))
    not_triggered = evaluate_rule(rule, RuleContext(value=90, ratio_value=100))
    assert triggered is not None
    assert not_triggered is None


def test_unknown_operator_returns_none():
    rule = _rule("does_not_exist", 1)
    assert evaluate_rule(rule, RuleContext(value=1)) is None
