# Stage 11.7 Master Pre-Scale Audit

## Audit identity and boundary

| Field | Value |
| --- | --- |
| Source repository | `xpike-dgm/glix` (working tree source of truth) |
| Required base | `origin/stage-11-6-kendim-calibration` |
| Base HEAD verified | `8b53a75be904dc396af743587263e26d5daf158d` |
| Audit branch | `stage-11-7-master-prescale-audit` |
| Scope | Independent master pre-scale audit, systemic blocker analysis, 24-game rebuild blueprint, and parallel batch contracts |
| Explicit exclusion | No remaining-game rebuild, gameplay rewrite, art production, or broad implementation in this stage |
| Required outputs | This document plus `STAGE_11_7_24_GAME_REBUILD_BLUEPRINT.md` and `STAGE_11_7_PARALLEL_BATCH_CONTRACTS.md` |

The audit was performed against the checked-out repository, its adapters/protocol, current client, tests, release configuration, and the Stage 11.5 KPK and Stage 11.6 Kendim calibration records. Source adapter behavior, protocol behavior, and executable tests outrank catalog prose and UI copy when they disagree. The requested A (multiplayer/state), B (rules), C (privacy/security), and D (mobile/art/UX) reviewer perspectives were attempted as separate subagent calls; the host rejected each call for the account usage limit. The primary agent therefore repeated all four perspectives independently, with an adversarial second pass after drafting the deliverables. This is recorded as a review constraint, not as a claim that those unavailable calls produced findings.

## Executive result

The current system has a credible protocol and phase-engine foundation. The 24-game catalog is present, baseline automated coverage is green (57 engine tests plus 9 server integration tests, 66 total), KPK is a valid landscape reference, and Kendim is a valid portrait reference. Privacy redaction, reconnect fencing, duplicate-socket fencing, host migration, and next-game constraints are already represented in code and tests.

The system is not yet safe for a 22-game visual and interaction fan-out without a small shared-contract gate. There are no demonstrated P0 data leaks or score-corrupting production failures in the baseline suite, but five P1 systemic issues can create rejected-input drift, permanent local locks, stale target choices, or a disconnected-player phase stall once more adapters and richer clients are added. The correct decision is therefore conditional rather than a blanket stop: land the exact shared patches below, rerun the independent gate, then release the batches in dependency order.

## KPK and Kendim landscape study

The Stage 11.5 KPK record is the accepted landscape for a landscape/fullscreen 2D console: a private panel/clue, neutral reconnect state, a deliberate cut interaction, a short result scoreboard, and touch targets at least 44 px. The Stage 11.6 Kendim record is the accepted portrait landscape for a dense but genuine 4x2 player/card board: private cards, explicit pending/accepted/rejected acknowledgement, invalid-target pruning, neutral reconnect state, and QA at 390x844, 320x700, and 390x520 with a keyboard.

These records transfer principles, not layouts:

| Transferable principle | Required interpretation for remaining games | Do not copy |
| --- | --- | --- |
| Private information has a deliberate reveal boundary | Define the exact phase/result boundary per adapter and test public and own snapshots | KPK panel or Kendim card UI |
| The player must see input status | Use one shared pending/accepted/rejected reducer and a game-specific presentation | KPK spark/shake or Kendim mapping mechanics |
| Reconnect starts neutral | Clear client optimism and rehydrate from authoritative own state | A fixed reconnect animation or screen composition |
| Result is a designed phase | Give every game a truthful, compact result summary | KPK scoreboard typography or Kendim result layout |
| Mobile constraints are measured | Use the viewport matrix and keyboard-safe scrolling for each density | One universal portrait card grid |
| Visuals explain the rule | Give each game an object, feedback language, and success/failure state | A shared “premium hero” skin for all games |

## Baseline evidence

The following checks were run on the required base before the audit documents were written:

