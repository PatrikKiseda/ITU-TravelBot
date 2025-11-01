from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class OrderStatus(str):
	PENDING = "PENDING"
	CONFIRMED = "CONFIRMED"
	CANCELLED = "CANCELLED"


class CustomerOrder(SQLModel, table=True):
	__tablename__ = "customer_order"
	id: str = Field(primary_key=True, index=True)
	customer_session_id: str = Field(index=True, nullable=False)
	offer_id: str = Field(foreign_key="agency_offer.id", index=True, nullable=False)
	number_of_people: int
	selected_transport_mode: str  # train_bus, plane, car_own
	order_status: str = Field(default=OrderStatus.PENDING)
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
	confirmed_at: Optional[datetime] = None

