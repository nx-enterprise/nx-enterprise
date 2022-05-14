from sqlalchemy.orm import Session

from app import crud, schemas
from app.config import config
from app.db import base  # noqa: F401

# Import all SQLAlchemy models (app.db.base) before initializing DB


def init_db(db: Session) -> None:
    # Tables created with Alembic migrations

    pass
