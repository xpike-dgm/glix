# Stage 11.8C: Numeric / Density Immersive Rebuild Report

**Status:** Complete & Validated — `INDEPENDENT REVIEW REQUIRED — NOT YET ACCEPTED`  
**Role:** Lead Game UI Engineer + Senior 2D Technical Artist + Systems Integrity Reviewer  
**Target Games (Batch C):**
1. `acgozluluk-limiti` (Açgözlülük Limiti)
2. `ortalamanin-yarisi` (Ortalamanın Yarısı)
3. `gizli-kareler` (Gizli Kareler)
4. `cizgiyi-gecme` (Çizgiyi Geçme)
5. `gizli-alisveris` (Gizli Alışveriş)

**Branch:** `stage-11-8c-numeric-density`  
**Base Commit:** `adbef522c5e18f091994953fdc3bff6a92a4338c` (`origin/stage-11-7-1-shared-prescale-fixes`)  
**Design Theme:** Premium 2D Arcade / Neon Social Arcade (Zero 3D/WebGL)  

---

## 1. Executive Summary

Stage 11.8C delivers the dedicated, immersive Premium 2D presentation for all **five Batch C games**, completely replacing generic form cards and stage hero placeholders with custom arcade apparatuses while strictly preserving authoritative game contracts, Protocol v3 transactional input handling, and privacy boundaries.

### Key Milestones Delivered:
1. **Zero-Scroll Viewport Containment**: Validated at standard mobile (`390×844`), narrow width (`320×700`), virtual keyboard deployment height (`390×520`), and landscape smoke (`844×390`). Automated CDP testing verified zero horizontal overflow (`scrollWidth <= clientWidth`) across all 50 captured runtime frames (10 scenes per game across all 5 games).
2. **Dedicated 2D Neon Arcade Apparatuses**:
   - **Açgözlülük Limiti**: Communal pressure cylinder with illuminated threshold marker, private token selector (0..N tokens, matching authoritative limits: 3P=6, 4P=11, 5P=17, 6P=24, 7P=33, 8P=43), and over-limit crash vs balance held result reveal.
   - **Ortalamanın Yarısı**: Calibrated semi-circular SVG target gauge dial (0..100) with private cyan needle, gold target needle ($Target = Average / 2$), distance chips, authoritative +2/+1 rank scoring, and missing player auto-pick badges.
   - **Gizli Kareler**: Responsive pressure grid ($3\times 3$ for $\le 4$ players, $4\times 4$ for $>4$ players), holographic footprint tracking across Rounds 1 and 2, collision cracks, solo crowns, and survivor bonuses (+1 Puan per round).
   - **Çizgiyi Geçme**: 11 neon lanes ($0..10$ including $100 \to 10$ edge), private racer highlight, collision penalty on duplicate lanes, unique gold (+2) / silver (+1) podium crowns.
   - **Gizli Alışveriş**: Arcade cash register with live 60-credit budget meter, 12 official products (`GIZLI_ALISVERIS_PRODUCTS`), repeatable toggle action sequence, and market settlement breakdown ($Price / Buyers$, +1 Puan for highest basket).
3. **Strict Production Isolation & Dev-Only QA Harness**:
   - The production app entry (`apps/client/src/main.tsx`) and root component (`apps/client/src/App.tsx`) are strictly production-clean with zero QA imports and zero URL query routing (`?qa=`).
   - QA harness was moved to a dev/test-only entry (`apps/client/qa.html` and `apps/client/src/qa/Stage11CAuthoritativeHarness.tsx`) driven by real `createStage7GameAdapter` instances.
   - Regression test in `packages/shared/src/games-stage11c.test.ts` statically verifies that production entry files never import or route QA harnesses.
   - Production Vite bundle builds clean without QA code (only `index.html` compiled into `dist/`).
4. **Watertight Anti-Leak Privacy Gate**: Secret numbers, cells, and shopping baskets are authoritatively omitted from the DOM, ARIA attributes, and CSS class names before result reveal. Spectator mode renders pure read-only monitoring dashboards without player input leaks.
5. **Protocol v3 & Authoritative Contract Fidelity**: Transactional `prepareInput` / `commitPreparedInput`, action-sequence correlation, rejection recovery, and monotonic `stateVersion` are strictly maintained. No shared server or contracts modifications were introduced.
6. **Comprehensive Automated Verification**:
   - All 84 engine unit tests pass (including dedicated 17 Batch C tests with production QA isolation regression test).
   - All 10 server integration tests pass.
   - Production Vite client and server build pass with 0 errors.
   - Realtime WebSocket smoke suite passes against live daemon.
   - Automated CDP headless Chrome QA suite captured and verified 50 screenshots across all 5 games, including negative ACK/retry and all 4 responsive viewports.

