'use strict';

// ── DATA ──────────────────────────────────────────────────────────────────────
const ROWS = [
  {id:'a',  lbl:'a-row',  s:[{r:'a', h:'あ',k:'ア'},{r:'i', h:'い',k:'イ'},{r:'u', h:'う',k:'ウ'},{r:'e', h:'え',k:'エ'},{r:'o', h:'お',k:'オ'}]},
  {id:'ka', lbl:'ka-row', s:[{r:'ka',h:'か',k:'カ'},{r:'ki',h:'き',k:'キ'},{r:'ku',h:'く',k:'ク'},{r:'ke',h:'け',k:'ケ'},{r:'ko',h:'こ',k:'コ'}]},
  {id:'sa', lbl:'sa-row', s:[{r:'sa',h:'さ',k:'サ'},{r:'shi',alt:['si'],h:'し',k:'シ'},{r:'su',h:'す',k:'ス'},{r:'se',h:'せ',k:'セ'},{r:'so',h:'そ',k:'ソ'}]},
  {id:'ta', lbl:'ta-row', s:[{r:'ta',h:'た',k:'タ'},{r:'chi',alt:['ti'],h:'ち',k:'チ'},{r:'tsu',alt:['tu'],h:'つ',k:'ツ'},{r:'te',h:'て',k:'テ'},{r:'to',h:'と',k:'ト'}]},
  {id:'na', lbl:'na-row', s:[{r:'na',h:'な',k:'ナ'},{r:'ni',h:'に',k:'ニ'},{r:'nu',h:'ぬ',k:'ヌ'},{r:'ne',h:'ね',k:'ネ'},{r:'no',h:'の',k:'ノ'}]},
  {id:'ha', lbl:'ha-row', s:[{r:'ha',h:'は',k:'ハ'},{r:'hi',h:'ひ',k:'ヒ'},{r:'fu',alt:['hu'],h:'ふ',k:'フ'},{r:'he',h:'へ',k:'ヘ'},{r:'ho',h:'ほ',k:'ホ'}]},
  {id:'ma', lbl:'ma-row', s:[{r:'ma',h:'ま',k:'マ'},{r:'mi',h:'み',k:'ミ'},{r:'mu',h:'む',k:'ム'},{r:'me',h:'め',k:'メ'},{r:'mo',h:'も',k:'モ'}]},
  {id:'ya', lbl:'ya-row', s:[{r:'ya',h:'や',k:'ヤ'},{r:'yu',h:'ゆ',k:'ユ'},{r:'yo',h:'よ',k:'ヨ'}]},
  {id:'ra', lbl:'ra-row', s:[{r:'ra',h:'ら',k:'ラ'},{r:'ri',h:'り',k:'リ'},{r:'ru',h:'る',k:'ル'},{r:'re',h:'れ',k:'レ'},{r:'ro',h:'ろ',k:'ロ'}]},
  {id:'wa', lbl:'wa-row', s:[{r:'wa',h:'わ',k:'ワ'},{r:'wo',alt:['o'],h:'を',k:'ヲ'},{r:'n', h:'ん',k:'ン'}]},
];

// ── SETTINGS ──────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = { timerMs: 3000, showHiragana: true, showKatakana: true };

function getSettings() {
  try {
    return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(localStorage.getItem('kana-settings') || '{}'));
  } catch { return {...DEFAULT_SETTINGS}; }
}

function saveSettings(patch) {
  const s = getSettings();
  Object.assign(s, patch);
  localStorage.setItem('kana-settings', JSON.stringify(s));
}

// ── STATE ─────────────────────────────────────────────────────────────────────
let base = null, xfer = null;
let trainedIds = new Set(JSON.parse(localStorage.getItem('kana-rows') || '[]'));
let selIds = new Set();

let deck = [], cur = null, scoring = false, paused = false;
let nOk = 0, nTot = 0, raf = null, tStart = 0;
let lastHeard = null;
let lastHeardTime = 0;
let timerMs = DEFAULT_SETTINGS.timerMs;
let dbgOn = false;
let cachedLabels = null;

// Session tracking
let cardShownAt = 0;
let sessionResults = [];
let currentSessionId = null;

// Manage / retrain
let retrainSounds = new Set();
let quickTestMode = false;
let quickTestSounds = null;

// Practice session filter
let practiceRomaji = null; // Set of romaji strings in current practice deck

// Stats
let streak = 0;
let recentResults = [];
let lifetimeOk = parseInt(localStorage.getItem('kana-lifetime-ok') || '0', 10);
let milestoneFlashActive = false;

// ── DOM REFS ──────────────────────────────────────────────────────────────────
const overlayEl  = document.getElementById('overlay');
const overlayMsg = document.getElementById('overlay-msg');
const loadBar    = document.getElementById('load-bar');

const rowGrid  = document.getElementById('row-grid');
const btnPrac  = document.getElementById('btn-prac');
const btnCal   = document.getElementById('btn-cal');
const homeHint = document.getElementById('home-hint');
const btnManage = document.getElementById('btn-manage');

const calTitle = document.getElementById('cal-title');
const calChar  = document.getElementById('cal-char');
const calRom   = document.getElementById('cal-rom');
const calDots  = document.getElementById('cal-dots');
const calSt    = document.getElementById('cal-st');

const tFill = document.getElementById('t-fill');
const tSt   = document.getElementById('t-st');

