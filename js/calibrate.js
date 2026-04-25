'use strict';

// ── CALIBRATION ───────────────────────────────────────────────────────────────
const N_SAMPLES = 5;
const N_BG      = 8;
const EPOCHS    = 30;

const sampleCounts = {};
function countFor(r) { return sampleCounts[r] || 0; }
function bumpCount(r) { sampleCounts[r] = (sampleCounts[r] || 0) + 1; }

function setDots(n, filled = 0) {
  calDots.innerHTML = Array.from({length: n}, (_, i) =>
    `<div class="dot${i < filled ? ' on' : ''}"></div>`
  ).join('');
}

function markDot(i, cls) {
  const d = calDots.children[i];
  if (d) d.className = 'dot ' + cls;
}

async function startCalibration(rowIds) {
  showScreen('cal');
  calChar.textContent = '…';
  calChar.style.color = '#e8e8e8';
  calRom.textContent  = '';
  calSt.textContent   = 'initializing…';
  calDots.innerHTML   = '';

  if (xfer && xfer.isListening()) xfer.stopListening();

  const prevLabels = cachedLabels; // capture before nulling
  xfer = base.createTransfer('kana-' + Date.now());
  cachedLabels = null;
  Object.keys(sampleCounts).forEach(k => delete sampleCounts[k]);

  const rows   = ROWS.filter(r => rowIds.includes(r.id));
  const sounds = rows.flatMap(r => r.s);
  calTitle.textContent = rows.map(r => r.lbl).join(' + ');

  // 1. Background silence
  calChar.textContent = '—';
  calChar.style.color = '#333';
  calRom.textContent  = '';
  calDots.innerHTML   = '';

  const savedBg = await loadBgExamples();
  if (savedBg) {
    xfer.loadExamples(savedBg, false);
  } else {
    setDots(N_BG);
    calSt.textContent = 'step 1 / 2 — stay completely silent';
    await sleep(1000);
    for (let i = 0; i < N_BG; i++) {
      markDot(i, 'cur');
      await xfer.collectExample('_background_');
      markDot(i, 'on');
      await sleep(80);
    }
    calSt.textContent = '✓ silence captured — saving…';
    await saveBgExamples(xfer.serializeExamples('_background_'));
    calSt.textContent = '✓ silence saved';
    await sleep(400);
  }

  // 2. Load existing examples for already-trained kana (not in this calibration)
  const allSounds = ROWS.flatMap(r => r.s);
  const newRomaji = new Set(sounds.map(s => s.r));
  const existingLabels = (prevLabels || []).filter(l => l !== '_background_');
  const existingSounds = existingLabels
    .map(r => allSounds.find(s => s.r === r))
    .filter(s => s && !newRomaji.has(s.r));
  if (existingSounds.length > 0) {
    calSt.textContent = 'loading existing examples…';
    for (const sound of existingSounds) {
      const buf = await loadKanaExample(sound.r);
      if (buf) {
        try { xfer.loadExamples(buf, false); }
        catch (e) { console.warn('load example failed', sound.r, e); }
      }
    }
  }

  // 3. Kana — interleaved rounds
  calSt.textContent = 'step 2 / 2 — say each sound as it appears';
  await sleep(600);
  await collectSoundSamples(sounds);

  calSt.textContent = 'saving examples…';
  await saveKanaExamplesFor(sounds);

  calSt.textContent = 'all done — training…';
  await sleep(300);
  await runTraining(rowIds);
}

// Shared inner loop: collect N_SAMPLES for each sound in random interleaved order
async function collectSoundSamples(sounds) {
  const sequence = [];
  for (let round = 0; round < N_SAMPLES; round++) {
    sequence.push(...shuffle([...sounds]));
  }
  for (const sound of sequence) {
    calChar.textContent = sound.h;
    calChar.style.color = '#888';
    calRom.textContent  = sound.r;
    setDots(N_SAMPLES, countFor(sound.r));
    await sleep(180);
    calChar.style.color = '#e8e8e8';
    await xfer.collectExample(sound.r);
    calChar.style.color = '#4caf50';
    bumpCount(sound.r);
    setDots(N_SAMPLES, countFor(sound.r));
    await sleep(100);
  }
}

async function runTraining(rowIds, returnToManage = false) {
  showScreen('train');
  tFill.style.width = '0%';
  tSt.textContent = 'training…';

  await xfer.train({
    epochs: EPOCHS,
    callback: {
      onEpochEnd: (ep, logs) => {
        tFill.style.width = ((ep + 1) / EPOCHS * 100) + '%';
        const acc = logs.acc != null ? (logs.acc * 100).toFixed(0) + '%' : '';
        tSt.textContent = `epoch ${ep + 1} / ${EPOCHS}  ${acc}`;
      }
    }
  });

  await xfer.save('indexeddb://kana-model');
  cachedLabels = xfer.wordLabels();
  localStorage.setItem('kana-labels', JSON.stringify(cachedLabels));
  // Derive trainedIds from the model's actual labels — single source of truth.
  const modelRomaji = new Set(cachedLabels.filter(l => l !== '_background_'));
  trainedIds.clear();
  for (const row of ROWS) {
    if (row.s.every(s => modelRomaji.has(s.r))) trainedIds.add(row.id);
  }
  saveMeta();

  tSt.textContent = 'done ✓';
  await sleep(800);
  if (returnToManage) {
    enterManage();
  } else {
    renderHome();
    showScreen('home');
  }
}

document.getElementById('btn-cancel').addEventListener('click', () => {
  renderHome();
  showScreen('home');
});
