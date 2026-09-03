# GLIX — Production Asset Export & Pipeline Contract

**Sprint:** Stage 11 — Production Asset Breakdown Sprint  
**Branch:** `stage-11-production-asset-breakdown`  
**Art Direction:** **PREMIUM 2D ARCADE**  
**Engineering Boundary:** Pure specification contract. Paths under `apps/client/public/assets/...` are designated targets for the upcoming asset export sprint. Zero runtime files created in this sprint.  
**Audience:** Technical Artists, 2D Illustrators, Motion Designers, and Frontend Client Architects.

---

## 1. Production Directory & Asset Architecture

All static visual assets for the GLIX React PWA will reside under `apps/client/public/assets/` divided into clear semantic namespaces. Assets are segmented into **Core Eager Assets** (bundled/preloaded on launch) and **Lazy-Loaded Game Packs** (fetched on demand when a mini-game route is loaded).

```
apps/client/public/assets/
├── brand/                                  # Brand identity & wordmarks (Eager)
│   ├── glix-logo-chrome-v1.svg             # Primary chiseled chrome vector logo
│   └── glix-symbol-compact-v1.svg          # Favicon / PWA app icon symbol
│
├── common/                                 # Shared UI components across all games (Eager)
│   ├── hud/
│   │   ├── timer-bezel-v1.svg              # Circular HUD timer vector bezel
│   │   ├── status-pip-emerald-v1.svg       # Player ready status indicator
│   │   ├── status-pip-amber-v1.svg         # Player reconnecting indicator
│   │   └── status-pip-cyan-pulse-v1.svg    # Active turn indicator
│   ├── overlays/
│   │   ├── rotate-phone-icon-v1.svg        # Orientation lock warning illustration
│   │   ├── terminal-glass-frame-v1.svg     # Smoked glass bevel overlay frame
│   │   └── celebration-starburst-v1.webp   # +1 Point score burst asset
│   └── icons/
│       ├── snips-reticle-v1.svg            # KPK wire defusal snips tool
│       └── connection-radar-v1.svg         # WebSocket connection state icon
│
├── avatars/                                # Visor Syndicate 8-Player System (Lazy/Eager Hybrid)
│   ├── hud-pips/                           # 32–48px Pure Vector SVG Visor Icons (Eager)
│   │   ├── p1-cyan-arrow.svg
│   │   ├── p2-magenta-heart.svg
│   │   ├── p3-amber-bolt.svg
│   │   ├── p4-lime-bars.svg
│   │   ├── p5-violet-wave.svg
│   │   ├── p6-orange-hazard.svg
│   │   ├── p7-emerald-gem.svg
│   │   └── p8-cobalt-cross.svg
│   ├── busts/                              # 192×192 WebP Bust Portraits for Choice Grids (Lazy)
│   │   ├── p1-cyan-bust-v1.webp
│   │   ├── p2-magenta-bust-v1.webp
│   │   ├── p3-amber-bust-v1.webp
│   │   ├── p4-lime-bust-v1.webp
│   │   ├── p5-violet-bust-v1.webp
│   │   ├── p6-orange-bust-v1.webp
│   │   ├── p7-emerald-bust-v1.webp
│   │   └── p8-cobalt-bust-v1.webp
│   └── full/                               # 384×512 WebP Full Streetwear Bodies for Podium (Lazy)
│       ├── p1-cyan-full-v1.webp
│       └── ... (p2 through p8)
│
├── stage/                                  # Neutral tournament arena environments (Lazy)
│   ├── portrait-arena-deck-v1.webp         # 9:16 Smoked indigo portrait backdrop
│   └── landscape-arena-deck-v1.webp        # 16:9 Wide gantry stadium backdrop
│
└── games/                                  # Mini-game specific asset packs (Lazy-Loaded per game)
    ├── kontrol-paneli-kaosu/
    │   ├── kpk-console-chassis-v1.webp     # 1920×1080 2D defusal chassis backplate
    │   ├── kpk-wire-blue-v1.webp           # Blue cable (intact & severed states)
    │   ├── kpk-wire-green-v1.webp          # Green cable (intact & severed states)
    │   ├── kpk-wire-red-v1.webp            # Red cable (intact & severed states)
    │   ├── kpk-wire-yellow-v1.webp         # Yellow cable (intact & severed states)
    │   └── kpk-cut-sparks-atlas-v1.webp    # Spark particle burst atlas
    │
    └── cagrisim-agi/
        ├── cagrisim-reactor-core-v1.webp   # 512×512 Obsidian synapse sphere
        └── cagrisim-token-pedestal-v1.svg  # Tactical input dock vector trim
```

