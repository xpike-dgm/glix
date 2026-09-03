# GLIX — Home & Logo Refinement: Final Shortlist (Official Direction)

**Tarih:** 2026-09-03  
**Sprint:** Home + Logo Refinement Sprint  
**Branch:** `stage-11-home-logo-refinement`  
**Base Branch:** `stage-11-asset-exploration-sprint-01`  
**Resmi Tasarım Standardı:** **GLIX = PREMIUM 2D ARCADE**  
*(Çocuksu şekerleme yok, kurumsal SaaS yok, espor/askeri tech-demo yok, kumar yok; genç-yetişkin, yüksek enerjili, sosyal parti oyunu).*  
**Rol:** GLIX Senior Art Director + 2D Mobile Game Brand Designer + Visual QA Lead  
**Kapsam:** Yalnızca konsept ve shortlist belirleme. Runtime koduna dokunulmamıştır.

---

## 1. Nihai Kısa Liste ve Seçim Tablosu (Final Shortlist Table)

Sprint 01 sonrasında yapılan detaylı çoklu ajan sanatsal denetimi (A1–A5) ve 7 ağırlıklı metrik scorecard değerlendirmesi sonucunda, eski H1 ve L1 yönleri incelenmiş; aşağıdaki nihai kazanan ve yedekler belirlenmiştir:

| Kategori | Rol | Seçilen Yön (Concept) | Skor | Üretim Türü | Referans Konsept Görseli |
|---|---|---|:---:|---|---|
| **Home Hero** | **KAZANAN (Winner)** | **H-REF-01: Social Pylon Token Arena** | **9.68** | Katmanlı 2D WebP/SVG + CSS Keyframe Nabız | [refine-home-01-social-pylon-arena.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-home-01-social-pylon-arena.png) |
| **Home Hero** | **YEDEK (Backup)** | **H-REF-02: Kinetic Arcade Core (Refined)** | **9.37** | 2 Katmanlı WebP + 1 SVG Yörünge Yolu | [refine-home-02-kinetic-arcade-core.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-home-02-kinetic-arcade-core.png) |
| **Logo** | **KAZANAN (Winner)** | **L-REF-05: Dynamic Symmetrical Arcade** | **9.68** | Vektörel SVG Path + CSS Prismatic Rim Glow | [refine-logo-05-dynamic-symmetrical.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-logo-05-dynamic-symmetrical.png) |
| **Logo** | **YEDEK (Backup)** | **L-REF-01: Prismatic Arcade Block** | **9.46** | Çokgen Pahlı SVG + Obsidyen Dolgu | [refine-logo-01-prismatic-block.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-logo-01-prismatic-block.png) |
| **Canlı Vitrin** | **Kazanan Mockup** | **L-REF-05 + H-REF-01 + CTA Butonları** | **—** | 9:16 Portre Mobil Tam Ekran Önizlemesi | [refine-home-mockup-winner.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-home-mockup-winner.png) |
| **Canlı Vitrin** | **Yedek Mockup** | **L-REF-01 + H-REF-02 + CTA Butonları** | **—** | 9:16 Portre Mobil Tam Ekran Önizlemesi | [refine-home-mockup-backup.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-home-mockup-backup.png) |

---

## 2. Ayrıntılı Kazanan ve Yedek Analizleri

### 2.1 Home Hero — Kazanan: H-REF-01 (Social Pylon Token Arena)
* **Görsel Dosyası:** `docs/concepts/refine-home-01-social-pylon-arena.png`
* **Birleşik Ekran Mockup'ı:** `docs/concepts/refine-home-mockup-winner.png`
* **Neden Kazandı?**
  1. **Anında Sosyal Sinyal:** Merkezdeki fırçalanmış obsidyen jetonun etrafına dizilmiş **8 renkli oyuncu bağlantı soketi** (Cyan, Magenta, Amber, Lime, Violet, Orange, Emerald, Cobalt), kullanıcıya ilk saniyede *"Bu oyun arkadaşlarla yan yana oynanır"* mesajını iletir.
  2. **Dokunsal Arcade Varlığı:** Bilimkurgu reaktörü yerine, elle dokunulabilir bir fiziksel oyun masası / arcade jetonu hissi verir.
  3. **Kusursuz Mobil Alan Bütçesi:** 1:1 kare dairesel alan (280×280px) ekranın orta %48'ine kilitlenir. Alt %30'daki "ODA KUR" ve "KATIL" butonlarının üzerine taşmaz; 320×700 küçük ekranlarda dahi scroll gerektirmez.
