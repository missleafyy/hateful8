"""cast_defs — the people. Heads are rows 0-17 (hat, face, hair); overlays sit on the torso (scarves, collars)."""
from cast import char
from cast_parts import CAPE

SKIN_DARK = {'1': 'sd1', '2': 'sd2', '3': 'sd3', '4': 'sd4'}

# ---------------------------------------------------------------- Major Marquis Warren
char('warren', torso=CAPE, lower='coat',
     legend=dict(K='hk1', k='hk2', j='hk3', Y='gd2', y='gd3', **SKIN_DARK, b='gy1', B='gy2', g='gy3', h='hb1', H='hb2',
                 Q='gd1', q='gd2', w='gd3', N='nv1', n='nv2', c='nv3', C='nv4', z='gd3',
                 P='pt1', p='pt2', R='lb1', r='lb2', u='lb3', L='lb2', l='lb3', m='mt1', M='mt2'),
     head=dict(se="""
..
..
.............jkkkkK
............jjkkkkKK
............jkkkkkkK
...........jjkkkkkkKK
...........jkkkkkkkkK
........jkkYyyyyyyyyYKKK
.......jjkkkkkkkkkkkkkKKK
.......jkkkkkkkkkkkkkkkKK
........KKKKKKKKKKKKKKKK
...........1222222222
...........21333e34e3
...........B1334334433
...........B233ggBggB2
............BBgBb11bB
.............BBgBgBb
..............bBBb
""", ne="""
..
..
.............jkkkkK
............jjkkkkKK
............jkkkkkkK
...........jjkkkkkkKK
...........jkkkkkkkkK
........jkkYyyyyyyyyYKKK
.......jjkkkkkkkkkkkkkKKK
.......jkkkkkkkkkkkkkkkKK
........KKKKKKKKKKKKKKKK
...........hhhhhhhhh2
...........hHhhhhhhB32
...........hhHhhhhhhB2
............1hhhhhhhB
.............1111111
..............QqqQ
"""),
     over=dict(se="""
..
..
..
..
..
..
..
..
..
..
..
..
..
..
..
..
..
.............QqqwwqQ
.............QqqwwqQ
..............QqwqQ
..............QwqQ
...............QqQ
................Q
""", ne="""
..
..
..
..
..
..
..
..
..
..
..
..
..
..
..
..
..
............QqqqqqQq
"""))

from cast_parts import COAT, FUR, SUIT, DRESS
SKIN_PALE = {'1': 'sl1', '2': 'sl2', '3': 'sl3', '4': 'sl4'}
SKIN_TAN = {'1': 'st1', '2': 'st2', '3': 'st3', '4': 'st4'}
BLANK17 = "..\n" * 17

def over_rows(start, text):
    return "..\n" * start + text.strip('\n')

# shared hat: cattleman crown + wide brim, rows 2-10
HAT_SE = """
..
..
.............jkkkkK
............jjkkkkKK
............jkkkkkkK
...........jjkkkkkkKK
...........jkkkkkkkkK
........jkkYYYYYYYYYYKKK
.......jjkkkkkkkkkkkkkKKK
.......jkkkkkkkkkkkkkkkKK
........KKKKKKKKKKKKKKKK
"""
HAT_NE = HAT_SE

# ---------------------------------------------------------------- John "The Hangman" Ruth
char('ruth', torso=FUR, lower='coat',
     legend=dict(K='hb1', k='hb2', j='hb3', Y='ink', **SKIN_PALE, b='hb2', B='hb3', g='hb4', h='hb2', H='hb3',
                 N='fr1', n='fr2', c='fr3', C='fr4', F='fr2', f='fr4', z='gd2',
                 P='pt2', p='pt3', R='lb1', r='lb2', u='lb3', L='lb1', l='lb2', m='mt1', M='mt2'),
     head=dict(se=HAT_SE + """
...........1222222222
..........b21333e34e3
..........bb2334334433
..........bbBBBBBBBBBB2
.........BBBb22BBB2BBBB
..........bb1233332bb
............b13332b
""", ne=HAT_NE + """
...........hhhhhhhhh2
...........hHhhhhhhh32
...........hhhhhhhhhb2
............1hhhhhhbBB
.............1111111B
"""),
     over=dict(se=over_rows(16, """
...........fFffFffFffF
.........fFfFffffffFfFf
.........FfffFfFfffFffF
"""), ne=over_rows(16, """
...........FffFffFffFf
.........fFfFffffffFfFf
.........FfFfFfffFfFffF
""")))

