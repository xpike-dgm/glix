# GLIX — Asset Prompt Library: Sprint 01 (Premium 2D Arcade)

**Tarih:** 2026-09-03  
**Sprint:** Asset Exploration Sprint 01  
**Görsel Mimari:** **GLIX = PREMIUM 2D ARCADE** (2D-first, zero 3D runtime overhead, SVG / transparent WebP / CSS layered effects)  
**Kullanım Amacı:** Bu kütüphane, konsept üretiminden üretime (production) geçişte grafik sanatçıları, yapay zeka görsel araçları ve frontend mühendisleri tarafından doğrudan kullanılabilir, test edilmiş, kurala bağlı prompt setidir.

---

## 1. 2D Prompting & Varlık Üretim İlkeleri

1. **2D-First Katmanlama (Layered 2D):** Tüm görsel nesneler düz bir çizgi film gibi değil; derinlik illüzyonunu katmanlar (`layering`), iç gölgeler (`inner-shadow`), kenar pahları (`bevel`), dış ışıma (`rim-light`) ve degrade geçişlerle kazanan 2D oyun sanatı olarak tanımlanır.
2. **Sıfır Yazı Gömme (Zero Baked-in Text):** Hiçbir raster varlığa UI metni, skor, zaman veya düğme yazısı gömülmez. Tüm tipografi HTML/SVG katmanında dinamik olarak render edilir.
3. **Şeffaf Arka Plan Ayrımı (Transparent Alpha Separation):** İnteraktif nesneler (butonlar, kablolar, avatarlar, HUD çerçeveleri) arka planından tamamen bağımsız şeffaf PNG/WebP veya vektörel SVG olarak üretilir.
4. **SaaS ve Çocuksu Çizgi Yasağı:** Dashboard kartları, gri kurumsal arayüzler, sevimli hayvan maskotları veya pastel şekerleme renkleri kesinlikle yasaktır.
5. **Negatif Prompt Standardı (Ortak Negatif Blok):**
   ```text
   3D model, 3D render, photorealistic, complex WebGL scene, low quality, blurry, pixelated, child cartoon, preschool mascot, cute animal, candy UI, pastel colors, SaaS dashboard, enterprise web app, white background, stock photo, watermark, logo signature, baked-in UI text, illegible scribbles, cluttered frame.
   ```

---

## 2. Reusable 2D Asset Promptları

---

### Prompt 01: Home Hero Environment (Katmanlı 2D Dikey Sahne)
- **Amaç:** Ana menü ve lobi için derin, enerjik, stadyum hissi veren 2D dikey arka plan tabanı oluşturmak.
- **Görsel Yön:** Premium 2D Arcade. Derin çivit mavisi/mat grafit zemin, arka planda hafif dikey neon ışık şeritleri (cyan ve magenta), tabanda altıgen zemin mikrodokusu.
- **Kompozisyon:** 9:16 dikey mobil çerçeve. Üst %20 logo için, alt %35 ODA KUR ve KATIL butonları için tamamen temiz ve karanlık. Odak noktası merkezde.
- **Prompt:**
  ```text
  Background art for a mobile party game home screen, vertical 9:16 portrait layout, premium 2D arcade art style. Deep indigo and dark smoked graphite tournament stadium background. Clean vertical cyan and magenta linear neon tube accents fading into soft atmospheric haze in the distance. Subtle reflective dark hexagonal grid on the floor. Upper 20% and lower 35% are clean, dark, and empty for UI overlay. High-contrast, bold digital 2D illustration, rich layered lighting, no 3D models, no characters, no text, no watermark, crisp resolution.
  ```
- **Negatifler:** Ortak negatif blok + `isometric floor clutter, floating buttons, bright center burst`.
- **Çıktı Formatı & Kullanım:** 1080×1920 WebP (tek katman backdrop).
- **Şeffaf Arka Plan:** Hayır (tam ekran zemin).

---

### Prompt 02: Arcade Core (Merkez 2D Reaktör Objesi)
- **Amaç:** Ana ekranda ve lobi ekranında asılı duran, GLIX'in merkez "enerji çekirdeği" simgesi olan etkileşimli 2D nesne.
- **Görsel Yön:** 2D stilize neon reaktör çekirdeği; mat füme titanyum konsol halkaları, içten dışa parlayan elektrik cyan ve fuşya neon halka yolları.
- **Kompozisyon:** 1:1 kare veya dikey merkezli nesne.
- **Prompt:**
  ```text
  Isolated 2D game asset of a stylized kinetic arcade core, centered on pure black background. Dark smoked titanium concentric rings housing glowing vibrant cyan and hot magenta neon energy conduits. Sleek industrial bevels, clean mechanical details, high-contrast rim lighting, bold 2D game art style similar to high-end mobile esports games. Perfectly symmetrical, isolated asset, transparent background ready, no 3D render, no text, no watermarks.
  ```
