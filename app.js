/* ==========================================================================
   app.js — My Sky
   1. Weather dictionary (11 skies: copy, icon, temp, tips, star colors)
   2. Emotion engine: offline lexicon pass (always available) plus an
      optional real AI pass using a Hugging Face model running client-side
      via transformers.js. No server, no API key, degrades cleanly if the
      model can't load. Repeated words get diminishing returns, and the AI
      pass only speaks when it's actually confident, so the sky stays
      stable instead of flip-flopping on flat or repeated text.
   3. State + persistence
   4. Rendering (sky, bars, tip, crisis note, week strip, month of stars)
   5. Wiring (inputs, settings, TTS, breathing, share, i18n)
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* 1. WEATHER CONDITIONS (11)                                             */
/* ---------------------------------------------------------------------- */
const WEATHER = {
  sunny: { icon: "\u2600\uFE0F", temp: [82, 99], starColors: ["#FFD93D", "#FF9F1C"],
    name: { en: "Sunny", ur: "دھوپ دار" },
    sub: { en: "Bright skies, good energy", ur: "روشن آسمان، اچھی توانائی" },
    tips: [
      { en: { title: "Bank this feeling", body: "Write one line about what made today good. Future you will enjoy rereading it on a harder day." }, ur: { title: "اس احساس کو محفوظ کریں", body: "ایک سطر لکھیں کہ آج کیا اچھا رہا۔ مشکل دن میں یہ پڑھنا اچھا لگے گا۔" } },
      { en: { title: "Share the light", body: "Good moods are contagious. Tell one person something you appreciate about them today." }, ur: { title: "روشنی بانٹیں", body: "اچھا موڈ پھیلتا ہے۔ آج کسی کو بتائیں کہ آپ ان کی کیا قدر کرتے ہیں۔" } },
    ] },
  clear: { icon: "\uD83C\uDF24\uFE0F", temp: [68, 81], starColors: ["#5FA8E0", "#2E6DA4"],
    name: { en: "Clear Skies", ur: "صاف آسمان" },
    sub: { en: "Calm skies, steady heart", ur: "پرسکون آسمان، مستحکم دل" },
    tips: [
      { en: { title: "Keep the streak", body: "Nothing needs fixing today. Maybe just take five quiet minutes outside to enjoy it." }, ur: { title: "سلسلہ برقرار رکھیں", body: "آج ٹھیک کرنے کو کچھ نہیں۔ باہر پانچ منٹ خاموشی سے گزاریں۔" } },
      { en: { title: "Save some calm", body: "Write down what's keeping you steady right now so you can find it again later." }, ur: { title: "سکون کو یاد رکھیں", body: "لکھیں کہ ابھی آپ کو کیا مستحکم رکھے ہوئے ہے، بعد میں یاد آئے گا۔" } },
    ] },
  partly: { icon: "\u26C5", temp: [56, 67], starColors: ["#F2A6A0", "#C97B93"],
    name: { en: "Partly Cloudy", ur: "کچھ ابر آلود" },
    sub: { en: "A mix of sun and cloud", ur: "دھوپ اور بادل کا ملاپ" },
    tips: [
      { en: { title: "An ordinary day counts", body: "Not every day needs to be remarkable. Ordinary is its own kind of okay." }, ur: { title: "عام دن بھی اہم ہے", body: "ہر دن غیر معمولی ہونا ضروری نہیں۔ عام دن بھی ٹھیک ہوتا ہے۔" } },
      { en: { title: "Pick one small win", body: "Mixed days go easier with one small, doable thing checked off." }, ur: { title: "ایک چھوٹی کامیابی چنیں", body: "ملے جلے دن ایک چھوٹا کام مکمل کرنے سے آسان گزرتے ہیں۔" } },
    ] },
  breezy: { icon: "\uD83C\uDF2C\uFE0F", temp: [60, 72], starColors: ["#6FCDA0", "#3FA378"],
    name: { en: "Breezy", ur: "ہلکی ہوا" },
    sub: { en: "Light air, easy heart", ur: "ہلکی ہوا، ہلکا دل" },
    tips: [
      { en: { title: "Stay loose", body: "Carefree days are worth noticing too. Let yourself enjoy not having a big feeling to sort through." }, ur: { title: "پرسکون رہیں", body: "بے فکر دن بھی قابلِ توجہ ہیں۔ کسی بڑے احساس کو سلجھانے کی ضرورت نہیں، بس لطف اٹھائیں۔" } },
      { en: { title: "Ride the wind", body: "You don't owe today a deep reflection. A light day can just be light." }, ur: { title: "ہوا کے ساتھ بہیں", body: "آج گہری سوچ کی ضرورت نہیں۔ ہلکا دن بس ہلکا ہی رہ سکتا ہے۔" } },
    ] },
  cloudy: { icon: "\u2601\uFE0F", temp: [46, 55], starColors: ["#B79CE0", "#7B5AA6"],
    name: { en: "Cloudy", ur: "ابر آلود" },
    sub: { en: "Heavy air, low battery", ur: "بھاری فضا، کم توانائی" },
    tips: [
      { en: { title: "Lower the bar", body: "Low-energy days don't need big fixes. Pick the smallest task and let the rest wait." }, ur: { title: "توقعات کم رکھیں", body: "کم توانائی والے دن بڑے حل نہیں مانگتے۔ صرف ایک چھوٹا کام چنیں۔" } },
      { en: { title: "Rest counts as progress", body: "Tired isn't lazy. A short rest, a nap, or an early night is doing something too." }, ur: { title: "آرام بھی ترقی ہے", body: "تھکاوٹ سستی نہیں۔ تھوڑا آرام یا جلدی سونا بھی اہم ہے۔" } },
    ] },
  fog: { icon: "\uD83C\uDF2B\uFE0F", temp: [42, 52], starColors: ["#A9C7B0", "#6E9179"],
    name: { en: "Foggy", ur: "دھند آلود" },
    sub: { en: "Hard to see clearly today", ur: "آج واضح دیکھنا مشکل ہے" },
    tips: [
      { en: { title: "Name one thing", body: "Fog lifts when you name what's actually worrying you. Try finishing: the thing I'm anxious about is ___." }, ur: { title: "ایک بات کی نشاندہی کریں", body: "جب آپ لکھیں کہ کیا پریشان کر رہا ہے تو دھند چھٹتی ہے۔" } },
      { en: { title: "Slow your breath", body: "A few slow breaths can turn the noise down enough to think clearly. Try the breathing break below." }, ur: { title: "سانس آہستہ کریں", body: "چند آہستہ سانسیں شور کم کر سکتی ہیں۔ نیچے سانس کی مشق آزمائیں۔" } },
    ] },
  rain: { icon: "\uD83C\uDF27\uFE0F", temp: [33, 43], starColors: ["#6FAEE0", "#3A6FA6"],
    name: { en: "Rainy", ur: "بارش" },
    sub: { en: "A heavier kind of day", ur: "آج دل بھاری ہے" },
    tips: [
      { en: { title: "Let it rain a bit", body: "Sad days don't need to be fixed immediately. Text one person who's easy to be around, even just to say hi." }, ur: { title: "تھوڑا وقت دیں", body: "اداس دنوں کو فوراً ٹھیک کرنا ضروری نہیں۔ کسی اپنے سے بات کریں۔" } },
      { en: { title: "Small comfort helps", body: "A warm drink, a soft blanket, a favorite show. Small comforts genuinely help on heavy days." }, ur: { title: "چھوٹی سکون بھری چیزیں", body: "گرم مشروب، نرم کمبل، پسندیدہ شو۔ چھوٹی چیزیں بھاری دن میں مدد دیتی ہیں۔" } },
    ] },
  storm: { icon: "\u26C8\uFE0F", temp: [30, 40], starColors: ["#9B5FD9", "#5A2E8C"],
    name: { en: "Thunderstorm", ur: "طوفان" },
    sub: { en: "Big feelings moving through", ur: "بڑے جذبات کا گزر" },
    tips: [
      { en: { title: "Let the charge discharge", body: "Anger is energy looking for an exit. A brisk five-minute walk, or writing the angry version you'll never send, both help." }, ur: { title: "شدت کو نکلنے دیں", body: "غصہ توانائی ہے جسے راستہ چاہیے۔ تیز پانچ منٹ کی چہل قدمی کریں۔" } },
      { en: { title: "Pause before you respond", body: "Strong feelings pass faster than they feel like they will. Try the breathing break before you say or send anything." }, ur: { title: "جواب دینے سے پہلے رکیں", body: "شدید جذبات جتنا محسوس ہوتا ہے اس سے جلدی گزر جاتے ہیں۔ کچھ کہنے سے پہلے سانس کی مشق کریں۔" } },
    ] },
  snow: { icon: "\u2744\uFE0F", temp: [20, 32], starColors: ["#BFD9F5", "#8FB8E0"],
    name: { en: "Snow Flurries", ur: "برف کے جھونکے" },
    sub: { en: "A lot at once, quiet underneath", ur: "ایک ساتھ بہت کچھ، اندر خاموشی" },
    tips: [
      { en: { title: "One flake at a time", body: "When everything feels like too much, pick just the next single small step. Not the whole list." }, ur: { title: "ایک وقت میں ایک قدم", body: "جب سب کچھ بہت زیادہ لگے تو صرف اگلا چھوٹا قدم چنیں، پوری فہرست نہیں۔" } },
      { en: { title: "It's okay to feel far away", body: "Feeling numb is often your mind's way of taking a break from too much at once. Be patient with yourself." }, ur: { title: "دور محسوس کرنا بھی ٹھیک ہے", body: "بے حسی اکثر ذہن کا بہت زیادہ بوجھ سے وقفہ لینے کا طریقہ ہے۔ اپنے ساتھ صبر کریں۔" } },
    ] },
  rainbow: { icon: "\uD83C\uDF08", temp: [52, 72], starColors: ["#FFB6C9", "#F28FB0"],
    name: { en: "Rainbow", ur: "قوسِ قزح" },
    sub: { en: "Sun and rain, both at once", ur: "دھوپ اور بارش، ایک ساتھ" },
    tips: [
      { en: { title: "Hold both", body: "Mixed days are the most honest kind. Write one sentence for the hard part and one for the good part. Both are true." }, ur: { title: "دونوں کو تسلیم کریں", body: "ملے جلے دن سب سے حقیقی ہوتے ہیں۔ اچھے اور مشکل دونوں پہلوؤں کے بارے میں لکھیں۔" } },
      { en: { title: "No feeling cancels another", body: "You can be grateful and tired at once, or happy and worried. That's not a contradiction, that's just a normal day." }, ur: { title: "ایک احساس دوسرے کو ختم نہیں کرتا", body: "آپ ایک ساتھ شکرگزار اور تھکے ہوئے ہو سکتے ہیں۔ یہ متضاد نہیں، بس ایک عام دن ہے۔" } },
    ] },
  aurora: { icon: "\uD83C\uDF0C", temp: [58, 74], starColors: ["#4FD9B8", "#2FAE93"],
    name: { en: "Aurora Skies", ur: "قطبی روشنی" },
    sub: { en: "Something you didn't expect", ur: "کچھ ایسا جو توقع میں نہ تھا" },
    tips: [
      { en: { title: "Let it sink in", body: "Surprising moments deserve a pause. Write down what caught you off guard before the feeling fades." }, ur: { title: "اسے محسوس ہونے دیں", body: "حیران کن لمحات توقف کے لائق ہیں۔ جو چیز آپ کو حیران کر گئی وہ لکھ لیں۔" } },
      { en: { title: "Awe is worth savoring", body: "Wonder is a rare weather. Take a moment before you move on to the next thing." }, ur: { title: "حیرت قیمتی ہے", body: "حیرت ایک نایاب کیفیت ہے۔ اگلے کام کی طرف بڑھنے سے پہلے ایک لمحہ ٹھہریں۔" } },
    ] },
};

