from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class CustomerNote(SQLModel, table=True):
	__tablename__ = "customer_note"
	id: str = Field(primary_key=True, index=True)
	customer_session_id: str = Field(index=True, nullable=False)
	offer_id: str = Field(foreign_key="agency_offer.id", index=True, nullable=False)
	note_text: str
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
	updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

