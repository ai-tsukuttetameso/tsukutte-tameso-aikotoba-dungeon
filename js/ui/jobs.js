// タイトルの 職業えらび・やりこみの まとめ
'use strict';

// 職業の 絵を 画像に する（まだ なれない 職業は 黒い かげ）
const _jobIcon = {};
function jobIconUrl(id, locked) { const key = id + (locked ? '_x' : ''); if (_jobIcon[key]) return _jobIcon[key];
  const sp = smooth(heroSprite(id), 1), c = document.createElement('canvas'); c.width = sp.width; c.height = sp.height; const x = c.getContext('2d'); x.drawImage(sp, 0, 0);
  if (locked) { x.globalCompositeOperation = 'source-in'; x.fillStyle = '#0c0818'; x.fillRect(0, 0, c.width, c.height); }
  return _jobIcon[key] = c.toDataURL(); }
const stars = lv => '★'.repeat(lv) + '☆'.repeat(JOB_MAX - lv);
// 「せんし ＋ まほうつかい → まほうけんし → ゆうしゃ」の ような 道すじ
const jobNm = id => jobOpen(id) ? JOBS[id].name : '？？？';
function jobRoute(id) { const j = JOBS[id], next = ALL_JOBS.filter(c => (JOBS[c].from || []).includes(id));
  return `<br><small class="route">${j.from ? j.from.map(jobNm).join(' ＋ ') + ' → ' : ''}<b>${jobNm(id)}</b>${next.length ? ' → ' + next.map(jobNm).join('・') + ' の もと' : ''}</small>`; }
function jobDescHtml(id) { return jobDescBody(id) + jobRoute(id); }
function jobDescBody(id) { const j = JOBS[id];
  if (!jobOpen(id)) return `<b>？？？</b>　${j.from.map(f => JOBS[f].name).join(' と ')} を きわめると なれる（いま ${j.from.map(f => `${JOBS[f].name}${stars(jobLv(f))}`).join('・')}）`;
  const lv = jobLv(id), need = JOB_NEED[lv], have = loadJobExp()[id] || 0;
  const inh = ALL_JOBS.filter(x => x !== id && jobMastered(x)).flatMap(x => Object.keys(JOBS[x].skills)).filter((k, i, a) => a.indexOf(k) === i && !jobSkillLv(id)[k]).map(k => SKILLS.find(s => s.id === k).name);
  return `<b>${j.name}</b> ${stars(lv)}　${j.desc}${inh.length ? `<br><small>ひきつぎ わざ：${inh.join('・')}</small>` : ''}${lv < JOB_MAX ? `<small>（つぎの 職業レベルまで ${need - have}）</small>` : '<small>（きわめた！）</small>'}`; }
// 職業の つながり（トーナメント表）：上の だんの 2つを きわめると 下の 職業、下の だんの 3〜4つを きわめると 最上位
// 線が なるべく 交わらないよう、最上位ごとに まとめて ならべる（げんじゅつしは だいけんじゃ と かげのおう の 両方）
const UP_ORDER = ['mken', 'bmaster', 'dancer', 'hunter', 'kenja', 'renkin', 'akindo', 'genjutsu', 'ninja', 'karakuri'];
const BASE_ORDER = ['smith', 'senshi', 'mage', 'tool', 'thief'];
function jobSelHtml() {
  const btn = id => { const open = jobOpen(id), m = jobMastered(id);
    return `<button class="job${id === curJob ? ' on' : ''}${open ? '' : ' lock'}${JOBS[id].from ? ' up' : ''}" data-job="${id}" title="${open ? JOBS[id].name : '？？？'}"><img src="${jobIconUrl(id, !open)}" alt=""><span>${open ? JOBS[id].name : '？？？'}</span>${m ? '<i>★</i>' : ''}</button>`; };
  return `<div class="jobsel tree"><svg class="jobwires" aria-hidden="true"></svg>`
    + `<div class="jobtier"><em>きほん</em><div class="jobrow">${BASE_ORDER.map(btn).join('')}</div></div>`
    + `<div class="jobtier"><em>上位</em><div class="jobrow up10">${UP_ORDER.map(btn).join('')}</div></div>`
    + `<div class="jobtier"><em>最上位</em><div class="jobrow top">${TOP_JOBS.map(btn).join('')}</div></div>`
    + `</div><p class="jobdesc" id="jobDesc">${jobDescHtml(curJob)}</p>`; }
// えらんだ 職業の「もと」と「さき」を 金色の 線で、ほかは うすい 線で つなぐ
function jobKin(id) { const up = new Set(), down = new Set();
  const goUp = x => { for (const f of JOBS[x].from || []) { up.add(f); goUp(f); } }; goUp(id);
  const goDown = x => { for (const c of ALL_JOBS) if ((JOBS[c].from || []).includes(x)) { down.add(c); goDown(c); } }; goDown(id);
  return new Set([id, ...up, ...down]); }
function drawJobWires(sel) { const box = over.querySelector('.jobsel.tree'); if (!box) return; const svg = box.querySelector('.jobwires');
  const r0 = box.getBoundingClientRect(), k = r0.width / (box.offsetWidth || 1) || 1, kin = jobKin(sel || curJob);
  const pos = id => { const b = box.querySelector(`[data-job="${id}"]`); if (!b) return null; const r = b.getBoundingClientRect();
    return { x: (r.left + r.width / 2 - r0.left) / k, top: (r.top - r0.top) / k, bot: (r.bottom - r0.top) / k }; };
  let cold = '', hot = '';
  for (const c of ALL_JOBS) for (const f of JOBS[c].from || []) { const a = pos(f), b = pos(c); if (!a || !b) continue;
    const my = (a.bot + b.top) / 2, d = `<path d="M${a.x} ${a.bot}C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.top}" class="${jobMastered(f) ? 'ok' : ''}"/>`;
    if (kin.has(c) && kin.has(f)) hot += d; else cold += d; }
  svg.setAttribute('viewBox', `0 0 ${box.offsetWidth} ${box.offsetHeight}`); svg.innerHTML = `<g class="cold">${cold}</g><g class="hot">${hot}</g>`; }
window.addEventListener('resize', () => drawJobWires());
function wireJobSel() { for (const b of over.querySelectorAll('[data-job]')) b.onclick = () => { const id = b.dataset.job;
  if (jobOpen(id)) { setJob(id); for (const o of over.querySelectorAll('[data-job]')) o.classList.toggle('on', o === b); sfx('pick'); render(); }
  document.getElementById('jobDesc').innerHTML = jobDescHtml(id); drawJobWires(id); };
  requestAnimationFrame(() => drawJobWires()); }
// やりこみの まとめ（タイトルの 帯）
function progHtml() { const s = progSummary();
  const wt = wornTitle(); return `<div class="prog">${wt ? `<span>称号 <b>${wt}</b></span>` : ''}${heroChip()}<span>職業 <b>${s.jobs}</b>/${s.jobsAll}</span><span>きわめた <b>${s.mastered}</b></span><span>まもの図鑑 <b>${s.dex}</b>/${s.dexAll}</span><span>さいしん <b>${s.deep ? '地下' + s.deep + '階' : '－'}</b></span><span>クリア <b>${s.clears}</b>回</span></div>`; }
// 冒険の おわりに 出す 職業の すすみぐあい
function jobLineHtml() { if (!P.job) return ''; const lv = jobLv(P.job), have = loadJobExp()[P.job] || 0;
  return `<p class="jobline">職業：${JOBS[P.job].name} ${stars(lv)}${lv < JOB_MAX ? `　つぎまで ${JOB_NEED[lv] - have}` : '　きわめた！'}</p>`; }
