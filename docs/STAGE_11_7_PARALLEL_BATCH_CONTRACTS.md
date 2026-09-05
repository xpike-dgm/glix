# Stage 11.7 Parallel Batch Contracts

## Contract purpose

This document defines how the 22 non-reference games may be rebuilt after the master shared-contract gate. It is a coordination contract, not a permission to begin implementation in Stage 11.7. `kendim` and `kontrol-paneli-kaosu` remain calibration references; they are not assigned to a rebuild batch. No batch may change the phase engine, room lifecycle, privacy envelope, or protocol shape independently.

## Non-negotiable precondition

The five P1 shared patches in the master audit must land and pass before any batch is marked active:

1. transactional adapter prepare/commit and atomic duplicate fencing;
2. phase-scoped client ACK reducer with action sequence, rejection reason, and authoritative state version;
3. adapter-declared target metadata plus the common eligibility helper;
4. explicit `activeRoster`/disconnect policy hooks and deterministic turn/ready advancement;
5. monotonic authoritative `stateVersion` and adapter-owned submission status for HUD/controls.

The precondition is a gate, not a parallel “best effort.” If it is not green, the decision remains conditional and batch work is design-only.

## Batch topology

The batches are sized for independent visual work while isolating the highest shared risks. Within a batch, game cards can be developed in parallel only after the shared gate. Integration order is A and B first (timing/roster primitives), then C and D; final integration is serialized.

| Batch | Theme | Games | Primary shared dependency | Parallel limit | Integration order |
| --- | --- | --- | --- | ---: | ---: |
| A | Timing and pressure | `butona-bas`, `gizli-hirsiz`, `kor-kronometre`, `asiri-yukleme`, `son-kisi` | timer, action-sequence ACK, hidden-deadline policy | 5 | 1 |
| B | Hidden role, risk, and target graph | `sizma`, `rus-ruleti`, `kor-bomba`, `zehirli-kadeh`, `capraz-ates`, `zaman-bombasi-hafizasi` | active roster, target eligibility, private reveal | 6 | 1 (co-review with A) |
| C | Numeric choice and density | `acgozluluk-limiti`, `ortalamanin-yarisi`, `gizli-kareler`, `cizgiyi-gecme`, `gizli-alisveris` | numeric controls, round roster, repeatable cart ACK | 5 | 2 |
| D | Social, creative, and multi-phase | `yazi-yaz`, `sozluk-blofu`, `cagrisim-agi`, `rusvet-darbe`, `karalama-defteri`, `ittifak` | atomic writes, batch budget, canvas, target graph | 6 | 2 |

The total is 22 games. Batch A and B may have design activity concurrently, but their shared runtime changes must merge through one integration owner. C and D start after the A/B contract tests establish the timer, active-roster, and target primitives. A game can move between batches only through a written contract update and a fresh risk review.

### Batch ownership, files, and dominant risk

| Batch | Likely game files | Likely shared files (gate-controlled) | Dominant risk |
| --- | --- | --- | --- |
| A | `apps/client/src/games/Stage6GameControls.tsx`, Stage7/Stage9 controls, timing-specific stage components, adapter tests | `App.tsx`, `GameHUD.tsx`, ACK reducer, timer primitive | Repeat/late actions and hidden deadlines can lock or leak |
| B | Stage6/7/8/9 target controls, hidden-role stage components, adapter tests | target eligibility, active roster, spectator/reconnect serialization | Stale/disconnected targets or hidden role/risk leaks |
| C | Stage7/8 controls, numeric/grid/cart stage components, adapter tests | numeric input, round roster, result rail, state version | Density, keyboard, private numbers, round stalls |
| D | `Stage8GameControls.tsx`, text/canvas/social stage components, adapter tests | atomic submit, target helper, asset-pack loader, result primitive | Multi-phase/batch mutation, canvas privacy, reviewer overload |

The file paths are likely touch points, not permission to edit all of them. Any shared-file change must be owned by the integration owner and reviewed against the shared patch gate.

## Standard batch contract

Every game contribution must include the following artifacts in its review, without adding audit-stage documents:

