// モンスター・属性・階ごとの出現表
'use strict';

// ===== データ =====
const ELEM = { fire: { name: '炎', color: '#ff7a2a' }, ice: { name: '氷', color: '#7ad8ff' }, thunder: { name: '雷', color: '#ffe14d' } };
const MON = {
  kinoko: { name: 'キノコン', hp: 8, atk: 3, def: 0, exp: 3, spr: 'kinoko' , weak: 'fire' },
  bat: { name: 'ふらふらコウモリ', hp: 6, atk: 3, def: 0, exp: 4, spr: 'bat', erratic: true , weak: 'thunder' },
  cat: { name: 'ミームねこ', hp: 12, atk: 0, def: 1, exp: 6, spr: 'cat', dance: true , weak: 'ice' },
  thief: { name: 'こそどろネズミ', hp: 10, atk: 0, def: 1, exp: 8, spr: 'rat', steal: true, fast: true , weak: 'fire' },
  robo: { name: 'AI暴走ロボ', hp: 16, atk: 6, def: 2, exp: 10, spr: 'robo', fast: true , weak: 'thunder', resist: 'fire' },
  dekakowa: { name: 'でかこわ', hp: 45, atk: 11, def: 4, exp: 40, spr: 'dekakowa', big: true , weak: 'ice', resist: 'fire' },
  // ここから 下は 深い ダンジョン（地下11階より下）で 出る敵
  golem: { name: 'ごろごろ岩', hp: 40, atk: 8, def: 6, exp: 18, spr: 'golem', weak: 'thunder', resist: 'fire' },
  lamp: { name: 'おばけランプ', hp: 22, atk: 8, def: 2, exp: 14, spr: 'lamp', erratic: true, weak: 'ice', resist: 'fire' },
  bat2: { name: 'でんげきコウモリ', hp: 18, atk: 8, def: 1, exp: 12, spr: 'bat2', erratic: true, weak: 'ice', resist: 'thunder' },
  robo2: { name: 'AI暴走ロボ改', hp: 34, atk: 11, def: 5, exp: 24, spr: 'robo2', fast: true, weak: 'thunder', resist: 'fire' },
  cat2: { name: 'やみミームねこ', hp: 30, atk: 0, def: 3, exp: 16, spr: 'cat2', dance: true, weak: 'fire' },
  thief2: { name: 'おおどろネズミ', hp: 26, atk: 0, def: 3, exp: 20, spr: 'rat2', steal: true, fast: true, weak: 'fire' },
  dragon: { name: 'ちびドラゴン', hp: 60, atk: 12, def: 6, exp: 40, spr: 'dragon', weak: 'ice', resist: 'fire' },
  dekakowa2: { name: 'くろでかこわ', hp: 90, atk: 15, def: 8, exp: 80, spr: 'dekakowa2', big: true, weak: 'thunder', resist: 'ice' },
  keeper: { name: 'おこった店主', hp: 150, atk: 18, def: 6, exp: 120, spr: 'clerk_angry', fast: true },
};
const FLOOR_MON = [[],
  ['kinoko', 'kinoko', 'bat'], ['kinoko', 'bat', 'cat', 'thief'], ['bat', 'cat', 'robo'], ['bat', 'cat', 'robo', 'thief'],
  ['cat', 'robo', 'robo', 'dekakowa'], ['cat', 'robo', 'thief', 'dekakowa'], ['robo', 'robo', 'thief', 'dekakowa'],
  ['robo', 'cat', 'robo', 'dekakowa'], ['robo', 'thief', 'robo', 'dekakowa'], ['robo', 'robo', 'dekakowa']];
// 地下11階より下の 出現表（深い ダンジョンだけで 使う）。[この階から, 出る敵]
const DEEP_MON = [
  [10, ['robo', 'cat', 'thief', 'golem', 'lamp', 'bat2', 'dekakowa']],
  [20, ['golem', 'lamp', 'bat2', 'robo2', 'cat2', 'dekakowa']],
  [35, ['robo2', 'cat2', 'thief2', 'lamp', 'golem', 'dragon', 'dekakowa']],
  [55, ['robo2', 'thief2', 'dragon', 'dekakowa2', 'cat2', 'bat2']],
  [80, ['dragon', 'dragon', 'dekakowa2', 'robo2', 'thief2', 'cat2']],
];
// f階に 出る敵の 一覧。ふつうの 10階ダンジョンは いままでどおり FLOOR_MON を使う
function monPool(f) { if (LAST === 10 || f < 10) return FLOOR_MON[Math.min(f, 10)]; let p = DEEP_MON[0][1]; for (const [from, list] of DEEP_MON) if (f >= from) p = list; return p; }
// 敵の 強さの 倍率（10階までは いままでどおり、その先は ゆるやかに 強くなる）
function monScale(f) { return f <= 10 ? { hp: 1 + (f - 1) * .3, atk: 1 + (f - 1) * .22, exp: 1 }
  : { hp: 3.7 + (f - 10) * .12, atk: 2.98 + (f - 10) * .03, exp: 1 + (f - 10) * .1 }; }
// お店が ある階と、品ぞろえの ランク（0〜3）
const isShopFloor = f => f % 3 === 0 && f < LAST;
const shopTierOf = f => f <= 3 ? 0 : f <= 6 ? 1 : f < 15 ? 2 : 3;
