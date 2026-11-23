// 冒険者データの 画面（レベル・お金・そうこ の 中身を 見る・リセット）
'use strict';

function showHero(msg) { const h = loadHero(); over.className = 'over recs';
  const st = h.store || [];
  over.innerHTML = `<div class="recpage heropage"><h1>冒険者データ</h1><p class="tnote">冒険が おわると（クリア・力つきた）、レベル・お金・手に入れた 装備が ここに のこり、つぎの 冒険へ ひきつがれます。力つきると お金は 半分。</p>`
    + `<div class="recgrp"><div class="rechd">レベル <b>${h.lv}</b>　お金 <b>${h.gold || 0}G</b>　そうこ <b>${st.length}</b>/${HERO_STORE_MAX}</div>`
    + `<div class="help">つぎの 冒険で：[E]＝そうびした まま もっていく ／ ほかは 強い順に ${HERO_TAKE}こまで もちものに 入る。のこりは そうこで まっている</div>`
    + (st.length ? st.map(o => `<div class="recrow herorow"><span>${o.eq ? '[E]' : ''}</span><span>${nameHtml(o)}</span><small>${itemDesc(o)}</small></div>`).join('') : '<div class="help">まだ 何も ありません</div>') + `</div>`
    + (msg ? `<p class="tnote" style="color:#ffd23f">${msg}</p>` : '')
    + `<div class="recgrp backup"><div class="rechd">記録の 書き出し・読みこみ</div><div class="help">冒険者データ・職業レベル・まもの図鑑・クリアの記録などを ぜんぶ まとめた「記録コード」を つくります。ほかの 端末に うつすときや、念のため のこしたい ときに つかいます。（記録は この ブラウザの 中だけに あるので、ブラウザの データを けすと きえます）</div>`
    + `<div class="bkrow"><b>ファイルで のこす（おすすめ）</b><button id="bkSave">記録ファイルを ほぞんする</button> <button id="bkLoad" class="alt">記録ファイルを 読みこむ</button><input type="file" id="bkFile" accept=".json,.txt,application/json,text/plain" hidden></div>`
    + `<div class="bkrow"><b>文字で のこす</b><button id="bkOut" class="alt">記録コードを 書き出す</button> <button id="bkIn" class="alt">記録コードを 読みこむ</button></div><div id="bkBox"></div></div>`
    + `<button id="heroBack">もどる</button> <button id="heroReset" class="alt">さいしょから（リセット）</button></div>`;
  wireBackup();
  document.getElementById('heroBack').onclick = () => showOver('title');
  document.getElementById('heroReset').onclick = () => { const b = document.getElementById('heroReset');
    if (b.dataset.sure) { resetHero(); showHero('冒険者データを リセットしました。（職業レベル・図鑑・クリアの 記録は のこっています）'); return; }
    b.dataset.sure = '1'; b.textContent = 'ほんとうに リセットする（もう一度 おす）'; }; }
const heroChip = () => { const h = loadHero(); return `<span>冒険者 <b>Lv${h.lv}</b>・<b>${h.gold || 0}G</b>・そうこ <b>${(h.store || []).length}</b></span>`; };