- **Negatifler:** Ortak negatif blok + `complex machinery clutter, messy wires, round friendly face`.
- **Çıktı Formatı & Kullanım:** 1024×1024 şeffaf WebP / CSS ile hafif süzülme ve nabız animasyonu (`transform: scale(1.02)`).
- **Şeffaf Arka Plan:** **EVET (Alfa kanallı şeffaf zemin zorunlu).**

---

### Prompt 03: Premium GLIX Logo Treatment (Chiseled Chrome Wordmark)
- **Amaç:** GLIX markasının resmi logo kelime işareti (wordmark).
- **Görsel Yön:** Ağır pahlı (beveled) fırçalanmış koyu krom blok harfler; dış pah kenarlarında jilet keskinliğinde elektrik cyan ve hot magenta neon vuruşlar (strokes).
- **Kompozisyon:** 16:9 yatay merkezli, 'GLIX' harfleri sıkı ve sportif aralıklarla.
- **Prompt:**
  ```text
  Title logo wordmark asset for mobile game 'GLIX', centered on black background. Heavy chiseled gunmetal chrome block letters with sharp beveled facets. Razor-sharp electric cyan and hot magenta neon rim lighting tracing the outer contours. Bold, condensed athletic arcade typography, premium automotive badge precision. High-contrast metallic reflections, 2D vector-like sharpness with rich gradient shading, isolated asset, no extra text, no subtitles, no watermark.
  ```
- **Negatifler:** Ortak negatif blok + `bubble letters, rounded corners, rainbow colors, childish cartoon font, messy neon script`.
- **Çıktı Formatı & Kullanım:** Vektörel SVG (üretim hedefi) veya 1024×512 şeffaf WebP.
- **Şeffaf Arka Plan:** **EVET (İzole şeffaf logo).**

---

### Prompt 04: Avatar Concept Sheet (Visor Syndicate - 8 Oyuncu)
- **Amaç:** 8 oyuncu slotu için ayırt edilebilir, genç-yetişkin tonunda 2D avatar seti.
- **Görsel Yön:** 2D stilize streetwear ceketli yarışmacılar; yüz yerine benzersiz parlayan geometrik LED pikselli vizörler. Her birinin kendine ait tek baskın rengi ve vizör ikonu var.
- **Kompozisyon:** 4:3 veya 16:9 ızgara; 8 karakter yan yana veya 4'erli iki sıra halinde.
- **Prompt:**
  ```text
  2D game character concept sheet of 8 distinct player avatars for a mobile party game, arranged in a neat grid on a dark background. Stylish young-adult competitors wearing sleek dark streetwear jackets and hoodies, featuring glowing geometric LED digital visors instead of faces. Each character has a unique signature color and visor glyph (Cyan arrow, Magenta heart, Amber zig-zag, Lime bars, Violet wave, Orange hazard, Emerald diamond, Cobalt cross). Clean 2D cell-shaded art style, bold silhouettes, distinct under-foot neon player rings, high readability at small scale, no cute animal mascots, no text, studio clean asset sheet.
  ```
- **Negatifler:** Ortak negatif blok + `cute chibi animals, teddy bears, pastel clothing, generic faces, hyper-detailed cyberpunk faces`.
- **Çıktı Formatı & Kullanım:** 2048×1024 2D Sprite Atlası / 8 adet 256×256 şeffaf WebP kafa ve gövde katmanı.
- **Şeffaf Arka Plan:** **EVET.**

---

### Prompt 05: Timer HUD (Dairesel 2D Neon Sayaç Çerçevesi)
- **Amaç:** Ortak oyun içi geri sayım süresi göstergesi.
- **Görsel Yön:** Titanyum çerçeveli, çift halkalı 2D neon gösterge; dış halkada azalan parlak fuşya ark, içte mat füme cam taban.
- **Kompozisyon:** 1:1 dairesel izole HUD öğesi.
- **Prompt:**
  ```text
  Isolated 2D mobile game UI asset of a circular countdown timer bezel, centered on pure black background. Sleek dark titanium outer ring with an inner glowing hot magenta neon circular progress meter arc. Smoked glass semi-transparent center dial, precision tick marks along the circumference. Premium arcade telemetry aesthetic, clean vector line work, isolated HUD asset, no numbers, no text, no watermark, transparent ready.
  ```
