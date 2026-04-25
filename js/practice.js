'use strict';

// ── PRACTICE ──────────────────────────────────────────────────────────────────
const CIRCUM    = 2 * Math.PI * 88; // SVG arc circumference (r=88)
const MILESTONES = [10, 25, 50, 100, 200, 500, 1000];
let nextCardTimer = null;

function nextCard() {
  cardShownAt = Date.now();
  if (deck.length === 0) {
    if (quickTestMode) { endSession(); return; }
    deck = buildDeck(practiceRomaji || null);
  }
  cur = deck.pop();
  prKana.textContent = cur.c;
  prKana.className   = 'big';
  prFb.textContent   = '';
  scoring    = false;
  animateTimer();
}

function animateTimer() {
  cancelAnimationFrame(raf);
  tArc.style.strokeDasharray  = CIRCUM;
  tArc.style.strokeDashoffset = 0;
  tArc.style.stroke = '#1e1e1e';
  tStart = performance.now();

  (function tick(now) {
    if (scoring || paused) return;
    const p = Math.min((now - tStart) / timerMs, 1);
    tArc.style.strokeDashoffset = CIRCUM * p;
    if (p > 0.65) tArc.style.stroke = '#3a1010';
    if (p >= 1)   { showResult(false, '—'); return; }
    raf = requestAnimationFrame(tick);
  })(performance.now());
}

// ── STATS DISPLAY ─────────────────────────────────────────────────────────────
function updateScoreDisplay(milestone = null) {
  prScore.textContent = `${nOk} / ${nTot}`;

  if (milestone !== null && !milestoneFlashActive) {
    milestoneFlashActive = true;
    prStats.innerHTML = `<span class="stat-milestone milestone-anim">🎯 ${milestone}!</span>`;
    setTimeout(() => {
      milestoneFlashActive = false;
      renderStatsLine();
    }, 2000);
    return;
  }

  if (!milestoneFlashActive) renderStatsLine();
}

function renderStatsLine() {
  let html = '';

  if (streak >= 3) {
    html += `<span class="stat-streak">🔥${streak}</span>`;
  }

  if (nTot >= 5) {
    const sessionRate = nOk / nTot;
    const recentOk    = recentResults.filter(Boolean).length;
    const recentRate  = recentOk / recentResults.length;
    const diff = recentRate - sessionRate;
    if (streak >= 3) html += '  ';
    if (diff > 0.1)       html += `<span class="stat-trend-up">↑</span>`;
    else if (diff < -0.1) html += `<span class="stat-trend-down">↓</span>`;
    else                  html += `<span style="color:#333">→</span>`;
  }

  prStats.innerHTML = html;
}

function showResult(hit, heard) {
  scoring = true;
  cancelAnimationFrame(raf);
  nTot++;

  lastHeard = heard;
  lastHeardTime = Date.now();

  const ms     = Date.now() - cardShownAt;
  const reason = hit ? 'correct' : heard === '—' ? 'timeout' : 'wrong';
  sessionResults.push({romaji: cur.r, kana: cur.c, hit, reason, ms});
  if (currentSessionId !== null) {
    saveAttempt({ sessionId: currentSessionId, ts: Date.now(), kana: cur.c, romaji: cur.r, hit, reason, ms });
  }

  let milestone = null;
  if (hit) {
    nOk++;
    streak++;
    prKana.className  = 'big correct';
    prFb.textContent  = '';
    tArc.style.stroke = '#1a3a1a';

    lifetimeOk++;
    localStorage.setItem('kana-lifetime-ok', lifetimeOk);
    const prev = lifetimeOk - 1;
    for (const m of MILESTONES) {
      if (prev < m && lifetimeOk >= m) { milestone = m; break; }
    }
  } else {
    streak = 0;
    prKana.className = 'big wrong';
    const correctLabel = cur.alt ? cur.r + ' / ' + cur.alt.join(' / ') : cur.r;
    prFb.innerHTML =
      `<span style="color:#5a1e1e">${heard}</span>` +
      `<span style="color:#252525"> → </span>` +
      `<span style="color:#555">${correctLabel}</span>`;
    tArc.style.stroke = '#3a1010';
  }
  recentResults.push(hit);
  if (recentResults.length > 5) recentResults.shift();

  updateScoreDisplay(milestone);
  nextCardTimer = setTimeout(nextCard, hit ? 400 : 1200);
}

