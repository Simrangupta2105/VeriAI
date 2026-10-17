@echo off
title AI Hallucination Detector & Verification System
echo ============================================================
echo   Starting AI Hallucination Detector Server...
echo ============================================================
cd /d "%~dp0"
echo Dashboard URL: http://127.0.0.1:8000
echo.
if exist ".venv\Scripts\python.exe" (
    .venv\Scripts\python.exe run.py --host 0.0.0.0 --port 8000
) else (
    python run.py --host 0.0.0.0 --port 8000
)
pause
