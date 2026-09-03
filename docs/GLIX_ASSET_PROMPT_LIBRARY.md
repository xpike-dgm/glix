# GLIX — Premium 2D Arcade Asset Prompt Library

**Durum:** Reusable prompt contract / concept-to-production handoff  
**Tarih:** 2026-09-03  
**Ana direction:** C3 Planar Prism Party Core × C1 Premium Arcade Machine  
**Output rule:** Concept/reference asset only. `apps/**`, runtime CSS, server/shared code ve asset binding bu library tarafından yetkilendirilmez.

## 1. Kullanım sözleşmesi

Bu kütüphane GLIX için tekrar kullanılabilir görsel üretim prompt’ları sağlar. Her prompt, Premium 2D Arcade override’ına göre yazılmıştır:

- Core gameplay, HUD, interaction surface, game objects ve characters 2D-first.
- SVG önce; transparent PNG/WebP, layered 2D background ve sprite sheet sonra.
- Canvas yalnızca gerçek bir gameplay yüzeyi için kullanılabilir.
- UI text, logo, timer, score, nickname, clue ve tutorial metni canlı HTML/SVG olmalıdır.
- Prompt ile üretilen raster görsellerde okunabilir text olmamalı; logo/wordmark gerekirse üretim yalnızca görsel referans olur ve final SVG olarak yeniden kurulmalıdır.
- Her asset text-free, reusable, background-separated/alpha-safe, mobile-optimized ve katmanlanabilir olmalıdır.
- Derinlik 2D shadow, inner shadow, bevel, rim light, gradient, sınırlı parallax, scale/sprite/SVG animation ve ölçülü particles ile ima edilir.
- Gerçek zamanlı 3D scene, 3D model, photorealistic render, WebGL pipeline veya dekoratif sahne üretimi yoktur.

### 1.1 Universal negative block

Her prompt’un sonuna bu bloğu ekle:

```text
Avoid: photorealistic 3D, 3D render, 3D model, volumetric scene, realistic camera perspective, ray-traced materials, complex WebGL scene, shader-heavy refraction, fake 3D clutter, glossy product render, generic cyberpunk tech-demo, hacker code, neon city skyline, SaaS dashboard, KPI cards, landing-page layout, generic web forms, enterprise app UI, preschool art, candy UI, pastel toy plastic, chibi baby faces, excessive cute mascots, mascot overload, excessive rainbow, confetti wall, baked-in UI text, fake logos, timer numbers, score counters, player names, clue words, illegible scribbles, watermark, signature, stock-photo look, checkerboard transparency, noisy background, decorative objects covering the gameplay control.
```

### 1.2 Prompt variables

`{surface}` = home / lobby / gameplay / result  
`{orientation}` = portrait 9:16 / landscape 16:9  
`{hero}` = cabinet / prism / cable panel / word core / dial / cup / grid  
`{accentA}` and `{accentB}` = cyan, magenta, violet or amber; max two per hero  
`{state}` = idle / focus / pressed / cut / locked / reveal / success / danger / disconnected

## 2. Shared visual tokens

**Base:** `#070915` night, `#0E1226` surface, `#050816` inset, `#2B3540` graphite edge.  
**Text/highlight:** `#F5F7FF`, `#B8C1D9`.  
**Accent:** `#72F4FF` cyan, `#FF55D8` magenta, `#9A7BFF` violet, `#FFC857` amber.  
**Semantic:** `#A8F46A` success, `#FF6F91` danger.

Shared layer vocabulary:

```text
backdrop → atmosphere → hero base → hero highlight/inner-shadow
→ interaction states → public marker layer → live HTML/SVG text → local FX
```

## 3. Reusable generation prompts

### Prompt 01 — Portrait 2D Arcade Backdrop

- **Use case:** Home/lobby/portrait gameplay background.
- **Asset type:** Layered 2D background, portrait 9:16.
- **Composition:** Upper 20% and lower 30% dark/sparse for live logo and CTA; middle area calm for hero object.
- **Output:** 1080×1920 or 1536×2048 layered WebP/PNG; no alpha needed for base layer.

