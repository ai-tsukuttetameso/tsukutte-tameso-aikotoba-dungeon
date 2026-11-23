// 武器の なかまと 金策の 道具の 絵
'use strict';

// ===== 武器の なかま（もとの 絵を 色がえ） =====
S.sword_dou = variant(S.sword, { tint: [200, 130, 60, .5] });
S.sword_hagane = variant(S.sword, { tint: [190, 215, 255, .35], light: 1.1 });
S.sword_fire = variant(S.sword, { tint: [255, 90, 40, .55] });
S.sword_ice = variant(S.sword, { tint: [120, 220, 255, .55] });
S.sword_thunder = variant(S.sword, { tint: [255, 230, 60, .55] });
S.spear_hagane = variant(S.spear, { tint: [190, 215, 255, .35], light: 1.1 });
S.spear_fire = variant(S.spear, { tint: [255, 90, 40, .55] });
S.spear_ryuu = variant(S.spear, { tint: [80, 220, 120, .55] });
S.staff_rune = variant(S.staff, { hue: 160, sat: 1.3 });
S.staff_fire = variant(S.staff, { tint: [255, 90, 40, .5] });
S.staff_kenja = variant(S.staff, { tint: [255, 215, 70, .55] });
S.whip_ibara = variant(S.whip, { tint: [60, 170, 60, .55] });
S.whip_kusari = variant(S.whip, { tint: [190, 200, 220, .6] });
S.boom_hagane = variant(S.boomerang, { tint: [190, 215, 255, .45] });
S.boom_hoshi = variant(S.boomerang, { tint: [255, 230, 60, .6] });

// ===== ほうせき・きんかい・きんのたまご =====
const GEM_ROWS = ['................', '................', '.....kkkkkk.....', '....kWWLLLLk....', '...kWLLLLLLLk...', '..kLLLLLLLLLLk..', '...kLLDLLLLDk...', '....kLLDLLDk....', '.....kLLDDk.....', '......kLLk......', '.......kk.......'];
const gem = (L, D, W = '#ffffff') => sprite(GEM_ROWS, { k: '#1a1020', L, D, W });
S.gem_ruby = gem('#e5304d', '#8a1028');
S.gem_sapphire = gem('#3a6ae8', '#1a2a8a');
S.gem_emerald = gem('#2ac06a', '#0a6a3a');
S.gem_diamond = gem('#d8f4ff', '#7ab0d0');
// あなあけのみ（木の 柄と はがねの 刃）
S.nomi = sprite(['................', '..........ww....', '.........wXXw...', '........wXXw....', '.......wXXw.....', '......kYYk......', '.....kOOk.......', '....kOOk........', '...kOOk.........', '..kOOk..........', '..kkk...........'], { w: '#5a6070', X: '#e0e8ff', k: '#3a2410', Y: '#f0c040', O: '#a0662a' });
S.kinkai = sprite(['................', '................', '................', '.....kkkkkk.....', '....kWYYYYYk....', '...kWYYYYYYYk...', '..kYYYYYYYYYYk..', '..kDDDDDDDDDDk..', '..kkkkkkkkkkkk..', '................'],
  { k: '#5a3a08', W: '#fff4a0', Y: '#f0c040', D: '#b08010' });
S.kin_tamago = sprite(['................', '......kkkk......', '.....kWYYYk.....', '....kWYYYYYk....', '....kYYYYYYk....', '...kYYYYYYYYk...', '...kYYYYYYYDk...', '...kYYYYYYDDk...', '....kYYYDDDk....', '.....kkkkkk.....'],
  { k: '#5a3a08', W: '#fff4a0', Y: '#f0c040', D: '#b08010' });
