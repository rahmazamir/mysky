"""
The AI core of My Sky.

Pipeline for every journal entry:

  1. Language check -- if the text is written in Urdu/Arabic script, it is
     first translated to English with a Hugging Face MarianMT model
     (Helsinki-NLP/opus-mt-ur-en) so the emotion classifier -- trained on
     English -- can read it correctly. The *original* text is what gets
     saved and displayed; translation only happens in-memory for scoring.

  2. Emotion classification -- the (translated) text is sent to
     SamLowe/roberta-base-go_emotions, a RoBERTa model fine-tuned on
     GoEmotions, which returns independent confidence scores for 28
     fine-grained emotion labels (joy, grief, nervousness, admiration...).

  3. Weighted aggregation -- each of the 28 labels is folded into My Sky's
     11-weather taxonomy using the LABEL_WEIGHTS table in emotions.py
     (some labels split across two buckets for nuance).

  4. Two derived indices layer on top of the raw model output, because
     GoEmotions has no single label for either of these states:

       * Overwhelm Index (-> "snow"): GoEmotions is a *multi-label* model,
         so on a truly overwhelming/numb entry no single label dominates --
         many fire at once, weakly. We measure that directly with Shannon
         entropy over the 9 directly-mapped buckets: high entropy + a low
         peak share means "everything and nothing, all at once," which we
         read as numbness/overwhelm. A short keyword lexicon adds a more
         reliable direct signal on top.

       * Bittersweet Index (-> "rainbow"): computed from *co-occurrence* of
         meaningfully-sized positive (sunny/clear/breezy) and negative
         (rainy/thunderstorm/foggy/cloudy) totals in the same entry --
         "mixed emotions" isn't its own feeling, it's two real feelings
         showing up together. min(positive, negative) becomes the rainbow
         score, again reinforced by a small keyword lexicon.

  5. Everything is renormalized into one 11-way percentage distribution --
     this is the "weather breakdown" the frontend renders as bars, and the
     top bucket becomes the day's primary weather.

  6. If the Hugging Face API is unreachable (no key configured, offline,
     rate-limited, cold-start timeout) we fall back to a transparent
     keyword-lexicon classifier so the product still works end-to-end for
     a live demo -- the response always reports which path was used via
     `model_source`.
"""
import hashlib
import math
import re
import time
from typing import Dict, List, Tuple

import requests

from app.config import (
    HUGGINGFACE_API_KEY, HF_API_BASE, HF_EMOTION_MODEL, HF_TRANSLATION_MODEL,
    HF_COLD_START_MAX_WAIT, HF_REQUEST_TIMEOUT,
)
from app.emotions import (
    WEATHERS, WEATHER_ORDER, LABEL_WEIGHTS,
    FATIGUE_LEXICON, OVERWHELM_LEXICON, BITTERSWEET_LEXICON, FALLBACK_LEXICON,
)

_URDU_SCRIPT_RE = re.compile(r"[\u0600-\u06FF]")

# very small in-memory cache so a debounced "live preview" on the frontend
# doesn't re-hit the Hugging Face API every keystroke for unchanged text
_cache: Dict[str, Tuple[float, dict]] = {}
_CACHE_TTL_SECONDS = 60


def _headers():
    return {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}


def detect_language(text: str) -> str:
    urdu_chars = len(_URDU_SCRIPT_RE.findall(text))
    letters = len(re.findall(r"[^\W\d_]", text, re.UNICODE)) or 1
    return "ur" if (urdu_chars / letters) > 0.3 else "en"


def _hf_post(model: str, payload: dict) -> requests.Response:
    url = f"{HF_API_BASE}/{model}"
    return requests.post(url, headers=_headers(), json=payload, timeout=HF_REQUEST_TIMEOUT)


def _call_with_cold_start_retry(model: str, payload: dict):
    """Hugging Face's free Inference API unloads idle models; the first
    call after a while returns 503 with an `estimated_time`. We wait and
    retry once or twice rather than failing the whole request."""
    waited = 0.0
    last_error = None
    for _ in range(3):
        try:
            resp = _hf_post(model, payload)
        except requests.RequestException as e:
            last_error = e
            break
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code == 503 and waited < HF_COLD_START_MAX_WAIT:
            try:
                wait_for = min(float(resp.json().get("estimated_time", 3)), 6)
            except Exception:
                wait_for = 3
            time.sleep(wait_for)
            waited += wait_for
            continue
        last_error = RuntimeError(f"HF {model} returned {resp.status_code}: {resp.text[:200]}")
        break
    if last_error:
        raise last_error
    raise RuntimeError(f"HF {model} timed out waiting for cold start")


def translate_ur_to_en(text: str) -> str:
    data = _call_with_cold_start_retry(HF_TRANSLATION_MODEL, {"inputs": text})
    # MarianMT translation responses look like [{"translation_text": "..."}]
    if isinstance(data, list) and data and "translation_text" in data[0]:
        return data[0]["translation_text"]
    return text


def _raw_emotion_scores(text: str) -> Dict[str, float]:
    """Calls the GoEmotions model and returns a flat {label: score} dict."""
    data = _call_with_cold_start_retry(
        HF_EMOTION_MODEL, {"inputs": text, "parameters": {"top_k": None}}
    )
    # Response shape is normally [[{"label": "joy", "score": 0.9}, ...]]
    # but some deployments return the flat list directly - handle both.
    if isinstance(data, list) and data and isinstance(data[0], list):
        data = data[0]
    scores = {}
    for item in data:
        label = item.get("label", "").lower()
        scores[label] = float(item.get("score", 0.0))
    return scores


