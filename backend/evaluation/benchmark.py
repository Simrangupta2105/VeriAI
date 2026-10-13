import asyncio
import json
import time
from pathlib import Path
from typing import Dict, Any, List
from tabulate import tabulate

from backend.app.services.pipeline import PipelineOrchestrator
from backend.app.models.schemas import VerdictType

async def run_benchmark(cases_path: Path = None) -> Dict[str, Any]:
    if cases_path is None:
        cases_path = Path(__file__).parent / "adversarial_cases.json"

    with open(cases_path, "r", encoding="utf-8") as f:
        cases = json.load(f)

    pipeline = PipelineOrchestrator()
    results = []

    tp = 0  # Flagged hallucination correctly
    fp = 0  # Flagged hallucination on factual text
    fn = 0  # Missed hallucination
    tn = 0  # Accepted factual text correctly

    latencies = []
    verdict_matches = 0
    total_eval_claims = 0
    confidence_sum = 0.0

    print("\n" + "="*70)
    print("      RUNNING AI HALLUCINATION VERIFIER ADVERSARIAL BENCHMARK")
    print("="*70 + "\n")

    for case in cases:
        cid = case["id"]
        category = case["category"]
        question = case["question"]
        answer = case["answer"]
        gt_hallucination = case["ground_truth_hallucination"]

        print(f"[>] Testing [{cid}] {category}...")
        t0 = time.time()
        report = await pipeline.run(
            question=question,
            answer=answer,
            model_name="benchmark-evaluator",
            enable_critic=True
        )
        elapsed = time.time() - t0
        latencies.append(elapsed)

        # Determine if system flagged hallucination (contradicted claim or low reliability)
        has_contradiction = report.summary_counts.get("contradicted", 0) > 0
        detected_hallucination = has_contradiction or (report.hallucination_risk >= 30.0)

        if gt_hallucination and detected_hallucination:
            tp += 1
            status = "TP (Detected)"
        elif not gt_hallucination and detected_hallucination:
            fp += 1
            status = "FP (False Alarm)"
        elif gt_hallucination and not detected_hallucination:
            fn += 1
            status = "FN (Missed)"
        else:
            tn += 1
            status = "TN (Clean)"

        # Check claim verdict alignment
        case_verdicts = [r.verdict.value for r in report.results]
        for exp in case.get("expected_claims", []):
            exp_v = exp["expected_verdict"]
            total_eval_claims += 1
            if exp_v in case_verdicts:
                verdict_matches += 1

        # Track average confidence
        for r in report.results:
            confidence_sum += r.confidence

        results.append({
            "id": cid,
            "category": category,
            "reliability": f"{report.overall_reliability}/100",
            "risk": f"{report.hallucination_risk}%",
            "detected_verdicts": ", ".join(set(case_verdicts)),
            "time_sec": f"{elapsed:.2f}s",
            "eval_status": status
        })

    # Metrics computation
    precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 1.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    verif_accuracy = (verdict_matches / total_eval_claims) if total_eval_claims > 0 else 1.0
    mean_conf = confidence_sum / max(1, total_eval_claims)
    calibration_error = abs(mean_conf - verif_accuracy)
    avg_latency = sum(latencies) / len(latencies) if latencies else 0.0

    print("\n" + tabulate(results, headers="keys", tablefmt="github"))

    summary_metrics = {
        "total_test_cases": len(cases),
        "true_positives": tp,
        "false_positives": fp,
        "false_negatives": fn,
        "true_negatives": tn,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "verification_accuracy": round(verif_accuracy, 4),
        "mean_confidence": round(mean_conf, 4),
        "expected_calibration_error": round(calibration_error, 4),
        "average_latency_sec": round(avg_latency, 2),
    }

    print("\n" + "="*50)
    print("         BENCHMARK EVALUATION SUMMARY")
    print("="*50)
    for k, v in summary_metrics.items():
        print(f"  {k:30}: {v}")
    print("="*50 + "\n")

    out_file = Path(__file__).parent / "benchmark_results.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({"metrics": summary_metrics, "cases": results}, f, indent=2)

    return summary_metrics

if __name__ == "__main__":
    asyncio.run(run_benchmark())
