'use strict';

const KD_ROWS = [
  {lbl:'a',  h:['あ','い','う','え','お'],  k:['ア','イ','ウ','エ','オ']},
  {lbl:'ka', h:['か','き','く','け','こ'],  k:['カ','キ','ク','ケ','コ']},
  {lbl:'sa', h:['さ','し','す','せ','そ'],  k:['サ','シ','ス','セ','ソ']},
  {lbl:'ta', h:['た','ち','つ','て','と'],  k:['タ','チ','ツ','テ','ト']},
  {lbl:'na', h:['な','に','ぬ','ね','の'],  k:['ナ','ニ','ヌ','ネ','ノ']},
  {lbl:'ha', h:['は','ひ','ふ','へ','ほ'],  k:['ハ','ヒ','フ','ヘ','ホ']},
  {lbl:'ma', h:['ま','み','む','め','も'],  k:['マ','ミ','ム','メ','モ']},
  {lbl:'ya', h:['や','','ゆ','','よ'],      k:['ヤ','','ユ','','ヨ']},
  {lbl:'ra', h:['ら','り','る','れ','ろ'],  k:['ラ','リ','ル','レ','ロ']},
  {lbl:'wa', h:['わ','','','','を'],        k:['ワ','','','','ヲ']},
  {lbl:'n',  h:['ん','','','',''],          k:['ン','','','','']},
  {lbl:'ga', h:['が','ぎ','ぐ','げ','ご'],  k:['ガ','ギ','グ','ゲ','ゴ']},
  {lbl:'za', h:['ざ','じ','ず','ぜ','ぞ'],  k:['ザ','ジ','ズ','ゼ','ゾ']},
  {lbl:'da', h:['だ','ぢ','づ','で','ど'],  k:['ダ','ヂ','ヅ','デ','ド']},
  {lbl:'ba', h:['ば','び','ぶ','べ','ぼ'],  k:['バ','ビ','ブ','ベ','ボ']},
  {lbl:'pa', h:['ぱ','ぴ','ぷ','ぺ','ぽ'],  k:['パ','ピ','プ','ペ','ポ']},
];

const KD_FONTS = [
  { family: '"Noto Sans JP", sans-serif',  name: 'Noto Sans'  },
  { family: '"Noto Serif JP", serif',      name: 'Noto Serif' },
  { family: '"Shippori Mincho", serif',    name: 'Shippori'   },
  { family: '"BIZ UDPGothic", sans-serif', name: 'BIZ UD'     },
  { family: '"Klee One", cursive',         name: 'Klee'       },
  { family: '"Zen Old Mincho", serif',     name: 'Zen Old'    },
];

let kdFrom    = 'grid';
let kdChar    = '';
let kdFontIdx = 0;

// ── GRID ──────────────────────────────────────────────────────────────────────
async function enterKanaGrid() {
  showScreen('kana-grid');
  const body = document.getElementById('kd-grid-body');
  body.innerHTML = '<span style="font-size:.75rem;color:#333">loading…</span>';

  const attempts = await loadAllAttempts();
  const byChar = {};
  for (const a of attempts) {
    if (a.mode !== 'flip') continue;
    (byChar[a.kana] ||= []).push(a);
  }
  const acc = {};
  for (const [ch, atts] of Object.entries(byChar)) {
    const recent = atts.slice().sort((a, b) => b.ts - a.ts).slice(0, 100);
    acc[ch] = recent.filter(a => a.hit).length / recent.length;
  }

  body.innerHTML = '';
  kdRenderSection(body, 'HIRAGANA', 'h', acc);
  kdRenderSection(body, 'KATAKANA', 'k', acc);
}

function kdRenderSection(container, label, script, acc) {
  const lbl = document.createElement('div');
  lbl.className = 'kd-section-lbl';
  lbl.textContent = label;
  container.appendChild(lbl);

  for (const row of KD_ROWS) {
    const rowEl = document.createElement('div');
    rowEl.className = 'kd-grid-row';

    const lblEl = document.createElement('div');
    lblEl.className = 'kd-row-lbl';
    lblEl.textContent = row.lbl;
    rowEl.appendChild(lblEl);

    for (const ch of row[script]) {
      const cell = document.createElement('div');
      if (!ch) {
        cell.className = 'kd-cell kd-cell-empty';
      } else {
        const a = acc[ch];
        cell.className = 'kd-cell' + (a !== undefined ? ' kd-cell-seen' : '');
        cell.textContent = ch;
        cell.style.background = a !== undefined ? kdGridColor(a) : '#111';
        cell.dataset.kanaLink = ch;
        cell.dataset.kanaFrom = 'grid';
      }
      rowEl.appendChild(cell);
    }
    container.appendChild(rowEl);
  }
}

