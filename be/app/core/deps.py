# Author:             Patrik Kišeda ( xkised00 )
# File:                   deps.py
# Functionality :   dependency injection functions for database and session management

from typing import Generator
from fastapi import Depends, Request
from sqlmodel import Session, create_engine
from app.core.config import settings

_engine = create_engine(settings.DB_URL, echo=False)


def get_engine():
	# returns the database engine
	return _engine


def get_db() -> Generator[Session, None, None]:
	# provides database session dependency
	session = Session(_engine)
	try:
		yield session
	finally:
		session.close()


def get_session_id(request: Request) -> str:
	# extracts session id from request state or cookies
	sid = getattr(request.state, "session_id", None)
	if not sid:
		# Fallback to cookie if middleware not yet set state
		sid = request.cookies.get("sessionId")
	return sid or "anon"
