# GLIX — Production Asset Generation Prompts (Premium 2D Arcade)

**Sprint:** Stage 11 — Production Asset Breakdown Sprint  
**Branch:** `stage-11-production-asset-breakdown`  
**Art Direction:** **PREMIUM 2D ARCADE**  
**Purpose:** Ready-to-execute, deterministic generation prompts for producing final 2D game assets via AI image generation tools (Midjourney v6, DALL-E 3, Stable Diffusion XL) or human illustrators.  
**Execution Guardrail:** Pure specification and prompt library. No runtime files created under `apps/**`.

---

## 1. Master Generation Principles & Universal Negative Block

Every asset generated for GLIX must adhere to the following 5 strict production commandments:

1. **Art Style: Premium 2D Arcade**
   - High-contrast digital 2D game illustration.
   - Clean vector-like linework, bold graphic silhouettes, rich ambient occlusion, and sharp edge bevels.
   - Distinct rim lighting using the official GLIX arcade palette: Electric Cyan (`#00F5FF`), Hot Magenta (`#FF007F`), and Deep Violet (`#9D00FF`), combined with unique player accent hues.
2. **Strictly 2D / Orthographic Frontal View**
   - No extreme isometric camera angles that distort touch hitboxes.
   - No photorealistic shaders, ray-traced reflections, or heavy 3D polygon meshes.
3. **Absolute Zero Baked Text (Text Sovereignty)**
   - No game names, player names, button text ("KES", "GÖNDER"), timer numbers, or simulated alien hieroglyphics baked into sprites.
   - All text must be added dynamically in the browser DOM.
4. **Alpha Transparency & Clean Silhouettes**
   - All isolated game props, cables, characters, and HUD elements must be generated on a pure solid background (e.g. solid black `#000000` or chroma key) for effortless one-click alpha extraction with zero edge halos.
5. **Mobile Readability**
   - Bold, uncluttered primary forms that read effortlessly on a 5.8-inch mobile screen viewed at arm's length.

### The Universal Master Negative Block
Append this block to every generation prompt:
```text
3D render, 3D model, CGI, Unreal Engine, Blender, photorealistic, realistic photo, hyperrealistic skin, complex machinery clutter, messy wires, child cartoon, preschool mascot, cute animal, chibi super-deformed, bubblegum colors, pastel tones, SaaS dashboard, enterprise website, white background, stock photography, watermark, signature, artist logo, baked-in UI text, illegible scribbles, timer numbers, score counters, blurry edges, pixelation, chromatic aberration artifacts.
```

---

## 2. Production Prompts — Kontrol Paneli Kaosu

### Prompt KPK-01: Console Chassis Faceplate (Empty Recessed Bays)
- **Target File:** `apps/client/public/assets/games/kontrol-paneli-kaosu/kpk-console-chassis-v1.webp`
- **Asset Type:** 16:9 Landscape Backplate with transparent cable bays
- **Dimensions:** 1920×1080 px
- **Alpha Channel:** Yes (center cable bays cut out for separate sprite mounting)
- **Prompt:**
  ```text
  2D illustrated game console chassis faceplate for a mobile defusal arcade game, landscape 16:9 aspect ratio, front-facing orthographic view, premium 2D arcade art style. Heavy matte gunmetal graphite defusal console surface. Center features 4 wide, clean vertical recessed cable bays with industrial titanium clamp terminals at the top and bottom of each bay; cable bays are completely empty with dark interior shadows ready to receive separate wire sprites. Upper-left quadrant has an angled mounting dock for a tactical terminal card. Console perimeter features bold 45-degree yellow and black diagonal hazard warning stripes, tactile industrial toggle switches, and knurled titanium hardware screws. High-contrast digital 2D illustration, crisp beveled edges, deep ambient occlusion, clean mechanical arcade aesthetics. Completely isolated asset, pure solid black background around frame, absolutely no cables drawn, no text, no numbers, no logo, no 3D mesh.
  ```
- **Negative Additions:** `cables already drawn, wires, text on screen, digital clock, photorealistic military equipment`.

---