---

## 2. Batch C Game Architectures & Signatures

```
apps/client/src/
├── visuals/games/stage11c/
│   ├── stage11c.css                # Scoped neon arcade design tokens, 44px touch targets, animations
│   ├── AcgozlulukLimitiStage.tsx   # Communal cylinder, danger limit, token selector, crash/held reveal
│   ├── OrtalamaninYarisiStage.tsx  # Semi-circular SVG gauge dial, dual needles, average/2 derivation
│   ├── GizliKarelerStage.tsx       # 3x3 / 4x4 pressure grid, holographic footprints, round 1 & 2 history
│   ├── CizgiyiGecmeStage.tsx       # 11 finish lanes, edge 100->10, racer badges, collision penalties
│   ├── GizliAlisverisStage.tsx     # Register bar, 60-coin meter, 12 products, market division formula
│   └── Stage11CStage.tsx           # Master router, ready gate, action fence, reset boundary
├── qa/
│   ├── Stage11CAuthoritativeHarness.tsx  # Test-only adapter-driven harness for automated CDP testing
│   └── qa-stage11c-entry.tsx             # Dev-only mount entry for qa.html
└── qa.html                               # Dev-only HTML shell (excluded from production dist/)
```

### 2.1 Açgözlülük Limiti (`acgozluluk-limiti`)
- **Apparatus**: Communal pressure cylinder with animated fill volume and glowing red threshold line indicating room capacity.
- **Rule Limits**: Dynamic capacity based on player count ($3P=6, 4P=11, 5P=17, 6P=24, 7P=33, 8P=43$) and max choice $0..N$ ($N = \text{player count}$).
- **Interaction**: Stepper buttons (`-` / `+`) and quick-select neon token chips (`0..maxChoice`).
- **Result Reveal**: Communal cylinder shows total tokens vs capacity. If exceeded, displays `KAPASİTE AŞILDI (CRASH!)` and 0 points awarded; if within limit, displays `KAPASİTE AŞILMADI` and awards chosen tokens as points.

### 2.2 Ortalamanın Yarısı (`ortalamanin-yarisi`)
- **Apparatus**: Calibrated semi-circular SVG target gauge dial ($0..100$) with arc tick marks at $0, 25, 50, 75, 100$.
- **Needles**: Cyan needle for player's private guess during play; golden target needle and dashed white average needle on result reveal.
- **Formula & Derivation**: Center digital readout and derivation banner displaying:
  $$\text{Hedef} = \frac{\text{Toplam Ortalama}}{2}$$
- **Scoring Breakdown**: Nearest player receives $+2$ Puan, second nearest receives $+1$ Puan. Players without input receive server-generated values flagged with `[OTOMATİK]`.

### 2.3 Gizli Kareler (`gizli-kareler`)
- **Apparatus**: High-contrast pressure grid with glowing coordinate tags.
- **Grid Scaling**: $3\times 3$ (9 cells) for $\le 4$ players; $4\times 4$ (16 cells) for $>4$ players.
- **Round Mechanics**: 2 rounds of play. Cell selections are tracked with holographic footprint trails.
- **Result Reveal**:
  - Contested cells display collision cracks (`ÇAKIŞMA!`).
  - Uncontested cells display solo gold stars (`SOLO! +1 Puan`).
  - Early finish branches: If all players collide in Round 1, game ends; if exactly 1 player survives Round 1, they receive $+1$ uncontested Round 2 bonus.

### 2.4 Çizgiyi Geçme (`cizgiyi-gecme`)
- **Apparatus**: 11 numbered vertical finish lanes ($0..10$) corresponding to floor buckets ($0-9, 10-19, \dots, 90-99, 100$).
- **Edge Rule**: Value $100$ is mapped to lane $10$ (`val === 100 ? 10 : Math.floor(val / 10)`).
- **Interaction**: Precision range slider with `-10, -1, +1, +10` steppers and active lane indicator (`⚡ SENİN ŞERİDİN`).
- **Result Reveal**: Racers placed in lanes. Duplicate lanes are dimmed with collision badges (`ÇAKIŞMA! 0 Puan`). Unique highest lane wins $+2$ Puan (Gold Crown), unique second highest receives $+1$ Puan (Silver Crown).

