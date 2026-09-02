# Aşama 3 — Oda ve gerçek zamanlı bağlantı çekirdeği

## Durum

**TAMAMLANDI — 2026-09-02**

Bu aşamada Glix'in telefonlar arası lobi bağlantısı ve oda yönetimi kuruldu.
Mini oyunların gerçek faz motoru ve maç başlatma akışı Aşama 4 kapsamındadır.

## Uygulanan kapsam

- Node.js + TypeScript + `ws` ile RAM tabanlı oda sunucusu.
- Beş karakterli oda kodu; oda oluşturma, katılma ve oda değiştirme akışı.
- 1–20 karakterlik takma ad doğrulaması; oda kapasitesi 8 oyuncu.
- Odayı kuran oyuncunun host olması ve host ayrılınca host'un otomatik aktarılması.
- Oyuncuların bağlı/kopuk durumunun bütün bağlı istemcilere yayınlanması.
- Host için manuel oyun seçimi ve rastgele oyun sayısı seçimi.
- 24 katalog oyununun lobi listesinde gösterilmesi; minimum oyuncu sayısına
  uymayan oyunların arayüzde işaretlenmesi.
- Bağlantı kopunca 120 saniyelik yeniden bağlanma penceresi; aynı oyuncunun
  `reconnectToken` ile mevcut kimliği, takma adı ve puanı korunur.
- Oda tamamen boş kaldığında 120 saniye sonra RAM'den temizlenmesi.
- Host'un açıkça ayrılması, oyuncunun odadan çıkması ve oda kapatma mesajları.
- İstemcide bağlantı durumu, yeniden bağlanma, oda kodu kopyalama ve responsive
  Neon Toybox lobi arayüzü.

## Oda seçim davranışı

- Yeni oda manuel modda açılır ve 24 oyun seçili gelir.
- Rastgele modun varsayılan oyun sayısı 5'tir.
- Manuel modda en az bir oyun seçilmelidir.
- Rastgele modda seçilecek oyun sayısı, mevcut oyuncu sayısına uygun oyunların
  sayısını aşamaz.
- Tek oyunculu odada bazı oyunlar arayüzde uygun değil olarak görünür; oda
  başlatma ve maç fazları oyuncu/puan motoru hazır olduğunda eklenecektir.
- Host dışındaki oyuncular oyun listesini salt okunur görür.

## Ortak protokol

İstemci → sunucu mesajları:

- `client:hello`
- `client:ping`
- `client:room:create`
- `client:room:join` (`resumeToken` destekli)
- `client:room:update-games`
- `client:room:leave`

Sunucu → istemci mesajları:

- `server:ready`
- `server:pong`
- `server:session`
- `server:room-state`
- `server:room-left`
- `server:error`

Mesaj tipleri `packages/shared/src/index.ts` içinde tek sözleşme olarak tutulur;
sunucu doğrulaması ve istemci ekranı aynı katalog/tipleri kullanır.

## Doğrulama

- `npm run typecheck` başarılı.
- `npm run build` başarılı.
- İki istemciyle WebSocket smoke testi başarılı: oda oluşturma, katılma,
  manuel seçim, rastgele seçim, kopuk oyuncu durumu, aynı oyuncuyla yeniden
  bağlanma ve host ayrılınca host aktarımı doğrulandı.
- İki tarayıcı sekmesiyle UI testi başarılı: oda kodu, oyuncu listesi, host
  seçimi, 24 oyun listesi ve seçim modunun senkronizasyonu görüldü.

## Sonraki aşama

Aşama 4'te ortak mini oyun tanımı, sunucu otoriteli faz makinesi, süre/saat
senkronizasyonu, gizli hamle aktarımı, ortak puan sözleşmesi ve gerçek maç
başlatma mesajları eklenecek.
