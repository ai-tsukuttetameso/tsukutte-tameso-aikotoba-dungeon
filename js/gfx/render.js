// 画面の描画（マップ・敵・アイテム・値札）
'use strict';

// ===== 描画 =====
const cv = document.getElementById('cv'), g = cv.getContext('2d');
let t0 = performance.now();
// ゲーム画面の こまかさ（2＝1マスを 32×32 の 点で かく）
const GZ = 2;
// 絵を はる：2倍に なめらかにした 絵を、もとの 大きさの 場所に かく
const dI = (sp, x, y, flip) => { const s2 = flip ? flipX(sp) : sp; g.drawImage(GZ > 1 ? smooth(s2, 1) : s2, x, y, sp.width, sp.height); };

// ===== うごき（こうげきの ふみこみ・きりつけ） =====
// こうげきした 側が 相手の ほうへ ぐっと ふみこむ（ANIM_MS ミリ秒）。そのあいだは なめらかに かきなおす
const ANIM_MS = 220;
let animUntil = 0, animLoop = false;
function kickAnim(ms) { animUntil = Math.max(animUntil, performance.now() + ms); if (animLoop) return; animLoop = true;
  const loop = () => { render(); if (performance.now() < animUntil) requestAnimationFrame(loop); else { animLoop = false; render(); } }; requestAnimationFrame(loop); }
const sgn = v => v > 0 ? 1 : v < 0 ? -1 : 0;
function attackAnim(m) { P.anim = { t: performance.now(), dx: sgn(m.x - P.x), dy: sgn(m.y - P.y) }; if (G) G.slash = { x: m.x, y: m.y, t: performance.now(), dx: sgn(m.x - P.x), dy: sgn(m.y - P.y) };
  if (P.anim.dx) P.faceL = P.anim.dx < 0; kickAnim(ANIM_MS + 40); }
function monAnim(m) { m.anim = { t: performance.now(), dx: sgn(P.x - m.x), dy: sgn(P.y - m.y) }; kickAnim(ANIM_MS + 40); }
// ふみこみの ずれ（0 → 6 → 0）
function lunge(a, now) { if (!a) return [0, 0]; const k = (now - a.t) / ANIM_MS; if (k >= 1) return [0, 0]; const s = Math.sin(k * Math.PI) * 6; return [Math.round(a.dx * s), Math.round(a.dy * s)]; }
// つよい こたいの 色ちがい
const _elite = new Map();
const eliteOf = sp => { let c = _elite.get(sp); if (!c) _elite.set(sp, c = variant(sp, { hue: 150, sat: 1.6, light: 1.1 })); return c; };
// 絵の 形だけ 白く ぬった コピー（ダメージを うけた ときの 光）
const _white = new Map();
function whiteOf(sp) { let c = _white.get(sp); if (c) return c; c = document.createElement('canvas'); c.width = sp.width; c.height = sp.height;
  const x = c.getContext('2d'); x.drawImage(sp, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); _white.set(sp, c); return c; }
