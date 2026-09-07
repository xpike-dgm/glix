# GLIX — Kalıcı Hafıza

> **Yeni kanonik proje hafızası — 2026-09-07**
>
> Bu dosya, GLIX'in 2026-09-07 sonrası ürün/tasarım yeniden yapımının kalıcı karar ve ilerleme kaynağıdır.
> `GLIX-PROJE-HAFIZASI.md` tarihsel kaynaktır; bu dosya güncel çalışma hafızası olarak onu supersede eder.
>
> **Zorunlu çalışma kuralı:** Her aşamanın başında bu dosya okunacak. Aşama sonunda yapılanlar, alınan kararlar, exact branch/SHA ve açık kalan işler bu dosyaya işlenecek. Bu dosya güncellenmeden hiçbir aşama tamamlanmış sayılmaz.

## 1. Projenin iki ana kalite hedefi

1. **Gerçek oyun hissi:** GLIX bir web sitesi/dashboard gibi değil, telefonda oynanan gerçek bir parti oyunu gibi görünmeli ve hissettirmeli. Tasarım, animasyon, geçiş, dokunma geri bildirimi ve sahne sunumu güçlü olacak; orta seviye telefonlarda kasmayacak.
2. **Kusursuz oynanış:** Mini oyun kuralları doğru çalışacak; skor, gizli bilgi, target, reconnect, ready/phase akışı ve sonuçlar hatasız olacak. UI sadeleştirilirken oyun kuralı değiştirilmez.

Bu iki hedefin dışındaki release/governance ayrıntıları ikincildir. Arkadaş grubu kullanımında gereksiz kurumsal bürokrasi oluşturulmayacak.

## 2. Kanonik kaynaklar ve öncelik sırası

Bir çelişki olduğunda aşağıdaki sıra geçerlidir:

1. **Mini oyun kuralları:** `GLIX-MINIOYUN-KURALLARI-FORMU.md`
2. **Gerçek uygulanmış davranış:** `packages/shared/src/` içindeki adapter/engine/contracts ve ilgili testler
3. **Bu dosyadaki güncel ürün/tasarım kararları**
4. Eski proje hafızaları ve tarihsel dokümanlar

### Oyun tasarlama kuralı

Herhangi bir mini oyunun ekranı değiştirilmeden önce:

- ilgili oyunun `GLIX-MINIOYUN-KURALLARI-FORMU.md` bölümü okunacak,
- ilgili adapter/testler kontrol edilecek,
- oyuncunun gerçekten bilmesi gereken bilgiler ayrıştırılacak,
- kuralın teknik ayrıntısı oyuncunun karar vermesi için gerekmiyorsa UI'da gösterilmeyecek.

Örnek: `butona-bas` için **0,3 saniyelik pencere gerçek ve kilitli bir oyun kuralıdır**, fakat oyuncunun ekranda radar, milisaniye göstergesi veya mühendislik metrikleri görmesi gerekmez. Oyuncu tarafı sade şekilde “aynı anda basarsanız +1, tek kalırsan -1” mantığını anlatır; server kuralı aynen korunur.

## 3. Güncel canlı/release tabanı

- GitHub: `xpike-dgm/glix`
- Protected `main`: `12e3e5253edf9a6babed863b2351d1493a738816`
- Kabul edilmiş uygulama revizyonu: `ba6e895f2e71a9466bcf2d87770ece53f9902780`
- CI-only release head: `0ac9fc29ce33448be5fee8947281c18e4a9b09fc`
- `12e3e525...`, protected main üzerinde yalnız bu yeni kalıcı hafıza dosyasını ekleyen dokümantasyon commit'idir; canlı uygulama revizyonunu değiştirmez.
- Public: `https://glix.lynrax.com`
- Public version: `0.7.0`
- Protocol: `3`
- 24/24 mini oyun server adapter'ı mevcut.
- Server authority / private-public state / reconnect / protocol v3 korunacak.

### Aktif redesign branch

- Branch: `redesign-mobile-first-v1`
- Base: `12e3e5253edf9a6babed863b2351d1493a738816`
- Tüm yeni tasarım/UX çalışmaları bu branch ve gerektiğinde buradan açılan izole alt branch'lerde yürütülecek.
- Public canlı sürüme aşamalar bitmeden dokunulmayacak.

