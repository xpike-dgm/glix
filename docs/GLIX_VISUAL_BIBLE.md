# GLIX Visual Bible — Stage 11.2

**Durum:** Stage 11.2 görsel sistem ve acceptance contract — C6 PASS WITH GUARDRAILS  
**Baseline:** güncel `main` / `origin/main` — `2118d9a` (`fix: stabilize multiplayer participants and reconnects`)  
**Çalışma dalı:** final git raporundaki checkout branch’i; bu belge branch adından bağımsız olarak `docs/` kapsamındadır.  
**Kapsam:** yalnızca bu belge ve bağlı docs contract’ları; runtime, CSS, WebSocket, oyun kuralı ve asset entegrasyonu bu aşamada değiştirilmez.

Bu belge GLIX’in bundan sonraki frontend, 2D asset ve oyun-sahnesi işlerinde ana visual execution contract ve acceptance contract’ıdır. `MUST` zorunlu, `SHOULD` tercih edilen, `MAY` izin verilen, `REJECT` kabul edilmeyen davranışı belirtir. Yön seçimi için `docs/GLIX_CREATIVE_DIRECTIONS.md`, reusable prompts için `docs/GLIX_ASSET_PROMPT_LIBRARY.md` canonical companion’lardır. Bu belge kendi başına okunabilir; başka draft/creative exploration dosyaları bu contract’ın üstüne çıkamaz.

### Kaynak hiyerarşisi ve override kaydı

Bu belge hazırlanırken promptta istenen mevcut `main`, README, proje hafızası, asset pipeline, 24 oyun katalogları, Stage 6–9 adapter/control dosyaları, PWA/orientation dosyaları ve yerel runtime ekranları incelendi. Eski `Neon Toybox`, `2.5D`, `3D scene`, `WebGL` veya “dimensional environment” ifadeleri mevcut baseline’ı açıklayan tarihsel kayıtlar olabilir; **yeni resmi görsel hedef değildir ve bu belge tarafından supersede edilmiştir**. Yeni bağlayıcı hedef **Premium 2D Arcade**’dır. `GAME_CATALOG` içindeki 24 gerçek ID tek oyun kataloğu otoritesidir; başka dokümanlarda bulunan tarihsel/yanlış oyun sayıları bu contract’ı değiştirmez.

A1–A5 read-only auditleri tamamlandı. A6 adversarial review sonucu başlangıçta `CONDITIONAL PASS` idi; loophole’lar bu metne işlendi. A7 bağımsız post-revision gatekeeper incelemesi `PASS` verdi. Creative exploration’daki bağımsız C6 corrective recheck sonucu `PASS WITH GUARDRAILS` verdi; browser/device crop, rendered KPK states ve separated production layers gelecekteki implementation gate’leri olarak açık bırakıldı.

## 1. Brand Statement

GLIX, aynı odadaki 2–8 genç-yetişkin arkadaşın telefonda hızlıca hamle yaptığı, sosyal gerilimi ve komik anı fiziksel arcade nesneleriyle görünür kılan **Premium 2D Arcade / Neon Social Arcade** party game’idir.

Oyuncunun ilk algısı şu olmalıdır:

> “Bu bir web sitesi değil; arkadaşlarla oynanan, yüksek kaliteli bir mobil arcade oyunu.”

GLIX’in görsel dili **game-first, young-adult, bold, social, energetic ve polished** olmalıdır. 16+ bir sosyal oyun tonu hedeflenir: gore veya sexualized art yoktur; olgunluk, koyu yüzey, oran, tipografi, mizah ve malzeme disiplininden gelir. Hedef tonun üretim karışımı yaklaşık `%45` fiziksel arcade hardware, `%25` dark social venue/neon light, `%20` oyuncu enerjisi ve situational humor, `%10` kontrollü tactile toy charm’dır. Toy charm, çocuk oyuncağı dünyası değildir.

Premium hissi pahalı bir renderer’dan değil; iyi çizilmiş 2D oyun sanatı, güçlü siluet, katmanlı kompozisyon, kontrollü neon, gerçek HTML/SVG metin, net motion feedback ve dokunma ergonomisinden gelir.

Bağlayıcı teknik yön:

- Core gameplay, HUD, interaction surface, ana oyun nesneleri ve karakter/avatarlar 2D-first’tır.
- SVG, şeffaf PNG/WebP, katmanlı 2D background, sprite sheet ve procedural CSS/SVG birincil üretim araçlarıdır.
- Canvas yalnızca açık bir gameplay faydası varsa kullanılabilir; örnek: çizim yüzeyi.
- WebGL, gerçek zamanlı 3D sahne, 3D model veya 3D rendering pipeline bu visual contract’ın gereği değildir ve önerilmez.
- Gölge, inner shadow, bevel, rim light, gradient, neon emission, sınırlı parallax, scale animation ve sprite/SVG animation; 2D nesneye kalite ve derinlik hissi veren yüzey işlemleridir. Bunlar 3D mimari olarak yorumlanmaz.
- Eski kodda bulunan `NeonToyboxScene` adı ve eski “toybox” referansları yalnızca mevcut baseline teşhisidir. Yeni hedefi childlike/candy/tiny toybox estetiği değil Premium 2D Arcade belirler.

## 2. Five Core Principles

### 1 — Game object before web chrome

Her ekranda en önemli şey oyuncunun yapacağı hamleyi anlatan 2D nesnedir: buton, kart, ağ, kablo, sayaç, kadeh, çizgi veya hedef. Başlık, metadata, açıklama ve bağlantı durumu bu nesneyi destekler; onunla eşit ağırlıkta bir web sayfası kurmaz.

**Kabul:** Aktif oyunda oyuncu ana verb’i (bas, seç, yaz, eşleştir, kes, çiz, kaç) üç saniye içinde görür; ana hit-area için document scroll gerekmez.

### 2 — Premium is restraint plus finish

Koyu graphite/indigo yüzey, kontrollü metalik çizgi, tekil neon odak, temas gölgesi ve doğru oran; daha çok gradient, blur veya parçacık eklemekten değerlidir.

**Kabul:** Bir ekranın parlak, yüksek doygunluklu veya hareketli her unsuru bir state, oyuncu kimliği veya mekanik açıklamadır.

### 3 — Social energy, not mascot energy

GLIX oyuncuların birbirine bakıp konuştuğu bir parti oyunudur. Enerji; avatar ifadesi, reveal, turn, risk ve karşılıklı seçimden gelir. Sürekli mascot, bebek yüzü, hayvan kalabalığı veya şekerleme dekoru sosyal bağın yerine geçmez.

**Kabul:** Karakter kimliği siluet, aksesuar, pose ve visor/ikon farkıyla okunur; sürekli wink, kalp, pofuduk yüz veya rastgele cute animation gerekmez.

### 4 — Neon has a job

Cyan etkileşim/odak, magenta sosyal bağ/reveal, violet sistem ve nadirlik, amber urgency, lime success, red danger/lockout için kullanılır. Renk bir kimlik ya da mekanik rolü taşımıyorsa dekor olarak kullanılmaz.

**Kabul:** Oyuncu bir state’i yalnız renk olmadan da metin, ikon, şekil, motion veya konumla anlayabilir.

### 5 — Mobile clarity is part of the art direction

320×700 ve 844×390 hedefleri tasarım sonrasında yapılan bir düzeltme değil, her sahnenin kompozisyon girdisidir. Safe-area, başparmak erişimi, klavye, orientation ve sekiz oyuncu görünürlüğü çizim kadar bağlayıcıdır.

**Kabul:** Home aksiyonları 320×700’de ilk viewport’ta, canlı oyun aksiyonu orientation gate sonrasında ilk viewport’ta, landscape oyun aksiyonu 844×390’de görünür; zamanlı hamle sayfa kaydırmaya bağlı değildir.

## 3. Anti-Goals

GLIX aşağıdaki görsel sonuçlara yaklaşırsa tasarım **REJECT** edilir. Bunlar ilham veya “sonradan temizlenebilir” ayrıntılar değildir.

### Yasak ürün dili

- SaaS dashboard, admin paneli, analytics ekranı, KPI/telemetry grid’i.
- Landing-page hero: büyük pazarlama sloganı + dekoratif görsel + aşağıda asıl aksiyon.
- Generic card grid, 2×2 KPI kutuları ve aynı boyut/radius/stroke/gradient ile çoğaltılmış panel duvarı.
- Gereğinden uzun açıklama, release/version/catalog metadata’sının hero alanını işgal etmesi.
- Generic web form: oyun hamlesinin input/select/textarea satırlarına indirgenmesi.
- Aktif oyunda ayrı ve sürekli büyük `CANLI DURUM`/live-status paneli.
- Dekoratif bir sahne veya illüstrasyonun üstte, gerçek oyun kontrollerinin aşağıda/scroll altında olması.
- Scroll-based gameplay; zamanlı veya kritik kararın sayfa scroll’una bağlı olması.

### Yasak yaş, renderer ve malzeme dili

