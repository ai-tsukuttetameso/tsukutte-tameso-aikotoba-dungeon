// クリアの記録（この端末に のこす）と、記録の シェア
'use strict';

// GitHub Pages などに 公開したら、ここに ゲームの URL を 入れると シェア文に つく
const SHARE_URL = 'https://ai-tsukuttetameso.github.io/tsukutte-tameso-aikotoba-dungeon/';
const SHARE_TAGS = '#' + GAME_NAME + ' #AIでつくってためそ';
const REC_KEY = 'aikotoba_clears', REC_MAX = 100;

function loadClears() { try { const a = JSON.parse(localStorage.getItem(REC_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
// いまの ダンジョンを 見分ける かぎ（同じ合言葉・同じ日の記録どうしで くらべる）
const runKey = () => runMode === 'daily' ? 'daily:' + daily : 'pw:' + normPw(password) + (LAST !== 10 ? ':' + LAST : '');
const runLabel = r => r.mode === 'daily' ? `今日のダンジョン（${r.daily}）` : `合言葉「${r.pw}」${r.depth && r.depth !== 10 ? `（地下${r.depth}階）` : ''}`;

// クリアしたときに 1回だけ よぶ。保存した記録を かえす
function saveClear() {
  const d = new Date(), pad = n => String(n).padStart(2, '0');
  const r = { at: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
    mode: runMode, pw: password, daily, depth: LAST, treasure, key: runKey(), turn: P.turn, lv: P.lv, gold: P.gold, job: P.job };
  const a = loadClears(); a.push(r); while (a.length > REC_MAX) a.shift();
  try { localStorage.setItem(REC_KEY, JSON.stringify(a)); } catch (e) {}
  return r; }
// 同じダンジョンでの 順位（ターンが 少ないほど 上）
function rankOf(r) { const same = loadClears().filter(x => x.key === r.key).sort((a, b) => a.turn - b.turn);
  return { rank: same.findIndex(x => x.at === r.at && x.turn === r.turn) + 1, total: same.length }; }

function shareText(r) {
  const where = r.mode === 'daily' ? `今日のダンジョン（${r.daily}）` : `合言葉「${r.pw}」の 地下${r.depth || 10}階${r.treasure ? '（おたから）' : ''}ダンジョン`;
  return `${GAME_NAME}を ${r.turn}ターンで クリア！（${JOBS[r.job] ? JOBS[r.job].name + '・' : ''}Lv${r.lv}・${r.gold}G）\n${where}は、同じ合言葉と 深さを えらぶと だれでも 同じ地図で 挑戦できます。\n${SHARE_TAGS}${SHARE_URL ? '\n' + SHARE_URL : ''}`; }

// クリア画面に 出す「記録とシェア」の部分
// u＝おなじ 画面に いくつも 出すときの 見分け（クリアの記録の 一覧で つかう）
function shareBoxHtml(r, u = '') { const { rank, total } = rankOf(r); const txt = shareText(r);
  return `<div class="recbox"><div class="rechd">この ダンジョンでの 記録：<b>${total}回中 ${rank}位</b>（${escH(runLabel(r))}）</div>`
    + `<textarea id="shareTxt${u}" readonly rows="4">${escH(txt)}</textarea>`
    + `<div><button id="copyShare${u}" class="alt">シェア文を コピー</button> <a class="xlink" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">Xに 投稿する画面を ひらく</a></div>`
    + `<p class="tnote">合言葉を 教えると、友だちも 同じダンジョンで ターン数を 競えます</p></div>`; }
function wireShare(u = '') { const b = document.getElementById('copyShare' + u); if (!b) return; const ta = document.getElementById('shareTxt' + u);
  b.onclick = () => { const done = () => { b.textContent = 'コピーしました'; setTimeout(() => b.textContent = 'シェア文を コピー', 1500); };
    const fallback = () => { ta.focus(); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { b.textContent = '文を えらんだので コピーしてください'; } };
    try { navigator.clipboard.writeText(ta.value).then(done, fallback); } catch (e) { fallback(); } }; }

// タイトルから ひらく「クリアの記録」一覧
function recordsHtml() { const a = loadClears();
  if (!a.length) return '<p class="tnote">まだ クリアの記録は ありません。でかこわの王を たおすと ここに のこります。</p>';
  const groups = {}; for (const r of a) (groups[r.key] = groups[r.key] || []).push(r);
  return Object.values(groups).sort((x, y) => y.length - x.length).map(g => { g.sort((p, q) => p.turn - q.turn);
    return `<div class="recgrp"><div class="rechd">${escH(runLabel(g[0]))}　<small>${g.length}回 クリア</small></div>`
      + g.slice(0, 10).map((r, i) => { const id = a.indexOf(r); return `<div class="recrow"><span>${i + 1}位</span><b>${r.turn}ターン</b><span>Lv${r.lv}</span><span>${JOBS[r.job] ? JOBS[r.job].name + '・' : ''}${r.gold}G</span><small>${r.at}</small><button class="recsh" data-share="${id}">シェア</button></div><div class="recshbox" id="recsh${id}" hidden></div>`; }).join('') + '</div>'; }).join(''); }
function showRecords() { over.className = 'over recs'; over.innerHTML = `<div class="recpage"><h1>クリアの 記録</h1><p class="tnote">この 端末に のこっている 記録です（合言葉ごとに ターンの 少ない順）</p>${recordsHtml()}<button id="recBack">もどる</button></div>`;
  document.getElementById('recBack').onclick = () => showOver('title');
  // 記録ごとの「シェア」：その 記録の シェア文と Xに 投稿する ボタンを 下に ひらく（もう一度 おすと とじる）
  for (const b of over.querySelectorAll('[data-share]')) b.onclick = () => { const id = b.dataset.share, box = document.getElementById('recsh' + id), r = loadClears()[+id]; if (!r) return;
    if (!box.hidden) { box.hidden = true; b.textContent = 'シェア'; return; }
    box.innerHTML = shareBoxHtml(r, '_' + id); box.hidden = false; b.textContent = 'とじる'; wireShare('_' + id); }; }