## 4. Yeni kilitli görsel yön

### Master referans

Kanonik tasarım görseli yolu:

`docs/design/GLIX-MASTER-REFERENCE.png`

- **Durum:** Exact binary olarak repo'ya eklendi ve kilitlendi.
- **Kanonik Görsel Master:** Bu dosya projenin kanonik görsel referansıdır (canonical visual master).
- **SHA-256:** `bdcc7072889d4cd053b84fe79acbfd5e38e97397ea3b79e5656081ebbca225f7`
- **Boyutlar:** 1491 × 1055 px (1.706.082 bayt).
- **Zorunlu Kural:** Gelecek tüm aşamalar (R1–R5) implementasyona veya kodlamaya başlamadan önce bu dosyayı (`docs/design/GLIX-MASTER-REFERENCE.png`) açmak, okumak ve incelemek zorundadır.

Bu referansın görsel dili **hedef tasarımdır**. Uygulama bu referansa mümkün olduğunca birebir yaklaşacak; “ilham” olarak gevşek yorumlanmayacak.

### Tasarım dili

- Mobile-first.
- Koyu lacivert/deep-blue taban.
- Kontrollü cyan, magenta, lime ve violet neon vurgular.
- Büyük, okunabilir tipografi.
- Büyük dokunma alanları.
- Az panel, az metin, net görsel hiyerarşi.
- Web dashboard / sistem paneli hissi yok.
- Teknik/developer dili yok.
- Oyuncunun o anda yapacağı tek ana eylem mümkün olduğunca ilk bakışta anlaşılır.
- Animasyonlar kısa, akıcı ve performans dostu.
- Gereksiz blur, parallax, glow veya sürekli çalışan pahalı efekt kullanılmaz.

### Alt referans üretme kuralı

Bir ekran veya oyun grubu uygulanmadan önce gerekirse master referans + gerçek oyun kuralları kullanılarak **alt referans PNG/SVG** üretilebilir.

Alt referans:

- master tasarım dilini bozmayacak,
- oyunun gerçek kuralını esas alacak,
- implementasyon AI'sına görevle birlikte verilecek,
- `docs/design/references/` altında saklanacak.

AI görsel üretimi kural belirleyemez. Kural repo'dan gelir; görsel kuralı sunar.

## 5. Kullanıcı tarafından kilitlenen UX düzeltmeleri

### Anasayfa

- “Nasıl oynanır?” düzgün açılır/kapanır olacak; yazılar çakışmayacak, kullanıcı tekrar kapatabilecek.
- İlk görünüm sade olacak.
- Ana eylemler: `Oda Kur` ve `Odaya Katıl`.

### Lobi

- `Bağlantı hazır`, `Bağlı`, `Deneme olarak bağlandın` vb. yazılımsal/teknik oyuncu metinleri kaldırılacak.
- Oyuncu listesi basit ve anlaşılır olacak.
- Host diğer oyuncuları lobiden çıkarabilecek.
- `Oyun seçimi` alanı `Minigame Seçimi` adını alacak.
- `Minigame Seçimi` varsayılan olarak kapalı accordion/dropdown olacak ve gerektiğinde açılacak.
- Oda kodu ve başlatma eylemi net olacak.

### Oyun anlatımı / tutorial

- Oyun üstüne binen küçük/opak panel olmayacak.
- Mini oyundan bağımsız **tam ekran briefing** olacak.
- Kısa: amaç + en fazla 3 basit madde + gerekirse küçük görsel örnek.
- Zorunlu otomatik geri sayım yerine `Hazırım` butonu tercih edilecek.
- Oyunun başlaması herkesin hazır olmasına bağlanacak; bunun server-authoritative biçimde uygulanması gerekir.

### Oyun ekranları

- Telefon ekranına göre sıfırdan düşünülür; desktop ekranın küçültülmüş hali olmayacak.
- Oyuncuya gerekli olmayan mekanik/teknik ayrıntılar kaldırılır.
- Skor, süre ve ana eylem dışında HUD mümkün olduğunca minimaldir.

### Yatay oyunlar

- Yatay oyun gerçekten cihazın kullanılabilir ekranını dolduracak.
- Üst ve alt sabit şeritler arasında kayan küçük desktop pencere olmayacak.
- Landscape içerik kendi layout'u olacak; clipping/overflow olmayacak.