---

## 2. Complete Asset Contract Matrix

The following table is the binding specification for every asset generated or exported for GLIX:

| Asset ID | Target File Path | Format | Native Res (px) | Render Res (px) | Max Payload Budget | Alpha | Compression Profile | Consuming Component |
|---|---|:---:|:---:|:---:|:---:|:---:|---|---|
| `BRD-01` | `brand/glix-logo-chrome-v1.svg` | SVG | Vector | Scalable (180–320w) | **< 15 KB** | Yes | SVGO / Scour optimized | `<AppHeader />`, `<LobbyHero />` |
| `BRD-02` | `brand/glix-symbol-compact-v1.svg` | SVG | Vector | Scalable (48×48) | **< 4 KB** | Yes | SVGO optimized | `<Favicon />`, `<PwaSplash />` |
| `HUD-01` | `common/hud/timer-bezel-v1.svg` | SVG | Vector | Scalable (44–64d) | **< 5 KB** | Yes | Inline SVG `<circle>` | `<GameTimer />` |
| `HUD-02` | `common/hud/status-pips.svg` | SVG | Vector | 16×16 | **< 2 KB** | Yes | Multi-path vector symbol | `<PlayerAvatarStrip />` |
| `HUD-03` | `common/overlays/rotate-phone-icon-v1.svg` | SVG | Vector | 64×64 | **< 4 KB** | Yes | 2-frame vector rotation | `<RotateDeviceOverlay />` |
| `FX-01` | `common/overlays/celebration-starburst-v1.webp` | WebP | 512×512 | 160×160 | **< 45 KB** | Yes | Lossy q82 + lossless alpha | `<ScoreDeltaPop />` |
| `AVT-H01..08` | `avatars/hud-pips/p[1-8]-*.svg` | SVG | Vector (48×48) | 32×32 to 48×48 | **< 3 KB each** (< 24 KB total) | Yes | Inline SVG vector paths | `<AvatarPip />`, `<MatchRoster />` |
| `AVT-B01..08` | `avatars/busts/p[1-8]-*-bust-v1.webp` | WebP | 256×256 | 128×128 to 192×192 | **< 28 KB each** (< 224 KB total) | Yes | Lossy q84 + lossless alpha | `<PlayerChoiceGrid />`, `<VotingCard />` |
| `AVT-F01..08` | `avatars/full/p[1-8]-*-full-v1.webp` | WebP | 384×512 | 240×320 | **< 45 KB each** (< 360 KB total) | Yes | Lossy q82 + lossless alpha | `<PodiumMVP />`, `<WinnerModal />` |
| `STG-01` | `stage/portrait-arena-deck-v1.webp` | WebP | 1080×1920 | 100vw × 100dvh | **< 160 KB** | No | Lossy q80 (Opaque backdrop) | `<PortraitStageShell />` |
| `STG-02` | `stage/landscape-arena-deck-v1.webp` | WebP | 1920×1080 | 100vw × 100vh | **< 180 KB** | No | Lossy q80 (Opaque backdrop) | `<LandscapeStageShell />` |
| `KPK-01` | `games/kontrol-paneli-kaosu/kpk-console-chassis-v1.webp` | WebP | 1920×1080 | Contained 16:9 | **< 240 KB** | Yes (Cutout center) | Lossy q82 + lossless alpha | `<KontrolPaneliConsole />` |
| `KPK-02` | `games/kontrol-paneli-kaosu/kpk-wire-blue-v1.webp` | WebP | 160×720 | 68×360 | **< 35 KB** | Yes | Lossy q85 + lossless alpha | `<WireColumn color="mavi" />` |
| `KPK-03` | `games/kontrol-paneli-kaosu/kpk-wire-green-v1.webp` | WebP | 160×720 | 68×360 | **< 35 KB** | Yes | Lossy q85 + lossless alpha | `<WireColumn color="yeşil" />` |
| `KPK-04` | `games/kontrol-paneli-kaosu/kpk-wire-red-v1.webp` | WebP | 160×720 | 68×360 | **< 35 KB** | Yes | Lossy q85 + lossless alpha | `<WireColumn color="kırmızı" />` |
| `KPK-05` | `games/kontrol-paneli-kaosu/kpk-wire-yellow-v1.webp` | WebP | 160×720 | 68×360 | **< 35 KB** | Yes | Lossy q85 + lossless alpha | `<WireColumn color="sarı" />` |
| `KPK-06` | `games/kontrol-paneli-kaosu/kpk-cut-sparks-atlas-v1.webp` | WebP | 512×512 | 120×120 | **< 45 KB** | Yes | Lossy q80 + lossless alpha | `<CutSparkFX />` |
| `CGA-01` | `games/cagrisim-agi/cagrisim-reactor-core-v1.webp` | WebP | 512×512 | 220×220 (84px compact) | **< 75 KB** | Yes | Lossy q85 + lossless alpha | `<WordReactorCore />` |
| `CGA-02` | `games/cagrisim-agi/cagrisim-token-pedestal-v1.svg` | SVG | Vector | Responsive | **< 6 KB** | Yes | SVGO optimized | `<AssociationInputDeck />` |

