// 階の しかけ・10階ごとの ぬし（中ボス）・かくし合言葉
// どれも 合言葉と 階から きめる（hashSeed）。ダンジョンを つくる 乱数（rnd）は つかわないので、地図・道具は 前と 同じ
'use strict';

// ===== 階の しかけ：3階から、だいたい 3階に 1回 ルールが かわる =====
const RULES = {
  dark: { name: 'くらやみの階', short: 'くらやみ', desc: 'まわり 2マスしか 見えない' },
  ice: { name: 'こおりの階', short: 'こおり', desc: '歩くと 止まれずに すべっていく', tip: 'ヒント：ななめに 歩くと すべらない。ななめで 通路の 入口の 正面に 合わせてから まっすぐ 進もう' },
  hunger: { name: 'はらぺこの階', short: 'はらぺこ', desc: 'おなかが 2倍 はやく へる' },
  gold: { name: 'おかねの階', short: 'おかね', desc: 'お金が 2倍。お金も 多く おちている' },
  magic: { name: 'まりょくの階', short: 'まりょく', desc: 'わざの MPが 半分' },
  strong: { name: 'つわものの階', short: 'つわもの', desc: '敵が 強い。そのかわり けいけんち 2倍' },
};
const RULE_IDS = Object.keys(RULES);
const RULE_RATE = 35;  // 100の うち いくつの 階で しかけが ある か
// ぬしの 階：10・20・30…階（さいごの 階は でかこわの王なので のぞく）
const isMidFloor = f => f % 10 === 0 && f < LAST;

// ===== かくし合言葉（入れると とくべつな ダンジョンに なる。動画では 1つだけ 見せる） =====
// key は normPw した 形（カタカナは ひらがな、のばす ぼう・点・空白は きえる）
const SECRETS = {
  'つくってためそ': { name: 'つくってためその ダンジョン', desc: '毎階 うーたんか タメゾウが まっている', friends: true },
  'でかこわ': { name: 'でかこわの すみか', desc: '出てくる 敵が ぜんぶ でかこわ', mon: 'dekakowa' },
  'ねこまみれ': { name: 'ねこまみれダンジョン', desc: '出てくる 敵が ぜんぶ ねこ', mon: 'cat' },
  'くらやみ': { name: 'まっくらダンジョン', desc: 'ぜんぶの 階が くらやみ', rule: 'dark' },
  'おかねもち': { name: 'おかねもちダンジョン', desc: 'ぜんぶの 階が おかねの階', rule: 'gold', treasure: true },
  'こおりのせかい': { name: 'こおりの せかい', desc: 'ぜんぶの 階が こおりの階', rule: 'ice' },
};
const SECRET_IDS = Object.keys(SECRETS);
const secretKey = () => runMode === 'pw' && SECRETS[normPw(password)] ? normPw(password) : null;
const curSecret = () => { const k = secretKey(); return k ? SECRETS[k] : null; };

// この階の しかけ（なければ null）
function ruleOf(f) { const s = curSecret(); if (f === LAST || isMidFloor(f)) return null; if (s && s.rule) return s.rule;
  if (f < 3 || runMode === 'preview') return null; const h = hashSeed(runSeed + ':rule:' + f);
  return h % 100 < RULE_RATE ? RULE_IDS[(h >>> 8) % RULE_IDS.length] : null; }
const curRule = () => G && G.f ? ruleOf(G.f) : null;
const ruleIs = r => curRule() === r;

// かくし合言葉で 出る 敵を かえる（addMon から よぶ）
function secretMon(t, f, x, y) { const s = curSecret(); if (!s || !s.mon || t === 'keeper') return t;
  const fam = Object.keys(MON).filter(k => (MON[k].like || k) === s.mon || k === s.mon || (s.mon === 'cat' && /^cat/.test(k)) || (s.mon === 'dekakowa' && /^dekakowa/.test(k)));
  // 浅い 階は 弱い なかま、深いほど 強い なかま
  fam.sort((a, b) => MON[a].exp - MON[b].exp); const top = Math.min(fam.length, 1 + Math.floor(f / 6));
  return fam[hashSeed(runSeed + ':s:' + f + ':' + x + ':' + y) % top]; }

// ===== 階を つくった あとに 足す もの（ぬし・おかね・友だち） =====
// 場所は 部屋の マスを hash の 順に しらべて きめる
function freeByHash(g, r, salt) { const cells = []; for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) cells.push([x, y]);
  const busy = (x, y) => g.items.some(o => o.x === x && o.y === y) || g.traps.some(o => o.x === x && o.y === y) || g.mons.some(o => o.x === x && o.y === y)
    || (g.stairs.x === x && g.stairs.y === y) || (g.shop && g.shop.x === x && g.shop.y === y) || (g.npc && g.npc.x === x && g.npc.y === y) || (g.start.x === x && g.start.y === y);
  const h = hashSeed(runSeed + ':' + salt + ':' + g.f);
  for (let i = 0; i < cells.length; i++) { const [x, y] = cells[(h + i * 7) % cells.length]; if (!busy(x, y)) return { x, y }; } return null; }
