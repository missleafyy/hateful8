"""iso — a tiny isometric ray-caster for pixel-art environments.

World: x runs screen right-down, y runs screen left-down, z up. One tile = 1 unit.
    sx = (x - y) * 16 + OX        sy = (x + y) * 8 - z * 20 + OY        depth = x + y + 0.8 z
Every pixel centre casts a ray along v = (1, 1, 0.8). The surface nearest the viewer (largest t) wins, so only
+x, +y and +z faces are ever visible, and box edges land on clean 2:1 stairs.

Primitives: Convex (half-spaces; Box is a convex), Cyl (vertical), Cone (vertical), Ellip (ellipsoid).
Each prim has a material: a ramp of palette names (dark -> light) and a texture fn that returns a ramp
index per pixel. Decals (hand-drawn grids) map onto a prim face in texels (1/16 tile wide, 1/20 tile tall
on walls), so they come out skewed correctly on the 2:1 grid.
Output: RGBA image, depth (float32), and the screen position of the world origin.
"""
import math
import numpy as np
from PIL import Image
from pal import PAL

V = np.array([1.0, 1.0, 0.8])
NEG = -1e9

def hexrgb(h):
    h = PAL.get(h, h).lstrip('#'); return [int(h[i:i+2], 16) for i in (0, 2, 4)]


class Prim:
    def __init__(self, mat, tex=None, tag=None, decals=None, outline=True, rim=True, **kw):
        self.mat, self.tex, self.tag = mat, tex, tag
        self.decals = decals or []
        self.outline, self.rim = outline, rim
        self.kw = kw


class Convex(Prim):
    """planes: list of (n, d) with n . p <= d inside."""
    def __init__(self, planes, mat, **kw):
        super().__init__(mat, **kw); self.planes = [(np.array(n, float), float(d)) for n, d in planes]

    def hit(self, P):
        n_pix = P.shape[0]
        lo = np.full(n_pix, -np.inf); hi = np.full(n_pix, np.inf)
        nrm = np.zeros((n_pix, 3))
        ok = np.ones(n_pix, bool)
        for n, d in self.planes:
            nv = n @ V; nP = P @ n
            if abs(nv) < 1e-9:
                ok &= nP <= d; continue
            t = (d - nP) / nv
            if nv > 0:
                better = t < hi; hi = np.where(better, t, hi); nrm[better] = n
            else:
                lo = np.maximum(lo, t)
        ok &= lo <= hi
        t = np.where(ok, hi, NEG)
        L = np.linalg.norm(nrm, axis=1, keepdims=True); L[L == 0] = 1
        return t, nrm / L


def Box(x0, y0, z0, x1, y1, z1, mat, **kw):
    b = Convex([((1, 0, 0), x1), ((-1, 0, 0), -x0), ((0, 1, 0), y1), ((0, -1, 0), -y0), ((0, 0, 1), z1), ((0, 0, -1), -z0)], mat, **kw)
    b.box = (x0, y0, z0, x1, y1, z1)
    return b


class Cyl(Prim):
    def __init__(self, cx, cy, r, z0, z1, mat, **kw):
        super().__init__(mat, **kw); self.c = (cx, cy, r, z0, z1)

    def hit(self, P):
        cx, cy, r, z0, z1 = self.c
        a, b = P[:, 0] - cx, P[:, 1] - cy
        # (a+t)^2 + (b+t)^2 = r^2  ->  2t^2 + 2(a+b)t + (a^2+b^2-r^2) = 0
        A, B, C = 2.0, 2 * (a + b), a * a + b * b - r * r
        disc = B * B - 4 * A * C
        sq = np.sqrt(np.maximum(disc, 0))
        t_side = (-B + sq) / (2 * A)
        z_side = P[:, 2] + 0.8 * t_side
        side_ok = (disc >= 0) & (z_side >= z0) & (z_side <= z1)
        t_cap = (z1 - P[:, 2]) / 0.8
        ca, cb = a + t_cap, b + t_cap
        cap_ok = ca * ca + cb * cb <= r * r
        t = np.full(P.shape[0], NEG); nrm = np.zeros((P.shape[0], 3))
        ts = np.where(side_ok, t_side, NEG); tc = np.where(cap_ok, t_cap, NEG)
        use_cap = tc >= ts
        t = np.maximum(ts, tc)
        nrm[:, 0] = np.where(use_cap, 0, (a + t_side) / r); nrm[:, 1] = np.where(use_cap, 0, (b + t_side) / r)
        nrm[:, 2] = np.where(use_cap, 1, 0)
        return t, nrm


