from typing import List, Dict, Any, Tuple
from backend.app.models.schemas import Claim, VerificationResult, VerdictType

class HallucinationScoringEngine:
    """Computes explainable, weighted Overall Reliability (0-100) and Hallucination Risk (%)."""

    def calculate_scores(
        self,
        claims: List[Claim],
        results: List[VerificationResult]
    ) -> Tuple[float, float, Dict[str, Any], str]:
        if not claims or not results:
            return 50.0, 50.0, {}, "No claims evaluated."

        # Mapping of claim_id to objects
        result_map = {r.claim_id: r for r in results}

        total_weight = 0.0
        weighted_reliability_points = 0.0
        weighted_risk_points = 0.0

        counts = {
            "total": len(claims),
            "supported": 0,
            "partially_supported": 0,
            "contradicted": 0,
            "unverified": 0,
            "not_factual": 0,
        }

        claim_breakdowns = []

        for claim in claims:
            res = result_map.get(claim.claim_id)
            if not res:
                continue

            v = res.verdict
            conf = res.confidence
            importance = claim.importance
            sq = res.source_quality_avg

            # Update counts
            if v == VerdictType.SUPPORTED:
                counts["supported"] += 1
                verdict_score = 1.0 * min(1.0, max(0.6, sq / 85.0))
                risk_factor = 0.0
            elif v == VerdictType.PARTIALLY_SUPPORTED:
                counts["partially_supported"] += 1
                verdict_score = 0.65 * min(1.0, max(0.6, sq / 85.0))
                risk_factor = 0.35
            elif v == VerdictType.UNVERIFIED:
                counts["unverified"] += 1
                verdict_score = 0.35
                risk_factor = 0.50  # Uncertainty risk
            elif v == VerdictType.CONTRADICTED:
                counts["contradicted"] += 1
                verdict_score = 0.0
                risk_factor = 1.0   # Confirmed hallucination
            else:  # NOT_FACTUAL
                counts["not_factual"] += 1
                verdict_score = 0.70
                risk_factor = 0.10

            eff_weight = importance * (0.5 + 0.5 * conf)
            total_weight += eff_weight
            weighted_reliability_points += eff_weight * verdict_score
            weighted_risk_points += eff_weight * risk_factor

            claim_breakdowns.append({
                "claim_id": claim.claim_id,
                "importance": importance,
                "verdict": v.value,
                "confidence": conf,
                "source_quality": round(sq, 1),
                "effective_weight": round(eff_weight, 3),
                "verdict_score": round(verdict_score, 3)
            })

        if total_weight > 0:
            raw_reliability = (weighted_reliability_points / total_weight) * 100.0
            raw_risk = (weighted_risk_points / total_weight) * 100.0
        else:
            raw_reliability = 50.0
            raw_risk = 50.0

        # Contradiction severity penalty: if any core claim is contradicted, cap reliability
        if counts["contradicted"] > 0:
            contradiction_penalty = counts["contradicted"] * 10.0
            raw_reliability = max(5.0, raw_reliability - contradiction_penalty)
            raw_risk = min(98.0, raw_risk + contradiction_penalty)

        overall_reliability = round(max(0.0, min(100.0, raw_reliability)), 1)
        hallucination_risk = round(max(0.0, min(100.0, raw_risk)), 1)

        breakdown = {
            "summary_counts": counts,
            "total_effective_weight": round(total_weight, 3),
            "claims_detail": claim_breakdowns,
            "contradiction_penalty_applied": counts["contradicted"] > 0
        }

        explanation = self._build_explanation(overall_reliability, hallucination_risk, counts)

        return overall_reliability, hallucination_risk, breakdown, explanation

    def _build_explanation(self, reliability: float, risk: float, counts: Dict[str, int]) -> str:
        parts = [
            f"Overall answer reliability is rated at {reliability}/100 with an estimated hallucination risk of {risk}%."
        ]
        if counts["contradicted"] > 0:
            parts.append(f"WARNING: Detected {counts['contradicted']} directly contradicted factual statement(s).")
        if counts["unverified"] > 0:
            parts.append(f"{counts['unverified']} claim(s) lacked corroborating independent evidence.")
        if counts["supported"] > 0:
            parts.append(f"{counts['supported']} claim(s) were successfully corroborated by authoritative references.")
        return " ".join(parts)
