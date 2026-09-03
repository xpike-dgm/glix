# GLIX — Asset Exploration Sprint 01: Final Shortlist (Official 2D Arcade Direction)

**Tarih:** 2026-09-03  
**Sprint:** Asset Exploration Sprint 01  
**Branch:** `stage-11-asset-exploration-sprint-01`  
**Bağlayıcı Karar (Override):** **GLIX = PREMIUM 2D ARCADE**  
*(3D/WebGL/2.5D zorunluluğu kaldırılmıştır; tüm oynanış, HUD, avatarlar ve ana nesneler yüksek kaliteli 2D katmanlı oyun sanatı olarak tasarlanmıştır).*  
**Rol:** Asset Production Lead + Concept Visualization Orchestrator + Style Consistency Reviewer  
**Kapsam:** Yalnızca konsept havuzu ve 2D asset pipeline hazırlığı. Production runtime koduna (`apps/**`, CSS, WebSocket) dokunulmamıştır.

---

## 1. Yönetici Özeti ve Seçim Tablosu

GLIX için belirlenen yeni ve resmi **Premium 2D Arcade** görsel yönü doğrultusunda 8 batch halinde toplam **34 concept direction** üretilmiş; B1–B5 değerlendirme kurulu (Young-Adult Tone, Mobile Game UX, Visual Consistency, 2D Production Feasibility, Art Direction QA) tarafından 7 eksenli ağırlıklı scorecard ile puanlanmıştır.

Ekranı gören oyuncunun *"Bu bir web sitesi"* değil, *"Bu kaliteli bir mobil party game"* demesini sağlayan; ancak bunu ağır 3D motorlarıyla değil, **katmanlı 2D kompozisyon, keskin rim-light, inner-shadow, SVG animasyonları ve zengin sprite katmanlarıyla** başaran kazananlar belirlenmiştir:

| Batch | Kategori | Kazanan (Winner) | Skor | Yedek (Backup) | Skor | Üretim / Varlık Türü | İlgili Konsept Görseli |
|---|---|---|:---:|---|:---:|---|---|
| **Batch 1** | Home Hero | **H1: Kinetic 2D Arcade Core** | **9.25** | H2: Social Hologrid Deck | 8.50 | Layered 2D WebP + CSS Rotation/Glow | [sprint01-home-kinetic-core.jpg](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/sprint01-home-kinetic-core.jpg) |
| **Batch 2** | Logo Treatment | **L1: Chiseled Chrome & Prismatic Rim** | **9.35** | L2: Stencil Neon Hardware Badge | 8.85 | Vektörel SVG + CSS Drop-Shadow/Filter | [sprint01-logo-chrome-neon.jpg](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/sprint01-logo-chrome-neon.jpg) |
| **Batch 3** | Avatar System | **A1: Visor Syndicate (2D LED Crew)** | **9.40** | A2: Holo-Identity Chips | 8.65 | 2D Flat-Shaded Sprite Sheet (2048px) | [sprint01-avatar-visor-crew.jpg](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/sprint01-avatar-visor-crew.jpg) |
| **Batch 4** | HUD & Overlays | **U1: Tactile Smoked Glass 2D Rail** | **9.15** | U2: Industrial 2D Tally Pip Rail | 8.55 | Responsive SVG Frame + CSS Backdrop Blur | [sprint01-hud-uikit-sheet.jpg](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/sprint01-hud-uikit-sheet.jpg) |
| **Batch 5** | Kontrol Paneli Kaosu | **K1: Heavy 2D Mil-Spec Defusal Console** | **9.45** | K2: Cyber-Arcade 2D Bench | 8.80 | 2D Illustrated Chassis + 4 Layered Wire Sprites | [sprint01-console-defusal-core.jpg](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/sprint01-console-defusal-core.jpg) |
| **Batch 6** | Çağrışım Ağı | **C1: The 2D Synapse Word Reactor** | **9.30** | C2: Holo-Nexus 2D Node Web | 8.70 | 2D SVG Node Graph + Integrated 2D Typewriter Pad | [sprint01-cagrisim-synapse-core.jpg](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/sprint01-cagrisim-synapse-core.jpg) |
| **Batch 7** | Material Library | **M1: 2D Arcade Surface & Shading Standard** | **9.40** | — | — | CSS Custom Properties + Gradient Tokens | [sprint01-materials-concept-sheet.jpg](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/sprint01-materials-concept-sheet.jpg) |
| **Batch 8** | Backdrops | **BP1: Smoked Indigo Arena Deck** (Portrait) & **BL1: Panoramic Gantry Stadium** (Landscape) | **9.10** | BP2: Radial Cyber Lounge | 8.45 | 2-Katmanlı Optimize 2D WebP Backdrop | [sprint01-backdrop-portrait-arena.jpg](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/sprint01-backdrop-portrait-arena.jpg) |

