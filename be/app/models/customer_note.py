# Author:             Patrik Kišeda ( xkised00 )
# File:                   customer_note.py
# Functionality :   database model for customer notes on offers

from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class CustomerNote(SQLModel, table=True):
	# stores customer notes for specific offers
	__tablename__ = "customer_note"
	id: str = Field(primary_key=True, index=True)
	# customer session identifier
	customer_session_id: str = Field(index=True, nullable=False)
	# reference to the offer
	offer_id: str = Field(foreign_key="agency_offer.id", index=True, nullable=False)
	# note text content
	note_text: str
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
	updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

