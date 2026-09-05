# Stage 11.7 24-Game Rebuild Blueprint

## Purpose and authority

This blueprint is a build contract for the post-audit fan-out. It does not rebuild a game. It converts the existing adapters, protocol, catalog, and calibration evidence into small, reviewable game slices. The server adapter and executable tests are the rules authority; the public/own snapshot split is the privacy authority; the KPK and Kendim calibration records are reference landscapes for principles only. A UI mock, stale catalog sentence, or local animation may not override those authorities.

The 24 catalog IDs are the exact IDs in `packages/shared/src/index.ts`. `kendim` and `kontrol-paneli-kaosu` are reference-calibrated and are included to keep the master matrix complete; they are not included in the 22-game rebuild batches. `rus-ruleti` and `kor-bomba` retain their landscape exception. Every other game is portrait-first unless its contract explicitly adds a landscape QA view.

## Shared contract every game must consume

Each implementation must use `GameViewport`, `OrientationGate`, safe-area CSS, the shared HUD/timer/avatar primitives, the phase engine, the authoritative result payload, the ACK reducer, and the target/roster eligibility helper. It must declare:

* phase and timer source, including manual completion and timeout behavior;
* action kind, whether input is single, repeatable, or batch, client sequence, duplicate policy, and negative-ACK recovery;
* participant, connected, eliminated, role, and self-target eligibility;
* public, own, and result fields, including spectator behavior;
* reconnect behavior (pending clears to neutral, then authoritative own state rehydrates);
* orientation, density budget, keyboard-safe layout, and screenshot matrix;
* signature object, feedback states, success/failure language, and a truthful result visualization.

The shared patch gate from the master audit (transactional adapter submit, ACK reducer, target contract, active roster/disconnect policy, monotonic state version, and adapter-owned submission status) must land before any batch branch is called ready.

## Game contract cards

The cards below are intentionally implementation-ready but visual-design independent. “Private” always means unavailable to public/spectator snapshots until the stated result boundary.

### 1. `yazi-yaz` — hidden writer, public bluff board

* Rule/timer: two shuffled writers write for 30 s; discussion is 60 s; guesses are 30 s; one writer word and one innocent response are accepted per player.
* Input/targets: `yazi-word`, `yazi-masum`, and one `yazi-guess`; guess target must be another live writer. Single writes require the transactional duplicate fence.
* State/privacy/result: writer role, word, entry, and guess intent are own/private; the board reveals entries, guesses, roles, and scores at result. Spectators see the public board only.
* Signature object: a stack of anonymous paper slips with a mechanical “ink reveal” rail; no generic hero panel.
* Feedback: empty slip → typing/pending ink → accepted sealed slip; rejected duplicate leaves the slip editable with an explicit reason; result flips slips to names.
* Responsive/QA: portrait-first, 390x844 and 320x700 card rail; 390x520 keyboard must scroll the writing surface without hiding submit; landscape smoke at 844x390.
* Shared/game-specific: shared text input, ACK, roster, timer, and result rail; game-specific anonymous slip, writer reveal, and guess map. The signature object, not a generic family illustration, carries the rule.

### 2. `kendim` — calibrated portrait card matching (reference only)

* Rule/timer: private card writing for 30 s, then matching for 30 s; each participant submits a batch of card-to-word matches once.
* Input/targets: target must be connected, current-game, non-eliminated, and not the owner’s own card; duplicate mappings and stale owners are rejected and pruned.
* State/privacy/result: own card/word and pending mapping are private; words/cards and final matches become public at result. Reconnect is neutral and waits for own authoritative state.
* Signature object: the existing genuine 4x2 portrait card board is the calibration reference, not a template for other games.
* Feedback/QA: retain the accepted pending/negative-ACK behavior validated at 390x844, 320x700, and 390x520 keyboard; do not regress it while generalizing shared primitives.

### 3. `sizma` — clue leak and outsider vote

* Rule/timer: two clue rounds are turn-based, followed by a ready-for-vote barrier and a 30 s vote. Outsider/common words are determined by the adapter.
* Input/targets: one clue for the active turn, ready signal, then one vote; vote target must be a connected current participant and duplicate votes are rejected. The disconnect policy must skip or auto-neutralize a missing clue/ready seat.
* State/privacy/result: role and secret words remain own/private; clue turn is public but answers and votes are hidden until result. Result identifies outsider/common words and score explanation for spectators.
* Signature object: a leaking pipe/valve carrying one clue token at a time; the outsider indicator stays covered until reveal.
* Feedback: locked valve for non-active players, flowing token for active clue, pending vote marker, rejected stale target, and a sealed reveal board.
* Responsive/QA: portrait-first clue lane; test long clues at 320x700 and keyboard-safe vote controls at 390x520; landscape smoke is optional but run if supported.
* Shared/game-specific: shared turn/timer/ACK/target/result; game-specific clue valve, ready barrier, outsider reveal, and missing-seat policy.

### 4. `sozluk-blofu` — dictionary truth versus bluff

* Rule/timer: one dictionary definition is written for 50 s; players choose among opaque definitions for 30 s.
* Input/targets: one bluff write and one choice; choice cannot be the player’s own bluff and must reference a connected owner. Transactional duplicate protection is mandatory for the write path.
* State/privacy/result: own bluff and role stay private; dictionary word is public, definitions remain opaque, and real-definition owner/bluff owners reveal only at result. Spectators see the final definition board and points.
* Signature object: a rotating dictionary drawer with numbered definition cards; opaque IDs remain visually distinct without exposing authors.
* Feedback: card draft → pending stamp → rejected duplicate/editable; choice highlights only after accepted ACK; result uses a “true definition” seal.
* Responsive/QA: portrait list with 70-character definition wrapping; 390x520 keyboard and 320x700 scroll are required; no horizontal card overflow.
* Shared/game-specific: shared text/card/ACK/result; game-specific opaque definition identity and truth seal. Do not reuse generic premium hero art.

### 5. `cagrisim-agi` — association group graph

