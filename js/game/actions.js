// プレイヤーの行動と 1ターンの流れ（こうげき・アイテム・わな・敵の動き・ダッシュ）
'use strict';

// 向いている方向に まっすぐ調べる（矢・杖・投げる）
function ray(len) { const [dx, dy] = P.dir; let x = P.x, y = P.y; const path = [];
  for (let i = 0; i < len; i++) { const nx = x + dx, ny = y + dy; if (!isFloor(nx, ny) || blockedAt(nx, ny)) break; x = nx; y = ny; path.push([x, y]); const m = monAt(x, y); if (m) return { m, x, y, path }; }
  return { m: null, x, y, path }; }
function fx(path, color) { G.fx = { path, t: 4, color }; }
function boom(cells, color) { G.boom = { cells, t: 6, color }; }
// ===== 行動 =====
function dmg(a, d) { return Math.max(1, a + ri(-1, 2) - d); }
function act(dx, dy) {
  if (G.over) return;
  if (P.skip > 0) { P.skip--; say(P.skipMsg || 'まだ おどっている……（ねこミーム）'); if (!P.skip) P.skipMsg = ''; endTurn(); return; }
  if (dx === 0 && dy === 0) { endTurn(); return; }
  P.dir = [dx, dy];
  const nx = P.x + dx, ny = P.y + dy;
  if (dx && dy && (!isFloor(P.x + dx, P.y) || !isFloor(P.x, P.y + dy))) { render(); return; } // かどは通れない
  const m = monAt(nx, ny);
  if (m) { weaponAttack(true); if (jobHas('combo') && G.mons.includes(m) && rnd() < .33) { say('れんぞく こうげき！'); attack(m, 1, true); } endTurn(); return; }
  if (shopAt(nx, ny)) { openShop(); return; }
  if (npcAt(nx, ny)) { talkFriend(); return; }
  if (!isFloor(nx, ny)) { render(); return; }
  P.x = nx; P.y = ny; step(); endTurn();
}
function elemHit(m, d, el, label) { const md = MON[m.t]; let note = ''; d = Math.round(d * magicPower);
  if (el && md.weak === el) { d = Math.round(d * 1.6); note = '　こうかは ばつぐんだ！'; } else if (el && md.resist === el) { d = Math.max(1, Math.round(d * .5)); note = '　あまり きいていない……'; }
  hitMon(m, d, `${label || m.name + 'に'} ${d}の ダメージ！${note}`); return d; }