const CAT_LIST = ["joy", "calm", "carefree", "tired", "anxious", "sad", "angry", "overwhelmed", "surprise"];
const CAT_COLOR = { joy: "#F5A623", calm: "#4C9AFF", carefree: "#2BB673", tired: "#9AA0B4", anxious: "#8B5CF6", sad: "#4A6FD4", angry: "#E5484D", overwhelmed: "#6B7280", surprise: "#14B8A6" };
const POS_CATS = ["joy", "calm", "carefree"];
const NEG_CATS = ["tired", "anxious", "sad", "angry", "overwhelmed"];
const ALL_CATS = [...POS_CATS, ...NEG_CATS, "surprise"];

/* ---------------------------------------------------------------------- */
/* 2. EMOTION ENGINE                                                      */
/* ---------------------------------------------------------------------- */
function tokenize(text) {
  return text.toLowerCase().replace(/[\u2019]/g, "'").replace(/[^a-z'\s]/g, " ").match(/[a-z']+/g) || [];
}

function stemLookup(tok) {
  if (LEXICON[tok]) return tok;
  const tries = [];
  if (tok.endsWith("'s")) tries.push(tok.slice(0, -2));
  if (tok.endsWith("ing")) { tries.push(tok.slice(0, -3)); tries.push(tok.slice(0, -3) + "e"); }
  if (tok.endsWith("edly")) tries.push(tok.slice(0, -4));
  if (tok.endsWith("ed")) { tries.push(tok.slice(0, -2)); tries.push(tok.slice(0, -1)); }
  if (tok.endsWith("es")) tries.push(tok.slice(0, -2));
  if (tok.endsWith("s") && tok.length > 3) tries.push(tok.slice(0, -1));
  for (const cand of tries) { if (LEXICON[cand]) return cand; }
  return null;
}