* Rule/timer: one answer is submitted during a 30 s answer phase; matching answers form groups and score by group size.
* Input/targets: one normalized answer per participant; no target selection. Duplicate submissions are rejected before adapter mutation.
* State/privacy/result: own answer is private until result; main word and phase are public. Result draws answer groups and applies the adapter’s group-size points.
* Signature object: elastic word nodes that snap into a visible graph only during result.
* Feedback: empty node → pending pulse → accepted hidden node; duplicate rejection preserves the first answer; matching-group animation occurs only after reveal.
* Responsive/QA: portrait graph must degrade to a vertical lane at 320x700; keyboard-safe answer field at 390x520; test long answers and reduced motion.
* Shared/game-specific: shared text input/ACK/timer/result; game-specific graph grouping, group-size score, and reveal choreography.

### 6. `butona-bas` — timing-window button race

* Rule/timer: a 45 s round contains 150 x 300 ms tap windows; taps in the same window deduplicate, singleton windows lose a point, and multi-tap windows score before final rank awards.
* Input/targets: repeatable tap action keyed by window/sequence; no player target. Late taps are rejected; a repeatable action never uses one global `hasSubmitted` lock.
* State/privacy/result: window counts and timing detail remain own/private during play; result reveals window/rank summary and scores.
* Signature object: a physical arcade button with a moving timing aperture and a heat gauge.
* Feedback: ready aperture, pending click ring, accepted window lock, late/rejected flash, and result combo/rank ladder; haptics are optional.
* Responsive/QA: thumb-zone portrait control at all three portrait heights; landscape at 844x390/667x375; keyboard Enter/Space must not double fire.
* Shared/game-specific: shared timer/ACK/reduced motion/result; game-specific 300 ms window visualizer and ranking explanation.

### 7. `rus-ruleti` — private-risk revolver (landscape exception)

* Rule/timer: a random holder faces an 18 s shot turn; safe shots add 10 risk up to 76, an explosion removes the target and resets risk, and play ends when survivors reach the adapter threshold.
* Input/targets: one `russian-shot` per turn; target must be connected and live; self-target is allowed by the adapter. Hidden risk is never sent to public state.
* State/privacy/result: only current-holder risk/outcome is own/private; holder and safe-shot signal can be public. Result reveals shot sequence, explosion, survivors, and score.
* Signature object: a landscape revolver cylinder with a covered risk meter; the cover never lifts before result.
* Feedback: holder turn, pending chamber click, safe/explosion response, disconnected-target rejection, and survivor result board.
* Responsive/QA: landscape-first fullscreen at 844x390 and 667x375; portrait is blocked by orientation gate; test spectator redaction and reduced-motion explosion.
* Shared/game-specific: shared landscape viewport/target/ACK/result; game-specific hidden-risk cylinder and survivor threshold.

### 8. `gizli-hirsiz` — one-press hidden thief

* Rule/timer: a 30 s phase permits one press; exactly one press scores +1, more than one press makes all pressers lose, and no press is neutral.
* Input/targets: one single press, no target; duplicate and late presses are rejected.
* State/privacy/result: role and `hasPressed` are own/private during play; pressed IDs and outcome reveal at result.
* Signature object: a locked vault with one anonymous fingerprint slot.
* Feedback: unpressed lock, pending fingerprint, accepted sealed lock, rejected late press, and result count/penalty stamp.
* Responsive/QA: one large 44 px+ control in portrait; test 320x700, keyboard focus, spectator result, and reduced motion.
* Shared/game-specific: shared single-action ACK/timer/result; game-specific vault and “exactly one” outcome visualization.

### 9. `kor-kronometre` — blind stopwatch

* Rule/timer: an 18 s phase asks each player to stop near a 10 s target; nearest receives +2 and second nearest +1, with missing treated as 18 s.
* Input/targets: one stop action, no target; first accepted stop wins and late stop rejects.
* State/privacy/result: own timestamp remains private; result reveals times, distance from target, rank, and points.
* Signature object: a covered analog stopwatch whose hand is visible only to its owner.
* Feedback: covered ticking, pending stop pin, accepted frozen hand, late rejection, and result target-ring comparison.
* Responsive/QA: portrait-first giant timer; keyboard Space and narrow-height layout; no timer clipping at 320x700 or 390x520.
* Shared/game-specific: shared timer/ACK/result; game-specific hidden hand and target-ring result.

### 10. `kor-bomba` — connected pass-or-explode (landscape exception)

* Rule/timer: a random holder has a hidden 15–20 s fuse; passing adds a random 1–4 s, with an absolute 45 s cap; the final holder loses a point.
* Input/targets: repeatable `bomb-pass` to a connected, non-self live target; each accepted pass updates holder/pass count; disconnected holder is replaced by a live player.
* State/privacy/result: fuse and exact expiry remain private; holder/pass count may be public; explosion holder and score reveal at result.
* Signature object: a landscape bomb with covered fuse and a visible handoff cable.
* Feedback: holder glow, pending pass cable, accepted handoff, rejected stale target, cap warning, and result explosion timeline.
* Responsive/QA: landscape-first at required landscape sizes; portrait is orientation-gated; target tray must not obscure fuse-free public state.
* Shared/game-specific: shared target/ACK/roster/result; game-specific hidden fuse, handoff cable, and cap indicator.

### 11. `rusvet-darbe` — election, tie, and budget allocation

* Rule/timer: election lasts 20 s; ties enter 20 s RPS rounds until decisive; a president distributes an exact vote budget in a 25 s allocation phase.
* Input/targets: one vote, repeated RPS rounds, then one batch distribution with 1–2 points per recipient and total ≤ budget; disconnected candidates are pruned. Batch validation must be side-effect free.
* State/privacy/result: role, vote intent, RPS choice, and allocations are own/private; candidate IDs may be public during a tie, while president/votes/allocations reveal at result.
* Signature object: a parliament desk with sealed ballots, a duel coin, and a budget ledger.
* Feedback: sealed ballot pending, tie-round reveal, budget remaining, rejected over-budget batch, and result ledger with exact conservation check.
* Responsive/QA: portrait ledger scroll at 320x700 and keyboard-safe numeric controls at 390x520; test 3–8 players and no horizontal overflow.
* Shared/game-specific: shared phase/ACK/batch/target/result; game-specific RPS tie loop and exact budget ledger.