```text
Premium 2D arcade background art for a mobile party game, portrait 9:16. Dark indigo and smoked graphite wall with sparse structural rails, subtle flat geometric panels, restrained cyan and magenta edge accents, low-contrast atmosphere, clean center stage. Keep the upper 20 percent and lower 30 percent calm, dark, and empty for real HTML/SVG logo and live mobile actions. Use crisp 2D illustration, flat graphic shapes, controlled gradients, contact shadows, subtle inner shadows, very limited parallax strips, and no foreground hero object. The image must feel like the wall of a premium physical arcade, young-adult and social, bold but not childish. No words, no letters, no numbers, no logos; text-free and safe for layered 2D compositing.
```

- **Negative additions:** `bright wallpaper, dense grid, crowds, stage props, large floor reflection` + Universal negative block.
- **Handoff:** Keep backdrop visually quiet; hero object and live text must dominate.

### Prompt 02 — Landscape 2D Arcade Backdrop

- **Use case:** Landscape-only games, especially `Kontrol Paneli Kaosu`.
- **Asset type:** Layered 2D background, landscape 16:9.
- **Composition:** Empty central and lower panel area for a wide interactive hero; quiet top rail for live phase/timer.

```text
Premium 2D arcade gameplay background, landscape 16:9. Dark smoked indigo and graphite structural wall with sparse horizontal rails, small cyan and violet edge lights, low-contrast atmospheric bands, and a wide empty central stage designed to host one illustrated game object. Leave a quiet top edge for live HTML/SVG phase and timer text. Flat front-facing graphic composition, sharp vector-like shape language, subtle contact shadow, limited gradient, restrained glow, young-adult mobile party-game tone. No hero prop, no characters, no text, no logo, no numbers, no perspective-heavy scene; background layer only.
```

- **Negative additions:** `wide empty page layout, empty SaaS panel, stadium audience, bright horizon, diagonal camera tilt` + Universal negative block.
- **Handoff:** Export portrait and landscape families separately; do not stretch one into the other.

### Prompt 03 — GLIX Live Wordmark Reference

- **Use case:** Brand direction reference for a final hand-built SVG wordmark.
- **Asset type:** Logo treatment exploration, transparent-background reference.
- **Composition:** Centered wordmark only; no UI mockup.

```text
Premium arcade wordmark treatment reference for the brand GLIX. Create a bold, compact, angular wordmark with clean custom letter geometry, dark graphite body, a restrained cyan edge on one side and a restrained magenta or violet edge on the other, sharp but friendly corners, and a subtle physical arcade badge feeling. Flat 2D vector-like construction with one bevel highlight and one contact shadow only. Isolated on a plain dark background with generous margin. The final production mark will be rebuilt as live SVG text or SVG paths; do not treat a generated raster as the final logo.
```

- **Negative additions:** `misspelled GLIX, extra words, slogan, illegible type, 3D extrusion, chrome photo, logo on a website header` + Universal negative block.
- **Handoff:** Vector trace/rebuild; never bake into a backdrop or CTA asset.

### Prompt 04 — Planar Prism/Iris Core

- **Use case:** C3 identity anchor for home and selected gameplay screens.
- **Asset type:** Transparent layered SVG/PNG/WebP; base/facet/ring/anchor separated.
- **Composition:** Centered planar emblem, not a volumetric orb.

```text
Isolated premium 2D arcade hero asset: a bold planar prism and iris emblem mounted on a small dark mechanical anchor plate. Build it from flat geometric facets, clean vector-like outlines, concentric ring segments, one white-hot cyan focal line, and a restrained magenta or violet rim. Add crisp cast shadow, inner shadow, beveled edge highlights, and a few controlled 2D energy shards. The object must read as an illustrated SVG-like emblem lying on a game surface, not as glass volume or a realistic object. Symmetrical, high contrast, text-free, transparent-background ready, mobile-readable at 96 pixels.
```

- **Negative additions:** `sphere, globe, floating crystal, volumetric glass, realistic refraction, starfield, dense particles` + Universal negative block.
- **Layer split:** `anchor`, `prism facets`, `iris ring`, `highlight`, `state accent`, `small FX`.