- **Negatifler:** Ortak negatif blok + `baked-in numbers, digital clock font, complex steampunk gears`.
- **Çıktı Formatı & Kullanım:** SVG dairesel gösterge (`stroke-dashoffset` ile kontrol edilen geri sayım).
- **Şeffaf Arka Plan:** **EVET.**

---

### Prompt 06: Player Strip (8'li Durum Rayı & Pip Bileşeni)
- **Amaç:** Ekranın üst veya alt kenarında diğer oyuncuların ready/submitted/turn durumlarını gösteren kompakt 2D HUD şeridi.
- **Görsel Yön:** İnce füme cam kapsül rayı; içinde 8 adet yuvarlak mini avatar yuvası ve altlarında parlayan küçük LED durum noktaları (yeşil: hazır, yanıp sönen mavi: aktif sıra).
- **Kompozisyon:** İnce uzun yatay ray (aspect ratio 8:1 veya 6:1).
- **Prompt:**
  ```text
  Isolated 2D mobile game HUD component: horizontal 8-player status strip on black background. Sleek smoked acrylic bar with subtle chamfered titanium rim. 8 evenly spaced circular avatar slots with micro glowing LED status pips beneath each slot (some green, some pulsing cyan). Clean flat-design game telemetry, high readability on mobile screens, isolated UI asset, no player names, no text, transparent background.
  ```
- **Negatifler:** Ortak negatif blok + `thick SaaS table, heavy drop-downs, text labels`.
- **Çıktı Formatı & Kullanım:** Responsive CSS Flexbox + SVG slot çerçeveleri.
- **Şeffaf Arka Plan:** **EVET.**

---

### Prompt 07: Hologram Clue Panel (2D Füme Cam İpucu Kartı)
- **Amaç:** `Kontrol Paneli Kaosu`, `Sözlük Blöfü`, `Sızma` gibi gizli bilgi taşıyan oyunlar için oyuncuya özel 2D bilgi kartı çerçevesi.
- **Görsel Yön:** 2D açılı füme cam plaka; köşelerinde neon cyan braketler, hafif tarama çizgisi (scanline) dokusu, üstte küçük ikaz şeridi.
- **Kompozisyon:** 4:3 yatay veya 16:9 kart çerçevesi.
- **Prompt:**
  ```text
  Isolated 2D mobile game UI frame for an in-game holographic clue terminal card on black background. Semi-transparent dark smoked glass rectangle with glowing neon cyan corner brackets and subtle diagonal warning stripes on the top edge. Faint horizontal holographic scanlines on the surface. Clean technical arcade aesthetic, high contrast border, empty interior for dynamic game text, isolated asset, no text, transparent background.
  ```
- **Negatifler:** Ortak negatif blok + `baked-in paragraphs, illegible alien text, heavy solid metal plate`.
- **Çıktı Formatı & Kullanım:** CSS `backdrop-filter: blur(12px)` + SVG köşe braketleri + dinamik HTML metni.
- **Şeffaf Arka Plan:** **EVET.**

---

### Prompt 08: Physical 2D Arcade Push Button (Fiziksel Buton Durumları)
- **Amaç:** Oda kurma, kablo kesme onayı, kelime gönderme eylemlerinde kullanılacak dokunsal 2D arcade butonu.
- **Görsel Yön:** Kalın kauçuk mat yüzey, içten yanan neon çekirdek, 1px parlak üst pah ve koyu alt gölge ile gerçek basılma hissi veren 2D buton.
- **Kompozisyon:** Tek sheet üzerinde 3 durum (Normal, Hover/Active, Pressed).
- **Prompt:**
  ```text
  2D game UI sprite sheet showing 3 states of a chunky tactile arcade push button on black background. State 1: Normal idle state with dark titanium frame and soft internal amber neon glow. State 2: Active glowing state with bright neon aura and raised beveled edge. State 3: Pressed down state showing vertical physical depression and compressed bevel shadow. Clean 2D game UI assets, high-contrast touch button, no text, transparent background ready.
  ```
- **Negatifler:** Ortak negatif blok + `flat corporate material design button, generic web submit button, childish candy button`.
- **Çıktı Formatı & Kullanım:** CSS button token (`transform: translateY(2px)` ve `box-shadow` geçişi).
- **Şeffaf Arka Plan:** **EVET.**

---