* `npm test`: 57 engine tests passed and 9 server integration tests passed (66 total).
* The engine suite covers catalog completeness, phase timing, private input visibility, Stage 6/7/8/9 adapters, target rejection, reconnect-oriented state, and score/result transitions.
* The server suite covers reconnect, target disconnect, duplicate socket fencing, host migration, and next-game constraints.
* The catalog in `packages/shared/src/index.ts` contains all 24 required IDs. `supportsPortrait` is false only for `rus-ruleti`, `kor-bomba`, and `kontrol-paneli-kaosu`; KPK, Russian Roulette, and Blind Bomb are the explicit landscape exceptions.

The full typecheck, production build, and realtime smoke gate remain release checks for the final branch. A documentation-only audit does not silently convert those checks into proof of browser-level quality; the missing browser matrix is itself a P2 release risk below.

## Shared-system audit

| System | Current evidence | Audit decision | Scale consequence |
| --- | --- | --- | --- |
| `GameViewport` and `OrientationGate` | Full `100vw/100dvh`, safe-area handling, overflow control, and `inert`/`aria-hidden` orientation gate exist in `apps/client/src/components` | Keep as primitive; add per-game density budgets | A game must declare orientation and minimum tested viewport; it may not bypass the gate casually |
| HUD/timer/avatar strip | `GameHUD` exposes timer, roster, and own status; `PlayerAvatarStrip` indexes art by roster array position | Accept HUD contract; fix stable avatar identity as P2 | Reorder/removal must not change a player’s visual identity |
| Tutorial/preparing/playing/results/transition | `MiniGameEngine` has real phase durations and ready barriers | Accept phase motor; make manual-end and disconnected-player policy explicit per adapter | No client may infer a result from a local timer alone |
| Input ACK | Server emits `server:game-input-ack`; App stores `lastInputAck`; only Kendim consumes it fully | P1 shared reducer required; KPK currently has a permanent negative-ACK lock | Every actionable control needs pending, accepted, rejected, retry, and reconnect semantics |
| Generic submit path | `handleGameSubmit` calls adapter first, then `engine.submitInput` | P1 transactional ordering bug for single-submit adapters | Adapter state must not mutate when the authoritative generic fence rejects a duplicate |
| Target eligibility | Server has a fixed `targetKinds` list plus connected/current-game checks; adapters add role/self rules | P1 manifest/interface required | A new target kind must not depend on remembering a distant server switch |
| Participant roster | Socket lifecycle distinguishes connected, eliminated, and removed; several adapters still use initial `playerIds` for turn/ready/collision | P1 per-game disconnect policy required | Grace disconnect must either be skipped, auto-completed, or explicitly tolerated—never accidentally stall a phase |
| Room lifecycle | Idle timeout, reconnect token, duplicate-socket close, host migration, and next-game trimming are implemented | Accept with restart limitation documented | In-memory rooms are not process-restart durable; deployments need graceful drain/session messaging |
| Private/public snapshots | `ownGameState` is sent only to a current participant; many adapters reveal secrets only at result | Accept baseline redaction; add negative tests for every new result field | Public snapshot schemas must be reviewed separately from own schemas |
| Result overlay | Generic disabled-fieldset overlay exists; KPK/Kendim own result surfaces | Keep primitive but require game-specific result summary | Generic player-ID pills and generic copy are insufficient as the final visual for 22 games |
| Spectator state | Spectators receive public match state and not participant own state; custom stages provide their own overlays | Accept privacy boundary; test spectator transitions | Spectator must never inherit a stale participant’s pending or private state |
| Adapters/protocol | Adapters encode rules, scores, phase transitions, and public/own state | Treat adapters as authority; expose contract metadata to client/server | Blueprint contracts must be implemented without UI-only rules |
| Assets and PWA | Manifest eagerly loads shared assets; only KPK and Cagrisim packs are lazy; service worker shell excludes game packs | P2 pack/version strategy required before offline claims | A missing lazy pack must show a deterministic fallback, not a silent blank art slot |
| CSS/accessibility/CI | Responsive CSS, reduced-motion rules, touch sizing, typecheck/build/test/realtime CI exist | Accept foundation; add browser/screenshot and multi-session gates | “Build green” is not evidence that keyboard, narrow-height, or screen-reader paths fit |

