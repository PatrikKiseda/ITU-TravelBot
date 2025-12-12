from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional
from app.core.deps import get_db, get_session_id
from app.schemas.envelope import ResponseEnvelope
from app.schemas.customer import UpdateOrderBody
from app.services.customer_order_service import CustomerOrderService

router = APIRouter()


@router.get("/orders")
async def list_orders(
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

        return ResponseEnvelope.ok({
            "order": order_dict,
            "offer": offer_dict,
            "remaining_capacity": details["remaining_capacity"],
            "total_price": details["total_price"],
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return ResponseEnvelope.err("SERVER_ERROR", str(e))


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
