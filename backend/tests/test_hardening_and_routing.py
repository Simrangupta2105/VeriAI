import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from backend.app.models.schemas import (
    Claim,
    EvidenceItem,
    VerificationResult,
    VerdictType,
    ClaimType,
)
from backend.app.agents.verifier import ClaimVerifierAgent
from backend.app.agents.critic import AdversarialCriticAgent
from backend.app.agents.scorer import HallucinationScoringEngine
from backend.app.services.pipeline import PipelineOrchestrator


@pytest.mark.asyncio
async def test_all_jurors_failing():
    """When all LLM jurors fail, do NOT emit UNVERIFIED with 50/100 or store error strings as citations."""
    verifier = ClaimVerifierAgent()
    claim = Claim(
        claim_id="C001",
        claim="Sydney is the capital of Australia.",
        claim_type=ClaimType.GEOGRAPHIC
    )

    with patch.object(
        verifier,
        "evaluate_juror_1",
        new=AsyncMock(return_value={
            "error": "AI Juror 1 service unavailable.",
            "verdict": "VERIFICATION_UNAVAILABLE",
            "rating": 0,
            "confidence": 0.0,
            "reason": "AI Juror 1 service unavailable.",
            "juror_title": "AI Juror 1 (Offline)",
            "juror_model": "none"
        })
    ), patch.object(
        verifier,
        "evaluate_juror_2",
        new=AsyncMock(return_value={
            "error": "AI Juror 2 service unavailable.",
            "verdict": "VERIFICATION_UNAVAILABLE",
            "rating": 0,
            "confidence": 0.0,
            "reason": "AI Juror 2 service unavailable.",
            "juror_title": "AI Juror 2 (Offline)",
            "juror_model": "none"
        })
    ):
        result, evidences = await verifier.verify_dual_llm(claim)

        assert result.verdict == VerdictType.VERIFICATION_UNAVAILABLE
        assert result.confidence == 0.0
        assert result.source_quality_avg == 0.0
        assert evidences == []
        assert result.evidence_ids == []
        assert result.verification_status == "UNAVAILABLE"
        assert result.critic_status == "UNAVAILABLE"
        assert "unavailable" in result.reason.lower()


@pytest.mark.asyncio
async def test_empty_retrieval_returns_unavailable():
    """When evidence is empty, return explicit UNAVAILABLE state, not fake UNVERIFIED 50/100."""
    verifier = ClaimVerifierAgent()
    claim = Claim(
        claim_id="C001",
        claim="An unknown phenomenon occurred in an undisclosed location.",
        claim_type=ClaimType.OTHER
    )

    result = await verifier.verify(claim, evidence_list=[])

    assert result.verdict == VerdictType.VERIFICATION_UNAVAILABLE
    assert result.confidence == 0.0
    assert result.evidence_ids == []
    assert result.source_quality_avg == 0.0
    assert result.verification_status == "UNAVAILABLE"
    assert result.critic_status == "UNAVAILABLE"


def test_critic_rejects_evidence_less_verdicts():
    """The critic must never output PASSED when evidence is empty or placeholder error."""
    critic = AdversarialCriticAgent()
    claim = Claim(
        claim_id="C001",
        claim="Water boils at 100C at sea level.",
        claim_type=ClaimType.SCIENTIFIC
    )

    # Case 1: Result has evidence ID but evidence_list is empty
    res1 = VerificationResult(
        claim_id="C001",
        verdict=VerdictType.SUPPORTED,
        confidence=0.90,
        reason="Claim looked good",
        evidence_ids=["E001"],
        source_quality_avg=90.0
    )
    revised1, _ = critic.critique(claim, res1, [])
    assert revised1.verdict == VerdictType.VERIFICATION_UNAVAILABLE
    assert revised1.critic_status == "FLAGGED"
    assert revised1.critic_status != "PASSED"

    # Case 2: Evidence consists only of error placeholder
    placeholder_ev = EvidenceItem(
        evidence_id="E001",
        claim_id="C001",
        source_title="AI Juror 1 (Offline)",
        source_url="https://ai.google.dev",
        source_domain="none",
        source_type="AI Fact Juror",
        snippet="AI Juror 1 service unavailable.",
        relevance=1.0,
        source_quality_score=50.0
    )
    revised2, _ = critic.critique(claim, res1, [placeholder_ev])
    assert revised2.verdict == VerdictType.VERIFICATION_UNAVAILABLE
    assert revised2.critic_status == "FLAGGED"
    assert revised2.critic_status != "PASSED"


def test_scorer_excludes_unavailable_claims():
    """The scorer must exclude unavailable claims from reliability/risk instead of treating them as 0.35 uncertainty score."""
    scorer = HallucinationScoringEngine()
    claims = [
        Claim(claim_id="C001", claim="Supported fact", importance=1.0),
        Claim(claim_id="C002", claim="Unavailable claim", importance=1.0),
    ]
    results = [
        VerificationResult(
            claim_id="C001",
            verdict=VerdictType.SUPPORTED,
            confidence=0.95,
            reason="Verified",
            evidence_ids=["E001"],
            source_quality_avg=90.0
        ),
        VerificationResult(
            claim_id="C002",
            verdict=VerdictType.VERIFICATION_UNAVAILABLE,
            confidence=0.0,
            reason="Infrastructure offline",
            evidence_ids=[],
            source_quality_avg=0.0,
            verification_status="UNAVAILABLE"
        )
    ]

    reliability, risk, breakdown, exp = scorer.calculate_scores(claims, results)

    # C001 has 90 quality -> verdict_score = 1.0 * min(1.0, max(0.6, 90/85)) = 1.0 -> 100% reliability
    assert reliability >= 95.0
    assert risk == 0.0
    assert breakdown["summary_counts"]["unavailable"] == 1
    assert breakdown["summary_counts"]["supported"] == 1
    assert breakdown["claims_detail"][1]["excluded_from_scoring"] is True

    # Case where ALL claims are unavailable
    claims_all_unav = [Claim(claim_id="C002", claim="Unavailable claim", importance=1.0)]
    results_all_unav = [results[1]]
    rel_all, risk_all, bd_all, exp_all = scorer.calculate_scores(claims_all_unav, results_all_unav)
    assert rel_all == 0.0
    assert risk_all == 0.0
    assert "Verification unavailable" in exp_all