### 12. `acgozluluk-limiti` — greed against a player-count limit

* Rule/timer: 20 s; each player chooses an integer 0..N; player-count-specific limit is `{3:6,4:11,5:17,6:24,7:33,8:43}`; if total is within limit each receives their value, otherwise all receive zero.
* Input/targets: one numeric choice, no target; first valid value wins, invalid/late input rejects.
* State/privacy/result: choices are private during play; result reveals all choices, limit, total, pass/fail, and points.
* Signature object: a transparent communal scale with a red limit line.
* Feedback: slider/stepper pending, accepted locked value, range rejection, over-limit wobble, and result scale balance.
* Responsive/QA: thumb-friendly stepper at 320x700; keyboard arrows/number input at 390x520; test all supported player counts.
* Shared/game-specific: shared numeric input/ACK/timer/result; game-specific limit table and communal scale.

### 13. `ortalamanin-yarisi` — crowd average target

* Rule/timer: 20 s; choose 0..100, compare against average/2; nearest scores +2 and second nearest +1, missing inputs randomized by adapter.
* Input/targets: one numeric choice, no target; first valid input only.
* State/privacy/result: choices remain private until result; result shows choices, computed average/2 target, distance, ranks, and score.
* Signature object: a half-filled gauge with a crowd needle hidden until reveal.
* Feedback: private needle, pending lock, range rejection, and result overlay showing the target derivation—not just a winner.
* Responsive/QA: numeric keypad and keyboard at 390x520; target label must fit 320x700; reduced motion for needle sweep.
* Shared/game-specific: shared numeric/ACK/result; game-specific average calculation and half-target visualization.

### 14. `gizli-kareler` — collision-elimination grid

* Rule/timer: two rounds of 20 s; board is 3x3 for ≤4 players and 4x4 above 4; shared cells eliminate colliders, solos score +1; early-finish rules apply when all collide or only one survives.
* Input/targets: one cell per round, no target; selection is private and round advances by timeout/complete policy. Disconnected seats must not stall the round.
* State/privacy/result: cell choices are private until round reveal; board and eliminated IDs are public at each reveal; final score is adapter-owned.
* Signature object: a glowing pressure grid with hidden fingerprints and collision cracks.
* Feedback: private selected cell, pending lock, stale/late rejection, collision reveal, survivor marker, and early-finish banner.
* Responsive/QA: 3x3/4x4 must fit 320x700 without target shrink below 44 px; test 3–8 players, keyboard navigation, and narrow height.
* Shared/game-specific: shared grid focus/ACK/active roster/result; game-specific collision, elimination, and early-finish explanation.

### 15. `karalama-defteri` — drawing and informed vote

* Rule/timer: draw for 75 s, then vote for 20 s; informed/ignorant roles and assigned word are hidden.
* Input/targets: repeatable drawing-save actions during drawing, then one vote to another connected participant; duplicate votes reject.
* State/privacy/result: role/word stay private; drawings become public after drawing; votes and role reveal at result. Spectator sees the gallery and truthful vote outcome.
* Signature object: a shared spiral sketchbook with page tabs and a pencil cursor.
* Feedback: stroke pending/accepted, undo/edit affordance, vote target pending, rejected stale target, gallery reveal, and informed/outsider result seal.
* Responsive/QA: canvas must remain usable at 320x700 and 390x520 keyboard; pointer and keyboard focus fallback required; landscape smoke optional.
* Shared/game-specific: shared canvas input/ACK/target/result; game-specific stroke serialization, gallery, and informed-role reveal.

### 16. `ittifak` — alliance vote

* Rule/timer: bargain phase 60 s with no score-changing input, then one target vote for 15 s; missing votes auto-randomize.
* Input/targets: one `alliance-vote` to another connected current participant; duplicate/stale/self rules follow adapter contract; removal semantics must be explicit.
* State/privacy/result: own vote intent is private; no vote graph during play; result reveals vote counts and target scores.
* Signature object: interlocking handshake tiles that remain face-down until result.
* Feedback: bargain timer, pending handshake, rejected target, accepted sealed alliance, and result link graph.
* Responsive/QA: portrait target list at 320x700; keyboard-safe list at 390x520; test missing-vote randomization and spectator result.
* Shared/game-specific: shared target/ACK/result; game-specific alliance graph and missing-vote explanation.

### 17. `son-kisi` — last escape timing

* Rule/timer: hidden finish deadline is randomized to 10–20 s; each player may escape once; last escape scores +1, early escapes score 0, non-escaped players lose 1, and same-millisecond ties all score +1.
* Input/targets: one escape, no target; server owns the hidden deadline and must reject a reconnecting non-participant or late action.
* State/privacy/result: own escape timestamp is private; deadline, choices, and times are withheld during play; result reveals the timeline and tie policy.
* Signature object: a dark room with a single exit latch and an unmarked clock shadow.
* Feedback: latch closed, pending escape, accepted timestamp seal, late rejection, and result timeline with last-player marker.
* Responsive/QA: large portrait latch at all heights; test reconnect during play, 390x520 keyboard, and no disclosure of `phaseEndsAt`.
* Shared/game-specific: shared single-action ACK/roster/result; game-specific hidden deadline and same-ms tie visualization.

### 18. `cizgiyi-gecme` — unique bucket crossing

* Rule/timer: 30 s; choose 0..100, bucket by floor(value/10) with 100→10; unique highest bucket gets +2 and second unique +1, duplicate buckets are passive.
* Input/targets: one numeric choice, no target; first valid choice only.
* State/privacy/result: number/bucket is private until result; result reveals bucket occupancy, unique winners, and score.
* Signature object: a finish line made of numbered lanes that reveal occupancy late.
* Feedback: private lane marker, pending lock, range rejection, duplicate-lane warning only after result, and result race ribbon.
* Responsive/QA: 0–100 input fits 320x700; keyboard and stepper at 390x520; test 100 edge mapping and tie/duplicate cases.
* Shared/game-specific: shared numeric/ACK/result; game-specific bucket mapping and unique-lane result.

### 19. `gizli-alisveris` — hidden cart budget

