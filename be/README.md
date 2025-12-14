# ITU Travel Backend (Explore/Planner)

FastAPI backend for the travel advisor app with travel agent panel and customer flow. Uses SQLModel + SQLite locally.

## Quickstart

### Local Development

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\Activate.ps1

# Install dependencies
pip install -r be/requirements.txt

# Copy environment file
cp be/.env.example be/.env
# Edit be/.env with your API keys if using OpenAI/Images

# Start server
cd be
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or use the dev script:
```bash
bash be/scripts/dev.sh
```

## Test

```bash
bash be/scripts/test.sh
# Or manually:
cd be
pytest -v tests/
```
