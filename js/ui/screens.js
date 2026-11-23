// タイトル・ゲームオーバー・クリア画面、大きな お知らせ文字
'use strict';

let bannerTimer = 0;
function showBanner(text, sub) { const b = document.getElementById('banner'); b.innerHTML = `<div class="bt">${text}</div>` + (sub ? `<div class="bs">${sub}</div>` : ''); b.hidden = false; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => { b.hidden = true; }, 2600); }
// ===== 画面 =====
const over = document.getElementById('over');
let overKind = null;
// タイトルの あいだは もちもの・わざ・ボタンを かくす（前の 冒険の ようすが のこらないように）
const setTitleMode = on => document.querySelector('.wrap').classList.toggle('titlemode', on);
function hideOver() { const wasTitle = overKind === 'title'; setTitleMode(false); over.hidden = true; overKind = null; over.className = 'over'; mmw.hidden = false; if (wasTitle) fitView(); }
const bestKey = () => runMode === 'daily' ? 'aikotoba_daily_' + daily : runMode === 'pw' ? 'aikotoba_pw_' + normPw(password) + (LAST !== 10 ? '_' + LAST : '') : 'aikotoba_best';
function loadBest(key) { try { return JSON.parse(localStorage.getItem(key || bestKey()) || '{}'); } catch (e) { return {}; } }
function saveBest(kind) { const b = loadBest(); b.floor = Math.max(b.floor || 0, G.f); if (kind === 'clear') { b.clears = (b.clears || 0) + 1; b.turn = Math.min(b.turn || 1e9, P.turn); } if (kind === 'dead') b.deaths = (b.deaths || 0) + 1; try { localStorage.setItem(bestKey(), JSON.stringify(b)); } catch (e) {} return b; }
function bestLine(key, label) { const b = loadBest(key); if (!b.floor) return ''; return `<p style="color:#ffd23f;font-size:15px">${label || 'ベスト'}：地下${b.floor}階${b.turn ? '／最速クリア ' + b.turn + 'ターン' : ''}${b.deaths ? '／たおれた回数 ' + b.deaths : ''}</p>`; }
function showOver(kind) {
  if (kind === 'dead' || kind === 'clear') saveBest(kind);
  const rec = kind === 'clear' ? saveClear() : null;
  // 冒険者データに のこす（レベル・お金・装備）
  const bank = (kind === 'dead' || kind === 'clear') && !previewRun ? bankRun(kind) : null;
  const bankLine = bank ? `<p class="bankline">冒険者データに のこした：Lv${P.lv}・${bank.gold}G${bank.lost ? `（力つきて ${bank.lost}G おとした）` : ''}・装備 ${bank.gear}こ</p>` : '';
  if (kind === 'dead' || kind === 'clear') clearLocalSave();  // 冒険が おわったら セーブは けす
  over.hidden = false; invpop.hidden = true; if (kind === 'title') document.getElementById('banner').hidden = true; overKind = kind; over.className = 'over ' + kind; mmw.hidden = kind === 'title'; setTitleMode(kind === 'title'); fitView();
  if (kind === 'dead') { setTimeout(() => sfx('dead'), 150); shake(8); } if (kind === 'clear') setTimeout(() => sfx('clear'), 150);
  const pwLine = `<p class="pwline">合言葉「<b>${escH(password)}</b>」${LAST !== 10 ? `（地下${LAST}階）` : ''}${treasure ? '・おたからダンジョン' : ''}　← 友だちに教えると、同じダンジョンで 勝負できる</p>`;
  const again = `${pwLine}<button id="goSame">同じ合言葉で もう一度</button> <button id="go" class="alt">新しい ダンジョン（Enter）</button> <button id="goDaily" class="alt">今日のダンジョン</button> <button id="goTitle" class="alt">タイトルに もどる</button>`;
  if (kind === 'title') { setHtml('hud', ''); document.getElementById('log').innerHTML = '<div>「はじめる」を おすと 冒険が はじまる。</div>'; }
  if (kind === 'title') over.innerHTML = `<div class="ttl"><h1>${GAME_NAME}</h1><p class="tdesc"><span>15の職業 × 地下100階</span> <span>× 合言葉の数だけ ダンジョン</span></p>${progHtml()}</div><div class="tbot">${continueBtnHtml()}${jobSelHtml()}${bestLine('aikotoba_daily_' + todayKey(), '今日のダンジョン')}<button id="go">はじめる（Enter）</button> <button id="goDaily" class="alt">今日のダンジョン</button> <button id="goRec" class="alt">クリアの記録</button> <button id="goCode" class="alt">ふっかつの合言葉</button> <button id="goHero" class="alt">冒険者データ</button><div class="pwbox"><input id="pwIn" maxlength="24" placeholder="合言葉を 入れる（例：ねこ・たまご・そら）" autocomplete="off"><select id="depthIn" title="ダンジョンの 深さ">${DEPTHS.map(d => `<option value="${d}">地下${d}階${d === 10 ? '（ふつう）' : d >= 50 ? '（とても長い）' : ''}</option>`).join('')}</select><button id="goPw" class="alt">合言葉で ダンジョン生成</button></div><p class="pwhint" id="pwHint"></p><p class="tnote">合言葉と 深さから ダンジョンを 生成。同じなら だれでも 同じ地図。職業を きわめると 上位の 職業が ひらきます</p><p class="tsound">♪ 画面を タップすると 音楽が ながれます</p></div>`;
  if (kind === 'dead') { const last = logAll.slice(-5);
    over.innerHTML = `<div><h1>力つきた……</h1><p>死因：<b style="color:#ff6b6b">${P.cause || 'なぞ'}</b></p><p>地下${G.f}階 ／ Lv${P.lv} ／ ${P.turn}ターン ／ ${P.gold}G</p><div class="last"><div>さいごの流れ</div>${last.map(l => `<div>・${l}</div>`).join('')}</div>${bestLine()}${jobLineHtml()}${bankLine}${again}</div>`; }
  if (kind === 'clear') over.innerHTML = `<div><h1>でかこわの王を たおした！</h1><p>${P.turn}ターンで クリア ／ Lv${P.lv} ／ ${P.gold}ゴールド</p>${shareBoxHtml(rec)}${jobLineHtml()}${bankLine}${again}</div>`;
  wireShare(); wireTitleSave(); wireJobSel(); const gt = document.getElementById('goTitle'); if (gt) gt.onclick = () => { showOver('title'); render(); }; const gr = document.getElementById('goRec'); if (gr) gr.onclick = showRecords;
  document.getElementById('go').onclick = () => { newGame('random'); render(); };
  document.getElementById('goDaily').onclick = () => pickStart('daily');
  const gh = document.getElementById('goHero'); if (gh) gh.onclick = showHero;
  const gs = document.getElementById('goSame'); if (gs) gs.onclick = () => runMode === 'daily' ? pickStart('daily') : pickStart('pw', password, LAST);
  const gp = document.getElementById('goPw'); if (gp) { const inp = document.getElementById('pwIn'); try { inp.value = localStorage.getItem('aikotoba_lastpw') || ''; } catch (e) {}
    const dsel = document.getElementById('depthIn'); try { const ld = localStorage.getItem('aikotoba_lastdepth'); if (ld) dsel.value = ld; } catch (e) {}
    gp.onclick = () => { const v = inp.value.trim(); try { localStorage.setItem('aikotoba_lastdepth', dsel.value); } catch (e) {} if (!normPw(v)) { inp.focus(); inp.placeholder = '合言葉を 入れてください'; return; } try { localStorage.setItem('aikotoba_lastpw', v); } catch (e) {} pickStart('pw', v, +dsel.value); };
    // 合言葉と 深さが かわったら、とどいた 階を 下に 出す
    const hint = document.getElementById('pwHint'), upd = () => { const fs = normPw(inp.value) ? cpFloors(inp.value.trim(), +dsel.value) : [1]; hint.textContent = fs.length > 1 ? `この ダンジョンは 地下${fs[fs.length - 1]}階まで とどいています（はじめる 階を えらべます）` : ''; };
    inp.addEventListener('input', upd); dsel.addEventListener('change', upd); upd();
    inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' && !e.isComposing) gp.click(); }); }
}
