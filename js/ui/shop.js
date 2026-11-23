// AIかじや（買う・売る・合成・鑑定・おはらい・支払い・返却）
'use strict';

// ===== AIかじや（買い物と合成） =====

const price = k => Math.max(10, Math.round(PRICE[k] * G.shopRate / 10) * 10);
const fuseCost = (a, b) => Math.max(10, Math.round((jobHas('forge') ? 40 : 80) * ((a.plus || 0) + (b.plus || 0) + 1) * G.shopRate / 10) * 10);
const basePrice = o => { const it = ITEMS[o.k]; let b = PRICE[o.k] || (it.cat === 'grass' ? 120 : it.cat === 'scroll' ? 150 : it.cat === 'wand' ? 180 : 60); if (it.equip) b += (o.plus || 0) * 80 + (o.traits ? o.traits.length * 60 : 0) + (o.tslot || 0) * 150; if (o.k === 'arrow') b = 6 * o.n; return b; };
const sellPrice = o => o.cursed ? 10 : Math.max(10, Math.round(basePrice(o) * (jobHas('merchant') ? .65 : .5) * G.shopRate / 10) * 10);
const slotCost = o => Math.max(10, Math.round((jobHas('forge') ? 250 : 500) * ((o.tslot || 0) + 1) * G.shopRate / 10) * 10);
const identCost = () => Math.max(10, Math.round(50 * G.shopRate / 10) * 10);
const purifyCost = () => Math.max(10, Math.round(100 * G.shopRate / 10) * 10);
let shopTab = 'buy', sellMode = 'inv';
// まとめて うる：sellMulti＝えらぶ モード、sellPick＝えらんだ 物（もちものの 物そのもの）
let sellMulti = false, sellPick = new Set();
const pickedList = () => P.inv.filter(o => sellPick.has(o) && !o.unpaid && !(o.eq && o.cursed));
const pickedSum = () => pickedList().reduce((s, o) => s + sellPrice(o) + bagSum(o), 0);
const bagSum = o => o.items ? o.items.reduce((s, x) => s + sellPrice(x), 0) : 0;
function openShop() { fuseObj = null; shopTab = 'buy'; sellMulti = false; sellPick.clear(); shopLastTab = ''; invpop.hidden = false; sfx('shop'); drawShop(); say('AIかじや「いらっしゃいませ。本日のAI価格です。」'); render(); }
let shopLastTab = '';
function drawShop(msg) {
  if (invpop.dataset.mode !== 'shop') shopLastTab = '';
  invpop.dataset.mode = 'shop';
  const rate = G.shopRate, tag = rate < 1 ? '<b style="color:#7cf0a0">おとく</b>' : rate > 1 ? '<b style="color:#ff6b6b">たかい</b>' : 'ふつう';
  const eqs = P.inv.map((o, i) => [o, i]).filter(([o]) => ITEMS[o.k].equip && isKnown(o.k));
  const unpaid = P.inv.filter(o => o.unpaid), total = unpaid.reduce((s, o) => s + o.unpaid, 0);
  const cursed = P.inv.some(o => o.cursed && o.eq);
  const unk = P.inv.map((o, i) => [o, i]).filter(([o]) => !isKnown(o.k));
  const tabs = [['buy', 'かう'], ['sell', 'うる'], ['fuse', '合成'], ['slot', 'わくを ふやす'], ['ident', 'みてもらう'], ...(cursed ? [['purify', 'おはらい']] : [])];
  if (!tabs.some(([k]) => k === shopTab)) shopTab = 'buy';
  let body = '';
  if (shopTab === 'buy') body = `<div class="help" style="margin-top:4px">${['ふつうの 品ぞろえ', '少し レアな 品ぞろえ', 'レアもの あり', '深い階の 品ぞろえ（レアもの たくさん）'][G.shopTier] || ''}。お店の ゆかに ならんでいる物も、ひろって ここで はらえます</div>` + (G.stock.length ? G.stock.map((s, j) => `<button data-buy="${j}" class="buy">${ITEMS[s.o.k].name}${s.o.plus ? '+' + s.o.plus : ''}　<b style="color:#ffd23f">${buyPrice(s)}G</b>　<small>${s.inf ? 'いくつでも' : 'のこり1'}</small><br><small style="color:#a79fb8">${ITEMS[s.o.k].equip ? descNewTraits(s.o) : ITEMS[s.o.k].desc}</small></button>`).join('') : '<span class="help">うりきれ</span>');
  if (shopTab === 'fuse') body = fuseHtml();
  if (shopTab === 'slot') body = slotHtml();
  if (shopTab === 'sell') { const list = P.inv.map((o, i) => [o, i]).filter(([o]) => !o.unpaid && !(o.eq && o.cursed));
    body = `<div class="help" style="margin-top:4px">うると、ねだんの 半分くらいで 買いとってもらえます（AI価格で かわります）</div>`
      + `<div class="tabs sub"><button data-sellmode="inv"${sellMode === 'inv' ? ' class="on"' : ''}>もちものを うる</button><button data-sellmode="bag"${sellMode === 'bag' ? ' class="on"' : ''}>袋の中身を うる</button></div>`;
    if (sellMode === 'inv') body += `<div class="multirow"><button data-multi="1"${sellMulti ? ' class="on"' : ''}>${sellMulti ? '✓ まとめて えらぶ（タップで えらぶ）' : 'まとめて えらんで うる'}</button>${sellMulti ? '<button data-pickall="1">ぜんぶ えらぶ</button><button data-pickclear="1">えらびなおす</button>' : ''}</div>`
      + (list.length ? list.map(([o, i]) => `<button ${sellMulti ? `data-pick="${i}" class="pick${sellPick.has(o) ? ' on' : ''}"` : `data-sell="${i}"`}>${sellMulti ? `<span class="ck">${sellPick.has(o) ? '■' : '□'}</span> ` : ''}${o.eq ? '[E] ' : ''}${nameHtml(o)}<br><small style="color:#a79fb8">${sellPrice(o) + bagSum(o)}G${sellMulti ? '' : 'で うる'}${o.items && o.items.length ? `・袋ごと（中身 ${o.items.length}こも いっしょ）` : ''}</small></button>`).join('') : '<span class="help">うれる物が ない</span>');
    else { const bags = myBags(), all = bags.reduce((s, bg) => s + bagSum(bg), 0), n = bags.reduce((s, bg) => s + bg.items.length, 0);
      body += n ? `<button data-sellall="1" class="eq">袋の中身を ぜんぶ うる（${n}こ・${all}G）<br><small style="color:#a79fb8">袋は のこります</small></button>` + bags.map(bg => { const bi = P.inv.indexOf(bg);
        return bg.items.length ? `<div class="bagbox"><div class="baghd">${nameHtml(bg)}</div>` + bg.items.map((x, j) => `<button data-sellb="${bi}:${j}">${nameHtml(x)}<br><small style="color:#a79fb8">${sellPrice(x)}Gで うる</small></button>`).join('') + '</div>' : ''; }).join('')
        : '<span class="help">袋の中に うれる物が ない</span>'; } }
  if (shopTab === 'ident') body = `<div class="help" style="margin-top:4px">正体の わからない物を みてもらう（1こ ${identCost()}G）</div>` + (unk.length ? unk.map(([o, i]) => `<button data-ident="${i}">${nameHtml(o)}</button>`).join('') : '<span class="help">わからない物は ない</span>');
  if (shopTab === 'purify') body = `<div class="help" style="margin-top:6px">そうびの のろいを とく</div><button data-purify="1">おはらい ${purifyCost()}G</button>`;
  // 上の 見出し（お知らせ・お金・おかいけい・タブ）は スクロールしても 上に のこす
  const keepScroll = !invpop.hidden && shopLastTab === shopTab && shopTab !== 'fuse', top = invpop.scrollTop;
  invpop.innerHTML = `<div class="pophead">${msg ? `<div class="shopmsg">${msg}</div>` : ''}<div><b style="color:#ffd23f">AIかじや</b>　本日のAI価格 ×${rate}（${tag}）　所持 <b style="color:#ffd23f">${P.gold}</b>G</div>`
    + (unpaid.length ? `<div class="pay"><div class="help">おかいけい（まだ はらっていない物）</div>${unpaid.map(o => `<div class="payrow">${nameHtml(o)}　<b style="color:#ffd23f">${o.unpaid}G</b> <button data-return="${P.inv.indexOf(o)}">かえす</button></div>`).join('')}<button data-pay="1" class="eq">${total}G はらう</button></div>` : '')
    + `<div class="tabs">${tabs.map(([k, l]) => `<button data-tab="${k}"${k === shopTab ? ' class="on"' : ''}>${l}</button>`).join('')}<button data-close="1">みせを でる</button></div>${shopTab === 'sell' && sellMode === 'inv' && sellMulti ? `<div class="multibar">えらんだ ${pickedList().length}こ・${pickedSum()}G <button data-sellpicked="1" class="eq"${pickedList().length ? '' : ' disabled'}>まとめて うる</button></div>` : ''}</div>` + body;
  // 同じ タブで 買ったり 売ったり したときは、スクロールの 位置を そのままに
  invpop.scrollTop = keepScroll ? top : 0; shopLastTab = shopTab;
}
// 合成：数値は 足し算＋1、わくは 多いほう、特性は わくの 数まで
const fusedTraits = (a, b) => [...new Set([...(a.traits || []), ...(b.traits || [])])].slice(0, traitCap({ tslot: Math.max(a.tslot || 0, b.tslot || 0) }));
function fusedPreview(a, b) { return { k: a.k, plus: (a.plus || 0) + (b.plus || 0) + 1, tslot: Math.max(a.tslot || 0, b.tslot || 0), traits: fusedTraits(a, b), cursed: a.cursed || b.cursed, curseKnown: a.curseKnown || b.curseKnown }; }
// 合成に つかえる 装備：もちもの ＋ しまう袋の 中（list＝入っている 場所、bag＝袋なら その袋）
// ならび：そうびしている物（武器・たて・あたま・うで・あし）→ もちもの → 袋の 中
function fuseList() { const out = P.inv.filter(o => ITEMS[o.k].equip && isKnown(o.k)).map(o => ({ o, list: P.inv, bag: null }));
  for (const b of myBags()) for (const o of b.items) if (ITEMS[o.k].equip && isKnown(o.k)) out.push({ o, list: b.items, bag: b });
  const rank = e => e.o.eq ? EQ_ORDER.indexOf(ITEMS[e.o.k].equip) : e.bag ? 20 : 10;
  return out.map((e, i) => [e, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(([e]) => e); }
let fuseObj = null;  // ① で えらんだ もとの 装備
const fuseLabel = e => `${e.o.eq ? '[E] ' : ''}${e.bag ? '<small style="color:#7ad8ff">［袋］</small>' : ''}${nameHtml(e.o)}`;
function fuseHtml() {
  const eqs = fuseList();
  const nOf = slot => eqs.filter(e => ITEMS[e.o.k].equip === slot).length;
  let h = `<div class="fuse"><div class="help">同じ 部位の 装備を 2つ まとめて、1つの 強い装備にします。数値は 足し算＋1、特性も 合体（わくの 数まで。ふつう 3つ。わくは「わくを ふやす」で ふやせる）。しまう袋の 中の 装備も つかえます。</div>`;
  if (!Object.keys(SLOT_NAME).some(sl => nOf(sl) >= 2)) return h + `<div class="help" style="color:#ff9a9a">いまは 合成できません。同じ 部位（武器・たて・あたま・うで・あし）の 装備を 2つ以上 もってきてください。（いま：${Object.entries(SLOT_NAME).map(([sl, nm]) => nm + nOf(sl)).join('・')}）</div></div>`;
  const ae = fuseObj && eqs.find(e => e.o === fuseObj);
  if (!ae) { fuseObj = null;
    return h + `<div class="help">① もとにする装備を えらんでください（いま そうびしている 物が 上に ならびます）</div>` + eqs.map((e, i) => [e, i]).filter(([e]) => nOf(ITEMS[e.o.k].equip) >= 2).map(([e, i]) => `<button data-fuse="${i}">${fuseLabel(e)}<br><small style="color:#a79fb8">${itemDesc(e.o)}</small></button>`).join('') + '</div>'; }
  const a = ae.o;
  h += `<div class="help">もと：<b style="color:#ffd23f">${itemName(a)}</b>（${itemDesc(a)}）</div><div class="help">② まぜる装備を えらんでください（まぜた方は なくなります）。<b class="newtr">緑の 特性</b>は もとの 装備に ない 特性です</div>`;
  h += eqs.map((e, i) => [e, i]).filter(([e]) => e.o !== a && ITEMS[e.o.k].equip === ITEMS[a.k].equip).map(([e, i]) => { const o = e.o, r = fusedPreview(a, o), c = fuseCost(a, o), ok = P.gold >= c && !o.unpaid && !a.unpaid;
    return `<button data-fuse="${i}"${ok ? '' : ' class="ng"'}>${fuseLabel(e)} をまぜる<br><small style="color:#a79fb8">→ ${itemName(r)}（${descHi(r, t => !(a.traits || []).includes(t), 'もとの 装備に ない 特性')}）　${c}G${P.gold < c ? '・ゴールドが たりない' : ''}${o.unpaid || a.unpaid ? '・先に お金を はらってね' : ''}</small></button>`; }).join('');
  return h + `<button data-fusecancel="1">えらびなおす</button></div>`;
}
// わくを ふやす：装備を 1つ えらんで、特性の わくを ＋1（もちもの・袋の 中・そうび中 どれでも）
function slotHtml() { const eqs = fuseList();
  let h = `<div class="fuse"><div class="help">装備の 特性の わくを 1つ ふやします（ふつう ${TRAIT_SLOT_BASE}つ → 最大 ${TRAIT_SLOT_MAX}つ）。わくが ふえると、合成で 特性を たくさん もてます。${jobHas('forge') ? 'かじやなので 半額。' : ''}</div>`;
  if (!eqs.length) return h + '<div class="help" style="color:#ff9a9a">装備を もっていません。</div></div>';
  return h + eqs.map((e, i) => { const o = e.o, cap = traitCap(o), c = slotCost(o), max = cap >= TRAIT_SLOT_MAX, ok = !max && P.gold >= c && !o.unpaid;
    return `<button data-slot="${i}"${ok ? '' : ' class="ng"'}>${fuseLabel(e)}<br><small style="color:#a79fb8">特性 ${(o.traits || []).length}/${cap}${max ? '（もう ふやせない）' : `　→ わく ${cap + 1}　${c}G${P.gold < c ? '・ゴールドが たりない' : ''}${o.unpaid ? '・先に お金を はらってね' : ''}`}</small></button>`; }).join('') + '</div>'; }
// 装備の せつめいで、いま そうびしている 物に ない 特性だけ 色を かえる（買うと ふえる 特性が ひと目で わかる）
// pick(t) が true の 特性だけ 色を かえる
function descHi(o, pick, tip) { let d = escH(itemDesc(o)); for (const t of o.traits || []) if (pick(t)) d = d.replace(escH(TRAITS[t].name), `<b class="newtr" title="${tip}">${escH(TRAITS[t].name)}</b>`); return d; }
const descNewTraits = o => descHi(o, t => !hasTrait(t), 'いまの そうびに ない 特性');
// お店の部屋の 内側で、あいている場所（出入口を ふさがない）
function shopSpot() { const r = G.shopRoom; const c = [];
  for (let y = r.y + 1; y < r.y + r.h - 1; y++) for (let x = r.x + 1; x < r.x + r.w - 1; x++) if (!G.items.some(o => o.x === x && o.y === y) && !monAt(x, y) && !shopAt(x, y) && !(P.x === x && P.y === y) && !(G.stairs.x === x && G.stairs.y === y)) c.push({ x, y });
  return c.length ? pick(c) : null; }
function shopClick(b) {
  if (b.dataset.ident !== undefined) { const o = P.inv[+b.dataset.ident], c = identCost(); if (!o) return drawShop(); if (P.gold < c) return drawShop('ゴールドが たりない。');
    const old = itemName(o); P.gold -= c; P.known.add(o.k); sfx('use'); say(`${old}は ${itemName(o)}でした。`); return drawShop(`${old}は「${ITEMS[o.k].name}」でした。（${ITEMS[o.k].desc}）`); }
  if (b.dataset.return !== undefined) { const o = P.inv[+b.dataset.return]; if (!o || !o.unpaid) return drawShop(); const p = shopSpot(); if (!p) return drawShop('おく場所が ない。');
    P.inv.splice(P.inv.indexOf(o), 1); G.items.push({ ...p, k: o.k, o, price: o.unpaid }); delete o.unpaid; say(`${itemName(o)}を お店に かえした。`); return drawShop(`${itemName(o)}を かえしました。お店の ゆかに もどしておきます。`); }
  if (b.dataset.sellmode) { sellMode = b.dataset.sellmode; return drawShop(); }
  if (b.dataset.multi) { sellMulti = !sellMulti; sellPick.clear(); return drawShop(); }
  if (b.dataset.pick !== undefined) { const o = P.inv[+b.dataset.pick]; if (o) sellPick.has(o) ? sellPick.delete(o) : sellPick.add(o); return drawShop(); }
  if (b.dataset.pickall) { for (const o of P.inv) if (!o.unpaid && !(o.eq && o.cursed)) sellPick.add(o); return drawShop(); }
  if (b.dataset.pickclear) { sellPick.clear(); return drawShop(); }
  if (b.dataset.sellpicked) { const list = pickedList(); if (!list.length) return drawShop('うる物を えらんでください。'); let c = 0;
    for (const o of list) { c += sellPrice(o) + bagSum(o); P.inv.splice(P.inv.indexOf(o), 1); } P.gold += c; sellPick.clear(); sfx('sell');
    say(`${list.length}こを まとめて ${c}Gで うった。`); drawShop(`${list.length}こを まとめて ${c}Gで うった。（${list.map(itemName).join('・')}）`); render(); return; }
  if (b.dataset.sellall) { let c = 0, n = 0; for (const bg of myBags()) { c += bagSum(bg); n += bg.items.length; bg.items = []; }
    P.gold += c; sfx('sell'); say(`袋の 中身 ${n}こを ${c}Gで うった。`); return drawShop(`袋の 中身 ${n}こを ${c}Gで うった。袋は のこっています。`); }
  if (b.dataset.sellb) { const [bi, j] = b.dataset.sellb.split(':').map(Number); const bg = P.inv[bi], x = bg && bg.items[j]; if (!x) return drawShop(); const c = sellPrice(x);
    bg.items.splice(j, 1); P.gold += c; sfx('sell'); say(`${itemName(x)}を ${c}Gで うった。`); return drawShop(`${itemName(x)}を ${c}Gで うった。`); }
  if (b.dataset.sell !== undefined) { const o = P.inv[+b.dataset.sell]; if (!o) return drawShop(); const c = sellPrice(o) + bagSum(o);
    P.inv.splice(P.inv.indexOf(o), 1); P.gold += c; sfx('sell'); say(`${itemName(o)}を ${c}Gで うった。`); return drawShop(`${itemName(o)}を ${c}Gで うった。`); }
  if (b.dataset.tab) { shopTab = b.dataset.tab; fuseObj = null; return drawShop(); }
  if (b.dataset.slot !== undefined) { const e = fuseList()[+b.dataset.slot]; if (!e) return drawShop(); const o = e.o, c = slotCost(o);
    if (traitCap(o) >= TRAIT_SLOT_MAX) return drawShop(`${itemName(o)}の わくは もう ${TRAIT_SLOT_MAX}つ。これ以上 ふやせない。`);
    if (o.unpaid) return drawShop('お金を はらってから たのんでください。'); if (P.gold < c) return drawShop(`${c}G ひつよう。ゴールドが たりない。（いま ${P.gold}G）`);
    P.gold -= c; sfx('forge'); const m = addTraitSlot(o, 'AIかじや'); say(m); drawShop(`${m}（${c}G）`); render(); return; }
  if (b.dataset.fusecancel) { fuseObj = null; return drawShop(); }
  if (b.dataset.pay) { const unpaid = P.inv.filter(o => o.unpaid), total = unpaid.reduce((s, o) => s + o.unpaid, 0);
    if (P.gold < total) return drawShop('ゴールドが たりない。いらない物は ゆかに おいて もどせます。');
    P.gold -= total; for (const o of unpaid) delete o.unpaid; sfx('pay'); say(`${total}Gを はらった。まいど ありがとうございます。`); drawShop('おかいけい ありがとうございます。'); render(); return; }
  if (b.dataset.purify) { const c = purifyCost(); if (P.gold < c) return drawShop('ゴールドが たりない。');
    P.gold -= c; for (const o of P.inv) o.cursed = false; sfx('use'); say('おはらいを してもらった。のろいが とけた。'); drawShop('のろいが とけました。'); render(); return; }
  if (b.dataset.buy) { const s = G.stock[+b.dataset.buy]; if (!s) return drawShop(); const k = s.o.k, c = buyPrice(s);
    if (P.gold < c) return drawShop('ゴールドが たりない。');
    // もちものが いっぱいでも、しまう袋に 空きが あれば 袋に 入れて 買える（袋そのものは 袋に 入らない）
    const bag = invFull() && !ITEMS[k].bag ? bagWithRoom() : null;
    if (invFull() && !bag) return drawShop(myBags().length && !ITEMS[k].bag ? 'もちものも 袋も いっぱい。' : 'もちものが いっぱい。');
    P.gold -= c; const o = s.inf ? newItem(k, 'shop') : s.o; if (!s.inf) G.stock.splice(G.stock.indexOf(s), 1); if (ITEMS[k].cat) P.known.add(k);
    if (bag) bag.items.push(o); else P.inv.push(o); sfx('buy');
    const where = bag ? `（もちものが いっぱいなので ${itemName(bag)}に 入れた）` : ''; say(`${itemName(o)}を ${c}Gで かった。${where}`); drawShop(`${itemName(o)}を かった。${where}`); render(); return; }
  if (b.dataset.fuse !== undefined) { const eqs = fuseList(), e2 = eqs[+b.dataset.fuse]; if (!e2) return drawShop();
    const ae = fuseObj && eqs.find(e => e.o === fuseObj); if (!ae) { fuseObj = e2.o; return drawShop(); }
    const a = ae.o, c2 = e2.o;
    if (ITEMS[a.k].equip !== ITEMS[c2.k].equip) return drawShop('同じ 部位の そうびしか まぜられない。');
    if (a.unpaid || c2.unpaid) return drawShop('お金を はらってから 合成してください。');
    const cost = fuseCost(a, c2); if (P.gold < cost) return drawShop(`合成には ${cost}G ひつよう。ゴールドが たりない。（いま ${P.gold}G）`);
    P.gold -= cost; a.plus = (a.plus || 0) + (c2.plus || 0) + 1; a.traits = fusedTraits(a, c2); a.tslot = Math.max(a.tslot || 0, c2.tslot || 0) || undefined; a.cursed = a.cursed || c2.cursed; a.curseKnown = a.curseKnown || c2.curseKnown;
    e2.list.splice(e2.list.indexOf(c2), 1);
    // まぜた方を そうびしていたら、できた 装備を そうびする（袋の 中に あったら もちものに 出す）
    if (c2.eq) { if (ae.bag) { ae.list.splice(ae.list.indexOf(a), 1); P.inv.push(a); } a.eq = true; tidyEq(); }
    fuseObj = null; sfx('lvup'); say(`合成した！ ${itemName(a)}（${itemDesc(a)}）`); drawShop(`合成した！ ${itemName(a)} になった。（${cost}G）`); render(); }
}
