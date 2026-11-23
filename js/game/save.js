// セーブ（この端末に 保存）と「ふっかつの合言葉」（文字の列に して どこでも 再開できる）
'use strict';

// セーブは「いまの階の はじめ」の 状態を のこす。もどすと 同じ地図の その階から 再開する
const SAVE_KEY = 'aikotoba_save', CODE_HEAD = 'RF1';
let floorStart = null;  // 階に 入った しゅんかんの 状態（enterFloor の あとに とる）

function snapshot() {
  const inv = P.inv.map(o => { const c = JSON.parse(JSON.stringify(o)); delete c.unpaid; return c; });
  return { v: 1, mode: runMode, pw: password, daily, depth: LAST, diff: runDiff, f: G.f, seed,
    p: { hp: P.hp, mhp: P.mhp, mp: P.mp, mmp: P.mmp, atk: P.atk, def: P.def, lv: P.lv, exp: P.exp, food: P.food, gold: P.gold, turn: P.turn, job: P.job, startF: P.startF || 1, furi: P.furi || 0, backF: P.backF || 0, inv },
    known: [...P.known], visits: { ...P.visits } }; }
// 階に 入るたびに よぶ：その時点を おぼえて、この端末にも 自動で セーブする
function markFloorStart() { if (G.over) return; floorStart = snapshot(); writeLocalSave(floorStart); }
function writeLocalSave(s) { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ at: Date.now(), s })); } catch (e) {} }
function readLocalSave() { try { const j = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return j && j.s && j.s.v === 1 ? j : null; } catch (e) { return null; } }
function clearLocalSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

// セーブデータから 再開する
function restoreSave(s) {
  previewRun = false;
  runMode = s.mode; password = s.pw; daily = s.daily || ''; runDiff = diffOf(s.diff)[0]; setupDungeon(s.depth);
  Object.assign(P, { dir: [0, 1], skip: 0, cause: '', wasInShop: false, pinch: false, furi: 0, backF: 0, loadAcc: 0, karuT: 0, heavyTold: false }, s.p, { inv: s.p.inv, known: new Set(s.known), visits: { ...s.visits } });
  P.visits[s.f] = (P.visits[s.f] || 1) - 1;  // enterFloor で 1 ふえるので、同じ地図に なるよう もどしておく
  logs.length = 0; logAll.length = 0; enterFloor(s.f); seed = s.seed; hideOver();
  say(`つづきから 再開した。（${s.mode === 'daily' ? '今日のダンジョン' : '合言葉「' + s.pw + '」'}・地下${s.f}/${LAST}階・Lv${P.lv}）`); render(); }

// ----- ふっかつの合言葉（セーブを 文字の列に する） -----
// 中身は JSON を ちぢめて（deflate）、URLでも こわれない base64 に したもの。さいごの 4文字は 打ちまちがい チェック用
async function makeCode(s) { const bytes = new TextEncoder().encode(JSON.stringify(s));
  const z = await squeeze(bytes, true); const b = b64(z); return CODE_HEAD + b + check(b); }
async function readCode(code) {
  const c = String(code || '').replace(/\s+/g, ''); if (!c.startsWith(CODE_HEAD) || c.length < 12) throw new Error('form');
  const body = c.slice(CODE_HEAD.length, -4); if (check(body) !== c.slice(-4)) throw new Error('check');
  const s = JSON.parse(new TextDecoder().decode(await squeeze(unb64(body), false))); if (!s || s.v !== 1) throw new Error('ver'); return s; }
async function squeeze(bytes, pack) {
  const Stream = pack ? window.CompressionStream : window.DecompressionStream; if (!Stream) throw new Error('nozip');
  const out = new Blob([bytes]).stream().pipeThrough(new Stream('deflate-raw')); return new Uint8Array(await new Response(out).arrayBuffer()); }
function b64(u8) { let s = ''; for (const x of u8) s += String.fromCharCode(x); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64(s) { const t = atob(s.replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(t, ch => ch.charCodeAt(0)); }
function check(s) { return (hashSeed('chk:' + s) % 1679616).toString(36).padStart(4, '0').toUpperCase(); }
