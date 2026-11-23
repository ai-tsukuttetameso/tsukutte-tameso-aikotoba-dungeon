// 称号（やりこみの しるし）と、コレクションの ごほうび（主人公の 色ちがい）
'use strict';

// [id, 名前, 条件の せつめい, 条件（s＝titleStats() の 中身）]
const TITLES = [
  ['first', 'はじめの いっぽ', 'ダンジョンを 1回 クリア', s => s.clears >= 1],
  ['clear10', 'ダンジョン なれっこ', 'ダンジョンを 10回 クリア', s => s.clears >= 10],
  ['deep20', '地下20階の 冒険者', '地下20階まで もぐる', s => s.deep >= 20],
  ['deep50', '地下50階の 冒険者', '地下50階まで もぐる', s => s.deep >= 50],
  ['deep100', 'そこなしの 冒険者', '地下100階まで もぐる', s => s.deep >= 100],
  ['dex10', 'まもの けんきゅうせい', 'まもの図鑑に 10しゅるい のせる', s => s.dex >= 10],
  ['dex50', 'まもの はかせ', 'まもの図鑑に 50しゅるい のせる', s => s.dex >= 50],
  ['dex100', 'まもの だいはかせ', 'まもの図鑑を ぜんぶ うめる', s => s.dex >= s.dexAll],
  ['kill500', 'まもの ハンター', 'まものを あわせて 500体 たおす', s => s.kills >= 500],
  ['item30', '道具 コレクター', '道具と そうびを 30しゅるい 手に入れる', s => s.found >= 30],
  ['evo1', 'しんかの とびら', 'そうびを はじめて しんか させる', s => s.evo >= 1],
  ['evo5', 'しんか マスター', '5しゅるいの そうびに しんか させる', s => s.evo >= 5],
  ['mid1', 'ぬし たおし', 'ぬしを はじめて たおす', s => s.mid >= 1],
  ['mid10', 'ぬし ハンター', 'ぬしを 10回 たおす', s => s.mid >= 10],
  ['rules', 'しかけ めぐり', '6つの 階の しかけを ぜんぶ たいけん', s => s.rules >= RULE_IDS.length],
  ['master5', '職人', '職業を 5つ きわめる', s => s.mastered >= 5],
  ['top1', '最上位への みち', '最上位の 職業に なれるように なる', s => s.top >= 1],
  ['alljobs', 'なんでも できる人', '18の 職業 ぜんぶに なれるように なる', s => s.jobs >= ALL_JOBS.length],
  ['skill300', 'わざの たつじん', 'わざを あわせて 300回 つかう', s => s.skill >= 300],
  ['sound', 'おとの コレクター', 'BGMと 効果音を ぜんぶ 聞く', s => s.heard >= s.heardAll],
  ['secret1', 'ひみつを しる者', 'かくし合言葉を 1つ 見つける', s => s.secret >= 1],
  ['secretAll', 'ひみつの 合言葉 マスター', 'かくし合言葉を ぜんぶ 見つける', s => s.secret >= SECRET_IDS.length],
  ['rich', 'おおがねもち', '冒険者データの お金を 10000G に する', s => s.gold >= 10000],
  ['ura', '裏の 冒険者', '裏モードを ひらく（地下100階を クリア）', s => s.ura],
  ['vhard', 'ベリーハード せいは', '裏モード ベリーハードで ダンジョンを クリア', s => s.vhard >= 1],
  ['complete', 'コンプリート', 'コレクションを 100% に する', s => s.pct >= 100],
];
const sumVals = o => Object.values(o || {}).reduce((a, b) => a + (+b || 0), 0);
function titleStats() { const p = loadProg();
  return { clears: loadClears().length, deep: p.deep || 0, dex: (p.dex || []).length, dexAll: Object.keys(MON).length, kills: sumVals(p.kills),
    found: Object.keys(p.found || {}).length, evo: Object.keys(p.evolved || {}).length, mid: (p.midboss || {}).kills || 0, rules: Object.keys(p.rules || {}).length,
    mastered: ALL_JOBS.filter(jobMastered).length, top: TOP_JOBS.filter(jobOpen).length, jobs: ALL_JOBS.filter(jobOpen).length, skill: sumVals(p.skillUse),
    heard: BGM_LIST.filter(([k]) => (p.heardBgm || {})[k]).length + SE_LIST.filter(([k]) => (p.heard || {})[k]).length, heardAll: BGM_LIST.length + SE_LIST.length,
    secret: Object.keys(p.secret || {}).length, gold: loadHero().gold || 0, pct: colPct(), ura: uraOpen(), vhard: loadClears().filter(r => r.diff === 'vhard').length }; }
// あたらしく とれた 称号を しらべて おしらせ（冒険の おわり・コレクションを ひらいた とき・ときどき）
function checkTitles(quiet) { progFlush(); const p = loadProg(), got = p.titles || {}, s = titleStats(), now = [];
  for (const [id, name, , ok] of TITLES) if (!got[id] && ok(s)) { got[id] = Date.now(); now.push(name); }
  if (now.length) { p.titles = got; saveProg(p); if (!quiet) { for (const n of now) say(`称号「${n}」を 手に入れた！`); if (G && over.hidden) { showBanner('称号を 手に入れた！', now.join('・')); sfx('clear'); } } }
  return now; }
const myTitles = () => loadProg().titles || {};
function wornTitle() { try { const id = localStorage.getItem('aikotoba_title'); const t = TITLES.find(x => x[0] === id); return t && myTitles()[id] ? t[1] : ''; } catch (e) { return ''; } }
function wearTitle(id) { try { if (id) localStorage.setItem('aikotoba_title', id); else localStorage.removeItem('aikotoba_title'); } catch (e) {} }

// ===== コレクションの ごほうび：うめた わりあいで 主人公の 色ちがいが ふえる =====
const SKINS = [
  ['', 'いつもの 色', 0, null],
  ['sora', 'そらいろ', 10, { hue: 180, sat: 1.1 }],
  ['mori', 'もりいろ', 25, { hue: 100, sat: 1.1 }],
  ['honoo', 'ほのおいろ', 50, { hue: -40, sat: 1.4 }],
  ['yami', 'やみいろ', 75, { hue: 250, sat: .8, light: .75 }],
  ['kin', 'きんいろ', 100, { hue: 25, sat: 1.6, light: 1.2 }],
];
// コレクションの うまり ぐあい（称号の タブは 入れない）
function colPct() { let h = 0, a = 0; for (const [t] of COL_TABS) { if (t === 'title' || t === 'movie') continue; const d = colData(t); h += d.have; a += d.all; } return a ? Math.floor(h * 100 / a) : 0; }
let _skin = null;
function curSkin() { if (_skin === null) { try { _skin = localStorage.getItem('aikotoba_skin') || ''; } catch (e) { _skin = ''; } } return _skin; }
function setSkin(id) { _skin = id; try { localStorage.setItem('aikotoba_skin', id); } catch (e) {} }
// 主人公の 絵（えらんだ 色に する）。render.js と title.js で つかう
const _skinCache = {};
function heroLook(id, back) { const base = heroSprite(id, back), k = curSkin(), sk = SKINS.find(x => x[0] === k); if (!sk || !sk[3]) return base;
  const key = (id || '') + (back ? '_b' : '') + ':' + k; return _skinCache[key] || (_skinCache[key] = variant(base, sk[3])); }
