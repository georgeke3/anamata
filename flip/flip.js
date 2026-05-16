'use strict';

(function () {

// ── DATA ──────────────────────────────────────────────────────────────────────
const FL_ROWS = [
  {id:'a',  lbl:'a',  s:[{r:'a', h:'あ',k:'ア'},{r:'i', h:'い',k:'イ'},{r:'u', h:'う',k:'ウ'},{r:'e', h:'え',k:'エ'},{r:'o', h:'お',k:'オ'}]},
  {id:'ka', lbl:'ka', s:[{r:'ka',h:'か',k:'カ'},{r:'ki',h:'き',k:'キ'},{r:'ku',h:'く',k:'ク'},{r:'ke',h:'け',k:'ケ'},{r:'ko',h:'こ',k:'コ'}]},
  {id:'sa', lbl:'sa', s:[{r:'sa',h:'さ',k:'サ'},{r:'shi',alt:['si'],h:'し',k:'シ'},{r:'su',h:'す',k:'ス'},{r:'se',h:'せ',k:'セ'},{r:'so',h:'そ',k:'ソ'}]},
  {id:'ta', lbl:'ta', s:[{r:'ta',h:'た',k:'タ'},{r:'chi',alt:['ti'],h:'ち',k:'チ'},{r:'tsu',alt:['tu'],h:'つ',k:'ツ'},{r:'te',h:'て',k:'テ'},{r:'to',h:'と',k:'ト'}]},
  {id:'na', lbl:'na', s:[{r:'na',h:'な',k:'ナ'},{r:'ni',h:'に',k:'ニ'},{r:'nu',h:'ぬ',k:'ヌ'},{r:'ne',h:'ね',k:'ネ'},{r:'no',h:'の',k:'ノ'}]},
  {id:'ha', lbl:'ha', s:[{r:'ha',h:'は',k:'ハ'},{r:'hi',h:'ひ',k:'ヒ'},{r:'fu',alt:['hu'],h:'ふ',k:'フ'},{r:'he',h:'へ',k:'ヘ'},{r:'ho',h:'ほ',k:'ホ'}]},
  {id:'ma', lbl:'ma', s:[{r:'ma',h:'ま',k:'マ'},{r:'mi',h:'み',k:'ミ'},{r:'mu',h:'む',k:'ム'},{r:'me',h:'め',k:'メ'},{r:'mo',h:'も',k:'モ'}]},
  {id:'ya', lbl:'ya', s:[{r:'ya',h:'や',k:'ヤ'},{r:'yu',h:'ゆ',k:'ユ'},{r:'yo',h:'よ',k:'ヨ'}]},
  {id:'ra', lbl:'ra', s:[{r:'ra',h:'ら',k:'ラ'},{r:'ri',h:'り',k:'リ'},{r:'ru',h:'る',k:'ル'},{r:'re',h:'れ',k:'レ'},{r:'ro',h:'ろ',k:'ロ'}]},
  {id:'wa', lbl:'wa', s:[{r:'wa',h:'わ',k:'ワ'},{r:'wo',alt:['o'],h:'を',k:'ヲ'},{r:'n', h:'ん',k:'ン'}]},
];

// ── DAKUTEN (voiced / semi-voiced) ────────────────────────────────────────────
const FL_DAKUTEN_ROWS = [
  {id:'ga', lbl:'ga', baseId:'ka', s:[{r:'ga',h:'が',k:'ガ'},{r:'gi',h:'ぎ',k:'ギ'},{r:'gu',h:'ぐ',k:'グ'},{r:'ge',h:'げ',k:'ゲ'},{r:'go',h:'ご',k:'ゴ'}]},
  {id:'za', lbl:'za', baseId:'sa', s:[{r:'za',h:'ざ',k:'ザ'},{r:'ji',alt:['zi'],h:'じ',k:'ジ'},{r:'zu',h:'ず',k:'ズ'},{r:'ze',h:'ぜ',k:'ゼ'},{r:'zo',h:'ぞ',k:'ゾ'}]},
  {id:'da', lbl:'da', baseId:'ta', s:[{r:'da',h:'だ',k:'ダ'},{r:'di',alt:['ji'],h:'ぢ',k:'ヂ'},{r:'du',alt:['zu'],h:'づ',k:'ヅ'},{r:'de',h:'で',k:'デ'},{r:'do',h:'ど',k:'ド'}]},
  {id:'ba', lbl:'ba', baseId:'ha', s:[{r:'ba',h:'ば',k:'バ'},{r:'bi',h:'び',k:'ビ'},{r:'bu',h:'ぶ',k:'ブ'},{r:'be',h:'べ',k:'ベ'},{r:'bo',h:'ぼ',k:'ボ'}]},
  {id:'pa', lbl:'pa', baseId:'ha', s:[{r:'pa',h:'ぱ',k:'パ'},{r:'pi',h:'ぴ',k:'ピ'},{r:'pu',h:'ぷ',k:'プ'},{r:'pe',h:'ぺ',k:'ペ'},{r:'po',h:'ぽ',k:'ポ'}]},
];

// ── COMBINATIONS (youon) ───────────────────────────────────────────────────────
// requiresDakuten: true  →  only added when flShowDakuten is also on
const FL_COMBO_ROWS = [
  {id:'kya', lbl:'kya', baseId:'ka', s:[{r:'kya',h:'きゃ',k:'キャ'},{r:'kyu',h:'きゅ',k:'キュ'},{r:'kyo',h:'きょ',k:'キョ'}]},
  {id:'sha', lbl:'sha', baseId:'sa', s:[{r:'sha',alt:['sya'],h:'しゃ',k:'シャ'},{r:'shu',alt:['syu'],h:'しゅ',k:'シュ'},{r:'sho',alt:['syo'],h:'しょ',k:'ショ'}]},
  {id:'cha', lbl:'cha', baseId:'ta', s:[{r:'cha',alt:['tya'],h:'ちゃ',k:'チャ'},{r:'chu',alt:['tyu'],h:'ちゅ',k:'チュ'},{r:'cho',alt:['tyo'],h:'ちょ',k:'チョ'}]},
  {id:'nya', lbl:'nya', baseId:'na', s:[{r:'nya',h:'にゃ',k:'ニャ'},{r:'nyu',h:'にゅ',k:'ニュ'},{r:'nyo',h:'にょ',k:'ニョ'}]},
  {id:'hya', lbl:'hya', baseId:'ha', s:[{r:'hya',h:'ひゃ',k:'ヒャ'},{r:'hyu',h:'ひゅ',k:'ヒュ'},{r:'hyo',h:'ひょ',k:'ヒョ'}]},
  {id:'mya', lbl:'mya', baseId:'ma', s:[{r:'mya',h:'みゃ',k:'ミャ'},{r:'myu',h:'みゅ',k:'ミュ'},{r:'myo',h:'みょ',k:'ミョ'}]},
  {id:'rya', lbl:'rya', baseId:'ra', s:[{r:'rya',h:'りゃ',k:'リャ'},{r:'ryu',h:'りゅ',k:'リュ'},{r:'ryo',h:'りょ',k:'リョ'}]},
  // voiced combos — only appear when dakuten is also on
  {id:'gya', lbl:'gya', baseId:'ka', requiresDakuten:true, s:[{r:'gya',h:'ぎゃ',k:'ギャ'},{r:'gyu',h:'ぎゅ',k:'ギュ'},{r:'gyo',h:'ぎょ',k:'ギョ'}]},
  {id:'ja',  lbl:'ja',  baseId:'sa', requiresDakuten:true, s:[{r:'ja',alt:['jya'],h:'じゃ',k:'ジャ'},{r:'ju',alt:['jyu'],h:'じゅ',k:'ジュ'},{r:'jo',alt:['jyo'],h:'じょ',k:'ジョ'}]},
  {id:'bya', lbl:'bya', baseId:'ha', requiresDakuten:true, s:[{r:'bya',h:'びゃ',k:'ビャ'},{r:'byu',h:'びゅ',k:'ビュ'},{r:'byo',h:'びょ',k:'ビョ'}]},
  {id:'pya', lbl:'pya', baseId:'ha', requiresDakuten:true, s:[{r:'pya',h:'ぴゃ',k:'ピャ'},{r:'pyu',h:'ぴゅ',k:'ピュ'},{r:'pyo',h:'ぴょ',k:'ピョ'}]},
];

// ── FONTS ─────────────────────────────────────────────────────────────────────
const FL_FONTS = [
  { id: 'noto-sans',     name: 'Noto Sans',  family: '"Noto Sans JP", sans-serif' },
  { id: 'noto-serif',    name: 'Noto Serif', family: '"Noto Serif JP", serif' },
  { id: 'shippori',      name: 'Shippori',   family: '"Shippori Mincho", serif' },
  { id: 'biz-ud',        name: 'BIZ UD',     family: '"BIZ UDPGothic", sans-serif' },
  { id: 'klee',          name: 'Klee',       family: '"Klee One", cursive' },
  { id: 'zen-mincho',    name: 'Zen Old',    family: '"Zen Old Mincho", serif' },
];
let flActiveFonts = new Set(FL_FONTS.map(f => f.id));

function pickFont() {
  const active = FL_FONTS.filter(f => flActiveFonts.has(f.id));
  return active.length ? active[Math.floor(Math.random() * active.length)] : null;
}

function renderFontGrid() {
  const grid = $('fl-font-grid');
  grid.innerHTML = '';
  FL_FONTS.forEach(f => {
    const cell = document.createElement('div');
    cell.className = 'fl-font-cell' + (flActiveFonts.has(f.id) ? ' fl-font-active' : '');
    const span = document.createElement('span');
    span.style.fontFamily = f.family;
    span.textContent = 'あ';
    const small = document.createElement('small');
    small.textContent = f.name;
    cell.appendChild(span);
    cell.appendChild(small);
    cell.addEventListener('click', () => {
      if (flActiveFonts.has(f.id)) {
        if (flActiveFonts.size > 1) flActiveFonts.delete(f.id);
      } else {
        flActiveFonts.add(f.id);
      }
      saveFlipSettings();
      renderFontGrid();
    });
    grid.appendChild(cell);
  });
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
let flSelIds      = new Set(FL_ROWS.map(r => r.id));
let flShowHira    = true;
let flShowKata    = true;
let flTimerMs     = 5000;
let flShowDakuten = false;
let flShowCombos  = false;
let flPickMode      = 'session';  // 'random' | 'session' | 'lifetime'
let flCoverageMode  = false;      // guarantee every card appears before extras repeat
let flLifetimeStats = {};         // { front_char: {ok, tot} } — built from IndexedDB at session start

function loadFlipSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('flip-settings') || '{}');
    if (Array.isArray(s.rows) && s.rows.length) flSelIds = new Set(s.rows);
    if (s.hira    !== undefined) flShowHira    = !!s.hira;
    if (s.kata    !== undefined) flShowKata    = !!s.kata;
    if (s.timerMs)               flTimerMs     = +s.timerMs;
    if (Array.isArray(s.fonts) && s.fonts.length) flActiveFonts = new Set(s.fonts);
    if (s.dakuten  !== undefined) flShowDakuten  = !!s.dakuten;
    if (s.combos   !== undefined) flShowCombos   = !!s.combos;
    if (s.coverage !== undefined) flCoverageMode = !!s.coverage;
    if (s.pickMode)               flPickMode     = s.pickMode;
  } catch {}
}

