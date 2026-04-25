'use strict';

// ── INIT ──────────────────────────────────────────────────────────────────────
(async () => {
  try {
    overlayMsg.textContent = 'loading base model…';
    loadBar.style.width = '20%';

    overlayMsg.textContent = 'requesting microphone…';
    try {
      const s = await navigator.mediaDevices.getUserMedia({audio: true});
      s.getTracks().forEach(t => t.stop());
    } catch {
      overlayMsg.textContent = 'microphone access denied — please allow and reload';
      return;
    }

    overlayMsg.textContent = 'loading base model…';
    base = speechCommands.create('BROWSER_FFT');
    await base.ensureModelLoaded();
    loadBar.style.width = '70%';

    xfer = base.createTransfer('kana-init');

    if (trainedIds.size > 0) {
      try {
        overlayMsg.textContent = 'loading saved model…';
        await xfer.load('indexeddb://kana-model');
        const saved = JSON.parse(localStorage.getItem('kana-labels') || 'null');
        cachedLabels = (saved && saved.length) ? saved : xfer.wordLabels();
        // Reconcile trainedIds from model labels in case they've drifted.
        const modelRomaji = new Set(cachedLabels.filter(l => l !== '_background_'));
        trainedIds.clear();
        for (const row of ROWS) {
          if (row.s.every(s => modelRomaji.has(s.r))) trainedIds.add(row.id);
        }
        saveMeta();
        loadBar.style.width = '100%';
      } catch {
        trainedIds.clear();
        saveMeta();
      }
    }

    loadBar.style.width = '100%';
    await sleep(150);
    overlayEl.classList.add('off');

    const hash = location.hash.slice(1); // 'kana', 'flip', or ''
    const defaultMode = await loadPref('default-mode', 'kana');
    updateDefaultBtns(defaultMode);
    const goFlip = hash === 'flip' || (hash !== 'kana' && defaultMode === 'flip');
    if (goFlip) enterFlipHome();
    else { renderHome(); showScreen('home'); }
  } catch (err) {
    overlayMsg.textContent = `error: ${err.message}`;
    loadBar.style.background = '#7a2020';
    console.error(err);
  }
})();