* Rule/timer: 30 s; products are public, each cart is private, budget is 60, product value is divided by buyer count, and highest basket scores +1.
* Input/targets: repeatable product toggle actions, no target; each accepted toggle is action-sequenced, and over-budget state is rejected or visibly constrained without losing prior accepted cart.
* State/privacy/result: products/counts are public; own cart and total remain private until result; result reveals carts, buyer counts, adjusted totals, and winner.
* Signature object: a market conveyor with anonymous baskets and a budget receipt.
* Feedback: item add/remove pending, budget meter, rejected over-budget toggle, accepted cart seal, and result receipt comparison.
* Responsive/QA: product grid collapses to a vertical list at 320x700; keyboard tab/space at 390x520; long product names wrap.
* Shared/game-specific: shared repeatable ACK/result/product primitives; game-specific budget and division math visualization.

### 20. `asiri-yukleme` — energy overload and arm window

* Rule/timer: repeat clicks fill global energy to 100; a hidden 3 s arm starts, the first post-arm click explodes that player, and click ranks determine remaining scores; if no overflow occurs, arm expiry resolves.
* Input/targets: repeatable click, no target; action sequence/window is authoritative; no exact arm time is public.
* State/privacy/result: aggregate energy and armed flag may be public, click detail/arm timestamp is private; result reveals clicks, overflow, ranks, and score.
* Signature object: a pressure reactor with a public energy bar and private redline countdown.
* Feedback: accepted click pulse, global energy rise, armed warning without timestamp, rejected late action, explosion/rank result.
* Responsive/QA: one thumb-safe reactor control; test keyboard repeat, 390x520 narrow height, reduced-motion explosion, and no arm-time leak.
* Shared/game-specific: shared repeatable ACK/timer/result; game-specific energy/arm/rank state.

### 21. `kontrol-paneli-kaosu` — calibrated landscape console (reference only)

* Rule/timer: private panel/clue assignment and one 60 s cut; correct cutter and clue holder score at result.
* Input/targets: one cut selection; pending visual must recover on negative ACK and neutralize on reconnect.
* State/privacy/result: panel/clue/cut choice are private; public result names cutter, clue holder, and points.
* Signature object: the accepted landscape control console with tactile lever and private clue display. Preserve its measured 44 px targets and spectator redaction, but do not export its layout to portrait games.

### 22. `zehirli-kadeh` — hidden poison and trade chain

* Rule/timer: poison count is 1 for ≤3 players, 2 for ≤5, 3 for ≤8; round is 20 s plus 5 s per trade; one trade per source to a connected non-self target swaps poison, and clean players score +1.
* Input/targets: one `glass-trade` source action per phase; target must be connected/current/non-self; duplicate and stale targets reject.
* State/privacy/result: own poison and trade intent are private; poison/trade graph reveal only at result. Permanent-leave rebalance semantics must be fixed before release.
* Signature object: linked ceremonial glasses with opaque liquid and a trade cord.
* Feedback: private poison silhouette, pending trade cord, accepted swap, rejected target, overtime timer, and result liquid reveal.
* Responsive/QA: portrait glass chain must scroll at 320x700; target list/keyboard at 390x520; test 3–8 player poison counts and removal.
* Shared/game-specific: shared target/ACK/roster/result; game-specific poison count, overtime, and swap visualization.

### 23. `capraz-ates` — directed crossfire graph

* Rule/timer: 25 s; each player selects one target or misses; mutual targets score 0, a player with non-mutual incoming fire loses 1, and a shooter targeting nobody gains +1.
* Input/targets: one `crossfire-target`, target connected/current/non-self; inbound target is nulled on removal.
* State/privacy/result: target intent is private; result reveals incoming counts, mutual edges, misses, and score.
* Signature object: a node-and-beam tactical board whose arrows appear only at reveal.
* Feedback: private aim reticle, pending lock, rejected stale/self target, result beam graph with mutual edges muted.
* Responsive/QA: graph collapses to a list at 320x700; keyboard target navigation at 390x520; test 3–8 player edge density.
* Shared/game-specific: shared target/ACK/result/roster; game-specific directed graph, mutual-edge rule, and incoming-count explanation.

### 24. `zaman-bombasi-hafizasi` — memory sequence and elimination

* Rule/timer: alternating display/input phases begin with a length-2 sequence; display lasts `length*500+500`, input deadline is `length*3s`; a correct active player extends the sequence, a wrong answer scores active-before players and eliminates the active player at the threshold.
* Input/targets: only the active player submits the sequence; input is a batch and must be phase/active validated. A grace-disconnected active player must be skipped or auto-neutralized deterministically.
* State/privacy/result: sequence is public only during display; current input and index are own/private; elimination status follows the adapter’s intended rule; final sequence/mistakes/score reveal at result.
* Signature object: a memory wall of light tiles with a covered input pad.
* Feedback: display playback, active-player pending keypad, wrong-sequence rejection/result, elimination marker, and surviving-player score ladder.
* Responsive/QA: tile grid fits 320x700 and keyboard navigation; test display/input timing, active disconnect, reduced motion, and spectator redaction.
* Shared/game-specific: shared phase/timer/ACK/active roster/result; game-specific sequence playback, threshold, and elimination scoring.

## Visual differentiation matrix

Every row explicitly names the nine required visual decisions. Shared components are allowed only where listed; the anti-SaaS guard is a review assertion, not optional copy.

