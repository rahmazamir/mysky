from datetime import date
from typing import List, Optional
from pydantic import BaseModel, Field, constr


class AnalyzeRequest(BaseModel):
    text: constr(min_length=1, max_length=2000)


class BreakdownItem(BaseModel):
    key: str
    label_en: str
    label_ur: str
    percent: float
    color: str


class AnalyzeResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    weather_key: str
    label_en: str
    label_ur: str
    breakdown: List[BreakdownItem]
    star_color: str
    gradient: List[str]
    detected_language: str
    model_source: str
    crisis_flag: bool
    crisis_message_en: Optional[str] = None
    crisis_message_ur: Optional[str] = None


class SaveEntryRequest(BaseModel):
    device_id: constr(min_length=4, max_length=64)
    entry_date: Optional[date] = None
    text: constr(min_length=1, max_length=2000)


class EntryOut(BaseModel):
    model_config = {"protected_namespaces": ()}

    id: str
    date: str
    text: str
    language: str
    weather_key: str
    breakdown: list
    model_source: str
    crisis_flag: bool
    created_at: Optional[str] = None
