// コレクション（タイトルの「コレクション」ボタン）
// 見た・たおした・使った 回数に おうじて、すこしずつ せつめいが 見えるように なる
'use strict';

const COL_TABS = [['mon', 'まもの'], ['item', '道具'], ['gear', 'そうび'], ['trait', '特性'], ['job', '職業'], ['skill', 'わざ'], ['sound', 'おと'], ['movie', 'ムービー'], ['title', '称号']];
// まものは たおした 数で ひらく：1体で つよさ、3体で 弱点と とくちょう、10体で せつめい
const MON_STEP = [1, 3, 10];
const MON_FLAG = { fast: '1回に 2回 動く', erratic: 'ふらふら 動く', steal: 'ものを ぬすむ', dance: 'おどらせる', big: '大きい', regen: 'HPが 回復する',
  hunger: 'なぐると おなかが へる', mpdrain: 'なぐると MPが へる' };
const ITEM_STAR = 5;  // 5回 使うと ★

// 絵を 画像に（まだ 見ていない ものは 黒い かげ）
const _colImg = {};
function colImg(spr, dark) { const key = spr + (dark ? '_x' : ''); if (_colImg[key]) return _colImg[key]; const sp = S[spr]; if (!sp) return '';
  const c = document.createElement('canvas'); c.width = sp.width; c.height = sp.height; const x = c.getContext('2d'); x.drawImage(sp, 0, 0);
  if (dark) { x.globalCompositeOperation = 'source-in'; x.fillStyle = '#2a2244'; x.fillRect(0, 0, c.width, c.height); }
  return _colImg[key] = c.toDataURL(); }
const colCard = (img, name, body, cls = '') => `<div class="colcard ${cls}">${img ? `<img src="${img}" alt="">` : '<i class="noimg"></i>'}<div><b>${name}</b>${body}</div></div>`;
const nextLine = s => `<small class="colnext">${s}</small>`;

function colMon(p) { const seen = p.seen || {}, kills = p.kills || {}, dex = new Set(p.dex || []);
  const ids = Object.keys(MON).sort((a, b) => MON[a].exp - MON[b].exp);
  const cards = ids.map(t => { const m = MON[t], k = kills[t] || (dex.has(t) ? 1 : 0), met = seen[t] || k;
    if (!met) return colCard(colImg(m.spr, true), '？？？', nextLine('まだ 出会っていない'), 'lock');
    let b = `<small>たおした ${k}体</small>`;
    if (k >= MON_STEP[0]) b += `<small>HP ${m.hp}・こうげき ${m.atk}・まもり ${m.def}・けいけんち ${m.exp}</small>`;
    if (k >= MON_STEP[1]) { const fl = Object.keys(MON_FLAG).filter(f => m[f]).map(f => MON_FLAG[f]);
      b += `<small>${m.weak ? '弱点：' + ELEM[m.weak].name : '弱点：なし'}${m.resist ? '・ききにくい：' + ELEM[m.resist].name : ''}${fl.length ? '・' + fl.join('・') : ''}</small>`; }
    else if ((p.weakKnown || {})[t] || (p.resistKnown || {})[t]) b += `<small>${(p.weakKnown || {})[t] ? '弱点：' + ELEM[m.weak].name : ''}${(p.weakKnown || {})[t] && (p.resistKnown || {})[t] ? '・' : ''}${(p.resistKnown || {})[t] ? 'ききにくい：' + ELEM[m.resist].name : ''}（ためして わかった）</small>`;
    if (k >= MON_STEP[2] && m.desc) b += `<small class="coldesc">${m.desc}</small>`;
    const nx = MON_STEP.find(s => k < s); if (nx) b += nextLine(`あと ${nx - k}体 たおすと くわしく わかる`);
    return colCard(colImg(m.spr), m.name, b); });
  return { have: ids.filter(t => seen[t] || kills[t] || dex.has(t)).length, all: ids.length, html: cards.join('') }; }

