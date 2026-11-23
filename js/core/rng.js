// 乱数（シード付き）。合言葉が同じなら 同じ乱数の並びになる
'use strict';

// ===== 乱数 =====
let seed = (Date.now() % 100000) + 1;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = a => a[Math.floor(rnd() * a.length)];
