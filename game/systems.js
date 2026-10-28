// Notebook (clues), the Reckoning, the quick-draw duel, and nailing the door shut.
(function () {
'use strict';
const S = Sprout, iso = S.iso;
const flags = () => S.state.flags;

// ---------------------------------------------------------------- clues
S.CLUES = {
  mare:  { title: "Minnie's mare", text: "Minnie's own mare is still in the stable, rugged up and fed. Minnie don't go visiting on foot. Not in December." },
  chair: { title: "Sweet Dave's chair", text: "The old General is sitting in Sweet Dave's chair. Minnie never let a living soul sit in that chair but Dave." },
  rules: { title: "Minnie's Rules", text: "Board behind the bar: NOBODY BEHIND MY COUNTER BUT ME AND DAVE. She'd sooner burn the place down than hand it to a stranger." },
  stew:  { title: "The stew", text: "Minnie's stew, her recipe, cooked this morning. Bob says Minnie left days ago." },
  bean:  { title: "A red jelly bean", text: "A red jelly bean jammed in the floorboards by the candy jar. Somebody with a sweet tooth was in here today, and they're gone now." },
};
S.clue = function (id) {
  const f = flags();
  if (f['clue_' + id]) return false;
  f['clue_' + id] = true;
  S.sfx('clue');
  S.ui.toast('Clue: ' + S.CLUES[id].title);
  if (!f.seenNotebookHint) { f.seenNotebookHint = true; S.ui.toast('Notebook: ' + (S.input.device === 'pad' ? 'BACK' : 'TAB')); }
  return true;
};
S.hasClue = id => !!flags()['clue_' + id];
S.clueCount = () => Object.keys(S.CLUES).filter(S.hasClue).length;

const nb = S.notebook = {
  open: false, sel: 0,
  update() {
    if (!nb.open) {
      if (S.input.pressed('select') && !S.busy() && S.state.chapter >= 2 && S.clueCount() > 0) { S.input.consume('select'); nb.open = true; nb.sel = 0; S.sfx('page'); }
      return;
    }
    const ids = Object.keys(S.CLUES).filter(S.hasClue);
    if (S.input.repeat('up')) { nb.sel = (nb.sel + ids.length - 1) % ids.length; S.sfx('cursor'); }
    if (S.input.repeat('down')) { nb.sel = (nb.sel + 1) % ids.length; S.sfx('cursor'); }
    if (S.input.pressed('select') || S.input.pressed('b') || S.input.pressed('start')) { S.input.consume('select', 'b', 'start'); nb.open = false; S.sfx('page'); }
    S.input.consume('a');
  },
  blocking() { return nb.open; },
  draw(g) {
    if (!nb.open) return;
    const ids = Object.keys(S.CLUES).filter(S.hasClue);
    g.alpha(0.7, () => g.rect(0, 0, S.W, S.H, 'night'));
    const x = 40, y = 26, w = S.W - 80, h = S.H - 52;
    S.nine(g, 'ui_paper', x, y, w, h);
    S.bigText(g, "WARREN'S NOTES", S.W / 2, y + 12, 2, 'ink', null);
    ids.forEach((id, i) => {
      const sel = i === nb.sel;
      g.text((sel ? '> ' : '  ') + S.CLUES[id].title, x + 18, y + 44 + i * 14, { color: sel ? 'blood' : 'ink', shadow: false });
    });
    const c = S.CLUES[ids[nb.sel]];
    if (c) S.font.wrap(c.text, w - 180).forEach((ln, i) => g.text(ln, x + 160, y + 44 + i * 13, { color: 'ink', shadow: false }));
    g.text(Object.keys(S.CLUES).length - ids.length > 0 ? `${ids.length} of ${Object.keys(S.CLUES).length} found` : 'Every clue found.', x + 18, y + h - 22, { color: 'inkdim', shadow: false });
  },
};
const busy0 = S.busy;
S.busy = () => busy0() || nb.open;

// Reckoning: Warren makes a claim; pick the clue that proves it. Returns true when right.
S.reckon = function* (claim, answer, who = 'warren') {
  const ids = Object.keys(S.CLUES).filter(S.hasClue);
  const i = yield* S.choose(claim, ids.map(id => S.CLUES[id].title), null, who);
  return ids[i] === answer;
};

// ---------------------------------------------------------------- pause menu + controls
const KB_CONTROLS = [
  ['Move', 'WASD or Arrows'], ['Run', 'hold SHIFT'], ['Use / Talk / Next', 'E, SPACE, ENTER or click'],
  ['Fire (quick-draw)', 'E or SPACE'], ['Answer a question', '1-5, or arrows + E'], ['Notebook', 'TAB'],
  ['Back / Pause', 'ESC or right-click'], ['Fullscreen', 'F'],
];
const PAD_CONTROLS = [
  ['Move', 'Left stick or D-pad'], ['Use / Talk / Next', 'A'], ['Fire (quick-draw)', 'A'],
  ['Back', 'B'], ['Notebook', 'BACK / SELECT'], ['Pause', 'START'],
];
const pz = S.pause = {
  open: false, sel: 0, view: 'menu', fromTitle: false,
  items: [
    ['Resume', () => { pz.open = false; }],
    ['Controls', () => { pz.view = 'controls'; }],
    ['Fullscreen', () => S.fullscreen()],
    ['Quit to title', () => { pz.open = false; S.go(S.title); }],
  ],
  showControls() { pz.open = true; pz.view = 'controls'; pz.fromTitle = true; S.sfx('page'); },
  // returns true while it owns the frame (everything else is frozen)
  update() {
    const inp = S.input;
    if (!pz.open) {
      if (S.scene !== S.world || S.ui.card || nb.open || S.auto) return false;
      if (inp.pressed('start') || (inp.pressed('b') && !S.ui.box)) {
        inp.consume('b', 'start'); pz.open = true; pz.sel = 0; pz.view = 'menu'; pz.fromTitle = false; S.sfx('page');
        return true;
      }
      return false;
    }
    if (pz.view === 'controls') {
      if (inp.pressed('a') || inp.pressed('b') || inp.pressed('start')) {
        inp.consume('a', 'b', 'start'); S.sfx('cancel');
        if (pz.fromTitle) pz.open = false; else pz.view = 'menu';
      }
      return true;
    }
    const n = pz.items.length;
    if (inp.repeat('up')) { pz.sel = (pz.sel + n - 1) % n; S.sfx('cursor'); }
    if (inp.repeat('down')) { pz.sel = (pz.sel + 1) % n; S.sfx('cursor'); }
    const num = pz.items.findIndex((_, i) => inp.pressed('n' + (i + 1)));
    if (num >= 0) pz.sel = num;
    if (inp.pressed('a') || num >= 0) { inp.consume('a'); S.sfx('select'); pz.items[pz.sel][1](); }
    else if (inp.pressed('b') || inp.pressed('start')) { inp.consume('b', 'start'); S.sfx('cancel'); pz.open = false; }
    return true;
  },
  draw(g) {
    g.alpha(0.6, () => g.rect(0, 0, S.W, S.H, 'night'));
    if (pz.view === 'controls') {
      const list = S.input.device === 'pad' ? PAD_CONTROLS : KB_CONTROLS;
      const w = 300, h = 46 + list.length * 14, x = Math.round(S.W / 2 - w / 2), y = Math.round(S.H / 2 - h / 2);
      S.nine(g, 'ui_panel', x, y, w, h);
      g.text('CONTROLS', S.W / 2, y + 10, { align: 'center', color: 'gold' });
      list.forEach(([what, key], i) => {
        g.text(what, x + 16, y + 28 + i * 14, { color: 'creamdim' });
        g.text(key, x + w - 16, y + 28 + i * 14, { align: 'right', color: 'cream' });
      });
      S.prompt(g, 'b', 'Back', S.W / 2, y + h + 6);
      return;
    }
    const w = 160, h = 30 + pz.items.length * 15, x = Math.round(S.W / 2 - w / 2), y = Math.round(S.H / 2 - h / 2);
    S.nine(g, 'ui_panel', x, y, w, h);
    g.text('PAUSED', S.W / 2, y + 10, { align: 'center', color: 'gold' });
    pz.items.forEach(([label], i) => {
      const sel = i === pz.sel;
      if (sel) g.text('>', x + 18 + (Math.floor(S.frame / 15) % 2), y + 28 + i * 15, { color: 'blood' });
      g.text(label, x + 30, y + 28 + i * 15, { color: sel ? 'gold' : 'creamdim' });
    });
  },
};

// ---------------------------------------------------------------- quick-draw
// yield* S.duel(shooter, target, { wait: [min, max], window: frames, tell, onEarly, onSlow }) -> 'hit'
S.duel = function* (me, foe, opt = {}) {
  const prevMusic = S.audio.song && S.audio.song.src;
  S.music('duel');
  yield* S.bars(true, 16);
  for (let attempt = 0; ; attempt++) {
    iso.face(me, foe); iso.face(foe, me);
    const st = { r: 34, phase: 'wait', t: 0, tell: false };
    const zone = opt.zone || 11;
    const ring = { t: 0, life: 99999, draw(g) {
      const [x, y] = iso.screenOf(foe.x, foe.y, foe.pose === 'sit' ? 0.95 : 1.4);
      g.alpha(0.35, () => g.rect(0, 0, S.W, S.H, 'night'));
      if (st.phase === 'wait') {
        // a slow, steady ring: hold your nerve
        const r = Math.round(st.r);
        g.ring(x, y, r + 1, 1, 'ink'); g.ring(x, y, r, 1, 'cr2');
        g.spr('ui_cross', 0, x, y);
        g.text('Steady... fire when the ring turns gold', S.W / 2, S.H - 40, { align: 'center', color: 'creamdim' });
        return;
      }
      const r = Math.max(1, Math.round(st.r)), gold = st.r <= zone;
      g.ring(x, y, zone + 1, 1, 'ink'); g.ring(x, y, zone, 1, gold ? 'gd4' : 'gd2');
      g.ring(x, y, r + 1, 1, 'ink'); g.ring(x, y, r, 2, gold ? 'gd4' : 'rd3');
      g.spr('ui_cross', 0, x, y);
      if (st.t < 30) S.bigText(g, '!', x + 16, y - 30 - (st.t < 4 ? 4 - st.t : 0), 2, 'blood', 'night');
      S.prompt(g, 'a', 'Draw!', S.W / 2, S.H - 42);
    } };
    h8overlay(ring);
    const waitN = S.rand(...(opt.wait || [70, 170]));
    let result = null;
    for (let t = 0; t < waitN; t++) {
      if (t % 45 === 0) S.sfx('heart');
      st.r = 30 + Math.round(Math.sin(t * 0.06) * 1.5);
      if (S.input.pressed('a') && !S.auto) { S.input.consume('a'); result = 'early'; break; }
      yield 1;
    }
    if (!result) {
      st.phase = 'draw'; st.tell = true; st.t = 0;
      S.sfx('cock'); foe.flash = 4;
      const win = opt.window || 42;
      for (let t = 0; t < win; t++) {
        st.t = t; st.r = 34 * (1 - t / win);
        if ((S.input.pressed('a') && !S.auto) || (S.auto && st.r <= zone - 2)) {
          S.input.consume('a');
          result = st.r <= zone && st.r >= 1.5 ? 'hit' : 'early';
          break;
        }
        yield 1;
      }
      if (!result) result = 'slow';
    }
    ring.life = 0;
    if (result === 'hit') {
      const pose0 = me.pose;
      me.anim = 'aim'; me.pose = 'aim0';
      S.h8.shoot(me, foe);
      yield 4;
      if (opt.onHit) yield* opt.onHit(); else yield* S.h8.kill(foe, { from: me });
      yield 30;
      me.pose = pose0 === 'dead' ? 'dead' : null; me.anim = 'idle';
      break;
    }
    // failure: a beat, a line, try again
    if (result === 'early') {
      S.sfx('miss');
      yield* S.say('warren', opt.earlyLine || "No. Not yet. Let him make his move. Let him be the one who draws.");
    } else {
      foe.pose = 'aim0'; foe.anim = 'aim';
      if (S.sprites[foe.sprite] && S.sprites[foe.sprite].has('se_aim0')) S.h8.shoot(foe, me); else { S.sfx('gun'); iso.cam.shake = 8; }
      me.flash = 12;
      yield 30;
      foe.pose = foe.basePose || null; foe.anim = 'idle';
      yield* S.say('warren', opt.slowLine || "Too slow, old man. Again. Watch the hand, not the eyes.");
    }
  }
  yield* S.bars(false, 16);
  if (prevMusic) S.music(prevMusic);
  return 'hit';
};
function h8overlay(o) { S.h8.overlay.push(o); }

// ---------------------------------------------------------------- nail the door shut
// A close-up panel: a mark sweeps across the nail head; tap A when it's over the nail. 3 good hits per nail.
S.nailDoor = function* (nails = 4) {
  const st = { nail: 0, depth: 0, x: 0, dir: 1, msg: '', shake: 0, done: false };
  const panel = { t: 0, life: 99999, draw(g) {
    const W = 220, H = 96, x0 = Math.round(S.W / 2 - W / 2) + (st.shake ? S.rand(-1, 1) : 0), y0 = 40;
    S.nine(g, 'ui_panel', x0, y0, W, H);
    // the board
    g.rect(x0 + 14, y0 + 30, W - 28, 26, 'wd4'); g.rect(x0 + 14, y0 + 30, W - 28, 2, 'wd5'); g.rect(x0 + 14, y0 + 54, W - 28, 2, 'wd2');
    for (let i = 0; i < 6; i++) g.rect(x0 + 24 + i * 32, y0 + 36 + (i % 2) * 6, 14, 1, 'wd3');
    // nails: done ones flush, current one sticking out
    for (let i = 0; i < nails; i++) {
      const nx = x0 + 34 + i * ((W - 68) / (nails - 1));
      const out = i < st.nail ? 0 : i === st.nail ? 3 - st.depth : 3;
      g.rect(nx - 3, y0 + 40 - out * 4, 7, 3, i < st.nail ? 'mt2' : 'mt3');
      if (out > 0) g.rect(nx, y0 + 43 - out * 4, 1, out * 4, 'mt2');
    }
    // sweep bar
    const bx = x0 + 20, bw = W - 40, by = y0 + 66;
    g.rect(bx, by, bw, 6, 'lb1');
    g.rect(bx + bw / 2 - 7, by, 14, 6, 'gd2');
    g.rect(bx + bw / 2 - 3, by, 6, 6, 'gd3');
    g.rect(Math.round(bx + st.x * bw) - 1, by - 2, 3, 10, 'cr3');
    g.text('Nail the door shut', S.W / 2, y0 + 12, { align: 'center', color: 'gold' });
    if (st.msg) g.text(st.msg, S.W / 2, y0 + H + 6, { align: 'center', color: 'cream' });
  } };
  S.h8.overlay.push(panel);
  let speed = 0.022;
  while (st.nail < nails) {
    st.x += st.dir * speed;
    if (st.x > 1) { st.x = 1; st.dir = -1; } if (st.x < 0) { st.x = 0; st.dir = 1; }
    if (st.shake) st.shake--;
    if ((S.input.pressed('a') && !S.auto) || (S.auto && Math.abs(st.x - 0.5) < 0.02)) {
      S.input.consume('a');
      if (Math.abs(st.x - 0.5) < 0.045) {
        S.sfx('hammer'); st.depth++; st.msg = '';
        if (st.depth >= 3) { st.nail++; st.depth = 0; speed += 0.004; }
      } else { S.sfx('miss'); st.shake = 8; st.msg = S.pick(['Ow. Thumb.', 'Bent it.', 'Missed.']); }
    }
    yield 1;
  }
  yield 20;
  panel.life = 0;
};
})();
