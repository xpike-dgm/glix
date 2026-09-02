# Aşama 6 — Gerçek mini oyun dikey dilimi

Bu aşama, ortak faz motorunun gerçek oynanış kurallarına bağlandığı ilk dikey
dilimdir. Üç mini oyun; istemci kontrolü, sunucu otoritesi, özel oyuncu
durumu, mini oyun skoru ve maç genel skoruna aktarım ile birlikte çalışır.

## Kapsam

- `butona-bas`
- `sizma`
- `zaman-bombasi-hafizasi`
- Her oyunun public state'i ve oyuncuya özel private state'i
- Sunucu saatine göre gerçek oyun süresi ve faz geçişleri
- Dokunmatik telefon kontrolleri
- Aynı Neon Toybox sahnesinde oyun özel görselleri
- Oyun özel mini skorlarının sonuç fazında genel skora aktarılması

Diğer katalog oyunları bu aşamada hâlâ ortak motorun prova scorer'ını kullanır;
gerçek adapter'ları sonraki oyun paketlerinde eklenecektir.

## Ortak akış

Her gerçek oyun şu dış faz akışını kullanır:

`tutorial (10 sn) → preparing (5 sn / hazır bariyeri) → playing → results (6 sn) → transition (3 sn)`

Tutorial ekranı oyun kuralını görsel ipuçlarıyla anlatır. Oynama sırasında
istemci yalnızca kontrol ve görselleştirme sağlar; geçerli hamle, süre ve puan
hesabı `packages/shared/src/games.ts` içindeki adapter'da yapılır. Sunucu,
adapter state'ini `server:match-state` içinde public `gameState` ve yalnızca
ilgili oyuncuya gönderilen `ownGameState` alanlarına ayırır.

## Kilitli oyun kuralları

### Butona Bas

- 2–8 oyuncu ile oynanır.
- Oyun süresi 45 saniyedir.
- Süre, 150 adet 0,3 saniyelik pencereye bölünür.
- Aynı oyuncunun aynı pencere içindeki tekrar basışları tek basış sayılır.
- Bir pencerede en az iki farklı oyuncu basarsa o pencereye basan herkes mini
  skorda `+1` alır.
- Pencerede yalnızca bir oyuncu varsa o oyuncu mini skorda `-1` alır.
- Boş pencere skor değiştirmez.
- Oyun sonunda en yüksek mini skoru alan tek kişi genel skorda `+2`, sonraki
  skor sırasındaki oyuncular `+1` alır.
- En yüksek skor eşitse bu oyuncuların tamamı genel skorda `+1` alır; `+2`
  uygulanmaz. Aynı ikinci sıra da eşitse o sıradaki herkes `+1` alır.

### Sızma

- 3–8 oyuncu ile oynanır.
- Sistem kelime havuzundan bir ortak kelime ve ona bağlı farklı bir kelime
  seçer; rastgele bir oyuncu sızma olur.
- Sızma yalnızca kendi telefonunda farklı kelimeyi ve rolünü görür.
- Her oyuncu sırayla iki tur boyunca ipucunu masada sesli söyler.
- İpucu verme zorunludur; telefon üzerindeki düğme yalnızca ipucunun verildiğini
  sıradaki oyuncuya bildirir. İpucu için ayrı geri sayım yoktur.
- İki tur tamamlandıktan sonra herkes `OYLAMAYA GEÇ` düğmesine basar; tüm
  oyuncular hazır olduğunda 30 saniyelik oylama başlar.
- Her oyuncu bir kişiye oy verir; kendi adına oy vermek serbesttir.
- Tek bir oyuncu en yüksek oyu alır ve bu oyuncu sızmaysa normal oyuncuların
  her biri genel skorda `+1` alır.
- Sızma yakalanmazsa veya en yüksek oy eşitliği varsa sızma genel skorda `+2`
  alır; diğer oyuncular bu oyundan puan almaz.

### Zaman Bombası Hafızası

