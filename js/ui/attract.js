// タイトルで しばらく 何も しないと、あらすじ → デモプレイが 流れる（ゲームセンターの 「見せる」画面のように）
// デモの あいだは 記録・コレクション・セーブに 何も 書きこまない
'use strict';

const ATTRACT_IDLE = 50000;   // タイトルで 何も しない 時間（ミリ秒）
const DEMO_LEN = 45000;       // デモプレイの 長さ
const DEMO_PW = 'つくってためそ でも';
const STORY_LINES = ['合言葉を となえると、ひとつの ダンジョンが 生まれる。', 'その いちばん 下では、でかこわの王が まちかまえている。', 'さあ、きみだけの 合言葉で 冒険に 出よう。'];
let attract = null;            // null／'story'／'demo'
let lastInput = Date.now(), demoTimer = 0, demoEnd = 0;
let attractBack = null; // コレクションから 見たとき、おわったら もどる ところ

// ----- デモの あいだは 保存しない -----
const _setItem = Storage.prototype.setItem, _removeItem = Storage.prototype.removeItem;
function lockStorage(on) { Storage.prototype.setItem = on ? function () {} : _setItem; Storage.prototype.removeItem = on ? function () {} : _removeItem; }

function attractReady() { return overKind === 'title' && !over.hidden && over.querySelector('.tplay') && !document.getElementById('startPick')
  && !(document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) && invpop.hidden; }
function noteInput() { lastInput = Date.now(); }

// ----- あらすじ -----
function showStory() { attract = 'story'; const box = document.createElement('div'); box.className = 'attract story'; box.id = 'attractBox';
  box.innerHTML = `<div class="storyin"><p class="ep">${GAME_EPISODE}</p>${STORY_LINES.map((l, i) => `<p style="animation-delay:${.4 + i * 1.6}s">${l}</p>`).join('')}<p class="hint">ボタンを おすと タイトルへ</p></div>`;
  document.querySelector('.stage').appendChild(box); setTimeout(() => { if (attract === 'story') startDemo(); }, 7000); }

// ----- デモプレイ -----
function startDemo() { const b = document.getElementById('attractBox'); if (b) b.remove();
  attract = 'demo'; lockStorage(true); demoEnd = Date.now() + DEMO_LEN;
  const job = curJob; curJob = 'senshi'; try { newGame('pw', DEMO_PW, 10, 1, true); } finally { curJob = job; }
  // デモは すぐに 力つきないよう 少し つよく する（記録には のこらない）
  P.visits = {}; Object.assign(P, { lv: 5, mhp: 160, hp: 160, atk: P.atk + 6, def: P.def + 4 }); hideOver(); fitView();
  const tag = document.createElement('div'); tag.className = 'attract demotag'; tag.id = 'attractBox'; tag.innerHTML = '<b>デモプレイ</b><span>ボタンを おすと タイトルへ</span>';
  document.querySelector('.stage').appendChild(tag); render(); demoTimer = setInterval(demoStep, 200); }
function stopAttract() { if (!attract) return; const was = attract; attract = null; clearInterval(demoTimer); const b = document.getElementById('attractBox'); if (b) b.remove();
  if (was === 'demo') { lockStorage(false); progForget(); if (typeof _progQ !== 'undefined') _progQ = null; newGame('random', null, 10, 1, true); showOver('title'); render(); }
  noteInput(); if (attractBack) { const f = attractBack; attractBack = null; f(); } }

