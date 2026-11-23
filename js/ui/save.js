// セーブ画面（ボタンで ひらく）と、タイトルの「つづきから」「ふっかつの合言葉」
'use strict';

function openSave() { if (!G || G.over || !floorStart) return; writeLocalSave(floorStart); invpop.hidden = false; invpop.dataset.mode = 'save';
  invpop.innerHTML = `<div><b style="color:#ffd23f">セーブ</b>　<button data-close="1">とじる</button></div>`
    + `<div class="help">この端末に セーブしました。タイトルの「つづきから」で 再開できます。<br>セーブされるのは <b>地下${floorStart.f}階に 入ったときの 状態</b>です（その階の はじめから 再開）。</div><div class="help" style="color:#ff9a5c;margin-top:4px">この階に 入ってから 手に入れた物・お金・けいけんちは セーブに 入りません。つぎの 階に おりると、そこで 自動で セーブされます。</div>`
    + `<div class="help" style="margin-top:8px">ほかの端末や、あとで 再開するときは「ふっかつの合言葉」を メモしてください：</div><textarea id="saveCode" readonly rows="4" class="code">作っています…</textarea><button id="copyCode">ふっかつの合言葉を コピー</button>`;
  const ta = document.getElementById('saveCode'), bt = document.getElementById('copyCode');
  makeCode(floorStart).then(c => { ta.value = c; }, () => { ta.value = 'この ブラウザでは 合言葉を 作れませんでした（この端末への セーブは できています）'; bt.disabled = true; });
  bt.onclick = () => { const ok = () => { bt.textContent = 'コピーしました'; setTimeout(() => bt.textContent = 'ふっかつの合言葉を コピー', 1500); };
    const fb = () => { ta.focus(); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { bt.textContent = '文字を えらんだので コピーしてください'; } };
    try { navigator.clipboard.writeText(ta.value).then(ok, fb); } catch (e) { fb(); } }; }
document.getElementById('saveBtn').onclick = () => { if (!over.hidden) return; if (!invpop.hidden && invpop.dataset.mode === 'save') { invpop.hidden = true; return; } openSave(); };

// タイトルに 出す「つづきから」の ボタン（セーブが あるときだけ）
function continueBtnHtml() { const j = readLocalSave(); if (!j) return ''; const s = j.s;
  return `<button id="goCont">つづきから（${s.mode === 'daily' ? '今日の' : ''}地下${s.f}/${s.depth}階・Lv${s.p.lv}）</button> `; }
function wireTitleSave() {
  const gc = document.getElementById('goCont'); if (gc) gc.onclick = () => { const j = readLocalSave(); if (j) restoreSave(j.s); };
  const gk = document.getElementById('goCode'); if (gk) gk.onclick = showCodeInput; }
function showCodeInput() { over.className = 'over recs';
  over.innerHTML = `<div class="recpage"><h1>ふっかつの合言葉</h1><p class="tnote">セーブで 出てきた 合言葉を はりつけてください</p><textarea id="codeIn" rows="4" class="code" placeholder="RF1…"></textarea><p id="codeMsg" class="tnote"></p><button id="codeGo">この合言葉で 再開</button> <button id="codeBack" class="alt">もどる</button></div>`;
  const inp = document.getElementById('codeIn'); inp.addEventListener('keydown', e => e.stopPropagation()); inp.focus();
  document.getElementById('codeBack').onclick = () => showOver('title');
  document.getElementById('codeGo').onclick = () => readCode(inp.value).then(restoreSave, e => {
    document.getElementById('codeMsg').textContent = e.message === 'check' ? '合言葉が 1文字 以上 ちがうようです。コピーしなおして ください。' : e.message === 'nozip' ? 'この ブラウザでは 合言葉を 読めません。' : '合言葉の 形が ちがうようです。';
    document.getElementById('codeMsg').style.color = '#ff6b6b'; }); }

// ----- 冒険を やめて タイトルへ（かならず 確認を はさむ） -----
function openQuit() { if (!G || G.over) return; invpop.hidden = false; invpop.dataset.mode = 'quit';
  invpop.innerHTML = `<div><b style="color:#ffd23f">冒険を やめますか？</b></div><div class="help" style="margin:6px 0">タイトルに もどります。地下${G.f}階に 入ったときの 状態は セーブされているので、あとで「つづきから」で もどれます。新しい 冒険を はじめた ときは、この 冒険の 装備・お金・レベルは 冒険者データに のこります。</div>`
    + `<button data-quit="yes" class="eq">やめて タイトルに もどる</button> <button data-close="1">つづける</button>`; }
function quitClick(b) { if (b.dataset.quit) { invpop.hidden = true; showOver('title'); render(); } }
document.getElementById('quitBtn').onclick = () => { if (!over.hidden) return; if (!invpop.hidden && invpop.dataset.mode === 'quit') { invpop.hidden = true; return; } openQuit(); };
