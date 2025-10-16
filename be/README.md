# ITU Travel Backend (Explore/Planner)

FastAPI backend for the travel advisor app. Uses SQLModel + SQLite locally and stubbed LLM/Image providers.

## Quickstart

```bash
python -m venv .venv && . .venv/Scripts/activate  # Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r be/requirements.txt
uvicorn app.main:app --reload --app-dir be
```

Create a `.env` based on `.env.example` in `be/`.

## Test

```bash
pytest -q
```

## Key Endpoints (v1)
- POST `/api/v1/suggest`
- GET `/api/v1/proposals`
- POST `/api/v1/proposals/{proposalId}/accept`
- POST `/api/v1/proposals/{proposalId}/reject`
- GET `/api/v1/destinations`
- PATCH `/api/v1/destinations/{id}/star`
- DELETE `/api/v1/destinations/{id}`
- POST `/api/v1/destinations/{id}/expand`
- POST `/api/v1/destinations/{id}/customize`
- GET `/api/v1/lists`
- POST `/api/v1/lists`
- POST `/api/v1/lists/{listId}/items`
- POST `/api/v1/lists/{listId}/items/bulk`
- DELETE `/api/v1/lists/{listId}/items/{destinationId}`
- GET `/api/v1/lists/{listId}`

## OpenAPI JSON
- Visit `/openapi.json` or export:

```bash
curl http://localhost:8000/openapi.json -o openapi.json
```

## Curl sanity
See spec; example:

```bash
curl -X POST http://localhost:8000/api/v1/suggest \
  -H 'Content-Type: application/json' \
  -d '{"regions":["Oceania"],"origin":"Secovce","partySize":2,"budgetEUR":{"min":800,"max":2000},"transport":["plane"]}'
```
