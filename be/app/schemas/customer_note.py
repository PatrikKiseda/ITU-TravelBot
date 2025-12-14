from pydantic import BaseModel

class UpdateNoteBody(BaseModel):
    note: str
