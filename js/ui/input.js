// キーボード・十字ボタン・画面タップの操作
'use strict';

const KEYS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], q: [-1, -1], e: [1, -1], z: [-1, 1], c: [1, 1], ' ': [0, 0] };
let throwMode = false, invSel = 0;
addEventListener('keydown', ev => {
  if (!over.hidden) { if (ev.target && ev.target.tagName === 'INPUT') return; if (document.getElementById('startPick')) { if (ev.key === 'Escape') closeStartPick(); return; } if (ev.key === 'Enter') { ev.preventDefault(); newGame('random'); render(); } return; }
  if (ev.key === 'Escape') { if (invpop.hidden && over.hidden && !throwMode) openQuit(); else invpop.hidden = true; throwMode = false; return; }
  if (!invpop.hidden && invpop.dataset.mode === 'inv') { const n = P.inv.length; const kk = ev.key.toLowerCase();
    if (ev.key === 'ArrowDown' || kk === 's') { invSel = Math.min(n - 1, invSel + 1); drawInvPop(); ev.preventDefault(); return; }
    if (ev.key === 'ArrowUp' || kk === 'w') { invSel = Math.max(0, invSel - 1); drawInvPop(); ev.preventDefault(); return; }
    if (ev.key === 'Enter') { ev.preventDefault(); invpop.hidden = true; useItem(invSel); return; }
    if (kk === 't') { invpop.hidden = true; throwItem(invSel); return; }
    if (kk === 'x') { invpop.hidden = true; dropItem(invSel); return; }
    if (kk === 'i') { invpop.hidden = true; return; }
    if (kk === 'r') { sortInv(); return; } }
  if (ev.key.toLowerCase() === 'r' && invpop.hidden) { sortInv(); return; }
  if (ev.key.toLowerCase() === 'f' && invpop.hidden && over.hidden) { attackFront(); return; }
  if (ev.key.toLowerCase() === 'b' && (invpop.hidden || invpop.dataset.mode === 'inv')) { openBags(); return; }
  if (!invpop.hidden && invpop.dataset.mode === 'skill') { if (ev.key === 'Tab') { ev.preventDefault(); nextSkTab(); return; } if (/^[1-9]$/.test(ev.key)) { const s = tabSkills().filter(x => P.lv >= x.lv)[+ev.key - 1]; if (s) { invpop.hidden = true; useSkill(s.id); } return; } if (ev.key.toLowerCase() === 'm') { invpop.hidden = true; return; } }
  if (ev.shiftKey && /^Digit[1-9]$/.test(ev.code)) { const s = skillByNum(+ev.code.slice(5)); if (s) { ev.preventDefault(); invpop.hidden = true; useSkill(s.id); } return; }
  if (ev.key.toLowerCase() === 'm' && invpop.hidden) { invpop.hidden = false; drawSkillPop(); return; }
  if (ev.key.toLowerCase() === 'i' && invpop.hidden) { invSel = 0; invpop.hidden = false; drawInvPop(); return; }
  const k = KEYS[ev.key] || KEYS[ev.key.toLowerCase()];
  if (k && !invpop.hidden) { invpop.hidden = true; }
  if (k) { ev.preventDefault(); if (ev.shiftKey && (k[0] || k[1])) dash(k[0], k[1]); else act(k[0], k[1]); return; }
  if (ev.key === 'Enter' || ev.key === '>') { ev.preventDefault(); descend(); return; }
  if (ev.key.toLowerCase() === 't') { throwMode = true; say('なげる物の 番号を おしてください。'); render(); return; }
  if (/^[1-9]$/.test(ev.key) || ev.key === '0' || ev.key === '-' || ev.key === '^' || ev.key === '=') { const i = ev.key === '0' ? 9 : ev.key === '-' ? 10 : (ev.key === '^' || ev.key === '=') ? 11 : +ev.key - 1; if (throwMode) { throwMode = false; throwItem(i); } else useItem(i); }
});
// 押しっぱなしで ダッシュ
let holdTimer = 0, dashed = false;
function pressMove(x, y) { if (!over.hidden) return; if (!invpop.hidden) invpop.hidden = true;
  if (!x && !y && P.x === G.stairs.x && P.y === G.stairs.y) { descend(); return; } act(x, y);
  clearTimeout(holdTimer); if (x || y) holdTimer = setTimeout(() => { dash(x, y); }, 380); }
