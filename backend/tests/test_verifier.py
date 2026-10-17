import pytest
from backend.app.models.schemas import Claim, EvidenceItem, VerdictType, ClaimType, VerificationResult
from backend.app.agents.contradiction import ContradictionDetector
from backend.app.agents.verifier import ClaimVerifierAgent
from backend.app.agents.critic import AdversarialCriticAgent

def test_contradiction_detector_temporal():
    detector = ContradictionDetector()
    claim = Claim(
        claim_id="C001",
        claim="SpaceX was founded in 1999.",
        claim_type=ClaimType.HISTORICAL
    )
    ev = EvidenceItem(
        evidence_id="E001",
        claim_id="C001",
        source_title="SpaceX Official History",
        source_url="https://spacex.com/about",
        source_domain="spacex.com",
        source_type="primary",
        snippet="Space Exploration Technologies Corp. was founded in 2002 by Elon Musk.",
        relevance=0.95,
        source_quality_score=95.0
    )
    disc = detector.detect_discrepancies(claim, [ev])
    assert disc is not None
    assert disc["type"] == "TEMPORAL_CONTRADICTION"
    assert disc["claimed_value"] == "1999"
    assert disc["found_value"] == "2002"

@pytest.mark.asyncio
async def test_verifier_contradiction_verdict():
    verifier = ClaimVerifierAgent()
    claim = Claim(
        claim_id="C001",
        claim="SpaceX was founded in 1999.",
        claim_type=ClaimType.HISTORICAL
    )
    ev = EvidenceItem(
        evidence_id="E001",
        claim_id="C001",
        source_title="SpaceX Official History",
        source_url="https://spacex.com/about",
        source_domain="spacex.com",
        source_type="primary",
        snippet="Space Exploration Technologies Corp. was founded in 2002 by Elon Musk.",
        relevance=0.95,
        source_quality_score=95.0
    )
    result = await verifier.verify(claim, [ev])
    assert result.verdict == VerdictType.CONTRADICTED
    assert result.confidence >= 0.90
    assert "E001" in result.evidence_ids

@pytest.mark.asyncio
async def test_verifier_no_evidence_unverified():
    verifier = ClaimVerifierAgent()
    claim = Claim(
        claim_id="C002",
        claim="Dr. Abernathy verified quantum vacuum decay in 2021.",
        claim_type=ClaimType.SCIENTIFIC
    )
    # No evidence provided
    result = await verifier.verify(claim, [])
    assert result.verdict == VerdictType.UNVERIFIED
    assert result.confidence == 0.50

def test_adversarial_critic_overturn():
    critic = AdversarialCriticAgent()
    claim = Claim(
        claim_id="C001",
        claim="SpaceX was founded in 1999.",
        claim_type=ClaimType.HISTORICAL
    )
    # Suppose a lax verifier marked it SUPPORTED
    lax_res = VerificationResult(
        claim_id="C001",
        verdict=VerdictType.SUPPORTED,
        confidence=0.85,
        reason="Looks good",
        evidence_ids=["E001"],
        source_quality_avg=90.0
    )
    ev = EvidenceItem(
        evidence_id="E001",
        claim_id="C001",
        source_title="History",
        source_url="https://spacex.com",
        source_domain="spacex.com",
        snippet="SpaceX was founded in 2002.",
        relevance=0.9,
        source_quality_score=90.0
    )
    revised_res, note = critic.critique(claim, lax_res, [ev])
    assert revised_res.verdict == VerdictType.CONTRADICTED
    assert revised_res.critic_status == "REVISED"
