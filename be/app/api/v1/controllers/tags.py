from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Optional
from app.core.deps import get_db
from app.schemas.envelope import ResponseEnvelope
from app.repositories.tag_repo import TagRepository
from app.models.tag import Tag
from pydantic import BaseModel

router = APIRouter()


class CreateTagBody(BaseModel):
    tag_name: str
    type: str


class UpdateTagBody(BaseModel):
    tag_name: Optional[str] = None
    type: Optional[str] = None


@router.get("/tags")
async def list_tags(
    tag_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List all tags, optionally filtered by type"""
    repo = TagRepository()
    tags = repo.list_all(db, tag_type)
    return ResponseEnvelope.ok([t.model_dump() for t in tags])


@router.post("/tags")
async def create_tag(
    body: CreateTagBody,
    db: Session = Depends(get_db),
):
    """Create a new tag"""
    repo = TagRepository()
    
    # Check if tag already exists
    existing = repo.get_by_name(db, body.tag_name)
    if existing:
        raise HTTPException(status_code=400, detail=f"Tag '{body.tag_name}' already exists")
    
    tag = Tag(
        tag_name=body.tag_name,
        type=body.type,
        quantity=0
    )
    created = repo.create(db, tag)
    return ResponseEnvelope.ok(created.model_dump())


@router.get("/tags/{tag_id}")
async def get_tag(
    tag_id: int,
    db: Session = Depends(get_db),
):
    """Get a single tag by ID"""
    repo = TagRepository()
    tag = repo.get_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return ResponseEnvelope.ok(tag.model_dump())


@router.put("/tags/{tag_id}")
async def update_tag(
    tag_id: int,
    body: UpdateTagBody,
    db: Session = Depends(get_db),
):
    """Update a tag"""
    repo = TagRepository()
    tag = repo.get_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    if body.tag_name is not None:
        tag.tag_name = body.tag_name
    if body.type is not None:
        tag.type = body.type
    
    updated = repo.update(db, tag)
    return ResponseEnvelope.ok(updated.model_dump())


@router.delete("/tags/{tag_id}")
async def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
):
    """Delete a tag"""
    repo = TagRepository()
    success = repo.delete(db, tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")
    return ResponseEnvelope.ok({"message": "Tag deleted successfully"})


@router.post("/offers/{offer_id}/tags/{tag_id}")
async def add_tag_to_offer(
    offer_id: str,
    tag_id: int,
    db: Session = Depends(get_db),
):
    """Associate a tag with an offer"""
    repo = TagRepository()
    tag = repo.get_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    try:
        offer_tag = repo.associate_with_offer(db, offer_id, tag_id)
        return ResponseEnvelope.ok({"message": "Tag added to offer", "offer_id": offer_id, "tag_id": tag_id})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/offers/{offer_id}/tags/{tag_id}")
async def remove_tag_from_offer(
    offer_id: str,
    tag_id: int,
    db: Session = Depends(get_db),
):
    """Remove a tag from an offer"""
    repo = TagRepository()
    success = repo.dissociate_from_offer(db, offer_id, tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="Association not found")
    return ResponseEnvelope.ok({"message": "Tag removed from offer"})


@router.get("/offers/{offer_id}/tags")
async def get_offer_tags(
    offer_id: str,
    db: Session = Depends(get_db),
):
    """Get all tags for an offer"""
    repo = TagRepository()
    tags = repo.get_tags_for_offer(db, offer_id)
    return ResponseEnvelope.ok([t.model_dump() for t in tags])

