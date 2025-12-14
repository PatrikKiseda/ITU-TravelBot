# Author:             Patrik Kišeda ( xkised00 )
# File:                   session.py
# Functionality :   database model for user sessions

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class SessionModel(SQLModel, table=True):
    # stores user session information
	__tablename__ = "session"
	id: str = Field(primary_key=True, index=True)
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
