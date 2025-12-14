# Author:             Patrik Kišeda ( xkised00 )
# File:                   openai_client.py
# Functionality :   clients for interacting with openai api

from typing import Any, Dict, List
import random
from app.core.config import settings


class OpenAIClientStub:
	# stub client for testing without api key
	def __init__(self, seed: int = 42) -> None:
		random.seed(seed)

	def suggest_destinations(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
		bases = [
			{"title": "Valencia", "country": "Spain", "tags": ["city", "beach"]},
			{"title": "Lisbon", "country": "Portugal", "tags": ["city", "coast"]},
			{"title": "Split", "country": "Croatia", "tags": ["beach", "islands"]},
			{"title": "Madeira", "country": "Portugal", "tags": ["islands", "nature"]},
			{"title": "Sicily", "country": "Italy", "tags": ["islands", "beach"]},
		]
		results = []
		for b in bases:
			price = random.randint(300, 1600)
			results.append({
				"title": b["title"],
				"country": b["country"],
				"shortDescription": f"A lovely trip to {b['title']} with {', '.join(b['tags'])} vibes.",
				"approxPriceEUR": price,
				"priceNote": "Rough estimate for 6-8 nights",
				"tags": b["tags"][:],
				"price": {
					"flight": {"min": price // 3, "max": price // 2},
					"stay": {"min": price // 4, "max": price // 3},
					"food": {"min": price // 6, "max": price // 5},
				},
			})
		return results

	def expand_destination(self, base: Dict[str, Any], options: Dict[str, Any]) -> Dict[str, Any]:
		return {
			"highlights": ["Old town walk", "Local cuisine tour", "Coastal sunset"],
			"whyVisit": ["Great weather", "Affordable", "Cultural sites"],
			"thingsToConsider": ["Peak season crowds", "Siesta hours"],
			"longDescription": f"Explore {base.get('title', 'the destination')} with a balance of culture and relaxation.",
		}

	def customize_destination(self, base: Dict[str, Any], user_prompt: str) -> Dict[str, Any]:
		return {
			"highlights": ["Hidden beaches", "Quiet neighborhoods"],
			"whyVisit": ["Relaxed vibe", "Great food"],
			"thingsToConsider": ["Limited nightlife"],
			"longDescription": f"Tailored plan considering: {user_prompt}",
		}


class OpenAIClient:
	# client for openai api
	def __init__(self, api_key: str | None = None, model: str = "gpt-4o-mini"):
		self.api_key = api_key or settings.OPENAI_API_KEY
		self.model = model or settings.OPENAI_MODEL
		if not self.api_key:
			raise ValueError("OPENAI_API_KEY not configured")

	def suggest_destinations(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
		try:
			from openai import OpenAI
			client = OpenAI(api_key=self.api_key)
			
			system_prompt = """You are a travel advisor. Generate exactly 5 travel destination suggestions based on user filters.
Return JSON only per the provided schema. Prices are rough estimates for 6-8 nights; round to nearest 10 EUR.
Consider the user's preferences for regions, budget, transport, and stay type."""
			
			user_prompt = f"""Generate 5 travel destination suggestions with these filters:
Regions: {filters.get('regions', [])}
Origin: {filters.get('origin', 'Unknown')}
Party size: {filters.get('partySize', 'Unknown')}
When: {filters.get('when', 'Unknown')}
Stay type: {filters.get('stayType', [])}
Budget EUR: {filters.get('budgetEUR', {})}
Transport: {filters.get('transport', [])}"""
			
			schema = {
				"type": "object",
				"required": ["destinations"],
				"additionalProperties": False,
				"properties": {
					"destinations": {
						"type": "array",
						"minItems": 5,
						"maxItems": 5,
						"items": {
							"type": "object",
							"additionalProperties": False,
							"required": ["title", "country", "shortDescription", "approxPriceEUR", "priceNote", "tags", "price"],
							"properties": {
								"title": {"type": "string"},
								"country": {"type": "string"},
								"shortDescription": {"type": "string", "maxLength": 320},
								"approxPriceEUR": {"type": "integer", "minimum": 100, "maximum": 2500},
								"priceNote": {"type": "string", "maxLength": 80},
								"tags": {"type": "array", "items": {"type": "string"}, "maxItems": 8},
								"price": {
									"type": "object",
									"required": ["flight", "stay", "food"],
									"properties": {
										"flight": {"type": "object", "properties": {"min": {"type": "integer"}, "max": {"type": "integer"}}},
										"stay": {"type": "object", "properties": {"min": {"type": "integer"}, "max": {"type": "integer"}}},
										"food": {"type": "object", "properties": {"min": {"type": "integer"}, "max": {"type": "integer"}}},
									},
								},
							},
						},
					},
				},
			}
			
			response = client.beta.chat.completions.parse(
				model=self.model,
				messages=[
					{"role": "system", "content": system_prompt},
					{"role": "user", "content": user_prompt},
				],
				response_format={"type": "json_schema", "json_schema": {"name": "destinations_response", "strict": True, "schema": schema}},
				temperature=0.2,
				seed=42,
			)
			
			parsed = response.choices[0].message.parsed
			if not parsed or "destinations" not in parsed:
				raise ValueError("Invalid response format from OpenAI")
			
			return parsed["destinations"]
		except Exception as e:
			raise ValueError(f"OpenAI API error: {str(e)}")

	def expand_destination(self, base: Dict[str, Any], options: Dict[str, Any]) -> Dict[str, Any]:
		try:
			from openai import OpenAI
			client = OpenAI(api_key=self.api_key)
			
			system_prompt = """You are a travel advisor. Generate detailed information about a destination.
Return JSON only per the provided schema."""
			
			user_prompt = f"""Generate detailed information for: {base.get('title', 'destination')}, {base.get('country', '')}
Include highlights, why visit, things to consider, and a long description."""
			
			schema = {
				"type": "object",
				"additionalProperties": False,
				"required": ["highlights", "whyVisit", "thingsToConsider", "longDescription"],
				"properties": {
					"highlights": {"type": "array", "items": {"type": "string"}, "maxItems": 6},
					"whyVisit": {"type": "array", "items": {"type": "string"}, "maxItems": 6},
					"thingsToConsider": {"type": "array", "items": {"type": "string"}, "maxItems": 6},
					"longDescription": {"type": "string", "maxLength": 1200},
				},
			}
			
			response = client.beta.chat.completions.parse(
				model=self.model,
				messages=[
					{"role": "system", "content": system_prompt},
					{"role": "user", "content": user_prompt},
				],
				response_format={"type": "json_schema", "json_schema": {"name": "expand_response", "strict": True, "schema": schema}},
				temperature=0.2,
				seed=42,
			)
			
			parsed = response.choices[0].message.parsed
			if not parsed:
				raise ValueError("Invalid response format from OpenAI")
			
			return parsed
		except Exception as e:
			raise ValueError(f"OpenAI API error: {str(e)}")

	def customize_destination(self, base: Dict[str, Any], user_prompt: str) -> Dict[str, Any]:
		try:
			from openai import OpenAI
			client = OpenAI(api_key=self.api_key)
			
			system_prompt = """You are a travel advisor. Customize destination details based on user preferences.
Return JSON only per the provided schema."""
			
			prompt = f"""Destination: {base.get('title', 'destination')}, {base.get('country', '')}
User preferences: {user_prompt}
Generate customized highlights, why visit, things to consider, and description."""
			
			schema = {
				"type": "object",
				"additionalProperties": False,
				"required": ["highlights", "whyVisit", "thingsToConsider", "longDescription"],
				"properties": {
					"highlights": {"type": "array", "items": {"type": "string"}, "maxItems": 6},
					"whyVisit": {"type": "array", "items": {"type": "string"}, "maxItems": 6},
					"thingsToConsider": {"type": "array", "items": {"type": "string"}, "maxItems": 6},
					"longDescription": {"type": "string", "maxLength": 1200},
				},
			}
			
			response = client.beta.chat.completions.parse(
				model=self.model,
				messages=[
					{"role": "system", "content": system_prompt},
					{"role": "user", "content": prompt},
				],
				response_format={"type": "json_schema", "json_schema": {"name": "customize_response", "strict": True, "schema": schema}},
				temperature=0.2,
				seed=42,
			)
			
			parsed = response.choices[0].message.parsed
			if not parsed:
				raise ValueError("Invalid response format from OpenAI")
			
			return parsed
		except Exception as e:
			raise ValueError(f"OpenAI API error: {str(e)}")
