'use strict';

const overlayEl = document.getElementById('overlay');

function showScreen(id) {
  const target = document.getElementById('s-' + id);
  if (!target) return;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  target.classList.add('on');
}

function renderHome() {}