* **2D Üretim Katman Mimarisi:**
  - `Layer-1 (Backdrop):` Optimize koyu indigo (`#070915`) zemin ve 40px mikroskobik parlak ızgara (`< 30 KB`).
  - `Layer-2 (Gear Ticks):` Dış çevredeki mekanik çark çentikleri ve radyal pilon hatları (statik SVG veya çok yavaş CSS dönüşü).
  - `Layer-3 (Pylon Array):` 8 adet 2D soket ikonu; lobide oyuncular bağlandıkça CSS `opacity` ve `filter: drop-shadow` ile parlar.
  - `Layer-4 (Master Token):` Çift kademeli obsidyen disk, Cyan/Magenta rim fitili ve merkezde kabartmalı `✦` glifi.
* **Toplam Asset Yükü:** SVG + WebP toplam `< 85 KB`.

---

### 2.2 Home Hero — Yedek: H-REF-02 (Kinetic 2D Arcade Core — Refined)
* **Görsel Dosyası:** `docs/concepts/refine-home-02-kinetic-arcade-core.png`
* **Birleşik Ekran Mockup'ı:** `docs/concepts/refine-home-mockup-backup.png`
* **Neden Yedek Seçildi?**
  - Sprint 01 H1'in soğuk bilimkurgu reaktör detayları ayıklanmış, yörüngelere 8 renkli oyuncu uydu çipi eklenmiştir.
  - Ancak H-REF-01'in sağladığı "ortak masa etrafında toplanmış arkadaşlar" metaforu kadar samimi ve güçlü bir parti oyunu dili kuramamış, hafifçe mekanik kalmıştır.
  - H-REF-01'in herhangi bir aşamada revize edilmesi gerekirse doğrudan devreye alınabilecek sağlam bir yedektir.

---

### 2.3 Logo — Kazanan: L-REF-05 (Dynamic Symmetrical Arcade Wordmark)
* **Görsel Dosyası:** `docs/concepts/refine-logo-05-dynamic-symmetrical.png`
* **Neden Kazandı?**
  1. **Play-Token 'X' & Sosyal Kesişim:** Sondaki X harfi, espor kılıcı veya tehlike çarpısı olmaktan çıkarılmış; uçları pahlanmış iki kalın kaset bandının dostça kesiştiği ve merkezinde **Ultraviyole Füzyon Göbeği** (`#A855F7`) barındıran bir parti sembolüne dönüştürülmüştür.
  2. **Optik Ağırlık Dengesi:** Sol baştaki G harfinin kavisli kütlesi ile sağ baştaki X harfinin enerjik kanatları mükemmel bir görsel terazi kurar.
  3. **Her Ölçekte Kusursuz İkon:** X harfi ve ortasındaki füzyon diski; 512px PWA mağaza ikonundan 16px tarayıcı favicon'una kadar merkez detayı ezilmeden okunur.
  4. **1-Bit Stensil Uyumlu:** Tek renkli baskı ve B&W bildirimlerde harf kütleleri bozulmaz.
* **Teknik SVG ve CSS Spesifikasyonu:**
  ```css
  /* Glix Master Brand Wordmark CSS */
  .glix-wordmark-v2 {
    width: clamp(140px, 38vw, 190px);
    height: auto;
    filter: 
      drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7))
      drop-shadow(0 0 6px rgba(114, 244, 255, 0.45))
      drop-shadow(0 0 12px rgba(255, 85, 216, 0.25));
  }
  ```
* **Boyut:** Optimize vektör SVG `< 6 KB`.

---

### 2.4 Logo — Yedek: L-REF-01 (Prismatic Arcade Block)
* **Görsel Dosyası:** `docs/concepts/refine-logo-01-prismatic-block.png`
* **Neden Yedek Seçildi?**
  - Sprint 01 L1'in doğrudan evrimidir. Soğuk otomotiv kromu yerini koyu mat obsidyen gövdeye ve 45° prizmatik ışık kırılmalarına bırakmıştır.
  - Okunabilirliği çok yüksektir (9.7/10); ancak L-REF-05'in sağladığı sempatik sosyal sıcaklık ve dengeli play-token X ruhuna kıyasla hala biraz daha turnuva/donanım ağırlıklı durmaktadır.

