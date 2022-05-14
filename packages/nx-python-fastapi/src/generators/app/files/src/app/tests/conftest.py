from typing import Generator

import pytest
from fastapi.testclient import TestClient
from pydantic import PostgresDsn
from sqlalchemy import create_engine
from sqlalchemy.exc import ProgrammingError

from app.config import config
from app.db.base import Base
from app.db.session import engine, SessionLocal
from main import app


def setup_db() -> None:
    try:
        conn = engine.connect()
        conn.execute('commit')
        conn.execute(f'drop database {config.TEST_DB}')
        conn.close()
    except ProgrammingError:
        pass

    try:
        conn = engine.connect()
        conn.execute('commit')
        conn.execute(f'create database {config.TEST_DB}')
        conn.close()
    except ProgrammingError:
        pass

    config.SQLALCHEMY_DATABASE_URI = PostgresDsn.build(
        scheme='postgresql',
        user=config.POSTGRES_USER,
        password=config.POSTGRES_PASSWORD,
        host=config.POSTGRES_SERVER,
        path=f'/{config.TEST_DB}',
    )
    test_engine = create_engine(config.SQLALCHEMY_DATABASE_URI)
    Base.metadata.create_all(test_engine)
    SessionLocal.configure(bind=test_engine)


@pytest.fixture(scope='session')
def db() -> Generator:
    setup_db()
    yield SessionLocal()


@pytest.fixture(scope='module')
def client() -> Generator:
    with TestClient(app) as c:
        yield c
