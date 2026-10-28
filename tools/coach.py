"""coach — the stagecoach as a depth sprite (writes game/art_props3d.js), plus the hand-drawn team (horse.py).
The coach faces +x (screen right-down); its anchor is the middle of the body at ground level."""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from props import *
from export import png_uri, depth_img
import horse as H
from spr import js_sprite

OUT = os.path.join(os.path.dirname(__file__), '..', 'game', 'art_props3d.js')
PREV = os.path.join(os.path.dirname(__file__), '..', 'art', 'rooms')
MAROON = ['ink', 'rd1', 'rd2', 'rd3', 'rd4']
WHEEL = ['ink', 'wd1', 'wd3', 'gd1', 'gd2', 'gd3']
SNOWR = ['sn1', 'sn2', 'sn3', 'sn4', 'sn5']
SCALE = 1.3   # people are drawn a touch heroic (45px), so the coach is too


def disc(cx, cz, r, y0, y1, mat, tex, n=20):
    planes = [((math.cos(a), 0, math.sin(a)), cx * math.cos(a) + cz * math.sin(a) + r)
              for a in (2 * math.pi * k / n for k in range(n))]
    planes += [((0, 1, 0), y1), ((0, -1, 0), -y0)]
    return Convex(planes, mat, tex=tex)


def tex_wheel(cx, cz, r, phase):
    def f(X, Y, Z, n, face, nramp):
        dx, dz = X - cx, Z - cz
        rad = np.sqrt(dx * dx + dz * dz) / r
        ang = np.arctan2(dz, dx) + phase
        spoke = np.abs(((ang / (2 * np.pi / 12)) % 1.0) - 0.5) > 0.36
        idx = np.full(X.shape, -1)
        idx = np.where(rad > 0.8, 2, idx)                    # felloe (wooden rim)
        idx = np.where(rad > 0.92, 0, idx)                   # iron tyre
        idx = np.where((rad <= 0.8) & (rad > 0.24) & spoke, 4, idx)
        idx = np.where(rad <= 0.24, 3, idx)                  # hub
        idx = np.where(rad <= 0.1, 5, idx)
        idx = np.where(face != 1, 1, idx)                    # the tread
        return np.where(idx < 0, 0, idx)
    return f


def tex_body():
    """Maroon panels with gold pinstripe borders and a dark window with a drawn curtain."""
    def f(X, Y, Z, n, face, nramp):
        idx = np.choose(np.minimum(face, 2), (3, 2, 1)).astype(int)
        side = face == 1
        # panel border pinstripe
        pin = side & ((np.abs(Z - 0.72) < 0.03) | (np.abs(Z - 1.62) < 0.03) | (np.abs(X + 1.0) < 0.025) | (np.abs(X - 1.0) < 0.025))
        idx = np.where(pin, 4, idx)
        win = side & (Z > 1.12) & (Z < 1.55) & (np.abs(X) < 0.42)
        idx = np.where(win, 0, idx)
        curtain = win & (Z > 1.38) & (np.abs(X) < 0.4)
        idx = np.where(curtain & (np.floor(X * 20) % 2 == 0), 2, np.where(curtain, 1, idx))
        door = side & (np.abs(np.abs(X) - 0.46) < 0.02) & (Z > 0.72) & (Z < 1.62)
        idx = np.where(door, 0, idx)
        return np.clip(idx, 0, nramp - 1)
    return f


