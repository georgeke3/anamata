'use strict';

// ── CHARACTER METADATA ────────────────────────────────────────────────────────

const CHAR_ROW_MAP = (() => {
  const map = {};
  const data = [
    ['a',  'あいうえお', 'アイウエオ'],
    ['ka', 'かきくけこ', 'カキクケコ'],
    ['sa', 'さしすせそ', 'サシスセソ'],
    ['ta', 'たちつてと', 'タチツテト'],
    ['na', 'なにぬねの', 'ナニヌネノ'],
    ['ha', 'はひふへほ', 'ハヒフヘホ'],
    ['ma', 'まみむめも', 'マミムメモ'],
    ['ya', 'やゆよ',     'ヤユヨ'],
    ['ra', 'らりるれろ', 'ラリルレロ'],
    ['wa', 'わをん',     'ワヲン'],
    ['ga', 'がぎぐげご', 'ガギグゲゴ'],
    ['za', 'ざじずぜぞ', 'ザジズゼゾ'],
    ['da', 'だぢづでど', 'ダヂヅデド'],
    ['ba', 'ばびぶべぼ', 'バビブベボ'],
    ['pa', 'ぱぴぷぺぽ', 'パピプペポ'],
  ];
  for (const [row, h, k] of data) {
    for (const c of h + k) if (c) map[c] = row;
  }
  return map;
})();

const TRD_DAKUTEN_ROWS = new Set(['ga','za','da','ba','pa']);
const TRD_BASE_ROWS    = new Set(['a','ka','sa','ta','na','ha','ma','ya','ra','wa']);

function charScript(kana) {
  const c = kana.codePointAt(0);
  return (c >= 0x3041 && c <= 0x309F) ? 'hira' : 'kata';
}

function charKind(kana) {
  const row = CHAR_ROW_MAP[kana[0]];
  if (!row) return 'base';
  if (kana.length > 1) return 'combo';
  return TRD_DAKUTEN_ROWS.has(row) ? 'dakuten' : 'base';
}

function charRow(kana) { return CHAR_ROW_MAP[kana[0]] || null; }

// ── SVG LINE CHART ────────────────────────────────────────────────────────────
// values: array of numbers or null (null = gap in line)

function svgLine(values, {w=320, h=65, color='#1e3a1e', dotColor, refLine, minVal, maxVal} = {}) {
  const valid = values.filter(v => v !== null && !isNaN(v));
  if (valid.length < 2) return '<div class="ts-empty">not enough data</div>';

  const lo  = minVal  ?? Math.min(...valid);
  const hi  = maxVal  ?? Math.max(...valid);
  const rng = hi === lo ? 1 : hi - lo;
  const px = 6, py = 6, iw = w - px * 2, ih = h - py * 2;
  const n  = values.length;

  function coord(i, v) {
    return [
      +(px + (n > 1 ? i / (n - 1) : 0.5) * iw).toFixed(1),
      +(py + ih - ((v - lo) / rng) * ih).toFixed(1),
    ];
  }

  let path = '';
  let gap  = true;
  for (let i = 0; i < n; i++) {
    const v = values[i];
    if (v === null || isNaN(v)) { gap = true; continue; }
    const [x, y] = coord(i, v);
    path += (gap ? 'M' : 'L') + x + ',' + y;
    gap = false;
  }

  const dots = values.map((v, i) => {
    if (v === null || isNaN(v)) return '';
    const [x, y] = coord(i, v);
    return `<circle cx="${x}" cy="${y}" r="2.5" fill="${dotColor || color}"/>`;
  }).join('');

  let ref = '';
  if (refLine !== undefined) {
    const ry = +(py + ih - ((refLine - lo) / rng) * ih).toFixed(1);
    if (ry > py && ry < py + ih)
      ref = `<line x1="${px}" y1="${ry}" x2="${w - px}" y2="${ry}" stroke="#1a2a1a" stroke-width="1" stroke-dasharray="3,3"/>`;
  }

  return `<div class="ts-chart"><svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" width="100%">` +
    ref +
    `<path d="${path}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>` +
    dots +
    `</svg></div>`;
}

