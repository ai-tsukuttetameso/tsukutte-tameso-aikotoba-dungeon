// 職業の しくみ（えらぶ・とくい・わざ・職業レベル）
'use strict';

// ===== えらんでいる 職業 =====
let curJob = 'senshi';
try { const j = localStorage.getItem('aikotoba_job'); if (JOBS[j]) curJob = j; } catch (e) {}
function setJob(id) { if (!JOBS[id] || !jobOpen(id)) return; curJob = id; try { localStorage.setItem('aikotoba_job', id); } catch (e) {} }
const jobOf = () => JOBS[P.job] || JOBS.senshi;

// 上位の 職業は もとの 2つの とくいを ぜんぶ もつ
function jobPerks(id) { const j = JOBS[id]; if (!j) return []; return j.from ? [...j.from.flatMap(jobPerks), ...(j.perks || [])] : j.perks; }
const jobHas = perk => jobPerks(P.job).includes(perk);
// その職業で おぼえる わざ { id: レベル }（上位は もとの 2つ ＋ とっておき。同じ わざは 早いほう）
function jobSkillLv(id) { const j = JOBS[id]; if (!j) return {}; const out = {};
  for (const src of [...(j.from || []).map(jobSkillLv), j.skills]) for (const [k, lv] of Object.entries(src)) out[k] = Math.min(out[k] || 99, lv);
  return out; }
// いまの 職業の わざ一覧（おぼえる レベル順）。lv は 職業ごとの おぼえる レベル
// きわめた 職業の 自分の わざ（上位職は とっておき）は、ほかの 職業でも「ひきつぎ」で 使える（おぼえる レベルは そのまま）
function inheritedSkills() { const out = {}; for (const id of ALL_JOBS) if (id !== P.job && jobMastered(id)) for (const [k, lv] of Object.entries(JOBS[id].skills)) out[k] = Math.min(out[k] || 99, lv); return out; }
function mySkills() { const t = jobSkillLv(P.job), inh = inheritedSkills();
  for (const [k, lv] of Object.entries(inh)) if (!t[k]) t[k] = lv;
  // 合わせ技：2つの わざを 両方 もっていれば、おそいほうの レベルで おぼえる
  for (const s of SKILLS) if (s.combo && s.combo.every(k => t[k])) t[s.id] = Math.max(...s.combo.map(k => t[k]));
  return SKILLS.filter(s => t[s.id]).map(s => ({ ...s, lv: t[s.id], inh: !jobSkillLv(P.job)[s.id] && !!inh[s.id] })).sort((a, b) => a.lv - b.lv || SKILLS.indexOf(a) - SKILLS.indexOf(b)); }

// ===== 職業レベル（この端末に のこる） =====
function loadJobExp() { try { return JSON.parse(localStorage.getItem('aikotoba_jobexp') || '{}'); } catch (e) { return {}; } }
function jobLvOf(exp) { let lv = 1; while (lv < JOB_MAX && exp >= JOB_NEED[lv]) lv++; return lv; }
const jobLv = id => jobLvOf(loadJobExp()[id] || 0);
const jobMastered = id => jobLv(id) >= JOB_MAX;
const jobOpen = id => !JOBS[id].from || JOBS[id].from.every(jobMastered);
function addJobExp(e) { if (!P.job) return; const a = loadJobExp(), before = jobLvOf(a[P.job] || 0); a[P.job] = (a[P.job] || 0) + e;
  try { localStorage.setItem('aikotoba_jobexp', JSON.stringify(a)); } catch (e2) {}
  const now = jobLvOf(a[P.job]); if (now <= before) return;
  const nm = JOBS[P.job].name;
  if (now >= JOB_MAX) { say(`★ ${nm}を きわめた！（つぎの 冒険から 最大HPが ふえる）`);
    const opened = UPPER_JOBS.concat(TOP_JOBS).filter(u => JOBS[u].from.includes(P.job) && jobOpen(u)); for (const u of opened) say(`★ ${TOP_JOBS.includes(u) ? '最上位' : '上位'}の 職業「${JOBS[u].name}」に なれるように なった！`);
    showBanner(`${nm}を きわめた！`, opened.length ? `「${opened.map(u => JOBS[u].name).join('・')}」が ひらいた` : '★ マスター'); }
  else say(`${nm}の 職業レベルが ${now} に あがった。`); }

// ===== 冒険の はじめに 職業の 力を つける =====
// 職業レベル1つにつき 最大HP＋2（やりこむほど 少し 強くなる）
function applyJobStart() { if (!jobOpen(curJob)) curJob = 'senshi'; P.job = curJob; const lvBonus = (jobLv(P.job) - 1) * 2;
  if (jobHas('tough')) { P.mhp += 10; P.atk += 1; }
  if (jobHas('magic')) { P.mmp += 8; if (!jobHas('tough')) P.mhp -= 4; }
  if (jobHas('brave')) P.mhp += 15;
  P.mhp += lvBonus; P.hp = P.mhp; P.mp = P.mmp; }
// レベルが あがった ときの 上がり方
function jobLevelUp() { if (jobHas('tough')) P.mhp += 2; if (jobHas('magic')) P.mmp += 2; }
// まほうの 倍率（まほうつかいは 1.3倍）
const jobMagic = () => jobHas('magic') ? 1.3 : 1;
// 回復の 道具の 倍率（どうぐつかい）
const jobItemMul = () => jobHas('items') ? 1.5 : 1;
// 矢と 投げる ダメージの 倍率（かりゅうどは 2倍。どうぐつかいの 1.5倍とは 大きいほう）
const jobThrowMul = () => jobHas('hunter') ? 2 : jobItemMul();
// お店の 買う ねだん（あきんどは 3わり引き）
const buyPrice = s => jobHas('merchant') ? Math.max(10, Math.round(s.price * .7 / 10) * 10) : s.price;
