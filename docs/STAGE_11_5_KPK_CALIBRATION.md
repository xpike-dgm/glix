# Stage 11.5 — Kontrol Paneli Kaosu (KPK) Visual Calibration Report

## 1. Executive Summary & Calibration Standard

- **Role:** GLIX Senior Game UI Engineer + 2D Technical Art Integrator
- **Repository:** `xpike-dgm/glix`
- **Branch:** `stage-11-5-kpk-calibration`
- **Base Head:** `754b9335b76e656a9c42a2e9d43dd55f79786e79` (`origin/stage-11-4-integration`)
- **Current Branch SHA:** `274499085abd8ad449fd6e27f9305be8a9aedd0f`
- **Status:** Pre-art-gate blockers resolved, fully calibrated in real headless Chrome, zero server/engine contract alterations.

This sprint establishes the visual and runtime benchmark for GLIX 2D arcade mini-games. **Kontrol Paneli Kaosu** has been rebuilt from a web-style form and card layout into a fullscreen, landscape **2D social arcade game stage** powered by the production assets integrated in Stage 11.4.

---

## 2. Pre-Art-Gate Blockers Resolution & Invariants

1. **Removal of QA Runtime Hook (`window.__glixSend`):**
   - Removed `window.__glixSend` from `apps/client/src/App.tsx`.
   - QA orchestration uses 100% standard user-driven UI DOM interactions (`.mode-switch button`, `.game-row`, `.button.button-start`) without exposing internal application hooks.
2. **Authoritative Spectator Reconnect Methodology:**
   - Real reconnect semantics: a room member (`SpecWatcher`) joins during the lobby phase and captures its server-issued `reconnectToken`.
   - `SpecWatcher` disconnects *before* the match is started, ensuring `getConnectedPlayerIds(room)` excludes it from `match.engine.playerIds`.
   - During the KPK playing phase, `SpecWatcher` reconnects via token in a separate client instance.
   - Authoritatively verified:
     - `currentGameParticipant === false`
     - Private clue redacted (`hasClueText === false`, `hasSpectatorNote === true`)
     - Zero interactive wire controls (`wireButtonsCount === 0`, `spectatorSurfacesCount === 4`)
     - Self status badge displays `İZLEYİCİ`
3. **Scope Pollution Cleanup:**
   - Untracked reference/temporary artifacts removed from git branch: `docs/GAME_VISUAL_SPEC_24.md`, `docs/GLIX_VISUAL_BIBLE.md`, `docs/STAGE_11_RELEASE_HARDENING_PLAN.md`, and `scripts/qa-kpk.mjs`.
4. **Server Contract & Game Rule Integrity:**
   - Zero changes to `apps/server/**` or `packages/shared/**`. Protocol version remains v2.
   - Selected cut color tracked strictly as local pending/committed presentation state; neutral locked state rendered on reconnect when cut color is unconfirmed.
   - Round outcome, scoring, and colors resolved strictly from server-authorized `publicState.results`.
   - Single interaction surface: legacy `PanelControls` form card suppressed during play (`!publicState.finished` returns `null`).
   - GLIX arcade terminology strictly applied: `DOĞRU KABLO`, `YANLIŞ KABLO`, `KABLO KESİLMEDİ`.

---

## 3. Technical Art & Stage Geometry

### A. Chassis Layering & Cutout Windows
- **Console Chassis:** `kpk-console-chassis-v1.webp` (1920×1080).
- **Cutout Bay Transparency:** Columns at `X: [512, 687]`, `[750, 925]`, `[994, 1154]`, `[1232, 1407]` are 100% transparent (`alpha === 0`) across `Y: [210, 893]` (63.33% height).
- **Z-Index Hierarchy:**
  - Wires layer (`.kpk-wires-layer`): `z-index: 6` (behind chassis cutouts)
  - Chassis faceplate (`.kpk-chassis-faceplate`): `z-index: 10` with `pointer-events: none` (transparent cutouts pass clicks through)
  - Wire colorblind badges (`.kpk-wire-tag`): `z-index: 15`
  - Snips targeting reticle (`.kpk-wire-reticle`): `z-index: 18`
  - Result outcome badges (`.kpk-wire-result-badge`): `z-index: 18`
  - Clue caution dock (`.kpk-clue-dock`): `z-index: 20`
  - Spark particle burst FX (`.kpk-sparks-container`): `z-index: 30`
  - Ready countdown barrier overlay: `z-index: 40`

### B. Dual-State Wire Sprite Optics
- **Wire Assets:** `kpk-wire-blue-v1.webp`, `kpk-wire-green-v1.webp`, `kpk-wire-red-v1.webp`, `kpk-wire-yellow-v1.webp` (160×720).
- **Intact Wire State:** Left 32% (X: 0 to 49.5px) rendered with `background-size: 310% 100%` and `background-position: 0% center`.
- **Severed Wire State:** Right 68% (X: 52 to 160px) rendered with `background-size: 148% 100%` and `background-position: 100% center`, revealing cut air gap and copper core.
- **Micro-Sparks Burst:** Animated particle burst powered by `kpk-cut-sparks-atlas-v1.webp` on cable cut.

