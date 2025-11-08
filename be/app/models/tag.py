from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class TagType(str):
    """Tag types for categorization"""
    HIGHLIGHT = "highlight"  # Replaces highlights field (e.g., "Beautiful beaches", "Historic architecture")
    WHY_VISIT = "why_visit"  # Replaces why_visit field (e.g., "Great weather year-round", "Affordable prices")
    THINGS_TO_CONSIDER = "things_to_consider"  # Replaces things_to_consider (e.g., "Peak season crowds", "Visa required")
    ACTIVITY = "activity"  # Additional categorization (e.g., "beach", "hiking", "skiing")
    CLIMATE = "climate"  # e.g., "tropical", "mediterranean", "alpine"
    ACCOMMODATION = "accommodation"  # e.g., "hotel", "hostel", "resort"
    BUDGET_LEVEL = "budget_level"  # e.g., "budget", "mid-range", "luxury"


class Tag(SQLModel, table=True):
    """
    Reusable tags for offers. Replaces the old highlights/why_visit/things_to_consider JSON arrays.
    
    Examples:
    - type="highlight", tag_name="Beautiful sandy beaches"
    - type="why_visit", tag_name="Affordable prices compared to Western Europe"
    - type="things_to_consider", tag_name="Peak tourist season in July-August"
    - type="activity", tag_name="beach"
    - type="climate", tag_name="mediterranean"
    """
    __tablename__ = "tag"
    
    id: int = Field(default=None, primary_key=True)
    tag_name: str = Field(index=True, nullable=False)  # The actual tag content
    type: str = Field(nullable=False, index=True)  # Type from TagType enum
    quantity: int = Field(default=0)  # Auto-incremented usage counter for popularity sorting
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)


class OfferTag(SQLModel, table=True):
    """Association table for many-to-many relationship between AgencyOffer and Tag"""
    __tablename__ = "offer_tag"
    
    offer_id: str = Field(foreign_key="agency_offer.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