function startPractice(deckOverride = null) {
  if (!trainedIds.size) return;
  if (xfer && xfer.isListening()) xfer.stopListening();
  clearTimeout(nextCardTimer);

  const s = getSettings();
  timerMs = s.timerMs;

  deck = deckOverride ? [...deckOverride] : buildDeck();
  practiceRomaji = new Set(deck.map(c => c.r));
  nOk = nTot = 0;
  paused = scoring = false;
  lastHeard = null;
  lastHeardTime = 0;
  sessionResults = [];
  currentSessionId = null;
  streak = 0;
  recentResults = [];
  milestoneFlashActive = false;
  prScore.textContent = '0 / 0';
  prStats.textContent = '';
  prKana.textContent  = '?';
  prKana.className    = 'big';
  prFb.textContent    = '';
  prMic.className     = '';
  if (!cachedLabels || !cachedLabels.length) {
    const saved = JSON.parse(localStorage.getItem('kana-labels') || 'null');
    cachedLabels = (saved && saved.length) ? saved : xfer.wordLabels();
  }

  showScreen('prac');
  prTap.classList.remove('off');
}

// Called directly from tap overlay — guaranteed user gesture context.
// CONSTRAINT: xfer.listen() must stay synchronous inside this click handler.
prTap.addEventListener('click', async () => {
  if (xfer.isListening()) xfer.stopListening();

  prTap.classList.add('off');
  prMic.textContent = '●';
  prMic.className   = 'active';

  currentSessionId = await startSession();
  nextCard();

  let cbCount = 0;
  xfer.listen(result => {
    cbCount++;
    if (!cachedLabels) return;
    if (dbgOn) {
      const top = Array.from(result.scores)
        .map((s, i) => ({s, l: cachedLabels[i]}))
        .sort((a, b) => b.s - a.s)
        .slice(0, 5)
        .map(x => `${x.l}:${(x.s * 100).toFixed(0)}`)
        .join('  ');
      dbgEl.textContent = `[${cbCount}] ` + top;
    }

    if (scoring || paused) return;

    const maxIdx = result.scores.indexOf(Math.max(...result.scores));
    const heard  = cachedLabels[maxIdx];
    const conf   = result.scores[maxIdx];

    if (heard === '_background_' || conf < 0.80) return;

    // The Smart Leak Guard: Ignore the exact sound that finished the previous card for 1000ms
    if (heard === lastHeard && (Date.now() - lastHeardTime < 1000)) return;

    showResult(heard === cur.r, heard);
  }, {
    overlapFactor: 0.75,
    probabilityThreshold: 0,
    invokeCallbackOnNoiseAndUnknown: true,
  }).then(() => {
    prMic.textContent = '⬤';
  }).catch(err => {
    console.error('listen error:', err);
    prFb.textContent = 'mic error: ' + err.message;
    prMic.className  = '';
  });
});

// ── END SESSION / SUMMARY ─────────────────────────────────────────────────────
function endSession() {
  if (xfer && xfer.isListening()) xfer.stopListening();
  clearTimeout(nextCardTimer);
  cancelAnimationFrame(raf);
  showSummary();
}

function heatColor(acc) {
  if (acc === null) return '#141414';
  const r = Math.round(0x3a + (0x1a - 0x3a) * acc);
  const g = Math.round(0x10 + (0x3a - 0x10) * acc);
  const b = Math.round(0x10 + (0x1a - 0x10) * acc);
  return `rgb(${r},${g},${b})`;
}

