# GLIX — Kalıcı Hafıza

> **Kanonik redesign çalışma hafızası — 2026-09-07**
>
> Bu dosya GLIX'in 2026-09-07 sonrası ürün/tasarım yeniden yapımının tek kalıcı karar ve ilerleme kaynağıdır.
> Tarihsel `GLIX-PROJE-HAFIZASI.md` yalnız geçmiş kayıt olarak tutulur.
>
> **PM çalışma kuralı:** Her aşamanın başında bu dosyayı asistan/PM bizzat okuyacak; ilgili oyun varsa kanonik kural dosyası + adapter/testler yeniden okunacak; master referans açılıp incelenecek. Aşama sonunda GitHub diff/test/branch/SHA asistan/PM tarafından doğrulanacak ve bu dosya asistan/PM tarafından güncellenecek. Hafıza güncellenmeden aşama kapanmış sayılmaz. Implementasyon AI'ları bu dosyayı okuyabilir ama aşama hafızasının nihai sahibi değildir.

---

## 1. GLIX'in iki değişmez kalite hedefi

1. **Gerçek oyun hissi:** GLIX web sitesi/dashboard gibi değil, telefonda oynanan gerçek bir parti oyunu gibi görünmeli ve hissettirmeli. Tasarım, animasyon, geçiş ve dokunma tepkileri güçlü; performans orta seviye telefonlarda akıcı olmalı.
2. **Sorunsuz oynanış:** 24 mini oyunun kuralları, skorları, gizli bilgileri, target/reconnect/phase akışları ve sonuçları doğru çalışmalı. UI sadeleştirilirken gameplay kuralı yeniden icat edilmez.

Arkadaş grubu kullanımında bu iki hedef dışındaki süreçler ikincildir; gereksiz release bürokrasisi oluşturulmaz.

---

## 2. Kanonik kaynak önceliği

Bir çelişki varsa şu sıra geçerlidir:

1. Kullanıcının bu dosyadan daha yeni açık kararı.
2. `GLIX-MINIOYUN-KURALLARI-FORMU.md` — 24 oyunun kanonik oyun kuralları.
3. `packages/shared/src/` adapter/engine/contracts + testler — gerçek uygulanmış server davranışı.
4. Bu dosyadaki güncel ürün/tasarım kararları.
5. Eski tarihsel dokümanlar.

### Oyun ekranı tasarlama zorunluluğu

Bir oyun ekranına dokunmadan önce:

- ilgili oyun kuralı okunur,
- ilgili adapter/testler okunur,
- oyuncunun gerçekten bilmesi gereken bilgi çıkarılır,
- teknik detay oyuncunun kararına hizmet etmiyorsa UI'da gösterilmez.

Örnek: `butona-bas` için 0,3 saniyelik pencere gerçek server kuralıdır; fakat oyuncunun radar, milisaniye grafiği veya mühendislik metrikleri görmesine gerek yoktur. Oyuncuya basitçe aynı anda basışın +1, tek basışın -1 olduğu anlatılır.

---

## 3. Canlı/release tabanı

- Repo: `xpike-dgm/glix`
- Protected `main`: `12e3e5253edf9a6babed863b2351d1493a738816`
- Kabul edilmiş canlı uygulama revizyonu: `ba6e895f2e71a9466bcf2d87770ece53f9902780`
- CI-only release head: `0ac9fc29ce33448be5fee8947281c18e4a9b09fc`
- Public: `https://glix.lynrax.com`
- Public version: `0.7.0`
- Public protocol: `3`
- 24/24 mini oyun adapter'ı mevcut.
- Server authority, private/public state, reconnect ve action fencing korunacak.
- Redesign bitene kadar public canlı sürüme dokunulmayacak.

### Aktif redesign branch

- Branch: `redesign-mobile-first-v1`
- R0 doğrulanmış head: `a26ab81098d8b5b012522f5c94b7b02b9e517228`
- R0 parent: `5cc1b8b97f0063c64e591ff74c334f50378dcac8`
- R1 başlangıç tabanı: R0 doğrulanmış head + bu PM hafıza başlangıç commit'i.

