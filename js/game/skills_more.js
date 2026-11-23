// わざを ふやす（v1.57）：職業の 新しい わざ と、2つの わざを おぼえると 生まれる「合わせ技」
// 合わせ技は combo: [わざA, わざB]。両方を 使える ように なると「発明」して 使える（ほかの 職業から ひきついだ わざでも よい）
'use strict';

// まわり 8マスの 床と 敵
const around = () => { const cells = []; for (let y = P.y - 1; y <= P.y + 1; y++) for (let x = P.x - 1; x <= P.x + 1; x++) if (isFloor(x, y)) cells.push([x, y]);
  return { cells, ms: G.mons.filter(m => Math.max(Math.abs(m.x - P.x), Math.abs(m.y - P.y)) === 1) }; };
const seenMons = (boss = true) => G.mons.filter(m => visible(m.x, m.y) && (boss || !m.boss));
const alive = m => G.mons.includes(m);
// 向いている 方向の 床（敵を つらぬいて、かべまで）
function pierce(len) { const [dx, dy] = P.dir, path = []; let x = P.x, y = P.y; for (let i = 0; i < len; i++) { x += dx; y += dy; if (!isFloor(x, y) || blockedAt(x, y)) break; path.push([x, y]); } return path; }

const SKILLS_MORE = [
  // ----- きほんの 職業 -----
  { id: 'teppeki', name: 'てっぺき', mp: 6, kind: 'とくぎ', desc: '3ターンの あいだ、うける ダメージが 半分', run: () => { P.teppeki = 3; boom([[P.x, P.y]], '#9ad0ff'); say('てっぺき！ 3ターン かたく まもる。'); return true; } },
  { id: 'dokubari', name: 'どくばり', mp: 4, kind: 'とくぎ', desc: '目の前の敵に 毒。5ターン ダメージが つづく', run: () => { const m = frontMon(); if (!m) return false;
    attack(m, .6); if (alive(m)) { m.poison = 5; m.poisonD = 3 + Math.floor(P.lv / 2); say(`${m.name}は 毒に おかされた！`); } return true; } },
  { id: 'kabutowari', name: 'かぶとわり', mp: 7, kind: 'とくぎ', desc: '目の前の敵の まもりを 0に して こうげき', run: () => { const m = frontMon(); if (!m) return false;
    shake(4); say('かぶとわり！'); m.def = 0; boom([[m.x, m.y]], '#ffd23f'); attack(m, 1.2); if (alive(m)) say(`${m.name}の まもりが くだけた！`); return true; } },
  { id: 'sleep', name: 'スリープ', mp: 3, kind: 'まほう', desc: '前の 敵 1体を 6ターン ねむらせる', run: () => { const r = ray(6); fx(r.path, '#c08aff'); say('スリープ！');
    if (!r.m || r.m.boss) { say(r.m ? `${r.m.name}には きかなかった。` : 'でも 敵は いなかった。'); return true; } r.m.stuck = Math.max(r.m.stuck || 0, 6); say(`${r.m.name}は ねむってしまった。`); return true; } },
  { id: 'drain', name: 'ドレイン', mp: 6, kind: 'まほう', desc: '前の 敵に ダメージ。あたえた ぶんの 半分 HPが もどる', run: () => { const r = ray(6); fx(r.path, '#7cf0a0'); say('ドレイン！');
    if (!r.m) { say('でも 敵は いなかった。'); return true; } const d = elemHit(r.m, 10 + P.lv * 2, null), h = Math.ceil(d / 2), b = P.hp; P.hp = Math.min(P.mhp, P.hp + h); say(`HPが ${P.hp - b} もどった。`); return true; } },
  { id: 'kusuri', name: 'くすりづくり', mp: 6, kind: 'とくぎ', desc: 'やくそうを 1つ つくる', run: () => { if (invFull()) { say('もちものが いっぱいで つくれない。'); return false; }
    P.inv.push({ k: 'herb', plus: 0, traits: [] }); P.known.add('herb'); boom([[P.x, P.y]], '#7cf0a0'); say('くすりづくり！ やくそうを 1つ つくった。'); return true; } },
  // ----- 上位の 職業 -----
  { id: 'hyouken', name: 'こおりのけん', mp: 6, kind: 'まほう', el: 'ice', desc: '目の前の敵を 氷の 剣で 切る。3ターン こおらせる（氷）', run: () => { const m = frontMon(); if (!m) return false;
    say('こおりのけん！'); fx([[m.x, m.y]], ELEM.ice.color); attack(m, 1.3); if (alive(m)) { elemHit(m, 6 + P.lv * 2, 'ice'); if (alive(m)) m.stuck = Math.max(m.stuck || 0, 3); } return true; } },
  { id: 'shuriken', name: 'しゅりけん', mp: 3, kind: 'とくぎ', desc: '前に しゅりけんを 2まい なげる', run: () => { say('しゅりけん！');
    for (let i = 0; i < 2; i++) { const r = ray(8); fx(r.path, '#d0d0e0'); if (r.m) hitMon(r.m, 5 + P.lv, `${r.m.name}に ${5 + P.lv}の ダメージ！`); else { say('しゅりけんは かべに ささった。'); break; } } return true; } },
  { id: 'daikaifuku', name: 'だいかいふく', mp: 9, kind: 'まほう', desc: 'HPが ぜんぶ もどる', run: () => { const b = P.hp; P.hp = P.mhp; boom(around().cells, '#7cf0a0'); say(`だいかいふく！ HPが ${P.hp - b} もどった。`); return true; } },
  { id: 'kiai', name: 'きあいため', mp: 4, kind: 'とくぎ', desc: 'つぎの こうげきが 2.5倍', run: () => { P.charge = 1; boom([[P.x, P.y]], '#ffb040'); say('きあいため！ 力が みなぎる。'); return true; } },
  { id: 'mikiri', name: 'みきり', mp: 7, kind: 'とくぎ', desc: '2ターンの あいだ、敵の こうげきを ぜんぶ よける', run: () => { P.mikiri = 2; boom([[P.x, P.y]], '#ffd0f0'); say('みきり！ 敵の うごきが よく 見える。'); return true; } },
  { id: 'yaame', name: 'やのあめ', mp: 8, kind: 'とくぎ', desc: '見えている敵 ぜんぶに 矢を ふらせる', run: () => { const ms = seenMons(); boom(ms.map(m => [m.x, m.y]), '#e0c080'); say('やのあめ！');
    if (!ms.length) say('でも 敵は いなかった。'); for (const m of ms) if (alive(m)) hitMon(m, 8 + P.lv * 2, `${m.name}に ${8 + P.lv * 2}の ダメージ！`); return true; } },
  { id: 'fukitobashi', name: 'ばねパンチ', mp: 5, kind: 'とくぎ', desc: '目の前の敵を 3マス ふきとばす。かべに ぶつかると 大ダメージ', run: () => { const m = frontMon(); if (!m) return false; const [dx, dy] = P.dir;
    say('ばねパンチ！'); attack(m, .8); if (!alive(m)) return true; let n = 0; while (n < 3) { const nx = m.x + dx, ny = m.y + dy; if (!isFloor(nx, ny) || monAt(nx, ny) || blockedAt(nx, ny)) break; m.x = nx; m.y = ny; n++; }
    if (n < 3) { shake(5); hitMon(m, 8 + P.lv * 2, `${m.name}は かべに ぶつかった！ ${8 + P.lv * 2}の ダメージ！`); } else say(`${m.name}を ふきとばした！`); return true; } },
  { id: 'konran', name: 'こんらん', mp: 6, kind: 'まほう', desc: '見えている敵を 4ターン こんらん させる（でたらめに うごく）', run: () => { const ms = seenMons(false); boom(ms.map(m => [m.x, m.y]), '#ff9aff'); say('こんらん！');
    if (!ms.length) say('でも 敵は いなかった。'); for (const m of ms) m.confuse = 4; if (ms.length) say(`${ms.length}ひきの 敵が ふらふらしている。`); return true; } },
  { id: 'kinka', name: 'きんか', mp: 8, kind: 'まほう', desc: 'HPが 3分の1 いかの 敵を 金に かえる（ボスには きかない）', run: () => { const m = frontMon(); if (!m) return false;
    if (m.boss || m.mid || m.hp > m.mhp / 3) { say(`きんか！ ……${m.name}は まだ 元気すぎて きかなかった。`); return true; }
    const g = 30 * G.f + m.mhp; boom([[m.x, m.y]], '#ffd23f'); say(`きんか！ ${m.name}は 金の かたまりに なった！`); killMon(m); P.gold += g; say(`${g}ゴールド 手に入れた。`); return true; } },
  { id: 'kanetate', name: 'かねのたて', mp: 4, kind: 'とくぎ', desc: 'お金を つかって（地下の 階 × 20G）5ターン うける ダメージが 半分', run: () => { const c = 20 * G.f; if (P.gold < c) { say(`お金が たりない。（かねのたては ${c}G）`); return false; }
    P.gold -= c; P.teppeki = 5; boom([[P.x, P.y]], '#ffd23f'); say(`かねのたて！ ${c}ゴールドの かべで 5ターン まもる。`); return true; } },
  // ----- 最上位の 職業 -----
  { id: 'inazumagiri', name: 'いなずまぎり', mp: 10, kind: 'とくぎ', el: 'thunder', desc: '前の 敵 ぜんぶを 雷の 剣で つらぬく（雷）', run: () => { const path = pierce(6); fx(path, ELEM.thunder.color); shake(6); say('いなずまぎり！');
    const ms = G.mons.filter(m => path.some(([x, y]) => m.x === x && m.y === y)); if (!ms.length) say('でも 敵は いなかった。'); for (const m of ms) { attack(m, 1.5); if (alive(m)) elemHit(m, 8 + P.lv * 2, 'thunder'); } return true; } },
  { id: 'tokitome', name: 'ときとめ', mp: 14, kind: 'まほう', desc: '見えている敵 ぜんぶの 時を 4ターン とめる', run: () => { const ms = seenMons(); boom(ms.map(m => [m.x, m.y]), '#ffffff'); shake(6); say('ときとめ！ 時が とまった。');
    for (const m of ms) m.stuck = Math.max(m.stuck || 0, m.boss ? 2 : 4); return true; } },
  { id: 'yamiuchi', name: 'やみうち', mp: 6, kind: 'とくぎ', desc: '目の前の敵に こうげき。ねている・うごけない 敵には 5倍', run: () => { const m = frontMon(); if (!m) return false;
    const s = m.sleep || m.stuck > 0; say(s ? 'やみうち！ すきを ついた！' : 'やみうち！'); if (s) shake(6); attack(m, s ? 5 : 1.5); return true; } },

  // ===== 合わせ技（2つの わざを おぼえると 発明する） =====
  { id: 'steam', name: 'スチームボム', mp: 9, kind: 'まほう', combo: ['fire', 'ice'], el: 'fire', desc: '前に 炎と 氷を まぜて なげる。当たった まわり 3×3 が じょうき ばくはつ', run: () => { const r = ray(6); const cx = r.m ? r.m.x : r.x, cy = r.m ? r.m.y : r.y;
    const cells = []; for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) if (isFloor(x, y)) cells.push([x, y]); fx(r.path, '#e0f0ff'); boom(cells, '#ffffff'); shake(8); say('スチームボム！ ジュワーッ！');
    const ms = G.mons.filter(m => Math.abs(m.x - cx) <= 1 && Math.abs(m.y - cy) <= 1); if (!ms.length) say('でも 敵は まきこまれなかった。'); for (const m of ms) { elemHit(m, 10 + P.lv * 2, 'fire'); if (alive(m)) elemHit(m, 10 + P.lv * 2, 'ice'); } return true; } },
  { id: 'tatsumaki', name: 'たつまきぎり', mp: 12, kind: 'とくぎ', combo: ['spin', 'triple'], desc: 'まわり8マスの敵 ぜんぶを 3回ずつ こうげき', run: () => { const { cells, ms } = around(); boom(cells, '#c0f0ff'); shake(6); say('たつまきぎり！');
    if (!ms.length) say('でも まわりに 敵は いなかった。'); for (const m of ms) for (let i = 0; i < 3 && alive(m); i++) attack(m); return true; } },
  { id: 'megumi', name: 'めぐみのあめ', mp: 11, kind: 'まほう', combo: ['heal', 'thunder'], el: 'thunder', desc: 'HPを 回復して、見えている敵 ぜんぶに 雷', run: () => { const b = P.hp; P.hp = Math.min(P.mhp, P.hp + 15 + P.lv * 3); const ms = seenMons();
    boom([[P.x, P.y], ...ms.map(m => [m.x, m.y])], '#a0e0ff'); say(`めぐみのあめ！ HPが ${P.hp - b} もどった。`); for (const m of ms) if (alive(m)) elemHit(m, 6 + P.lv * 2, 'thunder'); return true; } },
  { id: 'kaitou', name: 'かいとうの わざ', mp: 6, kind: 'とくぎ', combo: ['steal', 'smoke'], desc: '目の前の敵から かならず ぬすんで、けむりで にげる', run: () => { const m = frontMon(); if (!m) return false; const p = randomFloorSpot();
    const a = 20 + G.f * 10; P.gold += a; say(`かいとうの わざ！ ${m.name}から ${a}ゴールド いただいた。`); if (!m.stolen && rnd() < .6) giveItem(newItem(pick(['herb', 'bread', 'g_fire', 'g_sleep', 's_ident']), 'floor'), 'ついでに'); m.stolen = true;
    if (p) { boom([[P.x, P.y]], '#c0c0c0'); P.x = p.x; P.y = p.y; reveal(); say('けむりと ともに すがたを けした。'); } return true; } },
  { id: 'kitaeage', name: 'きたえあげ', mp: 10, kind: 'とくぎ', combo: ['forge', 'harden'], desc: 'そうびしている 武器と たてを どちらも ＋1', run: () => { const a = eqItem('atk'), d = eqItem('def'); if (!a && !d) { say('武器も たても そうびしていない。'); return false; }
    for (const o of [a, d]) if (o) o.plus = (o.plus || 0) + 1; boom([[P.x, P.y]], '#ffd23f'); say(`カン！カン！カン！ きたえあげ！ ${[a, d].filter(Boolean).map(itemName).join('と')}に なった。`); return true; } },
  { id: 'senrigan', name: 'せんりがん', mp: 8, kind: 'とくぎ', combo: ['trapsee', 'appraise'], desc: 'この階の 地図・わな・道具の 場所と、もちものの 正体が ぜんぶ わかる', run: () => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (G.map[y][x] > 0) G.seen[y][x] = true; for (const t of G.traps) t.found = true; let n = 0; for (const o of P.inv) if (!isKnown(o.k)) { P.known.add(o.k); n++; }
    say(`せんりがん！ この階の すべてが 見えた。${n ? `もちもの ${n}こ の 正体も わかった。` : ''}`); return true; } },
  { id: 'hiya', name: 'ひや', mp: 8, kind: 'とくぎ', combo: ['snipe', 'fire'], el: 'fire', desc: '8マス先までの 敵に 炎の 矢。3倍の 一撃（かならず 当たる・炎）', run: () => { const r = ray(8); fx(r.path, ELEM.fire.color);
    if (!r.m) { say('ひや！ ……でも 敵が いなかった。'); return true; } say('ひや！'); attack(r.m, 3); if (alive(r.m)) elemHit(r.m, 6 + P.lv, 'fire'); return true; } },
  { id: 'ougon', name: 'おうごんのあめ', mp: 8, kind: 'まほう', combo: ['zeninage', 'goldtouch'], desc: 'お金を つかって（地下の 階 × 30G）見えている敵 ぜんぶに 大ダメージ', run: () => { const c = 30 * G.f; if (P.gold < c) { say(`お金が たりない。（おうごんのあめは ${c}G）`); return false; }
    const ms = seenMons(); P.gold -= c; boom(ms.map(m => [m.x, m.y]), '#ffd23f'); shake(8); say(`おうごんのあめ！ ${c}ゴールドが ふりそそぐ！`); if (!ms.length) say('……でも 敵は いなかった。');
    for (const m of ms) if (alive(m)) hitMon(m, 18 + P.lv * 3 + G.f, `${m.name}に ${18 + P.lv * 3 + G.f}の ダメージ！`); return true; } },
  { id: 'kagegiri', name: 'かげぎり', mp: 10, kind: 'とくぎ', combo: ['kagenui', 'hissatsu'], desc: '目の前の敵の かげを ぬいとめて、3倍の 一撃', run: () => { const m = frontMon(); if (!m) return false;
    m.stuck = Math.max(m.stuck || 0, 3); boom([[m.x, m.y]], '#6a4ad8'); shake(6); say('かげぎり！'); attack(m, 3); return true; } },
  { id: 'hyouketsu', name: 'ひょうけつ', mp: 12, kind: 'まほう', combo: ['ice', 'kagenui'], el: 'ice', desc: '見えている敵 ぜんぶを 5ターン こおらせる（氷）', run: () => { const ms = seenMons(); boom(ms.map(m => [m.x, m.y]), ELEM.ice.color); say('ひょうけつ！');
    if (!ms.length) say('でも 敵は いなかった。'); for (const m of ms) { elemHit(m, 6 + P.lv, 'ice'); if (alive(m)) m.stuck = Math.max(m.stuck || 0, m.boss ? 2 : 5); } return true; } },
  { id: 'fudou', name: 'ふどうの かまえ', mp: 9, kind: 'とくぎ', combo: ['teppeki', 'kiai'], desc: '3ターン うける ダメージが 半分。つぎの こうげきは 2.5倍', run: () => { P.teppeki = 3; P.charge = 1; boom([[P.x, P.y]], '#ffb040'); say('ふどうの かまえ！ まもりも こうげきも ばっちりだ。'); return true; } },
  { id: 'dokugiri', name: 'どくぎり', mp: 8, kind: 'とくぎ', combo: ['dokubari', 'smoke'], desc: 'まわり8マスの敵 ぜんぶに 毒を ふりまく', run: () => { const { cells, ms } = around(); boom(cells, '#a0e060'); say('どくぎり！');
    if (!ms.length) say('でも まわりに 敵は いなかった。'); for (const m of ms) { m.poison = 6; m.poisonD = 3 + Math.floor(P.lv / 2); } if (ms.length) say(`${ms.length}ひきの 敵が 毒に おかされた。`); return true; } },
  { id: 'seiken', name: 'せいなる いのり', mp: 14, kind: 'まほう', combo: ['daikaifuku', 'meteor'], desc: 'HPが ぜんぶ もどり、見えている敵 ぜんぶに 光の 石', run: () => { P.hp = P.mhp; const ms = seenMons(); boom([[P.x, P.y], ...ms.map(m => [m.x, m.y])], '#fff4a0'); shake(8);
    say('せいなる いのり！ HPが ぜんぶ もどった。'); for (const m of ms) if (alive(m)) hitMon(m, 14 + P.lv * 3, `${m.name}に ${14 + P.lv * 3}の ダメージ！`); return true; } },
];
SKILLS.push(...SKILLS_MORE);
const COMBO_SKILLS = SKILLS.filter(s => s.combo);
// どの 職業で おぼえるか（レベルは キャラの レベル）
const SKILL_JOBS = { senshi: { teppeki: 9 }, thief: { dokubari: 8 }, smith: { kabutowari: 9 }, mage: { sleep: 2, drain: 8 }, tool: { kusuri: 7 },
  mken: { hyouken: 8 }, ninja: { shuriken: 4 }, kenja: { daikaifuku: 5 }, bmaster: { kiai: 4 }, dancer: { mikiri: 8 }, hunter: { yaame: 8 },
  karakuri: { fukitobashi: 8 }, genjutsu: { konran: 7 }, renkin: { kinka: 8 }, akindo: { kanetate: 8 }, yuusha: { inazumagiri: 10 }, daikenja: { tokitome: 11 }, kagenoou: { yamiuchi: 10 } };
for (const [j, t] of Object.entries(SKILL_JOBS)) Object.assign(JOBS[j].skills, t);
// 合わせ技を はじめて 使えるように なったら「発明」の おしらせ（noteTurn の あとで しらべる）
let _comboKnown = null;
function checkInvent() { if (previewRun || typeof attract !== 'undefined' && attract) return; const p = loadProg(); _comboKnown = _comboKnown || new Set(Object.keys(p.invented || {}));
  for (const s of mySkills()) if (s.combo && P.lv >= s.lv && !_comboKnown.has(s.id)) { _comboKnown.add(s.id); progMark('invented', s.id); progMark('learned', s.id);
    const [a, b] = s.combo.map(k => SKILLS.find(x => x.id === k).name); showBanner('合わせ技を 発明！', `${a} ＋ ${b} ＝ ${s.name}`); say(`ひらめいた！「${a}」と「${b}」を あわせて、合わせ技「${s.name}」を 発明した！`); sfx('lvup'); } }
