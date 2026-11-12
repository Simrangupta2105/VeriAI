import re
import json
import asyncio
import time
import requests
from typing import List, Optional, Tuple, Dict, Any
from backend.app.models.schemas import Claim, EvidenceItem, VerificationResult, VerdictType, ClaimType
from backend.app.agents.contradiction import ContradictionDetector
from backend.app.config import settings


class ClaimVerifierAgent:
    """
    Evaluates claims using an independent Dual-LLM Parallel Consensus system.
    Eliminates fragile web-scraping to prevent retriever poisoning and false contradictions.
    
    Architecture:
    - Juror 1 (Fact Checker): DeepMind Gemini evaluating against established world facts.
    - Juror 2 (Fact Auditor): OpenAI GPT-4o-mini / Groq Llama-3.3 / Independent Gemini Auditor.
    - Consensus Engine: Computes arithmetic average rating (0-100) and multi-model consensus verdict.
    - Generates traceable Evidence Items for each Juror so results remain fully auditable in the UI.
    """

    def __init__(self):
        self.contradiction_detector = ContradictionDetector()

    def _call_gemini_sync(
        self,
        prompt: str,
        model: str = "gemini-flash-lite-latest",
        fallback_models: Optional[List[str]] = None,
        temperature: float = 0.2
    ) -> Optional[dict]:
        """Synchronously queries the Google Gemini API with native JSON output and fallback resilience."""
        key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY
        if not key:
            return None

        models_to_try = [model] + (fallback_models or [])
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "responseMimeType": "application/json"
            }
        }

        for target_model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={key}"
            try:
                t0 = time.time()
                resp = requests.post(url, json=payload, timeout=20)
                dur = round(time.time() - t0, 2)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            raw_text = parts[0]["text"].strip()
                            cleaned = re.sub(r"^```json\s*", "", raw_text, flags=re.MULTILINE)
                            cleaned = re.sub(r"^```\s*$", "", cleaned.strip(), flags=re.MULTILINE)
                            parsed = json.loads(cleaned)
                            parsed["_latency"] = dur
                            parsed["_model"] = target_model
                            return parsed
                elif resp.status_code in (429, 503):
                    continue
            except Exception:
                continue

        return None

    def _call_openai_sync(self, prompt: str, model: str = "gpt-4o-mini", temperature: float = 0.2) -> Optional[dict]:
        """Synchronously queries OpenAI API if configured."""
        key = settings.OPENAI_API_KEY
        if not key:
            return None
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "temperature": temperature
        }
        try:
            t0 = time.time()
            resp = requests.post(url, headers=headers, json=payload, timeout=20)
            dur = round(time.time() - t0, 2)
            if resp.status_code == 200:
                data = resp.json()
                parsed = json.loads(data["choices"][0]["message"]["content"])
                parsed["_latency"] = dur
                parsed["_model"] = model
                return parsed
        except Exception:
            pass
        return None

    def _call_groq_sync(self, prompt: str, model: str = "llama-3.3-70b-versatile", temperature: float = 0.2) -> Optional[dict]:
        """Synchronously queries Groq API if configured."""
        key = settings.GROQ_API_KEY
        if not key:
            return None
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "temperature": temperature
        }
        try:
            t0 = time.time()
            resp = requests.post(url, headers=headers, json=payload, timeout=20)
            dur = round(time.time() - t0, 2)
            if resp.status_code == 200:
                data = resp.json()
                parsed = json.loads(data["choices"][0]["message"]["content"])
                parsed["_latency"] = dur
                parsed["_model"] = model
                return parsed
        except Exception:
            pass
        return None

    async def evaluate_juror_1(self, claim_text: str) -> dict:
        """
        AI Juror 1: Primary Factual Verification Juror.
        Evaluates strict factual accuracy against objective historical, scientific, and global facts.
        """
        prompt = f"""You are AI Fact Juror 1 (Primary Factual Verification Engine).
Evaluate the factual truth of this statement based on established historical, scientific, geographical, and world facts:

Statement: "{claim_text}"

CRITICAL FACT-CHECKING RULES:
1. SUPPORTED: The claim is objectively true in all aspects (entities, dates, events, roles). Rating: 80 - 100.
2. CONTRADICTED: The claim is false, misattributed, contains erroneous dates/entities, or is a factual hallucination (e.g. attributing national titles, inventions, or historical events to the wrong person/date). Rating: 0 - 30.
3. PARTIALLY_SUPPORTED: The statement has factual basis but has exaggerated qualifiers, minor date discrepancies, or contested claims. Rating: 40 - 75.
4. UNVERIFIED: The claim is completely unverifiable or private knowledge. Rating: 40 - 60.

Return valid JSON with exactly these keys:
{{
  "verdict": "SUPPORTED" | "CONTRADICTED" | "PARTIALLY_SUPPORTED" | "UNVERIFIED",
  "rating": <integer 0 to 100>,
  "confidence": <float 0.0 to 1.0>,
  "reason": "<Direct factual explanation stating the real facts, correct entities, and dates>"
}}"""

        res = await asyncio.to_thread(
            self._call_gemini_sync,
            prompt,
            "gemini-flash-lite-latest",
            ["gemini-3.5-flash-lite"],
            0.1
        )
        if res:
            model_used = res.get("_model", "gemini-flash-lite-latest")
            res["juror_title"] = f"AI Juror 1: {model_used} (Fact Evaluator)"
            res["juror_model"] = model_used
            return res

        return {
            "verdict": "UNVERIFIED",
            "rating": 50,
            "confidence": 0.5,
            "reason": "AI Juror 1 service unavailable.",
            "juror_title": "AI Juror 1 (Offline)",
            "juror_model": "none"
        }

    async def evaluate_juror_2(self, claim_text: str) -> dict:
        """
        AI Juror 2: Independent Consensus & Adversarial Auditor.
        Audits for subtle hallucinations, false attributions, temporal slips, or entity swaps.
        Uses OpenAI / Groq if configured, otherwise an independent secondary Gemini model family.
        """
        prompt = f"""You are AI Fact Juror 2 (Adversarial Fact Auditor & Consensus Juror).
Rigorously audit this statement for factual inaccuracies, entity confusion, false attributions, or chronological errors:

Statement: "{claim_text}"

AUDIT PROTOCOL:
- If an entity or person is wrongly credited with an event, title, invention, or leadership position (e.g. claiming Donald Trump is Father of the Nation of India, or Charles Dickens wrote Romeo and Juliet), you MUST mark CONTRADICTED with a rating near 0 and state the true facts (e.g. Mahatma Gandhi, William Shakespeare).
- If the statement is completely accurate, mark SUPPORTED with rating 80-100.
- If partially true, mark PARTIALLY_SUPPORTED with rating 40-75.

Return valid JSON:
{{
  "verdict": "SUPPORTED" | "CONTRADICTED" | "PARTIALLY_SUPPORTED" | "UNVERIFIED",
  "rating": <integer 0 to 100>,
  "confidence": <float 0.0 to 1.0>,
  "reason": "<Critical audit explanation highlighting true historical/scientific evidence>"
}}"""

        # Priority 1: OpenAI GPT-4o-mini
        res = await asyncio.to_thread(self._call_openai_sync, prompt, "gpt-4o-mini", 0.2)
        if res:
            res["juror_title"] = "AI Juror 2: OpenAI GPT-4o-mini (Consensus Auditor)"
            res["juror_model"] = "gpt-4o-mini"
            return res

        # Priority 2: Groq Llama-3.3-70b
        res = await asyncio.to_thread(self._call_groq_sync, prompt, "llama-3.3-70b-versatile", 0.2)
        if res:
            res["juror_title"] = "AI Juror 2: Groq Llama-3.3-70b (Consensus Auditor)"
            res["juror_model"] = "llama-3.3-70b"
            return res

        # Priority 3: Independent Gemini Auditor using separate model architecture (gemini-3.5-flash-lite)
        res = await asyncio.to_thread(
            self._call_gemini_sync,
            prompt,
            "gemini-3.5-flash-lite",
            ["gemini-flash-lite-latest"],
            0.5
        )
        if res:
            model_used = res.get("_model", "gemini-3.5-flash-lite")
            res["juror_title"] = f"AI Juror 2: {model_used} (Adversarial Auditor)"
            res["juror_model"] = model_used
            return res

        return {
            "verdict": "UNVERIFIED",
            "rating": 50,
            "confidence": 0.5,
            "reason": "AI Juror 2 service unavailable.",
            "juror_title": "AI Juror 2 (Offline)",
            "juror_model": "none"
        }

    async def verify_dual_llm(
        self,
        claim: Claim,
        evidence_counter_start: int = 1
    ) -> Tuple[VerificationResult, List[EvidenceItem]]:
        """
        Executes parallel Dual-LLM verification on the claim, computes the averaged reliability score,
        forms the consensus verdict, and produces virtual EvidenceItem cards for both AI Jurors.
        """
        # Non-factual or Opinion claims
        if not claim.requires_verification or claim.claim_type == ClaimType.OPINION:
            result = VerificationResult(
                claim_id=claim.claim_id,
                verdict=VerdictType.NOT_FACTUAL,
                confidence=0.90,
                reason="Claim is identified as an opinion, value judgment, or rhetorical framing that cannot be objectively verified.",
                evidence_ids=[],
                source_quality_avg=0.0
            )
            return result, []

        # Execute both Jurors concurrently in parallel threads
        res1, res2 = await asyncio.gather(
            self.evaluate_juror_1(claim.claim),
            self.evaluate_juror_2(claim.claim),
            return_exceptions=False
        )

        r1 = float(res1.get("rating", 50))
        r2 = float(res2.get("rating", 50))
        avg_rating = round((r1 + r2) / 2.0, 1)

        v1 = str(res1.get("verdict", "UNVERIFIED")).upper()
        v2 = str(res2.get("verdict", "UNVERIFIED")).upper()

        conf1 = float(res1.get("confidence", 0.85))
        conf2 = float(res2.get("confidence", 0.85))
        avg_conf = min(0.99, max(0.50, round((conf1 + conf2) / 2.0, 2)))

        # Consensus determination
        if v1 == "CONTRADICTED" and v2 == "CONTRADICTED":
            final_verdict = VerdictType.CONTRADICTED
        elif v1 == "CONTRADICTED" or v2 == "CONTRADICTED":
            if avg_rating <= 35:
                final_verdict = VerdictType.CONTRADICTED
            else:
                final_verdict = VerdictType.PARTIALLY_SUPPORTED
        elif v1 == "SUPPORTED" and v2 == "SUPPORTED":
            final_verdict = VerdictType.SUPPORTED if avg_rating >= 65 else VerdictType.PARTIALLY_SUPPORTED
        elif "PARTIALLY_SUPPORTED" in (v1, v2):
            final_verdict = VerdictType.PARTIALLY_SUPPORTED
        elif v1 == "SUPPORTED" or v2 == "SUPPORTED":
            final_verdict = VerdictType.PARTIALLY_SUPPORTED if avg_rating >= 50 else VerdictType.UNVERIFIED
        else:
            final_verdict = VerdictType.UNVERIFIED

        # Format Evidence Items
        eid1 = f"E{evidence_counter_start:03d}"
        eid2 = f"E{evidence_counter_start + 1:03d}"

        title1 = res1.get("juror_title", "AI Juror 1: Gemini (Fact Evaluator)")
        title2 = res2.get("juror_title", "AI Juror 2: Consensus Auditor")

        domain2 = "openai.com" if "gpt" in title2.lower() else "groq.com" if "groq" in title2.lower() else "google.gemini"
        url2 = "https://openai.com" if "gpt" in title2.lower() else "https://groq.com" if "groq" in title2.lower() else "https://ai.google.dev"

        ev1 = EvidenceItem(
            evidence_id=eid1,
            claim_id=claim.claim_id,
            source_title=title1,
            source_url="https://ai.google.dev",
            source_domain="google.gemini",
            source_type="AI Fact Juror",
            snippet=res1.get("reason", "Verified against primary world knowledge."),
            relevance=1.0,
            source_quality_score=max(0.0, min(100.0, r1)),
            quality_explanation=f"Juror 1 Verdict: {v1} (Reliability Rating: {r1:.0f}/100)"
        )

        ev2 = EvidenceItem(
            evidence_id=eid2,
            claim_id=claim.claim_id,
            source_title=title2,
            source_url=url2,
            source_domain=domain2,
            source_type="AI Consensus Auditor",
            snippet=res2.get("reason", "Audited against cross-model factual consensus."),
            relevance=1.0,
            source_quality_score=max(0.0, min(100.0, r2)),
            quality_explanation=f"Juror 2 Verdict: {v2} (Reliability Rating: {r2:.0f}/100)"
        )

        # Composite Consensus Reason
        reason1 = res1.get("reason", "").strip()
        reason2 = res2.get("reason", "").strip()
        consensus_reason = (
            f"Dual-LLM Consensus Verdict: {final_verdict.value} (Averaged Reliability Score: {avg_rating:.1f}/100). "
            f"Juror 1 [{title1}] (Score: {r1:.0f}/100, Verdict: {v1}): {reason1} "
            f"| Juror 2 [{title2}] (Score: {r2:.0f}/100, Verdict: {v2}): {reason2}"
        )

        verification_result = VerificationResult(
            claim_id=claim.claim_id,
            verdict=final_verdict,
            confidence=avg_conf,
            reason=consensus_reason,
            evidence_ids=[eid1, eid2],
            source_quality_avg=avg_rating
        )

        return verification_result, [ev1, ev2]

    async def verify(self, claim: Claim, evidence_list: Optional[List[EvidenceItem]] = None) -> VerificationResult:
        """
        Unified verify entrypoint:
        - If external evidence is explicitly supplied (e.g. in targeted unit tests), runs contradiction & ground verification.
        - Otherwise, executes the high-accuracy Dual-LLM parallel consensus engine.
        """
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

        # If explicit external evidence is provided (e.g. for offline unit test assertions)
        if evidence_list is not None and len(evidence_list) > 0:
            avg_quality = sum(e.source_quality_score for e in evidence_list) / len(evidence_list)
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
            return self._verify_deterministic(claim, evidence_list, avg_quality)

        # If evidence_list is explicitly empty []
        if evidence_list is not None and len(evidence_list) == 0:
            return VerificationResult(
                claim_id=claim.claim_id,
                verdict=VerdictType.UNVERIFIED,
                confidence=0.50,
                reason="No independent corroborating evidence was provided. Claim cannot be validated.",
                evidence_ids=[],
                source_quality_avg=0.0
            )

        # Default: Dual-LLM parallel consensus
        verif_res, _ = await self.verify_dual_llm(claim)
        return verif_res

    def _verify_deterministic(self, claim: Claim, evidence_list: List[EvidenceItem], avg_quality: float) -> VerificationResult:
        claim_text = claim.claim.lower()
        claim_words = set(re.findall(r"\w+", claim_text))
        stops = {"the", "a", "an", "is", "was", "were", "are", "in", "on", "at", "by", "for", "with", "and", "or", "to", "of", "it", "its", "from", "that", "this"}
        key_words = {w for w in claim_words if w not in stops and len(w) > 2}

        claim_dates = re.findall(r"\b(?:16|17|18|19|20)\d{2}\b", claim_text)
        proper_nouns = set(re.findall(r"\b[A-Z][a-z0-9]+\b", claim.claim))
        common_starters = {"The", "A", "An", "In", "On", "At", "By", "For", "With", "According", "It", "Its"}
        proper_nouns = {p.lower() for p in proper_nouns if p not in common_starters and len(p) > 2}

        matching_evs = []
        contradicting_evs = []

        for ev in evidence_list:
            ev_text = ev.snippet.lower()
            ev_words = set(re.findall(r"\w+", ev_text))
            intersection = key_words.intersection(ev_words)
            overlap_ratio = len(intersection) / len(key_words) if key_words else 0.0
            all_entities_present = all(p in ev_text for p in proper_nouns) if proper_nouns else True
            exact_date_match = bool(claim_dates) and all(d in ev_text for d in claim_dates)

            is_debunked = False
            for neg in ["falsely attributed", "did not invent", "disputed by historians", "mistakenly believed"]:
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
            matching_evs.sort(key=lambda x: (
                (50 if x[3] else 0) + (20 if x[2] else 0) + (x[1] * x[0].source_quality_score)
            ), reverse=True)
            top_ev, top_ratio, has_date, has_entities = matching_evs[0]
            cited_ids = [e[0].evidence_id for e in matching_evs[:2]]

            if not has_entities:
                return VerificationResult(
                    claim_id=claim.claim_id,
                    verdict=VerdictType.UNVERIFIED,
                    confidence=0.60,
                    reason=f"Retrieved documents from '{top_ev.source_title}' mention related topics but lack confirmation for key entities in the claim.",
                    evidence_ids=cited_ids,
                    source_quality_avg=avg_quality
                )

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

        top_cand = evidence_list[0]
        return VerificationResult(
            claim_id=claim.claim_id,
            verdict=VerdictType.UNVERIFIED,
            confidence=0.55,
            reason="Retrieved documents mention related topics but do not provide explicit confirmation for the specific claim.",
            evidence_ids=[top_cand.evidence_id],
            source_quality_avg=avg_quality
        )