const prKana  = document.getElementById('pr-kana');
const prFb    = document.getElementById('pr-fb');
const prScore = document.getElementById('pr-score');
const prStats = document.getElementById('pr-stats');
const prMic   = document.getElementById('pr-mic');
const prTap   = document.getElementById('pr-tap');
const tArc    = document.getElementById('t-arc');
const dbgEl   = document.getElementById('dbg');

const smStats = document.getElementById('sm-stats');
const smHeat  = document.getElementById('sm-heat');

const mngGrid         = document.getElementById('mng-grid');
const mngNotice       = document.getElementById('mng-notice');
const btnMngRetrain   = document.getElementById('btn-mng-retrain');
const btnMngQuicktest = document.getElementById('btn-mng-quicktest');

// ── UTILS ─────────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  document.getElementById('s-' + id).classList.add('on');
  if (id === 'home')      location.hash = 'kana';
  else if (id === 'flip-home') location.hash = 'flip';
}

window.addEventListener('hashchange', () => {
  const h = location.hash;
  if (h === '#flip') enterFlipHome();
  else if (h === '#kana') { renderHome(); showScreen('home'); }
});

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function saveMeta() {
  localStorage.setItem('kana-rows', JSON.stringify([...trainedIds]));
}

function buildDeck(romajiFilter = null) {
  const s = getSettings();
  const cards = [];
  for (const row of ROWS) {
    if (!trainedIds.has(row.id)) continue;
    for (const sound of row.s) {
      if (romajiFilter && !romajiFilter.has(sound.r)) continue;
      if (s.showHiragana) cards.push({c: sound.h, r: sound.r, alt: sound.alt});
      if (s.showKatakana) cards.push({c: sound.k, r: sound.r, alt: sound.alt});
    }
  }
  // Fallback: if both toggles somehow off, use hiragana
  if (cards.length === 0) {
    for (const row of ROWS) {
      if (!trainedIds.has(row.id)) continue;
      for (const sound of row.s) {
        if (romajiFilter && !romajiFilter.has(sound.r)) continue;
        cards.push({c: sound.h, r: sound.r});
      }
    }
  }
  return shuffle(cards);
}

// ── HOME SCREEN ───────────────────────────────────────────────────────────────
function renderHome() {
  rowGrid.innerHTML = '';
  selIds.clear();
  for (const row of ROWS) {
    const d = document.createElement('div');
    const done = trainedIds.has(row.id);
    d.className = 'row-item' + (done ? ' done' : '');
    d.textContent = done ? row.lbl + ' ✓' : row.lbl;
    d.dataset.id = row.id;
    rowGrid.appendChild(d);
  }
  btnPrac.disabled = trainedIds.size === 0;
  btnPrac.textContent = 'practice';
  btnCal.textContent = 'calibrate';
  btnCal.classList.remove('go');
  btnManage.style.display = trainedIds.size > 0 ? '' : 'none';
  homeHint.textContent = trainedIds.size
    ? 'select rows to (re)calibrate, or manage training'
    : 'select rows above then calibrate';
}

rowGrid.addEventListener('click', e => {
  const d = e.target.closest('.row-item');
  if (!d) return;
  const id = d.dataset.id;
  if (selIds.has(id)) { selIds.delete(id); d.classList.remove('sel'); }
  else                { selIds.add(id);    d.classList.add('sel'); }
  btnCal.textContent = selIds.size ? `calibrate (${selIds.size})` : 'calibrate';
  btnCal.classList.toggle('go', selIds.size > 0);
  const selSounds = ROWS.filter(r => selIds.has(r.id) && trainedIds.has(r.id)).reduce((sum, r) => sum + r.s.length, 0);
  btnPrac.textContent = selSounds > 0 ? `practice (${selSounds})` : 'practice';
});

btnCal.addEventListener('click', () => {
  if (!selIds.size) {
    const untrainedIds = ROWS.filter(r => !trainedIds.has(r.id)).map(r => r.id);
    const toSelect = untrainedIds.length ? untrainedIds : ROWS.map(r => r.id);
    toSelect.forEach(id => selIds.add(id));
  }
  startCalibration([...selIds]).catch(err => {
    console.error('Calibration error:', err);
    calSt.textContent = 'error: ' + err.message;
  });
});

btnPrac.addEventListener('click', () => {
  if (selIds.size > 0) {
    const filter = new Set(
      ROWS.filter(r => selIds.has(r.id) && trainedIds.has(r.id)).flatMap(r => r.s.map(s => s.r))
    );
    if (filter.size > 0) { startPractice(buildDeck(filter)); return; }
  }
  startPractice();
});
btnManage.addEventListener('click', () => enterManage());

document.getElementById('btn-reset-bg').addEventListener('click', async () => {
  await saveBgExamples(null);
  homeHint.textContent = 'silence reset — next calibration will re-record it';
});

document.getElementById('btn-settings').addEventListener('click', () => {
  openSettings();
  showScreen('settings');
});

document.getElementById('btn-history').addEventListener('click', () => enterHistory());

// Click the KANA title to switch to flip
document.getElementById('home-title').addEventListener('click', () => enterFlipHome());

// Hide the "set as default" button for whichever mode is already the default
function updateDefaultBtns(mode) {
  const kanaBtn = document.getElementById('btn-set-default');
  const flipBtn = document.getElementById('btn-fl-set-default');
  if (kanaBtn) kanaBtn.style.display = mode === 'kana' ? 'none' : '';
  if (flipBtn) flipBtn.style.display = mode === 'flip' ? 'none' : '';
}

// Set kana as the default landing mode
document.getElementById('btn-set-default').addEventListener('click', async function () {
  await savePref('default-mode', 'kana');
  updateDefaultBtns('kana');
});
