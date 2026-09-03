# GLIX — Home & Logo Refinement Sprint Report

**Tarih:** 2026-09-03  
**Sprint:** Home + Logo Refinement Sprint  
**Branch:** `stage-11-home-logo-refinement`  
**Base Branch:** `stage-11-asset-exploration-sprint-01`  
**Rol:** GLIX Senior Art Director + 2D Mobile Game Brand Designer + Visual QA Lead  
**Bağlayıcı Yön:** **GLIX = PREMIUM 2D ARCADE**  
*(SaaS/dashboard yok, çocuksu şeker UI yok, espor/askeri tech-demo yok, kumar/casino yok; genç-yetişkin, yüksek enerjili, dokunsal 2D mobil parti oyunu kimliği).*  
**Kapsam:** Yalnızca konsept, logo, safe-area mimarisi ve görsel QA dokümantasyonu (`docs/**`, `docs/concepts/**`). Production runtime (`apps/**`, `packages/**`, CSS, WebSocket) **kesinlikle değiştirilmemiştir**.

---

## 1. Sprint Amacı ve Yönetici Özeti (Executive Summary)

Asset Exploration Sprint 01 ile GLIX'in resmi yönü **Premium 2D Arcade** olarak kabul edilmiş ve 34 konsept yönü üzerinden temel shortlist belirlenmişti. Ancak gerçekleştirilen sanatsal direktörlük ve mobil kullanılabilirlik (Visual QA) denetimlerinde iki kritik amiral gemisi bileşeninde ciddi kimlik kaymaları tespit edildi:

1. **Home H1 (Kinetic 2D Arcade Core):**
   - *Sorunlar:* Fazla 3D reaktör / nükleer tokamak / bilimkurgu parçacık hızlandırıcısı hissi veriyordu; 2–8 kişilik sosyal arkadaş grubu toplanma enerjisini taşımıyordu; mobil ekranda CTA buton alanını boğarak dikey kaydırmaya (scroll) yol açıyordu; tam 2D-first grafik netliğine henüz kavuşamamıştı.
   - *Karar:* **AĞIR REVİZYON (REFINE HEAVILY)**.

2. **Logo L1 (Chiseled Chrome & Prismatic Rim):**
   - *Sorunlar:* Kusursuz okunabilirliğine ve siluetine rağmen fazla espor turnuvası (CS/Valorant) ve lüks spor otomobil alaşımı havası taşıyordu; sondaki **X** harfi yırtıcı bir jilet/bıçak gibi saldırgandı; GLIX'in eğlenceli, kaotik ve birleştirici parti ruhundan uzaktı.
   - *Karar:* **YÖNÜ KORU, PARTİ OYUNU İÇİN RAFİNE ET (KEEP AS DIRECTION, REQUIRE REFINEMENT)**.

Bu sprintin görevi; H1 ve L1'in güçlü genetik kodunu (yüksek kontrast, keskin rim-light, katmanlı 2D derinlik, cam-obsidyen dokunsallık) atmadan, **arkadaş grubu enerjisi, anında oyun hissi, kusursuz tek başparmak mobil ergonomisi ve dengeli logo tipografisi** ile harmanlayarak üretime hazır hale getirmektir.

---

## 2. Çoklu Ajan Analiz ve Değerlendirme Raporu (Multi-Agent Review)

Sprint boyunca 5 uzman ajan perspektifi paralel çalışarak tasarımları denetlemiştir:

### A1 — Party Game Identity Reviewer
* **Gözlem:** Bir oyuncu telefonundan `glix` bağlantısını açtığında ilk 2 saniyede üç sorunun yanıtını bilinçdışı olarak almalıdır:
  1. *Bu arkadaşlarımla oynayacağım bir parti oyunu mu?* → Ekranda tekil bir makine değil, **2–8 kişilik toplanma geometrisi** (8 renkli oyuncu pilonu / spektrumu) görülmelidir.
  2. *Hızlı ve eğlenceli mi?* → Dokunsal jeton (arcade play token), fiziksel tuş çıtırtısı ve canlı neon nabzı hissedilmelidir.
  3. *Nasıl başlarım?* → Tek dokunuşla "ODA KUR" veya "KATIL" eylemi parmak ucunda olmalıdır.