function findPhrases(rawLower) {
  const hits = [];
  for (const phrase in PHRASES) { if (rawLower.includes(phrase)) hits.push({ phrase, ...PHRASES[phrase] }); }
  return hits;
}

function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return Math.abs(h); }
function pickTip(cond, seedText) { const list = WEATHER[cond].tips; return list[hashStr(seedText || cond) % list.length]; }
function emptyCatTotals() { const o = {}; ALL_CATS.forEach(c => o[c] = 0); return o; }

function analyzeLexicon(text) {
  const rawLower = text.toLowerCase().replace(/[\u2019]/g, "'");
  const tokens = tokenize(text);
  const catTotals = emptyCatTotals();
  const triggers = [];
  let weightSum = 0;
  const seenCount = {};

  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i];
    const key = LEXICON[raw] ? raw : stemLookup(raw);
    if (!key) continue;
    const entry = LEXICON[key];
    let score = entry.score;

    const prev1 = tokens[i - 1];
    if (prev1 && INTENSIFIERS[prev1]) score *= INTENSIFIERS[prev1];

    let negated = false;
    for (let k = 1; k <= NEGATION_WINDOW; k++) {
      const p = tokens[i - k];
      if (!p) break;
      if (NEGATIONS.has(p)) { negated = true; break; }
    }
    if (negated) score *= -0.8;

    // Diminishing returns for the same word appearing again and again, so
    // pasting one sentence four times in a row doesn't swing the sky any
    // harder (or any less predictably) than saying it once.
    seenCount[key] = (seenCount[key] || 0) + 1;
    const repeatFactor = seenCount[key] <= 2 ? 1 : 1 / (seenCount[key] - 1);
    score *= repeatFactor;

    catTotals[entry.cat] += score;
    weightSum += Math.abs(score);
    triggers.push({ word: raw, score, cat: entry.cat, negated });
  }

  findPhrases(rawLower).forEach(hit => {
    catTotals[hit.cat] += hit.score;
    weightSum += Math.abs(hit.score);
    triggers.push({ word: hit.phrase, score: hit.score, cat: hit.cat, negated: false });
  });

  const bangs = (text.match(/!/g) || []).length;
  if (bangs) weightSum += Math.min(bangs, 3) * 0.3;

  return { rawLower, tokens, triggers, catTotals, weightSum };
}

function deriveCondition(catTotals, weightSum) {
  const posSum = POS_CATS.reduce((s, c) => s + catTotals[c], 0);
  const negSum = -NEG_CATS.reduce((s, c) => s + catTotals[c], 0);
  const netValence = weightSum > 0 ? (posSum - negSum) / Math.max(weightSum, 4) : 0;

  let domNeg = null, domNegVal = 0;
  NEG_CATS.forEach(c => { const v = -catTotals[c]; if (v > domNegVal) { domNegVal = v; domNeg = c; } });
  let domPos = null, domPosVal = 0;
  POS_CATS.forEach(c => { if (catTotals[c] > domPosVal) { domPosVal = catTotals[c]; domPos = c; } });
  let domAll = null, domAllVal = 0;
  ALL_CATS.forEach(c => { const v = Math.abs(catTotals[c]); if (v > domAllVal) { domAllVal = v; domAll = c; } });

  const mixRatio = (posSum > 0 && negSum > 0) ? Math.min(posSum, negSum) / Math.max(posSum, negSum) : 0;

  let cond;
  if (weightSum === 0) {
    cond = "partly";
  } else if (domAll === "surprise" && catTotals.surprise >= 1.6) {
    cond = "aurora";
  } else if (posSum > 1 && negSum > 1 && mixRatio > 0.55) {
    cond = "rainbow";
  } else if (netValence > 0.15) {
    if (domPos === "carefree" && catTotals.carefree >= catTotals.joy && catTotals.carefree >= catTotals.calm) cond = "breezy";
    else if (domPos === "calm" && catTotals.calm >= catTotals.joy) cond = "clear";
    else cond = netValence > 0.55 ? "sunny" : "clear";
  } else if (netValence > -0.12) {
    cond = "partly";
  } else {
    if (domNeg === "angry") cond = "storm";
    else if (domNeg === "anxious") cond = domNegVal >= 3 ? "storm" : "fog";
    else if (domNeg === "overwhelmed") cond = "snow";
    else if (domNeg === "sad") cond = netValence <= -0.5 ? "rain" : "cloudy";
    else cond = "cloudy";
  }
  return { cond, posSum, negSum, netValence, domPos, domNeg, domAll };
}

function analyze(text) {
  const base = analyzeLexicon(text);
  const derived = deriveCondition(base.catTotals, base.weightSum);
  const crisisHit = CRISIS_SIGNALS.some(sig => base.rawLower.includes(sig));
  return { ...base, ...derived, crisisHit, aiApplied: false };
}

