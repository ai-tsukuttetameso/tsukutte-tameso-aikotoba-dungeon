// 効果音（WebAudioでその場で作る）
'use strict';

// ===== 効果音と ゆれ =====
let AC = null, soundOn = true, bgmOn = true, shakeT = 0;
try { const s = localStorage.getItem('aikotoba_sound'); soundOn = s !== 'off'; bgmOn = s !== 'off' && s !== 'nobgm'; } catch (e) {}
function shake(n) { shakeT = Math.max(shakeT, n); }
const SFX = { hit: [[220, .05, 'square'], [110, .06, 'square']], hurt: [[160, .08, 'sawtooth'], [90, .1, 'sawtooth']], pick: [[660, .05, 'square'], [990, .07, 'square']],
  lvup: [[523, .08], [659, .08], [784, .08], [1046, .16]], trap: [[300, .08, 'sawtooth'], [200, .1, 'sawtooth'], [120, .15, 'sawtooth']], stairs: [[392, .07], [330, .07], [262, .12]],
  use: [[523, .05], [784, .08]], zap: [[880, .04, 'sawtooth'], [1320, .04, 'sawtooth'], [660, .06, 'sawtooth']], bad: [[200, .1, 'square'], [150, .18, 'square']],
  alarm: [[880, .12, 'square'], [660, .12, 'square'], [880, .12, 'square'], [660, .12, 'square']], house: [[110, .1, 'sawtooth'], [147, .1, 'sawtooth'], [110, .1, 'sawtooth'], [98, .25, 'sawtooth']],
  dead: [[392, .22, 'square'], [370, .22, 'square'], [349, .22, 'square'], [330, .55, 'square'], [247, .3, 'triangle'], [165, .9, 'triangle']], clear: [[523, .12], [659, .12], [784, .12], [1046, .3], [784, .12], [1046, .6]], siren: [[880, .16, 'square'], [622, .16, 'square'], [880, .16, 'square'], [622, .16, 'square']], boomfx: [[90, .08, 'sawtooth'], [60, .2, 'sawtooth']], kill: [[330, .04, 'square'], [660, .08, 'triangle']], shop: [[784, .06, 'triangle'], [988, .1, 'triangle']], boss: [[73, .3, 'sawtooth'], [69, .45, 'sawtooth']] };
function sfx(n) { if (typeof SOUND !== 'undefined' && SOUND[n]) { if (sndCtx()) try { SOUND[n](); } catch (e) {} return; }
  if (!soundOn || !SFX[n]) return; try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
  let t = AC.currentTime; for (const [f, d, type] of SFX[n]) { const o = AC.createOscillator(), gn = AC.createGain(); o.type = type || 'triangle'; o.frequency.value = f;
    gn.gain.setValueAtTime(.07, t); gn.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(gn).connect(AC.destination); o.start(t); o.stop(t + d + .02); t += d * .9; } } catch (e) {} }

// 階段を おりる 音：コツ・コツ・コツ・コツと 足音が だんだん ひくく なり、さいごに ポロン
function stairsSound() { if (!soundOn) return; try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
  const t0 = AC.currentTime + .02;
  const len = Math.floor(AC.sampleRate * .05), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  for (let k = 0; k < 5; k++) { const t = t0 + k * .12, f = 260 - k * 35;
    // 足音の「コツ」：ひくい ポンと 石を けった ざらっと した 音
    const o = AC.createOscillator(), gn = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .5, t + .07);
    gn.gain.setValueAtTime(.2, t); gn.gain.exponentialRampToValueAtTime(.001, t + .08); o.connect(gn).connect(AC.destination); o.start(t); o.stop(t + .1);
    const ns = AC.createBufferSource(), fl = AC.createBiquadFilter(), ng = AC.createGain(); ns.buffer = buf; fl.type = 'bandpass'; fl.frequency.value = 1800 - k * 220; ng.gain.value = .22;
    ns.connect(fl).connect(ng).connect(AC.destination); ns.start(t); }
  // 新しい 階に ついた 合図（下がっていく 3つの 音）
  [[784, 0], [587, .09], [392, .18]].forEach(([f, at]) => { const t = t0 + .66 + at, o = AC.createOscillator(), gn = AC.createGain(); o.type = 'triangle'; o.frequency.value = f;
    gn.gain.setValueAtTime(.08, t); gn.gain.exponentialRampToValueAtTime(.001, t + .3); o.connect(gn).connect(AC.destination); o.start(t); o.stop(t + .32); }); } catch (e) {} }

// おとし穴に おちる 音：ひゅ〜〜と 下がる 音のあとに ドスン
function fallSound() { if (!soundOn) return; try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
  const t = AC.currentTime + .02, o = AC.createOscillator(), gn = AC.createGain(); o.type = 'triangle';
  o.frequency.setValueAtTime(1400, t); o.frequency.exponentialRampToValueAtTime(160, t + .75);
  gn.gain.setValueAtTime(.0001, t); gn.gain.linearRampToValueAtTime(.09, t + .05); gn.gain.setValueAtTime(.09, t + .6); gn.gain.exponentialRampToValueAtTime(.001, t + .8);
  o.connect(gn).connect(AC.destination); o.start(t); o.stop(t + .82);
  // ドスン：ひくい 音と ざらざらした 音
  const th = t + .8, b = AC.createOscillator(), bg = AC.createGain(); b.type = 'sine'; b.frequency.setValueAtTime(120, th); b.frequency.exponentialRampToValueAtTime(40, th + .3);
  bg.gain.setValueAtTime(.25, th); bg.gain.exponentialRampToValueAtTime(.001, th + .35); b.connect(bg).connect(AC.destination); b.start(th); b.stop(th + .4);
  const len = Math.floor(AC.sampleRate * .25), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const ns = AC.createBufferSource(), ng = AC.createGain(); ns.buffer = buf; ng.gain.value = .18; ns.connect(ng).connect(AC.destination); ns.start(th); } catch (e) {} }

// レベルアップの ファンファーレ（オリジナルの ふし）。鳴っている あいだは BGMを 少し とめる
let bgmHoldUntil = 0;
function levelUpJingle() { if (!soundOn) return; try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
  const t0 = AC.currentTime + .03; bgmHoldUntil = t0 + 1.5;
  const note = (n, at, d, type, v) => { const o = AC.createOscillator(), gn = AC.createGain(); o.type = type; o.frequency.value = 440 * Math.pow(2, (n - 69) / 12);
    gn.gain.setValueAtTime(.0001, t0 + at); gn.gain.linearRampToValueAtTime(v, t0 + at + .015); gn.gain.setValueAtTime(v, t0 + at + d * .7); gn.gain.exponentialRampToValueAtTime(.0005, t0 + at + d);
    o.connect(gn).connect(AC.destination); o.start(t0 + at); o.stop(t0 + at + d + .03); };
  // かけあがる 音 → ためて → 明るい 和音で しめる
  [[67, 0], [72, .09], [76, .18], [79, .27], [84, .36]].forEach(([n, at]) => note(n, at, .12, 'square', .07));
  note(81, .52, .14, 'square', .07); note(83, .66, .14, 'square', .07);
  for (const n of [72, 76, 79, 84]) note(n, .82, .62, n === 84 ? 'square' : 'triangle', n === 84 ? .08 : .06);
  note(48, .82, .62, 'triangle', .09); } catch (e) {} }
