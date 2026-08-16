/* ==========================================================================
   lexicon.js
   The offline half of the emotion engine. This is the reliable fallback
   that always works, even if the AI model (loaded in app.js) can't reach
   the network or hasn't finished downloading yet. Nine feeling categories,
   each maps to one of the eleven skies:

     joy         -> Sunny            calm        -> Clear Skies
     carefree    -> Breezy           tired       -> Cloudy
     anxious     -> Foggy            sad         -> Rainy
     angry       -> Thunderstorm     overwhelmed -> Snow Flurries
     surprise    -> Aurora Skies
     (no strong signal -> Partly Cloudy, strong signals on both
      sides at once -> Rainbow)
   ========================================================================== */

const LEXICON = {
  // ---- joy (also covers warmth / love, there's no separate sky for that) --
  happy: { score: 2, cat: "joy" }, happiness: { score: 2, cat: "joy" },
  joy: { score: 3, cat: "joy" }, joyful: { score: 3, cat: "joy" },
  glad: { score: 2, cat: "joy" }, cheerful: { score: 2, cat: "joy" },
  cheer: { score: 2, cat: "joy" }, delighted: { score: 3, cat: "joy" },
  delightful: { score: 2, cat: "joy" }, excited: { score: 2, cat: "joy" },
  thrilled: { score: 3, cat: "joy" }, great: { score: 2, cat: "joy" },
  good: { score: 1, cat: "joy" }, amazing: { score: 3, cat: "joy" },
  wonderful: { score: 3, cat: "joy" }, fantastic: { score: 3, cat: "joy" },
  awesome: { score: 3, cat: "joy" }, grateful: { score: 2, cat: "joy" },
  gratitude: { score: 2, cat: "joy" }, thankful: { score: 2, cat: "joy" },
  blessed: { score: 2, cat: "joy" }, proud: { score: 2, cat: "joy" },
  accomplished: { score: 2, cat: "joy" }, hopeful: { score: 2, cat: "joy" },
  hope: { score: 1, cat: "joy" }, laughed: { score: 2, cat: "joy" },
  laughing: { score: 2, cat: "joy" }, laughter: { score: 2, cat: "joy" },
  smiled: { score: 2, cat: "joy" }, smiling: { score: 2, cat: "joy" },
  fun: { score: 2, cat: "joy" }, playful: { score: 1, cat: "joy" },
  celebrated: { score: 2, cat: "joy" }, celebration: { score: 2, cat: "joy" },
  win: { score: 2, cat: "joy" }, won: { score: 2, cat: "joy" },
  success: { score: 2, cat: "joy" }, successful: { score: 2, cat: "joy" },
  motivated: { score: 2, cat: "joy" }, inspired: { score: 2, cat: "joy" },
  energized: { score: 2, cat: "joy" }, elated: { score: 3, cat: "joy" },
  ecstatic: { score: 3, cat: "joy" }, love: { score: 3, cat: "joy" },
  loved: { score: 3, cat: "joy" }, loving: { score: 2, cat: "joy" },
  adore: { score: 3, cat: "joy" }, adored: { score: 3, cat: "joy" },
  cherished: { score: 2, cat: "joy" }, affection: { score: 2, cat: "joy" },
  warmth: { score: 2, cat: "joy" }, hugged: { score: 2, cat: "joy" },
  triumphant: { score: 3, cat: "joy" }, victorious: { score: 3, cat: "joy" },
  radiant: { score: 2, cat: "joy" }, giddy: { score: 2, cat: "joy" },

  // ---- calm --------------------------------------------------------------
  calm: { score: 2, cat: "calm" }, calmer: { score: 2, cat: "calm" },
  peaceful: { score: 2, cat: "calm" }, peace: { score: 2, cat: "calm" },
  relaxed: { score: 2, cat: "calm" }, relaxing: { score: 2, cat: "calm" },
  content: { score: 2, cat: "calm" }, contented: { score: 2, cat: "calm" },
  rested: { score: 2, cat: "calm" }, restful: { score: 2, cat: "calm" },
  steady: { score: 1, cat: "calm" }, balanced: { score: 1, cat: "calm" },
  quiet: { score: 1, cat: "calm" }, serene: { score: 2, cat: "calm" },
  grounded: { score: 2, cat: "calm" }, centered: { score: 2, cat: "calm" },
  settled: { score: 2, cat: "calm" }, recharged: { score: 2, cat: "calm" },
  refreshed: { score: 2, cat: "calm" }, tranquil: { score: 2, cat: "calm" },
  easygoing: { score: 1, cat: "calm" }, ok: { score: 0.5, cat: "calm" },
  okay: { score: 0.5, cat: "calm" }, fine: { score: 0.5, cat: "calm" },
  normal: { score: 0.2, cat: "calm" }, mellow: { score: 1, cat: "calm" },
  soothing: { score: 2, cat: "calm" }, meditated: { score: 1, cat: "calm" },
  breathe: { score: 1, cat: "calm" }, breathing: { score: 1, cat: "calm" },

  // ---- carefree ------------------------------------------------------------
  chill: { score: 1.5, cat: "carefree" }, chilling: { score: 1.5, cat: "carefree" },
  unbothered: { score: 2, cat: "carefree" }, nonchalant: { score: 1.5, cat: "carefree" },
  carefree: { score: 2, cat: "carefree" }, untroubled: { score: 1.5, cat: "carefree" },
  footloose: { score: 1.5, cat: "carefree" }, breezy: { score: 2, cat: "carefree" },
  vibing: { score: 1.5, cat: "carefree" }, lighthearted: { score: 1.5, cat: "carefree" },
  easy: { score: 1, cat: "carefree" },

  // ---- tired ---------------------------------------------------------------
  tired: { score: -1, cat: "tired" }, exhausted: { score: -2, cat: "tired" },
  exhausting: { score: -2, cat: "tired" }, drained: { score: -2, cat: "tired" },
  burnt: { score: -2, cat: "tired" }, burned: { score: -2, cat: "tired" },
  burnout: { score: -2, cat: "tired" }, sleepy: { score: -1, cat: "tired" },
  fatigued: { score: -2, cat: "tired" }, sluggish: { score: -1, cat: "tired" },
  lazy: { score: -1, cat: "tired" }, unmotivated: { score: -1, cat: "tired" },
  stuck: { score: -1, cat: "tired" }, bored: { score: -1, cat: "tired" },
  boring: { score: -1, cat: "tired" }, sick: { score: -1, cat: "tired" },
  ill: { score: -1, cat: "tired" }, headache: { score: -1, cat: "tired" },
  insomnia: { score: -1, cat: "tired" }, sleepless: { score: -1, cat: "tired" },
  overworked: { score: -2, cat: "tired" },

  // ---- anxious (foggy, unsure) ---------------------------------------------
  anxious: { score: -2, cat: "anxious" }, anxiety: { score: -2, cat: "anxious" },
  nervous: { score: -1, cat: "anxious" }, worried: { score: -2, cat: "anxious" },
  worry: { score: -2, cat: "anxious" }, scared: { score: -2, cat: "anxious" },
  afraid: { score: -2, cat: "anxious" }, fear: { score: -2, cat: "anxious" },
  fearful: { score: -2, cat: "anxious" }, panic: { score: -3, cat: "anxious" },
  panicked: { score: -3, cat: "anxious" }, stressed: { score: -2, cat: "anxious" },
  stress: { score: -2, cat: "anxious" }, stressful: { score: -2, cat: "anxious" },
  uncertain: { score: -1, cat: "anxious" }, uneasy: { score: -1, cat: "anxious" },
  dread: { score: -2, cat: "anxious" }, tense: { score: -1, cat: "anxious" },
  pressure: { score: -1, cat: "anxious" }, deadline: { score: -1, cat: "anxious" },
  deadlines: { score: -1, cat: "anxious" }, restless: { score: -1, cat: "anxious" },
  spiraling: { score: -2, cat: "anxious" }, spiraled: { score: -2, cat: "anxious" },
  unsure: { score: -1, cat: "anxious" },

  // ---- sad -----------------------------------------------------------------
  sad: { score: -2, cat: "sad" }, sadness: { score: -2, cat: "sad" },
  down: { score: -1, cat: "sad" }, low: { score: -1, cat: "sad" },
  blue: { score: -1, cat: "sad" }, unhappy: { score: -2, cat: "sad" },
  miserable: { score: -3, cat: "sad" }, heartbroken: { score: -3, cat: "sad" },
  brokenhearted: { score: -3, cat: "sad" }, lonely: { score: -2, cat: "sad" },
  alone: { score: -1, cat: "sad" }, isolated: { score: -2, cat: "sad" },
  empty: { score: -2, cat: "sad" }, hopeless: { score: -3, cat: "sad" },
  worthless: { score: -3, cat: "sad" }, disappointed: { score: -2, cat: "sad" },
  disappointing: { score: -2, cat: "sad" }, crying: { score: -2, cat: "sad" },
  cried: { score: -2, cat: "sad" }, tears: { score: -2, cat: "sad" },
  grief: { score: -3, cat: "sad" }, grieving: { score: -3, cat: "sad" },
  loss: { score: -2, cat: "sad" }, missing: { score: -1, cat: "sad" },
  hurt: { score: -2, cat: "sad" }, hurting: { score: -2, cat: "sad" },
  regret: { score: -1, cat: "sad" }, guilty: { score: -2, cat: "sad" },
  ashamed: { score: -2, cat: "sad" }, bad: { score: -1, cat: "sad" },
  awful: { score: -3, cat: "sad" }, terrible: { score: -3, cat: "sad" },
  rough: { score: -1, cat: "sad" }, devastated: { score: -3, cat: "sad" },
  despair: { score: -3, cat: "sad" }, melancholy: { score: -2, cat: "sad" },
  abandoned: { score: -2, cat: "sad" }, rejected: { score: -2, cat: "sad" },
  forgotten: { score: -2, cat: "sad" }, helpless: { score: -2, cat: "sad" },

  // ---- angry -----------------------------------------------------------
  angry: { score: -2, cat: "angry" }, anger: { score: -2, cat: "angry" },
  furious: { score: -3, cat: "angry" }, mad: { score: -2, cat: "angry" },
  irritated: { score: -1, cat: "angry" }, irritable: { score: -1, cat: "angry" },
  annoyed: { score: -1, cat: "angry" }, annoying: { score: -1, cat: "angry" },
  frustrated: { score: -2, cat: "angry" }, frustrating: { score: -2, cat: "angry" },
  resentful: { score: -2, cat: "angry" }, bitter: { score: -2, cat: "angry" },
  hate: { score: -2, cat: "angry" }, hated: { score: -2, cat: "angry" },
  unfair: { score: -1, cat: "angry" }, argument: { score: -1, cat: "angry" },
  argued: { score: -1, cat: "angry" }, fight: { score: -1, cat: "angry" },
  fought: { score: -1, cat: "angry" }, yelled: { score: -2, cat: "angry" },
  snapped: { score: -2, cat: "angry" }, livid: { score: -3, cat: "angry" },
  seething: { score: -3, cat: "angry" }, fuming: { score: -3, cat: "angry" },
  irate: { score: -3, cat: "angry" }, enraged: { score: -3, cat: "angry" },
  betrayed: { score: -2, cat: "angry" }, disrespected: { score: -2, cat: "angry" },

  // ---- overwhelmed (snow flurries, numb) ------------------------------------
  overwhelmed: { score: -2, cat: "overwhelmed" }, overwhelming: { score: -2, cat: "overwhelmed" },
  numb: { score: -2, cat: "overwhelmed" }, frozen: { score: -1.5, cat: "overwhelmed" },
  paralyzed: { score: -2, cat: "overwhelmed" }, swamped: { score: -2, cat: "overwhelmed" },
  buried: { score: -1.5, cat: "overwhelmed" }, drowning: { score: -2.5, cat: "overwhelmed" },
  blank: { score: -1, cat: "overwhelmed" },

  // ---- surprise (aurora skies, awe) -----------------------------------------
  surprised: { score: 2, cat: "surprise" }, surprising: { score: 1.5, cat: "surprise" },
  surprise: { score: 1.5, cat: "surprise" }, shocked: { score: 1.5, cat: "surprise" },
  unexpected: { score: 1.5, cat: "surprise" }, amazed: { score: 2.5, cat: "surprise" },
  astonished: { score: 2.5, cat: "surprise" }, astonishing: { score: 2, cat: "surprise" },
  stunned: { score: 2, cat: "surprise" }, speechless: { score: 2, cat: "surprise" },
  awe: { score: 2.5, cat: "surprise" }, awed: { score: 2.5, cat: "surprise" },
  incredible: { score: 2, cat: "surprise" }, unbelievable: { score: 2, cat: "surprise" },
  wow: { score: 2, cat: "surprise" }, whoa: { score: 1.5, cat: "surprise" },
};