## 6. Referans ekran seti

Master referans şu ürün parçalarını tanımlar:

1. Anasayfa
2. Lobi
3. Tam ekran oyun anlatımı / Hazırım
4. Dikey oyun örneği — Butona Bas
5. Dikey oyun örneği — Çağrışım Ağı
6. Dikey sosyal/seçim oyunu örneği
7. Tam ekran yatay oyun örneği
8. Tam ekran yatay çizim/etkileşim örneği

Referanstaki örnek oyun kuralları kanonik değildir. **Görsel tasarım kanoniktir; gerçek oyun davranışı daima kural dosyasından alınır.**

## 7. Yeniden yapım aşamaları

### AŞAMA R0 — Kalıcı hafıza + master referans + rule baseline [TAMAMLANDI]

**Amaç:** Tasarım çalışmasının tek hafıza kaynağını, görsel hedefini ve kural okuma prosedürünü kilitlemek.

Yapılacak:
- [x] Yeni kalıcı hafıza dosyasını tanımla.
- [x] Master referans PNG'yi repo'ya exact binary dosya olarak ekle (`docs/design/GLIX-MASTER-REFERENCE.png`, SHA-256: `bdcc7072889d4cd053b84fe79acbfd5e38e97397ea3b79e5656081ebbca225f7`).
- [x] `GLIX-MINIOYUN-KURALLARI-FORMU.md` dosyasını yeniden oku ve kanonik kural kaynağı olarak kilitle.
- [x] Redesign çalışma branch'ini aç: `redesign-mobile-first-v1`.

**Bitiş kriteri:** Hafıza + görsel referans repo'da ve sonraki aşamalar bunları açıkça kaynak alıyor. [TAMAMLANDI]

### AŞAMA R1 — Oyuncu akışı ve ortak UI kabuğu [SIRADAKİ AŞAMA]

**Kapsam:**
- Anasayfa
- Oda Kur / Odaya Katıl
- Lobi
- Host kick
- Minigame Seçimi accordion
- Tam ekran briefing + server-authoritative `Hazırım`
- Ortak sonuç ekranı
- Portrait ve landscape ortak shell

**Kural:** Gameplay adapter'ları değişmez; yalnız briefing-ready için gerçekten gerekli shared/server değişikliği ayrı ve testli yapılır.

### AŞAMA R2 — Dikey oyunlar: ilk referans batch

Önce üç oyun yeni tasarım standardını kanıtlayacak:

- `butona-bas`
- `cagrisim-agi`
- `gizli-hirsiz`

Her biri için önce alt referans üretilecek, sonra gerçek kurala göre uygulanacak.

### AŞAMA R3 — Kalan dikey oyunlar

Kalan portrait oyunlar kural/interaction tiplerine göre küçük batch'ler halinde dönüştürülecek. Her batch yalnız ilgili oyunları etkiler.

### AŞAMA R4 — Yatay / çizim / yoğun etkileşim oyunları

Landscape gerektiren oyunlar gerçek full-screen mobile landscape düzenine geçirilecek. Çizim ve geniş sahneler burada ele alınacak.

### AŞAMA R5 — Motion, performans, gerçek telefon QA ve canlıya geçiş

- microinteraction
- game transition
- sonuç feedback
- reduced motion
- orta seviye Android performans kontrolü
- 3–8 gerçek telefon oynanışı
- rule regression
- reconnect
- portrait/landscape
- deploy

Bu aşamada görsel kalite yükseltilir; gameplay kuralları değişmez.

## 8. Aşama yürütme protokolü

Her aşama için aşağıdaki sıraya uyulacak:

1. `GLIX-KALICI-HAFIZA.md` oku.
2. İlgili oyun varsa `GLIX-MINIOYUN-KURALLARI-FORMU.md` bölümünü ve adapter/testi oku.
3. Master referansı incele.
4. Gerekliyse görev özel alt referans oluştur.
5. Uygulama branch'inde değişikliği yap.
6. Telefon viewport/runtime/test doğrulaması yap.
7. Aşama sonucunu bu dosyanın **Aşama Günlüğü** bölümüne exact branch/SHA ile yaz.
8. Bu dosyanın karar/plan bölümlerini yeni gerçek duruma göre güncelle.
9. Hafıza güncellemesi commit edilmeden aşama bitmiş sayılmaz.