// ── TIME BUCKETING ────────────────────────────────────────────────────────────

function isoDay(ts)   { return new Date(ts).toISOString().slice(0, 10); }
function isoMonth(ts) { return new Date(ts).toISOString().slice(0, 7);  }

function bucketAttempts(attempts, range) {
  const now    = Date.now();
  let cutoff   = 0;
  let bucketFn, makeBuckets;

  if (range === 'W') {
    cutoff    = now - 7 * 86400000;
    bucketFn  = a => isoDay(a.ts);
    makeBuckets = () => {
      const arr = [];
      for (let d = 6; d >= 0; d--) {
        const t = now - d * 86400000;
        arr.push({ key: isoDay(t), label: new Date(t).toLocaleDateString('en', {weekday: 'short'}), ok: 0, tot: 0, okMs: [], missMs: [] });
      }
      return arr;
    };
  } else if (range === 'M') {
    cutoff    = now - 30 * 86400000;
    bucketFn  = a => isoDay(a.ts);
    makeBuckets = () => {
      const arr = [];
      for (let d = 29; d >= 0; d--) {
        const t = now - d * 86400000;
        arr.push({ key: isoDay(t), label: d % 7 === 0 ? new Date(t).toLocaleDateString('en', {month: 'short', day: 'numeric'}) : '', ok: 0, tot: 0, okMs: [], missMs: [] });
      }
      return arr;
    };
  } else if (range === 'Y') {
    cutoff    = now - 365 * 86400000;
    bucketFn  = a => isoMonth(a.ts);
    makeBuckets = () => {
      const arr = [];
      for (let m = 11; m >= 0; m--) {
        const d = new Date(now); d.setDate(1); d.setMonth(d.getMonth() - m);
        arr.push({ key: isoMonth(d.getTime()), label: d.toLocaleDateString('en', {month: 'short'}), ok: 0, tot: 0, okMs: [], missMs: [] });
      }
      return arr;
    };
  } else {
    // ALL — monthly from first attempt to now
    if (!attempts.length) return [];
    const first = Math.min(...attempts.map(a => a.ts));
    const start = new Date(first); start.setDate(1); start.setHours(0, 0, 0, 0);
    bucketFn  = a => isoMonth(a.ts);
    makeBuckets = () => {
      const arr = [];
      const d = new Date(start.getTime());
      while (d.getTime() <= now) {
        arr.push({ key: isoMonth(d.getTime()), label: d.toLocaleDateString('en', {month: 'short', year: '2-digit'}), ok: 0, tot: 0, okMs: [], missMs: [] });
        d.setMonth(d.getMonth() + 1);
      }
      return arr;
    };
  }

  const filtered = cutoff > 0 ? attempts.filter(a => a.ts >= cutoff) : attempts;
  const buckets  = makeBuckets();
  const bMap     = {};
  for (const b of buckets) bMap[b.key] = b;

  for (const a of filtered) {
    const b = bMap[bucketFn(a)];
    if (!b) continue;
    b.tot++;
    if (a.hit) { b.ok++; if (a.ms > 0) b.okMs.push(a.ms); }
    else        { if (a.ms > 0) b.missMs.push(a.ms); }
  }

  return buckets;
}

// ── PER-KANA STATS ────────────────────────────────────────────────────────────