---

## 2. Kazanan ve Yedek Adayların 2D Arcade Analizleri

### 2.1 Batch 1 — Home Hero Environment

#### Kazanan: H1 — Kinetic 2D Arcade Core (Skor: 9.25/10)
- **Görsel Referans:** `docs/concepts/sprint01-home-kinetic-core.jpg`
- **2D Uygulama Mimarisi:**
  - 3 ayrı 2D şeffaf WebP katmanı: (1) Arka halka katmanı, (2) Merkez reaktör gövdesi, (3) Ön parlak ışık halkası.
  - Hafif CSS `transform: rotate()` ve `filter: drop-shadow(0 0 16px var(--neon-cyan))` ile WebGL gerektirmeden 60 FPS canlı salınım.
- **Neden Kazandı?:**
  - **SaaS / Web Sitesi Hissini Yok Ediyor:** Doğrudan modern bir mobil arcade oyununun açılış dünyasını kuruyor.
  - **Ergonomi & Negatif Alan:** Ekranın üst %20'si GLIX logosuna, alt %30'u "ODA KUR" ve "KATIL" fiziksel butonlarına tertemiz boşluk bırakıyor.
  - **Young-Adult Enerjisi:** Çocuksu maskot veya aşırı karmaşık cyberpunk tech-demo değil; net, oturaklı ve heyecan verici.
- **Risk & Çözüm:** Görseldeki merkez detaylar tek parça büyük raster olarak basılmamalı; 3 şeffaf 2D PNG/WebP katmanına bölünerek telefon belleği 2 MB altında tutulmalıdır.

#### Yedek: H2 — Social Hologrid Deck (Skor: 8.50/10)
- **Görsel Referans:** `docs/concepts/sprint01-home-social-hub.jpg`
- **Güçlü Yönü:** 8 oyuncu pilonu ile lobi toplanma hissini mekan olarak yansıtıyor.
- **Yedek Kalma Sebebi:** Küçük mobil ekranlarda zemin ızgarası buton alanının altında kalabalık oluşturuyor; 2D hiyerarşi H1 kadar odaklı değil.

---

### 2.2 Batch 2 — Logo Treatment

#### Kazanan: L1 — Chiseled Chrome & Prismatic Rim (Skor: 9.35/10)
- **Görsel Referans:** `docs/concepts/sprint01-logo-chrome-neon.jpg`
- **2D Uygulama Mimarisi:**
  - Ana gövde: Vektörel SVG path (fırçalanmış koyu metal degrade dolgulu).
  - Rim Light: Keskin elektrik cyan ve magenta dış vuruş (stroke) + CSS neon glow filtresi.
- **Neden Kazandı?:**
  - **Tipografik Okunabilirlik:** En küçük ekranda (320px mobil genişlik) bile "GLIX" sıfır hata ile okunuyor.
  - **Ton:** Candy/balon harf çocuksu çizgisinden tamamen uzak; spor otomobil ve profesyonel oyun turnuvası ağırlığında.
  - **Vektörel Hafiflik:** SVG formatında ~8 KB boyutla sıfır bant genişliği tüketir.
- **Risk & Çözüm:** Gradient renk geçişleri düşük parlaklıklı AMOLED ekranlarda bantlaşma (banding) yapmamalı; SVG lineer gradyanları dikkatle ayarlanmalı.

#### Yedek: L2 — Stencil Neon Hardware Badge (Skor: 8.85/10)
- **Görsel Referans:** `docs/concepts/sprint01-logo-stencil-neon.jpg`
- **Güçlü Yönü:** Fiziksel donanım, cıvatalar ve cam neon tüp detayları fiziksel arcade nostaljisini harika veriyor.
- **Yedek Kalma Sebebi:** Ağır dış plakası dikey alan kaplıyor; bağımsız floating logo olarak L1 kadar esnek değil.

---

### 2.3 Batch 3 — Avatar System Direction

#### Kazanan: A1 — Visor Syndicate (2D LED Crew) (Skor: 9.40/10)
- **Görsel Referans:** `docs/concepts/sprint01-avatar-visor-crew.jpg`
- **2D Uygulama Mimarisi:**
  - 8 oyuncu için tek bir 2048×1024px 2D sprite atlası (veya 8 ayrı 256×256px şeffaf WebP).
  - Vücut: 2D düz gölgeli (flat-shaded) şık streetwear ceket.
  - Kafa: Parlayan geometrik LED vizör.
  - Alt halka: Oyuncu durumunu gösteren 2D parlayan zemin çemberi.
