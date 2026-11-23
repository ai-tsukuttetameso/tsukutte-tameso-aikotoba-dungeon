// 記録の 書き出し・読みこみ（ほかの 端末へ うつす・念のため のこす）
'use strict';

// ===== しくみ =====
// この ゲームの 記録は ぜんぶ、この ブラウザの localStorage に「aikotoba_」で はじまる 名前で のこっている（core/migrate.js の SAVE_PREFIX）
// （冒険者データ・職業レベル・まもの図鑑・クリアの記録・再開の階・中断の セーブ・設定）
// それを まとめて 1つの 文字列（記録コード）に する。読みこむと この 端末の 記録が その 中身に おきかわる
const BACKUP_HEAD = 'AKD1-', BACKUP_PREFIX = SAVE_PREFIX;
const sumOf = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h.toString(36); };
function toB64(s) { const u = new TextEncoder().encode(s); let b = ''; for (let i = 0; i < u.length; i += 8192) b += String.fromCharCode(...u.subarray(i, i + 8192)); return btoa(b); }
const fromB64 = s => new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0)));
function backupKeys() { const out = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(BACKUP_PREFIX)) out.push(k); } } catch (e) {} return out.sort(); }
// 書き出す：記録コードを かえす
function exportData() { const d = {}; for (const k of backupKeys()) d[k] = localStorage.getItem(k);
  const body = toB64(JSON.stringify({ v: 1, at: Date.now(), d })); return BACKUP_HEAD + sumOf(body) + '-' + body; }
// 読みこむ前に しらべる：{ ok, n, at, msg }
function checkBackup(code) { const s = String(code || '').replace(/\s+/g, '');
  if (!s.startsWith(BACKUP_HEAD)) return { ok: false, msg: '記録コードでは ないようです。（AKD1- で はじまります）' };
  const [sum, body] = s.slice(BACKUP_HEAD.length).split('-'); if (!body || sumOf(body) !== sum) return { ok: false, msg: '記録コードが とちゅうで きれているか、まちがっています。' };
  try { const j = JSON.parse(fromB64(body)); if (!j || typeof j.d !== 'object') throw 0;
    const data = {}; for (const [k, v] of Object.entries(j.d)) { const nk = k.startsWith(OLD_PREFIX) ? BACKUP_PREFIX + k.slice(OLD_PREFIX.length) : k; if (nk.startsWith(BACKUP_PREFIX)) data[nk] = v; }
    const keys = Object.keys(data); return { ok: true, n: keys.length, at: j.at, data, keys }; }
  catch (e) { return { ok: false, msg: '記録コードを 読めませんでした。' }; } }
// 読みこむ：この 端末の 記録を ぜんぶ けして、コードの 中身に おきかえる
function importData(code) { const c = checkBackup(code); if (!c.ok) return c;
  try { for (const k of backupKeys()) localStorage.removeItem(k); for (const k of c.keys) localStorage.setItem(k, String(c.data[k])); }
  catch (e) { return { ok: false, msg: 'この ブラウザでは 記録を 書きこめませんでした。' }; }
  return c; }
