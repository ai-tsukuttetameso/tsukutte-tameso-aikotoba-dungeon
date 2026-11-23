// 場面ごとの 効果音（買う・売る・こうげき・ダメージ・道具・わざ）。すべて WebAudio で その場で つくる オリジナル
'use strict';

// ===== 音の 部品 =====
// tone：f0 から f1 へ 音の 高さを かえながら dur 秒 鳴らす ／ noise：ざらざらした 音（filter で 音色を かえる）
function sndCtx() { if (!soundOn) return null; try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } }
function tone(at, f0, f1, dur, type = 'square', vol = .07) { const o = AC.createOscillator(), gn = AC.createGain(), t = AC.currentTime + .01 + at; o.type = type;
  o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  gn.gain.setValueAtTime(.0001, t); gn.gain.linearRampToValueAtTime(vol, t + .008); gn.gain.exponentialRampToValueAtTime(.0005, t + dur);
  o.connect(gn).connect(AC.destination); o.start(t); o.stop(t + dur + .03); }
let _noiseBuf = null;
function noise(at, dur, vol = .15, ftype = 'bandpass', f0 = 1500, f1 = f0, q = 1) { if (!_noiseBuf) { const n = AC.sampleRate; _noiseBuf = AC.createBuffer(1, n, n); const d = _noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }
  const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), gn = AC.createGain(), t = AC.currentTime + .01 + at; s.buffer = _noiseBuf; fl.type = ftype; fl.Q.value = q;
  fl.frequency.setValueAtTime(f0, t); if (f1 !== f0) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
  gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.0005, t + dur); s.connect(fl).connect(gn).connect(AC.destination); s.start(t); s.stop(t + dur + .02); }

