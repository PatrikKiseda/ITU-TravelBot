# Author:             Patrik Kišeda ( xkised00 )
# File:                   customer_offer_service.py
# Functionality :   business logic for customer offer browsing and status management

from datetime import date
from typing import List, Optional
from sqlmodel import Session
from app.repositories.agency_offer_repo import AgencyOfferRepository
from app.repositories.customer_response_repo import CustomerResponseRepository
from app.models.agency_offer import AgencyOffer
from app.models.customer_response import CustomerResponse, ResponseStatus


class CustomerOfferService:
	# handles offer operations including status management
	def __init__(self):
		self.offer_repo = AgencyOfferRepository()
		self.response_repo = CustomerResponseRepository()

	def list_available(
		# lists available offers excluding rejected and accepted ones
		self,
		db: Session,
		customer_session_id: str,
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
		rejected_ids = self.response_repo.get_rejected_offer_ids(db, customer_session_id)
		accepted_responses = self.response_repo.list_accepted(db, customer_session_id)
		accepted_ids = {resp.offer_id for resp in accepted_responses}
		all_offers = self.offer_repo.list_filtered(
			db,
			agent_session_id=None,  # Show all offers to customers (not filtered by agent)
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
		return [o for o in all_offers if o.id not in rejected_ids and o.id not in accepted_ids]

	def accept(self, db: Session, customer_session_id: str, offer_id: str) -> CustomerResponse:
		# marks an offer as accepted
		import uuid
		response = CustomerResponse(
			id=f"resp_{uuid.uuid4().hex[:12]}",
			customer_session_id=customer_session_id,
			offer_id=offer_id,
			response_status=ResponseStatus.ACCEPTED,
		)
		return self.response_repo.create_or_update(db, response)

	def reject(self, db: Session, customer_session_id: str, offer_id: str) -> CustomerResponse:
		# marks an offer as rejected
		import uuid
		response = CustomerResponse(
			id=f"resp_{uuid.uuid4().hex[:12]}",
			customer_session_id=customer_session_id,
			offer_id=offer_id,
			response_status=ResponseStatus.REJECTED,
		)
		return self.response_repo.create_or_update(db, response)

	def update_status(self, db: Session, customer_session_id: str, offer_id: str, status: str) -> CustomerResponse:
		# updates the status of an offer
		import uuid
		response = CustomerResponse(
			id=f"resp_{uuid.uuid4().hex[:12]}",
			customer_session_id=customer_session_id,
			offer_id=offer_id,
			response_status=status,
		)
		return self.response_repo.create_or_update(db, response)

	def list_all_with_status(
		# lists all offers with their status for unified view
		self,
		db: Session,
		customer_session_id: str,
		origin: Optional[str] = None,
		destination: Optional[str] = None,
		season: Optional[str] = None,
		type_of_stay: Optional[List[str]] = None,
		price_min: Optional[int] = None,
		price_max: Optional[int] = None,
		status_filter: Optional[str] = None,
		sort: Optional[str] = "status",
		order: Optional[str] = "asc",
	) -> List[dict]:
		from app.repositories.customer_note_repo import CustomerNoteRepository
		note_repo = CustomerNoteRepository()
		
		# Get all offers with filters
		all_offers = self.offer_repo.list_filtered(
			db,
			agent_session_id=None,
			origin=origin,
			destination=destination,
			season=season,
			type_of_stay=type_of_stay,
			price_min=price_min,
			price_max=price_max,
		)
		
		# Get all responses for this customer
		all_responses = self.response_repo.list_all(db, customer_session_id)
		response_map = {r.offer_id: r.response_status for r in all_responses}
		
		# Get all notes for this customer
		notes_map = {}
		for offer in all_offers:
			note = note_repo.get_by_offer(db, customer_session_id, offer.id)
			if note:
				notes_map[offer.id] = note.note_text
		
		# Attach status and note to each offer
		result = []
		for offer in all_offers:
			status = response_map.get(offer.id)
			
			# Filter by status if requested
			if status_filter:
				status_filter_upper = status_filter.upper()
				if status_filter_upper == "ACCEPTED" and status != ResponseStatus.ACCEPTED:
					continue
				elif status_filter_upper == "UNDECIDED" and status not in (ResponseStatus.UNDECIDED, None):
					continue
				elif status_filter_upper == "REJECTED" and status != ResponseStatus.REJECTED:
					continue
			
			offer_dict = offer.model_dump()
			offer_dict["status"] = status
			offer_dict["note"] = notes_map.get(offer.id)
			result.append(offer_dict)
		
		# Sort by status group first (ACCEPTED, UNDECIDED, REJECTED, null), then by sort criteria
		def sort_key(item):
			status_order = {
				ResponseStatus.ACCEPTED: 0,
				None: 1,
				ResponseStatus.UNDECIDED: 2,
				ResponseStatus.REJECTED: 3,
			}
			status = item.get("status")
			primary = status_order.get(status, 1)
			
			if sort == "price":
				price = item.get("price_housing", 0) + item.get("price_food", 0) + (item.get("price_transport_amount") or 0)
				return (primary, price)
			elif sort == "date":
				date_from = item.get("date_from")
				return (primary, date_from or "")
			else:  # status sort
				return (primary, item.get("destination_name", ""))
		
		result.sort(key=sort_key, reverse=(order == "desc"))
		
		return result

