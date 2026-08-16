from fastapi import APIRouter, HTTPException

from app.emotions import WEATHERS
from app.tips import get_tip

router = APIRouter(prefix="/api/tips", tags=["tips"])


@router.get("/{weather_key}")
def tip_for(weather_key: str):
    if weather_key not in WEATHERS:
        raise HTTPException(status_code=404, detail="Unknown weather key")
    return get_tip(weather_key)


@router.get("")
def all_tips():
    return {k: get_tip(k) for k in WEATHERS}
