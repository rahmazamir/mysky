from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import CORS_ORIGINS
from app.database import init_db
from app.emotions import WEATHERS, WEATHER_ORDER
from app.routers import analyze, entries, tips
from app.routers.analyze import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="My Sky API",
    description="Turns short journal entries into an 11-weather emotional forecast using real NLP.",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(entries.router)
app.include_router(tips.router)


@app.get("/")
def root():
    return {"name": "My Sky API", "status": "clear skies ahead", "weathers": WEATHER_ORDER}


@app.get("/api/weathers")
def get_weathers():
    return WEATHERS


@app.get("/api/health")
def health():
    return {"status": "ok"}
