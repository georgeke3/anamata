'use strict';

const overlayEl = document.getElementById('overlay');

function showScreen(id) {
  const target = document.getElementById('s-' + id);
  if (!target) return;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  target.classList.add('on');
}

function renderHome() {}

// ── EDGE SWIPE BACK ───────────────────────────────────────────────────────────
// Any screen whose back button has data-swipe-back gets a right-swipe-from-left-edge gesture.
let _sx = 0, _sy = 0, _swipeOn = false;
document.addEventListener('touchstart', e => {
  const t = e.touches[0];
  _swipeOn = t.clientX < window.innerWidth * 0.22;
  _sx = t.clientX; _sy = t.clientY;
}, {passive: true});
document.addEventListener('touchend', e => {
  if (!_swipeOn) return;
  const t  = e.changedTouches[0];
  const dx = t.clientX - _sx;
  const dy = Math.abs(t.clientY - _sy);
  if (dx > 55 && dy < dx * 0.55) {
    const btn = document.querySelector('.screen.on [data-swipe-back]');
    if (btn) btn.click();
  }
  _swipeOn = false;
}, {passive: true});
