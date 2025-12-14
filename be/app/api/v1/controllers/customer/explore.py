# Author:             Patrik Kišeda ( xkised00 )
# File:                   explore.py
# Functionality :   api endpoint for llm-generated destination exploration

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.deps import get_db, get_session_id
from app.schemas.envelope import ResponseEnvelope
from app.schemas.suggestions import SuggestFilters
from app.services.exploration_service import ExplorationService

router = APIRouter()


@router.post("/explore")
async def explore(
	# generates destination suggestions using llm
	filters: SuggestFilters,
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = ExplorationService()
	try:
		suggestions = service.generate_suggestions(filters.model_dump(exclude_none=True))
		return ResponseEnvelope.ok(suggestions)
	except ValueError as e:
		return ResponseEnvelope.err("VALIDATION_ERROR", str(e))
	except Exception as e:
		return ResponseEnvelope.err("UPSTREAM_FAIL", f"Failed to generate suggestions: {str(e)}")