### C. Colorblindness & Accessibility (Triple Redundancy)
1. **Hue:** Primary wire tints (Kırmızı `#ff3355`, Mavi `#00d4ff`, Yeşil `#00ff88`, Sarı `#ffd700`).
2. **Numeric Ordering:** High-contrast pill badges (`1`, `2`, `3`, `4`).
3. **Text Labels:** Embossed Turkish badges (`KIRMIZI`, `MAVİ`, `YEŞİL`, `SARI`) with `rgba(6, 9, 24, 0.94)` background and contrast ratio > 7:1.
4. **Keyboard Navigation:** Full keyboard navigation (`Tab` / `Shift+Tab`, `Space` / `Enter`) with cyan focus indicator ring.

### D. Fullscreen Landscape & Responsive Containment
- 16:9 arcade containment (`aspect-ratio: 16 / 9`, `max-width: 100%`, `max-height: 100%`).
- **Portrait Rotate Gate:** Fullscreen 90° rotate advisory modal triggered on portrait viewports, rendering gameplay behind modal inert.
- **Compact HUD:** Single-row layout preserving room code, timer bezel, player score, connection status, and 8-player avatar pips without vertical overflow.

---

## 4. Verification Evidence & Test Execution

### A. Real Browser Screenshots (Chrome CDP)
All 6 screenshots captured at real device viewports in `C:\Users\Xpike\Desktop\glix-stage-11-5-qa\`:

1. **`kpk-playing-844x390.png`** (844×390 Landscape):
   - Verified: Fullscreen 2D chassis, glowing intact cable cartridges, numbered badges, caution clue dock, 8-player pips HUD. Zero page scroll (`scrollWidth: 844, clientWidth: 844, scrollHeight: 390, clientHeight: 390`).
2. **`kpk-playing-667x375.png`** (667×375 Landscape / iPhone SE):
   - Verified: Responsive containment on ultra-compact mobile landscape viewport.
3. **`kpk-portrait-rotate-390x844.png`** (390×844 Portrait):
   - Verified: Rotate phone advisory overlay with blurred background and disabled game controls.
4. **`kpk-result-844x390.png`** (844×390 Landscape):
   - Verified: Round resolved arcade card with player scoreboard (`MAVİ (DOĞRU) +1`, `KESMEDİ 0`) and server-verified results.
5. **`kpk-spectator-844x390.png`** (844×390 Landscape):
   - Verified: Real reconnect spectator view showing `SpecWatcher (İZLEYİCİ)`, spectator terminal guidance note, zero private clue, and all 4 wire buttons inert (`.kpk-wire-surface.spectator`).
6. **`kpk-8players-844x390.png`** (844×390 Landscape):
   - Verified: Compact HUD displaying all 8 player avatar pips with live glow accents.

### B. Automated Verification Suite Logs
- **`npm run typecheck`:** PASSED (0 errors across `@glix/shared`, `@glix/client`, and `@glix/server`).
- **`npm run build`:** PASSED (client and server bundled cleanly).
- **`npm test`:** PASSED (61 tests total: 54 engine unit tests + 7 server reconnect integration tests, ~104s runtime).
- **`npm run smoke:realtime`:** PASSED (`{"ok":true,"health":{"version":"0.7.0","activeRooms":0},"roomCode":"V2XRN","game":"butona-bas","phase":"tutorial"}`).
- **Console Errors:** 0 recorded during full automated match playthrough.
- **Network Errors (4xx/5xx):** 0 recorded.

---

## 5. Changed Files (Diff against `origin/stage-11-4-integration`)

Exactly 12 files modified/added:
- `apps/client/src/App.tsx`
- `apps/client/src/games/Stage8GameControls.tsx`
- `apps/client/src/styles.css`
- `apps/client/src/visuals/games/kontrol-paneli-kaosu/KpkClueDock.tsx`
- `apps/client/src/visuals/games/kontrol-paneli-kaosu/KpkSparksFx.tsx`
- `apps/client/src/visuals/games/kontrol-paneli-kaosu/KpkStage.tsx`
- `apps/client/src/visuals/games/kontrol-paneli-kaosu/KpkWireCorridor.tsx`
- `apps/client/src/visuals/games/kontrol-paneli-kaosu/kpk.css`
- `apps/client/src/visuals/games/kontrol-paneli-kaosu/types.ts`
- `apps/client/src/visuals/viewport/GameViewport.tsx`
- `apps/client/src/visuals/visualAssetManifest.ts`
- `docs/STAGE_11_5_KPK_CALIBRATION.md`

---

## 6. Branching & Delivery

- Branch: `stage-11-5-kpk-calibration`
- Pushed to: `origin/stage-11-5-kpk-calibration`
- Not merged to `main` or `stage-11-4-integration`.

```
ART GATE: PENDING USER/ART-DIRECTOR SCREENSHOT REVIEW
STAGE 11.5 KPK CALIBRATION: COMPLETE
```
