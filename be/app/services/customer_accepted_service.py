from typing import List, Optional
from sqlmodel import Session
from app.repositories.agency_offer_repo import AgencyOfferRepository
from app.repositories.customer_response_repo import CustomerResponseRepository
from app.repositories.customer_note_repo import CustomerNoteRepository
from app.repositories.customer_order_repo import CustomerOrderRepository
from app.models.agency_offer import AgencyOffer
from app.models.customer_note import CustomerNote
from app.models.customer_order import CustomerOrder, OrderStatus
from app.models.agency_offer import TransportMode


class CustomerAcceptedService:
	def __init__(self):
		self.offer_repo = AgencyOfferRepository()
		self.response_repo = CustomerResponseRepository()
		self.note_repo = CustomerNoteRepository()
		self.order_repo = CustomerOrderRepository()

	def list_accepted(self, db: Session, customer_session_id: str, sort: str, order: str) -> List[AgencyOffer]:
		accepted_responses = self.response_repo.list_accepted(db, customer_session_id)
		offer_ids = [r.offer_id for r in accepted_responses]
		if not offer_ids:
			return []

		offers = []
		for offer_id in offer_ids:
			offer = self.offer_repo.get_by_id(db, None, offer_id)
			if offer:
				offers.append(offer)

		key_map = {
			"price": lambda o: o.price_housing + o.price_food + (o.price_transport_amount or 0),
			"type": lambda o: o.type_of_stay or "",
			"date": lambda o: o.date_from,
		}
		key_fn = key_map.get(sort or "price", key_map["price"])
		offers.sort(key=key_fn, reverse=(order == "desc"))
		return offers

	def get_with_details(self, db: Session, customer_session_id: str, offer_id: str) -> Optional[AgencyOffer]:
		# Allow expansion for any offer, not just accepted ones
		return self.offer_repo.get_by_id(db, None, offer_id)

	def add_note(self, db: Session, customer_session_id: str, offer_id: str, note_text: str) -> CustomerNote:
		import uuid
		note = CustomerNote(
			id=f"note_{uuid.uuid4().hex[:12]}",
			customer_session_id=customer_session_id,
			offer_id=offer_id,
			note_text=note_text,
		)
		return self.note_repo.create_or_update(db, note)

	def get_note(self, db: Session, customer_session_id: str, offer_id: str) -> Optional[CustomerNote]:
		return self.note_repo.get_by_offer(db, customer_session_id, offer_id)

	def confirm_travel(self, db: Session, customer_session_id: str, offer_id: str, number_of_people: int, selected_transport_mode: str) -> Optional[CustomerOrder]:
		offer = self.offer_repo.get_by_id(db, None, offer_id)
		if not offer:
			return None

		confirmed_capacity = self.order_repo.calculate_confirmed_capacity(db, offer_id)
		available = offer.capacity_total - confirmed_capacity
		if available < number_of_people:
			raise ValueError(f"Insufficient capacity: available {available}, requested {number_of_people}")

		import uuid
		order = CustomerOrder(
			id=f"order_{uuid.uuid4().hex[:12]}",
			customer_session_id=customer_session_id,
			offer_id=offer_id,
			number_of_people=number_of_people,
			selected_transport_mode=selected_transport_mode,
			order_status=OrderStatus.PENDING,
		)
		return self.order_repo.create(db, order)