/* ---- optional real AI pass, client-side, no server, no API key -------- */
const AI_MODEL_PRIMARY = "Xenova/emotion-english-distilroberta-base";
const AI_MODEL_FALLBACK = "Xenova/distilbert-base-uncased-finetuned-sst-2-english";
const AI_CDN = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3";

let aiPipeline = null, aiPipelineKind = null, aiLoadPromise = null;

async function loadAI() {
  if (aiLoadPromise) return aiLoadPromise;
  aiLoadPromise = (async () => {
    try {
      const { pipeline } = await import(/* webpackIgnore: true */ AI_CDN);
      try {
        aiPipeline = await pipeline("text-classification", AI_MODEL_PRIMARY, { dtype: "q8" });
        aiPipelineKind = "emotion";
      } catch (e1) {
        aiPipeline = await pipeline("sentiment-analysis", AI_MODEL_FALLBACK, { dtype: "q8" });
        aiPipelineKind = "sentiment";
      }
    } catch (e) {
      console.warn("My Sky: AI model unavailable, using the built-in offline engine.", e);
      aiPipeline = null; aiPipelineKind = null;
    }
    return aiPipeline;
  })();
  return aiLoadPromise;
}

async function analyzeAI(text) {
  if (!aiPipeline || !text || !text.trim()) return null;
  try {
    if (aiPipelineKind === "emotion") {
      const out = await aiPipeline(text, { top_k: null });
      const arr = Array.isArray(out[0]) ? out[0] : out;
      const scores = {};
      arr.forEach(o => { scores[String(o.label).toLowerCase()] = o.score; });
      return { kind: "emotion", scores };
    }
    if (aiPipelineKind === "sentiment") {
      const out = await aiPipeline(text);
      const top = Array.isArray(out) ? out[0] : out;
      return { kind: "sentiment", label: top.label, score: top.score };
    }
  } catch (e) { return null; }
  return null;
}

async function analyzeWithAI(text, base) {
  const ai = await analyzeAI(text);
  if (!ai) return null;
  const merged = { ...base, catTotals: { ...base.catTotals } };

  if (ai.kind === "emotion") {
    const s = ai.scores;
    const neutral = s.neutral || 0;
    // If the model itself reads the text as mostly neutral (a flat or
    // repeated sentence, small talk, etc), let it speak quietly instead of
    // dragging a clear lexicon signal around. This is what stops "I feel
    // tired" from landing on a different sky depending on how many times
    // it's repeated: a low-confidence AI pass now barely moves the needle.
    const confidence = Math.max(0, 1 - neutral);
    const W = 4 * confidence;
    if (W < 0.25) {
      const derived = deriveCondition(base.catTotals, base.weightSum);
      return { ...base, ...derived, crisisHit: base.crisisHit, aiApplied: false };
    }
    if (s.joy) merged.catTotals.joy += s.joy * W;
    if (s.sadness) merged.catTotals.sad += s.sadness * W;
    if (s.anger) merged.catTotals.angry += s.anger * W;
    if (s.disgust) merged.catTotals.angry += s.disgust * W * 0.7;
    if (s.fear) merged.catTotals.anxious += s.fear * W;
    if (s.surprise) merged.catTotals.surprise += s.surprise * W;
    merged.weightSum = base.weightSum + W;
  } else if (ai.kind === "sentiment") {
    const confidence = ai.score; // sst2 has no neutral class, its own score is the confidence
    const W = 3 * confidence;
    if (W < 0.25) {
      const derived = deriveCondition(base.catTotals, base.weightSum);
      return { ...base, ...derived, crisisHit: base.crisisHit, aiApplied: false };
    }
    if (ai.label === "POSITIVE") merged.catTotals.joy += ai.score * W;
    else {
      merged.catTotals.sad += ai.score * W * 0.5;
      merged.catTotals.anxious += ai.score * W * 0.3;
      merged.catTotals.angry += ai.score * W * 0.2;
    }
    merged.weightSum = base.weightSum + W;
  }

  const derived = deriveCondition(merged.catTotals, merged.weightSum);
  const crisisHit = base.crisisHit;
  return { ...merged, ...derived, crisisHit, aiApplied: true };
}

/* ---------------------------------------------------------------------- */
/* 3. STATE + PERSISTENCE                                                 */
/* ---------------------------------------------------------------------- */
const LS_ENTRIES = "mysky_entries_v1";
const LS_SETTINGS = "mysky_settings_v1";
const LS_ONBOARD = "mysky_onboarded_v1";

const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

function loadEntries() { try { return JSON.parse(localStorage.getItem(LS_ENTRIES)) || {}; } catch { return {}; } }
function saveEntries(obj) { localStorage.setItem(LS_ENTRIES, JSON.stringify(obj)); }

const DEFAULT_SETTINGS = { theme: "light", lang: "en" };
function loadSettings() {
  try { return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(localStorage.getItem(LS_SETTINGS)) || {}); }
  catch { return Object.assign({}, DEFAULT_SETTINGS); }
}
function saveSettings(s) { localStorage.setItem(LS_SETTINGS, JSON.stringify(s)); }

let entries = loadEntries();
let settings = loadSettings();
let liveResult = null;