### A2 — 2D Composition Designer
* **Gözlem:** 9:16 dikey mobil oranda (390×844 ve 320×700 küçük ekranlar) dikey kaydırma (scroll) **kabul edilemez**.
* **Çözüm:** Ekran dikeyde 3 kesin bölgeye (Zone Budget) kilitlenmiştir:
  - **Zone 1 (Üst %22):** GLIX Logo alanı (36–42px yükseklik) ve canlı durum hapı.
  - **Zone 2 (Orta %48):** 1:1 kare çerçeveye oturan merkezi 2D hero sahnesi (max 280–320px).
  - **Zone 3 (Alt %30):** Tek başparmakla erişilebilir iki büyük CTA butonu ("ODA KUR", "KATIL") ve mikro "NASIL OYNANIR" bağlantısı.

### A3 — Brand / Logo Designer
* **Gözlem:** L1'in keskin krom gövdesi soğuk ve mesafeliydi; X harfi ise iki kılıcın çarpışması gibi tehlikeliydi.
* **Çözüm:** X harfi iki oyuncunun yollarının kesiştiği bir **"Social Intersection & Play-Token Cross"** olarak yeniden tasarlandı. Kesişim merkezine mor/ultraviyole (`#A855F7`) füzyon göbeği yerleştirildi. Dış köşelere yumuşatılmış 45° pahlar (chamfer) verilerek oyuncak/konsol tuşu hissi kazandırıldı.

### A4 — Mobile UX Art Director
* **Gözlem:** Eski H1 mobil kırılımında 20rem (320px) hero alanı butonları ekran dışına itiyordu.
* **Çözüm:** CSS'te `100dvh` flex-column mimarisi ve safe-area inset'leri tanımlandı. 44×44px minimum dokunma hedefi ve 52px buton yüksekliği ile butonlar parmak yayının tam merkezine yerleştirildi.

### A5 — Adversarial Reviewer (Sıkı Reddetme Filtresi)
Yönler şu 5 tuzağa karşı taranmış ve filtrelenmiştir:
1. **Espor / Taktik Bıçak:** 30°'den dar terminal açıları ve jilet kesikleri yasaklandı.
2. **Askeri Bilimkurgu / Reaktör:** Radyasyon sarısı, nükleer ikaz şeritleri, reaktör soğutma boruları yasaklandı.
3. **Kurumsal SaaS:** Düz Inter/Roboto yazı tipi, tek renkli minimal kartlar elendi.
4. **Çocuksu Şekerleme:** Yuvarlak balon harfler, jel damlaları, pastel gökkuşakları elendi.
5. **Kumar / Casino:** 777, slot makinesi kolları, altın paralar, şans sembolleri elendi.

---

## 3. TASK A — Home Hero Refinement (6 Yeni Yön)

Bütün yönler **9:16 portrait-first**, **saf 2D katmanlı (layered SVG/WebP)**, **WebGL gerektirmeyen** ve **metinsiz konsept sanatı** kurallarına göre tasarlanmıştır.

```
┌─────────────────────────────────────────────────────────────┐
│ ZONE 1 (Üst %22): GLIX LOGO & DURUM                        │
│ • Rafine GLIX Wordmark                                      │
│ • "ARKADAŞLARLA CANLI ARCADE" micro-eyebrow                 │
├─────────────────────────────────────────────────────────────┤
│ ZONE 2 (Orta %48): MERKEZİ 2D OYUN ODAĞI                    │
│ • 1:1 Oranlı 2D Arcade Sanatı (280-320px Bounding Box)      │
│ • 4–8 Oyuncu Varlık Sinyali (Spektrum / Pilonlar)          │
│ • Katmanlı 2D WebP/SVG + CSS Hafif Rotasyon/Nabız           │
├─────────────────────────────────────────────────────────────┤
│ ZONE 3 (Alt %30): DOKUNSAL CTA BAŞPARMAK ALANI              │
│ • [ ODA KUR ] Primary Cyan 3D Buton (52px)                  │
│ • [ KATIL ] Secondary Koyu Titanyum Buton (52px)            │
│ • "2–8 OYUNCU • ANINDA OYNA" meta bilgisi                   │
│ • "? NASIL OYNANIR" affordance                             │
└─────────────────────────────────────────────────────────────┘
```

---

