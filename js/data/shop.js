// AIかじやの 品ぞろえと 値段
'use strict';

// お店の 品ぞろえ（* は いくつでも買える、? は ときどき ならぶ）。深い階ほど レアな物が 出る
const SHOP_STOCK = [
  ['bread*', 'herb*', 'arrow', 'sticker', 'charm', 's_ident', 'bag', 'sword', 'yari', 'shield'],
  ['bread*', 'herb*', 's_ident*', 'arrow', 'g_life', 's_up', 's_purify', 'w_bind', 'bag', 'sword', 'muchi', 'tsue', 'shield'],
  ['bread*', 'herb*', 's_ident*', 'g_life', 'g_life', 's_up', 's_blast', 'w_fire', 'sword', 'yari', 'boomerang', 'tsue', 'shield', 'omamori?'],
  ['bread*', 'herb*', 's_ident*', 'g_life*', 's_up', 's_up', 's_blast', 'w_fire', 'sword', 'yari', 'muchi', 'boomerang', 'tsue', 'shield', 'shiawase?', 'mahou_bin?', 'hikari_ken?', 'hoshi_tate?', 'omamori?'],
];
const PRICE = { nomi: 1200, dou_ken: 90, hagane_ken: 420, honoo_ken: 380, koori_ken: 380, ikazuchi_ken: 380, hagane_yari: 450, honoo_yari: 400, ryuu_yari: 1600, rune_tsue: 420, honoo_tsue: 360, kenja_tsue: 1400, ibara_muchi: 360, kusari_muchi: 520, hagane_boom: 380, hoshi_boom: 600, ruby: 600, sapphire: 1000, emerald: 1600, diamond: 3000, kinkai: 6000, kin_tamago: 400, onigiri: 30, nori_ben: 60, karaage_ben: 100, shake_ben: 110, curry_ben: 120, maku_ben: 180, toku_ben: 900, kawa_boushi: 90, tetsu_kabuto: 260, mahou_boushi: 240, ryuu_kabuto: 1400, kawa_kote: 80, tetsu_kote: 230, kawa_kutsu: 80, hayate_kutsu: 260, s_ident: 80, s_blast: 220, w_fire: 220, bag: 200, omamori: 1200, hikari_ken: 1500, yari: 170, tsue: 200, muchi: 150, boomerang: 180, hoshi_tate: 1300, shiawase: 900, mahou_bin: 800, bread: 40, herb: 70, sticker: 120, charm: 90, arrow: 60, sword: 150, shield: 120, g_life: 300, s_up: 250, w_bind: 200, w_blow: 180, s_purify: 150 };
const CATALOG = ['bread', 'herb', 'sticker', 'charm', 's_ident', 'arrow', 'bag', 'sword', 'shield'];
