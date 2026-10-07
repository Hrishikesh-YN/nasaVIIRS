@echo off
title Start Backend - NASA VIIRS Fire Risk ML API
cd /d "%~dp0"
echo =========================================================
echo Starting NASA VIIRS FastAPI Backend on http://localhost:8000
echo =========================================================
python -m backend.main
pause