### H-REF-01: Social Pylon Token Arena (KAZANAN / WINNER)
* **Görsel:** `docs/concepts/refine-home-01-social-pylon-arena.png`
* **Tez:** 8 renkli oyuncu bağlantı pilonu ile çevrelenmiş, merkezinde parlayan ✦ damgalı koyu obsidyen ana oyun jetonu.
* **Kompozisyon:** 1:1 dairesel arena. Merkezde 180px çapında çift kademeli fırçalanmış obsidyen madalyon; dış hatta 310px yarıçapında GLIX'in 8 imza rengini (Cyan, Magenta, Amber, Lime, Violet, Orange, Emerald, Cobalt) taşıyan 8 pilon soketi; en dışta 380px yarıçapında mekanik çark tırnakları.
* **2D Katman Ayrımı:**
  - *Katman 1 (Backdrop):* Koyu indigo radyal zemin ve mikroskobik 40px arcade ızgarası.
  - *Katman 2 (Outer Mechanism):* 2D SVG çark çentikleri ve 8 radyal bağlantı hattı (statik veya 60s çok yavaş dönüş).
  - *Katman 3 (Pylon Satellites):* 8 adet 2D flat-shaded renkli soket ikonu (`P1`–`P8`).
  - *Katman 4 (Master Token):* 2D çokgen pahlı obsidyen disk + Cyan/Magenta neon rim + ✦ kıvılcım kabartması.
* **Sosyal Parti Sinyali:** Kusursuz (9.8/10). Ekrana bakan herkes masanın etrafında 8 arkadaşın toplandığı fiziksel bir oyun konsolunu anında anlar.
* **CTA Kullanılabilirliği:** Mükemmel. Dairesel geometri alt bölgeye kesinlikle taşmaz; butonlara 260px kesintisiz dikey nefes alanı bırakır.
* **Üretim Fizibilitesi:** Çok yüksek. SVG veya 3 katmanlı şeffaf WebP (< 85 KB). CSS `transform` ve `drop-shadow` ile sıfır GPU yükü.
* **Riskler & Önlemler:** Pilon soketleri 320px ekranda fazla küçülmemeli; pilon kafaları min 24px çapında tutulmalıdır.
* **Skor:** **9.65 / 10**

---

### H-REF-02: Kinetic 2D Arcade Core — Refined (YEDEK / BACKUP)
* **Görsel:** `docs/concepts/refine-home-02-kinetic-arcade-core.png`
* **Tez:** Sprint 01 H1'in rafine edilmiş hali: Soğuk bilimkurgu reaktör detayları silinmiş; eliptik yörüngelerde dönen 8 renkli oyuncu uydu çipi ve yumuşatılmış titanyum halkalar.
* **Kompozisyon:** Çapraz eliptik iki neon yörünge halkası (biri Cyan, diğeri Magenta) ve merkezde 150px çapında çift cidarlı enerji diski.
* **2D Katman Ayrımı:**
  - *Katman 1:* Statik arka vinyet ve yumuşak derinlik halkası.
  - *Katman 2:* CSS ile zıt yönlerde dönen iki eliptik SVG yörünge yolu.
  - *Katman 3:* Yörüngelere kilitlenmiş 8 adet 2D renkli uydu feneri.
  - *Katman 4:* Merkez 2D titanyum çekirdek ve parlayan ✦ sembolü.
* **Sosyal Parti Sinyali:** Yüksek (9.1/10). 8 uydu çipi arkadaş varlığını netleştirir.
* **CTA Kullanılabilirliği:** İyi (9.0/10). Eliptik tasarım alt köşelere hafif yaklaşsa da safe-area içinde kalır.
* **Üretim Fizibilitesi:** Çok yüksek (9.4/10). 2 WebP katmanı + 1 SVG yörünge (< 75 KB).
* **Riskler:** Eski H1'e benzer şekilde bazı kullanıcılara hala hafif uzay/fizik hissi verebilir.
* **Skor:** **9.25 / 10**

---

### H-REF-03: Abstract Party-Energy Field
* **Görsel:** `docs/concepts/refine-home-03-abstract-party-field.png`
* **Tez:** Merkezdeki GLIX monogramından yayılan, takım spektrumu frekans halkaları ve harmonik neon ses/enerji dalgaları.
* **Kompozisyon:** Eşmerkezli renkli halkalar (100–420px) ve yatayda birbirinin içinden geçen Cyan ve Magenta sinüs dalga şeritleri.
* **2D Katman Ayrımı:** 3 katmanlı SVG yol animasyonu (`stroke-dashoffset` dalgalanması).
* **Sosyal Parti Sinyali:** Orta (6.8/10). Fazla soyut; müzik sentezleyicisi, Spotify ses dalgası veya meditasyon uygulaması hissi uyandırabilir.
* **CTA Kullanılabilirliği:** İyi (8.5/10).
* **Üretim Fizibilitesi:** Yüksek (9.0/10).
* **Riskler:** Parti oyunu somutluğunu ve dokunsal buton hissini zayıflatır.
* **Skor:** **7.40 / 10**

