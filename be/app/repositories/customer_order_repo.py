from typing import List, Optional, Tuple
from datetime import datetime, timezone
from sqlmodel import Session, select, func, and_
from app.models.customer_order import CustomerOrder, OrderStatus
from app.models.agency_offer import AgencyOffer


class CustomerOrderRepository:
	def create(self, db: Session, order: CustomerOrder) -> CustomerOrder:
		db.add(order)
		db.commit()
		db.refresh(order)
		return order

	def get_by_id(self, db: Session, customer_session_id: str, order_id: str) -> Optional[CustomerOrder]:
		stmt = select(CustomerOrder).where(
			CustomerOrder.customer_session_id == customer_session_id,
			CustomerOrder.id == order_id
		)
		return db.exec(stmt).first()

	def update(self, db: Session, order: CustomerOrder) -> CustomerOrder:
		db.add(order)
		db.commit()
		db.refresh(order)
		return order

	def confirm_order(self, db: Session, order: CustomerOrder) -> CustomerOrder:
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
		stmt = select(func.sum(CustomerOrder.number_of_people)).where(
			CustomerOrder.offer_id == offer_id,
			CustomerOrder.order_status == OrderStatus.CONFIRMED
		)
		result = db.exec(stmt).first()
		return result or 0