---

## 4. Kilitli görsel yön

### Master referans

Kanonik dosya:

`docs/design/GLIX-MASTER-REFERENCE.png`

- SHA-256: `bdcc7072889d4cd053b84fe79acbfd5e38e97397ea3b79e5656081ebbca225f7`
- Boyut: `1491 × 1055`
- R0 commit: `a26ab81098d8b5b012522f5c94b7b02b9e517228`
- PM tarafından R1 başlangıcında tekrar açılıp görsel olarak incelendi.

Bu görsel **ilham panosu değil, hedef tasarımdır**. Uygulama mümkün olduğunca bu görselin sade mobil neon oyun diline birebir yaklaşır.

### Master tasarım dili

- Telefon-first.
- Deep navy/koyu lacivert zemin.
- Cyan + magenta + violet + kontrollü lime vurgular.
- Büyük ve okunabilir metin.
- Büyük dokunma alanları.
- Tek bakışta anlaşılır ana eylem.
- Az panel, az teknik bilgi, az dekoratif kalabalık.
- Dashboard/SaaS/sistem paneli görünümü yok.
- Kısa, akıcı, performans-dostu animasyonlar.
- Sürekli pahalı blur/parallax/glow yok.

### Alt referans kuralı

Bir iş paketi master'daki ekrandan daha fazla detay gerektiriyorsa, master + gerçek kurallardan alt referans PNG üretilebilir.

Alt referans:

- master diliyle aynı olmalı,
- gameplay kuralı icat etmemeli,
- implementasyon AI'sına görevle birlikte verilmelidir,
- repo'da `docs/design/references/` altında saklanmalıdır.

### R1 alt referansı

R1 için master'dan türetilmiş odaklı core-flow referansı oluşturuldu ve görev paketiyle repo'ya eklenecek:

`docs/design/references/GLIX-R1-CORE-FLOW-REFERENCE.png`

- SHA-256: `bd97a4d004af5ed4c07d90a9d23bf417cc78bc128665f1dce4b59e44ab505f57`
- Boyut: `1330 × 1183`
- İçerik: anasayfa, oda kur/katıl, lobi, tam ekran briefing, sonuç, portrait ve landscape shell.
- Görseldeki örnek oyun mekanikleri kanonik değildir; yalnız layout/sanat yönü referanstır.

---

## 5. Kullanıcı tarafından kilitlenen UX kararları

### Anasayfa

- `Nasıl oynanır?` düzgün açılır/kapanır; içerik çakışmaz ve tekrar kapatılabilir.
- Ana görünüm sade olur.
- Birincil eylemler: `Oda Kur` ve `Odaya Katıl`.
- Normal bağlı durumda teknik `Bağlı / Bağlantı hazır` rozeti gösterilmez.
- Oyuncuya yalnız bağlantı gerçekten sorun olduğunda sade bir reconnect/offline mesajı gösterilir.

### Oda kur / katıl

- Telefon ekranında kısa, basic ve anlaşılır form.
- Takma ad + gerekiyorsa oda kodu dışında gereksiz alan yok.
- Teknik bağlantı mesajı yok.

### Lobi

- Oda kodu büyük ve kopyalanabilir.
- Oyuncular sade liste halinde görünür.
- Host net biçimde `Oda Sahibi` olarak işaretlenebilir.
- Host diğer oyuncuları **yalnız lobide** odadan çıkarabilir.
- `Bağlantı hazır`, `Deneme olarak bağlandın`, protocol/server/telemetry vb. teknik metinler oyuncuya gösterilmez.
- `Oyun seçimi` adı `Minigame Seçimi` olur.
- `Minigame Seçimi` ilk açılışta kapalı accordion olur.
- Büyük ve net `Oyunu Başlat` eylemi olur.

### Oyun anlatımı / briefing

