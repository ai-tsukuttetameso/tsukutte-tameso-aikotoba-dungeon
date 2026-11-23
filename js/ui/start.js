// はじめる 階を えらぶ（10階ごとに とどいた 階から 再開できる）
'use strict';

// レベルが 高いときに いきなり 行ける 階：レベルの 8わりくらい（5階きざみ）。ボスの 階より 手前まで
// 例：Lv10→地下5階、Lv20→地下15階、Lv40→地下30階
function levelStartFloor(lv, depth) { const f = Math.floor(lv * .8 / 5) * 5, cap = Math.floor((depth - 1) / 5) * 5; return Math.min(f, cap) >= 5 ? Math.min(f, cap) : 0; }
// はじめる 階を えらぶ。えらべる 階：地下1階・10階ごとに とどいた 階（合言葉・今日のダンジョン）・レベルに あわせた 階
// えらぶ物が なければ そのまま 地下1階から はじめる
function pickStart(mode, pw, depth = 10) {
  const d = mode === 'pw' ? depth : 10, key = mode === 'daily' ? 'きょうの' + todayKey() : pw;
  const fs = mode === 'random' ? [1] : cpFloors(key, d), lv = loadHero().lv || 1, lf = levelStartFloor(lv, d);
  const go = f => { closeStartPick(); newGame(mode, pw, d, f); render(); };
  const opts = fs.map(f => ({ f, label: `地下${f}階から${f === 1 ? '（さいしょから）' : '（とどいた 階）'}` }));
  if (lf && !fs.includes(lf)) opts.push({ f: lf, label: `地下${lf}階から（Lv${lv}に あわせて）`, lv: true });
  opts.sort((a, b) => a.f - b.f);
  if (opts.length < 2) return go(1);
  const best = Math.max(...opts.map(o => o.f));
  closeStartPick();
  const where = mode === 'daily' ? '今日のダンジョン' : mode === 'pw' ? `合言葉「${escH(pw)}」（地下${d}階）` : '新しい ダンジョン（地下10階）';
  over.insertAdjacentHTML('beforeend', `<div class="startpick" id="startPick"><div class="spbox"><h2>どこから はじめる？</h2>`
    + `<p class="help">${where}${fs.length > 1 ? `は 地下${fs[fs.length - 1]}階まで とどいています` : ''}${lf ? `<br>冒険者が Lv${lv}なので、浅い階は 敵が 弱すぎるかも。地下${lf}階から いきなり はじめられます` : ''}</p>`
    + opts.map(o => `<button data-startf="${o.f}"${o.f === best ? ' class="on"' : ''}>${o.label}</button>`).join('')
    + `<button data-startback="1" class="alt">もどる</button></div></div>`);
  const box = document.getElementById('startPick');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.startback) return closeStartPick(); if (b.dataset.startf) go(+b.dataset.startf); });
}
function closeStartPick() { const b = document.getElementById('startPick'); if (b) b.remove(); }