## 24-game privacy and authority matrix

“Private” means omitted from public/spectator state until the stated reveal boundary. “Own” means available only in the participant’s own state. A result marked “adapter” is authoritative; client animation is never a score source.

| # | Game | Own/private during play | Public during play | Reveal/result authority | Audit status |
| ---: | --- | --- | --- | --- | --- |
| 1 | `yazi-yaz` | writer role/word; own entry | phase and roster; no entries/guesses | entries, guesses, roles, score at result | Pass with duplicate-write P1 |
| 2 | `kendim` | own card/word, pending mapping | cards/words only at match result | adapter match result; client ACK is presentation | Accepted reference; ACK contract to generalize |
| 3 | `sizma` | outsider role and secret words | clue turn only; answers/votes withheld | outsider/common words, votes, score at result | Pass; turn/ready disconnect policy P1 |
| 4 | `sozluk-blofu` | own bluff and role | dictionary word only; definitions opaque | real definition, bluff owner, score at result | Pass with duplicate-write P1 |
| 5 | `cagrisim-agi` | own answer until result | main word; no private answers | answer groups and scores at result | Pass |
| 6 | `butona-bas` | tap windows/own count until result | timer only; aggregate hidden | window/rank scores at result | Pass |
| 7 | `rus-ruleti` | current risk/shot outcome | holder and safe-shot signal, not risk | shots, explosion, survivors at result | Pass; landscape exception |
| 8 | `gizli-hirsiz` | role and whether pressed | timer only | pressed IDs and scores at result | Pass |
| 9 | `kor-kronometre` | own stop timestamp | timer only | all stop times and ranks at result | Pass |
| 10 | `kor-bomba` | fuse/holder internals | holder and pass count; no fuse | explosion holder and score at result | Pass; landscape exception |
| 11 | `rusvet-darbe` | role, vote intent, allocation | candidate IDs only during tie | president, votes, allocations, score at result | Pass; batch contract required |
| 12 | `acgozluluk-limiti` | own numeric choice | no choices | all choices, limit outcome, scores at result | Pass |
| 13 | `ortalamanin-yarisi` | own number | no choices | choices, target, ranks at result | Pass |
| 14 | `gizli-kareler` | own cell choice | board and eliminated IDs only at round reveal | collisions/eliminations/scores each round | Pass with disconnect P1 |
| 15 | `karalama-defteri` | role and assigned word | drawings after drawing phase; no informed role | votes, informed/outsider reveal, score at result | Pass |
| 16 | `ittifak` | own vote intent until result | no votes | vote counts and scores at result | Pass; removal policy P2 |
| 17 | `son-kisi` | own escape timestamp/choice | no finish deadline or choices | escape times, last player, score at result | Pass; reconnect edge test required |
| 18 | `cizgiyi-gecme` | own number/bucket | no choices | unique buckets, ranks, scores at result | Pass |
| 19 | `gizli-alisveris` | own cart and basket total | product catalog only | carts/counts, totals, winner at result | Pass |
| 20 | `asiri-yukleme` | own click detail until result | aggregate energy and armed flag; no arm timestamp | click ranks, overflow, scores at result | Pass |
| 21 | `kontrol-paneli-kaosu` | panel, clue, cut choice until result | no clue/cut | cutter, clue owner, score at result | Accepted landscape reference; negative ACK P1 |
| 22 | `zehirli-kadeh` | own poison and private trade intent | no poison/trades | poison/trades, clean/poison, score at result | Pass; permanent-leave semantics P2 |
| 23 | `capraz-ates` | own target intent until result | no target graph | incoming counts, mutual edges, score at result | Pass |
| 24 | `zaman-bombasi-hafizasi` | active input and sequence until reveal | sequence only during display; elimination status as rule requires | sequence, mistakes, eliminations, score at result | Pass; active-disconnect policy P1 |

