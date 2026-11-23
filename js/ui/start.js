// はじめる 階を えらぶ（10階ごとに とどいた 階・冒険者の レベルに あわせた 階から はじめられる）
'use strict';

// レベルで いきなり 行ける いちばん 深い 階：レベルと 同じ 階まで（5階きざみ）。例：Lv15→地下15階、Lv23→地下20階
// depth（ダンジョンの 深さ）が きまっているときは、ボスの 階より 手前まで
const levelMaxFloor = lv => Math.floor(lv / 5) * 5;
function levelStartFloor(lv, depth) { const cap = Math.floor((depth - 1) / 5) * 5, f = Math.min(levelMaxFloor(lv), cap); return f >= 5 ? f : 0; }
// 新しい ダンジョン（はじめる）は 深い階から はじめるとき、その階より 深い ダンジョンを つくる（地下15階から → 地下20階まで）
const randomDepthFor = f => DEPTHS.find(d => d > f) || DEPTHS[DEPTHS.length - 1];
// はじめる 階を えらぶ。えらべる 階：地下1階・10階ごとに とどいた 階（合言葉・今日のダンジョン）・レベルに あわせた 階（5階きざみで 自分で えらぶ）
// えらぶ物が なければ そのまま 地下1階から はじめる
function pickStart(mode, pw, depth = 10) {
  const key = mode === 'daily' ? 'きょうの' + todayKey() : pw, fixedD = mode === 'pw' ? depth : 10;
  const fs = mode === 'random' ? [1] : cpFloors(key, fixedD), lv = loadHero().lv || 1;
  const lmax = mode === 'random' ? Math.min(levelMaxFloor(lv), 95) : levelStartFloor(lv, fixedD);
  const go = f => { closeStartPick(); const d = mode === 'random' ? (f > 1 ? randomDepthFor(f) : 10) : fixedD; newGame(mode, pw, d, f); render(); };
  if (fs.length < 2 && lmax < 5) return go(1);
  closeStartPick();
  let pickF = lmax;
  const where = mode === 'daily' ? '今日のダンジョン（地下10階）' : mode === 'pw' ? `合言葉「${escH(pw)}」（地下${fixedD}階）` : '新しい ダンジョン';
  const more = mode !== 'random' && levelMaxFloor(lv) > lmax ? `<br><small>Lv${lv}なら 地下${levelMaxFloor(lv)}階まで 行けます。${mode === 'pw' ? '深さを もっと 深く すると えらべます' : '「はじめる」の 新しい ダンジョンなら えらべます'}</small>` : '';
  const stepHtml = () => `<div class="lvstep"><button data-lvstep="-5"${pickF <= 5 ? ' disabled' : ''}>−</button><b>地下${pickF}階</b><button data-lvstep="5"${pickF >= lmax ? ' disabled' : ''}>＋</button></div>`
    + `<button data-startf="lv" class="on">地下${pickF}階から はじめる${mode === 'random' ? `<small>（地下${randomDepthFor(pickF)}階まで）</small>` : ''}</button>`;
  over.insertAdjacentHTML('beforeend', `<div class="startpick" id="startPick"><div class="spbox"><h2>どこから はじめる？</h2>`
    + `<p class="help">${where}${fs.length > 1 ? `は 地下${fs[fs.length - 1]}階まで とどいています` : ''}${more}</p>`
    + fs.map(f => `<button data-startf="${f}">地下${f}階から${f === 1 ? '（さいしょから）' : '（とどいた 階）'}</button>`).join('')
    + (lmax >= 5 ? `<p class="help">冒険者 Lv${lv}：レベルに あわせて 深い階から（5階きざみで えらべます）</p><div id="lvPick">${stepHtml()}</div>` : '')
    + `<button data-startback="1" class="alt">もどる</button></div></div>`);
  const box = document.getElementById('startPick');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.startback) return closeStartPick();
    if (b.dataset.lvstep) { pickF = Math.max(5, Math.min(lmax, pickF + +b.dataset.lvstep)); document.getElementById('lvPick').innerHTML = stepHtml(); sfx('pick'); return; }
    if (b.dataset.startf) go(b.dataset.startf === 'lv' ? pickF : +b.dataset.startf); });
}
function closeStartPick() { const b = document.getElementById('startPick'); if (b) b.remove(); }