---

## 3. Performance & Memory Budget Contract

Mobile browsers enforce strict memory ceilings. An uncompressed 2048×2048 32-bit texture consumes $2048 \times 2048 \times 4 = 16.78\text{ MB}$ of mobile GPU VRAM. Loading multiple monolithic images quickly exceeds the 100 MB iOS Safari tab limit, causing silent web process termination (white screen reload).

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                   GLIX MOBILE RUNTIME BUDGET LIMITS                       ║
╠═══════════════════════════════════════╦═══════════════════╦═══════════════╣
║ Scope / Package                       ║ Max File Payload  ║ GPU VRAM Cap  ║
╠═══════════════════════════════════════╬═══════════════════╬═══════════════╣
║ 1. Initial Shell & Critical Core      ║ < 180 KB          ║ < 6 MB        ║
║ 2. Common HUD Framework (SVG + CSS)   ║ < 45 KB           ║ < 2 MB        ║
║ 3. Avatar Identity System (8 players) ║ < 350 KB (total)  ║ < 8 MB        ║
║ 4. Single Large Raster Asset (Max)    ║ < 240 KB          ║ < 8.3 MB      ║
║ 5. Mini-Game Specific Pack (Lazy)     ║ < 420 KB          ║ < 14 MB       ║
║ 6. Total Active Screen Texture Memory ║ —                 ║ < 28 MB MAX   ║
╚═══════════════════════════════════════╩═══════════════════╩═══════════════╝
```

### Texture Memory Calculation Formula:
$$\text{VRAM (Bytes)} = \text{Width} \times \text{Height} \times 4 \times 1.33 \text{ (Mipmaps if enabled)}$$
- 1920×1080 Chassis: $1920 \times 1080 \times 4 = 8.29\text{ MB}$
- 1080×1920 Backdrop: $1080 \times 1920 \times 4 = 8.29\text{ MB}$
- 512×512 Reactor: $512 \times 512 \times 4 = 1.05\text{ MB}$
- 4 Cables (160×720 each): $4 \times (160 \times 720 \times 4) = 1.84\text{ MB}$
- 8 HUD Pips (SVG): $0\text{ MB}$ (Rendered into DOM directly)
- **Peak Scene VRAM for Kontrol Paneli Kaosu:** $8.29 + 8.29 + 1.84 + 1.05 = 19.47\text{ MB}$ (Comfortably within the 28 MB ceiling).

---

## 4. Responsive & Layout Contract

### 4.1 Viewport Breakpoint Standards

```
Mobile Portrait:   360px ≤ Width ≤ 430px   (Target: iPhone SE, 13, 15, Galaxy S23)
Mobile Landscape:  667px ≤ Width ≤ 932px   (Target: 16:9 / 19.5:9 rotated phone)
Tablet / Desktop:  Width > 932px           (Pillar-boxed / Contained arcade cabinet view)
```

### 4.2 Safe Area Insets (`env(safe-area-inset-*)`)
- **Landscape Games (KPK):**
  - Left padding: `padding-left: max(16px, env(safe-area-inset-left))` (protects against phone notch/camera cutout).
  - Right padding: `padding-right: max(16px, env(safe-area-inset-right))` (protects against dynamic island / speaker).
  - Bottom padding: `padding-bottom: max(12px, env(safe-area-inset-bottom))` (protects against home indicator bar).
- **Portrait Games (Çağrışım Ağı):**
  - Top padding: `padding-top: max(12px, env(safe-area-inset-top))` (protects status bar / notch).
  - Bottom padding: `padding-bottom: max(12px, env(safe-area-inset-bottom))`.

### 4.3 Virtual Keyboard & Dynamic Viewport Height (`100dvh`)
```css
/* Standard game stage container */
.glix-stage-container {
  width: 100vw;
  height: 100dvh; /* Adapts dynamically to virtual keyboard */
  position: fixed;
  inset: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Keyboard-open compact trigger */
@media (max-height: 480px) and (orientation: portrait) {
  .cagrisim-reactor-core {
    transform: scale(0.38) translateY(-40px);
    transition: transform 220ms cubic-bezier(0.2, 0.9, 0.3, 1);
  }
  .cagrisim-player-orbit {
    display: none; /* Orbital rings hidden */
  }
  .cagrisim-compact-strip {
    display: flex; /* Collapsed to top mini-rail */
  }
}
```

---

## 5. State & Interaction Matrix Contract

Every interactive element must support the 6-state contract with hardware-accelerated feedback:

```
[NORMAL/IDLE] ──(hover)──> [HOVER] ──(touch-down)──> [PRESSED/ARMED]
      │                                                     │
      ├──(disabled)──> [DISABLED]                           ├──(success)──> [RESOLVED_SUCCESS]
      │                                                     └──(failure)──> [RESOLVED_ERROR]
      └──(focused)────> [KEYBOARD_FOCUSED]
```

### Interaction Specs by Component:

| Component | State | Visual Transformation | Audio / Haptic Hook |
|---|---|---|---|
| **KPK Cable** | Normal | 100% opacity, 1px specular bevel | None |
|  | Hover (Desktop) | `filter: brightness(1.2)` + 1px cyan rim | `sound_hover` (optional) |
|  | Pressed / Armed | `transform: scale(0.98)` + wire glow expansion | `haptic.impact(10ms)` |
|  | Cut (Confirmed) | Wire snaps into 2 parts; sparks emit; 0.7 opacity | `haptic.burst([25, 40, 25])` + `sound_wire_cut` |
|  | Error / Locked | Horizontal shake: `translate3d(±4px, 0, 0)` | `haptic.error(50ms)` + `sound_buzzer` |
| **Tactile Push Button** | Normal | Convex gradient, 2px bottom shadow (`#050810`) | None |
|  | Active / Focus | Cyan neon outer border (`box-shadow: 0 0 12px var(--cyan)`) | None |
|  | Pressed | `transform: translateY(2px)`, inner shadow deepens | `haptic.impact(15ms)` + `sound_click` |
|  | Disabled | Grayscale, 40% opacity, `cursor: not-allowed` | None |
| **Word Input Field** | Normal | Smoked acrylic plate, placeholder in `#7E8B9B` | None |
|  | Focused | 1.5px neon cyan border + typing prompt caret | Virtual keyboard open |
|  | Locked / Sent | Green check badge + field disabled | `haptic.notification('success')` |

---

## 6. Motion & Animation Contract

To ensure 60 FPS performance on mid-tier mobile chipsets (e.g. MediaTek Helio G99, Apple A13 Bionic):
- **Allowed Animated Properties:** Only `transform` and `opacity`.
- **Forbidden Properties in Animations:** `width`, `height`, `top`, `left`, `margin`, `padding`, `filter: blur()`. (These trigger layout recalculations and GPU buffer flushes).

```css
/* Pre-approved GPU keyframes */
@keyframes glix-pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.92; }
  50% { transform: scale(1.03); opacity: 1; }
}

@keyframes glix-wire-sever-top {
  0% { transform: translateY(0); }
  40% { transform: translateY(-16px) rotate(-3deg); }
  100% { transform: translateY(-12px) rotate(-1.5deg); }
}

@keyframes glix-wire-sever-bottom {
  0% { transform: translateY(0); }
  40% { transform: translateY(16px) rotate(3deg); }
  100% { transform: translateY(12px) rotate(1.5deg); }
}

@keyframes glix-shake-error {
  0%, 100% { transform: translate3d(0, 0, 0); }
  20%, 60% { transform: translate3d(-6px, 0, 0); }
  40%, 80% { transform: translate3d(6px, 0, 0); }
}
```

### Reduced-Motion Fallback (`prefers-reduced-motion: reduce`)
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .glix-wire-severed-top,
  .glix-wire-severed-bottom {
    transform: translateY(0) !important;
    opacity: 0.5 !important;
  }
}
```

---

## 7. Accessibility & A11y Standards

1. **Dual-Channel Identification:**
   - Kontrol Paneli Kaosu: No player is forced to know that a wire is `"kırmızı"`. The wire displays a clear embossed label: `"1 · KIRMIZI"` with high-contrast font. The clue text matches: *"1. sırada KIRMIZI varsa…"*.
   - Visor Syndicate: Every avatar displays both a distinct color and an unambiguous geometric visor glyph (`▲`, `♥`, `⚡`, `≡`, `∿`, `⚠`, `◆`, `✚`).
2. **Text Contrast Ratios:**
   - Body & Clue Text: Minimum `7:1` against smoked glass backgrounds (Exceeds WCAG AAA).
   - Dynamic Titles: Minimum `4.5:1` against tournament arena backdrops.
3. **Screen Reader Live Regions (`aria-live`):**
   - Game Timer announcements at 10s and 5s: `<div role="timer" aria-live="assertive" className="sr-only" />`.
   - Clue and turn changes: `<div role="region" aria-live="polite" className="sr-only" />`.

---

## 8. Export Validation Checklist

Before any asset is committed to `apps/client/public/assets/`, it must pass this validation:

- [ ] File format matches matrix (`.svg` or `.webp`).
- [ ] Raster assets are optimized with `cwebp -q 82` or lossless alpha.
- [ ] Native dimensions do not exceed 1920×1080 (landscape) or 1080×1920 (portrait).
- [ ] Alpha channel is clean (no fringe halos or white matte edges).
- [ ] No UI text, scores, timer numbers, or player names are baked into the asset.
- [ ] File payload is within the specified ceiling budget.
- [ ] SVGs are sanitized with SVGO (no inline base64 bitmaps, no `foreignObject`).
- [ ] Touch hitboxes meet the $\ge 48\times 48\text{px}$ standard.
