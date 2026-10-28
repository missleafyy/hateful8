"""rooms — builds every location and writes game/rooms_*.js.
    python3 tools/rooms.py [name ...]      (no names = all)   previews go to art/rooms/<name>.png
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from props import *
from export import room_js, collision
from spr import G

OUT = os.path.join(os.path.dirname(__file__), '..', 'game')
PREV = os.path.join(os.path.dirname(__file__), '..', 'art', 'rooms')
os.makedirs(PREV, exist_ok=True)

FLOOR = ['ink', 'wd1', 'wd2', 'wd3', 'wd4', 'wd5']


def tex_floorboards(seed=11):
    """Worn floorboards along x: quiet, with seams, a few darker boards and scuffed paths."""
    def f(X, Y, Z, n, face, nramp):
        width = 0.25
        row = np.floor(Y / width).astype(int)
        off = h2(row, row * 5, seed) * 3.0
        col = np.floor((X + off) / 3.0).astype(int)
        r = h2(row, col, seed + 2)
        idx = np.full(X.shape, 2)
        idx = np.where(r < 0.22, 1, idx)
        idx = np.where(r > 0.86, 3, idx)
        fy = (Y / width) % 1.0
        idx = np.where(fy < 0.25, idx - 1, idx)                       # 1px seam (a quarter of the 4px board)
        fx = ((X + off) / 3.0) % 1.0
        idx = np.where(fx < 0.012, 0, idx)                            # butt joints
        nail = (fx > 0.03) & (fx < 0.045) & (fy > 0.4) & (fy < 0.62)
        idx = np.where(nail, 0, idx)
        g = h2(np.floor(X * 5).astype(int), row * 13 + np.floor(fy * 3).astype(int), seed + 4) < 0.07
        idx = np.where(g & (fy > 0.25), idx + 1, idx)                 # light grain streaks
        return np.clip(idx, 0, nramp - 1)
    return f


def tex_rug():
    """Red trade-blanket rug: border bands + a stepped diamond in the middle."""
    def f(X, Y, Z, n, face, nramp):
        u, v = X - 3.6, Y - 6.4
        w, h = 3.8, 2.0
        b = np.minimum(np.minimum(u, w - u), np.minimum(v, h - v))
        idx = np.full(X.shape, 2)
        idx = np.where(b < 0.12, 1, idx)
        idx = np.where((b > 0.2) & (b < 0.27), 4, idx)
        idx = np.where((b > 0.27) & (b < 0.33), 0, idx)
        dm = np.abs(u - w / 2) / 1.3 + np.abs(v - h / 2) / 0.6
        idx = np.where((dm < 1) & (dm > 0.78), 4, idx)
        idx = np.where((dm < 0.5) & (dm > 0.3), 0, idx)
        idx = np.where(dm < 0.18, 3, idx)
        fringe = (b < 0.05)
        idx = np.where(fringe & (np.floor(np.maximum(u, v) * 16) % 2 == 0), 3, idx)
        return np.clip(idx, 0, nramp - 1)
    return f


RUG = ['rd1', 'rd2', 'rd3', 'rd4', 'gd3']

SIGN = G("""
oooooooooooooooooooooooo
oyyyyyyyyyyyyyyyyyyyyyyo
oyQQQQQQQQQQQQQQQQQQQQyo
oyQ.q.q.qqq.q.qq.qq.qQyo
oyQ.qqq..q..qq.q.q..qQyo
oyQ.q.q.qqq.q..q.qq.qQyo
oyQQQQQQQQQQQQQQQQQQQQyo
oyQqq.qq.qq.qqqq.qq.QQyo
oyQQQQQQQQQQQQQQQQQQQQyo
oyQqqq.qq.qqqq.q.qq.QQyo
oyQQQQQQQQQQQQQQQQQQQQyo
oyQqq.qqqq.qq.qqq.qqQQyo
oyQQQQQQQQQQQQQQQQQQQQyo
oyyyyyyyyyyyyyyyyyyyyyyo
oooooooooooooooooooooooo
""", 24)
SIGN_L = dict(o='wd1', y='wd4', Q='gn1', q='cr2')

PORTRAIT = G("""
oooooooooooo
oyyyyyyyyyyo
oyQQQQQQQQyo
oyQQQqqQQQyo
oyQQqqqqQQyo
oyQQqssqQQyo
oyQQQssQQQyo
oyQQsqqsQQyo
oyQsqqqqsQyo
oyQsqqqqsQyo
oyyyyyyyyyyo
oooooooooooo
""", 12)
PORTRAIT_L = dict(o='wd1', y='gd2', Q='hb2', q='hb4', s='cr1')

ANTLERS = G("""
o...o....o...o
oo..o....o..oo
.o.oo....oo.o.
.oo.o....o.oo.
..ooo....ooo..
....oooooo....
.....ocCco....
.....oCCCo....
......oco.....
""", 14)
ANTLERS_L = dict(o='cr1', c='cr2', C='cr3')

DOOR = G("""
ooooooooooooooooooo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oLLLLLLLLLLLLLLLLLo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPmMPPo
oPpPPpPPpPPPpPmmPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oLLLLLLLLLLLLLLLLLo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oLLLLLLLLLLLLLLLLLo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
oPpPPpPPpPPPpPPpPPo
""", 19)
DOOR_L = dict(o='ink', P='wd3', p='wd2', L='wd4', m='mt2', M='mt3')

FIRE_MOUTH = G("""
..oooooooooooooooooo..
.oooooooooooooooooooo.
oooooooooooooooooooooo
oooooooooooooooooooooo
oooooooooooooooooooooo
oooooooooooooooooooooo
oooooooooooooooooooooo
oooooooooooooooooooooo
oooooooooooooooooooooo
oooooooooooooooooooooo
oooooooooooooooooooooo
oooooooooooooooooooooo
oooooooooooooooooooooo
ooooooooooRrrRoooooooo
oooooooRrrrrrrrRoooooo
ooooooRrrRRRRrrrRooooo
""", 22)
FIRE_MOUTH_L = dict(o='ink', R='fi1', r='fi2')

CHECKER = G("""
abababab
babababa
abababab
babababa
abababab
babababa
abababab
babababa
""", 8)
CHECKER_L = dict(a='cr3', b='rd2')

KEYS = G("""
wwkwkwwkwkwkwwkwkwwkwkwkww
wwkwkwwkwkwkwwkwkwwkwkwkww
wwwwwwwwwwwwwwwwwwwwwwwwww
""", 26)
KEYS_L = dict(w='cr3', k='ink')
KEYS = [list(r) for r in zip(*KEYS)]           # along y


def build_minnie(warm=False):
    """Minnie's Haberdashery. warm=True is the Chapter 5 morning (sunlit, tidy, fire high)."""
    lights = [(0.95, 5.7, 0.5, 3.6, 2.2), (6.0, 5.0, 0.6, 2.6, 1.6), (9.4, 5.2, 1.7, 2.8, 1.3), (11.0, 1.6, 1.4, 2.2, 1.2)]
    if warm: lights += [(3.0, 1.0, 1.4, 4.0, 1.2), (1.0, 3.5, 1.4, 4.0, 1.0)]
    S = Scene((0, 0, 12, 10), zmax=3.3, lights=lights)
    solids = []
    S.add(Box(0, 0, -0.2, 12, 10, 0, FLOOR, tex=tex_floorboards(), rim=False, outline=False))
    # walls: x=0 (upper-left, in shade) and y=0 (upper-right, lit by the windows)
    S.add(Box(-0.45, -0.45, 0, 0, 10, 3.0, LOG, tex=tex_logs(levels=(2, 2, 1))))
    S.add(Box(0, -0.45, 0, 12, 0, 3.0, LOG, tex=tex_logs(levels=(3, 3, 2))))
    # corner post + top plate
    S.add(Box(-0.08, -0.08, 0, 0.12, 0.12, 3.0, DARKWOOD, tex=tex_flat((3, 3, 2))))
    S.add(Box(-0.45, -0.45, 2.9, 12, 0.08, 3.05, DARKWOOD, tex=tex_flat((2, 2, 1))))
    S.add(Box(-0.45, -0.45, 2.9, 0.08, 10, 3.05, DARKWOOD, tex=tex_flat((2, 1, 1))))
    # low front walls (cut away)
    S.add(Box(0, 10, 0, 12.3, 10.3, 0.32, LOG, tex=tex_logs(levels=(3, 3, 2)), tag='front'))
    S.add(Box(12, 0, 0, 12.3, 10, 0.32, LOG, tex=tex_logs(levels=(3, 3, 2)), tag='front'))
    # windows
    window(S, 'A', 2.1, 3.3); window(S, 'B', 2.9, 4.1); window(S, 'B', 7.6, 8.8)
    # front door (in wall A) with frame
    S.add(Box(5.0, 0, 0, 6.2, 0.05, 2.05, DARKWOOD, decals=[dict(face=1, at=(5.02, 2.05), grid=DOOR, legend=DOOR_L, scale=(1 / 16, 1 / 20))], outline=False))
    S.add(Box(4.9, 0, 0, 5.0, 0.12, 2.15, DARKWOOD, tex=tex_flat((3, 3, 2))))
    S.add(Box(6.2, 0, 0, 6.3, 0.12, 2.15, DARKWOOD, tex=tex_flat((3, 3, 2))))
    S.add(Box(4.9, 0, 2.05, 6.3, 0.12, 2.18, DARKWOOD, tex=tex_flat((3, 3, 2))))
    # coat hooks + Minnie's coat
    S.add(Box(6.6, 0, 1.65, 7.4, 0.06, 1.72, DARKWOOD))
    S.add(Box(6.75, 0.02, 0.9, 6.98, 0.16, 1.65, ['pl1', 'pl2', 'pl3', 'pl4'], tex=tex_rough((2, 2, 1), 0.1)))
    S.add(Ellip(7.25, 0.08, 1.58, 0.14, 0.08, 0.07, ['hb1', 'hb2', 'hb3', 'hb4']))
    # Minnie's Rules (wall A, by the bar)
    S.add(Box(7.55, 0, 1.55, 9.05, 0.04, 2.3, DARKWOOD, decals=[dict(face=1, at=(7.55, 2.3), grid=SIGN, legend=SIGN_L, scale=(1 / 16, 1 / 20))], outline=False))
    # portrait + antlers on wall B
    S.add(Box(0, 5.25, 2.15, 0.04, 6.0, 2.75, DARKWOOD, decals=[dict(face=2, at=(5.4, 2.75), grid=ANTLERS, legend=ANTLERS_L, scale=(1 / 16, 1 / 20))], outline=False, rim=False))
    S.add(Box(0, 1.3, 1.8, 0.04, 2.05, 2.4, DARKWOOD, decals=[dict(face=2, at=(1.3, 2.4), grid=PORTRAIT, legend=PORTRAIT_L, scale=(1 / 16, 1 / 20))], outline=False))
    # --- fireplace (stone, wall B)
    S.add(Box(0, 4.7, 0, 0.75, 6.7, 1.55, FIELD, tex=tex_fieldstone(), decals=[dict(face=2, at=(5.02, 1.0), grid=FIRE_MOUTH, legend=FIRE_MOUTH_L, scale=(1 / 16, 1 / 20))]))
    S.add(Box(0, 4.6, 1.55, 0.9, 6.8, 1.68, DARKWOOD, tex=tex_flat((4, 3, 2))))           # mantel
    S.add(Box(0, 5.2, 1.68, 0.5, 6.2, 3.0, FIELD, tex=tex_fieldstone(1)))
    S.add(Box(0.75, 4.9, 0, 1.05, 6.5, 0.06, STONE, tex=tex_flat((3, 2, 1))))             # hearth
    bottle(S, 0.35, 4.9, 1.68, ['gn1', 'gn2', 'gn3', 'gn4']); bottle(S, 0.35, 6.55, 1.68, BRASS, 0.18, 0.06)
    S.add(Cyl(0.5, 5.75, 0.17, 0.12, 0.42, IRON))                                         # stew pot on the fire
    solids.append((0, 4.6, 1.1, 6.8))
    # Sweet Dave's chair
    solids += armchair(S, 1.75, 5.75)
    # --- stove + coffee pot + pipe
    S.add(Cyl(6.0, 5.0, 0.4, 0.12, 0.9, IRON, tex=tex_rough((2, 1, 1), 0.08, scale=12)))
    S.add(Cyl(6.0, 5.0, 0.46, 0.85, 0.95, IRON, tex=tex_flat((3, 2, 1))))
    for (lx, ly) in ((5.75, 4.75), (6.25, 4.75), (5.75, 5.25), (6.25, 5.25)): S.add(Cyl(lx, ly, 0.05, 0, 0.14, IRON))
    S.add(Cyl(6.0, 5.0, 0.11, 0.95, 3.0, IRON, tex=tex_flat((2, 2, 1))))
    S.add(Box(6.3, 4.86, 0.32, 6.41, 5.14, 0.56, ['ink', 'fi1', 'fi2', 'fi3'], tex=tex_grate(), nolight=True, outline=False))   # grate glow
    S.add(Box(6.3, 4.83, 0.56, 6.43, 5.17, 0.6, IRON, tex=tex_flat((3, 2, 1))))
    solids.append((5.5, 4.5, 6.5, 5.5))
    # --- the bar (counter along wall A, right side), shelves behind it
    S.add(Box(7.7, 1.35, 0, 11.7, 2.0, 1.02, WOOD, tex=tex_planks('x', 0.16, levels=(3, 3, 2))))
    S.add(Box(7.6, 1.3, 1.02, 11.8, 2.1, 1.1, DARKWOOD, tex=tex_planks('x', 0.2, levels=(4, 3, 2))))
    S.add(Box(7.7, 1.98, 0.0, 11.7, 2.04, 0.12, DARKWOOD))
    for z in (1.25, 1.75):
        S.add(Box(9.2, 0, z, 11.8, 0.32, z + 0.05, DARKWOOD, tex=tex_flat((4, 3, 2))))
        cols = [['gn1', 'gn2', 'gn3', 'gn4'], BRASS, ['rd1', 'rd2', 'rd3', 'rd4'], ['nv1', 'nv2', 'nv3', 'nv4'], ['gn1', 'gn2', 'gn3', 'gn4'], BRASS]
        for i, x in enumerate(np.arange(9.35, 11.7, 0.26)):
            bottle(S, x, 0.17, z + 0.05, cols[(i + int(z * 4)) % len(cols)], 0.26 + 0.06 * ((i * 7 + int(z * 9)) % 3))
    # candy jar (jelly beans) + lantern
    S.add(Cyl(8.05, 1.7, 0.13, 1.1, 1.38, ['rd2', 'gd3', 'gn3', 'rd3'], tex=tex_beans(), outline=False))
    S.add(Cyl(8.05, 1.7, 0.14, 1.38, 1.43, GLASS))
    S.add(Cyl(11.1, 1.65, 0.09, 1.1, 1.35, ['gd2', 'fi3', 'fi4', 'fi5'], nolight=True))
    S.add(Cyl(11.1, 1.65, 0.1, 1.35, 1.42, IRON))
    S.add(Box(11.0, 0.35, 0, 11.7, 1.3, 0.6, WOOD, tex=tex_planks('y', 0.18, levels=(3, 2, 1))))     # crate behind bar
    solids.append((7.6, 1.3, 11.8, 2.1)); solids.append((11.0, 0.0, 12, 1.3))
    # --- piano (wall B, near the corner) + stool
    S.add(Box(0, 0.9, 0, 0.62, 2.6, 1.35, DARKWOOD, tex=tex_planks('y', 0.3, levels=(3, 3, 2), seams=False)))
    S.add(Box(0, 0.85, 1.35, 0.7, 2.65, 1.42, DARKWOOD, tex=tex_flat((4, 3, 2))))           # lid
    S.add(Box(0.62, 0.95, 0.7, 1.0, 2.55, 0.78, DARKWOOD, tex=tex_flat((3, 2, 1)), decals=[dict(face=0, at=(0.7, 0.98), grid=KEYS, legend=KEYS_L, scale=(0.26 / 3, 1.54 / 26))]))
    S.add(Box(0.62, 0.95, 0.15, 0.7, 2.55, 0.7, DARKWOOD, tex=tex_flat((2, 2, 1))))
    S.add(Box(0.62, 1.0, 0.0, 0.9, 1.12, 0.7, DARKWOOD)); S.add(Box(0.62, 2.38, 0.0, 0.9, 2.5, 0.7, DARKWOOD))
    S.add(Cyl(0.3, 1.2, 0.06, 1.35, 1.5, BRASS)); S.add(Cyl(0.3, 2.3, 0.06, 1.35, 1.5, BRASS))
    solids.append((0, 0.85, 1.05, 2.65))
    S.add(Cyl(1.25, 1.75, 0.18, 0.38, 0.45, CLOTH_GREEN)); S.add(Cyl(1.25, 1.75, 0.05, 0, 0.38, DARKWOOD))
    solids.append((1.05, 1.55, 1.45, 1.95))
    # --- firewood stack by the hearth, barrels + flour sacks in the back corner, broom by the door
    S.add(Box(0.05, 6.95, 0, 0.85, 7.75, 0.5, ['ink', 'wd2', 'wd3', 'wd4', 'wd5', 'wd6'], tex=tex_woodpile()))
    solids.append((0, 6.9, 0.85, 7.9))
    for (bx, by) in ((11.3, 3.0), (11.3, 3.65)):
        S.add(Cyl(bx, by, 0.3, 0, 0.85, WOOD, tex=tex_barrel())); solids.append((bx - 0.3, by - 0.3, bx + 0.3, by + 0.3))
    S.add(Ellip(11.35, 4.4, 0.25, 0.3, 0.26, 0.28, CREAM, tex=tex_rough((2, 2, 1), 0.08, scale=14))); solids.append((11.0, 4.1, 11.7, 4.7))
    S.add(Ellip(11.0, 4.6, 0.18, 0.24, 0.2, 0.2, CREAM, tex=tex_rough((2, 2, 1), 0.08, scale=14)))
    S.add(Box(4.55, 0.05, 0, 4.62, 0.12, 1.35, WOOD)); S.add(Ellip(4.58, 0.12, 0.18, 0.1, 0.05, 0.2, ['gd1', 'gd2', 'gd3', 'gd4']))
    # --- rug
    S.add(Box(3.6, 6.4, 0, 7.4, 8.4, 0.02, RUG, tex=tex_rug(), outline=False, rim=False))
    # --- dining table with stew bowls, benches
    solids += table(S, 8.2, 4.5, 10.8, 5.7)
    for (bx, by) in ((8.6, 4.9), (9.4, 5.25), (10.2, 4.85)):
        S.add(Cyl(bx, by, 0.1, 0.78, 0.85, CREAM))
    S.add(Cyl(9.4, 5.1, 0.07, 0.78, 1.0, IRON))                     # oil lamp
    S.add(Ellip(9.4, 5.1, 1.08, 0.08, 0.08, 0.1, ['gd3', 'fi4', 'fi5', 'sn5'], nolight=True, outline=False))
    solids += bench(S, 8.3, 3.95, 10.7, 4.3); solids += bench(S, 8.3, 5.9, 10.7, 6.25)
    # --- Gage's writing table (front left)
    solids += table(S, 2.4, 7.8, 3.5, 8.8, h=0.74)
    S.add(Box(2.7, 8.1, 0.74, 3.05, 8.4, 0.76, CREAM, outline=False))       # his notebook
    solids += chair(S, 3.0, 9.25, 'ne')
    # --- Mobray's table (front right), checkers
    solids += table(S, 9.4, 8.0, 10.5, 9.1, h=0.74, decals=[dict(face=0, at=(9.6, 8.2), grid=CHECKER, legend=CHECKER_L, scale=(0.7 / 8, 0.7 / 8))])
    solids += chair(S, 9.95, 7.55, 'sw'); solids += chair(S, 9.95, 9.55, 'ne')
    # --- the coffee table by the stove where the pot ends up + chairs around the stove
    solids += chair(S, 4.9, 4.6, 'se'); solids += chair(S, 7.1, 5.4, 'nw')
    S.render()
    coll = collision((0.25, 0.25, 11.8, 9.8), solids)
    spots = dict(door=[5.6, 0.55], door_out=[5.6, -0.6], bar=[9.6, 0.75], bar_front=[9.6, 2.5], candy=[8.05, 2.45],
                 dave=[1.75, 5.75], fire=[1.25, 5.0], stove=[6.0, 5.0], stove_front=[6.0, 6.0],
                 table=[9.4, 3.6], stew=[9.4, 6.5], gage=[3.0, 9.25], gage_desk=[2.95, 8.3], mobray=[9.95, 7.55], mobray2=[9.95, 9.55],
                 piano=[1.25, 1.75], window=[2.7, 0.8], rules=[8.3, 2.5], crack=[7.4, 2.7], hooks=[7.0, 0.7],
                 center=[5.5, 7.0], seat_a=[4.9, 4.6], seat_b=[7.1, 5.4], cellar=[4.4, 3.4])
    grade = (238, 214, 200) if not warm else (256, 240, 222)
    light_js = [(0.95, 5.7, 3.6, [70, 30, 0], 1), (6.0, 5.0, 2.4, [40, 16, 0], 1), (9.4, 5.1, 2.4, [30, 18, 0], 0.5)]
    return S, coll, spots, light_js, grade


