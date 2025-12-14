# Author:             Patrik Kišeda ( xkised00 )
# File:                   list_repo.py
# Functionality :   data access layer for legacy list system

from typing import List, Optional, Tuple
from sqlmodel import Session, select, func
from app.models.list import ListModel, ListItem
from app.models.destination import Destination


class ListRepository:
	# handles database operations for legacy lists
	def create_list(self, db: Session, session_id: str, name: str) -> ListModel:
		lst = ListModel(id=name.lower().replace(" ", "-")+f"-{session_id[:6]}", session_id=session_id, name=name)
		db.add(lst)
		db.commit()
		db.refresh(lst)
		return lst

	def all_with_stats(self, db: Session, session_id: str) -> List[Tuple[ListModel, dict]]:
		lists = list(db.exec(select(ListModel).where(ListModel.session_id == session_id)))
		result = []
		for lst in lists:
			items = list(db.exec(select(ListItem).where(ListItem.list_id == lst.id)))
			member_ids = [it.destination_id for it in items]
			if member_ids:
				dests = list(db.exec(select(Destination).where(Destination.id.in_(member_ids))))
				count = len(dests)
				avg = int(sum(d.approx_price_eur for d in dests) / count) if count else 0
				result.append((lst, {"count": count, "avgApproxPriceEUR": avg}))
			else:
				result.append((lst, {"count": 0, "avgApproxPriceEUR": 0}))
		return result

	def get_with_members(self, db: Session, list_id: str) -> Tuple[Optional[ListModel], List[str], dict]:
		lst = db.get(ListModel, list_id)
		if not lst:
			return None, [], {"count": 0, "avgApproxPriceEUR": 0}
		items = list(db.exec(select(ListItem).where(ListItem.list_id == list_id)))
		member_ids = [it.destination_id for it in items]
		if member_ids:
			dests = list(db.exec(select(Destination).where(Destination.id.in_(member_ids))))
			count = len(dests)
			avg = int(sum(d.approx_price_eur for d in dests) / count) if count else 0
			stats = {"count": count, "avgApproxPriceEUR": avg}
		else:
			stats = {"count": 0, "avgApproxPriceEUR": 0}
		return lst, member_ids, stats

	def add_item(self, db: Session, list_id: str, dest_id: str) -> None:
		if not db.get(ListModel, list_id):
			return
		li = ListItem(list_id=list_id, destination_id=dest_id)
		db.add(li)
		try:
			db.commit()
		except Exception:
			db.rollback()

	def add_items_bulk(self, db: Session, list_id: str, dest_ids: List[str]) -> None:
		for did in dest_ids:
			self.add_item(db, list_id, did)

	def remove_item(self, db: Session, list_id: str, dest_id: str) -> None:
		rows = list(db.exec(select(ListItem).where(ListItem.list_id == list_id, ListItem.destination_id == dest_id)))
		for r in rows:
			db.delete(r)
		db.commit()