function colItems(p, gear) { const found = p.found || {}, used = p.used || {};
  const ids = Object.keys(ITEMS).filter(k => k !== 'gold' && !!ITEMS[k].equip === gear);
  const cards = ids.map(k => { const it = ITEMS[k], u = used[k] || 0;
    if (!found[k]) return colCard(colImg(it.spr, true), '？？？', nextLine(it.evo ? `＋${EVO_NEED}の そうびを AIかじやで しんか させると 手に入る` : 'まだ 手に入れていない'), 'lock');
    let b = `<small>${gear ? 'そうびした' : '使った'} ${u}回</small>`;
    if (u) b += `<small class="coldesc">${it.desc || (gear ? SLOT_NAME[it.equip] + (it.note ? '。' + it.note : '') : '')}</small>`;
    else b += nextLine(gear ? 'そうびすると くわしく わかる' : '使うと くわしく わかる');
    if (u > 0 && u < ITEM_STAR) b += nextLine(`あと ${ITEM_STAR - u}回で ★`);
    return colCard(colImg(it.spr), it.name + (u >= ITEM_STAR ? ' <em>★</em>' : ''), b); });
  return { have: ids.filter(k => found[k]).length, all: ids.length, html: cards.join('') }; }

function colTraits(p) { const tr = p.traits || {}, ids = Object.keys(TRAITS);
  const cards = ids.map(t => tr[t] ? colCard('', TRAITS[t].name, `<small>${TRAITS[t].slot === 'atk' ? 'ぶき' : 'ぼうぐ'}の 特性</small><small class="coldesc">${TRAITS[t].desc}</small>`)
    : colCard('', '？？？', nextLine('この 特性が ついた そうびを 手に入れると わかる'), 'lock'));
  return { have: ids.filter(t => tr[t]).length, all: ids.length, html: cards.join('') }; }

function colJobs() { const cards = ALL_JOBS.map(id => { const j = JOBS[id], open = jobOpen(id);
    if (!open) return colCard(jobIconUrl(id, true), '？？？', nextLine(`${j.from.map(f => JOBS[f].name).join('・')} を きわめると なれる`), 'lock');
    const lv = jobLv(id); return colCard(jobIconUrl(id), j.name + (jobMastered(id) ? ' <em>★</em>' : ''), `<small>職業レベル ${stars(lv)}</small><small class="coldesc">${j.desc}</small>`); });
  return { have: ALL_JOBS.filter(jobOpen).length, all: ALL_JOBS.length, html: cards.join('') }; }

function colSkills(p) { const lr = p.learned || {}, su = p.skillUse || {};
  const cards = SKILLS.map(s => { const u = su[s.id] || 0;
    if (!lr[s.id] && !u && s.combo) { const nm = k => lr[k] ? SKILLS.find(x => x.id === k).name : '？？？';
      return colCard('', '？？？', nextLine(`合わせ技：${s.combo.map(nm).join(' ＋ ')}`), 'lock'); }
    if (!lr[s.id] && !u) { const who = ALL_JOBS.filter(j => JOBS[j].skills[s.id]).map(j => jobOpen(j) ? JOBS[j].name : '？？？');
      return colCard('', '？？？', nextLine(`おぼえる 職業：${who.join('・') || '？？？'}`), 'lock'); }
    let b = `<small>${s.combo ? '合わせ技・' : ''}${s.kind}・MP${s.mp}・使った ${u}回</small>`;
    if (s.combo) b += `<small>${s.combo.map(k => SKILLS.find(x => x.id === k).name).join(' ＋ ')}</small>`;
    b += u ? `<small class="coldesc">${s.desc}</small>` : nextLine('使うと くわしく わかる');
    return colCard('', s.name, b); });
  return { have: SKILLS.filter(s => lr[s.id] || su[s.id]).length, all: SKILLS.length, html: cards.join('') }; }