# ---------------------------------------------------------------- Daisy Domergue (black eye, dark hair, no hat)
char('daisy', nohat=True, torso=DRESS, lower='dress',
     legend=dict(**SKIN_PALE, h='hb1', H='hb2', g='hb3', D='pl1', d='pl2', s='pl3', S='pl4', L='ink', l='pl1',
                 R='lb1', r='lb2', u='lb3', v='pl3', V='rd2', x='rd2', P='pt1', p='pt2'),
     head=dict(se="""
..
..
..
..
..
.............hhhhhh
...........hhHHhhhhh
..........hHHghhhhhhh
.........hhHhhhhhhhhhh
.........hhh2222hhhhhh
.........hhh2333333hh
.........hh2v3e33e3hh
.........hh2vv3334433
.........hhh23333x33h
.........hhhh233333hh
.........hhhh.2222hhh
..........hhh.2223.hh
..........hh..1111..h
""", ne="""
..
..
..
..
..
.............hhhhhh
...........hhHHhhhhh
..........hHHghhhhhhh
.........hhHhhhhhhhhhh
.........hhhhhhhhhhhhh
.........hhhhhhhhhhh32
.........hhhhhhhhhhhh3
.........hhhhhhhhhhhh2
.........hhhhhhhhhhhh.
.........hhhhhhhhhhhh.
..........hhhhhhhhhh2.
..........hhhhhhhhhh..
...........hhhhhhhh...
"""))

# ---------------------------------------------------------------- Chris Mannix
char('mannix', torso=COAT, lower='coat',
     legend=dict(K='lb1', k='lb2', j='lb3', Y='hb1', **SKIN_TAN, h='hr2', H='hr3', b='hr2', B='hr3', g='hr4',
                 N='cg1', n='cg2', c='cg3', C='cg4', Q='rd1', q='rd2', w='rd3', z='gd2',
                 P='lb1', p='lb2', R='lb1', r='lb2', u='lb3', L='lb2', l='lb3', m='mt1', M='mt2'),
     head=dict(se="""
..
..
..
.............jkkkkK
............jjkkkkKK
............jkkkkkkK
...........jjYYYYYYKK
.......jj.jkkkkkkkkKK.KK
.......jkkkkkkkkkkkkkkKKK
........jkkkkkkkkkkkkkKK
.........KKKKKKKKKKKKKK
..........hh222222222
..........hh2333e34e3
..........hh2334334433
...........h2333333332
............12331133b
.............b2222bb
..............bbbb
""", ne="""
..
..
..
.............jkkkkK
............jjkkkkKK
............jkkkkkkK
...........jjYYYYYYKK
.......jj.jkkkkkkkkKK.KK
.......jkkkkkkkkkkkkkkKKK
........jkkkkkkkkkkkkkKK
.........KKKKKKKKKKKKKK
..........hhhhhhhhhhh2
..........hhHhhhhhhh32
..........hhhHhhhhhhh2
...........hhhhhhhhh2
............hhhhhhh1
.............111111
"""),
     over=dict(se=over_rows(17, """
............QqqwwqQ
.............QqwqQ
..............QqQ
"""), ne=over_rows(17, """
............QqqqqqQ
""")))

