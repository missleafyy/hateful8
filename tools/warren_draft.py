import sys; sys.path.insert(0, '/home/leafy/hateful8/tools')
from spr import *
L = dict(o='ink', K='hk1', k='hk2', j='hk3', Y='gd2', y='gd3', **{'1':'sd1','2':'sd2','3':'sd3','4':'sd4'},
         b='gy1', B='gy2', g='gy3', e='ink', Q='gd1', q='gd2', w='gd3', N='nv1', n='nv2', c='nv3', C='nv4',
         z='gd3', P='pt1', p='pt2', R='lb1', r='lb2', u='lb3', L='lb2', l='lb3', m='mt1', M='mt2')
#      0123456789abcdefghijklmnopqrstuv
HEAD = G("""
r00|
r01|
r02|.............jkkkkK
r03|............jjkkkkKK
r04|............jkkkkkkK
r05|...........jjkkkkkkKK
r06|...........jkkkkkkkkK
r07|........jkkYyyyyyyyyYKKK
r08|.......jjkkkkkkkkkkkkkKKK
r09|.......jkkkkkkkkkkkkkkkKK
r10|........KKKKKKKKKKKKKKKK
r11|...........1222222222
r12|...........21333e34e3
r13|...........21334334433
r14|...........1233ggBggB2
r15|............1BgBb11bB
r16|.............BBgBgBb
r17|..............bBBb
""", 32, 48)
TORSO = G("""
r00|
r01|
r02|
r03|
r04|
r05|
r06|
r07|
r08|
r09|
r10|
r11|
r12|
r13|
r14|
r15|
r16|
r17|..........ncCQqqwqQnN
r18|.........ncCCQqqwwqQnN
r19|........ncCCCcQqwqQccnN
r20|.......ncCCCccQwqQcccnnN
r21|.......ncCcccccQqccccnnN
r22|.......nccccccccQcccnnnN
r23|.......nncccccccccccnnnN
r24|.......NNnnnnnnnnnnnNNNN
r25|.......ncNcCcccccNzcnNnN
r26|.......ncNcCcccccNcnnNnN
r27|.......ncNcCcccccNzcnNnN
r28|.......ncNLlllllLLLlLNnN
r29|.......ncNmMcccccNcnnNnN
r30|.......ncNmmcccccNzcnNnN
r31|.......n3NCcccccNcnnN3n
r32|.......34.Ccccccccnn.23
r33|.......23.CccccccNcnn.22
""", 32, 48)
LEGS = G("""
r00|
r01|
r02|
r03|
r04|
r05|
r06|
r07|
r08|
r09|
r10|
r11|
r12|
r13|
r14|
r15|
r16|
r17|
r18|
r19|
r20|
r21|
r22|
r23|
r24|
r25|
r26|
r27|
r28|
r29|
r30|
r31|
r32|
r33|
r34|.........CcccccccNcnnN
r35|.........CcccccccNcnnN
r36|........CccccccccNcnnnN
r37|........CcccccccN.NcnnN
r38|........NNNNNNNN..NNNNN
r39|...........PpP...PpP
r40|...........PpP...PpP
r41|...........PpP...PpP
r42|..........RruR...RruR
r43|..........RrrruR.RrrruR
r44|..........RRRRRR.RRRRRR
r45|
""", 32, 48)
F = blank(32, 48)
for part in (LEGS, TORSO, HEAD): place(F, part)
sheet([('raw', F), ('ink', ink(F))], L, '/home/leafy/hateful8/art/draft/warren0.png', k=10)

def low(text):  # lower-body grid starting at row 34
    g = G(text, 32); out = blank(32, 48); place(out, g, 0, 34); return out
HEM_S = """
.........CcccccccNcnnN
.........CcccccccNcnnN
........CccccccccNcnnnN
........CcccccccN.NcnnN
........NNNNNNNN..NNNNN
"""
W0 = low("""
.........CcccccccNcnnN
..........CccccccNcnnN
..........CcccccccNcnnN
.........CcccccccN.NcnnN
.........NNNNNNNN..NNNNN
............PpP.PpP
............PpP.PpP
............PpP..RrR
...........RruR..RruR
...........RrrruR.RR
...........RRRRRR
""")
W1 = low("""
.........CcccccccNcnnN
.........CcccccccNcnnN
.........CccccccccNcnnN
.........CcccccccNNcnnN
.........NNNNNNNNNNNNN
............PpP.PpP
............PpP.PpP
............PpP.PpP
...........RruR.RruR
...........RrrruRRrruR
...........RRRRRRRRRRR
""")
W2 = low("""
.........CcccccccNcnnN
.........CcccccccNcnnN
........CccccccccNcnnnN
........CcccccccNNNcnnN
........NNNNNNNNNNNNNN
...........PpP..PpP
...........PpP..PpP
...........PpP..RruR
..........RruR..RrruR
..........RrrruR.RRRR
..........RRRRRR
""")
W3 = low("""
.........CcccccccNcnnN
........CcccccccNcnnN
........CcccccccNcnnN
.......CcccccccN.NcnnN
.......NNNNNNNN..NNNNN
...........PpP...PpP
...........PpP...PpP
..........RrR....PpP
..........RruR..RruR
...........RR...RrrruR
................RRRRRR
""")
W4 = low("""
.........CcccccccNcnnN
.........CcccccccNcnnN
........CcccccccccNcnnN
........CcccccccNNcnnN
........NNNNNNNNNNNNNN
...........PpP..PpP
...........PpP..PpP
...........PpP..PpP
..........RruR..RruR
..........RrrruRRrruR
..........RRRRRRRRRRR
""")
W5 = low("""
.........CcccccccNcnnN
.........CcccccccNcnnN
........CccccccccNcnnnN
........CcccccccNNNcnnN
........NNNNNNNNNNNNNN
............PpP..PpP
...........RruR..PpP
...........RrrR..PpP
............RR..RruR
................RrrruR
................RRRRRR
""")
STAND = low(HEM_S + """
...........PpP...PpP
...........PpP...PpP
...........PpP...PpP
..........RruR...RruR
..........RrrruR.RrrruR
..........RRRRRR.RRRRRR
""")
def frame(lowg, bob=0):
    f = blank(32, 48)
    place(f, lowg); place(f, shift(TORSO, 0, bob)); place(f, shift(HEAD, 0, bob)); return ink(f)
walk = [frame(W0), frame(W1, 1), frame(W2), frame(W3), frame(W4, 1), frame(W5)]
sheet([('stand', frame(STAND))] + [(f'walk{i}', g) for i, g in enumerate(walk)], L, '/home/leafy/hateful8/art/draft/warren_walk.png', k=8)
gif(walk, L, '/home/leafy/hateful8/art/draft/warren_walk.gif', 110, k=6)

frames = {'se_idle0': frame(STAND), 'se_idle1': frame(STAND, 1)}
for i, g in enumerate(walk): frames[f'se_walk{i}'] = g
js = js_sprite('warren', 32, 48, (16, 45), L, frames).replace("} });", "}, anims: { idle: { n: 2, ms: 40 }, walk: { n: 6, ms: 7 } } });")
open('/home/leafy/hateful8/game/art_chars.js', 'w').write('(function () { const S = Sprout;\n' + js + '\n})();\n')
