'use strict';

// ── SETTINGS SCREEN ───────────────────────────────────────────────────────────
const setTimerInput = document.getElementById('set-timer');
const setHiraBtn    = document.getElementById('set-hira');
const setKataBtn    = document.getElementById('set-kata');

function openSettings() {
  const s = getSettings();
  setTimerInput.value = (s.timerMs / 1000).toFixed(1);
  applyToggleUI(setHiraBtn, s.showHiragana);
  applyToggleUI(setKataBtn, s.showKatakana);
}

function applyToggleUI(btn, on) {
  btn.textContent = on ? 'ON' : 'OFF';
  btn.classList.toggle('on', on);
  btn.classList.toggle('off-state', !on);
}

setTimerInput.addEventListener('change', () => {
  const val = Math.max(0.5, Math.min(8, parseFloat(setTimerInput.value) || 3));
  setTimerInput.value = val.toFixed(1);
  saveSettings({ timerMs: Math.round(val * 1000) });
});

setHiraBtn.addEventListener('click', () => {
  const s = getSettings();
  const next = !s.showHiragana;
  if (!next && !s.showKatakana) return; // can't turn both off
  saveSettings({ showHiragana: next });
  applyToggleUI(setHiraBtn, next);
});

setKataBtn.addEventListener('click', () => {
  const s = getSettings();
  const next = !s.showKatakana;
  if (!next && !s.showHiragana) return;
  saveSettings({ showKatakana: next });
  applyToggleUI(setKataBtn, next);
});

document.getElementById('btn-set-reset').addEventListener('click', () => {
  localStorage.removeItem('kana-settings');
  openSettings();
});

document.getElementById('btn-set-back').addEventListener('click', () => {
  renderHome();
  showScreen('home');
});
