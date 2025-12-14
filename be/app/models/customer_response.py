# Author:             Patrik Kišeda ( xkised00 )
# File:                   customer_response.py
# Functionality :   database model for customer responses to offers

from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, UniqueConstraint


class ResponseStatus(str):
	ACCEPTED = "ACCEPTED"
	REJECTED = "REJECTED"
	UNDECIDED = "UNDECIDED"


class CustomerResponse(SQLModel, table=True):
	# tracks customer status for each offer
	__tablename__ = "customer_response"
	__table_args__ = (UniqueConstraint("customer_session_id", "offer_id", name="uq_customer_offer"),)
	id: str = Field(primary_key=True, index=True)
	# customer session identifier
	customer_session_id: str = Field(index=True, nullable=False)
	# reference to the offer
	offer_id: str = Field(foreign_key="agency_offer.id", index=True, nullable=False)
	# current response status
	response_status: str = Field(default=ResponseStatus.ACCEPTED)
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

