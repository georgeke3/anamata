'use strict';

// ── MANAGE TRAINING ───────────────────────────────────────────────────────────
async function loadRomajiAccuracy() {
  try {
    const db = await histDb();
    const all = await new Promise((res, rej) => {
      const tx  = db.transaction('attempts', 'readonly');
      const req = tx.objectStore('attempts').getAll();
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
    const acc = {};
    for (const a of all) {
      if (!acc[a.romaji]) acc[a.romaji] = {ok: 0, tot: 0};
      acc[a.romaji].tot++;
      if (a.hit) acc[a.romaji].ok++;
    }
    return acc;
  } catch { return {}; }
}

async function enterManage() {
  mngGrid.innerHTML = '';
  mngNotice.style.display = 'none';
  retrainSounds.clear();
  btnMngRetrain.disabled     = true;
  btnMngRetrain.textContent  = 'retrain';
  btnMngQuicktest.disabled   = true;
  btnMngQuicktest.textContent = 'quick test';
  showScreen('manage');

  const [acc, hasExamples] = await Promise.all([
    loadRomajiAccuracy(),
    hasAnyKanaExamples(),
  ]);

  renderManageGrid(acc, hasExamples);

  btnMngSilence.disabled = !(hasExamples && trainedIds.size > 0);

  if (!hasExamples && trainedIds.size > 0) {
    mngNotice.textContent = 'do a full recalibration first to enable per-kana retraining';
    mngNotice.style.display = '';
    btnMngRetrain.disabled   = true;
    btnMngQuicktest.disabled = true;
  }
}

function renderManageGrid(acc, hasExamples) {
  mngGrid.innerHTML = '';
  for (const row of ROWS) {
    const trained = trainedIds.has(row.id);
    const rowEl = document.createElement('div');
    rowEl.className = 'mng-row';

    const lbl = document.createElement('div');
    lbl.className = 'mng-row-lbl';
    lbl.textContent = row.id;
    rowEl.appendChild(lbl);

    const cells = document.createElement('div');
    cells.className = 'mng-cells';

    if (trained) {
      for (const sound of row.s) {
        const cell = document.createElement('div');
        cell.className = 'kana-cell';
        cell.dataset.romaji = sound.r;

        const charEl = document.createElement('div');
        charEl.className = 'kana-char';
        charEl.textContent = sound.h;
        cell.appendChild(charEl);

        const accEl = document.createElement('div');
        accEl.className = 'kana-acc';
        const st = acc[sound.r];
        if (st && st.tot > 0) {
          const pct = Math.round(st.ok / st.tot * 100);
          accEl.textContent = pct + '%';
          accEl.classList.add(pct >= 80 ? 'acc-hi' : pct >= 60 ? 'acc-mid' : 'acc-low');
        } else {
          accEl.textContent = '—';
        }
        cell.appendChild(accEl);

        if (!hasExamples) cell.classList.add('kana-untrained');

        cell.addEventListener('click', () => {
          if (!hasExamples) return;
          const r = sound.r;
          if (retrainSounds.has(r)) {
            retrainSounds.delete(r);
            cell.classList.remove('kana-sel');
          } else {
            retrainSounds.add(r);
            cell.classList.add('kana-sel');
          }
          btnMngRetrain.disabled     = retrainSounds.size === 0;
          btnMngRetrain.textContent  = retrainSounds.size ? `retrain (${retrainSounds.size})` : 'retrain';
          btnMngQuicktest.disabled   = retrainSounds.size === 0;
          btnMngQuicktest.textContent = retrainSounds.size ? `quick test (${retrainSounds.size})` : 'quick test';
        });

        cells.appendChild(cell);
      }
    } else {
      // Untrained row: show greyed kana + Add button
      for (const sound of row.s) {
        const cell = document.createElement('div');
        cell.className = 'kana-cell kana-untrained';
        const charEl = document.createElement('div');
        charEl.className = 'kana-char';
        charEl.textContent = sound.h;
        cell.appendChild(charEl);
        cells.appendChild(cell);
      }
      const addBtn = document.createElement('button');
      addBtn.className = 'btn mng-add';
      addBtn.textContent = '+ add';
      addBtn.addEventListener('click', () => {
        startCalibration([row.id]).catch(err => {
          console.error('Calibration error:', err);
          calSt.textContent = 'error: ' + err.message;
        });
      });
      cells.appendChild(addBtn);
    }

    rowEl.appendChild(cells);
    mngGrid.appendChild(rowEl);
  }
}

async function startRetrain() {
  if (retrainSounds.size === 0) return;

  const allSounds      = ROWS.flatMap(r => r.s);
  const selectedSounds = allSounds.filter(s => retrainSounds.has(s.r));

  showScreen('cal');
  calChar.textContent = '…';
  calChar.style.color = '#e8e8e8';
  calRom.textContent  = '';
  calSt.textContent   = 'initializing…';
  calDots.innerHTML   = '';
  calTitle.textContent = 'RETRAIN: ' + selectedSounds.map(s => s.h).join('  ');

  if (xfer && xfer.isListening()) xfer.stopListening();

  xfer = base.createTransfer('kana-' + Date.now());
  cachedLabels = null;
  Object.keys(sampleCounts).forEach(k => delete sampleCounts[k]);

  // Load background silence
  calSt.textContent = 'loading saved silence…';
  const savedBg = await loadBgExamples();
  if (savedBg) {
    xfer.loadExamples(savedBg, false);
  } else {
    calSt.textContent = 'no saved silence — collecting…';
    setDots(N_BG);
    await sleep(800);
    for (let i = 0; i < N_BG; i++) {
      markDot(i, 'cur');
      await xfer.collectExample('_background_');
      markDot(i, 'on');
      await sleep(80);
    }
    await saveBgExamples(xfer.serializeExamples('_background_'));
  }

  // Load saved examples for all NON-selected kana the model already knows.
  // Use cachedLabels (not trainedIds) as the source of truth — it reflects what
  // the saved model's output layer was actually trained with.
  calSt.textContent = 'loading existing examples…';
  const modelKanaLabels = (cachedLabels || []).filter(l => l !== '_background_');
  const nonSelected = modelKanaLabels
    .map(r => allSounds.find(s => s.r === r))
    .filter(s => s && !retrainSounds.has(s.r));
  const missingSounds = [];
  for (const sound of nonSelected) {
    const buf = await loadKanaExample(sound.r);
    if (buf) {
      try { xfer.loadExamples(buf, false); }
      catch (e) { console.warn('load example failed', sound.r, e); missingSounds.push(sound); }
    } else {
      missingSounds.push(sound);
    }
  }

  // If any non-selected sounds are missing examples, include them in re-recording
  const toRecord = [...selectedSounds, ...missingSounds];
  if (missingSounds.length > 0) {
    calTitle.textContent = 'RETRAIN: ' + toRecord.map(s => s.h).join('  ');
  }

  // Collect new examples for selected kana (+ any missing ones)
  calSt.textContent = 'say each sound as it appears';
  await sleep(600);
  await collectSoundSamples(toRecord);

  calSt.textContent = 'saving examples…';
  await saveKanaExamplesFor(toRecord);

  calSt.textContent = 'all done — training…';
  await sleep(300);
  await runTraining([...trainedIds], true);
}

async function startSilenceRetrain() {
  showScreen('cal');
  calChar.textContent = '—';
  calChar.style.color = '#333';
  calRom.textContent  = '';
  calSt.textContent   = 'initializing…';
  calDots.innerHTML   = '';
  calTitle.textContent = 'RETRAIN SILENCE';

  if (xfer && xfer.isListening()) xfer.stopListening();

  xfer = base.createTransfer('kana-' + Date.now());
  cachedLabels = null;
  Object.keys(sampleCounts).forEach(k => delete sampleCounts[k]);

  // Collect fresh silence
  setDots(N_BG);
  calSt.textContent = 'stay completely silent';
  await sleep(800);
  for (let i = 0; i < N_BG; i++) {
    markDot(i, 'cur');
    await xfer.collectExample('_background_');
    markDot(i, 'on');
    await sleep(80);
  }
  calSt.textContent = 'saving silence…';
  await saveBgExamples(xfer.serializeExamples('_background_'));

  // Load all saved kana examples
  calSt.textContent = 'loading kana examples…';
  const allSounds = ROWS.flatMap(r => r.s);
  const trainedSounds = allSounds.filter(s =>
    trainedIds.has(ROWS.find(row => row.s.some(ss => ss.r === s.r))?.id)
  );
  for (const sound of trainedSounds) {
    const buf = await loadKanaExample(sound.r);
    if (buf) {
      try { xfer.loadExamples(buf, false); }
      catch (e) { console.warn('load example failed', sound.r, e); }
    }
  }

  calSt.textContent = 'training…';
  await sleep(300);
  await runTraining([...trainedIds], true);
}

function buildDeckFromSounds(romajiSet, limit = 20) {
  const cards = buildDeck(romajiSet);
  if (cards.length === 0) return [];
  const result = [];
  while (result.length < limit) {
    result.push(...shuffle([...cards]));
  }
  return result.slice(0, limit);
}

function startQuickTest() {
  if (retrainSounds.size === 0) return;
  quickTestSounds = new Set(retrainSounds);
  quickTestMode = true;
  startPractice(buildDeckFromSounds(quickTestSounds));
}

const btnMngSilence = document.getElementById('btn-mng-silence');

btnMngRetrain.addEventListener('click', () => {
  startRetrain().catch(err => {
    console.error('Retrain error:', err);
    calSt.textContent = 'error: ' + err.message;
  });
});
btnMngQuicktest.addEventListener('click', startQuickTest);
btnMngSilence.addEventListener('click', () => {
  startSilenceRetrain().catch(err => {
    console.error('Silence retrain error:', err);
    calSt.textContent = 'error: ' + err.message;
  });
});
document.getElementById('btn-mng-back').addEventListener('click', () => {
  renderHome();
  showScreen('home');
});
