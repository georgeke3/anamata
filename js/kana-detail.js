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

// ── NOTES ─────────────────────────────────────────────────────────────────────
const KD_NOTES = {
  // ── vowels ──
  'あ': 'The most open vowel; leads every kana chart and countless native words.',
  'い': 'The front high vowel; also the classical い-adjective stem (高い, 赤い).',
  'う': 'Sometimes devoiced between voiceless consonants (e.g. です sounds like "des").',
  'え': 'One of the rarer vowels in Japanese roots; very common as a particle/interjection.',
  'お': 'Also the honorific prefix お (お茶, お金); highly frequent in everyday speech.',
  // ── k row ──
  'か': 'Also the question particle か; one of the most-used kana in the language.',
  'き': 'Common as a noun-forming suffix (好き, 書き); appears in many compound sounds (きゃ etc.).',
  'く': 'The plain-form ending for u-verbs (書く, 飲む→飲む but 書く ends in く).',
  'け': 'Relatively infrequent as a standalone mora; mostly appears mid-word.',
  'こ': 'Pronoun root こ- (this): これ, ここ, こんな; extremely high frequency.',
  // ── s row ──
  'さ': 'Often a nominalizer suffix (悲しさ, 高さ); also the interjection "well then".',
  'し': 'Most common reading of し in し ending verbs; also the て-form connector し.',
  'す': 'The polite copula ます/です both end in す; ubiquitous in formal speech.',
  'せ': 'Appears in せい (blame/height), せんせい; less common than other s-row members.',
  'そ': 'Mid-distance demonstrative root そ- (that): それ, そこ, そんな.',
  // ── t row ──
  'た': 'The plain past tense ending (食べた, 書いた); among the most-used kana.',
  'ち': 'Pronounced "chi" not "ti"; also ち as a suffix in うち (home/we).',
  'つ': 'Pronounced "tsu"; appears doubled as っ (small tsu) to geminate the next consonant.',
  'て': 'The て-form connector is the backbone of Japanese grammar; enormously frequent.',
  'と': 'Multi-use particle: "and" (リンゴとバナナ), "with", and quotation (と言った).',
  // ── n row ──
  'な': 'The な-adjective/copula stem (きれいな); also the prohibitive な (するな).',
  'に': 'The direction/location/time particle に; one of the highest-frequency particles.',
  'ぬ': 'Classical negative auxiliary (食べぬ); largely replaced by ない in modern Japanese.',
  'ね': 'Sentence-final particle seeking agreement ("right?"); extremely common in speech.',
  'の': 'The possessive/nominalizer particle の; appears in almost every sentence.',
  // ── h row ──
  'は': 'The topic marker — written は but read "wa"; arguably the most important particle.',
  'ひ': 'Also the number "one" in native counting (ひとつ); appears in ひと (person).',
  'ふ': 'Pronounced "fu" not "hu"; the only H-row kana with an irregular romanization.',
  'へ': 'Direction particle — written へ but read "e"; marks destination (東京へ行く).',
  'ほ': 'Appears in ほん (book), ほか (other); also the interjection ほら ("look!").',
  // ── m row ──
  'ま': 'Appears in まだ (still), また (again), まあ (well); very high frequency.',
  'み': 'The stem of 見る (to see); also used in み as a nominalizer (楽しみ).',
  'む': 'The plain negative む (archaic); today mostly appears mid-word (むずかしい).',
  'め': '目 (eye) is one of the most basic kanji; め also means "you" in rough speech.',
  'も': 'The additive particle も ("also", "even"); appears in negative constructions too.',
  // ── y row ──
  'や': 'Informal "and/or" particle (リンゴやバナナ); also the row label for ya/yu/yo.',
  'ゆ': 'Appears in ゆっくり (slowly), ゆめ (dream); less common as a standalone mora.',
  'よ': 'Sentence-final assertive particle よ ("you know!"); extremely common in speech.',
  // ── r row ──
  'ら': 'Pluralizing suffix (彼ら, 君ら); also the classical conditional ら (now ば).',
  'り': 'The nominalizer り (やはり, つまり); り in ている→ている gives -ri compounds.',
  'る': 'The plain-form ending for ru-verbs (食べる, 見る); ubiquitous.',
  'れ': 'Appears in これ/それ/あれ (this/that/that over there); the れ in passive form.',
  'ろ': 'The imperative ending in classical Japanese (見ろ, 来ろ); still common informally.',
  // ── w row ──
  'わ': 'The topic-marker historical source; わ alone means "I" in feminine/archaic speech.',
  'を': 'Object marker only; always read "o" today; rarely starts a word.',
  // ── n ──
  'ん': 'The only pure nasal kana; can end a word but never start one in native vocab.',
  // ── g row ──
  'が': 'The subject particle が; also marks contrast and exhaustive listing.',
  'ぎ': 'Voiced version of き; appears in ぎり (limit/duty) and many loanword adaptations.',
  'ぐ': 'Voiced version of く; also a mimetic suffix (ぐちゃぐちゃ = mushy/messy).',
  'げ': 'Voiced version of け; げ expresses appearance/feeling (悲しげ, 嬉しげ).',
  'ご': 'Voiced version of こ; also the honorific prefix ご (ご家族, ご連絡).',
  // ── z row ──
  'ざ': 'Voiced version of さ; appears in ざっし (magazine), ざんねん (unfortunate).',
  'じ': 'Pronounced "ji" (same as ぢ); the standard kana for this sound in modern Japanese.',
  'ず': 'The negative て-form (食べずに); also voiced version of す in many words.',
  'ぜ': 'Voiced version of せ; appears in ぜったい (absolutely), ぜひ (by all means).',
  'ぞ': 'Emphatic sentence-final particle in classical/masculine speech (行くぞ!).',
  // ── d row ──
  'だ': 'The plain copula (これだ = "it\'s this"); plain-past form of です.',
  'ぢ': 'Same sound as じ today; nearly obsolete — kept in rendaku compounds like 鼻血 (nosebleed).',
  'づ': 'Same sound as ず today; kept in words like 続く, 近づく by historical convention.',
  'で': 'The location-of-action particle (公園で遊ぶ); also the て-form of だ.',
  'ど': 'Voiced version of と; also どう (how), どこ (where), どれ (which).',
  // ── b row ──
  'ば': 'The conditional form ば (食べれば = "if [one] eats"); also voiced version of は.',
  'び': 'Voiced version of ひ; appears in びっくり (surprised), びょういん (hospital).',
  'ぶ': 'Voiced version of ふ; also colloquial shortening of words (さぼる←サボタージュ).',
  'べ': 'Voiced version of へ; べつに (not particularly) and べんり (convenient) are common.',
  'ぼ': 'Voiced version of ほ; ぼく (I/me, informal male) is one of the most common pronouns.',
  // ── p row ──
  'ぱ': 'P-sounds are rare in native Japanese; mostly appear in loanwords and mimetics.',
  'ぴ': 'Appears mostly in loanwords (ピアノ→ぴあの) and mimetics (ぴかぴか = shiny).',
  'ぷ': 'Mimetics and loanwords only; ぷにぷに (squishy) is a classic example.',
  'ぺ': 'Rare in native words; mostly loanwords (ぺらぺら = fluent/chatty is an exception).',
  'ぽ': 'Like all p-kana, almost exclusively in loanwords and sound-symbolic mimetics.',
};

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

  const noteEl = document.getElementById('kd-note');
  noteEl.textContent = KD_NOTES[kdChar] || '';
  noteEl.style.display = KD_NOTES[kdChar] ? '' : 'none';

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
