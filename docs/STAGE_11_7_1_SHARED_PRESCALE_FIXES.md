# Stage 11.7.1 — Shared Pre-Scale Fixes

## Outcome

Stage 11.7.1 closes the five shared P1 contract gaps identified by the Stage 11.7 audit without rebuilding any of the remaining game presentations. KPK and Kendim retain their accepted layouts; their changes are limited to shared action-state plumbing and rejection recovery.

## Architecture: before and after

Before this change, the server called `adapter.submit` before the generic engine duplicate fence, client ACK handling was locally improvised and timestamp-correlated, player-target discovery lived in a distant server list, some adapters could wait on grace-disconnected seats, and the HUD inferred completion from generic input counts.

After this change:

- engine input is prepared without side effects and committed only after every generic and adapter gate accepts;
- one phase-scoped reducer owns client action correlation and stale-order protection;
- a shared 24-game runtime-contract registry declares action mode, target extraction, and disconnect policy;
- live-target eligibility is checked at the common server boundary before adapter mutation;
- affected adapters advance disconnected turns/barriers using explicit rule-preserving policies;
- authoritative snapshots expose non-secret semantic submission status;
- every semantic match transition has a controlled monotonic `stateVersion`.

## Protocol change

`PROTOCOL_VERSION` changes deliberately from **2 to 3**.

`client:game:submit` now requires:

- `actionId`: deterministic reconnect-session/action-sequence correlation ID;
- `stateVersion`: latest authoritative version observed by the sender;
- `phaseIndex`: authoritative phase scope observed by the sender.
- `actionScope`: the adapter-declared public subphase/round/turn epoch observed by the sender.

`server:game-input-ack` now echoes `actionId` and the authoritative `stateVersion` at which the action was processed. It contains acceptance/rejection metadata only—never a private choice or result payload.

`server:match-state` now includes `submissionStatus`, derived from the active adapter contract and the viewer's authoritative state. Runtime parsing validates every new client field.

