// わざ・まほう
'use strict';

// ===== わざ・まほう =====
const SKILLS = [
  { id: 'heal', name: 'ヒール', mp: 4, kind: 'まほう', desc: 'HPを 回復する', run: () => { const h = 18 + P.lv * 3, b = P.hp; P.hp = Math.min(P.mhp, P.hp + h); boom([[P.x, P.y]], '#7cf0a0'); say(`ヒール！ HPが ${P.hp - b} 回復した。`); return true; } },
  { id: 'fire', name: 'ファイア', mp: 3, kind: 'まほう', el: 'fire', desc: '前に 炎を とばす（炎）', run: () => { const r = ray(6); fx(r.path, ELEM.fire.color); say('ファイア！'); if (r.m) elemHit(r.m, 8 + P.lv * 2, 'fire'); else say('炎は どこにも 当たらなかった。'); return true; } },
  { id: 'double', name: '2回斬り', mp: 3, kind: 'とくぎ', desc: '目の前の敵を 2回 こうげき', run: () => multiHit(2) },
  { id: 'ice', name: 'ブリザド', mp: 5, kind: 'まほう', el: 'ice', desc: '前に 氷を とばす。当たると 3ターン こおる（氷）', run: () => { const r = ray(6); fx(r.path, ELEM.ice.color); say('ブリザド！'); if (r.m) { const m = r.m; elemHit(m, 10 + P.lv * 2, 'ice'); if (G.mons.includes(m)) { m.stuck = Math.max(m.stuck, 3); say(`${m.name}は こおりついた！`); } } else say('氷は どこにも 当たらなかった。'); return true; } },
  { id: 'spin', name: '回転斬り', mp: 5, kind: 'とくぎ', desc: 'まわり8マスの敵 ぜんぶを こうげき', run: () => { const ms = G.mons.filter(m => Math.max(Math.abs(m.x - P.x), Math.abs(m.y - P.y)) === 1); const cells = []; for (let y = P.y - 1; y <= P.y + 1; y++) for (let x = P.x - 1; x <= P.x + 1; x++) if (isFloor(x, y)) cells.push([x, y]); boom(cells, '#ffffff'); say('回転斬り！'); if (!ms.length) say('でも まわりに 敵は いなかった。'); for (const m of ms) attack(m); return true; } },
  { id: 'thunder', name: 'サンダー', mp: 7, kind: 'まほう', el: 'thunder', desc: '見えている敵 ぜんぶに 雷（雷）', run: () => { const ms = G.mons.filter(m => visible(m.x, m.y)); shake(6); say('サンダー！'); boom(ms.map(m => [m.x, m.y]), ELEM.thunder.color); if (!ms.length) say('でも 敵は いなかった。'); for (const m of ms) elemHit(m, 7 + P.lv * 2, 'thunder'); return true; } },
  { id: 'triple', name: '3回斬り', mp: 6, kind: 'とくぎ', desc: '目の前の敵を 3回 こうげき', run: () => multiHit(3) },
  // ---- 職業の わざ（どの 職業で おぼえるかは js/data/jobs.js） ----
  { id: 'steal', name: 'ぬすむ', mp: 3, kind: 'とくぎ', desc: '目の前の敵から お金か 道具を ぬすむ（1ぴき 1回）', run: () => { const m = frontMon(); if (!m) return false;
    if (m.stolen) { say(`${m.name}は もう なにも もっていない。`); return true; } m.stolen = true;
    if (m.loot) { if (m.loot.gold) { P.gold += m.loot.gold; say(`ぬすまれた ${m.loot.gold}ゴールドを とりかえした！`); } else if (m.loot.o) { giveItem(m.loot.o, 'とりかえした'); } m.loot = null; return true; }
    if (rnd() < .4) { say(`ぬすむ！ ……${m.name}は なにも もっていなかった。`); return true; }
    if (rnd() < .5) { const a = 10 + G.f * 6; P.gold += a; say(`ぬすむ！ ${m.name}から ${a}ゴールド ぬすんだ。`); }
    else giveItem(newItem(pick(['herb', 'bread', 'arrow', 'g_fire', 'g_sleep']), 'floor'), `${m.name}から ぬすんだ`); return true; } },
  { id: 'trapsee', name: 'わなさがし', mp: 2, kind: 'とくぎ', desc: 'この階の わなと 階段の 場所が わかる', run: () => { for (const t of G.traps) t.found = true; G.seen[G.stairs.y][G.stairs.x] = true;
    say(`わなさがし！ この階の わなを ${G.traps.length}こ 見つけた。階段の 場所も わかった。`); return true; } },
  { id: 'smoke', name: 'けむりだま', mp: 4, kind: 'とくぎ', desc: 'けむりに まぎれて この階の どこかへ にげる', run: () => { const p = randomFloorSpot(); if (!p) return false;
    boom([[P.x, P.y]], '#c0c0c0'); P.x = p.x; P.y = p.y; reveal(); say('けむりだま！ どこかへ にげた。'); return true; } },
  { id: 'forge', name: 'きたえる', mp: 6, kind: 'とくぎ', desc: 'そうびしている 武器を ＋1 する', run: () => tuneEq('atk') },
  { id: 'harden', name: 'かたくする', mp: 6, kind: 'とくぎ', desc: 'そうびしている たてを ＋1 する', run: () => tuneEq('def') },
  { id: 'appraise', name: 'みやぶる', mp: 3, kind: 'とくぎ', desc: 'もちものの 正体の わからない物を 1つ みやぶる', run: () => { const o = P.inv.find(x => !isKnown(x.k));
    if (!o) { say('正体の わからない物は もっていない。'); return false; } const was = itemName(o); P.known.add(o.k); if (o.cursed) o.curseKnown = true; say(`みやぶる！ ${was}は「${itemName(o)}」だった。`); return true; } },
  { id: 'mblade', name: 'まほうけん', mp: 6, kind: 'まほう', el: 'fire', desc: '目の前の敵を 炎の 剣で 切る（こうげき＋炎）', run: () => { const m = frontMon(); if (!m) return false;
    say('まほうけん！'); fx([[m.x, m.y]], ELEM.fire.color); attack(m, 1.3); if (G.mons.includes(m)) elemHit(m, 6 + P.lv * 2, 'fire'); return true; } },
  { id: 'kagenui', name: 'かげぬい', mp: 7, kind: 'とくぎ', desc: '見えている敵 ぜんぶを 4ターン うごけなくする', run: () => { const ms = G.mons.filter(m => visible(m.x, m.y)); boom(ms.map(m => [m.x, m.y]), '#6a4ad8');
    say('かげぬい！'); if (!ms.length) say('でも 敵は いなかった。'); for (const m of ms) m.stuck = Math.max(m.stuck, 4); if (ms.length) say(`${ms.length}ひきの 敵の かげを ぬいとめた。`); return true; } },
  { id: 'meteor', name: 'メテオ', mp: 12, kind: 'まほう', el: 'fire', desc: '見えている敵 ぜんぶに 大きな 炎の 石（炎）', run: () => { const ms = G.mons.filter(m => visible(m.x, m.y)); shake(10);
    say('メテオ！'); boom(ms.map(m => [m.x, m.y]), '#ff8a3a'); if (!ms.length) say('でも 敵は いなかった。'); for (const m of ms) elemHit(m, 14 + P.lv * 3, 'fire'); return true; } },
  { id: 'hissatsu', name: 'ひっさつ', mp: 7, kind: 'とくぎ', desc: '目の前の敵に 3倍の 一撃', run: () => { const m = frontMon(); if (!m) return false; shake(6); say('ひっさつの 一撃！'); const d = attack(m, 3); say(`${d}の ダメージ！`); return true; } },
  // ---- 上位職の とっておき（つづき） ----
  { id: 'bladedance', name: 'つるぎのまい', mp: 6, kind: 'とくぎ', desc: 'まわり8マスの敵 ぜんぶを 2回ずつ こうげき', run: () => { const ms = G.mons.filter(m => Math.max(Math.abs(m.x - P.x), Math.abs(m.y - P.y)) === 1);
    const cells = []; for (let y = P.y - 1; y <= P.y + 1; y++) for (let x = P.x - 1; x <= P.x + 1; x++) if (isFloor(x, y)) cells.push([x, y]); boom(cells, '#ffd0f0'); say('つるぎのまい！');
    if (!ms.length) say('でも まわりに 敵は いなかった。'); for (const m of ms) { attack(m); if (G.mons.includes(m)) attack(m); } return true; } },
  { id: 'snipe', name: 'ねらいうち', mp: 5, kind: 'とくぎ', desc: '向いている方向 8マス先までの 敵に 2.5倍の 一撃（かならず 当たる）', run: () => { const r = ray(8); fx(r.path, '#ffe14d');
    if (!r.m) { say('ねらいうち！ ……でも 敵が いなかった。'); return true; } say('ねらいうち！'); attackAnim(r.m); attack(r.m, 2.5); return true; } },
  { id: 'bomb', name: 'からくりばくだん', mp: 6, kind: 'とくぎ', desc: '前に ばくだんを 投げる。当たった まわり 3×3 に 大ダメージ', run: () => { const r = ray(6); const cx = r.m ? r.m.x : r.x, cy = r.m ? r.m.y : r.y;
    const cells = []; for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) if (isFloor(x, y)) cells.push([x, y]); fx(r.path, '#c0c0c0'); boom(cells, '#ff9a3a'); shake(8); say('からくりばくだん！ ドカーン！');
    const ms = G.mons.filter(m => Math.abs(m.x - cx) <= 1 && Math.abs(m.y - cy) <= 1); if (!ms.length) say('でも 敵は まきこまれなかった。'); for (const m of ms) hitMon(m, 12 + P.lv * 2, `${m.name}に ${12 + P.lv * 2}の ダメージ！`); return true; } },
  { id: 'mayowase', name: 'まどわし', mp: 5, kind: 'まほう', desc: '見えている敵を ねむらせる（あたると おきる）', run: () => { const ms = G.mons.filter(m => visible(m.x, m.y) && !m.boss); boom(ms.map(m => [m.x, m.y]), '#c08aff');
    say('まどわし！'); if (!ms.length) say('でも 敵は いなかった。'); for (const m of ms) m.sleep = true; if (ms.length) say(`${ms.length}ひきの 敵が まぼろしを 見て ねむってしまった。`); return true; } },
  { id: 'anaake', name: 'あなあけ', mp: 10, kind: 'とくぎ', desc: 'そうびの 特性の わくを 1つ ふやす（1つの 階で 1回だけ）', run: () => {
    if (P.anaakeF === G.f) { say('この階では もう あなあけを した。（つぎの 階で また できる）'); return false; }
    const o = slotTarget(); if (!o) { say('わくを ふやせる そうびが ない。（わくは 最大 6つ）'); return false; }
    P.anaakeF = G.f; boom([[P.x, P.y]], '#ffd23f'); say(addTraitSlot(o, 'カン！カン！ あなあけ')); return true; } },
  { id: 'goldtouch', name: 'おうごんのて', mp: 6, kind: 'まほう', desc: '目の前の敵に ダメージ。あたえた ダメージぶんの お金が 手に入る', run: () => { const m = frontMon(); if (!m) return false;
    say('おうごんのて！'); boom([[m.x, m.y]], '#ffd23f'); const d = elemHit(m, 10 + P.lv * 2, null); P.gold += d * 3; say(`${d * 3}ゴールド 手に入れた。`); return true; } },
  { id: 'zeninage', name: 'ぜになげ', mp: 3, kind: 'とくぎ', desc: 'お金を 投げつける（地下の 階 × 10G つかう）。大ダメージ', run: () => { const cost = 10 * G.f; if (P.gold < cost) { say(`お金が たりない。（ぜになげは ${cost}G）`); return false; }
    const r = ray(8); fx(r.path, '#ffd23f'); P.gold -= cost; say(`ぜになげ！ ${cost}ゴールドを 投げた。`); if (!r.m) { say('……でも どこにも 当たらなかった。お金は どこかへ ころがっていった。'); return true; }
    const d = 15 + P.lv * 3 + G.f; hitMon(r.m, d, `${r.m.name}に ${d}の ダメージ！`); return true; } },
];
// 目の前の 敵（いなければ メッセージを 出して null）
function frontMon() { const [dx, dy] = P.dir; const m = monAt(P.x + dx, P.y + dy); if (!m) say('目の前に 敵が いない。（向きを 変えてから 使おう）'); return m; }
// ぬすんだ物を もたせる（いっぱいなら 足もとに おく）
function giveItem(o, verb) { if (!invFull()) { P.inv.push(o); say(`${verb}：${itemName(o)}を 手に入れた！`); }
  else { const p = freeNear(P.x, P.y); if (p) G.items.push({ ...p, k: o.k, o }); say(`${verb}：${itemName(o)}。もちものが いっぱいなので 足もとに おいた。`); } }