/* ---------------------------------------------------------------------- */
/* 4. RENDERING                                                           */
/* ---------------------------------------------------------------------- */
const $ = sel => document.querySelector(sel);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
const SVG_NS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs) => { const e = document.createElementNS(SVG_NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

function t(key) { return (STRINGS[settings.lang] && STRINGS[settings.lang][key]) || STRINGS.en[key] || key; }
function catLabel(c) { return t("cat_" + c); }

function applyI18n() {
  document.documentElement.lang = settings.lang;
  document.documentElement.dir = settings.lang === "ur" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(node => { node.textContent = t(node.getAttribute("data-i18n")); });
  document.querySelectorAll("[data-i18n-ph]").forEach(node => { node.placeholder = t(node.getAttribute("data-i18n-ph")); });
}

function condCopy(condId, field, tipObj) {
  const c = WEATHER[condId];
  const lang = settings.lang;
  if (field === "name") return c.name[lang] || c.name.en;
  if (field === "sub") return c.sub[lang] || c.sub.en;
  if (field === "tipTitle") return (tipObj[lang] || tipObj.en).title;
  if (field === "tipBody") return (tipObj[lang] || tipObj.en).body;
}

function buildRain(container) {
  // Built once and left alone. Rebuilding this on every keystroke (as the
  // old version did) reset every drop back to the top of the stage before
  // it could fall, which is why rain used to look stuck near the top.
  if (container.children.length) return;
  const count = 46;
  for (let i = 0; i < count; i++) {
    const d = el("div", "drop");
    d.style.left = Math.random() * 100 + "%";
    const dur = 0.9 + Math.random() * 0.6;
    d.style.animationDuration = dur + "s";
    // negative delay starts each drop mid-fall right away, so drops are
    // scattered across the whole window immediately instead of arriving
    // from the top all at once
    d.style.animationDelay = "-" + (Math.random() * dur).toFixed(2) + "s";
    d.style.opacity = 0.55 + Math.random() * 0.45;
    container.appendChild(d);
  }
}

function buildSnow(container) {
  if (container.children.length) return;
  for (let i = 0; i < 26; i++) {
    const f = el("div", "flake");
    const size = 4 + Math.random() * 5;
    f.style.left = Math.random() * 100 + "%";
    f.style.width = size + "px"; f.style.height = size + "px";
    f.style.animationDuration = (4 + Math.random() * 3) + "s";
    f.style.animationDelay = "-" + (Math.random() * 6).toFixed(2) + "s";
    f.style.opacity = 0.6 + Math.random() * 0.4;
    container.appendChild(f);
  }
}

function buildWind(container) {
  if (container.children.length) return;
  for (let i = 0; i < 6; i++) {
    const w = el("div", "wind-line");
    w.style.top = (15 + Math.random() * 60) + "%";
    w.style.width = (60 + Math.random() * 90) + "px";
    w.style.animationDuration = (2.2 + Math.random() * 1.8) + "s";
    w.style.animationDelay = (Math.random() * 2) + "s";
    container.appendChild(w);
  }
}

function buildStars(container) {
  if (container.children.length) return;
  for (let i = 0; i < 30; i++) {
    const s = el("div", "star");
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 55 + "%";
    s.style.animationDelay = (Math.random() * 3) + "s";
    container.appendChild(s);
  }
}

function renderSky(result) {
  const stage = $("#sky-stage");
  const cond = result ? result.cond : "partly";
  stage.dataset.cond = cond;
  $("#cond-name").textContent = condCopy(cond, "name");
  $("#cond-sub").textContent = result ? condCopy(cond, "sub") : t("cond_sub_default");
  const [lo, hi] = WEATHER[cond].temp;
  const tempVal = result ? Math.round(lo + (hi - lo) * Math.min(1, Math.max(0, (result.netValence + 1) / 2))) : "--";
  $("#temp-num").textContent = tempVal + "\u00B0";
  buildStars($("#stars"));
  buildWind($("#wind-layer"));
  buildSnow($("#snow-layer"));
  buildRain($("#rain-layer"));
}

function renderEmotionBars(result) {
  const wrap = $("#emo-bars");
  wrap.innerHTML = "";
  const totals = result ? CAT_LIST.map(c => Math.abs(result.catTotals[c])) : CAT_LIST.map(() => 0);
  const max = Math.max(1, ...totals);
  CAT_LIST.forEach((c, i) => {
    const pct = Math.round((totals[i] / max) * 100);
    const row = el("div", "emo-row");
    row.appendChild(el("div", "emo-label", catLabel(c)));
    const track = el("div", "emo-track");
    const fill = el("div", "emo-fill");
    fill.style.width = pct + "%";
    fill.style.background = CAT_COLOR[c];
    track.appendChild(fill);
    row.appendChild(track);
    row.appendChild(el("div", "emo-pct", pct + "%"));
    wrap.appendChild(row);
  });
}

function renderTip(result) {
  if (!result || result.weightSum === 0) {
    $("#tip-title").textContent = t("tip_default_title");
    $("#tip-body").textContent = t("tip_default_body");
    $("#breathe-btn").classList.add("hidden");
    return;
  }
  const tip = result.tip || pickTip(result.cond, $("#entry").value);
  result.tip = tip;
  $("#tip-title").textContent = condCopy(result.cond, "tipTitle", tip);
  $("#tip-body").textContent = condCopy(result.cond, "tipBody", tip);
  const showBreathe = ["storm", "fog", "rain", "cloudy", "snow"].includes(result.cond);
  $("#breathe-btn").classList.toggle("hidden", !showBreathe);
}

function renderCrisis(result) {
  const note = $("#crisis-note");
  if (result && result.crisisHit) {
    note.classList.add("show");
    note.innerHTML = t("crisis_note") + ' <a href="https://findahelpline.com" target="_blank" rel="noopener">findahelpline.com</a>. ' + t("crisis_note_alt");
  } else {
    note.classList.remove("show");
    note.innerHTML = "";
  }
}

function computeStreak() {
  let streak = 0;
  let d = new Date();
  if (!entries[todayKey(d)]) d.setDate(d.getDate() - 1);
  while (entries[todayKey(d)]) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
function renderStreak() { $("#streak-label").innerHTML = `\u{1F525} <b>${computeStreak()}</b> ${t("day_streak")}`; }

function renderForecastStrip() {
  const strip = $("#forecast-strip");
  strip.innerHTML = "";
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = todayKey(d);
    const rec = entries[key];
    const card = el("div", "fc-day" + (rec ? "" : " empty"));
    if (rec) card.dataset.cond = rec.cond;
    card.appendChild(el("div", "fc-date", d.toLocaleDateString(settings.lang === "ur" ? "ur-PK" : "en-US", { weekday: "short" })));
    card.appendChild(el("div", "fc-icon", rec ? WEATHER[rec.cond].icon : "\u00B7"));
    card.appendChild(el("div", "fc-cond", rec ? condCopy(rec.cond, "name") : "-"));
    if (rec) {
      const [c1, c2] = WEATHER[rec.cond].starColors;
      card.style.background = `linear-gradient(135deg, ${c1}22, ${c2}33)`;
    }
    strip.appendChild(card);
  }
}

// A five-point star with independently rounded outer and inner corners.
function roundedStarPath(cx, cy, points, outerR, innerR, rotationDeg, cornerOuter, cornerInner) {
  const step = Math.PI / points;
  const rot = (rotationDeg - 90) * Math.PI / 180;
  const verts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = rot + i * step;
    verts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  const n = verts.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = verts[(i - 1 + n) % n];
    const curr = verts[i];
    const next = verts[(i + 1) % n];
    const radius = i % 2 === 0 ? cornerOuter : cornerInner;
    const v1x = curr[0] - prev[0], v1y = curr[1] - prev[1];
    const v2x = next[0] - curr[0], v2y = next[1] - curr[1];
    const len1 = Math.hypot(v1x, v1y), len2 = Math.hypot(v2x, v2y);
    const r1 = Math.min(radius, len1 / 2), r2 = Math.min(radius, len2 / 2);
    const p1x = curr[0] - v1x / len1 * r1, p1y = curr[1] - v1y / len1 * r1;
    const p2x = curr[0] + v2x / len2 * r2, p2y = curr[1] + v2y / len2 * r2;
    d += (i === 0 ? `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} ` : `L ${p1x.toFixed(2)} ${p1y.toFixed(2)} `);
    d += `Q ${curr[0].toFixed(2)} ${curr[1].toFixed(2)} ${p2x.toFixed(2)} ${p2y.toFixed(2)} `;
  }
  return d + "Z";
}

function renderHeatmap() {
  const grid = $("#heatmap");
  grid.innerHTML = "";
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const locale = settings.lang === "ur" ? "ur-PK" : "en-US";
  $("#hm-month").textContent = now.toLocaleDateString(locale, { month: "long", year: "numeric" });

  const dowFmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const headerBase = new Date(2026, 0, 4); // a Sunday, only used to read weekday names in order
  for (let i = 0; i < 7; i++) {
    const d = new Date(headerBase); d.setDate(headerBase.getDate() + i);
    grid.appendChild(el("div", "hm-dow", dowFmt.format(d)));
  }
  for (let i = 0; i < startOffset; i++) grid.appendChild(el("div", "hm-cell empty"));

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const key = todayKey(d);
    const rec = entries[key];
    const cell = el("div", "hm-cell");
    cell.title = key + (rec ? " - " + condCopy(rec.cond, "name") : "");

    const svg = svgEl("svg", { viewBox: "0 0 64 64", class: "hm-star" });
    const rotation = hashStr(key + (rec ? rec.cond : "")) % 360;
    if (rec) {
      const gradId = "starg-" + key;
      const [g1, g2] = WEATHER[rec.cond].starColors;
      const defs = svgEl("defs", {});
      const grad = svgEl("linearGradient", { id: gradId, x1: "0%", y1: "0%", x2: "100%", y2: "100%" });
      grad.appendChild(svgEl("stop", { offset: "0%", "stop-color": g1 }));
      grad.appendChild(svgEl("stop", { offset: "100%", "stop-color": g2 }));
      defs.appendChild(grad);
      svg.appendChild(defs);
      const path = svgEl("path", { d: roundedStarPath(32, 32, 5, 27, 12, rotation, 5, 4), fill: `url(#${gradId})` });
      svg.appendChild(path);
    } else {
      const path = svgEl("path", { d: roundedStarPath(32, 32, 5, 27, 12, rotation, 5, 4), fill: "none", stroke: "var(--ink-faint)", "stroke-width": "2.5", "stroke-linejoin": "round", opacity: "0.4" });
      svg.appendChild(path);
    }
    cell.appendChild(svg);
    cell.appendChild(el("div", "hm-num", String(day)));
    grid.appendChild(cell);
  }
}

