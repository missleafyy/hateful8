import sys; sys.path.insert(0, '/home/leafy/hateful8/tools')
from iso import *
WOOD = ['wd1', 'wd2', 'wd3', 'wd4', 'wd5', 'wd6']
LOG = ['wd1', 'wd2', 'wd3', 'wd4', 'wd5']
IRON = ['ink', 'st_1', 'st_2', 'st_3', 'st_4']
S = Scene((0, 0, 12, 10), zmax=3.2, lights=[(6.5, 5.5, 0.6, 3.2, 1.6)])
S.add(Box(0, 0, -0.2, 12, 10, 0, ['wd1','wd2','wd3','wd4'], tex=tex_planks('x', 0.25, levels=(2,2,1)), rim=False, outline=False))
S.add(Box(-0.4, 0, 0, 0, 10, 3, LOG, tex=tex_logs(levels=(2, 2, 2))))            # left back wall
S.add(Box(0, -0.4, 0, 12, 0, 3, LOG, tex=tex_logs(levels=(3, 3, 3))))           # right back wall
S.add(Cyl(6.5, 5.5, 0.45, 0, 1.0, IRON, tex=tex_rough()))                       # stove
S.add(Cyl(6.5, 5.5, 0.12, 1.0, 3.2, IRON))                                       # pipe
S.add(Box(1, 2, 0, 1.8, 7, 1.1, WOOD, tex=tex_planks('y', 0.2)))                 # counter
S.add(Box(8, 6, 0.75, 10.5, 7.4, 0.85, WOOD, tex=tex_planks('x', 0.2)))          # table top
for (x, y) in ((8.1, 6.1), (10.3, 6.1), (8.1, 7.2), (10.3, 7.2)):
    S.add(Box(x, y, 0, x + 0.12, y + 0.12, 0.75, WOOD))
S.add(Cyl(9, 6.7, 0.18, 0.85, 1.1, IRON))                                        # stew pot
S.render()
S.save('/home/leafy/hateful8/art/draft/room_test.png', 2)
print(S.w, S.h)
