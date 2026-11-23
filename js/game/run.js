// 冒険の始まり（合言葉・今日のダンジョン・階の移動）
'use strict';

function todayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
const PW_WORDS = ['ねこ', 'いぬ', 'たぬき', 'きつね', 'うさぎ', 'かえる', 'くじら', 'ぺんぎん', 'おにぎり', 'たまご', 'みかん', 'りんご', 'ぱん', 'おもち', 'だんご', 'かれー', 'そら', 'うみ', 'やま', 'もり', 'ほし', 'つき', 'くも', 'かぜ', 'あめ', 'ゆき', 'かいだん', 'とびら', 'たから', 'けん', 'たて', 'つぼ', 'ろぼ', 'きのこ', 'こうもり', 'ぼうし', 'くつ', 'かぎ', 'らんぷ', 'おばけ'];
// 合言葉の ゆれを そろえる（全角半角・カタカナ・空白・「・」の ちがいは 同じに あつかう）
function normPw(s) { return String(s || '').normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/[\s・、,.\-ー_]/g, '').slice(0, 24); }
function randomPw() { const w = () => PW_WORDS[Math.floor(Math.random() * PW_WORDS.length)]; return `${w()}・${w()}・${w()}`; }
// depth＝ダンジョンの深さ（合言葉のときだけ えらべる。ほかは 10階）
const DEPTHS = [10, 20, 30, 50, 100];
// startF＝はじめる 階（10階ごとの 再開ポイント）。preview＝起動したときの タイトルの うしろの 画面（セーブも 冒険者データも さわらない）
let previewRun = false;
function newGame(mode, pw, depth, startF = 1, preview = false) {
  previewRun = preview; const useD = (mode === 'pw' || mode === 'random') && DEPTHS.includes(+depth) ? +depth : 10; P.startF = startF > 1 && startF < useD ? startF : 1;
  runMode = mode === true ? 'daily' : mode === 'pw' ? 'pw' : mode === 'daily' ? 'daily' : 'random';
  daily = runMode === 'daily' ? todayKey() : '';
  password = runMode === 'daily' ? 'きょうの' + daily : runMode === 'pw' ? String(pw).trim().slice(0, 24) : randomPw();
  if (runMode === 'pw' && !normPw(password)) { password = randomPw(); runMode = 'random'; }
  setupDungeon(runMode === 'daily' ? 10 : useD); runDiff = preview ? 'normal' : pickedDiff();
  Object.assign(P, { hp: 30, mhp: 30, mp: 10, mmp: 10, atk: 4, def: 0, lv: 1, exp: 0, food: 100, gold: 0, dir: [0, 1], inv: [{ k: 'bread', traits: [] }, { k: 'herb', traits: [] }, { k: 'sword', plus: 0, traits: [] }, { k: 'arrow', n: 5, traits: [] }], turn: 0, skip: 0, furi: 0, bunshin: 0, teppeki: 0, loadAcc: 0, karuT: 0, heavyTold: false, mikiri: 0, charge: 0, backF: 0, known: new Set(), visits: {}, cause: '', wasInShop: false, pinch: false });
  const banked = preview ? null : bankSuspended(); applyJobStart(); const carried = preview ? 0 : applyHeroStart();
  logs.length = 0; logAll.length = 0; enterFloor(P.startF); say(runMode === 'daily' ? `今日のダンジョン（${daily}）に 入った。だれが遊んでも 同じ地図だ。` : `合言葉「${password}」の 地下${LAST}階ダンジョンに 入った。同じ合言葉なら、だれでも 同じダンジョンだ。`); say(`職業は「${jobOf().name}」。わざは Mキーか「わざ」ボタンで 見られる。`); if (banked !== null) say(`中断していた 冒険の 装備（${banked}こ）と お金・レベルを 冒険者データに のこした。`); if (P.lv > 1 || carried) say(`冒険者データを ひきついだ：Lv${P.lv}・${P.gold}G${carried ? `・装備 ${carried}こ` : ''}。`); if (G.f > 1) say(`地下${G.f}階から 再開した。`); hideOver();
  if (runDiff !== 'normal') say(`裏モード「${diffTag(runDiff)}」：${diffOf(runDiff)[5]}。`);
  if (treasure) { say('ここは「おたからダンジョン」！ レアな 道具や お金が 見つかりやすい。'); showBanner('おたからダンジョン！', 'レアな 道具が 出やすい'); } }
