#!/bin/bash
# Run tests
cd "$(dirname "$0")/.."
source .venv/bin/activate
PYTHONPATH=. pytest -v tests/