- Preschool illustration, pastel/candy dünya, balon gibi şişkin UI, plush/squishy yüzey.
- Aşırı cute mascot veya sevimli hayvanların GLIX markasının ana taşıyıcısı olması.
- Her yerde rainbow, rastgele yüksek doygunluk, konfeti/yıldız/kalp/sticker yağmuru.
- Giant rounded pill overload; her butonun kapsül, her panelin balon olması.
- Photorealistic 3D, gerçek zamanlı 3D scene, complex WebGL scene, 3D model pipeline.
- Fake 3D clutter: gereksiz kamera eğimi, sahte render hissi veren çoklu perspektif, süs için eklenmiş volumetric/depth objeleri.
- 3D asset, renderer, WebGL, gerçek zamanlı 3D veya “dimensional environment” **oyun kuralına katkı verse bile bu hedefte yasaktır**. Aynı gameplay faydası 2D illustration, SVG, sprite veya gerektiğinde erişilebilir Canvas ile çözülür; 3D istisnası yoktur.
- 2D artwork’e gereksiz sahte extrusion, çoklu vanishing point veya 3D-render taklidi eklenmesi.

### Ölçülebilir hard reject eşikleri

- Eşit ağırlıklı kart/panel alanı ekranın `%30`’unu aşamaz; 2×2 KPI düzeni yoktur.
- Aktif gameplay viewport’unda floating HTML panel, gerekli UI chrome’un bir alt kümesidir; tüm floating HTML panel alanı ve toplam UI chrome birlikte `%20`’yi geçemez. Bunun üzerinde ayrı bir `%40` izni yoktur.
- Gameplay’de beşten fazla sürekli micro-status label, birden fazla persistent progress/metric bar veya ayrı live-status card bulunamaz.
- Bir viewport’ta üçten fazla cute-coded sinyal, iki mascot-like karakter, dört veya daha fazla mekanik dışı yıldız/konfeti/kalp/sticker varsa reject.
- Pastel/high-key alan `%10`’u aşamaz.
- Candy-gloss beyaz şerit, şeker kaplama highlight’ı veya balon parlaklığı **tasarım motifi olarak hiç izinli değildir**. İşlevsel 2D yüzey highlight’ı toplam yüzeyin `%5`’ini ve tek bir ince edge treatment’ı geçmez.
- Container’ların `%60`’ından fazlası pill/ball formunda olamaz.
- Yüksek doygunluklu dört veya daha fazla renk yalnızca gerçek mekanik anlam taşıyorsa kullanılabilir.
- Hero asset’te baked UI text, logo, gibberish glyph, checkerboard background, alpha gereken yerde opak fon veya 320 px’te okunmayan state varsa reject.
- Glow halo çekirdeğin `3×` genişliğini, görünür parçacık sayısı `12`’yi aşamaz.

### Oranların ölçüm yöntemi

Kalite değerlendirmesinde her viewport screenshot’ı önce üç mutually-exclusive pixel mask’e ayrılır: (1) oyun hero + interaction, (2) gerekli UI chrome/HUD ve (3) dekoratif background/FX. Bir pixel yalnız ilk sahip olduğu maskeye sayılır; overlap iki kez sayılmaz. Hero oranı, connected visible 2D hero/interaction bounding area’nın viewport’a oranıdır; chrome, oyuncunun kararını/okumasını sağlayan gerekli HTML/SVG alanıdır; decoration mekanik anlam taşımayan background/FX’tir. Ölçüm **320×700 portrait ve 844×390 landscape’te ayrı ayrı** yapılır; iki testten daha kötü olan sonuç kabul edilir. Bu yöntem thumbnail izlenimi yerine gerçek viewport hiyerarşisini kontrol eder.

### Visual QA sözlüğü

- **Cute-coded signal:** görünür bir karakter/obje üzerinde şu işaretlerden her biri bir adet sayılır: kafa yüksekliğinin toplam siluetin `%30`’undan büyük olması; göz/visor alanının kafa alanının `%35`’inden büyük olması; hayvan kulağı/muzırı/plush/furry yüzey; kalp veya bebeksi ağız; sürekli wink/açık ağızlı şirin gülümseme; balon/şeker formu. Aynı karakterdeki her işaret toplam cute signal’a eklenir.
- **Mascot-like character:** ekranın merkezî marka/hero odağı olan, tek başına isimlendirilen veya karakter görseli viewport pixel maskesinin `≥%12` alanını kaplayan karakterdir; cute-coded signal taşıyıp taşımamasından bağımsız marka odağı olarak sayılır. Bir roster satırındaki küçük avatar mascot-like sayılmaz.
- **Pastel/high-key area:** text ve focus highlight hariç screenshot piksel maskesinde sRGB relative luminance `Y ≥ 0.70` olan ve dolgu/chroma taşıyan yüzeydir; pastel için ayrıca HSL lightness `≥70%` ve saturation `≥15%` koşulu geçerlidir. Bu alan viewport yüzdesi olarak ölçülür.
- **Mechanical meaning:** bir pixel/asset/animation şu rollerdan en az birine bağlıysa mekaniktir: input target, timer/deadline, score/result, public player state, orientation, connection/error, private-information boundary veya oyun kuralının hero state’i. Bu bağ manifestte veya frontend state/label’ında gösterilmiyorsa dekoratif kabul edilir.
- Büyük humor accent, oyuncunun sosyal reaksiyonunu veya sonucu anlatan; kısa süreli ve mekanik state’e bağlı görsel/metin burst’üdür. Ekranda aynı anda en fazla iki tane bulunur; sürekli dekoratif punchline sayılmaz.

Bu sözlükteki sayımlar iki smoke viewport’unda aynı yöntemle yapılır. Bir oran veya threshold bu sözlükte tanımlı değilse tasarım lehine yorumlanmaz; A7/uygulama reviewer’ı ek ölçüm ister.

`Neon Toybox` adı tarihsel bir referans olarak kalabilir; ancak “toybox” kelimesi childlike/candy/plush bir üretim talimatı olarak kullanılamaz. İzin verilen toy charm yalnızca büyük fiziksel butonun tatmin edici basma hissi ve parti oyununun dokunsal enerjisidir.

## 4. Color System

Renk sistemi iki ayrı şeyi ayırır: **semantic state** ve **player identity**. Oyuncu rengi success/danger yerine geçmez.

### Semantic tokenlar

| Token | Değer | Rol |
|---|---|---|
| `glix-night` | `#070915` | Ana arka plan; düz siyah değil, çok düşük kontrastlı indigo derinliği |
| `glix-surface` | `#0E1226` | Ana 2D panel/rail yüzeyi |
| `glix-inset` | `#050816` | Oyun nesnesinin iç boşluğu ve input zemini |
| `glix-text` | `#F5F7FF` | Ana metin ve kritik sayı |
| `glix-text-secondary` | `#B8C1D9` | Açıklama ve ikincil metin |
| `glix-text-dim` | `#7F8AA8` | Yalnız yardımcı metadata; kritik talimat için değil |
| `glix-cyan` | `#72F4FF` | Etkileşim, focus, aktif mekanik, kendi hamlesi |
| `glix-magenta` | `#FF55D8` | Sosyal bağlantı, reveal, tartışma, grup enerjisi |
| `glix-violet` | `#9A7BFF` | Sistem/rare state, graph, özel görsel aile aksanı |
| `glix-amber` | `#FFC857` | Urgency, yaklaşan deadline, neutral warning |
| `glix-lime` | `#A8F46A` | Başarı, güvenli çözüm, doğru eşleşme |
| `glix-danger` | `#FF6F91` | Risk, yanlış hamle, elenme, kilit |
| `glix-border` | `rgba(207,218,255,.18)` | Pasif sınır; yüzeyin üstünde hafif çizgi |
| `glix-focus` | `#FFFFFF` + semantic halo | Keyboard/touch focus; renk tek başına kullanılmaz |

### Player identity palette

Sekiz oyuncu accent’i (örneğin cyan, magenta, amber, lime, violet, orange, emerald, cobalt) yalnız küçük avatar ring/pip, sıra marker veya player token alanında kullanılır. Aynı viewport’ta sekiz yüksek doygunluklu büyük yüzey oluşturulmaz; identity renkleri `%5` toplam emissive bütçesine yaklaşan bir rainbow dekoruna dönüşürse desaturate edilir. Her oyuncu accent’i semantic success/danger renklerinden shape/glyph ve label ile ayrılır. `SEN`, `HAZIR`, `GİRDİ GÖNDERDİ`, `ELENDİ` gibi state’ler player hue’dan bağımsızdır.

### Oran ve kullanım

- Ekranın yaklaşık `%65–75`’i night/smoked/dark graphite ailesinde kalır.
- `%15–25` structural surface/metal/violet mid-tone’dur.
- Yüksek doygunluk/emissive alan toplamda `%5–10`’u geçmez; neon küçük ama kararlı odaklar halinde kullanılır.
- Bir oyun ailesinde en fazla iki ana neon hue + bir semantic state accent kullanılır.
- `zaman-bombasi-hafizasi` dört rengi yalnızca veri taşıyan pad’lerde kullanabilir; arka plan, avatar ve dekor rainbow olamaz.
- Cyan/magenta/violet aynı anda yalnızca biri hero, biri supporting, biri çok küçük state vurgusu olacak şekilde hiyerarşilenir.
- 2D gradient’ler yüzey veya ışık yönünü anlatır; tüm arka plana gökkuşağı gradient’i atılamaz.

### Erişilebilirlikte renk

