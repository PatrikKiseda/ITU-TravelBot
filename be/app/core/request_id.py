import uuid
from typing import Callable
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


class RequestIdMiddleware(BaseHTTPMiddleware):
	HEADER_NAME = "X-Request-ID"

	async def dispatch(self, request: Request, call_next: Callable):
		req_id = request.headers.get(self.HEADER_NAME) or str(uuid.uuid4())
		request.state.request_id = req_id
		response = await call_next(request)
		response.headers[self.HEADER_NAME] = req_id
		return response
