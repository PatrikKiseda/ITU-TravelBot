# Author:             Patrik Kišeda ( xkised00 )
# File:                   offers.py
# Functionality :   api endpoints for agent offer management

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional
from datetime import date
from app.core.deps import get_db, get_session_id
from app.schemas.envelope import ResponseEnvelope
from app.schemas.agency_offer import CreateAgencyOfferBody, UpdateAgencyOfferBody, AgencyOfferDTO
from app.services.agency_offer_service import AgencyOfferService

router = APIRouter()


@router.get("/offers")
async def list_offers(
	# lists offers for the agent with filtering
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
	agent_session_id: str = Depends(get_session_id),
):
	service = AgencyOfferService()
	type_list = type_of_stay.split(",") if type_of_stay else None
	offers = service.list_filtered(
		db,
		agent_session_id,
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


@router.post("/offers")
async def create_offer(
	# creates a new offer
	body: CreateAgencyOfferBody,
	db: Session = Depends(get_db),
	agent_session_id: str = Depends(get_session_id),
):
	service = AgencyOfferService()
	offer = service.create(db, agent_session_id, body.model_dump(exclude_none=True))
	return ResponseEnvelope.ok(offer.model_dump())


@router.get("/offers/{offer_id}")
async def get_offer(
	# gets a specific offer by id
	offer_id: str,
	db: Session = Depends(get_db),
	agent_session_id: str = Depends(get_session_id),
):
	service = AgencyOfferService()
	offer = service.get_by_id(db, agent_session_id, offer_id)
	if not offer:
		return ResponseEnvelope.err("NOT_FOUND", "Offer not found")
	return ResponseEnvelope.ok(offer.model_dump())


@router.put("/offers/{offer_id}")
async def update_offer(
	# updates an existing offer
	offer_id: str,
	body: UpdateAgencyOfferBody,
	db: Session = Depends(get_db),
	agent_session_id: str = Depends(get_session_id),
):
	service = AgencyOfferService()
	offer = service.update(db, agent_session_id, offer_id, body.model_dump(exclude_none=True))
	if not offer:
		return ResponseEnvelope.err("NOT_FOUND", "Offer not found")
	return ResponseEnvelope.ok(offer.model_dump())


@router.delete("/offers/{offer_id}")
async def delete_offer(
	# deletes an offer
	offer_id: str,
	db: Session = Depends(get_db),
	agent_session_id: str = Depends(get_session_id),
):
	service = AgencyOfferService()
	service.delete(db, agent_session_id, offer_id)
	return ResponseEnvelope.ok({})

