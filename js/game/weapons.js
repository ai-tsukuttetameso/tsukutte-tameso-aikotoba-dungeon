// 武器ごとの こうげきの しかた（やり・つえ・むち・ブーメラン）
'use strict';

// まほうの 強さの 倍率（まほうのつえを そうびして まほう・杖・おふだを 使う あいだだけ 1.5）
let magicPower = 1;
const weaponType = () => { const w = eqItem('atk'); return (w && ITEMS[w.k].weapon) || 'sword'; };
function withMagic(fn) { const w = eqItem('atk'); magicPower = (weaponType() === 'staff' ? (w && ITEMS[w.k].magic) || 1.5 : 1) * jobMagic(); try { return fn(); } finally { magicPower = 1; } }

// 向いている方向に n マス しらべて、敵を あつめる（all＝つらぬく）
function lineTargets(n, all) { const [dx, dy] = P.dir; const out = [], path = []; let x = P.x, y = P.y;
  for (let i = 0; i < n; i++) { if (dx && dy && (!isFloor(x + dx, y) || !isFloor(x, y + dy))) break; x += dx; y += dy; if (!isFloor(x, y) || blockedAt(x, y)) break;
    path.push([x, y]); const m = monAt(x, y); if (m) { out.push(m); if (!all) break; } }
  return { out, path }; }
const WEAPON_REACH = { sword: [1, false], spear: [2, true], whip: [2, false], staff: [5, false], boomerang: [4, true] };

// 武器で こうげきする。当たる敵が いなければ false
function weaponAttack(normal = false) { const t = weaponType(), [n, all] = WEAPON_REACH[t]; const { out, path } = lineTargets(n, all);
  if (!out.length) return false;
  if (t === 'spear' && out.length > 1) say('やりで まとめて つらぬいた！');
  if (t === 'staff') { fx(path.slice(0, path.findIndex(([x, y]) => x === out[0].x && y === out[0].y) + 1), '#b06aff'); sfx('zap'); say('まほうの たまを とばした！'); }
  if (t === 'boomerang') { fx(path, '#f0a050'); say('ブーメランを 投げた！'); }
  for (const m of out) { attack(m, t === 'boomerang' ? .8 : 1, normal);
    if (t === 'whip' && G.mons.includes(m) && rnd() < ((eqItem('atk') && ITEMS[eqItem('atk').k].stun) || .3)) { m.stuck = Math.max(m.stuck || 0, 1); say(`${m.name}は ひるんだ！`); } }
  if (t === 'boomerang') say('ブーメランが もどってきた。');
  return true; }
// F キー・「こうげき」ボタン：その場で 向いている方向に こうげき
function attackFront() { if (G.over) return; if (P.skip > 0) { act(0, 0); return; }
  if (weaponAttack()) { endTurn(); return; }
  const t = weaponType(); say(t === 'staff' || t === 'boomerang' ? 'その方向に 敵が いない。' : '目の前に 敵が いない。（Fは 向いている方向に こうげき）'); render(); }
