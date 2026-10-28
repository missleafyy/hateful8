// Leafhollow engine — core: one 480x270 screen (x4 = 1920x1080), drawing, main loop, scenes, script tasks.
// Everything lives on the global `Sprout` (alias S inside engine files); the art/font/audio
// modules are shared with the Sprout engine.
(function () {
'use strict';
const S = window.Sprout = window.Sprout || {};

S.W = 480;
S.H = 270;
S.TILE = 16;
S.frame = 0;          // global frame counter, 60 per second
S.params = new URLSearchParams(location.search);
S.state = { flags: {} };   // save data lives here

// ---------------------------------------------------------------- drawing
S.Gfx = class Gfx {
  constructor(canvas, w = S.W, h = S.H) {
    canvas.width = w; canvas.height = h;
    this.w = w; this.h = h;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.ox = 0; this.oy = 0;
  }
  camera(x = 0, y = 0) { this.ox = Math.round(x); this.oy = Math.round(y); }
  clear(c) { this.ctx.fillStyle = S.color(c); this.ctx.fillRect(0, 0, this.w, this.h); }
  rect(x, y, w, h, c) {
    if (w <= 0 || h <= 0) return;
    this.ctx.fillStyle = S.color(c);
    this.ctx.fillRect(Math.round(x) - this.ox, Math.round(y) - this.oy, Math.round(w), Math.round(h));
  }
  px(x, y, c) { this.rect(x, y, 1, 1, c); }
  frame(x, y, w, h, c) {
    this.rect(x, y, w, 1, c); this.rect(x, y + h - 1, w, 1, c);
    this.rect(x, y + 1, 1, h - 2, c); this.rect(x + w - 1, y + 1, 1, h - 2, c);
  }
  img(im, x, y) { this.ctx.drawImage(im, Math.round(x) - this.ox, Math.round(y) - this.oy); }
  // draw a sprite frame so that its origin lands on (x, y). opt: { flip, tint: '#fff' (solid silhouette), alpha }
  spr(name, frame = 0, x = 0, y = 0, flip = false, opt) {
    const s = S.sprites[name];
    if (!s) { S.warnOnce('no sprite ' + name); return; }
    let im = opt && opt.tint ? s.tinted(frame, flip, opt.tint) : s.get(frame, flip);
    if (!im) return;
    const ox = flip ? s.w - s.origin[0] : s.origin[0];
    if (opt && opt.alpha != null) this.alpha(opt.alpha, () => this.img(im, Math.round(x) - ox, Math.round(y) - s.origin[1]));
    else this.img(im, Math.round(x) - ox, Math.round(y) - s.origin[1]);
  }
  // filled pixel ellipse centred on (cx, cy)
  ellipse(cx, cy, rx, ry, c) {
    for (let dy = -ry; dy <= ry; dy++) {
      const t = dy / (ry + 0.5);
      const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - t * t)));
      this.rect(cx - hw, cy + dy, hw * 2, 1, c);
    }
  }
  // pixel ring (outline circle) of thickness th
  ring(cx, cy, r, th, c) {
    const ri = Math.max(0, r - th);
    for (let dy = -r; dy <= r; dy++) {
      const ho = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
      const hi = Math.abs(dy) < ri ? Math.round(Math.sqrt(ri * ri - dy * dy)) : 0;
      if (hi) { this.rect(cx - ho, cy + dy, ho - hi, 1, c); this.rect(cx + hi, cy + dy, ho - hi, 1, c); }
      else this.rect(cx - ho, cy + dy, ho * 2, 1, c);
    }
  }
  alpha(a, fn) { const p = this.ctx.globalAlpha; this.ctx.globalAlpha = p * a; fn(); this.ctx.globalAlpha = p; }
  text(str, x, y, opt) { return S.font.draw(this, str, x, y, opt); }
};

const warned = new Set();
S.warnOnce = msg => { if (!warned.has(msg)) { warned.add(msg); console.warn('[h8] ' + msg); } };

// ---------------------------------------------------------------- scenes
// A scene is any object with optional enter(prev), exit(), update(), draw(g).
S.scene = null;
S.go = function (scene, arg) {
  if (S.scene && S.scene.exit) S.scene.exit();
  const prev = S.scene;
  S.scene = scene;
  if (scene.enter) scene.enter(prev, arg);
};

// ---------------------------------------------------------------- tasks (coroutines)
// S.run(function* () { yield* say('Hi!'); yield 30; ... })
//   yield N  wait N frames · yield fn  wait until fn() · yield task  wait for task · yield  one frame
// Tasks with block:true (default) freeze player control while running.
S.tasks = [];
S.run = function (gen, opts = {}) {
  const t = {
    it: typeof gen === 'function' ? gen() : gen,
    wait: 0, until: null, done: false,
    block: opts.block !== false,
    name: opts.name || '',
  };
  S.tasks.push(t);
  return t;
};
S.busy = () => (S.ui && S.ui.blocking()) || S.tasks.some(t => t.block && !t.done);

