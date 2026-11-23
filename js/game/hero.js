// 冒険者データ（レベル・お金・装備を 次の 冒険へ ひきつぐ。この端末に のこる）
'use strict';

// ===== しくみ =====
// ・冒険が おわったとき（クリア・力つきた）に、レベル・けいけんち・お金・手に入れた 装備を「冒険者データ」に のこす
//   力つきたときは お金が 半分に なる（HERO_DEAD_GOLD）
// ・つぎの 冒険を はじめると、レベルと お金は そのまま。装備は そうびしていた物を そのまま そうびし、
//   ほかの 装備は もちものに HERO_TAKE こまで もっていく。のこりは「そうこ」に しまっておく
// ・とちゅうで「やめる」で タイトルに もどったときは、冒険は 中断（つづきから で もどれる）なので まだ のこさない
const HERO_KEY = 'aikotoba_hero', HERO_STORE_MAX = 30, HERO_TAKE = 4, HERO_DEAD_GOLD = .5;
function loadHero() { try { const h = JSON.parse(localStorage.getItem(HERO_KEY) || 'null'); if (h && h.lv) return h; } catch (e) {} return { lv: 1, exp: 0, gold: 0, store: [] }; }
function saveHero(h) { try { localStorage.setItem(HERO_KEY, JSON.stringify(h)); } catch (e) {} }
function resetHero() { try { localStorage.removeItem(HERO_KEY); } catch (e) {} }
const gearValue = o => (ITEMS[o.k].val || 0) * 100 + (o.plus || 0) * 80 + (o.traits ? o.traits.length * 50 : 0) + (o.tslot || 0) * 120 + (ITEMS[o.k].rare ? 500 : 0);
const cleanGear = o => { const c = JSON.parse(JSON.stringify(o)); delete c.unpaid; return c; };

// 冒険の おわりに のこす
function bankRun(kind) { if (!P.job) return null; const h = loadHero();
  const gear = [...P.inv, ...myBags().flatMap(b => b.items)].filter(o => ITEMS[o.k].equip && !o.unpaid).map(cleanGear);
  h.lv = Math.max(1, P.lv); h.exp = P.exp; const gold = kind === 'dead' ? Math.floor(P.gold * HERO_DEAD_GOLD) : P.gold; h.gold = gold;
  // そうこが いっぱいなら 弱い物から あふれる
  h.store = [...gear, ...(h.store || [])].sort((a, b) => (b.eq ? 1 : 0) - (a.eq ? 1 : 0) || gearValue(b) - gearValue(a)).slice(0, HERO_STORE_MAX);
  saveHero(h); return { gold, gear: gear.length, lost: kind === 'dead' ? P.gold - gold : 0 }; }

// 中断した 冒険（「やめる」で タイトルに もどった セーブ）を、新しい 冒険を はじめる 前に 冒険者データへ のこす
// レベル・お金・装備を そのまま のこす（中断なので お金は へらない）。のこしたら その セーブは けす
function bankSuspended() { const j = readLocalSave(); if (!j) return null; const s = j.s, h = loadHero();
  const inv = s.p.inv || [], gear = [...inv, ...inv.filter(o => ITEMS[o.k] && ITEMS[o.k].bag).flatMap(b => b.items || [])].filter(o => ITEMS[o.k] && ITEMS[o.k].equip).map(cleanGear);
  h.lv = Math.max(h.lv || 1, s.p.lv || 1); if ((s.p.lv || 1) >= h.lv) h.exp = s.p.exp || 0; h.gold = s.p.gold || 0;
  h.store = [...gear, ...(h.store || [])].sort((a, b) => (b.eq ? 1 : 0) - (a.eq ? 1 : 0) || gearValue(b) - gearValue(a)).slice(0, HERO_STORE_MAX);
  saveHero(h); clearLocalSave(); return gear.length; }
// 冒険の はじめに つかう（applyJobStart の あと）
function applyHeroStart() { const h = loadHero(); P.gold = h.gold || 0;
  for (let l = 2; l <= h.lv; l++) { P.mhp += 7; P.mmp += 3; P.atk += 1; jobLevelUp(); }
  P.lv = h.lv; P.exp = h.exp || 0; P.hp = P.mhp; P.mp = P.mmp;
  const store = (h.store || []).slice(), taken = [], used = new Set();
  // そうびしていた物（部位ごとに 1つ）
  for (const o of store) { const sl = ITEMS[o.k].equip; if (o.eq && !used.has(sl)) { used.add(sl); taken.push(o); } }
  for (const o of store) if (!taken.includes(o)) o.eq = false;
  // ほかの 装備は 強い順に HERO_TAKE こまで
  for (const o of store.filter(o => !taken.includes(o)).sort((a, b) => gearValue(b) - gearValue(a)).slice(0, HERO_TAKE)) taken.push(o);
  if (taken.some(o => o.eq && ITEMS[o.k].equip === 'atk')) P.inv = P.inv.filter(o => o.k !== 'sword');  // 武器を もっているなら はじめの けんは なし
  P.inv.push(...taken); h.store = store.filter(o => !taken.includes(o)); saveHero(h); tidyEq();
  return taken.length; }
