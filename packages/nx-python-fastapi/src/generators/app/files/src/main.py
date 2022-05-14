from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.api import api_router
from app.config import config

app = FastAPI(
    title=config.PROJECT_NAME, openapi_url=f'{config.API_PREFIX}/openapi.json'
)

# Set all CORS enabled origins
if config.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in config.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

app.include_router(api_router, prefix=config.API_PREFIX)