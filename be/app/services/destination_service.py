# Author:             Patrik Kišeda ( xkised00 )
# File:                   destination_service.py
# Functionality :   legacy service for destination management

import json
from typing import List, Optional
from sqlmodel import Session
from app.repositories.destination_repo import DestinationRepository
from app.models.destination import Destination
from app.services.llm_service import LLMService


class DestinationService:
	# handles legacy destination operations
	def __init__(self, llm: LLMService | None = None):
		self.repo = DestinationRepository()
		self.llm = llm or LLMService()

	def list_saved(self, db: Session, session_id: str, sort: str, order: str, types: Optional[List[str]]) -> List[Destination]:
		return self.repo.list_saved(db, session_id, sort, order, types)

	def toggle_star(self, db: Session, session_id: str, dest_id: str, flagged: bool) -> Optional[Destination]:
		return self.repo.toggle_star(db, session_id, dest_id, flagged)

	def delete(self, db: Session, session_id: str, dest_id: str) -> None:
		self.repo.delete(db, session_id, dest_id)

	def _apply_expand(self, base: Destination, details: dict) -> dict:
		return {
			"long_description": details.get("longDescription", ""),
			"highlights": json.dumps(details.get("highlights", [])),
			"why_visit": json.dumps(details.get("whyVisit", [])),
			"things_to_consider": json.dumps(details.get("thingsToConsider", [])),
		}

	def expand(self, db: Session, session_id: str, dest_id: str, force_refresh: bool) -> Optional[Destination]:
		base = self.repo.get_by_id(db, session_id, dest_id)
		if not base:
			return None
		details = self.llm.expand_destination({"title": base.title, "country": base.country}, {"forceRefresh": force_refresh})
		payload = self._apply_expand(base, details)
		return self.repo.update_expanded(db, session_id, dest_id, **payload)

	def customize(self, db: Session, session_id: str, dest_id: str, user_prompt: str) -> Optional[Destination]:
		base = self.repo.get_by_id(db, session_id, dest_id)
		if not base:
			return None
		details = self.llm.customize_destination({"title": base.title, "country": base.country}, user_prompt)
		payload = self._apply_expand(base, details)
		return self.repo.update_expanded(db, session_id, dest_id, **payload)