No public snapshot in the audited adapters intentionally exposes a secret role, word, card, fuse/risk, private number, cart, poison, or target intent before its result boundary. The important qualification is that the new batch clients must consume the same public/own split; duplicating an adapter’s private value into a client-side “preview” is a privacy regression.

### Required privacy classification

The requested classification is recorded explicitly here. `PUBLIC` means the relevant state is intentionally public during play; `PRIVATE SELF STATE` means only the submitting participant receives it; `HIDDEN GLOBAL STATE` means a server-held timer/risk/fuse/secret is not public; `RESULT-ONLY REVEAL` means the authoritative field appears at result; `MIXED` combines two or more of those categories.

| Game | Classification | Pre-result blocker/qualification |
| --- | --- | --- |
| `yazi-yaz` | MIXED | Atomic duplicate write must precede fan-out |
| `kendim` | MIXED | Generalize its ACK/reconnect pattern without regressing it |
| `sizma` | MIXED | Active clue/ready disconnect policy |
| `sozluk-blofu` | MIXED | Atomic duplicate bluff write |
| `cagrisim-agi` | PRIVATE SELF STATE + RESULT-ONLY REVEAL | No live answer leak |
| `butona-bas` | PRIVATE SELF STATE + RESULT-ONLY REVEAL | Action-window ACK, not a global lock |
| `rus-ruleti` | MIXED | Hidden risk and live target checks |
| `gizli-hirsiz` | PRIVATE SELF STATE + RESULT-ONLY REVEAL | Exact-one result branch |
| `kor-kronometre` | PRIVATE SELF STATE + RESULT-ONLY REVEAL | Missing timestamp treatment |
| `kor-bomba` | MIXED | Hidden fuse and connected-holder policy |
| `rusvet-darbe` | MIXED | Atomic allocation/budget validation |
| `acgozluluk-limiti` | PRIVATE SELF STATE + RESULT-ONLY REVEAL | Numeric choice remains private |
| `ortalamanin-yarisi` | PRIVATE SELF STATE + RESULT-ONLY REVEAL | Missing values are adapter-generated |
| `gizli-kareler` | MIXED | Cell choice private; disconnected round seat cannot stall |
| `karalama-defteri` | MIXED | Role/word private; drawing reveal is intentional |
| `ittifak` | PRIVATE SELF STATE + RESULT-ONLY REVEAL | Removal/missing-vote semantics |
| `son-kisi` | MIXED | Hidden deadline and reconnect gate |
| `cizgiyi-gecme` | PRIVATE SELF STATE + RESULT-ONLY REVEAL | 100→10 edge mapping |
| `gizli-alisveris` | MIXED | Private cart, public products |
| `asiri-yukleme` | MIXED | Hidden arm timestamp and repeatable ACK |
| `kontrol-paneli-kaosu` | MIXED | Negative ACK must unlock cut control |
| `zehirli-kadeh` | MIXED | Poison/trade privacy and leave semantics |
| `capraz-ates` | PRIVATE SELF STATE + RESULT-ONLY REVEAL | Target invalidation at submit |
| `zaman-bombasi-hafizasi` | MIXED | Active disconnect/sequence phase policy |

## Shared component decision matrix

This is the explicit reusable-versus-game-specific decision required before fan-out.