Normal HTML metni en az `4.5:1`, küçük veya yardımcı metin en az `7:1` kontrast hedefler. Oyun nesnesinin çevreye karşı kenar ayrımı en az `3:1` olmalıdır. Başarı, hata, hazır, elendi, bağlantı ve sıra durumları mutlaka metin/ikon/şekil veya pattern ile tekrarlanır.

## 5. Typography

Tipografi web sayfası kimliği kurmak için değil, hamleyi ve sosyal reaksiyonu hızlı okutmak içindir. Metin her zaman gerçek HTML veya erişilebilir SVG text’tir; raster asset içine UI metni gömülmez.

### Rol ölçeği

| Rol | Hedef boyut | Kural |
|---|---:|---|
| Display / home title | `44–88px` | Home’da en fazla iki satır; gameplay’de kullanılmaz |
| Screen title | `32–56px` | Home/lobby/form bağlamında; dar ekranda iki satır sınırı |
| Game title | `20–32px` | Hero nesnesinin yerini almaz; kısa ve tek odak |
| Section title | `16–20px` | Aynı viewport’ta sınırlı sayıda |
| Body/instruction | `14–16px` | Kritik kural için `14px` altı yok; line-height `1.45–1.65` |
| Button label | `13–15px` | Kritik action label’ı `13px` altına inmez |
| Metadata | `11–12px` | Yalnız yardımcı bilgi; kritik state burada saklanmaz |
| Timer/score | `24–40px` | Tabular numerals; renk + metin/shape ile anlam |
| Row score | `16–24px` | Sonuçta hızlı taranır |

En fazla üç font weight kullanılır: `500`, `700`, `900`. Başlıklarda line-height `0.95–1.15`; body’de `1.45–1.65`. Label/caps kullanılıyorsa letter-spacing yaklaşık `.08–.14em`, logo için en fazla `.18em` olur. Bubble, handwriting, preschool veya dekoratif script font yoktur. Sistem sans-serif veya onaylı iki aileli font stack kullanılabilir; üretim artının okunabilirlik ölçümü font adından önemlidir.

### Metin davranışı

- Oyun kuralı tek bakışta okunacak bir cümleye indirilir; uzun açıklama tutorial’da paragraf olarak tekrarlanmaz.
- `BAĞLI`, `HAZIR`, `GİRDİ GÖNDERDİ`, `BEKLİYOR`, `ELENDİ`, `KOPTU` gibi durumlar açık kelimelerle yazılır.
- Ham `playerId`, teknik socket mesajı, version numarası ve debug metni oyuncuya dönük hero/HUD metni olamaz.
- SVG içinde yazı gerekiyorsa gerçek `<text>`/erişilebilir label olmalı; resim üretim prompt’una sahte yazı emanet edilmez.

## 6. Shape Language

GLIX şekilleri mühendislik ürünü 2D arcade parçaları gibi okunur: net siluet, kontrollü chamfer/bevel, sınırlı radius, fiziksel temas noktası ve rahat dokunma alanı. Amaç 3D model çizmek değil; 2D yüzeyin ne işe yaradığını ilk bakışta anlatmaktır.

### Radius ve form hiyerarşisi

| Kullanım | Radius |
|---|---:|
| Küçük control/input | `8–12px` |
| Panel/rail | `14–18px` |
| Hero frame | `20–24px` |
| Chip/status | `999px` yalnız chip/status için |

- Aynı ekranda en fazla dört radius ailesi bulunur.
- Büyük pill CTA sayısı bir ekranda en fazla birdir; diğer ana eylem chamfered rectangle veya fiziksel switch olarak ayrışır.
- Panel köşesi 14–18px olsa bile her içerik kart içine yeni kart olarak konmaz; inset group, divider veya açık sahne alanı tercih edilir.
- Düz 2D illüstrasyonlarda bevel, inner shadow ve highlight kenarı aynı ışık yönünü izler; rastgele sahte extrusion yoktur.
- `8px` dış güvenlik marjı tüm kritik asset ve metinlerde korunur. Hero nesnesi dış kenarlara yapışmaz.
- Kontrolün görsel noktası küçük olabilir, hit-area küçük olamaz: kritik touch target en az `44×44 CSS px`, zamanlı ana aksiyon `48–56px` hedeflenir.

### UI ve oyun nesnesi ayrımı

UI control, metin ve status gerçek HTML/SVG olarak kalır. Oyun nesnesi 2D çizim/SVG/şeffaf sprite olabilir; ancak `button`, `input`, `select`, `textarea` gibi erişilebilir davranışların yerine yalnızca dekoratif bitmap konamaz. Fiziksel metafor, davranışın üstüne giydirilir; davranış gizlenmez.

## 7. Material Language

Materyal dili 2D çizim, SVG path, CSS gradient, shadow ve sprite katmanlarıyla üretilir. “Materyal” burada gerçek zamanlı shader/3D mesh değil, yüzeyin dokunsal ve işlevsel olarak nasıl okunacağını tarif eder.

| Materyal | 2D görsel cue | Guardrail |
|---|---|---|
| Dark graphite | Koyu mat dolgu, düşük kontrastlı noise/gradient, belirgin contact shadow | Ana gövdenin `%55–75`’i; pastel, parlak plastik ve düz simsiyah yok |
| Anodized metal | Keskin bevel çizgisi, tek yönlü highlight, teknik vida/seam | Bevel `4–12px`; yüz başına en fazla dört vida; dekoratif panel çizgisi yok |
| Smoked glass | Koyu transparan yüzey, ince rim, sınırlı blur | Opacity `.55–.75`, blur `8–14px`; arka plan okunamaz kadar karartılmaz |
| Holographic glass | Kısa renk kayması, maskeleme, reveal için facet/path | Opacity `.35–.70`; en fazla iki hue + beyaz; tüm arayüz hologram olmaz |
| Translucent acrylic | Üst-sol highlight ve temiz renkli levha | Opacity `.45–.80`; jelly/plush parlaklığı yok |
| Satin polymer | Yumuşak ama teknik yüzey, ince edge light | Hero’nun tamamı rubber/candy görünemez; yalnız tamamlayıcı parça |
| Illuminated button | Koyu bezel → renkli cap → emissive ring → press shadow | Candy plastic yalnız işlevsel buton/knob’da; cluster başına en fazla dört |
| Cable/wire | Ayrı şeffaf sprite/SVG path, terminal ve kesik state | Kalınlık panel yüksekliğinin `%2–4`’ü; işlev yoksa dört kablodan fazlası yok |
| Screen/label plate | Smoked inset, en fazla üç bilgi seviyesi | Gerçek UI text asset’e gömülmez; boş sahte yazı/gibberish yok |
| Particle | Küçük 2D nokta/çizgi, state’e bağlı kısa burst | Görünür parçacık `0–12`, yaklaşık `1–3px`; confetti/stars as decoration yok |

Bir hero nesnesinin önerilen 2D yüzey dağılımı yaklaşık `%40` dark metal/graphite, `%25` satin polymer, `%20` smoked glass, `%10` cable/rubber, `%5` işaretleme/kağıt olabilir. Bu oranlar üretim kontrolüdür, her asset’te mekanik olarak uygulanacak doku reçetesi değildir.

### 24 oyun / altı family acceptance matrix

| Family | Oyun ID’leri | Ana verb | 2D hero primitive | Reuse ve asset sınırı |
|---|---|---|---|---|
| Social / Holographic | `yazi-yaz`, `kendim`, `sizma`, `sozluk-blofu`, `cagrisim-agi`, `karalama-defteri`, `ittifak` | Yaz, bağla, eşleştir, oyla | Holo card, word core, node/line, mask, reveal strip | Ortak card/node/line primitive; oyun başına 1 hero + 1 reveal FX |
| Time / Control | `butona-bas`, `gizli-hirsiz`, `kor-kronometre`, `son-kisi`, `asiri-yukleme` | Bas, dur, kaç, zamanla | Button, gate, timer ring, beacon, reactor icon | Ortak timing ring/button states; oyun başına 1 hero + 1 state FX |
| Strategy / Panel | `rusvet-darbe`, `gizli-kareler`, `gizli-alisveris`, `kontrol-paneli-kaosu`, `capraz-ates` | Seç, hedefle, dağıt, kes | Illustrated panel, selector, grid, cable, token | Ortak panel/grid/token; oyun başına 1 hero + 1 icon/diagram set |
| Risk / Hazard | `rus-ruleti`, `kor-bomba`, `zehirli-kadeh` | Risk al, pasla, takas et | Sealed dial, chamber, cup, hazard plate | Red/amber hazard primitives; yeni full-frame scene yok |
| Number / Threshold | `acgozluluk-limiti`, `ortalamanin-yarisi`, `cizgiyi-gecme` | Ayarla, yaklaş, geçme | Gauge, track, threshold marker, number wheel | Ortak gauge/track; bir game-specific threshold mark |
| Memory | `zaman-bombasi-hafizasi` | Hatırla, sırayı tekrarla | Dört pad’li 2D memory board | Dört renk yalnız pad data; tek board/sprite family |

Katalog dağılımı `7 sosyal + 5 zaman + 5 strateji + 3 risk + 3 sayı + 1 hafıza = 24`’tür. Her oyun family primitive’ini tekrar kullanabilir; ancak ana verb’i ve tek hero nesnesi farklı okunmalıdır.

## 8. Lighting System

