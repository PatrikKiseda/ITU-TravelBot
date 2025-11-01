#!/bin/bash
# Start backend with auto-reload
cd "$(dirname "$0")/.."
cd be
source .venv/bin/activate
PYTHONPATH=. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