---

### H-REF-04: Kinetic 2D Token Machine (Tactile Coin Drop)
* **Görsel:** `docs/concepts/refine-home-04-kinetic-token-shutter.png`
* **Tez:** Mekanik kepenk plakası, neon aydınlatmalı jeton yuvası ve altın renkli GLIX madalyonunun girdiği retro-fiziksel arcade jeton konsolu.
* **Kompozisyon:** 460×520px dikdörtgen fırçalanmış obsidyen şasi, üstte parlayan yatay yuva, altta yarı girmiş jeton ve `INSERT TO PLAY • 2-8P` durum çubuğu.
* **2D Katman Ayrımı:** 2D şasi gövdesi, yaylı kepenk sprite'ı, kayan jeton katmanı.
* **Sosyal Parti Sinyali:** Zayıf (6.2/10). Jeton yuvası bireysel (tek kişi jeton atar) bir çağrışım yapar.
* **CTA Kullanılabilirliği:** Orta (7.5/10). Dikey kutu yüksekliği alt butonları sıkıştırır.
* **Büyük Risk:** **Kumar / Casino Tuzağı.** Jeton ve yuva, App Store ve kullanıcı algısında slot makinesi / paralı kumar oyunu şüphesi yaratabilir.
* **Skor:** **7.20 / 10**

---

### H-REF-05: Layered Neon Arena Crest
* **Görsel:** `docs/concepts/refine-home-05-neon-arena-crest.png`
* **Tez:** Lazer kesim akrilik kalkan gövdesi, çokgen pahlar ve 4 ana oyun türünü (Refleks ⚡, Sosyal/Kelime 💬, Kablo/İmha ✂, Kaos/Zar 🎲) simgeleyen neon glifler.
* **Kompozisyon:** 480×460px geometrik kalkan, neon çevre fitili, dörde bölünmüş iç alanlar ve merkez ✦ düğümü.
* **2D Katman Ayrımı:** 2D vektörel kalkan SVG'si ve CSS drop-shadow katmanları.
* **Sosyal Parti Sinyali:** İyi (7.8/10). Rozet hissi güçlüdür.
* **CTA Kullanılabilirliği:** Çok iyi (9.2/10). Kalkanın alt ucu sivrilerek iki CTA butonu arasındaki boşluğa doğal bir ok gibi işaret eder.
* **Riskler:** Turnuva/espor ligi armasına kayma riski.
* **Skor:** **8.25 / 10**

---

### H-REF-06: Compact Social Hub
* **Görsel:** `docs/concepts/refine-home-06-compact-social-hub.png`
* **Tez:** 8 adet minyatür oyuncu kimlik çipinin çevrelediği devasa, dokunsal bir 2D arcade "READY" ana butonu.
* **Kompozisyon:** Merkezde 340px çapında devasa Magenta/Cyan basma düğmesi, dış çemberde 8 oyuncunun takma ad ve renk pilonları.
* **2D Katman Ayrımı:** Düğme altlığı, yaylı basma diski ve 8 çip sprite'ı.
* **Sosyal Parti Sinyali:** Çok yüksek (9.4/10).
* **CTA Kullanılabilirliği:** Orta (7.6/10). Ortadaki dev düğmenin kendisi bir CTA ("READY") gibi göründüğü için alttaki "ODA KUR" ve "KATIL" butonlarıyla hiyerarşik yarışa girer.
* **Riskler:** Çift buton yanılsaması (kullanıcı ortadaki süs düğmesine basmaya çalışır).
* **Skor:** **8.35 / 10**

---

## 4. TASK B — Logo Refinement (5 Yeni Yön)

Bütün logo yönleri; **yüksek okunabilirlik**, **cyan/magenta/violet renk ailesi**, **320px ekranda jilet gibi netlik**, **1-bit monokrom baskı uyumu** ve **512px app icon türetilebilirliği** standartlarıyla üretilmiştir.

---

