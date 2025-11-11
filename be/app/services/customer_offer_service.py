from datetime import date
from typing import List, Optional
from sqlmodel import Session
from app.repositories.agency_offer_repo import AgencyOfferRepository
from app.repositories.customer_response_repo import CustomerResponseRepository
from app.models.agency_offer import AgencyOffer
from app.models.customer_response import CustomerResponse, ResponseStatus


class CustomerOfferService:
	def __init__(self):
		self.offer_repo = AgencyOfferRepository()
		self.response_repo = CustomerResponseRepository()

	def list_available(
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
		import uuid
		response = CustomerResponse(
			id=f"resp_{uuid.uuid4().hex[:12]}",
			customer_session_id=customer_session_id,
			offer_id=offer_id,
			response_status=ResponseStatus.ACCEPTED,
		)
		return self.response_repo.create_or_update(db, response)

	def reject(self, db: Session, customer_session_id: str, offer_id: str) -> CustomerResponse:
		import uuid
		response = CustomerResponse(
			id=f"resp_{uuid.uuid4().hex[:12]}",
			customer_session_id=customer_session_id,
			offer_id=offer_id,
			response_status=ResponseStatus.REJECTED,
		)
		return self.response_repo.create_or_update(db, response)

