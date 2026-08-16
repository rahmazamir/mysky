"""
A small, transparent keyword/phrase check for acute distress language.

This is NOT a diagnostic tool and never claims to be one. It exists purely
to decide whether to show a gentle, non-judgmental note pointing to real
human help (findahelpline.com and 988). It never blocks the journal entry,
never labels the user, and never changes how their entry is scored
emotionally -- it only adds a supportive banner on top.

The phrase list is intentionally short and pattern-level rather than an
exhaustive enumeration; the goal is a reasonable safety net for a hackathon
demo, not a clinical-grade classifier.
"""
import re

_PHRASES = [
    "kill myself", "killing myself", "want to die", "wish i was dead",
    "wish i were dead", "don't want to be alive", "dont want to be alive",
    "end my life", "ending my life", "suicide", "suicidal",
    "self harm", "self-harm", "hurt myself", "hurting myself",
    "no reason to live", "better off without me", "can't go on",
    "cant go on", "not worth living",
]

_PATTERNS = [re.compile(r"\b" + re.escape(p) + r"\b") for p in _PHRASES]


def detect_crisis(text: str) -> bool:
    lowered = text.lower()
    return any(p.search(lowered) for p in _PATTERNS)


CRISIS_MESSAGE_EN = (
    "It sounds like you might be carrying something really heavy right now. "
    "You don't have to hold it alone -- free, confidential support is "
    "available anytime at findahelpline.com, or by calling or texting 988."
)

CRISIS_MESSAGE_UR = (
    "لگتا ہے آپ اس وقت کچھ بہت بھاری محسوس کر رہے ہیں۔ "
    "آپ کو اکیلے یہ سب برداشت کرنے کی ضرورت نہیں -- مفت اور خفیہ مدد کسی بھی وقت "
    "findahelpline.com پر یا 988 کال یا ٹیکسٹ کر کے دستیاب ہے۔"
)
