// The world scene: the current room, its people, weather and overlays. Chapters drive it with scripts.
//   S.h8.room('minnie', { music: 'cabin' })     switch rooms (keeps nobody; spawn the cast again)
//   const a = S.h8.spawn('ruth', x, y, 'se', { pose: 'sit' })
//   S.h8.player('warren', x, y)                  the actor you control
//   yield* S.h8.kill(a, { from: shooter })       blood, fall, a pool on the floor
(function () {
'use strict';
const S = Sprout, iso = S.iso;

S.auto = S.params.has('auto');   // test mode: dialogue advances itself, objectives solve themselves

const h8 = S.h8 = {
  DRIVER: [1.85, 0, 1.25],        // where the driver sits on the coach box (dx, dy, z)
  weather: null, chain: null, overlay: [], goalText: null, ropes: [], blocks: [],

  room(name, opt = {}) {
    iso.enter(name);
    h8.weather = opt.snow ? { n: opt.snow, wind: opt.wind || 0.6, flakes: [], fog: opt.fog || 0 } : null;
    h8.chain = null; h8.overlay = []; h8.ropes = []; h8.blocks = []; h8.goalText = null;
    iso.extraBlock = (x, y) => h8.blocks.some(b => x > b[0] && x < b[2] && y > b[1] && y < b[3]);
    if (h8.weather) for (let i = 0; i < 260 * h8.weather.n; i++) h8.weather.flakes.push(flake(true));
    if (name.startsWith('minnie')) {
      iso.actor({ name: 'fire', sprite: 'fx_fire', x: 0.84, y: 5.75, z: 0.06, solid: false, shadow: false, bias: 0.02 });
      iso.actor({ name: 'stovefire', sprite: 'fx_fire', x: 6.44, y: 5.0, z: 0.3, solid: false, shadow: false, bias: 0.02, alpha: 0.85, t: 7 });
      iso.lights.forEach(l => { l.flicker = l.flicker || 0.8; });
    }
    if (opt.music !== undefined) S.music(opt.music);
    S.player.a = null;
    return iso.room;
  },

  spawn(key, x, y, facing = 'se', extra = {}) {
    const a = iso.actor(Object.assign({ name: key, sprite: key, x, y, facing }, extra));
    if (a.pose === 'sit') { a.solid = extra.solid ?? true; a.bias = extra.bias ?? 0.32; }
    return a;
  },
  player(key, x, y, facing = 'se') {
    let a = iso.find(key);
    if (!a) a = h8.spawn(key, x, y, facing);
    else { a.x = x; a.y = y; a.facing = facing; }
    S.player.spawn(a);
    return a;
  },

  // coach + team. Returns { body, horses, x, y, move(dx) generator }. The driver rides at c.ride(a, ...DRIVER)
  coach(x, y, opt = {}) {
    const body = iso.actor({ name: 'coach', ds: opt.loaded ? 'coach_loaded' : 'coach', x, y, solid: false, shadow: false, bias: 0 });
    const cols = ['bay', 'black', 'chestnut', 'grey'];
    const horses = [[3.4, -0.4], [3.4, 0.4], [4.75, -0.4], [4.75, 0.4]].map(([dx, dy], i) =>
      iso.actor({ name: 'horse' + i, sprite: 'horse_' + cols[i], x: x + dx, y: y + dy, facing: 'se', solid: false, shadowW: 12, t: i * 5 }));
    const c = { body, horses, riders: [], x, y };
    c.place = () => {
      body.x = c.x; body.y = c.y;
      horses.forEach((h, i) => { h.x = c.x + [3.4, 3.4, 4.75, 4.75][i]; h.y = c.y + [-0.4, 0.4, -0.4, 0.4][i]; });
      c.riders.forEach(r => { r.a.x = c.x + r.dx; r.a.y = c.y + r.dy; });
    };
    c.ride = (a, dx, dy, z) => { a.z = z; a.pose = 'sit'; a.solid = false; a.bias = 0.5; a.shadow = false; c.riders.push({ a, dx, dy }); c.place(); };
    c.unride = a => { c.riders = c.riders.filter(r => r.a !== a); a.z = 0; a.pose = null; a.solid = true; a.bias = 0.06; a.shadow = true; };
    c.move = function* (dist, speed = 0.05, ease = true) {
      const n = Math.ceil(Math.abs(dist) / speed), x0 = c.x;
      horses.forEach(h => { h.anim = 'walk'; });
      c.solid(false);
      for (let i = 1; i <= n; i++) {
        const t = i / n, k = ease ? (t < 0.15 ? t * t / 0.15 / 2 * 2 : t > 0.85 ? 1 - (1 - t) * (1 - t) / 0.15 : t) : t;
        c.x = x0 + dist * (ease ? Math.min(1, Math.max(0, (k + t) / 2)) : t);
        body.dsFrame = Math.floor(c.x * 6) % 3;
        if (i % 9 === 0) S.sfx('snowstep');
        c.place(); yield 1;
      }
      c.x = x0 + dist; c.place();
      horses.forEach(h => { h.anim = 'idle'; });
      c.solid(true);
    };
    // parked coaches block the way (body + team); moving ones don't
    const blk = [0, 0, 0, 0]; h8.blocks.push(blk);
    c.solid = on => { if (on) { blk[0] = c.x - 2.15; blk[1] = c.y - 0.92; blk[2] = c.x + 5.3; blk[3] = c.y + 0.92; } else blk.fill(0); };
    c.solid(true);
    c.door = () => [c.x, c.y + 1.15];
    c.load = () => { body.ds = 'coach_loaded'; };
    c.remove = () => { iso.remove(body); horses.forEach(h => iso.remove(h)); c.solid(false); };
    return c;
  },

  // shot / poisoned: blood spray, fall flat, pool spreads
  *kill(a, opt = {}) {
    const from = opt.from;
    a.flash = 10; S.iso.cam.shake = 10;
    const dir = from ? Math.atan2(a.y - from.y, a.x - from.x) : Math.random() * 6.28;
    for (let i = 0; i < (opt.spray ?? 26); i++) {
      const sp = 0.02 + Math.random() * 0.05, ang = dir + (Math.random() - 0.5) * 1.3;
      iso.emit({ x: a.x, y: a.y, z: 1.1 + Math.random() * 0.4, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, vz: 0.02 + Math.random() * 0.04,
        g: 0.006, col: Math.random() < 0.5 ? 'rd2' : 'rd3', life: 90, stain: 0.08 + Math.random() * 0.06, size: Math.random() < 0.3 ? 2 : 1 });
    }
    if (!opt.noSound && opt.sound) S.sfx(opt.sound);
    yield 8;
    S.sfx('thud');
    a.pose = 'dead'; a.anim = 'idle';
    a.sprite = (a.deadSprite || a.name) + '_dead';
    a.mode = 'flat'; a.solid = false; a.bias = 0.03; a.z = 0;
    a.dead = true;
    const px = a.x + (opt.pool ? opt.pool[0] : 0.1), py = a.y + (opt.pool ? opt.pool[1] : -0.05);
    for (let r = 0.12; r < (opt.poolR || 0.5); r += 0.04) { iso.splat(px, py, r, 'rd1', 5); yield 3; }
  },

  // muzzle flash + bang from an actor's gun
  shoot(a, target, opt = {}) {
    if (target) iso.face(a, target);
    a.pose = 'aim1';
    S.sfx(opt.sound || 'gun');
    iso.cam.shake = 8;
    const side = a.facing[0] === 'n' ? 'ne' : 'se', flip = a.facing[1] === 'w';
    const off = a.mode === 'flat' ? [9, -3] : side === 'se' ? [14, -26] : [11, -30];
    h8.overlay.push({ t: 0, life: 5, draw(g) {
      const [sx, sy] = iso.screenOf(a.x, a.y, a.z);
      g.spr('fx_flash', this.t < 2 ? 0 : 1, sx + (flip ? -off[0] : off[0]), sy + off[1]);
    } });
    S.run(function* () { yield 6; if (a.pose === 'aim1') a.pose = 'aim0'; }, { block: false });
  },

  // someone already dead when the scene opens
  corpse(key, x, y, opt = {}) {
    const a = h8.spawn(key, x, y, opt.facing || 'se', { sprite: key + '_dead', pose: 'dead', mode: 'flat', solid: false, bias: 0.03, dead: true });
    if (opt.pool !== false) iso.splat(x + 0.1, y - 0.05, opt.poolR || 0.45, 'rd1', 5);
    return a;
  },

  // let the player loose until done() is true. In ?auto mode the listed hotspots run themselves.
  *goal(text, done, auto = []) {
    h8.goalText = text; S.player.enabled = true;
    if (S.auto) {
      yield 10;
      if (typeof auto === 'function') yield* auto();
      else for (const id of auto) {
        const h = iso.hotspots.find(h => h.id === id);
        if (!h || (h.when && !h.when())) continue;
        const p = S.player.a;
        if (p) { p.x = h.actor ? h.actor.x : h.x; p.y = (h.actor ? h.actor.y : h.y) + 0.6; }
        S.run(h.fn); yield () => !S.busy();
      }
    }
    yield () => done() && !S.busy();
    S.player.enabled = false; h8.goalText = null;
    if (S.player.a && S.player.a.anim === 'walk') S.player.a.anim = 'idle';
  },
  // several scripted things at once: yield* h8.all(gen1, gen2)
  *all(...gens) { const ts = gens.map(g => S.run(g, { block: false })); yield () => ts.every(t => t.done); },

  // chapter flow
  chapter(n) {
    S.state.chapter = n;
    S.state.max = Math.max(S.state.max || 1, n);
    S.save();
    S.tasks = []; S.notebook.open = false;
    S.ui.box = null; S.ui.narr = null; S.ui.bars = 0;
    S.player.enabled = false;
    if (S.scene !== S.world) S.go(S.world);
    const ch = S.CH[n];
    S.run(function* () {
      yield* S.chapterCard(n, ch.title, ch.sub);
      yield* ch.run();
      if (n < 6) h8.chapter(n + 1); else S.go(S.title);
    }, { block: false, name: 'chapter' });
  },

  update() {
    const w = h8.weather;
    if (w) {
      for (const f of w.flakes) {
        f.x += f.vx * w.wind + Math.sin((S.frame + f.p) * 0.05) * 0.2; f.y += f.vy;
        if (f.y > S.H + 4 || f.x > S.W + 8 || f.x < -8) Object.assign(f, flake(false));
      }
      if (S.frame % 150 === 0) S.sfx(Math.random() < 0.4 ? 'gust' : 'wind');
    }
    for (const o of h8.overlay) o.t++;
    h8.overlay = h8.overlay.filter(o => o.t < o.life);
  },

  draw(g) {
    const w = h8.weather;
    // handcuff chain between Ruth and Daisy
    if (h8.chain) {
      const [a, b] = h8.chain;
      if (a.visible && b.visible && !a.dead) {
        const [ax, ay] = iso.screenOf(a.x, a.y, a.z + (a.pose === 'sit' ? 0.35 : 0.65));
        const [bx, by] = iso.screenOf(b.x, b.y, b.z + (b.pose === 'sit' ? 0.35 : 0.65));
        const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / 2));
        for (let i = 0; i <= n; i++) {
          const t = i / n, sag = Math.sin(t * Math.PI) * Math.min(6, n * 0.5);
          g.rect(Math.round(ax + (bx - ax) * t), Math.round(ay + (by - ay) * t + sag), 1, 1, i % 2 ? 'mt3' : 'mt2');
        }
      }
    }
    for (const r of h8.ropes) rope(g, r);
    for (const o of h8.overlay) o.draw(g);
    if (w) {
      if (w.fog > 0) fog(g, w.fog);
      for (const f of w.flakes) g.rect(Math.round(f.x), Math.round(f.y), f.s, f.s, f.c);
    }
  },
};

