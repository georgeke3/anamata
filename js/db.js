'use strict';

// ── SESSION HISTORY ───────────────────────────────────────────────────────────
function histDb() {
  return new Promise((res, rej) => {
    const req = indexedDB.open('kana-history', 2);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (e.oldVersion < 1) {
        const sess = db.createObjectStore('sessions', {keyPath: 'id', autoIncrement: true});
        sess.createIndex('startTs', 'startTs');
        const att = db.createObjectStore('attempts', {keyPath: 'id', autoIncrement: true});
        att.createIndex('sessionId', 'sessionId');
        att.createIndex('ts', 'ts');
      }
      if (e.oldVersion < 2) {
        db.createObjectStore('prefs');
      }
    };
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
}

async function savePref(key, val) {
  const db = await histDb();
  return new Promise((res, rej) => {
    const tx = db.transaction('prefs', 'readwrite');
    tx.objectStore('prefs').put(val, key);
    tx.oncomplete = res; tx.onerror = e => rej(e.target.error);
  });
}

async function loadPref(key, defaultVal = null) {
  try {
    const db = await histDb();
    return new Promise((res, rej) => {
      const tx  = db.transaction('prefs', 'readonly');
      const req = tx.objectStore('prefs').get(key);
      req.onsuccess = e => res(e.target.result !== undefined ? e.target.result : defaultVal);
      req.onerror   = e => rej(e.target.error);
    });
  } catch { return defaultVal; }
}

async function insertSession(row) {
  const db = await histDb();
  return new Promise((res, rej) => {
    const tx  = db.transaction('sessions', 'readwrite');
    const req = tx.objectStore('sessions').add(row);
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
}

async function updateSessionLoc(id, lat, lng) {
  try {
    const db = await histDb();
    const tx    = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    const req   = store.get(id);
    req.onsuccess = e => {
      const row = e.target.result;
      if (row) { row.lat = lat; row.lng = lng; store.put(row); }
    };
  } catch(e) { console.warn('updateSessionLoc failed', e); }
}

function saveAttempt(a) {
  histDb().then(db => {
    const tx = db.transaction('attempts', 'readwrite');
    tx.objectStore('attempts').add(a);
  }).catch(e => console.warn('history write failed', e));
}

async function startFlipSession(selIds, flipSettings) {
  const row = {
    startTs:     Date.now(),
    tz:          Intl.DateTimeFormat().resolvedOptions().timeZone,
    practiceSet: [...selIds],
    settings:    JSON.stringify(flipSettings),
    mode:        'flip',
    lat:         null,
    lng:         null,
  };
  const id = await insertSession(row);
  navigator.geolocation?.getCurrentPosition(
    p => updateSessionLoc(id, p.coords.latitude, p.coords.longitude),
    () => {}
  );
  return id;
}

async function loadAllAttempts() {
  try {
    const db = await histDb();
    return new Promise((res, rej) => {
      const tx  = db.transaction('attempts', 'readonly');
      const req = tx.objectStore('attempts').getAll();
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  } catch { return []; }
}

async function loadAllSessions() {
  try {
    const db = await histDb();
    return new Promise((res, rej) => {
      const tx  = db.transaction('sessions', 'readonly');
      const req = tx.objectStore('sessions').getAll();
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  } catch { return []; }
}
