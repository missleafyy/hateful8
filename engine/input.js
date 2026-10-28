// Leafhollow engine — input: keyboard + gamepad (AYN Thor / Xbox layout) mapped to buttons.
//   S.input.held('a')  pressed('a')  repeat('down')  consume('a')  vec() -> {x, y} (analog, |v| <= 1)
//   S.input.device -> 'kb' | 'pad' (last one used; the HUD shows matching button prompts)
// Buttons: a = use / talk / confirm / fire (E, Space, Enter, click)   b = back / pause (Esc, right-click)
//          select = notebook (Tab)   start = pause (P)   run (Shift)   n1..n5 = pick choice 1-5
(function () {
'use strict';
const S = window.Sprout;

const KEYS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
  KeyE: 'a', Space: 'a', Enter: 'a', NumpadEnter: 'a', KeyZ: 'a', KeyJ: 'a',     // use / talk / confirm / fire
  Escape: 'b', Backspace: 'b', KeyX: 'b', KeyK: 'b',                              // back / close / pause
  Tab: 'select', KeyN: 'select', KeyI: 'select',                                  // notebook
  KeyP: 'start',                                                                  // pause
  ShiftLeft: 'run', ShiftRight: 'run',
  Digit1: 'n1', Digit2: 'n2', Digit3: 'n3', Digit4: 'n4', Digit5: 'n5',           // pick a choice directly
  Numpad1: 'n1', Numpad2: 'n2', Numpad3: 'n3', Numpad4: 'n4', Numpad5: 'n5',
};
// which key to show in prompts for each button
const KEY_LABEL = { a: 'E', b: 'ESC', start: 'P', select: 'TAB', run: 'SHIFT' };
const PAD = { 0: 'a', 1: 'b', 2: 'x', 3: 'y', 4: 'l', 5: 'r', 8: 'select', 9: 'start', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
const BUTTONS = ['up', 'down', 'left', 'right', 'a', 'b', 'x', 'y', 'l', 'r', 'start', 'select', 'run', 'n1', 'n2', 'n3', 'n4', 'n5'];
const DIRS = ['up', 'down', 'left', 'right'];

const keyHeld = new Set(), tapped = new Set();
const now = {}, prev = {}, frames = {}, eaten = new Set();
let dirOrder = [];
let scriptQ = [], scriptHeld = new Set();
let stick = { x: 0, y: 0 };

const input = S.input = {
  device: 'kb',
  bot: null,     // { held: Set, vec } — autoplay test bot (game/dev.js)
  keyLabel: b => KEY_LABEL[b] || b.toUpperCase(),

  init() {
    addEventListener('keydown', e => {
      S.audio.unlock();
      const b = KEYS[e.code];
      if (!b) return;
      e.preventDefault();
      input.device = 'kb';
      if (!keyHeld.has(b)) tapped.add(b);
      keyHeld.add(b);
    });
    addEventListener('keyup', e => { const b = KEYS[e.code]; if (b) keyHeld.delete(b); });
    addEventListener('blur', () => keyHeld.clear());
    // mouse: left click = use / advance, right click = back
    addEventListener('pointerdown', e => {
      S.audio.unlock();
      if (e.button === 0) tapped.add('a');
      else if (e.button === 2) tapped.add('b');
      input.device = 'kb';
    });
    addEventListener('contextmenu', e => e.preventDefault());
  },

  update() {
    if (scriptQ.length) {
      const s = scriptQ[0];
      scriptHeld = new Set(s.buttons);
      if (--s.frames <= 0) scriptQ.shift();
    } else scriptHeld.clear();

    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const padHeld = new Set();
    stick = { x: 0, y: 0 };
    for (const p of pads) {
      if (!p) continue;
      p.buttons.forEach((b, i) => { if (b.pressed && PAD[i]) padHeld.add(PAD[i]); });
      const ax = p.axes[0] || 0, ay = p.axes[1] || 0, m = Math.hypot(ax, ay);
      if (m > 0.25) {
        const k = Math.min(1, (m - 0.25) / 0.65) / m;
        stick = { x: ax * k, y: ay * k };
        if (ax < -0.5) padHeld.add('left'); if (ax > 0.5) padHeld.add('right');
        if (ay < -0.5) padHeld.add('up'); if (ay > 0.5) padHeld.add('down');
      }
    }
    if (padHeld.size) { S.audio.unlock(); input.device = 'pad'; }

    if (input.bot) { for (const b of input.bot.held) padHeld.add(b); if (input.bot.vec) stick = input.bot.vec; }
    eaten.clear();
    for (const b of BUTTONS) {
      prev[b] = now[b];
      now[b] = keyHeld.has(b) || padHeld.has(b) || scriptHeld.has(b);
      const p = (now[b] && !prev[b]) || tapped.has(b);
      frames[b] = now[b] || p ? (p ? 1 : (frames[b] || 0) + 1) : 0;
      if (p && DIRS.includes(b)) dirOrder = dirOrder.filter(d => d !== b).concat(b);
    }
    tapped.clear();
    dirOrder = dirOrder.filter(d => now[d]);
  },

  held: b => !!now[b],
  pressed: b => frames[b] === 1 && !eaten.has(b),
  repeat: b => !eaten.has(b) && (frames[b] === 1 || (frames[b] > 18 && frames[b] % 5 === 0)),
  heldFrames: b => frames[b] || 0,
  consume(...bs) { for (const b of bs) eaten.add(b); },
  dir: () => dirOrder.length ? dirOrder[dirOrder.length - 1] : null,
  anyPressed: () => BUTTONS.some(b => input.pressed(b)),
  // movement vector: analog stick if it's being used, else the d-pad / keys (normalised)
  vec() {
    if (stick.x || stick.y) return stick;
    let x = (now.right ? 1 : 0) - (now.left ? 1 : 0), y = (now.down ? 1 : 0) - (now.up ? 1 : 0);
    if (x && y) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
    return { x, y };
  },

  // "R16,w10,A,UR20" — hold right 16 frames, wait 10, tap A, hold up+right 20
  script(str) {
    const names = { U: 'up', D: 'down', L: 'left', R: 'right', A: 'a', B: 'b', X: 'x', Y: 'y', S: 'start', E: 'select', Q: 'l', W: 'r' };
    for (const tok of str.split(',')) {
      const m = tok.trim().match(/^([A-Za-z]+)(\d*)$/);
      if (!m) continue;
      const n = +m[2] || 0;
      if (m[1] === 'w') { scriptQ.push({ buttons: [], frames: n || 1 }); continue; }
      const btns = [...m[1]].map(c => names[c]).filter(Boolean);
      scriptQ.push({ buttons: btns, frames: n || 2 }, { buttons: [], frames: 2 });
    }
  },
};
})();