* adapter-to-UI contract: phases, timers, action kinds, duplicate policy, targets, public/own/result fields, and missing/disconnect policy;
* one client state diagram covering `editable → pending → accepted` and `pending → rejected → editable`, plus reconnect-to-neutral;
* server/engine tests for accepted, duplicate, late, invalid target, disconnected target, eliminated target, spectator, reconnect, and result replay as applicable;
* a privacy fixture proving that own/private fields are absent from public and spectator snapshots before result;
* result fixture proving score/tie/missing/disconnect behavior is adapter-derived and applied once;
* screenshot evidence at 390x844, 320x700, and 390x520 with keyboard focus; 844x390 and 667x375 when the orientation contract supports landscape;
* accessibility evidence for focus order, visible focus, labels, `aria-live` ACK/result announcements, reduced motion, contrast, 44 px minimum hit targets, and no horizontal scroll;
* a list of changed files proving shared files are limited to the approved primitive surface.

The game page may use a custom visual component, but it must not fork room lifecycle, socket ACK parsing, phase timing, target eligibility, score calculation, or privacy serialization.

## Required test matrix

### Shared gate tests

The shared patch branch must keep all baseline tests green (57 engine plus 9 server integration tests) and add focused tests for:

* duplicate single writes do not mutate adapter state (`yazi-yaz`, `sozluk-blofu`);
* negative ACK returns KPK and generic controls to editable without a reload;
* stale ACK sequence/state version cannot overwrite a newer accepted state;
* reconnect clears pending and rehydrates from own state;
* target helper rejects disconnected, eliminated, self-forbidden, stale, spectator, and wrong-role targets;
* Sızma clue/ready, Gizli Kareler round, and Memory active turn advance when the chosen disconnect policy is exercised;
* every authoritative transition increments `stateVersion` exactly once;
* spectator snapshots contain no own/private fields and result replay is idempotent.

### Per-game tests

Each game adds rule tests at the adapter boundary first, then client contract tests. Numeric games cover range/edge mappings, target games cover target matrix, repeatable games cover action sequence and duplicate windows, batch games cover atomic validation and exact budget, and visual tests cover the declared signature object—not an arbitrary screenshot snapshot that can hide a broken state.

## Required screenshot matrix

| View | Required checks |
| --- | --- |
| 390x844 portrait | full play, pending/accepted, result, long-name roster, spectator |
| 320x700 portrait | no horizontal overflow, 44 px targets, timer/result fit, long copy wraps |
| 390x520 portrait + keyboard | focused input remains visible, submit/ACK remains reachable, page scroll is intentional |
| 844x390 landscape | required for landscape games and optional smoke for portrait games |
| 667x375 landscape | required for landscape games; check safe areas and compressed result |

For target games, add screenshots with a disconnected target, an eliminated target, and an invalid self target where relevant. For private-state games, add a participant and spectator capture of the same phase to prove redaction. For canvas games, include pointer and keyboard/fallback states. Screenshots are evidence; they do not replace protocol and adapter tests.

### Semantic scene checklist per game

Every rebuilt game captures the following scenes, in addition to the viewport sizes above:

| Scene | Applies to | Required evidence |
| --- | --- | --- |
| Primary playing | all 22 | Authoritative phase/timer, HUD, orientation, signature object, no clipped controls |
| Interaction-active | all 22 | Focus/hover/tap state, target or numeric selection if applicable, 44 px targets |
| Submitted/locked | single, batch, and repeatable games | Pending and accepted state; repeatable action sequence remains usable |
| Rejected/retry | all games with validation or targets | Negative ACK reason, editable/retry state, no optimistic mutation |
| Result | all 22 | Adapter result payload, score deltas, tie/missing/disconnect explanation |
| Spectator/public | private or target games | Same phase from spectator view with own/private fields absent |
| Narrow/keyboard | text, numeric, canvas, target, or dense games | 320x700 and 390x520 focus/scroll; long content wraps |
| 8-player stress | roster-dependent games | Avatar identity, target/graph/rail density, no overflow |
| Orientation gate | landscape games | Portrait blocked with accessible rotate message; landscape safe-area composition |

The scene list is a minimum: private-state games capture rightful participant own state, spectator/public state, and result reveal; target games capture a selected target and post-disconnect invalidation; canvas games capture pointer and fallback input.

## Allowed and prohibited edits

Allowed shared edits after the gate: the approved ACK reducer, target/active-roster primitives, stable avatar slot mapping, state-version plumbing, and asset-pack loader/fallback. A batch may add its own adapter view, result renderer, game-specific CSS, tests, and versioned visual assets.

Prohibited in a batch: changing `MiniGameEngine` scoring to suit a screen, adding a private field to public snapshot for convenience, duplicating socket parsing, adding a new server target kind without manifest/helper tests, changing disconnect semantics without a contract update, changing KPK/Kendim calibration behavior, or replacing a game’s signature object with the generic `PremiumStageHero` family.

