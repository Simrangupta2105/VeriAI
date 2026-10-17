from backend.app.models.schemas import VerificationReport, VerdictType

class ReportGeneratorService:
    """Generates plain text and structured verification reports."""

    @staticmethod
    def generate_text_summary(report: VerificationReport) -> str:
        lines = [
            "============================================================",
            "                VERIFICATION AUDIT REPORT                   ",
            "============================================================",
            f"Report ID:          {report.report_id}",
            f"Generated At:       {report.created_at}",
            f"Model Evaluated:    {report.model_name}",
            f"Question:           {report.question}",
            f"Overall Reliability: {report.overall_reliability}/100",
            f"Hallucination Risk:  {report.hallucination_risk}%",
            "",
            "SUMMARY BREAKDOWN:",
            f"  Total Claims:        {report.summary_counts.get('total', 0)}",
            f"  Supported:           {report.summary_counts.get('supported', 0)}",
            f"  Partially Supported: {report.summary_counts.get('partially_supported', 0)}",
            f"  Contradicted:        {report.summary_counts.get('contradicted', 0)}",
            f"  Unverified:          {report.summary_counts.get('unverified', 0)}",
            f"  Not Factual/Opinion: {report.summary_counts.get('not_factual', 0)}",
            "",
            "CLAIMS & EVIDENCE TRACE:",
            "────────────────────────────────────────────────────────────"
        ]

        result_map = {r.claim_id: r for r in report.results}
        evidence_map = {e.evidence_id: e for e in report.evidence}

        for claim in report.claims:
            res = result_map.get(claim.claim_id)
            lines.append(f"\nClaim ID:   {claim.claim_id}")
            lines.append(f"Claim:      {claim.claim}")
            lines.append(f"Type:       {claim.claim_type.value.upper()} | Importance: {claim.importance}")
            if res:
                badge = f"[{res.verdict.value}]"
                lines.append(f"Verdict:    {badge} (Confidence: {res.confidence * 100:.1f}%)")
                lines.append(f"Reason:     {res.reason}")
                lines.append(f"Critic:     {res.critic_status} - {res.critic_notes or 'OK'}")

                if res.evidence_ids:
                    lines.append("Evidence:")
                    for eid in res.evidence_ids:
                        ev = evidence_map.get(eid)
                        if ev:
                            lines.append(f"  • [{eid}] {ev.source_title} ({ev.source_domain}) | Quality: {ev.source_quality_score}/100")
                            lines.append(f"    Excerpt: \"{ev.snippet[:180]}...\"")
                            lines.append(f"    URL: {ev.source_url}")
            lines.append("────────────────────────────────────────────────────────────")

        lines.append(f"\nAUDIT CONCLUSION:\n{report.explanation}")
        lines.append("============================================================")
        return "\n".join(lines)
