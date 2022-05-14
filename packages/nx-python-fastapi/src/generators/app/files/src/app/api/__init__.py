from fastapi import APIRouter
from fastapi.responses import JSONResponse

api_router = APIRouter()

@api_router.get('/health/app')
def healthcheck() -> None:
    return JSONResponse({ 'status': 'ok' })