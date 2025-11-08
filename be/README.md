# ITU Travel Backend (Explore/Planner)

FastAPI backend for the travel advisor app with travel agent panel and customer flow. Uses SQLModel + SQLite locally, supports OpenAI/Images APIs for exploration mode.

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
PYTHONPATH=. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
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
PYTHONPATH=. pytest -v tests/
```

## API Endpoints

### Agent Panel Endpoints

- `GET /api/v1/agent/offers` - List & filter offers (async filtering)
- `POST /api/v1/agent/offers` - Create new offer
- `GET /api/v1/agent/offers/{id}` - Get single offer
- `PUT /api/v1/agent/offers/{id}` - Update offer
- `DELETE /api/v1/agent/offers/{id}` - Delete offer

### Customer Offer View

- `GET /api/v1/customer/offers` - List available offers (excludes rejected)
- `POST /api/v1/customer/offers/{id}/accept` - Accept offer
- `POST /api/v1/customer/offers/{id}/reject` - Reject offer

### Customer Accepted Destinations

- `GET /api/v1/customer/accepted` - List accepted offers (with sorting)
- `GET /api/v1/customer/accepted/{id}/expand` - Expand destination details
- `POST /api/v1/customer/accepted/{id}/note` - Add note to offer
- `GET /api/v1/customer/accepted/{id}/note` - Get note
- `POST /api/v1/customer/accepted/{id}/confirm` - Create order

### Customer Orders

- `GET /api/v1/customer/orders` - List orders
- `GET /api/v1/customer/orders/{id}` - Get order details
- `PUT /api/v1/customer/orders/{id}` - Update order
- `POST /api/v1/customer/orders/{id}/confirm` - Final confirm order
- `POST /api/v1/customer/orders/{id}/cancel` - Cancel order

### Exploration Mode (LLM-generated)

- `POST /api/v1/customer/explore` - Generate 5 destination suggestions

### Tag Management

- `GET /api/v1/tags` - List all tags (sorted by popularity)
- `GET /api/v1/tags?type=highlight` - Filter tags by type
- `POST /api/v1/tags` - Create new tag
- `GET /api/v1/tags/{id}` - Get tag details
- `PUT /api/v1/tags/{id}` - Update tag
- `DELETE /api/v1/tags/{id}` - Delete tag
- `POST /api/v1/offers/{offer_id}/tags/{tag_id}` - Add tag to offer
- `DELETE /api/v1/offers/{offer_id}/tags/{tag_id}` - Remove tag from offer
- `GET /api/v1/offers/{offer_id}/tags` - Get all tags for an offer

**Note**: The old `highlights`, `why_visit`, and `things_to_consider` JSON fields from AgencyOffer have been replaced with a reusable Tag system. Tags are now stored separately with automatic usage tracking (quantity) and can be shared across multiple offers.

### Legacy Endpoints (Backward Compatibility)

- `POST /api/v1/suggest` - LLM suggestions (legacy)
- `GET /api/v1/proposals` - List proposals
- `POST /api/v1/proposals/{id}/accept` - Accept proposal
- `POST /api/v1/proposals/{id}/reject` - Reject proposal
- `GET /api/v1/destinations` - List destinations
- `PATCH /api/v1/destinations/{id}/star` - Toggle star
- `DELETE /api/v1/destinations/{id}` - Delete destination
- `POST /api/v1/destinations/{id}/expand` - Expand destination
- `POST /api/v1/destinations/{id}/customize` - Customize destination

## Environment Variables

See `be/.env.example` for all configuration options:

- `DB_URL` - Database connection string (default: SQLite)
- `ALLOWED_ORIGINS` - Comma-separated CORS origins
- `OPENAI_API_KEY` - OpenAI API key for exploration mode
- `OPENAI_MODEL` - Model to use (default: gpt-4o-mini)
- `IMAGE_PROVIDER` - `stub`, `unsplash`, or `pexels`
- `UNSPLASH_KEY` / `PEXELS_API_KEY` - Image API keys
- `RATE_LIMIT_PER_MINUTE` - Rate limit for LLM endpoints
- `RATE_LIMIT_EXPLORE_PER_MINUTE` - Rate limit for exploration

## OpenAPI JSON

Visit `/openapi.json` or export:

```bash
curl http://localhost:8000/openapi.json -o openapi.json
```

## Example Requests

### Create Offer (Agent)

```bash
curl -X POST http://localhost:8000/api/v1/agent/offers \
  -H 'Content-Type: application/json' \
  -d '{
    "destination_name": "Barcelona",
    "country": "Spain",
    "origin": "Prague",
    "destination_where_to": "Barcelona",
    "capacity_available": 10,
    "capacity_total": 10,
    "date_from": "2025-06-01",
    "date_to": "2025-06-08",
    "season": "summer",
    "type_of_stay": ["city", "beach"],
    "price_housing": 500,
    "price_food": 200,
    "price_transport_mode": "plane",
    "price_transport_amount": 300,
    "short_description": "A week in vibrant Barcelona"
  }'
```

### Explore Destinations (Customer)

```bash
curl -X POST http://localhost:8000/api/v1/customer/explore \
  -H 'Content-Type: application/json' \
  -d '{
    "regions": ["Oceania"],
    "origin": "Prague",
    "partySize": 2,
    "when": "2025-06",
    "stayType": ["beach", "islands"],
    "budgetEUR": {"min": 800, "max": 2000},
    "transport": ["plane"]
  }'
```

## Deployment

See `DEPLOYMENT.md` for production deployment instructions.
