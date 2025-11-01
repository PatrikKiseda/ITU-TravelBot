from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Session, select
from app.models.customer_note import CustomerNote


class CustomerNoteRepository:
	def create_or_update(self, db: Session, note: CustomerNote) -> CustomerNote:
		existing = self.get_by_offer(db, note.customer_session_id, note.offer_id)
		if existing:
			existing.note_text = note.note_text
			existing.updated_at = datetime.now(timezone.utc)
			db.add(existing)
			db.commit()
			db.refresh(existing)
			return existing
		db.add(note)
		db.commit()
		db.refresh(note)
		return note

	def get_by_offer(self, db: Session, customer_session_id: str, offer_id: str) -> Optional[CustomerNote]:
		stmt = select(CustomerNote).where(
			CustomerNote.customer_session_id == customer_session_id,
			CustomerNote.offer_id == offer_id
		)
		return db.exec(stmt).first()

	def delete(self, db: Session, customer_session_id: str, offer_id: str) -> None:
		note = self.get_by_offer(db, customer_session_id, offer_id)
		if not note:
			return
		db.delete(note)
		db.commit()

