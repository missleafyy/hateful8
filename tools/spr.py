"""spr — hand-drawn text-grid sprites for The Hateful Eight.

Grids are written as rows of characters, '.' = clear. Rows are padded on the right to the canvas width,
so only the left offset needs counting. Fills are drawn without an outline; `ink()` adds the 1px
plum outline around the silhouette at the end (like Leafhollow's sprites).
"""
import os, json
from PIL import Image, ImageDraw
from pal import PAL
from pxgen import blank, copy, stamp, outline, flip

RULER = '0123456789abcdefghijklmnopqrstuv'

def G(text, w=32, h=None):
    rows = [r for r in text.strip('\n').split('\n')]
    rows = [r.split('|')[1] if '|' in r else r for r in rows]     # allow "r12|....." labels
    g = [list(r.rstrip().ljust(w, '.')[:w].replace(' ', '.')) for r in rows]
    if h:
        while len(g) < h: g.append(['.'] * w)
    for i, r in enumerate(rows):
        if len(r.rstrip()) > w: print(f'WARN row {i} too wide ({len(r.rstrip())})')
    return g

def place(dst, src, x=0, y=0):
    stamp(dst, src, x, y); return dst

def shift(g, dx, dy):
    H, W = len(g), len(g[0]); n = blank(W, H)
    for y in range(H):
        for x in range(W):
            sx, sy = x - dx, y - dy
            if 0 <= sx < W and 0 <= sy < H: n[y][x] = g[sy][sx]
    return n

def ink(g, c='o'):
    return outline(copy(g), c)

def rgba(hexc):
    h = hexc.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) + (255,)

def to_img(g, legend):
    H, W = len(g), len(g[0]); im = Image.new('RGBA', (W, H))
    p = im.load()
    for y in range(H):
        for x in range(W):
            c = g[y][x]
            if c == '.': continue
            col = legend.get(c)
            if col is None: p[x, y] = (255, 0, 255, 255); continue
            p[x, y] = rgba(PAL.get(col, col))
    return im

def sheet(frames, legend, out, k=6, bg=(118, 104, 96), cols=12, labels=True):
    """frames: list of (label, grid). Writes a zoomed contact sheet + a 1x strip next to it."""
    w, h = len(frames[0][1][0]), len(frames[0][1])
    cols = min(cols, len(frames)); rows = (len(frames) + cols - 1) // cols
    pad, lab = 6, 12 if labels else 0
    S = Image.new('RGBA', (pad + cols * (w * k + pad), pad + rows * (h * k + pad + lab) + h * 2 + pad * 2), bg + (255,))
    d = ImageDraw.Draw(S)
    for i, (name, g) in enumerate(frames):
        im = to_img(g, legend).resize((w * k, h * k), Image.NEAREST)
        x0, y0 = pad + (i % cols) * (w * k + pad), pad + (i // cols) * (h * k + pad + lab)
        S.alpha_composite(im, (x0, y0))
        if labels: d.text((x0, y0 + h * k), name, fill=(240, 230, 220))
    # 1x and 2x strips at the bottom on snow and on wood
    yb = pad + rows * (h * k + pad + lab)
    for i, (name, g) in enumerate(frames[:cols]):
        im = to_img(g, legend)
        b = Image.new('RGBA', (w, h), (219, 227, 243, 255)); b.alpha_composite(im)
        S.paste(b, (pad + i * (w + 2), yb))
        b2 = Image.new('RGBA', (w * 2, h * 2), (68, 40, 30, 255)); b2.alpha_composite(im.resize((w*2, h*2), Image.NEAREST))
        S.paste(b2, (pad + cols * (w + 2) + 20 + i * (w * 2 + 2), yb - h))
    S.save(out)

def gif(frames, legend, out, ms, k=6, bg=(118, 104, 96)):
    ims = []
    for g in frames:
        im = to_img(g, legend); b = Image.new('RGBA', im.size, bg + (255,)); b.alpha_composite(im)
        ims.append(b.resize((im.width * k, im.height * k), Image.NEAREST).convert('RGB'))
    ms = ms if isinstance(ms, list) else [ms] * len(ims)
    ims[0].save(out, save_all=True, append_images=ims[1:], duration=ms, loop=0)

def js_sprite(name, w, h, origin, legend, frames):
    """frames: dict name -> grid. Returns a JS S.sprite(...) call using engine/art.js's format."""
    out = [f"S.sprite('{name}', {{ w: {w}, h: {h}, origin: [{origin[0]}, {origin[1]}],",
           '  legend: ' + json.dumps(legend) + ',', '  frames: {']
    for fn, g in frames.items():
        out.append(f"    {json.dumps(fn)}: [")
        out += [f"      '{''.join(r)}'," for r in g]
        out.append('    ],')
    out.append('  } });')
    return '\n'.join(out)
