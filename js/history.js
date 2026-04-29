'use strict';

// ── HISTORY SCREEN ────────────────────────────────────────────────────────────

async function enterHistory() {
  showScreen('history');

  document.getElementById('hist-lifetime').textContent = 'loading…';
  document.getElementById('hist-sessions').innerHTML   = '';
  document.getElementById('hist-weakest').innerHTML    = '';

  const [allAttempts, allSessions] = await Promise.all([loadAllAttempts(), loadAllSessions()]);

  const attempts = allAttempts.filter(a => a.mode === 'flip');
  const sessions = allSessions.filter(s => s.mode === 'flip');

  renderLifetimeStats(attempts, sessions);
  renderRecentSessions(sessions, attempts);
  renderWeakestKana(attempts);
}

function renderLifetimeStats(attempts, sessions) {
  const el = document.getElementById('hist-lifetime');
  if (!attempts.length) { el.textContent = 'no history yet'; return; }
  const correct = attempts.filter(a => a.hit).length;
  const pct     = Math.round(correct / attempts.length * 100);
  el.textContent =
    `${sessions.length} sessions  ·  ${correct.toLocaleString()} / ${attempts.length.toLocaleString()}  ·  ${pct}%`;
}

function renderRecentSessions(sessions, attempts) {
  const el = document.getElementById('hist-sessions');
  if (!sessions.length) { el.innerHTML = '<div class="hist-empty">no sessions yet</div>'; return; }

  const bySession = {};
  for (const a of attempts) {
    (bySession[a.sessionId] ||= []).push(a);
  }

  const sorted = [...sessions].sort((a, b) => b.startTs - a.startTs).slice(0, 10);
  el.innerHTML = sorted.map(s => {
    const atts = bySession[s.id] || [];
    if (!atts.length) return '';
    const ok    = atts.filter(a => a.hit).length;
    const pct   = Math.round(ok / atts.length * 100);
    const dt    = new Date(s.startTs);
    const date  = dt.toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'});
    const time  = dt.toLocaleTimeString(undefined, {hour:'numeric', minute:'2-digit', timeZoneName:'short'});
    const color = pct >= 80 ? '#3a7a3a' : pct >= 60 ? '#6a5a20' : '#6a2a2a';
    const msTimes = atts.map(a => a.ms).filter(ms => ms > 0);
    const avgMs   = msTimes.length ? Math.round(msTimes.reduce((a, b) => a + b, 0) / msTimes.length) : 0;
    const countStr = `${atts.length} cards${avgMs ? ' · ' + (avgMs / 1000).toFixed(1) + 's avg' : ''}`;
    return `<div class="hist-session-row">` +
      `<span class="hist-sess-date"><span>${date}</span><small>${time}</small></span>` +
      `<span class="hist-sess-acc" style="color:${color}">${pct}%</span>` +
      `<span class="hist-sess-count">${countStr}</span></div>`;
  }).join('');
}

function renderWeakestKana(attempts) {
  const el = document.getElementById('hist-weakest');
  if (!attempts.length) { el.innerHTML = ''; return; }

  const byRomaji = {};
  for (const a of attempts) {
    if (!byRomaji[a.romaji]) byRomaji[a.romaji] = {ok: 0, tot: 0, kana: a.kana};
    byRomaji[a.romaji].tot++;
    if (a.hit) byRomaji[a.romaji].ok++;
  }

  const ranked = Object.entries(byRomaji)
    .filter(([, st]) => st.tot >= 3)
    .sort((a, b) => (a[1].ok / a[1].tot) - (b[1].ok / b[1].tot))
    .slice(0, 8);

  if (!ranked.length) {
    el.innerHTML = '<div class="hist-empty">practice more to see trends</div>';
    return;
  }

  el.innerHTML = ranked.map(([romaji, st]) => {
    const pct = Math.round(st.ok / st.tot * 100);
    return `<div class="hist-weak-row">` +
      `<span class="hist-weak-char">${st.kana}</span>` +
      `<span class="hist-weak-romaji">${romaji}</span>` +
      `<div class="hist-weak-bar-wrap"><div class="hist-weak-bar" style="width:${pct}%"></div></div>` +
      `<span class="hist-weak-acc">${pct}%</span></div>`;
  }).join('');
}

// ── WIRE UP ───────────────────────────────────────────────────────────────────
document.getElementById('btn-hist-back').addEventListener('click', () => enterFlipHome());
