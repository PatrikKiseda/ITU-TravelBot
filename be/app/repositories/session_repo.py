from datetime import datetime
from typing import Optional
from sqlmodel import Session
from app.models.session import SessionModel


class SessionRepository:
	def ensure(self, db: Session, session_id: str) -> SessionModel:
		obj = db.get(SessionModel, session_id)
		if obj:
			return obj
		obj = SessionModel(id=session_id, created_at=datetime.utcnow())
		db.add(obj)
		db.commit()
		db.refresh(obj)
		return obj