### Prompt KPK-02: 4-Color Braided Defusal Cable Set (Intact Sprites)
- **Target File:** `apps/client/public/assets/games/kontrol-paneli-kaosu/kpk-wires-intact-atlas-v1.webp`
- **Asset Type:** Isolated 2D cable sprite sheet (4 vertical cables)
- **Dimensions:** 1024×720 px (or 4 individual 160×720 px WebP sprites)
- **Alpha Channel:** Yes (Isolated on pure black)
- **Prompt:**
  ```text
  Isolated 2D game asset sprite sheet of 4 thick vertical industrial defusal cables arranged side-by-side on pure black background, front orthographic view, premium 2D arcade art style. Exactly 4 distinct cables: Cable 1 is vibrant Electric Blue (#00A6FF); Cable 2 is sharp Emerald Green (#00E676); Cable 3 is Crimson Red (#FF1744); Cable 4 is Radiant Golden Yellow (#FFD600). Each cable is a thick, braided silicone cable with distinct diagonal ribbing texture, clean metallic end-plugs, and subtle neon edge highlights. Perfectly straight and vertical, uniform width, crisp vector-like contours, bold cell-shaded 2D game art, transparent background ready, absolutely no text, no numbers, no sparks, perfectly intact.
  ```
- **Negative Additions:** `severed wires, sparks, tangled spaghetti, realistic dirty copper, thin telephone wires`.

---

### Prompt KPK-03: 4-Color Severed Defusal Cables (Cut State Sprites)
- **Target File:** `apps/client/public/assets/games/kontrol-paneli-kaosu/kpk-wires-cut-atlas-v1.webp`
- **Asset Type:** Isolated 2D severed cable sprite sheet (4 cut pairs)
- **Dimensions:** 1024×720 px
- **Alpha Channel:** Yes
- **Prompt:**
  ```text
  Isolated 2D game asset sprite sheet of 4 cleanly severed vertical defusal cables on pure black background, front orthographic view, premium 2D arcade art style. Colors matching exactly: Electric Blue, Emerald Green, Crimson Red, and Golden Yellow. Each cable is cleanly cut in the horizontal midpoint with a 24px physical gap between the upper and lower halves. The cut ends show clean insulated core cross-sections with slight angled fraying and subtle glowing thermal singe marks. Bold 2D cell-shaded art style, sharp contours, high contrast, isolated asset sheet, transparent background ready, no text, no background graphics.
  ```
- **Negative Additions:** `massive explosion, intact wires, chaotic debris, photorealistic fire`.

---

### Prompt KPK-04: Cut State Sparks & Short-Circuit FX Sheet
- **Target File:** `apps/client/public/assets/games/kontrol-paneli-kaosu/kpk-cut-sparks-atlas-v1.webp`
- **Asset Type:** 2D Particle sprite atlas
- **Dimensions:** 512×512 px
- **Alpha Channel:** Yes
- **Prompt:**
  ```text
  Isolated 2D game visual effects sprite sheet of electrical cut sparks and plasma bursts on pure black background, premium 2D arcade style. Set of 8 stylized 2D particle elements: sharp angular electrical arcs, glowing cyan and yellow geometric spark stars, tiny neon energy droplets, and expanding shockwave rings. High-contrast emissive lighting, intense white cores fading to vivid electric cyan and neon yellow rim glow. Crisp vector-like particle edges, transparent background ready, studio asset sheet, no text.
  ```
- **Negative Additions:** `realistic smoke clouds, blurry glow mush, dark dirty embers`.

---

## 3. Production Prompts — Visor Syndicate Avatar System

### Prompt AVT-01: Full-Body Streetwear Roster (8 Players — Young-Adult Proportions)
- **Target File:** `apps/client/public/assets/avatars/full/visor-syndicate-full-crew-v1.webp`
- **Asset Type:** 8 Full-body character roster sheet
- **Dimensions:** 2048×1024 px (Grid of 8 characters)
- **Alpha Channel:** Yes
- **Proportion Directive:** Young-adult athletic arcade (Head-to-body ratio 1:3.2. Not chibi. Not preschool).
- **Prompt:**
  ```text
  2D game character concept sheet of 8 distinct player avatars for a competitive mobile arcade party game, arranged in a clean horizontal lineup on a solid black background, premium 2D arcade art style. Athletic young-adult proportions (1:3.2 head-to-body ratio, stylish broad shoulders, articulated streetwear jackets and hoodies, not chibi, not cute animals). Each character wears sleek dark graphite streetwear with illuminated geometric LED visors completely covering their eyes/face:
  1) P1: Hexagonal visor glowing Neon Cyan with an illuminated Arrow chevron glyph (▲).
  2) P2: Oval visor glowing Hot Magenta with an illuminated Digital Heart glyph (♥).
  3) P3: Angular slit visor glowing Electric Amber with an illuminated Lightning Bolt (⚡).
  4) P4: Rectangular visor glowing Radiant Lime with Equalizer Bars glyph (≡).
  5) P5: Curvature visor glowing Deep Violet with a smooth Sine Wave glyph (∿).
  6) P6: Faceted visor glowing Blaze Orange with a Hazard Stripe glyph (⚠).
  7) P7: Octagonal visor glowing Sharp Emerald with a Rhombus Diamond glyph (◆).
  8) P8: Round visor glowing Electric Cobalt with a Target Cross glyph (✚).
  Each character stands on an under-foot glowing neon ring of matching color. Crisp cell-shaded 2D illustration, bold silhouettes, high-contrast rim lighting, studio asset sheet, isolated characters, transparent background ready, absolutely no text, no player names.
  ```
