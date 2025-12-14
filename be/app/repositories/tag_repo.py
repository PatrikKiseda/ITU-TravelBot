# Author:             Patrik Kišeda ( xkised00 )
# File:                   tag_repo.py
# Functionality :   data access layer for tags and offer-tag associations

from typing import List, Optional
from sqlmodel import Session, select
from app.models.tag import Tag, OfferTag
from datetime import datetime, timezone


class TagRepository:
	# handles database operations for tags
    def create(self, db: Session, tag: Tag) -> Tag:
		# creates a new tag
        db.add(tag)
        db.commit()
        db.refresh(tag)
        return tag

    def get_by_id(self, db: Session, tag_id: int) -> Optional[Tag]:
        return db.get(Tag, tag_id)

    def get_by_name(self, db: Session, tag_name: str) -> Optional[Tag]:
        stmt = select(Tag).where(Tag.tag_name == tag_name)
        return db.exec(stmt).first()

    def list_all(self, db: Session, tag_type: Optional[str] = None, order_by_popularity: bool = True) -> List[Tag]:
		# lists all tags optionally filtered by type and sorted by popularity
        stmt = select(Tag)
        if tag_type:
            stmt = stmt.where(Tag.type == tag_type)
        if order_by_popularity:
            stmt = stmt.order_by(Tag.quantity.desc(), Tag.tag_name)
        else:
            stmt = stmt.order_by(Tag.tag_name)
        return list(db.exec(stmt))

    def update(self, db: Session, tag: Tag) -> Tag:
        tag.updated_at = datetime.now(timezone.utc)
        db.add(tag)
        db.commit()
        db.refresh(tag)
        return tag

    def delete(self, db: Session, tag_id: int) -> bool:
        tag = self.get_by_id(db, tag_id)
        if tag:
            db.delete(tag)
            db.commit()
            return True
        return False

    def increment_quantity(self, db: Session, tag_id: int) -> None:
		# increments tag usage counter
        tag = self.get_by_id(db, tag_id)
        if tag:
            tag.quantity += 1
            tag.updated_at = datetime.now(timezone.utc)
            db.add(tag)
            db.commit()

    def decrement_quantity(self, db: Session, tag_id: int) -> None:
		# decrements tag usage counter
        tag = self.get_by_id(db, tag_id)
        if tag and tag.quantity > 0:
            tag.quantity -= 1
            tag.updated_at = datetime.now(timezone.utc)
            db.add(tag)
            db.commit()

    def associate_with_offer(self, db: Session, offer_id: str, tag_id: int) -> OfferTag:
		# creates association between offer and tag
        offer_tag = OfferTag(offer_id=offer_id, tag_id=tag_id)
        db.add(offer_tag)
        self.increment_quantity(db, tag_id)
        db.commit()
        return offer_tag

    def dissociate_from_offer(self, db: Session, offer_id: str, tag_id: int) -> bool:
		# removes association between offer and tag
        stmt = select(OfferTag).where(
            OfferTag.offer_id == offer_id,
            OfferTag.tag_id == tag_id
        )
        offer_tag = db.exec(stmt).first()
        if offer_tag:
            db.delete(offer_tag)
            self.decrement_quantity(db, tag_id)
            db.commit()
            return True
        return False

    def get_tags_for_offer(self, db: Session, offer_id: str) -> List[Tag]:
		# gets all tags for a specific offer
        stmt = select(Tag).join(OfferTag).where(OfferTag.offer_id == offer_id)
        return list(db.exec(stmt))

    def get_offers_by_tag(self, db: Session, tag_id: int) -> List[str]:
        """Get all offer IDs that have this tag"""
        stmt = select(OfferTag.offer_id).where(OfferTag.tag_id == tag_id)
        return list(db.exec(stmt))

