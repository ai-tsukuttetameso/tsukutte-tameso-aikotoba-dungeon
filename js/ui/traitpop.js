// 装備の 特性を 別の 小窓で 見る（もちもの・もちもの一覧の「特性」ボタンから）
'use strict';
const trBtn = (o, i) => ITEMS[o.k].equip && isKnown(o.k) ? `<button class="s trbtn" data-tr="${i}" title="特性を 見る">特性${(o.traits || []).length}</button>` : '';
function showTraitPop(o) { if (!o || !ITEMS[o.k].equip || !isKnown(o.k)) return; closeTraitPop(); const cap = traitCap(o), tr = o.traits || [];
  const box = document.createElement('div'); box.id = 'trpop'; box.className = 'trpop';
  box.innerHTML = `<div class="trcard" role="dialog" aria-label="特性"><div class="trhd"><b>${nameHtml(o)}</b><button data-trclose="1">とじる</button></div>`
    + `<div class="trsub">${SLOT_NAME[ITEMS[o.k].equip] || ''}　特性 ${tr.length}/${cap}${o.eq ? '　［そうび中］' : ''}</div>`
    + (tr.map(t => `<div class="trrow"><b>${TRAITS[t].name}</b><small>${TRAITS[t].desc}</small></div>`).join('') + Array.from({ length: Math.max(0, cap - tr.length) }, () => '<div class="trrow empty"><small>（あき）合成で 特性を 入れられる</small></div>').join(''))
    + (o.cursed && o.curseKnown ? '<div class="trrow cur"><small>のろわれている（はずせない）</small></div>' : '') + '</div>';
  box.addEventListener('click', e => { if (e.target === box || e.target.closest('[data-trclose]')) closeTraitPop(); });
  document.body.appendChild(box); }
function closeTraitPop() { const b = document.getElementById('trpop'); if (b) b.remove(); }
// 小窓が 出ている あいだは キーで とじるだけ（ゲームには つたえない）
addEventListener('keydown', e => { if (!document.getElementById('trpop')) return; e.preventDefault(); e.stopImmediatePropagation(); if (['Escape', 'Enter', ' ', 'i', 'I'].includes(e.key)) closeTraitPop(); }, true);
