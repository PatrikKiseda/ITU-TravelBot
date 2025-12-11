from typing import Optional, List
from pydantic import BaseModel


class AcceptOfferBody(BaseModel):
	pass  # No body needed, just offer_id in path


class RejectOfferBody(BaseModel):
	pass  # No body needed, just offer_id in path


class CustomerResponseDTO(BaseModel):
	id: str
	customer_session_id: str
	offer_id: str
	response_status: str
	created_at: str


class CreateNoteBody(BaseModel):
	note_text: str


class CustomerNoteDTO(BaseModel):
	id: str
	customer_session_id: str
	offer_id: str
	note_text: str
	created_at: str
	updated_at: str


class CreateOrderBody(BaseModel):
	number_of_people: int
	selected_transport_mode: str


class UpdateOrderBody(BaseModel):
	number_of_people: Optional[int] = None
	selected_transport_mode: Optional[str] = None
	special_requirements: Optional[List[str]] = None
	is_gift: Optional[bool] = None
	gift_recipient_email: Optional[str] = None
	gift_recipient_name: Optional[str] = None
	gift_sender_name: Optional[str] = None
	gift_note: Optional[str] = None
	gift_subject: Optional[str] = None


class CustomerOrderDTO(BaseModel):
	id: str
	customer_session_id: str
	offer_id: str
	number_of_people: int
	selected_transport_mode: str
	special_requirements: Optional[List[str]] = None
	is_gift: bool = False
	gift_recipient_email: Optional[str] = None
	gift_recipient_name: Optional[str] = None
	gift_sender_name: Optional[str] = None
	gift_note: Optional[str] = None
	gift_subject: Optional[str] = None
	order_status: str
	created_at: str
	confirmed_at: Optional[str] = None


class OrderDetailsDTO(BaseModel):
	order: CustomerOrderDTO
	offer: dict  # Full AgencyOfferDTO
	remaining_capacity: int
	total_price: int


class UpdateStatusBody(BaseModel):
	status: str  # "ACCEPTED", "UNDECIDED", or "REJECTED"