# ---------------------------------------------------------------- Bob (serape, flat wide hat)
char('bob', torso=SUIT, lower='suit',
     legend=dict(K='hk1', k='hk2', j='hk3', Y='rd2', **SKIN_TAN, h='hb1', H='hb2', b='hb1', B='hb2', g='hb3',
                 N='hb1', n='hb2', c='hb3', C='hb4', z='gd2', S='rd2', s='rd3', G='gd2', a='gn3', A='cr2',
                 P='pt2', p='pt3', R='lb1', r='lb2', u='lb3', L='lb2', l='lb3', m='mt1', M='mt2'),
     head=dict(se="""
..
..
..
..
.............jkkkkkK
............jkkkkkkkK
............jYYYYYYYK
.....jjkkkkkkkkkkkkkkkkkKK
....jkkkkkkkkkkkkkkkkkkkkKK
.....KKKKKKKKKKKKKKKKKKKKK
..
...........h122222222
...........h23e334e3
...........h233334433
...........h2bBBBBBb2
............1bb33bb2
.............22332
..............222
""", ne="""
..
..
..
..
.............jkkkkkK
............jkkkkkkkK
............jYYYYYYYK
.....jjkkkkkkkkkkkkkkkkkKK
....jkkkkkkkkkkkkkkkkkkkkKK
.....KKKKKKKKKKKKKKKKKKKKK
..
...........hhhhhhhhhh2
...........hHhhhhhhh32
...........hhhhhhhhhb2
............hhhhhhhh2
.............111111
"""),
     over=dict(se=over_rows(17, """
..........SSsSSsSSsSSs
.........GAAaAAGAAaAAG
........SSsSSsSSsSSsSSs
.........GGaGGGGaGGGGa
........ssSssSssSssSssS
.........AAGAAaAAGAAa
.........SsSSsSSsSSsS
..........GaGGGaGGGa
"""), ne=over_rows(17, """
..........sSSsSSsSSsSS
.........GAAaAAGAAaAAG
........sSSsSSsSSsSSsSS
.........aGGGGaGGGGaGG
........SssSssSssSssSss
.........aAAGAAaAAGAA
.........SsSSsSSsSSsS
..........aGGGaGGGaG
""")))

# ---------------------------------------------------------------- Oswaldo Mobray (bowler, tweed suit, cravat)
char('mobray', torso=SUIT, lower='suit',
     legend=dict(K='hk1', k='hk2', j='hk3', Y='hk1', **SKIN_PALE, h='hb3', H='hb4', b='hb3', B='hb4',
                 N='wd2', n='wd3', c='wd4', C='wd5', z='gd3', V='cr3', v='cr2', Q='rd2', q='rd3',
                 P='pt2', p='pt3', R='hk1', r='hk2', u='hk3', L='wd2', l='wd3', m='mt1', M='mt2'),
     head=dict(se="""
..
..
..
..
.............jkkkkK
............jjkkkkkK
............jkkkkkkK
............jkkkkkkK
..........jjYYYYYYYYKK
..........KKKKKKKKKKKK
...........h222222222
...........h2333e34e3
...........H2334334433
...........h2333333332
............12333113
.............2333332
..............2222
""", ne="""
..
..
..
..
.............jkkkkK
............jjkkkkkK
............jkkkkkkK
............jkkkkkkK
..........jjYYYYYYYYKK
..........KKKKKKKKKKKK
...........hhhhhhhhh2
...........hHhhhhhh32
...........hhhhhhhhh2
............hhhhhhh2
.............111111
"""),
     over=dict(se=over_rows(17, """
.............VQqqQV
..............QqQ
..............VVv
...............v
"""), ne=over_rows(17, """
.............vvvvvv
""")))

# ---------------------------------------------------------------- Joe Gage (black hat, stubble, sheepskin coat)
char('gage', torso=COAT, lower='coat',
     legend=dict(K='hk1', k='hk2', j='hk3', Y='hk1', **SKIN_TAN, h='hb2', H='hb3', b='hb2', B='hb3',
                 N='lb2', n='lb3', c='lb4', C='st4', F='cr1', f='cr2', g='cr3', z='gd2',
                 P='pt1', p='pt2', R='lb1', r='lb2', u='lb3', L='lb1', l='lb2', m='mt1', M='mt2'),
     head=dict(se="""
..
..
.............jkkkkK
............jkkKkkkK
............jkkkkkkK
...........jjkkKkkkKK
...........jkkkkkkkkK
........jkkYYYYYYYYYYKKK
.......jjkkkkkkkkkkkkkKKK
.......jkkkkkkkkkkkkkkkKK
........KKKKKKKKKKKKKKKK
...........h122222222
...........h23e33e3333
...........h2334334433
...........hb233333332
............bb2b11bb
.............bbbbbbb
""", ne=HAT_NE.replace('Y', 'K') + """
...........hhhhhhhhh2
...........hHhhhhhhh32
...........hhhhhhhhhb2
............hhhhhhhhb
.............1111111
"""),
     over=dict(se=over_rows(17, """
..........FfggffgfgfF
.........FfggfffgffgfF
.........Ff.........fF
"""), ne=over_rows(17, """
..........FfgggffgggfF
.........FffgffgffgfffF
""")))