@pytest.mark.asyncio
async def test_correct_mode_routing():
    """Ensure hybrid-verifier-v1 routes to retrieval pipeline, while LLM model routes to dual LLM."""
    pipeline = PipelineOrchestrator()

    mock_ev = EvidenceItem(
        evidence_id="E001",
        claim_id="C001",
        source_title="Wikipedia: Test",
        source_url="https://en.wikipedia.org/wiki/Test",
        source_domain="wikipedia.org",
        snippet="Test fact",
        relevance=0.9,
        source_quality_score=90.0
    )
    mock_retrieval_res = VerificationResult(
        claim_id="C001",
        verdict=VerdictType.SUPPORTED,
        confidence=0.9,
        reason="Corroborated by retrieval",
        evidence_ids=["E001"],
        source_quality_avg=90.0
    )
    mock_llm_res = VerificationResult(
        claim_id="C001",
        verdict=VerdictType.SUPPORTED,
        confidence=0.88,
        reason="Corroborated by LLM",
        evidence_ids=["E001", "E002"],
        source_quality_avg=88.0
    )

    # 1. Test hybrid-verifier-v1 mode -> calls retrieval
    with patch.object(pipeline.retriever, "retrieve_for_claim", new=AsyncMock(return_value=[mock_ev])) as mock_ret, \
         patch.object(pipeline.verifier, "verify", new=AsyncMock(return_value=mock_retrieval_res)) as mock_ver, \
         patch.object(pipeline.verifier, "verify_dual_llm", new=AsyncMock(return_value=(mock_llm_res, [mock_ev]))) as mock_llm:

        report = await pipeline.run(
            question="What is this?",
            answer="This is a test fact.",
            model_name="hybrid-verifier-v1",
            enable_critic=False
        )

        assert mock_ret.called
        assert mock_ver.called
        assert not mock_llm.called

    # 2. Test LLM mode with configured key -> calls dual_llm
    with patch("backend.app.services.pipeline.settings") as mock_settings:
        mock_settings.GEMINI_API_KEY = "dummy-key"
        mock_settings.GOOGLE_API_KEY = ""
        mock_settings.OPENAI_API_KEY = ""
        mock_settings.GROQ_API_KEY = ""

        with patch.object(pipeline.retriever, "retrieve_for_claim", new=AsyncMock(return_value=[mock_ev])) as mock_ret, \
             patch.object(pipeline.verifier, "verify", new=AsyncMock(return_value=mock_retrieval_res)) as mock_ver, \
             patch.object(pipeline.verifier, "verify_dual_llm", new=AsyncMock(return_value=(mock_llm_res, [mock_ev]))) as mock_llm:

            report = await pipeline.run(
                question="What is this?",
                answer="This is a test fact.",
                model_name="gemini-1.5-flash",
                enable_critic=False
            )

            assert mock_llm.called
            assert not mock_ret.called
            assert not mock_ver.called


@pytest.mark.asyncio
async def test_sydney_claim_retrieval_contradicted():
    """Mock retrieval for Sydney claim -> returns CONTRADICTED citing Canberra."""
    verifier = ClaimVerifierAgent()
    claim = Claim(
        claim_id="C001",
        claim="Sydney is the capital of Australia.",
        claim_type=ClaimType.GEOGRAPHIC
    )
    ev = EvidenceItem(
        evidence_id="E001",
        claim_id="C001",
        source_title="Wikipedia: Canberra",
        source_url="https://en.wikipedia.org/wiki/Canberra",
        source_domain="wikipedia.org",
        source_type="reference",
        snippet="Canberra is the capital city of Australia. Founded following the federation of colonies...",
        relevance=0.95,
        source_quality_score=95.0
    )

    result = await verifier.verify(claim, evidence_list=[ev])

    assert result.verdict == VerdictType.CONTRADICTED
    assert result.confidence >= 0.90
    assert "Canberra" in result.reason
    assert "Sydney" in result.reason
    assert "E001" in result.evidence_ids


@pytest.mark.asyncio
async def test_boiling_point_claim_retrieval_supported():
    """Mock retrieval for water boiling point -> returns SUPPORTED with citations."""
    verifier = ClaimVerifierAgent()
    claim = Claim(
        claim_id="C001",
        claim="Water boils at 100°C at sea level.",
        claim_type=ClaimType.SCIENTIFIC
    )
    ev = EvidenceItem(
        evidence_id="E001",
        claim_id="C001",
        source_title="Wikipedia: Boiling point",
        source_url="https://en.wikipedia.org/wiki/Boiling_point",
        source_domain="wikipedia.org",
        source_type="reference",
        snippet="Water boils at 100 °C (212 °F) at standard atmospheric pressure at sea level.",
        relevance=0.95,
        source_quality_score=95.0
    )

    result = await verifier.verify(claim, evidence_list=[ev])

    assert result.verdict == VerdictType.SUPPORTED
    assert result.confidence >= 0.75
    assert "Wikipedia: Boiling point" in result.reason
    assert "E001" in result.evidence_ids
