// 起動（いちばん最後に読みこむ）
'use strict';

// スマホの タイトルは 画面の 高さ いっぱいまで 広げる
function fitView() { const narrow = innerWidth < 640; VW = narrow ? 11 : 17; VH = narrow && overKind === 'title' ? Math.max(17, Math.min(26, Math.floor(VW * (innerHeight - 24) / Math.max(1, innerWidth - 24)))) : 11; titleZoom = 2; cv.width = VW * TS * 2; cv.height = VH * TS * 2; const st = document.querySelector('.stage'); st.style.aspectRatio = VW + '/' + VH;
  if (innerWidth >= 900) { const r = document.querySelector('.stagebox').getBoundingClientRect(); st.style.width = Math.floor(Math.min(r.width, r.height * VW / VH)) + 'px'; } else st.style.width = ''; }
addEventListener('resize', () => { fitView(); render(); }); fitView();
newGame('random', null, 10, 1, true); showOver('title'); render();
setInterval(render, 100);
