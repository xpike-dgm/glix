# GLIX — Stage 11.4 Integration Report

This report records the user-requested Stage 11.4 integration. The attached execution contract supplied the repository, source refs, merge order, invariants, QA gates, and delivery-report requirements; the user's explicit instruction to keep `main` untouched and stop after the final report remains in force.

## 1. Target

- Target branch: `stage-11-4-integration`
- Full integration head SHA validated before this report-only commit: `5a6408994d67bfcc101835bd7102df7c07911f92`
- Base: `origin/main` at `2118d9ab254c4e69988c6192e9fe6409dad333c7`

## 2. Verified source branch heads

- `origin/stage-11-3a-gameplay-integrity` — `b5b0fccb5b831c0b077ecf18e90b816fda6dc9b6`
- `origin/stage-11-3b-visual-core` — `021d7c5ffebf9dd4d40855d8452b2bbd1dca5e1c`
- `origin/stage-11-3c-production-assets-01` — `de15f4ee89fe89feb00c2f01041bad9ef6a9869b`
- `origin/stage-11-3d-ci-release-gate` — `f99a109657aef79e8cb0f768fef2e56c437772c3`

## 3. Merge order

All four integrations used explicit `--no-ff` merge commits in the contract order:

1. 11.3A Gameplay Integrity — merge `2d71a2e226dd525eb7f43568b20d3854a93180a9`
2. 11.3B Visual Core — merge `0d21c34dd93f3bf867b154cb1aa3db331263329f`
3. 11.3C Production Assets — merge `6e3536486f833c32d9a2fe89be5748674ccc6dc2`
4. 11.3D CI Release Gate — merge `8d9c3d352fcd7a3159545ee23565a98e07114145`

## 4. Conflicts encountered and resolutions

No merge conflicts occurred. No conflict resolution reverted or weakened gameplay/server-authoritative changes.

## 5. Gameplay-integrity verification

The four source heads are ancestors of the target branch, and there is no post-merge diff in `packages/shared`, `apps/server`, or `apps/client/src/games`.

Verified in source and the Stage 11.3A test coverage:

- protocol v2 is present;
- memory sequence data remains hidden outside its display phase;
- Rus Ruleti public state omits risk percentage/history and validates only the weapon owner plus connected, eligible targets;
- Sözlük Blöfü definition IDs are not derived from player IDs;
- Açgözlülük Limiti and Ortalamaya En Yakın preserve the first valid submission and reject duplicates;
- Rüşvet ve Darbe uses one budget ledger without overspend;
- Kör Bomba keeps the server-authoritative absolute 45-second hard cap and does not expose the fuse/remaining secret;
- target pools and validation retain connected/current-game/non-eliminated filtering where required;
- KPK stale clue/mapping state is removed on permanent departure;
- reconnect, spectator, host migration, and duplicate-socket behavior remains covered.

## 6. Production asset wiring

- Added centralized `PREMIUM_ASSET_PATHS` entries for the Stage 11.3C production files.
- Wired portrait and landscape raster decks into `StageBackdrop`; the selected deck follows the game's `requiresLandscape` flag while CSS/SVG layers and live HTML/SVG text remain above the raster.
- Wired the eight unique `/assets/avatars/hud-pips/*.svg` files into the deterministic eight-slot `PlayerAvatarStrip` mapping, retaining accent identity, glyph identity, accessible labels, and ready/disconnected/eliminated states.
- Wired the shared timer bezel, connection radar, and rotate-phone icon into the shared HUD/overlay.
- Registered KPK and Çağrışım Ağı production assets for lazy game-pack preloading only; no deep game rebuild was attempted.
- Updated the service-worker shell list to actual shared asset paths; game-specific packs are not eagerly cached.
- HTTP asset QA returned `200` for all 44 files currently under `apps/client/public/assets` (39 are the Stage 11.3C production additions).

## 7. Result-overlay gap fix

