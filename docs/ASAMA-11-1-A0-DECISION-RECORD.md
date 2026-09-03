# GLIX Stage 11.1 — A0 Decision Record

Tarih: 2026-09-03  
Branch: `main`  
HEAD: `fe2d79c`  
Durum: A1–A5 read-only auditleri tamamlandı; A6 implementation onaylandı.

Bu kayıt oluşturulmadan önce production koduna dokunulmadı. Karar; A1 Server
Disconnect Auditor, A2 Client Lobby Availability Auditor, A3 Reconnect Semantics
Auditor, A4 Test Architect ve A5 Adversarial Reviewer bulgularının A0 sentezidir.

## 1. Root cause 1 — next-game participant sızıntısı

`RoomRecord.players` hem oda üyelerini hem de geçici reconnect hakkı bulunan
disconnected oyuncuları tutuyor. İlk maç `createMatch()` içinde `connected`
oyuncuları filtreliyor; ancak `startNextGame()` yeni `MiniGameEngine` ve adapter
listelerini bütün `room.players` üyelerinden kuruyor. Bu nedenle grace süresi
devam eden disconnected oyuncu Game N+1'e aktif participant olarak geri giriyor.

Aynı room-member/current-participant karışıklığının server availability karşılığı
da `validateAndApplyGameSelection()` içindeki random üst sınırında bulunuyor:
`room.players.size` yerine o anda bağlı oyuncu sayısı kullanılmalı.

## 2. Root cause 2 — lobby availability member count kullanıyor

Client `roomState.players.length` değerini oyun uygunluğu, random havuz boyutu,
random maksimumu, mode switch ve availability memo dependency'sinde kullanıyor.
Bu dizi disconnected-but-resumable oyuncuyu içerdiği için 3 room member / 2
connected senaryosunda UI 3+ oyunları uygun gösterebiliyor; server ise bağlı
oyuncu sayısıyla karar veriyor. `player.connected` değiştiğinde array length
değişmediğinden memo stale kalıyor.

Oyun uygunluğu ve start eligibility connected count; roster, oda kapasitesi ve
reconnect görünürlüğü room member count kullanacak.

## 3. Reconnect semantic policy

**Policy D — per-game boundary participant snapshot** kabul edildi:

- Her mini oyun oluşturulurken o an `connected` olan oyuncuların ID listesi tek
  bir server-side snapshot olarak alınır.
- Oyun başladıktan sonra kısa disconnect, oyuncuyu mevcut engine/adapter'dan
  çıkarmaz; grace içinde reconnect eden oyuncu aynı oyun state'i, score context'i
  ve turn konumuyla devam eder.
- Oyuncu bir sonraki oyun oluşturulurken disconnected ise yeni oyunun
  participant setine girmez.
- Oyuncu yeni oyun başladıktan sonra reconnect ederse room member olarak kalır,
  fakat o oyun için **spectator** olur: current participant değildir, private
  game state almaz, ready/input gönderemez ve o oyundan puan alamaz.
- Daha sonraki oyun sınırında bağlıysa yeniden participant olabilir.
- Mini oyun elimination'ı yalnızca o mini oyuna aittir; sonraki oyuna yeni
  snapshot ile yeniden değerlendirilecektir.
- Açık `room:leave` veya 120 saniyelik grace expiry oyuncuyu room'dan tamamen
  çıkarır.

## 4. Connected player ve room member kullanımı

### Connected player kullanılacak yerler

- `createMatch()` participant IDs.
- `startNextGame()` participant IDs.
- Sonraki oyunun minimum/maksimum oyuncu guard'ı.
- Server random game maximum doğrulaması.
- Client `getAvailableGames`, availability memo, manual/random eligibility,
  random maximumı ve `canStartMatch`.
- Current-game private state, input count, ready ve submit yetkisi.

### Room member kullanılacak yerler

- Lobby oyuncu listesi ve disconnected üyenin görünmesi.
- Oda kapasitesi/boş slot hesabı.
- Genel roster ve toplam score continuity.
- Reconnect token/grace ve host migration kayıtları.
- Match sonunda room'da hâlâ bulunan oyuncuların final score listesi.

## 5. Game transition policy

