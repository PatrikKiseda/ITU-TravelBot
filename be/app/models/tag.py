# Author:             Patrik Kišeda ( xkised00 )
# File:                   tag.py
# Functionality :   database models for reusable tags system

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class TagType(str):
    HIGHLIGHT = "highlight"
    WHY_VISIT = "why_visit"
    THINGS_TO_CONSIDER = "things_to_consider"
    ACTIVITY = "activity"
    CLIMATE = "climate"
    ACCOMMODATION = "accommodation"
    BUDGET_LEVEL = "budget_level"


class Tag(SQLModel, table=True):
    # reusable tags for categorizing offers
    __tablename__ = "tag"
    
    # tag identifier
    id: int = Field(default=None, primary_key=True)
    # tag text content
    tag_name: str = Field(index=True, nullable=False)
    # tag type category
    type: str = Field(nullable=False, index=True)
    # usage counter for popularity sorting
    quantity: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)


class OfferTag(SQLModel, table=True):
    # association table linking offers to tags
    __tablename__ = "offer_tag"
    
    offer_id: str = Field(foreign_key="agency_offer.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

