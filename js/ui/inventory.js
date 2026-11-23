// もちもの一覧のポップアップ
'use strict';

function drawInvPop() {
  if (invpop.hidden) return;
  invpop.dataset.mode = 'inv';
  setTimeout(() => { const s = invpop.querySelector('.row1.sel'); if (s) s.scrollIntoView({ block: 'nearest' }); }, 0);
  tidyEq(); invSel = Math.min(invSel, Math.max(0, P.inv.length - 1));
  invpop.innerHTML = `<div class="help">もちもの ${invCount()}/${INV_MAX}（そうび中の物は 数えない）　（なげる・矢・杖は 最後に 向いた方向へ とびます）<br>キーボード：↑↓でえらぶ／Enter 使う／T なげる／X おく／R ならべかえ／B 袋の中身／I とじる</div><button data-sort="1">ならべかえ</button>${myBags().length ? '<button data-bags="1">袋の中身 一覧（B）</button><button data-stash="1">袋に ぜんぶ しまう</button>' : ''}` + (P.inv.length ? P.inv.map((o, i) => (o.eq && (i === 0 || !P.inv[i - 1].eq) ? '<div class="eqhd">そうびバッグ（もちものに 数えない）</div>' : '') + `<div class="row1${i === invSel ? ' sel' : ''}"><button data-i="${i}"${o.eq ? ' class="eq"' : ''}>${o.eq ? '[E] ' : ''}${nameHtml(o)}<br><small style="color:#a79fb8">${ITEMS[o.k].equip ? (o.eq ? 'タップで はずす' : 'タップで そうび') + '・' : ''}${itemDesc(o)}</small></button><button class="s" data-t="${i}">なげる</button><button class="s" data-d="${i}">おく</button></div>`).join('') : '<span class="help">なにも もっていない</span>') + ' <button data-close="1">とじる</button>';
}
invpop.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.close) { invpop.hidden = true; return; }
  if (invpop.dataset.mode === 'shop') { shopClick(b); return; }
  if (invpop.dataset.mode === 'bag') { bagClick(b); return; }
  if (invpop.dataset.mode === 'bags') { bagsClick(b); return; }
  if (b.dataset.bags) { drawBags(); return; }
  if (b.dataset.stash) { stashAll(); render(); drawInvPop(); return; }
  if (invpop.dataset.mode === 'quit') { quitClick(b); return; }
  if (invpop.dataset.mode === 'log' || invpop.dataset.mode === 'save') return;
  if (invpop.dataset.mode === 'skill') { skillPopClick(b); return; }
  if (b.dataset.sort) { sortInv(); return; }
  invpop.hidden = true;
  if (b.dataset.t !== undefined) throwItem(+b.dataset.t); else if (b.dataset.d !== undefined) dropItem(+b.dataset.d); else useItem(+b.dataset.i); });