# ---------------------------------------------------------------- General Sandy Smithers (seated, white hair and beard, grey, blanket)
char('smithers', torso=COAT, lower='coat', sit='coat', sit_only=True, dead='coat', nohat=True,
     legend=dict(**SKIN_PALE, h='gy3', H='gy4', b='gy3', B='gy4', g='white',
                 N='cg1', n='cg2', c='cg3', C='cg4', z='gd3', L='rd2', l='rd3',
                 P='pt2', p='pt3', R='lb1', r='lb2', u='lb3', m='cg2', M='cg3'),
     head=dict(se="""
..
..
..
..
..
..
.............HHHHHH
...........HHhhhhhHH
..........HHh222222hH
..........Hh23333333h
..........h2333e33e3
..........h22334334433
..........hgBBBgBBBgb2
...........gBBgBBBgBb
...........BgBBgBBgB
............bgBBBgB
.............bbBbb
..............bB
""", ne="""
..
..
..
..
..
..
.............HHHHHH
...........HHhhhhhHH
..........HHhhhhhhhH
..........Hhhhhhhhhh2
..........hhhhhhhhhh32
..........hhhhhhhhhh32
..........hhhhhhhhhbB
...........hhhhhhhBg
............11111bB
"""),
     over=dict(se=over_rows(17, """
..
..
..
..
..
..
..
..
..
..
..........LlLlLlLlLlL
.........LlLlLlLlLlLlL
"""), ne=None))

# ---------------------------------------------------------------- O.B. Jackson (driver: fur trapper hat, big beard, buffalo coat)
char('ob', torso=FUR, lower='coat',
     legend=dict(K='fr1', k='fr3', j='fr4', **SKIN_PALE, h='hb2', H='hb3', b='hb3', B='hb4', g='cr1',
                 N='hk1', n='hk2', c='hk3', C='gy2', F='fr2', f='fr3', z='gd2',
                 P='pt2', p='pt3', R='lb1', r='lb2', u='lb3', L='lb2', l='lb3', m='mt1', M='mt2'),
     head=dict(se="""
..
..
..
..
.............jjkkkk
...........jjjkkkkkkK
..........jjkkkkkkkkkK
..........jkkkkkkkkkkK
..........jkkkkkkkkkkKK
.........kjkkkkkkkkkkKK
.........kkK222222222KK
.........kkK2333e33e3
.........kk2B3334334433
.........kkbbBBBBBBBBBb
..........bbBBgBBBgBBb
...........bbBBBgBBBb
............bbBBBBbb
..............bbbb
""", ne="""
..
..
..
..
.............jjkkkk
...........jjjkkkkkkK
..........jjkkkkkkkkkK
..........jkkkkkkkkkkK
..........jkkkkkkkkkkKK
.........kjkkkkkkkkkkKK
.........kkKkkkkkkkkkKK
.........kkKkkkkkkkk2K
..........kkKKKKKKKK32
...........hhhhhhhhhbB
............hhhhhhhbB
.............111111
"""))

# ---------------------------------------------------------------- Jody Domergue (no hat, dark slick hair, sharp black suit)
char('jody', nohat=True, torso=SUIT, lower='suit',
     legend=dict(**SKIN_PALE, h='hb1', H='hb2', b='hb2',
                 N='hk1', n='hk2', c='hk3', C='gy2', z='gd3', V='cr3', v='cr2',
                 P='hk1', p='hk2', R='ink', r='hk1', u='hk2', L='hk1', l='hk2', m='mt2', M='mt3'),
     head=dict(se="""
..
..
..
..
..
.............hhhhhh
...........hhHHHhhhh
..........hhHhhhhhhhh
..........hhhhhhhhhhh
..........hhh22222222
..........hh2333e33e3
..........hh23334334433
..........hh2333333332
...........h1233113332
............b2333332
.............222222
""", ne="""
..
..
..
..
..
.............hhhhhh
...........hhHHHhhhh
..........hhHhhhhhhhh
..........hhhhhhhhhhh
..........hhhhhhhhhhh2
..........hhhhhhhhhh32
..........hhhhhhhhhhh2
...........hhhhhhhhh2
............hhhhhhh1
.............111111
"""),
     over=dict(se=over_rows(17, """
.............VVvVV
..............Vv
"""), ne=None))

