// オープニングの絵
'use strict';

// ===== オープニングの絵 =====
const dust = Array.from({ length: 30 }, () => ({ x: Math.random(), y: Math.random(), s: .2 + Math.random() * .6 }));
// タイトルは 画面に たいして 2倍の こまかさで かく（titleZoom。パソコンの 広い画面だけ）
let titleZoom = 1;  // 2のとき、絵は smooth() で なめらかに した 2倍の 絵を つかう
function drawTitle(tt) {
  const Wd = cv.width, Ht = cv.height, cols = Math.ceil(Wd / TS), Z = titleZoom;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#07050c'; g.fillRect(0, 0, Wd, Ht);
  // 奥の 暗い大広間（かべの 高さは 画面の 3わりほど）
  const wr = Math.max(3, Math.round(Ht / TS * .3));
  for (let j = 0; j < wr; j++) for (let i = 0; i < cols; i++) g.drawImage(WALL_TOP, i * TS, j * TS);
  for (let i = 0; i < cols; i++) g.drawImage(WALL_FRONT[i % 3 === 0 ? 1 : 0], i * TS, wr * TS);
  for (let j = wr + 1; j < Math.ceil(Ht / TS); j++) for (let i = 0; i < cols; i++) g.drawImage(FLOOR[(i * 7 + j * 3) % 4], i * TS, j * TS);
  // たいまつ
  const tcs = Z > 1 ? [2, Math.round(cols * .3), cols - 1 - Math.round(cols * .3), cols - 3] : [2, cols - 3];
  g.globalCompositeOperation = 'lighter';
  for (const tx of tcs) { const cx = tx * TS + 8, cy = wr * TS + 6, r = 46 + Math.sin(tt * 7 + tx) * 4; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, 'rgba(255,150,60,.45)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(cx - r, cy - r, r * 2, r * 2); }
  g.globalCompositeOperation = 'source-over';
  for (const tx of tcs) g.drawImage(TORCH, tx * TS + 5, wr * TS + 4 + (Math.sin(tt * 8 + tx) > .6 ? -1 : 0));
  // でかこわの王（大きく、ゆっくり ゆれる）
  // 文字と ボタンの あいだ（画面の 35〜65%）に おさまる 大きさに する
  const dk = S.dekakowa, sc = Z > 1 ? 3 : 2, dw = dk.width * sc, dh = dk.height * sc, dx = Math.round(Wd / 2 - dw / 2), dy = Math.round(Ht * .35 + Math.sin(tt * 1.3) * 2);
  g.save(); g.globalAlpha = .92; if (Z > 1) { g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(smooth(dk, 2), dx, dy, dw, dh); } else g.drawImage(dk, dx, dy, dw, dh); g.restore(); g.imageSmoothingEnabled = false;
  // まわりの 敵たち（[絵, 中心からの 横の位置, 縦の位置（画面の 割合）]）
  const mons = [['kinoko', -.27, .55], ['bat', -.2, .38], ['cat', .27, .56], ['robo', .2, .42], ['rat', -.38, .6]];
  if (Z > 1) mons.push(['lamp', -.33, .4], ['golem', .36, .48], ['bat2', .3, .34], ['dragon', -.44, .5], ['robo2', .44, .58]);
  const ms = Z;  // こまかい画面では なめらかに した 2倍の 絵を つかう
  const put = (sp, x, y, s) => { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + 8 * s, y + 15 * s, 6 * s, 2.5 * s, 0, 0, 7); g.fill(); const img = s > 1 ? smooth(sp, 1) : sp; g.drawImage(img, x, y, sp.width * s, sp.height * s); };
  for (const [k, fx, fy] of mons) { const sp = S[MON[k] ? MON[k].spr : k]; const x = Math.round(Wd / 2 + fx * Wd - 8 * ms), y = Math.round(fy * Ht + Math.sin(tt * 4 + fx * 9) * 1.5);
    if (x < -8 || x > Wd - 8) continue; put(sp, x, y, ms); }
  // 主人公と なかま（うーたん・タメゾウ）
  // でかこわの 足もとの 前に 主人公、左右に うーたんと タメゾウ
  const hy = Math.round(dy + dh - 18 * ms), hop = k => Math.round(Math.abs(Math.sin(tt * 3 + k)) * -1);
  put(S.uutan, Math.round(dx - 12 * ms), hy + hop(1), ms);
  put(S.tamezou, Math.round(dx + dw - 4 * ms), hy + hop(2), ms);
  put(heroLook(curJob), Math.round(Wd / 2 - 9 * ms), hy + 6 * ms + hop(0), ms);
  // ちり
  g.fillStyle = 'rgba(255,220,180,.5)'; for (const d of dust) { d.y -= .002 * d.s; d.x += Math.sin(tt + d.y * 9) * .0007; if (d.y < 0) { d.y = 1; d.x = Math.random(); } g.fillRect(Math.round(d.x * Wd), Math.round(d.y * Ht), Z, Z); }
  // 画面のふち
  const vg = g.createRadialGradient(Wd / 2, Ht / 2, 40 * Z, Wd / 2, Ht / 2, Wd * .7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.7)'); g.fillStyle = vg; g.fillRect(0, 0, Wd, Ht);
}
