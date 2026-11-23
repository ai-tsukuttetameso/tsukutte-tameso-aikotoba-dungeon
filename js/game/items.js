// アイテムを作る・名前と説明を出す
'use strict';

function shopItem(k, tier) { const o = newItem(k, 'shop'); if (!ITEMS[k].equip) return o;
  const slot = ITEMS[k].equip, pool = Object.keys(TRAITS).filter(x => TRAITS[x].slot === (slot === 'atk' ? 'atk' : 'def'));
  o.plus = [0, 1, 3, 5][tier]; o.traits = [];
  const want = [0, 1, 2, 2][tier]; if (tier >= 2 && slot === 'atk') o.traits.push(pick(['honoo', 'koori']));
  while (o.traits.length < want) { const tr = pick(pool); if (!o.traits.includes(tr)) o.traits.push(tr); }
  return o; }
function zap(o, effect) { if (o.n <= 0) return '杖を ふったが、もう 何も出なかった。'; o.n--; const r = ray(10); fx(r.path, '#e0a0ff'); sfx('zap'); if (!r.m) return '杖を ふった。光が とんでいったが、何にも 当たらなかった。'; r.m.sleep = false; effect(r.m); }
let FAKE = {};
function shuffleFake() { FAKE = {}; for (const cat of Object.keys(FAKE_NAMES)) { const names = [...FAKE_NAMES[cat]]; for (let i = names.length - 1; i > 0; i--) { const j = ri(0, i); [names[i], names[j]] = [names[j], names[i]]; }
  Object.keys(ITEMS).filter(k => ITEMS[k].cat === cat).forEach((k, i) => FAKE[k] = names[i]); } }
const isKnown = k => !ITEMS[k].cat || P.known.has(k);
function newItem(k, from) { const o = { k, plus: 0, traits: [] }; const it = ITEMS[k];
  if (it.equip && rnd() < .45) o.traits.push(pick(Object.keys(TRAITS).filter(x => TRAITS[x].slot === (it.equip === 'atk' ? 'atk' : 'def'))));
  if (it.equip && from === 'floor' && rnd() < .15) o.cursed = true;
  if (it.cat === 'wand') o.n = ri(3, 6);
  if (k === 'arrow') o.n = ri(5, 10);
  if (it.bag) { o.items = []; o.cap = ri(3, 5); }
  return o; }
const itemVal = o => ITEMS[o.k].val + (o.plus || 0);
const itemName = o => { const it = ITEMS[o.k]; let s = isKnown(o.k) ? it.name : FAKE[o.k];
  if (o.plus) s += '+' + o.plus; if (o.k === 'arrow') s += `（${o.n}本）`; if (it.cat === 'wand' && isKnown(o.k)) s += `［${o.n}］`; if (it.bag) s += `［${o.items.length}/${o.cap}］`;
  if (o.cursed && o.curseKnown) s += '（のろい）'; if (o.unpaid) s += ` 〔${o.unpaid}G・まだ払っていない〕`; return s; };
const itemDesc = o => { const it = ITEMS[o.k]; if (!isKnown(o.k)) return '使うまで 何か分からない'; if (!it.equip) return it.desc;
  return `${SLOT_NAME[it.equip]}・${it.equip === 'atk' ? 'こうげき' : 'ぼうぎょ'}＋${itemVal(o)}${it.atk ? '・こうげき＋' + it.atk : ''}` + (o.traits && o.traits.length ? '・' + o.traits.map(x => TRAITS[x].name).join('・') : '') + (o.tslot ? `・特性わく${traitCap(o)}` : '') + (o.cursed && o.curseKnown ? '・のろわれている' : '') + (it.note ? '。' + it.note : ''); };
const nameHtml = o => isKnown(o.k) ? escH(itemName(o)) : `<span class="unk">${escH(itemName(o))}</span>`;
// ===== 特性の わく =====
// 装備の 特性は ふつう 3つまで。「あなあけの のみ」・かじやの わざ「あなあけ」・AIかじやの「わくを ふやす」で 1つずつ ふやせる（最大 TRAIT_SLOT_MAX）
// ふやした 数は 装備ごとに o.tslot に のこる（冒険者データにも そのまま ひきつぐ）
const TRAIT_SLOT_BASE = 3, TRAIT_SLOT_MAX = 6, EQ_ORDER = ['atk', 'def', 'head', 'arm', 'foot'];
const traitCap = o => Math.min(TRAIT_SLOT_MAX, TRAIT_SLOT_BASE + (o.tslot || 0));
// のみ・わざで わくを ふやす 相手：そうびの 中から 特性が うまっている物 → わくが 少ない物 → 武器・たて・あたま・うで・あしの 順
function slotTarget() { return P.inv.filter(o => o.eq && ITEMS[o.k].equip && traitCap(o) < TRAIT_SLOT_MAX)
  .sort((a, b) => ((b.traits || []).length >= traitCap(b)) - ((a.traits || []).length >= traitCap(a)) || traitCap(a) - traitCap(b) || EQ_ORDER.indexOf(ITEMS[a.k].equip) - EQ_ORDER.indexOf(ITEMS[b.k].equip))[0] || null; }
function addTraitSlot(o, src) { o.tslot = (o.tslot || 0) + 1; return `${src}：${itemName(o)}の 特性の わくが ${traitCap(o)}つに ふえた！（合成で 特性を ${traitCap(o)}つまで もてる）`; }
const hasTrait = tr => P.inv.some(o => o.eq && o.traits && o.traits.includes(tr));
