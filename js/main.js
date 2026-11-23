// 起動（いちばん最後に読みこむ）
'use strict';

// 画面の 大きさに あわせて、地図に うつす マスの数と 地図の 大きさを きめる
// スマホ：タイトルは 高さ いっぱい。冒険中は ボタンまで 1画面に おさまるよう、のこりの 高さに 地図を あわせる
const twoCol = () => innerWidth >= 900 || (innerWidth >= 640 && innerHeight <= 520);
function fitView() {
  const narrow = innerWidth < 640, st = document.querySelector('.stage'), box = document.querySelector('.stagebox');
  let vh = 11, width = '';
  VW = narrow ? 11 : 17;
  if (narrow && overKind === 'title') vh = Math.max(17, Math.min(26, Math.floor(VW * (innerHeight - 24) / Math.max(1, innerWidth - 24))));
  else if (narrow) {
    // 地図いがいの 高さを ひいた のこり（上下の すきま・すき間の ぶんも ひく）
    const wrap = document.querySelector('.wrap'), cs = getComputedStyle(wrap), gap = parseFloat(cs.rowGap) || 0;
    const others = [...wrap.children].filter(el => el !== box && el.offsetParent !== null);
    const used = others.reduce((s, el) => s + el.getBoundingClientRect().height, 0) + gap * others.length + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const w = box.clientWidth || innerWidth - 24, h = Math.max(150, innerHeight - used - 4);
    // 縦長なら 下を 多めに 見せる（まんなかに 自分が 来るよう 奇数に）
    const r = VW * h / w; vh = Math.max(9, Math.min(15, 2 * Math.round((r - 1) / 2) + 1));
    width = Math.floor(Math.min(w, h * VW / vh)) + 'px';
  }
  VH = vh; titleZoom = 2;
  if (cv.width !== VW * TS * 2 || cv.height !== VH * TS * 2) { cv.width = VW * TS * 2; cv.height = VH * TS * 2; }
  st.style.aspectRatio = VW + '/' + VH;
  // タブレットの たて：地図いがいの 高さを ひいた のこりに おさめる
  if (!narrow && !twoCol()) { const wrap = document.querySelector('.wrap'), cs = getComputedStyle(wrap), gap = parseFloat(cs.rowGap) || 0;
    const others = [...wrap.children].filter(el => el !== box && el.offsetParent !== null);
    const used = others.reduce((s, el) => s + el.getBoundingClientRect().height, 0) + gap * others.length + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const h = Math.max(200, innerHeight - used - 8); width = Math.floor(Math.min(box.clientWidth || innerWidth - 24, h * VW / VH)) + 'px'; }
  if (twoCol() && !(overKind === 'title' && innerWidth < 900)) { const r = box.getBoundingClientRect(); width = Math.floor(Math.min(r.width, r.height * VW / VH)) + 'px'; }
  st.style.width = width;
  // スマホの もちもの一覧が 下の ボタンに かぶらないよう、ボタンの 高さを CSS に わたす
  if (narrow) { const row = document.querySelector('.row'); if (row && row.offsetParent !== null) document.documentElement.style.setProperty('--ctlh', Math.ceil(row.getBoundingClientRect().height + 8) + 'px'); }
}
addEventListener('resize', () => { fitView(); render(); }); fitView();
// わざの 数や ログの 行が かわって 高さが かわったら、地図の 大きさを あわせなおす
if (window.ResizeObserver) { let pend = 0; const ro = new ResizeObserver(() => { if (pend || twoCol()) return; pend = requestAnimationFrame(() => { pend = 0; fitView(); render(); }); });
  ['hud', 'log'].forEach(id => ro.observe(document.getElementById(id))); ro.observe(document.querySelector('.row')); }
newGame('random', null, 10, 1, true); showOver('title'); render();
setInterval(render, 100);
