# GLIX Stage 11.8B — Hidden Risk & Target Rebuild

Status: implementation complete and batch branch pushed; final delivery remains gated on the mandatory fresh adversarial reviewer.

## Delivery identity

- Scope: Batch B only — `sizma`, `rus-ruleti`, `kor-bomba`, `zehirli-kadeh`, `capraz-ates`, `zaman-bombasi-hafizasi`.
- Worktree: `C:\Users\Xpike\Desktop\glix-stage-11-8b`.
- Branch: `stage-11-8b-hidden-risk-target`.
- Required base branch: `origin/stage-11-7-1-shared-prescale-fixes`.
- Required base SHA: `adbef522c5e18f091994953fdc3bff6a92a4338c`.
- Final implementation SHA: `55b660b` (`feat: rebuild stage 11.8B hidden risk and target games`).
- Pushed ref: `origin/stage-11-8b-hidden-risk-target`.
- Batch A, C and D were not started; KPK and Kendim were not redesigned.

## Changed files

- `apps/client/src/App.tsx` — routes the six games through the dedicated Stage 11.8B surface and avoids generic result/spectator shells for them.
- `apps/client/src/games/Stage6GameControls.tsx` — keeps the legacy Memory control path batch-only with one sequence ACK.
- `apps/client/src/styles.css` — loads the Stage 11.8B responsive visual layer.
- `apps/client/src/visuals/games/stage11-8b/Stage11BStage.tsx` — shared batch composition, ready barrier, phase shell and pending-action fence.
- `apps/client/src/visuals/games/stage11-8b/SizmaStage.tsx` — pipe/valve and clue/vote surface.
- `apps/client/src/visuals/games/stage11-8b/RusRuletiStage.tsx` — covered cylinder, risk chamber and survivor rail.
- `apps/client/src/visuals/games/stage11-8b/KorBombaStage.tsx` — sealed landscape bomb, hidden fuse and handoff cable.
- `apps/client/src/visuals/games/stage11-8b/ZehirliKadehStage.tsx` — linked glass chain and private trade cord.
- `apps/client/src/visuals/games/stage11-8b/CaprazAtesStage.tsx` — private aim reticle and result beam graph.
- `apps/client/src/visuals/games/stage11-8b/MemoryStage.tsx` — luminous memory wall, covered input pads and result recap.
- `apps/client/src/visuals/games/stage11-8b/stage11-8b.css` — batch shell, responsive density, focus-visible, reduced-motion and overflow rules.
- `packages/shared/src/games.ts` — focused Sızma clue-token/result privacy, permanent-leave scoring semantics and Memory batch action/result recap.
- `packages/shared/src/games-stage7.ts` — focused Çapraz Ateş scoring and all-disconnected pause/resume behavior.
- `packages/shared/src/games-stage8.ts` — focused Zehirli Kadeh all-disconnected pause/resume behavior and permanent-leave seat handling documentation.
- `packages/shared/src/contracts.ts` — Memory action mode is `batch` with the existing protocol-v3 reducer/scope.
- `packages/shared/src/games-stage7.test.ts` — updates the existing Crossfire fixture to the explicit miss action.
- `packages/shared/src/games-stage11b.test.ts` — permanent Batch B privacy, target, roster, reconnect, scoring, batch-ACK and DOM-sink regressions.
- `package.json` — includes the Batch B permanent engine test in `test:engine`.
- `docs/screenshots/stage11b/README.md` and `docs/screenshots/stage11b/*.png` — durable screenshot matrix/evidence index and browser/runtime artifacts.

## Per-game contract and privacy evidence

### Sızma

- Contract: two turn-based clue rounds, ready-for-vote barrier, 30-second vote, one clue and one vote per player; adapter owns outsider/common words and final scoring.
- Privacy: role and assigned words remain in rightful `ownState`; clue text is carried as public, deliberate `clueTokens`; voter identities remain hidden until result; outsider/common words and vote counts are result-only.
- Targets: vote target is checked against live/current/non-eliminated roster; stale target ACK remounts the editable local selection.
- Disconnect/reconnect: clue and ready participation use the shared active-roster policy; permanent leave removes the seat from result scoring and does not invent a clue or score.
- Visual metaphor: leaking neon pipe/valve carrying one clue token at a time, with pressure-gate ready barrier and sealed outsider chamber.
- Tests: two rounds, six clue tokens, pre-result voter redaction, result reveal, permanent leave, negative ACK/reducer and static DOM privacy coverage.

### Rus Ruleti

- Contract: current/random holder, 18-second shot turn, safe shot raises hidden risk by 10 up to 76, explosion removes the target and resets risk, survivor threshold ends the game.
- Privacy: exact risk remains only in rightful `ownState`; public state exposes shot history/result fields without risk.
- Targets: connected/live target validation; self-target is intentionally allowed; disconnected target is rejected by the adapter.
- Disconnect/reconnect: holder replacement follows the shared current live roster policy without fabricated scores; reconnect is covered by the shared action-scope/reducer tests.
- Visual metaphor: stylized covered cylinder, sealed risk chamber, tactile target tokens and survivor rail; no realistic weapon/FPS treatment.
- Tests: self-target exception, disconnected target rejection, hidden-risk redaction, holder disconnect and result/scoring coverage.

### Kör Bomba

