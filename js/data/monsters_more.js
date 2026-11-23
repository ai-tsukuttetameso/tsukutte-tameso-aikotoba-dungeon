// ふやした 敵（ぜんぶで 100体）と、まもの図鑑の せつめい
'use strict';

// ===== ふやした 敵 =====
// like＝この 敵の かわりに 出る（強さも 同じくらい）。同じ 合言葉なら 地図・道具の 場所は かわらず、出る 敵の しゅるいだけが ふえる
// m＝like の 強さに かける 倍率 ／ fx＝絵（S の 名前、または [もとの絵, 色ちがいの しかた]） ／ 特ちょう：
//   erratic ふらふら動く ／ fast 2回 動く ／ dance おどらせる ／ steal ぬすむ ／ big 大きい
//   regen 自分の 番に HPが 少し もどる ／ hunger 当たると おなかが へる ／ mpdrain 当たると MPが へる
const V = (base, v) => [base, v];
const MORE_MON = [
  // --- キノコンの なかま（地下1階から） ---
  ['purupuru', 'ぷるぷる', 'kinoko', 1, 'purupuru', { weak: 'fire' }, 'いつも ぷるぷる ふるえている。さわると ひんやり きもちいい。'],
  ['purupuru2', 'あおぷるぷる', 'kinoko', 1.05, V('purupuru', { hue: 110 }), { weak: 'thunder', resist: 'ice' }, '水の 多い 階に すむ。雷に よわい。'],
  ['purupuru3', 'べにぷるぷる', 'kinoko', 1.1, V('purupuru', { hue: -130, sat: 1.2 }), { regen: true, weak: 'ice', resist: 'fire' }, 'きずが すぐ ふさがる。いそいで たおそう。'],
  ['kaeru', 'ケロケロ', 'kinoko', .95, 'kaeru', { erratic: true, weak: 'ice' }, 'どこへ はねるか 本人も 知らない。'],
  ['kaeru2', 'どくケロケロ', 'kinoko', 1.1, V('kaeru', { hue: 160 }), { hunger: true, weak: 'fire' }, 'なめられると なぜか おなかが へる。'],
  ['hebi', 'ニョロ', 'kinoko', 1, 'hebi', { weak: 'ice' }, 'しずかに 近づいてくる。さむいのが にがて。'],
  ['kinoko2', 'ドクキノコン', 'kinoko', 1.1, V('kinoko', { hue: 120 }), { hunger: true, weak: 'fire' }, 'キノコンの いとこ。食べたら たぶん だめ。'],
  ['kinoko3', 'ゆきキノコン', 'kinoko', 1.05, V('kinoko', { sat: .2, light: 1.3 }), { weak: 'fire', resist: 'ice' }, 'さむい 階で 育った キノコン。ひんやりしている。'],
  ['bug', 'ちいさなバグ', 'kinoko', .8, 'bug', { fast: true, weak: 'fire' }, 'すばしっこい。見つけたら すぐ つぶそう。'],
  ['bug2', 'しつこいバグ', 'kinoko', 1, V('bug', { hue: 200 }), { regen: true, weak: 'fire' }, 'なおしたはずなのに、また 出てくる。'],
  // --- コウモリの なかま ---
  ['kumo', 'ぶらさがりグモ', 'bat', 1, 'kumo', { erratic: true, weak: 'fire' }, '天井から ぶらさがって 冒険者を まっている。'],
  ['kumo2', 'どくグモ', 'bat', 1.1, V('kumo', { hue: 100 }), { erratic: true, hunger: true, weak: 'fire' }, 'かまれると 力が ぬけて おなかが すく。'],
  ['hachi', 'ブンブンバチ', 'bat', .8, 'hachi', { erratic: true, fast: true, weak: 'ice' }, 'はねの 音で すぐ わかる。動きが はやい。'],
  ['medama', 'ぎょろめだま', 'bat', 1, 'medama', { erratic: true, mpdrain: true, weak: 'thunder' }, 'じっと 見られると まりょくが すいとられる。'],
  ['obake', 'ちびおばけ', 'bat', 1, 'obake', { erratic: true, weak: 'thunder', resist: 'ice' }, 'おどかすのが 大好き。でも ちょっと 気が 小さい。'],
  ['bat3', 'あかコウモリ', 'bat', 1.1, V('bat', { hue: 120 }), { erratic: true, weak: 'ice', resist: 'fire' }, 'あつい 場所が すき。炎は きかない。'],
  ['hachi2', 'ゆうやけバチ', 'bat', 1, V('hachi', { hue: -30, sat: 1.3 }), { erratic: true, weak: 'ice' }, '夕方に なると 元気に なる ハチ。'],
  ['obake2', 'よふかしおばけ', 'bat', 1.1, V('obake', { hue: 240, light: .8 }), { erratic: true, mpdrain: true, weak: 'thunder' }, 'ねむらない おばけ。まりょくを すって 起きている。'],
  // --- ミームねこの なかま（おどらせる） ---
  ['pengin', 'ノリノリペンギン', 'cat', 1, 'pengin', { dance: true, weak: 'fire' }, '音楽が なくても おどりだす。'],
  ['usagi', 'ステップうさぎ', 'cat', 1, 'usagi', { dance: true, weak: 'ice' }, 'かろやかな ステップで さそってくる。'],
  ['saboten', 'おどるサボテン', 'cat', 1, 'saboten', { dance: true, weak: 'fire', resist: 'thunder' }, 'トゲが あるのに なぜか ハグを してほしそう。'],
  ['pengin2', 'ディスコペンギン', 'cat', 1.1, V('pengin', { hue: 200, sat: 1.4 }), { dance: true, weak: 'thunder' }, 'ミラーボールの 下で 生まれた ペンギン。'],
  ['cat3', 'しろミームねこ', 'cat', 1.05, V('cat', { sat: .1, light: 1.35 }), { dance: true, weak: 'fire' }, 'まっしろな ミームねこ。見るたびに おどっている。'],
  ['usagi2', 'よぞらうさぎ', 'cat', 1.1, V('usagi', { hue: 230, light: .7 }), { dance: true, weak: 'fire' }, '月の 夜に だけ おどる……はずだった。'],
  // --- こそどろネズミの なかま（ぬすむ） ---
  ['spam', 'スパムメール', 'thief', 1, 'spam', { steal: true, fast: true, weak: 'fire' }, 'あけたら さいご。お金が きえる。'],
  ['sabusuku', 'サブスクおばけ', 'thief', 1, V('obake', { hue: 90, sat: 1.4 }), { steal: true, fast: true, weak: 'thunder' }, '気がつくと お金を もっていく。とめかたが わからない。'],
  ['karasu', 'ピカピカガラス', 'thief', 1, 'karasu', { steal: true, fast: true, weak: 'thunder' }, 'ひかる 物が 大好き。とくに 金貨。'],
  ['rat3', 'あおどろネズミ', 'thief', 1.05, V('rat', { hue: 180 }), { steal: true, fast: true, weak: 'ice' }, 'こそどろネズミの 弟分。にげ足は 兄より はやい。'],
  ['popup', 'ポップアップこうこく', 'thief', 1, 'popup', { steal: true, fast: true, weak: 'thunder' }, '「とじる」ボタンが どこにも ない。'],
  // --- AI暴走ロボの なかま（2回 動く） ---
  ['sumaho', 'スマホおばけ', 'robo', 1, 'sumaho', { fast: true, weak: 'thunder' }, 'つうちが なりやまない。気になって 前に すすめない。'],
  ['sumaho2', 'ねむらないスマホ', 'robo', 1.1, V('sumaho', { hue: 150 }), { fast: true, mpdrain: true, weak: 'ice' }, '夜中も ずっと 光っている。見ていると まりょくが へる。'],
  ['kani', 'ハサミガニ', 'robo', 1, 'kani', { fast: true, weak: 'thunder', resist: 'ice' }, '横に しか 歩けない……と 思ったら まっすぐ 来た。'],
  ['kani2', 'よろいガニ', 'robo', 1.15, V('kani', { hue: 200, light: .8 }), { fast: true, def: 1, weak: 'thunder' }, 'かたい からで 身を まもっている。'],
  ['hebi2', 'マムシニョロ', 'robo', 1, V('hebi', { hue: 40, light: .85 }), { fast: true, hunger: true, weak: 'ice' }, 'かまれると おなかが へる。にげ足も はやい。'],
  ['robo3', 'おそうじロボ', 'robo', .95, V('robo', { hue: 160 }), { fast: true, weak: 'thunder' }, 'ゴミと 冒険者の 区別が つかない。'],
  ['robo4', 'けいさんロボ', 'robo', 1.05, V('robo', { tint: [60, 220, 120, .4] }), { fast: true, mpdrain: true, weak: 'thunder' }, 'こちらの まりょくを 計算に つかってしまう。'],
  ['gaikotsu', 'カタカタがいこつ', 'robo', 1.05, 'gaikotsu', { fast: true, weak: 'thunder', resist: 'ice' }, 'ほねの 音を ならしながら 走ってくる。'],
  ['hachi3', 'ぐんたいバチ', 'robo', 1, V('hachi', { hue: -60, light: .8 }), { fast: true, weak: 'ice' }, 'きちんと れつを つくって とんでくる。'],
  ['kaeru3', 'ガマガマ', 'robo', 1.15, V('kaeru', { hue: 30, light: .75 }), { fast: true, regen: true, weak: 'ice' }, 'あぶらで きずを なおす。'],
  ['bug3', 'メモリリーク', 'robo', 1.1, V('bug', { hue: 260 }), { fast: true, hunger: true, weak: 'fire' }, 'すこしずつ、でも かくじつに おなかを へらす。'],
  // --- でかこわの なかま（大きい） ---
  ['dekakowa3', 'あかでかこわ', 'dekakowa', 1.05, V('dekakowa', { hue: 30, sat: 1.2 }), { big: true, weak: 'ice', resist: 'fire' }, 'でかくて こわくて、あつい。'],
  ['dekakowa4', 'しろでかこわ', 'dekakowa', 1, V('dekakowa', { sat: .15, light: 1.6 }), { big: true, weak: 'fire', resist: 'ice' }, 'でかくて こわくて、まっしろ。'],
  ['dekakowa5', 'きんでかこわ', 'dekakowa', 1.1, V('dekakowa', { tint: [255, 210, 60, .5] }), { big: true, weak: 'thunder', exp: 1.5 }, 'でかくて こわくて、なぜか ありがたい。'],
  // --- ここから 下は 深い ダンジョン（地下11階より下）で 出る 敵 ---
  // ごろごろ岩の なかま
  ['golem2', 'こけむし岩', 'golem', 1, V('golem', { hue: 70, sat: 1.4 }), { regen: true, weak: 'fire' }, 'こけが きずを ふさいでくれる。'],
  ['golem3', 'マグマ岩', 'golem', 1.1, V('golem', { tint: [255, 80, 30, .5] }), { weak: 'ice', resist: 'fire' }, 'なかは まだ どろどろに あつい。'],
  ['yukidaruma', 'ゆきだるま', 'golem', 1, 'yukidaruma', { weak: 'fire', resist: 'ice' }, 'ダンジョンの 中なのに とけない ふしぎな ゆきだるま。'],
  ['yukidaruma2', 'どろだるま', 'golem', 1.05, V('yukidaruma', { tint: [120, 80, 40, .6] }), { weak: 'thunder' }, 'ゆきが たりなかったらしい。'],
  ['yoroi', 'からっぽよろい', 'golem', 1, 'yoroi', { weak: 'thunder' }, '中には だれも 入っていない。……はず。'],
  ['yoroi2', 'くろよろい', 'golem', 1.15, V('yoroi', { light: .5 }), { weak: 'fire', def: 1 }, 'くらやみに まぎれて まっている。'],
  ['gaikotsu2', 'がいこつナイト', 'golem', 1.1, V('gaikotsu', { tint: [120, 140, 200, .4] }), { weak: 'thunder', resist: 'ice' }, '剣を もたない 騎士。でも かたい。'],
  // おばけランプの なかま（ふらふら）
  ['lamp2', 'あおびランプ', 'lamp', 1, V('lamp', { hue: 180 }), { erratic: true, weak: 'fire', resist: 'ice' }, 'つめたい 青い 火を ともしている。'],
  ['obake3', 'おおおばけ', 'lamp', 1.2, V('obake', { hue: 20, light: .9 }), { erratic: true, mpdrain: true, weak: 'thunder' }, 'ちびおばけが 大人に なった すがた。'],
  ['medama2', 'ひとつめのぞき', 'lamp', 1, V('medama', { hue: 100 }), { erratic: true, mpdrain: true, weak: 'thunder' }, 'かべの すきまから いつも 見ている。'],
  ['lamp3', 'みどりびランプ', 'lamp', 1.05, V('lamp', { hue: 90 }), { erratic: true, weak: 'ice' }, 'あやしい みどりの 火。'],
  ['kumo3', 'じゅうじグモ', 'lamp', 1.05, V('kumo', { tint: [255, 220, 80, .4] }), { erratic: true, weak: 'fire' }, 'せなかに 十字の もよう。あみを はるのが うまい。'],
  ['obake4', 'わすれものおばけ', 'lamp', 1, V('obake', { hue: 60, sat: 1.5 }), { erratic: true, hunger: true, weak: 'fire' }, 'おべんとうを わすれて きた おばけ。人の おなかも へらす。'],
  ['medama3', 'よるのめだま', 'lamp', 1.1, V('medama', { light: .6, hue: 250 }), { erratic: true, weak: 'fire' }, 'くらいほど よく 見える。'],
  // でんげきコウモリの なかま
  ['bat4', 'ふぶきコウモリ', 'bat2', 1, V('bat', { sat: .2, light: 1.5 }), { erratic: true, weak: 'fire', resist: 'ice' }, 'つばさで ふぶきを おこす。'],
  ['bat5', 'ほのおコウモリ', 'bat2', 1.05, V('bat', { hue: 140, sat: 1.4 }), { erratic: true, weak: 'ice', resist: 'fire' }, 'とぶと 火の粉が ちる。'],
  ['hachi4', 'おおバチ', 'bat2', 1.1, V('hachi', { hue: -20, light: .85 }), { erratic: true, fast: true, weak: 'ice' }, 'ブンブンバチの 女王さま。'],
  ['karasu2', 'よぞらガラス', 'bat2', 1, V('karasu', { hue: 220, light: 1.3 }), { erratic: true, weak: 'thunder' }, '夜空の 色を した カラス。'],
  ['bat6', 'きんコウモリ', 'bat2', 1.1, V('bat', { tint: [255, 210, 60, .55] }), { erratic: true, weak: 'ice', exp: 1.5 }, 'たおすと いいことが ある……かも。'],
  ['kumo4', 'てつグモ', 'bat2', 1.15, V('kumo', { sat: .2, light: 1.4 }), { erratic: true, weak: 'thunder', def: 1 }, 'てつの あしで かべを はしる。'],
  // AI暴走ロボ改の なかま（2回 動く）
  ['robo5', 'ロボ・ゴールド', 'robo2', 1.1, V('robo', { tint: [255, 210, 60, .5] }), { fast: true, weak: 'thunder', exp: 1.5 }, 'ぴかぴかの 特別モデル。'],
  ['robo6', 'ロボ・ステルス', 'robo2', 1.05, V('robo', { light: .45 }), { fast: true, weak: 'thunder', resist: 'ice' }, '見えにくい ように 黒く ぬられている。'],
  ['sumaho3', 'タブレットおばけ', 'robo2', 1.1, V('sumaho', { hue: 60, light: 1.1 }), { fast: true, mpdrain: true, weak: 'thunder' }, 'スマホおばけが 大きく なった。'],
  ['kani3', 'くろがねガニ', 'robo2', 1.15, V('kani', { sat: .2, light: .7 }), { fast: true, weak: 'thunder', def: 1 }, 'はさみは てつも 切る。'],
  ['gaikotsu3', 'がいこつしょうぐん', 'robo2', 1.15, V('gaikotsu', { tint: [255, 200, 60, .4] }), { fast: true, weak: 'thunder' }, 'がいこつたちの リーダー。'],
  ['yoroi3', 'あかよろい', 'robo2', 1.05, V('yoroi', { tint: [220, 40, 40, .5] }), { fast: true, weak: 'ice' }, '中身が いないのに、すごく はやい。'],
  // やみミームねこの なかま（おどらせる）
  ['pengin3', 'こおりのペンギン', 'cat2', 1, V('pengin', { hue: -20, light: 1.3 }), { dance: true, weak: 'fire' }, 'こおりの 上で くるくる まわる。'],
  ['usagi3', 'つきうさぎ', 'cat2', 1.05, V('usagi', { tint: [255, 230, 120, .4] }), { dance: true, weak: 'thunder' }, 'もちつきの リズムで おどる。'],
  ['saboten2', 'はなさくサボテン', 'cat2', 1.1, V('saboten', { hue: -60 }), { dance: true, weak: 'fire' }, '花が さくと うれしくて おどる。'],
  // おおどろネズミの なかま（ぬすむ）
  ['spam2', 'メガスパム', 'thief2', 1.05, V('spam', { hue: 300, sat: 2 }), { steal: true, fast: true, weak: 'fire' }, '1日に 100通 とどく。'],
  ['sabusuku2', 'ねんかんサブスクおばけ', 'thief2', 1.1, V('obake', { hue: 140, sat: 1.6 }), { steal: true, fast: true, weak: 'thunder' }, '1年ぶん まとめて もっていく。'],
  ['karasu3', 'カラスの おやぶん', 'thief2', 1.1, V('karasu', { light: 1.6, sat: .3 }), { steal: true, fast: true, weak: 'ice' }, 'ひかる 物を あつめて 巣に かざっている。'],
  // ちびドラゴンの なかま
  ['dragon2', 'あおドラゴン', 'dragon', 1, V('dragon', { hue: 100 }), { weak: 'thunder', resist: 'ice' }, 'つめたい いきを はく。'],
  ['dragon3', 'きんドラゴン', 'dragon', 1.1, V('dragon', { tint: [255, 210, 60, .5] }), { weak: 'ice', exp: 1.5 }, 'たからものの 上で ねむる ドラゴン。'],
  ['dragon4', 'くろドラゴン', 'dragon', 1.15, V('dragon', { light: .45 }), { weak: 'ice', resist: 'thunder' }, 'くらやみの おくに すむ。'],
  ['hebi3', 'うみヘビ', 'dragon', 1, V('hebi', { hue: 120 }), { weak: 'thunder', resist: 'fire' }, '水の 中から ぬっと あらわれる。'],
  ['hebi4', 'ニシキヘビ', 'dragon', 1.1, V('hebi', { hue: -60, sat: 1.3 }), { weak: 'ice', regen: true }, 'ながい からだで まきついてくる。'],
  ['yoroi4', 'りゅうきし', 'dragon', 1.15, V('yoroi', { tint: [60, 200, 90, .45] }), { weak: 'thunder' }, 'ドラゴンの うろこで できた よろい。'],
  ['golem4', 'いんせき岩', 'dragon', 1.05, V('golem', { tint: [140, 80, 255, .45] }), { weak: 'thunder', resist: 'fire' }, '空から おちてきた 岩。'],
  ['yukidaruma3', 'こおりのきょじん', 'dragon', 1.1, V('yukidaruma', { hue: 190, sat: 1.5 }), { weak: 'fire', resist: 'ice' }, 'ゆきだるまの おじいさん。'],
  // くろでかこわの なかま（大きい）
  ['dekakowa6', 'あおでかこわ', 'dekakowa2', 1, V('dekakowa', { hue: 200 }), { big: true, weak: 'fire', resist: 'thunder' }, 'でかくて こわくて、つめたい。'],
  ['dekakowa7', 'にじでかこわ', 'dekakowa2', 1.15, V('dekakowa', { hue: 90, sat: 1.6 }), { big: true, weak: 'ice', exp: 1.5 }, 'でかくて こわくて、にじいろ。'],
];
// もとから いる 敵の せつめい
const MON_DESC = {
  kinoko: 'ダンジョンで いちばん よく 見る キノコ。炎に よわい。', bat: 'ふらふら とんでいる。どこへ 行くか わからない。',
  cat: 'となりに 来ると おどりだす。つられて おどると 1回 休み。', thief: 'お金や 道具を ぬすんで にげる。たおすと とりかえせる。',
  robo: '1回に 2回 動く。雷に よわく、炎は ききにくい。', dekakowa: 'でかくて こわい。地下5階くらいから 出てくる。',
  golem: 'ごろごろ ころがる 岩。とても かたい。', lamp: 'ふらふら ただよう ランプ。氷に よわい。', bat2: '雷を まとった コウモリ。雷は きかない。',
  robo2: 'AI暴走ロボの 強化版。こうげきが はげしい。', cat2: 'やみに そまった ミームねこ。炎に よわい。', thief2: 'こそどろネズミの おやぶん。',
  dragon: '小さいけれど 本物の ドラゴン。', dekakowa2: 'でかこわの 中でも とくに こわい。', keeper: 'お店で ぬすむと おこって おいかけてくる。とても 強い。',
};
for (let [id, name, like, m, spr, o, desc] of MORE_MON) { const L = MON[like];
  if (Array.isArray(spr)) { const key = 'mon_' + id; S[key] = variant(S[spr[0]], spr[1]); spr = key; }
  const { def = 0, exp = 1, ...flags } = o;
  MON[id] = { name, hp: Math.round(L.hp * m), atk: Math.round(L.atk * m), def: L.def + def, exp: Math.round(L.exp * m * exp), spr, like, desc, ...flags };
  if (L.big) MON[id].big = true; }
for (const [k, d] of Object.entries(MON_DESC)) if (MON[k]) MON[k].desc = d;
// 敵の なかま（ロボ特効・でかこわ特効・ロボよけ・でかこわよけで つかう）
const monFam = t => /^robo/.test(t) ? 'robo' : /^dekakowa/.test(t) ? 'dekakowa' : t;
// 出る 敵を ふやす：出現表で えらんだ 敵 t を、同じ 強さの なかまに おきかえる（もとの 敵も 2倍の わりあいで 出る）
// 乱数の 並びを かえないよう、合言葉と 場所から きめる（同じ 合言葉なら 同じ 敵）
const MON_SUBS = {}; for (const [id, , like] of MORE_MON) (MON_SUBS[like] = MON_SUBS[like] || []).push(id);
function widenMon(t, f, x, y) { const subs = MON_SUBS[t]; if (!subs) return t; const c = [t, t, ...subs];
  return c[hashSeed(runSeed + ':m:' + f + ':' + x + ':' + y + ':' + t) % c.length]; }
