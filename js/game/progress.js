// やりこみの 記録（たおした まもの図鑑・いちばん深く もぐった階。この端末に のこる）
'use strict';

function loadProg() { try { return JSON.parse(localStorage.getItem('aikotoba_prog') || '{}'); } catch (e) { return {}; } }
function saveProg(p) { try { localStorage.setItem('aikotoba_prog', JSON.stringify(p)); } catch (e) {} }
// まもの図鑑：はじめて たおした 種類を おぼえる
function noteKill(t) { progAdd('kills', t); const p = loadProg(); p.dex = p.dex || []; if (!p.dex.includes(t)) { p.dex.push(t); saveProg(p); say(`まもの図鑑に「${MON[t].name}」が のった！（${p.dex.length}/${Object.keys(MON).length}）`); } }
function noteDepth(f) { const p = loadProg(); if ((p.deep || 0) < f) { p.deep = f; saveProg(p); } }
// タイトルに 出す まとめ
function progSummary() { const p = loadProg(), clears = loadClears();
  return { dex: (p.dex || []).length, dexAll: Object.keys(MON).length, deep: p.deep || 0, clears: clears.length,
    jobs: ALL_JOBS.filter(jobOpen).length, jobsAll: ALL_JOBS.length,
    mastered: ALL_JOBS.filter(jobMastered).length }; }

// ===== コレクション =====
// 見た まもの・たおした 数・手に入れた 道具・使った 回数・ついていた 特性・おぼえた わざ・使った わざを おぼえる
// 1手ごとに 書くと おそいので、ためておいて ターンの おわりに まとめて 書く（progFlush）
let _progQ = null; const _progHas = {};
function progAdd(cat, key, n = 1) { _progQ = _progQ || {}; const c = _progQ[cat] = _progQ[cat] || {}; c[key] = (c[key] || 0) + n; }
function progFlush() { if (!_progQ) return; const p = loadProg();
  for (const [cat, o] of Object.entries(_progQ)) { p[cat] = p[cat] || {}; for (const [k, n] of Object.entries(o)) p[cat][k] = (p[cat][k] || 0) + n; }
  _progQ = null; saveProg(p); }
// 1回 のれば いい もの（見た・手に入れた など）
function progMark(cat, key) { const s = _progHas[cat] = _progHas[cat] || new Set(Object.keys(loadProg()[cat] || {})); if (s.has(key)) return; s.add(key); progAdd(cat, key); }
function progForget() { for (const k of Object.keys(_progHas)) delete _progHas[k]; _progQ = null; }  // 記録を 読みこんだ・けした とき
// ターンの おわりに よぶ：いま 見えている 敵・もちもの・おぼえている わざを のせる
function noteTurn() {
  for (const m of G.mons) if (visible(m.x, m.y)) progMark('seen', m.t);
  const look = o => { if (!isKnown(o.k)) return; progMark('found', o.k); for (const t of o.traits || []) progMark('traits', t); };
  for (const o of P.inv) { look(o); if (o.items) o.items.forEach(look); }
  for (const s of mySkills()) if (P.lv >= s.lv) progMark('learned', s.id);
  progFlush(); }
