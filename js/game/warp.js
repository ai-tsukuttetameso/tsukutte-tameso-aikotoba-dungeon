// 階を ワープする（いっきに もぐる・浮上する）おふだと わざ
// おふだは 合言葉と 階から きめた 場所に おく（hashSeed）。ダンジョンを つくる 乱数は つかわないので、地図・道具は 前と 同じ
'use strict';

// [id, 名前, うごく 階の数（＋＝もぐる、−＝浮上）, 色, 出やすさ, 売るときの ねだん]
const WARP_SCROLLS = [
  ['s_dive1', 'くだりのおふだ', 1, { hue: 200, sat: 1.3 }, 40, 60],
  ['s_rise1', 'のぼりのおふだ', -1, { hue: 60, sat: 1.4, light: 1.1 }, 35, 60],
  ['s_dive3', 'おおぞこのおふだ', 3, { hue: 250, sat: 1.4, light: .9 }, 15, 200],
  ['s_rise3', 'そらとびのおふだ', -3, { hue: 30, sat: 1.6, light: 1.2 }, 10, 200],
];
const WARP_RATE = 18;  // 100の うち いくつの 階に おふだが 1まい おちているか
const warpWord = n => n > 0 ? `${n}階 もぐる` : `${-n}階 浮上する`;
// もぐれない ときの 理由（なければ ''）
function warpBlock(n) { if (!G || G.over) return 'いまは つかえない。';
  if (n > 0 && midBossAlive()) return 'ぬしの 力が じゃまをして、下へは 行けない。（ぬしを たおそう）';
  if (n > 0 && G.f >= LAST) return 'これより 下は ない。'; if (n < 0 && G.f <= 1) return 'これより 上は ない。'; return ''; }
// 使った ターンの おわりに ワープする（endTurn から よぶ）
function warpFloor(n, how) { const to = Math.max(1, Math.min(LAST, G.f + n)); if (to === G.f) return false;
  stairsSound(); shake(5); enterFloor(to);
  say(`${how}で 地下${to}階へ ${n > 0 ? 'もぐった' : '浮上した'}！`); showBanner(`地下${to}階へ ${n > 0 ? 'もぐった！' : '浮上した！'}`, how); return true; }

for (const [id, name, n, col, , price] of WARP_SCROLLS) {
  const spr = 'scroll_' + id; if (S.scroll) S[spr] = variant(S.scroll, col);
  ITEMS[id] = { name, cat: 'scroll', known: true, desc: `いっきに ${warpWord(n)}`, spr: S[spr] ? spr : 'scroll', warp: n,
    need: () => warpBlock(n), use: () => { P.warp = { n, how: name }; return `${name}を よんだ。からだが ${n > 0 ? 'しずんでいく' : 'うきあがる'}……`; } };
  PRICE[id] = price; }

// おふだを 階に おく（decorateFloor から よぶ）
function placeWarpScroll(g) { const f = g.f; if (f >= LAST || runMode === 'preview') return;
  const h = hashSeed(runSeed + ':warp:' + f); if (h % 100 >= WARP_RATE) return;
  const tot = WARP_SCROLLS.reduce((a, w) => a + w[4], 0); let r = (h >>> 8) % tot, k = WARP_SCROLLS[0][0];
  for (const w of WARP_SCROLLS) { if (r < w[4]) { k = w[0]; break; } r -= w[4]; }
  const room = g.rooms[(h >>> 16) % g.rooms.length]; const p = freeByHash(g, room, 'warp'); if (p) g.items.push({ ...p, k, o: { k, plus: 0, traits: [] } }); }

// わざ（覚える レベルは 職業ごと）
const WARP_SKILLS = [
  { id: 'rise', name: 'うかびの術', mp: 6, kind: 'まほう', n: -2, desc: 'いっきに 2階 浮上する' },
  { id: 'dive', name: 'もぐりの術', mp: 10, kind: 'とくぎ', n: 2, desc: 'いっきに 2階 もぐる' },
  { id: 'bigdive', name: 'ちていへの とびら', mp: 16, kind: 'まほう', n: 4, desc: 'いっきに 4階 もぐる' },
];
for (const s of WARP_SKILLS) SKILLS.push({ ...s, run: () => { const b = warpBlock(s.n); if (b) { say(b); return false; } P.warp = { n: s.n, how: s.name }; say(`${s.name}！`); return true; } });
Object.assign(JOBS.thief.skills, { rise: 6 }); Object.assign(JOBS.mage.skills, { rise: 7 });
Object.assign(JOBS.ninja.skills, { dive: 7 }); Object.assign(JOBS.kenja.skills, { bigdive: 9 });
