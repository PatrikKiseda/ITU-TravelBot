from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional, List
from datetime import date
from app.core.deps import get_db, get_session_id
from app.schemas.envelope import ResponseEnvelope
from app.schemas.customer import AcceptOfferBody, RejectOfferBody, UpdateStatusBody
from app.services.customer_offer_service import CustomerOfferService

router = APIRouter()


@router.get("/offers")
async def list_offers(
	origin: Optional[str] = Query(None),
	destination: Optional[str] = Query(None),
	capacity_min: Optional[int] = Query(None),
	capacity_max: Optional[int] = Query(None),
	date_from: Optional[date] = Query(None),
	date_to: Optional[date] = Query(None),
	season: Optional[str] = Query(None),
	type_of_stay: Optional[str] = Query(None),  # Comma-separated
	price_min: Optional[int] = Query(None),
	price_max: Optional[int] = Query(None),
	transport_mode: Optional[str] = Query(None),
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerOfferService()
	type_list = type_of_stay.split(",") if type_of_stay else None
	offers = service.list_available(
		db,
		customer_session_id,
		origin=origin,
		destination=destination,
		capacity_min=capacity_min,
		capacity_max=capacity_max,
		date_from=date_from,
		date_to=date_to,
		season=season,
		type_of_stay=type_list,
		price_min=price_min,
		price_max=price_max,
		transport_mode=transport_mode,
	)
	return ResponseEnvelope.ok([o.model_dump() for o in offers])


@router.post("/offers/{offer_id}/accept")
async def accept_offer(
	offer_id: str,
	body: AcceptOfferBody,
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerOfferService()
	response = service.accept(db, customer_session_id, offer_id)
	return ResponseEnvelope.ok(response.model_dump())


@router.post("/offers/{offer_id}/reject")
async def reject_offer(
	offer_id: str,
	body: RejectOfferBody,
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerOfferService()
	response = service.reject(db, customer_session_id, offer_id)
	return ResponseEnvelope.ok(response.model_dump())


@router.get("/offers/all")
async def list_all_offers_with_status(
	origin: Optional[str] = Query(None),
	destination: Optional[str] = Query(None),
	season: Optional[str] = Query(None),
	type_of_stay: Optional[str] = Query(None),  # Comma-separated
	price_min: Optional[int] = Query(None),
	price_max: Optional[int] = Query(None),
	status_filter: Optional[str] = Query(None),  # "accepted", "undecided", "rejected", or None for all
	sort: Optional[str] = Query("status"),  # "status", "price", "date"
	order: Optional[str] = Query("asc"),
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerOfferService()
	type_list = type_of_stay.split(",") if type_of_stay else None
	offers = service.list_all_with_status(
		db,
		customer_session_id,
		origin=origin,
		destination=destination,
		season=season,
		type_of_stay=type_list,
		price_min=price_min,
		price_max=price_max,
		status_filter=status_filter,
		sort=sort,
		order=order,
	)
	return ResponseEnvelope.ok(offers)


@router.put("/offers/{offer_id}/status")
async def update_offer_status(
	offer_id: str,
	body: UpdateStatusBody,
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	from app.models.customer_response import ResponseStatus
	# Validate status
	if body.status not in [ResponseStatus.ACCEPTED, ResponseStatus.UNDECIDED, ResponseStatus.REJECTED]:
		return ResponseEnvelope.err("INVALID_STATUS", f"Status must be one of: ACCEPTED, UNDECIDED, REJECTED")
	
	service = CustomerOfferService()
	response = service.update_status(db, customer_session_id, offer_id, body.status)
	return ResponseEnvelope.ok(response.model_dump())