- **Negative Additions:** `chibi, super deformed, oversized heads, animal ears, fuzzy costumes, photorealistic human faces, anime eyes, baked player names`.

---

### Prompt AVT-02: 8 Bust Portraits (Choice Grids & Duels)
- **Target File:** `apps/client/public/assets/avatars/busts/p[1-8]-bust-v1.webp`
- **Asset Type:** 8 Individual 1:1 Square Bust Sprites
- **Dimensions:** 512×512 px each (rendered at 192×192 px)
- **Alpha Channel:** Yes
- **Prompt (P1 Cyan Arrow Example — replicate for P2-P8 with respective color/glyph):**
  ```text
  Isolated 2D game character bust portrait of a young-adult arcade competitor, centered on pure black background, 1:1 square ratio, premium 2D arcade art style. Chest-up view showing high tactical collar of a dark graphite puffer jacket with neon cyan interior piping. Head features a sleek dark helmet with a vibrant glowing Neon Cyan (#00F5FF) hexagonal digital visor. Clear illuminated white-cyan directional arrow chevron glyph (▲) prominently displayed on the visor glass. High-contrast rim lighting, bold cell-shaded 2D game illustration, crisp contours, isolated character bust, transparent background ready, no text, no watermark.
  ```

---

### Prompt AVT-03: 8 Minimalist HUD Visor Icons (32–48px Scale)
- **Target File:** `apps/client/public/assets/avatars/hud-pips/p[1-8]-visor-icon-v1.svg`
- **Asset Type:** Ultra-high contrast vector HUD icon
- **Dimensions:** 64×64 px vector
- **Alpha Channel:** Yes
- **Prompt:**
  ```text
  Minimalist 2D vector game HUD icon of a stylized futuristic helmet visor on solid black background, centered in a 1:1 square frame, premium 2D arcade style. Thick, clean dark titanium helmet rim encircling an emissive neon glowing visor plate with a razor-sharp geometric glyph at the center. Extremely high contrast, bold silhouette optimized for maximum legibility at 32x32 pixels on mobile screens. Flat 2D vector graphic aesthetics, perfectly centered, no complex shading, isolated UI asset, no text.
  ```

---

## 4. Production Prompts — Çağrışım Ağı

### Prompt CGA-01: Central 2D Neural Word Reactor Core
- **Target File:** `apps/client/public/assets/games/cagrisim-agi/cagrisim-reactor-core-v1.webp`
- **Asset Type:** Isolated 2D Reactor Prop
- **Dimensions:** 512×512 px
- **Alpha Channel:** Yes
- **Prompt:**
  ```text
  Isolated 2D game asset of a stylized neural word reactor core, centered on pure black background, front orthographic view, premium 2D arcade art style. A dark polished obsidian sphere encapsulated by concentric brushed titanium magnetic gimbal rings. Inside the dark translucent core, vibrant electric cyan and deep violet synaptic energy arcs pulse with high-contrast inner glow. The lower base features a tactile arcade console pedestal with illuminated circular socket accents and an empty glowing holographic banner mount. Flat 2D game illustration with rich ambient occlusion, sharp specular rim highlights, clean mechanical contours, isolated asset, transparent background ready, absolutely no text, no words on display, no 3D mesh.
  ```
- **Negative Additions:** `rendered keyboard keys, letters, typewriter alphabet, photorealistic glass globe, blurry space nebula`.

---

