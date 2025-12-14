# Author:             Patrik Kišeda ( xkised00 )
# File:                   image_service.py
# Functionality :   service for fetching images from external apis

from typing import Dict
from app.clients.images_client import ImagesClientStub, UnsplashClient, PexelsClient
from app.core.config import settings


class ImageService:
	# handles image search operations
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
		# searches for an image using the configured provider
		return self.client.search_first(query)
