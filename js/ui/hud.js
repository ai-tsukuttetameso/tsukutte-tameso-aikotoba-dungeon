// 上のステータス表示と 右の もちもの一覧
'use strict';

const SORT_ORDER = ['dou_ken', 'sword', 'hagane_ken', 'honoo_ken', 'koori_ken', 'ikazuchi_ken', 'hikari_ken', 'yari', 'hagane_yari', 'honoo_yari', 'ryuu_yari', 'tsue', 'rune_tsue', 'honoo_tsue', 'kenja_tsue', 'muchi', 'ibara_muchi', 'kusari_muchi', 'boomerang', 'hagane_boom', 'hoshi_boom', 'shield', 'hoshi_tate', 'kawa_boushi', 'tetsu_kabuto', 'mahou_boushi', 'ryuu_kabuto', 'kawa_kote', 'tetsu_kote', 'kawa_kutsu', 'hayate_kutsu', 'arrow', 'bread', 'onigiri', 'nori_ben', 'karaage_ben', 'shake_ben', 'curry_ben', 'maku_ben', 'toku_ben', 'kin_tamago', 'ruby', 'sapphire', 'emerald', 'diamond', 'kinkai', 'herb', 'sticker', 'charm', 'grass', 'scroll', 'wand', 'bag', 'omamori'];
function sortInv() { const rank = o => { const it = ITEMS[o.k]; const g = SORT_ORDER.indexOf(it.cat || o.k); return (g < 0 ? 99 : g) * 100 + (o.eq ? 5000 : 0) - (o.plus || 0); };
  P.inv.sort((a, b) => rank(a) - rank(b) || (isKnown(a.k) ? ITEMS[a.k].name : FAKE[a.k]).localeCompare(isKnown(b.k) ? ITEMS[b.k].name : FAKE[b.k], 'ja'));
  say('もちものを ならべかえた。'); render(); if (!invpop.hidden && invpop.dataset.mode === 'inv') drawInvPop(); }
const _htmlCache = {};
// 中身が かわった ときだけ 書きかえる（ボタンが 押している途中で 消えないように）
function setHtml(id, html) { if (_htmlCache[id] === html) return; _htmlCache[id] = html; document.getElementById(id).innerHTML = html; }
const KEYLBL = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '^'];
function drawHud() {
  const low = P.hp <= P.mhp * .3, hungry = P.food <= 15;
  const hud = [
    runMode === 'daily' ? `<span>${icon('sun', '今日のダンジョン')}<b>今日のダンジョン</b></span>` : `<span>${icon('key', '合言葉')}合言葉 <b>${escH(password)}</b>${treasure ? ' <small class="tre">おたから</small>' : ''}</span>`,
    `<span>${icon('stairs', '階')}地下<b>${G.f}</b>/${LAST}階</span>`,
    `<span>${icon('star', 'レベル')}Lv <b>${P.lv}</b> <small class="nx">つぎまで ${expNext()}</small></span>`,
    `<span class="${P.pinch ? 'low pinch' : low ? 'low' : ''}">${icon('heart', 'HP')}HP <b>${Math.max(0, P.hp)}</b>/${P.mhp}</span>`,
    `<span>${icon('drop', 'MP')}MP <b class="mpv">${P.mp}</b>/${P.mmp}</span>`,
    `<span class="${hungry ? 'low' : ''}">${icon('rice', 'おなか')}おなか <b>${P.food}</b>%</span>`,
    `<span>${icon('coin', 'ゴールド')}ゴールド <b>${P.gold}</b></span>`,
    `<span>${icon('sword', 'こうげき')}こうげき <b>${atkTotal()}</b></span>`,
    `<span>${icon('shield', 'ぼうぎょ')}ぼうぎょ <b>${defTotal()}</b></span>`,
    `<span>${icon('armor', 'そうび')}そうび <b>${eqName('atk')}</b>／防具 <b>${ARMOR_SLOTS.filter(eqItem).length}</b>/${ARMOR_SLOTS.length}</span>`,
    `<span>${icon('hourglass', 'ターン')}ターン ${P.turn}</span>`,
  ];
  // スマホは 1行を みじかく（文字を へらして、2〜3行に おさめる）
  const hudS = [
    `<span>${icon('stairs', '階')}<b>${G.f}</b>/${LAST}階</span>`,
    `<span>${icon('star', 'レベル')}Lv<b>${P.lv}</b></span>`,
    `<span class="${P.pinch ? 'low pinch' : low ? 'low' : ''}">${icon('heart', 'HP')}<b>${Math.max(0, P.hp)}</b>/${P.mhp}</span>`,
    `<span>${icon('drop', 'MP')}<b class="mpv">${P.mp}</b>/${P.mmp}</span>`,
    `<span class="${hungry ? 'low' : ''}">${icon('rice', 'おなか')}<b>${P.food}</b>%</span>`,
    `<span>${icon('coin', 'ゴールド')}<b>${P.gold}</b>G</span>`,
    `<span>${icon('sword', 'こうげき')}<b>${atkTotal()}</b></span>`,
    `<span>${icon('shield', 'ぼうぎょ')}<b>${defTotal()}</b></span>`,
    `<span>${icon('hourglass', 'ターン')}${P.turn}</span>`,
    treasure ? '<span><small class="tre">おたから</small></span>' : '',
  ];
  setHtml('hud', (innerWidth < 640 ? hudS : hud).join(''));
  document.getElementById('log').innerHTML = logs.map(l => `<div>${l}</div>`).join('');
  const db = document.getElementById('downBtn'); if (db) db.disabled = !(P.x === G.stairs.x && P.y === G.stairs.y);
  tidyEq(); const row = (o, i) => `<span class="it"><button data-i="${i}" title="${itemDesc(o)}"${o.eq ? ' class="eq"' : ''}>${o.eq ? '[E] ' : KEYLBL[i] + '. '}${nameHtml(o)}${ITEMS[o.k].equip ? `<small class="eqtag">${o.eq ? 'はずす' : 'そうび'}</small>` : ''}</button><button class="s" data-t="${i}" title="向いている方向に投げる">なげ</button><button class="s" data-d="${i}" title="足もとに おく">おく</button></span>`;
  const eqHead = P.inv.some(o => o.eq) ? `<div class="eqhd">そうびバッグ（もちものに 数えない）</div>` : '';
  setHtml('inv', P.inv.length ? P.inv.map((o, i) => (o.eq && (i === 0 || !P.inv[i - 1].eq) ? eqHead : '') + row(o, i)).join('') + `<span class="help"> （${invCount()}/${INV_MAX}）</span> <button class="s" data-sort="1">ならべかえ（R）</button>${myBags().length ? ' <button class="s" data-bags="1">袋の中身（B）</button> <button class="s" data-stash="1">袋に しまう</button>' : ''}` : '<span class="help">なにも もっていない</span>');
  drawSkillBar();
}
document.getElementById('inv').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || !over.hidden) return;
  if (b.dataset.bags) { openBags(); return; } if (b.dataset.stash) { stashAll(); render(); return; }
  if (b.dataset.sort) sortInv(); else if (b.dataset.t !== undefined) throwItem(+b.dataset.t); else if (b.dataset.d !== undefined) dropItem(+b.dataset.d); else useItem(+b.dataset.i); });
