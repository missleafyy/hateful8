"""props — reusable furniture and building parts for iso scenes (all built from iso.py primitives).
Each helper adds prims to a Scene and returns a collision footprint list [(x0, y0, x1, y1)]."""
from iso import *

WOOD = ['wd1', 'wd2', 'wd3', 'wd4', 'wd5', 'wd6']
DARKWOOD = ['ink', 'wd1', 'wd2', 'wd3', 'wd4']
LOG = ['ink', 'wd1', 'wd2', 'wd3', 'wd4', 'wd5']
IRON = ['ink', 'st_1', 'st_2', 'st_3', 'st_4']
STONE = ['st_1', 'st_2', 'st_3', 'st_4', 'cr2']
BRASS = ['gd1', 'gd2', 'gd3', 'gd4']
CLOTH_RED = ['rd1', 'rd2', 'rd3', 'rd4']
CLOTH_GREEN = ['gn1', 'gn2', 'gn3', 'gn4']
CREAM = ['cr1', 'cr2', 'cr3', 'sn5']
GLASS = ['nv1', 'nv3', 'sn2', 'sn4']


def table(S, x0, y0, x1, y1, h=0.78, mat=WOOD, top=0.07, leg=0.1, cloth=None, decals=None):
    S.add(Box(x0, y0, h - top, x1, y1, h, cloth or mat, decals=decals, tex=tex_planks('x' if x1 - x0 > y1 - y0 else 'y', 0.22, levels=(4, 3, 2), grain=0.05) if not cloth else tex_flat((3, 2, 1))))
    S.add(Box(x0 + 0.05, y0 + 0.05, h - top - 0.06, x1 - 0.05, y1 - 0.05, h - top, mat, tex=tex_flat((1, 1, 0)), outline=False))   # apron
    for (x, y) in ((x0 + 0.06, y0 + 0.06), (x1 - 0.06 - leg, y0 + 0.06), (x0 + 0.06, y1 - 0.06 - leg), (x1 - 0.06 - leg, y1 - 0.06 - leg)):
        S.add(Box(x, y, 0, x + leg, y + leg, h - top, mat, tex=tex_flat((3, 2, 1))))
    return [(x0, y0, x1, y1)]


def chair(S, x, y, facing='se', mat=WOOD, h=0.45):
    """facing = direction the sitter looks: 'se' (+x), 'sw' (+y), 'nw' (-x), 'ne' (-y)."""
    s = 0.42; x0, y0 = x - s / 2, y - s / 2
    S.add(Box(x0, y0, h - 0.06, x0 + s, y0 + s, h, mat, tex=tex_flat((4, 3, 2))))
    for (lx, ly) in ((x0, y0), (x0 + s - 0.07, y0), (x0, y0 + s - 0.07), (x0 + s - 0.07, y0 + s - 0.07)):
        S.add(Box(lx, ly, 0, lx + 0.07, ly + 0.07, h - 0.06, mat, tex=tex_flat((3, 2, 1))))
    # back rest on the side opposite the facing
    bh = 0.55
    if facing == 'se': S.add(Box(x0, y0, h, x0 + 0.07, y0 + s, h + bh, mat, tex=tex_planks('y', 0.11)))
    if facing == 'nw': S.add(Box(x0 + s - 0.07, y0, h, x0 + s, y0 + s, h + bh, mat, tex=tex_planks('y', 0.11)))
    if facing == 'sw': S.add(Box(x0, y0, h, x0 + s, y0 + 0.07, h + bh, mat, tex=tex_planks('x', 0.11)))
    if facing == 'ne': S.add(Box(x0, y0 + s - 0.07, h, x0 + s, y0 + s, h + bh, mat, tex=tex_planks('x', 0.11)))
    return [(x0, y0, x0 + s, y0 + s)]


def armchair(S, x, y, mat=CLOTH_RED, frame=DARKWOOD):
    """Sweet Dave's chair: a high-backed upholstered armchair facing +x (se)."""
    s = 0.7; x0, y0 = x - s / 2, y - s / 2
    S.add(Box(x0, y0, 0, x0 + s, y0 + s, 0.22, frame, tex=tex_flat((3, 2, 1))))
    S.add(Ellip(x0 + s * 0.55, y0 + s / 2, 0.36, s * 0.42, s * 0.42, 0.12, mat))                       # cushion
    S.add(Box(x0, y0, 0.22, x0 + 0.18, y0 + s, 1.25, mat, tex=tex_rough((2, 2, 1), 0.06, scale=10)))        # back
    S.add(Ellip(x0 + 0.09, y0 + s / 2, 1.25, 0.09, s / 2, 0.1, mat))
    for yy in (y0, y0 + s - 0.14):
        S.add(Box(x0 + 0.1, yy, 0.22, x0 + s, yy + 0.14, 0.58, mat, tex=tex_flat((3, 2, 1))))             # arms
        S.add(Box(x0 + s - 0.06, yy, 0.0, x0 + s, yy + 0.14, 0.22, frame))
    return [(x0, y0, x0 + s, y0 + s)]


