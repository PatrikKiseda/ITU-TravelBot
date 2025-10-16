from datetime import datetime
from sqlmodel import SQLModel, Field


class ListModel(SQLModel, table=True):
	__tablename__ = "list"
	id: str = Field(primary_key=True, index=True)
	session_id: str = Field(index=True, nullable=False)
	name: str
	created_at: datetime = Field(default_factory=lambda: datetime.utcnow())


class ListItem(SQLModel, table=True):
	__tablename__ = "list_item"
	list_id: str = Field(foreign_key="list.id", primary_key=True)
	destination_id: str = Field(foreign_key="destination.id", primary_key=True)
