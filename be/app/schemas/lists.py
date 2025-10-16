from typing import List, Optional
from pydantic import BaseModel


class ListDTO(BaseModel):
	id: str
	name: str


class ListSummaryDTO(BaseModel):
	id: str
	name: str
	stats: dict


class ListWithMembersDTO(BaseModel):
	id: str
	name: str
	members: List[str]
	stats: dict


class CreateListBody(BaseModel):
	name: str


class AddItemBody(BaseModel):
	destinationId: str


class AddItemsBulkBody(BaseModel):
	destinationIds: List[str]
