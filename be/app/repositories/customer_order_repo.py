# Author:             Patrik Kišeda ( xkised00 )
# File:                   customer_order_repo.py
# Functionality :   data access layer for customer orders

from typing import List, Optional, Tuple
from datetime import datetime, timezone
from sqlmodel import Session, select, func, and_
from app.models.customer_order import CustomerOrder, OrderStatus
from app.models.agency_offer import AgencyOffer


class CustomerOrderRepository:
	# handles database operations for customer orders
	def create(self, db: Session, order: CustomerOrder) -> CustomerOrder:
		# creates a new order in the database
		db.add(order)
		try:
			db.commit()
		except Exception as e:
			raise
		db.refresh(order)
		return order

	def get_by_id(self, db: Session, customer_session_id: str, order_id: str) -> Optional[CustomerOrder]:
		# retrieves an order by id
		stmt = select(CustomerOrder).where(
			CustomerOrder.customer_session_id == customer_session_id,
			CustomerOrder.id == order_id
		)
		return db.exec(stmt).first()

	def update(self, db: Session, order: CustomerOrder) -> CustomerOrder:
		# updates an existing order
		db.add(order)
		db.commit()
		db.refresh(order)
		return order

	def confirm_order(self, db: Session, order: CustomerOrder) -> CustomerOrder:
		# confirms an order and sets confirmed timestamp
		order.order_status = OrderStatus.CONFIRMED
		order.confirmed_at = datetime.now(timezone.utc)
		db.add(order)
		db.commit()
		db.refresh(order)
		return order

	def cancel_order(self, db: Session, order: CustomerOrder) -> CustomerOrder:
		order.order_status = OrderStatus.CANCELLED
		db.add(order)
		db.commit()
		db.refresh(order)
		return order

	def list_for_customer(self, db: Session, customer_session_id: str, status: Optional[str] = None) -> List[CustomerOrder]:
		# lists orders for a customer optionally filtered by status
		conditions = [CustomerOrder.customer_session_id == customer_session_id]
		if status:
			conditions.append(CustomerOrder.order_status == status)
		stmt = select(CustomerOrder).where(and_(*conditions))
		return list(db.exec(stmt))

	def get_confirmed_orders_for_offer(self, db: Session, offer_id: str) -> List[CustomerOrder]:
		stmt = select(CustomerOrder).where(
			CustomerOrder.offer_id == offer_id,
			CustomerOrder.order_status == OrderStatus.CONFIRMED
		)
		return list(db.exec(stmt))

	def calculate_confirmed_capacity(self, db: Session, offer_id: str) -> int:
		# calculates total confirmed capacity for an offer
		stmt = select(func.sum(CustomerOrder.number_of_people)).where(
			CustomerOrder.offer_id == offer_id,
			CustomerOrder.order_status == OrderStatus.CONFIRMED
		)
		result = db.exec(stmt).first()
		return result or 0

	def delete_order(self, db: Session, customer_session_id: str, order_id: str) -> bool:
		order = self.get_by_id(db, customer_session_id, order_id)
		if not order or order.order_status not in [OrderStatus.CANCELLED, OrderStatus.DELETED]:
			return False
		db.delete(order)
		db.commit()
		return True


