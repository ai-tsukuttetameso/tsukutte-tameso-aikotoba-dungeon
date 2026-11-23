// エンディング：でかこわの王を たおしたら、スタッフロールを 流す（とばせる）
// クリアの 記録は さきに のこしてから 流すので、とちゅうで とじても 記録は きえない
'use strict';

let endingOn = false, runMet = [];
// この 冒険で たおした まものを おぼえておく（エンディングの 行進に 出す）
const _noteKill = noteKill; noteKill = function (t) { if (!runMet.includes(t)) runMet.push(t); return _noteKill.apply(this, arguments); };
const _newGameE = newGame; newGame = function () { runMet = []; return _newGameE.apply(this, arguments); };

function endingHtml() { const j = JOBS[P.job], img = c => { try { return c.toDataURL(); } catch (e) { return ''; } };
  const parade = runMet.slice(-14).map(t => { const u = colImg(MON[t].spr); return u ? `<img src="${u}" alt="${escH(MON[t].name)}">` : ''; }).join('');
  const title = wornTitle(), diff = typeof diffTag === 'function' ? diffTag(runDiff) : '';
  const S2 = (h, ...rows) => `<div class="esec"><h3>${h}</h3>${rows.map(r => `<p>${r}</p>`).join('')}</div>`;
  return `<div class="roll" id="endRoll">
    <div class="esec big"><p>でかこわの王は たおれた。</p><p>ダンジョンに 光が もどり、</p><p>合言葉は しずかに ねむりについた。</p></div>
    <div class="esec hero"><img src="${img(heroLook(P.job))}" alt=""><p>${escH(j ? j.name : '')}　Lv${P.lv}</p></div>
    ${S2('この 冒険', `合言葉「${escH(password)}」　地下${LAST}階`, `${P.turn}ターン　${P.gold}G`, ...(title ? [`称号【${escH(title)}】`] : []), ...(diff ? [`裏モード ${diff}`] : []))}
    ${parade ? `<div class="esec"><h3>出会った まものたち</h3><div class="parade">${parade}</div></div>` : ''}
    ${S2('企画・プログラム・絵・音楽', 'Claude（Opus 5.5）')}
    ${S2('制作進行・テストプレイ', 'うーたん')}
    ${S2('おうえん', 'タメゾウ')}
    ${S2('とどけた ところ', 'YouTube「AIでつくってためそ」')}
    ${S2('そして', 'あそんでくれた きみ')}
    <div class="esec big"><p>……けれど、その ずっと 下。</p><p>星の 奥ふかくで、</p><p>なにかが 目を さまそうとしていた。</p></div>
    <div class="esec end"><p class="theend">THE END</p><p class="next">つぎの 冒険　エピソード2「ブルーアースの核」　じゅんび中</p><p class="ver">${GAME_EPISODE}　Ver ${GAME_VERSION}</p></div>
  </div><button id="endSkip" class="alt">とばす ▶</button>`; }
function playEnding() { if (document.getElementById('ending')) return; endingOn = true;
  const box = document.createElement('div'); box.id = 'ending'; box.className = 'ending'; box.innerHTML = endingHtml(); const st = document.querySelector('.stage'); box.style.setProperty('--sh', st.clientHeight + 'px'); st.appendChild(box);
  const roll = box.querySelector('#endRoll'), skip = box.querySelector('#endSkip');
  roll.addEventListener('animationend', () => { box.classList.add('done'); skip.textContent = 'とじる ▶'; });
  skip.onclick = closeEnding; }
function closeEnding() { const b = document.getElementById('ending'); if (b) b.remove(); endingOn = false; }
// クリアの 画面を 出した あとに エンディングを かさねる
const _showOverE = showOver; showOver = function (kind) { const r = _showOverE.apply(this, arguments); if (kind === 'clear' && !previewRun) playEnding(); else if (kind !== 'clear') closeEnding(); return r; };

// ===== エンディングを もう一度 見る（コレクションの「ムービー」から） =====
// 記録には なにも 書かない。r＝クリアの記録（なければ ためしの 冒険）
let endingReplay = false;
function replayEnding(r) { r = r || { pw: 'つくってためそ', depth: 10, job: 'senshi', lv: 12, turn: 842, gold: 3200 };
  const job = curJob; curJob = JOBS[r.job] && jobOpen(r.job) ? r.job : 'senshi'; try { newGame('pw', r.pw || 'つくってためそ', r.depth || 10, 1, true); } finally { curJob = job; }
  Object.assign(P, { job: JOBS[r.job] ? r.job : 'senshi', lv: r.lv || 1, turn: r.turn || 0, gold: r.gold || 0 });
  const dex = loadProg().dex || []; runMet = dex.length ? dex.slice(-14) : ['kinoko', 'bug', 'hebi', 'cat', 'dekakowa'];
  hideOver(); fitView(); render(); G.over = "ending"; endingReplay = true; playEnding(); }
const _closeEnding = closeEnding; closeEnding = function () { _closeEnding(); if (endingReplay) { endingReplay = false; newGame('random', null, 10, 1, true); showOver('title'); render(); if (attractBack) { const f = attractBack; attractBack = null; f(); } } };
