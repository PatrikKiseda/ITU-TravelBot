from typing import Dict
import httpx
from app.core.config import settings


class ImagesClientStub:
	def search_first(self, query: str) -> Dict[str, str]:
		return {
			"url": "https://picsum.photos/seed/travel/800/600",
			"source": "stub",
			"author": "Picsum",
			"link": "https://picsum.photos",
		}


class UnsplashClient:
	def __init__(self, access_key: str | None = None):
		self.access_key = access_key or settings.UNSPLASH_KEY
		if not self.access_key:
			raise ValueError("UNSPLASH_KEY not configured")
		self.base_url = "https://api.unsplash.com"

	def search_first(self, query: str) -> Dict[str, str]:
		try:
			with httpx.Client() as client:
				response = client.get(
					f"{self.base_url}/search/photos",
					params={"query": query, "per_page": 1, "orientation": "landscape"},
					headers={"Authorization": f"Client-ID {self.access_key}"},
					timeout=10.0,
				)
				response.raise_for_status()
				data = response.json()
				
				if not data.get("results") or len(data["results"]) == 0:
					return self._fallback()
				
				photo = data["results"][0]
				url = photo["urls"]["regular"]
				
				verify_response = client.head(url, timeout=5.0)
				content_type = verify_response.headers.get("content-type", "")
				if not content_type.startswith("image/"):
					return self._fallback()
				
				return {
					"url": url,
					"source": "unsplash",
					"author": photo["user"]["name"],
					"link": photo["links"]["html"],
				}
		except Exception:
			return self._fallback()
	
	def _fallback(self) -> Dict[str, str]:
		return ImagesClientStub().search_first("travel")


class PexelsClient:
	def __init__(self, api_key: str | None = None):
		self.api_key = api_key or settings.PEXELS_API_KEY
		if not self.api_key:
			raise ValueError("PEXELS_API_KEY not configured")
		self.base_url = "https://api.pexels.com/v1"

	def search_first(self, query: str) -> Dict[str, str]:
		try:
			with httpx.Client() as client:
				response = client.get(
					f"{self.base_url}/search",
					params={"query": query, "per_page": 1, "orientation": "landscape"},
					headers={"Authorization": self.api_key},
					timeout=10.0,
				)
				response.raise_for_status()
				data = response.json()
				
				if not data.get("photos") or len(data["photos"]) == 0:
					return self._fallback()
				
				photo = data["photos"][0]
				url = photo["src"]["large"]
				
				verify_response = client.head(url, timeout=5.0)
				content_type = verify_response.headers.get("content-type", "")
				if not content_type.startswith("image/"):
					return self._fallback()
				
				return {
					"url": url,
					"source": "pexels",
					"author": photo["photographer"],
					"link": photo["url"],
				}
		except Exception:
			return self._fallback()
	
	def _fallback(self) -> Dict[str, str]:
		return ImagesClientStub().search_first("travel")