### Prompt 05 — Premium 2D Arcade Cabinet Chassis

- **Use case:** C1/hybrid home anchor and reusable frame.
- **Asset type:** Front-facing transparent/isolated 2D cabinet chassis with empty bays.
- **Composition:** Orthographic graphic silhouette; no embedded screen copy.

```text
Front-facing premium 2D illustrated arcade cabinet chassis for a mobile party game. Dark graphite and anodized titanium shell, compact contemporary silhouette, chamfered control lip, smoked empty screen inset, tactile joystick/button wells, thin cyan and magenta edge strips, and eight small neutral player sockets. Use flat-shaded graphic construction, crisp hard edges, contact shadows, inner shadows, sparse bevel highlights, and a human-scale physical arcade feel. Leave the screen and all label areas blank for live HTML/SVG content. Isolated, text-free, reusable, and designed as separate SVG/transparent PNG/WebP layers.
```

- **Negative additions:** `retro cabinet nostalgia overload, bulky military crate, full scene, characters covering chassis, screen text, brand labels` + Universal negative block.
- **Layer split:** `shell`, `screen/inset`, `control plate`, `buttons`, `socket strip`, `light strips`, `shadow`.

### Prompt 06 — Human-Forward 2D Avatar Atlas

- **Use case:** 8-player home/lobby/result and compact gameplay markers.
- **Asset type:** Transparent 2D sprite atlas, 8 cells or 2048×1024.

```text
2D sprite atlas for eight distinct young-adult arcade competitors, premium mobile party game style. Human-forward adult proportions, varied silhouettes, skin tones, hairstyles or headwear, modern dark streetwear jackets, gloves and expressive but restrained gestures. Each avatar has a small geometric LED visor or accessory glyph and one identity accent color, but no mascot head, animal body, baby face, or costume gimmick. Flat-shaded vector-like illustration, crisp silhouette, dark graphite base, controlled cyan/magenta/violet/amber accents, transparent background. Provide neutral, ready, active, submitted, eliminated, and disconnected pose/state variants without embedding words or player names.
```

- **Negative additions:** `chibi, oversized heads, animal ears, slime, plush, mascot, anime eyes, photorealistic face, rainbow lineup, baked names` + Universal negative block.
- **Handoff:** Full, bust and 32–48 px marker crops; state also needs icon/label so color never carries private information.

### Prompt 07 — Kontrol Paneli Kaosu 2D Chassis

- **Use case:** Private landscape gameplay hero.
- **Asset type:** Illustrated 2D console base with four empty cable lanes.
- **Composition:** One own panel; empty clue rail; touch-safe lane spacing.

```text
Premium 2D mobile arcade game console panel for a private defusal game, landscape 16:9, front-facing and nearly orthographic. Heavy matte graphite chassis with four wide, clearly separated recessed cable lanes, clean clamp terminals, four empty shape-coded control bays, a small blank clue plate dock, sharp hazard accents used sparingly, and crisp 2D bevel/inner-shadow treatment. The panel must be a high-quality illustrated gameplay surface, not a realistic hardware photograph. Leave every clue and label region empty for live HTML/SVG text. No cables drawn yet, no characters, no second panel, no target relationship, no chat, no private information encoded in the art.
```

- **Negative additions:** `cables already drawn, extra panels, multiple screens, military photo, unreadable diagram, large explosion` + Universal negative block.
- **Handoff:** `chassis`, `bay shadows`, `control bays`, `clue dock`, `hazard trim`; cable sprites remain separate.

### Prompt 08 — KPK Cable Sprite Atlas

- **Use case:** `Kontrol Paneli Kaosu` cable states.
- **Asset type:** Transparent sprite atlas, four colors × intact/focus/cut states.

```text
Transparent 2D sprite atlas for a premium mobile defusal arcade game: exactly four thick braided cable sprites, each isolated and front-facing with clean diagonal braid marks, dark connector sleeves, and restrained neon edge light. Use cyan, magenta, lime, and amber as identity colors. For each cable include intact, focused, and cleanly severed two-piece states with a small controlled spark state. Crisp flat-shaded game art, high contrast, uniform scale, transparent background ready, no labels, no numbers, no text, no panel behind the cables.
```

