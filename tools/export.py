"""export — turn a rendered iso Scene into a JS room definition (data-URI images + collision + spots)."""
import base64, io, json
import numpy as np
from PIL import Image


def png_uri(arr_or_img):
    im = arr_or_img if isinstance(arr_or_img, Image.Image) else Image.fromarray(arr_or_img, 'RGBA')
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


def depth_img(depth):
    d = np.clip((depth + 64) * 256, 0, 65535).astype(np.uint32)
    a = np.where(depth > -900, 255, 0).astype(np.uint8)
    return Image.fromarray(np.stack([(d >> 8).astype(np.uint8), (d & 255).astype(np.uint8), np.zeros_like(a), a], 2), 'RGBA')


def collision(bounds, solids, res=4, circles=()):
    """bounds = walkable rectangle (x0, y0, x1, y1); solids = list of rects; circles = (cx, cy, r)."""
    x0, y0, x1, y1 = bounds
    W, H = int(np.ceil(x1 * res)), int(np.ceil(y1 * res))
    g = np.ones((H, W), np.uint8)
    for j in range(H):
        for i in range(W):
            cx, cy = (i + 0.5) / res, (j + 0.5) / res
            if x0 <= cx <= x1 and y0 <= cy <= y1: g[j, i] = 0
    for (a, b, c, d) in solids:
        for j in range(max(0, int(b * res)), min(H, int(np.ceil(d * res)))):
            for i in range(max(0, int(a * res)), min(W, int(np.ceil(c * res)))):
                g[j, i] = 1
    for (cx, cy, r) in circles:
        for j in range(H):
            for i in range(W):
                if (((i + 0.5) / res - cx) ** 2 + ((j + 0.5) / res - cy) ** 2) < r * r: g[j, i] = 1
    return dict(res=res, w=W, h=H, data=''.join(str(v) for v in g.ravel()))


def room_js(name, S, coll, spots, lights=(), grade=(256, 256, 256), extra=None, void=None):
    d = dict(w=S.w, h=S.h, ox=S.OX, oy=S.OY, coll=coll, spots=spots,
             lights=[dict(x=l[0], y=l[1], r=l[2], col=l[3], flicker=l[4] if len(l) > 4 else 0) for l in lights],
             grade=list(grade))
    if void is not None: d['void'] = void
    if extra: d.update(extra)
    body = json.dumps(d)[:-1]
    return (f"Sprout.iso.defRoom({json.dumps(name)}, {body}, \"color\": \"{png_uri(S.img)}\", "
            f"\"depth\": \"{png_uri(depth_img(S.depth))}\"}});\n")
