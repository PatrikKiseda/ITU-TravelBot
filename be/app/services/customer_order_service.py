from typing import List, Optional, Dict, Any
from sqlmodel import Session
from app.repositories.customer_order_repo import CustomerOrderRepository
from app.repositories.agency_offer_repo import AgencyOfferRepository
from app.models.customer_order import CustomerOrder, OrderStatus


class CustomerOrderService:
	def __init__(self):
		self.order_repo = CustomerOrderRepository()
		self.offer_repo = AgencyOfferRepository()

	def get_order_details(self, db: Session, customer_session_id: str, order_id: str) -> Optional[Dict[str, Any]]:
		order = self.order_repo.get_by_id(db, customer_session_id, order_id)
		if not order:
			return None

		offer = self.offer_repo.get_by_id(db, None, order.offer_id)
		if not offer:
			return None

		confirmed_capacity = self.order_repo.calculate_confirmed_capacity(db, order.offer_id)
		remaining_capacity = offer.capacity_total - confirmed_capacity
		if order.order_status == OrderStatus.PENDING:
			remaining_capacity -= order.number_of_people

		total_price = offer.price_housing + offer.price_food + (offer.price_transport_amount or 0)

		return {
			"order": order,
			"offer": offer,
			"remaining_capacity": remaining_capacity,
			"total_price": total_price,
		}

	def update_order(self, db: Session, customer_session_id: str, order_id: str, number_of_people: Optional[int], selected_transport_mode: Optional[str]) -> Optional[CustomerOrder]:
		order = self.order_repo.get_by_id(db, customer_session_id, order_id)
		if not order or order.order_status != OrderStatus.PENDING:
			return None

		if number_of_people is not None:
			offer = self.offer_repo.get_by_id(db, None, order.offer_id)
			if offer:
				confirmed_capacity = self.order_repo.calculate_confirmed_capacity(db, order.offer_id)
				current_order_people = order.number_of_people if order.order_status == OrderStatus.CONFIRMED else 0
				available = offer.capacity_total - confirmed_capacity + current_order_people
				if available < number_of_people:
					raise ValueError(f"Insufficient capacity: available {available}, requested {number_of_people}")
			order.number_of_people = number_of_people

		if selected_transport_mode is not None:
			order.selected_transport_mode = selected_transport_mode

		return self.order_repo.update(db, order)

	def confirm_order(self, db: Session, customer_session_id: str, order_id: str) -> Optional[CustomerOrder]:
		order = self.order_repo.get_by_id(db, customer_session_id, order_id)
		if not order or order.order_status != OrderStatus.PENDING:
			return None

		offer = self.offer_repo.get_by_id(db, None, order.offer_id)
		if not offer:
			return None

		confirmed_capacity = self.order_repo.calculate_confirmed_capacity(db, order.offer_id)
		if offer.capacity_total - confirmed_capacity < order.number_of_people:
			raise ValueError(f"Insufficient capacity: available {offer.capacity_total - confirmed_capacity}, requested {order.number_of_people}")

		confirmed = self.order_repo.confirm_order(db, order)
		offer.capacity_available = offer.capacity_total - confirmed_capacity - order.number_of_people
		self.offer_repo.update(db, offer)

		return confirmed

	def list_orders(self, db: Session, customer_session_id: str, status: Optional[str] = None) -> List[CustomerOrder]:
		return self.order_repo.list_for_customer(db, customer_session_id, status)

	def cancel_order(self, db: Session, customer_session_id: str, order_id: str) -> Optional[CustomerOrder]:
		order = self.order_repo.get_by_id(db, customer_session_id, order_id)
		if not order:
			return None

		if order.order_status == OrderStatus.CONFIRMED:
			offer = self.offer_repo.get_by_id(db, None, order.offer_id)
			if offer:
				offer.capacity_available += order.number_of_people
				self.offer_repo.update(db, offer)

		return self.order_repo.cancel_order(db, order)

