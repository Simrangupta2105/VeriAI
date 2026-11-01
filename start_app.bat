@echo off
title VeriAI - Factual AI Claim Verification System
echo ============================================================
echo   Starting VeriAI Server & Dashboard...
echo ============================================================
cd /d "%~dp0"

if not exist "frontend\dist" (
    echo [>] First run detected: Building modern React frontend...
    cd frontend
    call npm run build
    cd ..
)

echo App Dashboard URL: http://127.0.0.1:8000
echo.
if exist ".venv\Scripts\python.exe" (
    .venv\Scripts\python.exe run.py --host 0.0.0.0 --port 8000
) else (
    python run.py --host 0.0.0.0 --port 8000
)
pause
