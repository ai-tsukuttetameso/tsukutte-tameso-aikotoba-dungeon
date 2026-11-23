// ダンジョンの生成（部屋・通路・敵・アイテム・わな・お店）
'use strict';

function genFloor(f) { const saved = seed; P.visits[f] = (P.visits[f] || 0) + 1; seed = hashSeed(runSeed + ':' + f + ':' + P.visits[f]); rnd(); rnd(); trReset(f, P.visits[f]);
  try { return genFloorInner(f); } finally { seed = saved; } }
function genFloorInner(f) {
  const map = Array.from({ length: H }, () => Array(W).fill(0));
  const rooms = [];
  for (let tries = 0; tries < 200 && rooms.length < 8; tries++) {
    const w = ri(5, 10), h = ri(4, 7), x = ri(1, W - w - 2), y = ri(1, H - h - 2);
    if (rooms.some(r => x < r.x + r.w + 2 && x + w + 2 > r.x && y < r.y + r.h + 2 && y + h + 2 > r.y)) continue;
    rooms.push({ x, y, w, h }); for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) map[j][i] = 1;
  }
  rooms.sort((a, b) => a.x - b.x);
  const cx = r => r.x + (r.w >> 1), cy = r => r.y + (r.h >> 1);
  for (let k = 1; k < rooms.length; k++) {
    let [x1, y1, x2, y2] = [cx(rooms[k - 1]), cy(rooms[k - 1]), cx(rooms[k]), cy(rooms[k])];
    const horizFirst = rnd() < .5;
    const carve = (x, y) => { if (map[y][x] === 0) map[y][x] = 2; };
    if (horizFirst) { for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) carve(x, y1); for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) carve(x2, y); }
    else { for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) carve(x1, y); for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) carve(x, y2); }
  }
  const variant = Array.from({ length: H }, () => Array.from({ length: W }, () => (rnd() < .12 ? 3 : ri(0, 2))));
  const torch = Array.from({ length: H }, () => Array.from({ length: W }, () => rnd() < .12));
  const g = { f, map, rooms, variant, torch, seen: Array.from({ length: H }, () => Array(W).fill(false)), items: [], traps: [], mons: [], ft: 0 };
  const free = (r) => { for (let t = 0; t < 50; t++) { const x = ri(r.x, r.x + r.w - 1), y = ri(r.y, r.y + r.h - 1);
    if (!g.items.some(o => o.x === x && o.y === y) && !g.traps.some(o => o.x === x && o.y === y) && !g.mons.some(o => o.x === x && o.y === y) && !(g.stairs && g.stairs.x === x && g.stairs.y === y) && !(g.shop && g.shop.x === x && g.shop.y === y)) return { x, y }; } return { x: r.x, y: r.y }; };
  const start = rooms[0]; const sp = free(start); g.start = sp;
  g.stairs = free(rooms[rooms.length - 1]);
  const itemPool = ['bread', 'bread', 'bread', 'herb', 'herb', 'herb', 'sticker', 'charm', 'arrow', 'arrow', 'sword', 'shield', 'yari', 'tsue', 'muchi', 'boomerang', 'gold', 'gold', 'gold', 'gold', 'gold',
    'g_life', 'g_power', 'g_sleep', 'g_fire', 'g_bitter', 'g_eye', 's_dig', 's_up', 's_thunder', 's_purify', 's_call', 's_blast', 's_ident', 's_ident', 'w_blow', 'w_bind', 'w_swap', 'w_fire'];
  g.pool = itemPool;
  // レアものの 出やすさ：深いほど・おたからダンジョンほど 出やすい
  const rareP = (f >= 10 ? .015 : .004) * (treasure ? 4 : 1), omaP = .006 * (treasure ? 3 : 1);
  const nItems = 6 + Math.min(f >> 1, 8) + (treasure ? 3 : 0);
  for (let k = 0; k < nItems; k++) { const r = pick(rooms.slice(1)) || start; const p = free(r); const kk = rnd() < omaP ? 'omamori' : rnd() < rareP ? pick(RARE_ITEMS) : rnd() < .04 ? 'bag' : pick(itemPool);
    const o = kk === 'gold' ? undefined : newItem(kk, 'floor'); if (o && ITEMS[kk].equip && f > 10) o.plus = ri(0, Math.floor(f / 10));
    g.items.push({ ...p, k: kk, amt: ri(20, 80) * f * (treasure ? 2 : 1), o }); }
  const trapPool = ['spike', 'spike', 'hole', 'heat', 'ticket', 'nisa', 'cat'].concat(f >= 3 ? ['start'] : []);
  for (let k = 0; k < 4 + Math.min(f, 8); k++) { const r = pick(rooms); const p = free(r); if (p.x === sp.x && p.y === sp.y) continue; g.traps.push({ ...p, k: pick(trapPool), found: false }); }
  if (isShopFloor(f) && rooms.length > 2) { const r = rooms[rooms.length >> 1]; const p = free({ x: r.x + 1, y: r.y + 1, w: r.w - 2, h: r.h - 2 }); g.shop = p; g.shopRoom = r; g.shopRate = [0.6, 0.8, 1, 1.3, 1.8][ri(0, 4)];
    g.traps = g.traps.filter(t => roomOf2(r, t.x, t.y) === false);
    const tier = shopTierOf(f); g.shopTier = tier;
    g.stock = SHOP_STOCK[tier].filter(s => !s.endsWith('?') || rnd() < .5).map(s => { const k = s.replace(/[*?]/g, ''); const o = shopItem(k, tier); return { o, inf: s.endsWith('*'), price: Math.max(10, Math.round(basePrice(o) * g.shopRate / 10) * 10) }; });
    const goods = SHOP_STOCK[tier].filter(s => !s.endsWith('*')).map(s => s.replace(/[*?]/g, ''));
    for (let k = 0; k < 4; k++) { const q = free({ x: r.x + 1, y: r.y + 1, w: r.w - 2, h: r.h - 2 }); const kk = pick(goods); const o = shopItem(kk, tier); g.items.push({ ...q, k: kk, o, price: Math.max(10, Math.round(basePrice(o) * g.shopRate / 10) * 10) }); } }
  const pool = monPool(f);
  if (f >= 2 && f < LAST && rnd() < .5) { const cand = rooms.slice(1, -1).filter(r => r !== g.shopRoom); const r = pick(cand);
    if (r) { g.house = r; for (let k = 0; k < 6 + Math.min(f, 6); k++) { const p = free(r); addMon(g, pick(pool.filter(m => !MON[m].big)), p.x, p.y); g.mons[g.mons.length - 1].sleep = true; }
      for (let k = 0; k < 4; k++) { const p = free(r); const kk = pick(itemPool); g.items.push({ ...p, k: kk, amt: ri(40, 120) * f, o: kk === 'gold' ? undefined : newItem(kk, 'floor') }); } } }
  for (let k = 0; k < 3 + Math.min(f, 6); k++) { const r = pick(rooms.slice(1).filter(x => x !== g.shopRoom)) || start; const p = free(r); const t = pick(pool.filter(m => !MON[m].big || k === 0)); addMon(g, t, p.x, p.y); }
  if (f === LAST) { const p = free(rooms[rooms.length - 1]); addMon(g, LAST >= 30 ? 'dekakowa2' : 'dekakowa', p.x, p.y, true); }
  // なかまキャラ：2階から下で ときどき いる（お店の部屋・スタート・いちばん下の階には いない）
  if (f >= 2 && f < LAST && rnd() < .22) { const r = pick(rooms.slice(1).filter(x => x !== g.shopRoom && x !== g.house)); if (r) { const p = free(r); g.npc = { ...p, who: rnd() < .5 ? 'uutan' : 'tamezou' }; } }
  // 防具（あたま・うで・あし）：いままでの 地図が かわらないよう、いちばん 最後に おく
  const nArm = rnd() < .55 ? 1 : rnd() < .4 ? 2 : 0;
  for (let k = 0; k < nArm; k++) { const r = pick(rooms.slice(1)) || start; const p = free(r); if (g.npc && p.x === g.npc.x && p.y === g.npc.y) continue;
    const kk = rnd() < rareP * 2 ? 'ryuu_kabuto' : pick(ARMOR_POOL); const o = newItem(kk, 'floor'); if (f > 10) o.plus = ri(0, Math.floor(f / 10)); g.items.push({ ...p, k: kk, o }); }
  // お弁当：1階に 1〜2こ（深い階や おたからでは とくせい弁当も）。お店にも 2しゅるい ならぶ
  const nFood = rnd() < .6 ? 1 : 2;
  for (let k = 0; k < nFood; k++) { const r = pick(rooms.slice(1)) || start; const p = free(r); if (g.npc && p.x === g.npc.x && p.y === g.npc.y) continue;
    const kk = rnd() < rareP * 2 ? 'toku_ben' : pick(FOOD_POOL); g.items.push({ ...p, k: kk, o: newItem(kk, 'floor') }); }
  // 武器の なかま：2階に 1こくらい。深い階ほど 強い。お店にも 1〜2こ
  if (rnd() < .5) { const r = pick(rooms.slice(1)) || start; const p = free(r); if (!(g.npc && p.x === g.npc.x && p.y === g.npc.y)) {
    const kk = rnd() < rareP * 2 ? pick(RARE_WEAPONS) : pick(WEAPON_TIERS[weaponTier(f)]); const o = newItem(kk, 'floor'); if (f > 10) o.plus = ri(0, Math.floor(f / 10)); g.items.push({ ...p, k: kk, o }); } }
  // 金策の 道具：だいたい 3階に 1こ（おたからダンジョンは もっと）。深いと きんかいも
  const gemP = (treasure ? .8 : .35) + (f >= 20 ? .15 : 0);
  if (rnd() < gemP) { const r = pick(rooms.slice(1)) || start; const p = free(r); if (!(g.npc && p.x === g.npc.x && p.y === g.npc.y)) {
    const kk = rnd() < rareP * 3 ? (rnd() < .5 ? 'kinkai' : 'diamond') : pick(GEM_POOL); g.items.push({ ...p, k: kk, o: newItem(kk, 'floor') }); } }
  if (g.stock) for (const kk of [pick(WEAPON_TIERS[weaponTier(f)]), ...(g.shopTier >= 2 ? [pick(WEAPON_TIERS[2])] : [])]) { const o = shopItem(kk, g.shopTier); g.stock.push({ o, inf: false, price: Math.max(10, Math.round(basePrice(o) * g.shopRate / 10) * 10) }); }
  if (g.stock) for (const kk of [pick(FOOD_POOL), pick(FOOD_POOL)]) { const o = shopItem(kk, g.shopTier); g.stock.push({ o, inf: true, price: Math.max(10, Math.round(basePrice(o) * g.shopRate / 10) * 10) }); }
  if (g.stock) for (const kk of [pick(ARMOR_POOL), pick(ARMOR_POOL)]) { const o = shopItem(kk, g.shopTier); g.stock.push({ o, inf: false, price: Math.max(10, Math.round(basePrice(o) * g.shopRate / 10) * 10) }); }
  // あなあけのみ：たまに おちている（10階に 1こくらい。おたからダンジョンや 深い階は 多め）。少し レアな お店にも 1こ
  if (rnd() < (treasure ? .25 : .08) + (f >= 20 ? .05 : 0)) { const r = pick(rooms.slice(1)) || start; const p = free(r); if (!(g.npc && p.x === g.npc.x && p.y === g.npc.y)) g.items.push({ ...p, k: 'nomi', o: newItem('nomi', 'floor') }); }
  if (g.stock && g.shopTier >= 1 && rnd() < .5) { const o = shopItem('nomi', g.shopTier); g.stock.push({ o, inf: false, price: Math.max(10, Math.round(basePrice(o) * g.shopRate / 10) * 10) }); }
  return g;
}
const roomOf2 = (r, x, y) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
// つよい こたい（強個体）：だいたい 15ぴきに 1ぴき。色ちがいで 光る。HP2倍・こうげき1.35倍・けいけんち3倍・かならず 何か 落とす
// （乱数の 並びを かえないよう、合言葉と 場所から きめる）
const ELITE_RATE = 7;
function addMon(g, t, x, y, boss) { const d = MON[t]; const sc = monScale(g.f), lh = sc.hp, la = sc.atk;
  const elite = !boss && t !== 'keeper' && g.f >= 2 && hashSeed(runSeed + ':' + g.f + ':' + x + ':' + y + ':' + t) % 100 < ELITE_RATE, em = elite ? 2 : 1;
  const hp = Math.round(d.hp * lh * (boss ? 1.3 : 1) * em); g.mons.push({ t, x, y, hp, mhp: hp, atk: Math.round(d.atk * la * (boss ? .8 : 1) * (elite ? 1.35 : 1)), def: d.def + (boss ? 2 : 0) + (elite ? 1 : 0), boss, elite, exp: Math.round(d.exp * sc.exp * (elite ? 3 : 1)), stuck: 0, flash: 0, name: boss ? 'でかこわの王' : (elite ? 'つよい' : '') + d.name }); }
