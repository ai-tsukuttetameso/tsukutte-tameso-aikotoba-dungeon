// 右上の地図と たんけん率
'use strict';

// ===== 地図（ミニマップ） =====
const mm = document.getElementById('mm'), mg = mm.getContext('2d');
const mmw = document.getElementById('mmw'); mmw.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); mmw.classList.toggle('big'); render(); });
function explored() { let s = 0, a = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (G.map[y][x] > 0) { a++; if (G.seen[y][x]) s++; } return Math.round(s / a * 100); }
function drawMini(tt) {
  const k = 3; mg.clearRect(0, 0, mm.width, mm.height);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (G.map[y][x] === 0 || !(G.seen[y][x] || G.known)) continue;
    mg.fillStyle = !G.seen[y][x] ? 'rgba(150,140,200,.4)' : G.map[y][x] === 1 ? 'rgba(90,120,255,.55)' : 'rgba(140,160,255,.45)'; mg.fillRect(x * k, y * k, k, k); }
  if (G.portal) { mg.fillStyle = '#c08cff'; mg.fillRect(G.portal.x * k - 1, G.portal.y * k - 1, k + 2, k + 2); }
  if (G.seen[G.stairs.y][G.stairs.x] || G.known) { mg.fillStyle = '#7cf0a0'; mg.fillRect(G.stairs.x * k - 1, G.stairs.y * k - 1, k + 2, k + 2); }
  if (G.npc && G.seen[G.npc.y][G.npc.x]) { mg.fillStyle = '#7cf0a0'; mg.fillRect(G.npc.x * k, G.npc.y * k, k, k); }
  if (G.shop && G.seen[G.shop.y][G.shop.x]) { mg.fillStyle = '#ffd23f'; mg.fillRect(G.shop.x * k - 1, G.shop.y * k - 1, k + 2, k + 2); }
  for (const it of G.items) if (G.seen[it.y][it.x]) { mg.fillStyle = '#4fd8ff'; mg.fillRect(it.x * k, it.y * k, k, k); }
  for (const t of G.traps) if (t.found) { mg.fillStyle = '#c070ff'; mg.fillRect(t.x * k, t.y * k, k, k); }
  for (const m of G.mons) { const v = visible(m.x, m.y); if (!v && !G.seen[m.y][m.x]) continue; mg.fillStyle = v ? '#ff4a4a' : (m.t === 'keeper' || MON[m.t].big ? '#ff7a2acc' : '#ff4a4a99'); const s = MON[m.t].big ? k + 2 : k; mg.fillRect(m.x * k - (s - k) / 2, m.y * k - (s - k) / 2, s, s); }
  if (Math.sin(tt * 8) > -.5) { mg.fillStyle = '#fff'; mg.fillRect(P.x * k - 1, P.y * k - 1, k + 2, k + 2); }
  const pct = explored(); const ml = document.getElementById('mmlabel'); const mt = `たんけん ${pct}%` + (pct >= 100 ? ' ★' : ''); if (ml.textContent !== mt) { ml.textContent = mt; ml.classList.toggle('full', pct >= 100); }
  if (pct >= 100 && !G.fullBonus) { G.fullBonus = true; const b = 30 * G.f; P.gold += b; say(`この階を ぜんぶ たんけんした！ ボーナス ${b}G`); }
}
