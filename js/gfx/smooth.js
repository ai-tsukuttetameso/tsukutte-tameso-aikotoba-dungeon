// ドット絵を 2倍に するとき、ななめの ギザギザを なめらかに する（Scale2x という 決まった やり方）
'use strict';

const _smooth = new Map();
// n 回 くりかえすと 2・4・8倍。結果は おぼえておいて 使いまわす
function smooth(sp, n = 1) { const key = sp; let list = _smooth.get(key); if (!list) _smooth.set(key, list = [sp]);
  while (list.length <= n) list.push(scale2x(list[list.length - 1])); return list[n]; }
// 左右 はんてんした 絵（向きを かえるとき）。おぼえて 使いまわす
const _flip = new Map();
function flipX(sp) { let c = _flip.get(sp); if (c) return c; c = document.createElement('canvas'); c.width = sp.width; c.height = sp.height;
  const x = c.getContext('2d'); x.translate(sp.width, 0); x.scale(-1, 1); x.drawImage(sp, 0, 0); _flip.set(sp, c); return c; }
function scale2x(src) {
  const w = src.width, h = src.height, s = src.getContext('2d').getImageData(0, 0, w, h), a = new Uint32Array(s.data.buffer);
  const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const x2 = c.getContext('2d'), o = x2.createImageData(w * 2, h * 2), b = new Uint32Array(o.data.buffer);
  const px = (x, y) => a[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const P = px(x, y), A = px(x, y - 1), B = px(x + 1, y), C = px(x - 1, y), D = px(x, y + 1);
    const i = y * 2 * w * 2 + x * 2;
    b[i] = C === A && C !== D && A !== B ? A : P;
    b[i + 1] = A === B && A !== C && B !== D ? B : P;
    b[i + w * 2] = D === C && D !== B && C !== A ? C : P;
    b[i + w * 2 + 1] = B === D && B !== A && D !== C ? D : P; }
  x2.putImageData(o, 0, 0); return c; }
