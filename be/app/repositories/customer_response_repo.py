from typing import List, Optional
from sqlmodel import Session, select
from app.models.customer_response import CustomerResponse, ResponseStatus


class CustomerResponseRepository:
	def create_or_update(self, db: Session, response: CustomerResponse) -> CustomerResponse:
		existing = self.get_by_offer(db, response.customer_session_id, response.offer_id)
		if existing:
			existing.response_status = response.response_status
			db.add(existing)
			db.commit()
			db.refresh(existing)
			return existing
		db.add(response)
		db.commit()
		db.refresh(response)
		return response

	def get_by_offer(self, db: Session, customer_session_id: str, offer_id: str) -> Optional[CustomerResponse]:
		stmt = select(CustomerResponse).where(
			CustomerResponse.customer_session_id == customer_session_id,
			CustomerResponse.offer_id == offer_id
		)
		return db.exec(stmt).first()

	def list_accepted(self, db: Session, customer_session_id: str) -> List[CustomerResponse]:
		stmt = select(CustomerResponse).where(
			CustomerResponse.customer_session_id == customer_session_id,
			CustomerResponse.response_status == ResponseStatus.ACCEPTED
		)
		return list(db.exec(stmt))

	def list_rejected(self, db: Session, customer_session_id: str) -> List[CustomerResponse]:
		stmt = select(CustomerResponse).where(
			CustomerResponse.customer_session_id == customer_session_id,
			CustomerResponse.response_status == ResponseStatus.REJECTED
		)
		return list(db.exec(stmt))

	def get_rejected_offer_ids(self, db: Session, customer_session_id: str) -> List[str]:
		rejected = self.list_rejected(db, customer_session_id)
		return [r.offer_id for r in rejected]