FIELD = ['ink', 'hb2', 'st_2', 'st_3', 'st_4', 'cr2']


def tex_fieldstone(seed=0):
    """Rounded river stones in mortar: each stone gets its own tone; mortar lines are dark."""
    def f(X, Y, Z, n, face, nramp):
        u = np.where(face == 2, Y, np.where(face == 1, X, X + Y))
        v = np.where(face == 0, X - Y, Z)
        rowh = 0.2
        r = np.floor(v / rowh).astype(int)
        off = h2(r, r, 31 + seed) * 0.3
        cw = 0.24 + 0.1 * h2(r, r * 3, 32 + seed)
        c = np.floor((u + off) / cw).astype(int)
        fu = ((u + off) / cw) % 1.0; fv = (v / rowh) % 1.0
        tone = h2(r, c, 33 + seed)
        base = np.choose(np.minimum(face, 2), (4, 3, 2)).astype(int)
        idx = base + np.where(tone < 0.3, -1, 0) + np.where(tone > 0.85, 1, 0)
        idx = np.where(fv > 0.75, idx + 1, idx)                         # top of each stone lit
        edge = (fu < 0.1) | (fv < 0.14) | ((fu > 0.9) & (fv < 0.5))
        idx = np.where(edge, 1, idx)
        idx = np.where(face == 0, base, idx)
        return np.clip(idx, 0, nramp - 1)
    return f


