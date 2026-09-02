# Aşama 5 — Neon Toybox 2.5D asset pipeline

**Durum:** TAMAMLANDI — 2026-09-02

Bu aşama, Glix'in ortak görsel dilini ve telefon odaklı sahne yükleme
sözleşmesini kurar. Gerçek mini oyunlara özel assetler Aşama 6'dan itibaren
aynı sözleşmeyi kullanacaktır.

## Görsel yön

- Ana stil: **Neon Toybox 2.5D**.
- Ton: koyu indigo arcade zemini, genç-yetişkin arkadaş grubu enerjisi,
  parlak ama kontrollü cyan/magenta/amber ışık.
- Çocukça pastel görünüm, aşırı bloom, okunmayan dekoratif yazı ve gereksiz
  arka plan objeleri kullanılmayacak.
- Sahne katmanları sabit sırada çalışır:

```text
backdrop → atmosphere → parallax-grid → stage-deck → characters
→ foreground-fx → html-ui
```

## Dosya düzeni

```text
apps/client/public/assets/
  stage/
    neon-toybox-arcade-deck-v1.png
  characters/
    neon-toybox-roster-v1.png

apps/client/src/visuals/
  assetManifest.ts
  NeonToyboxScene.tsx
```

### Asset kaydı

| Asset | Kullanım | Yükleme | Not |
|---|---|---|---|
| `stage/neon-toybox-arcade-deck-v1.png` | Ortak canlı sahne arka planı | Kritik / eager | ImageGen ile üretildi; ortada HTML oyun alanı için sakin boşluk bırakır. |
| `characters/neon-toybox-roster-v1.png` | 8 karakterin stil ve oran referansı | Kritik değil / lazy | ImageGen roster referansı; canlı sahnede matte bağımlılığı oluşturmaması için karakter gövdeleri şu an CSS ile çizilir. |

Üretim assetleri proje içinde tutulur; yalnızca `$CODEX_HOME` altındaki geçici
üretim çıktısına bağımlı kalınmaz.

## Kod sözleşmesi

- `assetManifest.ts`, asset yolunu, türünü, kritik olup olmadığını ve önerilen
  maksimum texture kenarını tek yerde tanımlar.
- Kritik assetler `preloadCriticalVisualAssets()` ile tekil promise cache
  üzerinden yüklenir; aynı görsel iki kez decode edilmez.
- Sahne arka planı `decoding="async"` ve `loading="eager"` ile açılır.
- Kritik olmayan roster referansı lazy tutulur; ilk canlı sahneye zorunlu
  bağımlılık oluşturmaz.
- `NeonToyboxScene.tsx` ağ üzerinden kare kare animasyon taşımaz. Sunucudan
  faz/hamle durumu gelir, ışık ve karakter hareketi telefonda CSS ile oynar.
- `contain: layout paint`, sınırlı glow katmanı ve `prefers-reduced-motion`
  desteği düşük cihaz ve erişilebilirlik davranışını korur.

## Karakter sistemi

Sekiz oyuncu slotu için aynı ortak gövde sistemi farklı accent, kafa formu,
anten, kol pozu ve renk ile varyantlanır:

```text
pulse / runner
byte  / bot
volt  / visor
moss  / cat
nova  / orb
flare / dj
wave  / slime
ember / fire
```

Ortak görsel durumlar faz sınıfına bağlanır:

- tutorial / preparing: sakin bekleme ve hazırlık salınımı
- playing: hızlı reaktör nabzı ve canlı ışık huzmeleri
- results / finished: lime sonuç ışığı ve sabitlenmiş enerji
- `self-submitted`: oyuncunun kendi karakter aura'sı yeşile yaklaşır
- `eliminated`: düşük parlaklık ve gri ton ile izleyici görünümü

## Telefon kaynak bütçesi

- Ortak raster assetlerde hedef maksimum texture kenarı: **2048 px**.
- İlk sahnede tek kritik arka plan asseti eager yüklenir; roster ve oyun özel
  assetleri lazy yüklenir.
- CSS glow/ızgara/parçacıklar küçük ve katmanlıdır; büyük bir efekt atlasını
  her oyunda taşımak yerine gerektiğinde oyun adapterı yükleyecektir.
- Sahne animasyonları `transform` ve `opacity` üzerinden ilerler; layout
  ölçümü yapan sürekli timer kullanılmaz.
- PWA service worker kritik arka planı shell cache'e alır. Cache adı
  `glix-shell-v2` olarak artırılmıştır.

## Örnek sahne

Aşama 4'teki motor provası ekranı artık bu sahneyi kullanır. Böylece tutorial,
hazırlık, oynama, sonuç ve bitiş fazlarının tamamı aynı arka plan, karakter,
ışık ve HTML arayüz sistemi üzerinde görülebilir. Gerçek mini oyun butonu ve
oyun özel efektleri Aşama 6 dikey diliminde bu sahnenin üzerine bağlanacaktır.

## Açık üretim işi

Roster görseli tasarım referansı olarak saklanmıştır. Üretim karakterleri
oyunlara bağlanırken her slot için gerçek ayrı sprite/katman dosyaları
oluşturulacak; bu aşamada ise telefon performansını ölçmek için canlı vitrin,
aynı Neon Toybox oranlarını koruyan prosedürel karakter katmanını kullanır.
