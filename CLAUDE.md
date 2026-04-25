# Kana Practice App

Multi-file web app. TF.js transfer learning for phoneme classification (NOT Web Speech API). Serve via `http://localhost:8000` — `file://` breaks mic permissions.

## File map

| File | What's in it | Lines |
|------|-------------|-------|
| `index.html` | HTML structure only — no JS/CSS inline | ~90 |
| `css/style.css` | All styles | ~170 |
| `js/app.js` | ROWS data, settings helpers, all state vars, all DOM refs, utils (sleep/shuffle/showScreen/buildDeck), home screen | ~160 |
| `js/settings.js` | Settings screen logic + event listeners | ~50 |
| `js/db.js` | IndexedDB: bg silence, kana examples, history (sessions + attempts) | ~130 |
| `js/calibrate.js` | startCalibration, collectSoundSamples, runTraining | ~110 |
| `js/manage.js` | enterManage, renderManageGrid, startRetrain, startQuickTest, buildDeckFromSounds | ~150 |
| `js/practice.js` | nextCard, animateTimer, showResult, startPractice, showSummary, stats, pause, keyboard | ~175 |
| `js/init.js` | Init IIFE (model load, mic check) | ~35 |

**Script load order** (matters — later files call functions from earlier ones):
`app.js` → `settings.js` → `db.js` → `calibrate.js` → `manage.js` → `practice.js` → `init.js`

## Key state variables (all in `js/app.js`)

| Variable | Purpose |
|----------|---------|
| `base`, `xfer` | TF.js speech model references |
| `trainedIds` | Set of calibrated row IDs (persisted in `kana-rows`) |
| `cachedLabels` | Word label array (persisted in `kana-labels`; null after load) |
| `deck`, `cur` | Practice card deck and current card |
| `scoring`, `paused` | Practice session gate flags |
| `timerMs` | Per-session timer duration (read from settings at session start) |
| `retrainSounds` | Set of romaji strings selected for retraining |
| `quickTestMode`, `quickTestSounds` | Quick test state |
| `streak`, `recentResults`, `lifetimeOk` | Stats tracking |

## Screens (HTML sections)

`s-home` → `s-manage` → `s-cal` → `s-train` → (back to manage or home)
`s-home` → `s-settings` → `s-home`
`s-home` → `s-prac` → `s-summary` → (repeat or home/manage)

## LocalStorage keys

| Key | Content |
|-----|---------|
| `kana-rows` | JSON array of trained row IDs |
| `kana-labels` | JSON array of model word labels |
| `kana-settings` | JSON settings object (`timerMs`, `showHiragana`, `showKatakana`) |
| `kana-lifetime-ok` | Integer lifetime correct answer count (for milestones) |

## IndexedDB stores

| DB | Store | Purpose |
|----|-------|---------|
| `kana-bg` | `bg` | Background silence examples (one record, key `'data'`) |
| `kana-examples` | `ex` | Per-romaji training examples (key = romaji string) |
| `kana-history` | `sessions`, `attempts` | Session history and per-card attempt records |

## Hard constraints — do not violate

**1. Never call `xfer.stopListening()` / `xfer.listen()` in a loop.**
Triggers Chrome mic permission dialog on every cycle. One `listen()` call per session; gate results with `scoring` bool and `guardUntil` timestamp.

**2. `xfer.listen()` must be called synchronously inside a click handler.**
Chrome suspends AudioContext if created after any `await`. `#pr-tap` overlay exists solely for this. Do not move `xfer.listen()` into an async chain.

**3. `xfer.wordLabels()` returns null after `xfer.load()` from IndexedDB.**
TF.js restores weights but not the label map. Labels are saved to `localStorage['kana-labels']` at training time and restored on load. Always guard the callback with `if (!cachedLabels) return`.

## Inference callback guard (always keep all four)
```js
if (!cachedLabels) return;
if (scoring || paused || Date.now() < guardUntil) return;
if (heard === '_background_') return;
if (conf < 0.80) return;
```

## `overlapFactor: 0.975` causes mic stream churn — keep at 0.75.
