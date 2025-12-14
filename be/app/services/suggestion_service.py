# Author:             Patrik Kišeda ( xkised00 )
# File:                   suggestion_service.py
# Functionality :   legacy service for suggestion system

import json
import uuid
from typing import Any, Dict, List
from sqlmodel import Session
from app.repositories.proposal_repo import ProposalRepository
from app.repositories.destination_repo import DestinationRepository
from app.models.proposal import Proposal, ProposalStatus
from app.models.destination import Destination
from app.services.llm_service import LLMService
from app.services.image_service import ImageService


class SuggestionService:
	# handles legacy proposal generation
	def __init__(self, llm: LLMService | None = None, images: ImageService | None = None):
		self.llm = llm or LLMService()
		self.images = images or ImageService()
		self.proposals = ProposalRepository()
		self.destinations = DestinationRepository()

	def generate(self, db: Session, session_id: str, filters: Dict[str, Any]) -> List[Proposal]:
		llm_results = self.llm.suggest_destinations(filters)
		records: List[Proposal] = []
		for r in llm_results:
			pid = f"prop_{uuid.uuid4().hex[:12]}"
			img = self.images.pick_image(f"{r['title']} {r['country']}")
			rec = Proposal(
				id=pid,
				session_id=session_id,
				title=r["title"],
				country=r["country"],
				short_description=r["shortDescription"],
				approx_price_eur=r["approxPriceEUR"],
				price_note=r.get("priceNote"),
				price_flight_min=r.get("price", {}).get("flight", {}).get("min"),
				price_flight_max=r.get("price", {}).get("flight", {}).get("max"),
				price_stay_min=r.get("price", {}).get("stay", {}).get("min"),
				price_stay_max=r.get("price", {}).get("stay", {}).get("max"),
				price_food_min=r.get("price", {}).get("food", {}).get("min"),
				price_food_max=r.get("price", {}).get("food", {}).get("max"),
				image_url=img.get("url"),
				image_credit_source=img.get("source"),
				image_credit_author=img.get("author"),
				image_credit_link=img.get("link"),
				tags=json.dumps(r.get("tags", [])),
				status=ProposalStatus.PROPOSAL,
			)
			records.append(rec)
		return self.proposals.create_many(db, records)

	def list_current(self, db: Session, session_id: str) -> List[Proposal]:
		return self.proposals.list_current(db, session_id)

	def accept(self, db: Session, session_id: str, proposal_id: str) -> Destination | None:
		p = self.proposals.get_by_id(db, session_id, proposal_id)
		if not p:
			return None
		d = Destination(
			id=f"dest_{uuid.uuid4().hex[:12]}",
			session_id=p.session_id,
			title=p.title,
			country=p.country,
			short_description=p.short_description,
			approx_price_eur=p.approx_price_eur,
			price_note=p.price_note,
			price_flight_min=p.price_flight_min,
			price_flight_max=p.price_flight_max,
			price_stay_min=p.price_stay_min,
			price_stay_max=p.price_stay_max,
			price_food_min=p.price_food_min,
			price_food_max=p.price_food_max,
			image_url=p.image_url,
			image_credit_source=p.image_credit_source,
			image_credit_author=p.image_credit_author,
			image_credit_link=p.image_credit_link,
			tags=p.tags,
		)
		created = self.destinations.create(db, d)
		self.proposals.mark_rejected(db, session_id, proposal_id)
		return created

	def reject(self, db: Session, session_id: str, proposal_id: str) -> None:
		self.proposals.mark_rejected(db, session_id, proposal_id)
