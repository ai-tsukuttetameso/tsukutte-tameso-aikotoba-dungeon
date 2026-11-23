// ===== にもつの わざ（v1.63）：しまう袋の 入る数を ふやす（1つ 12こまで）。そのかわり にもつが おおいと おなかが へりやすい =====
// もちものの わく（12）は ふやさない（番号キーで 使えるのが 12ばんめまで なので）
'use strict';
const BAG_CAP_MAX = 12, LOAD_STEP = 150;
// にもつの 数（もちもの＋袋の 中身）と、もちものの ふつうの 上限（12）を こえた ぶん
const loadCount = () => invCount() + P.inv.filter(o => ITEMS[o.k].bag).reduce((s, b) => s + (b.items || []).length, 0);
const loadOver = () => Math.max(0, loadCount() - INV_MAX);
function widenBag(n) { const bags = P.inv.filter(o => ITEMS[o.k].bag && o.cap < BAG_CAP_MAX).sort((a, b) => a.cap - b.cap);
  if (!bags.length) { say(P.inv.some(o => ITEMS[o.k].bag) ? `袋は もう これいじょう 大きく できない。（1つ ${BAG_CAP_MAX}こまで）` : 'しまう袋を もっていない。'); return 0; }
  for (const b of n ? bags : bags.slice(0, 1)) { b.cap = Math.min(BAG_CAP_MAX, b.cap + (n || 1)); say(`${itemName(b)}が ひろがった！（${b.items.length}/${b.cap}）`); } return bags.length; }
SKILLS.push(
  { id: 'fukuro', name: 'ふくろぬい', mp: 5, kind: 'とくぎ', desc: 'もっている しまう袋 1つの 入る数を 1 ふやす（いちばん 小さい 袋から。1つ 12こまで）', run: () => { if (!widenBag(0)) return false; boom([[P.x, P.y]], '#e8c07a'); return true; } },
  { id: 'nimotsu', name: 'にもつもち', mp: 10, kind: 'とくぎ', desc: 'もっている しまう袋 ぜんぶの 入る数を 1ずつ ふやす（1つ 12こまで）', run: () => { if (!widenBag(1)) return false; boom([[P.x, P.y]], '#e8c07a'); return true; } },
  { id: 'karuwaza', name: 'かるがるせおい', mp: 6, kind: 'とくぎ', desc: '100ターンの あいだ、にもつが おもくても おなかの へりかたが ふつうの まま', run: () => { P.karuT = 100; boom([[P.x, P.y]], '#9ad0ff'); say('かるがるせおい！ 100ターン にもつが かるく かんじる。'); return true; } },
  { id: 'yojigen', name: 'よじげんぶくろ', mp: 14, kind: 'とくぎ', combo: ['fukuro', 'nimotsu'], desc: 'もっている しまう袋 ぜんぶの 入る数を 2ずつ ふやす（1つ 12こまで）', run: () => { say('よじげんぶくろ！'); if (!widenBag(2)) return false; boom(around().cells, '#c08aff'); return true; } });
Object.assign(JOBS.tool.skills, { fukuro: 4 }); Object.assign(JOBS.thief.skills, { fukuro: 6 });
Object.assign(JOBS.akindo.skills, { karuwaza: 5 }); Object.assign(JOBS.thief.skills, { karuwaza: 9 }); Object.assign(JOBS.smith.skills, { nimotsu: 6 }); Object.assign(JOBS.akindo.skills, { nimotsu: 2 }); Object.assign(JOBS.senshi.skills, { nimotsu: 8 });
// にもつが 12こを こえると、こえた 数に あわせて おなかが へりやすい（こえた 数 × ターン が 150 たまるごとに おなか −1）
// 特性「かるがる」か わざ「かるがるせおい」の あいだは、おもくても ふつうの へりかた
const loadFree = () => hasTrait('karugaru') || P.karuT > 0;
function loadHunger() { if (P.karuT > 0 && !--P.karuT) say('かるがるせおいの 力が きれた。'); const ov = loadOver(); if (!ov || loadFree()) return; P.loadAcc = (P.loadAcc || 0) + ov;
  if (!P.heavyTold) { P.heavyTold = true; say('にもつが おもい……。12こを こえると おなかが へりやすく なる。'); }
  while (P.loadAcc >= LOAD_STEP) { P.loadAcc -= LOAD_STEP; if (P.food > 0) P.food--; } }
COMBO_SKILLS.push(...SKILLS.filter(s => s.id === 'yojigen'));
