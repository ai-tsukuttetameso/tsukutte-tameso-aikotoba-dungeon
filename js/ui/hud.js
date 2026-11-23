// 上のステータス表示と 右の もちもの一覧
'use strict';

const SORT_ORDER = ['dou_ken', 'sword', 'hagane_ken', 'honoo_ken', 'koori_ken', 'ikazuchi_ken', 'hikari_ken', 'yari', 'hagane_yari', 'honoo_yari', 'ryuu_yari', 'tsue', 'rune_tsue', 'honoo_tsue', 'kenja_tsue', 'muchi', 'ibara_muchi', 'kusari_muchi', 'boomerang', 'hagane_boom', 'hoshi_boom', 'shield', 'hoshi_tate', 'kawa_boushi', 'tetsu_kabuto', 'mahou_boushi', 'ryuu_kabuto', 'kawa_kote', 'tetsu_kote', 'kawa_kutsu', 'hayate_kutsu', 'arrow', 'bread', 'onigiri', 'nori_ben', 'karaage_ben', 'shake_ben', 'curry_ben', 'maku_ben', 'toku_ben', 'kin_tamago', 'ruby', 'sapphire', 'emerald', 'diamond', 'kinkai', 'herb', 'sticker', 'charm', 'grass', 'scroll', 'wand', 'bag', 'omamori'];
// ならべかえの しかた（えらんだものは ブラウザに おぼえておく）
const SORT_MODES = [['kind', '武器が上'], ['tool', '道具が上'], ['name', 'あいうえお'], ['plus', '強い順']];
function getSortMode() { try { const v = localStorage.getItem('aikotoba_sortby'); return SORT_MODES.some(m => m[0] === v) ? v : 'kind'; } catch (e) { return 'kind'; } }
function setSortMode(v) { try { localStorage.setItem('aikotoba_sortby', v); } catch (e) {} }
function sortInv() { const mode = getSortMode(), shown = o => isKnown(o.k) ? ITEMS[o.k].name : FAKE[o.k];
  const group = o => { const g = SORT_ORDER.indexOf(ITEMS[o.k].cat || o.k); return g < 0 ? 99 : g; };
  // 道具が上：そうびできる物を うしろへ
  const kindRank = o => mode === 'tool' && ITEMS[o.k].equip ? group(o) + 200 : group(o);
  const key = (a, b) => mode === 'name' ? shown(a).localeCompare(shown(b), 'ja') || (b.plus || 0) - (a.plus || 0)
    : mode === 'plus' ? (b.plus || 0) - (a.plus || 0) || kindRank(a) - kindRank(b) || shown(a).localeCompare(shown(b), 'ja')
    : kindRank(a) - kindRank(b) || (b.plus || 0) - (a.plus || 0) || shown(a).localeCompare(shown(b), 'ja');
  // そうび中の物は いつも うしろ（そうびバッグ）
  P.inv.sort((a, b) => (a.eq ? 1 : 0) - (b.eq ? 1 : 0) || key(a, b));
  say(`もちものを ならべかえた（${SORT_MODES.find(m => m[0] === mode)[1]}）。`); render(); if (!invpop.hidden && invpop.dataset.mode === 'inv') drawInvPop(); }
const _htmlCache = {};
// 中身が かわった ときだけ 書きかえる（ボタンが 押している途中で 消えないように）
function setHtml(id, html) { if (_htmlCache[id] === html) return; _htmlCache[id] = html; document.getElementById(id).innerHTML = html; }
const KEYLBL = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '^'];
// おもい ときの しるし（おなかの よこ）
const heavyTag = () => typeof loadOver === 'function' && loadOver() ? (loadFree() ? ' <small class="buff light" title="にもつが おもいけど、かるがるなので ふつうの へりかた">かるがる</small>' : ` <small class="buff heavy" title="にもつが 12こを こえている。おなかが へりやすい">おもい＋${loadOver()}</small>`) : '';
// いま 効いている わざ・ようすと のこりターン
function buffHtml() { const b = [];
  if (P.teppeki > 0) b.push(['てっぺき', P.teppeki, 'うける ダメージが 半分']);
  if (P.mikiri > 0) b.push(['みきり', P.mikiri, '敵の こうげきを よける']);
  if (P.bunshin > 0) b.push(['分身', P.bunshin, '分身が こうげきを うける']);
  if (P.charge) b.push(['ためる', 0, 'つぎの こうげきが 2.5倍']);
  if (P.buffAtk) b.push([`こうげき＋${P.buffAtk}`, 0, 'この階の あいだ']);
  if (P.karuT > 0) b.push(['かるがる', P.karuT, 'にもつが おもくても ふつうの へりかた']);
  if (P.skip > 0) b.push(['おどり', P.skip, 'かってに おどって うごけない']);
  return b.length ? `<span class="buffs">${b.map(([n, t, d]) => `<small class="buff" title="${d}">${n}${t ? ' ' + t : ''}</small>`).join('')}</span>` : ''; }