// ダメージの ログ：のこり HPも 出す。とどめの 一撃も ダメージを 出してから たおす
function hitMon(m, d, msg) { m.hp -= d; m.flash = 6; m.sleep = false; if (msg) say(msg + (m.hp > 0 ? `（のこり HP ${m.hp}/${m.mhp || m.hp}）` : '')); if (m.hp <= 0) killMon(m); }
function killMon(m) {
  if (!G.mons.includes(m)) return;
  G.mons = G.mons.filter(o => o !== m); sfx('kill');
  const ex = (m.exp || MON[m.t].exp) * (m.boss ? 5 : 1); say(`${m.name}を たおした！ ${ex}の けいけんち。`); if (jobHas('drain') && P.mp < P.mmp) { P.mp = Math.min(P.mmp, P.mp + 2); say('まりょくを すいとって MPが 2 もどった。'); } gainExp(ex); addJobExp(ex); noteKill(m.t);
  if (m.loot) { const p = freeNear(m.x, m.y); if (p) { G.items.push(m.loot.gold ? { ...p, k: 'gold', amt: m.loot.gold } : { ...p, k: m.loot.o.k, o: m.loot.o }); say('ぬすまれた物を とりかえした！'); } }
  else if (m.elite) { const p = freeNear(m.x, m.y); if (p) { const kk = rnd() < .3 ? pick(ARMOR_POOL) : rnd() < .5 ? pick(GEM_POOL) : pick(G.pool); const o = kk === 'gold' ? undefined : newItem(kk, 'floor'); G.items.push({ ...p, k: kk, o, amt: ri(60, 150) * G.f }); say(`${m.name}は いいものを 落とした！`); } }
  else if (rnd() < .07) { const p = freeNear(m.x, m.y); if (p) { const kk = rnd() < .04 ? 'diamond' : pick(GEM_POOL); G.items.push({ ...p, k: kk, o: newItem(kk, 'floor') }); say(`${m.name}は ${ITEMS[kk].name}を 落とした！`); } }
  else if (rnd() < .1) { const p = freeNear(m.x, m.y); if (p) { G.items.push({ ...p, k: pick(G.pool), amt: ri(20, 80) * G.f }); say(`${m.name}は 何かを 落とした。`); } }
  if (m.t === 'keeper') { for (const it of G.items) delete it.price; say('店主を たおした！ お店の物は ぜんぶ タダだ。'); }
  if (m.boss) { G.over = 'clear'; showOver('clear'); }
}
function attack(m, mul = 1, normal = false) {
  attackAnim(m);
  let d = Math.max(1, Math.round(dmg(atkTotal(), m.def) * mul));
  const crit = normal && jobHas('crit') && rnd() < .2; if (crit) { d *= 2; shake(4); say('かいしんの いちげき！'); }
  if ((hasTrait('dekakiller') && m.t === 'dekakowa') || (hasTrait('robokiller') && m.t === 'robo')) d *= 2;
  sfx(crit || mul >= 2.5 ? 'crit' : 'hit'); if (hasTrait('kyuketsu')) P.hp = Math.min(P.mhp, P.hp + 1);
  const w = eqItem('atk'); return elemHit(m, d, hasTrait('honoo') ? 'fire' : hasTrait('koori') ? 'ice' : (w && ITEMS[w.k].el) || null);
}
function gainExp(e) { P.exp += e; while (P.exp >= P.lv * 10) { P.exp -= P.lv * 10; P.lv++; P.mhp += 7; P.mmp += 3; P.hp = P.mhp; P.mp = P.mmp; P.food = 100; P.atk += 1; jobLevelUp(); P.hp = P.mhp; P.mp = P.mmp;
  say(`レベルが ${P.lv} に あがった！ HP・MP・おなかが ぜんぶ 回復した。`); levelUpJingle(); showBanner(`レベル ${P.lv}！`, 'HP・MP・おなかが ぜんぶ 回復');
  for (const s of mySkills()) if (s.lv === P.lv) say(`新しい わざ「${s.name}」を おぼえた！（${s.desc}）`); } }
