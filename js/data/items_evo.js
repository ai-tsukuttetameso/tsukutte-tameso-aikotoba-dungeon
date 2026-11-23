// しんか：＋100まで きたえた そうびは、AIかじやで 上の そうびに しんか できる（えらべる 先は 2〜3つ）
// しんかすると ＋は 100 へる（＋130 なら ＋30 で のこる）。特性は そのまま、特性の わくが 1つ ふえる
// しんか先は ふつうには 落ちていない（ここでしか 手に入らない）
'use strict';

const EVO_NEED = 100;
// [id, 名前, もとの 絵, 色, { 中身 }, せつめい, 生まれつき つく 特性]
const EVO_ITEMS = [
  // ----- けん -----
  ['kami_ken', 'かみのつるぎ', 'sword_r', { hue: 30, sat: 1.4, light: 1.15 }, { equip: 'atk', val: 125 }, 'いちばん 強い けん', null],
  ['gouka_ken', 'ごうかのけん', 'sword_fire', { hue: -10, sat: 1.5 }, { equip: 'atk', val: 112, el: 'fire' }, 'ふつうの こうげきが 炎。なぐると HPが もどる', 'kyuketsu'],
  ['hyouga_ken', 'ひょうがのけん', 'sword_ice', { hue: 10, sat: 1.5, light: 1.1 }, { equip: 'atk', val: 112, el: 'ice' }, 'ふつうの こうげきが 氷。でかこわに 2倍', 'dekakiller'],
  // ----- やり -----
  ['ryuuou_yari', 'りゅうおうのやり', 'spear_ryuu', { hue: 40, sat: 1.3 }, { equip: 'atk', val: 122, weapon: 'spear' }, '前の 2マスを つらぬく。とても 強い', null],
  ['raijin_yari', 'らいじんのやり', 'spear_hagane', { hue: 50, sat: 2, light: 1.2 }, { equip: 'atk', val: 112, weapon: 'spear', el: 'thunder' }, '2マス つらぬく 雷の やり。ロボに 2倍', 'robokiller'],
  // ----- つえ -----
  ['sekaiju_tsue', 'せかいじゅのつえ', 'staff_kenja', { hue: 80, sat: 1.4 }, { equip: 'atk', val: 104, weapon: 'staff', magic: 2.6 }, 'まほう・杖・おふだが 2.6倍', null],
  ['gouen_tsue', 'ごうえんのつえ', 'staff_fire', { hue: -15, sat: 1.6 }, { equip: 'atk', val: 108, weapon: 'staff', magic: 2, el: 'fire' }, 'とばす たまが 炎。まほうが 2倍。わざの MPが 1 へる', null, 'mpcut'],
  // ----- むち -----
  ['ryuu_muchi', 'りゅうのむち', 'whip_kusari', { hue: 120, sat: 1.5 }, { equip: 'atk', val: 118, weapon: 'whip', stun: .6 }, '2マス先まで。10回に 6回 ひるませる', null],
  ['inazuma_muchi', 'いなずまのむち', 'whip_ibara', { hue: 60, sat: 2, light: 1.2 }, { equip: 'atk', val: 112, weapon: 'whip', stun: .4, el: 'thunder' }, '2マス先まで とどく 雷の むち', 'robokiller'],
  // ----- ブーメラン -----
  ['taiyou_boom', 'たいようのブーメラン', 'boom_hoshi', { hue: -20, sat: 1.6, light: 1.1 }, { equip: 'atk', val: 115, weapon: 'boomerang', el: 'fire' }, '4マス先までの 敵 ぜんぶに 炎', null],
  ['tsuki_boom', 'つきのブーメラン', 'boom_hagane', { hue: 200, sat: 1.4, light: 1.15 }, { equip: 'atk', val: 115, weapon: 'boomerang', el: 'ice' }, '4マス先までの 敵 ぜんぶに 氷', null],
  // ----- たて -----
  ['kami_tate', 'かみのたて', 'shield_r', { hue: 30, sat: 1.4, light: 1.15 }, { equip: 'def', val: 108 }, 'うける ダメージが いつも 1 へる', null, 'guard'],
  ['toge_tate', 'とげのたて', 'shield', { hue: -30, sat: 1.6 }, { equip: 'def', val: 104 }, 'なぐられると はねかえす', 'hanekaeshi'],
  // ----- あたま -----
  ['ou_kanmuri', 'おうのかんむり', 'helm_r', { hue: 40, sat: 1.5, light: 1.2 }, { equip: 'head', val: 104 }, 'わざ・まほうの MPが 1 へる', null, 'mpcut'],
  ['ryuuou_kabuto', 'りゅうおうのかぶと', 'helm_r', { hue: 160, sat: 1.4 }, { equip: 'head', val: 108 }, 'うける ダメージが いつも 1 へる', null, 'guard'],
  // ----- うで -----
  ['kyojin_kote', 'きょじんのこて', 'glove2', { hue: -20, sat: 1.6 }, { equip: 'arm', val: 102, atk: 30 }, 'こうげきも ＋30', null],
  ['kami_kote', 'かみのこて', 'glove2', { hue: 30, sat: 1.4, light: 1.2 }, { equip: 'arm', val: 110 }, 'とても かたい', null],
  // ----- あし -----
  ['tenshi_kutsu', 'てんしのくつ', 'boots2', { hue: 180, sat: 1.2, light: 1.25 }, { equip: 'foot', val: 104 }, 'わなを ふんでも 2回に 1回 とびこえる。おなかが へりにくい', 'haramochi', 'light'],
  ['kami_kutsu', 'かみのくつ', 'boots', { hue: 30, sat: 1.4, light: 1.2 }, { equip: 'foot', val: 110 }, 'とても かたい', null],
];
for (const [id, name, base, col, o, desc, trait, perk] of EVO_ITEMS) {
  const spr = 'evo_' + id; if (S[base]) S[spr] = variant(S[base], col);
  ITEMS[id] = { name, desc: `${o.equip === 'atk' ? 'こうげき' : 'ぼうぎょ'}＋${o.val}（しんか）`, note: desc, spr, ...o, evo: true, evoTrait: trait || undefined, perk: perk || undefined }; }
// どの そうびが どこへ しんか できるか（武器は 種類で、ぼうぐは 場所で きまる）
const EVO_TO = { sword: ['kami_ken', 'gouka_ken', 'hyouga_ken'], spear: ['ryuuou_yari', 'raijin_yari', 'kami_ken'], staff: ['sekaiju_tsue', 'gouen_tsue'],
  whip: ['ryuu_muchi', 'inazuma_muchi'], boomerang: ['taiyou_boom', 'tsuki_boom'], def: ['kami_tate', 'toge_tate'], head: ['ou_kanmuri', 'ryuuou_kabuto'],
  arm: ['kyojin_kote', 'kami_kote'], foot: ['tenshi_kutsu', 'kami_kutsu'] };
const evoChoices = o => { const it = ITEMS[o.k]; if (!it.equip) return [];
  const list = EVO_TO[it.equip === 'atk' ? (it.weapon || 'sword') : it.equip] || []; return list.filter(k => k !== o.k); };
for (const [id] of EVO_ITEMS) PRICE[id] = 4000;  // 売ると たかい
