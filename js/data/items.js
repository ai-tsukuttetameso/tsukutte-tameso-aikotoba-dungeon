// アイテム・わかっていない時の仮の名前・装備の特性・わな
'use strict';

const ITEMS = {
  bread: { name: 'だけ弁当', desc: '白ごはんだけ。おなか＋40', spr: 'bread', use: p => { p.food = Math.min(100, p.food + 40); return 'だけ弁当を食べた。白ごはんだけだけど、おなかは ふくれた。'; } },
  // お弁当（いろいろ）。food＝食べ物（食べる 音が 鳴る）
  onigiri: { name: 'おにぎり', desc: 'おなか＋25', spr: 'onigiri', food: true, use: p => eat(p, 25, 0, 0, 'おにぎりを ほおばった。のりが パリッと おいしい。') },
  nori_ben: { name: 'のり弁当', desc: 'おなか＋50', spr: 'bento_nori', food: true, use: p => eat(p, 50, 0, 0, 'のり弁当を 食べた。ちくわ天が うれしい。') },
  karaage_ben: { name: 'からあげ弁当', desc: 'おなか＋60・HP＋15', spr: 'bento_karaage', food: true, use: p => eat(p, 60, 15, 0, 'からあげ弁当を 食べた。元気が 出る！') },
  shake_ben: { name: 'さけ弁当', desc: 'おなか＋50・MP＋8', spr: 'bento_shake', food: true, use: p => eat(p, 50, 0, 8, 'さけ弁当を 食べた。頭が すっきりして MPも もどった。') },
  curry_ben: { name: 'カレー弁当', desc: 'おなか＋60・この階の あいだ こうげき＋2', spr: 'bento_curry', food: true, use: p => { p.buffAtk = 2; return eat(p, 60, 0, 0, 'カレー弁当を 食べた。からい！ 体が あつくなって、この階の あいだ こうげき＋2！'); } },
  maku_ben: { name: 'まくのうち弁当', desc: 'おなか＋80・HP＋20・MP＋5', spr: 'bento_maku', food: true, use: p => eat(p, 80, 20, 5, 'まくのうち弁当を 食べた。おかずが いっぱいで しあわせ。') },
  toku_ben: { name: 'とくせい弁当', desc: 'おなか ぜんぶ・HPと MP ぜんぶ回復・最大HP＋3（レア）', spr: 'bento_toku', food: true, rare: true, use: p => { p.mhp += 3; return eat(p, 100, 999, 999, 'とくせい弁当を 食べた！ ぜんぶ 回復して、最大HPも 3 ふえた！'); } },
  herb: { name: 'やくそう', desc: 'HP＋25', spr: 'herb', use: p => { const b = p.hp; p.hp = Math.min(p.mhp, p.hp + 25); return `やくそうを使った。HPが ${p.hp - b} 回復した。`; } },
  sticker: { name: 'ぷっくりシール', desc: '見えている敵ぜんぶを5ターン動けなくする', spr: 'sticker', use: () => { let n = 0; for (const m of G.mons) if (visible(m.x, m.y)) { m.stuck = 5; n++; } return n ? `ぷっくりシールを はりまくった！ 敵${n}体が はがすのに夢中だ。` : 'シールを はったが、だれもいなかった。もったいない。'; } },
  charm: { name: '目印チャーム', desc: 'この階の地図と階段が ぜんぶ わかる', spr: 'charm', use: () => { G.known = true; return '目印チャームを かざした！ この階の地図と 階段の場所が わかった。'; } },
  arrow: { name: '木の矢', desc: '向いている方向に打つ（まとめて持てる）', spr: 'arrow', stack: true, use: (p, o) => {
    const r = ray(10); fx(r.path, '#ffe14d'); sfx('zap');
    if (!r.m) return '矢を打ったが、どこにも 当たらなかった。';
    const d = Math.round((4 + G.f + Math.floor(P.lv / 2)) * (jobHas('hunter') ? 2 : 1)); say('矢を打った！'); hitMon(r.m, d, `${r.m.name}に 矢が ささった！ ${d}の ダメージ。`); } },
  bag: { name: 'しまう袋', desc: '中に 道具を しまえる。使うと 出し入れ', spr: 'bag', bag: true },
  omamori: { name: 'いのちのお守り', desc: '力つきたとき、1回だけ 復活できる（持っているだけで効く）', spr: 'omamori', rare: true, use: () => { return '大切に もっておこう。力つきたとき、1回だけ 守ってくれる。'; } },
  // レアもの（深い階や「おたからダンジョン」で 出やすい。はじめから 正体が わかる）
  hikari_ken: { name: 'ひかりの剣', desc: 'こうげき＋8（レア）', spr: 'sword_r', equip: 'atk', val: 8, rare: true },
  hoshi_tate: { name: 'ほしの盾', desc: 'ぼうぎょ＋6（レア）', spr: 'shield_r', equip: 'def', val: 6, rare: true },
  shiawase: { name: 'しあわせの草', desc: 'さいだいHP＋10、HPも ぜんぶ回復（レア）', spr: 'herb_r', rare: true, use: p => { p.mhp += 10; p.hp = p.mhp; return 'からだの 底から 力が わいてきた！ さいだいHPが 10 ふえた。'; } },
  mahou_bin: { name: 'まほうのびん', desc: 'さいだいMP＋5、MPも ぜんぶ回復（レア）', spr: 'bottle', rare: true, use: p => { p.mmp += 5; p.mp = p.mmp; return 'まほうの 力が みちてきた！ さいだいMPが 5 ふえた。'; } },
  // 武器の 種類（weapon）：spear＝つらぬく、staff＝遠くへ まほうの たま、whip＝2マス先まで、boomerang＝投げて もどる
  yari: { name: 'てつのやり', desc: 'こうげき＋3', note: '前の 2マスの 敵を まとめて つらぬく', spr: 'spear', equip: 'atk', val: 3, weapon: 'spear' },
  tsue: { name: 'まほうのつえ', desc: 'こうげき＋1', note: 'Fで 5マス先まで まほうの たまを とばす。そうび中は まほう・杖・おふだが 1.5倍', spr: 'staff', equip: 'atk', val: 1, weapon: 'staff' },
  muchi: { name: 'かわのむち', desc: 'こうげき＋2', note: '2マス先の 敵にも とどく。ときどき 敵が ひるむ', spr: 'whip', equip: 'atk', val: 2, weapon: 'whip' },
  boomerang: { name: 'ブーメラン', desc: 'こうげき＋2', note: 'Fで 投げると 4マス先までの 敵 ぜんぶに 当たって もどってくる', spr: 'boomerang', equip: 'atk', val: 2, weapon: 'boomerang' },
  // ---- 武器の なかま（剣・やり・つえ・むち・ブーメラン）。el＝ふつうの こうげきの 属性、magic＝つえの まほう倍率、stun＝むちで ひるむ 確率 ----
  dou_ken: { name: 'どうのつるぎ', desc: 'こうげき＋2', spr: 'sword_dou', equip: 'atk', val: 2 },
  hagane_ken: { name: 'はがねのけん', desc: 'こうげき＋5', spr: 'sword_hagane', equip: 'atk', val: 5 },
  honoo_ken: { name: 'ほのおのけん', desc: 'こうげき＋4', note: 'ふつうの こうげきが 炎', spr: 'sword_fire', equip: 'atk', val: 4, el: 'fire' },
  koori_ken: { name: 'こおりのけん', desc: 'こうげき＋4', note: 'ふつうの こうげきが 氷', spr: 'sword_ice', equip: 'atk', val: 4, el: 'ice' },
  ikazuchi_ken: { name: 'いかずちのけん', desc: 'こうげき＋4', note: 'ふつうの こうげきが 雷', spr: 'sword_thunder', equip: 'atk', val: 4, el: 'thunder' },
  hagane_yari: { name: 'はがねのやり', desc: 'こうげき＋5', note: '前の 2マスの 敵を まとめて つらぬく', spr: 'spear_hagane', equip: 'atk', val: 5, weapon: 'spear' },
  honoo_yari: { name: 'ほのおのやり', desc: 'こうげき＋4', note: '2マス つらぬく。こうげきが 炎', spr: 'spear_fire', equip: 'atk', val: 4, weapon: 'spear', el: 'fire' },
  ryuu_yari: { name: 'りゅうのやり', desc: 'こうげき＋8（レア）', note: '2マス つらぬく', spr: 'spear_ryuu', equip: 'atk', val: 8, weapon: 'spear', rare: true },
  rune_tsue: { name: 'ルーンのつえ', desc: 'こうげき＋2', note: 'Fで 5マス先まで たまを とばす。まほう・杖・おふだが 1.7倍', spr: 'staff_rune', equip: 'atk', val: 2, weapon: 'staff', magic: 1.7 },
  honoo_tsue: { name: 'ほのおのつえ', desc: 'こうげき＋2', note: 'とばす たまが 炎。まほうが 1.5倍', spr: 'staff_fire', equip: 'atk', val: 2, weapon: 'staff', magic: 1.5, el: 'fire' },
  kenja_tsue: { name: 'けんじゃのつえ', desc: 'こうげき＋3（レア）', note: 'まほう・杖・おふだが 2倍', spr: 'staff_kenja', equip: 'atk', val: 3, weapon: 'staff', magic: 2, rare: true },
  ibara_muchi: { name: 'いばらのむち', desc: 'こうげき＋4', note: '2マス先まで。10回に 4回 ひるませる', spr: 'whip_ibara', equip: 'atk', val: 4, weapon: 'whip', stun: .4 },
  kusari_muchi: { name: 'くさりのむち', desc: 'こうげき＋6', note: '2マス先まで とどく', spr: 'whip_kusari', equip: 'atk', val: 6, weapon: 'whip' },
  hagane_boom: { name: 'はがねのブーメラン', desc: 'こうげき＋4', note: '4マス先までの 敵 ぜんぶに 当たる', spr: 'boom_hagane', equip: 'atk', val: 4, weapon: 'boomerang' },
  hoshi_boom: { name: 'ほしのブーメラン', desc: 'こうげき＋6', note: '4マス先までの 敵 ぜんぶに 当たる。こうげきが 雷', spr: 'boom_hoshi', equip: 'atk', val: 6, weapon: 'boomerang', el: 'thunder' },
  // ---- 金策の 道具（お店で 高く 売れる。使っても なくならない。きんのたまごは 使うと お金に なる） ----
  ruby: { name: 'ルビー', desc: 'あかい ほうせき。お店で 300Gくらいで 売れる', spr: 'gem_ruby', keep: true, use: () => 'きらきら ひかっている。お店で 売ると いい お金に なりそう。' },
  sapphire: { name: 'サファイア', desc: 'あおい ほうせき。お店で 500Gくらいで 売れる', spr: 'gem_sapphire', keep: true, use: () => 'あおく すんだ ほうせき。お店で 高く 売れそう。' },
  emerald: { name: 'エメラルド', desc: 'みどりの ほうせき。お店で 800Gくらいで 売れる', spr: 'gem_emerald', keep: true, use: () => 'ふかい みどり色。お店で とても 高く 売れそう。' },
  diamond: { name: 'ダイヤモンド', desc: 'とうめいな ほうせき。お店で 1500Gくらいで 売れる（レア）', spr: 'gem_diamond', keep: true, rare: true, use: () => 'まぶしい！ お店で ものすごく 高く 売れそう。' },
  kinkai: { name: 'きんかい', desc: '金の かたまり。お店で 3000Gくらいで 売れる（レア）', spr: 'kinkai', keep: true, rare: true, use: () => 'ずっしり 重い 金の かたまり。お店へ もっていこう。' },
  kin_tamago: { name: 'きんのたまご', desc: '使うと われて お金が 出てくる', spr: 'kin_tamago', use: () => { const a = 150 + G.f * 40; P.gold += a; sfx('coin'); return `きんのたまごが われて ${a}ゴールド 出てきた！`; } },
  // 特性の わくを ふやす（そうびしている 物から 1つ。えらびたい ときは AIかじやの「わくを ふやす」）
  nomi: { name: 'あなあけのみ', desc: 'そうびの 特性の わくを 1つ ふやす（ふつう 3つ → 最大 6つ）。特性が うまっている そうびから えらぶ', spr: 'nomi', rare: true,
    need: () => slotTarget() ? '' : 'わくを ふやせる そうびが ない。（そうびしてから 使おう。わくは 最大 6つ）', use: () => { sfx('forge'); return addTraitSlot(slotTarget(), 'カン！ あなあけのみ'); } },
  sword: { name: 'つよいけん', desc: 'こうげき＋3', spr: 'sword', equip: 'atk', val: 3 },
  shield: { name: 'まもりのたて', desc: 'ぼうぎょ＋2', spr: 'shield', equip: 'def', val: 2 },
  // 防具：あたま（head）・うで（arm）・あし（foot）。たて（def）と べつに 1つずつ そうびできる
  kawa_boushi: { name: 'かわのぼうし', desc: 'ぼうぎょ＋1', spr: 'helm', equip: 'head', val: 1 },
  tetsu_kabuto: { name: 'てつのかぶと', desc: 'ぼうぎょ＋3', spr: 'helm2', equip: 'head', val: 3 },
  mahou_boushi: { name: 'まほうのぼうし', desc: 'ぼうぎょ＋1', note: 'わざ・まほうの MPが 1 へる', spr: 'mhat', equip: 'head', val: 1, perk: 'mpcut' },
  ryuu_kabuto: { name: 'りゅうのかぶと', desc: 'ぼうぎょ＋5（レア）', note: '敵から うける ダメージが いつも 1 へる', spr: 'helm_r', equip: 'head', val: 5, perk: 'guard', rare: true },
  kawa_kote: { name: 'かわのこて', desc: 'ぼうぎょ＋1', spr: 'glove', equip: 'arm', val: 1 },
  tetsu_kote: { name: 'てつのこて', desc: 'ぼうぎょ＋2', spr: 'glove2', equip: 'arm', val: 2, atk: 1 },
  kawa_kutsu: { name: 'かわのくつ', desc: 'ぼうぎょ＋1', spr: 'boots', equip: 'foot', val: 1 },
  hayate_kutsu: { name: 'はやてのくつ', desc: 'ぼうぎょ＋1', note: 'わなを ふんでも 2回に 1回 とびこえる', spr: 'boots2', equip: 'foot', val: 1, perk: 'light' },
  // ---- 使うまで 何か分からない草 ----
  g_life: { name: 'いのちの草', cat: 'grass', desc: '最大HP＋5して、HPが ぜんぶ回復', spr: 'grass', use: p => { p.mhp += 5; p.hp = p.mhp; return '体に 力が みなぎる！ 最大HPが 5 ふえた。'; } },
  g_power: { name: 'ちからの草', cat: 'grass', desc: 'こうげき＋1', spr: 'grass', use: p => { p.atk++; return '力が わいてきた！ こうげきが 1 あがった。'; } },
  g_sleep: { name: 'ねむり草', cat: 'grass', desc: '食べると ねむってしまう。投げると敵が ねむる', spr: 'grass', use: p => { p.skip = 5; p.skipMsg = 'ぐうぐう ねむっている……'; return 'きゅうに ねむくなった……。'; } },
  g_fire: { name: 'ひふき草', cat: 'grass', desc: '前に 火をふく', spr: 'grass', use: () => { const r = ray(4); fx(r.path, '#ff7a2a'); sfx('zap'); say('口から 火を ふいた！'); if (r.m) elemHit(r.m, 12 + G.f * 2, 'fire', `${r.m.name}は もえた！`); } },
  g_bitter: { name: 'にがい草', cat: 'grass', desc: 'おなか−15、HP＋10', spr: 'grass', use: p => { p.food = Math.max(0, p.food - 15); p.hp = Math.min(p.mhp, p.hp + 10); return 'にがい！ おなかが へったが、HPは 10 回復した。'; } },
  g_eye: { name: 'めぐすり草', cat: 'grass', desc: 'この階の わなが ぜんぶ見える', spr: 'grass', use: () => { for (const t of G.traps) t.found = true; return '目が よく見えるようになった。この階の わなが ぜんぶ わかる。'; } },
  // ---- おふだ ----
  s_dig: { name: '穴ほりのおふだ', cat: 'scroll', desc: '向いている方向の 壁を ほる', spr: 'scroll', use: () => { const [dx, dy] = P.dir; let x = P.x, y = P.y, n = 0;
    for (let i = 0; i < 8; i++) { x += dx; y += dy; if (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1) break; if (G.map[y][x] === 0) { G.map[y][x] = 2; n++; } G.seen[y][x] = true; }
    shake(4); return n ? `ゴゴゴ……！ 前の壁が ${n}マス くずれた。` : 'おふだが 光ったが、ほる壁が なかった。'; } },
  s_up: { name: '強化のおふだ', cat: 'scroll', desc: 'そうびしている けん・たてが ＋1', spr: 'scroll', use: () => { const e = P.inv.filter(o => o.eq); for (const o of e) o.plus = (o.plus || 0) + 1; return e.length ? `そうびが 光った！ ${e.map(itemName).join('と')}に なった。` : 'おふだが 光ったが、何も そうびしていなかった。'; } },
  s_thunder: { name: 'かみなりのおふだ', cat: 'scroll', desc: '見えている敵 ぜんぶに かみなり', spr: 'scroll', use: () => { shake(6); sfx('zap'); const ms = G.mons.filter(m => visible(m.x, m.y)); say('かみなりが おちた！'); if (!ms.length) return 'でも 敵は いなかった。'; const d = 10 + G.f * 2; for (const m of ms) elemHit(m, d, 'thunder'); } },
  s_purify: { name: 'おはらいのおふだ', cat: 'scroll', desc: 'もちものの のろいを とく', spr: 'scroll', use: () => { const c = P.inv.filter(o => o.cursed); for (const o of c) o.cursed = false; return c.length ? 'あたたかい光に つつまれた。のろいが とけた！' : 'あたたかい光に つつまれた。（のろわれた物は なかった）'; } },
  s_call: { name: 'よびよせのおふだ', cat: 'scroll', desc: 'まわりに 敵を よんでしまう（ハズレ）', spr: 'scroll', use: () => { let n = 0; for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]]) { if (n >= 2) break; const x = P.x + ax, y = P.y + ay; if (isFloor(x, y) && !monAt(x, y) && !shopAt(x, y)) { addMon(G, pick(monPool(G.f).filter(t => !MON[t].big)), x, y); n++; } } shake(4); sfx('bad'); return n ? `しまった！ 敵が ${n}体 あらわれた！` : 'おふだが 光ったが、何も おきなかった。'; } },
  s_blast: { name: 'ばくはつのおふだ', cat: 'scroll', desc: 'まわり2マスの敵 ぜんぶに 大ダメージ', spr: 'scroll', use: () => { const cells = []; for (let y = P.y - 2; y <= P.y + 2; y++) for (let x = P.x - 2; x <= P.x + 2; x++) if (isFloor(x, y)) cells.push([x, y]);
    boom(cells, '#ff8a2a'); shake(10); sfx('boomfx'); say('ドカーン！ まわりが ばくはつした！'); const ms = G.mons.filter(m => Math.abs(m.x - P.x) <= 2 && Math.abs(m.y - P.y) <= 2); if (!ms.length) return 'でも 敵は いなかった。'; const d = 15 + G.f * 3; for (const m of ms) elemHit(m, d, 'fire'); } },
  s_ident: { name: 'めききのおふだ', cat: 'scroll', desc: 'もちものと しまう袋の 中身の 正体が ぜんぶ わかる', spr: 'scroll', use: () => { const all = [...P.inv, ...myBags().flatMap(b => b.items)], u = all.filter((o, i) => !isKnown(o.k) && all.findIndex(x => x.k === o.k) === i);
    for (const o of u) P.known.add(o.k); for (const o of all) if (o.cursed) o.curseKnown = true; return u.length ? `もちものが 光った！ ${u.map(itemName).join('、')} だと わかった。` : 'もちものが 光った。（わからない物は なかった）'; } },
  // ---- 杖（何回か使える） ----
  w_blow: { name: 'ふきとばしの杖', cat: 'wand', desc: '当たった敵を 遠くへ ふきとばす', spr: 'wand', use: (p, o) => zap(o, m => { const [dx, dy] = P.dir; let n = 0; while (n < 6 && isFloor(m.x + dx, m.y + dy) && !monAt(m.x + dx, m.y + dy) && !shopAt(m.x + dx, m.y + dy)) { m.x += dx; m.y += dy; n++; } const d = Math.round((5 + G.f) * magicPower); hitMon(m, d, `${m.name}は ふきとんで 壁に ぶつかった！ ${d}の ダメージ。`); }) },
  w_bind: { name: 'かなしばりの杖', cat: 'wand', desc: '当たった敵が しばらく 動けなくなる', spr: 'wand', use: (p, o) => zap(o, m => { m.stuck = 12; say(`${m.name}は かなしばりで 動けなくなった！`); }) },
  w_fire: { name: 'ほのおの杖', cat: 'wand', desc: '当たった所で 炎が はじけて、まわりの敵にも ダメージ', spr: 'wand', use: (p, o) => zap(o, m => { const cx = m.x, cy = m.y, cells = []; for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) if (isFloor(x, y)) cells.push([x, y]);
    boom(cells, '#ff5a2a'); shake(5); sfx('boomfx'); say('炎が はじけた！'); const d = 10 + G.f * 2; for (const t of G.mons.filter(t => Math.abs(t.x - cx) <= 1 && Math.abs(t.y - cy) <= 1)) elemHit(t, d, 'fire'); }) },
  w_swap: { name: '入れかえの杖', cat: 'wand', desc: '当たった敵と 場所を 入れかえる', spr: 'wand', use: (p, o) => zap(o, m => { [P.x, P.y, m.x, m.y] = [m.x, m.y, P.x, P.y]; say(`${m.name}と 場所が 入れかわった！`); }) },
};
const FAKE_NAMES = { grass: ['あかい草', 'あおい草', 'ぎざぎざの草', 'しおれた草', 'いいにおいの草', 'ねじれた草', 'ふわふわの草'],
  scroll: ['まるもようのおふだ', '三角もようのおふだ', 'うずまきのおふだ', '星もようのおふだ', '波もようのおふだ', 'しましまのおふだ', 'ひしがたのおふだ', 'てんてんのおふだ'],
  wand: ['さくらの杖', 'かしの杖', 'ほねの杖', 'ガラスの杖', 'くねくねの杖', 'てつの杖'] };
