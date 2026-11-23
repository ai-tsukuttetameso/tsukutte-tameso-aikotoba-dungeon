// ゲームの状態（G=いまの階、P=プレイヤー）とログ
'use strict';

const W = 44, H = 30; let LAST = 10, treasure = false; let VW = 17, VH = 11;  // LAST＝いちばん下の階、treasure＝おたからダンジョンか、VW・VH＝画面に うつす マスの数

// ===== 状態 =====
let G, runSeed = 1, daily = '', password = '', runMode = 'random';
const P = { x: 0, y: 0, dir: [0, 1], hp: 30, mhp: 30, mp: 10, mmp: 10, atk: 4, def: 0, lv: 1, exp: 0, food: 100, gold: 0, inv: [], turn: 0, skip: 0, flash: 0, known: new Set(), visits: {}, cause: '' };
const logs = [], logAll = [];
const eqItem = s => P.inv.find(o => o.eq && ITEMS[o.k].equip === s);
const eqVal = s => { const o = eqItem(s); return o ? itemVal(o) : 0; };
// ぼうぎょの 合計（たて・あたま・うで・あし）と こうげきの 合計（てつのこては こうげきも ＋1）
const defTotal = () => P.def + ARMOR_SLOTS.reduce((a, s) => a + eqVal(s), 0);
const atkTotal = () => { const a = eqItem('arm'); return P.atk + eqVal('atk') + (a && ITEMS[a.k].atk || 0) + (P.buffAtk || 0); };
// そうびしている 防具の とくべつな 力（perk）
const eqPerk = p => P.inv.some(o => o.eq && ITEMS[o.k].perk === p);
// そうび中の物は「そうびバッグ」あつかいで、もちものの 数（INV_MAX）に 数えない
const invCount = () => P.inv.filter(o => !o.eq).length;
const invMax = () => INV_MAX;  // もちものの わく（番号キーで 使える 12こまで）
const invFull = () => invCount() >= invMax();
// そうび中の物を もちものの うしろに まとめる（番号キー 1〜^ は もちものだけに つく）
function tidyEq() { const a = P.inv.filter(o => !o.eq), b = P.inv.filter(o => o.eq); if (b.length && P.inv.slice(a.length).some(o => !o.eq)) P.inv = [...a, ...b]; }
const eqName = s => { const o = eqItem(s); return o ? itemName(o) : (s === 'atk' ? 'すで' : 'なし'); };
function say(t) { if (!t) return; logs.unshift(t); logs.length = Math.min(logs.length, 3); logAll.push(t); if (logAll.length > 80) logAll.shift(); }
function hashSeed(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h % 2147483646 + 1; }
