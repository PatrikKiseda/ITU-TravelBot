from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session
from typing import Optional
from app.core.deps import get_db, get_session_id
from app.schemas.envelope import ResponseEnvelope
from app.schemas.customer import CreateNoteBody, CreateOrderBody
from app.services.customer_accepted_service import CustomerAcceptedService

router = APIRouter()


@router.get("/accepted")
async def list_accepted(
	sort: Optional[str] = Query("price"),
	order: Optional[str] = Query("asc"),
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerAcceptedService()
	offers = service.list_accepted(db, customer_session_id, sort or "price", order or "asc")
	return ResponseEnvelope.ok([o.model_dump() for o in offers])


@router.get("/accepted/{offer_id}/expand")
async def expand_offer(
	offer_id: str,
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerAcceptedService()
	offer = service.get_with_details(db, customer_session_id, offer_id)
	if not offer:
		return ResponseEnvelope.err("NOT_FOUND", "Offer not found or not accepted")
	return ResponseEnvelope.ok(offer.model_dump())


@router.post("/accepted/{offer_id}/note")
async def add_note(
	offer_id: str,
	body: CreateNoteBody,
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerAcceptedService()
	note = service.add_note(db, customer_session_id, offer_id, body.note_text)
	return ResponseEnvelope.ok(note.model_dump())


@router.get("/accepted/{offer_id}/note")
async def get_note(
	offer_id: str,
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerAcceptedService()
	note = service.get_note(db, customer_session_id, offer_id)
	if not note:
		return ResponseEnvelope.err("NOT_FOUND", "Note not found")
	return ResponseEnvelope.ok(note.model_dump())


@router.post("/accepted/{offer_id}/confirm")
async def confirm_travel(
	offer_id: str,
	body: CreateOrderBody,
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerAcceptedService()
	try:
		order = service.confirm_travel(db, customer_session_id, offer_id, body.number_of_people, body.selected_transport_mode)
		if not order:
			raise HTTPException(status_code=404, detail="Offer not found")
		return ResponseEnvelope.ok(order.model_dump())
	except ValueError as e:
		raise HTTPException(status_code=400, detail=str(e))

