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
1. **Zero-Scroll Viewport Containment**: Validated at standard mobile (`390×844`), narrow width (`320×700`), virtual keyboard deployment height (`390×520`), and landscape smoke (`844×390`). Automated CDP testing verified zero horizontal overflow (`scrollWidth <= clientWidth`) across all 45 captured runtime frames.
2. **Dedicated 2D Neon Arcade Apparatuses**:
   - **Açgözlülük Limiti**: Communal pressure cylinder with illuminated threshold marker, private token selector (0..N tokens), and over-limit crash vs balance held result reveal.
   - **Ortalamanın Yarısı**: Calibrated semi-circular SVG target gauge dial (0..100) with private cyan needle, gold target needle ($Target = Average / 2$), distance chips, and missing player auto-pick badges.
   - **Gizli Kareler**: Responsive pressure grid ($3\times 3$ for $\le 4$ players, $4\times 4$ for $>4$ players), holographic footprint tracking across Rounds 1 and 2, collision cracks, solo crowns, and survivor bonuses.
   - **Çizgiyi Geçme**: 11 neon lanes ($0..10$ including $100 \to 10$ edge), private racer highlight, collision penalty on duplicate lanes, unique gold/silver podium crowns.
   - **Gizli Alışveriş**: Arcade cash register with live 60-credit budget meter, 12 product cards, repeatable toggle action sequence, and market settlement breakdown ($Price / Buyers$).
3. **Watertight Anti-Leak Privacy Gate**: Secret numbers, cells, and shopping baskets are authoritatively omitted from the DOM, ARIA attributes, and CSS class names before result reveal. Spectator mode renders pure read-only monitoring dashboards without player input leaks.
4. **Protocol v3 & Authoritative Contract Fidelity**: Transactional `prepareInput` / `commitPreparedInput`, action-sequence correlation, rejection recovery, and monotonic `stateVersion` are strictly maintained. No shared server or contracts modifications were introduced.
5. **Comprehensive Automated Verification**:
   - All 83 engine unit tests pass (including dedicated 16 Batch C tests).
   - All 10 server integration tests pass.
   - Production Vite client and server build pass with 0 errors.
   - Realtime WebSocket smoke suite passes against live daemon.
   - Automated CDP headless Chrome QA suite captured and verified 45 screenshots across all 5 games and 4 viewports.

---

## 2. Batch C Game Architectures & Signatures

```
apps/client/src/visuals/games/stage11c/
├── stage11c.css                # Scoped neon arcade design tokens, 44px touch targets, animations
├── AcgozlulukLimitiStage.tsx   # Communal cylinder, danger limit, token selector, crash/held reveal
├── OrtalamaninYarisiStage.tsx  # Semi-circular SVG gauge dial, dual needles, average/2 derivation
├── GizliKarelerStage.tsx       # 3x3 / 4x4 pressure grid, holographic footprints, round 1 & 2 history
├── CizgiyiGecmeStage.tsx       # 11 finish lanes, edge 100->10, racer badges, collision penalties
├── GizliAlisverisStage.tsx     # Register bar, 60-coin meter, 12 products, market division formula
├── Stage11CStage.tsx           # Master router, ready gate, action fence, reset boundary
└── Stage11CQAHarness.tsx       # Deterministic state harness for automated CDP testing
```

### 2.1 Açgözlülük Limiti (`acgozluluk-limiti`)
- **Apparatus**: Communal pressure cylinder with animated fill volume and glowing red threshold line indicating room capacity.
- **Rule Limits**: Dynamic capacity based on player count ($3P=40, 4P=55, 5P=65, 6P=75, 7P=90, 8P=100$) and max choice ($3P=20, 4P=15, 5-8P=15$).
- **Interaction**: Stepper buttons (`-` / `+`) and quick-select neon token chips (`0..maxChoice`).
- **Result Reveal**: Communal cylinder shows total tokens vs capacity. If exceeded, displays `KAPASİTE AŞILDI (CRASH!)` and 0 points awarded; if within limit, displays `KAPASİTE AŞILMADI` and awards chosen tokens as points.

### 2.2 Ortalamanın Yarısı (`ortalamanin-yarisi`)
- **Apparatus**: Calibrated semi-circular SVG target gauge dial ($0..100$) with arc tick marks at $0, 25, 50, 75, 100$.
- **Needles**: Cyan needle for player's private guess during play; golden target needle and dashed white average needle on result reveal.
- **Formula & Derivation**: Center digital readout and derivation banner displaying:
  $$\text{Hedef} = \frac{\text{Toplam Ortalama}}{2}$$
- **Scoring Breakdown**: Nearest player receives $+3$ Puan, second nearest receives $+1$ Puan. Players without input receive server-generated values flagged with `[OTOMATİK]`.

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
- **Result Reveal**: Racers placed in lanes. Duplicate lanes are dimmed with collision badges (`ÇAKIŞMA! 0 Puan`). Unique highest lane wins $+3$ Puan (Gold Crown), unique second highest receives $+1$ Puan (Silver Crown).