def tex_woodpile():
    """Stacked split logs seen end-on from the +x side: rings of pale wood with bark rims."""
    def f(X, Y, Z, n, face, nramp):
        r = 0.09
        row = np.floor(Z / (2 * r)).astype(int)
        cy = (np.floor((Y + row * r) / (2 * r)) + 0.5) * 2 * r - row * r
        cz = (row + 0.5) * 2 * r
        d = np.sqrt((Y - cy) ** 2 + (Z - cz) ** 2) / r
        idx = np.where(d < 0.62, 5, np.where(d < 0.85, 4, np.where(d < 1.0, 1, 0)))
        idx = np.where((d < 0.3) & (d > 0.15), 4, idx)
        bark = np.where(np.floor(X * 14 + np.floor(Z / (2 * r)) * 3) % 3 == 0, 1, 2)
        idx = np.where(face == 0, bark + 1, np.where(face == 1, bark, idx))
        return np.clip(idx, 0, nramp - 1)
    return f


def tex_grate():
    def f(X, Y, Z, n, face, nramp):
        bars = (np.floor(Y * 20) % 2 == 0)
        idx = np.where(bars, 0, 2 + (h2(np.floor(Y * 20).astype(int), np.floor(Z * 20).astype(int), 3) > 0.5))
        return np.clip(idx, 0, nramp - 1)
    return f