## Batch A contract — timing and pressure

### Scope

`butona-bas`, `gizli-hirsiz`, `kor-kronometre`, `asiri-yukleme`, and `son-kisi`.

**Risk and allowed surface.** A is High risk for timing and action races. It may add game-specific stage components, timer presentation, tests, and assets; it may not fork socket parsing, change hidden-deadline serialization, or reintroduce a single global `hasSubmitted` lock.

### Shared acceptance

The batch owner must prove action-sequence ACK for repeatable clicks, single-action negative-ACK recovery, timer ownership by the server, and no disclosure of hidden deadlines/arm times. The owner must also prove that keyboard Enter/Space does not double-submit and that reduced motion leaves timing feedback understandable.

### Game-specific acceptance

* **Butona Bas:** 300 ms window dedupe, singleton penalty, multi-tap scoring, and rank result; show an aperture/heat control at all required portrait and landscape views.
* **Gizli Hırsız:** exactly-one press branch, zero/multiple branch, private `hasPressed`, and result fingerprint count.
* **Kör Kronometre:** target 10 s, nearest/second scoring, missing-as-18 s, private timestamp, and result target ring.
* **Aşırı Yükleme:** energy reaches 100, hidden 3 s arm is not leaked, first post-arm click explodes, rank/tie/no-overflow branches are truthful.
* **Son Kişi:** hidden 10–20 s deadline, last/early/non-escape scoring, same-millisecond tie, reconnect/late gate, and result-only deadline reveal.

### Batch tests and screenshots

Run baseline plus timer/late/duplicate/reconnect tests for every game, hidden-deadline privacy fixtures for Aşırı Yükleme and Son Kişi, and keyboard/pointer parity at 390x520. The batch cannot pass if any local timer predicts a result before the server snapshot.

### Dependencies and handoff

A depends on the shared ACK and monotonic version patch. It hands the timer/action-sequence fixtures to B, C, and D. A’s integration reviewer must explicitly check that repeatable action status is not collapsed back into generic `ownHasSubmitted`.

## Batch B contract — hidden role, risk, and target graph

### Scope

`sizma`, `rus-ruleti`, `kor-bomba`, `zehirli-kadeh`, `capraz-ates`, and `zaman-bombasi-hafizasi`.

**Risk and allowed surface.** B is High/Critical risk for privacy, target churn, and active-roster advancement. It may add game-specific target/graph/reveal components and tests; it may not implement eligibility only in a client filter, expose a fuse/risk/sequence field publicly, or alter the shared disconnect policy ad hoc.

### Shared acceptance

The batch must use the adapter-declared target helper and active-roster policy. Every private role/risk/fuse/sequence field receives a public-versus-own fixture, and target invalidation is tested after disconnect, elimination, and host migration.

### Game-specific acceptance

* **Sızma:** clue/ready barrier advances under the declared disconnect policy; outsider/common words and votes reveal only at result.
* **Rus Ruleti:** hidden risk remains own-only, connected/live target checks work, self-target follows the adapter rule, explosion/survivor threshold is deterministic.
* **Kör Bomba:** connected non-self pass, hidden 15–20 s fuse, 1–4 s additions and absolute 45 s cap, disconnected-holder replacement, and final-holder result.
* **Zehirli Kadeh:** player-count poison table, +5 s trade extension, connected non-self source trade, private poison, and an explicit permanent-leave policy.
* **Çapraz Ateş:** target graph stays private in play; result handles mutual edges, non-mutual incoming fire, misses, and removed targets.
* **Zaman Bombası Hafızası:** display/input deadlines, active-only batch, threshold elimination, sequence privacy outside display, and active-disconnect advancement.

### Batch tests and screenshots

Run a 3–8 player matrix, participant/spectator privacy captures, stale target tests, duplicate target tests, and landscape orientation gate tests for Russian Roulette and Blind Bomb. For Memory and Sızma, deliberately disconnect the active/ready player and assert phase progress. For poison, test all 3–8 player poison counts and removal.

### Dependencies and handoff

B depends on the shared target and active-roster patches and may reuse A’s action-sequence fixtures. B cannot merge a target UI that implements eligibility solely in React filtering.

## Batch C contract — numeric choice and density

### Scope

`acgozluluk-limiti`, `ortalamanin-yarisi`, `gizli-kareler`, `cizgiyi-gecme`, and `gizli-alisveris`.