// 合言葉（password）と 深さから、ダンジョンの たね・おたからかどうか・道具の 仮の名前を きめる
function setupDungeon(depth) {
  LAST = depth;
  // 10階の ときは いままでと 同じ地図に なるよう、深さは 10階以外の ときだけ たねに まぜる
  runSeed = hashSeed('pw:' + normPw(password) + (LAST !== 10 ? ':' + LAST : '')); seed = hashSeed(runSeed); rnd();
  // おたからダンジョン：合言葉で きまる（8つに 1つくらい）。同じ合言葉なら だれでも 同じ
  treasure = hashSeed('kind:' + normPw(password)) % 8 === 0; if (curSecret() && curSecret().treasure) treasure = true;
  shuffleFake(); }
// もどりの まほうじん：スタートの 部屋で、スタートに いちばん 近い あいている マスに おく
function placePortal(to) { const r = G.rooms ? G.rooms[0] : null, s = G.start; let best = null, bd = 1e9;
  if (r) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { if (x === s.x && y === s.y) continue;
    if (G.items.some(o => o.x === x && o.y === y) || G.traps.some(o => o.x === x && o.y === y) || G.mons.some(o => o.x === x && o.y === y) || (G.stairs.x === x && G.stairs.y === y) || (G.shop && G.shop.x === x && G.shop.y === y) || (G.npc && G.npc.x === x && G.npc.y === y)) continue;
    const d = Math.abs(x - s.x) + Math.abs(y - s.y); if (d < bd) { bd = d; best = { x, y }; } }
  G.portal = best ? { ...best, to } : null; }
function enterFloor(f) {
  if (typeof mmw !== 'undefined') mmw.classList.remove('big');
  const unpaid = P.inv.filter(o => o.unpaid); if (unpaid.length) { for (const o of unpaid) delete o.unpaid; say('お金を はらわずに にげきった……！'); }
  P.buffAtk = 0; G = genFloor(f); P.x = G.start.x; P.y = G.start.y; if (jobHas('trapper')) for (const t of G.traps) t.found = true; P.wasInShop = false; reveal();
  if (hasTrait('takarami')) { for (const o of G.items) G.seen[o.y][o.x] = true; say('たからみ：この階の 道具の 場所が わかった。'); }
  if (hasTrait('chizu')) { G.seen[G.stairs.y][G.stairs.x] = true; say('ちずよみ：この階の 階段の 場所が わかった。'); }
  if (f !== 1) P.backF = 0; else if (P.backF > 1) placePortal(P.backF);
  if (G.shop) say('この階には「AIかじや」が いるらしい。');
  if (!previewRun) announceFloor(f);
  if (f === LAST) { showBanner('でかこわの王の階', 'たおせば クリア'); shake(8); sfx('boss'); }
  if (!previewRun) { noteDepth(f); noteCheckpoint(f); markFloorStart(); }
}
// ===== 10階ごとの 再開ポイント（合言葉と 深さごとに、とどいた いちばん 深い 10の倍数の 階） =====
const cpKey = (pw, depth) => 'aikotoba_cp_' + normPw(pw) + '_' + depth;
function loadCp(pw, depth) { try { return +localStorage.getItem(cpKey(pw, depth)) || 0; } catch (e) { return 0; } }
function noteCheckpoint(f) { if (f % 10 || f > LAST || loadCp(password, LAST) >= f) return; try { localStorage.setItem(cpKey(password, LAST), f); } catch (e) {} say(`★ 地下${f}階に とうたつ！ つぎから この ダンジョンは 地下${f}階から 再開できる。`); }
// えらべる スタートの 階（1階 と 10・20・…）
const cpFloors = (pw, depth) => { const c = loadCp(pw, depth), out = [1]; for (let f = 10; f <= c; f += 10) out.push(f); return out; };