# ---------------------------------------------------------------- Minnie Mink (head wrap, apron over a blue dress)
APRON_SE = over_rows(26, """
..........cCCCCCCCCc
..........cCCCCCCCCCc
..........cCCCCCCCCCc
.........cCCCCCCCCCCc
.........cCCCCCCCCCCc
.........cCCCCCCCCCCCc
.........cCCCCCCCCCCCc
.........cCCCCCCCCCCCc
........cCCCCCCCCCCCCc
........ccCCCCCCCCCCcc
........ccccccccccccc
""")
char('minnie', nohat=True, torso=DRESS, lower='dress',
     legend=dict(**SKIN_DARK, K='rd2', k='rd3', j='rd4', h='hb1', D='nv1', d='nv2', s='nv3', S='nv4', L='cr1', l='cr2',
                 c='cr2', C='cr3', R='lb1', r='lb2', u='lb3'),
     head=dict(se="""
..
..
..
..
.............kkkkkK
...........jkkkkkkkK
..........jjkkkkkkkkK
..........jkkkKkkkkkkK
.........jjkkkkkkkkkkK
.........kkk11111111K
.........kk12333e33e3
..........h12333433443
..........h23333333332
...........1233113332
............123333332
.............2222222
""", ne="""
..
..
..
..
.............kkkkkK
...........jkkkkkkkK
..........jjkkkkkkkkK
..........jkkkKkkkkkkK
.........jjkkkkkkkkkkK
.........kkkkkkkkkkkKK
.........kkkkkkkkkkkK32
..........kKkkkkkkkkK2
..........hhhhhhhhhh2
...........hhhhhhhh2
............1111111
"""),
     over=dict(se=APRON_SE, ne=None))

# ---------------------------------------------------------------- Sweet Dave (bald, grey beard, shirtsleeves + suspenders)
char('dave', nohat=True, torso=SUIT, lower='suit',
     legend=dict(**SKIN_DARK, h='sd2', H='sd3', b='gy2', B='gy3', g='gy4',
                 N='cr1', n='cr2', c='cr3', C='sn5', z='lb3', V='rd2', v='rd3',
                 P='lb1', p='lb2', R='lb1', r='lb2', u='lb3', L='lb2', l='lb3', m='mt1', M='mt2'),
     head=dict(se="""
..
..
..
..
..
..
.............333333
...........33344443
..........2333344443
..........2233333333
..........1233e33e33
..........12334334433
..........1b23333332b
...........bBBBgBBBb
............bBgBBBgb
.............bBBBBb
..............bbb
""", ne="""
..
..
..
..
..
..
.............333333
...........33344443
..........2333333332
..........2233333333
..........12333333332
..........1233333332b
..........12333333332
...........12222222bb
............111111b
"""),
     over=dict(se=over_rows(18, """
..........VV......VV
..........vV......vV
...........V......V
...........vV....Vv
...........VV....VV
............V....V
............vV..Vv
"""), ne=over_rows(18, """
...........V......V
...........vV....Vv
............V....V
.............VVVV
..............VV
..............VV
..............VV
""")))

# ---------------------------------------------------------------- Six-Horse Judy (cowgirl hat, blonde braid, red neckerchief, driving coat)
char('judy', torso=COAT, lower='coat',
     legend=dict(K='lb2', k='lb3', j='lb4', Y='rd2', **SKIN_PALE, h='gd2', H='gd3', g='gd4', Q='rd2', q='rd3', w='rd4',
                 N='gn1', n='gn2', c='gn3', C='gn4', z='gd3',
                 P='lb2', p='lb3', R='lb1', r='lb2', u='lb3', L='lb1', l='lb2', m='mt1', M='mt2'),
     head=dict(se="""
..
..
..
.............jkkkkK
............jjkkkkKK
............jkkkkkkK
...........jYYYYYYYYK
........jjkkkkkkkkkkkkKK
.......jkkkkkkkkkkkkkkkkK
........KKKKKKKKKKKKKKKK
..........hHh222222222
..........hhH2333e33e3
..........hh23334334433
..........gh2333333332
..........hH.123113332
..........hh..2333332
..........gH...22222
..........hh
""", ne="""
..
..
..
.............jkkkkK
............jjkkkkKK
............jkkkkkkK
...........jYYYYYYYYK
........jjkkkkkkkkkkkkKK
.......jkkkkkkkkkkkkkkkkK
........KKKKKKKKKKKKKKKK
..........hhHhhhhhhhhh2
..........hHhhhhhhhhh32
..........hhhhhhhhhhhh2
...........hhhhhhhhhh2
.............hHhhhh11
..............hHh
..............hhH
..............gHh
"""),
     over=dict(se=over_rows(17, """
............QqqwwqQ
.............QqwqQ
"""), ne=over_rows(17, """
............QqqqqqQ
""")))

