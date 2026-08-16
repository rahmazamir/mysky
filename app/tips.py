"""
One interactive wellness tip per weather. `type` tells the frontend which
interactive widget to render (see frontend/src/components/WellnessTip.jsx):

  breathing   -> animated pulsing breathing circle, `pattern` = seconds per
                 [inhale, hold, exhale, hold]
  timer       -> a simple countdown for a physical micro-break
  checklist   -> a tap-through list (e.g. 5-4-3-2-1 grounding)
  jar         -> a "save this to your sunshine jar" one-line capture
  brain_dump  -> list out thoughts, then sort/dismiss them one by one
  dual_prompt -> two side-by-side short prompts
  reflection  -> a single open reflection prompt with a small reward animation
"""

TIPS = {
    "sunny": {
        "title_en": "Savor it",
        "title_ur": "اسے محسوس کریں",
        "body_en": "Good moments fade fast in memory unless we mark them. Drop today's high point in your Sunshine Jar.",
        "body_ur": "اچھے لمحے یاد میں جلد دھندلا جاتے ہیں جب تک ہم انہیں محفوظ نہ کریں۔ آج کی سب سے اچھی بات اپنے سنشائن جار میں ڈالیں۔",
        "type": "jar",
    },
    "clear": {
        "title_en": "Stay grounded",
        "title_ur": "زمین سے جڑے رہیں",
        "body_en": "Contentment is worth noticing on purpose. Try the 5-4-3-2-1 grounding check-in.",
        "body_ur": "اطمینان کو جان بوجھ کر محسوس کرنا فائدہ مند ہے۔ 5-4-3-2-1 گراؤنڈنگ آزمائیں۔",
        "type": "checklist",
        "steps_en": ["5 things you can see", "4 things you can touch", "3 things you can hear", "2 things you can smell", "1 thing you can taste"],
        "steps_ur": ["5 چیزیں جو آپ دیکھ سکتے ہیں", "4 چیزیں جو آپ چھو سکتے ہیں", "3 چیزیں جو آپ سن سکتے ہیں", "2 چیزیں جو آپ سونگھ سکتے ہیں", "1 چیز جو آپ چکھ سکتے ہیں"],
    },
    "partly_cloudy": {
        "title_en": "Notice one thing",
        "title_ur": "ایک بات نوٹ کریں",
        "body_en": "Ordinary days don't need to be extraordinary. What's one small thing worth naming about today?",
        "body_ur": "عام دنوں کا غیر معمولی ہونا ضروری نہیں۔ آج کے بارے میں ایک چھوٹی سی بات بتائیں۔",
        "type": "reflection",
        "prompt_en": "One small thing about today...",
        "prompt_ur": "آج کے بارے میں ایک چھوٹی بات...",
    },
    "breezy": {
        "title_en": "Ride the breeze",
        "title_ur": "ہوا کے ساتھ بہیں",
        "body_en": "Carefree energy loves to move. Take a 60-second stretch break while it lasts.",
        "body_ur": "بے فکر توانائی حرکت پسند کرتی ہے۔ 60 سیکنڈ کا اسٹریچ بریک لیں۔",
        "type": "timer",
        "seconds": 60,
    },
    "cloudy": {
        "title_en": "Permission to rest",
        "title_ur": "آرام کی اجازت",
        "body_en": "Low energy isn't a failure, it's information. Try 2 minutes of slow breathing, no agenda.",
        "body_ur": "کم توانائی ناکامی نہیں، ایک اشارہ ہے۔ 2 منٹ آہستہ سانس لیں، بغیر کسی مقصد کے۔",
        "type": "breathing",
        "pattern": [4, 2, 6, 0],
        "cycles": 6,
    },
    "foggy": {
        "title_en": "Clear the fog",
        "title_ur": "دھند کو صاف کریں",
        "body_en": "Anxious minds calm down through the body first. Follow the circle: box breathing, 4 seconds each side.",
        "body_ur": "بےچین ذہن پہلے جسم کے ذریعے پرسکون ہوتا ہے۔ دائرے کی پیروی کریں: باکس بریتھنگ، ہر طرف 4 سیکنڈ۔",
        "type": "breathing",
        "pattern": [4, 4, 4, 4],
        "cycles": 5,
    },
    "rainy": {
        "title_en": "Let it fall",
        "title_ur": "بہنے دیں",
        "body_en": "Sadness deserves space, not suppression. A longer exhale helps the body settle -- breathe in for 4, out for 7.",
        "body_ur": "اداسی کو جگہ چاہیے، دبانا نہیں۔ لمبی سانس چھوڑنا جسم کو پرسکون کرتا ہے -- 4 میں سانس لیں، 7 میں چھوڑیں۔",
        "type": "breathing",
        "pattern": [4, 2, 7, 0],
        "cycles": 5,
    },
    "thunderstorm": {
        "title_en": "Release the charge",
        "title_ur": "دباؤ نکالیں",
        "body_en": "Anger is energy looking for an exit. Shake it out, literally -- 30 seconds, whole body.",
        "body_ur": "غصہ ایک توانائی ہے جو نکلنا چاہتی ہے۔ 30 سیکنڈ تک پورے جسم کو ہلائیں۔",
        "type": "timer",
        "seconds": 30,
    },
    "snow": {
        "title_en": "One flake at a time",
        "title_ur": "ایک وقت میں ایک بات",
        "body_en": "When everything feels like too much, naming it in pieces helps. List what's on your mind, then let each one melt away.",
        "body_ur": "جب سب کچھ بہت زیادہ لگے تو اسے ٹکڑوں میں بانٹنا مدد کرتا ہے۔ جو ذہن میں ہے لکھیں، پھر ہر بات کو پگھلنے دیں۔",
        "type": "brain_dump",
    },
    "rainbow": {
        "title_en": "Hold both",
        "title_ur": "دونوں کو تھامیں",
        "body_en": "Two true things can exist at once. Name one hard thing and one good thing from today, side by side.",
        "body_ur": "دو سچی باتیں ایک ساتھ ہو سکتی ہیں۔ آج کی ایک مشکل اور ایک اچھی بات ساتھ ساتھ لکھیں۔",
        "type": "dual_prompt",
        "prompt_a_en": "One hard thing...",
        "prompt_b_en": "One good thing...",
        "prompt_a_ur": "ایک مشکل بات...",
        "prompt_b_ur": "ایک اچھی بات...",
    },
    "aurora": {
        "title_en": "Capture the wonder",
        "title_ur": "حیرت کو محفوظ کریں",
        "body_en": "Awe is rare -- worth writing down before it fades. What surprised you today?",
        "body_ur": "حیرت نایاب ہوتی ہے -- دھندلانے سے پہلے لکھ لیں۔ آج آپ کو کس بات نے حیران کیا؟",
        "type": "reflection",
        "prompt_en": "What surprised you...",
        "prompt_ur": "آپ کو کس بات نے حیران کیا...",
    },
}


def get_tip(weather_key: str) -> dict:
    return TIPS.get(weather_key, TIPS["partly_cloudy"])
