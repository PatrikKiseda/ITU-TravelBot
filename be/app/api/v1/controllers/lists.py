# Author:             Patrik Kišeda ( xkised00 )
# File:                   lists.py
# Functionality :   legacy api endpoints for list management

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.deps import get_db, get_session_id
from app.schemas.envelope import ResponseEnvelope
from app.schemas.lists import CreateListBody, AddItemBody, AddItemsBulkBody
from app.services.list_service import ListService

router = APIRouter()


@router.get("/lists")
async def all_lists(db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
	# lists all lists for the session
	service = ListService()
	rows = service.all_with_stats(db, session_id)
	return ResponseEnvelope.ok(rows)


@router.post("/lists")
async def create_list(body: CreateListBody, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
	service = ListService()
	lst = service.create(db, session_id, body.name)
	return ResponseEnvelope.ok(lst)


@router.post("/lists/{list_id}/items")
async def add_item(list_id: str, body: AddItemBody, db: Session = Depends(get_db)):
	service = ListService()
	service.add_item(db, list_id, body.destinationId)
	return ResponseEnvelope.ok({})


@router.post("/lists/{list_id}/items/bulk")
async def add_items_bulk(list_id: str, body: AddItemsBulkBody, db: Session = Depends(get_db)):
	service = ListService()
	service.add_items_bulk(db, list_id, body.destinationIds)
	return ResponseEnvelope.ok({})


@router.delete("/lists/{list_id}/items/{dest_id}")
async def remove_item(list_id: str, dest_id: str, db: Session = Depends(get_db)):
	service = ListService()
	service.remove_item(db, list_id, dest_id)
	return ResponseEnvelope.ok({})


@router.get("/lists/{list_id}")
async def get_list(list_id: str, db: Session = Depends(get_db)):
	service = ListService()
	res = service.get_with_members(db, list_id)
	if not res:
		return ResponseEnvelope.err("NOT_FOUND", "List not found")
	return ResponseEnvelope.ok(res)