const TRAITS = {
  dekakiller: { name: 'でかこわ特効', slot: 'atk', desc: 'でかこわに2倍' },
  robokiller: { name: 'ロボ特効', slot: 'atk', desc: 'AI暴走ロボに2倍' },
  kyuketsu: { name: '吸血', slot: 'atk', desc: 'なぐるとHP＋1' },
  nekoyoke: { name: 'ねこよけ', slot: 'def', desc: 'ねこミームでおどらない' },
  togeyoke: { name: 'トゲよけ', slot: 'def', desc: 'トゲのわなが効かない' },
  haramochi: { name: 'はらもち', slot: 'def', desc: 'おなかが減りにくい' },
  honoo: { name: '炎の刃', slot: 'atk', desc: 'ふつうの こうげきが 炎の属性に なる' },
  koori: { name: '氷の刃', slot: 'atk', desc: 'ふつうの こうげきが 氷の属性に なる' },
  hanekaeshi: { name: 'はねかえし', slot: 'def', desc: 'うけたダメージの半分を 敵に返す' },
  // ここから 防具の 特性（あとから ふやした）
  saifu: { name: 'さいふのひも', slot: 'def', desc: 'お金を ぬすまれない。お金の わなも 効かない' },
  mikawashi: { name: 'みかわし', slot: 'def', desc: '敵の こうげきを 8回に1回 よける' },
  saisei: { name: 'じわじわ回復', slot: 'def', desc: '3ターンごとに HP＋1' },
  maryoku: { name: 'まりょく回復', slot: 'def', desc: '5ターンごとに MP＋1' },
  gakeppuchi: { name: 'がけっぷち', slot: 'def', desc: 'HPが のこり3わり以下だと こうげき1.5倍' },
  manabi: { name: 'まなび', slot: 'def', desc: '敵を たおした けいけんちが 1.2倍' },
  kinun: { name: 'きんうん', slot: 'def', desc: 'ひろう お金が 1.3倍' },
  chizu: { name: 'ちずよみ', slot: 'def', desc: '階に 入ると 階段の 場所が わかる' },
  robomamori: { name: 'ロボよけ', slot: 'def', desc: 'AI暴走ロボからの ダメージが 半分' },
  dekamamori: { name: 'でかこわよけ', slot: 'def', desc: 'でかこわ（王も）からの ダメージが 4分の3' },
  // v1.57 で ふやした 特性（武器）
  ikazuchi: { name: '雷の刃', slot: 'atk', desc: 'ふつうの こうげきが 雷の属性に なる' },
  kaishin: { name: 'かいしん', slot: 'atk', desc: 'ふつうの こうげきが 8回に1回 かいしんの いちげき（2倍）' },
  mpkyuu: { name: 'まりょく吸収', slot: 'atk', desc: 'なぐると 3回に1回 MP＋1' },
  hirumi: { name: 'ひるませ', slot: 'atk', desc: 'なぐると 5回に1回 敵が 1ターン うごけない' },
  rengeki: { name: 'れんげき', slot: 'atk', desc: 'ふつうの こうげきで 6回に1回 もう1回 こうげき' },
  kinkiri: { name: 'こがねぎり', slot: 'atk', desc: '敵を たおすと お金＋（地下の 階 × 5）' },
  nushikiller: { name: 'ぬし特効', slot: 'atk', desc: 'ぬしと でかこわの王に 1.5倍' },
  // v1.57 で ふやした 特性（防具）
  wanayoke: { name: 'わなよけ', slot: 'def', desc: 'わなを ふんでも 3回に1回 なにも おきない' },
  kaifuku: { name: '回復じょうず', slot: 'def', desc: '草や 弁当で ふえる HP・おなかが 1.5倍' },
  fumibari: { name: 'ふんばり', slot: 'def', desc: '1つの 階で 1回だけ、HPが 0に なっても 1で たえる' },
  takarami: { name: 'たからみ', slot: 'def', desc: '階に 入ると 道具の 場所が わかる' },
  setsuyaku: { name: 'せつやく', slot: 'def', desc: 'わざを 使っても 4回に1回 MPが へらない' },
  // v1.64 で ふやした 特性
  karugaru: { name: 'かるがる', slot: 'def', desc: 'にもつが 12こを こえても おなかの へりかたが ふつうの まま' },
};
// 道具が 生まれるときに 特性を えらぶ 元の 一覧（ここは かえない＝同じ 合言葉の 乱数の 並びを そのままに する）。
// あとから ふやした 特性は、べつの 乱数（trRoll）で 入れかえて 出す
const GEN_TRAITS = { atk: ['dekakiller', 'robokiller', 'kyuketsu', 'honoo', 'koori'], def: ['nekoyoke', 'togeyoke', 'haramochi', 'hanekaeshi'] };
const INV_MAX = 12;
// 防具の 部位の 名前（そうびの せつめいに つかう）
// 食べる：おなか・HP・MPを ふやして、ふえた ぶんを 書いた 文を かえす
function eat(p, food, hp, mp, msg) { const f0 = p.food, h0 = p.hp, m0 = p.mp; p.food = Math.min(100, p.food + food); p.hp = Math.min(p.mhp, p.hp + hp); p.mp = Math.min(p.mmp, p.mp + mp);
  const parts = [p.food > f0 ? `おなか＋${p.food - f0}` : '', p.hp > h0 ? `HP＋${p.hp - h0}` : '', p.mp > m0 ? `MP＋${p.mp - m0}` : ''].filter(Boolean); return msg + (parts.length ? `（${parts.join('・')}）` : ''); }