// この階の 空いている 床を 1つ えらぶ（いまの 場所から はなれた ところ）
function randomFloorSpot() { const c = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (G.map[y][x] === 1 && !monAt(x, y) && !blockedAt(x, y) && Math.abs(x - P.x) + Math.abs(y - P.y) > 6) c.push({ x, y }); return c.length ? pick(c) : null; }
// かじやの わざ：そうびを ＋1
function tuneEq(slot) { const o = eqItem(slot); if (!o) { say(slot === 'atk' ? '武器を そうびしていない。' : 'たてを そうびしていない。'); return false; }
  const was = itemName(o); o.plus = (o.plus || 0) + 1; if (o.cursed && rnd() < .5) { o.cursed = false; say('のろいも いっしょに たたき出した！'); }
  boom([[P.x, P.y]], '#ffd23f'); say(`カン！カン！ ${was}を きたえて ${itemName(o)}に なった。`); return true; }
function multiHit(n) { const [dx, dy] = P.dir; const m = monAt(P.x + dx, P.y + dy); if (!m) { say('目の前に 敵が いない。（向きを 変えてから 使おう）'); return false; }
  say(`${n}回斬り！`); const ds = []; for (let i = 0; i < n && G.mons.includes(m); i++) ds.push(attack(m));
  say(`${n}回斬りの けっか：${ds.map((d, i) => `${i + 1}回目 ${d}`).join(' ＋ ')} ＝ 合計 ${ds.reduce((a, b) => a + b, 0)} ダメージ`); return true; }
function useSkill(id) { if (G.over) return; const s = mySkills().find(x => x.id === id); if (!s) return;
  if (P.lv < s.lv) { say(`「${s.name}」は レベル${s.lv}で おぼえる。`); render(); return; }
  const cost = skillCost(s); if (P.mp < cost) { say(`MPが たりない。（${s.name}は MP${cost}）`); render(); return; }
  if (P.skip > 0) { act(0, 0); return; }
  const ok = s.kind === 'まほう' ? withMagic(s.run) : s.run(); if (ok === false) { render(); return; } sfx(skillSound(s)); P.mp -= cost; endTurn(); }
// まほうのぼうしを そうびしていると MPが 1 へる
const skillCost = s => Math.max(1, s.mp - (eqPerk('mpcut') ? 1 : 0));