- **Negative additions:** `messy wire bundle, photorealistic cable, cable color gradients that hide shape, huge sparks, blood, weapon imagery` + Universal negative block.
- **Handoff:** The cut state must allow upper/lower pieces to animate apart; shape and position remain stable.

### Prompt 09 — Çağrışım Ağı Node Graph

- **Use case:** Association graph and result reveal.
- **Asset type:** SVG path/icon kit or transparent 2D node sprites; no words.

```text
Reusable 2D SVG-style node graph kit for a premium mobile association party game. Create eight blank beveled node tiles, one central blank word-core frame, and thin smooth connection paths with clear endpoints. Use dark graphite surfaces, cyan focus, magenta social/reveal, violet system lines, and small amber result markers. The geometry must be sparse, touch-readable, and easy to rearrange responsively between radial portrait and compact rail layouts. Flat vector-like 2D construction with small shadows and controlled glow. No letters, no words, no player names, no result text, no dashboard grid; all language will be real HTML/SVG text.
```

- **Negative additions:** `dense spider web, spreadsheet nodes, flowchart software UI, random circuit board, arrows with labels, chat bubbles` + Universal negative block.
- **Handoff:** Node, connector, focus ring and result-link paths should be separate SVG groups.

### Prompt 10 — Çağrışım Ağı Planar Word Core

- **Use case:** Center object for `Çağrışım Ağı`.
- **Asset type:** Transparent SVG/PNG/WebP core + anchor + input rail shell.

```text
Premium 2D illustrated word-core module for a mobile association game. Center a blank planar prism/iris emblem inside a dark graphite frame, with a white-hot cyan edge, restrained magenta/violet rim, small mechanical anchor, and a calm empty lower input rail. Include layered circular line accents and a few geometric particles that imply an animated connection state. The module must be flat, orthographic, text-free, transparent-background ready, and separable into SVG core, ring paths, shadow, and PNG sprite layers. It must support a real live text input placed by HTML/SVG later, not a baked word display.
```

- **Negative additions:** `alphabet keys with letters, word text, glossy 3D orb, floating glass sphere, full keyboard illustration, dense particle cloud` + Universal negative block.
- **Handoff:** Separate idle/focus/locked/result variants; the graph match animation is procedural SVG, not baked.

### Prompt 11 — Common HUD 2D Primitive Sheet

- **Use case:** Timer, phase, public player pips, connection and result chrome.
- **Asset type:** SVG/CSS reference sheet; text samples are placeholders only and not final raster UI.

```text
Clean premium 2D arcade HUD primitive sheet on a dark graphite background. Show isolated vector-style examples of: a circular timer ring with empty center, a compact chamfered phase rail with blank label area, an eight-slot public player pip rail with geometric glyph slots, a small connection badge shell, a result burst frame, a focus ring, a press plate, and a rotate-device indicator shell. Use smoked graphite, titanium edge, cyan focus, magenta reveal, violet system, amber warning, and lime success. High contrast, sparse, mobile-readable at small size, physical arcade telemetry feel without a dashboard. All label spaces must be blank; production text remains live HTML/SVG.
```

- **Negative additions:** `dashboard panels, KPI charts, table rows, fake text, numbers, dense status wall, oversized glassmorphism` + Universal negative block.
- **Handoff:** Rebuild as responsive SVG/CSS; never ship the reference sheet as runtime UI.

### Prompt 12 — Press / Cut / Seal Feedback Atlas

- **Use case:** Local interaction feedback across 24 games.
- **Asset type:** Transparent 2D FX sprite atlas or SVG primitive set.

```text
Transparent 2D mobile arcade feedback atlas with isolated, crisp vector-like effects: a button press ring, short rebound arc, cable cut spark, seal lock flash, card flip glint, node connection stroke, danger pulse, success tick shape, and small result burst. Use white-hot center highlights with controlled cyan, magenta, violet, amber, lime, and danger accents; each effect is compact, readable, and purposeful. Flat graphic shapes, no realistic fire, no screen-wide explosion, transparent background ready, no text or numbers.
```

