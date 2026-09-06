# GLIX Stage 11.8D — Social / Creative Immersive Rebuild Report

**Repository**: `xpike-dgm/glix`  
**Base Branch**: `origin/stage-11-7-1-shared-prescale-fixes`  
**Exact Base SHA**: `adbef522c5e18f091994953fdc3bff6a92a4338c`  
**Working Branch**: `stage-11-8d-social-creative`  
**Worktree**: `C:\Users\Xpike\Desktop\glix-stage-11-8d`  
**Status**: **IMPLEMENTED & VERIFIED — INDEPENDENT REVIEW REQUIRED — NOT YET ACCEPTED**

---

## 1. Executive Summary

Stage 11.8D delivers the dedicated immersive **Premium 2D Arcade / Neon Social Arcade** presentation rebuild for all six Batch D games:
1. **Yazı Yaz** (`yazi-yaz`)
2. **Sözlük Blöfü** (`sozluk-blofu`)
3. **Çağrışım Ağı** (`cagrisim-agi`)
4. **Rüşvet ve Darbe** (`rusvet-darbe`)
5. **Karalama Defteri** (`karalama-defteri`)
6. **İttifak** (`ittifak`)

### Core Guarantees Preserved:
- **No Scope Drift**: Zero modifications or visual redesigns applied to KPK, Kendim, Batch A, Batch B, or Batch C.
- **Authoritative Contract Integrity**: Preserved multiplayer, privacy, scoring, reconnect, and Protocol v3 contracts. Server rules remain authoritative (`adapter implementation > executable tests > Protocol v3 contracts > blueprint > project rule docs`).
- **Zero DOM Privacy Leaks**: Secret roles, assigned words, and bluffs are never leaked via DOM attributes (`id`, `className`, `data-*`, `aria-label`).
- **Normalized Drawing Stroke Schema**: Pure 2D HTML5 canvas recording normalized `[0, 1]` coordinates, brush sizes 2–40, stroke point count 2–140, max 100 strokes per submit, 6 discrete neon palette colors. Zero unbounded base64 strings or `dangerouslySetInnerHTML`.
- **Complete Responsive Matrix**: Tested across 390×844 (standard mobile), 320×700 (narrow mobile), 390×520 (keyboard safe), and 844×390 (landscape smoke) with minimum 44×44px interactive hit targets.

---

## 2. Architecture & Visual Components

All Batch D visual stage components are located in `apps/client/src/visuals/games/stage11-8d/`:

### 1. `stage11-8d.css`
- Core stylesheet defining the cyber-noir party game atmosphere:
  - Background: `#050914` / `#0a1024` with glassmorphic cards and subtle radial glows.
  - Accent colors: Neon cyan (`#72f4ff`), hot pink (`#ff55d8`), electric yellow (`#ffc857`), toxic lime (`#a8f46a`), warm amber (`#ff8c42`), and soft violet (`#b57cff`).
  - Strict minimum 44×44px hit targets on interactive controls (`button`, `input`, `.stage11d-*-chip`).
  - Accessible high-contrast focus rings (`2px dashed var(--stage11d-focus)`).
  - Reduced-motion accessibility overrides (`prefers-reduced-motion: reduce`).

### 2. `YaziYazStage.tsx` (`yazi-yaz`)
- **Atmosphere**: Mechanical ink reveal rail and tamper-evident anonymous paper slips.
- **Write Subphase**:
  - Distinguishes secret writer vs innocent roles with bespoke visual cards.
  - Secret writers receive their assigned word with a sealed ink formulation field and character counter (50 chars max).
  - Innocent players receive a participation seal button to confirm readiness.
- **Discussion Subphase**:
  - Inquiry card highlighting remaining discussion time and social deduction tips.
- **Guess Subphase**:
  - Interactive grid of suspect selection chips (filtered to exclude self).
  - Word input field for submitting the suspected word.
- **Results Subphase**:
  - Full reveal card displaying writers, innocent players, guesses, correctness badges, and score rewards (+1 person, +1 word).

### 3. `SozlukBlofuStage.tsx` (`sozluk-blofu`)
- **Atmosphere**: Vintage brass-framed dictionary banner with rotating definition drawer.
- **Write Subphase**:
  - Central display of the obscure Turkish word (`AGORA`, etc.).
  - Bluff drafting textarea with 100-character counter and duplicate prevention.
- **Choose Subphase**:
  - Opaque numbered definition cards (`TANIM #1`, `TANIM #2`...).
  - Authoritative guard: players cannot vote for their own definition (disabled card with indication).
- **Results Subphase**:
  - Truth seal badge revealing authentic dictionary definition.
  - Bluff attributions revealing which bluffs fooled which players, awarding points (+1 for real, +1 per bluff vote).

### 4. `CagrisimAgiStage.tsx` (`cagrisim-agi`)
- **Atmosphere**: Glowing neon synaptic node graph.
- **Answer Subphase**:
  - Pulsing central prompt node (`OKYANUS`, etc.).
  - Free-association input with quick submit button.
- **Results Subphase**:
  - Clustered network cards grouping players who submitted matching associations.
  - Displays cluster scoring (+K points for clusters of size K >= 2, 0 points for solo answers).

### 5. `RusvetDarbeStage.tsx` (`rusvet-darbe`)
- **Atmosphere**: Grand parliamentary rostrum and sealed legislative ballot boxes.
- **Election Subphase**:
  - Sealed ballot voting cards for each candidate (non-self validation).
- **RPS Duel Subphase**:
  - Interactive Rock-Paper-Scissors duel cards (`Taş`, `Kağıt`, `Makas`) triggered during tie-breaker scenarios until a definitive president emerges.
