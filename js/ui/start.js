// はじめる 階を えらぶ（10階ごとに とどいた 階から 再開できる）
'use strict';

// 合言葉・今日のダンジョンで、とどいた 階が あれば「地下1階から／10階から／20階から…」を えらばせる。なければ そのまま はじめる
function pickStart(mode, pw, depth = 10) {
  const key = mode === 'daily' ? 'きょうの' + todayKey() : pw, d = mode === 'daily' ? 10 : depth, fs = cpFloors(key, d);
  const go = f => { closeStartPick(); newGame(mode, pw, d, f); render(); };
  if (fs.length < 2) return go(1);
  closeStartPick();
  over.insertAdjacentHTML('beforeend', `<div class="startpick" id="startPick"><div class="spbox"><h2>どこから はじめる？</h2>`
    + `<p class="help">${mode === 'daily' ? '今日のダンジョン' : `合言葉「${escH(pw)}」（地下${d}階）`}は 地下${fs[fs.length - 1]}階まで とどいています</p>`
    + fs.map(f => `<button data-startf="${f}"${f === fs[fs.length - 1] ? ' class="on"' : ''}>地下${f}階から${f === 1 ? '（さいしょから）' : ''}</button>`).join('')
    + `<button data-startback="1" class="alt">もどる</button></div></div>`);
  const box = document.getElementById('startPick');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.startback) return closeStartPick(); if (b.dataset.startf) go(+b.dataset.startf); });
}
function closeStartPick() { const b = document.getElementById('startPick'); if (b) b.remove(); }