- **Neden Kazandı?:**
  - **8 Oyuncuda Kusursuz Ayırt Edilebilirlik:** Her karakterin hem rengi (Cyan, Magenta, Amber, Lime, Violet, Orange, Emerald, Cobalt) hem de vizöründeki geometrik piksel ikonu benzersiz.
  - **Çocukça Değil:** Hayvan maskotu veya yuvarlak pastel yaratıklar yerine genç-yetişkin "streetwear + arcade" stili.
  - **State Entegrasyonu:**
    - *Aktif Sıra:* Nabız gibi atan parlak vizör + taban halkası.
    - *Elenmiş:* Kararmış, mat gri vizör + çatlak katmanı.
    - *Bağlantı Kopuk:* Kehribar (amber) parazit çizgileri + düşük opaklık.
- **Risk & Çözüm:** HUD'daki 32px'lik mini pip boyutunda vücut gizlenmeli, yalnızca kafa/vizör dairesi görünmelidir.

#### Yedek: A2 — Holo-Identity Chips (Skor: 8.65/10)
- **Görsel Referans:** `docs/concepts/sprint01-avatar-identity-chips.jpg`
- **Güçlü Yönü:** Altıgen çip formu UI içine çok kolay gömülüyor, state durumları net.
- **Yedek Kalma Sebebi:** Karakterlerin kişisel sıcaklığı ve "arkadaş grubu enerjisi" A1'in ceketli vizör ekibine göre daha mekanik kalıyor.

---

### 2.4 Batch 4 — HUD & Common Overlays

#### Kazanan: U1 — Tactile Smoked Glass 2D Rail (Skor: 9.15/10)
- **Görsel Referans:** `docs/concepts/sprint01-hud-uikit-sheet.jpg`
- **2D Uygulama Mimarisi:**
  - %100 responsive SVG ve CSS flex/grid bileşenleri.
  - Yarı saydam füme cam taban (`rgba(13, 17, 23, 0.85)` + `backdrop-filter: blur(12px)`).
  - 2D dairesel SVG neon geri sayım halkası (`stroke-dashoffset` animasyonlu).
  - Altın renkli "+1 POINT" 2D scale/fade pop-up rozeti.
- **Neden Kazandı?:**
  - **Ekranı Boğmuyor:** Ortadaki oyun nesnesine maksimum alan bırakıp telefonun güvenli kenarlarına (safe area) çekiliyor.
  - **SaaS Dashboard Tuzağını Kırıyor:** Tablolar ve metin kutuları yerine otomotiv göstergesi ve arcade telemetry hissi veriyor.
- **Risk & Çözüm:** Arkadaki sahne parlaklaştığında metin kontrastı düşmemeli; füme cam katmanının arkasında hafif bir karanlık vinyet tutulmalı.

#### Yedek: U2 — Industrial 2D Tally Pip Rail (Skor: 8.55/10)
- **Güçlü Yönü:** 7-segment dijital LED sayaçlar nostaljik fiziksel skor hissi veriyor.
- **Yedek Kalma Sebebi:** Sosyal/metin oyunlarında (Çağrışım Ağı vb.) fazla endüstriyel kalıyor.

---

### 2.5 Batch 5 — Kontrol Paneli Kaosu (Flagship 2D Landscape Console)

#### Kazanan: K1 — Heavy 2D Mil-Spec Defusal Console (Skor: 9.45/10)
- **Görsel Referans:** `docs/concepts/sprint01-console-defusal-core.jpg`
- **2D Uygulama Mimarisi:**
  - **Taban:** 1 adet yüksek çözünürlüklü 2D illüstre konsol şasisi (1920×1080 WebP, ~280 KB).
  - **Kablo Katmanı:** 4 ayrı 2D dikey kablo sprite'ı (mavi, kırmızı, sarı, yeşil). Her kablo 2 durum taşır: *sağlam* ve *kesilmiş/kıvılcımlı*.
  - **Etkileşim:** Kabloya dokunulduğunda üzerinde parlayan 2D kesici ikonu belirir; kesme anında CSS shake animasyonu, kıvılcım parçacıkları ve haptic titreşim tetiklenir.
  - **Entegre 2D İpucu Ekranı:** Sol üstte 15 derece açılı 2D füme cam terminal alanı; HTML metin olarak diğer oyuncunun ipucunu gösterir.
