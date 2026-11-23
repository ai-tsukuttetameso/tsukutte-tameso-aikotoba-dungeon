// 文字の大きさ（小・ふつう・大・特大）。遊ぶ人の ブラウザに おぼえておく
'use strict';

const TEXT_SIZES = [['s', '小'], ['m', 'ふつう'], ['l', '大'], ['xl', '特大']];
function getTextSize() { try { return localStorage.getItem('aikotoba_textsize') || 'm'; } catch (e) { return 'm'; } }
function setTextSize(v) {
  if (!TEXT_SIZES.some(t => t[0] === v)) v = 'm';
  document.documentElement.dataset.ts = v;
  try { localStorage.setItem('aikotoba_textsize', v); } catch (e) {}
  document.querySelectorAll('.tsrow button').forEach(b => b.classList.toggle('on', b.dataset.ts === v));
  if (typeof fitView === 'function' && typeof render === 'function') { fitView(); render(); }
}
// えらぶ ボタンの 行（タイトルと もちもの一覧に 出す）
function textSizeHtml() { const cur = getTextSize(); return `<div class="tsrow"><span>文字の大きさ</span>${TEXT_SIZES.map(([k, n]) => `<button data-ts="${k}"${k === cur ? ' class="on"' : ''}>${n}</button>`).join('')}</div>`; }
document.addEventListener('click', e => { const b = e.target.closest('.tsrow button'); if (!b) return; e.stopPropagation(); setTextSize(b.dataset.ts); }, true);
document.documentElement.dataset.ts = getTextSize();