function render() {
  const now = performance.now(), tt = (now - t0) / 1000;
  if (overKind === 'title') { g.setTransform(1, 0, 0, 1, 0, 0); setHtml('tags', ''); drawTitle(tt); return; }
  // ゲーム画面は キャンバスを GZ倍の 大きさに して、絵は smooth() で なめらかに した 2倍の 絵を はる
  const LW = VW * TS, LH = VH * TS; g.setTransform(GZ, 0, 0, GZ, 0, 0); g.imageSmoothingEnabled = false;
  const camX = P.x - (VW >> 1), camY = P.y - (VH >> 1);
  g.fillStyle = '#000'; g.fillRect(0, 0, LW, LH);
  g.save(); if (shakeT > 0) { g.translate(Math.round((Math.random() - .5) * shakeT * .8), Math.round((Math.random() - .5) * shakeT * .8)); shakeT--; }
  for (let j = 0; j < VH; j++) for (let i = 0; i < VW; i++) {
    const x = camX + i, y = camY + j, X = i * TS, Y = j * TS; if (x < 0 || y < 0 || x >= W || y >= H || !G.seen[y][x]) continue;
    const v = G.map[y][x];
    if (v === 1) dI(FLOOR[G.variant[y][x]], X, Y); else if (v === 2) dI(CORR[G.variant[y][x] % 4], X, Y);
    else { if (y + 1 < H && G.map[y + 1][x] > 0) { dI(WALL_FRONT[G.variant[y][x] === 3 ? 1 : 0], X, Y); if (G.torch[y][x] && G.map[y + 1][x] === 1) { dI(TORCH, X + 5, Y + 4 + (Math.sin(tt * 8 + x) > .6 ? -1 : 0)); } }
      else dI(WALL_TOP, X, Y); }
    if (!visible(x, y)) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(X, Y, TS, TS); }
  }
  // たいまつの光
  g.globalCompositeOperation = 'lighter';
  for (let j = 0; j < VH; j++) for (let i = 0; i < VW; i++) { const x = camX + i, y = camY + j; if (x < 0 || y < 0 || x >= W || y >= H) continue;
    if (G.seen[y][x] && G.map[y][x] === 0 && G.torch[y][x] && y + 1 < H && G.map[y + 1][x] === 1 && visible(x, y)) {
      const cx = i * TS + 8, cy = j * TS + 8, r = 26 + Math.sin(tt * 6 + x) * 2; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
      gr.addColorStop(0, 'rgba(255,150,60,.35)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(cx - r, cy - r, r * 2, r * 2); } }
  g.globalCompositeOperation = 'source-over';
  const at = (x, y) => [(x - camX) * TS, (y - camY) * TS];
  const inView = (x, y) => x >= camX && y >= camY && x < camX + VW && y < camY + VH;
  if (G.seen[G.stairs.y][G.stairs.x] && inView(G.stairs.x, G.stairs.y)) { const [X, Y] = at(G.stairs.x, G.stairs.y); dI(S.stairs, X, Y + 2); }
  if (G.npc && G.seen[G.npc.y][G.npc.x] && inView(G.npc.x, G.npc.y)) { const [X, Y] = at(G.npc.x, G.npc.y); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(X + 8, Y + 14, 6, 2.5, 0, 0, 7); g.fill(); dI(S[FRIENDS[G.npc.who].spr], X - 1, Y - 2 + Math.round(Math.abs(Math.sin(tt * 3)) * -1)); }
  if (G.shop && G.seen[G.shop.y][G.shop.x] && inView(G.shop.x, G.shop.y)) { const [X, Y] = at(G.shop.x, G.shop.y); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(X + 8, Y + 14, 6, 2.5, 0, 0, 7); g.fill(); dI(S.clerk, X - 1, Y - 2 + Math.round(Math.sin(tt * 3))); }
  for (const t of G.traps) if (t.found && inView(t.x, t.y)) { const [X, Y] = at(t.x, t.y); dI(S[TRAPS[t.k].spr], X, Y + 4); }
  const tags = [];
  for (const it of G.items) if (visible(it.x, it.y) && inView(it.x, it.y)) { const [X, Y] = at(it.x, it.y); dI(S[it.k === 'gold' ? 'gold' : ITEMS[it.k].spr], X - 1, Y + 2 + Math.round(Math.sin(tt * 3 + it.x) * .6)); if (it.price) tags.push(`<span class="tag" style="left:${(X + 8) / LW * 100}%;top:${(Y + 17) / LH * 100}%" title="お店の うりもの（はらわずに 出ると 店主が おこる）"><b>売</b>${it.price}G</span>`); }
  const drawMon = m => { const [X, Y] = at(m.x, m.y); const sp = m.elite ? eliteOf(S[MON[m.t].spr]) : S[MON[m.t].spr]; const bob = Math.round(Math.sin(tt * 4 + m.x * 1.7) * 1);
    const [lx, ly] = lunge(m.anim, now), fl = P.x < m.x;  // 敵は 主人公の ほうを むく
    let ox = X - 1 + lx, oy = Y - 1 + bob + ly; if (MON[m.t].big) { ox = X - 9; oy = Y - 18 + bob; }
    if (MON[m.t].dance) { ox += Math.round(Math.sin(tt * 10) * 1.5); }
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(X + 8, Y + 14, MON[m.t].big ? 12 : 6, 2.5, 0, 0, 7); g.fill();
    if (m.elite) { const pu = (Math.sin(tt * 5 + m.x) + 1) / 2, cx = ox + sp.width / 2, cy = oy + sp.height / 2, gr = g.createRadialGradient(cx, cy, 2, cx, cy, 13); gr.addColorStop(0, `rgba(255,80,220,${.35 + .25 * pu})`); gr.addColorStop(1, 'rgba(255,80,220,0)'); g.fillStyle = gr; g.fillRect(cx - 14, cy - 14, 28, 28); }
    dI(sp, ox, oy, fl); if (m.flash > 0) { m.flash--; g.globalAlpha = .7; dI(whiteOf(sp), ox, oy, fl); g.globalAlpha = 1; }
    if (m.elite) { g.fillStyle = '#ffd23f'; const cx = ox + (sp.width >> 1); g.fillRect(cx - 3, oy - 3, 1, 2); g.fillRect(cx, oy - 4, 1, 3); g.fillRect(cx + 3, oy - 3, 1, 2); g.fillRect(cx - 3, oy - 1, 7, 1); }
    if (m.stuck > 0) { dI(S.sticker, X + 4, Y - 6); }
    if (m.sleep) { g.fillStyle = '#c9e6ff'; g.font = '8px monospace'; g.fillText('z', X + 12, Y - 2 + Math.round(Math.sin(tt * 2) * 2)); }
    // HPバー（大きい敵は 顔に かからないよう 頭の上に 出す）
    if (m.hp < m.mhp) { const big = MON[m.t].big, bx = big ? ox + 2 : X + 1, by = big ? oy - 3 : Y - 3, bw = big ? sp.width - 4 : 14; g.fillStyle = '#300'; g.fillRect(bx, by, bw, 2); g.fillStyle = '#ff4a4a'; g.fillRect(bx, by, Math.max(1, Math.round(bw * m.hp / m.mhp)), 2); } };
  for (const m of G.mons) if (visible(m.x, m.y) && inView(m.x, m.y) && !MON[m.t].big) drawMon(m);
  { const [X, Y] = at(P.x, P.y); const bob = P.skip ? Math.round(Math.sin(tt * 14) * 2) : 0;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(X + 8, Y + 14, 6, 2.5, 0, 0, 7); g.fill();
    // 向き：左右は 反転、上むきは うしろ すがた
    if (P.dir[0]) P.faceL = P.dir[0] < 0; const [lx, ly] = lunge(P.anim, now);
    dI(heroSprite(P.job, P.dir[1] < 0), X - 1 + bob + lx, Y - 2 + ly, !!P.faceL); if (P.flash > 0) { P.flash--; g.globalAlpha = .45; g.fillStyle = '#ff3030'; g.fillRect(X + 2, Y, 12, 14); g.globalAlpha = 1; } }
  for (const m of G.mons) if (visible(m.x, m.y) && inView(m.x, m.y) && MON[m.t].big) drawMon(m);
  { const [X, Y] = at(P.x, P.y); const [dx, dy] = P.dir; const ax = X + 8 + dx * 10, ay = Y + 8 + dy * 10; g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(ax - 1, ay - 1, 2, 2); g.fillRect(ax - 1 - dx, ay - 1 - dy, 2, 2); }
  if (G.boom && G.boom.t > 0) { g.globalAlpha = .25 + .1 * G.boom.t; g.fillStyle = G.boom.color; for (const [x, y] of G.boom.cells) { const [X, Y] = at(x, y); g.fillRect(X + 1, Y + 1, 14, 14); } g.globalAlpha = 1; G.boom.t--; }
  // きりつけの 光（白い 3本の すじ）
  if (G.slash) { const k = (now - G.slash.t) / ANIM_MS; if (k >= 1.2) G.slash = null; else { const [X, Y] = at(G.slash.x, G.slash.y); g.save(); g.globalAlpha = Math.max(0, 1 - k); g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.lineCap = 'round';
    const ph = Math.min(1, k * 1.6); for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(X + 3 + i * 3, Y + 2); g.lineTo(X + 3 + i * 3 + 10 * ph, Y + 2 + 12 * ph); g.stroke(); } g.restore(); } }
  if (G.fx && G.fx.t > 0) { g.fillStyle = G.fx.color; for (const [x, y] of G.fx.path) { const [X, Y] = at(x, y); g.fillRect(X + 6, Y + 6, 4, 4); } G.fx.t--; }
  // 視界のふち
  const [PX, PY] = at(P.x, P.y); const vg = g.createRadialGradient(PX + 8, PY + 8, 40, PX + 8, PY + 8, 170);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = vg; g.fillRect(0, 0, LW, LH);
  g.restore();
  if (P.pinch && !G.over) { const pu = (Math.sin(tt * 6) + 1) / 2; g.fillStyle = `rgba(255,20,20,${.18 + .25 * pu})`; const b = 5; g.fillRect(0, 0, LW, b); g.fillRect(0, LH - b, LW, b); g.fillRect(0, 0, b, LH); g.fillRect(LW - b, 0, b, LH); }
  setHtml('tags', tags.join(''));
  drawMini(tt);
  drawHud();
}