const expNext = () => P.lv * 10 - P.exp;
function step() {
  const it = G.items.find(o => o.x === P.x && o.y === P.y);
  if (it) {
    if (it.k === 'gold') { const amt = jobHas('merchant') ? Math.round(it.amt * 1.5) : it.amt; P.gold += amt; say(`${amt}ゴールド ひろった。`); sfx('pick'); G.items = G.items.filter(o => o !== it); }
    else {
      const o = it.o || newItem(it.k, 'floor');
      if (jobHas('alchemy') && ITEMS[o.k].cat === 'wand' && !o.alch) { o.alch = true; o.n = (o.n || 0) + 2; }
      const stack = !it.price && o.k === 'arrow' && P.inv.find(x => x.k === 'arrow' && !x.unpaid);
      if (stack) { stack.n += o.n; say(`木の矢を ${o.n}本 ひろった。（${stack.n}本）`); sfx('pick'); G.items = G.items.filter(x => x !== it); }
      else if (!invFull()) { if (it.price) o.unpaid = it.price; if (jobHas('items') && !isKnown(o.k) && !ITEMS[o.k].bag) { P.known.add(o.k); say(`どうぐつかいの 目で ${itemName(o)}だと わかった。`); } P.inv.push(o); G.items = G.items.filter(x => x !== it); sfx('pick');
        say(it.price ? `${itemName(o)}（${it.price}G）を 手にとった。${isKnown(o.k) ? ITEMS[o.k].desc + '。' : ''}店主に話しかけると 買える。` : `${itemName(o)}を ひろった。` + (o.traits && o.traits.length && isKnown(o.k) ? `（${o.traits.map(x => TRAITS[x].name).join('・')}つき！）` : '')); }
      else if (!it.price && !ITEMS[o.k].bag && bagWithRoom()) { const bag = bagWithRoom(); bag.items.push(o); G.items = G.items.filter(x => x !== it); sfx('pick'); say(`もちものが いっぱいなので、${itemName(o)}を ${itemName(bag)}に 入れて ひろった。`); }
      else { const nm = it.o ? itemName(it.o) : (isKnown(it.k) ? ITEMS[it.k].name : FAKE[it.k]); say(`${nm}${it.price ? `（${it.price}G）` : ''}が おちている。でも もちものが いっぱいで ひろえない。（${invCount()}/${INV_MAX}）`); }
    }
  }
  const tr = G.traps.find(o => o.x === P.x && o.y === P.y);
  if (tr) { tr.found = true; if (jobHas('trapper')) say(`${TRAPS[tr.k].name}を かんたんに はずした。（からくりし）`); else if (eqPerk('light') && rnd() < .5) say(`${TRAPS[tr.k].name}を ふみそうに なったが、はやてのくつで とびこえた！`); else trap(tr.k); }
  if (G.stairs && P.x === G.stairs.x && P.y === G.stairs.y) say('階段が ある。（Enter か「階段をおりる」で おりる）');
}
function trap(k) {
  const n = TRAPS[k].name; sfx('trap');
  if (k === 'spike' && hasTrait('togeyoke')) { say(`${n}を ふんだが、トゲよけで なんともない。`); return; }
  if (k === 'spike') { const d = 5 + G.f; P.hp -= d; P.flash = 6; P.cause = n; shake(5); say(`${n}を ふんだ！ ${d}の ダメージ。`); }
  if (k === 'hole') { if (G.f < LAST) { fallSound(); enterFloor(G.f + 1); shake(10); say(`${n}だ！ ひゅ〜〜…… ドスン！ 地下${G.f}階に おちた。`); showBanner('ひゅ〜〜…… ドスン！', `おとし穴で 地下${G.f}階に おちた`); } else say(`${n}だ！ ……と思ったら、そこは浅かった。`); }
  if (k === 'heat') { P.food = Math.max(0, P.food - 20); say(`${n}を ふんだ！ あつすぎて、おなかが 20 へった。`); }
  if (k === 'ticket') { const g = Math.min(P.gold, 100); P.gold -= g; say(`${n}だ！ 自転車でもないのに 罰金 ${g}ゴールド。`); }
  if (k === 'nisa') { const g = Math.floor(P.gold / 2); P.gold -= g; say(`${n}だ！ つみたてに 回しすぎて、${g}ゴールド 消えた。`); }
  if (k === 'cat' && hasTrait('nekoyoke')) { say(`${n}を ふんだが、ねこよけで おどらずにすんだ。`); return; }
  if (k === 'cat') { P.skip = 2; P.skipMsg = ''; say(`${n}を ふんだ！ 体が かってに おどりだした。（2ターン）`); }
  if (k === 'start') { say(`${n}！！ 1階に もどされた……。`); shake(10); enterFloor(1); }
}
function useItem(i) { const o = P.inv[i]; if (o) useObj(o, P.inv); }
// o を 使う。list は o が 入っている場所（もちもの か 袋の中身）。袋の中の そうびは 使えない
function useObj(o, list) {
  if (G.over) return; const it = ITEMS[o.k]; const inBag = list !== P.inv;
  if (inBag && it.equip) { say('そうびは 袋から 出してから 付けよう。'); render(); return; }
  if (it.equip) {
    if (o.eq) { if (o.cursed) { o.curseKnown = true; sfx('bad'); say(`${itemName(o)}は のろわれていて はずせない！`); render(); return; }
      if (invFull()) { say(`もちものが いっぱいで ${itemName(o)}を はずせない。（はずすと もちものに もどる）`); render(); return; } o.eq = false; say(`${itemName(o)}を はずして もちものに もどした。`); }
    else { const cur = P.inv.find(x => x !== o && x.eq && ITEMS[x.k].equip === it.equip);
      if (cur && cur.cursed) { cur.curseKnown = true; sfx('bad'); say(`${itemName(cur)}が のろわれていて 付けかえられない！`); render(); return; }
      if (cur) { cur.eq = false; say(`${itemName(cur)}は もちものに もどした。`); } o.eq = true;
      if (o.cursed) { o.curseKnown = true; sfx('bad'); shake(6); say(`${itemName(o)}を そうびした……のろわれていた！ はずせない！`); }
      else say(`${itemName(o)}を そうびした。（${itemDesc(o)}）`); }
    tidyEq(); endTurn(); return;
  }
  if (it.bag) { openBag(o); return; }
  if (o.k === 'omamori') { say(it.use()); render(); return; }
  if (it.need && it.need()) { say(it.need()); render(); return; }  // つかえない ときは へらさない
  if (o.unpaid) { say('お金を はらう前に 使ってしまった！'); delete o.unpaid; angerShop(); }
  if (it.cat && !P.known.has(o.k)) { P.known.add(o.k); say(`${FAKE[o.k]}を 使った。……${it.name}だった！`); }
  sfx(itemSound(it));
  const hp0 = P.hp, food0 = P.food;
  const msg = it.cat === 'wand' || it.cat === 'scroll' || o.k === 'g_fire' ? withMagic(() => it.use(P, o)) : it.use(P, o); if (typeof msg === 'string') say(msg);
  if (jobHas('alchemy') && it.cat === 'grass') { P.mp = Math.min(P.mmp, P.mp + 5); say('れんきんの ちしきで MPが 5 もどった。'); }
  // どうぐつかい：回復の 道具が 1.5倍
  if (jobHas('items') && (P.hp > hp0 || P.food > food0)) { const eh = Math.min(P.mhp - P.hp, Math.round((P.hp - hp0) * .5)), ef = Math.min(100 - P.food, Math.round((P.food - food0) * .5)); P.hp += eh; P.food += ef; if (eh + ef > 0) say(`どうぐつかいの うでで さらに ${eh ? 'HP＋' + eh : ''}${eh && ef ? '・' : ''}${ef ? 'おなか＋' + ef : ''}。`); }
  if (it.cat === 'wand' || it.keep) { /* 杖と ほうせきは のこる */ }
  else if (it.stack) { o.n--; if (o.n <= 0) list.splice(list.indexOf(o), 1); }
  else { const j = list.indexOf(o); if (j >= 0) list.splice(j, 1); }
  endTurn();
}
function throwItem(i) {
  if (G.over) return; const o = P.inv[i]; if (!o) return;
  if (o.k === 'arrow') return useItem(i);
  if (o.eq && o.cursed) { o.curseKnown = true; say(`${itemName(o)}は のろわれていて 手から はなれない！`); render(); return; }
  if (o.unpaid) { say('お金を はらう前に 投げてしまった！'); delete o.unpaid; angerShop(); }
  P.inv.splice(i, 1); o.eq = false; const r = ray(10); fx(r.path, '#ffffff'); sfx('zap');
  const nm = itemName(o);
  if (r.m) { const m = r.m;
    if (o.k === 'herb' || o.k === 'g_life') { m.hp = Math.min(m.mhp, m.hp + 25); m.sleep = false; say(`${nm}を 投げた。${m.name}が 元気に なってしまった！`); }
    else if (o.k === 'g_sleep') { P.known.add('g_sleep'); m.stuck = 10; say(`${nm}が 当たった！ ${m.name}は ねむってしまった。`); }
    else if (o.k === 'g_fire') { P.known.add('g_fire'); let d = 12 + G.f * 2; d = Math.round(d * jobThrowMul()); hitMon(m, d, `${nm}が 当たって もえあがった！ ${m.name}に ${d}の ダメージ。`); }
    else { const d = Math.round((ITEMS[o.k].equip ? itemVal(o) + 2 : 2) * jobThrowMul()); hitMon(m, d, `${nm}を 投げつけた！ ${m.name}に ${d}の ダメージ。`); }
  } else { const p = freeNear(r.x, r.y); if (p) G.items.push({ ...p, k: o.k, o }); say(`${nm}を 投げた。ゆかに おちた。`); }
  endTurn();
}
function dropItem(i) {
  if (G.over) return; const o = P.inv[i]; if (!o) return;
  if (o.eq && o.cursed) { o.curseKnown = true; say(`${itemName(o)}は のろわれていて おけない！`); render(); return; }
  if (G.items.some(it => it.x === P.x && it.y === P.y) || (P.x === G.stairs.x && P.y === G.stairs.y)) { say('ここには おけない。'); render(); return; }
  P.inv.splice(i, 1); o.eq = false; const it = { x: P.x, y: P.y, k: o.k, o };
  if (o.unpaid) { it.price = o.unpaid; delete o.unpaid; say(`${itemName(o)}を お店に もどした。`); } else say(`${itemName(o)}を 足もとに おいた。`);
  G.items.push(it); endTurn();
}
function descend() { if (G.over) return; if (P.x === G.stairs.x && P.y === G.stairs.y) { if (G.f >= LAST) { say('この先は、でかこわの王を たおさないと 開かない。'); render(); return; } stairsSound(); enterFloor(G.f + 1); say(`地下${G.f}階に おりた。`); render(); } }
function angerShop() { if (!G.shop) return; const { x, y } = G.shop; G.shop = null; addMon(G, 'keeper', x, y);
  for (const o of P.inv) delete o.unpaid; for (const it of G.items) delete it.price;
  shake(12); sfx('alarm'); showBanner('どろぼうーーっ！！', '店主が おこった'); say('店主「どろぼうーーっ！！」 店主が おこって おそってきた！'); }
