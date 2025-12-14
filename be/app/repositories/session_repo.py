from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Session
from app.models.session import SessionModel


class SessionRepository:
	def ensure(self, db: Session, session_id: str) -> SessionModel:
		# ensures a session exists, creates if not found
		obj = db.get(SessionModel, session_id)
		if obj:
			return obj
		obj = SessionModel(id=session_id, created_at=datetime.now(timezone.utc))
		db.add(obj)
		db.commit()
		db.refresh(obj)
		return obj
