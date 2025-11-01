from typing import Any, Dict, List
from app.clients.openai_client import OpenAIClientStub, OpenAIClient
from app.core.config import settings


class LLMService:
	def __init__(self, client=None):
		if client:
			self.client = client
		elif settings.OPENAI_API_KEY:
			try:
				self.client = OpenAIClient(model=settings.OPENAI_MODEL)
			except ValueError:
				self.client = OpenAIClientStub()
		else:
			self.client = OpenAIClientStub()

	def suggest_destinations(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
		res = self.client.suggest_destinations(filters)
		if not isinstance(res, list) or len(res) != 5:
			raise ValueError("LLM returned invalid suggestions length")
		return res

	def expand_destination(self, base: Dict[str, Any], options: Dict[str, Any]) -> Dict[str, Any]:
		return self.client.expand_destination(base, options)

	def customize_destination(self, base: Dict[str, Any], user_prompt: str) -> Dict[str, Any]:
		return self.client.customize_destination(base, user_prompt)