Adapter action scopes use only non-secret public epoch fields (for example Kendim/Yazı subphase, Gizli Kareler round, Memory active seat/sequence length, or KPK's stable game scope). The server also fences each `(playerId, actionId)` once per match, so transport replay cannot repeat an accepted repeatable action.

Older protocol-v2 clients are intentionally incompatible with this branch because safe correlation cannot be inferred from timestamps or omitted phase/version context.

## Transactional submission

`MiniGameEngine.prepareInput` performs spectator, phase, lateness, duplicate, and action-mode validation without mutating engine state. The server then validates the payload and live targets, calls the adapter, and invokes `commitPreparedInput` only for an accepted adapter action. `submitInput` remains as the compatible prepare-plus-commit entry point for direct engine callers.

This preserves distinct single, repeatable, batch, and turn/multi-step semantics. It also makes `rejected input -> mutated adapter state` impossible through the common path. Yazı Yaz and Sözlük Blöfü additionally defend their first-write value locally before mutation.

## Phase-scoped ACK reducer

The shared reducer models:

`editable -> pending(action N) -> accepted | rejected/editable`

Repeatable contracts may begin `action N+1` after either terminal ACK. Single/batch/turn contracts stay governed by authoritative submission status rather than a global `hasSubmitted` latch.

Reducer scope includes match, game, phase, reconnect session, and spectator state. A scope change clears pending intent. ACKs must match the current `actionId`; older or unrelated ACKs are ignored, and an ACK from an older `stateVersion` cannot regress controls after a newer snapshot. KPK clears an optimistic cut after rejection and permits retry; Kendim uses the same reducer while preserving accepted-state locking and stale-target pruning.

## Target contracts

The shared runtime-contract registry declares target paths per action family. `extractGameTargets` handles no-target, single-target, and batch-target actions and rejects malformed declared targets. `areExtractedTargetsEligible` applies the common live-roster predicate: target exists, belongs to the current game, is connected, is not eliminated, and is not a spectator.

Self-target, holder, role, writer, candidate, poison/trade, and similar semantic rules remain inside adapters. Covered target-bearing families include Yazı Yaz, Sızma, Kendim, Rus Ruleti, Kör Bomba, Rüşvet ve Darbe, Karalama Defteri, İttifak, Zehirli Kadeh, Çapraz Ateş, and every other payload in the current adapters that carries a player ID.

## Active roster and disconnect policy

The runtime contracts distinguish room membership, connectivity, current-game participation, elimination, temporary disconnection, and spectator state. Policies are declared per game rather than inferred globally.

- **Sızma:** skip a disconnected clue seat; ready barriers wait only for connected current participants; no score or clue is invented.
- **Gizli Kareler:** when disconnects leave all connected eligible players selected, resolve the round with missing disconnected selections neutral.
- **Zaman Bombası Hafızası:** deterministically skip a disconnected active/input seat without eliminating or scoring it and without exposing the hidden sequence.
- **All-player grace pause:** Sızma, Gizli Kareler, Memory, Rus Ruleti, and Kör Bomba freeze deadlines and scoring while no current participant is connected; deadlines resume from the paused duration, and sequential reconnect chooses a connected eligible turn holder without invented score.

Other target and ready/turn paths continue to enforce their adapter-specific rules after the common eligibility gate.

## Authoritative stateVersion rules

- Versions never decrease and do not use wall-clock time.
- A semantic engine, adapter, roster, disconnect/reconnect, phase, game, or result transition increments once before publication.
- Pure snapshot rebroadcast reads the current version and does not fabricate a transition.
- Reconnect snapshots carry the current version.
- The server accepts an action observed at an equal or earlier version only while its `phaseIndex` is still current; future versions and stale phases are rejected. This permits legitimate concurrent players and repeatable input while fencing cross-phase intent.
- ACKs echo their processing context, enabling stale ACK and snapshot resistance on the client.
- Result application remains idempotent across reconnect and duplicate delivery.

## Adapter-owned submission status

Each game contract declares `single`, `repeatable`, `batch`, `turn`, or `none`. An explicit per-game semantic resolver derives `canAct`, `completed`, `acceptedActionCount`, and `locked` from the current adapter subphase and authoritative viewer-safe state. Multi-step games therefore reset completion meaning between steps—for example, a Yazı Yaz writer who completed writing is actionable/uncompleted again when eligible to guess. The HUD consumes this semantic status instead of guessing from generic input counts. No submitted word, target, wire, sequence, role, or result is included.

## Affected files and games

Shared system:

- `packages/shared/src/contracts.ts`
- `packages/shared/src/contracts.test.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/engine.ts`
- `packages/shared/src/games.ts`
- `apps/server/src/index.ts`
- `apps/server/test/reconnect.integration.test.mjs`
- `apps/client/src/App.tsx`
- `apps/client/src/visuals/hud/GameHUD.tsx`
- `package.json`

Focused adapter/client regressions:

- `packages/shared/src/games-stage7.ts` and tests: Sızma and Memory disconnect advancement;
- `packages/shared/src/games-stage8.ts` and tests: Yazı Yaz and Sözlük Blöfü duplicate immutability;
- `packages/shared/src/games-stage9.ts` and tests: Gizli Kareler disconnect advancement;
- `packages/shared/src/games-stage11.test.ts`: protocol and Stage 11 behavior coverage;
- KPK stage, Kendim stage/composer, and shared client styling: reducer integration only.

## Permanent regression coverage

The engine suite grows from 57 to 75 tests and retains all prior cases. Added coverage includes transaction prepare/commit behavior, duplicate immutability, the complete target-family extraction matrix, batch targets, live-roster rejection states, ACK ordering/scope/repeatable sequences, adapter-round epochs, multi-step semantic status, mandatory and adjacent turn-game disconnect policies (including all-player grace disconnect and sequential reconnect), and protocol-v3 declaration.

Ten server integration tests exercise typed wire correlation, monotonic versions over sequential and phase/adapter transitions, reconnect version continuity, adapter-round stale-action rejection, action-ID replay fencing, duplicate delivery/result idempotence, spectator/privacy boundaries, and realtime behavior. If a submit-time synchronization creates a semantic transition before rejecting the submitted action, that transition is broadcast at its incremented version. Final command evidence is recorded in the delivery response.

## Browser QA evidence

Real browser/runtime checks used the production-built websocket server and Vite client with real peer sockets:

- KPK at 844x390: no document scroll; wire targets measured approximately 52x203 CSS px. A temporary in-browser websocket fault hook changed one outgoing cut to a runtime-invalid color; the real server returned a negative ACK, all four wires became editable again, and the next unmodified cut was accepted and stayed committed. The hook was then removed.
- Kendim at 390x844 and 320x700: no document scroll; accepted word stayed locked; reload/reconnect preserved the authoritative neutral lock without reconstructing a local mapping.
- DOM/ARIA inspection found no private choice value added to ACK or submission-status surfaces.
- Negative-ACK, stale-order, reconnect re-scope, repeatable-action, spectator, and target-disconnect paths are also locked by executable reducer/integration tests.

Representative browser captures were inspected during the acceptance run and are not committed as product assets.

## Known gaps and fan-out gate

This stage intentionally does not rebuild or visually redesign the other 22 games. Their future game-specific presentation work remains the Stage 11.7 batch program. No unresolved P0 or P1 shared-system blocker is known after the final test and independent-review gates. Visual polish and game-specific UX improvements remain P2/fan-out work and do not alter these contracts.

All Stage 11.7 shared P1 findings P1-01 through P1-05 are closed by this change, subject to the final independent reviewer scores recorded at delivery.
