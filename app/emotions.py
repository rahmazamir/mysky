"""
The 11-weather taxonomy at the heart of My Sky.

Every entry the model reads gets mapped into exactly this set. Colors here
are mirrored in the frontend's `src/data/emotions.js` (frontend owns the
richer animation config; backend only needs colors for the breakdown bars
and calendar star dots, and bilingual labels for API responses).
"""

WEATHERS = {
    "sunny": {
        "label_en": "Sunny",
        "label_ur": "دھوپ",
        "feeling_en": "Joy, excitement",
        "feeling_ur": "خوشی، جوش",
        "color": "#FFB84D",
        "gradient": ["#FFE29A", "#FFB84D", "#FF9166"],
    },
    "clear": {
        "label_en": "Clear Skies",
        "label_ur": "صاف آسمان",
        "feeling_en": "Calm, content",
        "feeling_ur": "سکون، اطمینان",
        "color": "#6EC3FF",
        "gradient": ["#DFF3FF", "#A8D8FF", "#6EC3FF"],
    },
    "partly_cloudy": {
        "label_en": "Partly Cloudy",
        "label_ur": "جزوی ابر آلود",
        "feeling_en": "Neutral, an ordinary mixed day",
        "feeling_ur": "عام سا، معمولی دن",
        "color": "#A9BFE0",
        "gradient": ["#EAF1FB", "#C7D8F2", "#A9BFE0"],
    },
    "breezy": {
        "label_en": "Breezy",
        "label_ur": "ہلکی ہوا",
        "feeling_en": "Chill, carefree, unbothered",
        "feeling_ur": "بے فکر، پرسکون",
        "color": "#5FD9C0",
        "gradient": ["#E4FFF7", "#B8F2E6", "#5FD9C0"],
    },
    "cloudy": {
        "label_en": "Cloudy",
        "label_ur": "ابر آلود",
        "feeling_en": "Tired, low energy",
        "feeling_ur": "تھکاوٹ، کم توانائی",
        "color": "#9AA5D1",
        "gradient": ["#EDEFFA", "#C7CEEA", "#9AA5D1"],
    },
    "foggy": {
        "label_en": "Foggy",
        "label_ur": "دھند آلود",
        "feeling_en": "Anxious, unsure",
        "feeling_ur": "بےچینی، غیر یقینی",
        "color": "#C3AEEA",
        "gradient": ["#F3ECFC", "#D6C7F0", "#C3AEEA"],
    },
    "rainy": {
        "label_en": "Rainy",
        "label_ur": "بارش",
        "feeling_en": "Sad, heavy-hearted",
        "feeling_ur": "اداس، بھاری دل",
        "color": "#4E8FD1",
        "gradient": ["#CBE2F7", "#8FB8E8", "#4E8FD1"],
    },
    "thunderstorm": {
        "label_en": "Thunderstorm",
        "label_ur": "طوفانِ باد و باراں",
        "feeling_en": "Angry, frustrated",
        "feeling_ur": "غصہ، جھنجھلاہٹ",
        "color": "#7C6FCB",
        "gradient": ["#C9BEEE", "#9B8FD1", "#6C63A6"],
    },
    "snow": {
        "label_en": "Snow Flurries",
        "label_ur": "برفباری",
        "feeling_en": "Overwhelmed, numb",
        "feeling_ur": "مغلوب، بے حس",
        "color": "#8FD0E8",
        "gradient": ["#EAF7FC", "#C9ECF6", "#8FD0E8"],
    },
    "rainbow": {
        "label_en": "Rainbow",
        "label_ur": "قوسِ قزح",
        "feeling_en": "Mixed emotions, good and hard at once",
        "feeling_ur": "ملے جلے جذبات",
        "color": "#F3A6D0",
        "gradient": ["#FFE1EE", "#E1F0FF", "#FFF3C4"],
    },
    "aurora": {
        "label_en": "Aurora Skies",
        "label_ur": "قطبی روشنیاں",
        "feeling_en": "Surprised, in awe",
        "feeling_ur": "حیرت زدہ، مسحور",
        "color": "#B98FD6",
        "gradient": ["#4B3F72", "#7C6FA8", "#7FD8C8"],
    },
}

WEATHER_ORDER = [
    "sunny", "clear", "partly_cloudy", "breezy", "cloudy",
    "foggy", "rainy", "thunderstorm", "snow", "rainbow", "aurora",
]

