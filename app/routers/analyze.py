from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.emotion_engine import analyze_text
from app.emotions import WEATHERS
from app.crisis_detector import detect_crisis, CRISIS_MESSAGE_EN, CRISIS_MESSAGE_UR
from app.schemas import AnalyzeRequest, AnalyzeResponse

router = APIRouter(prefix="/api", tags=["analyze"])
limiter = Limiter(key_func=get_remote_address)


def build_response(text: str) -> dict:
    result = analyze_text(text)
    weather_key = result["weather_key"]
    meta = WEATHERS[weather_key]

    breakdown = []
    for item in result["breakdown"]:
        m = WEATHERS[item["key"]]
        breakdown.append({
            "key": item["key"],
            "label_en": m["label_en"],
            "label_ur": m["label_ur"],
            "percent": item["percent"],
            "color": m["color"],
        })

    crisis = detect_crisis(text)

    return {
        "weather_key": weather_key,
        "label_en": meta["label_en"],
        "label_ur": meta["label_ur"],
        "breakdown": breakdown,
        "star_color": meta["color"],
        "gradient": meta["gradient"],
        "detected_language": result["detected_language"],
        "model_source": result["model_source"],
        "crisis_flag": crisis,
        "crisis_message_en": CRISIS_MESSAGE_EN if crisis else None,
        "crisis_message_ur": CRISIS_MESSAGE_UR if crisis else None,
    }


@router.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit("30/minute")
def analyze(request: Request, body: AnalyzeRequest):
    return build_response(body.text)
