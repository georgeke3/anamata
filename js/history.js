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

function sessionRowHtml(s, atts) {
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
  return `<div class="hist-session-row" data-id="${s.id}">` +
    `<span class="hist-sess-date"><span>${date}</span><small>${time}</small></span>` +
    `<span class="hist-sess-acc" style="color:${color}">${pct}%</span>` +
    `<span class="hist-sess-count">${countStr}</span>` +
    `<button class="hist-sess-del" title="Delete">✕</button></div>`;
}

function renderRecentSessions(sessions, attempts) {
  const el = document.getElementById('hist-sessions');
  if (!sessions.length) { el.innerHTML = '<div class="hist-empty">no sessions yet</div>'; return; }

  const bySession = {};
  for (const a of attempts) {
    (bySession[a.sessionId] ||= []).push(a);
  }

  const sorted  = [...sessions].sort((a, b) => b.startTs - a.startTs);
  const lbl     = document.getElementById('hist-sessions-lbl');
  lbl.innerHTML = sorted.length > 10
    ? `recent sessions <span class="hist-see-all">see all ${sorted.length} →</span>`
    : 'recent sessions';
  el.innerHTML  = sorted.slice(0, 10).map(s => sessionRowHtml(s, bySession[s.id] || [])).join('');
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
    return `<div class="hist-weak-row" data-kana-link="${st.kana}" data-kana-from="history">` +
      `<span class="hist-weak-char">${st.kana}</span>` +
      `<span class="hist-weak-romaji">${romaji}</span>` +
      `<div class="hist-weak-bar-wrap"><div class="hist-weak-bar" style="width:${pct}%"></div></div>` +
      `<span class="hist-weak-acc">${pct}%</span></div>`;
  }).join('');
}

// ── ALL SESSIONS SCREEN ───────────────────────────────────────────────────────
async function enterAllSessions() {
  showScreen('sessions');
  const el = document.getElementById('all-sessions-list');
  el.innerHTML = 'loading…';

  const [allAttempts, allSessions] = await Promise.all([loadAllAttempts(), loadAllSessions()]);
  const attempts = allAttempts.filter(a => a.mode === 'flip');
  const sessions = allSessions.filter(s => s.mode === 'flip');

  const bySession = {};
  for (const a of attempts) (bySession[a.sessionId] ||= []).push(a);

  const sorted = [...sessions].sort((a, b) => b.startTs - a.startTs);
  el.innerHTML = sorted.map(s => sessionRowHtml(s, bySession[s.id] || [])).join('') || '<div class="hist-empty">no sessions</div>';
}

// ── FULL WEAKEST SCREEN ───────────────────────────────────────────────────────
async function enterWeakest() {
  showScreen('weakest');
  const el = document.getElementById('wk-list');
  el.innerHTML = 'loading…';

  const attempts = (await loadAllAttempts()).filter(a => a.mode === 'flip');

  const byRomaji = {};
  for (const a of attempts) {
    if (!byRomaji[a.romaji]) byRomaji[a.romaji] = {ok: 0, tot: 0, kana: a.kana};
    byRomaji[a.romaji].tot++;
    if (a.hit) byRomaji[a.romaji].ok++;
  }

  const ranked = Object.entries(byRomaji)
    .filter(([, st]) => st.tot >= 1)
    .sort((a, b) => (a[1].ok / a[1].tot) - (b[1].ok / b[1].tot));

  if (!ranked.length) {
    el.innerHTML = '<div class="hist-empty">no data yet</div>';
    return;
  }

  el.innerHTML = ranked.map(([romaji, st]) => {
    const pct = Math.round(st.ok / st.tot * 100);
    return `<div class="hist-weak-row" data-kana-link="${st.kana}" data-kana-from="weakest">` +
      `<span class="hist-weak-char">${st.kana}</span>` +
      `<span class="hist-weak-romaji">${romaji}</span>` +
      `<div class="hist-weak-bar-wrap"><div class="hist-weak-bar" style="width:${pct}%"></div></div>` +
      `<span class="hist-weak-acc">${pct}%</span>` +
      `<span class="hist-weak-tot">${st.tot}</span></div>`;
  }).join('');
}

// ── WIRE UP ───────────────────────────────────────────────────────────────────
document.getElementById('btn-hist-back').addEventListener('click', () => enterFlipHome());

document.getElementById('btn-wk-back').addEventListener('click', () => enterHistory());
document.getElementById('btn-sessions-back').addEventListener('click', () => enterHistory());
document.getElementById('hist-sessions-lbl').addEventListener('click', e => {
  if (e.target.closest('.hist-see-all')) enterAllSessions();
});
document.getElementById('hist-weakest-lbl').addEventListener('click', e => {
  if (e.target.closest('.hist-see-all')) enterWeakest();
});

async function handleSessionDelete(btn) {
  if (!btn.classList.contains('confirming')) {
    // First tap: ask for confirmation
    document.querySelectorAll('.hist-sess-del.confirming').forEach(b => {
      b.classList.remove('confirming'); b.textContent = '✕';
    });
    btn.classList.add('confirming');
    btn.textContent = 'delete?';
    return;
  }
  // Second tap: confirmed
  const row = btn.closest('.hist-session-row');
  const id  = Number(row.dataset.id);
  await deleteSession(id);
  row.remove();
  const [allAttempts, allSessions] = await Promise.all([loadAllAttempts(), loadAllSessions()]);
  renderLifetimeStats(
    allAttempts.filter(a => a.mode === 'flip'),
    allSessions.filter(s => s.mode === 'flip')
  );
}

document.addEventListener('click', e => {
  // Cancel confirming state if clicking outside a del button
  if (!e.target.closest('.hist-sess-del')) {
    document.querySelectorAll('.hist-sess-del.confirming').forEach(b => {
      b.classList.remove('confirming'); b.textContent = '✕';
    });
  }
});

function wireSessionList(el, from) {
  el.addEventListener('click', async e => {
    const del = e.target.closest('.hist-sess-del');
    if (del) { await handleSessionDelete(del); return; }
    const row = e.target.closest('.hist-session-row');
    if (row && row.dataset.id) enterSessionDetail(+row.dataset.id, from || 'history');
  });
}

wireSessionList(document.getElementById('hist-sessions'), 'history');
wireSessionList(document.getElementById('all-sessions-list'), 'sessions');

document.getElementById('btn-hist-trends').addEventListener('click', () => enterTrends('history'));