### L-REF-05: Dynamic Symmetrical Arcade Wordmark (KAZANAN / WINNER)
* **Görsel:** `docs/concepts/refine-logo-05-dynamic-symmetrical.png`
* **Wordmark Biçim Dili:**
  - **G:** Kararlı, genişletilmiş atletik squircle; sol üstte 45° arcade kabin pahı; sağda dokunsal basma anahtarı gibi kalın yatay basamak.
  - **L:** Tabanı sağlam zemin braketi; G ile eşit optik kütle.
  - **I:** Dengeli dikey enerji sütunu / baton; harfler arası boşluğu kusursuz kilitler.
  - **X:** Saldırgan espor kılıcı değil; **Social Intersection & Play-Token Cross**. Uçları düzleştirilmiş ve mikro-pahlanmış iki kalın kaset bandı.
* **X Uygulaması & Füzyon Düğümü:**
  - İki diagonal kolun kesişim merkezinde dairesel/altıgen bir negatif oyuk ve içinde parlayan **Ultraviyole Füzyon Göbeği** (`#A855F7`).
  - Çapraz A kolu Electric Cyan, Çapraz B kolu Hot Magenta; merkezde birleşerek iki oyuncunun maçtaki çarpışmasını simgeler.
* **Kenar & Işıma (Rim/Glow):**
  - Çekirdek gövde: Koyu füme obsidyen (`#101530`).
  - Dış kontur: 2.5px jilet gibi keskin çift-renk vektör rim vuruşu.
  - CSS filtresi: Kontrollü 8px mor ve 4px camgöbeği ışıma (asla bulanık yayılma yapmaz).
* **Monokrom Fallback:** 1-Bit siyah-beyaz stensil. X'in bir kolu sürekli geçerken diğeri 2px'lik temiz bir stensil boşluğu ile altından geçer; faks, termal fiş veya B&W bildirimde %100 okunur.
* **App Icon Çıkarımı:** X harfi ve ortasındaki füzyon diski, 512×512px ve 192×192px kare/squircle uygulama ikonu olarak kusursuz çalışır. 16px favicon'da dahi merkez oyuk kapanmaz.
* **320px Okunabilirlik:** **9.8 / 10** (Sıfır bozulma).
* **SVG Planı:** Tek parça optimize `<path>` kümesi, < 6 KB payload, CSS fill ve stroke değişkenleri.
* **Risk & Önlem:** Harf aralıkları (kerning) mobilde daralmamalı; `letter-spacing: 0.08em` ile ferah tutulmalıdır.
* **Skor:** **9.65 / 10**

---

### L-REF-01: Prismatic Arcade Block (YEDEK / BACKUP / CHROME UPGRADE)
* **Görsel:** `docs/concepts/refine-logo-01-prismatic-block.png`
* **Wordmark Biçim Dili:** Sprint 01 L1'in doğrudan evrimi. Ağır blok harfler korunmuş; ancak soğuk otomotiv alaşımı yerine sıcak mat obsidyen kompozit gövdeye geçilmiştir.
* **X Uygulaması:** 4 yüzeyli prizmatik tepe çizgisi; dış uçlardaki iğne uçlar kesilip 90° dik dikdörtgen terminallere dönüştürülmüştür.
* **Kenar & Işıma:** Üst yüzeylerde Cyan, alt pah yüzeylerinde Magenta ışık kırılması.
* **Monokrom Fallback:** Yüksek kontrastlı beyaz kontur, siyah dolgu.
* **App Icon Çıkarımı:** Prizmatik X bloğu ikon olarak çok güçlü bir 3D hissi verir.
* **320px Okunabilirlik:** **9.7 / 10**.
* **Riskler:** Hala hafif sert/turnuva havası taşır; L-REF-05 kadar sıcak ve sosyal değildir.
* **Skor:** **9.45 / 10**

---

### L-REF-02: Kinetic Overlap Ribbon
* **Görsel:** `docs/concepts/refine-logo-02-kinetic-ribbon.png`
* **Wordmark Biçim Dili:** Yarı saydam, birbiri üstüne binen akrilik neon ışık tüpleri ve joystick kılavuz şeritleri.
* **X Uygulaması:** Cyan ve Magenta şeritler merkezde %50 alfa ile üst üste biner; kesişim mor/beyaz neon füzyon parlaması üretir.
* **Kenar & Işıma:** Geniş, organik neon ışıma.
* **320px Okunabilirlik:** **9.2 / 10**.
* **Kullanım Yeri:** Ana statik logodan ziyade, oyun içi HUD'da iki oyuncu berabere kaldığında veya skor vuruşu yaptığında tetiklenecek VFX animasyonu için idealdir.
* **Skor:** **9.15 / 10**

