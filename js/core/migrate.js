// 記録の 名前の ひっこし（いちばん はじめに 読みこむ）
'use strict';

// 作りはじめの ころは 記録の 名前が「rifujin_」で はじまっていた。いまは「aikotoba_」
// 古い 名前の 記録が あれば 新しい 名前に うつして、古い ほうは けす（いままでの 記録は そのまま つかえる）
const OLD_PREFIX = 'rifujin_', SAVE_PREFIX = 'aikotoba_';
(function migrateKeys() { try { const old = [];
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(OLD_PREFIX)) old.push(k); }
  for (const k of old) { const nk = SAVE_PREFIX + k.slice(OLD_PREFIX.length); if (localStorage.getItem(nk) === null) localStorage.setItem(nk, localStorage.getItem(k)); localStorage.removeItem(k); }
} catch (e) {} })();
