// Hateful Eight UI: dialogue box (leather panel + name tag + speaker marker), choices, paper cards,
// chapter title cards, narrator bars, toasts, fades, prompts.
//   yield* S.say('ruth', 'Text')       a cast key gives the name tag and marks that actor in the room
//   const i = yield* S.choose('Prompt', ['A', 'B'])
//   yield* S.card({ title, text, sign })      yield* S.chapterCard(3, "Minnie's Haberdashery")
//   yield* S.narrate('...')                   S.ui.toast('Clue: Minnie\'s mare')
(function () {
'use strict';
const S = Sprout;

const NAMES = {
  warren: 'Major Warren', ruth: 'John Ruth', daisy: 'Daisy Domergue', mannix: 'Chris Mannix', bob: 'Bob',
  mobray: 'Oswaldo Mobray', gage: 'Joe Gage', smithers: 'Gen. Smithers', ob: 'O.B.', jody: 'Jody',
  minnie: 'Minnie', dave: 'Sweet Dave', judy: 'Six-Horse Judy', gemma: 'Gemma', ed: 'Ed', charly: 'Charly',
  narrator: 'Narrator',
};
S.NAMES = NAMES;
const BOX_W = 404;

const ui = S.ui = {
  box: null, fadeA: 0, fadeCol: 'night', toasts: [], card: null, bars: 0, narr: null, title: null,
  blocking() { return !!ui.box || !!ui.card; },
  update() {
    const b = ui.box;
    if (b) {
      b.t++;
      const total = S.font.length(b.lines.join(' '));
      if (b.kind === 'say') {
        if (b.count < total) {
          b.count += S.input.held('a') || S.input.held('b') ? 3 : (b.slow ? 0.5 : 1);
          if (b.t % 4 === 0 && b.voice) S.sfx(b.voice);
          if (S.input.pressed('a') && b.t > 4) { b.count = total; S.input.consume('a'); }
        } else if (b.auto ? b.t > b.auto : (S.input.pressed('a') || S.input.pressed('b'))) {
          S.input.consume('a', 'b'); if (!b.auto) S.sfx('blip'); ui.box = null; b.done = true;
        }
      } else if (b.kind === 'choose') {
        b.count = total;
        if (S.input.repeat('up')) { b.sel = (b.sel + b.opts.length - 1) % b.opts.length; S.sfx('cursor'); }
        if (S.input.repeat('down')) { b.sel = (b.sel + 1) % b.opts.length; S.sfx('cursor'); }
        // number keys pick an option straight away
        const num = b.opts.findIndex((_, i) => i < 5 && S.input.pressed('n' + (i + 1)));
        if (num >= 0) { b.sel = num; S.input.consume('a'); S.sfx('select'); ui.box = null; b.done = true; b.result = num; }
        else if (S.input.pressed('a') && b.t > 6) { S.input.consume('a'); S.sfx('select'); ui.box = null; b.done = true; b.result = b.sel; }
        else if (S.input.pressed('b') && b.cancel != null) { S.input.consume('b'); S.sfx('cancel'); ui.box = null; b.done = true; b.result = b.cancel; }
      }
    }
    if (ui.card) {
      ui.card.t++;
      if (ui.card.t > 30 && (S.input.pressed('a') || S.input.pressed('b') || S.input.pressed('start'))) {
        S.input.consume('a', 'b', 'start'); S.sfx('page'); ui.card.done = true; ui.card = null;
      }
    }
    for (const t of ui.toasts) t.t++;
    ui.toasts = ui.toasts.filter(t => t.t < 170);
    if (ui.narr) ui.narr.t++;
    if (ui.title) ui.title.t++;
  },

  say(who, text, opt = {}) {
    const name = opt.name || NAMES[who] || who;
    const lines = S.font.wrap(text, BOX_W - 28);
    const actor = opt.actor || (who && S.iso && S.iso.room && S.iso.find(who));
    const b = ui.box = { kind: 'say', name, lines, t: 0, count: 0, done: false, voice: opt.voice ?? voiceOf(who), actor,
      auto: opt.auto, slow: opt.slow, color: opt.color };
    return b;
  },
  choose(text, opts, cancel = null, who) {
    const b = ui.box = { kind: 'choose', name: who ? NAMES[who] || who : null, lines: text ? S.font.wrap(text, BOX_W - 28) : [], opts, sel: 0, t: 0, count: 0, done: false, cancel };
    return b;
  },
  toast(text) {
    const same = ui.toasts.find(t => t.text === text && t.t < 60);
    if (same) { same.t = 0; return; }
    ui.toasts.push({ text, t: 0 });
    if (ui.toasts.length > 3) ui.toasts.shift();
  },
  showCard(card) { ui.card = Object.assign({ t: 0, done: false }, card); return ui.card; },

  draw(g) {
    if (ui.bars > 0) { const h = Math.round(ui.bars); g.rect(0, 0, S.W, h, 'night'); g.rect(0, S.H - h, S.W, h, 'night'); }
    ui.toasts.forEach((t, i) => {
      const a = t.t < 10 ? t.t / 10 : t.t > 140 ? (170 - t.t) / 30 : 1;
      const w = S.font.width(t.text) + 16;
      const x = Math.round(S.W / 2 - w / 2), y = 10 + i * 20 - (t.t < 10 ? 10 - t.t : 0);
      g.alpha(a, () => { nine(g, 'ui_panel_dark', x, y, w, 18); g.text(t.text, x + 8, y + 5, { color: 'gold' }); });
    });
    if (ui.narr) drawNarr(g, ui.narr);
    if (ui.fadeA > 0) g.alpha(Math.min(1, ui.fadeA), () => g.rect(0, 0, S.W, S.H, ui.fadeCol));
    if (ui.title) drawTitle(g, ui.title);
    const b = ui.box;
    if (b) drawBox(g, b);
    if (ui.card) drawCard(g, ui.card);
  },
};

function voiceOf(who) {
  if (!who || who === 'narrator') return 'voice_low';
  if (['daisy', 'minnie', 'judy', 'gemma'].includes(who)) return 'voice_hi';
  if (['warren', 'ruth', 'ob', 'smithers', 'dave'].includes(who)) return 'voice_low';
  return 'voice';
}

function drawBox(g, b) {
  const x = Math.round((S.W - BOX_W) / 2);
  const nLines = Math.max(2, b.lines.length) + (b.opts ? b.opts.length : 0);
  const h = 20 + nLines * 13, y = S.H - h - 8 - Math.round(ui.bars > 10 ? ui.bars - 10 : 0);
  if (b.actor && b.actor.visible && S.iso.room && S.iso.cx != null) {
    const [ax, ay] = S.iso.screenOf(b.actor.x, b.actor.y, b.actor.z);
    const top = ay + (b.actor.dy || 0) - (b.actor.mode === 'flat' ? 16 : b.actor.pose === 'sit' ? 40 : 46);
    if (top > 6 && top < y - 4) g.spr('ui_arrow', Math.floor(S.frame / 16) % 2, ax - 3, top - 8);
  }
  nine(g, 'ui_panel', x, y, BOX_W, h);
  if (b.name) {
    const nw = S.font.width(b.name) + 14;
    nine(g, 'ui_panel_dark', x + 12, y - 10, nw, 17);
    g.text(b.name, x + 19, y - 5, { color: 'gold' });
  }
  let n = Math.floor(b.count);
  b.lines.forEach((ln, i) => {
    const len = S.font.length(ln);
    if (n > 0) g.text(ln, x + 14, y + 12 + i * 13, { count: n, color: b.color || 'cream' });
    n -= len + 1;
  });
  const total = S.font.length(b.lines.join(' '));
  if (b.kind === 'say' && b.count >= total && !b.auto) g.spr('ui_arrow', Math.floor(S.frame / 20) % 2, x + BOX_W - 18, y + h - 12);
  if (b.opts) {
    const oy = y + 12 + b.lines.length * 13;
    b.opts.forEach((o, i) => {
      const sel = i === b.sel;
      if (sel) g.text('>', x + 18 + (Math.floor(S.frame / 15) % 2), oy + i * 13, { color: 'gold' });
      const kb = S.input.device !== 'pad' && i < 5;
      if (kb) g.text(String(i + 1), x + 30, oy + i * 13, { color: sel ? 'gold' : 'creamdim' });
      g.text(o, x + (kb ? 40 : 30), oy + i * 13, { color: sel ? 'gold' : 'creamdim' });
    });
  }
}

function drawCard(g, c) {
  const a = Math.min(1, c.t / 20);
  g.alpha(a * 0.75, () => g.rect(0, 0, S.W, S.H, 'night'));
  const W = c.w || 330, lines = S.font.wrap(c.text || '', W - 44);
  const H = Math.max(c.h || 0, 50 + lines.length * 13 + (c.title ? 26 : 0) + (c.sign ? 16 : 0));
  const x = Math.round((S.W - W) / 2), y = Math.round((S.H - H) / 2) + Math.round((1 - a) * 10);
  g.alpha(a, () => {
    nine(g, 'ui_paper', x, y, W, H);
    let yy = y + 22;
    if (c.title) { bigText(g, c.title, S.W / 2, y + 14, 2, 'ink', null); yy += 26; }
    lines.forEach((ln, i) => g.text(ln, x + 22, yy + i * 13, { color: c.color || 'ink' }));
    if (c.sign) g.text(c.sign, x + W - 22, yy + lines.length * 13 + 6, { align: 'right', color: 'ink' });
    if (c.t > 30) g.text(S.input.device === 'pad' ? 'A' : S.input.keyLabel('a'), x + W - 18, y + H - 18, { color: 'inkdim' });
  });
}

function drawNarr(g, n) {
  const a = Math.min(1, n.t / 15) * (n.out ? Math.max(0, 1 - n.out / 15) : 1);
  if (n.out) n.out++;
  const lines = S.font.wrap(n.text, S.W - 60);
  const h = 16 + lines.length * 13;
  g.alpha(a * 0.9, () => g.rect(0, 0, S.W, h, 'night'));
  let shown = Math.floor(n.t * 1.3);
  g.alpha(a, () => lines.forEach((ln, i) => {
    if (shown > 0) g.text(ln, S.W / 2, 9 + i * 13, { align: 'center', color: 'creamdim', count: shown });
    shown -= S.font.length(ln) + 1;
  }));
}

function drawTitle(g, t) {
  const a = Math.min(1, t.t / 30);
  g.alpha(a, () => {
    if (t.top) g.text(t.top, S.W / 2, S.H / 2 - 34, { align: 'center', color: 'creamdim' });
    bigText(g, t.title, S.W / 2, S.H / 2 - 16, t.big || 3, 'blood', 'night');
    if (t.sub) g.text(t.sub, S.W / 2, S.H / 2 + 26, { align: 'center', color: 'creamdim' });
  });
}

// 9-slice panel from a 24x24 sprite with 8px corners
function nine(g, name, x, y, w, h) {
  const s = S.sprites[name];
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  if (!s) { g.rect(x, y, w, h, 'lb1'); g.frame(x, y, w, h, 'gd2'); return; }
  const im = s.get(0), c = 8, m = s.w - 2 * c, ctx = g.ctx;
  const X = x - g.ox, Y = y - g.oy;
  const part = (sx, sy, sw, sh, dx, dy, dw, dh) => { if (dw > 0 && dh > 0) ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh); };
  part(0, 0, c, c, X, Y, c, c); part(c, 0, m, c, X + c, Y, w - 2 * c, c); part(c + m, 0, c, c, X + w - c, Y, c, c);
  part(0, c, c, m, X, Y + c, c, h - 2 * c); part(c, c, m, m, X + c, Y + c, w - 2 * c, h - 2 * c); part(c + m, c, c, m, X + w - c, Y + c, c, h - 2 * c);
  part(0, c + m, c, c, X, Y + h - c, c, c); part(c, c + m, m, c, X + c, Y + h - c, w - 2 * c, c); part(c + m, c + m, c, c, X + w - c, Y + h - c, c, c);
}
S.nine = nine;

// text drawn at an integer scale (titles), centred on x
const bigCache = {};
function bigText(g, str, x, y, scale, color = 'white', shadow) {
  const key = str + '|' + color + '|' + shadow;
  let c = bigCache[key];
  if (!c) {
    const w = S.font.width(str) + 2;
    c = bigCache[key] = S.canvas(w, 12);
    const tg = { ctx: c.getContext('2d'), ox: 0, oy: 0, img(im, xx, yy) { this.ctx.drawImage(im, xx, yy); } };
    S.font.draw(tg, str, 0, 0, { color, shadow: shadow === null ? false : shadow });
  }
  g.ctx.drawImage(c, Math.round(x - c.width * scale / 2) - g.ox, Math.round(y) - g.oy, c.width * scale, c.height * scale);
}
S.bigText = bigText;

S.btnGlyph = function (g, b, x, y) {
  if (S.input.device === 'pad' && S.sprites.ui_btn && ['a', 'b', 'x', 'y'].includes(b)) { g.spr('ui_btn', b, x, y - 1); return 13; }
  const lab = S.input.device === 'pad' ? ({ l: 'LB', r: 'RB', start: 'START', select: 'BACK' }[b] || b.toUpperCase()) : S.input.keyLabel(b);
  const w = Math.max(11, S.font.width(lab) + 5);
  S.keycap(g, x, y, w);
  g.text(lab, x + w / 2, y + 1, { align: 'center', color: 'ink', shadow: false });
  return w + 1;
};
// a light key cap with a darker lip, so key names read on dark panels
S.keycap = function (g, x, y, w) {
  g.rect(x, y, w, 11, 'ink');
  g.rect(x + 1, y, w - 2, 10, 'sn5'); g.rect(x + 1, y + 8, w - 2, 2, 'sn3');
};
S.prompt = function (g, b, label, x, y) {
  const w = S.font.width(label) + 16;
  const x0 = Math.round(x - w / 2);
  g.alpha(0.8, () => g.rect(x0 - 3, y - 2, w + 6, 15, 'night'));
  const bw = S.btnGlyph(g, b, x0, y);
  g.text(label, x0 + bw + 3, y + 2, { color: 'cream' });
};

// generator helpers for scripts
S.say = function* (who, text, opt) { const b = ui.say(who, text, opt); yield () => b.done; };
S.choose = function* (text, opts, cancel, who) { const b = ui.choose(text, opts, cancel, who); yield () => b.done; return b.result; };
S.card = function* (card) { S.sfx('page'); const c = ui.showCard(card); yield () => c.done; };
S.fadeOut = function* (n = 20, col = 'night') { ui.fadeCol = col; for (let i = 1; i <= n; i++) { ui.fadeA = i / n; yield 1; } ui.fadeA = 1; };
S.fadeIn = function* (n = 20) { for (let i = n - 1; i >= 0; i--) { ui.fadeA = i / n; yield 1; } ui.fadeA = 0; };
S.bars = function* (on, n = 20) { const a = ui.bars, b = on ? 26 : 0; for (let i = 1; i <= n; i++) { ui.bars = a + (b - a) * i / n; yield 1; } };
S.narrate = function* (text, hold) {
  ui.narr = { text, t: 0 };
  yield 20;
  yield () => S.input.pressed('a') || S.input.pressed('b') || (hold && ui.narr.t > hold);
  S.input.consume('a', 'b');
  ui.narr.out = 1; yield 15; ui.narr = null;
};
S.chapterCard = function* (n, title, sub) {
  const words = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'];
  if (ui.fadeA < 1) yield* S.fadeOut(20);
  ui.title = { t: 0, top: n ? 'CHAPTER ' + words[n] : '', title, sub };
  S.sfx('title_hit');
  yield 50;
  yield () => S.input.pressed('a') || ui.title.t > 210;
  S.input.consume('a');
  yield 20;
  ui.title = null;
};

Object.assign(S.font.colors, {
  cream: ['#e6ddca', '#1f1512'],
  creamdim: ['#bcb09e', '#1c1420'],
  gold: ['#f4dc88', '#45200c'],
  blood: ['#d63a30', '#2a0a10'],
  ink: ['#2b1b16', '#bcb09e'],
  inkdim: ['#857a70', '#e6ddca'],
});
})();
