# The Hateful Eight — isometric pixel game (design)

A fan-made 2D isometric pixel-art adventure that follows the story and characters of *The Hateful Eight*
(2015) chapter by chapter. You play **Major Marquis Warren**. It plays as walk-and-talk exploration and an
investigation, with sudden quick-draw shootouts. All dialogue is paraphrased; the music is original chip music.

## Format
- 480×270 native, scaled ×4 to **1920×1080**. Plain JS + canvas, no build step (engine forked from Leafhollow).
- **2:1 isometric**, with 32×16 tiles and 1 tile ≈ 1 metre. Height is 20 px per tile.
- **Environments** come from `tools/iso.py`, a small ray-caster over boxes, convex shapes, cylinders,
  cones and ellipsoids. It writes clean 2:1 edges, palette-quantised face shading, hand-drawn decals and a
  **per-pixel depth map**.
- **Characters** are hand-drawn frame-by-frame sprites (32×48, feet on row 44) in 4 diagonal facings: SE/NE
  are drawn and SW/NW are mirrored. Walk cycles have 6 frames and idles have 2 (a 1px breath).
- **Compositing**: the JS renderer keeps a depth buffer. The background brings its own depth, and actors are
  upright billboards (depth = feet depth + 0.8·height), so people correctly pass behind and in front of the
  bar, the tables and the stove.

## Chapters
| Ch | Title | Where | Play |
|---|---|---|---|
| 1 | Last Stagecoach to Red Rock | Mountain road, blizzard | Warren waits on his frozen bounties. Ruth's coach arrives. You lay your guns in the snow, show the Lincoln letter, and load the bodies on the roof |
| 2 | Son of a Gun | Road → outside Minnie's | Mannix flags the coach down and says he's the new sheriff. At Minnie's you string the guide rope to the outhouse through the whiteout. In the stable you notice Minnie's own mare is still there (**clue**) |
| 3 | Minnie's Haberdashery | Inside the cabin | You nail the broken door shut. You meet Bob, Mobray, Gage and General Smithers. Looking around the room is optional, but it gives you clues for later. Warren needles Smithers until the old man goes for the gun on the table: **quick-draw** |
| 4 | Domergue's Got a Secret | Inside | The narrator card says "somebody poisoned the coffee". Ruth and O.B. die, and Warren takes charge. **Investigation**: collect clues, question the four suspects, then the **Reckoning** (pick the evidence that breaks Bob's story). Gage confesses, and a shot comes up through the floor |
| 5 | The Four Passengers | Inside, that morning (warm palette) | Flashback: you play **Six-Horse Judy**. It's a happy morning at Minnie's (jelly beans, coffee). Then the gang moves. A red jelly bean rolls into the floor crack, which is the clue from Ch. 4 |
| 6 | Black Man, White Hell | Inside, present | A wounded Warren plays from the floor. **Standoff**: Mobray, then Jody comes up from the cellar, then Daisy's offer to Mannix, and Gage going for the gun under the table. It ends with Ruth's hanging (shown as a shadow on the wall) and the letter |

## Mechanics
- **Explore**: 8-way movement (stick or keys), A to talk or examine. Prompts float over things you can use.
- **Notebook** (Tab or Select): the clues you have and what each one means. Some clues are optional, and a
  sharper Reckoning gets you extra lines.
- **Reckoning**: Warren lays out the case and you choose which clue answers each question. A wrong pick costs
  "nerve" (Mannix heckles you) but it never blocks the story.
- **Quick-draw**: time slows down and a ring closes in on the target. Fire when it locks. Each foe has a
  visible *tell* (a hand twitch) before they draw. Draw too early and you're "the one who drew first":
  try again.
- **Nail the door**: two boards, three nails each, timing taps.
- **Whiteout**: walk the rope line with your sight radius cut down by the blizzard.

## Clues (Chapters 2–4)
1. **Minnie's mare** is still in the stable (Ch. 2). She wouldn't have gone visiting without her horse.
2. **Sweet Dave's chair**: Smithers is sitting in it, and Minnie never let anyone use it.
3. **Minnie's Rules** board: "Nobody behind my counter but me and Dave."
4. **The stew** is fresh and it's Minnie's recipe, but Bob says she left days ago.
5. **A red jelly bean** stuck in the floorboards by the candy jar.

## Content notes
The film's slurs are left out. Violence is pixel blood and short, sudden shootouts. Smithers' son's story is
implied and never told.
