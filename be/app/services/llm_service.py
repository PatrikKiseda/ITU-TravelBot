from typing import Any, Dict, List
from app.clients.openai_client import OpenAIClientStub


class LLMService:
	def __init__(self, client: OpenAIClientStub | None = None) -> None:
		self.client = client or OpenAIClientStub()

	def suggest_destinations(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
		res = self.client.suggest_destinations(filters)
		if not isinstance(res, list) or len(res) != 5:
			raise ValueError("LLM returned invalid suggestions length")
		return res

	def expand_destination(self, base: Dict[str, Any], options: Dict[str, Any]) -> Dict[str, Any]:
		return self.client.expand_destination(base, options)

	def customize_destination(self, base: Dict[str, Any], user_prompt: str) -> Dict[str, Any]:
		return self.client.customize_destination(base, user_prompt)
