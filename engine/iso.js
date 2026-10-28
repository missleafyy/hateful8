// Hateful Eight engine — iso: rooms baked by tools/iso.py (colour + per-pixel depth), depth-buffered actors,
// collision, camera, hotspots.
//
// World: x runs screen right-down, y runs screen left-down, z up, 1 unit = 1 tile.
//   room px:  sx = (x - y) * 16 + ox      sy = (x + y) * 8 - z * 20 + oy      depth = x + y + 0.8 z
// Actors are upright billboards: a sprite row r pixels above the feet sits at height r / 20, so its depth is
// feetDepth + 0.8 * r / 20. Against the baked depth map that is exactly right for anything the camera sees.
//
//   S.iso.defRoom('minnie', { w, h, ox, oy, color: dataURI, depth: dataURI, coll: { res, w, h, data }, spots })
//   S.iso.enter('minnie')                       set the room (after S.iso.load)
//   const a = S.iso.actor({ name: 'warren', sprite: 'warren', x: 3, y: 4, facing: 'se' })
//   yield* S.iso.walkTo(a, 5, 6)               scripted walk
(function () {
'use strict';
const S = window.Sprout;
const DK = 0.8, ZS = 20;

const iso = S.iso = {
  rooms: {}, room: null, actors: [], hotspots: [], decals: [], points: [],
  cam: { x: 0, y: 0, tx: null, shake: 0, lock: false },
  grade: [256, 256, 256],          // actor colour multiplier (x/256) for the room's light
  lights: [],                      // { x, y, z, r, col: [r,g,b] add, flicker }
  void: 0xff141018,

  defRoom(name, def) { iso.rooms[name] = Object.assign({ name, loaded: false }, def); },
  // depth sprites: 3D props rendered by tools/iso.py with their own per-pixel depth (relative to the anchor)
  //   S.iso.defDS('coach', { ox, oy, w, h, frames: [{ color, depth }] })
  dsprites: {},
  defDS(name, def) { iso.dsprites[name] = Object.assign({ name, loaded: false }, def); },

  // decode every room's images; cb() when done
  load(cb) {
    const list = Object.values(iso.rooms).filter(r => !r.loaded);
    const dsl = Object.values(iso.dsprites).filter(d => !d.loaded);
    let n = list.length * 2 + dsl.reduce((a, d) => a + d.frames.length * 2, 0);
    if (!n) { cb(); return; }
    const done = () => { if (--n === 0) cb(); };
    for (const r of list) {
      const ci = new Image(), di = new Image();
      ci.onload = () => { const d = pixels(ci); r.col = new Uint32Array(d.data.buffer); done(); };
      di.onload = () => {
        const d = pixels(di).data, dep = new Float32Array(r.w * r.h);
        for (let i = 0; i < dep.length; i++) dep[i] = d[i * 4 + 3] ? (d[i * 4] * 256 + d[i * 4 + 1]) / 256 - 64 : -999;
        r.dep = dep; done();
      };
      ci.onerror = di.onerror = () => { console.error('room image failed', r.name); done(); };
      ci.src = r.color; di.src = r.depth;
      r.loaded = true;
      if (r.coll) r.block = Uint8Array.from(r.coll.data, c => c === '1' ? 1 : 0);
    }
    for (const d of dsl) {
      d.loaded = true;
      d.frames.forEach(f => {
        const ci = new Image(), di = new Image();
        ci.onload = () => { f.col = new Uint32Array(pixels(ci).data.buffer); done(); };
        di.onload = () => {
          const p = pixels(di).data, dep = new Float32Array(d.w * d.h);
          for (let i = 0; i < dep.length; i++) dep[i] = p[i * 4 + 3] ? (p[i * 4] * 256 + p[i * 4 + 1]) / 256 - 64 : -999;
          f.dep = dep; done();
        };
        ci.onerror = di.onerror = done;
        ci.src = f.color; di.src = f.depth;
      });
    }
  },

  enter(name, opt = {}) {
    const r = iso.rooms[name];
    if (!r) { console.error('no room', name); return; }
    iso.room = r;
    iso.actors = opt.keepActors ? iso.actors : [];
    iso.hotspots = []; iso.decals = []; iso.points = []; iso.lights = (r.lights || []).map(l => Object.assign({}, l));
    iso.grade = r.grade || [256, 256, 256];
    iso.cam.tx = null;
    iso.floorBlood = new Uint32Array(r.w * r.h);
  },

  spot(name) { const s = iso.room.spots && iso.room.spots[name]; if (!s) S.warnOnce('no spot ' + name); return s || [1, 1]; },

  toScreen(x, y, z = 0) { const r = iso.room; return [(x - y) * 16 + r.ox, (x + y) * 8 - z * ZS + r.oy]; },
  fromScreen(sx, sy) {
    const r = iso.room, a = (sx - r.ox) / 16, b = (sy - r.oy) / 8;
    return [(a + b) / 2, (b - a) / 2];
  },

  // ------------------------------------------------------------- collision
  blocked(x, y) {
    const r = iso.room, c = r.coll;
    if (!c) return false;
    const cx = Math.floor((x - (c.x0 || 0)) * c.res), cy = Math.floor((y - (c.y0 || 0)) * c.res);
    if (cx < 0 || cy < 0 || cx >= c.w || cy >= c.h) return true;
    return r.block[cy * c.w + cx] === 1 || (iso.extraBlock && iso.extraBlock(x, y));
  },
  free(x, y, rad, self) {
    for (const [ox, oy] of [[0, 0], [rad, 0], [-rad, 0], [0, rad], [0, -rad], [rad * .7, rad * .7], [-rad * .7, rad * .7], [rad * .7, -rad * .7], [-rad * .7, -rad * .7]])
      if (iso.blocked(x + ox, y + oy)) return false;
    for (const a of iso.actors) {
      if (a === self || !a.solid || !a.visible) continue;
      const d = Math.hypot(a.x - x, a.y - y);
      if (d < rad + a.rad && d < Math.hypot(a.x - self.x, a.y - self.y) - 0.001) return false;
    }
    return true;
  },
  // move with sliding along walls
  move(a, dx, dy) {
    if (!dx && !dy) return false;
    let moved = false;
    // never trap anyone: if they're already overlapping something (spawned or seated there), let them walk out
    if (!iso.free(a.x, a.y, a.rad, a) && !iso.blocked(a.x + dx * 4, a.y + dy * 4)) { a.x += dx; a.y += dy; return true; }
    if (iso.free(a.x + dx, a.y + dy, a.rad, a)) { a.x += dx; a.y += dy; return true; }
    if (dx && iso.free(a.x + dx, a.y, a.rad, a)) { a.x += dx; moved = true; }
    else if (dy && iso.free(a.x, a.y + dy, a.rad, a)) { a.y += dy; moved = true; }
    return moved;
  },

  // ------------------------------------------------------------- actors
  actor(o) {
    const a = Object.assign({
      x: 1, y: 1, z: 0, sprite: null, facing: 'se', anim: 'idle', t: 0, frame: 0, visible: true, solid: true,
      rad: 0.22, speed: 0.045, mode: 'stand', bias: 0.06, tint: null, flash: 0, label: null, alpha: 1,
      pose: null,     // fixed frame name ('sit', 'dead', ...): overrides anim
    }, o);
    iso.actors.push(a);
    return a;
  },
  remove(a) { iso.actors = iso.actors.filter(b => b !== a); },
  find(name) { return iso.actors.find(a => a.name === name); },

  facingFrom(dx, dy, prev) {
    const sx = dx - dy, sy = dx + dy;
    if (Math.abs(sx) < 1e-6 && Math.abs(sy) < 1e-6) return prev;
    let h = sx > 1e-6 ? 'e' : sx < -1e-6 ? 'w' : prev[1];
    let v = sy > 1e-6 ? 's' : sy < -1e-6 ? 'n' : prev[0];
    return v + h;
  },
  face(a, b) { a.facing = iso.facingFrom(b.x - a.x, b.y - a.y, a.facing); },

  // frame name for an actor right now (sprites store se_* / ne_*; sw/nw are flips)
  frameOf(a) {
    const s = S.sprites[a.sprite]; if (!s) return null;
    const side = a.facing[0] === 'n' ? 'ne' : 'se';
    const flip = a.facing[1] === 'w';
    const tim = (s.def.anims || {});
    let key;
    if (a.pose) {
      const an = tim[a.pose];
      key = s.has(side + '_' + a.pose) ? side + '_' + a.pose : s.has(a.pose) ? a.pose
        : an ? side + '_' + a.pose + (an.once ? Math.min(an.n - 1, Math.floor(a.t / an.ms)) : Math.floor(a.t / an.ms) % an.n) : side + '_idle0';
      if (!s.has(key)) key = s.has(side + '_idle0') ? side + '_idle0' : Object.keys(s.src)[0];
    } else {
      const an = tim[a.anim] || tim.idle || { n: 1, ms: 30 };
      const ms = an.ms * (a.anim === 'walk' && a.run ? 0.6 : 1);
      const f = an.once ? Math.min(an.n - 1, Math.floor(a.t / ms)) : Math.floor(a.t / ms) % an.n;
      key = side + '_' + a.anim + f;
      if (!s.has(key)) key = s.has(side + '_idle0') ? side + '_idle0' : Object.keys(s.src)[0];
    }
    return { s, key, flip };
  },

  // walk an actor along a list of points (generator for scripts)
  *walkTo(a, x, y, opt = {}) {
    const pts = Array.isArray(x) ? x : [[x, y]];
    a.scripted = true;
    for (const [tx, ty] of pts) {
      let guard = 0;
      while (guard++ < 2000) {
        const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy);
        if (d < 0.04) { a.x = tx; a.y = ty; break; }
        const sp = Math.min(d, (opt.speed || a.speed) * (S.isoSpeed || 1));
        a.facing = iso.facingFrom(dx, dy, a.facing);
        a.anim = 'walk';
        if (opt.ghost) { a.x += dx / d * sp; a.y += dy / d * sp; }
        else {
          // slide along walls, but if that isn't getting us any closer, walk through (scripts must arrive)
          const px = a.x, py = a.y;
          iso.move(a, dx / d * sp, dy / d * sp);
          if (Math.hypot(tx - a.x, ty - a.y) > d - sp * 0.3) { a.x = px + dx / d * sp; a.y = py + dy / d * sp; }
        }
        yield 1;
      }
    }
    a.anim = 'idle'; a.scripted = false;
    if (opt.face) a.facing = opt.face;
  },

  // ------------------------------------------------------------- hotspots
  // { x, y, r, label, fn (generator fn), when: () => bool, actor }
  hot(h) { iso.hotspots.push(Object.assign({ r: 0.9, when: null }, h)); return h; },
  clearHot() { iso.hotspots = []; },
  nearestHot(p) {
    let best = null, bd = 1e9;
    for (const h of iso.hotspots) {
      if (h.when && !h.when()) continue;
      const hx = h.actor ? h.actor.x : h.x, hy = h.actor ? h.actor.y : h.y;
      const d = Math.hypot(hx - p.x, hy - p.y);
      if (d > h.r) continue;
      // prefer what the player is facing
      const fx = p.facing[1] === 'e' ? 1 : -1, fy = p.facing[0] === 's' ? 1 : -1;
      const sx = (hx - p.x) - (hy - p.y), sy = (hx - p.x) + (hy - p.y);
      const facingBonus = (Math.sign(sx) === fx ? -0.15 : 0.1) + (Math.sign(sy) === fy ? -0.15 : 0.1);
      if (d + facingBonus < bd) { bd = d + facingBonus; best = h; }
    }
    return best;
  },

  // ------------------------------------------------------------- effects
  // blood (or melted snow, spilled coffee) painted onto visible floor pixels
  splat(x, y, rad, col, seed = 1) {
    const r = iso.room; const [cx, cy] = iso.toScreen(x, y);
    const c = S.iso.rgb32(col);
    const rx = Math.ceil(rad * 16) + 2, ry = Math.ceil(rad * 8) + 2;
    for (let py = -ry; py <= ry; py++) for (let px = -rx; px <= rx; px++) {
      const nx = px / (rad * 16), ny = py / (rad * 8);
      const wob = 0.82 + 0.3 * S.hash(Math.floor((px + 99) / 2), Math.floor((py + 99) / 2), seed);
      if (nx * nx + ny * ny > wob * wob) continue;
      const X = Math.round(cx + px), Y = Math.round(cy + py);
      if (X < 0 || Y < 0 || X >= r.w || Y >= r.h) continue;
      const i = Y * r.w + X;
      const floorD = (Y + 0.5 - r.oy) / 8;
      if (Math.abs(r.dep[i] - floorD) < 0.08) iso.floorBlood[i] = c;
    }
  },
  // short-lived pixel particles with depth: { x, y, z, vx, vy, vz, life, col, g (gravity) }
  emit(p) { iso.points.push(Object.assign({ vx: 0, vy: 0, vz: 0, life: 30, g: 0.004, t: 0 }, p, { c32: iso.rgb32(p.col) })); },
  rgb32(col) {
    let h = S.color(col).slice(1);
    return 0xff000000 | (parseInt(h.slice(4, 6), 16) << 16) | (parseInt(h.slice(2, 4), 16) << 8) | parseInt(h.slice(0, 2), 16);
  },

  update() {
    for (const a of iso.actors) {
      a.t++;
      if (a.flash > 0) a.flash--;
    }
    for (const p of iso.points) {
      p.t++; p.x += p.vx; p.y += p.vy; p.z += p.vz; p.vz -= p.g;
      if (p.z < 0) {
        p.z = 0; p.vx *= 0.5; p.vy *= 0.5; p.vz = 0;
        if (p.stain && !p.stained) { p.stained = true; iso.splat(p.x, p.y, p.stain, p.col, Math.floor(p.x * 31)); p.life = 0; }
      }
    }
    iso.points = iso.points.filter(p => p.t < p.life);
    for (const l of iso.lights) if (l.flicker) l.k = 1 + Math.sin(S.frame * 0.21 + l.x) * 0.06 * l.flicker + (S.hash(S.frame >> 2, 3) - 0.5) * 0.1 * l.flicker;
    // camera
    const c = iso.cam;
    if (c.follow && !c.lock) {
      const [tx, ty] = iso.toScreen(c.follow.x, c.follow.y, 0.9);
      c.x += (tx - c.x) * 0.12; c.y += (ty - c.y) * 0.12;
    } else if (c.tx != null) {
      c.x += (c.tx - c.x) * (c.ease || 0.08); c.y += (c.ty - c.y) * (c.ease || 0.08);
    }
    if (c.shake > 0) c.shake--;
  },
  look(x, y, z = 0.9, snap) {
    const [tx, ty] = iso.toScreen(x, y, z);
    iso.cam.tx = tx; iso.cam.ty = ty; iso.cam.follow = null;
    if (snap) { iso.cam.x = tx; iso.cam.y = ty; }
  },
  follow(a, snap) { iso.cam.follow = a; if (snap) { const [tx, ty] = iso.toScreen(a.x, a.y, 0.9); iso.cam.x = tx; iso.cam.y = ty; } },

  // camera top-left in room pixels, clamped so the room fills the screen when it can
  camOrigin() {
    const r = iso.room, c = iso.cam;
    let x = Math.round(c.x - S.W / 2), y = Math.round(c.y - S.H / 2);
    if (r.w <= S.W) x = Math.round((r.w - S.W) / 2); else x = S.clamp(x, 0, r.w - S.W);
    if (r.h <= S.H) y = Math.round((r.h - S.H) / 2) + (r.yshift || 0); else y = S.clamp(y, 0, r.h - S.H);
    if (c.shake > 0) { x += S.rand(-2, 2) * (c.shake > 6 ? 1 : 0.5); y += S.rand(-1, 1); }
    return [x, y];
  },

  // ------------------------------------------------------------- drawing
  draw(g) {
    const r = iso.room; if (!r || !r.col || !r.dep) return;
    if (!iso.img) {
      iso.img = g.ctx.createImageData(S.W, S.H);
      iso.buf = new Uint32Array(iso.img.data.buffer);
      iso.dbuf = new Float32Array(S.W * S.H);
    }
    const buf = iso.buf, dbuf = iso.dbuf, W = S.W, H = S.H;
    const [cx, cy] = iso.camOrigin();
    iso.cx = cx; iso.cy = cy;
    const voidC = r.void != null ? r.void : iso.void;
    for (let y = 0; y < H; y++) {
      const ry = y + cy, o = y * W;
      if (ry < 0 || ry >= r.h) { buf.fill(voidC, o, o + W); dbuf.fill(-999, o, o + W); continue; }
      const x0 = Math.max(0, -cx), x1 = Math.min(W, r.w - cx);
      if (x0 > 0) { buf.fill(voidC, o, o + x0); dbuf.fill(-999, o, o + x0); }
      if (x1 < W) { buf.fill(voidC, o + Math.max(0, x1), o + W); dbuf.fill(-999, o + Math.max(0, x1), o + W); }
      if (x1 > x0) {
        const ro = ry * r.w + cx;
        buf.set(r.col.subarray(ro + x0, ro + x1), o + x0);
        dbuf.set(r.dep.subarray(ro + x0, ro + x1), o + x0);
        const fb = iso.floorBlood;
        for (let x = x0; x < x1; x++) { const b = fb[ro + x]; if (b) buf[o + x] = b; }
      }
    }
    // void pixels (outside the room) count as far away
    // shadows under actors
    for (const a of iso.actors) if (a.visible && a.shadow !== false && a.mode !== 'flat' && !a.ds) iso.shadow(a, cx, cy);
    for (const a of iso.actors) if (a.visible) iso.drawActor(a, cx, cy);
    for (const p of iso.points) iso.point(p, cx, cy);
    if (iso.preBlit) iso.preBlit(buf, dbuf, cx, cy);
    g.ctx.putImageData(iso.img, 0, 0);
  },

  shadow(a, cx, cy) {
    const r = iso.room, [sx, sy] = iso.toScreen(a.x, a.y, 0);
    const X = Math.round(sx - cx), Y = Math.round(sy - cy);
    const rx = a.shadowW || 7, ry = Math.max(2, Math.round(rx / 2.4));
    const buf = iso.buf, dbuf = iso.dbuf, W = S.W, fd = a.x + a.y;
    for (let dy = -ry; dy <= ry; dy++) {
      const yy = Y + dy; if (yy < 0 || yy >= S.H) continue;
      const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / (ry + 0.5)) ** 2)));
      for (let dx = -hw; dx < hw; dx++) {
        const xx = X + dx; if (xx < 0 || xx >= W) continue;
        const i = yy * W + xx;
        // only on surfaces at about the feet's height (floor), not on things in front
        const floorD = (yy + cy + 0.5 - r.oy) / 8;
        if (Math.abs(dbuf[i] - floorD) > 0.12 && Math.abs(dbuf[i] - fd) > 0.3) continue;
        const c = buf[i];
        buf[i] = 0xff000000 | (((c >> 16 & 255) * 0.68) << 16) | (((c >> 8 & 255) * 0.66) << 8) | ((c & 255) * 0.72);
      }
    }
  },

  frameData(s, key, flip) {
    const ck = '_px_' + key + (flip ? '|f' : '');
    if (s.cache[ck]) return s.cache[ck];
    const cv = s.get(key, flip); if (!cv) return null;
    const d = cv.getContext('2d').getImageData(0, 0, s.w, s.h);
    return (s.cache[ck] = new Uint32Array(d.data.buffer));
  },

  drawDS(a, cx, cy) {
    const d = iso.dsprites[a.ds]; if (!d) return;
    const f = d.frames[(a.dsFrame || 0) % d.frames.length]; if (!f || !f.col || !f.dep) return;
    const [sx, sy] = iso.toScreen(a.x, a.y, a.z);
    const X0 = Math.round(sx - cx - d.ox), Y0 = Math.round(sy - cy - d.oy);
    const buf = iso.buf, dbuf = iso.dbuf, W = S.W, H = S.H, base = a.x + a.y + DK * a.z + (a.bias || 0);
    const [gr, gg, gb] = a.grade || iso.grade;
    for (let y = 0; y < d.h; y++) {
      const Y = Y0 + y; if (Y < 0 || Y >= H) continue;
      const o = Y * W, so = y * d.w;
      for (let x = 0; x < d.w; x++) {
        const p = f.col[so + x]; if (!(p >>> 24)) continue;
        const X = X0 + x; if (X < 0 || X >= W) continue;
        const i = o + X, dd = base + f.dep[so + x];
        if (dd <= dbuf[i]) continue;
        dbuf[i] = dd;
        let R = (p & 255) * gr >> 8, G = (p >> 8 & 255) * gg >> 8, B = (p >> 16 & 255) * gb >> 8;
        buf[i] = 0xff000000 | (Math.min(255, B) << 16) | (Math.min(255, G) << 8) | Math.min(255, R);
      }
    }
  },

  drawActor(a, cx, cy) {
    if (a.ds) return iso.drawDS(a, cx, cy);
    const fr = iso.frameOf(a); if (!fr) return;
    const { s, key, flip } = fr;
    const px = iso.frameData(s, key, flip); if (!px) return;
    const [sx, sy] = iso.toScreen(a.x, a.y, a.z);
    const ox = flip ? s.w - s.origin[0] : s.origin[0], oy = s.origin[1];
    const X0 = Math.round(sx - cx - ox + (a.dx || 0)), Y0 = Math.round(sy - cy - oy + (a.dy || 0));
    const buf = iso.buf, dbuf = iso.dbuf, W = S.W, H = S.H;
    const base = a.x + a.y + DK * a.z + a.bias;
    // light: room grade x nearby lights
    let [gr, gg, gb] = a.grade || iso.grade;
    for (const l of iso.lights) {
      const d = Math.hypot(a.x - l.x, a.y - l.y);
      if (d < l.r) { const k = (1 - d / l.r) * (l.k || 1); gr += l.col[0] * k; gg += l.col[1] * k; gb += l.col[2] * k; }
    }
    gr = Math.min(400, gr) | 0; gg = Math.min(400, gg) | 0; gb = Math.min(400, gb) | 0;
    const flash = a.flash > 0 && (a.flash >> 1) % 2 === 0;
    const flat = a.mode === 'flat';
    const r = iso.room;
    for (let y = 0; y < s.h; y++) {
      const Y = Y0 + y; if (Y < 0 || Y >= H) continue;
      const d = flat ? (Y + cy + 0.5 - r.oy) / 8 + a.bias + DK * a.z : base + DK * (oy - y) / ZS;
      const o = Y * W, so = y * s.w;
      for (let x = 0; x < s.w; x++) {
        const p = px[so + x]; if (!(p >>> 24)) continue;
        const X = X0 + x; if (X < 0 || X >= W) continue;
        const i = o + X;
        if (d <= dbuf[i]) continue;
        dbuf[i] = d;
        if (flash) { buf[i] = 0xfff0f4ff; continue; }
        let R = (p & 255) * gr >> 8, G = (p >> 8 & 255) * gg >> 8, B = (p >> 16 & 255) * gb >> 8;
        if (R > 255) R = 255; if (G > 255) G = 255; if (B > 255) B = 255;
        if (a.alpha < 1) {
          const q = buf[i], k = a.alpha;
          R = R * k + (q & 255) * (1 - k); G = G * k + (q >> 8 & 255) * (1 - k); B = B * k + (q >> 16 & 255) * (1 - k);
        }
        buf[i] = 0xff000000 | (B << 16) | (G << 8) | R;
      }
    }
    a._scr = [X0 + ox, Y0 + oy, s.h];     // feet on screen, for labels and prompts
  },

  point(p, cx, cy) {
    const [sx, sy] = iso.toScreen(p.x, p.y, p.z);
    const X = Math.round(sx - cx), Y = Math.round(sy - cy);
    const sz = p.size || 1;
    const d = p.x + p.y + DK * p.z + 0.1;
    for (let yy = 0; yy < sz; yy++) for (let xx = 0; xx < sz; xx++) {
      const x = X + xx, y = Y + yy;
      if (x < 0 || y < 0 || x >= S.W || y >= S.H) continue;
      const i = y * S.W + x;
      if (d > iso.dbuf[i] || p.top) { iso.buf[i] = p.c32; }
    }
  },

  // screen position (canvas px) of a world point, for UI over the world
  screenOf(x, y, z = 0) { const [sx, sy] = iso.toScreen(x, y, z); return [Math.round(sx - iso.cx), Math.round(sy - iso.cy)]; },
};

function pixels(img) {
  const c = S.canvas(img.width, img.height), x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  return x.getImageData(0, 0, img.width, img.height);
}
})();