def build(phase=0.0, loaded=False, snow=True):
    S = Scene((-2.2, -1.2, 2.2, 1.2), zmax=2.6, scale=SCALE)
    # undercarriage + perch
    S.add(Box(-1.3, -0.12, 0.38, 1.4, 0.12, 0.5, DARKWOOD))
    # body: slight barrel shape (chamfered bottom corners)
    body = Convex([((1, 0, 0), 1.1), ((-1, 0, 0), 1.1), ((0, 1, 0), 0.52), ((0, -1, 0), 0.52), ((0, 0, 1), 1.7), ((0, 0, -1), -0.62),
                   ((0.7, 0, -0.7), 0.7 * 1.1 - 0.7 * 0.9 + 0.12), ((-0.7, 0, -0.7), 0.7 * 1.1 - 0.7 * 0.9 + 0.12)], MAROON, tex=tex_body())
    S.add(body)
    S.add(Box(-1.15, -0.56, 1.7, 1.15, 0.56, 1.78, ['ink', 'rd1', 'gd1', 'gd2'], tex=tex_flat((3, 2, 1))))      # roof cap
    # luggage rail
    for (x0, x1, y0, y1) in ((-1.1, 1.1, 0.48, 0.53), (-1.1, 1.1, -0.53, -0.48), (-1.1, -1.05, -0.5, 0.5), (1.05, 1.1, -0.5, 0.5)):
        S.add(Box(x0, y0, 1.78, x1, y1, 1.9, BRASS))
    if snow: S.add(Ellip(0, 0, 1.78, 1.05, 0.48, 0.1, SNOWR, zmin=1.78, outline=False))
    if loaded:   # Warren's three frozen bounties, lashed under a tarp
        for i, x in enumerate((-0.65, 0.0, 0.62)):
            S.add(Ellip(x, 0.02, 1.95, 0.28, 0.45, 0.14, ['ink', 'hk1', 'hk2', 'gy1']))
            S.add(Ellip(x - 0.04, -0.05, 2.06, 0.22, 0.32, 0.05, SNOWR, outline=False))
        S.add(Box(-0.95, -0.5, 1.92, 0.95, -0.46, 1.98, ['lb1', 'lb2', 'lb3']))
    # driver's box (front, +x) and footboard
    S.add(Box(1.1, -0.5, 1.2, 1.55, 0.5, 1.3, DARKWOOD, tex=tex_flat((4, 3, 2))))
    S.add(Box(1.1, -0.5, 1.3, 1.2, 0.5, 1.65, DARKWOOD))
    S.add(Box(1.5, -0.45, 0.9, 1.72, 0.45, 0.97, DARKWOOD, tex=tex_flat((3, 2, 1))))
    S.add(Box(1.48, -0.42, 0.97, 1.52, -0.38, 1.2, DARKWOOD)); S.add(Box(1.48, 0.38, 0.97, 1.52, 0.42, 1.2, DARKWOOD))
    # rear boot (luggage) with a leather cover
    S.add(Box(-1.55, -0.45, 0.75, -1.1, 0.45, 1.35, ['ink', 'lb1', 'lb2', 'lb3', 'lb4'], tex=tex_rough((3, 2, 1), 0.1, scale=10)))
    # wheels: big at the back, smaller at the front, on both sides; the +y pair faces the camera
    for (wx, wr) in ((-0.8, 0.55), (0.95, 0.44)):
        for (y0, y1) in ((-0.68, -0.6), (0.6, 0.68)):
            S.add(disc(wx, wr, wr, y0, y1, WHEEL, tex_wheel(wx, wr, wr, phase)))
        S.add(Box(wx - 0.04, -0.62, wr - 0.04, wx + 0.04, 0.62, wr + 0.04, IRON))
    # shaft / pole toward the team
    S.add(Box(1.4, -0.04, 0.5, 2.15, 0.04, 0.56, DARKWOOD))
    S.render()
    return S


def ds_js(name, scenes):
    frames = []
    for S in scenes:
        frames.append(dict(color=png_uri(S.img), depth=png_uri(depth_img(S.depth))))
    S = scenes[0]
    return f"Sprout.iso.defDS({json.dumps(name)}, {json.dumps(dict(w=S.w, h=S.h, ox=S.OX, oy=S.OY, frames=frames))});\n"


def main():
    out = ['// generated by tools/coach.py']
    phases = [0.0, 2 * math.pi / 36, 4 * math.pi / 36]
    plain = [build(p) for p in phases]
    loaded = [build(p, loaded=True) for p in phases]
    plain[0].save(os.path.join(PREV, 'coach.png'), 3)
    loaded[0].save(os.path.join(PREV, 'coach_loaded.png'), 3)
    out.append(ds_js('coach', plain))
    out.append(ds_js('coach_loaded', loaded))
    # the team: four horse colours
    out.append('(function () { const S = Sprout;')
    for col, leg in H.LEG.items():
        L = dict(o='ink'); L.update(leg)
        out.append(js_sprite('horse_' + col, 48, 40, (24, 38), L, H.frames).replace('} });', '}, anims: { idle: { n: 1, ms: 60 }, walk: { n: 4, ms: 7 } } });'))
    out.append('})();')
    open(OUT, 'w').write('\n'.join(out) + '\n')
    print('coach', plain[0].w, plain[0].h)


if __name__ == '__main__':
    main()
