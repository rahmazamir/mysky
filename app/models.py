"""
One row per device per calendar day. We deliberately key entries off an
anonymous `device_id` (a UUID the frontend generates once and keeps in
localStorage) instead of requiring signup -- lower friction for a wellness
journal, still lets each person see their own calendar/week/postcards.
"""
import uuid
from datetime import datetime, date

from sqlalchemy import Column, String, Date, DateTime, Text, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped

from app.database import Base


class Entry(Base):
    __tablename__ = "entries"
    __table_args__ = (UniqueConstraint("device_id", "entry_date", name="uq_device_day"),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String(64), index=True, nullable=False)
    entry_date = Column(Date, index=True, nullable=False, default=date.today)

    text = Column(Text, nullable=False)
    language = Column(String(8), default="en")  # "en" | "ur"

    weather_key = Column(String(32), nullable=False)
    breakdown_json = Column(Text, nullable=False)  # JSON-encoded list of {key, percent}
    model_source = Column(String(32), default="hf-go-emotions")  # or "fallback-lexicon"

    crisis_flag = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def as_dict(self):
        import json
        return {
            "id": self.id,
            "date": self.entry_date.isoformat(),
            "text": self.text,
            "language": self.language,
            "weather_key": self.weather_key,
            "breakdown": json.loads(self.breakdown_json),
            "model_source": self.model_source,
            "crisis_flag": self.crisis_flag,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