| Game | Main interaction object | Secondary object | Player gesture | Visual feedback | Failure / success effect | Result transformation | Shared components allowed | Game-specific required | Anti-SaaS warning |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `yazi-yaz` | Anonymous paper slip | Ink stamp / writer seal | Type, seal, choose slip | Ink pulse and sealed edge | Duplicate slip reopens; valid slip seals | Slips flip to identities | HUD, timer, text field, score rail | Anonymous slip board and reveal map | No generic text form with avatars |
| `kendim` | Portrait card-to-word tether | Word tray | Drag/tap card then target | Tether glow and pending link | Invalid target snaps back; accepted link holds | Links resolve to owner/score | Viewport, HUD, ACK, result shell | Card board, tether, prune behavior | No dashboard-style matching table |
| `sizma` | Clue valve / leak pipe | Covered outsider token | Tap active clue, ready, vote | Flowing clue token | Stale clue/target rejects; correct ready opens gate | Tokens become outsider reveal | HUD, timer, target list, score rail | Clue valve, ready barrier, reveal | No survey/form skin |
| `sozluk-blofu` | Numbered definition card drawer | Truth seal | Type bluff, tap opaque card | Drawer slide and pending stamp | Own/duplicate choice rejects; true card flips | Cards reveal truth and authors | Text, ACK, result shell | Opaque definition drawer | No generic card grid without secrecy |
| `cagrisim-agi` | Elastic word node graph | Group ring | Type one answer | Node pulse; links form at result | Duplicate answer stays first; matching group snaps | Nodes cluster and score labels appear | Text, timer, score rail | Graph grouping animation | No list of identical answer pills |
| `butona-bas` | Arcade timing button | Aperture / heat gauge | Tap or keyboard press | 300 ms aperture ring | Late/window duplicate flashes; valid combo heats | Histogram and rank ladder unfold | Timer, ACK, result rail | Window visualizer and button | No plain HTML button race |
| `rus-ruleti` | Covered revolver cylinder | Risk cover / survivor token | Select live target and fire | Cylinder turn and safe pulse | Invalid target rejects; explosion shakes | Shot timeline and survivors appear | Landscape viewport, target, HUD | Cylinder, hidden-risk reveal | No tactical dashboard or FPS reticle |
| `gizli-hirsiz` | Locked vault fingerprint slot | Anonymous alarm lamp | Single press | Fingerprint pulse | Late/duplicate rejects; exact-one opens reward | Vault opens to count pressers | Timer, ACK, score rail | Vault and exact-one reveal | No generic CTA card |
| `kor-kronometre` | Covered stopwatch | Target ring | Tap stop / Space | Private hand freeze | Late stop rejects; near target glows | All hands reveal around 10 s | Timer, ACK, result rail | Stopwatch hand/target ring | No numeric input form |
| `kor-bomba` | Covered-fuse bomb | Handoff cable | Tap connected target | Cable arcs and holder glow | Stale/self target rejects; pass accepted | Handoff timeline ends in explosion | Landscape viewport, target, HUD | Hidden fuse and cable | No generic target dropdown |
| `rusvet-darbe` | Sealed parliament ballot | Duel coin / budget ledger | Vote, RPS, allocate batch | Seal, duel sparks, budget ticks | Over-budget batch rejected atomically; decisive tie glows | Ballots/duel/ledger resolve in order | Phase shell, ACK, score rail | RPS and exact ledger | No admin/table UI |
| `acgozluluk-limiti` | Communal limit scale | Greed tokens | Stepper/number entry | Scale rises with private token | Out-of-range rejects; over-limit turns red | Tokens appear and scale passes/fails | Numeric input, timer, result | Player-count scale | No spreadsheet slider panel |
| `ortalamanin-yarisi` | Hidden crowd needle | Half-target gauge | Stepper/number entry | Private needle pulse | Out-of-range rejects; closest marker glows | Needles converge on average/2 | Numeric input, timer, result | Average target gauge | No analytics chart aesthetic |
| `gizli-kareler` | Pressure-cell grid | Collision crack | Tap/keyboard cell | Private cell shimmer | Duplicate/late rejects; collisions crack | Grid flips each round and marks survivors | Grid focus, ACK, result | 3x3/4x4 collision reveal | No generic tile form |
| `karalama-defteri` | Spiral sketchbook canvas | Pencil / gallery tab | Draw strokes, vote sketch | Stroke trail and page turn | Invalid target rejects; unique outsider gets ink crown | Gallery becomes informed-role reveal | Canvas, target, ACK, result | Sketchbook/gallery | No whiteboard productivity layout |
| `ittifak` | Face-down handshake tile | Alliance cord | Tap target vote | Tile seals and cord waits | Stale target rejects; missing vote gets neutral mark | Tiles flip into vote graph | Target, timer, score rail | Handshake graph | No poll-card UI |
| `son-kisi` | Exit latch | Clock shadow | Tap escape | Latch pending timestamp | Late/reconnect invalidates; accepted latch locks | Hidden deadline and timeline reveal | Timer shell, ACK, result | Exit/timeline result | No countdown dashboard |
| `cizgiyi-gecme` | Numbered finish lanes | Race ribbon | Stepper/number entry | Private lane marker | Range rejects; duplicate lane dims at result | Unique lanes crown +2/+1 | Numeric input, timer, result | Bucket lanes | No bar-chart form |
| `gizli-alisveris` | Anonymous market basket | Conveyor / receipt | Toggle product cards | Item receipt pulse and budget meter | Over-budget toggle rejects/rolls back | Baskets open with divided totals | Product list, ACK, result | Basket/conveyor math | No ecommerce checkout UI |
| `asiri-yukleme` | Pressure reactor | Public energy bar | Rapid tap/click | Energy pulse and redline arm | Post-arm overflow explodes; no-overflow resolves | Click ranks/explosion replay | Timer, ACK, score rail | Hidden arm reactor | No KPI gauge dashboard |
| `kontrol-paneli-kaosu` | Physical control console | Private clue screen | Cut lever/tap | Spark, shake, pending lock | Negative ACK unlocks; correct cut lights | Cutter/clue result scoreboard | Landscape viewport, HUD, result shell | Console and clue | Preserve arcade console, not a SaaS panel |
| `zehirli-kadeh` | Linked ceremonial glasses | Opaque liquid cord | Tap connected trade target | Cord swap and glass glow | Stale/self target rejects; clean/poison reveal | Liquids/trades reveal chronologically | Target, timer, ACK, result | Glass chain and poison reveal | No inventory/CRM table |
| `capraz-ates` | Directed beam graph | Aim reticle | Tap one live target/miss | Private reticle and pending beam | Stale/self target rejects; mutual beam dims | All beams appear and score labels attach | Target, HUD, result shell | Directed graph | No tactical admin/FPS HUD |
| `zaman-bombasi-hafizasi` | Memory light-tile wall | Covered input pad | Watch, then tap/keyboard sequence | Playback trail and active glow | Wrong sequence eliminates; active disconnect skips/neutralizes | Sequence and eliminations replay | Phase/timer, ACK, result rail | Playback wall and threshold | No quiz/form card stack |