# ---------------------------------------------------------------- Gemma (bun, white blouse, green skirt)
char('gemma', nohat=True, torso=DRESS, lower='dress',
     legend=dict(**SKIN_TAN, h='hb2', H='hb3', g='hb4', D='gn1', d='gn2', s='gn3', S='gn4', L='lb2', l='lb3',
                 R='lb1', r='lb2', u='lb3', c='cr2', C='cr3'),
     head=dict(se="""
..
..
..
..
.............hhh
............hhHhh
.............hhhhhh
...........hhHHHhhhh
..........hhHhhhhhhhh
..........hhhh2222hhh
..........hhh2333e33e
..........hh23334334433
..........hh2333333332
...........h1233113332
............12333332
.............222222
""", ne="""
..
..
..
..
.............hhh
............hhHhh
.............hhhhhh
...........hhHHHhhhh
..........hhHhhhhhhhh
..........hhhhhhhhhhh2
..........hhhhhhhhhh32
..........hhhhhhhhhhh2
...........hhhhhhhhh2
............hhhhhhh1
.............111111
"""),
     over=dict(se=over_rows(17, """
............CCcCCc
...........CCCcCCCc
...........CCcCCCcC
"""), ne=over_rows(17, """
............cCCcCC
...........cCCCcCCC
""")))

# ---------------------------------------------------------------- Ed (Minnie's regular: grey bowler-ish hat, long grey coat)  and Charly (flat cap)
char('ed', torso=COAT, lower='coat',
     legend=dict(K='gy1', k='gy2', j='gy3', Y='hk1', **SKIN_PALE, h='gy2', H='gy3', b='gy2', B='gy3', g='gy4',
                 N='hk1', n='hk2', c='hk3', C='gy2', z='gd2',
                 P='pt2', p='pt3', R='lb1', r='lb2', u='lb3', L='lb1', l='lb2', m='mt1', M='mt2'),
     head=dict(se=HAT_SE + """
...........h122222222
...........h2333e33e3
...........h2334334433
...........hbBBBBBBBb
............bBBgBBgB
.............bBBBBb
""", ne=HAT_NE + """
...........hhhhhhhhh2
...........hHhhhhhhh32
...........hhhhhhhhhb2
............hhhhhhhhb
.............1111111
"""))
char('charly', torso=COAT, lower='coat',
     legend=dict(K='lb1', k='lb2', j='lb3', **SKIN_TAN, h='hb3', H='hb4', b='hb3', B='hb4',
                 N='rd1', n='rd2', c='rd3', C='rd4', z='gd2', Q='cr2', q='cr3', w='sn5',
                 P='lb1', p='lb2', R='lb1', r='lb2', u='lb3', L='lb1', l='lb2', m='mt1', M='mt2'),
     head=dict(se="""
..
..
..
..
..
..
.............jkkkkkK
...........jjkkkkkkkkK
..........jkkkkkkkkkkkkK
..........KKKKKKKKKKKKKKK
..........hh222222222
..........hh2333e33e3
..........hh2334334433
...........h2333333332
............12331133b
.............b2222bb
""", ne="""
..
..
..
..
..
..
.............jkkkkkK
...........jjkkkkkkkkK
..........jkkkkkkkkkkkkK
..........KKKKKKKKKKKKKKK
..........hhhhhhhhhhh2
..........hhHhhhhhhh32
...........hhhhhhhhh2
............hhhhhhh1
.............111111
"""),
     over=dict(se=over_rows(17, """
............QqqwwqQ
"""), ne=None))
