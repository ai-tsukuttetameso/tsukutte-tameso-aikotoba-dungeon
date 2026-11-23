// 職業ごとの 主人公の 見た目（ぼうし・服の 色・手に もつ物）
'use strict';

// ===== 職業の 見た目 =====
// hat＝頭の 4行を さしかえる ／ pal＝色を さしかえる ／ hold＝手に もつ物 [x, y, 文字] の ならび ／ robe＝足を ローブで かくす
const HAT = {
  helm:  ['....wwwww.......', '...wRRRRRw......', '..wRRWRRRRRw....', '..wRRRRRRRRw....'],
  hood:  ['.....rrrrr......', '...rRRRRRRRr....', '..rRRWRRRRRRr...', '..rRRRRRRRRRr...'],
  band:  ['................', '....hhhhhhh.....', '...rRRRRRRRRw...', '...rRRWRRRRRww..'],
  point: ['.........rr.....', '.......rRRr.....', '....rRRRWRRr....', '..rRRRRRRRRRRr..'],
  cap:   ['................', '....rRRRRRr.....', '...rRRWRRRRr....', '..wwwwwwwwwww...'],
};
const HOLD = {
  sword: [[13, 3, 'X'], [13, 4, 'X'], [13, 5, 'X'], [13, 6, 'X'], [13, 7, 'X'], [12, 8, 'Y'], [13, 8, 'Y'], [14, 8, 'Y'], [13, 9, 'L']],
  dagger: [[13, 7, 'X'], [13, 8, 'X'], [12, 9, 'Y'], [13, 9, 'Y']],
  hammer: [[12, 4, 'X'], [13, 4, 'X'], [14, 4, 'X'], [12, 5, 'X'], [13, 5, 'X'], [14, 5, 'X'], [13, 6, 'L'], [13, 7, 'L'], [13, 8, 'L'], [13, 9, 'L']],
  staff: [[13, 1, 'O'], [12, 2, 'O'], [13, 2, 'Q'], [14, 2, 'O'], [13, 3, 'O'], [13, 4, 'L'], [13, 5, 'L'], [13, 6, 'L'], [13, 7, 'L'], [13, 8, 'L'], [13, 9, 'L'], [13, 10, 'L'], [13, 11, 'L'], [13, 12, 'L']],
  bag:   [[13, 9, 'L'], [12, 10, 'K'], [13, 10, 'K'], [14, 10, 'K'], [12, 11, 'K'], [13, 11, 'Y'], [14, 11, 'K'], [12, 12, 'K'], [13, 12, 'K'], [14, 12, 'K']],
};
const JOB_LOOK = {
  senshi: { hat: 'helm', hold: 'sword', pal: { w: '#4a5060', R: '#a8b0c0', W: '#eef2ff', b: '#7a1c1c', B: '#c83a3a', Y: '#f0c040' } },
  thief:  { hat: 'hood', hold: 'dagger', pal: { r: '#1c4a2a', R: '#2f8a4a', W: '#6ad08a', b: '#2a2438', B: '#4a4060', Y: '#c0c0c0', m: '#4a4060' } },
  smith:  { hat: 'band', hold: 'hammer', pal: { r: '#8a4a10', R: '#e07a20', W: '#ffc070', w: '#8a4a10', S: '#e0a878', b: '#5a3a20', B: '#8a5a30', Y: '#c0c0c0' } },
  mage:   { hat: 'point', hold: 'staff', robe: true, pal: { r: '#2a1050', R: '#6a3ac8', W: '#c0a0ff', b: '#3a1a6a', B: '#6a3ac8', Y: '#f0c040', O: '#8a6a30', Q: '#7ad8ff' } },
  tool:   { hat: 'cap', hold: 'bag', pal: { r: '#8a6a10', R: '#e0b030', W: '#fff0a0', w: '#8a6a10', b: '#14505a', B: '#2a9aa8', Y: '#f0c040', K: '#8a5a30' } },
  mken:   { hat: 'helm', hold: 'sword', robe: true, pal: { w: '#2a1a4a', R: '#8a7ad8', W: '#e0d8ff', b: '#2a1a4a', B: '#5a3aa8', Y: '#ffd23f', X: '#ff9a5a' } },
  ninja:  { hat: 'hood', hold: 'dagger', pal: { r: '#141018', R: '#2a2430', W: '#4a4458', b: '#141018', B: '#2a2430', Y: '#c02030', m: '#2a2430', h: '#c02030', L: '#2a2430', F: '#141018' } },
  kenja:  { hat: 'point', hold: 'staff', robe: true, pal: { r: '#a08a30', R: '#f0f0f0', W: '#ffffff', b: '#a0a0b8', B: '#f0f0ff', Y: '#f0c040', O: '#f0c040', Q: '#ff6ad0' } },
  dancer: { hat: 'band', hold: 'sword', pal: { h: '#3a2418', r: '#a0205a', R: '#ff5aa0', W: '#ffc0e0', w: '#a0205a', b: '#6a1040', B: '#e0407a', Y: '#ffd23f' } },
  hunter: { hat: 'hood', hold: 'dagger', pal: { r: '#3a5a1a', R: '#6a9a2a', W: '#b0e070', b: '#4a3a1a', B: '#7a6030', Y: '#c0c0c0' } },
  karakuri: { hat: 'cap', hold: 'hammer', pal: { r: '#3a3a40', R: '#7a7a88', W: '#d0d0e0', w: '#3a3a40', b: '#5a3a20', B: '#c07a2a', Y: '#7ad8ff', X: '#f0c040' } },
  genjutsu: { hat: 'point', hold: 'staff', robe: true, pal: { r: '#0a3a4a', R: '#1a9aa8', W: '#a0f0ff', b: '#1a2a5a', B: '#3a5ac8', Y: '#ff6ad0', Q: '#ff6ad0' } },
  renkin: { hat: 'hood', hold: 'bag', robe: true, pal: { r: '#5a4a10', R: '#a08a30', W: '#f0e080', b: '#3a3a20', B: '#7a7a40', Y: '#ffd23f', K: '#f0c040' } },
  akindo: { hat: 'cap', hold: 'bag', pal: { r: '#8a1c2a', R: '#d8343f', W: '#ff8a7a', w: '#f0c040', b: '#1a5a3a', B: '#2aa86a', Y: '#ffd23f', K: '#f0c040' } },
  yuusha: { hat: 'helm', hold: 'sword', pal: { w: '#1a3a8a', R: '#3a7ae0', W: '#a0d0ff', b: '#1a3a8a', B: '#3a7ae0', Y: '#ffd23f', X: '#fff4a0', L: '#ffd23f' } },
  daikenja: { hat: 'point', hold: 'staff', robe: true, pal: { r: '#c09a20', R: '#ffe070', W: '#fffbe0', b: '#c09a20', B: '#fff4c0', Y: '#ff5a5a', O: '#ffd23f', Q: '#ffffff' } },
  kagenoou: { hat: 'hood', hold: 'dagger', pal: { r: '#1a0a2a', R: '#3a1a5a', W: '#8a5ad8', b: '#1a0a2a', B: '#3a1a5a', Y: '#c08aff', m: '#3a1a5a', h: '#8a5ad8', L: '#3a1a5a', F: '#1a0a2a' } },
  bmaster: { hat: 'helm', hold: 'hammer', pal: { w: '#8a6010', R: '#f0c040', W: '#fff4a0', b: '#5a5a68', B: '#a0a0b0', Y: '#e5484d', X: '#e0e8ff' } },
};
function jobHeroRows(look) { const rows = HERO_ROWS.map(r => [...r]);
  HAT[look.hat].forEach((r, y) => { rows[y] = [...r]; });
  if (look.robe) { rows[12] = [...'...bBBBBBBBb....']; rows[13] = [...'...bBBBBBBBb....']; }
  for (const [x, y, ch] of HOLD[look.hold] || []) rows[y][x] = ch;
  return rows.map(r => r.join('')); }
// うしろ すがた：顔の 4行（4〜7行目）を かみの毛に ぬりかえる
const backRows = rows => rows.map((r, y) => y >= 4 && y <= 7 ? r.replace(/[Sem]/g, 'h') : r);
S.hero_b = sprite(backRows(HERO_ROWS), HERO_PAL);
for (const [id, look] of Object.entries(JOB_LOOK)) { const pal = { ...HERO_PAL, X: '#d8dce8', O: '#8a6a30', Q: '#7ad8ff', K: '#8a5a30', ...look.pal }, rows = jobHeroRows(look);
  S['hero_' + id] = sprite(rows, pal); S['hero_' + id + '_b'] = sprite(backRows(rows), pal); }
// いまの 職業の 主人公の 絵（back＝うしろ すがた）
const heroSprite = (id, back) => S['hero_' + id + (back ? '_b' : '')] || (back ? S.hero_b : S.hero);