function renderAll(result) {
  renderSky(result);
  renderEmotionBars(result);
  renderTip(result);
  renderCrisis(result);
}

/* ---------------------------------------------------------------------- */
/* 5. WIRING                                                              */
/* ---------------------------------------------------------------------- */
function debounce(fn, ms) { let h; return (...a) => { clearTimeout(h); h = setTimeout(() => fn(...a), ms); }; }

let lastAIText = null;
function handleEntryInput() {
  const text = $("#entry").value;
  const base = analyze(text);
  liveResult = base;
  renderAll(liveResult);

  if (text.trim().length < 6 || text === lastAIText) return;
  lastAIText = text;
  analyzeWithAI(text, base).then(ai => {
    if (ai && $("#entry").value === text) { liveResult = ai; renderAll(liveResult); }
  });
}

function saveToday() {
  const text = $("#entry").value.trim();
  if (!text) return;
  const result = liveResult && liveResult.weightSum !== undefined ? liveResult : analyze(text);
  entries[todayKey()] = { text, cond: result.cond, valence: result.netValence, ts: Date.now() };
  saveEntries(entries);
  renderStreak();
  renderForecastStrip();
  renderHeatmap();
  const btn = $("#save-btn");
  const original = btn.textContent;
  btn.textContent = t("saved_label") + " \u2713";
  setTimeout(() => { btn.textContent = original; }, 1400);
}

function wireMoodChips() {
  document.querySelectorAll(".mood-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const ta = $("#entry");
      const phrase = chip.dataset.phraseKey ? t(chip.dataset.phraseKey) : `I feel ${chip.dataset.word}.`;
      ta.value = (ta.value.trim() ? ta.value.trim() + " " : "") + phrase;
      handleEntryInput();
      ta.focus();
    });
  });
}

function applySettingsToDOM() {
  document.documentElement.setAttribute("data-theme", settings.theme);
  $("#theme-seg [data-val='" + settings.theme + "']").setAttribute("aria-pressed", "true");
  $("#theme-seg [data-val='" + (settings.theme === "dark" ? "light" : "dark") + "']").setAttribute("aria-pressed", "false");
  $("#lang-seg [data-val='" + settings.lang + "']").setAttribute("aria-pressed", "true");
  $("#lang-seg [data-val='" + (settings.lang === "ur" ? "en" : "ur") + "']").setAttribute("aria-pressed", "false");
}