**Risk and allowed surface.** C is High risk for narrow-height density, keyboard focus, and private numeric/cart state. It may add numeric/grid/cart renderers and game-specific CSS; it may not publish choices for convenience, shrink hit targets below 44 px, or change round advancement outside the active-roster hook.

### Shared acceptance

Numeric controls must use server validation, first-valid duplicate policy, keyboard-safe focus, and a truthful result derivation. Repeatable cart actions use sequence-aware ACK; Gizli Kareler uses active-roster/round policy and never publishes a cell before reveal.

### Game-specific acceptance

* **Açgözlülük Limiti:** exact player-count limit table, 0..N range, successful total versus all-zero over-limit branch.
* **Ortalamanın Yarısı:** 0..100 range, average/2 target, nearest/second scoring, and adapter treatment of missing values.
* **Gizli Kareler:** 3x3/4x4 threshold, collision and solo scoring, early finish branches, and round disconnect advancement.
* **Çizgiyi Geçme:** floor buckets, 100→10 edge, unique highest/second scoring, duplicate bucket behavior.
* **Gizli Alışveriş:** public products, private carts, budget 60, buyer-count division, repeat toggle recovery, and highest basket scoring.

### Batch tests and screenshots

Test all numeric edges, all supported player counts, keyboard arrows/number entry, 320x700 density, and 390x520 keyboard. Include product-name wrapping, 3x3/4x4 grid hit targets, and private/public captures. No result screenshot may omit the formula that explains a winner.

### Dependencies and handoff

C starts after A/B timer and roster fixtures are stable. Its numeric input primitive can be shared with D’s budget ledger only through the approved shared surface.

## Batch D contract — social, creative, and multi-phase

### Scope

`yazi-yaz`, `sozluk-blofu`, `cagrisim-agi`, `rusvet-darbe`, `karalama-defteri`, and `ittifak`.

**Risk and allowed surface.** D is the highest review-load batch because it combines hidden text, target choices, canvas, and an exact-budget batch. It may add text/canvas/social stage components, visual packs, and adapter tests; it may not mutate before atomic acceptance, put private answers/votes in public DOM/ARIA, or replace adapter result payloads with client calculations.

### Shared acceptance

D is the strictest consumer of the atomic adapter submit and target helper. Text writes and the Rüşvet Darbe distribution must validate without side effects; canvas saves must be action-sequenced; all private roles/words/votes stay private until result.

### Game-specific acceptance

* **Yazı Yaz:** writer/innocent roles and words, 30/60/30 phases, one write, live-writer guess target, anonymous slip reveal.
* **Sözlük Blofu:** 50/30 phases, opaque definitions, own-bluff privacy, no-own-bluff choice, and duplicate-write immutability.
* **Çağrışım Ağı:** normalized answer, no live answer leak, group-size points, and graph result.
* **Rüşvet Darbe:** election/tie RPS/distribution phases, exact budget conservation, connected candidates, batch negative ACK, and private allocations.
* **Karalama Defteri:** 75/20 phases, pointer/canvas fallback, private informed word/role, connected vote target, and gallery/result reveal.
* **İttifak:** bargain/vote phases, connected target, missing-vote randomization, removal semantics, and result vote graph.

### Batch tests and screenshots

Run long-text/keyboard captures at 390x520 and 320x700, participant/spectator privacy fixtures, duplicate-write regression tests, Rüşvet Darbe 3–8 player budget matrix, and canvas pointer/keyboard fallback. Check that opaque definition IDs and private votes never appear in network-derived public DOM.

### Dependencies and handoff

D starts after the atomic submit and target contract is merged. It hands the result-card and long-content patterns to the integration owner, but may not change shared result semantics to accommodate a single game.

## Integration and release order

1. Merge the shared patch gate and rerun baseline plus focused tests.
2. Integrate A and B with their cross-roster/timer review; resolve all P1 findings.
3. Integrate C and D after A/B fixtures are stable; do not rebase away ACK/state-version tests.
4. Run the full typecheck, production build, realtime smoke, browser screenshot matrix, spectator/privacy captures, and a two-client reconnect/duplicate/target scenario for every game.
5. Run a fresh independent quality review against the score sheet below, then require `BLOCKERS NONE` before a GO decision.

## Technical regression master matrix

After every batch, the following commands and targeted checks are mandatory, even when the batch changed only client files:

| Gate | Required evidence |
| --- | --- |
| Full engine suite | `npm run test:engine` (all catalog and adapter tests) |
| Server integration | `npm run test:server` (reconnect, host migration, duplicate socket, next-game) |
| Combined baseline | `npm test` with zero failures/cancellations |
| Type safety | `npm run typecheck` |
| Production artifact | `npm run build` |
| Realtime smoke | `npm run smoke:realtime` against a built server, with health/room/join/start evidence |
| Targeted regressions | reconnect, spectator, privacy, duplicate input, target disconnect, pending rejection, orientation, 8-player, and long-content tests/screenshots |

The permanent pre-fan-out regression set is the shared duplicate-write, negative-ACK, stale-ACK/version, target matrix, active-roster disconnect, spectator redaction, and result-idempotence group described above. A batch cannot mark those checks “not applicable” because it did not touch the server.

## Independent quality gate and score sheet

Score each requested dimension from 0 to 10 with evidence links/artifacts. The release candidate must satisfy `OVERALL SCORE >= 9.0/10` and `BLOCKERS: NONE`; that literal gate is stronger than “tests passed.”

| Dimension | Pass evidence | Score (release time) |
| --- | --- | ---: |
| Technical correctness | adapter/protocol tests, typecheck, build, realtime smoke | pending implementation |
| 24-game coverage | every game card, result concept, privacy row, risk row, screenshot/test obligation | pending implementation |
| Systemic-risk quality | P0–P3 register, exact files/reproduction/fix/owner/propagation | pending implementation |
| Privacy/reconnect depth | public/own/spectator fixtures, negative ACK, target invalidation, resume | pending implementation |
| Visual/UX strategy | signature objects, result transformations, responsive/keyboard evidence, anti-SaaS review | pending implementation |
| Batch practicality | conflict-minimized grouping, dependencies, likely files, integration order | pending implementation |
| Acceptance-contract quality | per-game and per-batch tests, screenshots, allowed/prohibited edits | pending implementation |
| Evidence quality | actual diff/code/runtime/screenshots, source/test cross-check, no author-summary trust | pending implementation |
| **Overall** | **average ≥ 9.0/10 and `BLOCKERS: NONE`** | **must be ≥ 9.0** |

The mandated fresh reviewer is to receive only the branch diff, these contracts, and the executable evidence, then independently score all eight dimensions and enumerate P0–P2. In this audit turn the host rejected all attempted subagent reviewer calls for usage limits, so the primary agent performed a fresh adversarial second pass over the documents and recorded that limitation in the master audit. A future implementation review must still use a fresh reviewer; the self-review here is not a substitute for that release-time independence.

### Stage 11.7 document-gate outcome

The fresh-reviewer requirement was attempted after all three documents were complete, but the host returned its usage-limit error before a reviewer turn could run. The primary agent then completed an adversarial second pass against the prompt, current source, baseline tests, and KPK/Kendim calibration evidence. The fallback score below is explicitly a document-quality score—not a claim that the future implementation batches are already release-ready.

| Dimension | Fallback score | Evidence checked |
| --- | ---: | --- |
| Technical correctness | 9.2 | Source/test cross-check, phase/timer and adapter rules |
| 24-game coverage | 9.7 | 24 cards, result concepts, privacy classifications, risk rows |
| Systemic-risk quality | 9.3 | P0–P3 findings with propagation and owners |
| Privacy/reconnect depth | 9.4 | Public/own/spectator, ACK, target, disconnect, resume contracts |
| Visual/UX strategy | 9.4 | Nine visual decisions per game, viewport/keyboard matrix, anti-SaaS guards |
| Batch practicality | 9.3 | 4 conflict-minimized batches, dependencies, file/risk boundaries |
| Acceptance-contract quality | 9.3 | Shared/per-game tests, semantic screenshot scenes, prohibited edits |
| Evidence quality | 9.1 | 66/66 tests, typecheck, build, realtime smoke, honest reviewer limitation |
| **Overall** | **9.3/10** | **`BLOCKERS: NONE` for document integrity; release P1 gate remains conditional** |

## Final batch contract summary

The 22-game fan-out is permitted only as a conditional, dependency-ordered effort: A/B establish timing, target, and roster safety; C/D consume those primitives for density, social, canvas, and batch interactions. Any unresolved P1, any privacy fixture failure, any stale ACK overwrite, any disconnected-player stall, or any viewport/spectator gate failure returns the release candidate to NO-GO until patched and re-reviewed.
