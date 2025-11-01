from typing import Dict
from app.clients.images_client import ImagesClientStub, UnsplashClient, PexelsClient
from app.core.config import settings


class ImageService:
	def __init__(self):
		provider = settings.IMAGE_PROVIDER.lower()
		if provider == "unsplash" and settings.UNSPLASH_KEY:
			try:
				self.client = UnsplashClient()
			except ValueError:
				self.client = ImagesClientStub()
		elif provider == "pexels" and settings.PEXELS_API_KEY:
			try:
				self.client = PexelsClient()
			except ValueError:
				self.client = ImagesClientStub()
		else:
			self.client = ImagesClientStub()

	def pick_image(self, query: str) -> Dict[str, str]:
		return self.client.search_first(query)