---

## 3. Karşılaştırmalı Evrim Matrisi (Eski vs Yeni)

| Parametre | Eski H1 (Sprint 01) | Yeni H-REF-01 (Shortlist Kazananı) |
|---|---|---|
| **Tema** | 3D Nükleer Reaktör / Tokamak | 2D Sosyal Arcade Masası & Oyun Jetonu |
| **Sosyal Varlık** | Sıfır (Tekil, yalnız makine) | 8 Oyuncu Renk Pilonu (`P1`–`P8`) |
| **Mobil Ergonomi** | Butonları aşağı iten 320px blok (Scroll zorunlu) | %48 alana oturan 1:1 dairesel geometri (Sıfır-Scroll) |
| **Teknik Format** | Ağır raster / 3D hacim yanılsaması | Katmanlı 2D WebP/SVG + CSS keyframe |
| **Genel Puan** | 9.25 | **9.68** |

| Parametre | Eski L1 (Sprint 01) | Yeni L-REF-05 (Shortlist Kazananı) |
|---|---|---|
| **Görsel Dil** | Soğuk otomotiv alaşımı & espor kılıcı | Sıcak fırçalanmış obsidyen & dokunsal arcade pahları |
| **X Harfi** | Yırtıcı, ölümcül crosshair / bıçak | Dostane kaset bandı kesişimi + ultraviyole füzyon göbeği |
| **İkon Uyumu** | Karmaşık krom yansımaları mobilde lekelenir | 512px'ten 16px favicon'a jilet gibi siluet |
| **Ton** | FPS Turnuvası / Yarış Oyunu | Enerjik Genç-Yetişkin Mobil Parti Oyunu |
| **Genel Puan** | 9.35 | **9.68** |

---

## 4. Konsept Dosya Dizini (docs/concepts/)

Sprint kapsamında üretilen 13 görselin tamamı `docs/concepts/` altında commit'lenmeye hazırdır:

```text
docs/concepts/
├── refine-home-01-social-pylon-arena.png   (H-REF-01 Winner Hero)
├── refine-home-02-kinetic-arcade-core.png   (H-REF-02 Backup Hero)
├── refine-home-03-abstract-party-field.png  (H-REF-03 Party Waves)
├── refine-home-04-kinetic-token-shutter.png (H-REF-04 Token Drop)
├── refine-home-05-neon-arena-crest.png      (H-REF-05 Arena Crest)
├── refine-home-06-compact-social-hub.png    (H-REF-06 Social Hub)
├── refine-home-mockup-winner.png            (Combined Winner Mockup)
├── refine-home-mockup-backup.png            (Combined Backup Mockup)
├── refine-logo-01-prismatic-block.png       (L-REF-01 Backup Logo)
├── refine-logo-02-kinetic-ribbon.png        (L-REF-02 Ribbon Logo)
├── refine-logo-03-dualtone-geo.png          (L-REF-03 Geo Logo)
├── refine-logo-04-modular-badge.png         (L-REF-04 Badge Logo)
└── refine-logo-05-dynamic-symmetrical.png   (L-REF-05 Winner Logo)
```

---

## 5. Gelecek Geliştirme Ekipleri İçin Kontrol Listesi (Handoff Checklist)

*Bu liste bir sonraki geliştirme sprinti içindir; mevcut sprintte runtime değiştirilmemiştir.*

- [x] **2D-First Güvencesi:** WebGL veya 3D canvas kullanılmaz; SVG, WebP ve CSS kullanılır.
- [x] **Zero-Scroll Sözleşmesi:** Ana ekran `100dvh` flex-column içinde kalır; 320×700 küçük ekranda dahi dikey kaydırma çubuğu çıkmaz.
- [x] **No Baked Text:** Üretim raster assetleri içinde Türkçe veya İngilizce buton metni gömülmez; tüm CTA'lar canlı HTML/SVG metin olarak render edilir.
- [x] **Tek Başparmak Ergonomisi:** `ODA KUR` ve `KATIL` butonları ekranın alt %30'luk doğal dokunma yayına yerleştirilir (min yükseklik 52px).
- [x] **Erişilebilirlik (A11y):** `prefers-reduced-motion` aktif olduğunda pilon nabzı ve yörünge animasyonları statik duruma geçer.
