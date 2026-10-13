#!/usr/bin/env python3
import sys
import os
import argparse
import subprocess
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

def run_server(host: str = "127.0.0.1", port: int = 8000, reload: bool = True):
    print("=" * 70)
    print("   AI HALLUCINATION DETECTION & VERIFICATION SYSTEM")
    print("=" * 70)
    print(f"[>] Dashboard UI : http://{host}:{port}")
    print(f"[>] API Docs (UI): http://{host}:{port}/docs")
    print(f"[>] Health Check : http://{host}:{port}/api/health")
    print("=" * 70)
    import uvicorn
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=reload)

def run_tests():
    print("[>] Running pytest test suite...")
    ret = subprocess.run([sys.executable, "-m", "pytest", "backend/tests", "-v"])
    sys.exit(ret.returncode)

def run_benchmark():
    print("[>] Running Adversarial Benchmark Suite...")
    import asyncio
    from backend.evaluation.benchmark import run_benchmark as exec_benchmark
    asyncio.run(exec_benchmark())

def main():
    parser = argparse.ArgumentParser(description="AI Hallucination Detection & Verification System Launcher")
    parser.add_argument("--test", action="store_true", help="Run the test suite")
    parser.add_argument("--benchmark", action="store_true", help="Run the adversarial evaluation benchmark")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind server (default: 8000)")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host to bind server (default: 127.0.0.1)")

    args = parser.parse_args()

    if args.test:
        run_tests()
    elif args.benchmark:
        run_benchmark()
    else:
        run_server(host=args.host, port=args.port)

if __name__ == "__main__":
    main()