GLIX’te ışık, gerçek zamanlı ışıklandırma değil, 2D layer/gradient/SVG stroke/shadow kompozisyonudur. Işık yönü her asset’te aynı kalır; böylece farklı çizim stilleri tek arcade dünyasına ait görünür.

### Ortak ışık reçetesi

- **Key:** üst-sol/front-left; cyan veya soğuk beyaz. Üst-sol kenar hafifçe açılır, alt-sağ inner shadow ile kütle okunur.
- **Rim:** üst-sağdan düşük yoğunluklu magenta veya violet çizgi; yalnız silueti ayırır, yüzeyi neonla doldurmaz.
- **Practical:** amber; yalnız fiziksel buton, lamba, kablo terminali, hazard veya deadline göstergesinde.
- Aynı anda en fazla üç ışık ailesi: key, rim, practical/state.
- Tek hero objede en fazla iki neon hue; üçüncü renk semantic state olarak küçük kalır.
- Emissive/core alanı frame’in `%8`’ini, beyaz highlight toplamı `%5`’ini aşmaz.
- Emissive çekirdek referans olarak yaklaşık `2–6px / 1024px`; halo çekirdeğin en fazla `3×` genişliğinde olur.
- Glow, metin ve hit-area’nın arkasını silikleştiriyorsa azaltılır; bloom kalite göstergesi değildir.

### 2D katman sınırı

Her aktif gameplay kompozisyonu en fazla `5–7` bilinçli 2D katmandan oluşur: layered background, düşük yoğunluklu atmosphere, hero illustration, interaction surface, avatar/status rail, kısa state FX ve HTML/SVG HUD. Bu bir 3D depth architecture değildir; okunabilir 2D compositing sınırıdır.

Katman mantığı:

`layered background → düşük yoğunluklu atmosphere → 2D hero illustration → 2D interaction surface → avatar/status rail → kısa state particles → HTML/SVG HUD`

Hero ile interaction surface tek gameplay stage’inin içindedir. Background parallax varsa hareket `4–8%` ile sınırlıdır; foreground occlusion `%10`’u geçmez. Merkez safe zone yaklaşık viewport’un `%44` genişliği × `%36` yüksekliği oranında düşük detaylı tutulur.

## 9. Motion Language

Motion, oyuncunun hamlesini ve server sonucunu ayırır. Animasyon, web landing-page shimmer’ı veya arka planda sürekli akan cyberpunk dekoru değildir.

### State ritmi

| State | Motion dili | Ölçü |
|---|---|---|
| Idle | Neredeyse sabit; tek nefes/pulse ve çok hafif background drift | Sonsuz parlayan öğe sayısı sınırlı |
| Tutorial | Hero nesneye yumuşak işaret, kısa örnek hamle | `250–450ms` geçiş; tek örnek |
| Preparing | Ready kilidi ve oyuncu durumları netleşir | Press feedback `120–180ms` |
| Playing | Hamleye anında local response, authority sonucuna sonra group feedback | İlk feedback hedefi `≤150ms`; timer server-clock ile |
| Results | Oyun-specific reveal, score delta, kısa sosyal burst | Reveal `500–900ms`; sürekli confetti yok |
| Reconnect | Hareketli loading yerine sabit banner + küçük pulse | Input kilitli; state kaybolmuş gibi animasyon yok |
| Error/empty | İlgili nesnede repair/attention state | `role=alert`, retry veya geri dönüş görünür |

- CSS transform/opacity, SVG path/stroke, sprite frame ve sınırlı Canvas animation tercih edilir.
- Ortak viewport’ta en fazla `32` bağımsız animasyonlu node ve `12` görünür particle hedeflenir.
- `prefers-reduced-motion` açıkken pulse, parallax, shake ve particle burst durur veya tek kısa state değişimine iner; anlamlı focus/pressed/result bilgisi kalır.
- Screen shake, flash ve scale aynı anda üçten fazla kanalda uygulanmaz; epilepsi/okunabilirlik riski yaratacak hızlı strobe yoktur.
- 300ms zaman pencereli oyunlarda local animasyon server-authoritative zamanı taklit eder; client’ın görsel tick’i sonucu tek başına belirlemez.
- Canvas yalnız gerçek çizim/gesture faydası sağladığında kullanılır; dekoratif arka plan Canvas’a taşınmaz.

## 10. Home Screen Contract

Home, landing page değil, 2–8 kişilik oyuna açılan hızlı arcade portalıdır. Oyuncu “oda kur” veya “odaya katıl” kararını tek bakışta verir.

### Zorunlu kompozisyon

- GLIX wordmark gerçek SVG/HTML text olarak üstte okunur; logo markasının yanında teknik version/debug bilgisi bulunmaz.
- Bir kısa, sosyal ve eylem odaklı cümle kullanılabilir; headline en fazla iki satırdır.
- `ODA KUR` ve `ODAYA KATIL` iki net primary action’dır. Biri fiziksel/chamfered hero button, diğeri farklı shape/outline treatment ile ayrışır.
- Tek bir 2D arcade hero illustration kullanılabilir: örneğin layered kinetic core, kontrol paneli parçası veya ışıklı game object. Hero art aksiyonların üzerine veya altına saklanmaz.
- `24 MİNİ OYUN`, `V0.7`, `2–8 OYUNCU`, server telemetry ve protokol metni hero odağını işgal etmez; gerekiyorsa sessiz secondary line’a taşınır.
- Dekoratif artwork viewport’un yaklaşık `%35`’inden fazlasını kaplamaz; iki CTA 320×700’de ilk viewport’ta ve safe-area içinde tamamen görünür.
- Home’da oyun kataloğu, analytics grid’i, çoklu feature card veya “neden GLIX?” landing-page bölümleri yoktur.
- Yardım/“nasıl oynanır” varsa tek kısa link veya bottom sheet olarak ikincil kalır; kullanıcı oyuna girmek için scroll yapmaz.

### Responsive kabul

Portrait’te logo → kısa premise → iki CTA → küçük scene accent sırası; landscape’te logo/CTA ve hero aynı yatay composition içinde kalabilir. 320×700’de her CTA bounding box’ı `≥44×44px`, safe-area ile birlikte viewport içinde tamamen görünür ve `scrollY` gerektirmez. 844×390’de CTA’lar ilk ekranda görünür. Browser chrome açılıp kapanırken aksiyonların yeri zıplamaz.

## 11. Lobby Contract

Lobby, oda kodu ve arkadaşların hazır olma ritmini gösteren sosyal staging alanıdır. Yönetim paneli gibi değil; oyuna geçmeden önceki kısa arcade muster’dır.

### Zorunlu bilgi hiyerarşisi

1. Oda kodu ve kopyalama aksiyonu.
2. 2–8 oyuncunun küçük 2D avatar/identity strip’i; host, self, ready, waiting, connected, disconnected ayrımı.
3. Seçilen rota veya rastgele rota özeti.
4. Host’un başlatma aksiyonu ve neden disabled olduğuna dair tek açık mesaj.

- Oyuncu listesi bir roster rail/strip veya iki satırlı 4×2 arrangement olabilir; ayrı “live status” dashboard kartı değildir.
- Oyun seçimi 24 satırlık düz metin duvarı veya generic card grid olarak kalmaz. Altı family rail’i (social, time, strategy, risk, number, memory) ve compact selectable rows/route summary kullanılır.
- Oyuncu sayısına uygun oyunlar öne çıkar; uygun olmayan oyunlar görünür ama daraltılmış/disabled reason ile ikincil kalır. Host başlatma özeti sürekli erişilebilir olur.
- Oyun seçimi uzun olduğunda yalnız route selector kendi içinde scroll edebilir; gameplay scroll edilemez. Start action listenin sonunda kaybolamaz; safe-area içinde sabit/kolay erişilir.
- Room code, copy feedback ve host/guest durumu `≥44×44px` target’larla sunulur.
- “Bağlı” ve “hazır” farklı semantik state’lerdir. Her biri text + icon/shape ile açıklanır; yalnız yeşil/amber renk kullanılmaz.
- `2–8 OYUNCU`, protokol footer’ı ve teknik bağlantı ayrıntısı ancak room code/roster’dan sonra küçük yardımcı bilgi olabilir.
- Lobby portrait-first’tir. Landscape 844×390’de `max-width` yüzünden dikey tek kolon ve binlerce px scroll oluşmaz; roster + route + start aynı yatay staging içinde okunur. Önerilen minimum bölüşüm: roster/room `%25`, route selector `%50`, start summary/action `%25` viewport yüksekliği; gerçek metin taşarsa yalnız route paneli iç-scroll olur.

## 12. Gameplay Contract

Bu sözleşmenin merkezi kuralı şudur:

- **Active game viewport dominates.**
- **Active game stage is the main surface.**
- **HUD is an overlay; stage’i aşağı itmez.**
- **No generic page layout.**
- **No separate persistent live-status card.**
- **Tutorial ve result, aynı 2D stage’in üzerinde geçici overlay’dir.**
- **Game-specific main object ve interaction surface 2D’dir.**
- **Dekoratif scene actual gameplay controls’un üstünde veya ayrı bir “güzel kart” olarak yaşayamaz.**

### Tek viewport oyun düzeni