`startNextGame()` bir sonraki route index'inden başlayarak connected snapshot'a
uygun ilk mini oyunu arayacak. Uygun olmayan oyunlar invalid participant set ile
başlatılmayacak. Uygun oyun kalmazsa mevcut oyun sonucu final kabul edilecek ve
route yeni geçersiz bir engine/adapter üretmeden finished state'te kalacak.

Engine ve adapter aynı tek snapshot dizisini kullanacak. Node event loop içinde
disconnect/reconnect callback'i ile transition sırası deterministiktir: hangi
callback önce işlendiyse snapshot o durumu temsil eder.

## 6. Reconnect during already-started next game

Geç reconnect yapan oyuncunun `MatchPlayerState.currentGameParticipant` alanı
`false` olacak. Bu alan, room member listesindeki varlığından bağımsız olarak
current game yetkisini açıkça gösterir. Spectator için `ownGameState` null,
`ownInputCount` 0 ve `ownHasSubmitted` false gönderilecek; server ready/submit
isteklerini `spectator` olarak reddedecek. Client aktif mini oyun kontrollerini
göstermeyip izleyici mesajı gösterecek.

Bu alan mevcut mesajlara geriye dönük uyumlu additive bir alan olarak eklenecek;
mesaj türleri, reconnect token akışı ve mevcut WebSocket mesaj sözleşmesi
değiştirilmeyecek.

## 7. Minimum production code changes

- Shared'de `connected` player sayısını ortaklaştıran küçük yardımcı.
- Server'da connected participant ID helper'ı; `createMatch`, `startNextGame`,
  random validation ve next-game min-player guard kullanımı.
- `MatchPlayerState.currentGameParticipant` ve spectator-safe match projection.
- Server game-ready/game-submit participant guard'ları.
- Client availability hesaplarının connected count'a taşınması ve stale memo
  dependency'sinin düzeltilmesi.
- Client'ta unavailable manual oyunların eklenmesini engelleme; mevcut seçili
  ama artık unavailable oyunun kaldırılmasına izin verme.
- `SızmaAdapter.removePlayer()` içinde aktif clue turn index'ini ve
  `ready-for-vote` bariyerini normalize edip geçerli sonraki turu veya temiz
  oylama geçişini garanti etme.

İlgisiz refactor, CSS/görsel değişiklik, yeni oyun kuralı, grace süresi değişimi,
database, authentication veya deployment redesign yapılmayacak.

## 8. Regression tests

- Shared unit: Sızma active/last clue player removal sonrası sıra kilitlenmez;
  ready-for-vote bariyerindeki oyuncu çıkışı kalan hazır oyuncuları oylamaya
  geçirir.
- Shared/unit seam: 3 room member / 2 connected availability 13 oyun ve random
  maksimum 13 olarak hesaplanır; reconnect ile aynı array length'te availability
  geri 24'e çıkar.
- Server black-box integration: next game sadece connected participant'ları
  alır ve connected oyuncular korunur; server random maximum connected count
  kullanır.
- Server black-box integration: grace reconnect aynı player ID, room, score ve
  token'ı duplicate oluşturmadan korur; current-game reconnect state'i bozulmaz;
  host migration split-brain oluşturmaz; geç reconnect spectator state/input
  izolasyonunu korur; Sızma reconnect akışı ilerler.
- Server integration: 2-player disconnect ve route transition'da invalid
  minimum oyuncu oyunu başlatılmaz.

Testler implementation detayına değil, server/client davranış sözleşmesine
assert edecek.

## 9. Bilerek kapsam dışında bırakılan konular

- Görsel redesign, Neon Toybox/asset/animation, CSS ve PWA shell.
- Yeni mini oyun veya mini oyun puan kuralı.
- Büyük participant model refactor'ı; engine/adapter ID listeleri Stage 11.1
  authoritative seam olarak korunacak.
- WebSocket protocol version gate, rate limit, maxPayload, origin allowlist,
  auth, QR join, database ve persistent match storage.
- Gerçek browser E2E runner kurulumu; mevcut browser QA yalnız A7 manuel gate
  olarak kullanılabilir.

## A0 approval

A5'in HOLD/NO-GO bulguları yukarıdaki minimum kapsamla kapatılacaktır. A6 tek
implementation owner olacak; regression testleri production dosyalarından ayrı
ownership ile eklenecek. A7 bağımsız QA APPROVE vermeden Stage 11.1 tamamlandı
sayılmayacak.