function spawnFar() { const rs = G.rooms.filter(r => !roomOf2(r, P.x, P.y)); const r = pick(rs); if (!r) return;
  const x = ri(r.x, r.x + r.w - 1), y = ri(r.y, r.y + r.h - 1); if (monAt(x, y) || blockedAt(x, y)) return; addMon(G, pick(monPool(G.f).filter(t => !MON[t].big)), x, y); }
function endTurn() {
  P.turn++; G.ft++;
  if (P.turn % (hasTrait('haramochi') ? 12 : 6) === 0) { if (P.food > 0) P.food--; else { P.hp -= 1; P.cause = 'はらぺこ'; say('おなかが へって 動けない……。'); } }
  if (P.turn % 5 === 0 && P.food > 0) P.hp = Math.min(P.mhp, P.hp + 1);
  if (P.turn % 4 === 0 && P.food > 0) P.mp = Math.min(P.mmp, P.mp + 1);
  if (jobHas('sage') && P.turn % 3 === 0) P.mp = Math.min(P.mmp, P.mp + 1);
  for (const m of [...G.mons]) { if (G.over) break; monTurn(m); if (MON[m.t].fast && G.mons.includes(m)) monTurn(m); }
  if (G.ft === 300) say('どこからか 地ひびきが する……。長く いすぎると あぶない。');
  if (G.ft > 330 && G.ft % 15 === 0) { spawnFar(); say('どこかで 敵が 生まれた けはいがする。'); }
  if (G.shopRoom && G.shop) { const inShop = roomOf2(G.shopRoom, P.x, P.y); if (P.wasInShop && !inShop && P.inv.some(o => o.unpaid)) angerShop(); P.wasInShop = inShop; }
  if (G.house && !G.houseWoke && roomOf(P.x, P.y) === G.house) { G.houseWoke = true; for (const m of G.mons) m.sleep = false; P.flash = 10; shake(10); sfx('house'); showBanner('モンスターハウス！', ''); say('モンスターハウスだ！！ 敵が いっせいに 目を さました！'); }
  { const pin = P.hp > 0 && P.hp <= P.mhp * .25; if (pin && !P.pinch) { say('HPが のこり わずか！ 回復するか にげよう！'); showBanner('HPが あぶない！', '回復するか にげよう'); sfx('siren'); } P.pinch = pin; }
  if (P.hp <= 0 && !G.over) { const om = P.inv.find(o => o.k === 'omamori');
    if (om) { P.inv.splice(P.inv.indexOf(om), 1); P.hp = P.mhp; P.food = Math.max(P.food, 30); shake(10); sfx('lvup'); showBanner('いのちのお守り！', '1回だけ 復活した'); say('……いのちのお守りが くだけちった。HPが ぜんぶ 回復して 立ちあがった！'); }
    else { P.hp = 0; G.over = 'dead'; showOver('dead'); } }
  reveal(); render();
}
function monTurn(m) {
  if (m.sleep) return;
  if (m.stuck > 0) { m.stuck--; return; }
  const d = MON[m.t]; const dist = Math.max(Math.abs(m.x - P.x), Math.abs(m.y - P.y));
  if (m.flee) { let best = null, bd = dist; for (let ax = -1; ax <= 1; ax++) for (let ay = -1; ay <= 1; ay++) { const nx = m.x + ax, ny = m.y + ay;
      if ((ax || ay) && isFloor(nx, ny) && !monAt(nx, ny) && !blockedAt(nx, ny) && !(nx === P.x && ny === P.y)) { const nd = Math.max(Math.abs(nx - P.x), Math.abs(ny - P.y)); if (nd > bd) { bd = nd; best = [nx, ny]; } } }
    if (best) [m.x, m.y] = best; return; }
  if (dist === 1) {
    if (d.steal) { if (P.gold > 0) { const a = Math.min(P.gold, 30 + G.f * 20); P.gold -= a; m.loot = { gold: a }; say(`${m.name}に ${a}ゴールド ぬすまれた！`); }
      else { const c = P.inv.filter(o => !o.eq); if (!c.length) { say(`${m.name}は ぬすむ物が なくて がっかりしている。`); return; } const o = pick(c); P.inv.splice(P.inv.indexOf(o), 1); m.loot = { o }; say(`${m.name}に ${itemName(o)}を ぬすまれた！`); }
      m.flee = true; sfx('bad'); return; }
    if (d.dance) { if (rnd() < .5 && !hasTrait('nekoyoke')) { P.skip = 1; P.skipMsg = ''; say(`${m.name}が おどっている。つられて おどってしまった。`); } else say(`${m.name}は ずっと おどっている。`); return; }
    monAnim(m);
    if (jobHas('evade') && rnd() < (jobHas('nimble') ? .4 : .25)) { sfx('dodge'); say(`${m.name}の こうげき！ ……ひらりと よけた。`); if (jobHas('nimble')) { say('すかさず はんげき！'); attack(m, .6); } return; }
    let dd = dmg(m.atk, defTotal()); if (eqPerk('guard')) dd = Math.max(1, dd - 1); if (jobHas('illusion')) dd = Math.max(1, Math.round(dd * .75)); P.hp -= dd; P.flash = 6; P.cause = m.name; sfx('hurt'); if (dd >= 8) shake(4);
    say(`${m.name}の こうげき！ ${dd}の ダメージ。`);
    if (hasTrait('hanekaeshi')) { const r = Math.ceil(dd / 2); hitMon(m, r, `はねかえし！ ${m.name}に ${r}の ダメージ。`); }
    return;
  }
  let dx = Math.sign(P.x - m.x), dy = Math.sign(P.y - m.y);
  if (dist > 8 || (d.erratic && rnd() < .5)) { dx = ri(-1, 1); dy = ri(-1, 1); }
  const tries = [[dx, dy], [dx, 0], [0, dy]];
  for (const [ax, ay] of tries) { const nx = m.x + ax, ny = m.y + ay; if ((ax || ay) && isFloor(nx, ny) && !monAt(nx, ny) && !blockedAt(nx, ny) && !(nx === P.x && ny === P.y)) { m.x = nx; m.y = ny; break; } }
}
// ===== ダッシュ =====
function dash(dx, dy) {
  for (let i = 0; i < 40; i++) {
    if (G.over || P.skip || !invpop.hidden) break;
    if (i > 0 && G.mons.some(m => visible(m.x, m.y) && !m.sleep)) break;
    const bx = P.x, by = P.y, r0 = roomOf(P.x, P.y), hp0 = P.hp, f0 = G;
    act(dx, dy);
    if (G.over || G !== f0 || (P.x === bx && P.y === by) || P.hp < hp0) break;
    if (G.items.some(o => o.x === P.x && o.y === P.y) || (P.x === G.stairs.x && P.y === G.stairs.y) || G.traps.some(t => t.found && t.x === P.x && t.y === P.y)) break;
    if (roomOf(P.x, P.y) !== r0) break;
    if (!roomOf(P.x, P.y)) { let n = 0; for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (isFloor(P.x + ax, P.y + ay)) n++; if (n > 2) break; }
  }
}