def tex_barrel():
    def f(X, Y, Z, n, face, nramp):
        lam = lambert(n)
        idx = np.clip((lam * (nramp - 1.2)).astype(int) + 1, 0, nramp - 1)
        idx = np.where(face == 0, 3, idx)
        hoop = (np.abs(Z - 0.15) < 0.035) | (np.abs(Z - 0.7) < 0.035)
        idx = np.where(hoop & (face != 0), 0, idx)
        ang = np.arctan2(n[:, 1], n[:, 0])
        stave = (np.floor(ang * 5) % 2 == 0) & (face != 0)
        idx = np.where(stave & ~hoop, np.maximum(1, idx - 1), idx)
        return np.clip(idx, 0, nramp - 1)
    return f


def tex_beans():
    def f(X, Y, Z, n, face, nramp):
        q = h2(np.floor((X - Y) * 40).astype(int), np.floor(Z * 40).astype(int), 21)
        return np.clip((q * nramp).astype(int), 0, nramp - 1)
    return f


ROOMS = dict(minnie=lambda: build_minnie(False), minnie_am=lambda: build_minnie(True))




# ================================================================== exteriors
SNOW = ['sn1', 'sn2', 'sn3', 'sn4', 'sn5']
PINE = ['ink', 'gn1', 'gn2', 'gn3', 'sn3', 'sn4', 'sn5']
ROCK = ['ink', 'st_1', 'st_2', 'st_3', 'sn3', 'sn4', 'sn5']