Aktif gameplay root’u `100dvh`, güvenli fallback olarak `100svh` mantığıyla çalışır. Body/document scroll canlı oyunda yoktur; gerekiyorsa yalnız oyun nesnesinin içindeki seçilebilir liste `overscroll-behavior: contain` ile sınırlanır. Oyuncu 320×700’de ana hamleyi, 844×390’de landscape ana hamleyi orientation gate sonrasında ilk viewport’ta görür.

Stage hiyerarşisi ölçüm maskesine göre hero + interaction yüzeyi **en az `%65`** olmalıdır; UI chrome `%20`’yi geçmez; dekoratif particle/atmosphere `%10`’u geçmez. Bu eşikler §3’teki pixel mask yöntemiyle 320×700 ve 844×390’de ayrı test edilir. Oyun başlığı, kısa goal ve timer bu alanı açıklamak için kenar overlay’inde kalır.

### Interaction surface standardı

Her oyun için:

- Bir ana verb ve bir başrol nesnesi seçilir.
- Bir primary action veya tek bir ana seçim grubu görünür; secondary selector sayısı gerekmedikçe ikiyi geçmez.
- HTML input/select/textarea/canvas davranışı korunabilir; fakat görsel yüzey kart destesi, daktilo, gauge, pad, kablo paneli, ışıklı kadeh veya başka bir oyun metaforudur.
- Ana kontrol scene altında değil, scene ile aynı composition’da veya scene üzerine bindirilmiş görünür.
- Private/secret bilgi public avatar, renk, animation, aria-label, placeholder veya result preview ile sızdırılamaz.

Ortak dış faz ritmi korunur: `tutorial 10 sn → preparing 5 sn/ready barrier → playing → results 6 sn → transition 3 sn`. Bu görsel contract oyun kuralını, server deadline’ını veya scoring’i değiştirmez.

## 13. Shared Game HUD

HUD 2D overlay rail’idir; ayrı bir dashboard paneli değildir ve sahnenin layout yüksekliğini tüketmez.

### Bölge sözleşmesi

- **Üst-sol:** oyun adı kısa hali, faz/round/goal; bir veya iki satır.
- **Üst-sağ:** server-clock timer, bağlantı durumu ve gerekirse tek state chip.
- **Alt veya kenar rail:** self status, turn owner, 2–8 oyuncu compact avatar pips/identity tokens.
- **Tek progress göstergesi:** gerekiyorsa `3–4px`; aynı anda birden fazla bar yok.
- **Feedback:** ana nesnenin yakınında; global toast yalnız kritik bağlantı/hata için ve tekrarsız.

HUD inset’i portrait’te `12–16px`, landscape’te safe-area ile birlikte `16–24px` olabilir. Back/leave/copy/ready gibi tüm kritik hedefler `≥44×44px`; hızlı ana action `48–56px` olur. HUD metinleri `11–16px` rol ölçeğine uyar; teknik raw ID göstermez.

Sekiz oyuncu için 4×2 compact strip, çevresel node ring, turn rail veya oyun nesnesine bağlı token kullanılabilir. Her oyuncunun kısa adı ve public state’i renk dışı okunmalıdır. Oyun HUD’ı oyuncu listesini büyük side card’a çevirmemeli; `BAĞLI`, `HAZIR`, `GİRDİ GÖNDERDİ`, `BEKLİYOR`, `ELENDİ`, `KOPTU` gibi durumlar gerektiği kadar kısa gösterilir.

## 14. Tutorial Overlay

Tutorial, status dashboard değil, oyuncuya fiziksel 2D hamleyi gösteren kısa bir overlay’dir. Ortak tutorial fazı `10 sn` olduğundan ilk bakışta okunur ve scroll gerektirmez.

- Overlay aynı gameplay stage’in üstündedir; background/hero tamamen kaybolmaz.
- Bir cümlelik `AMAÇ`, bir cümlelik `HAMLE`, gerekirse bir cümlelik `RİSK` kullanılır.
- En fazla üç kısa step; idealde tek hero nesnesi üzerinde tek animated example.
- “Hazırım” tek primary action’dır; ready sonrası kilit state’i metin ve şekille görünür.
- Üç generic explanatory card (“kuralı görsel olarak öğren / hazır ol / hamle yap”) her oyunda tekrarlanmaz; oyun-specific affordance anlatılır.
- Text body en az `14px`, step touch target `≥44px`, overlay background yaklaşık `.72–.84` karartma ile scene’in okunabilir bir parçasını bırakır.
- Tutorial overlay orientation gate’ten sonra açılır. Landscape-only oyunda rotate mesajı tutorial timer’ını başlatmadan önce görünür.
- Tutorial’da private role/word/target bilgisi yalnız sahibine gösterilir; grup tutorial’ı secret state’i açığa vurmaz.

Örnek tutorial dili: `AMAÇ — aynı pencereye denk gel.` / `HAMLE — 0,3 saniyelik aralıkta BAS.` / `RİSK — yalnız basarsan puan kaybedersin.` Kural açıklaması her oyunda gerçek adapter davranışına göre değişir; bu metin yalnız örnektir.

## 15. Result Overlay

Result, aynı oyunun çözülmüş görsel anıdır; yeni bir dashboard sayfası değildir. Ortak result fazı `6 sn` içinde oyuncuya ne olduğunu, ne kazandığını/kaybettiğini ve sonraki adımı gösterir.

- Oyun-specific tek reveal beat’i: mühür açılması, kablo state’i, node bağlanması, gauge çizgisi veya pad sequence.
- Reveal’dan hemen sonra kişisel sonuç, score delta ve gerekiyorsa rank kısa scoreboard olarak görünür.
- Bir ekranın ana sonucu bir generic callout + ayrı live panel + ayrı final card olarak üçe bölünmez.
- Başarı/yanlış/elimination lime/red ile birlikte `DOĞRU`, `YANLIŞ`, `ELENDİN`, `BEKLE` gibi metin veya ikonla gösterilir.
- Sonuç sıralaması 2–8 oyuncuyu kompakt satırlarla destekler; satır yüksekliği yaklaşık `44–56px`, score `16–24px` olur.
- Oyuncunun adı ve kendi sıra/score’u öne çıkar; teknik ID kullanılmaz.
- Kutlama kısa ve oyun-specific’tir. Varsayılan sürekli konfeti, yıldız yağmuru, büyük mascot dansı yoktur.
- `transition` fazında sonraki oyun adı ve gerekiyorsa orientation önceden duyurulur; boş ara ekran yoktur.
- Match result/finished state, tek bir sahne üstü scoreboard veya sade bottom sheet olarak kalır. Host için “Lobiye dön”, diğerleri için bekleme durumu açıkça ayrılır.

## 16. Player Avatar System

Avatar sistemi 2D sprite/SVG veya CSS/SVG silhouette katmanıdır. Oyuncuları sosyal olarak ayırır; bir mascot show’u kurmaz.

- Sekiz slotun her biri silhouette + accessory + pose veya visor/ikon farkıyla ayırt edilir.
- En az `5/8` karakter human/arcade-crew okumasında, en fazla `2/8` cute-coded non-human olabilir.
- Kafa toplam siluetin yaklaşık `%30`’undan, visor/eye alanı kafa alanının `%35`’inden büyük olmaz; neon yüzey karakterin `%20`’sini geçmez.
- Sürekli wink, kalp, bebek ağzı, peace pose, plush/furry dependency ve merkezi mascot yoktur.
- Avatar accent renkleri player identity içindir; lime success, red danger, amber urgency yerine kullanılamaz.
- Passive avatar `32–40px`, interactive/focusable avatar `40–48px`; hit-area görselden büyük olabilir.
- Self için outline/focus; active turn için kısa halo; spectator/eliminated için opacity `0.4–0.55` ve açık metin.
- Avatar state yalnız renk değil; `SEN`, `HAZIR`, `GÖNDERDİ`, `ELENDİ`, `KOPTU`, `İZLİYOR` label/icon ile aktarılır.
- 8 oyuncu portrait’te iki satırlı compact strip veya oyun nesnesi çevresinde pips; landscape’te yatay rail olabilir. Strip, sürekli skor tablosu değildir.
- Mevcut checkerboard roster PNG’si production alpha asset olarak kabul edilmez; referans niteliğindedir. Yeni üretimde gerçek transparent PNG/WebP/SVG kullanılmalıdır.

## 17. Portrait vs Landscape

GLIX global manifest’te `orientation: any` olabilir; ancak oyun runtime contract’ı katalogdaki gerçek ihtiyaca göre `portrait`, `landscape` veya `any` davranışı tanımlar. Boolean etiketi tek başına yeterli değildir.

### Oyun yönleri

**Portrait-safe 21 oyun:**

`yazi-yaz`, `kendim`, `sizma`, `sozluk-blofu`, `cagrisim-agi`, `butona-bas`, `gizli-hirsiz`, `kor-kronometre`, `rusvet-darbe`, `acgozluluk-limiti`, `ortalamanin-yarisi`, `gizli-kareler`, `karalama-defteri`, `ittifak`, `son-kisi`, `cizgiyi-gecme`, `gizli-alisveris`, `asiri-yukleme`, `zehirli-kadeh`, `capraz-ates`, `zaman-bombasi-hafizasi`.

**Landscape-only 3 oyun:**

`rus-ruleti`, `kor-bomba`, `kontrol-paneli-kaosu`.

### Uygulanabilir cihaz kuralları