function saveFlipSettings() {
  localStorage.setItem('flip-settings', JSON.stringify({
    rows: [...flSelIds], hira: flShowHira, kata: flShowKata, timerMs: flTimerMs,
    fonts: [...flActiveFonts], dakuten: flShowDakuten, combos: flShowCombos,
    coverage: flCoverageMode, pickMode: flPickMode,
  }));
}

// ── CARD POOL ─────────────────────────────────────────────────────────────────
// {r, front, back}  front = character shown on card, back = other script
let flPool = [];

function buildPool() {
  const pool = [];

  function addRows(rows) {
    rows.forEach(row => {
      row.s.forEach(s => {
        if (flShowHira) pool.push({ r: s.r, alt: s.alt, front: s.h, back: s.k });
        if (flShowKata) pool.push({ r: s.r, alt: s.alt, front: s.k, back: s.h });
      });
    });
  }

  addRows(FL_ROWS.filter(row => flSelIds.has(row.id)));

  if (flShowDakuten) {
    addRows(FL_DAKUTEN_ROWS.filter(row => flSelIds.has(row.baseId)));
  }

  if (flShowCombos) {
    addRows(FL_COMBO_ROWS.filter(row =>
      flSelIds.has(row.baseId) && (!row.requiresDakuten || flShowDakuten)
    ));
  }

  if (!pool.length) FL_ROWS[0].s.forEach(s => pool.push({ r: s.r, alt: s.alt, front: s.h, back: s.k }));
  return pool;
}

