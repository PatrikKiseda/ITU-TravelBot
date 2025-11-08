from datetime import date
from typing import List, Optional
from sqlmodel import Session, select, and_, or_, func
from app.models.agency_offer import AgencyOffer
from app.models.tag import OfferTag


class AgencyOfferRepository:
	def create(self, db: Session, offer: AgencyOffer) -> AgencyOffer:
		db.add(offer)
		db.commit()
		db.refresh(offer)
		return offer

	def get_by_id(self, db: Session, agent_session_id: str, offer_id: str) -> Optional[AgencyOffer]:
		stmt = select(AgencyOffer).where(
			AgencyOffer.agent_session_id == agent_session_id,
			AgencyOffer.id == offer_id
		)
		return db.exec(stmt).first()

	def update(self, db: Session, offer: AgencyOffer) -> AgencyOffer:
		from datetime import datetime, timezone
		offer.updated_at = datetime.now(timezone.utc)
		db.add(offer)
		db.commit()
		db.refresh(offer)
		return offer

	def delete(self, db: Session, agent_session_id: str, offer_id: str) -> None:
		offer = self.get_by_id(db, agent_session_id, offer_id)
		if not offer:
			return
		db.delete(offer)
		db.commit()

	def list_filtered(
		self,
		db: Session,
		agent_session_id: str,
		origin: Optional[str] = None,
		destination: Optional[str] = None,
		capacity_min: Optional[int] = None,
		capacity_max: Optional[int] = None,
		date_from: Optional[date] = None,
		date_to: Optional[date] = None,
		season: Optional[str] = None,
		type_of_stay: Optional[List[str]] = None,
		price_min: Optional[int] = None,
		price_max: Optional[int] = None,
		transport_mode: Optional[str] = None,
		tag_ids: Optional[List[int]] = None,
	) -> List[AgencyOffer]:
		conditions = [AgencyOffer.agent_session_id == agent_session_id]

		if origin:
			conditions.append(AgencyOffer.origin.ilike(f"%{origin}%"))
		if destination:
			conditions.append(AgencyOffer.destination_where_to.ilike(f"%{destination}%"))
		if capacity_min is not None:
			conditions.append(AgencyOffer.capacity_available >= capacity_min)
		if capacity_max is not None:
			conditions.append(AgencyOffer.capacity_available <= capacity_max)
		if date_from:
			conditions.append(AgencyOffer.date_from >= date_from)
		if date_to:
			conditions.append(AgencyOffer.date_to <= date_to)
		if season:
			conditions.append(AgencyOffer.season == season)
		if type_of_stay:
			import json
			type_conditions = []
			for stay_type in type_of_stay:
				type_conditions.append(AgencyOffer.type_of_stay.ilike(f"%{stay_type}%"))
			if type_conditions:
				conditions.append(or_(*type_conditions))
		if price_min is not None or price_max is not None:
			# Calculate total price in Python after fetching (simpler for SQLite)
			pass  # Will filter in Python
		if transport_mode:
			conditions.append(AgencyOffer.price_transport_mode == transport_mode)

		stmt = select(AgencyOffer).where(and_(*conditions))
		
		# Filter by tags if provided
		if tag_ids:
			stmt = stmt.join(OfferTag).where(OfferTag.tag_id.in_(tag_ids))
		
		results = list(db.exec(stmt))
		
		# Filter by price_housing only in Python (align with tests and simpler for SQLite)
		if price_min is not None or price_max is not None:
			filtered = []
			for offer in results:
				price = offer.price_housing
				if price_min is not None and price < price_min:
					continue
				if price_max is not None and price > price_max:
					continue
				filtered.append(offer)
			return filtered
		
		return results