async function kdLoadStats(char) {
  const el = document.getElementById('kd-stats');
  if (!el) return;

  const [allAtt, allSess] = await Promise.all([loadAllAttempts(), loadAllSessions()]);
  const attempts = allAtt.filter(a => a.mode === 'flip' && a.kana === char);
  if (!attempts.length) return;

  const ok    = attempts.filter(a => a.hit).length;
  const tot   = attempts.length;
  const pct   = Math.round(ok / tot * 100);
  const okMs  = attempts.filter(a => a.hit  && a.ms > 0).map(a => a.ms);
  const miMs  = attempts.filter(a => !a.hit && a.ms > 0).map(a => a.ms);
  const avgOk = okMs.length ? Math.round(okMs.reduce((a, b) => a + b) / okMs.length) : 0;
  const avgMi = miMs.length ? Math.round(miMs.reduce((a, b) => a + b) / miMs.length) : 0;

  const sessMap = {};
  for (const s of allSess) sessMap[s.id] = s;

  const bySession = {};
  for (const a of attempts) (bySession[a.sessionId] ||= []).push(a);

  const pts = Object.entries(bySession)
    .map(([sid, atts]) => {
      const s = sessMap[+sid];
      if (!s) return null;
      const sok    = atts.filter(a => a.hit).length;
      const sokMs  = atts.filter(a => a.hit  && a.ms > 0).map(a => a.ms);
      const smiMs  = atts.filter(a => !a.hit && a.ms > 0).map(a => a.ms);
      return {
        ts:  s.startTs,
        acc: sok / atts.length,
        okT: sokMs.length ? sokMs.reduce((a, b) => a + b) / sokMs.length / 1000 : null,
        miT: smiMs.length ? smiMs.reduce((a, b) => a + b) / smiMs.length / 1000 : null,
        ok: sok, tot: atts.length,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.ts - b.ts)
    .slice(-30);

  let html = `<div class="kd-stats-sum">`;
  html += `<span class="kd-stat-acc">${ok} / ${tot} &nbsp; ${pct}%</span>`;
  if (avgOk) html += `<span class="kd-stat-t kd-stat-ok">ok ${(avgOk / 1000).toFixed(1)}s</span>`;
  if (avgMi) html += `<span class="kd-stat-t kd-stat-mi">miss ${(avgMi / 1000).toFixed(1)}s</span>`;
  html += `</div>`;

  if (pts.length >= 2) {
    const accVals = pts.map(p => p.acc);
    const okTs    = pts.map(p => p.okT);
    const miTs    = pts.map(p => p.miT);
    const allTs   = [...okTs, ...miTs].filter(v => v !== null);
    const maxT    = allTs.length ? Math.max(...allTs) : 0;

    html += `<div class="ts-lbl">accuracy per session</div>`;
    html += svgLine(accVals, { w: 300, h: 60, minVal: 0, maxVal: 1, refLine: 0.8, color: '#1e3a1e', dotColor: '#3a7a3a' });

    if (allTs.length >= 2) {
      html += `<div class="ts-lbl">response time per session · <span style="color:#3a7a3a">ok</span> <span style="color:#3c3c3c">/</span> <span style="color:#7a3a3a">miss</span></div>`;
      if (okTs.some(v => v !== null)) html += svgLine(okTs,  { w: 300, h: 60, minVal: 0, maxVal: maxT, color: '#1e3a1e', dotColor: '#3a7a3a' });
      if (miTs.some(v => v !== null)) html += svgLine(miTs,  { w: 300, h: 60, minVal: 0, maxVal: maxT, color: '#3a1414', dotColor: '#7a3a3a' });
    }
  }

  el.innerHTML = html;
}

// ── TRENDS SCREEN ─────────────────────────────────────────────────────────────

let trdScript = new Set(['hira', 'kata']);
let trdKind   = new Set(['base', 'dakuten', 'combo']);
let trdRows   = null;   // null = all base rows; otherwise Set of row IDs
let trdRange  = 'M';
let trdFrom   = 'history';

async function enterTrends(from) {
  trdFrom = from || 'history';
  showScreen('trends');
  renderTrdFilters();
  await refreshTrends();
}

function renderTrdFilters() {
  const f = document.getElementById('trd-filters');
  f.innerHTML = '';

  function pillRow(pairs, activeSet, onToggle) {
    const row = document.createElement('div');
    row.className = 'trd-filter-row';
    for (const [val, lbl] of pairs) {
      const btn = document.createElement('button');
      btn.className = 'btn trd-pill' + (activeSet.has(val) ? ' on' : '');
      btn.textContent = lbl;
      btn.addEventListener('click', () => onToggle(val, activeSet, btn));
      row.appendChild(btn);
    }
    f.appendChild(row);
  }

  function toggle(val, set, btn) {
    if (set.has(val)) {
      if (set.size > 1) set.delete(val);
    } else {
      set.add(val);
    }
    renderTrdFilters();
    refreshTrends();
  }

  pillRow([['hira', 'あ hira'], ['kata', 'ア kata']], trdScript, toggle);
  pillRow([['base', 'base'], ['dakuten', 'dakuten'], ['combo', 'combos']], trdKind, toggle);

  // Base row sub-filters (only when base kind is active)
  if (trdKind.has('base')) {
    const ids    = ['a','ka','sa','ta','na','ha','ma','ya','ra','wa'];
    const rowRow = document.createElement('div');
    rowRow.className = 'trd-filter-row';

    const allBtn = document.createElement('button');
    allBtn.className = 'btn trd-pill trd-pill-sm' + (trdRows === null ? ' on' : '');
    allBtn.textContent = 'all';
    allBtn.addEventListener('click', () => { trdRows = null; renderTrdFilters(); refreshTrends(); });
    rowRow.appendChild(allBtn);

    for (const id of ids) {
      const sel = trdRows === null || trdRows.has(id);
      const btn = document.createElement('button');
      btn.className = 'btn trd-pill trd-pill-sm' + (sel ? ' on' : '');
      btn.textContent = id;
      btn.addEventListener('click', () => {
        if (trdRows === null) trdRows = new Set(ids);
        if (trdRows.has(id)) {
          if (trdRows.size > 1) trdRows.delete(id);
        } else {
          trdRows.add(id);
          if (trdRows.size === ids.length) trdRows = null;
        }
        renderTrdFilters();
        refreshTrends();
      });
      rowRow.appendChild(btn);
    }
    f.appendChild(rowRow);
  }

  // Time range
  const rangeRow = document.createElement('div');
  rangeRow.className = 'trd-filter-row';
  for (const r of ['W', 'M', 'Y', 'ALL']) {
    const btn = document.createElement('button');
    btn.className = 'btn trd-pill' + (trdRange === r ? ' on' : '');
    btn.textContent = r;
    btn.addEventListener('click', () => { trdRange = r; renderTrdFilters(); refreshTrends(); });
    rangeRow.appendChild(btn);
  }
  f.appendChild(rangeRow);
}

async function refreshTrends() {
  const bodyEl = document.getElementById('trd-body');
  bodyEl.innerHTML = '<div class="ts-empty">loading…</div>';

  let attempts = (await loadAllAttempts()).filter(a => a.mode === 'flip');

  attempts = attempts.filter(a => {
    if (!trdScript.has(charScript(a.kana)))  return false;
    const kind = charKind(a.kana);
    if (!trdKind.has(kind))                  return false;
    if (kind === 'base' && trdRows !== null && !trdRows.has(charRow(a.kana))) return false;
    return true;
  });

  if (!attempts.length) {
    bodyEl.innerHTML = '<div class="ts-empty">no data for these filters</div>';
    return;
  }

  const buckets  = bucketAttempts(attempts, trdRange);
  const nonEmpty = buckets.filter(b => b.tot > 0);

  // Summary line
  const totOk  = attempts.filter(a => a.hit).length;
  const totAll = attempts.length;
  const pct    = Math.round(totOk / totAll * 100);
  const okMs   = attempts.filter(a => a.hit  && a.ms > 0).map(a => a.ms);
  const miMs   = attempts.filter(a => !a.hit && a.ms > 0).map(a => a.ms);
  const avgOk  = okMs.length ? (okMs.reduce((a, b) => a + b) / okMs.length / 1000).toFixed(1) : '—';
  const avgMi  = miMs.length ? (miMs.reduce((a, b) => a + b) / miMs.length / 1000).toFixed(1) : '—';

  let html = `<div class="trd-summary">${totOk.toLocaleString()} / ${totAll.toLocaleString()} &nbsp; ${pct}%<span class="trd-sum-t">ok ${avgOk}s · miss ${avgMi}s</span></div>`;

  if (nonEmpty.length < 2) {
    html += '<div class="ts-empty">not enough sessions to show trends — keep practicing!</div>';
    bodyEl.innerHTML = html;
    return;
  }

  // Accuracy chart
  const accVals = buckets.map(b => b.tot > 0 ? b.ok / b.tot : null);
  html += `<div class="ts-lbl">accuracy</div>`;
  html += svgLine(accVals, { w: 320, h: 70, minVal: 0, maxVal: 1, refLine: 0.8, color: '#1e3a1e', dotColor: '#3a7a3a' });

  // Response time chart — ok and miss as separate lines
  const okTVals   = buckets.map(b => b.okMs.length   ? b.okMs.reduce((a, c) => a + c)   / b.okMs.length   / 1000 : null);
  const missTVals = buckets.map(b => b.missMs.length  ? b.missMs.reduce((a, c) => a + c) / b.missMs.length / 1000 : null);
  const allTs     = [...okTVals, ...missTVals].filter(v => v !== null);

  if (allTs.length >= 2) {
    const maxT = Math.max(...allTs);
    html += `<div class="ts-lbl">response time (s) · <span style="color:#3a7a3a">ok</span> <span style="color:#3c3c3c">/</span> <span style="color:#7a3a3a">miss</span></div>`;
    if (okTVals.some(v => v !== null))   html += svgLine(okTVals,   { w: 320, h: 70, minVal: 0, maxVal: maxT, color: '#1e3a1e', dotColor: '#3a7a3a' });
    if (missTVals.some(v => v !== null)) html += svgLine(missTVals, { w: 320, h: 70, minVal: 0, maxVal: maxT, color: '#3a1414', dotColor: '#7a3a3a' });
  }

  // X-axis time labels (first + last + a few in between)
  const labels = buckets.map(b => b.label || '');
  const labeled = labels.map((l, i) => ({ l, i })).filter(x => x.l);
  if (labeled.length >= 2) {
    const step = Math.max(1, Math.floor(labeled.length / 4));
    const shown = new Set([0, labeled.length - 1]);
    for (let i = step; i < labeled.length - 1; i += step) shown.add(i);
    html += `<div class="ts-xlabels">${labeled.filter((_, j) => shown.has(j)).map(x => `<span>${x.l}</span>`).join('')}</div>`;
  }

  bodyEl.innerHTML = html;
}

// ── SESSION DETAIL ────────────────────────────────────────────────────────────

let sdFrom = 'history';

async function enterSessionDetail(sessionId, from) {
  sdFrom = from || 'history';
  showScreen('session-detail');
  const el = document.getElementById('sd-body');
  el.innerHTML = '<div class="ts-empty">loading…</div>';

  const [allAtt, allSess] = await Promise.all([loadAllAttempts(), loadAllSessions()]);
  const session  = allSess.find(s => s.id === sessionId);
  const attempts = allAtt.filter(a => a.sessionId === sessionId && a.mode === 'flip');

  if (!session || !attempts.length) {
    el.innerHTML = '<div class="ts-empty">no data</div>';
    return;
  }

  const sorted = [...attempts].sort((a, b) => a.ts - b.ts);
  const ok     = sorted.filter(a => a.hit).length;
  const tot    = sorted.length;
  const pct    = Math.round(ok / tot * 100);
  const dt     = new Date(session.startTs);
  const msTimes = attempts.map(a => a.ms).filter(m => m > 0);
  const avgMs   = msTimes.length ? Math.round(msTimes.reduce((a, b) => a + b) / msTimes.length) : 0;
  const color   = pct >= 80 ? '#3a7a3a' : pct >= 60 ? '#7a6a20' : '#7a3a3a';

  let html = `<div class="sd-header">`;
  html += `<div class="sd-date">${dt.toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}<small>${dt.toLocaleTimeString(undefined, {hour: 'numeric', minute: '2-digit'})}</small></div>`;
  html += `<div class="sd-acc" style="color:${color}">${ok} / ${tot} &nbsp; ${pct}%`;
  if (avgMs) html += `<span class="sd-avg-time">${(avgMs / 1000).toFixed(1)}s avg</span>`;
  html += `</div></div>`;

  // Attempt sequence strip
  html += `<div class="ts-lbl">sequence</div>`;
  html += `<div class="sd-seq">`;
  for (const a of sorted) {
    html += `<div class="sd-tile ${a.hit ? 'sd-ok' : 'sd-err'}" title="${a.romaji}">${a.kana}</div>`;
  }
  html += `</div>`;

  // Rolling accuracy sparkline (running avg)
  if (sorted.length >= 4) {
    const cumAcc = sorted.map((_, i) => {
      const s = sorted.slice(0, i + 1);
      return s.filter(a => a.hit).length / s.length;
    });
    html += `<div class="ts-lbl">rolling accuracy</div>`;
    html += svgLine(cumAcc, { w: 320, h: 60, minVal: 0, maxVal: 1, refLine: 0.8, color: '#1e3a1e', dotColor: '#3a7a3a' });
  }

  // Kana breakdown, worst first
  html += `<div class="ts-lbl">kana · weakest first</div>`;
  const byKana = {};
  for (const a of sorted) {
    if (!byKana[a.kana]) byKana[a.kana] = { kana: a.kana, romaji: a.romaji, ok: 0, tot: 0, okMs: [], miMs: [] };
    byKana[a.kana].tot++;
    if (a.hit) { byKana[a.kana].ok++; if (a.ms > 0) byKana[a.kana].okMs.push(a.ms); }
    else        { if (a.ms > 0) byKana[a.kana].miMs.push(a.ms); }
  }

  const ranked = Object.values(byKana).sort((a, b) => (a.ok / a.tot) - (b.ok / b.tot));
  html += `<div class="sd-kana-list">`;
  for (const k of ranked) {
    const p       = Math.round(k.ok / k.tot * 100);
    const kColor  = p >= 80 ? '#2a5a2a' : p >= 60 ? '#5a5a20' : '#6a2a2a';
    const avgOkT  = k.okMs.length ? (k.okMs.reduce((a, b) => a + b) / k.okMs.length / 1000).toFixed(1) : '';
    const avgMiT  = k.miMs.length ? (k.miMs.reduce((a, b) => a + b) / k.miMs.length / 1000).toFixed(1) : '';
    const times   = [avgOkT ? `ok ${avgOkT}s` : '', avgMiT ? `miss ${avgMiT}s` : ''].filter(Boolean).join(' · ');

    html += `<div class="sd-kana-row" data-kana-link="${k.kana}" data-kana-from="session-detail">`;
    html += `<span class="sd-kana-char">${k.kana}</span>`;
    html += `<span class="sd-kana-romaji">${k.romaji}</span>`;
    html += `<div class="hist-weak-bar-wrap"><div class="hist-weak-bar" style="width:${p}%"></div></div>`;
    html += `<span class="sd-kana-pct" style="color:${kColor}">${k.ok}/${k.tot}</span>`;
    if (times) html += `<span class="sd-kana-times">${times}</span>`;
    html += `</div>`;
  }
  html += `</div>`;

  el.innerHTML = html;
}

// ── WIRE UP ───────────────────────────────────────────────────────────────────

document.getElementById('btn-trd-back').addEventListener('click', () => enterHistory());
document.getElementById('btn-sd-back').addEventListener('click', () => {
  if (sdFrom === 'sessions') enterAllSessions();
  else enterHistory();
});