// ── DEAL-BASED PICK ───────────────────────────────────────────────────────────
// Each round is a weighted shuffle of the full pool — weak/unseen cards get
// extra slots (unseen→3, 0%→5, 100%→1). Coverage mode deals a guaranteed
// base pass first, then extras. Back-to-back same character is prevented.
let flDeck = [];
let flLast = null;

function cardSlots(card) {
  if (flPickMode === 'random') return 1;
  const map = flPickMode === 'lifetime' ? flLifetimeStats : flStats;
  const st  = map[card.front];
  if (!st || st.tot === 0) return 3;
  const miss = 1 - st.ok / st.tot;
  return Math.max(1, Math.round(1 + miss * 4));
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildDeal() {
  if (flCoverageMode) {
    // Base pass guarantees every card appears once, extras added after
    const base   = shuffleInPlace([...flPool]);
    const extras = [];
    for (const card of flPool) {
      const n = cardSlots(card);
      for (let i = 1; i < n; i++) extras.push(card);
    }
    shuffleInPlace(extras);
    return [...extras, ...base]; // deck pops from end, so base is dealt first
  }
  const deal = [];
  for (const card of flPool) {
    const n = cardSlots(card);
    for (let i = 0; i < n; i++) deal.push(card);
  }
  return shuffleInPlace(deal);
}

function pickCard() {
  if (flDeck.length === 0) flDeck = buildDeal();
  if (!flLast) return flDeck.pop();
  // Scan from top of deck for first card with a different romaji
  for (let i = flDeck.length - 1; i >= 0; i--) {
    if (flDeck[i].r !== flLast.r) {
      const [card] = flDeck.splice(i, 1);
      return card;
    }
  }
  return flDeck.pop(); // edge case: all remaining cards are same character
}

// ── SESSION STATE ─────────────────────────────────────────────────────────────
let flState           = 'front';
let flCur             = null;
let flOk              = 0;
let flTot             = 0;
let flCardN           = 0;
let flStats           = {};        // {romaji: {ok, tot}}
let flStreak          = 0;
let flRecentResults   = [];        // last 10 booleans
let flRating          = false;
let flRevealedAt      = 0;
let flKeyOn           = false;
let flRaf             = null;
let flCurrentSessionId = null;
let flCardShownAt     = 0;
let flRespTimes       = [];

const FL_CIRCUM = 2 * Math.PI * 88; // SVG arc circumference (r=88)
const $ = id => document.getElementById(id);

// ── FLIP HOME ─────────────────────────────────────────────────────────────────
function enterFlipHome() {
  loadFlipSettings();
  renderFlHome();
  showScreen('flip-home');
}

function renderFlHome() {
  const grid = $('fl-row-grid');
  grid.innerHTML = '';
  FL_ROWS.forEach(row => {
    const el = document.createElement('div');
    el.className = 'row-item' + (flSelIds.has(row.id) ? ' sel' : '');
    el.textContent = row.lbl;
    el.addEventListener('click', () => {
      if (flSelIds.has(row.id)) flSelIds.delete(row.id); else flSelIds.add(row.id);
      saveFlipSettings(); renderFlHome();
    });
    grid.appendChild(el);
  });

  $('fl-toggle-all').textContent = flSelIds.size === FL_ROWS.length ? 'deselect all' : 'select all';

  ['hira','kata'].forEach(k => {
    const on = k === 'hira' ? flShowHira : flShowKata;
    $('fl-set-' + k).classList.toggle('on', on);
    $('fl-set-' + k).classList.toggle('off-state', !on);
  });

  $('fl-set-timer').value = flTimerMs / 1000;
  $('fl-start').disabled = flSelIds.size === 0 || (!flShowHira && !flShowKata);
}

// ── TIMER ─────────────────────────────────────────────────────────────────────
function startTimer() {
  stopTimer();
  const arc = $('fl-arc');
  arc.style.stroke = '#1e1e1e';
  arc.style.strokeDasharray  = FL_CIRCUM;
  arc.style.strokeDashoffset = '0';
  const t0 = performance.now();

  (function tick(now) {
    const p = Math.min((now - t0) / flTimerMs, 1);
    arc.style.strokeDashoffset = FL_CIRCUM * p;
    if (p >= 0.65) arc.style.stroke = '#3a1010';
    if (p >= 1) { revealCard(); return; }
    flRaf = requestAnimationFrame(tick);
  })(performance.now());
}

function stopTimer() {
  if (flRaf) { cancelAnimationFrame(flRaf); flRaf = null; }
  // reset arc to hidden
  const arc = $('fl-arc');
  arc.style.strokeDashoffset = FL_CIRCUM;
  arc.style.stroke = '#1e1e1e';
}

// ── CORE LOOP ─────────────────────────────────────────────────────────────────
function enterFlip() {
  flPool             = buildPool();
  flDeck             = [];
  flLast             = null;
  flOk               = 0; flTot = 0; flCardN = 0;
  flStats            = {};
  flStreak           = 0;
  flRecentResults    = [];
  flRating           = false;
  flCurrentSessionId = null;
  flRespTimes        = [];
  flCardShownAt      = 0;
  flRevealedAt       = 0;
  flLifetimeStats    = {};

  loadAllAttempts().then(all => {
    for (const a of all) {
      if (a.mode !== 'flip') continue;
      if (!flLifetimeStats[a.kana]) flLifetimeStats[a.kana] = { ok: 0, tot: 0 };
      flLifetimeStats[a.kana].tot++;
      if (a.hit) flLifetimeStats[a.kana].ok++;
    }
    if (flPickMode === 'lifetime') flDeck = buildDeal();
  }).catch(() => {});

  startFlipSession([...flSelIds], { hira: flShowHira, kata: flShowKata, timerMs: flTimerMs })
    .then(id => { flCurrentSessionId = id; })
    .catch(() => {});

  if (!flKeyOn) { document.addEventListener('keydown', flKeyHandler); flKeyOn = true; }

  showScreen('flip');
  nextCard();
}

function nextCard() {
  flCur         = pickCard();
  flLast        = flCur;
  flCardShownAt = Date.now();
  flState  = 'front';
  flRating = false;

  const font = pickFont();
  $('fl-kana').style.fontFamily     = font ? font.family : '';
  $('fl-kana').textContent          = flCur.front;
  $('fl-hint').style.visibility    = 'visible';
  $('fl-answer').style.visibility  = 'hidden';
  $('fl-btns').style.visibility    = 'hidden';

  flCardN++;
  $('fl-count').textContent = '#' + flCardN;
  renderFlStats();
  startTimer();
}

function revealCard() {
  if (flState !== 'front') return;
  stopTimer();
  flRevealedAt = Date.now();
  flState = 'revealed';

  const romajiStr = flCur.alt ? flCur.r + ' · ' + flCur.alt.join(' · ') : flCur.r;
  $('fl-romaji').textContent        = romajiStr;
  $('fl-altchar').textContent       = flCur.back;
  $('fl-hint').style.visibility    = 'hidden';
  $('fl-answer').style.visibility  = 'visible';
  $('fl-btns').style.visibility    = 'visible';
}

function rateCard(correct) {
  if (flState !== 'revealed' || flRating) return;
  flRating = true;

  flTot++;
  if (correct) { flOk++; flStreak++; } else { flStreak = 0; }
  flRespTimes.push(flRevealedAt - flCardShownAt);

  flRecentResults.push(correct);
  if (flRecentResults.length > 10) flRecentResults.shift();

  if (!flStats[flCur.front]) flStats[flCur.front] = { ok: 0, tot: 0 };
  flStats[flCur.front].tot++;
  if (correct) flStats[flCur.front].ok++;

  if (flCurrentSessionId !== null) {
    saveAttempt({
      sessionId: flCurrentSessionId,
      ts:        Date.now(),
      kana:      flCur.front,
      romaji:    flCur.r,
      hit:       correct,
      reason:    correct ? 'correct' : 'wrong',
      ms:        flRevealedAt - flCardShownAt,
      mode:      'flip',
    });
  }

  renderFlStats();

  const card = $('fl-card');
  card.classList.add(correct ? 'fl-flash-ok' : 'fl-flash-err');
  setTimeout(() => { card.classList.remove('fl-flash-ok', 'fl-flash-err'); nextCard(); }, 200);
}

function renderFlStats() {
  $('fl-score').textContent = flOk + ' / ' + flTot;

  let s = '';
  if (flStreak >= 3) {
    s = '🔥 ' + flStreak;
  } else if (flTot >= 5) {
    const recent = flRecentResults.slice(-5);
    const ra = recent.filter(Boolean).length / recent.length;
    const oa = flTot ? flOk / flTot : 0;
    s = ra > oa + 0.1 ? '↑' : ra < oa - 0.1 ? '↓' : '→';
  }
  $('fl-stats').textContent = s;
}

// ── SUMMARY ───────────────────────────────────────────────────────────────────
function showFlipSummary() {
  stopTimer();
  const pct   = flTot ? Math.round(flOk / flTot * 100) : 0;
  const avgMs = flRespTimes.length
    ? Math.round(flRespTimes.reduce((a, b) => a + b, 0) / flRespTimes.length)
    : 0;
  $('fls-stats').textContent = flTot
    ? `${flOk} / ${flTot}  ·  ${pct}%` + (avgMs ? `  ·  ${(avgMs / 1000).toFixed(1)}s avg` : '')
    : 'no attempts';

  const heat = $('fls-heat');
  heat.innerHTML = '';

  function makeScriptRow(row, getChar, label) {
    if (!row.s.some(s => flStats[getChar(s)])) return null;
    const grid = document.createElement('div');
    grid.className = 'heat-grid';
    const lbl = document.createElement('div');
    lbl.className = 'heat-label';
    lbl.textContent = label;
    grid.appendChild(lbl);
    row.s.forEach(s => {
      const cell = document.createElement('div');
      cell.className = 'heat-cell';
      const ch = getChar(s);
      const st = flStats[ch];
      if (st) {
        cell.style.background = heatColor(st.ok / st.tot);
        cell.textContent = ch;
        const rLabel = s.alt ? s.r + ' / ' + s.alt.join(' / ') : s.r;
        cell.title = rLabel + '  ' + st.ok + '/' + st.tot;
      } else {
        cell.style.background = '#0c0c0c';
        cell.textContent = ch;
      }
      grid.appendChild(cell);
    });
    for (let i = row.s.length; i < 5; i++) {
      const pad = document.createElement('div');
      pad.className = 'heat-cell'; pad.style.background = '#0c0c0c';
      grid.appendChild(pad);
    }
    return grid;
  }

  // Renders all rows for a section; returns true if anything was appended
  function renderSection(label, rows) {
    const grids = [];
    rows.forEach(row => {
      let labeled = false;
      if (flShowHira) {
        const g = makeScriptRow(row, s => s.h, row.lbl);
        if (g) { grids.push(g); labeled = true; }
      }
      if (flShowKata) {
        const g = makeScriptRow(row, s => s.k, labeled ? '' : row.lbl);
        if (g) grids.push(g);
      }
    });
    if (!grids.length) return false;
    if (label) {
      const lbl = document.createElement('div');
      lbl.className = 'fls-section-lbl';
      lbl.textContent = label;
      heat.appendChild(lbl);
    }
    grids.forEach(g => heat.appendChild(g));
    return true;
  }

  const multiSection = flShowDakuten || flShowCombos;

  renderSection(multiSection ? 'base' : '', FL_ROWS.filter(r => flSelIds.has(r.id)));

  if (flShowDakuten) {
    renderSection('dakuten', FL_DAKUTEN_ROWS.filter(r => flSelIds.has(r.baseId)));
  }

  if (flShowCombos) {
    renderSection('combos', FL_COMBO_ROWS.filter(r =>
      flSelIds.has(r.baseId) && (!r.requiresDakuten || flShowDakuten)
    ));
  }

  // Worst kana (lifetime)
  const weakEl = $('fls-weakest');
  if (weakEl) {
    const byRomaji = {};
    for (const [ch, st] of Object.entries(flStats)) {
      const card = flPool.find(c => c.front === ch);
      if (!card) continue;
      const key = card.r;
      if (!byRomaji[key]) byRomaji[key] = { ok: 0, tot: 0, front: ch };
      byRomaji[key].ok  += st.ok;
      byRomaji[key].tot += st.tot;
    }
    const worst = Object.entries(byRomaji)
      .filter(([, s]) => s.tot >= 1)
      .sort((a, b) => (a[1].ok / a[1].tot) - (b[1].ok / b[1].tot))
      .slice(0, 5);
    if (worst.length) {
      weakEl.innerHTML = '<div class="fls-weak-lbl">worst</div>' +
        worst.map(([r, s]) => {
          const pct = Math.round(s.ok / s.tot * 100);
          return `<div class="hist-weak-row" data-kana-link="${s.front}" data-kana-from="flip-sum">` +
            `<span class="hist-weak-char">${s.front}</span>` +
            `<span class="hist-weak-romaji">${r}</span>` +
            `<div class="hist-weak-bar-wrap"><div class="hist-weak-bar" style="width:${pct}%"></div></div>` +
            `<span class="hist-weak-acc">${pct}%</span></div>`;
        }).join('');
    } else {
      weakEl.innerHTML = '';
    }
  }

  showScreen('flip-sum');
}

function heatColor(acc) {
  if (acc < 0.5) {
    const t = acc * 2;
    return `rgb(${Math.round(58 - 32*t)}, ${Math.round(16 + 10*t)}, 16)`;
  }
  const t = (acc - 0.5) * 2;
  return `rgb(26, ${Math.round(26 + 32*t)}, 26)`;
}

// ── EXIT ──────────────────────────────────────────────────────────────────────
function exitToFlipHome() {
  stopTimer();
  document.removeEventListener('keydown', flKeyHandler);
  flKeyOn = false;
  enterFlipHome();
}

// ── KEYBOARD ──────────────────────────────────────────────────────────────────
function flKeyHandler(e) {
  switch (e.key) {
    case ' ': case 'Enter': case 'ArrowDown': e.preventDefault(); revealCard(); break;
    case 'ArrowLeft':  case 'z': case 'Z':   e.preventDefault(); rateCard(true);  break;
    case 'ArrowRight': case 'x': case 'X':   e.preventDefault(); rateCard(false); break;
    case 'Escape':
      if (flTot > 0) showFlipSummary();
      else exitToFlipHome();
      break;
  }
}

// ── WIRE UP ───────────────────────────────────────────────────────────────────
// Click the FLIP title to switch to kana
$('flip-home-title').addEventListener('click', () => { renderHome(); showScreen('home'); });

// Set flip as the default landing mode
$('btn-fl-set-default').addEventListener('click', async function () {
  await savePref('default-mode', 'flip');
  updateDefaultBtns('flip');
});

// Flip settings page
$('btn-fl-settings').addEventListener('click', async () => {
  $('fl-set-timer').value = flTimerMs / 1000;
  const dakBtn = $('fl-set-dakuten');
  dakBtn.classList.toggle('on', flShowDakuten);
  dakBtn.classList.toggle('off-state', !flShowDakuten);
  dakBtn.textContent = flShowDakuten ? 'ON' : 'OFF';
  const comboBtn = $('fl-set-combos');
  comboBtn.classList.toggle('on', flShowCombos);
  comboBtn.classList.toggle('off-state', !flShowCombos);
  comboBtn.textContent = flShowCombos ? 'ON' : 'OFF';
  const covBtn = $('fl-set-coverage');
  covBtn.classList.toggle('on', flCoverageMode);
  covBtn.classList.toggle('off-state', !flCoverageMode);
  covBtn.textContent = flCoverageMode ? 'ON' : 'OFF';
  ['random','session','lifetime'].forEach(m =>
    $('fl-pick-' + m).classList.toggle('on', flPickMode === m)
  );
  showScreen('flip-settings');
  await Promise.allSettled(FL_FONTS.map(f => document.fonts.load(`1.7rem ${f.family}`, 'あ')));
  renderFontGrid();
});
$('btn-fl-settings-back').addEventListener('click', enterFlipHome);

$('fl-toggle-all').addEventListener('click', () => {
  if (flSelIds.size === FL_ROWS.length) flSelIds.clear();
  else FL_ROWS.forEach(r => flSelIds.add(r.id));
  saveFlipSettings(); renderFlHome();
});
$('fl-set-hira').addEventListener('click', () => { flShowHira = !flShowHira; saveFlipSettings(); renderFlHome(); });
$('fl-set-kata').addEventListener('click', () => { flShowKata = !flShowKata; saveFlipSettings(); renderFlHome(); });
$('fl-set-timer').addEventListener('change', () => {
  flTimerMs = Math.max(1000, Math.min(10000, parseFloat($('fl-set-timer').value) * 1000));
  saveFlipSettings();
});
$('fl-set-dakuten').addEventListener('click', () => {
  flShowDakuten = !flShowDakuten;
  const btn = $('fl-set-dakuten');
  btn.classList.toggle('on', flShowDakuten);
  btn.classList.toggle('off-state', !flShowDakuten);
  btn.textContent = flShowDakuten ? 'ON' : 'OFF';
  saveFlipSettings();
});
$('fl-set-combos').addEventListener('click', () => {
  flShowCombos = !flShowCombos;
  const btn = $('fl-set-combos');
  btn.classList.toggle('on', flShowCombos);
  btn.classList.toggle('off-state', !flShowCombos);
  btn.textContent = flShowCombos ? 'ON' : 'OFF';
  saveFlipSettings();
});
$('fl-set-coverage').addEventListener('click', () => {
  flCoverageMode = !flCoverageMode;
  const btn = $('fl-set-coverage');
  btn.classList.toggle('on', flCoverageMode);
  btn.classList.toggle('off-state', !flCoverageMode);
  btn.textContent = flCoverageMode ? 'ON' : 'OFF';
  saveFlipSettings();
});
['random','session','lifetime'].forEach(m => {
  $('fl-pick-' + m).addEventListener('click', () => {
    flPickMode = m;
    ['random','session','lifetime'].forEach(o =>
      $('fl-pick-' + o).classList.toggle('on', o === m)
    );
    saveFlipSettings();
  });
});
$('fl-start').addEventListener('click', enterFlip);

$('fl-card').addEventListener('click', revealCard);
$('fl-correct').addEventListener('click', e => { e.stopPropagation(); rateCard(true); });
$('fl-wrong').addEventListener('click',   e => { e.stopPropagation(); rateCard(false); });
$('fl-end').addEventListener('click', showFlipSummary);

$('btn-fl-again').addEventListener('click', enterFlip);
$('btn-fl-home').addEventListener('click', () => {
  stopTimer();
  document.removeEventListener('keydown', flKeyHandler);
  flKeyOn = false;
  enterFlipHome();
});
$('btn-fl-history').addEventListener('click',  () => enterHistory('flip'));
$('btn-fls-history').addEventListener('click', () => enterHistory('flip'));

window.enterFlipHome = enterFlipHome;

})();
