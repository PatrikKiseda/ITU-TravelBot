from typing import List, Optional
from pydantic import BaseModel


class DestinationDTO(BaseModel):
	id: str
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
	highlights: Optional[str] = None
	why_visit: Optional[str] = None
	things_to_consider: Optional[str] = None
	starred: bool


class ToggleStarBody(BaseModel):
	starred: bool


class ExpandBody(BaseModel):
	forceRefresh: bool = False


class CustomizeBody(BaseModel):
	prompt: str
