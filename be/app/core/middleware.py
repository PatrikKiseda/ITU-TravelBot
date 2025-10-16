import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings


class SessionCookieMiddleware(BaseHTTPMiddleware):
	COOKIE_NAME = "sessionId"

	async def dispatch(self, request: Request, call_next: Callable):
		response: Response
		session_id = request.cookies.get(self.COOKIE_NAME)
		if not session_id:
			session_id = str(uuid.uuid4())
			request.state.session_id = session_id
			response = await call_next(request)
			response.set_cookie(
				key=self.COOKIE_NAME,
				value=session_id,
				http_only=True,
				secure=False,
				samesite="lax",
			)
			return response
		request.state.session_id = session_id
		response = await call_next(request)
		return response


class SimpleRateLimiter(BaseHTTPMiddleware):
	"""Naive in-memory token bucket keyed by sessionId and path key."""

	WINDOW = 60

	def __init__(self, app, limit_per_minute: int):
		super().__init__(app)
		self.limit = max(1, limit_per_minute)
		self.bucket: dict[str, list[float]] = {}

	def _key(self, request: Request) -> str:
		path_key = "rl:suggest" if request.url.path.endswith("/suggest") else (
			"rl:expand" if request.url.path.endswith("/expand") else (
				"rl:customize" if request.url.path.endswith("/customize") else ""
			)
		)
		sid = request.cookies.get("sessionId") or getattr(request.state, "session_id", None) or "anon"
		return f"{sid}:{path_key}"

	async def dispatch(self, request: Request, call_next: Callable):
		path = request.url.path
		if not (path.endswith("/suggest") or path.endswith("/expand") or path.endswith("/customize")):
			return await call_next(request)
		now = time.time()
		key = self._key(request)
		window_start = now - self.WINDOW
		entries = [ts for ts in self.bucket.get(key, []) if ts > window_start]
		if len(entries) >= self.limit:
			from fastapi.responses import JSONResponse
			return JSONResponse(status_code=429, content={"data": None, "error": {"code": "RATE_LIMIT", "message": "Too many requests"}})
		entries.append(now)
		self.bucket[key] = entries
		return await call_next(request)
