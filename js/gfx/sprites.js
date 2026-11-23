// ドット絵（文字の並びから 絵を作る）
'use strict';

// ===== ドット絵 =====
const TS = 16;
function sprite(rows, pal, outline = '#140c1c') {
  const h = rows.length, w = rows[0].length, c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2;
  const g = c.getContext('2d'); const op = new Set();
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.' && pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x + 1, y + 1, 1, 1); op.add((x + 1) + ',' + (y + 1)); } }));
  if (outline) { g.fillStyle = outline;
    for (let y = 0; y < h + 2; y++) for (let x = 0; x < w + 2; x++) { if (op.has(x + ',' + y)) continue;
      if (op.has((x + 1) + ',' + y) || op.has((x - 1) + ',' + y) || op.has(x + ',' + (y + 1)) || op.has(x + ',' + (y - 1))) g.fillRect(x, y, 1, 1); } }
  return c;
}
const S = {};
// 主人公（職業ごとの 見た目は js/gfx/sprites_jobs.js で この形と 色を もとに つくる）
const HERO_ROWS = [

'.....rrrrr......','....rRRRRRr.....','...rRRWRRRRrw...','...RRRRRRRRRww..','...hSSSSSSSh....','...SSeSSSeSS....','...SSSSSSSSS....',
'....SSSmmSS.....','...bBBBBBBBb....','..SbBBBYBBBbS...','..SbBBBBBBBbS...','...bBBBBBBBb....','....LL...LL.....','....LL...LL.....','...FFF...FFF....'];
const HERO_PAL = {r:'#8a1c2a',R:'#d8343f',W:'#ff8a7a',w:'#b0283a',h:'#3a2418',S:'#f4c49a',e:'#1a1020',m:'#d86a6a',b:'#1f3a8a',B:'#3a6ad8',Y:'#f0c040',L:'#5a3a28',F:'#2a1c18'};
S.hero = sprite(HERO_ROWS, HERO_PAL);
S.kinoko = sprite([
'................','....rrrrrrr.....','..rrRRRRRRRrr...','.rRRWWRRRRWWRr..','.rRRWWRRRRWWRr..','rRRRRRRRRRRRRRr.','rRWWRRRRRRRWWRr.','.rrrrrrrrrrrrr..',
'...cCCCCCCCc....','...CCeCCCeCC....','...CCCCCCCCC....','...CCCmmmCCC....','....cCCCCCc.....','...cc.....cc....'],
{r:'#8a1c4a',R:'#e0406a',W:'#ffe8f0',c:'#c8a880',C:'#f0dcc0',e:'#1a1020',m:'#a03040'});
S.bat = sprite([
'................','.p............p.','pp....p..p....pp','pPp..pPPPPp..pPp','pPPp.PPPPPP.pPPp','pPPPpPYPPYPpPPPp','pPPPPPPPPPPPPPPp','pPpPPPPWWPPPPpPp','pP..pPPPPPPp..Pp','p....pPPPPp....p','.......pp.......'],
{p:'#3a1a5a',P:'#7a4ab8',Y:'#ffe14d',W:'#ffffff'});
S.cat = sprite([
'..k.........k...','.kOk.......kOk..','.kOOk.....kOOk..','.kOOOOOOOOOOOk..','kOOOOOOOOOOOOOk.','kOOeOOOOOOOeOOk.','kOOOOOOpOOOOOOk.','kOOwOOOOOOOwOOk.','.kOOOOOOOOOOOk..',
'..kOOOOOOOOOk...','..kOOWWWWWOOk...','..kOOWWWWWOOk...','...kOOk.kOOk....','...kkk...kkk....'],
{k:'#5a3a20',O:'#e8a050',e:'#1a1020',p:'#e86a8a',w:'#ffd0d0',W:'#fff4e0'}, '#140c1c');
S.robo = sprite([
'......a.........','......A.........','..gggggggggg....','..gGGGGGGGGg....','..gGRRGGRRGg....','..gGRRGGRRGg....','..gGGGGGGGGg....','..gGkGkGkGGg....','..gggggggggg....',
'.ddDDDDDDDDdd...','dDDDDBBDDDDDDd..','dD.DDBBDDDD.Dd..','...DDDDDDDD.....','...dd....dd.....','..ddd....ddd....'],
{a:'#ff3b3b',A:'#c0c8d8',g:'#5a6478',G:'#b8c4d8',R:'#ff3b3b',k:'#2a3040',d:'#3a4458',D:'#7a8aa8',B:'#4fd1ff'});
// でかこわ（32×32、でかくてこわい）
S.dekakowa = sprite([
'........hh............hh........','.......hHh............hHh.......','......hHh..............hHh......','.....hHh....kkkkkkkk....hHh.....','....hHh...kkKKKKKKKKkk...hHh....','....hh...kKKKKKKKKKKKKk...hh....',
'........kKKKKKKKKKKKKKKk........','.......kKKKKKKKKKKKKKKKKk.......','.......kKKEEKKKKKKKKEEKKk.......','......kKKKEeEKKKKKKEeEKKKk......','......kKKKEEKKKKKKKKEEKKKk......','......kKKKKKKKKKKKKKKKKKKk......',
'......kKKKKKMMMMMMMMMKKKKKk.....','......kKKKKMtMtMtMtMtMKKKk......','......kKKKKMMMMMMMMMMMKKKk......','......kKKKKKMtMtMtMtMKKKKk......','.......kKKKKKMMMMMMMKKKKk.......','.....kkkKKKKKKKKKKKKKKKKkkk.....',
'...kkKKKKKKKKKKKKKKKKKKKKKKkk...','..kKKKkKKKKKKKKKKKKKKKKKKkKKKk..','.kKKKk.kKKKKKKKKKKKKKKKKk.kKKKk.','.kKKk..kKKKKKKKKKKKKKKKKk..kKKk.','.ccc...kKKKKKKKKKKKKKKKKk...ccc.','.c.c...kKKKKKKKKKKKKKKKKk...c.c.',
'.......kKKKKKKKkkKKKKKKKk.......','.......kKKKKKKk..kKKKKKKk.......','.......kKKKKKk....kKKKKKk.......','......kKKKKKKk....kKKKKKKk......','.....ccccccccc....ccccccccc.....'],
{h:'#8a8070',H:'#e8e0d0',k:'#2a0a20',K:'#6a1a4a',E:'#ffe14d',e:'#ff3030',M:'#1a0410',t:'#f0ece0',c:'#d8d0c0'});
S.bread = sprite(['................','................','................','....wwwwwww.....','...wWWWWWWWw....','..wWWWWWWWWWw...','..wWWWWWWWWWw...','..pqqqqqqqqqp...','..pQQQQQQQQQp...','..pQQqQQQqQQp...','..pppppppppp....'],
{w:'#d8d8d0',W:'#ffffff',p:'#5a3020',q:'#a05a30',Q:'#d08a40'});
S.herb = sprite(['................','.......g........','......gGg.......','...g..gGg..g....','..gGg.gGg.gGg...','..gGGggGggGGg...','...gGGGGGGGg....','....gGGGGGg.....','......bbb.......','......bbb.......'],
{g:'#1f7a3a',G:'#5ad06a',b:'#7a5030'});
S.sticker = sprite(['................','................','....pppppp......','...pPPPPPPp.....','..pPWPPPPPPp....','..pPPPPPPPPp....','..pPPPPPPPPp....','..pPPPPPPPPp....','...pPPPPPPp.....','....pppppp......'],
{p:'#c04a9a',P:'#ff9ad8',W:'#ffffff'});
S.charm = sprite(['......yyy.......','.....y...y......','.....y...y......','......yyy.......','.......y........','.....rrrrr......','....rRRRRRr.....','....rRWRRRr.....','....rRRRRRr.....','.....rRRRr......','......rRr.......','.......r........'],
{y:'#ffd23f',r:'#a01a3a',R:'#ff5a7a',W:'#ffffff'});
S.sword = sprite(['...............w','..............wW','.............wWw','............wWw.','...........wWw..','..........wWw...','.....y...wWw....','.....yy.wWw.....','......yyWw......','.....bYyy.......','....bb.yy.......','...bb...y.......'],
{w:'#8898b8',W:'#e8f0ff',y:'#b08030',Y:'#f0c040',b:'#5a3a28'});
S.shield = sprite(['................','...ssssssssss...','...sSSSSSSSSs...','...sSSRRRRSSs...','...sSSRWRRSSs...','...sSSRRRRSSs...','...sSSSSSSSSs...','....sSSSSSSs....','.....sSSSSs.....','......ssss......'],
{s:'#5a6a8a',S:'#c0cce0',R:'#d83a3a',W:'#ffffff'});
S.gold = sprite(['................','................','.....yyyy.......','....yYYYYy......','...yYWYYYYy.....','...yYYyyYYy.....','...yYYyyYYy.....','...yYYYYYYy.....','....yYYYYy......','.....yyyy.......'],
{y:'#a06a10',Y:'#ffd23f',W:'#fff8c0'});
S.stairs = sprite(['kkkkkkkkkkkkkkkk','kGGGGGGGGGGGGGGk','kgggggggggggggGk','kkkkGGGGGGGGGGGk','kkkkgggggggggggk','kkkkkkkGGGGGGGGk','kkkkkkkggggggggk','kkkkkkkkkkGGGGGk','kkkkkkkkkkgggggk','kkkkkkkkkkkkkGGk','kkkkkkkkkkkkkggk','kkkkkkkkkkkkkkkk'],
{k:'#100a18',G:'#d8d0c0',g:'#8a8070'}, null);
// わな（見つかったあとの絵）
S.t_spike = sprite(['................','..w...w...w.....','.wW..wW..wW.....','.WW..WW..WW.....','................','....w...w...w...','...wW..wW..wW...','...WW..WW..WW...'],{w:'#8a90a0',W:'#e0e8f0'},null);
S.t_hole = sprite(['....kkkkkkk.....','..kkKKKKKKKkk...','.kKKKKKKKKKKKk..','kKKKKKKKKKKKKKk.','.kKKKKKKKKKKKk..','..kkKKKKKKKkk...','....kkkkkkk.....'],{k:'#3a2a3a',K:'#05030a'},null);
S.t_heat = sprite(['..r...r...r.....','.rR..rR..rR.....','.RO..RO..RO.....','.OY..OY..OY.....','rRR.rRR.rRR.....','ROO.ROO.ROO.....'],{r:'#a01010',R:'#ff4a2a',O:'#ff9a2a',Y:'#ffe14d'},null);
S.t_ticket = sprite(['.bbbbbbbbbbbb...','.bWWWWWWWWWWb...','.bWbbbWbbbWWb...','.bWWWWWWWWWWb...','.bWbbWbbbbWWb...','.bbbbbbbbbbbb...'],{b:'#1f5ad8',W:'#e8f0ff'},null);
S.t_nisa = sprite(['g...............','gg..............','g.g.......r.....','g..g.....rr.....','g...g...r.r.....','g....g.r..r.....','g.....r...r.....','gggggggggggggggg'],{g:'#8a90a0',r:'#ff3a3a'},null);
S.t_start = sprite(['....rrrrrr......','..rr......rr....','.r..yyy.yy..r...','r..y...y.y...r..','r..y...y.y...r..','r...yyy..yyy.r..','.r..........r...','..rr......rr.r..','....rrrrrr..rr..'],{r:'#ff3a6a',y:'#ffe14d'},null);
S.t_cat = sprite(['...k.....k......','..kOk...kOk.....','..kOOOOOOOk.....','..kOeOOOeOk.....','..kOOOpOOOk.....','...kOOOOOk......','.....k.k........'],{k:'#5a3a20',O:'#e8a050',e:'#1a1020',p:'#e86a8a'},null);
S.clerk = sprite([
'.....yyyy.......','....yYYYYy......','...gggggggg.....','...gGBGGBGg.....','...gGGGGGGg.....','...gGGmmGGg.....','....gggggg......',
'..wwWWWWWWww....','.SwWWWyyWWWwS...','.SwWWWWWWWWwS...','..wWWWWWWWWw....','...WWW..WWW.....','...dd....dd.....','..ddd....ddd....'],
{y:'#a06a10',Y:'#ffd23f',g:'#4a8a7a',G:'#a8e0d0',B:'#1a3a5a',m:'#e86a8a',w:'#c07a30',W:'#f0b060',S:'#a8e0d0',d:'#3a4458'});
S.clerk_angry = (() => { const c = document.createElement('canvas'); c.width = S.clerk.width; c.height = S.clerk.height; const x = c.getContext('2d'); x.drawImage(S.clerk, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(255,30,30,.5)'; x.fillRect(0, 0, c.width, c.height); return c; })();
S.rat = sprite(['................','..kk.......kk...','.kPPk.....kPPk..','.kPGGGGGGGGPk...','..GGGGGGGGGGG...','.GGeGGGGGGeGG...','.GGGGGpGGGGGG...','..GGGGGGGGGG....','..bbGGGGGGbb.t..','.bBBBBBBBBBBbtt.','..bBBBBBBBBb..t.','...dd....dd.....'],
{k:'#4a3a4a',P:'#e88aa8',G:'#9a9aaa',e:'#1a1020',p:'#e86a8a',b:'#2a2a3a',B:'#4a4a5a',t:'#c08aa0',d:'#2a2030'});
S.arrow = sprite(['................','.............ww.','............wWw.','...........wWw..','..........bw....','.........b......','........b.......','.......b........','..f...b.........','..ff.b..........','...fb...........','..f.f...........'],{w:'#8898b8',W:'#e8f0ff',b:'#c08a50',f:'#e0e0e0'});
S.grass = sprite(['................','......g...g.....','.....gGg.gGg....','..g..gGg.gGg..g.','.gGg.gGggGGg.gGg','..gGGgGGGGGgGGg.','...gGGGGGGGGGg..','.....gGGGGGg....','.......bb.......','.......bb.......'],{g:'#3a5a8a',G:'#8ab0f0',b:'#6a4a30'});
S.scroll = sprite(['................','..bbbbbbbbbb....','.bWWWWWWWWWWb...','.bWrrWWWWWWWb...','.bWWWWkkkkWWb...','.bWWWWWWWWWWb...','.bWWkkkkWWWWb...','.bWWWWWWWWWWb...','.bWWWWkkkWWWb...','..bbbbbbbbbb....'],{b:'#a08050',W:'#f4ecd0',r:'#d83a3a',k:'#5a4a3a'});
S.wand = sprite(['............yy..','...........yYYy.','...........yYYy.','..........b.yy..','.........b......','........b.......','.......b........','......b.........','.....b..........','....b...........','...b............'],{b:'#8a5a30',y:'#a03ad8',Y:'#e0a0ff'});
S.bag = sprite(['................','......kkk.......','.....k...k......','....bbbbbbb.....','...bBBBBBBBb....','..bBBWBBBBBBb...','..bBBBBBBBBBb...','..bBBBYYBBBBb...','..bBBBYYBBBBb...','..bBBBBBBBBBb...','...bBBBBBBBb....','....bbbbbbb.....'],{k:'#c09060',b:'#6a4020',B:'#b07a40',W:'#e8c090',Y:'#ffd23f'});
S.omamori = sprite(['.......y........','......y.y.......','.....rrrrr......','....rRRRRRr.....','....rRYYYRr.....','....rRYRYRr.....','....rRYYYRr.....','....rRRRRRr.....','....rRWWWRr.....','....rRRRRRr.....','....rrrrrrr.....'],{y:'#ffd23f',r:'#7a1020',R:'#e83a4a',Y:'#ffe14d',W:'#ffffff'});
// 床と壁
function tileCanvas(fn) { const c = document.createElement('canvas'); c.width = c.height = TS; fn(c.getContext('2d')); return c; }
const FLOOR = [], CORR = [];
for (let v = 0; v < 4; v++) {
  FLOOR.push(tileCanvas(g => { g.fillStyle = '#4a3e52'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#56495e'; g.fillRect(1, 1, 6, 6); g.fillRect(9, 1, 6, 6); g.fillRect(1, 9, 6, 6); g.fillRect(9, 9, 6, 6);
    g.fillStyle = '#62546a'; g.fillRect(1, 1, 6, 1); g.fillRect(9, 1, 6, 1); g.fillRect(1, 9, 6, 1); g.fillRect(9, 9, 6, 1);
    g.fillStyle = '#3a3042'; for (let k = 0; k < 5 + v; k++) g.fillRect(ri(0, 15), ri(0, 15), 1, 1);
    if (v === 3) { g.fillStyle = '#2f6a3a'; g.fillRect(3, 12, 2, 1); g.fillRect(4, 11, 1, 1); } }));
  CORR.push(tileCanvas(g => { g.fillStyle = '#3a3040'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#463a4c';
    for (let k = 0; k < 10; k++) g.fillRect(ri(0, 14), ri(0, 14), 2, 1); }));
}
const WALL_TOP = tileCanvas(g => { g.fillStyle = '#1a1424'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#241c30'; for (let k = 0; k < 6; k++) g.fillRect(ri(0, 14), ri(0, 14), 2, 2); });
const WALL_FRONT = [0, 1].map(v => tileCanvas(g => { g.fillStyle = '#6a5a72'; g.fillRect(0, 0, 16, 16);
  g.fillStyle = '#2a2232'; for (const y of [0, 5, 10, 15]) g.fillRect(0, y, 16, 1);
  for (let r = 0; r < 3; r++) { const off = r % 2 ? 4 : 0; for (let x = off; x < 16; x += 8) g.fillRect(x, r * 5 + 1, 1, 4); }
  g.fillStyle = '#8a7a92'; for (let r = 0; r < 3; r++) { const off = r % 2 ? 4 : 0; for (let x = off; x < 16; x += 8) g.fillRect(x + 1, r * 5 + 1, 6, 1); }
  g.fillStyle = '#a898b0'; g.fillRect(0, 0, 16, 1); if (v) { g.fillStyle = '#3a7a4a'; g.fillRect(2, 14, 3, 1); g.fillRect(3, 13, 1, 1); } }));
const TORCH = sprite(['..Y..','.YOY.','.ROR.','..R..','..b..','..b..','.bbb.'], {Y:'#fff4a0',O:'#ffb02a',R:'#ff5a1a',b:'#5a3a20'}, null);
