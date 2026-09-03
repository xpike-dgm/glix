# Stage 11.5 — Kontrol Paneli Kaosu (KPK) Visual Calibration Report

## 1. Executive Summary & Calibration Standard

- **Role:** GLIX Senior Game UI Engineer + 2D Technical Art Integrator
- **Repository:** `xpike-dgm/glix`
- **Branch:** `stage-11-5-kpk-calibration`
- **Base Head:** `754b9335b76e656a9c42a2e9d43dd55f79786e79` (`origin/stage-11-4-integration`)
- **Status:** Complete, verified in real headless Chrome, zero engine/server regressions.

This sprint establishes the visual and runtime benchmark for GLIX 2D arcade mini-games. **Kontrol Paneli Kaosu** has been rebuilt from a web-style form and generic card layout into a fullscreen, landscape **2D social arcade game stage** powered by the production assets integrated in Stage 11.4.

---

## 2. Server Contract & Rule Integrity Invariants

1. **Zero Server / Contract Changes:**
   - No modifications to `apps/server/**` or `packages/shared/**`.
   - Protocol version remains v2. All network action envelopes (`submit_action`) and state synchronizations remain 100% authoritative.
2. **Authoritative State Invariants:**
   - `KontrolPaneliOwnState` intentionally omits cut color after submission. The selected cut color is tracked strictly as local pending/committed presentation state and is never fabricated upon reconnect.
   - If `ownState.hasCut === true` but the local selection is unknown, a neutral locked state is rendered.
   - Final round outcomes, scoring, and colors are resolved strictly from `publicState.results`.
3. **Single Interaction Surface:**
   - The legacy `PanelControls` form card is suppressed during play (`!publicState.finished` returns `null`), ensuring the interactive console chassis is the sole game surface.
4. **GLIX Arcade Terminology:**
   - Defusal/military terminology replaced with arcade-authentic copy:
     - `DOĞRU KABLO` (+1 Puan, Konsol Çözüldü)
     - `YANLIŞ KABLO` (0 Puan, Sistem Kilitlendi)
     - `KABLO KESİLMEDİ` (0 Puan)

---

## 3. 2D Arcade Stage & Technical Art Integration

### A. Chassis Layering & Cutout Geometry
- **Chassis Asset:** `kpk-console-chassis-v1.webp` (1920×1080).
- **Cutout Slot Transparency:** Columns at `X: [512, 687]`, `[750, 925]`, `[994, 1154]`, `[1232, 1407]` are 100% transparent (`alpha === 0`) across vertical span `Y: [210, 893]` (63.33% height).
- **Z-Index Hierarchy:**
  - Backing depth layer: `z-index: 1`
  - Wires layer (`.kpk-wires-layer`): `z-index: 6` (positioned behind chassis cutouts)
  - Chassis faceplate (`.kpk-chassis-faceplate`): `z-index: 10` with `pointer-events: none` so pointer clicks cleanly pass through the cutout windows to the wire hit areas.
  - Wire colorblind badges (`.kpk-wire-tag`): `z-index: 15`
  - Snips targeting reticle (`.kpk-wire-reticle`): `z-index: 18`
  - Result outcome badges (`.kpk-wire-result-badge`): `z-index: 18`
  - Clue caution dock (`.kpk-clue-dock`): `z-index: 20`
  - Spark particle burst FX (`.kpk-sparks-container`): `z-index: 30`
  - Ready countdown barrier overlay: `z-index: 40`

### B. Dual-State Wire Sprite Sheet Optics
- **Wire Assets:** `kpk-wire-blue-v1.webp`, `kpk-wire-green-v1.webp`, `kpk-wire-red-v1.webp`, `kpk-wire-yellow-v1.webp` (160×720).
- **Sprite Anatomy:**
  - **Intact State:** Left 32% (X: 0 to 49.5px). Rendered with `background-size: 310% 100%` and `background-position: 0% center`, showing only the intact glowing tube cartridge.
  - **Severed State:** Right 68% (X: 52 to 160px). Rendered with `background-size: 148% 100%` and `background-position: 100% center`, revealing the severed cable gap and glowing copper core.
- **Spark Burst FX:** Animated CSS spark flash and burst powered by `kpk-cut-sparks-atlas-v1.webp` on cable sever.