def tex_snowy(green_levels=(1, 2, 3), snow_from=4, thresh=0.45, seed=7):
    """Dark material with snow lying on the upward-facing parts (pines, rocks, roofs)."""
    def f(X, Y, Z, n, face, nramp):
        lam = lambert(n)
        g = np.where(lam > 0.66, green_levels[2], np.where(lam > 0.33, green_levels[1], green_levels[0]))
        up = n[:, 2]
        noise = h2(np.floor(X * 12 + Z * 7).astype(int), np.floor(Y * 12 - Z * 5).astype(int), seed)
        snow = (up + (noise - 0.5) * 0.35) > thresh
        s = np.where(lam > 0.6, nramp - 1, np.where(lam > 0.3, nramp - 2, nramp - 3))
        idx = np.where(snow, s, g)
        return np.clip(idx, 0, nramp - 1)
    return f


def tex_road(seed=5):
    """Packed snow road along x with two wheel ruts and hoof-churned middle."""
    def f(X, Y, Z, n, face, nramp):
        idx = np.full(X.shape, 3)
        for k, ry in enumerate((5.55, 6.75)):
            d = np.abs(Y - ry - 0.05 * np.sin(X * 0.7 + k))
            gap = h2(np.floor(X * 2.5).astype(int), np.full(X.shape, k), seed + 3) < 0.25    # drifted-over stretches
            idx = np.where((d < 0.1) & ~gap, 1, np.where(d < 0.2, 2, idx))
        mid = np.abs(Y - 6.15) < 0.35
        churn = h2(np.floor(X * 8).astype(int), np.floor(Y * 8).astype(int), seed) < 0.18
        idx = np.where(mid & churn, 2, idx)
        sp = h2(np.floor(X * 16).astype(int), np.floor(Y * 16).astype(int), seed + 1) < 0.01
        idx = np.where(sp, 4, idx)
        return np.clip(idx, 0, nramp - 1)
    return f


def ext_scene(W, H, zmax=5.0):
    """An exterior canvas: the rectangle of screen that the playable W x H diamond spans, plus sky above."""
    full = Scene((0, 0, W, H), zmax=zmax, pad=0)
    # screen rect of the walkable diamond: left = (0,H), right = (W,0), top = (0,0) raised by zmax, bottom = (W,H)
    l = full.OX + (0 - H) * 16 + 40; r = full.OX + (W - 0) * 16 - 40
    t = full.OY - int(zmax * 20) - 30; b = full.OY + (W + H) * 8 - 50
    return Scene((0, 0, W, H), zmax=zmax, pad=0, crop=(l, t, r, b))


def pine(S, x, y, h=3.2, solids=None):
    S.add(Cyl(x, y, 0.12, 0, h * 0.25, ['ink', 'wd1', 'wd2', 'wd3']))
    for i, (z0, R, hh) in enumerate(((h * 0.18, 0.95, h * 0.45), (h * 0.42, 0.72, h * 0.38), (h * 0.62, 0.48, h * 0.38))):
        S.add(Cone(x, y, R * h / 3.2, z0, hh, PINE, tex=tex_snowy(seed=int(x * 7 + y * 3 + i))))
    if solids is not None: solids.append((x - 0.35, y - 0.35, x + 0.35, y + 0.35))


def rock(S, x, y, r=0.5, solids=None):
    S.add(Ellip(x, y, 0, r, r * 0.8, r * 0.7, ROCK, zmin=0, tex=tex_snowy((1, 2, 3), thresh=0.55)))
    if solids is not None: solids.append((x - r * 0.8, y - r * 0.6, x + r * 0.8, y + r * 0.6))


def tex_bank():
    def f(X, Y, Z, n, face, nramp):
        lam = lambert(n)
        return np.clip(2 + (lam > 0.45).astype(int) + (lam > 0.8).astype(int), 0, nramp - 1)
    return f


def tex_roof(z_eave):
    """Snow-covered roof: three soft tones by slope light, a dark eave line where the snow overhangs."""
    def f(X, Y, Z, n, face, nramp):
        lam = lambert(n)
        idx = np.where(lam > 0.7, nramp - 1, np.where(lam > 0.4, nramp - 2, nramp - 3))
        idx = np.where(Z < z_eave + 0.09, nramp - 4, idx)
        idx = np.where(Z < z_eave + 0.04, 1, idx)
        idx = np.where((face == 1) | (face == 2), 1, idx)               # cut ends of the roof boards
        drift = h2(np.floor(X * 6).astype(int), np.floor(Y * 6).astype(int), 4) < 0.08
        idx = np.where(drift & (idx >= nramp - 2), idx - 1, idx)
        return np.clip(idx, 0, nramp - 1)
    return f


def bank(S, x, y, rx, ry, rz=0.35):
    S.add(Ellip(x, y, 0, rx, ry, rz, SNOW, zmin=0, outline=False, rim=False, tex=tex_bank()))


