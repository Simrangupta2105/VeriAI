import asyncio
import time
from backend.app.services.pipeline import PipelineOrchestrator

async def run_test():
    orchestrator = PipelineOrchestrator()

    test_cases = [
        {
            "q": "Who is the father of the nation of India?",
            "a": "Donald Trump is the father of the nation of India."
        },
        {
            "q": "When was SpaceX founded and by whom?",
            "a": "SpaceX was founded by Elon Musk in 2002."
        }
    ]

    for tc in test_cases:
        print(f"\n==========================================")
        print(f"Testing Answer: '{tc['a']}'")
        t0 = time.time()
        report = await orchestrator.run(
            question=tc["q"],
            answer=tc["a"],
            enable_critic=True
        )
        dur = round(time.time() - t0, 2)
        print(f"Duration: {dur}s")
        print(f"Report ID: {report.report_id}")
        print(f"Overall Reliability: {report.overall_reliability}/100")
        print(f"Hallucination Risk: {report.hallucination_risk}%")
        print(f"Summary Counts: {report.summary_counts}")
        for r in report.results:
            print(f"-> Claim Result [{r.verdict}]: {r.reason[:140]}...")
            print(f"   Cited Evidence: {r.evidence_ids} (Avg Quality: {r.source_quality_avg}/100)")
        for ev in report.evidence:
            print(f"   * [{ev.evidence_id}] {ev.source_title} ({ev.source_quality_score}/100): \"{ev.snippet[:80]}...\"")

if __name__ == "__main__":
    asyncio.run(run_test())
