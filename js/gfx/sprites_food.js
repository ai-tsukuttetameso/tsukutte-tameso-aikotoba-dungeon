// お弁当と おにぎりの 絵
'use strict';

// ===== お弁当 =====
// 左に ごはん（W）と うめぼし（R）、右上に おかず A、右下に おかず B。色を かえて いろいろな 弁当に する
const BENTO_ROWS = ['................', '..pppppppppppp..', '..pWWWWWpAAAAp..', '..pWWWWWpAaAAp..', '..pWWRWWpAAAAp..', '..pWWWWWpppppp..', '..pWWWWWpBBBBp..', '..pWWWWWpBbBBp..', '..pppppppppppp..', '..qqqqqqqqqqqq..', '................'];
const bento = pal => sprite(BENTO_ROWS, { p: '#5a3020', q: '#2a1810', W: '#ffffff', R: '#e5484d', ...pal });
S.bento_nori = bento({ W: '#1c2a1c', R: '#3a5a2a', A: '#d08a40', a: '#f0c070', B: '#f0e0a0', b: '#d0b060' });   // のり・ちくわ天・たまご
S.bento_karaage = bento({ A: '#a05a20', a: '#d08a40', B: '#a05a20', b: '#e0a050' });                             // からあげ
S.bento_shake = bento({ A: '#ff8a6a', a: '#ffc0a0', B: '#5aae4a', b: '#8ad07a' });                               // さけ・ほうれんそう
S.bento_curry = bento({ W: '#ffffff', R: '#ffffff', A: '#b0701a', a: '#e0a040', B: '#b0701a', b: '#7a4a10' });   // カレー
S.bento_maku = bento({ A: '#ffe14d', a: '#fff0a0', B: '#ff8a6a', b: '#5aae4a', p: '#2a1a1a', q: '#c0303a' });   // まくのうち（ぬりの 箱）
S.bento_toku = bento({ A: '#ffd23f', a: '#ffffff', B: '#ff6a8a', b: '#ffd23f', p: '#8a6010', q: '#ffd23f' });   // とくせい（金の 箱）
S.onigiri = sprite(['................', '.......WW.......', '......WWWW......', '.....WWWWWW.....', '....WWWWWWWW....', '...WWWWWWWWWW...', '..WWWNNNNNNWWW..', '..WWNNNNNNNNWW..', '...NNNNNNNNNN...', '................'],
  { W: '#ffffff', N: '#1c2a1c' });
