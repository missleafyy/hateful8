#!/bin/sh
# Bundle the game into one self-contained file to share: dist/hateful-eight.html.
# Every <script src> in index.html is inlined (room art is already embedded as data URLs).
set -e
cd "$(dirname "$0")/.."
mkdir -p dist
python3 - <<'PY'
import re
html = open('index.html').read()
def inline(m):
    js = open(m.group(1)).read().replace('</script', '<\\/script')
    return '<script>\n' + js + '\n</script>'
out = re.sub(r'<script src="([^"]+)"></script>', inline, html)
assert '<script src=' not in out
open('dist/hateful-eight.html', 'w').write(out)
PY
ls -la dist/hateful-eight.html
