// マップの問い合わせ（床か・敵がいるか・見えているか）
'use strict';

const isFloor = (x, y) => x >= 0 && y >= 0 && x < W && y < H && G.map[y][x] > 0;
const monAt = (x, y) => G.mons.find(m => m.x === x && m.y === y);
const shopAt = (x, y) => G.shop && G.shop.x === x && G.shop.y === y;
function roomOf(x, y) { return G.rooms.find(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h); }
function visible(x, y) { const r = roomOf(P.x, P.y); if (r && x >= r.x - 1 && x <= r.x + r.w && y >= r.y - 1 && y <= r.y + r.h) return true; return Math.max(Math.abs(x - P.x), Math.abs(y - P.y)) <= 1 + (r ? 0 : 1); }
function reveal() { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (visible(x, y)) G.seen[y][x] = true; }
function freeNear(x0, y0) { for (let rr = 0; rr < 4; rr++) for (let y = y0 - rr; y <= y0 + rr; y++) for (let x = x0 - rr; x <= x0 + rr; x++) if (isFloor(x, y) && !G.items.some(o => o.x === x && o.y === y) && !(G.stairs.x === x && G.stairs.y === y) && !shopAt(x, y) && !(G.npc && G.npc.x === x && G.npc.y === y)) return { x, y }; return null; }
