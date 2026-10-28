// The Hateful Eight — boot. ?ch=N jumps straight to a chapter; ?auto plays itself (for testing).
(function () {
'use strict';
const S = Sprout, iso = S.iso;
S.boot(ready => iso.load(() => {
  const ch = +S.params.get('ch');
  if (ch && S.CH[ch]) { S.load(); S.state.flags = S.state.flags || {}; S.h8.chapter(ch); }
  else S.go(S.title);
  // ?eval=js runs before ?skip, so a test can stage a scene and then fast-forward into it
  if (S.params.get('eval')) try { (0, eval)(S.params.get('eval')); } catch (e) { console.error('eval: ' + e); }
  ready();
}));
// test bot: taps A every few frames so dialogue moves on
if (S.auto) {
  const up = S.world.update;
  S.world.update = function () { S.input.bot = { held: new Set(S.frame % 8 < 2 ? ['a'] : []) }; up(); };
}
})();