- 2–8 oyuncu ile oynanır.
- Dört renk kullanılır: turkuaz, pembe, amber ve yeşil.
- Oyuncu sırası oyun başında bir kez karıştırılır ve oyun boyunca bu sıra
  döngüsel olarak kullanılır.
- İlk renk dizisi iki adımdır; renkler tekrar edebilir.
- Sırası gelen oyuncu diziyi izler, ardından telefonundaki renk pedlerine aynı
  sırayla basar.
- Her doğru tamamlanan turda dizi bir renk uzar.
- Giriş süresi dizi uzunluğunun üç katı saniyedir.
- Yanlış renk veya süreyi geçirme aktif oyuncuyu eler ve o oyuncu genel skorda
  `-1` alır; o anda hayatta kalan diğer oyuncuların her biri `+1` alır.
- Hata sonrası dizi tekrar iki renkle başlar.
- Başlangıç oyuncu sayısının yarısı yukarı yuvarlanarak elenince oyun biter;
  elenen oyuncular seyirci olarak sahneyi izler.

## Uygulama notları

### Ortak paket

`packages/shared/src/games.ts` şu sözleşmeleri içerir:

- Public/private state tipleri
- Türkçe Sızma kelime çifti havuzu
- `Stage6GameAdapter` arayüzü
- Üç oyunun submit, zaman ilerletme, skor ve elenme davranışı

`packages/shared/src/engine.ts`, üç oyuna 45 saniyelik veya manuel oynanış
fazını ve tekrarlı input politikasını verir. Dış fazlar değişmeden kalır.

### Sunucu

`apps/server/src/index.ts` adapter'ı maç oluşturulurken ve her yeni oyuna
geçilirken kurar. Her state isteği ve timer tick'inde aynı `Date.now()` tabanı
ile adapter ilerletilir. Oyun bitişi, elenmeler ve genel skor artışları
sunucuda hesaplanır; istemcinin gönderdiği zaman bilgisi yalnızca telemetri
olarak kalır.

### İstemci

`apps/client/src/games/Stage6GameControls.tsx` içinde:

- Butona Bas için pointer-down tabanlı büyük dokunmatik buton,
- Sızma için özel kelime kartı, ipucu/ hazır bariyeri ve oy grid'i,
- Hafıza oyunu için tekrar gösterimi, aktif oyuncuya açık renk pedleri ve
  elenen oyuncu seyirci görünümü bulunur.

`NeonToyboxScene` üç oyuna ait atmosfer görselini ortak sahnenin arkasına
yerleştirir. Görseller ve yolları:

- `apps/client/public/assets/games/butona-bas-neon-toybox-v1.png`
- `apps/client/public/assets/games/sizma-neon-toybox-v1.png`
- `apps/client/public/assets/games/zaman-bombasi-hafizasi-neon-toybox-v1.png`

Görseller dekoratif katmandır; oyun kuralları HTML/CSS kontrol yüzeylerinde ve
sunucu adapter'larında kalır. Böylece görsel yüklenmese bile oynanış yüzeyi
çalışabilir.

## Kabul ve doğrulama

Bu aşama sonunda yapılan kontroller:

- `npm test` — 8 otomatik test geçti.
- `npm run typecheck` — shared, client ve server geçti.
- `npm run build` — shared, client ve server üretim derlemesi geçti.
- İki WebSocket istemcisiyle oda oluşturma, katılma, oyun seçme, başlatma,
  tutorial/hazırlık geçişi, Butona Bas oynama state'i, özel oyuncu state'i ve
  hamle onayı doğrulandı.

## Sonraki aşama

Aşama 7'de aynı adapter sözleşmesiyle kalan oyunlar paketler hâlinde gerçek
oynanışa alınacak. Öncelik; zaman/sayı/gizli hamle ailesindeki oyunları ortak
input, özel state ve puan aktarımı kalıplarını tekrar kullanarak eklemek,
ardından sosyal/stratejik oyunlara geçmektir.
