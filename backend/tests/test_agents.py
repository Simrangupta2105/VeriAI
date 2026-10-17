import pytest
from backend.app.agents.generator import AnswerGeneratorAgent
from backend.app.agents.extractor import ClaimExtractorAgent
from backend.app.agents.normalizer import ClaimNormalizerAgent
from backend.app.agents.evaluator import SourceQualityEvaluator
from backend.app.models.schemas import Claim, ClaimType

@pytest.mark.asyncio
async def test_answer_generator_fallback():
    gen = AnswerGeneratorAgent()
    res = await gen.generate("Who invented the telephone?")
    assert res.answer is not None
    assert len(res.answer) > 10
    assert "Alexander Graham Bell" in res.answer

@pytest.mark.asyncio
async def test_claim_extractor_atomic_decomposition():
    extractor = ClaimExtractorAgent()
    text = "Elon Musk founded SpaceX in 2002 and the company launched its first rocket in 2008."
    claims = await extractor.extract_claims(text)

    # Should break into at least 2 atomic claims
    assert len(claims) >= 2
    claim_texts = [c.claim for c in claims]
    assert any("2002" in t for t in claim_texts)
    assert any("2008" in t for t in claim_texts)

    # Check typed classification
    c1 = claims[0]
    assert c1.claim_type in (ClaimType.HISTORICAL, ClaimType.BIOGRAPHICAL, ClaimType.OTHER)
    assert c1.requires_verification is True

@pytest.mark.asyncio
async def test_claim_extractor_opinion_detection():
    extractor = ClaimExtractorAgent()
    text = "In my opinion, SpaceX is arguably the greatest aerospace firm in human history."
    claims = await extractor.extract_claims(text)
    assert len(claims) >= 1
    assert claims[0].claim_type == ClaimType.OPINION
    assert claims[0].requires_verification is False

def test_claim_normalizer():
    normalizer = ClaimNormalizerAgent()
    c = Claim(
        claim_id="C001",
        claim="SpaceX was founded in 2002.",
        claim_type=ClaimType.HISTORICAL,
        importance=0.9
    )
    norm = normalizer.normalize(c)
    assert norm.claim_id == "C001"
    assert "SpaceX" in norm.search_query or "SpaceX" in norm.entities
    assert norm.temporal_anchor == "2002"

def test_source_quality_evaluator():
    evaluator = SourceQualityEvaluator()
    # Official gov source
    gov_score, gov_type, _ = evaluator.evaluate("https://www.nasa.gov/mission_pages/apollo", "Apollo", 0.9)
    assert gov_score >= 85.0
    assert gov_type == "government"

    # Academic repository
    acad_score, acad_type, _ = evaluator.evaluate("https://arxiv.org/abs/2104.12345", "Paper", 0.9)
    assert acad_score >= 80.0
    assert acad_type == "academic"

    # Social forum / UGC
    ugc_score, ugc_type, _ = evaluator.evaluate("https://reddit.com/r/space/comments/123", "Post", 0.5)
    assert ugc_score <= 40.0
    assert ugc_type == "forum_or_ugc"