function wireSettingsSheet() {
  const sheet = $("#sheet"), backdrop = $("#sheet-backdrop");
  $("#settings-btn").addEventListener("click", () => { sheet.classList.add("open"); backdrop.classList.add("open"); });
  backdrop.addEventListener("click", () => { sheet.classList.remove("open"); backdrop.classList.remove("open"); });

  function seg(id, key, apply) {
    const group = $(id);
    group.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        group.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        settings[key] = btn.dataset.val;
        saveSettings(settings);
        apply();
      });
    });
  }
  seg("#theme-seg", "theme", () => document.documentElement.setAttribute("data-theme", settings.theme));
  seg("#lang-seg", "lang", () => { applyI18n(); renderAll(liveResult); renderForecastStrip(); renderHeatmap(); renderStreak(); });
}

function wireDataControls() {
  $("#export-btn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ entries, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `my-sky-${todayKey()}.json`;
    a.click();
  });
  $("#import-btn").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.entries) {
          entries = Object.assign({}, entries, data.entries);
          saveEntries(entries);
          renderForecastStrip(); renderHeatmap(); renderStreak();
          alert(t("import_success"));
        }
      } catch { alert(t("import_fail")); }
    };
    reader.readAsText(file);
  });
  $("#clear-btn").addEventListener("click", () => {
    if (confirm(t("clear_confirm"))) {
      entries = {};
      saveEntries(entries);
      renderForecastStrip(); renderHeatmap(); renderStreak();
    }
  });
}

function pickVoice(lang) {
  const voices = speechSynthesis.getVoices();
  const wantLang = lang === "ur" ? "ur" : "en";
  const langVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(wantLang));
  const pool = langVoices.length ? langVoices : voices;
  const softNames = ["female", "samantha", "victoria", "moira", "serena", "fiona", "susan", "zira", "jenny", "aria", "libby", "emma", "ava", "joanna", "salli", "kendra", "kimberly", "ivy", "google uk english female", "google us english"];
  return pool.find(v => softNames.some(n => v.name.toLowerCase().includes(n))) || pool[0];
}

function wireTTS() {
  $("#tts-btn").addEventListener("click", () => {
    if (!("speechSynthesis" in window)) { alert(t("tts_unavailable")); return; }
    const cond = liveResult ? liveResult.cond : "partly";
    const tip = liveResult ? (liveResult.tip || pickTip(cond, $("#entry").value)) : null;
    const lines = [
      condCopy(cond, "name") + ".",
      liveResult ? condCopy(cond, "sub") : t("cond_sub_default"),
      tip ? condCopy(cond, "tipBody", tip) : "",
    ].filter(Boolean).join(". ");
    const utter = new SpeechSynthesisUtterance(lines);
    utter.lang = settings.lang === "ur" ? "ur-PK" : "en-US";
    utter.rate = 0.92; utter.pitch = 1.1;
    const speakNow = () => { const v = pickVoice(settings.lang); if (v) utter.voice = v; speechSynthesis.cancel(); speechSynthesis.speak(utter); };
    if (speechSynthesis.getVoices().length) speakNow();
    else speechSynthesis.onvoiceschanged = speakNow;
  });
}

/* ---- breathing modal ---- */
let breatheCountdown = null, breathePhaseLoop = null, breatheSecondsLeft = 30, breathePaused = false;
function formatMMSS(sec) { const m = String(Math.floor(sec / 60)).padStart(2, "0"); const s = String(sec % 60).padStart(2, "0"); return m + ":" + s; }

function runBreathePhaseLoop(phase) {
  $("#breathe-phase").textContent = phase === "in" ? t("breathe_in") : t("breathe_out");
  clearTimeout(breathePhaseLoop);
  breathePhaseLoop = setTimeout(() => { if (!breathePaused) runBreathePhaseLoop(phase === "in" ? "out" : "in"); }, 4000);
}
function openBreathe() {
  $("#breathe-backdrop").classList.add("open");
  $("#breathe-modal").classList.add("open");
  $("#breathe-stage").classList.remove("paused");
  breatheSecondsLeft = 30; breathePaused = false;
  $("#breathe-timer").textContent = formatMMSS(breatheSecondsLeft);
  $("#breathe-pause-btn").textContent = t("breathe_pause");
  runBreathePhaseLoop("in");
  clearInterval(breatheCountdown);
  breatheCountdown = setInterval(() => {
    if (breathePaused) return;
    breatheSecondsLeft--;
    $("#breathe-timer").textContent = formatMMSS(Math.max(0, breatheSecondsLeft));
    if (breatheSecondsLeft <= 0) closeBreathe();
  }, 1000);
}
function closeBreathe() {
  clearInterval(breatheCountdown);
  clearTimeout(breathePhaseLoop);
  $("#breathe-backdrop").classList.remove("open");
  $("#breathe-modal").classList.remove("open");
}
function wireBreathing() {
  $("#breathe-btn").addEventListener("click", openBreathe);
  $("#breathe-close").addEventListener("click", closeBreathe);
  $("#breathe-backdrop").addEventListener("click", closeBreathe);
  $("#breathe-pause-btn").addEventListener("click", () => {
    breathePaused = !breathePaused;
    $("#breathe-stage").classList.toggle("paused", breathePaused);
    $("#breathe-pause-btn").textContent = breathePaused ? t("breathe_resume") : t("breathe_pause");
    if (!breathePaused) runBreathePhaseLoop($("#breathe-phase").textContent === t("breathe_in") ? "in" : "out");
  });
}

/* ---- shareable Instagram Story card + native share sheet ---- */
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "", lines = [];
  words.forEach(w => {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w + " "; }
    else line = test;
  });
  lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l.trim(), x, y + i * lineHeight));
}

const SHARE_GRADIENTS = {
  sunny: ["#FFE9B0", "#FF8C42"], clear: ["#BFE3FF", "#2E6DA4"], partly: ["#FFD9C2", "#C97B93"],
  breezy: ["#DFF7E8", "#4FBFA0"], cloudy: ["#E3D6F5", "#7B5AA6"], fog: ["#DCEAE0", "#6E9179"],
  rain: ["#BEE0FF", "#3A6FA6"], storm: ["#D9B3F0", "#4A2570"], snow: ["#EAF2FF", "#8FB8E0"],
  rainbow: ["#CDEBFF", "#6FA8E6"], aurora: ["#2E2A6B", "#1A3B5C"],
};

