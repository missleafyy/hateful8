// The Hateful Eight — original chip score + sound effects (engine/audio.js).
// Note tokens: <note><octave>[.len in 16ths]; r = rest. Every track in a song should be the same length.
(function () {
'use strict';
const S = Sprout;
const rep = (s, n) => Array(n).fill(s).join(' ');

S.songs = {
  // title / main theme: a low, patient ostinato in D minor with a lonely high line on top
  main: { bpm: 72, tracks: [
    { wave: 'triangle', vol: 0.2, gate: 0.7, notes: rep('D2.2 D2.2 D2.2 D2.2 D2.2 D2.2 C#2.2 D2.2', 4) + ' ' + rep('A#1.2 A#1.2 A#1.2 A#1.2 A1.2 A1.2 A1.2 A1.2', 4) },
    { wave: 'pulse12', vol: 0.035, gate: 0.95, attack: 0.08, notes:
      'r.16 A4.12 G4.2 F4.2 E4.16 r.16 ' +
      'r.8 D5.8 C#5.6 A4.2 A#4.16 A4.16 r.8' },
    { wave: 'sine', vol: 0.05, gate: 0.9, attack: 0.2, notes: 'D3.32 A2.32 A#2.32 A2.32' },
  ] },
  // the road in the snow: sparse, cold, wide
  snow: { bpm: 60, tracks: [
    { wave: 'triangle', vol: 0.16, gate: 0.6, notes: rep('E2.4 r.4 E2.2 r.2 B1.4 r.4 E2.4 r.4 C2.4 r.4 B1.4', 2) },
    { wave: 'pulse12', vol: 0.03, gate: 0.95, attack: 0.15, notes: 'r.8 B4.8 C5.4 B4.4 G4.8 F#4.16 r.8 E4.8 G4.4 F#4.4 D#4.8 E4.16' },
    { wave: 'sine', vol: 0.04, attack: 0.3, notes: 'E3.16 G3.16 E3.16 D#3.16 E3.16 C3.16 B2.16 B2.16' },
  ] },
  // inside Minnie's: a slow guitar figure, warm but uneasy
  cabin: { bpm: 84, tracks: [
    { wave: 'triangle', vol: 0.15, gate: 0.5, notes: rep('A2.2 E3.2 A3.2 E3.2 C4.2 E3.2 A3.2 E3.2', 2) + ' ' + rep('F2.2 C3.2 F3.2 C3.2 A3.2 C3.2 F3.2 C3.2', 1) + ' ' + rep('E2.2 B2.2 E3.2 B2.2 G#3.2 B2.2 E3.2 B2.2', 1) },
    { wave: 'pulse25', vol: 0.03, gate: 0.6, notes: 'r.8 E5.4 D5.2 C5.2 B4.8 A4.8 r.8 C5.4 B4.2 A4.2 G#4.16 r.8' },
    { wave: 'sine', vol: 0.03, notes: 'A3.16 A3.16 F3.16 E3.16' },
  ] },
  // investigation: a heartbeat and a held, wavering high note
  tension: { bpm: 96, tracks: [
    { wave: 'triangle', vol: 0.22, gate: 0.3, notes: rep('D2.1 r.1 D2.1 r.5 r.8', 4) },
    { wave: 'pulse12', vol: 0.02, gate: 1, attack: 0.3, notes: 'A5.16 A#5.16 A5.16 G#5.16' },
    { wave: 'sine', vol: 0.04, attack: 0.4, notes: 'D3.32 C#3.32' },
  ] },
  // quick-draw: ticking clock + rising semitones
  duel: { bpm: 120, tracks: [
    { wave: 'noise', vol: 0.05, filter: 'highpass', gate: 0.2, notes: rep('C6.4', 16) },
    { wave: 'triangle', vol: 0.2, gate: 0.9, notes: 'D2.16 D#2.16 E2.16 F2.16' },
    { wave: 'pulse12', vol: 0.03, gate: 1, attack: 0.2, notes: 'r.16 A4.16 A#4.16 B4.16' },
  ] },
  // Chapter Five: a bright morning at Minnie's, fiddle-ish in G
  morning: { bpm: 112, tracks: [
    { wave: 'triangle', vol: 0.15, gate: 0.6, notes: rep('G2.4 D3.4 G2.4 D3.4 C3.4 G3.4 D3.4 A3.4', 2) },
    { wave: 'pulse25', vol: 0.04, gate: 0.7, notes:
      'D5.2 E5.2 G5.4 A5.2 G5.2 E5.4 D5.2 B4.2 D5.4 E5.4 r.4 ' +
      'G5.2 A5.2 B5.4 A5.2 G5.2 E5.4 D5.2 E5.2 G5.8 r.4' },
    { wave: 'pulse12', vol: 0.02, gate: 0.4, notes: rep('r.2 B4.2 r.2 D5.2', 8) },
  ] },
  // the ending: the letter
  letter: { bpm: 66, tracks: [
    { wave: 'triangle', vol: 0.14, gate: 0.8, notes: 'D3.8 A2.8 A#2.8 F2.8 G2.8 D3.8 A2.16' },
    { wave: 'pulse25', vol: 0.035, gate: 0.85, attack: 0.05, notes: 'F4.4 E4.4 D4.8 A4.6 G4.2 F4.8 D4.4 E4.4 F4.8 E4.16' },
    { wave: 'sine', vol: 0.04, attack: 0.2, notes: 'D4.16 D4.16 C4.16 C#4.16' },
  ] },
};

// ---------------------------------------------------------------- sound effects
const D = S.audio.define;
D('voice', t => t({ wave: 'pulse25', f: 260 + Math.random() * 40, dur: 0.03, vol: 0.035 }));
D('voice_low', t => t({ wave: 'pulse25', f: 170 + Math.random() * 30, dur: 0.035, vol: 0.04 }));
D('voice_hi', t => t({ wave: 'pulse25', f: 380 + Math.random() * 50, dur: 0.03, vol: 0.03 }));
D('page', t => t({ wave: 'noise', f: 3500, filter: 'highpass', dur: 0.12, vol: 0.06 }));
D('title_hit', t => { t({ wave: 'triangle', f: 73, f2: 55, dur: 1.4, vol: 0.4, release: 1.0 }); t({ wave: 'noise', f: 300, filter: 'lowpass', dur: 0.5, vol: 0.2, release: 0.4 }); });
D('gun', t => {
  t({ wave: 'noise', f: 1800, filter: 'lowpass', dur: 0.32, vol: 0.55, release: 0.28 });
  t({ wave: 'square', f: 160, f2: 40, dur: 0.22, vol: 0.25 });
  t({ wave: 'noise', f: 600, filter: 'lowpass', dur: 0.9, vol: 0.12, at: 0.05, release: 0.8 });   // the room rings
});
D('rifle', t => { t({ wave: 'noise', f: 2600, filter: 'lowpass', dur: 0.4, vol: 0.6, release: 0.35 }); t({ wave: 'square', f: 120, f2: 30, dur: 0.3, vol: 0.28 }); });
D('cock', t => { t({ wave: 'noise', f: 4000, filter: 'highpass', dur: 0.03, vol: 0.18 }); t({ wave: 'noise', f: 3000, filter: 'highpass', dur: 0.04, vol: 0.15, at: 0.09 }); });
D('click', t => t({ wave: 'noise', f: 5000, filter: 'highpass', dur: 0.025, vol: 0.12 }));
D('hammer', t => { t({ wave: 'noise', f: 900, filter: 'lowpass', dur: 0.08, vol: 0.4 }); t({ wave: 'triangle', f: 520, f2: 380, dur: 0.06, vol: 0.2 }); });
D('miss', t => { t({ wave: 'noise', f: 400, filter: 'lowpass', dur: 0.1, vol: 0.3 }); t({ wave: 'square', f: 90, dur: 0.08, vol: 0.12 }); });
D('door', t => { t({ wave: 'noise', f: 700, filter: 'lowpass', dur: 0.25, vol: 0.35 }); t({ wave: 'triangle', f: 110, f2: 70, dur: 0.25, vol: 0.3 }); });
D('wind', t => t({ wave: 'noise', f: 500, filter: 'bandpass', dur: 2.2, vol: 0.07, attack: 0.8, release: 1.2 }));
D('gust', t => t({ wave: 'noise', f: 900, filter: 'bandpass', dur: 1.2, vol: 0.12, attack: 0.3, release: 0.8 }));
D('punch', t => { t({ wave: 'noise', f: 500, filter: 'lowpass', dur: 0.1, vol: 0.4 }); t({ wave: 'triangle', f: 150, f2: 60, dur: 0.12, vol: 0.3 }); });
D('pour', t => { for (let i = 0; i < 8; i++) t({ wave: 'noise', f: 1800 + i * 120, filter: 'bandpass', dur: 0.08, vol: 0.04, at: i * 0.07 }); });
D('clink', t => { t({ wave: 'sine', f: 2400, dur: 0.12, vol: 0.06 }); t({ wave: 'sine', f: 3100, dur: 0.1, vol: 0.04, at: 0.01 }); });
D('chain', t => { for (let i = 0; i < 4; i++) t({ wave: 'noise', f: 6000, filter: 'highpass', dur: 0.03, vol: 0.06, at: i * 0.05 + Math.random() * 0.02 }); });
D('heart', t => { t({ wave: 'triangle', f: 60, dur: 0.1, vol: 0.4 }); t({ wave: 'triangle', f: 55, dur: 0.1, vol: 0.3, at: 0.16 }); });
D('clue', t => { t({ wave: 'pulse25', f: 587, dur: 0.08, vol: 0.06 }); t({ wave: 'pulse25', f: 880, dur: 0.14, vol: 0.06, at: 0.08 }); t({ wave: 'triangle', f: 147, dur: 0.4, vol: 0.2 }); });
D('lock', t => { t({ wave: 'pulse12', f: 1760, dur: 0.05, vol: 0.06 }); t({ wave: 'pulse12', f: 2349, dur: 0.08, vol: 0.06, at: 0.05 }); });
D('thud', t => { t({ wave: 'triangle', f: 90, f2: 45, dur: 0.25, vol: 0.4 }); t({ wave: 'noise', f: 300, filter: 'lowpass', dur: 0.2, vol: 0.2 }); });
D('cough', t => { for (let i = 0; i < 3; i++) t({ wave: 'noise', f: 700, filter: 'bandpass', dur: 0.09, vol: 0.12, at: i * 0.18 }); });
D('step', t => t({ wave: 'noise', f: 2200, filter: 'lowpass', dur: 0.03, vol: 0.025 }));
D('snowstep', t => t({ wave: 'noise', f: 3500, filter: 'highpass', dur: 0.05, vol: 0.03 }));
D('creak', t => t({ wave: 'sawtooth', f: 180, f2: 120, dur: 0.35, vol: 0.04 }));
D('whip', t => t({ wave: 'noise', f: 4500, filter: 'highpass', dur: 0.06, vol: 0.2 }));
D('neigh', t => { t({ wave: 'pulse25', f: 700, f2: 1100, dur: 0.2, vol: 0.05 }); t({ wave: 'pulse25', f: 1000, f2: 500, dur: 0.45, vol: 0.05, at: 0.2 }); });
})();
(function () {
const D = Sprout.audio.define;
D('blip', t => t({ wave: 'square', f: 520, dur: 0.02, vol: 0.025 }));
D('cancel', t => t({ wave: 'square', f: 440, f2: 330, dur: 0.06, vol: 0.035 }));
D('cursor', t => t({ wave: 'square', f: 880, dur: 0.025, vol: 0.03 }));
D('select', t => { t({ wave: 'square', f: 660, dur: 0.04, vol: 0.04 }); t({ wave: 'square', f: 990, dur: 0.05, vol: 0.035, at: 0.04 }); });
})();
