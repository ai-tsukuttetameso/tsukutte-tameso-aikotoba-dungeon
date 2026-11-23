// 防具の 絵（あたま・うで・あし）
'use strict';

// ===== ぼうし・かぶと =====
const HELM_ROWS = ['................', '................', '.....hhhhhh.....', '....hHHHHHHh....', '...hHHWHHHHHh...', '...hHHWHHHHHh...', '...hHHHHHHHHh...', '..hhhhhhhhhhhh..', '..hHHHHHHHHHHh..', '...hhhhhhhhhh...', '................'];
S.helm = sprite(HELM_ROWS, { h: '#5a3a20', H: '#a06a3a', W: '#d8a070' });
S.helm2 = sprite(['................', '.......HH.......', '.....hhHHhh.....', '....hHHHHHHh....', '...hHHWHHHHHh...', '...hHWWHHHHHh...', '...hHHHHHHHHh...', '..hhhhhhhhhhhh..', '..hHHHyHHyHHHh..', '...hhhhhhhhhh...', '................'],
  { h: '#4a5060', H: '#a8b0c0', W: '#eef2ff', y: '#4a5060' });
S.mhat = sprite(['.........hh.....', '........hHh.....', '.......hHHh.....', '......hHHHh.....', '.....hHHWHHh....', '....hHHHWHHHh...', '....hHHHHHHHh...', '..hhhhhhhhhhhhh.', '..hYYYYYYYYYYYh.', '...hhhhhhhhhhh..', '................'],
  { h: '#2a1050', H: '#6a3ac8', W: '#c0a0ff', Y: '#f0c040' });
S.helm_r = sprite(['...W........W...', '...hW......Wh...', '....hhhhhhhh....', '...hHHHHHHHHh...', '..hHHWHHHHHHHh..', '..hHWWHHRRHHHh..', '..hHHHHHRRHHHh..', '.hhhhhhhhhhhhhh.', '.hHHHyHHHHyHHHh.', '..hhhhhhhhhhhh..', '................'],
  { h: '#8a6010', H: '#f0c040', W: '#fff4a0', R: '#e5484d', y: '#8a6010' });
// ===== こて（うで） =====
S.glove = sprite(['................', '......hhhh......', '.....hHHHHh.....', '.....hHWHHh.h...', '.....hHWHHhhHh..', '.....hHHHHHHHh..', '.....hHHHHHHh...', '.....hhhhhhh....', '.....hYYYYYh....', '.....hYYYYYh....', '.....hhhhhhh....'],
  { h: '#5a3a20', H: '#a06a3a', W: '#d8a070', Y: '#7a4a28' });
S.glove2 = sprite(['................', '......hhhh......', '.....hHHHHh.....', '.....hHWHHh.h...', '.....hHWHHhhHh..', '.....hHHHHHHHh..', '.....hHHHHHHh...', '.....hhhhhhh....', '.....hYYYYYh....', '.....hYWYYYh....', '.....hhhhhhh....'],
  { h: '#4a5060', H: '#a8b0c0', W: '#eef2ff', Y: '#6a7080' });
// ===== くつ（あし） =====
S.boots = sprite(['................', '................', '....hhhh........', '....hHHh........', '....hHWh........', '....hHWh........', '....hHHhhhh.....', '....hHHHHHHh....', '....hHHHHHHHh...', '....hhhhhhhhh...', '................'],
  { h: '#4a2a18', H: '#8a5a30', W: '#c08a58' });
S.boots2 = sprite(['................', '..w.............', '.wWhhhh.........', '..whHHh.........', '....hHWh........', '....hHWh........', '....hHHhhhh.....', '....hHHHHHHh....', '....hHHHHHHHh...', '....hYYYYYYYh...', '................'],
  { h: '#14505a', H: '#2a9aa8', W: '#8af0ff', w: '#ffffff', Y: '#f0c040' });
