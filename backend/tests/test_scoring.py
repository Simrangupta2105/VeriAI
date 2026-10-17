from backend.app.agents.scorer import HallucinationScoringEngine
from backend.app.models.schemas import Claim, VerificationResult, VerdictType, ClaimType

def test_hallucination_scoring_engine_high_reliability():
    scorer = HallucinationScoringEngine()
    claims = [
        Claim(claim_id="C001", claim="Fact 1", importance=0.9, requires_verification=True),
        Claim(claim_id="C002", claim="Fact 2", importance=0.8, requires_verification=True),
    ]
    results = [
        VerificationResult(claim_id="C001", verdict=VerdictType.SUPPORTED, confidence=0.95, reason="ok", source_quality_avg=90.0),
        VerificationResult(claim_id="C002", verdict=VerdictType.SUPPORTED, confidence=0.90, reason="ok", source_quality_avg=85.0),
    ]

    reliability, risk, breakdown, exp = scorer.calculate_scores(claims, results)
    assert reliability >= 90.0
    assert risk <= 10.0
    assert breakdown["summary_counts"]["supported"] == 2
    assert breakdown["summary_counts"]["contradicted"] == 0

def test_hallucination_scoring_engine_contradiction_penalty():
    scorer = HallucinationScoringEngine()
    claims = [
        Claim(claim_id="C001", claim="SpaceX was founded in 1999.", importance=0.95, requires_verification=True),
    ]
    results = [
        VerificationResult(claim_id="C001", verdict=VerdictType.CONTRADICTED, confidence=0.95, reason="False date", source_quality_avg=95.0),
    ]

    reliability, risk, breakdown, exp = scorer.calculate_scores(claims, results)
    assert reliability <= 20.0
    assert risk >= 80.0
    assert breakdown["contradiction_penalty_applied"] is True
