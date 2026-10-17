import json
from typing import Optional, List, Dict, Any
from backend.app.database.session import get_db
from backend.app.models.schemas import VerificationReport

class ReportRepository:
    @staticmethod
    def save_report(report: VerificationReport) -> None:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT OR REPLACE INTO reports (
                    report_id, question, answer, model_name, created_at,
                    overall_reliability, hallucination_risk, summary_counts,
                    score_breakdown, explanation, raw_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    report.report_id,
                    report.question,
                    report.answer,
                    report.model_name,
                    report.created_at,
                    report.overall_reliability,
                    report.hallucination_risk,
                    json.dumps(report.summary_counts),
                    json.dumps(report.score_calculation_breakdown),
                    report.explanation,
                    report.model_dump_json()
                )
            )

            # Insert claims
            for claim in report.claims:
                result = next((r for r in report.results if r.claim_id == claim.claim_id), None)
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO claims (
                        claim_id, report_id, claim_text, claim_type,
                        importance, requires_verification, verdict, confidence
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        claim.claim_id,
                        report.report_id,
                        claim.claim,
                        claim.claim_type.value,
                        claim.importance,
                        1 if claim.requires_verification else 0,
                        result.verdict.value if result else None,
                        result.confidence if result else None
                    )
                )

            # Insert evidence
            for ev in report.evidence:
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO evidence (
                        evidence_id, report_id, claim_id, source_title,
                        source_url, source_domain, source_type, snippet,
                        relevance, source_quality_score
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        ev.evidence_id,
                        report.report_id,
                        ev.claim_id,
                        ev.source_title,
                        ev.source_url,
                        ev.source_domain,
                        ev.source_type,
                        ev.snippet,
                        ev.relevance,
                        ev.source_quality_score
                    )
                )
            conn.commit()

    @staticmethod
    def get_report_by_id(report_id: str) -> Optional[VerificationReport]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT raw_json FROM reports WHERE report_id = ?", (report_id,))
            row = cursor.fetchone()
            if not row:
                return None
            data = json.loads(row["raw_json"])
            return VerificationReport(**data)

    @staticmethod
    def list_reports(limit: int = 20) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT report_id, question, model_name, created_at,
                       overall_reliability, hallucination_risk, summary_counts
                FROM reports
                ORDER BY created_at DESC
                LIMIT ?
                """,
                (limit,)
            )
            rows = cursor.fetchall()
            results = []
            for r in rows:
                results.append({
                    "report_id": r["report_id"],
                    "question": r["question"],
                    "model_name": r["model_name"],
                    "created_at": r["created_at"],
                    "overall_reliability": r["overall_reliability"],
                    "hallucination_risk": r["hallucination_risk"],
                    "summary_counts": json.loads(r["summary_counts"]) if r["summary_counts"] else {}
                })
            return results