| Component/system | Decision | Boundary |
| --- | --- | --- |
| `GameViewport` | KEEP | Shared safe-area, viewport, scroll, and stage slot; games declare density/orientation |
| `GameHUD` | REFINE BEFORE SCALE | Consume adapter-owned phase/action status, stable identity, and truthful timer |
| `PlayerAvatarStrip` | REFINE BEFORE SCALE | Keep presentation but replace roster-index art with stable player-ID slots |
| `TutorialOverlay` | KEEP | Shared phase/tutorial semantics; game copy and illustration remain local |
| `RotateDeviceOverlay` | KEEP | Shared orientation gate; only the catalog may declare landscape exceptions |
| `ResultOverlay` | KEEP AS PRIMITIVE ONLY | Generic transition/accessibility shell; native result content is game-specific |
| `SpectatorOverlay` | KEEP AS PRIMITIVE ONLY | Shared public-state notice; no participant own state or controls |
| `PremiumStageHero` | GAME-SPECIFIC REPLACEMENT AT STAGE SLOT | The family mapper may supply fallback chrome only; it cannot be the game’s interaction |
| Target-selector concepts | REFINE BEFORE SCALE | Shared target rendering and eligibility helper, adapter-declared role/self rules |
| Pending/ACK state | REFINE BEFORE SCALE | One reducer and sequence/version contract used by all controls |
| Score rail | KEEP AS PRIMITIVE ONLY | Shared score delta typography; result explanation and ordering are adapter-specific |
| Avatar assets | REFINE BEFORE SCALE | Stable player-ID slot mapping and pack fallback |
| Timer display | KEEP | Server phase/timer source, hidden-deadline redaction, reduced-motion presentation |
| Connection display | KEEP | Shared connected/reconnecting/spectator semantics; no private-state assumptions |
| Background/deck assets | KEEP AS PRIMITIVE ONLY | Shared surface/deck tokens; every game supplies a distinct interaction object |

The matrix deliberately rejects “`PremiumStageHero + form + player list`” as a complete game implementation. Shared primitives carry mechanics and accessibility; they do not erase each game’s metaphor, result transformation, or privacy boundary.

## Input, ACK, and rejection audit

The current path is: validate socket/session, synchronize runtime, apply server target-kind checks, call the adapter’s `submit`, then call `MiniGameEngine.submitInput`, emit an ACK, and broadcast. The ordering is unsafe for adapters whose write mutates state before the generic single-input fence. `YaziYazAdapter` can overwrite its writer entry on a second write; `SozlukBlofuAdapter` can replace its bluff on a second write. The engine then rejects the duplicate, so the client sees rejection while adapter state has already changed.

The required shared contract is:

1. A submission carries an action kind, a client sequence/token, and the phase version observed by the client.
2. The adapter exposes a side-effect-free `validate/prepare` result (including target, role, duplicate, and phase checks).
3. The authoritative engine accepts or rejects the prepared action exactly once.
4. Only after acceptance does the adapter commit its mutation; the server ACK contains accepted/rejected, reason, action sequence, and authoritative state version.
5. The client reducer moves `editable -> pending -> accepted` or `editable -> pending -> rejected -> editable`. Repeatable controls key status by action sequence/window, not by a single `hasSubmitted` boolean. Reconnect clears pending to neutral and waits for own state.

Kendim already demonstrates most of this presentation contract (`lastInputAck`, pending mappings, invalid-target pruning, and neutral reconnect). KPK demonstrates the failure mode: `KpkStage` sets `localCutColor` and `isPending`, but does not clear either on a negative ACK. All generic controls currently derive disabled state mostly from own state, so they need the reducer even when the server is correct.

`ownHasSubmitted` in `GameHUD` currently derives from generic engine input count. That is not an adequate adapter truth for batch submissions, multi-step games, repeatable actions, or manual-end adapters. HUD and controls must consume a phase-scoped adapter status (`editable`, `pending`, `accepted`, `rejected`, plus action kind) rather than infer it from a generic count.

## Participant, target, reconnect, and spectator audit

The server correctly fences duplicate sockets and migrates host to the earliest connected player. It checks current-game membership and connectedness for the fixed target kinds, while adapters add game-specific rules such as non-self, live owner, role, and elimination checks. This is a sound defense-in-depth baseline but the fixed `targetKinds` set is a maintenance trap: a new target kind can be forgotten in `apps/server/src/index.ts` and silently receive only adapter-level validation.