function showSummary() {
  // Key stats by the actual character shown (tracks hira/kata separately)
  const stats = {};
  for (const e of sessionResults) {
    if (!stats[e.kana]) stats[e.kana] = {ok: 0, tot: 0, romaji: e.romaji};
    stats[e.kana].tot++;
    if (e.hit) stats[e.kana].ok++;
  }

  const pct      = nTot ? Math.round(nOk / nTot * 100) : 0;
  const hitTimes = sessionResults.filter(e => e.hit).map(e => e.ms);
  const avgMs    = hitTimes.length
    ? Math.round(hitTimes.reduce((a, b) => a + b, 0) / hitTimes.length)
    : 0;
  smStats.textContent = nTot
    ? `${nOk} / ${nTot}  ·  ${pct}%  ·  ${(avgMs / 1000).toFixed(1)}s avg`
    : 'no attempts';

  // Heatmap — separate rows for hiragana and katakana
  const cfg = getSettings();
  function heatRow(rowId, sounds, getChar, label) {
    let h = `<div class="heat-label">${label}</div>`;
    for (const s of sounds) {
      const ch  = getChar(s);
      const st  = stats[ch];
      const acc = st ? st.ok / st.tot : null;
      const bg  = heatColor(acc);
      const rLabel = s.alt ? s.r + ' / ' + s.alt.join(' / ') : s.r;
      const tip = st ? `${rLabel}: ${st.ok}/${st.tot}` : rLabel;
      h += `<div class="heat-cell" style="background:${bg}" title="${tip}">${ch}</div>`;
    }
    for (let i = sounds.length; i < 5; i++) h += '<div class="heat-cell" style="background:#0f0f0f"></div>';
    return h;
  }

  let html = '<div class="heat-grid">';
  for (const row of ROWS) {
    if (!trainedIds.has(row.id)) continue;
    if (cfg.showHiragana) html += heatRow(row.id, row.s, s => s.h, row.id);
    if (cfg.showKatakana) html += heatRow(row.id, row.s, s => s.k, cfg.showHiragana ? '' : row.id);
  }
  html += '</div>';
  smHeat.innerHTML = html;

  // ── WEAKEST 3 THIS SESSION ────────────────────────────────────────────────
  const smWeakest = document.getElementById('sm-weakest');
  smWeakest.innerHTML = '';
  const sessionEntries = Object.entries(stats)
    .filter(([, st]) => st.tot >= 1)
    .sort((a, b) => (a[1].ok / a[1].tot) - (b[1].ok / b[1].tot))
    .slice(0, 3);

  if (sessionEntries.length) {
    loadAllAttempts().then(allAttempts => {
      const ltMap = {};
      for (const a of allAttempts) {
        if (a.mode === 'flip') continue;
        if (!ltMap[a.kana]) ltMap[a.kana] = {ok: 0, tot: 0};
        ltMap[a.kana].tot++;
        if (a.hit) ltMap[a.kana].ok++;
      }
      let wHtml = '<div class="sm-weakest-list">';
      for (const [kanaChar, st] of sessionEntries) {
        const pct = Math.round(st.ok / st.tot * 100);
        const lt  = ltMap[kanaChar];
        const ltStr = (lt && lt.tot >= 3) ? ` · lifetime ${Math.round(lt.ok / lt.tot * 100)}%` : '';
        wHtml += `<div class="sm-weak-row">` +
          `<span class="sm-weak-romaji">${kanaChar} ${st.romaji}</span>` +
          `<span class="sm-weak-score">${st.ok}/${st.tot} (${pct}%${ltStr})</span></div>`;
      }
      wHtml += '</div>';
      smWeakest.innerHTML = wHtml;
    }).catch(() => {});
  }

  const btnAgain  = document.getElementById('btn-again');
  const btnSmHome = document.getElementById('btn-sm-home');
  if (quickTestMode) {
    btnAgain.textContent  = 'test again';
    btnSmHome.textContent = 'back to training';
  } else {
    btnAgain.textContent  = 'practice again';
    btnSmHome.textContent = 'home';
  }

  showScreen('summary');
}

document.getElementById('btn-end').addEventListener('click', endSession);

document.getElementById('btn-again').addEventListener('click', () => {
  if (quickTestMode && quickTestSounds) {
    startPractice(buildDeckFromSounds(quickTestSounds));
  } else {
    quickTestMode = false;
    startPractice();
  }
});

document.getElementById('btn-sm-home').addEventListener('click', () => {
  if (quickTestMode) {
    quickTestMode   = false;
    quickTestSounds = null;
    enterManage();
  } else {
    renderHome();
    showScreen('home');
  }
});

// ── PAUSE ─────────────────────────────────────────────────────────────────────
function togglePause() {
  paused = !paused;
  if (paused) {
    cancelAnimationFrame(raf);
    prKana.classList.add('dim');
    prFb.textContent = 'paused';
    prMic.className  = '';
  } else {
    prKana.classList.remove('dim');
    prFb.textContent = '';
    prMic.className  = 'active';
    if (!scoring) animateTimer();
  }
}

// ── KEYBOARD ──────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.code === 'Space')  { e.preventDefault(); togglePause(); }
  if (e.code === 'KeyD')   {
    dbgOn = !dbgOn;
    dbgEl.classList.toggle('on', dbgOn);
    if (dbgOn && !dbgEl.textContent) dbgEl.textContent = '[waiting for audio…]';
  }
  if (e.code === 'Escape') { endSession(); }
});