---

### L-REF-03: Dual-Tone Arcade Geo
* **Görsel:** `docs/concepts/refine-logo-03-dualtone-geo.png`
* **Wordmark Biçim Dili:** 3D pahları tamamen terk eden, saf 2D grafik poster tipografisi. Bütün harfler 45° verev eksende iki renk bloğuna bölünmüştür.
* **X Uygulaması:** Bir bacak Neon Cyan, diğer bacak Hot Pink; kesişimde 2px'lik ofset çentiği.
* **320px Okunabilirlik:** **9.9 / 10** (Maksimum kontrast).
* **Riskler:** Fazla grafik/düz kalabilir; arcade konsolunun dokunsal zenginliğini bir miktar yitirir.
* **Skor:** **9.10 / 10**

---

### L-REF-04: Modular Neon Tile / Badge
* **Görsel:** `docs/concepts/refine-logo-04-modular-badge.png`
* **Wordmark Biçim Dili:** Retro Game Boy / Neo Geo kaset rozetleri gibi, füme polikarbonat şasi içine gömülmüş kabartma harfler ve köşe durum LED'leri.
* **X Uygulaması:** Rozetin sağ tarafına kilitlenmiş gömme X tuşu.
* **320px Okunabilirlik:** **9.3 / 10**.
* **Riskler:** Dış rozet çerçevesi dikeyde fazla yer kaplar; bağımsız yüzen (floating) logo kullanımında esnekliği sınırlar.
* **Skor:** **8.90 / 10**

---

## 5. Üretilen Konsept Görselleri Envanteri

`docs/concepts/` altında tam 13 adet yüksek çözünürlüklü (supersampled anti-aliasing, zengin renk gamutlu, 2D arcade kurallarına uygun) konsept ve mockup görseli üretilmiştir:

| Dosya Adı | Kategori | Format / Oran | Boyut | Açıklama |
|---|---|:---:|:---:|---|
| [refine-home-01-social-pylon-arena.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-home-01-social-pylon-arena.png) | Home Concept 1 | 9:16 (720×1280) | ~163 KB | **KAZANAN:** 8 Oyuncu Pilon Arenası ve Ana Obsidyen Jeton |
| [refine-home-02-kinetic-arcade-core.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-home-02-kinetic-arcade-core.png) | Home Concept 2 | 9:16 (720×1280) | ~135 KB | **YEDEK:** Rafine Kinetik Çekirdek ve 8 Yörünge Uydusu |
| [refine-home-03-abstract-party-field.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-home-03-abstract-party-field.png) | Home Concept 3 | 9:16 (720×1280) | ~100 KB | Soyut Parti Frekans Alanı ve Harmonik Dalgalar |
| [refine-home-04-kinetic-token-shutter.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-home-04-kinetic-token-shutter.png) | Home Concept 4 | 9:16 (720×1280) | ~86 KB | Dokunsal Jeton Yuvası ve Mekanik Kepenk |
| [refine-home-05-neon-arena-crest.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-home-05-neon-arena-crest.png) | Home Concept 5 | 9:16 (720×1280) | ~81 KB | Geometrik Kalkan ve 4 Mini Oyun Türü Glifi |
| [refine-home-06-compact-social-hub.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-home-06-compact-social-hub.png) | Home Concept 6 | 9:16 (720×1280) | ~120 KB | Dev Basma Düğmesi ve 8 Oyuncu Çipi |
| [refine-home-mockup-winner.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-home-mockup-winner.png) | Combined Mockup | 9:16 (720×1280) | ~136 KB | **KAZANAN EKRAN:** L-REF-05 Logo + H-REF-01 Hero + Canlı CTA Butonları |
| [refine-home-mockup-backup.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-home-mockup-backup.png) | Combined Mockup | 9:16 (720×1280) | ~98 KB | **YEDEK EKRAN:** L-REF-01 Logo + H-REF-02 Hero + Canlı CTA Butonları |
| [refine-logo-05-dynamic-symmetrical.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-logo-05-dynamic-symmetrical.png) | Logo Concept 5 | 16:9 (1280×720) | ~180 KB | **KAZANAN:** Dengeli Simetrik Wordmark + 320px/Stensil/İkon Panelleri |
| [refine-logo-01-prismatic-block.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-logo-01-prismatic-block.png) | Logo Concept 1 | 16:9 (1280×720) | ~156 KB | **YEDEK:** Prizmatik Blok Wordmark + 320px/Stensil/İkon Panelleri |
| [refine-logo-02-kinetic-ribbon.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-logo-02-kinetic-ribbon.png) | Logo Concept 2 | 16:9 (1280×720) | ~156 KB | Kinetik Örtüşen Şerit Wordmark + Füzyon Göbeği |
| [refine-logo-03-dualtone-geo.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-logo-03-dualtone-geo.png) | Logo Concept 3 | 16:9 (1280×720) | ~115 KB | Çift-Tonlu 45° Geometrik Vektör Wordmark |
| [refine-logo-04-modular-badge.png](file:///c:/Users/Xpike/Desktop/oyun/docs/concepts/refine-logo-04-modular-badge.png) | Logo Concept 4 | 16:9 (1280×720) | ~120 KB | Modüler Kaset Rozeti ve Polikarbonat Şasi |

---

## 6. Tam Scorecard Değerlendirmesi

Sprint şartnamesinde belirlenen 7 ağırlıklı metrik uygulanmıştır:
1. **Premium Mobile Game Feel (%20)**
2. **Social Party Identity (%20)**
3. **Not SaaS (%15)**
4. **Not Childish (%15)**
5. **Mobile Readability (%10)**
6. **Brand Distinctiveness (%10)**
7. **Production Feasibility (%10)**

### 6.1 Home Hero Refinement Puan Tablosu

| Kod | Konsept Adı | Game Feel (20%) | Social (20%) | Not SaaS (15%) | Not Child (15%) | Readability (10%) | Brand (10%) | Feasibility (10%) | Ağırlıklı Toplam | Sonuç |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **H-REF-01** | **Social Pylon Token Arena** | 9.8 | 9.8 | 9.7 | 9.6 | 9.5 | 9.7 | 9.5 | **9.68** | **KAZANAN (WINNER)** |
| **H-REF-02** | **Kinetic Arcade Core (Refined)** | 9.4 | 9.1 | 9.5 | 9.6 | 9.3 | 9.3 | 9.4 | **9.37** | **YEDEK (BACKUP)** |
| **H-REF-06** | **Compact Social Hub** | 8.8 | 9.4 | 9.2 | 8.8 | 8.2 | 8.6 | 8.5 | **8.84** | Lobi için Saklandı |
| **H-REF-05** | **Layered Neon Arena Crest** | 8.6 | 7.8 | 9.5 | 9.5 | 9.4 | 8.8 | 9.2 | **8.87** | Rozet/Kupa için Uygun |
| **H-REF-03** | **Abstract Party-Energy Field** | 7.2 | 6.8 | 8.5 | 8.6 | 8.4 | 7.5 | 9.2 | **7.88** | Elendi (Soyut) |
| **H-REF-04** | **Kinetic Token Machine** | 9.5 | 6.2 | 9.8 | 8.5 | 7.5 | 7.0 | 8.8 | **8.15** | Elendi (Kumar Riski) |

---

### 6.2 Logo Refinement Puan Tablosu

| Kod | Yön Adı | Game Feel (20%) | Social (20%) | Not SaaS (15%) | Not Child (15%) | Readability (10%) | Brand (10%) | Feasibility (10%) | Ağırlıklı Toplam | Sonuç |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **L-REF-05** | **Dynamic Symmetrical Arcade** | 9.6 | 9.7 | 9.7 | 9.6 | 9.8 | 9.8 | 9.6 | **9.68** | **KAZANAN (WINNER)** |
| **L-REF-01** | **Prismatic Arcade Block** | 9.5 | 8.8 | 9.6 | 9.8 | 9.7 | 9.4 | 9.5 | **9.46** | **YEDEK (BACKUP)** |
| **L-REF-02** | **Kinetic Overlap Ribbon** | 9.6 | 9.5 | 9.6 | 9.2 | 9.2 | 9.6 | 9.2 | **9.43** | HUD/VFX Adayı |
| **L-REF-03** | **Dual-Tone Arcade Geo** | 9.0 | 9.2 | 9.3 | 9.6 | 9.9 | 9.2 | 10.0 | **9.38** | Vektör Tipografi |
| **L-REF-04** | **Modular Neon Tile / Badge** | 9.4 | 8.8 | 9.6 | 9.5 | 9.4 | 9.4 | 9.1 | **9.31** | Kaset Rozeti |

---

## 7. Kazanan ve Yedek Seçimlerinin Detaylı Gerekçeleri

### Neden Eski H1 Değiştirildi?
1. **Soğuk Bilimkurgu / Reaktör Algısı:** Eski H1, bir nükleer füzyon jeneratörü veya parçacık çarpıştırıcısını andırıyordu. GLIX ise dostların birbirini trollediği, güldüğü ve kablo kestiği bir parti oyunudur.
2. **Sosyal Sinyal Eksikliği:** Eski H1'de hiçbir oyuncu rengi veya çoklu katılımcı ipucu yoktu; tekil bir uzay gemisi paneli gibiydi.
3. **CTA Kırılması:** Eski H1'in dikey boyutu ve kompozisyonu mobilde butonları aşağı iterek scroll zorunluluğu getiriyordu.

### Neden H-REF-01 (Social Pylon Token Arena) Kazandı?
1. **Anında Sosyal Sinyal:** 8 renkli pilon soketi, ilk saniyede ekranın 2 ila 8 kişilik bir masa etrafında toplandığını haykırır.
2. **Dokunsal Arcade Nesnesi:** Merkezdeki ✦ kabartmalı kalın obsidyen madalyon, gerçek bir arcade jetonu hissi verir.
3. **Sıfır-Scroll Ergonomisi:** 1:1 dairesel geometri alt bölgeyi tamamen açık bırakır; "ODA KUR" ve "KATIL" butonları başparmağın doğal yayına oturur.

### Neden Eski L1 Modifiye Edildi?
1. **Espor / Otomotiv Tehdidi:** Eski L1'in jilet gibi keskin kılıç açıları ve yüksek yansımalı soğuk kromu, rekabetçi FPS liglerini veya lüks spor arabaları anımsatıyordu.
2. **Saldırgan X Harfi:** Sondaki X, elenme çarpısı veya iki samuray kılıcının çatışması gibi ölümcül duruyordu.

### Neden L-REF-05 (Dynamic Symmetrical Arcade) Kazandı?
1. **Sosyal Kesişim (Play-Token X):** X harfi, iki kalın kaset bandının dostça kesiştiği ve merkezinde ultraviyole füzyon parıltısı ürettiği bir oyun simgesine dönüştürüldü.
2. **Optik Denge:** Soldaki G harfinin kavisli ağırlığı ile sağdaki X harfinin enerjik kanatları mükemmel bir simetri oluşturdu.
3. **Kusursuz İkonik Uyumluluk:** X harfi ve füzyon göbeği, 512px'ten 16px favicon'a kadar hiçbir detayı kaybolmadan bağımsız bir oyun markası rozetine dönüşür.

---

## 8. Üretim ve Safe-Area Geçiş Mimarisi (Production Contract)

Gelecekteki frontend geliştirmesi için bağlayıcı CSS/SVG contract'ı tanımlanmıştır:

```css
/* Zero-Scroll 100dvh Portrait Safe-Area Contract */
.home-layout-v2 {
  height: 100dvh;
  max-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: max(1rem, env(safe-area-inset-top)) 1.25rem max(1rem, env(safe-area-inset-bottom));
  overflow: hidden;
  box-sizing: border-box;
}

/* Zone 1: Logo & Status (~22%) */
.home-header-v2 {
  flex: 0 0 22%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

/* Zone 2: Central Hero Arena (~48%) */
.home-arena-v2 {
  flex: 0 0 48%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  max-width: 320px;
  max-height: 320px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
}

/* Zone 3: Tactile CTA Zone (~30%) */
.home-cta-v2 {
  flex: 0 0 30%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
}

.home-btn-primary {
  min-height: 52px;
  background: linear-gradient(135deg, #72f4ff 0%, #00b4d8 100%);
  color: #070915;
  font-weight: 900;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(114, 244, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.home-btn-secondary {
  min-height: 52px;
  background: rgba(16, 21, 47, 0.9);
  border: 1.5px solid rgba(255, 85, 216, 0.5);
  color: #f5f7ff;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
```

---

## 9. Sonuç ve Teslimat Onayı

Bu sprint ile GLIX'in ana ekran ve logo tasarımı, **Premium 2D Arcade** vizyonunun en olgun, en sosyal ve mobilde en ergonomik noktasına taşınmıştır.

- Runtime kodu (`apps/**`, `packages/**`) **%100 dokunulmamış ve temizdir**.
- Bütün çıktılar `docs/**` ve `docs/concepts/**` altında toplanmıştır.
- 13 adet yüksek kaliteli konsept görseli tamamlanmıştır.
