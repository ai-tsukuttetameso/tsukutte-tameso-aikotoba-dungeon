// BGM（その場で作る ピコピコ音楽。すべてオリジナル）
'use strict';

// ===== BGM（その場で作る ピコピコ音楽。すべてオリジナル） =====
const SONGS = {
  shop: { bpm: 104, mel: '72 - 76 - 79 - 76 - 77 - 76 74 72 - - - 74 - 76 - 77 - 74 - 71 - 74 - 79 - 77 76 74 - - - 0 0',
    roots: [48, 45, 41, 43], chords: 'M m M M', bassPat: [0, -1, 7, -1, 12, -1, 7, -1], drum: '. h . h . h . h', wave: 'triangle', vol: .05 },
  explore: { bpm: 116, mel: '62 - 69 - 67 65 64 62 60 - 64 - 67 - 65 64 62 - 69 - 72 71 69 67 69 - - - 0 0 0 0 65 - 69 - 72 - 74 72 71 - 67 - 64 - 67 69 70 - 69 67 65 - 64 65 62 - - - 0 0 0 0',
    roots: [38, 36, 38, 33, 41, 43, 46, 38], chords: 'm M m m M m M m', bassPat: [0, -1, 12, -1, 7, -1, 12, -1], drum: 'k h s h k h s h', wave: 'square', vol: .045 },
  danger: { bpm: 168, mel: '64 64 67 64 71 - 70 - 64 64 67 64 72 - 71 - 76 - 74 - 72 - 71 - 70 - 71 - 67 - 64 -',
    roots: [40, 40, 36, 35], chords: 'm m M M', bassPat: [0, 0, 12, 0, 0, 0, 12, 0], drum: 'k h s h k k s h', wave: 'sawtooth', vol: .035 },
  title: { bpm: 96, mel: '69 - - 72 71 - 69 - 67 - 64 - 65 - 67 - 69 - - 72 74 - 76 - 74 - 72 - 71 - - - 72 - - 71 69 - 67 - 65 - 64 - 65 - 67 - 69 - 71 - 72 - 74 - 76 - - - - - 0 0',
    roots: [45, 43, 41, 40, 41, 43, 45, 40], chords: 'm M M M M M m M', bassPat: [0, -1, -1, -1, 7, -1, 12, -1], drum: 'k . h . s . h .', wave: 'square', vol: .04 },
  boss: { bpm: 144, mel: '57 - 60 - 63 - 62 - 57 - 60 - 66 - 65 - 69 - 68 - 66 - 63 - 62 - 63 - 60 - 0 -',
    roots: [33, 34, 36, 35], chords: 'm M m d', bassPat: [0, 0, 0, 12, 0, 0, 6, 0], drum: 'k k s h k k s s', wave: 'square', vol: .04 },
};
for (const s of Object.values(SONGS)) { s.notes = s.mel.split(' ').map(x => x === '-' ? -1 : +x); s.chordList = s.chords.split(' '); }
// 和音の かたち（根音からの 半音の 数）：M＝明るい、m＝さびしい、d＝ぶきみ
const CHORD = { M: [0, 4, 7], m: [0, 3, 7], d: [0, 3, 6] };
// ふわっと 鳴る やわらかい音（和音の 下じき用）
function padTone(f, t, d, v) { const o = AC.createOscillator(), gn = AC.createGain(); o.type = 'triangle'; o.frequency.value = f;
  gn.gain.setValueAtTime(.0001, t); gn.gain.linearRampToValueAtTime(v, t + .06); gn.gain.setValueAtTime(v, t + d * .75); gn.gain.exponentialRampToValueAtTime(.0005, t + d);
  o.connect(gn).connect(AC.destination); o.start(t); o.stop(t + d + .02); }
const mf = n => 440 * Math.pow(2, (n - 69) / 12);
let curSong = null, bStep = 0, bNext = 0, noiseBuf = null;
function startAudio() { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {} }
addEventListener('pointerdown', startAudio); addEventListener('keydown', startAudio);
function tone(f, t, d, type, v) { const o = AC.createOscillator(), gn = AC.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(v, t); gn.gain.setValueAtTime(v, t + d * .7); gn.gain.exponentialRampToValueAtTime(.0005, t + d); o.connect(gn).connect(AC.destination); o.start(t); o.stop(t + d + .02); }
function drumHit(kind, t) { if (kind === 'k') { const o = AC.createOscillator(), gn = AC.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + .1); gn.gain.setValueAtTime(.09, t); gn.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(gn).connect(AC.destination); o.start(t); o.stop(t + .14); return; }
  if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate * .2, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const s = AC.createBufferSource(), gn = AC.createGain(), len = kind === 's' ? .09 : .03; s.buffer = noiseBuf; gn.gain.setValueAtTime(kind === 's' ? .05 : .02, t); gn.gain.exponentialRampToValueAtTime(.001, t + len); s.connect(gn).connect(AC.destination); s.start(t); s.stop(t + len + .01); }
function wantSong() { if (!over.hidden) return overKind === 'title' ? 'title' : null; if (!G || G.over) return null; if (G.f === LAST) return 'boss';
  if (G.shop && ((!invpop.hidden && invpop.dataset.mode === 'shop') || (G.shopRoom && roomOf2(G.shopRoom, P.x, P.y)))) return 'shop';
  const awake = G.mons.filter(m => !m.sleep && visible(m.x, m.y));
  if (G.mons.some(m => m.t === 'keeper') || awake.length >= 4 || (G.houseWoke && G.mons.some(m => roomOf2(G.house, m.x, m.y)))) return 'danger';
  return 'explore'; }
function bgmTick() {
  if (!AC || AC.state !== 'running') return;
  const w = soundOn && bgmOn ? wantSong() : null;
  if (w !== curSong) { curSong = w; bStep = 0; bNext = AC.currentTime + .08; }
  if (!curSong) return;
  const s = SONGS[curSong], sd = 60 / s.bpm / 2; if (bNext < AC.currentTime - .3) bNext = AC.currentTime + .05;
  while (bNext < AC.currentTime + .2) { if (bNext < bgmHoldUntil) { bStep++; bNext += sd; continue; } const i = bStep % s.notes.length, n = s.notes[i];
    if (n > 0) { let len = 1; while (s.notes[(i + len) % s.notes.length] === -1 && len < 8) len++; tone(mf(n), bNext, sd * len * .95, s.wave, s.vol); }
    const bar = Math.floor(i / 8), root = s.roots[bar % s.roots.length], bp = s.bassPat[i % 8];
    // 和音：小節の はじめに のばす音（3声）、4拍目の うらに 短い きざみ
    const ch = CHORD[s.chordList[bar % s.chordList.length]] || CHORD.M, base = root < 40 ? root + 24 : root + 12;
    if (i % 8 === 0) for (const iv of ch) padTone(mf(base + iv), bNext, sd * 8 * .96, s.vol * .32);
    if (i % 8 === 2 || i % 8 === 6) for (const iv of ch) tone(mf(base + 12 + iv), bNext, sd * .45, 'square', s.vol * .12); if (bp >= 0) tone(mf(root + bp), bNext, sd * .9, 'triangle', .07);
    const dk = s.drum.split(' ')[i % 8]; if (dk !== '.' && dk) drumHit(dk, bNext);
    bStep++; bNext += sd; } }
setInterval(bgmTick, 50);
setInterval(() => { if (P.pinch && G && !G.over && over.hidden) sfx('siren'); }, 2600);
