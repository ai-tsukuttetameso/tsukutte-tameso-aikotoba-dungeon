// タイトルの 職業えらび・やりこみの まとめ
'use strict';

// 職業の 絵を 画像に する（まだ なれない 職業は 黒い かげ）
const _jobIcon = {};
function jobIconUrl(id, locked) { const key = id + (locked ? '_x' : ''); if (_jobIcon[key]) return _jobIcon[key];
  const sp = smooth(heroSprite(id), 1), c = document.createElement('canvas'); c.width = sp.width; c.height = sp.height; const x = c.getContext('2d'); x.drawImage(sp, 0, 0);
  if (locked) { x.globalCompositeOperation = 'source-in'; x.fillStyle = '#0c0818'; x.fillRect(0, 0, c.width, c.height); }
  return _jobIcon[key] = c.toDataURL(); }
const stars = lv => '★'.repeat(lv) + '☆'.repeat(JOB_MAX - lv);
function jobDescHtml(id) { const j = JOBS[id];
  if (!jobOpen(id)) return `<b>？？？</b>　${j.from.map(f => JOBS[f].name).join(' と ')} を きわめると なれる（いま ${j.from.map(f => `${JOBS[f].name}${stars(jobLv(f))}`).join('・')}）`;
  const lv = jobLv(id), need = JOB_NEED[lv], have = loadJobExp()[id] || 0;
  const inh = BASE_JOBS.concat(UPPER_JOBS).filter(x => x !== id && jobMastered(x)).flatMap(x => Object.keys(JOBS[x].skills)).filter((k, i, a) => a.indexOf(k) === i && !jobSkillLv(id)[k]).map(k => SKILLS.find(s => s.id === k).name);
  return `<b>${j.name}</b> ${stars(lv)}　${j.desc}${inh.length ? `<br><small>ひきつぎ わざ：${inh.join('・')}</small>` : ''}${lv < JOB_MAX ? `<small>（つぎの 職業レベルまで ${need - have}）</small>` : '<small>（きわめた！）</small>'}`; }
function jobSelHtml() {
  const btn = id => { const open = jobOpen(id), m = jobMastered(id);
    return `<button class="job${id === curJob ? ' on' : ''}${open ? '' : ' lock'}${JOBS[id].from ? ' up' : ''}" data-job="${id}" title="${open ? JOBS[id].name : '？？？'}"><img src="${jobIconUrl(id, !open)}" alt=""><span>${open ? JOBS[id].name : '？？？'}</span>${m ? '<i>★</i>' : ''}</button>`; };
  return `<div class="jobsel"><div class="jobrow">${BASE_JOBS.map(btn).join('')}</div><div class="jobrow">${UPPER_JOBS.slice(0, 5).map(btn).join('')}</div><div class="jobrow">${UPPER_JOBS.slice(5).map(btn).join('')}</div></div><p class="jobdesc" id="jobDesc">${jobDescHtml(curJob)}</p>`; }
function wireJobSel() { for (const b of over.querySelectorAll('[data-job]')) b.onclick = () => { const id = b.dataset.job;
  if (jobOpen(id)) { setJob(id); for (const o of over.querySelectorAll('[data-job]')) o.classList.toggle('on', o === b); sfx('pick'); render(); }
  document.getElementById('jobDesc').innerHTML = jobDescHtml(id); }; }
// やりこみの まとめ（タイトルの 帯）
function progHtml() { const s = progSummary();
  return `<div class="prog">${heroChip()}<span>職業 <b>${s.jobs}</b>/${s.jobsAll}</span><span>きわめた <b>${s.mastered}</b></span><span>まもの図鑑 <b>${s.dex}</b>/${s.dexAll}</span><span>さいしん <b>${s.deep ? '地下' + s.deep + '階' : '－'}</b></span><span>クリア <b>${s.clears}</b>回</span></div>`; }
// 冒険の おわりに 出す 職業の すすみぐあい
function jobLineHtml() { if (!P.job) return ''; const lv = jobLv(P.job), have = loadJobExp()[P.job] || 0;
  return `<p class="jobline">職業：${JOBS[P.job].name} ${stars(lv)}${lv < JOB_MAX ? `　つぎまで ${JOB_NEED[lv] - have}` : '　きわめた！'}</p>`; }