### Prompt 09: Wire Console Chassis (Kontrol Paneli Kaosu 2D Şasisi)
- **Amaç:** `Kontrol Paneli Kaosu` için yatay (landscape) tam ekran 2D konsol ana yüzeyi.
- **Görsel Yön:** Ağır mat grafit bomba imha konsolu; ortada 4 dikey kablo yuvası (kılavuz kanalları), kenarlarda sarı-siyah ikaz şeritleri, sol üstte açılı ipucu kartı yuvası, mekanik toggle anahtarlar.
- **Kompozisyon:** 16:9 tam ekran yatay 2D kompozisyon.
- **Prompt:**
  ```text
  2D illustrated game environment screen for a mobile defusal party game, landscape 16:9 view. Heavy matte graphite arcade console surface. Center features 4 wide vertical recessed cable bays with industrial clamp terminals. Upper left has a dedicated angled terminal dock for clue displays. Console edges feature bold yellow and black diagonal hazard warning stripes, chunky mechanical toggle switches, and knurled metal dials. Premium 2D game illustration with rich ambient occlusion and bevel highlights, no 3D mesh, no cables drawn yet (clean empty bays), no text, crisp 8k render.
  ```
- **Negatifler:** Ortak negatif blok + `cables already drawn, flat CAD drawing, photorealistic military photo, childish toy plastic`.
- **Çıktı Formatı & Kullanım:** 1920×1080 2D WebP taban katmanı (~280 KB).
- **Şeffaf Arka Plan:** Hayır (tam konsol zemin yüzeyi).

---

### Prompt 10: Layered Wire Sprites (Kablo Sprite Atlası)
- **Amaç:** `Kontrol Paneli Kaosu` konsolunun üzerine binecek 4 renk kablo ve kesilmiş durumları.
- **Görsel Yön:** Kalın örgülü silikon neon kablolar (Elektrik Mavi, Canlı Kırmızı, Parlak Sarı, Zümrüt Yeşili). Her biri için "Tam Sağlam" ve "Ortadan Kesik + Kıvılcımlı" 2 durum.
- **Kompozisyon:** 4 kablo × 2 durum = 8 sprite içeren dikey/yatay şeffaf atlas.
- **Prompt:**
  ```text
  Isolated 2D game sprite asset sheet of 4 thick braided industrial cables on pure black background. Colors: Electric Blue, Crimson Red, Bright Yellow, Emerald Green. For each color, two variations: 1) Fully intact braided cable with clean metallic end plugs, 2) Cleanly severed cable cut in the middle with tiny glowing neon spark particles at the cut ends. Bold 2D cell-shaded game art style, crisp edges, isolated assets, transparent background ready, no text.
  ```
- **Negatifler:** Ortak negatif blok + `thin wire spaghetti, blurry noise, realistic copper wire photos`.
- **Çıktı Formatı & Kullanım:** 1024×512 şeffaf 2D WebP sprite atlası.
- **Şeffaf Arka Plan:** **EVET.**

---

### Prompt 11: Portrait Social Stage: Word Reactor (Çağrışım Ağı 2D Reaktörü)
- **Amaç:** `Çağrışım Ağı` için dikey portre sahnenin merkezini oluşturan 2D çağrışım çekirdeği.
- **Görsel Yön:** Siyah cam küre; içinde ve etrafında dönen elektrik cyan/mor sinaptik arklar, alt kaidesinde entegre daktilo klavye çerçevesi ve holografik kelime bandı.
- **Kompozisyon:** 9:16 dikey sahne veya 1:1 merkezli izole nesne.
- **Prompt:**
  ```text
  Isolated 2D game asset of a neural word reactor core for a mobile social game, portrait orientation on black background. A dark polished obsidian sphere emitting vibrant cyan and violet synaptic lightning arcs. The base integrates a retro-futuristic arcade console pedestal with circular illuminated typewriter key slots and an empty glowing holographic word display strip. Premium 2D game art style, rich rim lighting and inner glow, isolated asset, transparent background ready, no text, no watermark.
  ```
- **Negatifler:** Ortak negatif blok + `generic HTML form box, flat white input, childish cartoon brain`.
- **Çıktı Formatı & Kullanım:** 512×512 şeffaf 2D WebP + CSS ile SVG nöral çizgi bağlantıları.
- **Şeffaf Arka Plan:** **EVET.**

---

### Prompt 12: 2D Landscape Physical Stage Deck (Ortak Yatay Sahne)
- **Amaç:** Yatay oyunlar (`Rus Ruleti`, `Kör Bomba`, `Kontrol Paneli Kaosu`) için ortak derin stadyum arka planı.
- **Görsel Yön:** Geniş çivit mavisi stadyum asma katı; tavan kirişlerinde zarif fuşya ve cyan LED hatlar, merkezde oyun konsolunun oturacağı karanlık mat zemin.
- **Kompozisyon:** 16:9 yatay stadyum ufku.
- **Prompt:**
  ```text
  Background environment art for a mobile party game screen, landscape 16:9 aspect ratio, premium 2D arcade illustration. Wide dark indigo esports arena mezzanine deck. Clean structural titanium trusses with sleek cyan and magenta edge illumination along the ceiling. Dark, empty, and clean center floor optimized to host heavy game consoles. Atmospheric depth, soft background smoke, no foreground objects, no characters, no text, no watermark, crisp resolution.
  ```