- **Negative additions:** `full-screen explosion, confetti storm, smoke cloud, realistic fire, damage gore, strobe, blurry particles` + Universal negative block.
- **Handoff:** Each state has a static reduced-motion fallback; CSS/SVG preferred over large atlas.

### Prompt 13 — Portrait Action Plate Set

- **Use case:** `ODA KUR`, `KATIL`, `NASIL OYNANIR` concept treatment.
- **Asset type:** Text-free 2D button/plate shells; labels remain live.

```text
Set of three isolated premium 2D arcade action plate shells for a mobile party game. One filled chamfered primary plate with a calm cyan edge, one distinct secondary plate with magenta or violet outline and offset shadow, and one compact utility tab with a neutral iris accent. Dark graphite and smoked titanium surfaces, tactile rubber inset, one bevel direction, clear pressed and idle state implied by shape only. Leave all face areas blank for live HTML/SVG labels. Portrait-safe proportions, high contrast, touch-target-friendly, playful but not childish, no card grid and no pill button wall.
```

- **Negative additions:** `button text, rounded candy buttons, glossy jelly, browser form controls, submit/reset labels, giant CTA poster` + Universal negative block.
- **Handoff:** Primary/secondary/utility shapes must remain visually distinct even in monochrome.

### Prompt 14 — 2D Material and Shading Reference

- **Use case:** Art direction calibration and CSS/SVG token reference.
- **Asset type:** Material swatch sheet, not a runtime screen.

```text
Premium 2D arcade material reference sheet on dark neutral background. Show isolated flat graphic swatches for matte graphite, smoked indigo inset, anodized titanium edge, tactile rubber button, braided cable, crisp cyan neon line, magenta/violet rim line, amber practical lamp, lime success mark, danger coral mark, contact shadow, inner shadow, and a restrained bevel highlight. Vector-like 2D game-art presentation, clean spacing, limited gradients, no photorealistic macro material render, no labels or text. The purpose is to calibrate layered 2D SVG/PNG/CSS surfaces for a mobile party game.
```

- **Negative additions:** `photorealistic macro, 3D sphere render, chrome car paint, product showroom, color rainbow chart, SaaS design-system page` + Universal negative block.
- **Handoff:** Convert approved swatches into documented color/shadow tokens; do not ship the sheet.

## 4. Prompt QA checklist

Before accepting any generated asset, run this checklist:

- [ ] It reads as Premium 2D Arcade within one second.
- [ ] The primary gameplay object is clear; decoration does not outrank the control.
- [ ] No photorealistic/volumetric/fake-3D construction slipped into the main object.
- [ ] No readable text, logo, timer, score, nickname, clue or rule is baked into raster art.
- [ ] Alpha/background separation is clean where the asset is intended to layer.
- [ ] It is safe at 320×700 portrait or 667×375 landscape as specified.
- [ ] The chosen accent colors do not form a rainbow or encode private state.
- [ ] Human-forward characters stay young-adult and non-mascot-heavy.
- [ ] Interaction states are expressible with shape, icon and live text—not color alone.
- [ ] Asset can be reused across a family without making all 24 games identical.
- [ ] Target format, size, layer split, loading priority and reduced-motion fallback are recorded.
- [ ] Concept output is copied only into `docs/concepts/**` until implementation is separately authorized.

## 5. Recommended first production kit

1. Prompt 03 — live SVG wordmark reference/rebuild.
2. Prompt 01 + 02 — portrait/landscape 2D backdrops.
3. Prompt 04 + 05 — hybrid planar prism and cabinet anchor.
4. Prompt 06 — 8 human-forward 2D avatar atlas.
5. Prompt 07 + 08 — private KPK base and cable state kit.
6. Prompt 09 + 10 — Çağrışım Ağı node/core kit.
7. Prompt 11 + 12 + 13 — common HUD, feedback and live action plate shells.
8. Prompt 14 — material calibration only.

The first implementation proof, if separately authorized, must use one social/text game, one reflex game and one private-state/risk game. It must pass the gates in `docs/GLIX_CREATIVE_DIRECTIONS.md` before any broader 24-game art handoff.
