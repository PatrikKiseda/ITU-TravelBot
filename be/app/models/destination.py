from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class Destination(SQLModel, table=True):
	__tablename__ = "destination"
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
	tags: Optional[str] = None
	long_description: Optional[str] = None
	highlights: Optional[str] = None  # JSON array string
	why_visit: Optional[str] = None   # JSON array string
	things_to_consider: Optional[str] = None  # JSON array string
	starred: bool = Field(default=False)
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