- Home, create/join ve lobby portrait-first’tir; landscape’te de 844×390 kompozisyonu tek uzun mobil kolona dönüşmez.
- Landscape-only oyun portrait cihazda sıkıştırılmaz. Tutorial’dan önce tam ekran `Telefonu yatay çevir` rotate overlay görünür; orientation değişince mevcut server state/timer korunur.
- Portrait-safe oyun landscape’te boş/yanlış oranlı web card’a dönüşmez; merkez 2D interaction yüzeyi korunur.
- Gameplay root `100dvh`, fallback `100svh`; safe-area için üst/alt/yan inset’e `8–16px` nefes alanı bırakılır.
- 320×700 portrait ve 844×390 landscape zorunlu smoke viewport’larıdır. Orientation + height breakpoint’i, yalnız width `860px` gibi hatalı bir mobile-stack kuralından önce gelir.
- Canlı gameplay’te document scroll yoktur. Uzun lobby route listesi varsa scroll yalnız kendi alanında kalır; ana action sticky/erişilebilir olur.
- Text input fontu `16px` altına inmez. Keyboard açılınca input, karakter sayacı ve submit action visual viewport içinde birlikte kalır; autofocus başlık/geri kontrolünü viewport dışına itmez.
- Canvas gesture yüzeyinde `touch-action: none`, diğer butonlarda `manipulation`; istemsiz page scroll/zoom oyunun state’ini bozamaz.
- iPhone notch/home indicator ve landscape yan safe-area’ları kontrol, rotate overlay ve sabit bottom action tarafından hesaba katılır.

## 18. Asset Rules

### Üretim önceliği

1. SVG (logo, ikon, graph, line, scalable flat object).
2. Transparent PNG/WebP (2D hero cutout, sprite, state layer).
3. Layered 2D background (shared, low-detail, mobile-optimized).
4. Sprite sheet (avatar pose, state frame, button/reveal sequence).
5. Procedural CSS/SVG (glow, shadow, rim, gauge, particles, simple geometry).
6. Canvas yalnız açık gameplay faydası varsa.

3D model, photorealistic render, WebGL scene veya 3D asset pipeline üretim planına yazılmaz.

### Çözünürlük, format ve bütçe

| Asset | Master/limit | Hedef ve kullanım |
|---|---|---|
| Logo/flat icon/graph | SVG viewBox; raster fallback `256–512px` | UI text/path ayrı; dosya küçük ve keskin |
| Shared landscape background | `16:9`, uzun kenar en fazla `2048px` | Tercih edilen `1536×864`/`2048×1152`; hedef ≤`1.5MB` |
| Optional portrait background | `9:16`, uzun kenar en fazla `2048px` | Yalnız crop güvenli değilse; hedef ≤`600KB` mobile variant |
| Game hero module | Şeffaf, uzun kenar en fazla `1536px` | Hedef ≤`900KB`; bir oyun için bir hero module |
| Avatar atlas | `2048×1024` üst sınır veya `8×256px` hücre | Hedef ≤`350KB`; gerçek alpha |
| Sprite state atlas | `1024px` uzun kenar tercihen | Frame sayısı mekanik kadar; gereksiz 4K yok |
| Small icon/particle | SVG veya `256px` raster | CSS/SVG tercih; hero texture içine gömülmez |

PNG/WebP alpha gereken yerde gerçek transparent olmalıdır; checkerboard görseli transparency değildir. JPEG/opaque WebP yalnız full-bleed background gerçekten opak ve ayrıştırma gerektirmiyorsa kullanılabilir.

### Aggregate mobile-memory bütçesi

- İlk interactive route’un sıkıştırılmış asset transferi toplam **`≤3.0MB`** olmalıdır: shared background `≤1.5MB`, seçili hero `≤900KB`, common SVG/CSS/icon payload `≤600KB`.
- Bir oyun seçildikten sonra shell üzerine gelen ek sıkıştırılmış asset yükü **`≤1.5MB`** olmalıdır. 24 oyunun hero’ları ilk yüklemede resident/eager olamaz.
- Aktif gameplay’de decoded raster budget hedefi **`≤32MB`**; aynı anda en fazla bir shared background, bir selected hero, bir avatar atlas ve küçük state sprite’ları resident tutulur.
- Bir common icon SVG’si `≤30KB`, common icon seti `≤100KB`, küçük state sprite seti `≤150KB` hedefini aşarsa asset split veya CSS/SVG alternatifi istenir.
- Browser decoded-memory ölçümü mümkün değilse dimensions × channel count proxy’si raporlanır; byte budget, alpha ve crop evidence yine zorunludur.

### İsimlendirme ve safe crop

Dosya standardı:

`glix_{surface}_{family}_{role}_{variant}_vNN.{svg|png|webp}`

Örnekler: `glix_game_strategy_kpk-console_chassis_v01.webp`, `glix_avatar_crew_roster_idle_v01.webp`, `glix_hud_common_timer_ring_v01.svg`.

- Kritik bilgi, yazı, logo ve silhouette dış kenardan en az `%8` içeride kalır.
- Merkez safe zone yaklaşık `%44` genişlik × `%36` yüksekliğinde düşük detaylı bırakılır.
- 16:9 ve 9:16 crop testinde kritik hero, cable terminali, avatar yüzü ve state icon’u kesilmez.
- Asset text-free, background-separated, yeniden katmanlanabilir ve başka bir game family’de kullanılabilir olmalıdır.
- Tek bir full-frame raster hem backdrop hem hero hem interaction control olarak üç işi birden yapmaz.
- Bir oyun başına üst sınır: `1 hero module + 1 state FX set + 1 icon/diagram set`; yeni full-frame game background sayısı `0`.

### Zorunlu asset manifest kanıt alanları

Her yeni asset için production manifest satırı şu alanları içerir:

`id`, `path`, `role`, `layer`, `themeFamily`, `compositionPreset`, `dimensions`, `format`, `byteBudget`, `alphaRequired`, `safeArea`, `textFree`, `cropTest`, `critical`, `loading`, `maxTextureEdge`, `fallback`.

`cropTest` 16:9 ve 9:16 sonucunu; `textFree` baked UI text/logo/gibberish kontrolünü; `alphaRequired` gerçek alpha doğrulamasını; `byteBudget` sıkıştırılmış dağıtım boyutunu gösterir. Bu alanlardan biri eksik veya “unknown” ise asset production-ready sayılmaz.

### Tutarlılık ve yükleme

- Tüm 2D çizimler aynı key/rim yönünü, stroke disiplinini, dark surface oranını ve safe crop ölçüsünü izler.
- Metin, gerçek logo ve UI glyph’i raster içine gömülmez; istisna yalnızca özel olarak onaylanmış marka mark’ıdır ve yine HTML/SVG karşılığı bulunur.
- İlk shell yalnız shared low-detail background, gerekli SVG primitive’ler ve seçili oyunun küçük giriş asset’lerini yükler.
- 24 oyunun tüm hero asset’leri eager yüklenmez. Seçili oyunun hero’su tutorial öncesi preload edilir; diğerleri lazy kalır.
- Manifestte `compositionPreset` 2D yerleşim/crop referansıdır; 3D `cameraPreset` veya renderer ayarı değildir.
- **Loading invariant:** `critical:true` yalnız ilk interactive paint/tutorial için zorunlu asset’e verilir; `critical:false` olan her asset **MUST** `loading:lazy` olur. `critical:false + loading:eager` kombinasyonu geçersizdir ve asset manifest QA’sında reject edilir. `critical:true + loading:eager` shared background ve seçili ilk hero için kullanılabilir; 24 hero’nun tamamına verilemez.
- Mevcut runtime manifestte gözlenen `critical:false + loading:eager` satırları bu baseline’ın **bilinen implementation failure’ı**dır; bu belge bunu onaylamaz veya düzeltilmiş gibi göstermez. Stage 11.3 asset entegrasyonunda invariant’a göre düzeltilmesi gerekir.

### İki bağlayıcı örnek

**Kontrol Paneli Kaosu:** gerçek 3D console değil; yüksek kaliteli 2D illustrated console chassis, ayrı transparent cable sprites, lit button states, shadow/depth treatment, animated glow ve press/cut feedback. Kablo kesme hit-area’sı HTML/SVG davranışla erişilebilir kalır.

**Çağrışım Ağı:** 3D word core değil; animated 2D word core, SVG node graph, glowing connection lines, layered particles ve entegre 2D input surface. Kelime metni gerçek HTML/SVG text olarak çizilir; sahte raster yazı yoktur.

## 19. Accessibility

Erişilebilirlik GLIX’in Premium 2D görünümünden ayrı bir son kontrol değil, görsel sistemin kabul ölçüsüdür.

