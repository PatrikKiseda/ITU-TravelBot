from datetime import datetime, date, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class TransportMode(str):
	TRAIN_BUS = "train_bus"
	PLANE = "plane"
	CAR_OWN = "car_own"
	NONE = "none"


class AgencyOffer(SQLModel, table=True):
	__tablename__ = "agency_offer"
	id: str = Field(primary_key=True, index=True)
	agent_session_id: str = Field(index=True, nullable=False)  # Single agent for school project
	destination_name: str
	country: str
	city: Optional[str] = None
	origin: str  # where from
	destination_where_to: str  # where to
	capacity_available: int = Field(default=0)
	capacity_total: int = Field(default=0)
	date_from: date
	date_to: date
	season: str  # "summer", "winter", "spring", "autumn"
	type_of_stay: Optional[str] = None  # JSON array string: ["relax", "sightseeing", etc.]
	price_housing: int
	price_food: int = Field(default=0)  # 0 means not included
	price_transport_mode: str = Field(default=TransportMode.NONE)  # train_bus, plane, car_own, none
	price_transport_amount: Optional[int] = None  # nullable if car_own or none
	short_description: str
	extended_description: Optional[str] = None
	highlights: Optional[str] = None  # JSON array string
	why_visit: Optional[str] = None  # JSON array string
	things_to_consider: Optional[str] = None  # JSON array string
	image_url: Optional[str] = None
	image_credit_source: Optional[str] = None
	image_credit_author: Optional[str] = None
	image_credit_link: Optional[str] = None
	tags: Optional[str] = None  # JSON array string
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
	updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

