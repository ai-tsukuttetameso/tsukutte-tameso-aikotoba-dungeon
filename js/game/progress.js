// やりこみの 記録（たおした まもの図鑑・いちばん深く もぐった階。この端末に のこる）
'use strict';

function loadProg() { try { return JSON.parse(localStorage.getItem('aikotoba_prog') || '{}'); } catch (e) { return {}; } }
function saveProg(p) { try { localStorage.setItem('aikotoba_prog', JSON.stringify(p)); } catch (e) {} }
// まもの図鑑：はじめて たおした 種類を おぼえる
function noteKill(t) { const p = loadProg(); p.dex = p.dex || []; if (!p.dex.includes(t)) { p.dex.push(t); saveProg(p); say(`まもの図鑑に「${MON[t].name}」が のった！（${p.dex.length}/${Object.keys(MON).length}）`); } }
function noteDepth(f) { const p = loadProg(); if ((p.deep || 0) < f) { p.deep = f; saveProg(p); } }
// タイトルに 出す まとめ
function progSummary() { const p = loadProg(), clears = loadClears();
  return { dex: (p.dex || []).length, dexAll: Object.keys(MON).length, deep: p.deep || 0, clears: clears.length,
    jobs: [...BASE_JOBS, ...UPPER_JOBS].filter(jobOpen).length, jobsAll: BASE_JOBS.length + UPPER_JOBS.length,
    mastered: [...BASE_JOBS, ...UPPER_JOBS].filter(jobMastered).length }; }