Before fan-out, introduce a shared target contract or explicit manifest that lets each adapter declare target fields and a common `eligibleTarget` primitive. It must distinguish current participant, connected, not eliminated, role-eligible, non-self, and phase-eligible. Add a test for every target-bearing adapter with (a) disconnected target, (b) eliminated target, (c) self target where forbidden, (d) stale target after roster change, and (e) spectator submission.

Disconnect handling is inconsistent. `Sizma` clue turns and ready barriers, `Gizli Kareler` rounds, and Memory active turns still use the initial `playerIds` in places where a grace-disconnected player can block progress. `Kor Bomba`, Russian Roulette, and Crossfire are stronger because they select connected/live targets or replace a disconnected holder. Each adapter contract must state one of: skip disconnected, auto-submit a neutral/missing value, retain a timed seat, or permanently remove. The choice must be applied consistently to turn order, ready barriers, scoring, and reconnect.

Spectators receive public match state and not participant own state. This boundary passes the baseline audit, but custom stages must continue to suppress stale participant controls when a client changes from participant to spectator. Reconnect must never replay another player’s private state through a reused local component.

## Results, scoring, and phase authority

Adapters are the scoring authority. The client may animate a timer, but `phaseEndsAt`, manual completion, elimination, tie breaking, ranking, and score transfer must come from the server snapshot. Generic result UI is a primitive only: it cannot replace each game’s truthful result summary, and its first-four-character player IDs are not a stable or humane display identity.

The blueprint requires every game to document its result payload, tie/missing policy, spectator view, and score explanation. A result snapshot must be immutable for the result phase, and a client reconnecting during results must render that same authoritative payload. Add assertions that private fields become public only at result and that score deltas are applied once across reconnect and duplicate ACK delivery.

## Responsive, visual, accessibility, and PWA audit

The current viewport foundation handles safe areas, orientation locking, reduced motion, and narrow-height scrolling. The remaining risk is content density and identity: `PremiumStageHero` maps 22 games into a few generic families, and `visualAssetManifest` only lazy-loads KPK and Cagrisim packs. The service-worker shell (`glix-shell-v7`) does not include future game packs, so offline fallback can display a shell with a missing stage asset. The blueprint therefore assigns each game a signature object, feedback loop, and result visualization while keeping `GameViewport`, HUD, timer, and accessibility primitives shared.

Every batch must screenshot at 390x844, 320x700, 390x520 with keyboard, 844x390, and 667x375 where landscape is supported. Check 44 px minimum hit targets, focus order, visible focus, labels for icon-only actions, `aria-live` for ACK/result status, no horizontal scroll, no clipped timer/result, reduced-motion behavior, and spectator contrast. CI currently runs test/typecheck/build/realtime smoke but no browser E2E, screenshot matrix, multi-tab privacy assertion, or multi-container/restart test; these are P2 release controls, not reasons to invent fake coverage in this audit.

## Systemic blocker register

There are no evidenced P0 blockers in the current base: baseline privacy and lifecycle tests pass, and no secret was found in a public result before its intended boundary. P1 means a shared patch is required before parallel implementation. P2 means the batches can proceed after the P1 gate but cannot be called release-complete without the mitigation.