# ---------------------------------------------------------------------------
# GoEmotions (28-label) -> My Sky bucket weights.
# A label can split across buckets (e.g. "confusion" is partly foggy, partly
# the diffuse numbness of "snow") -- this is what lets 28 fine-grained labels
# fold down into our 11 without losing nuance. Weights per label sum to ~1.0.
# "rainbow" and, mostly, "snow" are intentionally left thin here -- they are
# *derived* signals computed in emotion_engine.py (see the module docstring
# there for the bittersweet-index / overwhelm-index logic).
# ---------------------------------------------------------------------------
LABEL_WEIGHTS = {
    "admiration":     {"clear": 1.0},
    "amusement":      {"sunny": 1.0},
    "anger":          {"thunderstorm": 1.0},
    "annoyance":      {"thunderstorm": 0.8, "cloudy": 0.2},
    "approval":       {"clear": 1.0},
    "caring":         {"clear": 1.0},
    "confusion":      {"foggy": 0.65, "snow": 0.35},
    "curiosity":      {"partly_cloudy": 0.6, "aurora": 0.4},
    "desire":         {"breezy": 0.6, "sunny": 0.4},
    "disappointment": {"rainy": 0.6, "cloudy": 0.4},
    "disapproval":    {"thunderstorm": 0.7, "foggy": 0.3},
    "disgust":        {"thunderstorm": 1.0},
    "embarrassment":  {"foggy": 1.0},
    "excitement":     {"sunny": 1.0},
    "fear":           {"foggy": 1.0},
    "gratitude":      {"clear": 1.0},
    "grief":          {"rainy": 1.0},
    "joy":            {"sunny": 1.0},
    "love":           {"clear": 1.0},
    "nervousness":    {"foggy": 0.8, "snow": 0.2},
    "optimism":       {"breezy": 0.7, "sunny": 0.3},
    "pride":          {"sunny": 0.8, "clear": 0.2},
    "realization":    {"partly_cloudy": 0.5, "aurora": 0.5},
    "relief":         {"breezy": 1.0},
    "remorse":        {"rainy": 0.7, "cloudy": 0.3},
    "sadness":        {"rainy": 1.0},
    "surprise":       {"aurora": 1.0},
    "neutral":        {"partly_cloudy": 1.0},
}

# Lightweight lexicons used two ways:
#  1) as the fallback classifier when the Hugging Face API is unreachable
#     (no key set, offline demo, rate-limited, etc.)
#  2) as small explainable boosts layered on top of the model for the two
#     "derived" states the 28-label model doesn't capture directly:
#     tiredness/energy (there's no GoEmotions label for fatigue) and
#     numbness/overwhelm (see emotion_engine.py).
FATIGUE_LEXICON = [
    "tired", "exhausted", "drained", "sleepy", "worn out", "wornout",
    "burnt out", "burnout", "burned out", "no energy", "low energy",
    "so tired", "can't keep my eyes open", "running on empty", "sluggish",
]

OVERWHELM_LEXICON = [
    "overwhelmed", "overwhelming", "too much", "can't keep up", "numb",
    "don't feel anything", "shut down", "shutting down", "everything at once",
    "can't think straight", "empty inside", "checked out", "can't process",
]

BITTERSWEET_LEXICON = [
    "bittersweet", "mixed feelings", "good and bad", "happy and sad",
    "torn", "conflicted", "both", "at the same time",
]

FALLBACK_LEXICON = {
    "sunny": ["happy", "excited", "thrilled", "amazing", "great day", "yay", "awesome", "love this", "so good", "proud"],
    "clear": ["calm", "content", "peaceful", "grateful", "thankful", "at ease", "relaxed", "fine", "okay day"],
    "partly_cloudy": ["normal", "average", "meh", "so-so", "nothing special", "usual"],
    "breezy": ["chill", "carefree", "easy day", "relieved", "relief", "unbothered", "light"],
    "cloudy": ["tired", "exhausted", "drained", "low energy", "sluggish", "worn out"],
    "foggy": ["anxious", "nervous", "unsure", "confused", "worried", "on edge", "uneasy"],
    "rainy": ["sad", "down", "heartbroken", "crying", "lonely", "hurt", "grief", "miss"],
    "thunderstorm": ["angry", "furious", "frustrated", "mad", "pissed", "annoyed", "irritated"],
    "snow": ["overwhelmed", "numb", "too much", "can't feel", "empty", "shut down"],
    "rainbow": ["bittersweet", "mixed feelings", "good and bad", "torn", "conflicted"],
    "aurora": ["surprised", "shocked", "amazed", "in awe", "wow", "unexpected", "can't believe"],
}
