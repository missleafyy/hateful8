import sys, os; sys.path.insert(0, os.path.dirname(__file__))
import cast as C, cast_defs
from spr import *
frames = []
legend = {}
pick = sys.argv[1].split(',') if len(sys.argv) > 1 else ['se_idle0', 'ne_idle0', 'se_walk0', 'se_sit0']
from PIL import Image
ims = []
for name, d in C.CHARS.items():
    fr = C.build(name, d); L = dict(o='ink', e='ink'); L.update(d['legend'])
    for k in pick:
        if k in fr: ims.append((name + ' ' + k, to_img(fr[k], L)))
k = 4; cols = 8
W = cols * (32 * k + 8) + 8; rows = (len(ims) + cols - 1) // cols
S = Image.new('RGBA', (W, rows * (48 * k + 20) + 8), (68, 40, 30, 255))
from PIL import ImageDraw
d = ImageDraw.Draw(S)
for i, (n, im) in enumerate(ims):
    x, y = 8 + (i % cols) * (32 * k + 8), 8 + (i // cols) * (48 * k + 20)
    S.alpha_composite(im.resize((32 * k, 48 * k), Image.NEAREST), (x, y)); d.text((x, y + 48 * k + 2), n, fill=(230, 220, 200))
S.save('/home/leafy/hateful8/shots/roster.png')