// 床に おちている 弁当の かたより（下に いくほど いい 弁当も 出る）
// 武器の なかま：階の 深さで 出る物が かわる（0＝浅い 1＝中くらい 2＝深い）
const WEAPON_TIERS = [['dou_ken', 'dou_ken', 'yari', 'muchi', 'boomerang', 'tsue', 'sword'],
  ['hagane_ken', 'honoo_ken', 'koori_ken', 'ikazuchi_ken', 'honoo_yari', 'rune_tsue', 'honoo_tsue', 'ibara_muchi', 'hagane_boom'],
  ['hagane_ken', 'hagane_yari', 'honoo_yari', 'kusari_muchi', 'hoshi_boom', 'rune_tsue', 'ikazuchi_ken', 'koori_ken']];
const RARE_WEAPONS = ['ryuu_yari', 'kenja_tsue'];
const weaponTier = f => f <= 4 ? 0 : f <= 12 ? 1 : 2;
// 金策の 道具（深いほど 高い 物が 出る）
const GEM_POOL = ['ruby', 'ruby', 'ruby', 'sapphire', 'sapphire', 'emerald', 'kin_tamago', 'kin_tamago'];
const FOOD_POOL = ['onigiri', 'onigiri', 'nori_ben', 'nori_ben', 'karaage_ben', 'shake_ben', 'curry_ben', 'maku_ben'];
const SLOT_NAME = { atk: '武器', def: 'たて', head: 'あたま', arm: 'うで', foot: 'あし' };
const ARMOR_SLOTS = ['def', 'head', 'arm', 'foot'];
const ARMOR_POOL = ['kawa_boushi', 'kawa_boushi', 'kawa_kote', 'kawa_kote', 'kawa_kutsu', 'kawa_kutsu', 'tetsu_kabuto', 'tetsu_kote', 'mahou_boushi', 'hayate_kutsu'];
const RARE_ITEMS = ['hikari_ken', 'hoshi_tate', 'shiawase', 'shiawase', 'mahou_bin'];
const TRAPS = {
  spike: { name: 'トゲのわな', spr: 't_spike' },
  hole: { name: '落とし穴', spr: 't_hole' },
  heat: { name: '酷暑日のゆか', spr: 't_heat' },
  ticket: { name: '青切符のわな', spr: 't_ticket' },
  nisa: { name: 'NISA貧乏のわな', spr: 't_nisa' },
  start: { name: 'ふりだしのわな', spr: 't_start' },
  cat: { name: 'ねこミームのゆか', spr: 't_cat' },
};