### C. Colorblindness & Accessibility (Triple Redundancy)
1. **Color Tint:** Distinct primary wire colors (Kırmızı `#ff3355`, Mavi `#00d4ff`, Yeşil `#00ff88`, Sarı `#ffd700`).
2. **Numeric Ordering:** High-contrast pill tags (`1`, `2`, `3`, `4`).
3. **Turkish Text Badges:** High-contrast embossed text badges (`KIRMIZI`, `MAVİ`, `YEŞİL`, `SARI`) with `background: rgba(6, 9, 24, 0.94)` and contrast ratio > 7:1.
4. **Keyboard Accessibility:** Full keyboard navigation (`Tab` / `Shift+Tab`, `Space` / `Enter` to cut), with distinct cyan focus rings.

### D. Fullscreen Landscape & Mobile Viewport
- Locked into responsive 16:9 arcade containment (`aspect-ratio: 16 / 9`, `max-width: 100%`, `max-height: 100%`).
- **Portrait Rotate Gate:** Triggers on portrait viewports (`orientation: portrait` or `aspect-ratio < 1.1`), cleanly disabling interactions with a 90° rotate advisory card.
- **HUD Integration:** Single-row compact layout displaying room code, timer bezel, player score, connection status, and 8-player avatar pips without vertical overflow.

---

## 4. Verification Evidence & Real Browser QA

### A. Real Browser Screenshots (Chrome CDP)
All 6 required screenshots were captured via headless Chrome CDP in `scripts/qa-kpk.mjs`:

1. **`kpk-playing-844x390.png`** (844×390 Landscape):
   - Path: `C:\Users\Xpike\Desktop\glix-stage-11-5-qa\kpk-playing-844x390.png`
   - Verified: Fullscreen 2D chassis, intact wire tubes cleanly framed behind metal cutouts, numbered colorblind tags, caution clue dock, 8-player pips HUD. Zero page scroll (`scrollWidth: 844, clientWidth: 844, scrollHeight: 390, clientHeight: 390`).
2. **`kpk-playing-667x375.png`** (667×375 Landscape / iPhone SE):
   - Path: `C:\Users\Xpike\Desktop\glix-stage-11-5-qa\kpk-playing-667x375.png`
   - Verified: Perfect aspect ratio containment on ultra-compact mobile landscape viewport, zero overflow.
3. **`kpk-portrait-rotate-390x844.png`** (390×844 Portrait):
   - Path: `C:\Users\Xpike\Desktop\glix-stage-11-5-qa\kpk-portrait-rotate-390x844.png`
   - Verified: Fullscreen rotate overlay ("Cihazını yatay çevir"), gameplay behind modal is blurred and non-interactive.
4. **`kpk-result-844x390.png`** (844×390 Landscape):
   - Path: `C:\Users\Xpike\Desktop\glix-stage-11-5-qa\kpk-result-844x390.png`
   - Verified: Round resolved arcade card with player scoreboard (`MAVİ (DOĞRU) +1`, `KESMEDİ 0`), server-verified target cable clue summary.
5. **`kpk-spectator-844x390.png`** (844×390 Landscape):
   - Path: `C:\Users\Xpike\Desktop\glix-stage-11-5-qa\kpk-spectator-844x390.png`
   - Verified: Spectator perspective showing live severed wire state (`DOĞRU KESİM` badge, air gap, copper core), all cut buttons disabled.
6. **`kpk-8players-844x390.png`** (844×390 Landscape):
   - Path: `C:\Users\Xpike\Desktop\glix-stage-11-5-qa\kpk-8players-844x390.png`
   - Verified: Compact HUD displaying all 8 player avatar pips with live glow accents and states.

### B. Automated Test Results
- **`npm run typecheck`:** 0 errors across `@glix/shared`, `@glix/client`, and `@glix/server`.
- **`npm run build`:** Clean client and server production bundling.
- **`npm test`:** 61/61 tests passed (54 engine unit tests + 7 server reconnect integration tests, ~104s runtime).
- **Console Errors:** 0 recorded during full match lifecycle.
- **Network Errors (4xx/5xx):** 0 recorded.

---

## 5. Branching & Delivery

- Branch: `stage-11-5-kpk-calibration`
- Pushed to: `origin/stage-11-5-kpk-calibration`
- Not merged to `main` or `stage-11-4-integration`.

```
ART GATE: PENDING USER/ART-DIRECTOR SCREENSHOT REVIEW
STAGE 11.5 KPK CALIBRATION: COMPLETE
```