function drawShareCard(result) {
  const canvas = $("#share-canvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height; // 1080 x 1920, Instagram Story
  const [c1, c2] = SHARE_GRADIENTS[result.cond] || SHARE_GRADIENTS.partly;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const dark = result.cond === "storm" || result.cond === "aurora";

  return new Promise(resolve => {
    const draw = () => {
      ctx.save();
      roundRectPath(ctx, 50, 50, W - 100, H - 100, 56);
      ctx.lineWidth = 6; ctx.strokeStyle = dark ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.85)"; ctx.stroke();
      ctx.restore();

      ctx.textAlign = "center";
      ctx.font = "300px sans-serif";
      ctx.fillText(WEATHER[result.cond].icon, W / 2, H * 0.42);

      ctx.font = "48px 'Berkshire Swash', cursive";
      ctx.fillStyle = dark ? "rgba(255,255,255,.92)" : "rgba(46,42,34,.85)";
      ctx.fillText("My Sky", W / 2, 190);

      ctx.font = "700 92px 'Fredoka', sans-serif";
      ctx.fillStyle = dark ? "#FFFFFF" : "#2E2A22";
      ctx.fillText(condCopy(result.cond, "name"), W / 2, H * 0.58);

      ctx.font = "500 34px 'Quicksand', sans-serif";
      ctx.fillStyle = dark ? "rgba(255,255,255,.85)" : "rgba(46,42,34,.72)";
      wrapText(ctx, condCopy(result.cond, "sub"), W / 2, H * 0.63, 780, 46);

      const streak = computeStreak();
      ctx.save();
      roundRectPath(ctx, W - 320, 110, 220, 64, 32);
      ctx.fillStyle = dark ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.6)";
      ctx.fill();
      ctx.font = "600 28px 'Fredoka', sans-serif";
      ctx.fillStyle = dark ? "#fff" : "#2E2A22";
      ctx.fillText(`Day ${streak}`, W - 210, 152);
      ctx.restore();

      ctx.font = "600 30px 'Fredoka', sans-serif";
      ctx.fillStyle = dark ? "rgba(255,255,255,.7)" : "rgba(46,42,34,.55)";
      ctx.fillText(new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }), W / 2, H - 140);

      ctx.font = "26px 'Fredoka', sans-serif";
      ctx.fillStyle = dark ? "rgba(255,255,255,.55)" : "rgba(46,42,34,.45)";
      ctx.fillText("myskywindow.vercel.app", W / 2, H - 90);

      canvas.toBlob(blob => {
        const dataUrl = canvas.toDataURL("image/png");
        const caption = `Today's sky: ${condCopy(result.cond, "name")}. Tracking my mood with My Sky.`;
        resolve({ blob, dataUrl, caption });
      });
    };

    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load("48px 'Berkshire Swash'"),
        document.fonts.load("700 92px 'Fredoka'"),
        document.fonts.load("600 30px 'Fredoka'"),
        document.fonts.load("500 34px 'Quicksand'"),
      ]).then(draw).catch(draw);
    } else { draw(); }
  });
}

let shareBlobCache = null;

function openShareModal(result) {
  drawShareCard(result).then(({ blob, dataUrl, caption }) => {
    shareBlobCache = blob;
    $("#share-preview-img").src = dataUrl;
    $("#share-caption-text").value = caption;
    $("#share-backdrop").classList.add("open");
    $("#share-modal").classList.add("open");

    let canShareFiles = false;
    try {
      canShareFiles = !!(navigator.canShare && navigator.canShare({ files: [new File([blob], "my-sky.png", { type: "image/png" })] }));
    } catch (e) { canShareFiles = false; }
    $("#share-native-btn").classList.toggle("hidden", !canShareFiles);

    $("#share-native-btn").onclick = async () => {
      try {
        const file = new File([shareBlobCache], "my-sky.png", { type: "image/png" });
        await navigator.share({ files: [file], title: "My Sky", text: caption });
      } catch (e) { /* user closed the share sheet, nothing to do */ }
    };
    $("#share-download-btn").onclick = () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(shareBlobCache);
      a.download = `my-sky-story-${todayKey()}.png`;
      a.click();
    };
    $("#share-copy-btn").onclick = () => {
      $("#share-caption-text").select();
      if (navigator.clipboard) navigator.clipboard.writeText(caption).catch(() => {});
      const btn = $("#share-copy-btn");
      const original = btn.textContent;
      btn.textContent = t("share_copied");
      setTimeout(() => { btn.textContent = original; }, 1400);
    };
  });
}

function closeShareModal() {
  $("#share-backdrop").classList.remove("open");
  $("#share-modal").classList.remove("open");
}

function wireShare() {
  $("#share-btn").addEventListener("click", () => {
    const result = liveResult && liveResult.weightSum > 0 ? liveResult : { cond: "partly", netValence: 0 };
    openShareModal(result);
  });
  $("#share-close").addEventListener("click", closeShareModal);
  $("#share-backdrop").addEventListener("click", closeShareModal);
}

function wireOnboarding() {
  const modal = $("#onboard");
  if (localStorage.getItem(LS_ONBOARD)) { modal.remove(); return; }
  $("#onboard-close").addEventListener("click", () => {
    localStorage.setItem(LS_ONBOARD, "1");
    modal.remove();
  });
}

function init() {
  applyI18n();
  applySettingsToDOM();
  wireOnboarding();
  wireMoodChips();
  wireSettingsSheet();
  wireDataControls();
  wireTTS();
  wireBreathing();
  wireShare();

  $("#entry").addEventListener("input", debounce(handleEntryInput, 260));
  $("#save-btn").addEventListener("click", saveToday);

  const todayRec = entries[todayKey()];
  if (todayRec) { $("#entry").value = todayRec.text; handleEntryInput(); }
  else { renderAll(null); }

  renderStreak();
  renderForecastStrip();
  renderHeatmap();

  loadAI().then(p => { if (p) $("#ai-badge").classList.remove("hidden"); });
}

document.addEventListener("DOMContentLoaded", init);