def backdrop(S, seed=1):
    """Paint the empty pixels: grey winter sky, two ranges of mountains, and snow below the map edge."""
    img, dep = S.img, S.depth
    h, w = dep.shape
    rng = np.random.RandomState(seed)
    def rgb(n): return np.array(hexrgb(n), np.uint8)
    sky = [rgb('sn2'), rgb('sn3'), rgb('sn3'), rgb('sn4')]
    far = np.zeros(w); near = np.zeros(w)
    ph = rng.rand(6) * 6
    for x in range(w):
        far[x] = 0.30 * h + 18 * np.sin(x / 47 + ph[0]) + 11 * np.sin(x / 19 + ph[1]) + 5 * np.sin(x / 7 + ph[2])
        near[x] = 0.40 * h + 16 * np.sin(x / 61 + ph[3]) + 8 * np.sin(x / 23 + ph[4]) + 3 * np.sin(x / 9 + ph[5])
    for y in range(h):
        for x in range(w):
            if dep[y, x] > -900: continue
            # below the visible ground? (any ground pixel above this one in the column)
            if y > 0 and (dep[:y, x] > -900).any():
                img[y, x, :3] = rgb('sn4') if (x * 7 + y * 13) % 97 else rgb('sn5'); img[y, x, 3] = 255; continue
            band = min(3, int(y / (0.42 * h) * 4))
            c = sky[band]
            if y > far[x]:
                c = rgb('sn2') if y < far[x] + 3 + (x % 5 == 0) else rgb('sn1')
                if y < far[x] + 2: c = rgb('sn4')
            if y > near[x]:
                c = rgb('sn1') if (x // 3 + y // 2) % 9 else rgb('sn2')
                if y < near[x] + 2: c = rgb('sn3')
            img[y, x, :3] = c; img[y, x, 3] = 255


def crucifix(S, x, y):
    W = ['ink', 'wd1', 'wd2', 'wd3', 'wd4']
    S.add(Box(x - 0.08, y - 0.08, 0, x + 0.08, y + 0.08, 2.9, W))
    S.add(Box(x - 0.08, y - 0.7, 2.05, x + 0.08, y + 0.7, 2.22, W))
    S.add(Box(x - 0.25, y - 0.25, 2.9, x + 0.25, y + 0.25, 2.98, W, tex=tex_flat((2, 2, 1))))        # little roof
    S.add(Box(x - 0.18, y - 0.2, 2.86, x + 0.18, y + 0.2, 2.94, SNOW))
    # the carved figure, snow on its shoulders
    S.add(Ellip(x + 0.12, y, 2.3, 0.08, 0.1, 0.11, ['wd2', 'wd3', 'wd4', 'cr1']))
    S.add(Box(x + 0.06, y - 0.1, 1.55, x + 0.17, y + 0.1, 2.2, ['wd2', 'wd3', 'wd4', 'cr1']))
    S.add(Box(x + 0.06, y - 0.6, 2.08, x + 0.15, y + 0.6, 2.16, ['wd2', 'wd3', 'wd4', 'cr1']))
    S.add(Box(x + 0.05, y - 0.62, 2.16, x + 0.17, y + 0.62, 2.2, SNOW, outline=False))
    S.add(Ellip(x + 0.12, y, 2.43, 0.07, 0.08, 0.04, SNOW, outline=False))
    bank(S, x, y, 0.5, 0.5, 0.25)


def build_road():
    S = ext_scene(30, 12)
    solids = []
    S.add(Box(-12, -12, -0.2, 42, 24, 0, SNOW, tex=tex_snow(), rim=False, outline=False))
    S.add(Box(-12, 5.0, 0, 42, 7.3, 0.012, SNOW, tex=tex_road(), rim=False, outline=False))
    crucifix(S, 4.0, 3.4); solids.append((3.5, 2.9, 4.5, 3.9))
    # banks along the road
    for i, x in enumerate(np.arange(-4, 34, 3.1)):
        bank(S, x + (i * 7 % 13) / 10, 4.55 + (i * 3 % 4) / 10, 1.3, 0.3, 0.2)
        bank(S, x + 1.4 + (i * 5 % 11) / 10, 7.85 + (i * 2 % 5) / 10, 1.5, 0.35, 0.22)
    # forest edge (back) and scattered pines in front
    for i, x in enumerate(np.arange(-6, 36, 1.55)):
        pine(S, x + (i * 37 % 7) / 10, 0.7 + (i * 13 % 5) / 6, 2.8 + (i * 7 % 5) / 4, solids)
        if i % 2: pine(S, x + 0.6, 2.0 + (i * 11 % 4) / 5, 2.4 + (i * 3 % 4) / 4, solids)
        for j in range(5):    # deep forest behind
            pine(S, x + (j * 0.7 + i * 0.37) % 1.4, -1.2 - j * 1.4 + ((i * 7 + j * 3) % 5) / 6, 3.0 + ((i + j) % 4) / 3, None)
    for (x, y, h) in ((2, 10.6, 3.0), (7.5, 10.9, 2.6), (12, 11.2, 3.1), (19, 10.4, 2.8), (25.5, 11.1, 3.3), (28.5, 9.8, 2.5),
                      (-2, 9.5, 3.0), (5, 13, 3.2), (16, 13.4, 2.9), (31, 11, 3.0), (22, 13.5, 3.1)):
        pine(S, x, y, h, solids)
    for (x, y, r) in ((9, 3.1, 0.45), (21, 9.2, 0.6), (26, 3.0, 0.5), (14, 9.6, 0.35)):
        rock(S, x, y, r, solids)
    # Warren's dead horse and the three frozen bounties he sits on (by the road at x~17)
    hx, hy = 17.2, 3.6
    HORSE = ['ink', 'hb1', 'fr1', 'fr2', 'sn3', 'sn4']
    S.add(Ellip(hx, hy, 0.18, 0.85, 0.42, 0.34, HORSE, zmin=0, tex=tex_snowy((1, 2, 3), thresh=0.5)))
    S.add(Ellip(hx + 0.95, hy - 0.15, 0.13, 0.38, 0.16, 0.14, HORSE, zmin=0, tex=tex_snowy((1, 2, 3), thresh=0.5)))  # neck/head
    for (lx, ly) in ((hx - 0.4, hy + 0.35), (hx + 0.3, hy + 0.38)):
        S.add(Box(lx, ly, 0.04, lx + 0.55, ly + 0.08, 0.12, ['ink', 'fr1', 'hb1']))
    S.add(Box(hx - 0.25, hy - 0.2, 0.45, hx + 0.25, hy + 0.2, 0.55, ['ink', 'lb1', 'lb2', 'lb3']))   # saddle
    solids.append((hx - 0.9, hy - 0.45, hx + 1.35, hy + 0.5))
    bx, by = 15.3, 4.0
    for i, (dx, dz) in enumerate(((0, 0.0), (0.05, 0.22), (-0.03, 0.44))):
        S.add(Ellip(bx + dx, by, 0.12 + dz, 0.75, 0.24, 0.12, ['ink', 'hk1', 'hk2', 'gy1', 'sn3', 'sn4'], zmin=0, tex=tex_snowy((1, 2, 3), thresh=0.9)))
    solids.append((bx - 0.75, by - 0.3, bx + 0.75, by + 0.3))
    S.render()
    backdrop(S)
    coll = collision((0.3, 0.3, 29.7, 11.7), solids)
    spots = dict(bodies=[15.3, 4.0], bodies_sit=[15.3, 4.25], horse=[17.2, 3.6], coach_stop=[15.0, 6.2], cross=[4.0, 3.4],
                 mannix=[23.5, 4.4], start=[1.0, 6.2], warren=[15.3, 4.55])
    return S, coll, spots, [], (226, 232, 250)


def build_yard():
    """Outside Minnie's: the cabin (door on its +y face), the stable, the outhouse and the rope posts."""
    S = ext_scene(22, 16)
    solids = []
    S.add(Box(-12, -12, -0.2, 34, 28, 0, SNOW, tex=tex_snow(), rim=False, outline=False))
    # cabin
    cx0, cy0, cx1, cy1, wh = 5.5, 2.0, 13.5, 7.5, 2.6
    S.add(Box(cx0, cy0, 0, cx1, cy1, wh, LOG, tex=tex_logs(levels=(3, 3, 2))))
    ROOF = ['ink', 'wd1', 'wd2', 'wd3', 'sn3', 'sn4', 'sn5']
    mid = (cy0 + cy1) / 2; rise = 1.6; half = (cy1 - cy0) / 2 + 0.5
    k = rise / half
    S.add(Convex([((1, 0, 0), cx1 + 0.4), ((-1, 0, 0), -(cx0 - 0.4)), ((0, 0, -1), -wh - 0.05),
                  ((0, k, 1), k * mid + wh + rise), ((0, -k, 1), -k * mid + wh + rise)], ROOF, tex=tex_roof(wh - 0.5)))
    S.add(Convex([((1, 0, 0), cx1), ((-1, 0, 0), -cx0), ((0, 0, -1), -wh + 0.02),
                  ((0, k, 1), k * mid + wh + rise - 0.25), ((0, -k, 1), -k * mid + wh + rise - 0.25)], LOG, tex=tex_logs(levels=(3, 3, 2))))
    S.add(Box(cx0 + 1.2, cy0 + 0.8, wh, cx0 + 1.9, cy0 + 1.6, wh + 2.4, FIELD, tex=tex_fieldstone()))    # chimney
    S.add(Box(cx0 + 1.15, cy0 + 0.75, wh + 2.4, cx0 + 1.95, cy0 + 1.65, wh + 2.5, SNOW, outline=False))
    # door on the +y face, with frame; two windows
    S.add(Box(9.0, cy1, 0, 10.2, cy1 + 0.05, 2.05, DARKWOOD, decals=[dict(face=1, at=(9.02, 2.05), grid=DOOR, legend=DOOR_L, scale=(1 / 16, 1 / 20))], outline=False))
    S.add(Box(8.9, cy1, 0, 9.0, cy1 + 0.12, 2.15, DARKWOOD)); S.add(Box(10.2, cy1, 0, 10.3, cy1 + 0.12, 2.15, DARKWOOD))
    S.add(Box(8.9, cy1, 2.05, 10.3, cy1 + 0.12, 2.18, DARKWOOD))
    for (a0, a1) in ((6.6, 7.6), (11.6, 12.6)):
        S.add(Box(a0, cy1, 1.0, a1, cy1 + 0.03, 1.9, ['fi1', 'fi2', 'fi3', 'fi4'], tex=tex_flat((2, 2, 2)), nolight=True, outline=False))
        S.add(Box(a0 - 0.06, cy1, 0.9, a1 + 0.06, cy1 + 0.1, 1.0, DARKWOOD))
        S.add(Box((a0 + a1) / 2 - 0.03, cy1, 1.0, (a0 + a1) / 2 + 0.03, cy1 + 0.05, 1.9, DARKWOOD, outline=False))
    S.add(Box(cx1, 4.0, 1.0, cx1 + 0.03, 5.0, 1.9, ['fi1', 'fi2', 'fi3', 'fi4'], tex=tex_flat((2, 2, 2)), nolight=True, outline=False))
    # porch step and a sign over the door
    S.add(Box(8.6, cy1, 0, 10.6, cy1 + 0.6, 0.18, WOOD, tex=tex_planks('x', 0.2, levels=(4, 3, 2))))
    S.add(Box(7.9, cy1, 2.3, 11.3, cy1 + 0.06, 2.62, DARKWOOD, decals=[dict(face=1, at=(7.95, 2.6), grid=YARD_SIGN, legend=YARD_SIGN_L, scale=(1 / 16, 1 / 20))]))
    solids.append((cx0 - 0.1, cy0 - 0.1, cx1 + 0.1, cy1 + 0.1))
    # stable (open front facing +y), stalls inside
    sx0, sy0, sx1, sy1 = 15.0, 2.5, 20.5, 6.8
    S.add(Box(sx0, sy0 - 0.25, 0, sx1, sy0, 2.2, LOG, tex=tex_logs(levels=(2, 2, 1))))
    S.add(Box(sx0 - 0.25, sy0, 0, sx0, sy0 + 1.9, 2.2, LOG, tex=tex_logs(levels=(2, 2, 1))))
    S.add(Box(sx1, sy0, 0, sx1 + 0.25, sy0 + 1.9, 2.2, LOG, tex=tex_logs(levels=(2, 2, 1))))
    S.add(Box(sx0 - 0.25, sy0 + 1.9, 0, sx0, sy1, 1.0, LOG, tex=tex_logs(levels=(2, 2, 1))))
    S.add(Box(sx1, sy0 + 1.9, 0, sx1 + 0.25, sy1, 1.0, LOG, tex=tex_logs(levels=(2, 2, 1))))
    kk = 0.35; ry1 = sy0 + 1.9
    S.add(Convex([((1, 0, 0), sx1 + 0.35), ((-1, 0, 0), -(sx0 - 0.35)), ((0, -1, 0), -(sy0 - 0.45)), ((0, 1, 0), ry1),
                  ((0, 0, -1), -2.15), ((0, -kk, 1), -kk * ry1 + 2.6 + 0.2)], ROOF, tex=tex_roof(2.2)))
    for x in (sx0 + 0.05, sx1 - 0.15):
        S.add(Box(x, ry1 - 0.12, 0, x + 0.1, ry1 - 0.02, 2.6, DARKWOOD))
    for x in (sx0 + 1.8, sx0 + 3.6):
        S.add(Box(x, sy0, 0, x + 0.12, sy0 + 2.2, 1.2, WOOD, tex=tex_planks('y', 0.2)))             # stall dividers
    S.add(Box(sx0, sy1 - 0.06, 0.75, sx1, sy1, 0.85, DARKWOOD)); S.add(Box(sx0, sy1 - 0.06, 0.35, sx1, sy1, 0.43, DARKWOOD))   # paddock rails
    for x in (sx0 + 0.05, (sx0 + sx1) / 2, sx1 - 0.1):
        S.add(Box(x, sy1 - 0.1, 0, x + 0.12, sy1, 1.0, DARKWOOD))
    S.add(Box(sx0 + 0.3, sy0 + 0.1, 0, sx0 + 1.4, sy0 + 0.7, 0.5, ['gd1', 'gd2', 'gd3', 'gd4'], tex=tex_rough((3, 2, 1), 0.2, scale=12)))  # hay
    solids += [(sx0 - 0.3, sy0 - 0.3, sx1 + 0.3, sy0 + 0.05), (sx0 - 0.3, sy0, sx0 + 0.05, sy1), (sx1 - 0.05, sy0, sx1 + 0.3, sy1),
               (sx0, sy1 - 0.12, sx0 + 2.4, sy1 + 0.05), (sx0 + 3.4, sy1 - 0.12, sx1, sy1 + 0.05)]
    for x in (sx0 + 1.8, sx0 + 3.6): solids.append((x, sy0, x + 0.12, sy0 + 2.2))
    # outhouse (front left) with the moon cut in its door
    ox, oy = 2.2, 12.6
    S.add(Box(ox, oy, 0, ox + 1.0, oy + 1.0, 2.0, WOOD, tex=tex_planks('y', 0.2, levels=(3, 3, 2)),
              decals=[dict(face=1, at=(ox + 0.25, 1.85), grid=MOON, legend=MOON_L, scale=(1 / 16, 1 / 20))]))
    S.add(Convex([((1, 0, 0), ox + 1.15), ((-1, 0, 0), -(ox - 0.15)), ((0, -1, 0), -(oy - 0.15)), ((0, 1, 0), oy + 1.15),
                  ((0, 0, -1), -2.0), ((0, 0.3, 1), 0.3 * (oy + 1.15) + 2.0 + 0.4)], ROOF, tex=tex_roof(2.0)))
    solids.append((ox - 0.1, oy - 0.1, ox + 1.1, oy + 1.1))
    # rope posts from the cabin corner to the outhouse
    posts = [(5.2, 8.3), (4.4, 9.6), (3.6, 10.9), (3.0, 12.1)]
    for (px, py) in posts:
        S.add(Box(px - 0.06, py - 0.06, 0, px + 0.06, py + 0.06, 1.1, DARKWOOD))
        S.add(Box(px - 0.08, py - 0.08, 1.1, px + 0.08, py + 0.08, 1.16, SNOW, outline=False))
    # fence along the back, trees, banks
    for x in np.arange(0.5, 22, 1.2):
        if 5 < x < 14: continue
        S.add(Box(x, 0.6, 0, x + 0.1, 0.7, 1.0, DARKWOOD))
    S.add(Box(0.5, 0.62, 0.55, 5.2, 0.68, 0.62, DARKWOOD)); S.add(Box(14.2, 0.62, 0.55, 21.6, 0.68, 0.62, DARKWOOD))
    for (x, y, h) in ((1.2, 1.8, 3.0), (2.8, 4.2, 2.5), (21.0, 9.0, 3.2), (19.5, 14.8, 2.8), (0.9, 7.0, 2.7), (15.5, 14.6, 2.4)):
        pine(S, x, y, h, solids)
    for i, x in enumerate(np.arange(-6, 28, 1.5)):
        for j in range(5):
            pine(S, x + (j * 0.7 + i * 0.37) % 1.4, -0.6 - j * 1.4 + ((i * 7 + j * 3) % 5) / 6, 3.0 + ((i + j) % 4) / 3, None)
    for j, y in enumerate(np.arange(1, 16, 1.6)):
        pine(S, -1.2 - (j % 3) * 0.9, y, 3.0 + (j % 3) / 3, None); pine(S, 23.2 + (j % 2) * 0.9, y + 0.5, 2.9 + (j % 4) / 3, None)
    for (x, y, rx, ry) in ((3.5, 6.0, 1.2, 0.6), (18, 9.5, 1.5, 0.5), (8.0, 14.8, 2.0, 0.6), (13.5, 1.2, 1.0, 0.4)):
        bank(S, x, y, rx, ry)
    S.render()
    backdrop(S, 3)
    coll = collision((0.3, 0.8, 21.7, 15.7), solids)
    spots = dict(door=[9.6, 8.1], coach=[10.5, 11.5], stable=[17.6, 6.0], mare=[16.1, 4.3], stall2=[17.9, 4.3], stall3=[19.6, 4.3],
                 outhouse=[2.7, 13.9], posts=[list(p) for p in posts], hay=[15.9, 3.6], start=[16.0, 12.5])
    return S, coll, spots, [], (226, 232, 250)


YARD_SIGN = G("""
oooooooooooooooooooooooooooooooooooooooooooooooooooooo
oyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyo
oyQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQyo
oyQq...q.q.q..q.q..q.q.q..qq...q..q..qq..q..q..qqq.Qyo
oyQqq.qq.q.qq.q.qq.q.q.q.q...q.q.q.q.q.q.qq.q.q....Qyo
oyQq.q.q.q.q.qq.q.qq.q...qq..qqq.qqq.q.q.q.qq.q.qq.Qyo
oyQq...q.q.q..q.q..q.q.....q.q.q.q.q.qq..q..q..qqq.Qyo
oyQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQyo
oyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyo
oooooooooooooooooooooooooooooooooooooooooooooooooooooo
""", 54)
YARD_SIGN_L = dict(o='ink', y='wd4', Q='wd2', q='cr3')
MOON = G("""
..oo..
.oo...
oo....
oo....
oo....
.oo...
..oo..
""", 6)
MOON_L = dict(o='ink')

ROOMS.update(road=build_road, yard=build_yard)


def main(names):
    for n in names or ROOMS:
        S, coll, spots, lights, grade = ROOMS[n]()
        S.save(os.path.join(PREV, n + '.png'), 2)
        with open(os.path.join(OUT, f'room_{n}.js'), 'w') as f:
            f.write(room_js(n, S, coll, spots, lights, grade))
        print('room', n, S.w, 'x', S.h)


if __name__ == '__main__':
    main(sys.argv[1:])
