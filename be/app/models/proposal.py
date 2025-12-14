# Author:             Patrik Kišeda ( xkised00 )
# File:                   proposal.py
# Functionality :   database model for legacy proposal system

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class ProposalStatus(str):
	PROPOSAL = "PROPOSAL"
	REJECTED = "REJECTED"


class Proposal(SQLModel, table=True):
	# legacy proposal model for backward compatibility
	__tablename__ = "proposal"
	id: str = Field(primary_key=True, index=True)
	session_id: str = Field(index=True, nullable=False)
	title: str
	country: str
	short_description: str
	approx_price_eur: int
	price_note: Optional[str] = None
	price_flight_min: Optional[int] = None
	price_flight_max: Optional[int] = None
	price_stay_min: Optional[int] = None
	price_stay_max: Optional[int] = None
	price_food_min: Optional[int] = None
	price_food_max: Optional[int] = None
	image_url: Optional[str] = None
	image_credit_source: Optional[str] = None
	image_credit_author: Optional[str] = None
	image_credit_link: Optional[str] = None
	tags: Optional[str] = None  # JSON string or comma-separated
	status: str = Field(default=ProposalStatus.PROPOSAL)
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
