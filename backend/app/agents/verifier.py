import re
import json
from typing import List, Optional
from backend.app.models.schemas import Claim, EvidenceItem, VerificationResult, VerdictType, ClaimType
from backend.app.agents.contradiction import ContradictionDetector
from backend.app.config import settings

class ClaimVerifierAgent:
    """Verifies claims against strictly retrieved evidence with zero-trust hallucination guards."""

    def __init__(self):
        self.contradiction_detector = ContradictionDetector()

    async def verify(self, claim: Claim, evidence_list: List[EvidenceItem]) -> VerificationResult:
        # Non-factual or Opinion claims
        if not claim.requires_verification or claim.claim_type == ClaimType.OPINION:
            return VerificationResult(
                claim_id=claim.claim_id,
                verdict=VerdictType.NOT_FACTUAL,
                confidence=0.90,
                reason="Claim is identified as an opinion, value judgment, or rhetorical framing that cannot be objectively verified.",
                evidence_ids=[],
                source_quality_avg=0.0
            )

        # No Evidence Found -> UNVERIFIED (Never assume False or Guess)
        if not evidence_list:
            return VerificationResult(
                claim_id=claim.claim_id,
                verdict=VerdictType.UNVERIFIED,
                confidence=0.50,
                reason="No independent corroborating evidence was retrieved from trusted sources. Claim cannot be validated.",
                evidence_ids=[],
                source_quality_avg=0.0
            )

        # Calculate average source quality
        avg_quality = sum(e.source_quality_score for e in evidence_list) / len(evidence_list)

        # 1. Contradiction Detection Pass
        discrepancy = self.contradiction_detector.detect_discrepancies(claim, evidence_list)
        if discrepancy:
            if discrepancy.get("type") in ("TEMPORAL_CONTRADICTION", "NUMERICAL_CONTRADICTION", "FACTUAL_RELATION_CONTRADICTION"):
                return VerificationResult(
                    claim_id=claim.claim_id,
                    verdict=VerdictType.CONTRADICTED,
                    confidence=0.94,
                    reason=discrepancy["explanation"],
                    evidence_ids=discrepancy["evidence_ids"],
                    source_quality_avg=avg_quality,
                    discrepancy_details=discrepancy
                )
            elif discrepancy.get("type") == "INTER_SOURCE_DISAGREEMENT":
                return VerificationResult(
                    claim_id=claim.claim_id,
                    verdict=VerdictType.PARTIALLY_SUPPORTED,
                    confidence=0.75,
                    reason=discrepancy["explanation"],
                    evidence_ids=discrepancy["evidence_ids"],
                    source_quality_avg=avg_quality,
                    discrepancy_details=discrepancy
                )

        # 2. Try LLM Verification if API is active
        gemini_key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY
        if gemini_key:
            llm_result = await self._verify_with_llm(claim, evidence_list, avg_quality)
            if llm_result:
                return llm_result

        # 3. Deterministic Grounded NLI Verification Engine
        return self._verify_deterministic(claim, evidence_list, avg_quality)

    async def _verify_with_llm(self, claim: Claim, evidence_list: List[EvidenceItem], avg_quality: float) -> Optional[VerificationResult]:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY)

            # Format evidence options
            evidence_context = "\n".join([
                f"[{e.evidence_id}] Source: {e.source_title} (Quality: {e.source_quality_score})\nText: {e.snippet}"
                for e in evidence_list[:4]
            ])

            prompt = f"""You are a rigorous Claim Verification Agent.
You MUST determine if the Claim is SUPPORTED, PARTIALLY_SUPPORTED, CONTRADICTED, or UNVERIFIED strictly based on the provided Evidence items.

STRICT ENTAILMENT RULES:
1. SUPPORTED: The evidence explicitly validates that ALL entities, dates, relationships, roles, and facts in the claim are true.
2. CONTRADICTED: The evidence directly contradicts or refutes the claim (e.g. asserts a different person, date, profession, country, role, or event).
3. UNVERIFIED: The evidence is silent or lacks information on key parts of the claim (e.g. mentions the person but says nothing about the specified role or country). NEVER guess or assume.
4. PARTIALLY_SUPPORTED: The core entity is verified, but secondary details or extreme superlatives ('solely', 'only') lack full corroboration.

Claim: "{claim.claim}"

Evidence List:
{evidence_context}

Return valid JSON with schema:
{{
  "verdict": "SUPPORTED|PARTIALLY_SUPPORTED|CONTRADICTED|UNVERIFIED",
  "confidence": 0.95,
  "reason": "Detailed explanation citing the evidence",
  "evidence_ids": ["E001"]
}}
Only return JSON."""

            resp = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt
            )
            if resp and resp.text:
                cleaned = re.sub(r"^```json\s*", "", resp.text.strip(), flags=re.MULTILINE)
                cleaned = re.sub(r"^```\s*$", "", cleaned.strip(), flags=re.MULTILINE)
                data = json.loads(cleaned)
                v_str = data.get("verdict", "UNVERIFIED").upper()
                verdict = VerdictType(v_str) if v_str in VerdictType._value2member_map_ else VerdictType.UNVERIFIED
                # Validate evidence_ids
                valid_ids = [eid for eid in data.get("evidence_ids", []) if any(e.evidence_id == eid for e in evidence_list)]

                return VerificationResult(
                    claim_id=claim.claim_id,
                    verdict=verdict,
                    confidence=float(data.get("confidence", 0.8)),
                    reason=data.get("reason", ""),
                    evidence_ids=valid_ids if valid_ids else [evidence_list[0].evidence_id],
                    source_quality_avg=avg_quality
                )
        except Exception as e:
            print(f"[_verify_with_llm error: {e}]")
            return None

    def _verify_deterministic(self, claim: Claim, evidence_list: List[EvidenceItem], avg_quality: float) -> VerificationResult:
        claim_text = claim.claim.lower()
        claim_words = set(re.findall(r"\w+", claim_text))
        stops = {"the", "a", "an", "is", "was", "were", "are", "in", "on", "at", "by", "for", "with", "and", "or", "to", "of", "it", "its", "from", "that", "this"}
        key_words = {w for w in claim_words if w not in stops and len(w) > 2}

        claim_dates = re.findall(r"\b(?:16|17|18|19|20)\d{2}\b", claim_text)

        # Extract proper nouns from the claim (capitalized entities like India, Donald Trump, South America)
        proper_nouns = set(re.findall(r"\b[A-Z][a-z0-9]+\b", claim.claim))
        common_starters = {"The", "A", "An", "In", "On", "At", "By", "For", "With", "According", "It", "Its"}
        proper_nouns = {p.lower() for p in proper_nouns if p not in common_starters and len(p) > 2}

        # Check evidence alignments
        matching_evs = []
        contradicting_evs = []

        for ev in evidence_list:
            ev_text = ev.snippet.lower()
            ev_words = set(re.findall(r"\w+", ev_text))
            intersection = key_words.intersection(ev_words)
            overlap_ratio = len(intersection) / len(key_words) if key_words else 0.0

            # Check if all proper noun entities are present
            all_entities_present = all(p in ev_text for p in proper_nouns) if proper_nouns else True

            # Check if claim's dates are corroborated in this snippet
            exact_date_match = bool(claim_dates) and all(d in ev_text for d in claim_dates)

            # Check for negative qualifiers (e.g. "not invented by", "denied", "false", "disputed")
            is_debunked = False
            for neg in ["falsely attributed", "did not invent", "disputed by historians", "mistakenly believed", "false vacuum decay"]:
                if neg in ev_text:
                    is_debunked = True
                    break
            if re.search(r"\b(?:myth|hoax|untrue|fabricated)\b", ev_text) and not any(m in ev_text for m in ["roman myth", "greek myth", "norse myth", "mythology"]):
                is_debunked = True

            if is_debunked:
                contradicting_evs.append(ev)
            elif all_entities_present and exact_date_match and overlap_ratio >= 0.50:
                matching_evs.append((ev, overlap_ratio, True, True))
            elif all_entities_present and overlap_ratio >= 0.65:
                matching_evs.append((ev, overlap_ratio, False, True))
            elif overlap_ratio >= 0.40:
                matching_evs.append((ev, overlap_ratio, False, all_entities_present))

        if contradicting_evs:
            best_c = contradicting_evs[0]
            return VerificationResult(
                claim_id=claim.claim_id,
                verdict=VerdictType.CONTRADICTED,
                confidence=0.90,
                reason=f"Evidence from '{best_c.source_title}' indicates the claim is disputed or historically inaccurate.",
                evidence_ids=[best_c.evidence_id],
                source_quality_avg=avg_quality
            )

        if matching_evs:
            # Sort prioritizing entity match, high overlap, and source quality
            matching_evs.sort(key=lambda x: (
                (50 if x[3] else 0) + (20 if x[2] else 0) + (x[1] * x[0].source_quality_score)
            ), reverse=True)
            top_ev, top_ratio, has_date, has_entities = matching_evs[0]
            cited_ids = [e[0].evidence_id for e in matching_evs[:2]]

            # If proper nouns are missing from evidence, cannot claim SUPPORTED!
            if not has_entities:
                return VerificationResult(
                    claim_id=claim.claim_id,
                    verdict=VerdictType.UNVERIFIED,
                    confidence=0.60,
                    reason=f"Retrieved documents from '{top_ev.source_title}' mention related topics but lack confirmation for key entities in the claim.",
                    evidence_ids=cited_ids,
                    source_quality_avg=avg_quality
                )

            # Check if evidence mentions dispute or multiple contributors
            top_text = top_ev.snippet.lower()
            is_disputed = any(term in top_text for term in ["also credited", "multiple inventors", "contemporaneous", "among several", "dispute"])

            if is_disputed:
                return VerificationResult(
                    claim_id=claim.claim_id,
                    verdict=VerdictType.PARTIALLY_SUPPORTED,
                    confidence=0.82,
                    reason=f"Corroborated by {top_ev.source_title}, but historical or technical records note multiple contemporaneous contributors or qualifications.",
                    evidence_ids=cited_ids,
                    source_quality_avg=avg_quality
                )

            # Detect absolute/unqualified claims
            low_claim = claim.claim.lower()
            has_absolute = any(w in low_claim for w in ["single-handedly", "solely", "always", "every modern", "all modern", "only person", "first in human history"])
            if has_absolute:
                return VerificationResult(
                    claim_id=claim.claim_id,
                    verdict=VerdictType.PARTIALLY_SUPPORTED,
                    confidence=0.75,
                    reason=f"Attribution to primary entity is historically valid, but absolute qualifier requires qualification as records cite multiple contributors or context.",
                    evidence_ids=cited_ids,
                    source_quality_avg=avg_quality
                )

            # High-confidence SUPPORTED requirements:
            # Must have ALL entities present AND (very high keyword alignment >= 0.70 OR exact corroborated date + overlap >= 0.55)
            if has_entities and ((top_ratio >= 0.70) or (has_date and top_ratio >= 0.55)) and top_ev.source_quality_score >= 50:
                conf = min(0.98, max(0.75, round(top_ratio * (top_ev.source_quality_score / 100) + (0.15 if has_date else 0), 2)))
                return VerificationResult(
                    claim_id=claim.claim_id,
                    verdict=VerdictType.SUPPORTED,
                    confidence=conf,
                    reason=f"Corroborated by {top_ev.source_title} (Quality: {top_ev.source_quality_score}/100) with substantial factual alignment.",
                    evidence_ids=cited_ids,
                    source_quality_avg=avg_quality
                )
            elif top_ratio >= 0.45 and has_entities:
                return VerificationResult(
                    claim_id=claim.claim_id,
                    verdict=VerdictType.PARTIALLY_SUPPORTED,
                    confidence=0.70,
                    reason=f"Partially corroborated by {top_ev.source_title}, but full detail or specific predicate is incomplete in available records.",
                    evidence_ids=cited_ids,
                    source_quality_avg=avg_quality
                )

        # If low overlap or no corroboration
        top_cand = evidence_list[0]
        return VerificationResult(
            claim_id=claim.claim_id,
            verdict=VerdictType.UNVERIFIED,
            confidence=0.55,
            reason="Retrieved documents mention related topics but do not provide explicit confirmation for the specific claim.",
            evidence_ids=[top_cand.evidence_id],
            source_quality_avg=avg_quality
        )
