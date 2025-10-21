from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from app.api.v1.routes import router as api_v1_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.middleware import SessionCookieMiddleware, SimpleRateLimiter
from app.core.request_id import RequestIdMiddleware
from app.core.errors import add_exception_handlers
from app.core.deps import get_engine

# Ensure models are imported so metadata is registered
from app.models import session as _m_session  # noqa: F401
from app.models import proposal as _m_proposal  # noqa: F401
from app.models import destination as _m_destination  # noqa: F401
from app.models import list as _m_list  # noqa: F401


setup_logging()
app = FastAPI(title="ITU Travel Backend")

# CORS
app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.allowed_origins_list(),
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Request ID
app.add_middleware(RequestIdMiddleware)

# Session cookie + rate limit for LLM endpoints
app.add_middleware(SessionCookieMiddleware)
app.add_middleware(SimpleRateLimiter, limit_per_minute=settings.RATE_LIMIT_PER_MINUTE)

# Error handlers
add_exception_handlers(app)

# Routes
app.include_router(api_v1_router)


@app.on_event("startup")
async def on_startup():
	engine = get_engine()
	SQLModel.metadata.create_all(engine)


@app.get("/health")
async def health():
	return {"data": {"status": "ok"}, "error": None}