## Responsive and implementation-watch matrix

The following table makes the per-game viewport, density, keyboard, long-content, touch, and scrolling policy explicit. Every row still inherits the shared screenshot matrix in the batch contract.

| Game | Orientation / minimum | Density and 8-player risk | Keyboard / long-content risk | Touch target / scrolling policy | Current implementation watch |
| --- | --- | --- | --- | --- | --- |
| `yazi-yaz` | Portrait; 390x844, 320x700 | Slip rail can overflow at 8 | 70-char entry/long nickname | 44 px; slip list scrolls, input stays pinned | Adapter write mutation before generic duplicate rejection |
| `kendim` | Portrait; 390x844, 320x700, 390x520 | 4x2 reference board at 8 | Keyboard can cover word tray | 44 px; board/tray scroll policy is calibrated | Preserve ACK/pruning/reconnect reference |
| `sizma` | Portrait; 390x844, 320x700 | Clue/ready lanes crowd at 8 | Long clues wrap; keyboard vote view scrolls | 44 px; clue lane scrolls, active control pinned | Initial roster can stall clue/ready on grace disconnect |
| `sozluk-blofu` | Portrait; 390x844, 320x700, 390x520 | 8 opaque cards require vertical stack | Long definitions and keyboard | 44 px; definition list scrolls | Duplicate bluff can mutate before engine rejection |
| `cagrisim-agi` | Portrait; 390x844, 320x700 | Graph must collapse at 8 | Long answers wrap; keyboard input remains visible | 44 px; result graph scrolls vertically | Keep normalized answer private until result |
| `butona-bas` | Portrait plus landscape QA; 320x700 | One control is safe at 8; timer/rail density | Space/Enter repeat risk | 48 px; no page scroll during tap, result scrolls | Generic `hasSubmitted` cannot gate repeat windows |
| `rus-ruleti` | Landscape; 844x390, 667x375 | Survivor row and target tray at 8 | No keyboard dependency; target labels short | 44 px; target tray horizontal scroll only if needed | Hidden risk/public target boundary |
| `gizli-hirsiz` | Portrait; 320x700 | Single vault safe at 8 | No long input; keyboard focus still tested | 48 px; no play scroll, result scrolls | Private press state must not enter public DOM |
| `kor-kronometre` | Portrait; 320x700, 390x520 | Giant timer plus 8-player result rail | Space/Enter; no long copy | 48 px; result rail vertical scroll | Missing timestamp must be adapter result |
| `kor-bomba` | Landscape; 844x390, 667x375 | Target tray plus holder at 8 | No keyboard; names ellipsize safely | 44 px; target tray scrolls, stage fixed | Hidden fuse and disconnected-holder replacement |
| `rusvet-darbe` | Portrait; 390x844, 320x700, 390x520 | Ledger/tie players at 8 is critical | Numeric allocation keyboard and long names | 44 px; ledger scrolls, budget header pinned | Atomic batch budget and tie state |
| `acgozluluk-limiti` | Portrait; 320x700, 390x520 | Eight token values need compact result | Numeric keypad/stepper | 44 px; play fixed, result scrolls | Limit table must follow player count |
| `ortalamanin-yarisi` | Portrait; 320x700, 390x520 | Eight needles can overlap | Numeric keypad and target label wrap | 44 px; result gauge scrolls vertically | Missing values are not player guesses |
| `gizli-kareler` | Portrait; 320x700, 390x520 | 4x4 grid and 8 status pips | Keyboard cell navigation; no hidden overflow | 44 px cells; no horizontal scroll, result scrolls | Round can stall on initial roster disconnect |
| `karalama-defteri` | Portrait; 390x844, 320x700, 390x520 | Canvas/gallery at 8 is high density | Canvas fallback and long word/labels | 44 px tools; canvas fixed, gallery scrolls | Canvas action sequence and private role |
| `ittifak` | Portrait; 320x700, 390x520 | 8 target tiles and graph | Long names/keyboard target focus | 44 px; target list scrolls | Removal/missing-vote semantics need contract |
| `son-kisi` | Portrait; 320x700, 390x520 | Timeline at 8 after hidden deadline | No text; keyboard latch focus | 48 px; play fixed, result timeline scrolls | Reconnecting initial ID can submit without connected gate |
| `cizgiyi-gecme` | Portrait; 320x700, 390x520 | Ten lanes plus 8 markers | Numeric keyboard and 100 edge | 44 px; lanes wrap/scroll vertically | Bucket edge and unique scoring |
| `gizli-alisveris` | Portrait; 390x844, 320x700, 390x520 | Product grid and 8 result baskets | Long product names/keyboard toggles | 44 px; product list scrolls, receipt pinned | Repeat toggle needs sequence ACK |
| `asiri-yukleme` | Portrait; 320x700, 390x520 | Energy control safe; rank rail at 8 | Space/Enter repeat and hidden arm | 48 px; play fixed, result scrolls | No arm-time leak; state version for bursts |
| `kontrol-paneli-kaosu` | Landscape; 844x390, 667x375 | Console and HUD calibrated | No keyboard dependency; clue wraps | 44 px; fixed landscape stage | Negative ACK currently can leave local lock |
| `zehirli-kadeh` | Portrait; 390x844, 320x700, 390x520 | Glass chain at 8 is high density | Long names/keyboard target list | 44 px; chain and target list scroll | Poison count and leave semantics |
| `capraz-ates` | Portrait; 320x700, 390x520 | 8-node graph is high density | Long names in target list | 44 px; target list scrolls, result graph scrolls | Target invalidation and private aim |
| `zaman-bombasi-hafizasi` | Portrait; 320x700, 390x520 | Tile wall plus 8 status pips | Keyboard sequence and timer | 44 px tiles; wall fixed, result scrolls | Active disconnect can stall input phase |

## High and critical risk explanations

Every `High` or `Critical` rating in the matrix has a concrete reason:

| Game | Explanation |
| --- | --- |
| `yazi-yaz` | High private state, target validity, visual, and result complexity come from hidden writer identity/word, live-writer guesses, anonymous reveal, and three subphases; the adapter-first duplicate-write bug is P1. |
| `kendim` | High private/visual/result and responsive risk is the dense 4x2 private card board; its reference implementation already supplies the required ACK/pruning pattern. |
| `sizma` | High complexity/privacy/reconnect/target/result reflects two clue rounds, hidden outsider words, ready barrier, votes, and a grace-disconnect stall risk. |
| `sozluk-blofu` | High privacy/target/visual/result comes from opaque definitions, own-bluff exclusion, and truth/author reveal; duplicate write mutation is P1. |
| `cagrisim-agi` | Visual is High because the graph must communicate group-size scoring without leaking answers before result; other risks remain bounded by one normalized answer. |
| `butona-bas` | Complexity/visual/result are High because timing windows and rank explain more than a single button; repeatable ACK is the shared dependency. |
| `rus-ruleti` | High complexity/privacy/reconnect/target/result reflects hidden risk, live-holder transfer, explosions, elimination, and a landscape-only cylinder composition. |
| `kor-bomba` | High complexity/privacy/reconnect/target/responsive/visual/result follows hidden fuse, live handoff, cap, holder replacement, and constrained landscape space. |
| `rusvet-darbe` | Critical complexity/result and High privacy/reconnect/target/responsive/visual reflect three phases, RPS ties, exact budget batch, role secrecy, and ledger density. |
| `gizli-kareler` | High complexity/privacy/reconnect/responsive/visual/result is caused by round collision/elimination, private cells, 3x3/4x4 density, and initial-roster stall risk. |
| `karalama-defteri` | High complexity/privacy/reconnect/target/responsive/visual/result and High Canvas reflect two phases, hidden role/word, canvas, target vote, gallery, and 8-player density. |
| `ittifak` | High target/responsive/visual reflects eight target tiles, hidden vote graph, and explicit removal/missing-vote semantics. |
| `son-kisi` | High privacy/reconnect/visual/result reflects hidden global deadline, one-shot escape, timestamp/tie scoring, and reconnect validation. |
| `gizli-alisveris` | High complexity/privacy/responsive/visual/result reflects repeatable private cart actions, budget/division math, product density, and anonymous basket reveal. |
| `asiri-yukleme` | High complexity/privacy/reconnect/visual/result reflects repeat clicks, hidden arm timing, overflow elimination/rank, and burst ACK/state-version pressure. |
| `kontrol-paneli-kaosu` | High complexity/privacy/responsive/visual/result is the calibrated landscape console with a private clue and one-shot cut; its remaining P1 is negative-ACK recovery. |
| `zehirli-kadeh` | High complexity/privacy/reconnect/target/responsive/visual/result reflects poison/trade secrecy, overtime, target churn, and player-count/removal semantics. |
| `capraz-ates` | High complexity/target/responsive/visual/result reflects a private directed graph, target invalidation, 8-player edge density, and mutual/non-mutual scoring. |
| `zaman-bombasi-hafizasi` | Critical complexity/result and High privacy/reconnect/responsive/visual reflect alternating playback/input, active-only batch, elimination threshold, and active disconnect risk. |

## Result concepts (two sentences per game)

1. **Yazi Yaz.** The result freezes the anonymous slip board, then flips only the relevant slips to writer/innocent identities so players can see how guesses earned points. A compact score rail explains the writer and guess deltas without exposing a private word earlier.
2. **Kendim.** The portrait board draws accepted card-to-word matches as stable links and marks wrong links without rewriting the player’s local history. The final rail names the card owner, correct matcher, and score contribution from the adapter payload.
3. **Sızma.** Clue tokens fan into a common-word/outsider reveal, followed by the vote histogram and a clear outsider score explanation. A spectator receives exactly that public reveal and never the pre-result secret words.
4. **Sözlük Blofu.** Definition cards turn in place to show the dictionary truth and bluff authors, with a point chip beside each successful chooser. The result preserves opaque IDs until the reveal animation is complete so the causal story remains legible.
5. **Çağrışım Ağı.** Answer nodes snap into groups, and each group label states its size and resulting points. The graph is the result, not a live leak of who answered what.
6. **Butona Bas.** A timing histogram shows accepted windows, singleton penalties, and the rank ladder in one glance. The button remains a visual anchor while the score rail explains that rank was awarded by the adapter after the round.
7. **Rus Ruleti.** A landscape cylinder replays shots and the explosion, then moves the surviving tokens into a final survivor row. Risk is revealed only in this result sequence, alongside the reset and score effects.
8. **Gizli Hırsız.** The vault opens to show whether zero, one, or multiple fingerprints were submitted and applies the exact-one rule visibly. The score rail separates the single winner from the all-pressers penalty.
9. **Kör Kronometre.** Covered stopwatch hands appear together around the 10-second target ring, ordered by distance. The result calls out +2, +1, and missing-as-18-second treatment rather than showing an unexplained rank.
10. **Kör Bomba.** A handoff timeline shows each public holder/pass and ends with the explosion marker, never inventing a fuse timestamp. The final state names the last holder and the single negative score.
11. **Rüşvet Darbe.** Sealed ballots, tie-round outcomes, and the president’s budget ledger resolve in sequence. A conservation line proves the allocation sum stayed within the exact vote budget before points are displayed.
12. **Açgözlülük Limiti.** All private numbers appear above a communal scale, with the player-count limit and total clearly labeled. The result makes the all-zero over-limit branch as explicit as the successful payout branch.
13. **Ortalamanın Yarısı.** Choices fan toward a revealed average/2 needle, then nearest and second-nearest markers receive their chips. The adapter’s randomized missing values are represented as neutral “auto” tokens, not as player guesses.
14. **Gizli Kareler.** Each round flips the grid to expose collisions, solo survivors, and eliminations before the next round begins. Early-finish conditions get a dedicated banner so a short game is not mistaken for a missing result.
15. **Karalama Defteri.** Drawings form a gallery, votes pin to the sketches, and the informed/outsider reveal closes the story. The result names the unique outsider outcome or the no-unique-winner branch exactly as the adapter scored it.
16. **İttifak.** Face-down handshake tiles turn into a directed vote graph with counts and target points. Missing votes are labeled as adapter-generated so players can distinguish them from deliberate votes.
17. **Son Kişi.** A result timeline reveals the previously hidden finish deadline only after all escape timestamps are safe to show. The last escape, early escapes, non-escapers, and same-millisecond ties each receive a separate, auditable label.
18. **Çizgiyi Geçme.** Numbered lanes reveal bucket occupancy, dim duplicate lanes, and crown the highest unique bucket before the score rail appears. The 100→10 edge mapping is stated in a small rules note.
19. **Gizli Alışveriş.** Anonymous baskets open to show each cart, buyer count, divided values, and final basket total. The result explains the highest-basket point without showing private shopping decisions during play.
20. **Aşırı Yükleme.** The energy bar freezes, then the overflow click and rank order are replayed without disclosing the hidden arm timestamp early. The score rail distinguishes the exploded player, unique high click, and ties/no-overflow resolution.
21. **Kontrol Paneli Kaosu.** The calibrated console result names the cutter and clue holder, then settles the panel score in the accepted result treatment. Its private clue remains absent from spectator play until this reveal.
22. **Zehirli Kadeh.** Connected glasses reveal poison and trade edges in chronological order, followed by clean-player points. The result includes the player-count poison rule and the finalized permanent-leave policy once specified.
23. **Çapraz Ateş.** All private aims appear as directed beams; mutual pairs dim to zero while non-mutual incoming fire is highlighted. A compact side rail gives shooter-miss and target-loss points so graph reading is not required to understand the score.
24. **Zaman Bombası Hafızası.** The result replays the last public sequence, wrong input/active eliminations, and the surviving-player ladder. It never exposes an input that the adapter rejected as accepted history.

