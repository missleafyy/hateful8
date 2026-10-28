// The six chapters. Each run() is a script: it builds its scene, plays its cutscenes, and hands the player
// control with h8.goal() for the parts you play. Dialogue is paraphrased from the film.
(function () {
'use strict';
const S = Sprout, iso = S.iso, h8 = S.h8;
const say = S.say, flags = () => S.state.flags;
const A = name => iso.find(name);
const walk = (a, x, y, opt) => iso.walkTo(a, x, y, opt);
const look = (a, b) => iso.face(a, b);
const hot = o => iso.hot(o);
const talked = {};
const mark = k => { talked[k] = true; };

// everyone turns to look at someone
function eyesOn(who, names) { for (const n of names) { const a = A(n); if (a && !a.dead && a.pose !== 'sit') look(a, who); } }

S.CH = {};

// =====================================================================================================
// 1 · LAST STAGECOACH TO RED ROCK
// =====================================================================================================
S.CH[1] = { title: 'Last Stagecoach to Red Rock', sub: 'Wyoming. A blizzard is coming.', *run() {
  Object.keys(talked).forEach(k => delete talked[k]);
  h8.room('road', { snow: 1, wind: 0.8, music: 'snow' });
  const sp = iso.room.spots;
  const W = h8.spawn('warren', sp.bodies_sit[0], sp.bodies_sit[1] + 0.05, 'sw', { pose: 'sit', bias: 0.32 });
  iso.look(sp.warren[0] - 3, sp.warren[1] + 1, 0.9, true);
  const c = h8.coach(-9, sp.coach_stop[1]);
  const ob = h8.spawn('ob', 0, 0, 'se'); c.ride(ob, ...h8.DRIVER);
  const ruth = h8.spawn('ruth', 0, 0, 'se', { visible: false });
  const daisy = h8.spawn('daisy', 0, 0, 'se', { visible: false });
  yield* S.fadeIn(40);
  yield* S.narrate('Three dead men, one dead horse, and a Union cavalryman sitting on top of the lot of them.', 300);
  S.sfx('neigh');
  yield 30;
  yield* say('warren', "Bells. A stagecoach, out here, with this storm on its tail. Best not let it pass.");
  // he gets up off the bodies and steps clear of them
  W.pose = null; W.bias = 0.06;
  yield* walk(W, sp.bodies_sit[0] - 0.2, sp.bodies_sit[1] + 0.75, { ghost: true });
  S.player.spawn(W);
  // the coach starts rolling in; the player has to step out into the road to stop it
  S.run(function* () { yield* c.move(13, 0.03, false); }, { block: false });
  yield* h8.goal('Stand in the road and flag down the coach', () => W.y > 5.0 && W.x > 11 && W.x < 22, function* () { W.x = 15.5; W.y = 6.2; });
  S.player.enabled = false; W.anim = 'idle';
  // whatever the coach has reached, it pulls up short of Warren
  S.tasks.filter(t => t.name !== 'chapter' && !t.block).forEach(t => { t.done = true; });
  const stopX = W.x - 6.0;
  W.facing = 'nw';
  iso.follow(c.body);
  S.sfx('whip');
  yield* c.move(stopX - c.x, 0.04);
  S.sfx('neigh');
  iso.look((c.x + W.x) / 2, c.y, 0.9);
  yield 20;
  yield* say('ob', "Whoa there! Whoa!");
  yield* say('warren', "Afternoon. Got room for one more? My horse gave out a mile back.");
  yield* say('ruth', "Hold it right there, stranger. Hands where I can see 'em.", { name: 'A Voice in the Coach' });
  // Ruth climbs out, chained to Daisy
  const [dx, dy] = c.door();
  ruth.x = dx - 0.25; ruth.y = dy; ruth.visible = true; daisy.x = dx + 0.3; daisy.y = dy + 0.2; daisy.visible = true;
  S.sfx('door');
  h8.chain = [ruth, daisy];
  yield* h8.all(walk(ruth, dx - 0.2, dy + 0.9), walk(daisy, dx + 0.6, dy + 1.0));
  look(ruth, W); look(daisy, W);
  yield* say('ruth', "Well, I'll be. Major Marquis Warren. We ate steak together in Chattanooga, once.");
  yield* say('warren', "John Ruth. The Hangman. Didn't know this was your coach.");
  yield* say('ruth', "Bought every seat. I'm bringing this one in to hang, and I don't share the ride with strangers.");
  yield* say('daisy', "Ain't he a pretty one. You gonna let him freeze, John?");
  yield* say('ruth', "Mouth shut, Daisy. Major, I'll think on it. First, lay your pistols down in the snow and step away from them.");
  W.facing = 'sw';
  hot({ id: 'guns', x: W.x + 0.2, y: W.y + 0.9, r: 1.3, label: 'Lay down your guns', fn: function* () {
    S.sfx('thud'); yield 10; S.sfx('thud');
    S.ui.toast('Pistols down');
    flags().gunsDown = true; iso.clearHot();
  } });
  yield* h8.goal('Lay down your guns', () => flags().gunsDown, ['guns']);
  yield* walk(ruth, W.x - 1.6, W.y + 0.6); yield* walk(daisy, W.x - 1.4, W.y + 1.5);
  look(ruth, W); look(W, ruth); look(daisy, W);
  yield* say('ruth', "Three dead men. Bounty?");
  yield* say('warren', "Eight thousand dollars between them. All payable in Red Rock, dead or alive. I took the easy way.");
  yield* say('ruth', "And you'd let me hand mine over alive? Two men going after the same reward in a blizzard get funny ideas.");
  yield* say('warren', "I'm not after your prisoner. I got something here might set your mind at ease.");
  S.sfx('page');
  yield* S.card({ title: 'A Letter', text: "Dear Marquis,\nI hope this finds you well. I am well, though time moves slow and things are changing. Then I read of your exploits and I am proud to call you a friend.\nMary Todd is calling for me. I suppose it is time to turn in.", sign: 'Your friend, Abraham Lincoln' });
  yield* say('ruth', "...A letter from Abe Lincoln. To you.");
  yield* say('warren', "We wrote a little, in the war. It means more to me than you'd think.");
  yield* say('daisy', "Lincoln never wrote nothin' to no--");
  S.sfx('punch'); daisy.flash = 8; iso.cam.shake = 6;
  yield 20;
  yield* say('ruth', "Bite your tongue, Daisy. Major, keep your pistols. Load your dead men on the roof and climb in.");
  yield* say('warren', "Obliged, John.");
  flags().gunsDown = false;
  hot({ id: 'bodies', x: sp.bodies[0], y: sp.bodies[1], r: 1.2, label: 'Load the bodies', fn: function* () {
    yield* S.fadeOut(16);
    for (let i = 0; i < 3; i++) { yield 24; S.sfx('thud'); }
    c.load(); yield 20;
    yield* S.fadeIn(16);
    yield* say('ob', "That's the lot, Major. Lashed down tight. They ain't goin' nowhere.");
    flags().ch1Loaded = true;
  } });
  yield* h8.goal('Load the bodies on the coach roof', () => flags().ch1Loaded, ['bodies']);
  iso.clearHot();
  yield* h8.all(walk(ruth, dx - 0.3, dy + 0.4), walk(daisy, dx + 0.4, dy + 0.4));
  ruth.visible = false; daisy.visible = false; S.sfx('door');
  hot({ id: 'board', x: dx, y: dy + 0.2, r: 1.2, label: 'Climb aboard', fn: function* () { flags().ch1Board = true; } });
  yield* h8.goal('Climb aboard the coach', () => flags().ch1Board, ['board']);
  iso.clearHot();
  yield* walk(W, dx, dy, { ghost: true });
  W.visible = false; S.sfx('door');
  yield 20;
  yield* say('ob', "Hyah! Next stop, Minnie's Haberdashery!");
  S.sfx('whip');
  iso.follow(c.body);
  S.run(function* () { yield 60; yield* S.fadeOut(60); }, { block: false });
  yield* c.move(14, 0.05);
  yield 30;
} };

// =====================================================================================================
// 2 · SON OF A GUN
// =====================================================================================================
S.CH[2] = { title: 'Son of a Gun', sub: 'A few miles on. The snow is getting worse.', *run() {
  h8.room('road', { snow: 1.4, wind: 1.1, music: 'snow' });
  const sp = iso.room.spots;
  const c = h8.coach(6, sp.coach_stop[1], { loaded: true });
  const ob = h8.spawn('ob', 0, 0, 'se'); c.ride(ob, ...h8.DRIVER);
  const mannix = h8.spawn('mannix', sp.mannix[0], sp.mannix[1], 'sw');
  const W = h8.spawn('warren', 0, 0, 'se', { visible: false });
  const ruth = h8.spawn('ruth', 0, 0, 'se', { visible: false });
  const daisy = h8.spawn('daisy', 0, 0, 'se', { visible: false });
  iso.follow(c.body, true);
  S.run(S.fadeIn(40), { block: false });
  yield* c.move(10, 0.035);
  yield* walk(mannix, c.x + 3.4, c.y + 1.3);
  look(mannix, c.body);
  iso.look(c.x + 1.6, c.y + 0.6);
  yield* say('mannix', "Hey! Hold up! You wouldn't leave a lawman out here to freeze, would you?");
  const [dx, dy] = c.door();
  for (const [a, ox, oy] of [[ruth, -0.4, 0.9], [daisy, 0.4, 1.1], [W, 1.1, 0.9]]) { a.x = dx; a.y = dy; a.visible = true; }
  S.sfx('door');
  h8.chain = [ruth, daisy];
  yield* h8.all(walk(ruth, dx - 0.2, dy + 0.9), walk(daisy, dx + 0.5, dy + 1.1), walk(W, dx + 1.4, dy + 0.6));
  eyesOn(mannix, ['ruth', 'daisy', 'warren']); look(mannix, ruth);
  yield* say('ruth', "Lawman? Who are you supposed to be?");
  yield* say('mannix', "Chris Mannix. New sheriff of Red Rock, on my way to be sworn in.");
  yield* say('warren', "Mannix. As in Erskine Mannix? The Marauders? Your daddy ran a gang of rebel renegades through the whole war.");
  yield* say('mannix', "Pa fought for what he believed in, Major. Same as you.");
  yield* say('warren', "Your pa burned towns. And there ain't no sheriff in Red Rock till you get there. Convenient.");
  yield* say('daisy', "Ha! Let him in, John. He's the one gonna pay you, ain't he?");
  yield* say('ruth', "...If you are the sheriff, you're the man who signs for my reward. If you're lying, you hang beside her.");
  const i = yield* S.choose('Warren:', ["He'll lie to get warm. Leave him.", "Fine. But he rides where I can see him."]);
  if (i === 0) yield* say('ruth', "Can't do it, Major. If he is who he says, leaving him to die is murder of a lawman. He rides.");
  else yield* say('ruth', "Agreed. Everybody keeps their eyes open.");
  yield* say('mannix', "Much obliged. Hell of a welcome party.");
  for (const a of [ruth, daisy, W, mannix]) S.run(walk(a, dx, dy, { ghost: true }), { block: false });
  yield 60;
  for (const a of [ruth, daisy, W, mannix]) a.visible = false;
  S.sfx('door');
  yield* say('ob', "Minnie's ain't far now. Pray we beat the blizzard.");
  S.sfx('whip');
  S.run(function* () { yield 40; yield* S.fadeOut(50); }, { block: false });
  yield* c.move(10, 0.05);

  // ------------------------------------------------------------ Minnie's yard, in the whiteout
  h8.room('yard', { snow: 2.2, wind: 1.7, fog: 0.75, music: 'snow' });
  const ys = iso.room.spots;
  const c2 = h8.coach(ys.coach[0] - 0.8, ys.coach[1] + 1.0, { loaded: true });
  const ob2 = h8.spawn('ob', 0, 0, 'se'); c2.ride(ob2, ...h8.DRIVER);
  const mare = h8.spawn('mare', ys.mare[0], ys.mare[1], 'sw', { sprite: 'horse_chestnut', shadowW: 12 });
  const [ex, ey] = c2.door();
  const W2 = h8.spawn('warren', ex + 0.2, ey + 0.6, 'ne');
  const ruth2 = h8.spawn('ruth', ex - 0.6, ey + 0.6, 'ne');
  const daisy2 = h8.spawn('daisy', ex - 0.1, ey + 1.1, 'ne');
  const mannix2 = h8.spawn('mannix', ex + 1.0, ey + 1.0, 'ne');
  const bob = h8.spawn('bob', ys.door[0], ys.door[1] + 0.2, 'se', { visible: false });
  h8.chain = [ruth2, daisy2];
  iso.follow(W2, true);
  yield* S.fadeIn(40);
  yield 20;
  S.sfx('door'); bob.visible = true;
  yield* walk(bob, ys.door[0] + 0.3, ys.door[1] + 1.4);
  eyesOn(bob, ['warren', 'ruth', 'daisy', 'mannix']);
  yield* say('bob', "Hola! Come in, come in out of the snow! Welcome to Minnie's.");
  yield* say('warren', "Who are you? Where's Minnie?");
  yield* say('bob', "They call me Bob. Minnie went to see her mother, up the north side of the mountain. She left me in charge.");
  yield* say('warren', "...Minnie left you in charge.");
  yield* say('bob', "Si. Her and Sweet Dave both. You want coffee, I got coffee. The door is broken; you have to nail it shut every time.");
  yield* say('ruth', "Inside, Daisy. Major, you know the drill out here?");
  yield* say('ob', "Gotta string the guide rope out to the outhouse, Major, or a man gets lost ten feet from the door. I'll see to the team.");
  // they go in; O.B. leads the team round to the stable
  for (const [a, ox] of [[ruth2, -0.2], [daisy2, 0.3], [mannix2, 0.7], [bob, 0]]) S.run(walk(a, ys.door[0] + ox * 0.4, ys.door[1] + 0.1, { ghost: true }), { block: false });
  yield 70;
  for (const a of [ruth2, daisy2, mannix2, bob]) a.visible = false;
  S.sfx('door');
  c2.unride(ob2);
  ob2.x = c2.x + 1.4; ob2.y = c2.y + 0.9;
  S.run(walk(ob2, [[c2.x + 5, c2.y + 1], [ys.stable[0] - 0.5, ys.stable[1] + 1.2], [ys.stall2[0], ys.stall2[1] + 0.9]]), { block: false });

  // tie the guide rope: door -> each post -> the outhouse
  S.player.spawn(W2);
  const posts = ys.posts;
  let tied = 0;
  h8.ropes = [[[ys.door[0] - 0.4, ys.door[1] + 0.25, 0.85]]];
  posts.forEach((p, i) => hot({ id: 'post' + i, x: p[0], y: p[1], r: 1.0, z: 1.5, label: 'Tie the rope', when: () => tied === i, fn: function* () {
    S.sfx('creak'); tied++;
    h8.ropes[0].push([p[0], p[1], 0.85]);
    if (tied === posts.length) h8.ropes[0].push([ys.outhouse[0] + 0.5, ys.outhouse[1] - 0.6, 0.9]);
    S.ui.toast(tied < posts.length ? `Rope tied (${tied}/${posts.length})` : 'Rope line done');
  } }));
  yield* h8.goal('String the guide rope post to post, out to the outhouse', () => tied === posts.length, posts.map((_, i) => 'post' + i));
  iso.clearHot();
  yield* say('warren', "That'll hold. A body can find the door blind now.");
  h8.weather.fog = 0.35;
  // the stable: O.B. and Minnie's mare
  let mareSeen = false;
  hot({ id: 'ob', actor: ob2, r: 1.2, label: 'Talk', fn: function* () {
    yield* say('ob', "Team's in, Major. Funny thing. Look at that mare in the end stall, all rugged and fed.");
  } });
  hot({ id: 'mare', actor: mare, r: 1.4, z: 1.6, label: 'Look at the mare', fn: function* () {
    yield* say('warren', "Hm. I know this horse. This is Minnie's mare. Minnie's own.");
    yield* say('warren', "Minnie went to see her mother, across a mountain, in December... and she walked?");
    S.clue('mare'); mareSeen = true;
  } });
  yield* h8.goal('Help O.B. in the stable', () => mareSeen, ['mare']);
  iso.clearHot();
  hot({ id: 'door', x: ys.door[0], y: ys.door[1] + 0.3, r: 1.1, label: 'Go inside', fn: function* () { flags().ch2In = true; } });
  yield* h8.goal("Go into Minnie's", () => flags().ch2In, ['door']);
  iso.clearHot();
  S.sfx('door');
  yield* S.fadeOut(40);
} };

// =====================================================================================================
// 3 · MINNIE'S HABERDASHERY
// =====================================================================================================
// the cabin as it is when the coach arrives: strangers in their places
function cabinCast(opt = {}) {
  const sp = iso.room.spots;
  const cast = {
    bob: h8.spawn('bob', sp.bar[0], sp.bar[1], 'sw'),
    mobray: h8.spawn('mobray', sp.mobray[0], sp.mobray[1], 'nw', { pose: 'sit' }),
    gage: h8.spawn('gage', sp.gage[0], sp.gage[1], 'nw', { pose: 'sit' }),
    smithers: opt.noSmithers ? null : h8.spawn('smithers', sp.dave[0], sp.dave[1], 'se', { pose: 'sit' }),
  };
  return cast;
}

S.CH[3] = { title: "Minnie's Haberdashery", sub: 'Two coaches, one storm, and eight strangers.', *run() {
  Object.keys(talked).forEach(k => delete talked[k]);
  h8.room('minnie', { music: 'cabin' });
  const sp = iso.room.spots;
  const cast = cabinCast();
  const W = h8.spawn('warren', sp.door[0], sp.door[1] + 0.6, 'se');
  const ruth = h8.spawn('ruth', sp.seat_a[0], sp.seat_a[1], 'se', { pose: 'sit' });
  const daisy = h8.spawn('daisy', 4.0, 5.5, 'se');
  const mannix = h8.spawn('mannix', 6.6, 7.2, 'nw');
  const ob = h8.spawn('ob', 6.9, 6.3, 'nw');
  h8.chain = [ruth, daisy];
  iso.follow(W, true);
  yield* S.fadeIn(40);
  // the door has to be nailed shut
  W.facing = 'ne';
  yield* say('warren', "Door's busted, all right. Wind'll come right through. Where's your hammer, Bob?");
  yield* say('bob', "Hammer and boards right there by the door. Two boards. Use plenty of nails.");
  yield* S.nailDoor(4);
  h8.spawn('boards', sp.door[0] + 0.15, sp.door[1] - 0.25, 'se', { sprite: 'fx_boards', z: 0.6, solid: false, shadow: false, bias: 0.02 });
  yield* say('warren', "That'll keep the weather out.");
  yield* say('ruth', "Listen up, all of you. That's Daisy Domergue, and she's worth ten thousand dollars to me alive. Anybody gets ideas, you deal with me.");
  yield* say('mobray', "Splendid! Then we're well met, sir. I'm Oswaldo Mobray, the hangman of Red Rock. I'll be the one stringing her up.");
  // explore: meet everyone; optional clues
  S.player.spawn(W);
  hot({ id: 'mobray', actor: cast.mobray, r: 1.3, label: 'Talk', fn: function* () {
    if (talked.mobray) { yield* say('mobray', "Frontier justice is merely justice without the paperwork, Major. I am the paperwork."); return; }
    yield* say('mobray', "Ah, Major Warren! A pleasure. Cards? No? Well. Shelter from the storm, then.");
    yield* say('warren', "Hangman. Riding in the same blizzard as the woman you're gonna hang. Small world.");
    yield* say('mobray', "Small mountain, more like. Do join me for a hand later.");
    mark('mobray');
  } });
  hot({ id: 'gage', actor: cast.gage, r: 1.3, label: 'Talk', fn: function* () {
    if (talked.gage) { yield* say('gage', "Still writin'."); return; }
    yield* say('gage', "Joe Gage. Cow-puncher. Goin' home to see my mother for Christmas.");
    yield* say('warren', "What's in the book?");
    yield* say('gage', "The story of my life. ...Ain't much of it written yet.");
    mark('gage');
  } });
  if (cast.smithers) hot({ id: 'smithers', actor: cast.smithers, r: 1.3, label: 'Talk', fn: function* () {
    if (talked.smithers) { yield* say('smithers', "..."); return; }
    yield* say('warren', "General Sanford Smithers. Baton Rouge. I was there.");
    yield* say('smithers', "On the other side, I'd imagine. I have nothing to say to you.");
    yield* say('warren', "Suit yourself. Comfortable chair you've got there, General.");
    yield* say('warren', "(That's Sweet Dave's chair. Minnie never let another soul sit in it. Not even me.)", { name: 'Warren (thinking)' });
    S.clue('chair'); mark('smithers');
  } });
  hot({ id: 'bob', actor: cast.bob, r: 1.6, label: 'Talk', fn: function* () {
    if (talked.bob) { yield* say('bob', "More coffee? Plenty of stew too."); return; }
    yield* say('bob', "Coffee's hot, stew's on the stove. Help yourself, friend.");
    yield* say('warren', "How long you know Minnie, Bob?");
    yield* say('bob', "Oh, a while, a while. She left four days ago. Nice lady.");
    mark('bob');
  } });
  hot({ id: 'rules', x: sp.rules[0], y: sp.rules[1], z: 2.2, r: 0.7, label: 'Read the sign', fn: function* () {
    yield* S.card({ title: "Minnie's Rules", text: "1. No spitting on the floor.\n2. Wipe your boots.\n3. NOBODY behind my counter but me and Dave.", sign: '- Minnie' });
    yield* say('warren', "Minnie'd sooner burn this place down than let a stranger behind that counter. And yet.");
    S.clue('rules');
  } });
  hot({ id: 'stew', x: sp.stove_front[0], y: sp.stove_front[1], z: 1.2, r: 0.9, label: 'Taste the stew', fn: function* () {
    S.sfx('clink');
    yield* say('warren', "Mm. Damn good stew. Tastes like Minnie made it. Made it today, not four days back.");
    S.clue('stew');
  } });
  hot({ id: 'candy', x: sp.candy[0], y: sp.candy[1], z: 1.8, r: 0.6, label: 'Candy jar', fn: function* () {
    yield* say('warren', "Minnie's jelly beans. She'd hand 'em out to anyone with a sweet tooth.");
  } });
  hot({ id: 'mannix', actor: mannix, r: 1.2, label: 'Talk', fn: function* () {
    yield* say('mannix', "Ain't nobody in this room I'd trust as far as I could spit, Major. Present company included.");
  } });
  hot({ id: 'ruth', actor: ruth, r: 1.2, label: 'Talk', fn: function* () {
    yield* say('ruth', "Watch them, Major. One of these men ain't who he says he is. Maybe more than one.");
  } });
  hot({ id: 'daisy', actor: daisy, r: 1.1, label: 'Talk', fn: function* () {
    yield* say('daisy', "You look at me like that again, I'll start thinkin' you like me.");
  } });
  const meet = ['mobray', 'gage', 'smithers', 'bob'];
  yield* h8.goal('Meet the strangers (talk to Mobray, Gage, the General and Bob)', () => meet.every(k => talked[k]), meet);
  iso.clearHot();
  // the General
  yield* say('ruth', "Supper time, everybody. Warren, sit down.");
  yield* say('warren', "In a minute, John. The General and I got a little business.");
  yield* walk(W, sp.dave[0] + 1.3, sp.dave[1] + 0.5);
  look(W, cast.smithers);
  S.sfx('clink');
  yield* say('warren', "I'll set this pistol down right here on the table, General. Within reach. Your reach.");
  yield* say('smithers', "...What game is this?");
  yield* say('warren', "No game. I'm just gonna tell you a story about your boy, Chester. He came lookin' for me, once.");
  yield* S.bars(true, 20);
  yield* S.narrate("What the Major told the General, we won't repeat. It was cruel, and every word of it was meant to make an old man reach for that gun.");
  yield* S.bars(false, 20);
  yield* say('smithers', "...You son of a...");
  yield* S.duel(W, cast.smithers, { wait: [80, 160], window: 46, zone: 12,
    earlyLine: "Easy. Let him go for it. Then it's self-defence, and everybody saw it.",
    slowLine: "He got the drop on me there. Again, and watch the hand." });
  yield 30;
  yield* say('mobray', "...Well. Everyone in this room saw the General reach first.");
  yield* say('ruth', "Self-defence. He went for the gun. Nobody's hanging for that.");
  yield* say('warren', "Coffee, Bob.");
  yield* S.fadeOut(60);
} };

// =====================================================================================================
// 4 · DOMERGUE'S GOT A SECRET
// =====================================================================================================
S.CH[4] = { title: "Domergue's Got a Secret", sub: "Let's go back a bit.", *run() {
  h8.room('minnie', { music: 'tension' });
  const sp = iso.room.spots;
  const cast = cabinCast({ noSmithers: true });
  h8.spawn('boards', sp.door[0] + 0.15, sp.door[1] - 0.25, 'se', { sprite: 'fx_boards', z: 0.6, solid: false, shadow: false, bias: 0.02 });
  // the flashback happens while the General is still alive and the Major is telling his story
  const gen = h8.spawn('smithers', sp.dave[0], sp.dave[1], 'se', { pose: 'sit' });
  const W = h8.spawn('warren', sp.dave[0] + 1.3, sp.dave[1] + 0.5, 'nw');
  const ruth = h8.spawn('ruth', sp.seat_a[0], sp.seat_a[1], 'se', { pose: 'sit' });
  const daisy = h8.spawn('daisy', 4.0, 5.5, 'se');
  const mannix = h8.spawn('mannix', 6.6, 7.2, 'nw');
  const ob = h8.spawn('ob', 6.9, 6.3, 'nw');
  h8.chain = [ruth, daisy];
  // 15 minutes earlier: while Warren talks, somebody visits the coffee pot
  cast.gage.pose = null; cast.gage.x = sp.gage[0] + 0.3; cast.gage.y = sp.gage[1] - 0.8;
  iso.look(5.5, 5.8, 0.9, true);
  yield* S.narrate('While the Major was telling his story, nobody was watching the coffee pot. Almost nobody.');
  yield* S.fadeIn(30);
  yield* walk(cast.gage, sp.stove_front[0] - 0.4, sp.stove_front[1] + 0.2);
  cast.gage.facing = 'ne';
  yield 30;
  S.sfx('pour');
  yield 50;
  look(daisy, cast.gage);
  yield 30;
  yield* say('daisy', "(...)", { name: 'Daisy' });
  yield* walk(cast.gage, sp.gage[0], sp.gage[1] - 0.6);
  cast.gage.x = sp.gage[0]; cast.gage.y = sp.gage[1]; cast.gage.pose = 'sit'; cast.gage.facing = 'nw';
  yield* S.fadeOut(20);
  yield* S.narrate('Somebody put poison in the coffee. Daisy saw who. Daisy said nothing.');
  // back in the present: the General is dead
  iso.remove(gen);
  h8.corpse('smithers', sp.dave[0] + 0.3, sp.dave[1] + 0.8);
  iso.follow(W, true);
  yield* S.fadeIn(30);
  yield* say('ruth', "Coffee, O.B.?");
  yield* say('ob', "Don't mind if I do, Mr. Ruth.");
  S.sfx('pour'); yield 30; S.sfx('clink'); yield 60;
  S.sfx('cough');
  yield* say('ob', "Hhk-- Mr. Ruth... somethin's...");
  S.sfx('cough');
  yield* h8.kill(ob, { spray: 18, poolR: 0.4 });
  ruth.pose = null; ruth.bias = 0.06; ruth.y += 0.3;
  yield* say('ruth', "O.B.? ...The coffee. Don't-- don't nobody drink the coffee! Mannix!");
  look(mannix, ruth);
  yield* say('mannix', "I... I didn't take a sip, Ruth, I swear!");
  S.sfx('cough');
  yield* say('ruth', "Grrk-- Daisy... you knew...");
  yield* h8.kill(ruth, { spray: 30, poolR: 0.5 });
  h8.chain = null;
  // Daisy grabs Ruth's gun: shoot it out of her hand
  look(daisy, W); daisy.pose = 'aim0'; daisy.anim = 'aim';
  S.sfx('cock');
  yield* say('daisy', "Nobody move!");
  yield* S.duel(W, daisy, { wait: [30, 60], window: 40, zone: 12, onHit: function* () {
    daisy.flash = 8; daisy.pose = null; daisy.anim = 'idle'; S.sfx('miss');
    yield* say('daisy', "Aagh! My hand!");
  }, earlyLine: "Not yet... let her lift it.", slowLine: "Missed my chance. Again." });
  yield* say('warren', "Everybody against that wall. Now. Mannix, you're with me. You didn't drink, so you didn't poison it.");
  yield* say('mannix', "Reckon that's fair logic, Major.");
  // the lineup
  const line = [['bob', 1.4, 6.9], ['mobray', 1.4, 7.7], ['gage', 1.4, 8.5], ['daisy', 1.4, 9.3]];
  for (const [n] of line) { const a = A(n); a.pose = null; a.bias = 0.06; }
  yield* h8.all(...line.map(([n, x, y]) => walk(A(n), x, y, { face: 'se' })), walk(mannix, 4.4, 6.9, { face: 'nw' }));
  S.player.spawn(W);
  // investigate
  yield* say('warren', "Somebody in this room's a liar, and I'm gonna figure out which. Nobody moves.");
  yield* say('warren', "(Look around. Check what I've got in my notebook. When it adds up, I'll talk to Mannix.)", { name: 'Warren (thinking)' });
  hot({ id: 'rules', x: sp.rules[0], y: sp.rules[1], z: 2.2, r: 0.7, label: 'Read the sign', when: () => !S.hasClue('rules'), fn: function* () {
    yield* S.card({ title: "Minnie's Rules", text: "1. No spitting on the floor.\n2. Wipe your boots.\n3. NOBODY behind my counter but me and Dave.", sign: '- Minnie' });
    S.clue('rules');
  } });
  hot({ id: 'stew', x: sp.stove_front[0], y: sp.stove_front[1], z: 1.2, r: 0.9, label: 'The stew', when: () => !S.hasClue('stew'), fn: function* () {
    yield* say('warren', "Minnie's stew. Her recipe. Cooked today.");
    S.clue('stew');
  } });
  hot({ id: 'chair', x: sp.dave[0], y: sp.dave[1], z: 1.4, r: 1.0, label: "Dave's chair", when: () => !S.hasClue('chair'), fn: function* () {
    yield* say('warren', "Sweet Dave's chair. Minnie never let a soul sit there. The General sat there like he owned it.");
    S.clue('chair');
  } });
  hot({ id: 'crack', x: sp.crack[0], y: sp.crack[1], z: 0.3, r: 0.7, label: 'Something red', when: () => !S.hasClue('bean'), fn: function* () {
    yield* say('warren', "A red jelly bean, jammed in a crack in the floor. Fresh. Not stepped on, not dusty.");
    yield* say('warren', "Somebody was eatin' jelly beans in here today. Somebody who ain't in this room now.");
    S.clue('bean');
  } });
  hot({ id: 'pot', x: sp.stove[0] + 0.6, y: sp.stove[1] + 0.5, z: 1.4, r: 0.8, label: 'Coffee pot', fn: function* () {
    yield* say('warren', "Somebody spiked the pot while I was busy with the General. Coulda been anybody close to the stove.");
  } });
  hot({ id: 'bob', actor: cast.bob, r: 1.2, label: 'Question', fn: function* () {
    yield* say('bob', "I didn't do nothin', I swear! I made the stew, I made the coffee. That's all!");
  } });
  hot({ id: 'mobray', actor: cast.mobray, r: 1.2, label: 'Question', fn: function* () {
    yield* say('mobray', "I was at my table the entire time, Major. Playing solitaire, quite alone.");
  } });
  hot({ id: 'gage', actor: cast.gage, r: 1.2, label: 'Question', fn: function* () {
    yield* say('gage', "I was writin' in my book. Never got up.");
    yield* say('warren', "(He's lying. Or he's the only man in the room didn't stretch his legs.)", { name: 'Warren (thinking)' });
  } });
  hot({ id: 'daisy', actor: daisy, r: 1.2, label: 'Question', fn: function* () {
    yield* say('daisy', "Me? I was chained to a dead man, Major. Ask him.");
  } });
  let ready = false;
  hot({ id: 'mannix', actor: mannix, r: 1.3, label: 'Lay it out', fn: function* () {
    const k = yield* S.choose(`I've got ${S.clueCount()} of 5 things that don't add up. Lay it out now?`, ['Lay it out', 'Not yet'], 1, 'warren');
    if (k === 0) ready = true;
  } });
  yield* h8.goal('Investigate. Talk to Mannix when ready (Notebook: ' + (S.input.device === 'pad' ? 'BACK' : 'TAB') + ')', () => ready, ['rules', 'stew', 'chair', 'crack', 'mannix']);
  iso.clearHot();
  // the Reckoning
  yield* walk(W, 4.0, 7.9);
  look(W, cast.bob);
  yield* S.bars(true, 20);
  S.music('duel');
  yield* say('warren', "All right, Bob. Let's talk about Minnie.");
  const claims = [
    ["Bob says Minnie went to see her mother. Then how come...", 'mare', "...her mare's still in the stable? Minnie don't walk across a mountain in a blizzard."],
    ["And she left a stranger in charge? Here's what I know about Minnie...", 'rules', "...nobody behind her counter but her and Dave. Not you. Not ever."],
    ["Then there's the General...", 'chair', "...sat in Sweet Dave's chair. Minnie'd have thrown him in the snow."],
    ["Bob, you say Minnie left four days ago. Then who...", 'stew', "...cooked this stew? It's her recipe, and it was made this morning."],
    ["And one last thing...", 'bean', "...somebody was eating jelly beans in here today. Somebody who's hiding. Somebody who ain't standing here."],
  ];
  let right = 0;
  for (const [claim, ans, payoff] of claims) {
    if (!S.clueCount()) break;
    const ok = yield* S.reckon(claim, ans);
    if (ok) { right++; S.sfx('clue'); yield* say('warren', payoff); }
    else { S.sfx('miss'); yield* say('mannix', S.pick(["That don't prove nothin', Major.", "Gettin' your clues tangled, old man.", "Huh? What's that got to do with anything?"])); }
  }
  if (right >= 4) yield* say('mannix', "...Damn. You got him dead to rights, Major.");
  else if (right >= 2) yield* say('mannix', "Thin, Major. But I'll be damned if it ain't adding up.");
  else yield* say('warren', "I ain't got it all laid out pretty. But I know Minnie, and you ain't her friend, Bob.");
  yield* say('bob', "...You are a crazy man!");
  yield* say('warren', "Where's Minnie, Bob?");
  h8.shoot(W, cast.bob);
  yield* h8.kill(cast.bob, { from: W });
  yield* S.bars(false, 20);
  yield* say('warren', "Now. Somebody poisoned that coffee. I'm gonna count to three.");
  yield* say('daisy', "Don't you dare say a word, any of you.");
  yield* say('warren', "One. Two...");
  look(cast.gage, W);
  yield* say('gage', "It was me! I did it! I put it in the pot!");
  yield* say('warren', "Well, now. Ain't that--");
  // from under the floor
  S.sfx('rifle'); iso.cam.shake = 14; W.flash = 14;
  for (let i = 0; i < 6; i++) iso.emit({ x: W.x, y: W.y, z: 0.1, vx: (Math.random() - 0.5) * 0.04, vy: (Math.random() - 0.5) * 0.04, vz: 0.05, g: 0.006, col: 'wd3', life: 50 });
  yield 10;
  yield* h8.kill(W, { spray: 16, poolR: 0.45 });
  yield* say('mannix', "Major!! Somebody's under the floor!");
  yield* S.fadeOut(10);
  yield 40;
} };

// =====================================================================================================
// 5 · THE FOUR PASSENGERS
// =====================================================================================================
S.CH[5] = { title: 'The Four Passengers', sub: "Earlier that morning. Minnie's Haberdashery.", *run() {
  Object.keys(talked).forEach(k => delete talked[k]);
  h8.room('minnie_am', { music: 'morning' });
  const sp = iso.room.spots;
  const minnie = h8.spawn('minnie', sp.bar[0], sp.bar[1], 'sw');
  const dave = h8.spawn('dave', sp.dave[0], sp.dave[1], 'se', { pose: 'sit' });
  const gemma = h8.spawn('gemma', 1.7, 2.6, 'nw');
  const ed = h8.spawn('ed', 6.7, 7.4, 'ne');
  const charly = h8.spawn('charly', 3.3, 6.6, 'ne');
  const smithers = h8.spawn('smithers', sp.seat_a[0], sp.seat_a[1], 'se', { pose: 'sit' });
  const J = h8.spawn('judy', sp.door[0], sp.door[1] + 0.6, 'se');
  iso.follow(J, true);
  yield* S.fadeIn(40);
  yield* say('minnie', "Six-Horse Judy! Shake the snow off and come get warm, girl!");
  yield* say('judy', "Mornin', Minnie! Got four passengers in the coach, freezin' their tails off. Thought I'd say hello first.");
  yield* say('dave', "Coffee's on, Judy. Minnie's makin' her stew.");
  S.player.spawn(J);
  hot({ id: 'minnie', actor: minnie, r: 1.6, label: 'Talk', fn: function* () {
    yield* say('minnie', "Help yourself to the jelly beans, sugar. But mind my counter: nobody behind it but me and Dave.");
    mark('minnie');
  } });
  hot({ id: 'dave', actor: dave, r: 1.3, label: 'Talk', fn: function* () {
    yield* say('dave', "Don't even think about it, Judy. This chair's mine. Minnie says so.");
    mark('dave');
  } });
  hot({ id: 'gemma', actor: gemma, r: 1.2, label: 'Talk', fn: function* () {
    yield* say('gemma', "Judy! Sit down and I'll play you somethin'. I learned a new one, mostly.");
    mark('gemma');
  } });
  hot({ id: 'ed', actor: ed, r: 1.2, label: 'Talk', fn: function* () {
    yield* say('ed', "Hey, Judy. Snow's comin' in hard. You stayin' the night?");
    mark('ed');
  } });
  hot({ id: 'charly', actor: charly, r: 1.2, label: 'Talk', fn: function* () {
    yield* say('charly', "Mornin'. I'll see to your horses soon as the coffee's in me.");
    mark('charly');
  } });
  hot({ id: 'smithers', actor: smithers, r: 1.2, label: 'Talk', fn: function* () {
    yield* say('smithers', "Madam. Lovely morning, if one likes snow.");
  } });
  hot({ id: 'stew', x: sp.stove_front[0], y: sp.stove_front[1], z: 1.2, r: 0.9, label: 'Smell the stew', fn: function* () {
    yield* say('judy', "Mmm. Minnie's stew. Nobody else on this mountain makes it like that.");
  } });
  const hello = ['minnie', 'dave', 'gemma', 'ed', 'charly'];
  yield* h8.goal('Say good morning to everybody', () => hello.every(k => talked[k]), hello);
  iso.clearHot();
  // the jelly bean
  let ate = false;
  hot({ id: 'candy', x: sp.candy[0], y: sp.candy[1], z: 1.8, r: 0.8, label: 'Grab a jelly bean', fn: function* () {
    S.sfx('clink');
    yield* say('judy', "Don't mind if I do...");
    const bean = h8.spawn('bean', sp.candy[0], sp.candy[1], 'se', { sprite: 'fx_bean', z: 1.15, solid: false, shadow: false, bias: 0.02 });
    // a red one gets away: falls, bounces, rolls into the crack
    let vz = 0.02, n = 0;
    const [tx, ty] = sp.crack;
    while (n++ < 90) {
      bean.x += (tx - bean.x) * 0.05; bean.y += (ty - bean.y) * 0.05;
      vz -= 0.006; bean.z += vz;
      if (bean.z < 0) { bean.z = 0; vz = -vz * 0.45; if (Math.abs(vz) > 0.006) S.sfx('click'); }
      yield 1;
    }
    bean.x = tx; bean.y = ty; bean.z = 0;
    bean.mode = 'flat';
    yield 20;
    yield* say('judy', "Oop. That one's the floor's now. Right in the crack.");
    ate = true;
  } });
  yield* h8.goal('Help yourself to a jelly bean', () => ate, ['candy']);
  iso.clearHot();
  yield* say('minnie', "Judy, you go fetch those poor passengers before they freeze to your coach.");
  yield* say('judy', "Yes ma'am.");
  yield* walk(J, sp.door[0], sp.door[1] + 0.35);
  J.visible = false; S.sfx('door');
  yield 40;
  // the four passengers
  S.music(null);
  const gang = [['jody', 0.0], ['bob', -0.5], ['gage', 0.5], ['mobray', 1.0]].map(([n, o], i) => h8.spawn(n, sp.door[0] + o * 0.4, sp.door[1] + 0.35, 'se', { visible: false }));
  J.visible = true; S.sfx('door');
  yield* walk(J, sp.door[0] - 0.4, sp.door[1] + 1.6);
  for (const [i, g] of gang.entries()) { g.visible = true; S.run(walk(g, sp.door[0] - 1.2 + i * 0.9, sp.door[1] + 1.4 + (i % 2) * 0.6), { block: false }); yield 14; }
  yield 50;
  eyesOn(gang[0], ['minnie', 'gemma', 'ed', 'charly', 'judy']);
  yield* say('jody', "Mornin', folks. Real cozy little place. Mind if we warm up?");
  yield* say('minnie', "...Judy? Who are your friends?");
  yield* S.bars(true, 30);
  yield* S.narrate("They weren't her friends. Jody Domergue had come over the mountain for his sister, and he needed this cabin empty by the time Ruth's coach arrived.");
  yield* S.fadeOut(10);
  S.sfx('gun'); yield 18; S.sfx('gun'); yield 10; S.sfx('rifle'); yield 30; S.sfx('gun'); yield 60;
  yield* S.narrate("General Smithers was spared, for keeping his mouth shut. Nobody else was.");
  // aftermath: the gang takes its places. The dead are gone from the room, out to the woodshed.
  for (const a of [minnie, dave, gemma, ed, charly, J]) iso.remove(a);
  const [jody, bob, gage, mobray] = gang;
  jody.x = 4.4; jody.y = 4.0; bob.x = sp.bar[0]; bob.y = sp.bar[1]; gage.x = 9.4; gage.y = 3.2; mobray.x = 7.6; mobray.y = 7.2;
  smithers.x = sp.dave[0]; smithers.y = sp.dave[1];
  yield* S.bars(false, 1);
  yield* S.fadeIn(40);
  yield* say('jody', "Bob, get behind that counter. You're runnin' the place now, Minnie went to visit her mother.");
  yield* say('bob', "Si, si. I know the story.");
  yield* say('jody', "General, you just sit right there in that big chair and keep doin' what you do best. Nothin'.");
  look(gage, gang[0]);
  yield* say('jody', "Gage. Pistol under the table, where Daisy can reach it.");
  yield* walk(gage, 9.4, 3.55, { face: 'se' });
  S.sfx('click'); yield 30;
  yield* walk(gage, sp.gage[0], sp.gage[1] - 0.6);
  gage.x = sp.gage[0]; gage.y = sp.gage[1]; gage.pose = 'sit'; gage.facing = 'nw';
  yield* walk(mobray, sp.mobray[0] - 0.6, sp.mobray[1]);
  mobray.x = sp.mobray[0]; mobray.y = sp.mobray[1]; mobray.pose = 'sit'; mobray.facing = 'nw';
  yield* say('mobray', "Splendid. I'll be the hangman, I'm told. I've always rather fancied the hat.");
  yield* say('bob', "Jody! A coach! Comin' up the road.");
  yield* say('jody', "That's John Ruth's coach. My sister's on it. Places, boys.");
  // Jody goes down into the cellar
  const hatch = h8.spawn('hatch', sp.cellar[0], sp.cellar[1], 'se', { sprite: 'fx_hatch', mode: 'flat', solid: false, shadow: false, bias: 0.01 });
  S.sfx('creak');
  yield* walk(jody, sp.cellar[0], sp.cellar[1] + 0.05);
  for (let i = 0; i < 16; i++) { jody.z -= 0.08; yield 3; }
  jody.visible = false;
  S.sfx('creak'); iso.remove(hatch);
  yield 40;
  yield* say('jody', "(Not a word, General. I'll be listenin'.)", { name: 'Jody (under the floor)' });
  yield* S.fadeOut(60);
} };

// =====================================================================================================
// 6 · BLACK MAN, WHITE HELL
// =====================================================================================================
S.CH[6] = { title: 'Black Man, White Hell', sub: 'Back to the present. The shot from under the floor.', *run() {
  h8.room('minnie', { music: 'tension' });
  const sp = iso.room.spots;
  h8.spawn('boards', sp.door[0] + 0.15, sp.door[1] - 0.25, 'se', { sprite: 'fx_boards', z: 0.6, solid: false, shadow: false, bias: 0.02 });
  h8.corpse('smithers', sp.dave[0] + 0.3, sp.dave[1] + 0.8);
  h8.corpse('ob', 6.9, 6.3);
  h8.corpse('ruth', sp.seat_a[0], sp.seat_a[1] + 0.3);
  h8.corpse('bob', 1.4, 6.9);
  // Warren is down, but not out: he plays from the floor
  const W = h8.spawn('warren', 4.0, 7.9, 'nw', { sprite: 'warren_dead', pose: 'dead', mode: 'flat', solid: false, bias: 0.03 });
  iso.splat(4.1, 7.85, 0.4, 'rd1', 5);
  const mannix = h8.spawn('mannix', 4.4, 6.9, 'nw');
  const mobray = h8.spawn('mobray', 1.4, 7.7, 'se');
  const gage = h8.spawn('gage', 1.4, 8.5, 'se');
  const daisy = h8.spawn('daisy', 1.4, 9.3, 'se');
  iso.look(3.2, 7.6, 0.9, true);
  yield* S.fadeIn(40);
  yield* say('warren', "Hnngh... Mannix. Mannix, keep your gun on 'em. Shooter's under the floor.");
  yield* say('mannix', "I got 'em, Major. Ain't nobody movin'.");
  yield* say('daisy', "Ha! Look at the big Major now. Bleedin' on Minnie's floor.");
  yield* say('mobray', "Gentlemen. Surely we can all come to an... arrangement.");
  look(mobray, W);
  // Mobray goes for it
  yield* S.duel(W, mobray, { wait: [60, 140], window: 40, zone: 11,
    earlyLine: "Steady... the Englishman's got a hideaway gun. Wait for it.", slowLine: "Damn, he's quick. Again." });
  yield* say('mannix', "Hellfire. Two down.");
  // Gage edges for the pistol under the table
  yield* say('gage', "...Easy, Sheriff. I'm just gettin' my book.");
  yield* walk(gage, 2.2, 7.7);
  yield* say('warren', "That ain't where your book is, Joe Gage.");
  yield* S.duel(W, gage, { wait: [40, 120], window: 34, zone: 10,
    earlyLine: "Not yet. Let him show his hand.", slowLine: "Too slow. My hands ain't what they were. Again." });
  // Jody
  yield* say('warren', "Daisy. Call your man up out of that hole. Or the Sheriff starts on you.");
  yield* say('daisy', "...Jody? Jody, honey. Come on up. They got me.");
  const hatch = h8.spawn('hatch', sp.cellar[0], sp.cellar[1], 'se', { sprite: 'fx_hatch', mode: 'flat', solid: false, shadow: false, bias: 0.01 });
  S.sfx('creak');
  const jody = h8.spawn('jody', sp.cellar[0], sp.cellar[1] + 0.05, 'se', { z: -1.2 });
  iso.look(sp.cellar[0], sp.cellar[1] + 1.5);
  for (let i = 0; i < 15; i++) { jody.z += 0.08; yield 3; }
  jody.z = 0;
  yield* walk(jody, sp.cellar[0] + 0.2, sp.cellar[1] + 0.8);
  look(jody, mannix);
  yield* say('jody', "All right, all right. Hands where you can see 'em. Nobody needs to--");
  yield* say('mannix', "You're the fella shot the Major.");
  yield* S.duel(mannix, jody, { wait: [40, 100], window: 40, zone: 12,
    earlyLine: "Hold up, Chris. Let him make the first move.", slowLine: "Close. Too close. Again." });
  iso.remove(hatch);
  iso.look(2.6, 8.2);
  look(daisy, mannix);
  yield* say('daisy', "...Jody... You'll pay for that. Listen to me, Sheriff. Just listen.");
  yield* say('daisy', "There's fifteen men waiting in Red Rock. My brother's gang. They'll ride up here and kill you dead.");
  yield* say('daisy', "Unless you shoot the Major. Do that, and I tell 'em you're with us. You live.");
  const k = yield* S.choose("Mannix weighs it:", ["Fifteen men? ...Keep talkin'.", "Lady, you're a liar."], null, 'mannix');
  if (k === 0) {
    yield* say('mannix', "Fifteen men...");
    yield* say('warren', "Chris. Look at me. She'll say anything.");
    yield* say('mannix', "...Yeah. I reckon she would.");
  }
  yield* say('mannix', "I'd sooner take my chances with the Major than with a Domergue's word.");
  yield* say('warren', "John Ruth was the Hangman. He'd want her to hang.");
  yield* say('mannix', "Then by God, she hangs. Sheriff of Red Rock's first official act.");
  // the hanging is not shown
  yield* S.bars(true, 30);
  yield* S.fadeOut(40);
  S.music(null);
  yield 40; S.sfx('chain'); yield 70; S.sfx('creak'); yield 80; S.sfx('creak'); yield 100;
  yield* S.narrate("John Ruth got his hanging.");
  iso.remove(daisy);
  yield* S.fadeIn(40);
  yield* S.bars(false, 20);
  S.music('letter');
  // Mannix sits down by Warren
  yield* walk(mannix, 4.6, 8.0);
  mannix.pose = 'sit'; mannix.facing = 'sw'; mannix.bias = 0.32;
  yield* say('mannix', "Major. Can I read that letter? The Lincoln one?");
  yield* say('warren', "...Go on.");
  S.sfx('page');
  yield* S.card({ title: 'A Letter', text: "Dear Marquis,\nI hope this finds you well. I am well, though time moves slow and things are changing. Then I read of your exploits and I am proud to call you a friend.\nMary Todd is calling for me. I suppose it is time to turn in.", sign: 'Your friend, Abraham Lincoln' });
  yield* say('mannix', "...Mary Todd. That's a nice touch.");
  yield* say('warren', "Heh. Ain't it, though.");
  yield* S.fadeOut(120);
  yield* S.card({ title: 'The End', text: "Thanks for playing.\n\nA fan-made game after The Hateful Eight (2015).\nPixel art, music and code made for Leafy." });
} };
})();