def bench(S, x0, y0, x1, y1, h=0.42, mat=WOOD):
    S.add(Box(x0, y0, h - 0.06, x1, y1, h, mat, tex=tex_planks('x' if x1 - x0 > y1 - y0 else 'y', 0.12, levels=(4, 3, 2))))
    if x1 - x0 > y1 - y0:
        for x in (x0 + 0.1, x1 - 0.18): S.add(Box(x, y0 + 0.04, 0, x + 0.08, y1 - 0.04, h - 0.06, mat))
    else:
        for y in (y0 + 0.1, y1 - 0.18): S.add(Box(x0 + 0.04, y, 0, x1 - 0.04, y + 0.08, h - 0.06, mat))
    return [(x0, y0, x1, y1)]


def bottle(S, x, y, z, col, tall=0.28, r=0.045):
    S.add(Cyl(x, y, r, z, z + tall * 0.7, col, outline=False))
    S.add(Cyl(x, y, r * 0.45, z + tall * 0.7, z + tall, col, outline=False))


def window(S, wall, a0, a1, z0=1.0, z1=2.0, depth=0.4):
    """A window in a back wall, shown as a decal-ish recess: frame boxes + glass plane.
    wall 'A' = the y=0 wall (u along x), wall 'B' = the x=0 wall (u along y)."""
    fr = DARKWOOD
    snow = ['sn1', 'sn2', 'sn3', 'sn4']
    if wall == 'A':
        S.add(Box(a0, -depth, z0, a1, 0.01, z1, snow, tex=tex_win(), nolight=True, outline=False, rim=False))
        S.add(Box(a0 - 0.08, -0.02, z0 - 0.1, a1 + 0.08, 0.08, z0, fr, tex=tex_flat((4, 3, 2))))     # sill
        for a in (a0 - 0.06, a1 - 0.02): S.add(Box(a, -0.02, z0, a + 0.08, 0.04, z1, fr, tex=tex_flat((3, 3, 1))))
        S.add(Box(a0 - 0.06, -0.02, z1 - 0.02, a1 + 0.06, 0.04, z1 + 0.08, fr, tex=tex_flat((3, 3, 1))))
        m = (a0 + a1) / 2; S.add(Box(m - 0.025, -0.02, z0, m + 0.025, 0.02, z1, fr, tex=tex_flat((2, 2, 1)), outline=False))
        mz = (z0 + z1) / 2; S.add(Box(a0, -0.02, mz - 0.02, a1, 0.02, mz + 0.02, fr, tex=tex_flat((2, 2, 1)), outline=False))
    else:
        S.add(Box(-depth, a0, z0, 0.01, a1, z1, snow, tex=tex_win(), nolight=True, outline=False, rim=False))
        S.add(Box(-0.02, a0 - 0.08, z0 - 0.1, 0.08, a1 + 0.08, z0, fr, tex=tex_flat((4, 3, 2))))
        for a in (a0 - 0.06, a1 - 0.02): S.add(Box(-0.02, a, z0, 0.04, a + 0.08, z1, fr, tex=tex_flat((3, 3, 1))))
        S.add(Box(-0.02, a0 - 0.06, z1 - 0.02, 0.04, a1 + 0.06, z1 + 0.08, fr, tex=tex_flat((3, 3, 1))))
        m = (a0 + a1) / 2; S.add(Box(-0.02, m - 0.025, z0, 0.02, m + 0.025, z1, fr, tex=tex_flat((2, 2, 1)), outline=False))
        mz = (z0 + z1) / 2; S.add(Box(-0.02, a0, mz - 0.02, 0.02, a1, mz + 0.02, fr, tex=tex_flat((2, 2, 1)), outline=False))


def tex_win():
    """Snow-blind window glass: pale, with drifts banked against the bottom and a few flakes."""
    def f(X, Y, Z, n, face, nramp):
        u = np.where(face == 1, X, Y)
        idx = np.full(X.shape, 2)
        idx = np.where(Z % 1.0 < 0.25, 3, idx)
        drift = (Z % 1.0) < 0.12 + 0.06 * np.sin(u * 9)
        idx = np.where(drift, 3, idx)
        streak = h2(np.floor(u * 16).astype(int), np.floor(Z * 20 + u * 10).astype(int), 5) < 0.06
        idx = np.where(streak, 3, idx)
        idx = np.where(h2(np.floor(u * 16).astype(int), np.floor(Z * 20).astype(int), 9) < 0.04, 1, idx)
        return np.clip(idx, 0, nramp - 1)
    return f
