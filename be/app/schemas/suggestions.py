from typing import List, Optional
from pydantic import BaseModel


class PriceBand(BaseModel):
	min: Optional[int] = None
	max: Optional[int] = None


class PriceBreakdown(BaseModel):
	flight: PriceBand
	stay: PriceBand
	food: PriceBand


class SuggestFilters(BaseModel):
	regions: Optional[List[str]] = None
	origin: Optional[str] = None
	partySize: Optional[int] = None
	when: Optional[str] = None
	stayType: Optional[List[str]] = None
	budgetEUR: Optional[dict] = None
	transport: Optional[List[str]] = None


class ProposalDTO(BaseModel):
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
	status: str


class ExplorationSuggestionDTO(BaseModel):
	title: str
	country: str
	shortDescription: str
	approxPriceEUR: int
	priceNote: str
	tags: List[str]
	price: PriceBreakdown
	image_url: Optional[str] = None
	image_credit_source: Optional[str] = None
	image_credit_author: Optional[str] = None
	image_credit_link: Optional[str] = None
