from typing import List, Dict, Any
from app.services.llm_service import LLMService
from app.services.image_service import ImageService


class ExplorationService:
	def __init__(self, llm: LLMService | None = None, images: ImageService | None = None):
		self.llm = llm or LLMService()
		self.images = images or ImageService()

	def generate_suggestions(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
		suggestions = self.llm.suggest_destinations(filters)
		enriched = []
		for suggestion in suggestions:
			query = f"{suggestion['title']} {suggestion['country']} travel"
			image_data = self.images.pick_image(query)
			suggestion["image_url"] = image_data.get("url")
			suggestion["image_credit_source"] = image_data.get("source")
			suggestion["image_credit_author"] = image_data.get("author")
			suggestion["image_credit_link"] = image_data.get("link")
			enriched.append(suggestion)
		return enriched