// ===== 効果音の 一覧（sfx('名前') で 鳴る。ここに ない 名前は sfx.js の SFX を つかう） =====
const SOUND = {
  // お店
  buy: () => { tone(0, 1318, 1318, .07, 'square', .06); tone(.07, 1760, 1760, .16, 'square', .06); noise(.07, .12, .05, 'highpass', 6000); },        // チャリーン
  sell: () => { [1760, 1568, 1318, 1046].forEach((f, i) => tone(i * .055, f, f, .09, 'triangle', .07)); noise(0, .2, .06, 'highpass', 5000); },       // ジャラジャラ
  pay: () => { tone(0, 988, 988, .06, 'square', .05); tone(.06, 1318, 1318, .06, 'square', .05); tone(.12, 1976, 1976, .22, 'triangle', .06); },   // まいど！
  // こうげき・ダメージ
  hit: () => { noise(0, .07, .22, 'bandpass', 2200, 700, 1.2); tone(0, 190, 70, .09, 'sine', .16); },                                                // ズバッ
  crit: () => { noise(0, .1, .25, 'bandpass', 3000, 600, 1); tone(0, 220, 60, .14, 'sine', .2); tone(.04, 1760, 2637, .18, 'square', .05); },        // ズバァン！キラーン
  hurt: () => { noise(0, .16, .22, 'lowpass', 900, 200); tone(0, 260, 90, .16, 'sawtooth', .07); },                                                  // ドスッ
  dodge: () => { noise(0, .14, .12, 'highpass', 1500, 5000, .7); },                                                                                    // ヒュッ
  kill: () => { noise(0, .18, .18, 'lowpass', 2500, 300); [660, 523, 392].forEach((f, i) => tone(.03 + i * .06, f, f * .9, .08, 'square', .05)); },  // ポワン
  // 道具
  eat: () => { for (let i = 0; i < 3; i++) { noise(i * .12, .06, .12, 'bandpass', 700, 500, 2); tone(i * .12, 180, 140, .06, 'sine', .08); } tone(.38, 784, 1046, .14, 'triangle', .06); }, // もぐもぐ ごくん
  drink: () => { [0, .07, .14, .21].forEach((at, i) => tone(at, 400 + i * 150, 700 + i * 200, .07, 'sine', .09)); tone(.3, 1046, 1568, .2, 'triangle', .05); },               // ぽこぽこ キラッ
  scroll: () => { noise(0, .18, .1, 'highpass', 3000, 6000, .7); tone(.12, 880, 880, .1, 'triangle', .06); tone(.2, 1318, 1318, .22, 'triangle', .06); },                     // バサッ ピロン
  wand: () => { tone(0, 600, 2400, .18, 'sawtooth', .05); noise(.05, .16, .07, 'bandpass', 4000, 1200, 2); },                                       // ビューン
  use: () => { tone(0, 523, 523, .05, 'triangle', .07); tone(.05, 784, 784, .1, 'triangle', .07); },
  // わざ・まほう
  fire: () => { noise(0, .45, .22, 'lowpass', 400, 3000, 1); tone(0, 110, 220, .4, 'sawtooth', .04); },                                               // ゴオォッ
  ice: () => { [2093, 2637, 3136, 4186].forEach((f, i) => tone(i * .05, f, f, .18, 'triangle', .05)); noise(0, .3, .05, 'highpass', 7000); },         // キンキラーン
  thunder: () => { noise(0, .08, .35, 'highpass', 2000); noise(.06, .5, .25, 'lowpass', 1200, 80); tone(.06, 90, 40, .45, 'sawtooth', .08); },      // バリバリ ドーン
  heal: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(i * .06, f, f, .3, 'sine', .07)); },                                               // ポロロン
  slash: () => { noise(0, .16, .2, 'bandpass', 800, 5000, 1.5); },                                                                                      // シュバッ
  spin: () => { noise(0, .35, .18, 'bandpass', 600, 4000, 1.2); noise(.18, .2, .14, 'bandpass', 4000, 1200, 1.2); },                                  // ブゥン
  shadow: () => { tone(0, 220, 110, .4, 'square', .04); tone(.02, 233, 117, .4, 'square', .04); noise(0, .35, .08, 'bandpass', 500, 300, 4); },      // ぬぬぬ…
  smoke: () => { noise(0, .5, .2, 'lowpass', 2000, 300); tone(.2, 1318, 659, .25, 'triangle', .04); },                                                // ボフッ
  boom: () => { noise(0, .7, .4, 'lowpass', 1800, 60); tone(0, 120, 30, .6, 'sine', .25); },                                                          // ドカーン
  coin: () => { [1568, 2093, 1568, 2637].forEach((f, i) => tone(i * .05, f, f, .1, 'square', .045)); },                                               // チャリチャリン
  sleep: () => { [784, 659, 523, 392].forEach((f, i) => tone(i * .12, f, f * .98, .22, 'sine', .06)); },                                               // ふわぁ〜
  forge: () => { for (let i = 0; i < 2; i++) { tone(i * .18, 1760, 1700, .2, 'square', .05); noise(i * .18, .05, .2, 'highpass', 4000); } },          // カン！カン！
  look: () => { tone(0, 880, 1760, .12, 'triangle', .06); tone(.12, 1760, 1760, .14, 'triangle', .05); },                                             // ピコーン
};
// わざごとの 音（ここに ない わざは 属性か しゅるいで きめる）
const SKILL_SOUND = { heal: 'heal', double: 'slash', triple: 'slash', spin: 'spin', bladedance: 'spin', steal: 'dodge', trapsee: 'look', appraise: 'look', smoke: 'smoke',
  forge: 'forge', harden: 'forge', anaake: 'forge', kagenui: 'shadow', mayowase: 'sleep', bomb: 'boom', meteor: 'boom', goldtouch: 'coin', zeninage: 'coin', hissatsu: 'crit', snipe: 'slash', mblade: 'fire' };
const skillSound = s => SKILL_SOUND[s.id] || s.el || (s.kind === 'まほう' ? 'wand' : 'slash');
// 道具の 音（弁当は 食べる、草と やくそうは のむ、おふだ、杖）
const itemSound = it => it.food || it.spr === 'bread' ? 'eat' : it.cat === 'grass' || it.spr === 'herb' ? 'drink' : it.cat === 'scroll' ? 'scroll' : it.cat === 'wand' ? 'wand' : 'use';