- Eski oyunun üstüne binen küçük opak tutorial paneli kaldırılır.
- Her mini oyundan önce **oyundan bağımsız tam ekran briefing** gösterilir.
- Oyun adı + amaç + en fazla 3 kısa madde + gerekirse basit görsel.
- Kullanıcı isteği gereği görünür geri sayım yoktur.
- Büyük `Hazırım` butonu vardır.
- Oyun, o anki uygun/bağlı katılımcıların tamamı hazır olduğunda server-authoritative olarak başlar.
- Spectator/eliminated/disconnected oyuncu ready bariyerini kilitlemez.

### Oyun ekranları

- Desktop layout küçültülmez; telefon için yeniden düzenlenir.
- Skor, süre ve ana eylem dışında HUD minimal tutulur.
- Oyuncunun bilmesine gerek olmayan mekanik/teknik metrikler kaldırılır.

### Landscape

- Landscape gerektiren oyun gerçek telefon ekranını doldurur.
- Ortada kayan desktop panel + sabit üst/alt dashboard şeritleri kullanılmaz.
- Safe-area ve orientation gate gerçek mobil fullscreen mantığıyla çalışır.

---

## 6. R1 teknik kararları — 2026-09-07

### Ready akışı

Mevcut motor `tutorial (10 sn timer) → preparing (5 sn all-ready-or-timeout) → playing` kullanıyor. Bu, yeni UX kararıyla uyuşmuyor.

R1 hedefi:

- `tutorial` artık tam ekran briefing + server-authoritative ready bariyeri olacak.
- Görünür tutorial süresi olmayacak.
- `client:game:ready` briefing ekranındaki `Hazırım` eylemi için kullanılacak.
- Tüm uygun bağlı katılımcılar hazır olduğunda oyun hemen başlayacak.
- İç mimari uyumluluk için `preparing` fazı gerekirse 0 ms internal bridge olarak korunabilir; oyuncu bu fazı ayrı ekran olarak görmemeli.
- Ready hesabı reconnect/disconnect ile kilitlenmemeli; server eligible connected current-game participant roster'ını esas almalı.

### Protocol kararı

Bu redesign ready semantiği eski Protocol v3 istemciyle geriye uyumlu değildir ve host-kick için yeni istemci mesajı gerekecektir. Bu nedenle **R1 redesign sürümünde Protocol v4'e kontrollü geçiş planlanmıştır**. Public Protocol v3, redesign deploy edilene kadar değişmez.

Protocol v4 kapsamında minimum wire değişiklikleri:

- `client:room:kick` (`targetPlayerId`)
- oyuncuya sade kick sonucu için gerekirse `server:room-left` reason `kicked`
- `client:game:ready` semantiğinin tutorial briefing ready bariyerine taşınması

Host kick:

- yalnız host,
- yalnız lobby,
- host kendisini kick edemez,
- hedef oyuncu reconnect token/session hakkıyla otomatik geri dönememeli,
- oda state'i anında güncellenmeli.

### Result ekranı

R1'de ortak result görseli master referansa göre sadeleştirilecek. Oyunların server-authoritative skor/rank alanları kullanılacak; UI kendi skor kuralını yeniden hesaplamayacak. Match progression kuralı gereksiz yere değiştirilmez.

---

## 7. Redesign aşamaları

### R0 — Kalıcı hafıza + master referans + rule baseline — **TAMAMLANDI**

- Kalıcı hafıza oluşturuldu.
- Master PNG exact binary olarak repo'ya eklendi.
- 24 oyun kural kaynağı kilitlendi.
- `redesign-mobile-first-v1` branch açıldı.
- PM doğrulaması: commit `a26ab81098d8b5b012522f5c94b7b02b9e517228`; değişen dosyalar yalnız `GLIX-KALICI-HAFIZA.md` + master PNG; gameplay/application code değişmedi.

### R1 — Oyuncu akışı ve ortak UI kabuğu — **AKTİF**

Kapsam:

- Anasayfa
- Oda Kur / Odaya Katıl
- Lobi
- Host kick
- Minigame Seçimi accordion
- Tam ekran briefing + `Hazırım`
- Ortak result sunumu
- Portrait/landscape ortak shell
- Protocol v4 minimum gereksinimleri