| ID | Severity | Finding and evidence | Affected games/surfaces | Required fix and acceptance evidence |
| --- | --- | --- | --- | --- |
| P1-01 | P1 | Adapter-first submission lets a duplicate mutate `YaziYazAdapter` or `SozlukBlofuAdapter` before `MiniGameEngine` rejects it | `yazi-yaz`, `sozluk-blofu`, server submit path | Transactional prepare/commit or engine-first dedupe that preserves repeatable actions; tests prove second write leaves adapter state and score unchanged |
| P1-02 | P1 | KPK local pending state never clears on negative ACK | `kontrol-paneli-kaosu`, `App.tsx`, `KpkStage.tsx` | Shared ACK reducer wired to KPK and every custom/generic control; rejection test returns to editable, reconnect returns neutral |
| P1-03 | P1 | No common client pending/rejected/accepted model; HUD infers status from generic input count | all 24, especially multi-step/repeatable/manual-end games | Phase-scoped action status with sequence and state version; controls, HUD, and result transition tests cover duplicate and stale ACKs |
| P1-04 | P1 | Fixed server target-kind list is separate from adapter target semantics | `sizma`, `kendim`, `kor-bomba`, `rus-ruleti`, `capraz-ates`, `zehirli-kadeh`, `ittifak`, `karalama-defteri`, `yazi-yaz`, `rusvet-darbe` | Adapter-declared target contract plus common eligibility helper; stale/disconnected/eliminated/self/spectator matrix passes |
| P1-05 | P1 | Initial-player turn/ready state can be blocked by a grace-disconnected player | `sizma`, `gizli-kareler`, `zaman-bombasi-hafizasi`/Memory and any future turn adapter | Explicit disconnect policy and `activeRoster`/skip/auto-neutral behavior; disconnect during every active phase advances deterministically |
| P2-01 | P2 | `stateVersion` can lag when snapshot synchronization advances adapter/engine state | server snapshots and all reconnect clients | Increment version for every authoritative transition; stale ACK/snapshot test rejects old client actions |
| P2-02 | P2 | Avatar art is indexed by roster array position, so removal/reorder changes identity | HUD/avatar strip, all multiplayer games | Stable player-ID-to-slot mapping test after leave/join/reconnect |
| P2-03 | P2 | Generic result copy/ID pills and family hero do not express 22 distinct rules | all non-reference games | Game-specific result payload/view and signature visual object per blueprint; no opaque four-character IDs as sole identity |
| P2-04 | P2 | PWA shell excludes most game packs; offline fallback can be art-incomplete | asset manifest, `sw.js`, lazy packs | Versioned per-game packs, explicit fallback, and install/offline smoke evidence |
| P2-05 | P2 | CI lacks browser viewport/keyboard, spectator/privacy, multi-session, and process-restart coverage | `.github/workflows/ci.yml` | Add release workflow lanes or a documented pre-release runner with artifacts and failure triage |
| P2-06 | P2 | Permanent leave semantics are not uniform; e.g. poison count changes on `ZehirliKadehAdapter.removePlayer` | `zehirli-kadeh`, `sizma`, all score/roster-sensitive adapters | Contract and tests state whether a removed seat is rebalanced, neutralized, or scored as missing |
| P2-07 | P2 | Some adapters accept a reconnecting submission based on initial IDs without a connected check | `son-kisi` and analogous manual-end adapters | Common participant/connected gate plus reconnect test during playing/results |
| P3-01 | P3 | Generic premium hero and duplicated card language risk a SaaS-like reskin | 22 rebuild clients | Use game-specific metaphors and concise rule copy while keeping shared primitives |
| P3-02 | P3 | No evidence of audio or haptics policy | all games | Treat as optional enhancement; never make feedback dependent on unavailable device APIs |

P1-01 through P1-05 are the exact shared patches behind the conditional decision. P2 items are tracked in the batch contracts and release gate; none should be silently reclassified as “done” by a visual pass.

### Severity ownership and propagation rationale

