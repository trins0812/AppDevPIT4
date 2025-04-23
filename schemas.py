from pydantic import BaseModel

class TodoCreate(BaseModel):
    title: str
    completed: bool = False

class TodoRead(TodoCreate):
    id: int

    class Config:
        from_attributes = True
