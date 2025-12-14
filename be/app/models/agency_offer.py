# Author:             Patrik Kišeda ( xkised00 )
# File:                   agency_offer.py
# Functionality :   database model for travel agency offers

from datetime import datetime, date, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class TransportMode(str):
	TRAIN_BUS = "train_bus"
	PLANE = "plane"
	CAR_OWN = "car_own"
	NONE = "none"


class AgencyOffer(SQLModel, table=True):
	# main offer entity storing destination and pricing information
	__tablename__ = "agency_offer"
	id: str = Field(primary_key=True, index=True)
	agent_session_id: str = Field(index=True, nullable=False)  # Single agent for school project
	# destination name
	destination_name: str
	# country of destination
	country: str
	# city name if applicable
	city: Optional[str] = None
	# origin location
	origin: str
	# destination location
	destination_where_to: str
	# available capacity
	capacity_available: int = Field(default=0)
	# total capacity
	capacity_total: int = Field(default=0)
	# start date of trip
	date_from: date
	# end date of trip
	date_to: date
	# season classification
	season: str
	# type of stay as json string
	type_of_stay: Optional[str] = None
	# housing price
	price_housing: int
	# food price, 0 if not included
	price_food: int = Field(default=0)
	# transport mode
	price_transport_mode: str = Field(default=TransportMode.NONE)
	# transport price amount
	price_transport_amount: Optional[int] = None
	# short description text
	short_description: str
	# extended description text
	extended_description: Optional[str] = None
	# image url for destination
	image_url: Optional[str] = None
	# image credit source
	image_credit_source: Optional[str] = None
	# image credit author
	image_credit_author: Optional[str] = None
	# image credit link
	image_credit_link: Optional[str] = None
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
	updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

