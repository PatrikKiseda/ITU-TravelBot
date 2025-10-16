from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import Optional
from app.core.deps import get_db, get_session_id
from app.schemas.envelope import ResponseEnvelope
from app.schemas.destinations import ToggleStarBody, ExpandBody, CustomizeBody
from app.services.destination_service import DestinationService

router = APIRouter()


@router.get("/destinations")
async def list_destinations(sort: Optional[str] = None, order: Optional[str] = None, type: Optional[str] = None, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
	service = DestinationService()
	types = type.split(",") if type else None
	rows = service.list_saved(db, session_id, sort or "title", order or "asc", types)
	return ResponseEnvelope.ok([d.model_dump() for d in rows])


@router.patch("/destinations/{dest_id}/star")
async def toggle_star(dest_id: str, body: ToggleStarBody, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
	service = DestinationService()
	res = service.toggle_star(db, session_id, dest_id, body.starred)
	if not res:
		return ResponseEnvelope.err("NOT_FOUND", "Destination not found")
	return ResponseEnvelope.ok(res.model_dump())


@router.delete("/destinations/{dest_id}")
async def delete_destination(dest_id: str, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
	service = DestinationService()
	service.delete(db, session_id, dest_id)
	return ResponseEnvelope.ok({})


@router.post("/destinations/{dest_id}/expand")
async def expand(dest_id: str, body: ExpandBody, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
	service = DestinationService()
	res = service.expand(db, session_id, dest_id, body.forceRefresh)
	if not res:
		return ResponseEnvelope.err("NOT_FOUND", "Destination not found")
	return ResponseEnvelope.ok(res.model_dump())


@router.post("/destinations/{dest_id}/customize")
async def customize(dest_id: str, body: CustomizeBody, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
	service = DestinationService()
	res = service.customize(db, session_id, dest_id, body.prompt)
	if not res:
		return ResponseEnvelope.err("NOT_FOUND", "Destination not found")
	return ResponseEnvelope.ok(res.model_dump())
