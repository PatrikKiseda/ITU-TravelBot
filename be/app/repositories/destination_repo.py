# Author:             Patrik Kišeda ( xkised00 )
# File:                   destination_repo.py
# Functionality :   data access layer for legacy destination system

from typing import List, Optional
from sqlmodel import Session, select
from app.models.destination import Destination


class DestinationRepository:
	# handles database operations for legacy destinations
	def create(self, db: Session, dest: Destination) -> Destination:
		db.add(dest)
		db.commit()
		db.refresh(dest)
		return dest

	def get_by_id(self, db: Session, session_id: str, dest_id: str) -> Optional[Destination]:
		stmt = select(Destination).where(Destination.session_id == session_id, Destination.id == dest_id)
		return db.exec(stmt).first()

	def delete(self, db: Session, session_id: str, dest_id: str) -> None:
		d = self.get_by_id(db, session_id, dest_id)
		if not d:
			return
		db.delete(d)
		db.commit()

	def list_saved(self, db: Session, session_id: str, sort: str, order: str, types: Optional[List[str]]) -> List[Destination]:
		stmt = select(Destination).where(Destination.session_id == session_id)
		rows = list(db.exec(stmt))
		if types:
			def has_any_type(d: Destination) -> bool:
				tags = (d.tags or "").lower()
				return any(t.lower() in tags for t in types)
			rows = [d for d in rows if has_any_type(d)]
		key_map = {
			"price": lambda d: d.approx_price_eur,
			"title": lambda d: d.title.lower(),
			"starred": lambda d: d.starred,
		}
		key_fn = key_map.get(sort or "title", key_map["title"])
		rows.sort(key=key_fn, reverse=(order == "desc"))
		return rows

	def toggle_star(self, db: Session, session_id: str, dest_id: str, flagged: bool) -> Optional[Destination]:
		d = self.get_by_id(db, session_id, dest_id)
		if not d:
			return None
		d.starred = flagged
		db.add(d)
		db.commit()
		db.refresh(d)
		return d

	def update_expanded(self, db: Session, session_id: str, dest_id: str, *, long_description: str, highlights: str, why_visit: str, things_to_consider: str) -> Optional[Destination]:
		d = self.get_by_id(db, session_id, dest_id)
		if not d:
			return None
		d.long_description = long_description
		d.highlights = highlights
		d.why_visit = why_visit
		d.things_to_consider = things_to_consider
		db.add(d)
		db.commit()
		db.refresh(d)
		return d
