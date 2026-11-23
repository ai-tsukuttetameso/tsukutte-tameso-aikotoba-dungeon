// 深い階の 敵と レアアイテムの 絵（新しい絵 ＋ いまの絵の 色ちがい）
'use strict';

// 色ちがいを 作る。hue＝色相を まわす（度）、sat・light＝あざやかさ・明るさの 倍率、tint＝[r,g,b,強さ] を まぜる
// ふちどりの ほぼ黒い色は そのまま のこす
function variant(src, { hue = 0, sat = 1, light = 1, tint = null } = {}) {
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data;
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue;
    let [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]); if (l < .12) continue;
    h = (h + hue / 360 + 1) % 1; s = Math.min(1, s * sat); l = Math.min(1, l * light);
    let [r, gg, b] = hsl2rgb(h, s, l);
    if (tint) { const a = tint[3]; r = r * (1 - a) + tint[0] * a; gg = gg * (1 - a) + tint[1] * a; b = b * (1 - a) + tint[2] * a; }
    d[i] = r; d[i + 1] = gg; d[i + 2] = b; }
  g.putImageData(img, 0, 0); return c; }
function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; if (mx === mn) return [0, 0, l];
  const dd = mx - mn, s = l > .5 ? dd / (2 - mx - mn) : dd / (mx + mn); const h = mx === r ? (g - b) / dd + (g < b ? 6 : 0) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; return [h / 6, s, l]; }
function hsl2rgb(h, s, l) { if (!s) return [l * 255, l * 255, l * 255]; const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { t = (t + 1) % 1; return 255 * (t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p); }; return [f(h + 1 / 3), f(h), f(h - 1 / 3)]; }