function stepTask(t) {
  if (t.wait > 0 && --t.wait > 0) return;
  if (t.until) { if (!t.until()) return; t.until = null; }
  for (let guard = 0; guard < 10000; guard++) {
    let r;
    try { r = t.it.next(); }
    catch (e) { console.error(e); t.done = true; return; }
    if (r.done) { t.done = true; return; }
    const v = r.value;
    if (typeof v === 'number') { if (v > 0) { t.wait = v; return; } continue; }
    if (typeof v === 'function') { if (v()) continue; t.until = v; return; }
    if (v && typeof v === 'object' && 'done' in v) { if (v.done) continue; t.until = () => v.done; return; }
    return;
  }
}

// ---------------------------------------------------------------- layout
// Integer-scale the 640x360 screen to fit the window (x3 on a 1920x1080 display).
S.layout = function () {
  const c = S.g.canvas;
  let s = Math.min(innerWidth / S.W, innerHeight / S.H);
  if (s >= 1) s = Math.floor(s + 0.001);
  c.style.width = S.W * s + 'px';
  c.style.height = S.H * s + 'px';
};
S.fullscreen = function () {
  const d = document.documentElement;
  if (document.fullscreenElement) document.exitFullscreen();
  else if (d.requestFullscreen) d.requestFullscreen().catch(() => {});
};

// ---------------------------------------------------------------- main loop
S.hitstop = 0;   // frames the world freezes for (impact feel); UI and tasks keep running
function step() {
  if (S.iso && S.iso.room && !S.iso.room.dep) return;
  S.input.update();
  // a pause menu (S.pause) freezes everything else: scripts, scene, dialogue
  if (S.pause && S.pause.update()) { S.audio.update(); return; }
  if (S.ui) S.ui.update();
  for (const t of S.tasks.slice()) if (!t.done) stepTask(t);
  S.tasks = S.tasks.filter(t => !t.done);
  if (S.hitstop > 0) S.hitstop--;
  else if (S.scene && S.scene.update) S.scene.update();
  S.audio.update();
  S.frame++;
}
function render() {
  S.g.camera();
  if (S.scene && S.scene.draw) S.scene.draw(S.g);
  S.g.camera();
  if (S.ui) S.ui.draw(S.g);
  if (S.pause && S.pause.open) S.pause.draw(S.g);
}

S.boot = function (start) {
  S.g = new S.Gfx(document.getElementById('screen'));
  S.input.init();
  S.layout();
  addEventListener('resize', S.layout);
  addEventListener('keydown', e => { if (e.code === 'F11' || e.code === 'KeyF') { e.preventDefault(); S.fullscreen(); } });
  const go = () => {
  // test hooks: ?keys=R16,A,w30  scripted input   ?skip=N  fast-forward N frames
  if (S.params.get('keys')) S.input.script(S.params.get('keys'));
  const skip = +S.params.get('skip') || 0;
  for (let i = 0; i < skip; i++) step();
  let last = performance.now(), acc = 0;
  const dt = 1000 / 60;
  function tick(now) {
    acc += Math.min(250, now - last); last = now;
    let n = 0;
    while (acc >= dt && n++ < 8) { step(); acc -= dt; }
    render();
    requestAnimationFrame(tick);
  }
  render();
  requestAnimationFrame(tick);
  };
  // start(ready) may finish asynchronously (image decoding): it calls ready() when the first scene is set
  if (start.length) start(go); else { start(); go(); }
};

// small helpers used everywhere
S.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
S.randf = (a, b) => a + Math.random() * (b - a);
S.pick = arr => arr[Math.floor(Math.random() * arr.length)];
S.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
S.lerp = (a, b, t) => a + (b - a) * t;
S.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
// deterministic hash, used for tile variants and edge wobble
S.hash = (x, y, seed = 0) => {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const SAVE = 'hateful8-save';
S.save = () => { try { localStorage.setItem(SAVE, JSON.stringify(S.state)); return true; } catch (e) { return false; } };
S.load = () => { try { const d = localStorage.getItem(SAVE); if (d) { S.state = JSON.parse(d); return true; } } catch (e) {} return false; };
S.hasSave = () => { try { return !!localStorage.getItem(SAVE); } catch (e) { return false; } };
S.wipeSave = () => { try { localStorage.removeItem(SAVE); } catch (e) {} };
})();
