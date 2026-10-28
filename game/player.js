// Player control: 8-way movement in screen space mapped onto the iso grid, talk/examine prompts.
(function () {
'use strict';
const S = Sprout, iso = S.iso;

const P = S.player = {
  a: null, enabled: true, speed: 1.15,
  spawn(a) { P.a = a; a.solid = true; iso.follow(a, true); },
  update() {
    const a = P.a; if (!a) return;
    if (!P.enabled || S.busy()) { if (a.anim === 'walk' && !a.scripted) a.anim = 'idle'; return; }
    const v = S.input.vec();
    const mag = Math.hypot(v.x, v.y);
    if (mag > 0.05) {
      // screen-space speed (vertical a bit slower, like walking "into" the picture) -> world
      const run = S.input.held('run');
      a.run = run;
      const sp = P.speed * (run ? 1.7 : 1);
      const ux = v.x * sp, uy = v.y * sp * 0.78;
      const dx = (ux / 16 + uy / 8) / 2, dy = (uy / 8 - ux / 16) / 2;
      a.facing = iso.facingFrom(dx, dy, a.facing);
      if (iso.move(a, dx, dy)) { if (a.anim !== 'walk') { a.anim = 'walk'; a.t = 0; } }
      else a.anim = 'idle';
    } else if (a.anim === 'walk') { a.anim = 'idle'; a.t = 0; a.run = false; }
    const h = iso.nearestHot(a);
    P.hot = h;
    if (h && S.input.pressed('a')) {
      S.input.consume('a');
      S.state.flags.uses = (S.state.flags.uses || 0) + 1;
      a.anim = 'idle';
      if (h.actor) { iso.face(a, h.actor); }
      else iso.face(a, h);
      S.run(h.fn);
    }
  },
  drawPrompt(g) {
    const h = P.hot; if (!h || S.busy() || !P.enabled) return;
    const hx = h.actor ? h.actor.x : h.x, hy = h.actor ? h.actor.y : h.y;
    const [x, y] = iso.screenOf(hx, hy, h.z != null ? h.z : (h.actor ? 2.4 : 1.4));
    S.prompt(g, 'a', h.label || 'Look', x, y - 14 + (Math.floor(S.frame / 30) % 2));
  },
};
})();