// ----- 新しい敵 -----
S.golem = sprite([
'................','.....kkkkkk.....','....kGGGGGGk....','...kGgGGGGgGk...','...kGGEGGEGGk...','...kGGGGGGGGk...','.kkkGGgggGGGkkk.','kGGkGGGGGGGGkGGk',
'kGGkGgGGGGgGkGGk','kGgkGGGGGGGGkgGk','.kk.kGGGGGGk.kk.','....kGGkkGGk....','...kGGGk.kGGGk..','...kkkkk.kkkkk..','................','................'],
{ k: '#2a2420', G: '#9a8a78', g: '#6a5a4a', E: '#4fd1ff' });
S.lamp = sprite([
'.......yy.......','......y..y......','.....kkkkkk.....','....kOOOOOOk....','...kOWWOOOOOk...','...kOWOOOOOOk...','...kOOeOOeOOk...','...kOOOOOOOOk...',
'...kOOOmmOOOk...','....kOOOOOOk....','.....kkkkkk.....','....pPPPPPPp....','...pPP.PP.PPp...','...p..p..p..p...','................','................'],
{ y: '#ffe14d', k: '#3a2a5a', O: '#ffb347', W: '#fff3c0', e: '#1a1020', m: '#7a2a1a', p: '#6a5aa0', P: '#b8a8f0' });
S.dragon = sprite([
'................','.........kkk....','........kGGGk...','.......kGeGGGk..','.......kGGGGGGk.','..w....kGGGmmk..','.wWw..kGGGGk....','wWWWwkGGGGGGk...',
'wWWWkGGYYGGGGk..','.wWkGGYYYYGGGk..','..kGGGYYYYGGk...','..kGGGGYYGGGk...','...kGGGGGGGk.kk.','....kGk.kGk.kGk.','...kkk..kkk..k..','................'],
{ k: '#1a2a10', G: '#4cae4c', e: '#ffe14d', m: '#ff5a3a', w: '#8a3a2a', W: '#e07050', Y: '#f0d890' });
// ----- 色ちがいの 敵 -----
S.bat2 = variant(S.bat, { hue: -70, sat: 1.2, light: 1.15 });
S.robo2 = variant(S.robo, { tint: [255, 60, 60, .45] });
S.cat2 = variant(S.cat, { hue: 200, light: .55 });
S.rat2 = variant(S.rat, { tint: [255, 210, 40, .4] });
S.dekakowa2 = variant(S.dekakowa, { hue: 150, light: .8, sat: 1.2 });
// ----- レアアイテム -----
S.bottle = sprite([
'................','......kkkk......','......kWWk......','.......kk.......','......kBBk......','.....kBBBBk.....','....kBWBBBBk....','....kBWBBBBk....',
'....kBBBBBBk....','....kBBBBBBk....','.....kBBBBk.....','......kkkk......'],
{ k: '#3a2a5a', W: '#ffffff', B: '#b06aff' });
S.sword_r = variant(S.sword, { tint: [255, 215, 70, .5] });
S.shield_r = variant(S.shield, { tint: [255, 215, 70, .5] });
S.herb_r = variant(S.herb, { hue: 190, sat: 1.3, light: 1.1 });
// ----- いろいろな 武器 -----
S.spear = sprite([
'...............w','.............wWw','............wWw.','...........wWw..','..........bw....','.........bb.....','........bb......','.......bb.......',
'......bb........','.....bb.........','....bb..........','...bb...........','..bb............','.bb.............','................','................'],
{ w: '#8898b8', W: '#e8f0ff', b: '#8a5a30' });
S.staff = sprite([
'......pPPp......','.....pPWPPp.....','.....pPPPPp.....','......pPPp......','.......yy.......','.......bb.......','.......bb.......','.......bb.......',
'.......bb.......','.......bb.......','.......bb.......','.......bb.......','.......bb.......','.......bb.......','.......BB.......','................'],
{ p: '#5a2a8a', P: '#b06aff', W: '#ffffff', y: '#ffd23f', b: '#8a5a30', B: '#5a3a20' });
S.whip = sprite([
'................','.....kkkkk......','....k.....k.....','...k..kkk..k....','...k.k...k.k....','...k.k.k.k.k....','...k..k..k..k...','....k....k...k..',
'.....kkkk.....k.','..............k.','.............bb.','.............bb.','.............bb.','.............BB.','................','................'],
{ k: '#c0703a', b: '#5a3a20', B: '#2a1a10' });
S.boomerang = sprite([
'................','................','..yy............','..yYy...........','...yYy..........','....yYy.........','.....yYy........','......yYy.......',
'.......yYyy.....','.......yYYYyy...','........yyyYYy..','............yy..','................','................','................','................'],
{ y: '#a0522d', Y: '#f0a050' });
// ----- なかまキャラ（ダンジョンで ときどき 会える） -----
// うーたん：黒い かみ・黄色い シャツ・赤ペン
S.uutan = sprite([
'................','.....hhhhhh.....','....hhhhhhhh....','...hhhhhhhhhh...','...hhSSSSSShh...','...hSSSSSSSSh...','...SSeSSSSeSS...','...SrSSSSSSrS...',
'....SSSmmSSS....','.....SSSSSS.....','...yyyyyyyyyy...','..yyyyyyyyyyyy..','..yyyyyyyyyypP..','...yyyyyyyyy.P..','....bb....bb....','...kkk....kkk...'],
{ h: '#3a2418', S: '#f4c49a', e: '#1a1020', r: '#e86a5a', m: '#a03a3a', y: '#e8b040', p: '#c03030', P: '#ff6a5a', b: '#4a5a8a', k: '#2a1c18' });
// タメゾウ：テレビの 顔（みどりの 画面に にっこり）・アンテナ・「？」の からだ
S.tamezou = sprite([
'.......r........','.......k........','..kkkkkkkkkkk...','..kWWWWWWWWWk...','..kWGGGGGGGWk...','..kWGeGGGeGWk...','..kWGGGGGGGWk...','..kWGGeeeGGWk...',
'..kWWWWWWWWWk...','..kkkkkkkkkkk...','...bbbbbbbbb....','..bbbbqqbbbbb...','..bbbbbqbbbbb...','...bbbbbbbbb....','....bb...bb.....','...kkk...kkk....'],
{ r: '#e04040', k: '#2a2a2a', W: '#e8efe0', G: '#2f5a48', e: '#cfeedd', b: '#b88a5a', q: '#5a3a20' });