class Cone(Prim):
    """Vertical cone: radius R at z0, apex at z0 + h."""
    def __init__(self, cx, cy, R, z0, h, mat, **kw):
        super().__init__(mat, **kw); self.c = (cx, cy, R, z0, h)

    def hit(self, P):
        cx, cy, R, z0, h = self.c
        k = R / h
        a, b, c = P[:, 0] - cx, P[:, 1] - cy, P[:, 2] - z0
        # (a+t)^2 + (b+t)^2 = k^2 (h - c - 0.8t)^2
        e = h - c
        A = 2 - k * k * 0.64
        B = 2 * (a + b) + 2 * k * k * 0.8 * e
        C = a * a + b * b - k * k * e * e
        disc = B * B - 4 * A * C
        sq = np.sqrt(np.maximum(disc, 0))
        t1, t2 = (-B + sq) / (2 * A), (-B - sq) / (2 * A)
        best = np.full(P.shape[0], NEG)
        for tt in (t1, t2):
            z = c + 0.8 * tt
            ok = (disc >= 0) & (z >= 0) & (z <= h)
            best = np.where(ok & (tt > best), tt, best)
        ax, by = a + best, b + best
        rr = np.sqrt(ax * ax + by * by) + 1e-9
        nrm = np.stack([ax / rr, by / rr, np.full_like(rr, k)], 1)
        nrm /= np.linalg.norm(nrm, axis=1, keepdims=True)
        return best, nrm


class Ellip(Prim):
    def __init__(self, cx, cy, cz, rx, ry, rz, mat, zmin=-1e9, **kw):
        super().__init__(mat, **kw); self.c = (cx, cy, cz, rx, ry, rz, zmin)

    def hit(self, P):
        cx, cy, cz, rx, ry, rz, zmin = self.c
        o = np.stack([(P[:, 0] - cx) / rx, (P[:, 1] - cy) / ry, (P[:, 2] - cz) / rz], 1)
        d = np.array([1 / rx, 1 / ry, 0.8 / rz])
        A = d @ d; B = 2 * (o @ d); C = (o * o).sum(1) - 1
        disc = B * B - 4 * A * C
        t = (-B + np.sqrt(np.maximum(disc, 0))) / (2 * A)
        q = o + t[:, None] * d
        z = P[:, 2] + 0.8 * t
        ok = (disc >= 0) & (z >= zmin)
        nrm = q / np.array([rx, ry, rz]); nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-9
        return np.where(ok, t, NEG), nrm


# ------------------------------------------------------------------ textures
def face_of(n):
    """0 = top, 1 = left face (+y, lit), 2 = right face (+x, shade), 3 = other/curved."""
    f = np.full(n.shape[0], 3)
    f[n[:, 2] > 0.9] = 0
    f[n[:, 1] > 0.9] = 1
    f[n[:, 0] > 0.9] = 2
    return f

def lambert(n, base=None):
    """Curved-surface shading in 0..1 (light from the upper-left and in front: toward -x... +y, +z)."""
    L = np.array([-0.35, 0.55, 0.76]); L /= np.linalg.norm(L)
    return np.clip(n @ L, 0, 1)

def h2(x, y, s=0):
    """cheap integer hash -> [0,1)"""
    h = (x.astype(np.int64) * 374761393 + y.astype(np.int64) * 668265263 + s * 982451653) & 0xffffffff
    h = ((h ^ (h >> 13)) * 1274126177) & 0xffffffff
    return (h ^ (h >> 16)) / 4294967296.0


def tex_flat(levels=(3, 2, 1)):
    """top, left, right face ramp indices; curved faces use lambert."""
    def f(X, Y, Z, n, face, nramp):
        idx = np.choose(np.minimum(face, 2), levels)
        lam = np.clip((lambert(n) * (nramp - 0.6)).astype(int), 0, nramp - 1)
        return np.where(face == 3, lam, idx)
    return f