function drawHud() {
  const low = P.hp <= P.mhp * .3, hungry = P.food <= 15;
  const hud = [
    runMode === 'daily' ? `<span>${icon('sun', '今日のダンジョン')}<b>今日のダンジョン</b></span>` : `<span>${icon('key', '合言葉')}合言葉 <b>${escH(password)}</b>${treasure ? ' <small class="tre">おたから</small>' : ''}</span>`,
    `<span>${icon('stairs', '階')}地下<b>${G.f}</b>/${LAST}階${curRule() ? ` <small class="rule">${RULES[curRule()].short}</small>` : isMidFloor(G.f) && midBossAlive() ? ' <small class="rule mid">ぬし</small>' : ''}${diffTag(runDiff) ? ` <small class="rule ura">${diffTag(runDiff)}</small>` : ''}</span>`,
    `<span>${icon('star', 'レベル')}Lv <b>${P.lv}</b> <small class="nx">つぎまで ${expNext()}</small></span>`,
    `<span class="${P.pinch ? 'low pinch' : low ? 'low' : ''}">${icon('heart', 'HP')}HP <b>${Math.max(0, P.hp)}</b>/${P.mhp}</span>`,
    `<span>${icon('drop', 'MP')}MP <b class="mpv">${P.mp}</b>/${P.mmp}</span>`,
    `<span class="${hungry ? 'low' : ''}">${icon('rice', 'おなか')}おなか <b>${P.food}</b>%${heavyTag()}</span>`,
    `<span>${icon('coin', 'ゴールド')}ゴールド <b>${P.gold}</b></span>`,
    `<span>${icon('sword', 'こうげき')}こうげき <b>${atkTotal()}</b></span>`,
    `<span>${icon('shield', 'ぼうぎょ')}ぼうぎょ <b>${defTotal()}</b></span>`,
    `<span>${icon('armor', 'そうび')}そうび <b>${eqName('atk')}</b>／防具 <b>${ARMOR_SLOTS.filter(eqItem).length}</b>/${ARMOR_SLOTS.length}</span>`,
    `<span>${icon('hourglass', 'ターン')}ターン ${P.turn}</span>`,
  ];
  // スマホは 1行を みじかく（文字を へらして、2〜3行に おさめる）
  const hudS = [
    `<span>${icon('stairs', '階')}<b>${G.f}</b>/${LAST}階${curRule() ? ` <small class="rule">${RULES[curRule()].short}</small>` : isMidFloor(G.f) && midBossAlive() ? ' <small class="rule mid">ぬし</small>' : ''}${diffTag(runDiff) ? ` <small class="rule ura">${diffTag(runDiff)}</small>` : ''}</span>`,
    `<span>${icon('star', 'レベル')}Lv<b>${P.lv}</b></span>`,
    `<span class="${P.pinch ? 'low pinch' : low ? 'low' : ''}">${icon('heart', 'HP')}<b>${Math.max(0, P.hp)}</b>/${P.mhp}</span>`,
    `<span>${icon('drop', 'MP')}<b class="mpv">${P.mp}</b>/${P.mmp}</span>`,
    `<span class="${hungry ? 'low' : ''}">${icon('rice', 'おなか')}<b>${P.food}</b>%${heavyTag()}</span>`,
    `<span>${icon('coin', 'ゴールド')}<b>${P.gold}</b>G</span>`,
    `<span>${icon('sword', 'こうげき')}<b>${atkTotal()}</b></span>`,
    `<span>${icon('shield', 'ぼうぎょ')}<b>${defTotal()}</b></span>`,
    `<span>${icon('hourglass', 'ターン')}${P.turn}</span>`,
    treasure ? '<span><small class="tre">おたから</small></span>' : '',
  ];
  const bf = buffHtml(); setHtml('hud', (innerWidth < 640 || (innerHeight <= 520 && innerWidth < 900) ? hudS : hud).join('') + bf);
  document.getElementById('log').innerHTML = logs.map(l => `<div>${l}</div>`).join('');
  const db = document.getElementById('downBtn'); if (db) db.disabled = !(P.x === G.stairs.x && P.y === G.stairs.y);
  tidyEq(); const row = (o, i) => `<span class="it"><button data-i="${i}" title="${itemDesc(o)}"${o.eq ? ' class="eq"' : ''}>${o.eq ? '[E] ' : KEYLBL[i] + '. '}${nameHtml(o)}${ITEMS[o.k].equip ? `<small class="eqtag">${o.eq ? 'はずす' : 'そうび'}</small>` : ''}</button>${trBtn(o, i)}<button class="s" data-t="${i}" title="向いている方向に投げる">なげ</button><button class="s" data-d="${i}" title="足もとに おく">おく</button></span>`;
  const eqHead = P.inv.some(o => o.eq) ? `<div class="eqhd">そうびバッグ（もちものに 数えない）</div>` : '';
  setHtml('inv', P.inv.length ? P.inv.map((o, i) => (o.eq && (i === 0 || !P.inv[i - 1].eq) ? eqHead : '') + row(o, i)).join('') + `<span class="help"> （${invCount()}/${invMax()}）${loadOver() ? (loadFree() ? `<b style="color:#9ad0ff"> おもい（＋${loadOver()}）けど かるがる</b>` : `<b style="color:#ff9a5c"> おもい（＋${loadOver()}）：おなかが へりやすい</b>`) : ''}</span> <button class="s" data-sort="1">ならべかえ（R）</button>${myBags().length ? ' <button class="s" data-bags="1">袋の中身（B）</button> <button class="s" data-stash="1">袋に しまう</button>' : ''}` : '<span class="help">なにも もっていない</span>');
  drawSkillBar();
}
document.getElementById('inv').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || !over.hidden) return;
  if (b.dataset.tr !== undefined) { showTraitPop(P.inv[+b.dataset.tr]); return; }
  if (b.dataset.bags) { openBags(); return; } if (b.dataset.stash) { stashAll(); render(); return; }
  if (b.dataset.sort) sortInv(); else if (b.dataset.t !== undefined) throwItem(+b.dataset.t); else if (b.dataset.d !== undefined) dropItem(+b.dataset.d); else useItem(+b.dataset.i); });