- **Distribution Subphase**:
  - President budget ledger displaying total votes as spendable bribe budget.
  - Interactive numerical steppers (`-` / `+`) allowing allocations of 1 or 2 points per member, enforcing exact budget conservation.
- **Results Subphase**:
  - Payout ledger displaying president bonus (+1) and allocated bribes to members.

### 6. `KaralamaDefteriStage.tsx` (`karalama-defteri`)
- **Atmosphere**: Cyberpunk spiral sketchbook canvas.
- **Draw Subphase**:
  - HTML5 Canvas recording normalized `[0, 1]` coordinates to guarantee distortion-free rendering across any viewport aspect ratio.
  - 6-color discrete neon palette (Cyan, Pink, Yellow, Lime, Orange, Violet).
  - 3 brush size toggles (Thin, Medium, Thick), Undo and Clear actions.
  - Auto-saving debounced stroke synchronization (`drawing-save`).
  - Informed players see secret target word; ignorant player sees related clue.
- **Vote Subphase**:
  - Suspect drawing gallery displaying all player sketches with anonymous labels.
  - Public voting chips targeting suspected outsider.
- **Results Subphase**:
  - Outsider caught vs escaped reveal card with scored point awards (+1 to informed if caught, +1 to outsider if escaped).

### 7. `IttifakStage.tsx` (`ittifak`)
- **Atmosphere**: Diplomatic roundtable alliance chamber.
- **Bargain Subphase**:
  - Live strategic timer and alliance negotiation guidance.
  - Action inputs locked during bargain phase.
- **Vote Subphase**:
  - Wax-sealed handshake vote tiles for choosing a secret alliance partner.
- **Results Subphase**:
  - Directed alliance network reveal showing mutual pacts and point awards (+1 point per received vote).

### 8. `Stage11DStage.tsx` (Master Router)
- Manages sub-phase rendering, preparing phase cards, transition banners, and Protocol v3 action reducer state correlation (`actionState`, `actionKey`).
- Mounted in `apps/client/src/App.tsx` via `isStage11DGameId`.

---

## 3. Automated Test Suite (`games-stage11d.test.ts`)

Created comprehensive test suite in `packages/shared/src/games-stage11d.test.ts` covering all 6 games:
1. **Yazı Yaz**: Game loop, role privacy, duplicate writing defense, target validation, guess scoring, and disconnect handling.
2. **Sözlük Blöfü**: Game loop, secret bluff hiding, own definition voting guard, bluff scoring, and duplicate choice defense.
3. **Çağrışım Ağı**: Prompt display, hidden answers until results, cluster size scoring (K >= 2), and single action submission.
4. **Rüşvet ve Darbe**: Election voting, RPS tie-breaker duel loop, president budget ledger conservation, non-self allocation, 1..2 point bounds, and bribe payouts.
5. **Karalama Defteri**: Stroke coordinates in `[0, 1]`, color palette validation, drawing privacy during draw phase, outsider voting, and caught/escaped scoring.
6. **İttifak**: Bargain phase lock, mutual alliance vote resolution, non-self target validation, and received vote scoring.
7. **Disconnect Policies**: Verified `skip-disconnected` (Yazı Yaz, Rüşvet ve Darbe, Karalama Defteri) and `neutral-missing` (İttifak).
8. **Protocol v3 Action Correlation**: Wire protocol version declaration assertions.
9. **Static DOM Privacy Leak Scan**: Regex scan over all 6 stage files confirming zero leaks of `role`, `assignedWord`, `secretWord`, `isOutsider`, or `bluffText` into DOM attributes (`id`, `className`, `data-*`, `aria-label`).

---

## 4. Verification Results

| Verification Item | Command | Result | Details |
|---|---|---|---|
| **Batch D Tests** | `node --test packages/shared/dist/games-stage11d.test.js` | **PASS (10/10)** | Subphases, privacy, targets, scoring, DOM scan |
| **All Engine Tests** | `npm run test:engine` | **PASS (85/85)** | 75 baseline + 10 Batch D tests |
| **Server Tests** | `npm run test:server` | **PASS (10/10)** | Reconnect integration tests |
| **Total Automated Tests** | `npm test` | **PASS (95/95)** | Zero failures across the repository |
| **TypeScript Typecheck** | `npm run typecheck` | **PASS (0 errors)** | Clean compilation for shared, client, server |
| **Production Build** | `npm run build` | **PASS** | Shared tsc, Client Vite (433 kB), Server tsc |
| **Realtime Smoke** | `npm run smoke:realtime` | **PASS** | Room creation, join, game select, start |
| **Headless Browser QA** | `scripts/capture-stage11d-screenshots.mjs` | **PASS (35/35)** | Full matrix captured in `docs/screenshots/stage11d/` |

---

## 5. Viewport & Browser QA Matrix

All 35 screenshots captured and saved to `docs/screenshots/stage11d/`:
- **390 × 844 px (Standard Phone)**: Primary views for all 6 games, all subphases, spectator mode, and 8-player density.
- **320 × 700 px (Compact Phone)**: Verified no horizontal scrolling, hit targets >= 44px, legible typography.
- **390 × 520 px (Keyboard Safe)**: Verified scroll containment and visible submit buttons when virtual keyboard opens.
- **844 × 390 px (Landscape Smoke)**: Verified centered stage containment with 9:16 aspect ratio preserving gameplay geometry.

---

## 6. Review & Acceptance Note

**STATUS**: `INDEPENDENT REVIEW REQUIRED — NOT YET ACCEPTED`  
All authoritative rules, contracts, and design criteria for Stage 11.8D have been strictly implemented and verified with zero regression to existing systems.
