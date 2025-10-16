from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class SessionModel(SQLModel, table=True):
	__tablename__ = "session"
	id: str = Field(primary_key=True, index=True)
	created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