- Normal text kontrastı `≥4.5:1`, küçük/yardımcı text `≥7:1`; glow kontrastı düşürüyorsa smoked inset veya text shadow ayarlanır.
- Kritik tüm buton, back, leave, copy, ready, chip, renk pad’i, slider wrapper ve avatar target’ları en az `44×44 CSS px`; ana zamanlı action `48–56px`.
- State hiçbir zaman yalnız renk ile ifade edilmez. Text + icon/shape/pattern ve gerektiğinde motion/haptic/sound eşlik eder; sound/haptic zorunlu bilgi kanalı değildir.
- Keyboard navigation, visible focus (`2px` outline + `2–3px` offset), logical tab order, Escape ile overlay kapatma ve focus restore sağlanır.
- HTML input/select/textarea gerçek label, `aria-describedby`, hata için `aria-invalid` ve `role=alert`/`status` kullanır. Form hatası aynı anda hem inline hem duplicate global toast olarak gösterilmez.
- Canvas çizimi pointer/touch yanında erişilebilir bir alternatif state sunar; renk seçimi yalnız küçük noktaya bağlı değildir. Araç wrapper’ı `≥44px`.
- Timer sayısal ve text olarak okunur; renk, blink veya yalnız progress bar’a güvenilmez. Deadline yaklaşması reduced-motion’da da anlaşılır.
- Secret/private bilgi erişilebilir label veya public animation ile yanlış oyuncuya sızmaz; spectator/eliminated kullanıcıya input/ready action aktif görünmez.
- Reconnect, stale, retry, input locked ve resume failed durumları match/lobby’de kalıcı kompakt banner ile gösterilir. Input kilidi görsel ve semantic olarak açıklanır.
- Orientation overlay safe-area içinde `≥44px` action ile açılır; “Telefonu yatay çevir” metni renk/ikonla desteklenir.
- Metin minimum `14px` body, input minimum `16px`; kullanıcı zoom’u ve işletim sistemi text scaling’i kırılmamalıdır.
- `prefers-reduced-motion` ile parallax, pulse, shake, glow flicker ve particle burst durur; oyun state’i ve focus görünür kalır.
- Touch gesture page scroll/zoom ile karışmaz; çizim ve hızlı tap input’u accidental scroll üretmez.
- `BAĞLI`, `HAZIR`, `GİRDİ GÖNDERDİ`, `ELENDİ`, `KOPTU`, `İZLİYOR` anlamları kısa isim ve ikonla tüm sekiz oyuncu için okunabilir.

## 20. Quality Bar

“Güzel”, “premium” veya “neon” tek başına kabul ölçüsü değildir. Bir ekran aşağıdaki hard gate’leri geçmeden production-ready visual direction sayılmaz.

| Gate | PASS ölçütü | REJECT örneği |
|---|---|---|
| 3-second read | 20% thumbnail’da iki değerlendiriciden en az ikisi “mobil arcade party game” der; ana verb ve hero nesnesi seçilir | İlk algı website/dashboard/çocuk uygulaması |
| Game-first hierarchy | §3 maskesine göre hero + interaction `≥%65`, chrome `≤%20`, decorative effects `≤%10` | Görsel scene büyük, gerçek control aşağıda |
| Mobile 320×700 | Home CTA’ları ve gameplay primary action ilk viewport’ta; body scroll yok | CTA/action fold altında, klavye context’i kaybediyor |
| Mobile 844×390 | Landscape-only stage yatay kullanılabilir; touch targets `≥44px`; tek uzun mobile stack yok | Exit 11px, sahne/aksiyon aşağı kayıyor |
| Orientation | Üç landscape oyun tutorial’dan önce rotate gate gösteriyor; state/timer korunuyor | Portrait’te sıkıştırılmış landscape oyunu |
| Material discipline | Graphite/smoked base, tekil 2D highlight, max iki neon hue, alpha modüler asset | Candy gloss, random rainbow, fake 3D clutter |
| Typography | Body `≥14px`, kritik button label `≥13px`, metadata `11–12px`, normal contrast `≥4.5:1`, gerçek HTML/SVG text | Baked yazı, micro-label wall, düşük kontrast |
| Interaction | Ana action `≥44px`, timed action `48–56px`, press/resolve feedback `≤150ms` hedefi, server sonucu ayrışıyor | Scroll, küçük hit target, client sonucu uyduruyor |
| 8 players | Self ve public state’ler 2–8 oyuncuda compact ve isimle okunur | Büyük side dashboard veya yalnız renkli pips |
| 24-game scaling | Tek shared background + 6 family + oyun başına sınırlı hero/state/icon; 24 ayrı scene yok | Her oyun için yeni full-frame render/renderer |
| Asset hygiene | SVG/alpha/layered 2D; text-free; safe crop; byte/alpha/crop raporu ve loading kuralı geçer | Checkerboard, opak plate, eager 24 asset |
| Accessibility | Keyboard/focus, reduced motion, non-color state, labels, retry/error ve orientation davranışı test edilir | Renk veya animasyon olmadan state okunmuyor |
| Evidence | Gerçek 320×700 ve 844×390 screenshot, contrast ölçümü, touch-target bounding-box, alpha/byte raporu, reduced-motion sonucu eklenir | Yalnız moodboard veya “güzel görünüyor” yorumu |
| Runtime boundary | Stage 11.2 yalnız belge değiştirir; runtime redesign Stage 11.3’e bırakılır | App.tsx/CSS/GameViewport/asset integration bu aşamada yapılır |

Visual review en az şu örneklerle yapılır: Home, create/join, lobby, tutorial, active gameplay, result/match result, disconnected/reconnect, error/empty. Her örnek portrait ve uygun olduğu yerde landscape smoke viewport’ında incelenir. Oran ölçümü ve screenshot evidence hem normal motion hem `prefers-reduced-motion` durumunda kayıt altına alınır.

### Normative reading

`MUST`, `REJECT` ve `≤/≥` ifadeleri hard gate’tir. `SHOULD` tercih edilen default’tur; ancak hard gate’i gevşetmez. `MAY` yalnız bu belgede açıkça izin verilen case’tir ve evidence register’da gerekçe ister. `target`, `approximately`, `gerekirse` veya “tercih edilen” ifadeleri art direction referansıdır; bir hard gate’i geçmek için ölçü yerine kullanılamaz. Her implementation review kaydında viewport, mask yüzdeleri, CTA/hit-box bounding box’ları, contrast, motion mode ve asset kanıtı bulunur.

## 21. Before/After Diagnosis

Bu tablo mevcut `main` gözlemlerini (before) ve bu belgenin zorunlu hedefini (after) ayırır. After satırları bu aşamada uygulanmış runtime değişikliği iddiası değildir.

| Alan | Before — mevcut gözlem | After — kabul edilen 2D Arcade yönü |
|---|---|---|
| Home | Büyük headline, ayrı `home-visual` core/orbit kompozisyonu, `24 MİNİ OYUN`/version/metadata; landing-page ritmi | Kısa sosyal premise, iki CTA’nın ilk viewport’ta olduğu playable portal, tek sınırlı 2D hero accent; metadata ikincil |
| Create/join | Tanıtım kolonu + glass form card + numaralı adım + status; onboarding/auth hissi | Kısa room-entry dock; oda kodu/nickname gerçek input olarak erişilebilir, görsel yüzey arcade entry paneli; tek inline hata |
| Lobby | Oyuncu kartı + mini oyun yönetim kartı + mode switch + 24 satırlık uzun liste + footer; dashboard/scroll | Oda kodu + 8-slot roster strip + family route rail + görünür start summary; yalnız selector scroll’u, oyun scroll’u yok |
| Gameplay | `match-stage-card → NeonToyboxScene → Stage6/7/8/9 control card` ve ayrı `CANLI DURUM` side card; action aşağı itilebilir | Tek 100dvh 2D stage; hero object ve interaction aynı surface; HUD overlay, compact status rail; ayrı persistent live-status card yok |
| Tutorial | Sahne + phase chip + progress + uzun title/description + her oyunda aynı üç kutu | Scene üzerinde tek rule + tek oyun-specific animated example + tek Hazırım action; max üç kısa step |
| Active controls | Stage 8 text/select/textarea form hissi; Stage 7 shop iç scroll; fiziksel metaphors ayrı card’da | HTML behavior korunurken 2D card deck, gauge, node, cable, pad, cup, canvas veya button surface ile tek odaklı interaction |
| Result | Generic callout + oyun sonucu + canlı oyuncu paneli + final score card; telemetry hissi | Aynı scene üzerinde tek game-specific reveal + compact score delta/rank; next step görünür |
| Reconnect/error | Match’te görünür connection banner eksik; hata içerikten sonra veya duplicate toast olarak çıkabiliyor | Kalıcı kompakt connection/retry banner, input lock, `role=alert`, ilgili control yanında tek hata; draft/state korunur |
| Avatar | Scene’de prosedürel karakter gücü var, roster/lobby/result bağları zayıf; checkerboard raster referans | 2D SVG/alpha sprite crew; silhouette/accessory/pose; names + text state; mascot/cute dependency yok |
| Scene/art | Legacy `NeonToyboxScene`, sınırlı game prop ve generic reactor fallback; opak full-frame PNG riski | 2D illustrated shared background + reusable family primitive + transparent hero/state layers; no 3D renderer, no decorative scene-above-controls |
| Material/tokens | CSS’te duplicate root/literal, çok sayıda font size/radius, wrapper tekrarları | Semantic color/type/spacing/radius/motion/material contract; uygulama sonraki stage’de common primitive ile yapılır |
| Asset loading | Mevcut prop’larda full-frame/opaque, roster checkerboard, yaklaşık MB seviyesinde ağır rasterlar ve `critical:false` + `eager` çelişkisi | SVG/transparent PNG/WebP/sprites; selected hero preload, others lazy; safe crop/alpha/byte budget/crop evidence doğrulanır |
| Orientation/mobile | 21/3 catalog bilgisi mevcut, fakat rotate overlay/fullscreen gameplay contract yok; 320×700 ve 844×390’de scroll/breakpoint sorunları | `portrait/landscape/any` davranışı, pre-tutorial rotate gate, 100dvh stage, safe-area, keyboard ve `≥44px` target standardı |
| Source of truth | Eski dokümanlarda 2.5D/WebGL ve bazı yan kataloglarda farklı oyun sayısı bulunabiliyor | Bu Bible Premium 2D Arcade görsel otoritesidir; 24 ID için `GAME_CATALOG`, runtime gerçeği için adapter/state kaynakları kullanılır |