### Prompt CGA-02: Peripheral Neural Node Tokens
- **Target File:** `apps/client/public/assets/games/cagrisim-agi/cagrisim-node-tokens-v1.svg`
- **Asset Type:** Circular SVG vector player anchor tokens
- **Dimensions:** 128×128 px
- **Alpha Channel:** Yes
- **Prompt:**
  ```text
  Isolated 2D game UI asset of a circular neural synapse node socket on black background, premium 2D arcade telemetry style. Dark smoked glass circular disc with a 2px titanium outer bevel and 4 small glowing neon terminal contact points around the perimeter. High-contrast UI token, clean flat vector design, empty interior ready to host avatar icons, transparent background ready, no text.
  ```

---

## 5. Production Prompts — Stage Backdrops & Common FX

### Prompt STG-01: Neutral Tournament Arena Deck (9:16 Portrait)
- **Target File:** `apps/client/public/assets/stage/portrait-arena-deck-v1.webp`
- **Asset Type:** Fullscreen 9:16 Portrait Backdrop
- **Dimensions:** 1080×1920 px
- **Alpha Channel:** No (Solid opaque background)
- **Prompt:**
  ```text
  Background environment illustration for a competitive mobile party game, vertical 9:16 portrait orientation, premium 2D arcade art style. Atmospheric dark indigo and smoked graphite tournament esports arena. Far background features clean structural gantry trusses with subtle vertical cyan and magenta neon edge illumination fading into soft stadium haze. The floor features a subtle dark hexagonal micro-grid reflection. The upper 25% and lower 35% are clean, dark, and open to ensure high legibility for interactive UI elements. High-contrast digital 2D illustration, rich atmospheric depth, no characters, no foreground clutter, no text, no watermark, crisp resolution.
  ```
- **Negative Additions:** `crowds of spectators, bright floodlights, complex machinery in foreground, bright white spots`.

---

### Prompt STG-02: Panoramic Gantry Stadium Deck (16:9 Landscape)
- **Target File:** `apps/client/public/assets/stage/landscape-arena-deck-v1.webp`
- **Asset Type:** Fullscreen 16:9 Landscape Backdrop
- **Dimensions:** 1920×1080 px
- **Alpha Channel:** No
- **Prompt:**
  ```text
  Background environment illustration for a mobile party game console screen, landscape 16:9 aspect ratio, premium 2D arcade art style. Wide panoramic dark indigo esports mezzanine deck. Sleek structural ceiling trusses traced with delicate hot magenta and electric cyan linear LED conduits. The center stage area is dark, clean, and spacious, specifically designed to support heavy physical 2D game consoles without visual competition. Smooth atmospheric gradient, calm background haze, no foreground objects, no characters, no text, no watermark.
  ```

---

### Prompt FX-01: Celebration Starburst & Score Delta Badge
- **Target File:** `apps/client/public/assets/common/overlays/celebration-starburst-v1.webp`
- **Asset Type:** Isolated Celebration FX
- **Dimensions:** 512×512 px
- **Alpha Channel:** Yes
- **Prompt:**
  ```text
  Isolated 2D game celebration visual effect on pure black background, premium 2D arcade art style. Radiant golden yellow (#FFD700) and electric cyan glowing badge starburst, featuring sharp 8-pointed geometric diamond light rays, concentric neon shockwave rings, and floating micro-sparks. Clean esports celebratory graphics, high-contrast emissive core, sharp vector-like outer contours, isolated asset, transparent background ready, no text, no numbers, no words.
  ```

---

## 6. Post-Processing & Production Export Pipeline

Following raw generation, all assets must pass through the automated production export pipeline before entering `apps/client/public/assets/`:

```bash
# 1. Background Removal & Alpha Trimming (ImageMagick / Sharp script)
magick input-raw.png -fuzz 5% -transparent black -trim +repage trimmed-alpha.png

# 2. Lossy WebP Compression with Lossless Alpha (cwebp)
# Guarantees sharp, halo-free contours while compressing RGB payload by ~75%
cwebp -q 84 -alpha_q 100 -m 6 trimmed-alpha.png -o output-asset-v1.webp

# 3. SVG Optimization (SVGO)
npx svgo --multipass --precision=2 input-icon.svg -o output-icon.svg
```

### Mandatory Quality Gates:
- **No White Halos:** Transparent assets must be checked against both pure black (`#000000`) and mid-gray (`#2A303C`) backgrounds to ensure zero edge matte discoloration.
- **Budget Compliance:** Any raster asset exceeding its assigned budget (e.g. KPK Chassis > 240 KB or Cable > 35 KB) must be re-compressed or have its dimensions downsampled.
- **No Embedded Metadata:** Strip all EXIF, ICC color profiles, and generation prompt strings before committing.
