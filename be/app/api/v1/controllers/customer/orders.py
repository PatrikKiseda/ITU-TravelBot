from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional
from app.core.deps import get_db, get_session_id
from app.schemas.envelope import ResponseEnvelope
from app.schemas.customer import UpdateOrderBody
from app.services.customer_order_service import CustomerOrderService
from datetime import datetime

router = APIRouter()


@router.get("/orders")
async def list_orders(
	status: Optional[str] = Query(None),
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerOrderService()
	orders = service.list_orders(db, customer_session_id, status)
	# Convert special_requirements from comma-separated string to list for each order
	orders_list = []
	for o in orders:
		order_dict = o.model_dump()
		if order_dict.get("special_requirements"):
			order_dict["special_requirements"] = o.special_requirements.split(",") if o.special_requirements else []
		else:
			order_dict["special_requirements"] = []
		orders_list.append(order_dict)
	return ResponseEnvelope.ok(orders_list)


@router.get("/orders/{order_id}")
async def get_order(
	order_id: str,
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerOrderService()
	details = service.get_order_details(db, customer_session_id, order_id)
	if not details:
		return ResponseEnvelope.err("NOT_FOUND", "Order not found")
	# Convert special_requirements from comma-separated string to list
	order_dict = details["order"].model_dump()
	if order_dict.get("special_requirements"):
		order_dict["special_requirements"] = details["order"].special_requirements.split(",") if details["order"].special_requirements else []
	else:
		order_dict["special_requirements"] = []
	return ResponseEnvelope.ok({
		"order": order_dict,
		"offer": details["offer"].model_dump(),
		"remaining_capacity": details["remaining_capacity"],
		"total_price": details["total_price"],
	})


@router.put("/orders/{order_id}")
async def update_order(
	order_id: str,
	body: UpdateOrderBody,
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerOrderService()
	try:
		order = service.update_order(
			db, customer_session_id, order_id,
			body.number_of_people,
			body.selected_transport_mode,
			body.special_requirements,
			body.is_gift,
			body.gift_recipient_email,
			body.gift_recipient_name,
			body.gift_sender_name,
			body.gift_note,
			body.gift_subject
		)
		if not order:
			return ResponseEnvelope.err("NOT_FOUND", "Order not found or not pending")
		# Convert special_requirements from comma-separated string to list for DTO
		order_dict = order.model_dump()
		if order_dict.get("special_requirements"):
			order_dict["special_requirements"] = order.special_requirements.split(",") if order.special_requirements else []
		else:
			order_dict["special_requirements"] = []
		return ResponseEnvelope.ok(order_dict)
	except ValueError as e:
		return ResponseEnvelope.err("VALIDATION_ERROR", str(e))


@router.post("/orders/{order_id}/confirm")
async def confirm_order(
	order_id: str,
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerOrderService()
	try:
		order = service.confirm_order(db, customer_session_id, order_id)
		if not order:
			return ResponseEnvelope.err("NOT_FOUND", "Order not found or not pending")
		payload = order.model_dump()
		# Ensure explicit presence of order_status for clients/tests
		payload["order_status"] = order.order_status
		# Convert special_requirements from comma-separated string to list
		if payload.get("special_requirements"):
			payload["special_requirements"] = order.special_requirements.split(",") if order.special_requirements else []
		else:
			payload["special_requirements"] = []
		return ResponseEnvelope.ok(payload)
	except ValueError as e:
		return ResponseEnvelope.err("VALIDATION_ERROR", str(e))


@router.post("/orders/{order_id}/cancel")
async def cancel_order(
	order_id: str,
	db: Session = Depends(get_db),
	customer_session_id: str = Depends(get_session_id),
):
	service = CustomerOrderService()
	order = service.cancel_order(db, customer_session_id, order_id)
	if not order:
		return ResponseEnvelope.err("NOT_FOUND", "Order not found")
	# Convert special_requirements from comma-separated string to list
	order_dict = order.model_dump()
	if order_dict.get("special_requirements"):
		order_dict["special_requirements"] = order.special_requirements.split(",") if order.special_requirements else []
	else:
		order_dict["special_requirements"] = []
	return ResponseEnvelope.ok(order_dict)

