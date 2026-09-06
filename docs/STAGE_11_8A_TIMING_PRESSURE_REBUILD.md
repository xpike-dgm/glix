# Stage 11.8A — Timing Pressure Rebuild

## Scope and repository state

- Base branch: `origin/stage-11-7-1-shared-prescale-fixes`
- Required base HEAD verified before implementation: `adbef522c5e18f091994953fdc3bff6a92a4338c`
- Working branch: `stage-11-8a-timing-pressure`
- Final SHA: no batch commit was created; HEAD remains `adbef522c5e18f091994953fdc3bff6a92a4338c`.
- Scope: exactly `butona-bas`, `gizli-hirsiz`, `kor-kronometre`, `asiri-yukleme`, and `son-kisi`.
- Batch B, C, and D were not started.

The five games use the Stage 11.7.1 protocol-v3 transport, shared lifecycle, ACK reducer, state-version fencing, target validation, and reconnect model. The implementation adds only game-specific public/private projections and live-roster hooks required by these five adapters; it does not fork the protocol or `MiniGameEngine`.

## Exact changed files

Source and documentation:

- `apps/client/src/App.tsx`
- `apps/client/src/visuals/games/Stage11ATimingPressureStage.tsx`
- `apps/client/src/visuals/games/Stage11ATimingPressureStage.css`
- `apps/client/src/visuals/games/stage11a/ButonaBasStage.tsx`
- `apps/client/src/visuals/games/stage11a/ButonaBasStage.css`
- `apps/client/src/visuals/games/stage11a/GizliHirsizStage.tsx`
- `apps/client/src/visuals/games/stage11a/GizliHirsizStage.css`
- `apps/client/src/visuals/games/stage11a/KorKronometreStage.tsx`
- `apps/client/src/visuals/games/stage11a/KorKronometreStage.css`
- `apps/client/src/visuals/games/stage11a/AsiriYuklemeStage.tsx`
- `apps/client/src/visuals/games/stage11a/AsiriYuklemeStage.css`
- `apps/client/src/visuals/games/stage11a/SonKisiStage.tsx`
- `apps/client/src/visuals/games/stage11a/SonKisiStage.css`
- `packages/shared/src/games.ts`
- `packages/shared/src/games-stage7.ts`
- `packages/shared/src/games-stage9.ts`
- `packages/shared/src/games-stage11.test.ts`
- `docs/STAGE_11_8A_TIMING_PRESSURE_REBUILD.md`

The screenshot artifacts listed below are the runtime evidence files produced for this batch.

## Game contracts and visual implementation

### Butona Bas

- 45-second server-owned round with exactly 150 x 300 ms windows.
- Repeatable taps are accepted through the shared ACK path. A player is counted once per window; singleton windows receive `-1`, multi-player windows receive `+1` before the final rank award.
- The native stage is a physical arcade timing console: moving aperture, heat/combo gauge, pulse/rejection feedback, window rail, and dominant `BAS` button.
- Result state exposes the authoritative window summary, singleton/multi explanation, rank ladder, adapter score, own delta, and private own accepted-window/combo summary.
- Pointer-down and guarded Space/Enter handling avoid keyboard double-fire; the generic pending fence does not lock repeatable actions.

### Gizli Hırsız

- 30-second one-press round. Exactly one presser receives `+1`; multiple pressers receive the adapter’s per-presser penalty; no press is neutral.
- The locked vault, fingerprint slot, and alarm lamp reveal no press count or pressed identities before result. The participant receives only their own state.
- Pending fingerprint scan, accepted local seal, duplicate/late/invalid feedback, and legal-only retry are native to the stage.
- Result opens the vault, states exact-one/multiple/no-press outcome, reveals names only at the result boundary, and emphasizes the own delta.

### Kör Kronometre

- 18-second phase, hidden 10-second target, one STOP per player. Nearest receives `+2`, second nearest `+1`, missing input is resolved as 18 seconds.
- The covered analog stopwatch hides truthful elapsed time and the target while playing; the shared HUD is explicitly `SÜRESİZ` during play so it cannot become a countdown.
- Accepted STOP freezes only the local hand until authoritative own state arrives; spectators receive a neutral dial.
- Result opens the target ring and server stop markers, shows ranks/distances, highlights the own row, and explains missing-as-18. STOP supports pointer, Space, and Enter parity.

### Aşırı Yükleme

- Repeatable clicks charge authoritative public energy to 100. Threshold starts a hidden 3-second arm window; the first post-arm click ruptures that player; arm expiry resolves as no overflow.
- Public state contains only energy and qualitative armed/rupture state. Exact arm timestamp and private click counts are never sent in public state or rendered to spectators.
- The stage is a pressure reactor with public energy chamber, sealed redline core, private telemetry, repeatable `TIKLA`, pending/accepted/rejected feedback, authoritative rupture, and native replay/rank/no-overflow result.
- Reduced-motion CSS removes choreography while preserving energy, arm, and result state.

### Son Kişi

