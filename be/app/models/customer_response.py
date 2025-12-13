from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, UniqueConstraint


class ResponseStatus(str):
	ACCEPTED = "ACCEPTED"
	REJECTED = "REJECTED"
	UNDECIDED = "UNDECIDED"  # New status for offers user has seen but not decided


class CustomerResponse(SQLModel, table=True):
	__tablename__ = "customer_response"
	__table_args__ = (UniqueConstraint("customer_session_id", "offer_id", name="uq_customer_offer"),)
	id: str = Field(primary_key=True, index=True)
	customer_session_id: str = Field(index=True, nullable=False)
	offer_id: str = Field(foreign_key="agency_offer.id", index=True, nullable=False)
	response_status: str = Field(default=ResponseStatus.ACCEPTED)
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