### 2.5 Gizli Alışveriş (`gizli-alisveris`)
- **Apparatus**: Arcade cash register bar with live 60-credit budget meter.
- **Products**: 12 product catalog items (`GIZLI_ALISVERIS_PRODUCTS`: Elmas Kolye, VR Kask, Holo Drone, etc.) with prices ranging from 5 to 30 credits.
- **Action Sequence**: Repeatable cart actions (`shopping-toggle`) with real-time budget synchronization and recovery.
- **Market Settlement Reveal**:
  $$\text{Ürün Puanı} = \frac{\text{Fiyat}}{\text{Alıcı Sayısı}}$$
  Displays buyer count for each purchased product, highlights solo buyers (`TEK ALICI!`), computes basket total, and awards $+1$ Puan to the highest basket holder.

---

## 3. Privacy Gate & Redaction Verification

1. **Client DOM & ARIA Tree**:
   - Anonymous cells in `gizli-kareler` contain zero player identifiers or choice metadata during play.
   - Secret numbers in `acgozluluk-limiti`, `ortalamanin-yarisi`, and `cizgiyi-gecme` exist only in local React state and `ownState`—never rendered on behalf of opponents.
   - Opponent cart selections in `gizli-alisveris` remain completely absent from public state until settlement.
2. **Spectator Experience**:
   - Spectators receive dedicated monitoring views displaying active phase information, communal apparatus state, and status badges (`İZLEMEDE - GÖZLEM MODU`).
   - Action buttons, steppers, and interactive controls are completely omitted or disabled.

---

## 4. Viewport & Responsive Validation

All components were tested across four required mobile and landscape viewports:

| Viewport | Scenario | Validation Result |
| :--- | :--- | :--- |
| **390 × 844** | Standard mobile portrait | Zero horizontal overflow. Apparatus, status banner, controls, and HUD fit cleanly. |
| **320 × 700** | Narrow mobile portrait (iPhone SE / compact Android) | Grid cards adapt, typography scales, hit targets remain $\ge 44\text{px}$, zero horizontal overflow. |
| **390 × 520** | Keyboard-safe height / compact layout | Compact rack collapses non-essential margins, submit and controls remain accessible above fold. |
| **844 × 390** | Landscape smoke | Horizontal layout stretches cleanly, apparatus and controls maintain proportions without clipping. |

---

## 5. Automated Browser QA Screenshot Inventory

Captured via Headless Chrome automated CDP suite into `docs/screenshots/stage11c/`:

| File Name | Game | Scene / Description | Viewport | Overflow | Stage |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `acgozluluk-limiti-playing-390x844.png` | Açgözlülük Limiti | Standard portrait, cylinder apparatus, token selector | 390×844 | NONE | OK |
| `acgozluluk-limiti-interaction-390x844.png` | Açgözlülük Limiti | Token choice selected (3 tokens), glowing submit | 390×844 | NONE | OK |
| `acgozluluk-limiti-accepted-390x844.png` | Açgözlülük Limiti | Accepted ACK state, choice locked | 390×844 | NONE | OK |
| `acgozluluk-limiti-rejected-retry-390x844.png` | Açgözlülük Limiti | Negative ACK / Retry state, recovery notification | 390×844 | NONE | OK |
| `acgozluluk-limiti-result-390x844.png` | Açgözlülük Limiti | Result reveal, capacity vs sum, score rail | 390×844 | NONE | OK |
| `acgozluluk-limiti-spectator-390x844.png` | Açgözlülük Limiti | Spectator view, read-only observation HUD | 390×844 | NONE | OK |
| `acgozluluk-limiti-density8-390x844.png` | Açgözlülük Limiti | 8-player density stress test, limit 43 | 390×844 | NONE | OK |
| `acgozluluk-limiti-compact-320x700.png` | Açgözlülük Limiti | Narrow mobile view (320px width), zero overflow | 320×700 | NONE | OK |
| `acgozluluk-limiti-keyboard-390x520.png` | Açgözlülük Limiti | Keyboard-safe height (520px height) | 390×520 | NONE | OK |
| `acgozluluk-limiti-landscape-844x390.png` | Açgözlülük Limiti | Landscape smoke view (844px width) | 844×390 | NONE | OK |
| `ortalamanin-yarisi-playing-390x844.png` | Ortalamanın Yarısı | Standard portrait, calibrated gauge dial, steppers | 390×844 | NONE | OK |
| `ortalamanin-yarisi-interaction-390x844.png` | Ortalamanın Yarısı | Selected guess (36), cyan needle position | 390×844 | NONE | OK |
| `ortalamanin-yarisi-accepted-390x844.png` | Ortalamanın Yarısı | Accepted ACK state, locked needle status | 390×844 | NONE | OK |
| `ortalamanin-yarisi-rejected-retry-390x844.png` | Ortalamanın Yarısı | Negative ACK / Retry state, recovery notification | 390×844 | NONE | OK |
| `ortalamanin-yarisi-result-390x844.png` | Ortalamanın Yarısı | Result reveal, target golden needle, average/2 derivation | 390×844 | NONE | OK |
| `ortalamanin-yarisi-spectator-390x844.png` | Ortalamanın Yarısı | Spectator view, dial monitor mode | 390×844 | NONE | OK |
| `ortalamanin-yarisi-density8-390x844.png` | Ortalamanın Yarısı | 8-player density stress test on dial and score rail | 390×844 | NONE | OK |
| `ortalamanin-yarisi-compact-320x700.png` | Ortalamanın Yarısı | Compact 320x700 portrait | 320×700 | NONE | OK |
| `ortalamanin-yarisi-keyboard-390x520.png` | Ortalamanın Yarısı | Keyboard-safe 390x520 portrait | 390×520 | NONE | OK |
| `ortalamanin-yarisi-landscape-844x390.png` | Ortalamanın Yarısı | Landscape 844x390 smoke | 844×390 | NONE | OK |
| `gizli-kareler-playing-390x844.png` | Gizli Kareler | Pressure grid in Round 1 | 390×844 | NONE | OK |
| `gizli-kareler-interaction-390x844.png` | Gizli Kareler | Cell B2 selected with holographic trail | 390×844 | NONE | OK |
| `gizli-kareler-accepted-390x844.png` | Gizli Kareler | Selection sealed and locked | 390×844 | NONE | OK |
| `gizli-kareler-rejected-retry-390x844.png` | Gizli Kareler | Negative ACK / Retry state, cell re-selectable | 390×844 | NONE | OK |
| `gizli-kareler-result-390x844.png` | Gizli Kareler | Round 2 result reveal, solo survivors and collision cracks | 390×844 | NONE | OK |
| `gizli-kareler-spectator-390x844.png` | Gizli Kareler | Spectator view, masked cells without identity leaks | 390×844 | NONE | OK |
| `gizli-kareler-density8-390x844.png` | Gizli Kareler | 8-player 4x4 pressure grid (16 cells) | 390×844 | NONE | OK |
| `gizli-kareler-compact-320x700.png` | Gizli Kareler | Compact 320x700 portrait | 320×700 | NONE | OK |
| `gizli-kareler-keyboard-390x520.png` | Gizli Kareler | Keyboard-safe 390x520 portrait | 390×520 | NONE | OK |
| `gizli-kareler-landscape-844x390.png` | Gizli Kareler | Landscape 844x390 smoke | 844×390 | NONE | OK |
| `cizgiyi-gecme-playing-390x844.png` | Çizgiyi Geçme | 11 finish lanes, value slider | 390×844 | NONE | OK |
| `cizgiyi-gecme-interaction-390x844.png` | Çizgiyi Geçme | Value 73 selected, lane 7 highlighted | 390×844 | NONE | OK |
| `cizgiyi-gecme-accepted-390x844.png` | Çizgiyi Geçme | Locked racer status banner | 390×844 | NONE | OK |
| `cizgiyi-gecme-rejected-retry-390x844.png` | Çizgiyi Geçme | Negative ACK / Retry state, slider re-enabled | 390×844 | NONE | OK |
| `cizgiyi-gecme-result-390x844.png` | Çizgiyi Geçme | Result reveal, lane positions, duplicate collisions, winner crown | 390×844 | NONE | OK |
| `cizgiyi-gecme-spectator-390x844.png` | Çizgiyi Geçme | Spectator lane observation mode | 390×844 | NONE | OK |
| `cizgiyi-gecme-density8-390x844.png` | Çizgiyi Geçme | 8 racers distributed across lanes | 390×844 | NONE | OK |
| `cizgiyi-gecme-compact-320x700.png` | Çizgiyi Geçme | Compact 320x700 portrait | 320×700 | NONE | OK |
| `cizgiyi-gecme-keyboard-390x520.png` | Çizgiyi Geçme | Keyboard-safe 390x520 portrait | 390×520 | NONE | OK |
| `cizgiyi-gecme-landscape-844x390.png` | Çizgiyi Geçme | Landscape 844x390 smoke | 844×390 | NONE | OK |
| `gizli-alisveris-playing-390x844.png` | Gizli Alışveriş | Register bar, budget meter (60 credits), 12 products | 390×844 | NONE | OK |
| `gizli-alisveris-interaction-390x844.png` | Gizli Alışveriş | 3 items selected, spent 53 / 60 credits | 390×844 | NONE | OK |
| `gizli-alisveris-accepted-390x844.png` | Gizli Alışveriş | Repeatable cart toggle ACK status | 390×844 | NONE | OK |
| `gizli-alisveris-rejected-retry-390x844.png` | Gizli Alışveriş | Negative ACK / Retry state, items toggleable | 390×844 | NONE | OK |
| `gizli-alisveris-result-390x844.png` | Gizli Alışveriş | Market division breakdown (Price / Buyers) and basket scores | 390×844 | NONE | OK |
| `gizli-alisveris-spectator-390x844.png` | Gizli Alışveriş | Spectator market observation mode | 390×844 | NONE | OK |
| `gizli-alisveris-density8-390x844.png` | Gizli Alışveriş | 8 shoppers, product buyer counts and split points | 390×844 | NONE | OK |
| `gizli-alisveris-compact-320x700.png` | Gizli Alışveriş | Compact 320x700 portrait | 320×700 | NONE | OK |
| `gizli-alisveris-keyboard-390x520.png` | Gizli Alışveriş | Keyboard-safe 390x520 portrait | 390×520 | NONE | OK |
| `gizli-alisveris-landscape-844x390.png` | Gizli Alışveriş | Landscape 844x390 smoke | 844×390 | NONE | OK |