- **Neden Kazandı?:**
  - **Sıfır 3D Gereksinimi:** Sahne tek bir 3D mesh olmadan, tamamen 2D katmanlı grafiklerle gerçek bir bomba imha konsolu ağırlığı veriyor.
  - **Mükemmel Dokunma Ergonomisi:** 4 kablo parmak genişliğinde açık dikey raylara oturtulmuş; yanlış dokunma riski sıfır.
  - **Sosyal Oyun Heyecanı:** "Kimin 1. kablosu kırmızı?!" çığlıklarının atıldığı fiziksel parti ortamına doğrudan uyuyor.
- **Risk & Çözüm:** Kablo kesildiğinde iki ucun ayrılması hissi zayıf kalmamalı; kesilme anında SVG tabanlı iki parçalı animasyon ve kısa beyaz parlama eklenmelidir.

#### Yedek: K2 — Cyber-Arcade 2D Bench (Skor: 8.80/10)
- **Görsel Referans:** `docs/concepts/sprint01-console-arcade-bench.jpg`
- **Güçlü Yönü:** Sıvı neon tüpler ve soldaki tel kafes CRT ekran çok stilize bir arcade havasına sahip.
- **Yedek Kalma Sebebi:** Cam tüpleri "kesmek" yerine kırmak gerekiyor gibi hissettiriyor; K1'in örgülü fiziksel kabloları oyun kuralına daha sadık.

---

### 2.6 Batch 6 — Çağrışım Ağı (Flagship 2D Portrait Word Core)

#### Kazanan: C1 — The 2D Synapse Word Reactor (Skor: 9.30/10)
- **Görsel Referans:** `docs/concepts/sprint01-cagrisim-synapse-core.jpg`
- **2D Uygulama Mimarisi:**
  - **Merkez Reaktör:** Şeffaf 2D dairesel küre sprite'ı (512×512 WebP) + CSS nabız parlama efekti.
  - **Nöral Ağ Çizgileri:** 2D SVG dinamik bezier eğrileri (`<path>`); reaktörden 8 oyuncu noduna uzanır.
  - **Oyuncu Nodları:** Çevrede 8 adet küçük 2D dairesel parlayan token.
  - **Entegre 2D Giriş Yüzeyi:** Ekranın alt yarısında konsolla bütünleşik 2D daktilo paneli; mobil klavye açıldığında reaktör yukarı kayar, yazılan harfler reaktörün altındaki holografik 2D bantta parlar.
- **Neden Kazandı?:**
  - **Web Formu Hissini Tamamen Yok Ediyor:** Beyaz bir form kutusu ve "Gönder" butonu yerine, oyuncuyu bir nöral makinenin parçası yapıyor.
  - **Sonuç Animasyonu:** Aynı kelimeyi yazan oyuncuların nodları arasında SVG hatları kalınlaşıp altın renge bürünerek görsel ağ kuruyor.
- **Risk & Çözüm:** Mobil sanal klavye açıldığında reaktör sıkışmamalı; CSS `dvh` tabanlı esnek hiyerarşi kullanılmalı.

#### Yedek: C2 — Holo-Nexus 2D Node Web (Skor: 8.70/10)
- **Görsel Referans:** `docs/concepts/sprint01-cagrisim-holo-nexus.jpg`
- **Güçlü Yönü:** Minimalist ikosahedron ve temiz nod yapısı.
- **Yedek Kalma Sebebi:** C1'in daktilo ve nöral ark dokunsallığına göre daha soyut ve kurumsal kalıyor.

---

### 2.7 Batch 7 — 2D Material & Shading Library