function decorateFloor(g) { const f = g.f, s = curSecret(), rule = ruleOf(f);
  if (isMidFloor(f)) placeMidBoss(g);
  if (rule === 'gold') for (let k = 0; k < 4; k++) { const r = g.rooms[1 + (hashSeed(runSeed + ':gr:' + f + ':' + k) % Math.max(1, g.rooms.length - 1))] || g.rooms[0]; const p = freeByHash(g, r, 'gold' + k);
    if (p) g.items.push({ ...p, k: 'gold', amt: (30 + (hashSeed(runSeed + ':ga:' + f + ':' + k) % 60)) * f }); }
  if (typeof placeWarpScroll === 'function') placeWarpScroll(g);
  if (s && s.friends && f >= 2 && f < LAST && !g.npc) { const r = g.rooms[1 + (hashSeed(runSeed + ':fr:' + f) % Math.max(1, g.rooms.length - 1))] || g.rooms[0]; const p = freeByHash(g, r, 'friend');
    if (p) g.npc = { ...p, who: f % 2 ? 'tamezou' : 'uutan' }; }
  return g; }
// ぬし：その階の 敵の なかで いちばん 強い なかまを、階段の 部屋に。たおすまで 階段は ふういん
function placeMidBoss(g) { const f = g.f, pool = monPool(f).filter(t => !MON[t].big), t = pool.slice().sort((a, b) => MON[b].exp - MON[a].exp)[0] || 'kinoko';
  const p = freeByHash(g, g.rooms[g.rooms.length - 1], 'mid'); if (!p) return; addMon(g, t, p.x, p.y); const m = g.mons[g.mons.length - 1];
  Object.assign(m, { mid: true, elite: true, sleep: false, hp: m.hp * 3, mhp: m.mhp * 3, atk: Math.round(m.atk * 1.25), def: m.def + 2, exp: m.exp * 5, name: MON[m.t].name + 'の ぬし' }); }
// ぬしを たおした ときの ごほうび（killMon から よぶ）
function midBossDrop(m) { const f = G.f; progAdd('midboss', 'kills'); setTimeout(() => checkTitles(), 0);
  const kk = rnd() < .5 ? pick(WEAPON_TIERS[weaponTier(f)]) : pick(ARMOR_POOL), o = newItem(kk, 'floor'); o.plus = (o.plus || 0) + Math.floor(f / 5);
  const pool = GEN_TRAITS[ITEMS[kk].equip === 'atk' ? 'atk' : 'def']; const tr = pick(pool); if (!o.traits.includes(tr)) o.traits.push(tr);
  const p = freeNear(m.x, m.y); if (p) G.items.push({ ...p, k: kk, o }); const q = freeNear(m.x, m.y); if (q) G.items.push({ ...q, k: 'gold', amt: 200 * f });
  sfx('clear'); shake(6); showBanner('ぬしを たおした！', '階段の ふういんが とけた'); say(`${m.name}を たおした！ 階段の ふういんが とけた。ごほうびを 落とした！`); }
const midBossAlive = () => G && G.mons.some(m => m.mid);
// 階に 入った ときの お知らせ
function announceFloor(f) { const s = curSecret(), k = secretKey(), r = ruleOf(f);
  if (s && f === (P.startF || 1)) { showBanner('かくし合言葉！', `${s.name}：${s.desc}`); progMark('secret', k); sfx('clear'); return; }
  if (isMidFloor(f)) { showBanner(`地下${f}階：ぬしの 階`, 'ぬしを たおすまで 階段は ふういん'); say('この階には「ぬし」が いる。たおさないと 階段は ひらかない。'); sfx('boss'); return; }
  if (r) { showBanner(RULES[r].name, RULES[r].desc + (RULES[r].tip ? '（ななめなら すべらない）' : '')); say(`${RULES[r].name}：${RULES[r].desc}。`); if (RULES[r].tip) say(RULES[r].tip + '。'); progMark('rules', r); } }
// こおりの階：歩いたら、かべ・敵・道具・階段の 手前まで すべる
function iceSlide(dx, dy) { if (!ruleIs('ice') || (dx && dy)) return 0; let n = 0;
  while (n < 8) { const nx = P.x + dx, ny = P.y + dy;
    if (!isFloor(nx, ny) || monAt(nx, ny) || shopAt(nx, ny) || npcAt(nx, ny) || G.items.some(o => o.x === P.x && o.y === P.y) || (G.stairs.x === P.x && G.stairs.y === P.y)) break;
    P.x = nx; P.y = ny; n++; }
  if (n) { say(`つるつる……${n}マス すべった。`); if (P.iceTipF !== G.f) { P.iceTipF = G.f; say('（ななめに 歩くと すべらない）'); } } return n; }
