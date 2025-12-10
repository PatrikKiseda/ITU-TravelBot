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
	return ResponseEnvelope.ok([o.model_dump() for o in orders])


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
	return ResponseEnvelope.ok({
		"order": details["order"].model_dump(),
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
		order = service.update_order(db, customer_session_id, order_id, body.number_of_people, body.selected_transport_mode)
		if not order:
			return ResponseEnvelope.err("NOT_FOUND", "Order not found or not pending")
		return ResponseEnvelope.ok(order.model_dump())
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
	print("Cancel attempt:", customer_session_id, order_id)
	order = service.cancel_order(db, customer_session_id, order_id)
	if not order:
		print("Order not found or not cancellable")
		return ResponseEnvelope.err("NOT_FOUND", "Order not found")
	print("Order cancelled:", order.order_status)
	return ResponseEnvelope.ok(order.model_dump())


