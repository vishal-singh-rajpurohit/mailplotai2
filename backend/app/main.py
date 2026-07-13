import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, emails, ai, voice, insights
from app.db.init_db import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up: auto-initializing database if needed...")
    try:
        await init_db()
    except Exception as e:
        logger.error(f"Failed to auto-initialize database on startup: {e}")
    yield

app = FastAPI(
    title="InboxPilot AI Backend API",
    description="Backend services for voice-based AI email insights and summarization",
    version="1.0.0",
    lifespan=lifespan
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(
        f"Request: {request.method} {request.url.path} - "
        f"Response: {response.status_code} - "
        f"Completed in {process_time:.4f}s"
    )
    return response

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception occurred on path {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred on the server. Please try again later."}
    )

# Root/Health endpoints
@app.get("/health", tags=["system"])
def health_check():
    """
    Returns system readiness status.
    """
    return {
        "status": "ok",
        "version": "1.0.0"
    }

# Include App Routers under the api prefix
app.include_router(auth.router, prefix="/api/v1")
app.include_router(emails.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(voice.router, prefix="/api/v1")
app.include_router(insights.router, prefix="/api/v1")
