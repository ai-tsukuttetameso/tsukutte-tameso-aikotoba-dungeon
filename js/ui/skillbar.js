// わざバーと わざ一覧（なかま分けの タブ・よく使う わざ）
'use strict';

// ===== わざの なかま分け =====
// ここに ない わざは、まほうなら「まほう」、それ以外は「こうげき」に 入る
const SKILL_TABS = [['all', 'ぜんぶ'], ['fav', '★よく使う'], ['atk', 'こうげき'], ['mag', 'まほう'], ['safe', '回復・にげる'], ['util', 'べんり・そうび']];
const SKILL_GROUP = { heal: 'safe', smoke: 'safe', mayowase: 'safe', bunshin: 'safe',
  steal: 'util', trapsee: 'util', appraise: 'util', forge: 'util', harden: 'util', anaake: 'util' };
const skillGroup = s => SKILL_GROUP[s.id] || (s.kind === 'まほう' ? 'mag' : 'atk');

// えらんでいる タブ と よく使う わざ（この端末に のこる）
let skTab = 'all';
try { skTab = localStorage.getItem('aikotoba_sktab') || 'all'; } catch (e) {}
function loadFav() { try { return JSON.parse(localStorage.getItem('aikotoba_skfav') || '[]'); } catch (e) { return []; } }
function toggleFav(id) { const f = loadFav(), i = f.indexOf(id); if (i >= 0) f.splice(i, 1); else f.push(id); try { localStorage.setItem('aikotoba_skfav', JSON.stringify(f)); } catch (e) {} }
function setSkTab(t) { skTab = t; try { localStorage.setItem('aikotoba_sktab', t); } catch (e) {} }
// タブの わざ（おぼえる レベル順なので、おぼえた わざが 先に ならぶ）
function tabSkills(t = skTab) { const fav = loadFav(); return mySkills().filter(s => t === 'all' || (t === 'fav' ? fav.includes(s.id) : skillGroup(s) === t)); }
// 中身の ある タブだけ 出す（★よく使う は 1つでも 登録すると 出る）
function skillTabs() { const tabs = SKILL_TABS.filter(([t]) => t === 'all' || tabSkills(t).length); if (!tabs.some(([t]) => t === skTab)) setSkTab('all'); return tabs; }
// いまの タブで、番号キー（わざ一覧）・Shift＋番号（いつでも）で つかう わざ
// わざバーに ならべる わざ（おぼえた わざが 4つまでなら タブなしで ぜんぶ）
const learned = () => mySkills().filter(s => P.lv >= s.lv), barTabs = () => learned().length > 4;
const barSkills = () => barTabs() ? tabSkills().filter(s => P.lv >= s.lv) : learned();
const skillByNum = n => barSkills()[n - 1];
const tabsHtml = (cls) => `<span class="${cls}">${skillTabs().map(([t, l]) => `<button data-sktab="${t}"${t === skTab ? ' class="on"' : ''}>${l}</button>`).join('')}</span>`;

// ===== わざバー（画面の 下） =====
function drawSkillBar() { const ls = barSkills(), many = barTabs();
  setHtml('skbar', `<span class="sklbl">わざ</span>` + (many ? tabsHtml('sktabs') : '') + ls.map((s, i) => `<button data-skill="${s.id}" class="${P.mp < skillCost(s) ? 'ng' : ''}${s.inh ? ' inh' : ''}"${s.el ? ` style="border-color:${ELEM[s.el].color}"` : ''} title="${s.desc}${s.inh ? '（きわめた 職業から ひきつぎ）' : ''}（Shift＋${i + 1}）">${s.name}<small>MP${skillCost(s)}</small></button>`).join('')
    + (many && !ls.length ? '<span class="sknone">この なかまの わざは まだ ない</span>' : '') + `<span class="skmp">MP ${P.mp}/${P.mmp}</span>`); }
document.getElementById('skbar').addEventListener('click', e => { const t = e.target.closest('button[data-sktab]'); if (t) { setSkTab(t.dataset.sktab); drawSkillBar(); if (!invpop.hidden && invpop.dataset.mode === 'skill') drawSkillPop(); return; }
  const b = e.target.closest('button[data-skill]'); if (b && over.hidden) useSkill(b.dataset.skill); });

// ===== わざ一覧（M キー） =====
function drawSkillPop() { invpop.dataset.mode = 'skill'; const fav = loadFav(), ls = tabSkills();
  invpop.innerHTML = `<div class="help">わざ・まほう　MP <b style="color:#7ad8ff">${P.mp}</b>/${P.mmp}　（向いている方向に 出るものが あります）<br>キーボード：番号キーで つかう／Tab で なかまを かえる／M とじる。☆を おすと「★よく使う」に 入る</div>`
    + tabsHtml('sktabs pop')
    + (ls.length ? ls.map((s, i) => { const lock = P.lv < s.lv, poor = P.mp < skillCost(s), on = fav.includes(s.id);
      return `<div class="skrow"><button data-skill="${s.id}" class="${lock || poor ? 'ng' : ''}">${lock ? '－' : i + 1}. ${s.name}　<small>${s.inh ? '<b class="inhtag">ひきつぎ</b> ' : ''}${s.kind}・MP${skillCost(s)}</small>${s.el ? `<span class="el" style="color:${ELEM[s.el].color}">${ELEM[s.el].name}</span>` : ''}<br><small style="color:#a79fb8">${lock ? `レベル${s.lv}で おぼえる` : s.desc}</small></button><button data-fav="${s.id}" class="fav${on ? ' on' : ''}" title="${on ? '★よく使う から はずす' : '★よく使う に 入れる'}">${on ? '★' : '☆'}</button></div>`; }).join('')
      : '<div class="help">この なかまの わざは まだ ない</div>')
    + `<div class="help" style="margin-top:6px">敵には 弱い属性が あります。弱点を つくと ダメージ1.6倍。</div> <button data-close="1">とじる</button>`; }
// わざ一覧の クリック（inventory.js から よぶ）
function skillPopClick(b) { if (b.dataset.sktab) { setSkTab(b.dataset.sktab); drawSkillPop(); drawSkillBar(); return; }
  if (b.dataset.fav) { toggleFav(b.dataset.fav); drawSkillPop(); drawSkillBar(); return; }
  if (b.dataset.skill) { invpop.hidden = true; useSkill(b.dataset.skill); } }
// Tab キー：つぎの なかまへ
function nextSkTab() { const tabs = skillTabs().map(([t]) => t); setSkTab(tabs[(tabs.indexOf(skTab) + 1) % tabs.length]); drawSkillPop(); drawSkillBar(); }
