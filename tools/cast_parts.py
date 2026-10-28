"""cast_parts — hand-drawn body parts shared by the cast (32x48 canvas, feet on row 44, origin [16, 45]).

Material letters (each character's legend maps them to colours):
  coat     N n c C   (dark -> light)        trim/fur F f h H
  trousers P p                              boots    R r u
  skin     1 2 3 4                          belt L l, brass z, gun m M
  shirt    V v w     dress D d s S          hands use skin
Facing 'se' = front three-quarter (looking screen right-down); 'ne' = back three-quarter (looking right-up).
"""
from spr import G, blank, place, shift, ink, copy


def rows_at(text, y0, w=32):
    """A grid fragment whose first row is canvas row y0."""
    g = G(text, w); out = blank(w, 48); place(out, g, 0, y0); return out


# ---------------------------------------------------------------- boots (stamped per frame)
BOOT = {
    # front view, toe toward screen right
    'se_plant': ["RruR", "RrrruR", "RRRRRR"],
    'se_heel':  ["RruR", "RrruR", ".RRR"],          # heel lifted, toe down (trailing foot)
    'se_lift':  ["RruR", "RrrruR", ".RRRRR"],       # passing, lifted clear of the floor
    # back view: heel toward camera, toe away (up-right)
    'ne_plant': ["RruR", "RRrruR", "RRRRRR"],
    'ne_heel':  ["RruR", "RRrruR", "RRRR"],         # trailing foot: sole shows
    'ne_lift':  ["RruR", "RRrrR", ".RRRR"],
}
LEG = "PpP"


def leg(g, x, y0, y1, ch=LEG):
    for y in range(y0, y1):
        for i, c in enumerate(ch):
            g[y][x + i] = c


def boot(g, kind, x, y):
    for j, r in enumerate(BOOT[kind]):
        for i, c in enumerate(r):
            if c != '.': g[y + j][x + i] = c


# ---------------------------------------------------------------- long-coat lower body (cape + coat + fur)
HEM = {
    'se': {
        'stand': """
.........CcccccccNcnnN
.........CcccccccNcnnN
........CccccccccNcnnnN
........CcccccccN.NcnnN
........NNNNNNNN..NNNNN
""",
        'fwdA': """
.........CcccccccNcnnN
.........CcccccccNcnnN
.........CccccccccNcnnN
.........CcccccccNNcnnnN
.........NNNNNNNNN.NNNNN
""",
        'mid': """
.........CcccccccNcnnN
.........CcccccccNcnnN
........CccccccccNcnnN
........CcccccccNNcnnN
........NNNNNNNNNNNNNN
""",
        'fwdB': """
.........CcccccccNcnnN
........CccccccccNcnnN
........CcccccccNNcnnN
.......CcccccccN.NcnnN
.......NNNNNNNN..NNNNN
""",
    },
    'ne': {
        'stand': """
.........nnccccccccCN
.........nncccccccccN
........NnnccccccccccN
........NnncccNcccccCN
........NNNNNN.NNNNNNN
""",
        'fwdA': """
.........nnccccccccCN
.........nnccccccccccN
.........NnnccccccccccN
.........NnncccNNcccccCN
.........NNNNNN.NNNNNNNN
""",
        'mid': """
.........nnccccccccCN
.........nncccccccccN
........NnnccccccccccN
........NnncccNNccccCN
........NNNNNNNNNNNNNN
""",
        'fwdB': """
.........nnccccccccCN
........NnncccccccccN
........NnnccccccccccN
.......NnncccN.cccccCN
.......NNNNNN..NNNNNNN
""",
    },
}

