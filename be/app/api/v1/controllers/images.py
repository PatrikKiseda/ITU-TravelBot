from fastapi import APIRouter, Query
from app.schemas.envelope import ResponseEnvelope
from app.services.image_service import ImageService

router = APIRouter()


@router.get("/images/search")
async def search_images(q: str = Query(...), limit: int = 3):
	service = ImageService()
	rows = []
	for i in range(max(1, min(limit, 5))):
		img = service.pick_image(q)
		rows.append({"url": img.get("url"), "credit": {"source": img.get("source"), "author": img.get("author"), "link": img.get("link")}})
	return ResponseEnvelope.ok(rows)