`MatchScreen` now supplies existing Stage 6, Stage 7, Stage 8, and Stage 9 result controls to `ResultOverlay`. Round-result controls are rendered inside a disabled fieldset so result phases cannot accept gameplay input. The final route score overlay is intentionally not passed that lock prop, so `LOBİYE DÖN` remains usable.

## 8. Stale brand-copy cleanup

Replaced `Neon Toybox sahne hamleni aldı.` with the neutral GLIX copy `GLIX sahne hamleni kaydetti.`. The old raw `inputCount` presentation was removed from the client visual scene, and no active `apps/client` runtime reference remains for the stale Neon Toybox copy, asset paths, or dashboard telemetry.

## 9. Exact test results

`npm test` passed without skips, cancellations, or failures:

- engine: 54 passed
- server: 7 passed
- total: 61 passed

This confirms the branch did not regress to the older 47-test baseline.

## 10. Typecheck, build, smoke, and CI

- `npm ci` — passed; 79 packages installed, audit reported 0 vulnerabilities.
- `npm run typecheck` — passed for shared, client, and server.
- `npm run build` — passed; Vite transformed 55 modules and shared/client/server builds completed.
- `npm run smoke:realtime` — passed with `ok: true`, server version `0.7.0`, and an active realtime room smoke path.
- `.github/workflows/ci.yml` is present and retains the required `npm ci`, `npm test`, `npm run typecheck`, `npm run build`, and realtime-smoke gates without `continue-on-error` on required gates.

## 11. Manual and static QA

The bundled `agent-browser` CLI was unavailable in this environment, so headless Chrome plus the DevTools Protocol was used as the browser-QA fallback.

- Home screenshots captured at 320×700, 390×844, and 430×932; the narrow portrait CTA cards now stack without horizontal overflow.
- Landscape home screenshot captured at 844×390.
- Two isolated browser contexts completed create-room, join-room, lobby, and match entry.
- Portrait match shell at 390×844 loaded the portrait deck with no page scroll or horizontal overflow.
- Landscape-only Rus Ruleti loaded the landscape deck at wide orientation; changing the same live match to 390×844 displayed the rotate overlay and the production rotate icon.
- CDP metrics reported no horizontal or vertical overflow at 320×700, 390×844, 430×932, or 844×390 for the home shell, and no page overflow in the live match checks.
- No runtime exceptions, console error-level entries, or Vite error overlay were observed. A transient WebSocket-close warning appeared during short-lived headless-context teardown while the dev server was being watched; the realtime smoke and two-tab match flow passed.
- `SpectatorOverlay` wiring and the Stage 6–9 result branches were statically verified in `MatchScreen`; the live browser smoke focused on the host/guest match path.

QA screenshots (not committed):

- `C:\Users\Xpike\Desktop\glix-stage-11-4-qa\home-live-320b.png`
- `C:\Users\Xpike\Desktop\glix-stage-11-4-qa\home-live-390b.png`
- `C:\Users\Xpike\Desktop\glix-stage-11-4-qa\home-live-430b.png`
- `C:\Users\Xpike\Desktop\glix-stage-11-4-qa\home-live-landscape-844b.png`

## 12. Changed-file summary

At the validated integration head, `git diff origin/main...HEAD --stat` reported 80 changed files, 4,425 insertions, and 393 deletions. This consists of the four traceable Stage 11.3 merge streams plus the 13-file Stage 11.4 shell/asset integration fix commit; the 39 production assets and CI workflow are included. This report is the additional documentation-only file.

## 13. Remaining known issues / deliberate deferrals

- KPK and Çağrışım Ağı deep visual calibration remains deferred to the later calibration sprint, as required by the contract.
- Full-body avatar usage and broad 24-game visual calibration remain out of scope for this integration sprint.
- The browser-QA fallback was used because `agent-browser` was not installed; this is an environment/tooling note, not a product failure.

## 14. Main-branch protection

`main` was not merged to, updated, or force-moved. The original dirty `main` checkout was kept separate and remained at `2118d9ab254c4e69988c6192e9fe6409dad333c7`; only `stage-11-4-integration` is being delivered.

STAGE 11.4 INTEGRATION: COMPLETE