// ----- おと（BGMと 効果音）：いちど 聞くと ひらいて、タップで なんども 聞ける -----
const BGM_LIST = [['title', 'はじまりの あいことば', 'タイトル（1）'], ['title2', 'あさやけの ぼうけん', 'タイトル（2）'], ['title3', 'よるの たきび', 'タイトル（3）'],
  ['explore', 'ダンジョンを すすめ', '地下1〜29階'], ['cave', 'いしの めいろ', '地下30〜59階'], ['deep', 'そこなしの やみ', '地下60階より 深く'],
  ['dark', 'まっくらの うた', 'くらやみの階'], ['ice', 'こおりの ささやき', 'こおりの階'], ['hunger', 'おなか ぺこぺこ', 'はらぺこの階'],
  ['gold', 'きらきら おかね', 'おかねの階'], ['magic', 'まりょくの うず', 'まりょくの階'], ['strong', 'つわものの 行進', 'つわものの階'],
  ['midboss', 'ぬしとの たたかい', 'ぬしの階'], ['danger', 'ピンチだ！', '敵に かこまれた とき'], ['shop', 'AIかじやの テーマ', 'お店の 中'], ['boss', 'でかこわの王', 'さいごの 階'], ['ending', 'たびの おわりに', 'エンディング']];
const SE_LIST = [['hit', 'こうげき'], ['crit', 'かいしんの いちげき'], ['hurt', 'ダメージ'], ['dodge', 'よけた'], ['kill', 'たおした'], ['pick', 'ひろう'], ['coin', 'お金'],
  ['use', '道具を つかう'], ['eat', 'たべる'], ['drink', '草を のむ'], ['scroll', 'おふだ'], ['wand', '杖'], ['zap', 'でんげき'], ['bad', 'しっぱい・のろい'],
  ['slash', 'きりつけ'], ['spin', '回転斬り'], ['fire', 'ほのお'], ['ice', 'こおり'], ['thunder', 'かみなり'], ['heal', 'かいふく'], ['shadow', 'かげ'], ['smoke', 'けむりだま'],
  ['boom', 'ばくはつ'], ['boomfx', 'だいばくはつ'], ['sleep', 'ねむり'], ['look', 'しらべる'], ['forge', 'きたえる'], ['trap', 'わな'], ['fall', 'おとしあな'],
  ['stairs', '階段を おりる'], ['lvup', 'レベルアップ'], ['jingle', 'レベルアップの ファンファーレ'], ['siren', 'ピンチの サイレン'], ['alarm', 'けいほう'], ['house', 'モンスターハウス'],
  ['shop', 'お店に 入る'], ['buy', 'かう'], ['sell', 'うる'], ['pay', 'はらう'], ['boss', 'ボスの へや'], ['dead', '力つきた'], ['clear', 'クリア']];
function colSound(p) { const hb = p.heardBgm || {}, hs = p.heard || {};
  const bgm = BGM_LIST.map(([k, nm, where]) => hb[k] ? `<button class="sndbtn${bgmPreview === k ? ' on' : ''}" data-bgm="${k}"><span>${bgmPreview === k ? '■ とめる' : '♪'} <b>${nm}</b></span><small>${where}</small></button>`
    : `<button class="sndbtn lock" disabled>？？？<small>「${where}」で 流れる 曲</small></button>`).join('');
  const se = SE_LIST.map(([k, nm]) => hs[k] ? `<button class="sndbtn" data-se="${k}">▶ ${nm}</button>` : `<button class="sndbtn lock" disabled>？？？</button>`).join('');
  const have = BGM_LIST.filter(([k]) => hb[k]).length + SE_LIST.filter(([k]) => hs[k]).length;
  return { have, all: BGM_LIST.length + SE_LIST.length, html: `<div class="sndhd">BGM（${BGM_LIST.filter(([k]) => hb[k]).length}/${BGM_LIST.length}）</div><div class="sndgrid bgm">${bgm}</div><div class="sndhd">効果音（${SE_LIST.filter(([k]) => hs[k]).length}/${SE_LIST.length}）</div><div class="sndgrid">${se}</div>` }; }
// 音が オフでも、ここでは 聞けるように する（その 1回だけ オンに する）
function playSe(k) { startAudio(); const was = soundOn; soundOn = true;
  try { k === 'stairs' ? stairsSound() : k === 'fall' ? fallSound() : k === 'jingle' ? levelUpJingle() : sfx(k); } finally { soundOn = was; } }