# walk keys: (hem, body bob, near leg (x, boot kind, boot row), far leg (...))
#   near = the leg nearer the camera (screen-left in 'se', screen-right in 'ne')
COAT_WALK = {
    'se': [
        ('fwdA', 0, (12, 'se_plant', 43), (17, 'se_heel', 41)),    # contact: near foot forward
        ('fwdA', 1, (12, 'se_plant', 43), (17, 'se_lift', 41)),    # down: weight on near
        ('mid', 0, (11, 'se_plant', 42), (17, 'se_lift', 40)),     # passing: far foot swings through
        ('fwdB', 0, (10, 'se_heel', 41), (18, 'se_plant', 43)),    # contact: far foot forward
        ('fwdB', 1, (10, 'se_lift', 41), (18, 'se_plant', 43)),
        ('mid', 0, (11, 'se_lift', 40), (17, 'se_plant', 42)),
    ],
    'ne': [
        ('fwdA', 0, (17, 'ne_plant', 41), (11, 'ne_heel', 43)),    # near (screen-right) foot forward = higher
        ('fwdA', 1, (17, 'ne_plant', 41), (11, 'ne_lift', 42)),
        ('mid', 0, (17, 'ne_plant', 42), (12, 'ne_lift', 40)),
        ('fwdB', 0, (18, 'ne_heel', 43), (12, 'ne_plant', 41)),
        ('fwdB', 1, (18, 'ne_lift', 42), (12, 'ne_plant', 41)),
        ('mid', 0, (17, 'ne_lift', 40), (12, 'ne_plant', 42)),
    ],
}
COAT_STAND = {'se': ((11, 'se_plant', 42), (17, 'se_plant', 42)), 'ne': ((17, 'ne_plant', 42), (11, 'ne_plant', 42))}


def coat_lower(facing, key, near, far):
    g = blank(32, 48)
    # far leg first (behind), then near leg
    for (x, kind, by) in (far, near):
        leg(g, x, 39, by)
        boot(g, kind, x - 1, by)
    place(g, rows_at(HEM[facing][key], 34))
    return g


# ---------------------------------------------------------------- caped greatcoat torso (Warren)
CAPE = {
    'se': {
        'n': """
..........ncCccccccnN
.........ncCCccccccnnN
........ncCCCccccccccnN
.......ncCCCccccccccccnN
.......ncCccccccccccnnnN
.......nccccccccccccnnnN
.......nncccccccccccnnnN
.......NNnnnnnnnnnnnNNNN
.......ncNcCcccccNzcnNnN
.......ncNcCcccccNcnnNnN
.......ncNcCcccccNzcnNnN
.......ncNLlllllLLLlLNnN
.......ncNmMcccccNcnnNnN
.......ncNmmcccccNzcnNnN
.......nNNCcccccNcnnNNn
.......34.Ccccccccnn.23
.......23.CccccccNcnn.22
""",
        'f': """
..........ncCccccccnN
.........ncCCccccccnnN
........ncCCCccccccccnN
.......ncCCCccccccccccnN
.......ncCccccccccccnnnN
.......nccccccccccccnnnN
.......nncccccccccccnnnN
.......NNnnnnnnnnnnnNNNN
........ncNCcccccNzcnNnN
........ncNCcccccNcnnNnN
........ncNCcccccNzcnNN.
........ncNLllllLLLlLNnN
........ncNMcccccNcnnNN.
........ncNmcccccNzcnN2.
........nNNCcccccNcnnN32
........34Ccccccccnn....
........23CccccccNcnn...
""",
        'b': """
..........ncCccccccnN
.........ncCCccccccnnN
........ncCCCccccccccnN
.......ncCCCccccccccccnN
.......ncCccccccccccnnnN
.......nccccccccccccnnnN
.......nncccccccccccnnnN
.......NNnnnnnnnnnnnNNNN
......ncN.cCcccccNzcnNnN
......ncN.cCcccccNcnnNnN
......ncN.cCcccccNzcnNnN
......ncN.LlllllLLLlLNnN
.....nNN..mMcccccNcnnNnN
.....34...mmcccccNzcnNnN
.....23...CcccccNcnnNN3n
..........Ccccccccnn.N23
..........CccccccNcnn.22
""",
        'aim': """
..........ncCccccccnN
.........ncCCccccccnnN
........ncCCCccccccccnNnnN
.......ncCCCccccccccccnNccnnNmmM
.......ncCccccccccccnnNcccnN34mM
.......nccccccccccccnnNNNnNN23m
.......nncccccccccccnnnN
.......NNnnnnnnnnnnnNNNN
.......ncNcCcccccNzcnN
.......ncNcCcccccNcnnN
.......ncNcCcccccNzcnN
.......ncNLlllllLLLlLN
.......ncN..cccccNcnnN
.......ncN..cccccNzcnN
.......nNNCcccccNcnnN
.......34.Ccccccccnn
.......23.CccccccNcnn
""",
    },
    'ne': {
        'n': """
..........nnccccccCcn
.........nnncccccCCcCn
........Nnnncccccccccn
.......Nnnnccccccccccccn
.......Nnnncccccccccccn
.......Nnnnccccccccccccn
.......NnnncccccccccccCn
.......NNNNnnnnnnnnnnNNN
.......NnN.nnccccccccNcCn
.......NnN.nncccccccNNcCn
.......NnN.nncccccccNNcCn
.......NnN.LLLlllllLNNcCn
.......NnN.nncccccmMNNcCn
.......NNN.nncccccmmNNcCn
........2.Nnncccccc.NN3n
.......22.Nnnccccccc.N43
..........NnncccccccN.32
""",
        'f': """
..........nnccccccCcn
.........nnncccccCCcCn
........Nnnncccccccccn
.......Nnnnccccccccccccn
.......Nnnncccccccccccn
.......Nnnnccccccccccccn
.......NnnncccccccccccCn
.......NNNNnnnnnnnnnnNNN
........NnNnnccccccccNcCn
........NnNnncccccccNNcCn
........NnNnncccccccNNcCn
........NnNLLlllllLLNcCn.
........NNNnncccccmMNcCn.
.........2Nnncccccmm.NcCn
........22Nnnccccccc.NN3n
..........Nnnccccccc..N43
..........NnncccccccN..32
""",
        'b': """
..........nnccccccCcn
.........nnncccccCCcCn
........Nnnncccccccccn
.......Nnnnccccccccccccn
.......Nnnncccccccccccn
.......Nnnnccccccccccccn
.......NnnncccccccccccCn
.......NNNNnnnnnnnnnnNNN
......NnN..nnccccccccNcCn
......NnN..nncccccccNNcCn
......NnN..nncccccccNNcCn
......NNN..LLLlllllLLNNcCn
.......2...nncccccmMNNcCn
......22...nncccccmmNNNCn
...........Nnncccccc.NNN.
...........Nnnccccccc.32.
...........NnncccccccN.23
""",
        'aim': """
..........nnccccccCcn.....mM
.........nnncccccCCcCn...3mm
........NnnncccccccccnNNc32m
.......NnnnccccccccccccnccN.
.......NnnncccccccccccnNcN..
.......NnnnccccccccccccnN...
.......NnnncccccccccccCn
.......NNNNnnnnnnnnnnNNN
.......NnN.nnccccccccNN
.......NnN.nncccccccNNN
.......NnN.nncccccccNNN
.......NnN.LLLlllllLNNN
.......NnN.nncccccmMNN
.......NNN.nncccccmmNN
........2.Nnncccccc.N
.......22.Nnnccccccc.N
..........NnncccccccN
""",
    },
}