- Contract: hidden 15–20-second fuse, accepted passes add 1–4 seconds to an absolute 45-second cap, repeatable `bomb-pass`, final holder receives -1; exact fuse/expiry is never public.
- Privacy: public state contains no `explosionAt` or exact fuse; rightful own state contains no exact remaining fuse (`visibleRemainingMs` is null in the adapter contract).
- Targets: only connected/current/non-self/live targets are eligible; stale targets are rejected and cannot transfer the bomb locally.
- Disconnect/reconnect: disconnected holder is replaced by accepted roster policy; all-disconnected time pauses and reconnect shifts the deadline; repeatable pass remains available after accepted ACK.
- Visual metaphor: landscape sealed bomb with covered fuse chamber, visible holder and handoff cable.
- Tests: self/stale/disconnected matrix, holder disconnect, all-disconnected pause/resume, repeatable pass and exact-private-fuse redaction.

### Zehirli Kadeh

- Contract: poison count is 1/2/3 for 2–3/4–5/6–8 players, base 20 seconds, +5 seconds per accepted trade, one trade per source, accepted trade swaps poison, clean players score +1.
- Privacy: own poison and own trade intent are rightful-owner-only; other poison states and the trade graph are result-only; public pre-result state has `poisonedPlayerIds: null`.
- Targets: connected/current/non-self/live target tray supports 2–8 players; stale/self/disconnected targets are rejected and local selection remains editable after negative ACK.
- Disconnect/reconnect: no global lifecycle fork; the focused adapter pause/resume hook shifts the phase deadline when all players disconnect; permanent-leave semantics keep remaining seats stable.
- Visual metaphor: linked ceremonial glasses, opaque liquid and magnetic trade cord.
- Tests: poison privacy, target matrix, all-disconnected pause/resume, reconnect/action scope and result-only reveal coverage.

### Çapraz Ateş

- Contract: 25 seconds; each player selects one target or explicit miss; mutual pairs score 0, non-mutual incoming fire costs 1, and no-target/miss earns +1.
- Privacy: selected target exists only in rightful own state/local action state until results; no public beam graph during play.
- Targets: connected/current/non-self/live target validation; stale, self and disconnected targets are rejected; miss remains an explicit repeatable-safe choice until accepted.
- Disconnect/reconnect: inbound target is resolved by the adapter's removal semantics; all-disconnected time pauses and reconnect shifts the deadline; no scores are fabricated.
- Visual metaphor: social neon node/beam arena with a private aim reticle; result graph mutes mutual pairs and labels penalty/reward lanes.
- Tests: exact mutual/non-mutual/miss scoring, target matrix, negative ACK, disconnect, all-disconnected pause/resume and DOM privacy coverage.

### Zaman Bombası Hafızası

- Contract: alternating display/input, length starts at 2, display duration is `length*500 + 500`, input deadline is `length*3s`, only the active player submits one `memory-sequence` batch, correct input extends the sequence, wrong input uses adapter scoring/elimination.
- Privacy: sequence is public only during legal display; input state redacts the sequence; only active rightful own state receives the actionable pad; result-only recap exposes `resultSequence`, mistakes, eliminations and survivor ladder.
- Targets: no target selection; active-player eligibility and live roster are authoritative. Active disconnect skips deterministically without invented elimination or score.
- Disconnect/reconnect: shared active-roster policy advances a disconnected active player; batch action scope and state version reset after reconnect; stale negative ACK does not erase editable state.
- Visual metaphor: luminous memory tile wall, covered input pad and active-player relay.
- Tests: batch ACK, sequence extension, wrong-sequence result recap, input redaction, active disconnect, reconnect/stale ACK and static DOM privacy.

## Shared safety and visual gates

- Existing protocol-v3 ACK reducer, state-version checks, action scopes and shared target/roster policy remain authoritative.
- No private values are written to public state, DOM text, `data-*`, CSS class names, IDs, ARIA labels, SVG metadata or debug globals; the permanent test scans all six Stage 11.8B surfaces for these sinks.
- Stage 11.8B controls use a 44px minimum action target, focus-visible outlines, reduced-motion alternatives, keyboard-safe controls, long-name ellipsis and hidden active-game page overflow.
- Rus Ruleti and Kör Bomba use the existing orientation gate and accessible portrait rotate overlay; their landscape layouts include the requested 844×390 and 667×375 responsive rules.
- Each game has a distinct object-driven surface rather than a generic target-selection card.

## Tests and runtime verification

- `npm test` — PASS; engine 85/85 and server integration 10/10 pass, with the existing baseline preserved and Batch B regressions included.
- `npm run typecheck` — PASS.
- `npm run build` — PASS.
- `npm run smoke:realtime` — PASS; health endpoint and websocket room smoke succeeded.
- Real local websocket/client route — PASS; exactly the six games ran end-to-end with one browser controller plus seven websocket controllers, including Sızma clue/ready/vote, Rus self-shot, Kör pass, Zehirli trade, Çapraz target/miss and Memory display/batch/spectator paths.

## Screenshot index

See [`docs/screenshots/stage11b/README.md`](./screenshots/stage11b/README.md). The index maps durable runtime frames for primary/private, spectator, interaction, accepted, result, 8-player, density and orientation states. Negative target/disconnect/retry states are represented by permanent engine/protocol regressions rather than fabricated UI frames.

## Independent reviewer gate

- Previous post-push reviewer: Mendel — `8.7/10`, FAIL. Its procedural blockers were the stale `pending` report fields and the fact that its own long-running verification was interrupted; it found no new source or contract blocker. The report fields and durable evidence are now closed below for the fresh final gate.
- Current final reviewer: fresh adversarial gate required before delivery is declared PASS.
- Current blockers: final reviewer gate not yet closed.
- Unresolved game-specific P2: none identified by source/tests/runtime evidence; final reviewer must confirm.
