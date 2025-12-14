# Author:             Patrik Kišeda ( xkised00 )
# File:                   suggestions.py
# Functionality :   legacy api endpoints for suggestion system

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.deps import get_db, get_session_id
from app.schemas.envelope import ResponseEnvelope
from app.schemas.suggestions import SuggestFilters
from app.services.suggestion_service import SuggestionService

router = APIRouter()


@router.post("/suggest")
async def suggest(filters: SuggestFilters, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
	# generates suggestions using legacy service
	service = SuggestionService()
	proposals = service.generate(db, session_id, filters.model_dump(exclude_none=True))
	# Return list of dicts
	payload = [p.model_dump() for p in proposals]
	return ResponseEnvelope.ok(payload)


@router.get("/proposals")
async def get_proposals(db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
	service = SuggestionService()
	proposals = service.list_current(db, session_id)
	return ResponseEnvelope.ok([p.model_dump() for p in proposals])


@router.post("/proposals/{proposal_id}/accept")
async def accept_proposal(proposal_id: str, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
	service = SuggestionService()
	dest = service.accept(db, session_id, proposal_id)
	if not dest:
		return ResponseEnvelope.err("NOT_FOUND", "Proposal not found")
	return ResponseEnvelope.ok(dest.model_dump())


@router.post("/proposals/{proposal_id}/reject")
async def reject_proposal(proposal_id: str, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
	service = SuggestionService()
	service.reject(db, session_id, proposal_id)
	return ResponseEnvelope.ok({})