// ----- 称号と ごほうび -----
function colTitles() { const got = myTitles(), pct = colPct(), worn = (() => { try { return localStorage.getItem('aikotoba_title') || ''; } catch (e) { return ''; } })();
  const next = SKINS.find(s => s[2] > pct), sec = Object.keys(loadProg().secret || {});
  let h = `<div class="colpct"><div>コレクション <b>${pct}%</b>${next ? `　<small>つぎの ごほうび：${next[2]}%で「${next[1]}」</small>` : '　<small>ぜんぶ そろった！</small>'}</div><div class="pctbar"><i style="width:${pct}%"></i></div></div>`;
  h += `<div class="sndhd">ごほうび：主人公の 色</div><div class="skinrow">${SKINS.map(([id, nm, need]) => { const ok = pct >= need;
    return `<button class="skinbtn${curSkin() === id ? ' on' : ''}${ok ? '' : ' lock'}" ${ok ? `data-skin="${id}"` : 'disabled'}><img src="${ok ? skinPreview(id) : colImg('hero', true)}" alt=""><span>${ok ? nm : need + '%で'}</span></button>`; }).join('')}</div>`;
  h += `<div class="sndhd">かくし合言葉（${sec.length}/${SECRET_IDS.length}）</div><div class="help">${sec.length ? sec.map(k => `「${k}」${SECRETS[k].name}`).join('　') : 'どこかに かくし合言葉が あるらしい……'}</div>`;
  h += `<div class="sndhd">称号（${TITLES.filter(t => got[t[0]]).length}/${TITLES.length}）　<small>とった 称号を おすと タイトルと シェアの 文に つく</small></div><div class="sndgrid bgm">`
    + TITLES.map(([id, nm, cond]) => got[id] ? `<button class="sndbtn${worn === id ? ' on' : ''}" data-title="${id}"><span>${worn === id ? '✔ ' : ''}<b>${nm}</b></span><small>${cond}</small></button>`
      : `<button class="sndbtn lock" disabled>？？？<small>${cond}</small></button>`).join('') + '</div>';
  return { have: TITLES.filter(t => got[t[0]]).length, all: TITLES.length, html: h }; }
const _skinPrev = {};
function skinPreview(id) { if (_skinPrev[id]) return _skinPrev[id]; const was = _skin; _skin = id; const sp = heroLook(curJob); _skin = was;
  const c = document.createElement('canvas'); c.width = sp.width; c.height = sp.height; c.getContext('2d').drawImage(sp, 0, 0); return _skinPrev[id] = c.toDataURL(); }
// オープニングと エンディング。エンディングは 地下100階の ダンジョンを クリアすると 見られる
const lastClear = () => loadClears().filter(r => r.depth === 100).pop();
function colMovie() { const end = lastClear();
  const op = `<button class="moviebtn" data-movie="op"><b>▶ オープニング</b><small>あらすじと デモプレイ</small></button>`;
  const ed = end ? `<button class="moviebtn" data-movie="end"><b>▶ エンディング</b><small>さいごに クリアした ときの 記録で 流れる</small></button>`
    : `<div class="moviebtn lock"><b>🔒 エンディング</b><small>地下100階の ダンジョンを さいごまで クリアすると 見られる</small></div>`;
  return { have: end ? 2 : 1, all: 2, html: op + ed }; }
function colData(tab) { if (tab === 'title') return colTitles(); if (tab === 'movie') return colMovie(); if (tab === 'sound') return colSound(loadProg()); const p = loadProg();
  return tab === 'mon' ? colMon(p) : tab === 'item' ? colItems(p, false) : tab === 'gear' ? colItems(p, true) : tab === 'trait' ? colTraits(p) : tab === 'job' ? colJobs() : colSkills(p); }
// タイトルに 出す 合計（ぜんぶの タブ）
function colTotal() { let h = 0, a = 0; for (const [t] of COL_TABS) { if (t === 'title' || t === 'movie') continue; const d = colData(t); h += d.have; a += d.all; } return { have: h, all: a }; }