- **Negatifler:** Ortak negatif blok + `distracting crowds, bright sports stadium lights, 3D polygon wireframes`.
- **Çıktı Formatı & Kullanım:** 1920×1080 WebP zemin.
- **Şeffaf Arka Plan:** Hayır.

---

### Prompt 13: 2D Material & Texture Palette Sheet
- **Amaç:** Tüm GLIX 2D varlıklarında tutarlı gölgeleme, pah ve parlama standardı oluşturmak.
- **Görsel Yön:** Mat grafit, füme cam, neon tüp, fırçalanmış titanyum, kauçuk buton dokularını 2D düzlemde tanımlayan örnek referans tablosu.
- **Kompozisyon:** 16:9 ızgara üzerinde 8-10 malzeme paneli.
- **Prompt:**
  ```text
  Clean 2D game art material specification reference sheet on dark background. Organized grid of stylized 2D texture swatches: 1) Dark matte graphite with subtle noise, 2) Smoked glass panel with 1px highlight edge, 3) Electric cyan glowing neon stroke, 4) Tactile illuminated rubber button surface, 5) Brushed titanium metal trim with beveled edge, 6) Braided colorful cable texture, 7) Yellow and black diagonal hazard warning pattern. Premium mobile game design palette, vector precision, clean studio sheet, no text labels.
  ```
- **Negatifler:** Ortak negatif blok + `3D sphere renders, photorealistic macro photography, SaaS color swatches`.
- **Çıktı Formatı & Kullanım:** Tasarım ve CSS değişkenleri için renk/doku referansı.
- **Şeffaf Arka Plan:** Hayır.

---

### Prompt 14: Result Burst & Score Pop (Puan Kazanma 2D FX)
- **Amaç:** Doğru hamle, doğru kablo veya doğru çağrışım eşleşmesinde ekranda parlayan 2D zafer rozeti.
- **Görsel Yön:** Altın ve elektrik cyan renklerinde parlayan "+1 POINT" 2D rozeti; etrafında geometrik ışık patlaması yıldızları.
- **Kompozisyon:** 1:1 merkezli izole efekt.
- **Prompt:**
  ```text
  Isolated 2D mobile game celebratory UI asset on black background. A radiant golden and cyan glowing badge with sharp beveled edges, surrounded by stylized 2D geometric starburst sparks and glowing energy rings. Clean esports celebration graphics, rich outer glow, high contrast, isolated asset, transparent background ready, no text, no watermark.
  ```
- **Negatifler:** Ortak negatif blok + `realistic fire, messy confetti chaos, pixelated retro 8-bit sprites`.
- **Çıktı Formatı & Kullanım:** 512×512 şeffaf WebP / CSS `scale()` ve `fade-out` animasyonu.
- **Şeffaf Arka Plan:** **EVET.**

---

### Prompt 15: Celebration Particles Atlas (2D Parçacık Atlası)
- **Amaç:** Oyun sonu ve zafer ekranlarında CSS/Canvas parçacık motoruyla fırlatılacak 2D mikro parçacıklar.
- **Görsel Yön:** 2D neon elmaslar, neon halkalar, altın kıvılcımlar, cyan yıldızlar.
- **Kompozisyon:** 512×512 şeffaf kare üzerinde izole mikro şekiller.
- **Prompt:**
  ```text
  Sprite atlas sheet of 2D celebration particle shapes on pure black background. Set of crisp glowing neon particle icons: four-pointed stars, sharp diamonds, tiny energy rings, spark bursts, and neon shards. Palette: Golden yellow, electric cyan, and hot magenta. High-contrast emissive glow, clean vector-like edges, isolated elements, transparent background ready, no text.
  ```
- **Negatifler:** Ortak negatif blok + `paper confetti rectangles, dark particles, blurry noise`.
- **Çıktı Formatı & Kullanım:** 512×512 şeffaf 2D WebP atlası (Canvas veya CSS animasyonu için).
- **Şeffaf Arka Plan:** **EVET.**

---
**Hazırlayan:** GLIX Asset Production Lead & Prompt Architect  
**Uyum Standartı:** Premium 2D Arcade Specification Sprint 01