### 2.5 Gizli Alışveriş (`gizli-alisveris`)
- **Apparatus**: Arcade cash register bar with live 60-credit budget meter.
- **Products**: 12 product catalog items (Elmas Kolye, VR Kask, Holo Drone, etc.) with prices ranging from 5 to 30 credits.
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

| File Name | Size | Game | Description |
| :--- | :---: | :--- | :--- |
| `acgozluluk-limiti-playing-390x844.png` | 476.4 KB | Açgözlülük Limiti | Standard portrait, cylinder apparatus, token selector, zero overflow |
| `acgozluluk-limiti-interaction-390x844.png` | 472.2 KB | Açgözlülük Limiti | Token choice selected, glowing lock button |
| `acgozluluk-limiti-submitted-390x844.png` | 488.8 KB | Açgözlülük Limiti | Accepted ACK state, secret selection locked |
| `acgozluluk-limiti-result-390x844.png` | 478.0 KB | Açgözlülük Limiti | Result reveal, capacity vs sum, score rail |
| `acgozluluk-limiti-spectator-390x844.png` | 458.5 KB | Açgözlülük Limiti | Spectator view, read-only observation HUD |
| `acgozluluk-limiti-density8-390x844.png` | 499.0 KB | Açgözlülük Limiti | 8-player density stress test, limit 100 |
| `acgozluluk-limiti-compact-320x700.png` | 395.3 KB | Açgözlülük Limiti | Narrow mobile view (320px width), zero overflow |
| `acgozluluk-limiti-keyboard-390x520.png` | 423.9 KB | Açgözlülük Limiti | Keyboard-safe height (520px height) |
| `acgozluluk-limiti-landscape-844x390.png` | 642.6 KB | Açgözlülük Limiti | Landscape smoke view (844px width) |
| `ortalamanin-yarisi-playing-390x844.png` | 460.9 KB | Ortalamanın Yarısı | Standard portrait, calibrated gauge dial, steppers |
| `ortalamanin-yarisi-interaction-390x844.png` | 461.3 KB | Ortalamanın Yarısı | Selected guess (36), cyan needle position |
| `ortalamanin-yarisi-submitted-390x844.png` | 477.4 KB | Ortalamanın Yarısı | Accepted ACK state, locked needle status |
| `ortalamanin-yarisi-result-390x844.png` | 482.6 KB | Ortalamanın Yarısı | Result reveal, target golden needle, average/2 derivation |
| `ortalamanin-yarisi-spectator-390x844.png` | 462.6 KB | Ortalamanın Yarısı | Spectator view, dial monitor mode |
| `ortalamanin-yarisi-density8-390x844.png` | 483.6 KB | Ortalamanın Yarısı | 8-player density stress test on dial and score rail |
| `ortalamanin-yarisi-compact-320x700.png` | 384.2 KB | Ortalamanın Yarısı | Compact 320x700 portrait |
| `ortalamanin-yarisi-keyboard-390x520.png` | 431.0 KB | Ortalamanın Yarısı | Keyboard-safe 390x520 portrait |
| `ortalamanin-yarisi-landscape-844x390.png` | 633.4 KB | Ortalamanın Yarısı | Landscape 844x390 smoke |
| `gizli-kareler-playing-390x844.png` | 511.1 KB | Gizli Kareler | Pressure grid in Round 1 |
| `gizli-kareler-interaction-390x844.png` | 541.5 KB | Gizli Kareler | Cell B2 selected with holographic trail |
| `gizli-kareler-submitted-390x844.png` | 541.7 KB | Gizli Kareler | Selection sealed and locked |
| `gizli-kareler-result-390x844.png` | 662.1 KB | Gizli Kareler | Round 2 result reveal, solo survivors and collision cracks |
| `gizli-kareler-spectator-390x844.png` | 521.7 KB | Gizli Kareler | Spectator view, masked cells without identity leaks |
| `gizli-kareler-density8-390x844.png` | 510.3 KB | Gizli Kareler | 8-player 4x4 pressure grid (16 cells) |
| `gizli-kareler-compact-320x700.png` | 406.2 KB | Gizli Kareler | Compact 320x700 portrait |
| `gizli-kareler-keyboard-390x520.png` | 481.8 KB | Gizli Kareler | Keyboard-safe 390x520 portrait |
| `gizli-kareler-landscape-844x390.png` | 669.4 KB | Gizli Kareler | Landscape 844x390 smoke |
| `cizgiyi-gecme-playing-390x844.png` | 439.6 KB | Çizgiyi Geçme | 11 finish lanes, value slider |
| `cizgiyi-gecme-interaction-390x844.png` | 439.6 KB | Çizgiyi Geçme | Value 73 selected, lane 7 highlighted |
| `cizgiyi-gecme-submitted-390x844.png` | 449.9 KB | Çizgiyi Geçme | Locked racer status banner |
| `cizgiyi-gecme-result-390x844.png` | 483.7 KB | Çizgiyi Geçme | Result reveal, lane positions, duplicate collisions, winner crown |
| `cizgiyi-gecme-spectator-390x844.png` | 447.3 KB | Çizgiyi Geçme | Spectator lane observation mode |
| `cizgiyi-gecme-density8-390x844.png` | 462.7 KB | Çizgiyi Geçme | 8 racers distributed across lanes |
| `cizgiyi-gecme-compact-320x700.png` | 369.4 KB | Çizgiyi Geçme | Compact 320x700 portrait |
| `cizgiyi-gecme-keyboard-390x520.png` | 406.7 KB | Çizgiyi Geçme | Keyboard-safe 390x520 portrait |
| `cizgiyi-gecme-landscape-844x390.png` | 630.8 KB | Çizgiyi Geçme | Landscape 844x390 smoke |
| `gizli-alisveris-playing-390x844.png` | 491.2 KB | Gizli Alışveriş | Register bar, budget meter (60 credits), 12 products |
| `gizli-alisveris-interaction-390x844.png` | 546.2 KB | Gizli Alışveriş | 3 items selected, spent 53 / 60 credits |
| `gizli-alisveris-submitted-390x844.png` | 546.2 KB | Gizli Alışveriş | Repeatable cart toggle ACK status |
| `gizli-alisveris-result-390x844.png` | 523.6 KB | Gizli Alışveriş | Market division breakdown (Price / Buyers) and basket scores |
| `gizli-alisveris-spectator-390x844.png` | 485.4 KB | Gizli Alışveriş | Spectator market observation mode |
| `gizli-alisveris-density8-390x844.png` | 513.9 KB | Gizli Alışveriş | 8 shoppers, product buyer counts and split points |
| `gizli-alisveris-compact-320x700.png` | 408.9 KB | Gizli Alışveriş | Compact 320x700 portrait |
| `gizli-alisveris-keyboard-390x520.png` | 470.8 KB | Gizli Alışveriş | Keyboard-safe 390x520 portrait |
| `gizli-alisveris-landscape-844x390.png` | 653.0 KB | Gizli Alışveriş | Landscape 844x390 smoke |