# ---------------------------------------------------------------- derived torsos
def _grid(text): return [list(r) for r in G(text, 32)]
def _text(g): return '\n'.join(''.join(r).rstrip('.') or '..' for r in g)


def coat_from_cape(src):
    """Plain greatcoat: the cape's hem and fold are replaced by arms separated from the body."""
    out = {}
    for f, vs in src.items():
        out[f] = {}
        for k, v in vs.items():
            g = _grid(v)
            if f == 'se':
                if k != 'aim':
                    g[7] = g[8][:]                                   # no cape hem
                    for y in (3, 4, 5, 6):
                        for x, c in ((9, 'N'), (21, 'N')):
                            if g[y][x] != '.': g[y][x] = c
                        if g[y][7] != '.': g[y][7] = 'n'
                    g[2][8] = 'n'
                else:
                    g[7] = g[8][:23] + g[7][23:]
                    for y in (5, 6):
                        if g[y][9] != '.': g[y][9] = 'N'
            else:
                if k != 'aim':
                    g[7] = g[8][:]
                    for y in (3, 4, 5, 6):
                        for x, c in ((10, 'N'), (20, 'N')):
                            if g[y][x] != '.': g[y][x] = c
                else:
                    g[7] = g[8][:]
            out[f][k] = _text(g)
    return out


def widen(src, n=1):
    """Bulkier silhouette (Ruth's buffalo coat): every row grows n pixels on both sides."""
    out = {}
    for f, vs in src.items():
        out[f] = {}
        for k, v in vs.items():
            g = _grid(v)
            for row in g:
                xs = [i for i, c in enumerate(row) if c != '.']
                if not xs: continue
                a, b = xs[0], xs[-1]
                # don't widen the gun arm in aim frames
                if k == 'aim' and b > 24: b = None
                for _ in range(n):
                    if a > 0: row[a - 1] = row[a]; a -= 1
                    if b is not None and b < 31: row[b + 1] = row[b]; b += 1
            out[f][k] = _text(g)
    return out