// ===== 記録コード（js/game/backup.js） =====
function wireBackup() { const box = document.getElementById('bkBox');
  // ファイルで ほぞん：記録コードを 入れた JSON ファイルを 端末に のこす（ダウンロード フォルダなど）
  document.getElementById('bkSave').onclick = async () => { const name = backupFileName(), text = backupFileText();
    box.innerHTML = `<small class="help">${await saveTextFile(name, text) ? `「${name}」を ほぞんしました。なくさない ところに のこしてください` : 'ほぞん できませんでした。「記録コードを 書き出す」で 文字を コピーして のこしてください'}</small>`; };
  const fileIn = document.getElementById('bkFile');
  document.getElementById('bkLoad').onclick = () => { fileIn.value = ''; fileIn.click(); };
  fileIn.onchange = () => { const f = fileIn.files && fileIn.files[0]; if (!f) return; const rd = new FileReader();
    rd.onload = () => { const code = codeFromFile(String(rd.result || '')); document.getElementById('bkIn').click(); const ta = document.getElementById('bkTxt'); ta.value = code;
      document.getElementById('bkGo').click(); };  // 中身を しらべて「ほんとうに 読みこむ？」を 出す
    rd.readAsText(f); };
  document.getElementById('bkOut').onclick = () => { const code = exportData();
    box.innerHTML = `<textarea id="bkTxt" class="bktxt" readonly>${code}</textarea><div><button id="bkCopy">コピーする</button> <small class="help">${code.length}文字・メモ帳などに はりつけて のこしてください</small></div>`;
    const ta = document.getElementById('bkTxt'), b = document.getElementById('bkCopy');
    b.onclick = () => { const done = () => { b.textContent = 'コピーしました'; }; const fb = () => { ta.focus(); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { b.textContent = '文を えらんだので コピーしてください'; } };
      try { navigator.clipboard.writeText(ta.value).then(done, fb); } catch (e) { fb(); } }; };
  document.getElementById('bkIn').onclick = () => {
    box.innerHTML = `<textarea id="bkTxt" class="bktxt" placeholder="AKD1- で はじまる 記録コードを はりつけてください"></textarea><div><button id="bkGo">読みこむ</button> <small class="help" id="bkMsg"></small></div>`;
    const ta = document.getElementById('bkTxt'), go = document.getElementById('bkGo'), msg = document.getElementById('bkMsg');
    ta.addEventListener('keydown', e => e.stopPropagation()); ta.addEventListener('input', () => { delete go.dataset.sure; go.textContent = '読みこむ'; msg.textContent = ''; });
    go.onclick = () => { const c = checkBackup(ta.value); if (!c.ok) { msg.textContent = c.msg; return; }
      if (!go.dataset.sure) { go.dataset.sure = '1'; go.textContent = 'ほんとうに 読みこむ（もう一度 おす）'; msg.textContent = `${new Date(c.at).toLocaleString()}の 記録（${c.n}こ）。いまの この 端末の 記録は ぜんぶ おきかわります。`; return; }
      const r = importData(ta.value); if (!r.ok) { msg.textContent = r.msg; return; }
      try { const j = localStorage.getItem('aikotoba_job'); if (JOBS[j]) curJob = j; } catch (e) {}
      showHero(`記録コードを 読みこみました。（${r.n}こ）`); }; }; }

// ===== 記録ファイル =====
const backupFileName = () => { const d = new Date(), z = n => String(n).padStart(2, '0'); return `aikotoba-kiroku-${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}.json`; };
// ファイルの 中身：ひらいても 何の ファイルか わかるように 説明と 記録コードを 入れる
function backupFileText() { const h = loadHero();
  return JSON.stringify({ game: GAME_NAME, version: GAME_VERSION, about: 'あいことばダンジョンの 記録ファイルです。タイトルの「冒険者データ」→「記録ファイルを 読みこむ」で もとに もどせます。',
    savedAt: new Date().toLocaleString(), hero: `Lv${h.lv}・${h.gold || 0}G`, code: exportData() }, null, 2); }
// JSON の ファイルでも、記録コードだけを 書いた ファイルでも 読める
function codeFromFile(t) { try { const j = JSON.parse(t); if (j && typeof j.code === 'string') return j.code; } catch (e) {} return t.trim(); }
// ファイルを 端末に のこす。ふつうは ダウンロード、claude.ai の プレビューでは その しくみを つかう
async function saveTextFile(name, text) {
  try { if (window.claude && window.claude.use) { const dl = await window.claude.use('downloads'); if (dl) { await dl.save({ filename: name, data: text }); return true; } } } catch (e) { return false; }
  try { const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })), a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); return true; } catch (e) { return false; } }
