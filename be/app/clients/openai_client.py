from typing import Any, Dict, List
import random


class OpenAIClientStub:
	def __init__(self, seed: int = 42) -> None:
		random.seed(seed)

	def suggest_destinations(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
		# Produce exactly 5 stubbed destinations with roughly valid fields
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
