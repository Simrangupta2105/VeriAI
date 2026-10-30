import asyncio
import json
import time
import sys
from pathlib import Path
from backend.app.services.pipeline import PipelineOrchestrator

async def run_30_case_benchmark():
    json_path = Path(__file__).parent / "benchmark_30_cases.json"
    with open(json_path, "r", encoding="utf-8") as f:
        cases = json.load(f)

    pipeline = PipelineOrchestrator()
    results = []

    print("=" * 80)
    print("RUNNING 30-CASE DUAL ENGINE BENCHMARK (GEMINI API + MULTI-AGENT HEURISTICS)")
    print("=" * 80)

    correct_detections = 0
    total_cases = len(cases)

    for i, c in enumerate(cases, start=1):
        cid = c["id"]
        cat = c["category"]
        q = c["question"]
        ans = c["answer"]
        gt_hallucination = c["ground_truth_hallucination"]
        expected_v = c["expected_verdict"]

        print(f"\n[{i}/{total_cases}] Evaluating {cid} ({cat})...")
        t0 = time.time()
        rep = await pipeline.run(question=q, answer=ans, enable_critic=True)
        dur = round(time.time() - t0, 2)

        verdict = rep.results[0].verdict.value if rep.results else "UNVERIFIED"
        reason = rep.results[0].reason if rep.results else "No details"
        rel_score = rep.overall_reliability
        risk_score = rep.hallucination_risk

        # Determine success
        # For hallucinations: PASS if verdict is CONTRADICTED or PARTIALLY_SUPPORTED or UNVERIFIED (hallucination risk > 25%)
        # For true facts: PASS if verdict is SUPPORTED (hallucination risk < 15%)
        if gt_hallucination:
            passed = verdict in ("CONTRADICTED", "PARTIALLY_SUPPORTED", "UNVERIFIED") and risk_score >= 20.0
        else:
            passed = verdict == "SUPPORTED" and risk_score <= 15.0

        if passed:
            correct_detections += 1
            status = "PASS"
        else:
            status = "FAIL"

        print(f"    --> Verdict: {verdict} | Reliability: {rel_score:.1f} | Risk: {risk_score:.1f}% | Time: {dur}s [{status}]")
        print(f"    --> Reason: {reason[:90]}...")

        results.append({
            "id": cid,
            "category": cat,
            "question": q,
            "answer": ans,
            "ground_truth_hallucination": gt_hallucination,
            "expected_verdict": expected_v,
            "system_verdict": verdict,
            "reliability_score": rel_score,
            "hallucination_risk": risk_score,
            "passed": passed,
            "latency": dur,
            "reason": reason
        })

    accuracy = (correct_detections / total_cases) * 100
    print("\n" + "=" * 80)
    print(f"BENCHMARK COMPLETED: {correct_detections}/{total_cases} PASSED ({accuracy:.1f}% ACCURACY)")
    print("=" * 80)

    out_json = Path(__file__).parent / "benchmark_30_results.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump({
            "accuracy": accuracy,
            "total_cases": total_cases,
            "passed_cases": correct_detections,
            "results": results
        }, f, indent=2)

if __name__ == "__main__":
    asyncio.run(run_30_case_benchmark())