Gameplay adapter kuralları değişmez.

### R2 — İlk dikey oyun batch

- `butona-bas`
- `cagrisim-agi`
- `gizli-hirsiz`

Her biri için master + gerçek kurallardan özel alt referans; sonra uygulama.

### R3 — Kalan dikey oyunlar

Portrait oyunlar interaction tiplerine göre küçük batch'lerle dönüştürülür.

### R4 — Landscape / çizim / yoğun etkileşim

Gerçek fullscreen mobile landscape ve çizim/geniş sahne oyunları.

### R5 — Motion + performans + gerçek telefon QA + deploy

- microinteraction / geçiş / result feedback
- reduced-motion
- orta seviye Android performansı
- 3–8 gerçek telefon
- rule regression
- reconnect
- portrait/landscape
- kontrollü deploy

---

## 8. Her aşamada zorunlu PM protokolü

1. PM `GLIX-KALICI-HAFIZA.md` dosyasını GitHub'dan okur.
2. İlgili kural/adapters/tests PM tarafından tazelenir.
3. Master PNG PM tarafından açılıp incelenir.
4. Gerekirse alt referans hazırlanır.
5. Implementasyon izole branch/worktree'de yapılır.
6. Runtime + mobil viewport + test kanıtı alınır.
7. PM GitHub diff ve exact SHA'yı doğrular.
8. PM bu hafızayı yeni durumla günceller.
9. Hafıza commit'i olmadan aşama `TAMAMLANDI` olmaz.

---

## 9. Yasaklar

- Dashboard/SaaS görünümü
- Debug/telemetry/protocol/stage/batch/server gibi iç terimlerin player-facing olması
- Oyuncuya gereksiz teknik metrikler
- Küçük dokunma hedefleri
- Gameplay'in scroll edilen kart-dashboard'a dönüşmesi
- Uzun açıklama okumadan oynanamayan ekranlar
- Gizli state'in DOM/ARIA/class/data/id/SVG metadata'ya sızması
- UI'nın oyun kurallarını yeniden hesaplaması/icat etmesi
- Master referanstan gerekçesiz sapma
- Public canlıya redesign aşamaları bitmeden deploy

---

## 10. Aşama günlüğü

### 2026-09-07 — R0 başlangıç

- Public `0.7.0 / Protocol v3` release dışarıdan doğrulandı.
- Gerçek telefon testinde mevcut tasarımın desktop-panel hissi, teknik metin fazlalığı, tutorial overlay ve landscape sıkışıklığı görüldü.
- Kullanıcı yeni mobile-first master tasarımı hedef olarak kilitledi.

### 2026-09-07 — R0 completion

- `docs/design/GLIX-MASTER-REFERENCE.png` exact binary eklendi.
- SHA-256 doğrulandı: `bdcc7072889d4cd053b84fe79acbfd5e38e97397ea3b79e5656081ebbca225f7`.
- R0 implementation commit: `a26ab81098d8b5b012522f5c94b7b02b9e517228`.
- Application/gameplay code değişmedi.

### 2026-09-07 — PM R0 doğrulaması + R1 başlangıcı

- PM GitHub'dan `redesign-mobile-first-v1` head'inin exact `a26ab81098d8b5b012522f5c94b7b02b9e517228` olduğunu bağımsız doğruladı.
- PM R0 commit'in parent'ını `5cc1b8b97f0063c64e591ff74c334f50378dcac8` olarak doğruladı.
- PM master referansı tekrar açıp görsel olarak inceledi.
- PM `GLIX-KALICI-HAFIZA.md`, kural formunun genel çerçevesi, mevcut engine phase planı, `client:game:ready`, HomeScreen, TutorialOverlay ve ResultOverlay kaynaklarını yeniden okudu.
- R1 alt referansı üretildi; R1 görev paketiyle repo'ya eklenecek.
- R1 **AKTİF** olarak başlatıldı.
