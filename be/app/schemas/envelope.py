from pydantic import BaseModel
from typing import Generic, Optional, TypeVar

T = TypeVar("T")


class ErrorEnvelope(BaseModel):
	code: str
	message: str


class ResponseEnvelope(BaseModel, Generic[T]):
	data: Optional[T]
	error: Optional[ErrorEnvelope] = None

	@staticmethod
	def ok(payload):
		return {"data": payload, "error": None}

	@staticmethod
	def err(code: str, message: str):
		return {"data": None, "error": {"code": code, "message": message}}
