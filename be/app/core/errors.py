# Author:             Patrik Kišeda ( xkised00 )
# File:                   errors.py
# Functionality :   exception handlers for api error responses

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.validation import ValidationError


def _code_for_status(status_code: int) -> str:
	# maps http status codes to error codes
	if status_code == 400:
		return "VALIDATION_ERROR"
	if status_code == 404:
		return "NOT_FOUND"
	if status_code == 424:
		return "UPSTREAM_FAIL"
	if status_code == 429:
		return "RATE_LIMIT"
	return "HTTP_ERROR"


def add_exception_handlers(app: FastAPI) -> None:
	# registers exception handlers for the application
	@app.exception_handler(ValidationError)
	async def custom_validation_error_handler(request: Request, exc: ValidationError):
		return JSONResponse(status_code=400, content={"data": None, "error": {"code": "VALIDATION_ERROR", "message": str(exc)}})

	@app.exception_handler(RequestValidationError)
	async def validation_error_handler(request: Request, exc: RequestValidationError):
		return JSONResponse(status_code=400, content={"data": None, "error": {"code": "VALIDATION_ERROR", "message": "Invalid request"}})

	@app.exception_handler(StarletteHTTPException)
	async def http_exception_handler(request: Request, exc: StarletteHTTPException):
		code = _code_for_status(exc.status_code)
		message = exc.detail if isinstance(exc.detail, str) else "HTTP error"
		return JSONResponse(status_code=exc.status_code, content={"data": None, "error": {"code": code, "message": message}})

	@app.exception_handler(Exception)
	async def unhandled_exception_handler(request: Request, exc: Exception):
		return JSONResponse(status_code=500, content={"data": None, "error": {"code": "INTERNAL_ERROR", "message": "Unexpected server error"}})
