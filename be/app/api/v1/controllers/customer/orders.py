# Author:             Patrik Kišeda ( xkised00 )
# File:                   orders.py
# Functionality :   api endpoints for customer order management

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session
from typing import Optional
from app.core.deps import get_db, get_session_id
from app.schemas.envelope import ResponseEnvelope
from app.schemas.customer import UpdateOrderBody
from app.services.customer_order_service import CustomerOrderService
from sqlmodel import select
from app.models.customer_note import CustomerNote
from app.models.customer_order import CustomerOrder
from app.schemas.customer_note import UpdateNoteBody
from datetime import datetime, timezone
from uuid import uuid4




router = APIRouter()
order_service = CustomerOrderService()


@router.get("/orders")
async def list_orders(
	# lists all orders for the current customer session
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    customer_session_id: str = Depends(get_session_id),
):
    service = CustomerOrderService()
    try:
        orders = service.list_orders(db, customer_session_id, status)
        orders_list = []
        for o in orders:
            # `o` is already a dict
            order_dict = dict(o)
            if order_dict.get("special_requirements"):
                order_dict["special_requirements"] = order_dict["special_requirements"].split(",")
            else:
                order_dict["special_requirements"] = []
            orders_list.append(order_dict)
        return ResponseEnvelope.ok(orders_list)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return ResponseEnvelope.err("SERVER_ERROR", str(e))


@router.get("/orders/{order_id}")
async def get_order(
	# gets detailed information about a specific order
    order_id: str,
    db: Session = Depends(get_db),
    customer_session_id: str = Depends(get_session_id),
):
    service = CustomerOrderService()
    try:
        details = service.get_order_details(db, customer_session_id, order_id)
        if not details:
            return ResponseEnvelope.err("NOT_FOUND", "Order not found")

        order_obj = details["order"]
        order_dict = order_obj.model_dump() if hasattr(order_obj, "model_dump") else dict(order_obj)
        if order_dict.get("special_requirements"):
            order_dict["special_requirements"] = order_obj.special_requirements.split(",") if order_obj.special_requirements else []
        else:
            order_dict["special_requirements"] = []

        offer_obj = details["offer"]
        offer_dict = offer_obj.model_dump() if hasattr(offer_obj, "model_dump") else dict(offer_obj)
        
        note = db.exec(
            select(CustomerNote)
            .where(
                CustomerNote.customer_session_id == customer_session_id,
                CustomerNote.offer_id == order_obj.offer_id
            )
        ).first()

        return ResponseEnvelope.ok({
            "order": order_dict,
            "offer": offer_dict,
            "remaining_capacity": details["remaining_capacity"],
            "total_price": details["total_price"],
            "note": note.note_text if note else ""
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return ResponseEnvelope.err("SERVER_ERROR", str(e))


@router.put("/orders/{order_id}")
async def update_order(
	# updates an existing pending order
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

        order_dict = order.model_dump() if hasattr(order, "model_dump") else dict(order)
        if order_dict.get("special_requirements"):
            order_dict["special_requirements"] = order.special_requirements.split(",") if order.special_requirements else []
        else:
            order_dict["special_requirements"] = []

        return ResponseEnvelope.ok(order_dict)
    except ValueError as e:
        return ResponseEnvelope.err("VALIDATION_ERROR", str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        return ResponseEnvelope.err("SERVER_ERROR", str(e))

@router.put("/orders/{order_id}/note")
async def update_order_note(
    order_id: str,
    body: UpdateNoteBody,
    db: Session = Depends(get_db),
    customer_session_id: str = Depends(get_session_id),
):
    order = db.get(CustomerOrder, order_id)
    if not order or order.customer_session_id != customer_session_id:
        return ResponseEnvelope.err("NOT_FOUND", "Order not found")

    note = db.exec(
        select(CustomerNote).where(
            CustomerNote.customer_session_id == customer_session_id,
            CustomerNote.offer_id == order.offer_id
        )
    ).first()

    if note:
        note.note_text = body.note
        note.updated_at = datetime.now(timezone.utc)
    else:
        note = CustomerNote(
            id=str(uuid4()),
            customer_session_id=customer_session_id,
            offer_id=order.offer_id,
            note_text=body.note
        )
        db.add(note)

    db.commit()
    return ResponseEnvelope.ok({"note": note.note_text})


@router.post("/orders/{order_id}/confirm")
async def confirm_order(
	# confirms a pending order
    order_id: str,
    db: Session = Depends(get_db),
    customer_session_id: str = Depends(get_session_id),
):
    service = CustomerOrderService()
    try:
        order = service.confirm_order(db, customer_session_id, order_id)
        if not order:
            return ResponseEnvelope.err("NOT_FOUND", "Order not found or not pending")

        payload = order.model_dump() if hasattr(order, "model_dump") else dict(order)
        payload["order_status"] = order.order_status
        if payload.get("special_requirements"):
            payload["special_requirements"] = order.special_requirements.split(",") if order.special_requirements else []
        else:
            payload["special_requirements"] = []

        return ResponseEnvelope.ok(payload)
    except ValueError as e:
        return ResponseEnvelope.err("VALIDATION_ERROR", str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        return ResponseEnvelope.err("SERVER_ERROR", str(e))


@router.post("/orders/{order_id}/cancel")
async def cancel_order(
	# cancels an existing order
    order_id: str,
    db: Session = Depends(get_db),
    customer_session_id: str = Depends(get_session_id),
):
    service = CustomerOrderService()
    try:
        order = service.cancel_order(db, customer_session_id, order_id)
        if not order:
            return ResponseEnvelope.err("NOT_FOUND", "Order not found")

        order_dict = order.model_dump() if hasattr(order, "model_dump") else dict(order)
        if order_dict.get("special_requirements"):
            order_dict["special_requirements"] = order.special_requirements.split(",") if order.special_requirements else []
        else:
            order_dict["special_requirements"] = []

        return ResponseEnvelope.ok(order_dict)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return ResponseEnvelope.err("SERVER_ERROR", str(e))

@router.delete("/orders/trash")
async def empty_trash(
	# deletes all cancelled orders for the session
    db: Session = Depends(get_db),
    customer_session_id: str = Depends(get_session_id),
):
    service = CustomerOrderService()
    try:
        deleted_count = service.delete_cancelled_orders(db, customer_session_id)
        return ResponseEnvelope.ok({"deleted_count": deleted_count})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return ResponseEnvelope.err("SERVER_ERROR", str(e))