// Multi-word phrases scored as a unit, checked directly against the raw text.
const PHRASES = {
  "over the moon": { score: 3, cat: "joy" },
  "on top of the world": { score: 3, cat: "joy" },
  "walking on sunshine": { score: 3, cat: "joy" },
  "on cloud nine": { score: 3, cat: "joy" },
  "butterflies in my stomach": { score: 2, cat: "joy" },
  "head over heels": { score: 3, cat: "joy" },
  "heart is full": { score: 3, cat: "joy" },
  "in love": { score: 3, cat: "joy" },
  "at peace": { score: 2, cat: "calm" },
  "laid back": { score: 2, cat: "carefree" },
  "no worries": { score: 1.5, cat: "carefree" },
  "easy breezy": { score: 2, cat: "carefree" },
  "not a care in the world": { score: 2.5, cat: "carefree" },
  "under the weather": { score: -1, cat: "tired" },
  "burnt out": { score: -2, cat: "tired" },
  "burned out": { score: -2, cat: "tired" },
  "running on empty": { score: -2, cat: "tired" },
  "no energy": { score: -2, cat: "tired" },
  "at my wits end": { score: -2, cat: "anxious" },
  "on edge": { score: -2, cat: "anxious" },
  "nervous wreck": { score: -3, cat: "anxious" },
  "on high alert": { score: -2, cat: "anxious" },
  "falling apart": { score: -2, cat: "sad" },
  "cant stop crying": { score: -3, cat: "sad" },
  "can't stop crying": { score: -3, cat: "sad" },
  "at rock bottom": { score: -3, cat: "sad" },
  "cant catch a break": { score: -2, cat: "sad" },
  "can't catch a break": { score: -2, cat: "sad" },
  "lost my temper": { score: -2, cat: "angry" },
  "blew up": { score: -2, cat: "angry" },
  "sick and tired": { score: -2, cat: "angry" },
  "all too much": { score: -2, cat: "overwhelmed" },
  "cant cope": { score: -2, cat: "overwhelmed" },
  "can't cope": { score: -2, cat: "overwhelmed" },
  "shutting down": { score: -2, cat: "overwhelmed" },
  "too much at once": { score: -2, cat: "overwhelmed" },
  "mind blown": { score: 2.5, cat: "surprise" },
  "out of nowhere": { score: 1.5, cat: "surprise" },
  "plot twist": { score: 2, cat: "surprise" },
  "did not expect": { score: 2, cat: "surprise" },
  "didnt expect": { score: 2, cat: "surprise" },
  "didn't expect": { score: 2, cat: "surprise" },
  "never saw that coming": { score: 2, cat: "surprise" },
};