def tex_planks(axis='x', width=0.25, levels=(3, 2, 1), seams=True, grain=0.08, seed=1, plank_len=2.0):
    """Floor / table planks running along axis on top faces; vertical boards on side faces."""
    def f(X, Y, Z, n, face, nramp):
        idx = np.choose(np.minimum(face, 2), levels).astype(int)
        u = X if axis == 'x' else Y       # along plank
        w = Y if axis == 'x' else X       # across planks
        top = face == 0
        row = np.floor(w / width).astype(int)
        off = h2(row, row * 3, seed) * plank_len
        col = np.floor((u + off) / plank_len).astype(int)
        r = h2(row, col, seed + 7)
        idx = idx + np.where(top & (r < 0.18), -1, 0) + np.where(top & (r > 0.9), 1, 0)
        if seams:
            fw = (w / width) % 1.0
            idx = np.where(top & (fw < 1 / (width * 16) * 0.99), np.maximum(0, idx - 2), idx)        # 1px seam
            fu = ((u + off) / plank_len) % 1.0
            idx = np.where(top & (fu < 0.03), np.maximum(0, idx - 2), idx)
        # grain streaks
        g = h2(np.floor(u * 6).astype(int), row * 11 + np.floor(w * 40).astype(int), seed + 3)
        idx = idx - np.where(top & (g < grain), 1, 0)
        # side faces: vertical boards
        sideu = np.where(face == 1, X, Y)
        bw = (sideu / width) % 1.0
        idx = np.where((face == 1) | (face == 2), np.where(bw < 0.08, idx - 1, idx), idx)
        return np.clip(idx, 0, nramp - 1)
    return f


def tex_logs(height=0.36, levels=(3, 3, 1), seed=2):
    """Log walls: horizontal round logs, each shaded top-light / bottom-dark, with chinking between."""
    def f(X, Y, Z, n, face, nramp):
        base = np.choose(np.minimum(face, 2), levels).astype(int)
        fz = (Z / height) % 1.0
        k = np.floor(Z / height).astype(int)
        u = np.where(face == 1, X, Y)
        idx = base.copy()
        idx = np.where(fz > 0.78, idx + 1, idx)            # top of each log catches light
        idx = np.where(fz < 0.3, idx - 1, idx)             # underside
        idx = np.where(fz < 0.1, 0, idx)                   # chink gap (darkest)
        knot = h2(np.floor(u * 3).astype(int), k, seed) < 0.06
        idx = np.where(knot & (fz > 0.35) & (fz < 0.65), idx - 1, idx)
        crack = h2(np.floor(u * 9).astype(int), k * 7, seed + 1) < 0.08
        idx = np.where(crack & (np.abs(fz - 0.5) < 0.06), idx - 1, idx)
        return np.clip(idx, 0, nramp - 1)
    return f


def tex_snow(seed=3):
    def f(X, Y, Z, n, face, nramp):
        lam = lambert(n)
        idx = np.clip((lam * (nramp - 0.4)).astype(int), 0, nramp - 1)
        idx = np.where(face == 0, nramp - 2, idx)
        # wind ripples: long soft bands across the ground
        # wind ripples: short soft drifts, broken up so they never line up into stripes
        rip = np.sin((X * 0.9 + Y * 2.3) * 3.1 + np.sin(X * 0.7) * 1.7 + np.sin(Y * 1.3) * 2.0)
        brk = h2(np.floor(X * 1.5).astype(int), np.floor(Y * 3).astype(int), seed + 5) < 0.35
        idx = np.where((face == 0) & (rip > 0.93) & brk, idx - 1, idx)
        sp = h2(np.floor(X * 16).astype(int), np.floor(Y * 16).astype(int), seed) < 0.012
        idx = np.where((face == 0) & sp, nramp - 1, idx)
        return np.clip(idx, 0, nramp - 1)
    return f


