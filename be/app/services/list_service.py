from typing import List, Optional
from sqlmodel import Session
from app.repositories.list_repo import ListRepository


class ListService:
	def __init__(self):
		self.repo = ListRepository()

	def all_with_stats(self, db: Session, session_id: str):
		pairs = self.repo.all_with_stats(db, session_id)
		return [{"id": lst.id, "name": lst.name, "stats": stats} for lst, stats in pairs]

	def create(self, db: Session, session_id: str, name: str):
		lst = self.repo.create_list(db, session_id, name)
		return {"id": lst.id, "name": lst.name}

	def add_item(self, db: Session, list_id: str, dest_id: str) -> None:
		self.repo.add_item(db, list_id, dest_id)

	def add_items_bulk(self, db: Session, list_id: str, dest_ids: List[str]) -> None:
		self.repo.add_items_bulk(db, list_id, dest_ids)

	def remove_item(self, db: Session, list_id: str, dest_id: str) -> None:
		self.repo.remove_item(db, list_id, dest_id)

	def get_with_members(self, db: Session, list_id: str):
		lst, member_ids, stats = self.repo.get_with_members(db, list_id)
		if not lst:
			return None
		return {"id": lst.id, "name": lst.name, "members": member_ids, "stats": stats}