// Negation words: flip the sign of whatever follows within NEGATION_WINDOW
const NEGATIONS = new Set(["not", "no", "never", "n't", "cant", "can't", "wasnt", "wasn't", "didnt", "didn't", "isnt", "isn't", "arent", "aren't", "hardly", "barely"]);
const NEGATION_WINDOW = 3;

// Intensifiers: scale the magnitude of the following word
const INTENSIFIERS = { very: 1.5, really: 1.5, so: 1.4, extremely: 1.8, super: 1.5, incredibly: 1.8, totally: 1.4, absolutely: 1.7, deeply: 1.5, slightly: 0.6, kind: 0.7, sort: 0.7, bit: 0.6, somewhat: 0.7 };

// Words or phrases that, on their own, warrant a gentle "you might not be okay" note.
// Small and generic on purpose. It only ever triggers a caring, non-diagnostic
// message with helpline info, never a label or a judgment.
const CRISIS_SIGNALS = ["suicidal", "want to die", "kill myself", "worthless", "hopeless", "cant go on", "can't go on", "want to disappear", "no point", "give up on life", "end it all", "not worth living", "better off without me"];

if (typeof module !== "undefined") module.exports = { LEXICON, PHRASES, NEGATIONS, NEGATION_WINDOW, INTENSIFIERS, CRISIS_SIGNALS };
