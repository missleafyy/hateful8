// Title screen: the snowy road at the crucifix, a coach crawling past, the menu.
(function () {
'use strict';
const S = Sprout, iso = S.iso, h8 = S.h8;
const T = S.title = {
  menu: [], sel: 0, sub: null, t: 0,
  enter() {
    S.tasks = []; S.ui.box = null; S.ui.card = null; S.ui.narr = null; S.ui.bars = 0; S.ui.title = null;
    h8.room('road', { snow: 1.3, wind: 0.9, music: 'main' });
    const [cx, cy] = iso.room.spots.cross;
    iso.look(cx + 3.2, cy + 2.6, 0.9, true);
    T.coach = h8.coach(-10, iso.room.spots.coach_stop[1], { loaded: true });
    const ob = h8.spawn('ob', 0, 0, 'se'); T.coach.ride(ob, ...h8.DRIVER);
    T.coach.solid(false);
    T.t = 0; T.sub = null; T.sel = 0;
    S.load();
    S.state.flags = S.state.flags || {};
    T.build();
    S.run(S.fadeIn(60), { block: false });
  },
  build() {
    T.menu = [['New Game', () => { S.state = { flags: {}, max: S.state.max || 1 }; h8.chapter(1); }]];
    if (S.hasSave() && S.state.chapter) T.menu.push([`Continue  (Chapter ${S.state.chapter})`, () => h8.chapter(S.state.chapter)]);
    if ((S.state.max || 1) > 1) T.menu.push(['Chapters', () => { T.sub = 0; }]);
    T.menu.push(['Controls', () => S.pause.showControls()]);
    T.menu.push(['Fullscreen', () => S.fullscreen()]);
  },
  update() {
    T.t++;
    if (S.auto) S.input.bot = { held: new Set(T.t % 30 === 20 ? ['a'] : []) };
    // the coach keeps rolling by, then loops round
    const c = T.coach;
    c.x += 0.022; if (c.x > 34) c.x = -10;
    c.body.dsFrame = Math.floor(c.x * 6) % 3; c.horses.forEach(h => { h.anim = 'walk'; });
    c.place();
    iso.update(); h8.update();
    if (T.t < 50 || S.busy() || S.pause.open) return;
    const inp = S.input;
    if (T.sub != null) {
      const n = S.state.max || 1;
      if (inp.repeat('up')) { T.sub = (T.sub + n - 1) % n; S.sfx('cursor'); }
      if (inp.repeat('down')) { T.sub = (T.sub + 1) % n; S.sfx('cursor'); }
      if (inp.pressed('b')) { inp.consume('b'); T.sub = null; S.sfx('cursor'); }
      else if (inp.pressed('a')) { inp.consume('a'); S.sfx('select'); const k = T.sub + 1; S.state.flags = {}; h8.chapter(k); }
      return;
    }
    if (inp.repeat('up')) { T.sel = (T.sel + T.menu.length - 1) % T.menu.length; S.sfx('cursor'); }
    if (inp.repeat('down')) { T.sel = (T.sel + 1) % T.menu.length; S.sfx('cursor'); }
    const num = T.menu.findIndex((_, i) => inp.pressed('n' + (i + 1)));
    if (num >= 0) T.sel = num;
    if (inp.pressed('a') || inp.pressed('start') || num >= 0) { inp.consume('a', 'start'); S.sfx('select'); T.menu[T.sel][1](); }
  },
  draw(g) {
    iso.draw(g); h8.draw(g);
    // vignette bands top and bottom
    g.alpha(0.55, () => { g.rect(0, 0, S.W, 70, 'night'); g.rect(0, S.H - 86, S.W, 86, 'night'); });
    g.alpha(0.3, () => { g.rect(0, 70, S.W, 6, 'night'); g.rect(0, S.H - 92, S.W, 6, 'night'); });
    const a = Math.min(1, T.t / 60);
    g.alpha(a, () => {
      g.text("QUENTIN TARANTINO'S", S.W / 2, 14, { align: 'center', color: 'creamdim' });
      S.bigText(g, 'THE HATEFUL EIGHT', S.W / 2, 28, 3, 'blood', 'night');
      g.text('a fan-made pixel game', S.W / 2, 56, { align: 'center', color: 'creamdim' });
    });
    if (T.t < 50) return;
    const y0 = S.H - 76;
    if (T.sub != null) {
      const titles = Object.keys(S.CH).map(k => S.CH[k].title);
      for (let i = 0; i < (S.state.max || 1); i++) {
        const sel = i === T.sub;
        g.text(`${i + 1}. ${titles[i]}`, S.W / 2, y0 + i * 11 - 4, { align: 'center', color: sel ? 'gold' : 'creamdim' });
      }
      S.prompt(g, 'b', 'Back', S.W - 40, S.H - 16);
      S.prompt(g, 'a', 'Play', 40, S.H - 16);
      return;
    }
    T.menu.forEach(([label], i) => {
      const sel = i === T.sel;
      g.text(label, S.W / 2, y0 + i * 14, { align: 'center', color: sel ? 'gold' : 'creamdim' });
      if (sel) {
        const w = S.font.width(label);
        g.text('>', S.W / 2 - w / 2 - 10 + (Math.floor(S.frame / 15) % 2), y0 + i * 14, { color: 'blood' });
      }
    });
    S.prompt(g, 'a', 'Select', S.W - 40, S.H - 16);
  },
};
})();