let colTab = 'mon';
function showCollection(tab) { checkTitles(true); if (tab) colTab = tab; try { localStorage.setItem('aikotoba_coltab', colTab); } catch (e) {}
  over.className = 'over recs'; const d = colData(colTab);
  over.innerHTML = `<div class="recpage colpage"><div class="colhead"><div class="coltop"><button id="colBack" class="colback">← もどる</button><h1>コレクション</h1><span class="colpad"></span></div>`
    + `<div class="coltabs">${COL_TABS.map(([id, nm]) => { const x = colData(id); return `<button class="${id === colTab ? 'on' : 'alt'}" data-coltab="${id}">${nm}<small>${x.have}/${x.all}</small></button>`; }).join('')}</div></div>`
    + `<p class="tnote">${colTab === 'mon' ? '出会うと 名前が わかる。たおした 数が ふえるほど、つよさ → 弱点 → せつめい と 見えてくる' : colTab === 'job' ? '職業は きわめると つぎの 職業が ひらく' : colTab === 'title' ? 'コレクションを うめるほど 主人公の 色が ふえる。称号は やりこむと 手に入る' : colTab === 'movie' ? 'いちど 見た ムービーを もう一度 見られる。とちゅうで ボタンを おすと コレクションに もどる' : colTab === 'sound' ? 'ゲームの 中で いちど 聞いた 音は、ここで なんども 聞ける。BGMは もう一度 おすと とまる' : '手に入れると 名前が わかる。使うと せつめいが 見える'}</p>`
    + `<div class="${colTab === 'sound' || colTab === 'title' || colTab === 'movie' ? 'sndbox' : 'colgrid'}">${d.html}</div></div>`;
  for (const b of over.querySelectorAll('[data-coltab]')) b.onclick = () => { if (b.dataset.coltab !== 'sound') bgmPreview = null; showCollection(b.dataset.coltab); over.scrollTop = 0; };
  for (const b of over.querySelectorAll('[data-bgm]')) b.onclick = () => { startAudio(); bgmPreview = bgmPreview === b.dataset.bgm ? null : b.dataset.bgm; showCollection(); };
  for (const b of over.querySelectorAll('[data-movie]')) b.onclick = () => { bgmPreview = null; attractBack = () => showCollection('movie');
    if (b.dataset.movie === 'op') showStory(); else { const r = lastClear(); if (r) replayEnding(r); else attractBack = null; } };
  for (const b of over.querySelectorAll('[data-se]')) b.onclick = () => playSe(b.dataset.se);
  for (const b of over.querySelectorAll('[data-skin]')) b.onclick = () => { setSkin(b.dataset.skin); sfx('pick'); showCollection(); };
  for (const b of over.querySelectorAll('[data-title]')) b.onclick = () => { const id = b.dataset.title, cur = (() => { try { return localStorage.getItem('aikotoba_title'); } catch (e) { return ''; } })(); wearTitle(cur === id ? '' : id); sfx('pick'); showCollection(); };
  document.getElementById('colBack').onclick = () => { bgmPreview = null; showOver('title'); }; }
try { colTab = localStorage.getItem('aikotoba_coltab') || 'mon'; } catch (e) {}

// ===== ぼうけんの とちゅうで 図鑑（コレクション）を 見る（v1.69）=====
// 見るだけ。ムービーは 冒険が おわって しまうので 出さない。「← ぼうけんに もどる」か Esc で もどる
let colInGame = false;
function openColInGame() { if (!G || G.over || !over.hidden || (typeof attract !== 'undefined' && attract)) return; invpop.hidden = true; colInGame = true; over.hidden = false; showCollection(colTab === 'movie' ? 'mon' : colTab); over.scrollTop = 0; }
function closeColInGame() { if (!colInGame) return; colInGame = false; bgmPreview = null; hideOver(); render(); }
const _showColG = showCollection; showCollection = function (tab) { if (colInGame && (tab || colTab) === 'movie') tab = 'mon'; _showColG.call(this, tab); if (!colInGame) return;
  const mv = over.querySelector('[data-coltab="movie"]'); if (mv) mv.remove();
  const bk = document.getElementById('colBack'); if (bk) { bk.textContent = '← ぼうけんに もどる'; bk.onclick = closeColInGame; } };
document.getElementById('colBtn').onclick = () => { if (colInGame) return closeColInGame(); openColInGame(); };