Korunması gereken güçlü temeller: mevcut cyan/magenta/amber/lime/red semantic palette, procedural/SVG’ye uygun avatar fikri, Stage 6 büyük button, Stage 8 canvas, Stage 9 risk orb/escape hissi, layered 2D compositing fikri, reduced-motion ve server-authoritative phase/state.

## 22. Acceptance Checklist

Bu checklist’te `[x]`, Stage 11.2 belgesinde kuralın ve ilgili audit/evidence kaydının tamamlandığını; `[ ]`, runtime/asset implementation kanıtının bu aşamada bilerek bekletildiğini belirtir. `[ ]` olan implementation maddeleri bu belgeyi eksik yapmaz; Stage 11.3 gate’idir.

### Direction ve kapsam

- [x] Belge başlığı, hedef ve tüm ana tanımlar **Premium 2D Arcade / Neon Social Arcade** olarak kilitli.
- [x] Young-adult, playful but not childish, bold, social, energetic ve game-first ton açıkça yazılı; 16+ fakat gore/sexualized değil.
- [x] WebGL, gerçek zamanlı 3D scene, 3D model/pipeline ve fake 3D clutter ana hedef olmaktan çıkarılmış.
- [x] 2D gameplay, 2D HUD, 2D interaction surfaces, 2D main objects ve 2D avatars zorunlu.
- [x] UI text’in gerçek HTML/SVG text olduğu, raster asset’e UI text gömülmediği yazılı.
- [x] SaaS/dashboard, landing-page, generic card grid/form, preschool, candy, excessive mascot, rainbow, scroll gameplay ve decorative-scene-above-controls anti-goal’ları ölçülebilir eşiklerle yazılı.
- [x] Oran ölçümünün viewport pixel-mask yöntemiyle 320×700 ve 844×390’de yapılacağı yazılı.

### Zorunlu 22 bölüm

- [x] 1 Brand Statement
- [x] 2 Five Core Principles
- [x] 3 Anti-Goals
- [x] 4 Color System
- [x] 5 Typography
- [x] 6 Shape Language
- [x] 7 Material Language
- [x] 8 Lighting System
- [x] 9 Motion Language
- [x] 10 Home Screen Contract
- [x] 11 Lobby Contract
- [x] 12 Gameplay Contract
- [x] 13 Shared Game HUD
- [x] 14 Tutorial Overlay
- [x] 15 Result Overlay
- [x] 16 Player Avatar System
- [x] 17 Portrait vs Landscape
- [x] 18 Asset Rules
- [x] 19 Accessibility
- [x] 20 Quality Bar
- [x] 21 Before/After Diagnosis
- [x] 22 Acceptance Checklist

### Screen ve oyun davranışı

- [ ] Home, create/join, lobby, tutorial, active gameplay, result/match result, reconnect/disconnected ve error/empty için uygulanabilir görsel kurallar var.
- [ ] Gameplay active stage’in ana surface olduğu, HUD’ın overlay olduğu ve persistent separate live-status card bulunmadığı net.
- [ ] Her oyunun tek hero object + tek ana verb + görünür interaction surface standardı var.
- [ ] Tutorial `10 sn`, preparing `5 sn`, results `6 sn`, transition `3 sn` ortak dış fazlarıyla uyumlu.
- [ ] Result aynı stage üzerinde reveal + score delta + next step olarak tanımlı.
- [ ] 24 oyun altı family’e dağıtılmış: `7 sosyal / 5 zaman / 5 strateji / 3 risk / 3 sayı / 1 hafıza`.
- [ ] `rus-ruleti`, `kor-bomba`, `kontrol-paneli-kaosu` landscape-only; diğer 21 oyun portrait-safe olarak kayıtlı.

### Mobile, avatar ve erişilebilirlik

- [ ] 320×700 ve 844×390 smoke viewport’ları, `100dvh/100svh`, safe-area ve no-document-scroll kuralları yazılı.
- [ ] Orientation gate tutorial’dan önce; orientation değişiminde server state/timer korunuyor.
- [ ] Kritik hit-area’lar `≥44px`, timed primary action `48–56px`; kritik button label `≥13px`, metadata dışında daha küçük text yok.
- [ ] 8 oyuncu name + public state’i color-independent compact avatar/status rail ile okunuyor.
- [ ] Focus, keyboard, screen-reader labels, `role=alert/status`, non-color state ve reduced-motion contract’ı yazılı.
- [ ] Private/secret info avatar, color, motion, placeholder, aria veya result preview ile sızdırılmıyor.

### Asset ve üretim

- [ ] Asset önceliği SVG → transparent PNG/WebP → layered 2D background → sprites → procedural CSS/SVG → gerekli Canvas olarak yazılı.
- [ ] Resolution, alpha, naming, safe crop, text-free, background separation, reuse ve mobile memory budget kuralları var.
- [ ] Shared background, hero module, avatar atlas ve icon için çözünürlük/boyut hedefleri tanımlı.
- [ ] Zorunlu manifest alanları `dimensions`, `byteBudget`, `alphaRequired`, `safeArea`, `textFree`, `cropTest`, `critical`, `loading`, `fallback` dahil yazılı.
- [ ] Checkerboard, baked text/logo/gibberish, opaque multi-plate, random rainbow, halo `>3×`, particle `>12` hard reject.
- [ ] 24 oyun için yeni full-frame scene/renderer yerine shared background + 6 family + sınırlı hero/state/icon kuralı var.
- [ ] Kontrol Paneli Kaosu 2D illustrated console/cable sprites; Çağrışım Ağı animated 2D word core/node graph olarak tanımlı.

### QA ve teslim sınırı

- [x] A1 current UI forensics, A2 art direction, A3 UI systems, A4 mobile UX, A5 2D material/asset auditleri sentezlenmiş.
- [x] A6 adversarial review tamamlanmış; SaaS, childish, fake 3D, mobile, 24-game scaling ve asset riskleri ayrıca zorlanmış.
- [x] A7 Visual Bible Gatekeeper bağımsız post-revision kontrolü tamamlanmış; bulgular giderilmiş ve bu checklist’te açıkça işaretlenmiş.
- [x] Evidence kaydı owner / evidence / status sütunlarıyla tutulmuş; A6 ve A7 verdict’i burada yazılı.
- [ ] 20% thumbnail / 3-second read, mobile viewport, orientation, touch target, contrast, reduced-motion ve asset-budget gates tanımlı.
- [x] Eski 2.5D/WebGL belgelerinin historical/superseded olduğu ve `GAME_CATALOG`’un 24 oyun için source of truth olduğu yazılı.
- [x] Bu Stage 11.2 çıktısında yalnız `docs/` kapsamı kullanılmış; `App.tsx`, runtime production code, CSS, GameViewport, asset runtime integration ve WebSocket değiştirilmemiş.
- [x] Stage 11.3 implementation/rebuild başlatılmamış; sonraki stage bu belgeyi okuyup planlı değişiklikleri ayrıca uygular.

### Audit evidence register

| Owner | Evidence | Status |
|---|---|---|
| A0 Orchestrator | `docs/GLIX_VISUAL_BIBLE.md`, current `main` inspection, 22-section check | Complete after A7 revision |
| A1 UI Forensics | Read-only Home/create/join/lobby/match/source composition audit | Complete; integrated |
| A2 Art Director | Young-adult tone, color/light/character/material thresholds | Complete; integrated |
| A3 UI Systems | Token, type, radius, HUD, control and overlay measurements | Complete; integrated |
| A4 Mobile UX | 320×700 / 844×390, orientation, keyboard, safe-area and touch audit | Complete; integrated |
| A5 2D Material/Asset | Alpha, format, layer, family, byte budget and 24-game scaling audit | Complete; integrated |
| A6 Adversarial Reviewer | Threat model and 16 concrete edits; 2D override recheck | Conditional Pass; edits integrated |
| A7 Visual Bible Gatekeeper | Independent post-revision 10-point QA of this file and scope | **PASS — 10/10 gates; no blockers** |
| C6 Creative QA Gatekeeper | Independent corrective QA of direction docs, prompt library, concept visuals and no-runtime scope | **PASS WITH GUARDRAILS** — browser/device proof, rendered KPK states and separated production layers remain implementation gates |

**Stage 11.2 durma koşulu:** Bu belge, A7 `PASS` ve C6 `PASS WITH GUARDRAILS` kayıtları ile görsel yön, ölçüler, ekran kontratları, 24 oyun ölçekleme, asset standardı, mobile/accessibility kuralları ve anti-goal’lar kilitlenmiştir. Bundan sonra yalnız bu contract’a göre ayrıca yetkilendirilen implementation stage’ine geçilir.
