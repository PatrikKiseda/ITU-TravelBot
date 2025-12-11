from typing import List, Optional, Tuple
from datetime import datetime, timezone
from sqlmodel import Session, select, func, and_
from app.models.customer_order import CustomerOrder, OrderStatus
from app.models.agency_offer import AgencyOffer


class CustomerOrderRepository:
	def create(self, db: Session, order: CustomerOrder) -> CustomerOrder:
		# #region agent log
		import json
		import os
		log_path = r"c:\Users\Pato\Desktop\skola\7sem\ITU\.cursor\debug.log"
		try:
			order_dict = order.model_dump()
			with open(log_path, "a", encoding="utf-8") as f:
				f.write(json.dumps({"sessionId":"debug-session","runId":"create_order","hypothesisId":"A","location":"customer_order_repo.py:10","message":"Creating order - before db.add","data":{"order_fields":list(order_dict.keys()),"order_id":order.id},"timestamp":int(__import__("time").time()*1000)}) + "\n")
		except: pass
		# #endregion
		db.add(order)
		try:
			db.commit()
		except Exception as e:
			# #region agent log
			try:
				with open(log_path, "a", encoding="utf-8") as f:
					f.write(json.dumps({"sessionId":"debug-session","runId":"create_order","hypothesisId":"A","location":"customer_order_repo.py:20","message":"Commit failed","data":{"error":str(e),"error_type":type(e).__name__},"timestamp":int(__import__("time").time()*1000)}) + "\n")
			except: pass
			# #endregion
			raise
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

