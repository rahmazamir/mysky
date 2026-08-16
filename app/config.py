"""
Central configuration for the My Sky backend.
Reads everything from environment variables (.env in local dev,
real environment variables when deployed on Render/Railway/Fly/etc).
"""
import os
from dotenv import load_dotenv

load_dotenv()

# --- Hugging Face -----------------------------------------------------
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
HF_API_BASE = "https://api-inference.huggingface.co/models"

# Fine-grained (28-label) emotion classifier -> the core signal for My Sky.
HF_EMOTION_MODEL = "SamLowe/roberta-base-go_emotions"

# Urdu -> English translation, used only when the entry is written in Urdu
# script, so the emotion classifier (English-trained) can still read it.
HF_TRANSLATION_MODEL = "Helsinki-NLP/opus-mt-ur-en"

# How long we're willing to wait (seconds) for a cold Hugging Face model
# to spin up on the free Inference API before we retry / fall back.
HF_COLD_START_MAX_WAIT = 15
HF_REQUEST_TIMEOUT = 12

# --- CORS ---------------------------------------------------------------
_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    # common ports for serving the static (vanilla JS) frontend locally
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "null",  # Origin sent by some browsers when a page is opened via file://
]
_env_origins = os.getenv("CORS_ORIGINS", "")
CORS_ORIGINS = _default_origins + [o.strip() for o in _env_origins.split(",") if o.strip()]

# --- Database -------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mysky.db")

# --- Safety ---------------------------------------------------------------
CRISIS_HELPLINE_URL = "https://findahelpline.com"
CRISIS_HELPLINE_NUMBER = "988"