// ── KANA → ROMAJI ─────────────────────────────────────────────────────────────
function kanaToRomaji(str) {
  str = str.replace(/ /g, '');

  const H = {
    // youon digraphs (checked before singles)
    'きゃ':'kya','きゅ':'kyu','きょ':'kyo',
    'しゃ':'sha','しゅ':'shu','しょ':'sho',
    'ちゃ':'cha','ちゅ':'chu','ちょ':'cho',
    'にゃ':'nya','にゅ':'nyu','にょ':'nyo',
    'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo',
    'みゃ':'mya','みゅ':'myu','みょ':'myo',
    'りゃ':'rya','りゅ':'ryu','りょ':'ryo',
    'ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
    'じゃ':'ja', 'じゅ':'ju', 'じょ':'jo',
    'ぢゃ':'ja', 'ぢゅ':'ju', 'ぢょ':'jo',
    'びゃ':'bya','びゅ':'byu','びょ':'byo',
    'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
    'ゔぁ':'va', 'ゔぃ':'vi', 'ゔぇ':'ve', 'ゔぉ':'vo',
    // singles
    'あ':'a','い':'i','う':'u','え':'e','お':'o',
    'ぁ':'a','ぃ':'i','ぅ':'u','ぇ':'e','ぉ':'o',
    'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
    'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
    'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
    'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
    'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
    'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
    'や':'ya','ゆ':'yu','よ':'yo','ゃ':'ya','ゅ':'yu','ょ':'yo',
    'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
    'わ':'wa','を':'wo','ん':'n','ゎ':'wa',
    'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
    'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
    'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
    'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
    'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
    'ゔ':'vu',
  };

  // Build katakana map by shifting hiragana codepoints +0x60
  const map = { ...H };
  for (const [h, r] of Object.entries(H)) {
    const k = [...h].map(c => {
      const cp = c.codePointAt(0);
      return (cp >= 0x3041 && cp <= 0x3096) ? String.fromCodePoint(cp + 0x60) : c;
    }).join('');
    map[k] = r;
  }

  let out = '';
  let i = 0;
  while (i < str.length) {
    const c = str[i];

    if (c === 'っ' || c === 'ッ') {
      const rom = map[str[i+1] + str[i+2]] || map[str[i+1]] || '';
      const fc  = rom[0] || '';
      if (fc && !'aeiou'.includes(fc)) out += fc;
      i++; continue;
    }

    if (c === 'ー') {
      const last = out.slice(-1);
      if ('aeiou'.includes(last)) out += last;
      i++; continue;
    }

    const d = map[c + (str[i + 1] || '')];
    if (d) { out += d; i += 2; continue; }

    const s = map[c];
    if (s) { out += s; i++; continue; }

    out += c; // pass through kanji, latin, etc.
    i++;
  }
  return out;
}

function kdGridColor(acc) {
  if (acc < 0.5) {
    const t = acc * 2;
    return `rgb(${Math.round(50 - 24 * t)}, 14, 14)`;
  }
  const t = (acc - 0.5) * 2;
  return `rgb(16, ${Math.round(30 + 70 * t)}, 16)`;
}

// ── DETAIL ────────────────────────────────────────────────────────────────────
function enterKanaDetail(char, from) {
  kdChar    = char;
  kdFrom    = from || 'grid';
  kdFontIdx = 0;
  kdRenderDetail();
  showScreen('kana-detail');
}

