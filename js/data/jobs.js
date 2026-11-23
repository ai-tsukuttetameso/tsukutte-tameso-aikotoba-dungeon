// 職業（ジョブ）の データ
'use strict';

// ===== 職業 =====
// perks＝もちまえの とくい（js/game/jobs.js の jobHas で しらべる）
//   tough：HPと こうげきが 高い ／ evade：敵の こうげきを よけやすい（にげやすい）
//   forge：合成が 半額・武器や たてを きたえられる ／ magic：MPが 多く、まほうが 1.3倍
//   items：回復の 道具が 1.5倍・投げる ダメージ 1.5倍・ひろった物の 正体が わかる
// skills＝おぼえる わざと、おぼえる レベル（わざの 中身は js/game/skills.js）
// look＝見た目（js/gfx/sprites_jobs.js で 主人公の 絵を ぬりかえる）
const JOBS = {
  senshi: { name: 'せんし', perks: ['tough'], skills: { double: 2, spin: 4, triple: 7 },
    desc: 'HPと こうげきが 高い。剣の わざで 正面から たたかう' },
  thief: { name: 'シーフ', perks: ['evade'], skills: { steal: 1, trapsee: 2, smoke: 4 },
    desc: '敵の こうげきを 4回に 1回 よける。ぬすむ・けむりだまで にげる' },
  smith: { name: 'かじや', perks: ['forge'], skills: { forge: 1, harden: 3, double: 5, anaake: 7 },
    desc: 'そうびを その場で きたえる。特性の わくも ふやせる。お店の 合成・わくふやしが 半額' },
  mage: { name: 'まほうつかい', perks: ['magic'], skills: { fire: 1, heal: 1, ice: 3, thunder: 5 },
    desc: 'MPが 多く、まほうが 1.3倍。HPは ひくめ' },
  tool: { name: 'どうぐつかい', perks: ['items'], skills: { appraise: 1, heal: 3, smoke: 5 },
    desc: '回復の 道具が 1.5倍。投げると 強い。ひろった物の 正体が わかる' },
  // 上位の 職業：2つの 職業を きわめると なれる。両方の とくいと わざ ＋ 上位職だけの とくい（perks）＋ とっておきの わざ
  //   drain：敵を たおすと MP＋2 ／ nimble：よける 確率 40%、よけたら はんげき ／ sage：3ターンごとに MP＋1
  //   crit：ふつうの こうげきが 5回に 1回 かいしん（2倍） ／ combo：ふつうの こうげきが 3回に 1回 2回こうげき
  //   hunter：矢と 投げる ダメージ 2倍 ／ trapper：わなが はじめから 見えて、ふんでも かからない
  //   illusion：うける ダメージ 4分の3 ／ alchemy：杖の 回数＋2、草を 使うと MP＋5
  //   merchant：お店で 3わり引き・3わり増しで 売れる・ひろう お金 1.5倍
  mken: { name: 'まほうけんし', from: ['senshi', 'mage'], perks: ['drain'], skills: { mblade: 6 },
    desc: '敵を たおすと MPが 2 もどる。とっておき「まほうけん」' },
  ninja: { name: 'にんじゃ', from: ['thief', 'tool'], perks: ['nimble'], skills: { kagenui: 6 },
    desc: 'よける 確率 40%、よけたら はんげき。とっておき「かげぬい」' },
  kenja: { name: 'けんじゃ', from: ['mage', 'tool'], perks: ['sage'], skills: { meteor: 7 },
    desc: 'MPが どんどん もどる（3ターンごとに＋1）。とっておき「メテオ」' },
  bmaster: { name: 'ぶきマスター', from: ['smith', 'senshi'], perks: ['crit'], skills: { hissatsu: 6 },
    desc: 'ふつうの こうげきが 5回に 1回 かいしん（2倍）。とっておき「ひっさつ」' },
  dancer: { name: 'ソードダンサー', from: ['senshi', 'thief'], perks: ['combo'], skills: { bladedance: 6 },
    desc: 'ふつうの こうげきが 3回に 1回 2回こうげき。とっておき「つるぎのまい」' },
  hunter: { name: 'かりゅうど', from: ['senshi', 'tool'], perks: ['hunter'], skills: { snipe: 5 },
    desc: '矢と 投げる ダメージが 2倍。とっておき「ねらいうち」' },
  karakuri: { name: 'からくりし', from: ['thief', 'smith'], perks: ['trapper'], skills: { bomb: 6 },
    desc: 'わなが はじめから 見えて、ふんでも かからない。とっておき「からくりばくだん」' },
  genjutsu: { name: 'げんじゅつし', from: ['thief', 'mage'], perks: ['illusion'], skills: { mayowase: 5 },
    desc: 'まぼろしで 敵の こうげきを 4分の3に へらす。とっておき「まどわし」' },
  renkin: { name: 'れんきんじゅつし', from: ['smith', 'mage'], perks: ['alchemy'], skills: { goldtouch: 6 },
    desc: '杖の 回数＋2、草を 使うと MP＋5。とっておき「おうごんのて」' },
  akindo: { name: 'あきんど', from: ['smith', 'tool'], perks: ['merchant'], skills: { zeninage: 4 },
    desc: 'お店で 3わり引き・高く 売れる・お金 1.5倍。とっておき「ぜになげ」' },
};
const BASE_JOBS = ['senshi', 'thief', 'smith', 'mage', 'tool'];
const UPPER_JOBS = ['mken', 'ninja', 'kenja', 'bmaster', 'dancer', 'hunter', 'karakuri', 'genjutsu', 'renkin', 'akindo'];
// 職業レベル：たおした 敵の けいけんちが そのまま 職業の けいけんちに なる（冒険を こえて のこる）
// レベル5で「きわめた」。2つ きわめると 上位の 職業が ひらく
const JOB_NEED = [0, 60, 150, 300, 500];
const JOB_MAX = JOB_NEED.length;
