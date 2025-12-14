# Author:             Patrik Kišeda ( xkised00 )
# File:                   validation.py
# Functionality :   validation functions for offer data

from datetime import date
from typing import Dict, Any
from app.models.agency_offer import TransportMode


class ValidationError(Exception):
	# custom validation error exception
	pass


def validate_offer_data(data: Dict[str, Any]) -> None:
	# validates offer data before creation or update
	if data.get("date_to") and data.get("date_from"):
		if data["date_to"] < data["date_from"]:
			raise ValidationError("date_to must be after date_from")
	
	if data.get("capacity_total") is not None and data.get("capacity_available") is not None:
		if data["capacity_available"] > data["capacity_total"]:
			raise ValidationError("capacity_available cannot exceed capacity_total")
		if data["capacity_available"] < 0:
			raise ValidationError("capacity_available cannot be negative")
	
	transport_mode = data.get("price_transport_mode")
	if transport_mode:
		valid_modes = [TransportMode.TRAIN_BUS, TransportMode.PLANE, TransportMode.CAR_OWN, TransportMode.NONE]
		if transport_mode not in valid_modes:
			raise ValidationError(f"Invalid transport_mode: {transport_mode}. Must be one of {valid_modes}")
		
		if transport_mode in [TransportMode.CAR_OWN, TransportMode.NONE] and data.get("price_transport_amount"):
			raise ValidationError(f"price_transport_amount should be null for transport_mode={transport_mode}")
	
	if data.get("price_housing") is not None and data["price_housing"] < 0:
		raise ValidationError("price_housing cannot be negative")
	
	if data.get("price_food") is not None and data["price_food"] < 0:
		raise ValidationError("price_food cannot be negative")
	
	if data.get("price_transport_amount") is not None and data["price_transport_amount"] < 0:
		raise ValidationError("price_transport_amount cannot be negative")


def calculate_total_price(offer: Dict[str, Any]) -> int:
	housing = offer.get("price_housing", 0)
	food = offer.get("price_food", 0)
	transport = offer.get("price_transport_amount", 0)
	return housing + food + transport

