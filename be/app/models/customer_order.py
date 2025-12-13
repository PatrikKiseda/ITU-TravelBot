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
	__tablename__ = "customer_order"
	id: str = Field(primary_key=True, index=True)
	customer_session_id: str = Field(index=True, nullable=False)
	offer_id: str = Field(foreign_key="agency_offer.id", index=True, nullable=False)
	number_of_people: int
	selected_transport_mode: str  # train_bus, plane, car_own
	special_requirements: Optional[str] = None  # Comma-separated string: "allergies,elderly,disability"
	is_gift: bool = Field(default=False)
	gift_recipient_email: Optional[str] = None
	gift_recipient_name: Optional[str] = None
	gift_sender_name: Optional[str] = None
	gift_note: Optional[str] = None
	gift_subject: Optional[str] = Field(default="You've been gifted a trip!")
	order_status: OrderStatus = Field(default=OrderStatus.PENDING)
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
	confirmed_at: Optional[datetime] = None