| Severity section | ID(s) | Why propagation is dangerous | Owner |
| --- | --- | --- | --- |
| P0 — Cannot scale | None evidenced | No demonstrated P0 leak or lifecycle corruption in the baseline; this is not permission to skip P1 | Release hardening confirms absence |
| P1 — Must fix before fan-out | P1-01 | Every new single-submit adapter could mutate on a rejected duplicate, causing client/server disagreement and unreproducible scores | Shared-system patch |
| P1 — Must fix before fan-out | P1-02, P1-03 | Each custom control can lock a player locally or let stale ACKs overwrite newer intent; copied patterns multiply the lockout | Shared-system patch |
| P1 — Must fix before fan-out | P1-04 | Each target game could implement a subtly different connected/eliminated/self rule and accept stale targets under load | Shared-system patch |
| P1 — Must fix before fan-out | P1-05 | A grace-disconnected seat can block turn/ready/round advancement in every adapter that copies initial-roster logic | Shared-system patch |
| P2 — Can fix during batch work | P2-01, P2-02 | Stale versions and shifting avatar identities damage every screen but do not alter authoritative scoring if the server remains source of truth | Final integration |
| P2 — Can fix during batch work | P2-03, P2-04 | Generic result/art and incomplete packs make 22 games look interchangeable or break offline fallback, multiplying polish debt | Batch squad + final integration |
| P2 — Can fix during batch work | P2-05 | Without browser and restart evidence, a green unit suite can ship clipped, leaking, or non-resumable clients | Release hardening |
| P2 — Can fix during batch work | P2-06, P2-07 | Inconsistent leave/reconnect semantics create phantom points or post-disconnect submissions in any game that targets or rebalances seats | Shared-system patch + affected batch |
| P3 — Polish/backlog | P3-01, P3-02 | Generic visual language or optional feedback lowers product quality but does not by itself corrupt state/privacy | Batch squad |

Each blocker row in the register supplies the exact issue, files/systems, affected games, reproduction/risk, and acceptance fix; this table adds the required propagation rationale and owner without inflating severity.

## Shared patch gate before fan-out

The following patch set is intentionally specified, not implemented in Stage 11.7:

1. Add a side-effect-free adapter prepare/commit contract and make single-submit duplicate checks atomic.
2. Add a phase-scoped ACK reducer with action sequence, rejection reason, and authoritative state version; wire it through `App`, `GameHUD`, KPK, Kendim, and generic controls.
3. Add adapter-declared target metadata and one server/client eligibility helper with stale-roster tests.
4. Add `activeRoster`/disconnect policy hooks and advance tests for Sızma, Gizli Kareler, and Memory.
5. Make authoritative `stateVersion` monotonic for every engine/adapter transition and expose adapter-owned submission status to HUD.

The gate passes only when the current 66 tests still pass, the new focused tests pass, typecheck/build/realtime smoke pass, and the rejection/disconnect/privacy matrix is green. No batch may change shared protocol fields or lifecycle behavior outside this gate without an explicit integration review.

## Release and security dependency disposition

| Item | Before visual fan-out | During batch work | Unrelated/deferred |
| --- | --- | --- | --- |
| Transactional submit, ACK reducer, target helper, active-roster policy, monotonic state version | Required; systemic P1 gate | — | — |
| Public/own/spectator redaction and result-only reveal fixtures | Required for each game contract | Extend with every new payload | — |
| Reconnect token/duplicate socket/host migration/next-game baseline | Existing behavior must remain green | Add per-game disconnect and result replay cases | Process-restart durability remains a deployment decision |
| Browser viewport/keyboard/spectator screenshot lane | Not a prerequisite to write the blueprint | Required before a batch is release-ready | — |
| PWA game-pack versioning and deterministic art fallback | Not a server privacy blocker | Required before offline/install claims | — |
| Multi-container persistence, rate limiting, production auth policy | Documented deployment/security hardening risk | Do not hide it in game UI work | Separate release-hardening track unless product scope changes |

The server’s in-memory room model and same-origin WebSocket deployment are known release assumptions, not reasons to derail a visual rebuild. They must remain explicit in deployment review; a batch must not imply process-restart durability or production authentication that the repository does not provide.

## Independent quality gate

The final pass checks: (a) all 24 IDs and all three required docs exist; (b) no implementation file changed; (c) all required privacy, ACK, target, result, responsive, visual, risk, and batch-contract sections are present; (d) each game has a result concept, risk row, and screenshot/test obligations; (e) the five P1 fixes are named exactly; and (f) the final decision is stated once at the end. Because the requested subagent calls were unavailable, this gate is a primary-agent adversarial review across state integrity, rules, privacy/security, and mobile/art/UX, with the absence of subagent execution recorded above.

PARALLEL REBUILD: CONDITIONAL GO
