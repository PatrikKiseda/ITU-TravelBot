# Author:             Patrik Kišeda ( xkised00 )
# File:                   customer_order.py
# Functionality :   database model for customer orders with special requirements and gift options

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field
from enum import Enum

class OrderStatus(str, Enum):
	PENDING = "PENDING"
	CONFIRMED = "CONFIRMED"
	CANCELLED = "CANCELLED"
	DELETED = "DELETED"


class CustomerOrder(SQLModel, table=True):
	# stores order details including special requirements and gift options
	__tablename__ = "customer_order"
	id: str = Field(primary_key=True, index=True)
	customer_session_id: str = Field(index=True, nullable=False)
	offer_id: str = Field(foreign_key="agency_offer.id", index=True, nullable=False)
	# number of people traveling
	number_of_people: int
	# transport mode selection
	selected_transport_mode: str
	# comma-separated string of special requirements
	special_requirements: Optional[str] = None
	# whether this order is a gift
	is_gift: bool = Field(default=False)
	# gift recipient email address
	gift_recipient_email: Optional[str] = None
	# gift recipient name
	gift_recipient_name: Optional[str] = None
	# gift sender name
	gift_sender_name: Optional[str] = None
	# optional gift note
	gift_note: Optional[str] = None
	# gift email subject line
	gift_subject: Optional[str] = Field(default="You've been gifted a trip!")
	# current order status
	order_status: OrderStatus = Field(default=OrderStatus.PENDING)
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
	confirmed_at: Optional[datetime] = None