def tex_rough(levels=(3, 2, 1), amount=0.12, seed=4, scale=8):
    def f(X, Y, Z, n, face, nramp):
        idx = np.choose(np.minimum(face, 2), levels).astype(int)
        lam = np.clip((lambert(n) * (nramp - 0.6)).astype(int), 0, nramp - 1)
        idx = np.where(face == 3, lam, idx)
        q = h2(np.floor((X + Y) * scale).astype(int), np.floor(Z * scale + (X - Y) * scale * 0.5).astype(int), seed)
        idx = idx - np.where(q < amount, 1, 0)
        return np.clip(idx, 0, nramp - 1)
    return f


# ------------------------------------------------------------------ scene
class Scene:
    def __init__(self, bounds, zmax=4.0, pad=4, lights=None, bg=None, crop=None, scale=1.0):
        """bounds = (x0, y0, x1, y1) world rectangle that must fit; zmax = tallest thing.
        crop = (left, top, right, bottom) in screen px relative to the full canvas: keep only that window
        (exteriors: the ground runs past the edges, so cut a rectangle out of the middle of the diamond)."""
        # scale > 1 draws the model bigger: build it in model units, it renders (and its depth reads) k times larger
        self.k = scale
        x0, y0, x1, y1 = (v * scale for v in bounds); zmax *= scale
        corners = [(x, y, z) for x in (x0, x1) for y in (y0, y1) for z in (0, zmax)]
        sxs = [(x - y) * 16 for x, y, z in corners]; sys_ = [(x + y) * 8 - z * 20 for x, y, z in corners]
        self.OX = int(-min(sxs)) + pad; self.OY = int(-min(sys_)) + pad
        self.w = int(max(sxs) - min(sxs)) + 2 * pad; self.h = int(max(sys_) - min(sys_)) + 2 * pad
        if crop:
            l, t, r, b = crop
            self.OX -= l; self.OY -= t; self.w = r - l; self.h = b - t
        self.prims = []
        self.lights = lights or []      # (x, y, z, radius, strength)
        self.bg = bg

    def add(self, *ps):
        for p in ps: self.prims.append(p)
        return ps[0] if len(ps) == 1 else ps

    def render(self, outline=True):
        w, h = self.w, self.h
        ys, xs = np.mgrid[0:h, 0:w]
        sx = (xs + 0.5 - self.OX).ravel(); sy = (ys + 0.5 - self.OY).ravel()
        # point on z=0 for each pixel
        P = np.stack([(sx / 16 + sy / 8) / 2, (sy / 8 - sx / 16) / 2, np.zeros_like(sx)], 1) / self.k
        N = P.shape[0]
        best = np.full(N, NEG); pid = np.full(N, -1); nrm = np.zeros((N, 3))
        for i, p in enumerate(self.prims):
            t, n = p.hit(P)
            m = t > best
            best[m] = t[m]; pid[m] = i; nrm[m] = n[m]
        hitp = P + best[:, None] * V
        X, Y, Z = hitp[:, 0], hitp[:, 1], hitp[:, 2]
        face = face_of(nrm)
        ramp_idx = np.zeros(N, int)
        rgb = np.zeros((N, 4), np.uint8)
        light = np.zeros(N)
        for (lx, ly, lz, rad, st) in self.lights:
            d = np.sqrt((X - lx) ** 2 + (Y - ly) ** 2 + ((Z - lz) * 1.3) ** 2)
            light += st * np.clip(1 - d / rad, 0, 1)
        # quantise light into steps so it reads as banded pixel glow
        lstep = np.floor(light * 1.0 + 0.0).astype(int)
        self.meta = dict(pid=pid.reshape(h, w), face=face.reshape(h, w))
        idx_all = np.zeros(N, int); nr_all = np.ones(N, int)
        for i, p in enumerate(self.prims):
            m = pid == i
            if not m.any(): continue
            nramp = len(p.mat)
            tex = p.tex or tex_flat()
            idx = tex(X[m], Y[m], Z[m], nrm[m], face[m], nramp)
            idx = idx + (lstep[m] if not p.kw.get('nolight') else 0)
            idx = np.clip(idx, 0, nramp - 1)
            idx_all[m] = idx; nr_all[m] = nramp
        idx_img = idx_all.reshape(h, w); pid_img = pid.reshape(h, w); face_img = face.reshape(h, w)
        depth = np.where(best > NEG / 2, (X + Y + 0.8 * Z) * self.k, -999).reshape(h, w).astype(np.float32)
        Ximg, Yimg, Zimg = X.reshape(h, w), Y.reshape(h, w), Z.reshape(h, w)
        # outline: the nearer pixel at a depth jump gets its ramp's darkest step; top faces get a light rim
        if outline:
            out = idx_img.copy()
            for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                nb_d = np.roll(np.roll(depth, -dy, 0), -dx, 1)
                nb_p = np.roll(np.roll(pid_img, -dy, 0), -dx, 1)
                jump = (depth - nb_d > 0.45) & (pid_img >= 0)
                for i, p in enumerate(self.prims):
                    if not p.outline: continue
                    m = jump & (pid_img == i) & (nb_p != i)
                    out[m] = 0
            # rim highlight on the front edges of top faces (pixel above a side face of the same prim)
            below_face = np.roll(face_img, -1, 0); below_pid = np.roll(pid_img, -1, 0)
            for i, p in enumerate(self.prims):
                if not p.rim: continue
                m = (pid_img == i) & (face_img == 0) & (below_pid == i) & (below_face != 0) & (out != 0)
                out[m] = np.minimum(out[m] + 1, len(p.mat) - 1)
            idx_img = out
        img = np.zeros((h, w, 4), np.uint8)
        for i, p in enumerate(self.prims):
            m = pid_img == i
            if not m.any(): continue
            cols = np.array([hexrgb(c) for c in p.mat], np.uint8)
            img[m, :3] = cols[idx_img[m]]
            img[m, 3] = 255
        # decals
        for i, p in enumerate(self.prims):
            for dc in p.decals:
                self._decal(img, depth, pid_img, face_img, Ximg, Yimg, Zimg, i, dc)
        self.img, self.depth = img, depth
        self.X, self.Y, self.Z, self.pid, self.face = Ximg, Yimg, Zimg, pid_img, face_img
        return self

    def _decal(self, img, depth, pid, face, X, Y, Z, i, dc):
        """dc = dict(face=0|1|2, at=(u0, v0) world units, grid=[rows], legend={ch: palname}, scale=(su, sv))
        face 1 (+y wall): u = x, v = z.  face 2 (+x wall): u = y, v = z.  face 0 (top): u = x, v = y.
        Rows go top->bottom (v decreasing on walls)."""
        f = dc['face']; u0, v0 = dc['at']; g = dc['grid']; lg = dc['legend']
        su, sv = dc.get('scale', (1 / 16, 1 / 20 if f else 1 / 16))
        m = (pid == i) & (face == f)
        if dc.get('anyface'): m = pid == i
        ys, xs = np.nonzero(m)
        if f == 1: U, Vv = X[ys, xs], Z[ys, xs]
        elif f == 2: U, Vv = Y[ys, xs], Z[ys, xs]
        else: U, Vv = X[ys, xs], Y[ys, xs]
        cu = np.floor((U - u0) / su).astype(int)
        cv = np.floor((v0 - Vv) / sv).astype(int) if f else np.floor((Vv - v0) / sv).astype(int)
        gh, gw = len(g), len(g[0])
        ok = (cu >= 0) & (cu < gw) & (cv >= 0) & (cv < gh)
        for y, x, a, b in zip(ys[ok], xs[ok], cu[ok], cv[ok]):
            ch = g[b][a]
            if ch == '.': continue
            img[y, x, :3] = hexrgb(lg[ch]); img[y, x, 3] = 255

    def save(self, path, scale=1):
        im = Image.fromarray(self.img, 'RGBA')
        if self.bg:
            b = Image.new('RGBA', im.size, tuple(hexrgb(self.bg)) + [255] if False else tuple(hexrgb(self.bg) + [255])); b.alpha_composite(im); im = b
        if scale > 1: im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
        im.save(path)
        return im

    def depth_png(self, path):
        """depth packed into R (high) and G (low) as (d + 64) * 256; A = 0 where empty."""
        d = np.clip((self.depth + 64) * 256, 0, 65535).astype(np.uint32)
        a = np.where(self.depth > -900, 255, 0).astype(np.uint8)
        arr = np.stack([(d >> 8).astype(np.uint8), (d & 255).astype(np.uint8), np.zeros_like(a), a], 2)
        Image.fromarray(arr, 'RGBA').save(path)