def _entropy(shares: List[float]) -> float:
    total = sum(shares) or 1.0
    h = 0.0
    for s in shares:
        p = s / total
        if p > 0:
            h -= p * math.log2(p)
    max_h = math.log2(len(shares)) if len(shares) > 1 else 1
    return h / max_h if max_h else 0.0  # normalized 0..1


def _count_hits(text: str, lexicon: List[str]) -> int:
    lowered = text.lower()
    return sum(1 for phrase in lexicon if phrase in lowered)


def _labels_to_buckets(label_scores: Dict[str, float]) -> Dict[str, float]:
    """Step 3 (HF path only): fold 28 GoEmotions labels into the 11-bucket
    taxonomy via LABEL_WEIGHTS."""
    buckets = {k: 0.0 for k in WEATHER_ORDER}
    for label, score in label_scores.items():
        weights = LABEL_WEIGHTS.get(label)
        if not weights:
            continue
        for bucket, weight in weights.items():
            buckets[bucket] += score * weight
    return buckets


def _aggregate(buckets: Dict[str, float], original_text: str) -> Dict[str, float]:
    """Steps 4a-4c: layer the fatigue / overwhelm / bittersweet indices on
    top of an already-bucketed distribution. `buckets` must already be keyed
    by weather (sunny/clear/... ) -- either from `_labels_to_buckets` (HF
    path) or directly from `_fallback_scores` (offline path)."""
    buckets = dict(buckets)  # don't mutate caller's dict

    # Step 4a: fatigue lexicon -> boosts "cloudy" (no GoEmotions label for it)
    fatigue_hits = _count_hits(original_text, FATIGUE_LEXICON)
    if fatigue_hits:
        buckets["cloudy"] += min(0.15 * fatigue_hits, 0.5)

    # Step 4b: Overwhelm Index -> "snow"
    direct_nine = [buckets[k] for k in WEATHER_ORDER if k not in ("rainbow", "snow")]
    peak_share = max(direct_nine) / (sum(direct_nine) or 1.0)
    overwhelm_entropy = _entropy(direct_nine)
    overwhelm_score = overwhelm_entropy * (1 - peak_share)
    buckets["snow"] += overwhelm_score * 0.6
    overwhelm_hits = _count_hits(original_text, OVERWHELM_LEXICON)
    if overwhelm_hits:
        buckets["snow"] += min(0.2 * overwhelm_hits, 0.6)

    # Step 4c: Bittersweet Index -> "rainbow"
    positive_total = buckets["sunny"] + buckets["clear"] + buckets["breezy"]
    negative_total = buckets["rainy"] + buckets["thunderstorm"] + buckets["foggy"] + buckets["cloudy"]
    co_occurrence = min(positive_total, negative_total)
    if positive_total > 0.12 and negative_total > 0.12:
        buckets["rainbow"] += min(co_occurrence * 1.8, 0.7)
    bittersweet_hits = _count_hits(original_text, BITTERSWEET_LEXICON)
    if bittersweet_hits:
        buckets["rainbow"] += min(0.2 * bittersweet_hits, 0.6)

    return buckets


def _normalize_to_percent(buckets: Dict[str, float]) -> List[dict]:
    total = sum(buckets.values()) or 1.0
    breakdown = []
    for key in WEATHER_ORDER:
        percent = round((buckets[key] / total) * 100, 1)
        breakdown.append({"key": key, "percent": percent})
    breakdown.sort(key=lambda x: x["percent"], reverse=True)

    # fix rounding drift so the bars sum to exactly 100.0
    drift = round(100.0 - sum(b["percent"] for b in breakdown), 1)
    if breakdown:
        breakdown[0]["percent"] = round(breakdown[0]["percent"] + drift, 1)
    return breakdown


def _fallback_scores(text: str) -> Dict[str, float]:
    """Used only when Hugging Face can't be reached at all."""
    lowered = text.lower()
    scores = {k: 0.0 for k in WEATHER_ORDER}
    for bucket, words in FALLBACK_LEXICON.items():
        for w in words:
            if w in lowered:
                scores[bucket] += 1.0
    if not any(scores.values()):
        scores["partly_cloudy"] = 1.0
    return scores


def _cache_key(text: str) -> str:
    return hashlib.sha256(text.strip().lower().encode("utf-8")).hexdigest()


def analyze_text(text: str) -> dict:
    key = _cache_key(text)
    now = time.time()
    cached = _cache.get(key)
    if cached and (now - cached[0]) < _CACHE_TTL_SECONDS:
        return cached[1]

    language = detect_language(text)
    text_for_model = text
    model_source = "hf-go-emotions"

    if not HUGGINGFACE_API_KEY:
        buckets = _aggregate(_fallback_scores(text), text)
        model_source = "fallback-lexicon"
    else:
        try:
            if language == "ur":
                text_for_model = translate_ur_to_en(text)
            label_scores = _raw_emotion_scores(text_for_model)
            buckets = _aggregate(_labels_to_buckets(label_scores), text)
        except Exception:
            buckets = _aggregate(_fallback_scores(text), text)
            model_source = "fallback-lexicon"

    breakdown = _normalize_to_percent(buckets)
    top_key = breakdown[0]["key"]

    result = {
        "weather_key": top_key,
        "breakdown": breakdown,
        "detected_language": language,
        "model_source": model_source,
    }
    _cache[key] = (now, result)
    return result