// 8方向の 最短の みち（かどを ななめに 横切らない）。goal(x,y) が true の マスへ。さいしょの 1歩を かえす
function demoPath(goal, maxN = 900) { const key = (x, y) => y * W + x, prev = new Map([[key(P.x, P.y), null]]), q = [[P.x, P.y]];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  while (q.length && prev.size < maxN) { const [x, y] = q.shift();
    if ((x !== P.x || y !== P.y) && goal(x, y)) { let k = key(x, y), last = k; while (prev.get(k) !== key(P.x, P.y) && prev.get(k) !== null) { last = prev.get(k); k = last; } const fx = k % W, fy = (k - fx) / W; return [Math.sign(fx - P.x), Math.sign(fy - P.y)]; }
    for (const [dx, dy] of dirs) { const nx = x + dx, ny = y + dy; if (!isFloor(nx, ny) || !G.seen[ny][nx] || prev.has(key(nx, ny))) continue;
      if (dx && dy && (!isFloor(x + dx, y) || !isFloor(x, y + dy))) continue;
      if ((monAt(nx, ny) && !goal(nx, ny)) || shopAt(nx, ny) || npcAt(nx, ny)) continue;
      const t = G.traps.find(o => o.x === nx && o.y === ny && o.found); if (t && !goal(nx, ny)) continue;
      prev.set(key(nx, ny), key(x, y)); q.push([nx, ny]); } }
  return null; }
const near1 = m => Math.max(Math.abs(m.x - P.x), Math.abs(m.y - P.y)) === 1 && !(m.x !== P.x && m.y !== P.y && (!isFloor(m.x, P.y) || !isFloor(P.x, m.y)));
function demoStep() {
  if (attract !== 'demo') return; if (Date.now() > demoEnd || !G || G.over) { stopAttract(); return; }
  invpop.hidden = true;
  const heal = P.inv.findIndex(o => o.k === 'herb' || o.k === 'g_life'); if (P.hp < P.mhp * .4 && heal >= 0) { useItem(heal); return; }
  const foes = G.mons.filter(m => m.t !== 'keeper' && visible(m.x, m.y)).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y));
  const adj = foes.find(near1); if (adj) { act(Math.sign(adj.x - P.x), Math.sign(adj.y - P.y)); return; }
  if (P.x === G.stairs.x && P.y === G.stairs.y && !foes.length) { descend(); return; }
  let st = null;
  if (foes.length && Math.hypot(foes[0].x - P.x, foes[0].y - P.y) < 6) st = demoPath((x, y) => foes.some(m => m.x === x && m.y === y));
  const full = invFull(); if (!st) st = demoPath((x, y) => G.items.some(o => o.x === x && o.y === y && !o.price && (o.k === 'gold' || !full) && visible(x, y)));
  if (!st && G.seen[G.stairs.y][G.stairs.x] && Date.now() > demoEnd - DEMO_LEN + 12000) st = demoPath((x, y) => x === G.stairs.x && y === G.stairs.y);
  if (!st) st = demoPath((x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const nx = x + a, ny = y + b; return nx >= 0 && ny >= 0 && nx < W && ny < H && !G.seen[ny][nx] && G.map[ny][nx] > 0; }));
  if (!st && G.seen[G.stairs.y][G.stairs.x]) st = demoPath((x, y) => x === G.stairs.x && y === G.stairs.y);
  if (st) act(st[0], st[1]); else act(0, 0); }

// デモの あいだの 効果音は ならさない（BGMは ながす）
const _sfx = sfx; sfx = function (n) { if (attract === 'demo') return; return _sfx(n); };
// デモで 力つきたら タイトルへ
const _showOver = showOver; showOver = function (kind) { if (attract === 'demo' && kind !== 'title') { setTimeout(stopAttract, 900); return; } return _showOver.apply(this, arguments); };

// なにか おしたら やめる（その おした ことは ゲームに つたえない）
function attractInput(ev) { noteInput(); if (!attract) return; ev.preventDefault(); ev.stopImmediatePropagation(); stopAttract(); }
['keydown', 'pointerdown', 'wheel', 'touchstart'].forEach(t => addEventListener(t, attractInput, { capture: true, passive: false }));
addEventListener('pointermove', () => { if (!attract) noteInput(); }, { passive: true });  // 読んでいる あいだ（マウスを うごかしている あいだ）は デモに しない
addEventListener('scroll', () => { if (!attract) noteInput(); }, { passive: true, capture: true });
setInterval(() => { if (!attract && attractReady() && Date.now() - lastInput > ATTRACT_IDLE) showStory(); if (!attractReady() && !attract) noteInput(); }, 1000);