---

## 6. Full Verification Gate Results

1. **`npm run typecheck`**:
   - Shared: 0 errors
   - Client: 0 errors
   - Server: 0 errors
   - **Exit Code: 0 (PASS)**
2. **`npm run build`**:
   - Shared: TypeScript compile clean
   - Client: Vite production bundle clean (75 modules, CSS 196 KB, JS 361 KB) — **strictly 0 QA files in production dist**
   - Server: TypeScript compile clean
   - **Exit Code: 0 (PASS)**
3. **`npm test`**:
   - Engine: 84 / 84 unit tests PASS (including 17 Batch C tests with production QA isolation regression test)
   - Server: 10 / 10 integration tests PASS
   - **Exit Code: 0 (PASS)**
4. **`npm run smoke:realtime`**:
   - End-to-end WebSocket match creation, player join, game start, and sync PASS
   - **Exit Code: 0 (PASS)**
5. **`npm run qa:stage11c`**:
   - 50 / 50 screenshots captured via headless Chrome
   - Zero horizontal overflow on any viewport
   - 100% stage rendering pass
   - **Exit Code: 0 (PASS)**

---

## 7. Changed Files Inventory

```
M  apps/client/src/App.tsx
M  apps/client/src/main.tsx
M  apps/client/src/styles.css
A  apps/client/qa.html
A  apps/client/src/qa/Stage11CAuthoritativeHarness.tsx
A  apps/client/src/qa/qa-stage11c-entry.tsx
A  apps/client/src/visuals/games/stage11c/AcgozlulukLimitiStage.tsx
A  apps/client/src/visuals/games/stage11c/CizgiyiGecmeStage.tsx
A  apps/client/src/visuals/games/stage11c/GizliAlisverisStage.tsx
A  apps/client/src/visuals/games/stage11c/GizliKarelerStage.tsx
A  apps/client/src/visuals/games/stage11c/OrtalamaninYarisiStage.tsx
A  apps/client/src/visuals/games/stage11c/Stage11CStage.tsx
A  apps/client/src/visuals/games/stage11c/stage11c.css
M  docs/STAGE_11_8C_NUMERIC_DENSITY_REBUILD.md
M  docs/screenshots/stage11c/README.md
A  docs/screenshots/stage11c/*.png (50 captured frames)
M  package.json
M  packages/shared/src/games-stage11c.test.ts
M  scripts/browser-qa-stage11c.mjs
```

---

## 8. Gate Status & Conclusion

All required Batch C objectives, visual apparatuses, responsive calibrations, contract tests, authoritative rule alignments, and automated browser QA proofs are **100% complete and passing**.

Per project protocol, the current delivery state is:

> **INDEPENDENT REVIEW REQUIRED — NOT YET ACCEPTED**