## Risk and sequencing matrix

Ratings use `Low`, `Medium`, `High`, and `Critical`. `Critical` in this matrix is a complexity/privacy label, not a claim of a P0 production incident; the shared P1 gate still dominates every row.

| Game | Complexity | Private-state risk | Reconnect risk | Target risk | Responsive risk | Visual risk | Canvas risk | Orientation | Result risk | Shared dependency | Batch/order | Blocker |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| yazi-yaz | High | High | Medium | High | Medium | High | Low | Portrait | High | ACK + atomic writes + target | D / 1 | P1-01, P1-03, P1-04 |
| kendim | High | High | Low | High | High | High | Low | Portrait | High | ACK + target | Reference | Shared ACK regression only |
| sizma | High | High | High | High | Medium | High | Low | Portrait | High | active roster + target | B / 1 | P1-04, P1-05 |
| sozluk-blofu | High | High | Medium | High | Medium | High | Low | Portrait | High | ACK + atomic writes + target | D / 1 | P1-01, P1-03, P1-04 |
| cagrisim-agi | Medium | Medium | Medium | Low | Medium | High | Low | Portrait | Medium | ACK + result groups | D / 2 | P1-03 |
| butona-bas | High | Medium | Medium | Low | Medium | High | Low | Portrait + landscape QA | High | action-sequence ACK | A / 1 | P1-03 |
| rus-ruleti | High | High | High | High | Medium | High | Low | Landscape | High | target + roster + result | B / 2 | P1-04 |
| gizli-hirsiz | Low | Medium | Low | Low | Low | Medium | Low | Portrait | Medium | ACK | A / 2 | P1-03 |
| kor-kronometre | Medium | Medium | Medium | Low | Medium | High | Low | Portrait | Medium | timer + ACK | A / 2 | P1-03 |
| kor-bomba | High | High | High | High | High | High | Low | Landscape | High | target + active roster | B / 2 | P1-04, P1-05 |
| rusvet-darbe | Critical | High | High | High | High | High | Low | Portrait | Critical | batch ACK + target + stateVersion | D / 1 | P1-03, P1-04 |
| acgozluluk-limiti | Medium | Medium | Medium | Low | Medium | Medium | Low | Portrait | Medium | numeric ACK + result | C / 1 | P1-03 |
| ortalamanin-yarisi | Medium | Medium | Medium | Low | Medium | High | Low | Portrait | High | numeric ACK + result | C / 1 | P1-03 |
| gizli-kareler | High | High | High | Low | High | High | Low | Portrait | High | active roster + round ACK | C / 1 | P1-05 |
| karalama-defteri | High | High | Medium | High | High | High | High | Portrait | High | canvas ACK + target | D / 2 | P1-03, P1-04 |
| ittifak | Medium | Medium | Medium | High | Medium | High | Low | Portrait | Medium | target + removal policy | D / 2 | P1-04, P2-06 |
| son-kisi | Medium | High | High | Low | Medium | High | Low | Portrait | High | stateVersion + connected gate | A / 2 | P1-03, P2-07 |
| cizgiyi-gecme | Medium | Medium | Medium | Low | Medium | Medium | Low | Portrait | Medium | numeric ACK | C / 2 | P1-03 |
| gizli-alisveris | High | High | Medium | Low | High | High | Low | Portrait | High | repeatable ACK + result | C / 2 | P1-03 |
| asiri-yukleme | High | High | High | Low | Medium | High | Low | Portrait | High | action-sequence ACK + stateVersion | A / 1 | P1-03, P2-01 |
| kontrol-paneli-kaosu | High | High | Medium | Low | High | High | Low | Landscape | High | ACK reducer | Reference | P1-02 |
| zehirli-kadeh | High | High | High | High | High | High | Low | Portrait | High | target + removal policy | B / 2 | P1-04, P2-06 |
| capraz-ates | High | Medium | Medium | High | High | High | Low | Portrait | High | target + result graph | B / 2 | P1-04 |
| zaman-bombasi-hafizasi | Critical | High | High | Low | High | High | Low | Portrait | Critical | active roster + batch ACK | B / 1 | P1-03, P1-05 |

## Batch-neutral acceptance language

No game is “done” when its page renders. A batch candidate is ready only when its contract tests pass, its public/own/result snapshots are reviewed, its negative ACK and reconnect states are demonstrable, its result is truthful for ties/missing/disconnects, and its screenshot matrix has no clipping or target-size failure. The batch-specific contracts, exact grouping, parallel limits, and reviewer score sheet live in `STAGE_11_7_PARALLEL_BATCH_CONTRACTS.md`.