// a sagging rope through points [[x, y, z], ...] (guide line in the whiteout, the hanging rope)
function rope(g, pts) {
  for (let k = 0; k + 1 < pts.length; k++) {
    const [ax, ay] = iso.screenOf(...pts[k]), [bx, by] = iso.screenOf(...pts[k + 1]);
    const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay)));
    for (let i = 0; i <= n; i++) {
      const t = i / n, sag = Math.sin(t * Math.PI) * Math.min(7, n * 0.08);
      g.rect(Math.round(ax + (bx - ax) * t), Math.round(ay + (by - ay) * t + sag), 1, 1, i % 3 ? 'lb3' : 'lb2');
    }
  }
}

function goalHud(g) {
  if (!h8.goalText || !S.player.enabled || S.busy()) return;
  const w = S.font.width(h8.goalText) + 18;
  g.alpha(0.75, () => g.rect(6, 6, w, 15, 'night'));
  g.rect(6, 6, 2, 15, 'gd2');
  g.text(h8.goalText, 13, 9, { color: 'cream' });
  // controls reminder until the player has used things a couple of times
  if ((S.state.flags.uses || 0) < 2) {
    const pad = S.input.device === 'pad';
    const parts = pad ? [[null, 'Stick', 'move'], ['a', null, 'use'], ['select', null, 'notebook'], ['start', null, 'pause']]
      : [[null, 'WASD', 'move'], ['run', null, 'run'], ['a', null, 'use'], ['select', null, 'notebook'], ['b', null, 'pause']];
    let x = 8; const y = S.H - 16;
    g.alpha(0.75, () => g.rect(4, y - 3, S.W - 8, 16, 'night'));
    for (const [b, lab, what] of parts) {
      if (b) x += S.btnGlyph(g, b, x, y);
      else { const kw = S.font.width(lab) + 5; S.keycap(g, x, y, kw); g.text(lab, x + kw / 2, y + 1, { align: 'center', color: 'ink', shadow: false }); x += kw + 1; }
      g.text(what, x + 2, y + 2, { color: 'creamdim' });
      x += S.font.width(what) + 12;
    }
  }
}

