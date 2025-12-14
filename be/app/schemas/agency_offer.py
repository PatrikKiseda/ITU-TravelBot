# Author:             Patrik Kišeda ( xkised00 )
# File:                   agency_offer.py
# Functionality :   pydantic schemas for agency offer api requests and responses

from datetime import date
from typing import List, Optional
from pydantic import BaseModel


class AgencyOfferDTO(BaseModel):
	# response dto for agency offers
	id: str
	agent_session_id: str
	destination_name: str
	country: str
	city: Optional[str] = None
	origin: str
	destination_where_to: str
	capacity_available: int
	capacity_total: int
	date_from: date
	date_to: date
	season: str
	type_of_stay: Optional[str] = None
	price_housing: int
	price_food: int
	price_transport_mode: str
	price_transport_amount: Optional[int] = None
	short_description: str
	extended_description: Optional[str] = None
	highlights: Optional[str] = None
	why_visit: Optional[str] = None
	things_to_consider: Optional[str] = None
	image_url: Optional[str] = None
	image_credit_source: Optional[str] = None
	image_credit_author: Optional[str] = None
	image_credit_link: Optional[str] = None
	tags: Optional[str] = None
	created_at: str
	updated_at: str


class CreateAgencyOfferBody(BaseModel):
	destination_name: str
	country: str
	city: Optional[str] = None
	origin: str
	destination_where_to: str
	capacity_available: int
	capacity_total: int
	date_from: date
	date_to: date
	season: str
	type_of_stay: Optional[List[str]] = None
	price_housing: int
	price_food: int = 0
	price_transport_mode: str
	price_transport_amount: Optional[int] = None
	short_description: str
	extended_description: Optional[str] = None
	highlights: Optional[List[str]] = None
	why_visit: Optional[List[str]] = None
	things_to_consider: Optional[List[str]] = None
	image_url: Optional[str] = None
	image_credit_source: Optional[str] = None
	image_credit_author: Optional[str] = None
	image_credit_link: Optional[str] = None
	tags: Optional[List[str]] = None


class UpdateAgencyOfferBody(BaseModel):
	destination_name: Optional[str] = None
	country: Optional[str] = None
	city: Optional[str] = None
	origin: Optional[str] = None
	destination_where_to: Optional[str] = None
	capacity_available: Optional[int] = None
	capacity_total: Optional[int] = None
	date_from: Optional[date] = None
	date_to: Optional[date] = None
	season: Optional[str] = None
	type_of_stay: Optional[List[str]] = None
	price_housing: Optional[int] = None
	price_food: Optional[int] = None
	price_transport_mode: Optional[str] = None
	price_transport_amount: Optional[int] = None
	short_description: Optional[str] = None
	extended_description: Optional[str] = None
	highlights: Optional[List[str]] = None
	why_visit: Optional[List[str]] = None
	things_to_consider: Optional[List[str]] = None
	image_url: Optional[str] = None
	image_credit_source: Optional[str] = None
	image_credit_author: Optional[str] = None
	image_credit_link: Optional[str] = None
	tags: Optional[List[str]] = None


class OfferFilterParams(BaseModel):
	origin: Optional[str] = None
	destination: Optional[str] = None
	capacity_min: Optional[int] = None
	capacity_max: Optional[int] = None
	date_from: Optional[date] = None
	date_to: Optional[date] = None
	season: Optional[str] = None
	type_of_stay: Optional[str] = None  # Comma-separated
	price_min: Optional[int] = None
	price_max: Optional[int] = None
	transport_mode: Optional[str] = None

