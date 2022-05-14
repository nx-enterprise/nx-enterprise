import secrets
from typing import Any, Optional, Union

from pydantic import AnyHttpUrl, BaseSettings, PostgresDsn, validator


class Config(BaseSettings):
    API_PREFIX: str = '/api'
    SECRET_KEY: str = secrets.token_urlsafe(32)
    SERVER_NAME: str
    # CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: "['http://localhost', 'http://localhost:4200', 'http://localhost:3000', \
    # 'http://localhost:8080', 'http://local.dockertoolbox.tiangolo.com']"
    CORS_ORIGINS: list[AnyHttpUrl] = []

    @validator('CORS_ORIGINS', pre=True)
    def assemble_cors_origins(cls, v: Union[str, list[str]]) -> Union[list[str], str]:
        if isinstance(v, str) and not v.startswith('['):
            return [i.strip() for i in v.split(',')]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    PROJECT_NAME: str

    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @validator('SQLALCHEMY_DATABASE_URI', pre=True, always=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme='postgresql',
            user=values.get('POSTGRES_USER'),
            password=values.get('POSTGRES_PASSWORD'),
            host=values.get('POSTGRES_SERVER'),
            path=f'/{values.get("POSTGRES_DB") or ""}',
        )

    TEST_DB: Optional[str] = 'postgres_test'

    APP_DOMAIN: str = 'localhost'
    APP_PORT = 5000

    class Config:
        case_sensitive = True
        env_file = '.env'
        env_file_encoding = 'utf-8'


config = Config()