# Author:             Patrik Kišeda ( xkised00 )
# File:                   envelope.py
# Functionality :   response envelope schema for api responses

from pydantic import BaseModel
from typing import Generic, Optional, TypeVar

T = TypeVar("T")


class ErrorEnvelope(BaseModel):
	# error response structure
	code: str
	message: str


class ResponseEnvelope(BaseModel, Generic[T]):
	# unified response envelope for all api endpoints
	data: Optional[T]
	error: Optional[ErrorEnvelope] = None

	@staticmethod
	def ok(payload):
		return {"data": payload, "error": None}

	@staticmethod
	def err(code: str, message: str):
		return {"data": None, "error": {"code": code, "message": message}}