function kdRenderDetail() {
  const charEl = document.getElementById('kd-char');
  charEl.textContent      = kdChar;
  charEl.style.fontFamily = KD_FONTS[kdFontIdx].family;
  document.getElementById('kd-font-name').textContent = KD_FONTS[kdFontIdx].name;

  const script = kdIsHiragana(kdChar) ? 'hiragana' : 'katakana';
  const data   = KANA_EXAMPLES[script]?.[kdChar];
  const exEl   = document.getElementById('kd-examples');
  exEl.innerHTML = '';

  const TYPES = [
    { key: 'common',  label: 'common'  },
    { key: 'slang',   label: 'slang'   },
    { key: 'pokemon', label: 'pokémon' },
  ];

  for (const { key, label } of TYPES) {
    const ex = data?.[key];
    if (!ex || ex.word === 'N/A') continue;

    const row = document.createElement('div');
    row.className = 'kd-example';

    const wordEl = document.createElement('div');
    wordEl.className = 'kd-ex-word';
    wordEl.innerHTML = kdBuildWordHtml(ex.word, ex.reading);

    const metaEl = document.createElement('div');
    metaEl.className = 'kd-ex-meta';

    const tagEl = document.createElement('span');
    tagEl.className = 'kd-ex-tag';
    tagEl.textContent = label;

    const revealEl = document.createElement('div');
    revealEl.className = 'kd-ex-reveal';
    revealEl.innerHTML =
      `<span class="kd-ex-romaji">${kanaToRomaji(ex.reading)}</span>` +
      `<span class="kd-ex-dot">·</span>` +
      `<span class="kd-ex-meaning">${ex.meaning}</span>`;

    metaEl.appendChild(tagEl);
    metaEl.appendChild(revealEl);
    row.appendChild(wordEl);
    row.appendChild(metaEl);
    row.addEventListener('click', () => row.classList.toggle('kd-revealed'));
    exEl.appendChild(row);
  }
}

function kdBuildWordHtml(word, reading) {
  const hasKanji = [...word].some(kdIsKanji);
  if (!hasKanji) return `<span class="kd-word">${word}</span>`;

  const segs   = reading.split(' ').filter(s => s.length > 0);
  const groups = kdParseGroups(word);

  if (groups.length !== segs.length) {
    return `<span class="kd-word">${word}</span>`;
  }

  const inner = groups.map((g, i) =>
    g.kanji
      ? `<ruby>${g.chars}<rt>${segs[i]}</rt></ruby>`
      : `<span>${g.chars}</span>`
  ).join('');
  return `<span class="kd-word">${inner}</span>`;
}

function kdParseGroups(word) {
  const groups = [];
  let buf = '';
  for (const ch of word) {
    if (kdIsKanji(ch)) {
      if (buf) { groups.push({ chars: buf, kanji: false }); buf = ''; }
      groups.push({ chars: ch, kanji: true });
    } else {
      buf += ch;
    }
  }
  if (buf) groups.push({ chars: buf, kanji: false });
  return groups;
}

function kdIsKanji(ch) {
  const c = ch.codePointAt(0);
  return (c >= 0x4E00 && c <= 0x9FFF) || (c >= 0x3400 && c <= 0x4DBF) ||
         (c >= 0xF900 && c <= 0xFAFF);
}

function kdIsHiragana(ch) {
  const c = ch.codePointAt(0);
  return c >= 0x3041 && c <= 0x3096;
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
document.getElementById('kd-char').addEventListener('click', () => {
  kdFontIdx = (kdFontIdx + 1) % KD_FONTS.length;
  document.getElementById('kd-char').style.fontFamily = KD_FONTS[kdFontIdx].family;
  document.getElementById('kd-font-name').textContent  = KD_FONTS[kdFontIdx].name;
});

document.getElementById('btn-kd-back').addEventListener('click', () => {
  if      (kdFrom === 'flip-sum') showScreen('flip-sum');
  else if (kdFrom === 'history')  enterHistory();
  else if (kdFrom === 'weakest')  showScreen('weakest');
  else                            enterKanaGrid();
});

document.getElementById('btn-kdg-back').addEventListener('click', () => enterFlipHome());

document.getElementById('btn-kana-grid').addEventListener('click', () => enterKanaGrid());

// Global delegation — fires for any [data-kana-link] element anywhere in the DOM
document.addEventListener('click', e => {
  const link = e.target.closest('[data-kana-link]');
  if (!link) return;
  enterKanaDetail(link.dataset.kanaLink, link.dataset.kanaFrom || 'grid');
});

window.enterKanaGrid   = enterKanaGrid;
window.enterKanaDetail = enterKanaDetail;
