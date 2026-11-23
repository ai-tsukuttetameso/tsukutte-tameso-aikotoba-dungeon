// 裏モード：地下100階の ダンジョンを 1回 クリアすると、敵の 強さを 4つから えらべる
// 強さは 敵の HP・こうげき・けいけんちを かえるだけ。地図・道具は かわらない（乱数を つかわない）
'use strict';

// [id, 名前, HP, こうげき, けいけんち, せつめい]
const DIFFS = [
  ['easy', 'イージー', .6, .7, .8, '敵が 弱い。のんびり 冒険'],
  ['normal', 'ノーマル', 1, 1, 1, 'いつもの 強さ'],
  ['hard', 'ハード', 1.5, 1.3, 1.3, '敵が 強い。けいけんちも 多い'],
  ['vhard', 'ベリーハード', 2.2, 1.7, 1.6, 'とても 強い。うでに 自信が ある人へ'],
];
const diffOf = id => DIFFS.find(d => d[0] === id) || DIFFS[1];
let runDiff = 'normal';  // いまの 冒険の 強さ（冒険の はじめに きまる）
// 裏モードが ひらいているか（地下100階を クリアした ことが あるか）
const uraOpen = () => !!(loadProg().ura || {}).open || loadClears().some(r => r.depth === 100);
// タイトルで えらんでいる 強さ
function pickedDiff() { if (!uraOpen()) return 'normal'; try { const d = localStorage.getItem('aikotoba_diff'); return diffOf(d)[0]; } catch (e) { return 'normal'; } }
function setPickedDiff(id) { try { localStorage.setItem('aikotoba_diff', id); } catch (e) {} }
// 敵を 1体 つくった ときに よぶ（addMon から）
function applyDiff(m) { if (runDiff === 'normal') return; const [, , hp, atk, exp] = diffOf(runDiff);
  m.hp = m.mhp = Math.max(1, Math.round(m.hp * hp)); m.atk = Math.max(1, Math.round(m.atk * atk)); m.exp = Math.max(1, Math.round(m.exp * exp)); }
// タイトルの 「裏モード」の らん
function diffSelHtml() {
  if (!uraOpen()) return `<p class="tnote urahint">🔒 地下100階の ダンジョンを クリアすると「裏モード」が ひらきます</p>`;
  const cur = pickedDiff();
  return `<div class="tstep ura"><b>裏</b>裏モード：敵の 強さを えらぶ</div><div class="diffsel">${DIFFS.map(([id, nm, , , , ds]) =>
    `<button class="alt${id === cur ? ' on' : ''} d-${id}" data-diff="${id}">${nm}<small>${ds}</small></button>`).join('')}</div>`; }
function wireDiffSel() { document.querySelectorAll('[data-diff]').forEach(b => b.onclick = () => { setPickedDiff(b.dataset.diff);
  document.querySelectorAll('[data-diff]').forEach(x => x.classList.toggle('on', x === b)); sfx('pick'); }); }
const diffTag = id => id && id !== 'normal' ? diffOf(id)[1] : '';