#### Kazanan: M1 — 2D Arcade Surface & Shading Standard (Skor: 9.40/10)
- **Görsel Referans:** `docs/concepts/sprint01-materials-concept-sheet.jpg`
- **Tüm GLIX Oyunlarında Ortak 2D Görsel Kurallar:**
  1. **Dark Graphite (#0D1117 / #161B22):** Düz simsiyah değil; hafif radial degrade ve `%3` noise dokusuyla derinleştirilmiş mat arka plan.
  2. **Smoked Glass (`rgba(22, 27, 34, 0.75)`):** 1px titanyum kenarlık (`rgba(255,255,255,0.12)`) ve `backdrop-filter: blur(12px)`.
  3. **Emissive Neon Core:** Çift katmanlı parıltı; merkezde parlak beyaz/açık renk, dışta 12px ve 24px yayılımlı cyan (#00F5FF) veya magenta (#FF007F) drop-shadow.
  4. **Inner Shadow & Bevel:** 2D nesnelere kütle kazandıran üstten 1px açık renk vurgu (`inset 0 1px 0 rgba(255,255,255,0.2)`) ve alttan 2px koyu gölge (`inset 0 -2px 4px rgba(0,0,0,0.6)`).
  5. **Illuminated Rubber Buttons:** Basıldığında `transform: translateY(2px)` ve artan iç ışıma (`filter: brightness(1.25)`).
  6. **Celebration Sparkles:** SVG parçacık patlamaları ve altın (#FFD700) neon şeritler.
  7. **Danger Hazard Stripes:** Siyah ve neon sarı/kırmızı 45 derecelik CSS çizgili degrade.

---

### 2.8 Batch 8 — Portrait & Landscape 2D Backdrops

#### Kazanan Aile: B1 — Smoked Arena & Gantry Suite (Skor: 9.10/10)
- **Dikey (Portrait) Kazanan:** `BP1: Smoked Indigo Arena Deck` (`docs/concepts/sprint01-backdrop-portrait-arena.jpg`)
  - Derin lacivert/çivit mavisi zemin, arkada sakin dikey neon sütunlar, zeminde altıgen mikrodoku yansıması. Ön plandaki 2D kart ve reaktörleri öne çıkarır.
- **Yatay (Landscape) Kazanan:** `BL1: Panoramic Gantry Stadium`
  - Konsolun arkasında geniş stadyum ufku, tavan kirişlerinde zarif neon hatlar, boş ve ferah ön panel alanı.
- **Neden Kazandı?:**
  - Jenerik neon wallpaper değil; bir yarışma arenasının sakin nefes alan arka planı.
  - Katmanlı 2D mimariye (`backdrop → atmosphere → hero-prop → ui-hud`) kusursuz oturuyor.

---

## 3. Üretime Taşınması Önerilen İlk 2D Varlıklar (Stage 11 Production Handoff)

Aşağıdaki varlıklar, sonraki sprintte runtime koduna ve `apps/client/public/assets/` dizinine taşınmak üzere **2D Asset Pipeline Sözleşmesi** ile onaylanmıştır:

| Sıra | Varlık Adı | Hedef Dosya Yolu | Format / Çözünürlük | Boyut Hedefi | Kullanım Alanı |
|:---:|---|---|---|:---:|---|
| **1** | GLIX Primary Logo | `apps/client/public/assets/brand/glix-logo-chrome-v1.svg` | SVG (Vektör) | < 15 KB | Ana ekran, yükleme ekranı, lobi |
| **2** | Home Hero 2D Core | `apps/client/public/assets/stage/home-kinetic-core-v1.webp` | 2D Şeffaf WebP / 1024×1024 | < 120 KB | Ana ekran ODA KUR/KATIL sahnesi |
| **3** | Visor Syndicate Roster | `apps/client/public/assets/characters/visor-syndicate-roster-v1.webp` | 2D Sprite Atlas / 2048×1024 | < 350 KB | 8 oyuncu avatarı, lobi ve HUD pip'leri |
| **4** | Kontrol Paneli 2D Şasisi | `apps/client/public/assets/games/kpk-console-chassis-v1.webp` | 2D WebP / 1920×1080 | < 280 KB | `kontrol-paneli-kaosu` ana konsol yüzeyi |
| **5** | Kontrol Paneli Kablo Sprite'ları | `apps/client/public/assets/games/kpk-wires-cut-atlas-v1.webp` | 2D Şeffaf WebP / 1024×512 | < 95 KB | 4 renk kablo sağlam/kesik durumları |
| **6** | Çağrışım Ağı 2D Reaktörü | `apps/client/public/assets/games/cagrisim-reactor-core-v1.webp` | 2D Şeffaf WebP / 512×512 | < 75 KB | `cagrisim-agi` merkez çağrışım objesi |
| **7** | Smoked Indigo Arena Zemin | `apps/client/public/assets/stage/backdrop-smoked-arena-v1.webp` | 2D WebP / 1080×1920 (9:16) | < 180 KB | Ortak dikey oyun sahnesi arka planı |
| **8** | Common 2D HUD Primitives | `apps/client/src/visuals/hud/` (CSS/SVG) | Vektörel SVG + CSS Modülleri | < 20 KB | Timer, Round Badge, Pip Rail |

---
**Rapor Hazırlayan:** GLIX Asset Production Lead & Concept Visualization Orchestrator  
**Onaylayan:** Stage 11 Evaluation Board (B1–B5)  
**Resmi Standart:** GLIX = PREMIUM 2D ARCADE
