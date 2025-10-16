from typing import Dict
from app.clients.images_client import ImagesClientStub


class ImageService:
	def __init__(self, client: ImagesClientStub | None = None) -> None:
		self.client = client or ImagesClientStub()

	def pick_image(self, query: str) -> Dict[str, str]:
		return self.client.search_first(query)