## 9. Tasarımda yasaklar

- Dashboard/SaaS görünümü
- debug/telemetry/protocol/stage/batch/server kelimelerinin oyuncuya gösterilmesi
- gereksiz teknik metrikler
- küçük dokunma hedefleri
- gameplay alanının scroll edilen dashboard kartına dönüşmesi
- oyunu anlamak için uzun açıklama okumak zorunda kalmak
- gizli state'in DOM/ARIA/class/data/id gibi alanlara sızması
- kuralların UI tarafından yeniden icat edilmesi
- master referanstan gerekçesiz görsel sapma

## 10. Aşama günlüğü

### 2026-09-07 — R0 başlatıldı

- Public release `0.7.0 / Protocol v3` doğrulanmış durumda.
- Gerçek telefon testinde mevcut UI'nin oyuncu açısından fazla karmaşık ve desktop-panel hissinde olduğu görüldü.
- Yeni mobile-first GLIX master tasarım panosu kullanıcı tarafından beğenildi ve **hedef görsel yön** olarak kilitlendi.
- Kullanıcı, uygulamanın master referansa mümkün olduğunca birebir dönüştürülmesini istedi.
- Oyunların gerçek kuralları için `GLIX-MINIOYUN-KURALLARI-FORMU.md` yeniden kanonik kaynak olarak kilitlendi.
- Butona Bas kuralı yeniden doğrulandı: 45 saniye boyunca 0,3 saniyelik pencereler; aynı pencerede 2+ farklı oyuncu +1, tek oyuncu -1. Bu 0,3 saniye server kuralıdır ama yeni UI'da teknik metrik olarak gösterilmeyecektir.
- Çağrışım Ağı yeniden doğrulandı: ortak ana kelime, tek zorunlu çağrışım, 30 saniye, aynı normalize cevabı veren 2+ oyuncu grup oluşturur ve grup büyüklüğü kadar mini oyun puanı alır.
- Rus Ruleti yeniden doğrulandı: silah sahibi hedef seçer; risk %16 başlar, güvenli atışta +10 artar (max %76), patlamada hedef elenir; hayatta kalan sayısı başlangıcın yarısına düşünce biter.
- Gizli Hırsız yeniden doğrulandı: herkesin bir kez gizli `ÇAL` hamlesi vardır; 30 saniye sonunda tek hırsız +1, birden fazla hırsızın her biri -1, basmayan 0; hamleler sonuç anına kadar gizlidir.
- `redesign-mobile-first-v1` branch'i protected main'deki `12e3e525...` dokümantasyon tabanından açıldı.
- Bundan sonra her aşama başında/sonunda bu hafıza dosyasının okunması/güncellenmesi zorunlu.

- Master referans PNG exact binary olarak `docs/design/GLIX-MASTER-REFERENCE.png` yoluna eklendi.

### 2026-09-07 — AŞAMA R0 TAMAMLANDI (Master referans kilitlendi)

- **Exact dosya repo'ya eklendi:** `docs/design/GLIX-MASTER-REFERENCE.png`
- **SHA-256 doğrulandı:** `bdcc7072889d4cd053b84fe79acbfd5e38e97397ea3b79e5656081ebbca225f7`
- **Görsel boyutları:** 1491 × 1055 px, 1.706.082 bayt.
- **Kanonik Statü:** Bu dosya projenin kanonik görsel master referansıdır (canonical visual master).
- **Zorunlu Kural:** Gelecek tüm aşamalar (R1–R5) kodlamaya veya implementasyona başlamadan önce bu referans görseli açmak, okumak ve incelemek zorundadır.
- **Kural bütünlüğü:** `GLIX-MINIOYUN-KURALLARI-FORMU.md` ve kilitli 24 mini oyun kuralı aynen korundu; hiçbir gameplay kuralı değiştirilmedi.
- **Kod bütünlüğü:** Application/client/server/shared koduna dokunulmadı (Application code changed: NO).
- **Aşama Durumu:** AŞAMA R0 eksiksiz tamamlandı (R0_COMPLETE_READY_FOR_R1).
- **Sıradaki Aşama:** **AŞAMA R1 — Oyuncu akışı ve ortak UI kabuğu**.
