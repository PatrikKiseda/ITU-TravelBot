# Author:             Patrik Kišeda ( xkised00 )
# File:                   customer_order_service.py
# Functionality :   business logic for customer order management

from typing import List, Optional, Dict, Any
from sqlmodel import Session
from app.repositories.customer_order_repo import CustomerOrderRepository
from app.repositories.agency_offer_repo import AgencyOfferRepository
from app.models.customer_order import CustomerOrder, OrderStatus


class CustomerOrderService:
	# handles order operations including special requirements and gift options
	def __init__(self):
		self.order_repo = CustomerOrderRepository()
		self.offer_repo = AgencyOfferRepository()

	def get_order_details(self, db: Session, customer_session_id: str, order_id: str) -> Optional[Dict[str, Any]]:
		# retrieves order details with price calculation
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

		# Calculate total price based on selected transport mode
		# If car_own is selected, exclude transport price
		transport_price = 0 if order.selected_transport_mode == "car_own" else (offer.price_transport_amount or 0)
		total_price = offer.price_housing + offer.price_food + transport_price

		return {
			"order": order,
			"offer": offer,
			"remaining_capacity": remaining_capacity,
			"total_price": total_price,
		}

	def update_order(self, db: Session, customer_session_id: str, order_id: str, number_of_people: Optional[int], selected_transport_mode: Optional[str], special_requirements: Optional[List[str]] = None, is_gift: Optional[bool] = None, gift_recipient_email: Optional[str] = None, gift_recipient_name: Optional[str] = None, gift_sender_name: Optional[str] = None, gift_note: Optional[str] = None, gift_subject: Optional[str] = None) -> Optional[CustomerOrder]:
		# updates order with validation for special requirements and gift fields
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

		if special_requirements is not None:
			# Convert list to comma-separated string for storage
			order.special_requirements = ",".join(special_requirements) if special_requirements else None

		# Handle gift fields
		if is_gift is not None:
			order.is_gift = is_gift
			# If disabling gift, clear gift fields
			if not is_gift:
				order.gift_recipient_email = None
				order.gift_recipient_name = None
				order.gift_sender_name = None
				order.gift_note = None
				order.gift_subject = None
			else:
				# If enabling gift, validate required fields
				if not gift_recipient_email or not gift_recipient_name or not gift_sender_name:
					raise ValueError("Gift requires recipient email, recipient name, and sender name")

		if gift_recipient_email is not None:
			order.gift_recipient_email = gift_recipient_email
		if gift_recipient_name is not None:
			order.gift_recipient_name = gift_recipient_name
		if gift_sender_name is not None:
			order.gift_sender_name = gift_sender_name
		if gift_note is not None:
			order.gift_note = gift_note
		if gift_subject is not None:
			order.gift_subject = gift_subject

		return self.order_repo.update(db, order)

	def confirm_order(self, db: Session, customer_session_id: str, order_id: str) -> Optional[CustomerOrder]:
		# confirms a pending order and updates capacity
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
		# lists orders for a customer session
		return self.order_repo.list_for_customer(db, customer_session_id, status)

	def cancel_order(self, db: Session, customer_session_id: str, order_id: str) -> Optional[CustomerOrder]:
		# cancels an order and restores capacity if confirmed
		order = self.order_repo.get_by_id(db, customer_session_id, order_id)
		if not order:
			return None

		if order.order_status == OrderStatus.CONFIRMED:
			offer = self.offer_repo.get_by_id(db, None, order.offer_id)
			if offer:
				offer.capacity_available += order.number_of_people
				self.offer_repo.update(db, offer)

		return self.order_repo.cancel_order(db, order)
	
	def delete_order(self, db: Session, customer_session_id: str, order_id: str) -> bool:
		order = self.order_repo.get_by_id(db, customer_session_id, order_id)
		if not order or order.order_status not in [OrderStatus.CANCELLED, OrderStatus.DELETED]:
			return False
		return self.order_repo.delete_order(db, order_id)
	
	def delete_cancelled_orders(self, db: Session, customer_session_id: str) -> int:
		orders = self.list_orders(db, customer_session_id)
		deleted_count = 0
		for order in orders:
			if order.order_status == OrderStatus.CANCELLED:
				order.order_status = OrderStatus.DELETED
				db.add(order)
				db.commit()
				deleted_count += 1
		return deleted_count




