import uuid
from datetime import datetime, timezone
from typing import Optional, Callable, Dict, Any
from backend.app.models.schemas import (
    VerificationReport,
    Claim,
    EvidenceItem,
    VerificationResult,
    VerdictType,
)
from backend.app.agents.generator import AnswerGeneratorAgent
from backend.app.agents.extractor import ClaimExtractorAgent
from backend.app.agents.normalizer import ClaimNormalizerAgent
from backend.app.agents.retriever import EvidenceRetrievalAgent
from backend.app.agents.verifier import ClaimVerifierAgent
from backend.app.agents.critic import AdversarialCriticAgent
from backend.app.agents.scorer import HallucinationScoringEngine
from backend.app.services.report_generator import ReportGeneratorService
from backend.app.database.repository import ReportRepository

class PipelineOrchestrator:
    """Orchestrates the entire multi-agent hallucination detection and verification pipeline."""

    def __init__(self):
        self.generator = AnswerGeneratorAgent()
        self.extractor = ClaimExtractorAgent()
        self.normalizer = ClaimNormalizerAgent()
        self.retriever = EvidenceRetrievalAgent()
        self.verifier = ClaimVerifierAgent()
        self.critic = AdversarialCriticAgent()
        self.scorer = HallucinationScoringEngine()
        self.report_service = ReportGeneratorService()

    async def run(
        self,
        question: str,
        answer: Optional[str] = None,
        model_name: Optional[str] = None,
        enable_critic: bool = True,
        progress_cb: Optional[Callable[[str, Dict[str, Any]], None]] = None
    ) -> VerificationReport:
        report_id = f"REP-{uuid.uuid4().hex[:8].upper()}"

        # 1. Answer Generation (if not provided)
        if not answer or not answer.strip():
            if progress_cb:
                progress_cb("GENERATING_ANSWER", {"question": question})
            gen_res = await self.generator.generate(question, model_name=model_name)
            answer = gen_res.answer
            model_name = gen_res.model
        else:
            model_name = model_name or "user-provided-answer"

        # 2. Claim Extraction
        if progress_cb:
            progress_cb("EXTRACTING_CLAIMS", {"answer_preview": answer[:100]})
        claims = await self.extractor.extract_claims(answer, question=question)

        # If text is too short or empty, provide minimal fallback
        if not claims:
            claims = [
                Claim(
                    claim_id="C001",
                    claim=answer.strip() or "No substantive content provided.",
                    importance=0.5,
                    requires_verification=False
                )
            ]

        # 3. Normalization, Retrieval & Verification per Claim
        all_evidence: List[EvidenceItem] = []
        all_results: List[VerificationResult] = []
        ev_counter = 1

        for idx, claim in enumerate(claims):
            if progress_cb:
                progress_cb("PROCESSING_CLAIM", {
                    "index": idx + 1,
                    "total": len(claims),
                    "claim_id": claim.claim_id,
                    "claim_text": claim.claim
                })

            # Normalization
            normalized = self.normalizer.normalize(claim)

            # Retrieval
            claim_evidences = await self.retriever.retrieve_for_claim(
                claim, normalized, evidence_counter_start=ev_counter
            )
            ev_counter += len(claim_evidences)
            all_evidence.extend(claim_evidences)

            # Verification
            verif_result = await self.verifier.verify(claim, claim_evidences)

            # Critic Pass (Audit)
            if enable_critic:
                verif_result, _ = self.critic.critique(claim, verif_result, claim_evidences)

            all_results.append(verif_result)

        # 4. Scoring Engine
        if progress_cb:
            progress_cb("CALCULATING_SCORES", {})
        reliability, risk, breakdown, score_explanation = self.scorer.calculate_scores(
            claims, all_results
        )

        # 5. Build Report Object
        report = VerificationReport(
            report_id=report_id,
            question=question,
            answer=answer,
            model_name=model_name,
            created_at=datetime.now(timezone.utc).isoformat(),
            overall_reliability=reliability,
            hallucination_risk=risk,
            score_calculation_breakdown=breakdown,
            summary_counts=breakdown.get("summary_counts", {}),
            claims=claims,
            evidence=all_evidence,
            results=all_results,
            explanation=score_explanation
        )

        # 6. Save to Database
        try:
            ReportRepository.save_report(report)
        except Exception:
            pass

        if progress_cb:
            progress_cb("COMPLETE", {"report_id": report_id})

        return report
