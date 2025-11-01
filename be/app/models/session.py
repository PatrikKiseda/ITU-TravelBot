from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class SessionModel(SQLModel, table=True):
	__tablename__ = "session"
	id: str = Field(primary_key=True, index=True)
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