const stopHold = () => clearTimeout(holdTimer);
addEventListener('pointerup', stopHold); addEventListener('pointercancel', stopHold);
const pad = document.getElementById('pad');
[['↖', -1, -1], ['↑', 0, -1], ['↗', 1, -1], ['←', -1, 0], ['・', 0, 0], ['→', 1, 0], ['↙', -1, 1], ['↓', 0, 1], ['↘', 1, 1]].forEach(([l, x, y]) => {
  const b = document.createElement('button'); b.textContent = l; b.setAttribute('aria-label', l === '・' ? '足ぶみ' : '移動');
  b.addEventListener('pointerdown', e => { e.preventDefault(); pressMove(x, y); }); b.addEventListener('pointerleave', stopHold); pad.appendChild(b); });

const downBtn = document.getElementById('downBtn'), invpop = document.getElementById('invpop');
downBtn.onclick = () => descend();
document.getElementById('waitBtn').onclick = () => { if (!over.hidden) return; act(0, 0); };
document.getElementById('invBtn').onclick = () => { if (!over.hidden) return; if (!invpop.hidden && invpop.dataset.mode === 'inv') { invpop.hidden = true; return; } invpop.hidden = false; drawInvPop(); };
document.getElementById('skillBtn').onclick = () => { if (!over.hidden) return; if (!invpop.hidden && invpop.dataset.mode === 'skill') { invpop.hidden = true; return; } invpop.hidden = false; drawSkillPop(); };
document.getElementById('logBtn').onclick = () => { if (!over.hidden) return; if (!invpop.hidden && invpop.dataset.mode === 'log') { invpop.hidden = true; return; } invpop.hidden = false; invpop.dataset.mode = 'log';
  invpop.innerHTML = `<div class="help">これまでの ログ（新しい順）</div>` + logAll.slice().reverse().map(l => `<div class="lg">${l}</div>`).join('') + ' <button data-close="1">とじる</button>'; };
document.getElementById('atkBtn').onclick = () => { if (!over.hidden) return; invpop.hidden = true; attackFront(); };
const sndBtn = document.getElementById('sndBtn');
function drawSnd() { sndBtn.textContent = !soundOn ? '音 なし' : bgmOn ? '音 ぜんぶ' : 'BGM なし'; }
sndBtn.onclick = () => { if (soundOn && bgmOn) bgmOn = false; else if (soundOn) soundOn = false; else { soundOn = true; bgmOn = true; } try { localStorage.setItem('aikotoba_sound', !soundOn ? 'off' : bgmOn ? 'on' : 'nobgm'); } catch (e) {} drawSnd(); sfx('use'); }; drawSnd();
cv.addEventListener('pointerdown', e => {
  if (!over.hidden || !invpop.hidden) return; e.preventDefault();
  const r = cv.getBoundingClientRect(); const tx = (e.clientX - r.left) / r.width * VW, ty = (e.clientY - r.top) / r.height * VH;
  const px = (VW >> 1) + .5, py = (VH >> 1) + .5; const vx = tx - px, vy = ty - py;
  if (Math.abs(vx) < .6 && Math.abs(vy) < .6) { pressMove(0, 0); return; }
  const a = Math.atan2(vy, vx), oct = Math.round(a / (Math.PI / 4));
  const dirs = { 0: [1, 0], 1: [1, 1], 2: [0, 1], 3: [-1, 1], 4: [-1, 0], '-4': [-1, 0], '-3': [-1, -1], '-2': [0, -1], '-1': [1, -1] };
  const [dx, dy] = dirs[oct]; pressMove(dx, dy);
});
