# API Documentation

Complete reference for all API endpoints in the ITU Travel Backend.

## Base URL

- Local: `http://localhost:8000`
- Production: `https://travelbot.yourdomain.com`

## Response Format

All endpoints return a JSON envelope:

```json
{
  "data": <response_data>,
  "error": null
}
```

Errors:
```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

## Authentication

All endpoints use session-based authentication via HTTP-only cookies:
- Cookie name: `sessionId`
- Automatically created on first request
- Persists across requests

## Agent Panel Endpoints

### List & Filter Offers

```
GET /api/v1/agent/offers
```

Query parameters:
- `origin` (string): Filter by origin city
- `destination` (string): Filter by destination
- `capacity_min` (int): Minimum capacity
- `capacity_max` (int): Maximum capacity
- `date_from` (date): Filter by start date
- `date_to` (date): Filter by end date
- `season` (string): Filter by season (summer/winter/spring/autumn)
- `type_of_stay` (string): Comma-separated list (e.g., "beach,city")
- `price_min` (int): Minimum total price
- `price_max` (int): Maximum total price
- `transport_mode` (string): Filter by transport mode (train_bus/plane/car_own/none)

Response: Array of `AgencyOffer` objects

### Create Offer

```
POST /api/v1/agent/offers
```

Body:
```json
{
  "destination_name": "Barcelona",
  "country": "Spain",
  "city": "Barcelona",
  "origin": "Prague",
  "destination_where_to": "Barcelona",
  "capacity_available": 10,
  "capacity_total": 10,
  "date_from": "2025-06-01",
  "date_to": "2025-06-08",
  "season": "summer",
  "type_of_stay": ["beach", "city"],
  "price_housing": 500,
  "price_food": 200,
  "price_transport_mode": "plane",
  "price_transport_amount": 300,
  "short_description": "A week in vibrant Barcelona",
  "extended_description": "Extended description...",
  "highlights": ["Sagrada Familia", "Beach", "Tapas"],
  "why_visit": ["Great weather", "Rich culture"],
  "things_to_consider": ["Peak season crowds"],
  "tags": ["city", "beach"],
  "image_url": "https://...",
  "image_credit_source": "unsplash",
  "image_credit_author": "Photographer Name",
  "image_credit_link": "https://..."
}
```

### Get Single Offer

```
GET /api/v1/agent/offers/{offer_id}
```

### Update Offer

```
PUT /api/v1/agent/offers/{offer_id}
```

Body: Same as create (partial updates supported)

### Delete Offer

```
DELETE /api/v1/agent/offers/{offer_id}
```

## Customer Offer View

### List Available Offers

```
GET /api/v1/customer/offers
```

Query parameters: Same as agent list (excludes rejected offers)

Response: Array of `AgencyOffer` objects (excluding rejected)

### Accept Offer

```
POST /api/v1/customer/offers/{offer_id}/accept
```

Body: `{}`

### Reject Offer

```
POST /api/v1/customer/offers/{offer_id}/reject
```

Body: `{}`

## Customer Accepted Destinations

### List Accepted Offers

```
GET /api/v1/customer/accepted
```

Query parameters:
- `sort` (string): "price" | "type" | "date" (default: "price")
- `order` (string): "asc" | "desc" (default: "asc")

### Expand Destination Details

```
GET /api/v1/customer/accepted/{offer_id}/expand
```

Response: Full `AgencyOffer` with extended fields

### Add Note

```
POST /api/v1/customer/accepted/{offer_id}/note
```

Body:
```json
{
  "note_text": "Personal note about this destination"
}
```

### Get Note

```
GET /api/v1/customer/accepted/{offer_id}/note
```

### Confirm Travel (Create Order)

```
POST /api/v1/customer/accepted/{offer_id}/confirm
```

Body:
```json
{
  "number_of_people": 2,
  "selected_transport_mode": "plane"
}
```

Response: `CustomerOrder` object with status "PENDING"

## Customer Orders

### List Orders

```
GET /api/v1/customer/orders
```

Query parameters:
- `status` (string, optional): Filter by status (PENDING/CONFIRMED/CANCELLED)

### Get Order Details

```
GET /api/v1/customer/orders/{order_id}
```

Response:
```json
{
  "order": <CustomerOrder>,
  "offer": <AgencyOffer>,
  "remaining_capacity": 3,
  "total_price": 1000
}
```

### Update Order

```
PUT /api/v1/customer/orders/{order_id}
```

Body:
```json
{
  "number_of_people": 3,
  "selected_transport_mode": "train_bus"
}
```

Note: Only works for PENDING orders

### Final Confirm Order

```
POST /api/v1/customer/orders/{order_id}/confirm
```

Body: `{}`

Decrements capacity and sets order status to CONFIRMED

### Cancel Order

```
POST /api/v1/customer/orders/{order_id}/cancel
```

Body: `{}`

Restores capacity if order was CONFIRMED

## Exploration Mode

### Generate Suggestions

```
POST /api/v1/customer/explore
```

Body:
```json
{
  "regions": ["Oceania"],
  "origin": "Prague",
  "partySize": 2,
  "when": "2025-06",
  "stayType": ["beach", "islands"],
  "budgetEUR": {"min": 800, "max": 2000},
  "transport": ["plane"]
}
```

Response: Array of 5 destination suggestions with images

**Rate Limit**: 10 requests per minute per session

## Legacy Endpoints

These endpoints are maintained for backward compatibility:

- `POST /api/v1/suggest` - LLM suggestions (legacy)
- `GET /api/v1/proposals` - List proposals
- `POST /api/v1/proposals/{id}/accept` - Accept proposal
- `POST /api/v1/proposals/{id}/reject` - Reject proposal
- `GET /api/v1/destinations` - List destinations
- `PATCH /api/v1/destinations/{id}/star` - Toggle star
- `DELETE /api/v1/destinations/{id}` - Delete destination
- `POST /api/v1/destinations/{id}/expand` - Expand destination
- `POST /api/v1/destinations/{id}/customize` - Customize destination

## Error Codes

- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `RATE_LIMIT` - Too many requests
- `UPSTREAM_FAIL` - External API failure (OpenAI, Images)
- `INSUFFICIENT_CAPACITY` - Not enough capacity available

## Data Models

### AgencyOffer

```json
{
  "id": "offer_abc123",
  "agent_session_id": "agent-123",
  "destination_name": "Barcelona",
  "country": "Spain",
  "city": "Barcelona",
  "origin": "Prague",
  "destination_where_to": "Barcelona",
  "capacity_available": 8,
  "capacity_total": 10,
  "date_from": "2025-06-01",
  "date_to": "2025-06-08",
  "season": "summer",
  "type_of_stay": "[\"beach\",\"city\"]",
  "price_housing": 500,
  "price_food": 200,
  "price_transport_mode": "plane",
  "price_transport_amount": 300,
  "short_description": "A week in vibrant Barcelona",
  "extended_description": "Extended description...",
  "highlights": "[\"Sagrada Familia\",\"Beach\"]",
  "why_visit": "[\"Great weather\",\"Rich culture\"]",
  "things_to_consider": "[\"Peak season crowds\"]",
  "tags": "[\"city\",\"beach\"]",
  "image_url": "https://...",
  "image_credit_source": "unsplash",
  "image_credit_author": "Photographer Name",
  "image_credit_link": "https://...",
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-01T12:00:00Z"
}
```

### CustomerOrder

```json
{
  "id": "order_xyz789",
  "customer_session_id": "customer-456",
  "offer_id": "offer_abc123",
  "number_of_people": 2,
  "selected_transport_mode": "plane",
  "order_status": "PENDING",
  "created_at": "2025-01-01T12:00:00Z",
  "confirmed_at": null
}
```

## Health Check

```
GET /health
```

Response:
```json
{
  "data": {
    "status": "ok",
    "database": "ok"
  },
  "error": null
}
```

## OpenAPI Specification

Full OpenAPI 3.0 specification available at:
- `/openapi.json`
- `/docs` (Swagger UI)

Export:
```bash
curl http://localhost:8000/openapi.json -o openapi.json
```

