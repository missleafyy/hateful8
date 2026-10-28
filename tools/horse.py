"""horse — the stagecoach team. Hand-drawn 3/4 view facing se (head toward screen right-down),
48x40 canvas, hooves on row 37, origin [24, 38]. Legs are drawn per frame for the trot."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from spr import *

#        0123456789abcdefghijklmnopqrstuvwxyz
BODY = G("""
..
.......................................kk
......................................kKkk
......................................kKKk
.....................................kKccC
....................................KKncccC
...................................KKnnceCc
..................................KKnnnccCc
.................................KKnnn.ncCcc
................................KKnnn..nnccCc
...............................KKnnnn...nncccc
..............................KKnnnnn....nnccmm
.............................KKnnnnnc.....nnmMm
.............nnnnnnnnnnnnnnnLLnnnnncc......mmm
..........nnccCCCCCCCcccccccLlLnnnnccc
.........ncCCCCCCCCCCCCcccccLlLnnncccc
........ncCCCCCCCCCCCCCCccccLlLnncccccc
.......KncCCCCCCCCCCCCCcccccLLLncccccCc
.......KncCCCCCCCCCCCCcccccccccncccccCc
......KKncCCCCCCCCcccLLLLLLLLLLLLLccCCc
......KKnncccccccccccccccccccccccccCCc
......KKnnncccccccccccccccccccccncccc
.....KKKnnnnccccccccccccccccccnnnnccc
.....KK.NnnnnnncccccccccccnnnnnnnnNN
.....KK..NNnnnnnnnnnnnnnnnnnnnnnNN
....KK....NNNNNNNNNNNNNNNNNNNNNN
....K
""", 48, 40)
# legs: (x of the top, x shift at the hoof, top row, bottom row) — 3px wide shaded column, dark hoof
def legs(g, specs):
    for (x, dx, y0, y1, near) in specs:
        n = y1 - y0
        for i, y in enumerate(range(y0, y1)):
            xx = x + round(dx * i / max(1, n - 1))
            w3 = i < n * 0.45                      # forearm / gaskin is thicker than the cannon
            cols = (('n', 'c', 'n') if w3 else ('c', 'n')) if near else (('N', 'n', 'N') if w3 else ('n', 'N'))
            if y >= y1 - 3: cols = ('k', 'K') if near else ('K', 'k')        # dark lower legs
            for j, c in enumerate(cols): g[y][xx + j] = c
        xx = x + dx
        for j in range(3): g[y1][xx + j] = 'R'

STAND = [(10, 0, 27, 36, False), (14, 0, 28, 37, True), (27, 0, 26, 35, False), (31, 0, 27, 36, True)]
TROT = [
    [(9, -1, 27, 35, False), (15, 2, 28, 36, True), (28, 2, 26, 33, False), (31, -2, 27, 36, True)],
    [(10, 0, 27, 36, False), (14, 0, 28, 35, True), (27, 0, 26, 35, False), (31, 0, 27, 34, True)],
    [(11, 2, 27, 36, False), (13, -1, 28, 35, True), (26, -2, 26, 35, False), (32, 2, 27, 34, True)],
    [(10, 0, 27, 35, False), (14, 0, 28, 37, True), (27, 0, 26, 34, False), (31, 0, 27, 36, True)],
]

def horse(leg_specs, bob=0, head=0):
    g = blank(48, 40)
    # far legs behind the body, near legs in front
    legs(g, [s for s in leg_specs if not s[4]])
    place(g, shift(BODY, 0, bob))
    if head: g = nod(g, head)
    legs(g, [s for s in leg_specs if s[4]])
    return ink(g)

def nod(g, dy):
    n = copy(g)
    for y in range(39, -1, -1):
        for x in range(30, 48):
            if g[y][x] != '.' and y + dy < 40: n[y + dy][x] = g[y][x]
            if y - dy >= 0 and y - dy < 40 and g[y - dy][x] == '.' and dy > 0 and y < 20: n[y][x] = '.' if g[y][x] == '.' else n[y][x]
    return n

LEG = {'bay': dict(e='ink', N='fr1', n='fr2', c='fr3', C='fr4', K='ink', k='hb1', R='ink', L='lb1', l='gd2', m='hb2', M='hb3'),
       'black': dict(e='ink', N='ink', n='hk1', c='hk2', C='hk3', K='ink', k='hk1', R='ink', L='lb2', l='gd2', m='hk2', M='hk3'),
       'grey': dict(e='ink', N='cg1', n='cg2', c='cg3', C='cg4', K='gy1', k='gy2', R='ink', L='lb2', l='gd2', m='gy2', M='gy3'),
       'chestnut': dict(e='ink', N='hr1', n='hr2', c='hr3', C='hr4', K='hb1', k='hb2', R='ink', L='lb1', l='gd2', m='hr2', M='hr3')}
frames = {'se_idle0': horse(STAND)}
for i, t in enumerate(TROT): frames[f'se_walk{i}'] = horse(t, [0, -1, 0, -1][i])
if __name__ == '__main__':
    L = dict(o='ink'); L.update(LEG['bay'])
    sheet([(k, v) for k, v in frames.items()], L, '/home/leafy/hateful8/art/draft/horse.png', k=6)