COAT = coat_from_cape(CAPE)
FUR = widen(CAPE)


def suit_from_coat(src):
    """Short jacket: the coat body stops at row 31 (index 14) with a dark hem."""
    out = {}
    for f, vs in src.items():
        out[f] = {}
        for k, v in vs.items():
            g = _grid(v)
            while len(g) < 17: g.append(['.'] * 32)
            hem = g[14]
            for x in range(32):
                c = hem[x]
                if c in 'nNcC' and 9 <= x <= 22: hem[x] = 'N'
            for y in (15, 16):
                for x in range(32):
                    if g[y][x] in 'nNcCLlzmM': g[y][x] = '.'
            out[f][k] = _text(g)
    return out


SUIT = suit_from_coat(COAT)


def suit_lower(facing, near, far, bob=0):
    """Trousers from the hips (row 31) to the boots: legs show the whole stride."""
    g = blank(32, 48)
    for (x, kind, by) in (far, near):
        leg(g, x, 33, by)
        boot(g, kind, x - 1, by)
    hips = "PPpppppppPP" if facing == 'se' else "PPPpppppppP"
    for y in (31, 32):
        for i, c in enumerate(hips): g[y][11 + i] = c
    # crotch: legs meet the hips
    for y in (33, 34):
        for x in range(14, 17):
            if g[y][x] == '.' and abs(near[0] - far[0]) <= 6: g[y][x] = 'P'
    return g


# ---------------------------------------------------------------- dress (bodice + skirt)
DRESS = {
    'se': {
        'n': """
............SssdD
..........SSsssssdD
.........sSSssssssddD
.........sSDSssssssddDd
.........sSDSssssssddDd
.........sSDSsssssdddDd
.........sSDSsssssdddDd
.........sSDSssssssddDd
.........34DSsssssdddD2
.........23LLlllllLLLL3
""",
        'f': """
............SssdD
..........SSsssssdD
.........sSSssssssddD
..........sSSssssssddDd
..........sSSssssssddDd
..........sSDssssssddDd
..........sSDssssssddD.
..........3SDsssssdddD2
..........34Sssssssdd23
...........2LLlllllLLLL
""",
        'b': """
............SssdD
..........SSsssssdD
.........sSSssssssddD
........sSDSssssssddDd
........sSDSssssssddDd
.......sSD.SsssssdddDd
.......sSD.SsssssdddDd
.......34..SssssssddD3
.......23..SsssssdddD2
...........LLlllllLLLL
""",
    },
    'ne': {
        'n': """
............DddsS
..........DDdddssSS
.........DDdddddsssS
........dDdddddddsSDsS
........dDdddddddsSDsS
........dDddddddssSDsS
........dDddddddssSDsS
........dDdddddddsSDsS
........2Dddddddddd.D43
........2DLLLLlllllL.32
""",
        'f': """
............DddsS
..........DDdddssSS
.........DDdddddsssS
.........dDddddddssSDsS
.........dDddddddssSDsS
.........dDddddddssSDsS
.........dDdddddddsSDS.
.........2DddddddddsSD43
.........22ddddddddddD32
..........DLLLLlllllL
""",
        'b': """
............DddsS
..........DDdddssSS
.........DDdddddsssS
........dDdddddddsS.DsS
........dDdddddddsS.DsS
........dDddddddssS.DsS
........dDddddddssS.DsS
........2DddddddddsS.D43
........22dddddddddS..32
..........DLLLLlllllL
""",
    },
}


def skirt(facing, sway=0, feet=None):
    """A-line skirt from the waist (row 27) to the floor (row 43). sway shifts the hem a pixel;
    feet = list of (x, kind, row) boots peeking out under the hem."""
    g = blank(32, 48)
    if feet:
        for (x, kind, by) in feet:
            boot(g, kind, x - 1, by)
    top, bot = 27, 43
    for y in range(top, bot + 1):
        t = (y - top) / (bot - top)
        hw = 6 + round(t * 3.4)                      # half width 6 -> 9
        cx = 16 + (round(sway * t * t) if sway else 0)
        x0, x1 = cx - hw, cx + hw - 1
        for x in range(x0, x1 + 1):
            u = (x - x0) / max(1, x1 - x0)
            if facing == 'se':
                c = 'S' if u < 0.18 else 's' if u < 0.62 else 'd' if u < 0.9 else 'D'
                fold = (x - x0) in (4, 8, 12) and y > top + 3
            else:
                c = 'D' if u < 0.12 else 'd' if u < 0.55 else 's' if u < 0.86 else 'S'
                fold = (x - x0) in (5, 10) and y > top + 3
            if fold: c = {'S': 's', 's': 'd', 'd': 'D', 'D': 'D'}[c]
            g[y][x] = c
        if y == bot:
            for x in range(x0, x1 + 1): g[y][x] = 'D'
    return g


