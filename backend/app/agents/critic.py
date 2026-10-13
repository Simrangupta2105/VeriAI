from typing import List, Tuple
from backend.app.models.schemas import Claim, EvidenceItem, VerificationResult, VerdictType, ClaimType

class AdversarialCriticAgent:
    """Audits verifier verdicts to prevent confirmation bias, lax acceptance, or hallucinated verification."""

    def critique(self, claim: Claim, result: VerificationResult, evidence_list: List[EvidenceItem]) -> Tuple[VerificationResult, str]:
        audit_notes = []
        revised = False
        new_result = result.model_copy(deep=True)

        # 1. Audit SUPPORTED claims against ContradictionDetector
        from backend.app.agents.contradiction import ContradictionDetector
        detector = ContradictionDetector()
        conflict = detector.detect_discrepancies(claim, evidence_list)
        if conflict and new_result.verdict in (VerdictType.SUPPORTED, VerdictType.PARTIALLY_SUPPORTED):
            conflict_type = conflict.get("conflict_type", "factual_conflict")
            conflict_expl = conflict.get("explanation", "Evidence contradicts claim.")
            audit_notes.append(f"Critic detected factual contradiction missed or laxly verified: {conflict_type}.")
            new_result.verdict = VerdictType.CONTRADICTED
            new_result.confidence = 0.95
            new_result.reason = f"Adversarial critic caught contradiction: {conflict_expl}"
            if "evidence_id" in conflict:
                new_result.evidence_ids = [conflict["evidence_id"]]
            revised = True

        # 2. Audit SUPPORTED claims supported only by low-trust sources
        if new_result.verdict == VerdictType.SUPPORTED:
            cited_evidences = [e for e in evidence_list if e.evidence_id in new_result.evidence_ids]
            if cited_evidences:
                max_q = max(e.source_quality_score for e in cited_evidences)
                if max_q < 45.0:
                    audit_notes.append(f"Critic detected weak provenance (max quality {max_q:.1f}). Downgrading SUPPORTED to PARTIALLY_SUPPORTED.")
                    new_result.verdict = VerdictType.PARTIALLY_SUPPORTED
                    new_result.confidence = min(new_result.confidence, 0.65)
                    revised = True

        # 2. Check for Absolute Claims (e.g. "sole original inventor", "first in human history")
        low_claim = claim.claim.lower()
        if new_result.verdict == VerdictType.SUPPORTED and any(term in low_claim for term in ["sole inventor", "sole original", "only person", "first in human history"]):
            # Check if evidence mentions other contributors
            for ev in evidence_list:
                ev_low = ev.snippet.lower()
                if any(ind in ev_low for ind in ["also credited", "multiple inventors", "disputed", "contemporaneous", "among several"]):
                    audit_notes.append("Critic audit: Absolute claim requires qualification due to documented contemporaneous contributors.")
                    new_result.verdict = VerdictType.PARTIALLY_SUPPORTED
                    new_result.confidence = 0.78
                    new_result.reason = f"Attribution is valid but requires qualification because independent sources record multiple contributors."
                    revised = True
                    break

        # 3. Check for Empty Evidence Citation with SUPPORTED
        if new_result.verdict in (VerdictType.SUPPORTED, VerdictType.PARTIALLY_SUPPORTED) and not new_result.evidence_ids:
            audit_notes.append("Critic security guard: Claim was verified without citing evidence IDs. Reverting to UNVERIFIED.")
            new_result.verdict = VerdictType.UNVERIFIED
            new_result.confidence = 0.50
            new_result.reason = "Unsubstantiated verdict revoked: No verifiable evidence IDs provided."
            revised = True

        if revised:
            new_result.critic_status = "REVISED"
            notes_str = " | ".join(audit_notes)
            new_result.critic_notes = notes_str
            return new_result, notes_str
        else:
            new_result.critic_status = "PASSED"
            new_result.critic_notes = "Groundedness, source credibility, and factual alignments verified."
            return new_result, new_result.critic_notes
