import logging
from sqlalchemy.orm import Session
import models
import schemas
from fastapi import HTTPException

logger = logging.getLogger(__name__)

def get_todos(db: Session):
    try:
        todos = db.query(models.Todo).all()
        logger.info(f"Fetched {len(todos)} todos from the database")
        return todos
    except Exception as e:
        logger.error(f"Error fetching todos: {e}")
        raise HTTPException(status_code=500, detail="Error fetching todos")

def get_todo(db: Session, todo_id: int):
    try:
        todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
        if todo:
            logger.info(f"Fetched todo with id: {todo_id}")
        else:
            logger.warning(f"Todo with id {todo_id} not found")
        return todo
    except Exception as e:
        logger.error(f"Error fetching todo with id {todo_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching todo")

def create_todo(db: Session, todo: schemas.TodoCreate):
    try:
        
        logger.info(f"Creating todo with title: {todo.title} and completed: {todo.completed}")
        
        
        db_todo = models.Todo(**todo.dict())
        db.add(db_todo)
        db.commit()
        db.refresh(db_todo)

      
        logger.info(f"Created todo with id: {db_todo.id}")
        return db_todo
    except Exception as e:
        db.rollback()  
        logger.error(f"Error creating todo: {e}")
        raise HTTPException(status_code=500, detail="Error creating todo")

def update_todo(db: Session, todo_id: int, todo: schemas.TodoCreate):
    try:
        db_todo = get_todo(db, todo_id)
        if db_todo:
            db_todo.title = todo.title
            db_todo.completed = todo.completed
            db.commit()
            db.refresh(db_todo)

            logger.info(f"Updated todo with id: {todo_id}")
            return db_todo
        else:
            logger.warning(f"Todo with id {todo_id} not found for update")
            return None
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating todo with id {todo_id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating todo")

def delete_todo(db: Session, todo_id: int):
    try:
        db_todo = get_todo(db, todo_id)
        if db_todo:
            db.delete(db_todo)
            db.commit()

            logger.info(f"Deleted todo with id: {todo_id}")
            return {"message": "Todo deleted successfully"}
        else:
            logger.warning(f"Todo with id {todo_id} not found for deletion")
            return {"message": "Todo not found"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting todo with id {todo_id}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting todo")