- The server chooses a hidden random deadline from 10–20 seconds. Each participant can escape once; the final escape gets `+1`, earlier escapes `0`, non-escaped players `-1`, and same-millisecond final escapes all get `+1`.
- The adapter keeps deadline, escape count/IDs, and timestamps private until result. Reconnecting seats are revalidated against the live roster and nonparticipants/late actions are rejected.
- The dark room, illuminated exit latch, and unmarked clock shadow provide tension without a countdown. Pending/accepted/rejected/locked latch states and legal retry are local/native.
- Result reveals duration, timeline, last marker, ties, non-escape penalty, nickname-safe identity, and own delta.

## Shared integration and privacy notes

`App.tsx` routes only these five IDs to the Stage 11.8A stage family and suppresses the generic hero, generic result/spectator overlays, and generic controls for them. KPK, Kendim, and all other games retain their existing paths. The generic final-route shell remains available after the native in-stage result, while each Batch A game owns its result composition.

Repeatable games remain usable while an ACK is pending; single-submit games retain the shared ACK fence. All payloads continue through the existing `onSubmit` protocol-v3 action correlation path. The added adapter `setConnectedPlayerIds` hook is consumed by the existing server synchronization point so grace-disconnected seats cannot submit or become hidden action targets, while reconnects can be accepted when legal.

Names in result surfaces use roster nicknames; opaque short IDs are not presented as primary identity. Public/private state is covered by adapter tests and runtime DOM/ARIA searches.

## Tests and verification

Commands run from `C:\Users\Xpike\Desktop\glix-stage-11-8a`:

- `npm test` — pass: engine `79/79`, server `10/10`, `89` total tests; baseline was not reduced.
- `npm run typecheck` — pass for shared, client, and server.
- `npm run build` — pass; Vite transformed 80 modules and emitted the production client bundle.
- `$env:GLIX_SMOKE_HTTP_URL='http://127.0.0.1:8788'; $env:GLIX_SMOKE_WS_URL='ws://127.0.0.1:8788/ws'; npm run smoke:realtime` — pass; health, room create/join, Butona Bas route selection, and tutorial state verified.
- `git diff --check` — pass; only Git’s expected LF/CRLF normalization warnings were emitted.

New permanent coverage in `packages/shared/src/games-stage11.test.ts` covers Butona window/combo summaries, five-adapter live-roster reject/reconnect, Kor public deadline redaction, Gizli privacy/duplicate behavior, Aşırı hidden arm state/expiry, and Son deadline/escape privacy/result reveal. Existing Stage 11.7.1 stale-ACK/action-scope and server reconnect tests remain green.

## Screenshot and runtime evidence index

All paths below are relative to the repository root and exist under `C:\Users\Xpike\Desktop\glix-stage-11-8a\artifacts\stage11a-screenshots`:

- `butona-bas-play-390x844.png` — Butona Bas native aperture, 300 ms readout, dominant button, heat gauge, and window rail.
- `butona-bas-result-390x844.png` — Butona Bas native result visible beneath the final-route shell; window/rank facts and own result are present.
- `gizli-hirsiz-play-390x844.png` — Gizli Hırsız vault/fingerprint/alarm composition in preparation with no presser count.
- `gizli-hirsiz-result-390x844.png` — Gizli Hırsız native open-vault/no-press result beneath the final-route shell.
- `kor-kronometre-play-390x844.png` — Kör Kronometre live covered dial and dominant STOP; common HUD shows `SÜRESİZ`.
- `kor-kronometre-result-320x700.png` — compact result/roster stress capture with target/stop reveal behind the route shell.
- `kor-kronometre-result-390x520.png` — short-height result capture.
- `kor-kronometre-landscape-844x390.png` — landscape smoke capture.
- `asiri-yukleme-play-390x844.png` — Aşırı Yükleme public pressure reactor, sealed redline core, and private telemetry.
- `son-kisi-result-390x844.png` — Son Kişi result timeline, duration reveal, last/tie marker treatment, and non-escape row beneath the route shell.

The live two-client run used the isolated client `http://127.0.0.1:5181/` and server `ws://127.0.0.1:8788/ws`. It exercised the exact five-game route, public/private pressure state, 100-click arm path, no-overflow resolution, and result transitions. The current artifact set is a representative local capture rather than a complete file for every interaction/rejection/spectator/8-player matrix cell; those remaining cells are covered by source-level state guards and automated adapter/reconnect tests, and this evidence-backed limitation is retained here rather than fabricated away.

## Independent reviewer gate

- Reviewer: fresh independent adversarial reviewer, separate from all five implementation agents.
- Overall score: unavailable. Two fresh reviewer attempts errored before running because the account hit its usage limit.
- Per-criterion score: unavailable; no reviewer result was manufactured.
- Blockers: reviewer gate could not run, so the required independent gate is unresolved.
- Required gate: overall `>= 9.0/10` and `BLOCKERS: NONE`.
- Delivery status: BLOCKED. The specification requires stopping when the independent reviewer cannot run; therefore no PASS, commit, or push is claimed.

## Commit and delivery

- Commit message: `feat: rebuild stage 11.8A timing and pressure games`
- Push target: only `origin/stage-11-8a-timing-pressure`.
- Final SHA and reviewer decision are intentionally absent because the gate could not run.
- No commit or push was performed. Work stops at the reviewer gate; no Batch B, C, or D work is included.