function flake(anywhere) {
  const near = Math.random() < 0.25;
  return { x: anywhere ? Math.random() * S.W : -6 + Math.random() * (S.W * 0.6), y: anywhere ? Math.random() * S.H : -4 - Math.random() * 30,
    vx: 0.8 + Math.random() * (near ? 1.8 : 0.9), vy: near ? 1.2 + Math.random() : 0.45 + Math.random() * 0.5,
    s: near ? 2 : 1, c: near ? 'sn5' : (Math.random() < 0.5 ? 'sn4' : 'sn3'), p: Math.random() * 100 };
}

// whiteout: visibility shrinks to a ragged circle around the player, in stepped bands
function fog(g, k) {
  const a = S.player.a && S.player.a.visible ? S.player.a : iso.cam.follow;
  const [cx, cy] = a ? iso.screenOf(a.x, a.y, 0.9) : [S.W / 2, S.H / 2];
  const R = 150 - k * 105;
  const bands = [[R, 0.35], [R + 14, 0.6], [R + 30, 0.85]];
  for (let y = 0; y < S.H; y += 2) {
    for (const [r, al] of bands) {
      const dy = (y - cy) * 1.6;
      const wob = Math.sin(y * 0.11 + S.frame * 0.03) * 4;
      const hw = r * r > dy * dy ? Math.sqrt(r * r - dy * dy) + wob : -1;
      g.alpha(al * k, () => {
        if (hw < 0) g.rect(0, y, S.W, 2, 'sn4');
        else { g.rect(0, y, Math.max(0, cx - hw), 2, 'sn4'); g.rect(cx + hw, y, S.W, 2, 'sn4'); }
      });
    }
  }
}

// ---------------------------------------------------------------- the scene
S.world = {
  enter() {},
  update() {
    S.player.update();
    iso.update();
    h8.update();
    S.notebook.update();
  },
  draw(g) {
    iso.draw(g);
    h8.draw(g);
    S.player.drawPrompt(g);
    goalHud(g);
    S.notebook.draw(g);
  },
};
})();
