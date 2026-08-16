import json
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import get_db
from app.models import Entry
from app.schemas import SaveEntryRequest
from app.routers.analyze import build_response

router = APIRouter(prefix="/api/entries", tags=["entries"])


@router.post("")
def save_entry(body: SaveEntryRequest, db: Session = Depends(get_db)):
    entry_date = body.entry_date or date.today()
    analysis = build_response(body.text)

    existing = (
        db.query(Entry)
        .filter(Entry.device_id == body.device_id, Entry.entry_date == entry_date)
        .first()
    )

    if existing:
        existing.text = body.text
        existing.language = analysis["detected_language"]
        existing.weather_key = analysis["weather_key"]
        existing.breakdown_json = json.dumps(analysis["breakdown"])
        existing.model_source = analysis["model_source"]
        existing.crisis_flag = analysis["crisis_flag"]
        entry = existing
    else:
        entry = Entry(
            device_id=body.device_id,
            entry_date=entry_date,
            text=body.text,
            language=analysis["detected_language"],
            weather_key=analysis["weather_key"],
            breakdown_json=json.dumps(analysis["breakdown"]),
            model_source=analysis["model_source"],
            crisis_flag=analysis["crisis_flag"],
        )
        db.add(entry)

    db.commit()
    db.refresh(entry)

    return {"entry": entry.as_dict(), "analysis": analysis}


@router.get("")
def list_entries(
    device_id: str,
    start: Optional[date] = Query(None),
    end: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Entry).filter(Entry.device_id == device_id)
    if start:
        q = q.filter(Entry.entry_date >= start)
    if end:
        q = q.filter(Entry.entry_date <= end)
    entries = q.order_by(Entry.entry_date.asc()).all()
    return {"entries": [e.as_dict() for e in entries]}


@router.get("/today")
def get_today(device_id: str, db: Session = Depends(get_db)):
    entry = (
        db.query(Entry)
        .filter(Entry.device_id == device_id, Entry.entry_date == date.today())
        .first()
    )
    return {"entry": entry.as_dict() if entry else None}


@router.get("/week")
def get_week(device_id: str, db: Session = Depends(get_db)):
    today = date.today()
    start = today - timedelta(days=today.weekday())  # Monday
    end = start + timedelta(days=6)
    entries = (
        db.query(Entry)
        .filter(Entry.device_id == device_id, Entry.entry_date >= start, Entry.entry_date <= end)
        .order_by(Entry.entry_date.asc())
        .all()
    )
    by_date = {e.entry_date.isoformat(): e.as_dict() for e in entries}
    days = []
    for i in range(7):
        d = (start + timedelta(days=i)).isoformat()
        days.append(by_date.get(d, {"date": d, "empty": True}))
    return {"start": start.isoformat(), "end": end.isoformat(), "days": days}


@router.get("/month")
def get_month(device_id: str, year: int, month: int, db: Session = Depends(get_db)):
    start = date(year, month, 1)
    end = date(year + 1, 1, 1) - timedelta(days=1) if month == 12 else date(year, month + 1, 1) - timedelta(days=1)
    entries = (
        db.query(Entry)
        .filter(Entry.device_id == device_id, Entry.entry_date >= start, Entry.entry_date <= end)
        .all()
    )
    return {"entries": [e.as_dict() for e in entries]}
