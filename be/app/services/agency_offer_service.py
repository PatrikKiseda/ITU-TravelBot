# Author:             Patrik Kišeda ( xkised00 )
# File:                   agency_offer_service.py
# Functionality :   business logic for agency offer management

import json
import uuid
from datetime import date, datetime
from typing import List, Optional, Dict, Any
from sqlmodel import Session
from app.repositories.agency_offer_repo import AgencyOfferRepository
from app.models.agency_offer import AgencyOffer
from app.core.validation import validate_offer_data, ValidationError


class AgencyOfferService:
	# handles offer crud operations for agents
	def __init__(self):
		self.repo = AgencyOfferRepository()

	def list_filtered(
		# lists offers with various filters
		self,
		db: Session,
		agent_session_id: str,
		origin: Optional[str] = None,
		destination: Optional[str] = None,
		capacity_min: Optional[int] = None,
		capacity_max: Optional[int] = None,
		date_from: Optional[date] = None,
		date_to: Optional[date] = None,
		season: Optional[str] = None,
		type_of_stay: Optional[List[str]] = None,
		price_min: Optional[int] = None,
		price_max: Optional[int] = None,
		transport_mode: Optional[str] = None,
	) -> List[AgencyOffer]:
		return self.repo.list_filtered(
			db,
			agent_session_id,
			origin=origin,
			destination=destination,
			capacity_min=capacity_min,
			capacity_max=capacity_max,
			date_from=date_from,
			date_to=date_to,
			season=season,
			type_of_stay=type_of_stay,
			price_min=price_min,
			price_max=price_max,
			transport_mode=transport_mode,
		)

	def create(self, db: Session, agent_session_id: str, data: Dict[str, Any]) -> AgencyOffer:
		# creates a new offer with validation
		validate_offer_data(data)
		offer_id = f"offer_{uuid.uuid4().hex[:12]}"
		type_of_stay_str = json.dumps(data.get("type_of_stay", [])) if data.get("type_of_stay") else None
		highlights_str = json.dumps(data.get("highlights", [])) if data.get("highlights") else None
		why_visit_str = json.dumps(data.get("why_visit", [])) if data.get("why_visit") else None
		things_str = json.dumps(data.get("things_to_consider", [])) if data.get("things_to_consider") else None
		tags_str = json.dumps(data.get("tags", [])) if data.get("tags") else None

		offer = AgencyOffer(
			id=offer_id,
			agent_session_id=agent_session_id,
			destination_name=data["destination_name"],
			country=data["country"],
			city=data.get("city"),
			origin=data["origin"],
			destination_where_to=data["destination_where_to"],
			capacity_available=data["capacity_available"],
			capacity_total=data["capacity_total"],
			date_from=data["date_from"],
			date_to=data["date_to"],
			season=data["season"],
			type_of_stay=type_of_stay_str,
			price_housing=data["price_housing"],
			price_food=data.get("price_food", 0),
			price_transport_mode=data["price_transport_mode"],
			price_transport_amount=data.get("price_transport_amount"),
			short_description=data["short_description"],
			extended_description=data.get("extended_description"),
			highlights=highlights_str,
			why_visit=why_visit_str,
			things_to_consider=things_str,
			image_url=data.get("image_url"),
			image_credit_source=data.get("image_credit_source"),
			image_credit_author=data.get("image_credit_author"),
			image_credit_link=data.get("image_credit_link"),
			tags=tags_str,
		)
		return self.repo.create(db, offer)

	def update(self, db: Session, agent_session_id: str, offer_id: str, data: Dict[str, Any]) -> Optional[AgencyOffer]:
		# updates an existing offer
		# agent_session_id is kept for API consistency but not used in lookup (single agent)
		offer = self.repo.get_by_id(db, None, offer_id)
		if not offer:
			return None

		update_data = data.copy()
		for key in ["date_from", "date_to", "capacity_total", "capacity_available", "price_transport_mode", "price_transport_amount", "price_housing", "price_food"]:
			if key not in update_data:
				update_data[key] = getattr(offer, key)

		validate_offer_data(update_data)

		if "destination_name" in data:
			offer.destination_name = data["destination_name"]
		if "country" in data:
			offer.country = data["country"]
		if "city" in data:
			offer.city = data.get("city")
		if "origin" in data:
			offer.origin = data["origin"]
		if "destination_where_to" in data:
			offer.destination_where_to = data["destination_where_to"]
		if "capacity_available" in data:
			offer.capacity_available = data["capacity_available"]
		if "capacity_total" in data:
			offer.capacity_total = data["capacity_total"]
		if "date_from" in data:
			offer.date_from = data["date_from"]
		if "date_to" in data:
			offer.date_to = data["date_to"]
		if "season" in data:
			offer.season = data["season"]
		if "type_of_stay" in data:
			offer.type_of_stay = json.dumps(data["type_of_stay"]) if data["type_of_stay"] else None
		if "price_housing" in data:
			offer.price_housing = data["price_housing"]
		if "price_food" in data:
			offer.price_food = data.get("price_food", 0)
		if "price_transport_mode" in data:
			offer.price_transport_mode = data["price_transport_mode"]
		if "price_transport_amount" in data:
			offer.price_transport_amount = data.get("price_transport_amount")
		if "short_description" in data:
			offer.short_description = data["short_description"]
		if "extended_description" in data:
			offer.extended_description = data.get("extended_description")
		if "highlights" in data:
			offer.highlights = json.dumps(data["highlights"]) if data.get("highlights") else None
		if "why_visit" in data:
			offer.why_visit = json.dumps(data["why_visit"]) if data.get("why_visit") else None
		if "things_to_consider" in data:
			offer.things_to_consider = json.dumps(data["things_to_consider"]) if data.get("things_to_consider") else None
		if "tags" in data:
			offer.tags = json.dumps(data["tags"]) if data.get("tags") else None
		if "image_url" in data:
			offer.image_url = data.get("image_url")
		if "image_credit_source" in data:
			offer.image_credit_source = data.get("image_credit_source")
		if "image_credit_author" in data:
			offer.image_credit_author = data.get("image_credit_author")
		if "image_credit_link" in data:
			offer.image_credit_link = data.get("image_credit_link")

		return self.repo.update(db, offer)

	def delete(self, db: Session, agent_session_id: str, offer_id: str) -> None:
		# deletes an offer
		# agent_session_id is kept for API consistency but not used (single agent)
		self.repo.delete(db, None, offer_id)

	def get_by_id(self, db: Session, agent_session_id: str, offer_id: str) -> Optional[AgencyOffer]:
		# gets an offer by id
		# agent_session_id is kept for API consistency but not used in lookup (single agent)
		return self.repo.get_by_id(db, None, offer_id)