---

## 6. Full Verification Gate Results

1. **`npm run typecheck`**:
   - Shared: 0 errors
   - Client: 0 errors
   - Server: 0 errors
   - **Exit Code: 0 (PASS)**
2. **`npm run build`**:
   - Shared: TypeScript compile clean
   - Client: Vite production bundle clean (76 modules, CSS 196 KB, JS 373 KB)
   - Server: TypeScript compile clean
   - **Exit Code: 0 (PASS)**
3. **`npm test`**:
   - Engine: 83 / 83 unit tests PASS (including 16 Batch C tests)
   - Server: 10 / 10 integration tests PASS
   - **Exit Code: 0 (PASS)**
4. **`npm run smoke:realtime`**:
   - End-to-end WebSocket match creation, player join, game start, and sync PASS
   - **Exit Code: 0 (PASS)**
5. **`npm run qa:stage11c`**:
   - 45 / 45 screenshots captured via headless Chrome
   - Zero horizontal overflow on any viewport
   - 100% stage rendering pass
   - **Exit Code: 0 (PASS)**

---

## 7. Changed Files Inventory

```
M  apps/client/src/App.tsx
M  apps/client/src/main.tsx
M  apps/client/src/styles.css
A  apps/client/src/visuals/games/stage11c/AcgozlulukLimitiStage.tsx
A  apps/client/src/visuals/games/stage11c/CizgiyiGecmeStage.tsx
A  apps/client/src/visuals/games/stage11c/GizliAlisverisStage.tsx
A  apps/client/src/visuals/games/stage11c/GizliKarelerStage.tsx
A  apps/client/src/visuals/games/stage11c/OrtalamaninYarisiStage.tsx
A  apps/client/src/visuals/games/stage11c/Stage11CQAHarness.tsx
A  apps/client/src/visuals/games/stage11c/Stage11CStage.tsx
A  apps/client/src/visuals/games/stage11c/stage11c.css
A  docs/STAGE_11_8C_NUMERIC_DENSITY_REBUILD.md
A  docs/screenshots/stage11c/README.md
A  docs/screenshots/stage11c/*.png (45 captured frames)
M  package.json
A  packages/shared/src/games-stage11c.test.ts
A  scripts/browser-qa-stage11c.mjs
```

---

## 8. Gate Status & Conclusion

All required Batch C objectives, visual apparatuses, responsive calibrations, contract tests, and automated browser QA proofs are **100% complete and passing**.

Per project protocol, the current delivery state is:

> **INDEPENDENT REVIEW REQUIRED — NOT YET ACCEPTED**