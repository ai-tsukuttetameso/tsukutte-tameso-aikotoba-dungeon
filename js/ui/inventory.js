// もちもの一覧のポップアップ
'use strict';

// タブ：もちもの／そうび（スマホで 下まで スクロールしなくても 見られるように）
let invTab = (() => { try { return localStorage.getItem('aikotoba_invtab') === 'eq' ? 'eq' : 'bag'; } catch (e) { return 'bag'; } })();
function setInvTab(t) { invTab = t === 'eq' ? 'eq' : 'bag'; try { localStorage.setItem('aikotoba_invtab', invTab); } catch (e) {} const v = invVisible(); if (v.length && !v.includes(invSel)) invSel = v[0]; drawInvPop(); }
// いまの タブに 出す もちものの 番号（P.inv の 何番目か）
const invVisible = () => P.inv.map((o, i) => i).filter(i => !!P.inv[i].eq === (invTab === 'eq'));
// ↑↓で となりの 物へ（いまの タブの 中だけ）
function invStep(d) { const v = invVisible(); if (!v.length) return; const k = v.indexOf(invSel); invSel = v[k < 0 ? 0 : Math.max(0, Math.min(v.length - 1, k + d))]; drawInvPop(); }
function drawInvPop() {
  if (invpop.hidden) return;
  invpop.dataset.mode = 'inv';
  setTimeout(() => { const s = invpop.querySelector('.row1.sel'); if (s) s.scrollIntoView({ block: 'nearest' }); }, 0);
  tidyEq(); invSel = Math.min(invSel, Math.max(0, P.inv.length - 1));
  const vis = invVisible(); if (vis.length && !vis.includes(invSel)) invSel = vis[0];
  const nEq = P.inv.filter(o => o.eq).length;
  const tabs = `<div class="tabs invtabs"><button data-invtab="bag"${invTab === 'bag' ? ' class="on"' : ''}>もちもの ${invCount()}/${INV_MAX}</button><button data-invtab="eq"${invTab === 'eq' ? ' class="on"' : ''}>そうび中 ${nEq}</button><button data-close="1">とじる</button></div>`;
  const help = `<div class="help">${invTab === 'eq' ? 'そうび中の 物は もちものの 数に 入らない。タップで はずす' : 'タップで 使う・そうび'}<span class="kb">　（なげる・矢・杖は 最後に 向いた方向へ とびます）<br>キーボード：↑↓でえらぶ／←→で タブ／Enter 使う／T なげる／X おく／R ならべかえ／B 袋の中身／I とじる</span></div>`;
  const sortRow = invTab === 'bag' ? `<div class="sortrow"><span>ならび</span>${SORT_MODES.map(([k, n]) => `<button data-sortby="${k}"${k === getSortMode() ? ' class="on"' : ''}>${n}</button>`).join('')}</div>${myBags().length ? '<button data-bags="1">袋の中身 一覧（B）</button><button data-stash="1">袋に ぜんぶ しまう</button>' : ''}` : '';
  const row = i => { const o = P.inv[i]; return `<div class="row1${i === invSel ? ' sel' : ''}"><button data-i="${i}"${o.eq ? ' class="eq"' : ''}>${o.eq ? '[E] ' : ''}${nameHtml(o)}<small class="idesc">${ITEMS[o.k].equip ? (o.eq ? 'タップで はずす' : 'タップで そうび') + '・' : ''}${itemDesc(o)}</small>${invTab === 'eq' && o.traits && o.traits.length ? `<small class="trdesc">${o.traits.map(t => `<b>${TRAITS[t].name}</b>：${TRAITS[t].desc}`).join('<br>')}</small>` : ''}</button><button class="s" data-t="${i}">なげる</button><button class="s" data-d="${i}">おく</button></div>`; };
  invpop.innerHTML = tabs + help + sortRow + (vis.length ? vis.map(row).join('') : `<span class="help">${invTab === 'eq' ? 'なにも そうび していない' : 'なにも もっていない'}</span>`) + textSizeHtml();
}
invpop.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.close) { invpop.hidden = true; return; }
  if (invpop.dataset.mode === 'shop') { shopClick(b); return; }
  if (invpop.dataset.mode === 'bag') { bagClick(b); return; }
  if (invpop.dataset.mode === 'bags') { bagsClick(b); return; }
  if (b.dataset.bags) { openBags(); return; }
  if (b.dataset.stash) { stashAll(); render(); drawInvPop(); return; }
  if (invpop.dataset.mode === 'quit') { quitClick(b); return; }
  if (invpop.dataset.mode === 'log' || invpop.dataset.mode === 'save') return;
  if (invpop.dataset.mode === 'skill') { skillPopClick(b); return; }
  if (b.dataset.invtab) { setInvTab(b.dataset.invtab); return; }
  if (b.dataset.sortby) { setSortMode(b.dataset.sortby); sortInv(); return; }
  if (b.dataset.sort) { sortInv(); return; }
  invpop.hidden = true;
  if (b.dataset.t !== undefined) throwItem(+b.dataset.t); else if (b.dataset.d !== undefined) dropItem(+b.dataset.d); else useItem(+b.dataset.i); });