DRESS_WALK = {
    'se': [(1, [(13, 'se_plant', 42)]), (1, [(13, 'se_plant', 42)]), (0, []), (-1, [(18, 'se_plant', 42)]), (-1, [(18, 'se_plant', 42)]), (0, [])],
    'ne': [(1, []), (1, []), (0, []), (-1, []), (-1, []), (0, [])],
}
DRESS_BOB = [0, 1, 0, 0, 1, 0]


# ---------------------------------------------------------------- sitting (on a chair seat ~9px above the floor)
SIT_DROP = 7          # torso + head drop this many rows when seated
SIT = {
    'coat': {
        'se': """
..........NccccccccccCcN
..........NccccccccccccCcN
...........NNNnnnnnnnnNPpP
.....................PpP
.....................PpP
....................RruR
....................RrrruR
....................RRRRRR
""",
        'ne': """
.........nnccccccccCN
.........nncccccccccN
.........NNNNNNNNNNNN
..........PpP...PpP
..........PpP...PpP
.........RruR..RruR
.........RRrruRRRrruR
.........RRRRRRRRRRRR
""",
    },
    'suit': {
        'se': """
..........PPpppppppppPpP
..........PPpppppppppppPpP
...........PPPppppppppPPpP
.....................PpP
.....................PpP
....................RruR
....................RrrruR
....................RRRRRR
""",
        'ne': """
...........PPPpppppppP
...........PPpppppppppP
............PPPPPPPPPP
..........PpP...PpP
..........PpP...PpP
.........RruR..RruR
.........RRrruRRRrruR
.........RRRRRRRRRRRR
""",
    },
    'dress': {
        'se': """
.........SsssssssssddDdD
.........SssssssssssddDdD
.........SssssssssssdddDD
..........DDDDDDDDDDDsdD
.....................sdD
.....................DDD
....................RruR
....................RRRRRR
""",
        'ne': """
.........DdddddddddsSS
.........DddddddddddsSS
.........DdddddddddddsS
.........DDDDDDDDDDDDDD
.........DdddddddddsSDD
.........DDDDDDDDDDDDDD
.........RruR..RruR
.........RRRRRRRRRRRR
""",
    },
}


# ---------------------------------------------------------------- dead / lying on the floor (48x20, origin [24, 14])
# Lying on the back, head toward screen-left; the hat (if any) has rolled off above the head.
DEAD = {
    'coat': """
..
.....jkkK
...jkkkkkKK
..KKKKKKKKK....nnncccccccccNN
.........hh2NnnccccCCcccccccccNNNPpP
........hh23NcccCCcccccccccccccNNPpPPpPRrR
........h233NcczcccccccccccccccNNPPpPPpRrruR
........h2e3NcccCccccccLLccccccNNPpPPpPRRRRR
........hh23NnccccccccccccccccNNNPPPPP.RRR
.........hh2NNnnnnnnnnnnnnnnnNNN
...........3NN....nnnnn
.........2343
..........22
""",
    'suit': """
..
.....jkkK
...jkkkkkKK
..KKKKKKKKK....nnncccccccN
.........hh2NnnccccCCcccccNNPPpPPpPPpP
........hh23NcccCCcccccccccNPPpPPpPPpPPRrR
........h233NcczcccccccccccNPpPPpPPpPPpRrruR
........h2e3NcccCccccccLLccNPPpPPpPPpPPRRRRR
........hh23NnccccccccccccNNPPPPPPPPPP.RRR
.........hh2NNnnnnnnnnnnnNN
...........3NN....nnnnn
.........2343
..........22
""",
    'dress': """
..
..
..
...............DddssssSSsss
.........hh2DdddsssSSSsssssssssdD
........hhh23DdsssSSSssssssssssssddDD
........hh2e3DdsssSSssssssssssssssddDRr
........hh233DdssssssssssssssssssddDRRuR
........hhh2DDddddddddddddddddddddDDRR
.........hhhDDDDDDDDDDDDDDDDDDDDDDD
...........34
..........234
...........2
""",
}
