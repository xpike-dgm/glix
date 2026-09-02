# Aşama 4 — Ortak mini oyun motoru ve puan sözleşmesi

## Durum

**TAMAMLANDI — 2026-09-02**

Bu aşamada 24 oyunun özel kurallarını uygulayan adapter'ların üstünde ortak
çalışacak motor kuruldu. Gerçek oyun kuralları, gizli roller ve görsel sahneler
oyun paketleri ile dikey dilimde uygulanacak.

## Ortak motor sözleşmesi

`packages/shared/src/engine.ts` içindeki `MiniGameEngine` aşağıdaki dış fazları
sunucunun zamanı ile yönetir:

```text
tutorial → preparing → playing → results → transition → finished
```

- Her fazın başlangıç zamanı ve bitiş zamanı vardır.
- `preparing` fazı bütün aktif oyuncular hazır olduğunda veya güvenli zaman
  aşımında ilerler.
- Zamanı sunucu belirler; istemci yalnızca görsel geri sayımı tahmin eder.
- Faz geçişi olmadan gelen hamleler kilitlenir, süre sonrasındaki hamleler
  reddedilir.
- `single` politikasında oyuncunun ilk geçerli hamlesi alınır, tekrar hamle
  deterministik biçimde reddedilir.
- `repeatable` ve `none` politikaları sonraki oyun adapter'ları için hazırdır.
- Boş hamle, oyun tanımındaki `allowEmptyInput` ayarına göre açıkça kabul veya
  red edilir.
- Elenen oyuncu `spectator` durumuna geçer ve artık hamle gönderemez.
- Her kabul edilen hamleye sunucu sırası (`sequence`) ve sunucu alım zamanı
  (`receivedAt`) verilir. Aynı zaman damgasındaki sıra bu sayaçla çözülür.

## Gizli bilgi sınırı

Motor bütün hamleleri sunucuda tutar ancak `getVisibleInputs` özel modda yalnız
hamle sahibinin kayıtlarını döndürür. WebSocket `server:match-state` mesajı
hamle içeriklerini yayınlamaz; istemciye yalnızca kendi hamle sayısı ve kabul
durumu gönderilir. Sonuçta açıklanması gereken bilgiler, ilgili oyunun scorer
adapter'ı tarafından ayrıca yayınlanacaktır.

## Puan sözleşmesi

`rankScores`, `createRankAwards`, `applyScoreDeltas` ve `awardMapToDeltas`
yardımcıları mini oyun puanı ile genel skorun ayrımını korur.

- Sıralama aynı puanları aynı dereceye koyar.
- Eşit liderlerde ortak lider ödülü uygulanır; tek lider ödülü uygulanmaz.
- İstenirse bir sonraki derecedeki tüm eşit oyuncular ödüllendirilebilir.
- Puan değişiklikleri oyuncu, miktar ve sebep bilgisi taşıyan delta kayıtlarıyla
  uygulanır.

Bu yapı `Butona Bas` gibi eşitlikte liderlerin tamamına +1 veren ve tek liderde
+2 / sonraki derecede +1 kullanan kuralları adapter seviyesinde taşıyabilir.

## WebSocket maç akışı

Yeni mesajlar:

- `client:room:start`: Host'un seçili rotayı başlatması.
- `client:game:ready`: Hazırlık fazında oyuncunun hazır olması.
- `client:game:submit`: Sunucu saatli tek/tekrarlı oyun hamlesi.
- `client:match:return-lobby`: Tamamlanan prova sonrası host'un lobiye dönmesi.
- `server:match-state`: Faz, sayaç, oyun sırası, oyuncular ve public skor özeti.
- `server:game-input-ack`: Hamlenin kabul edildiğini veya neden reddedildiğini
  yalnız gönderen istemciye bildiren cevap.

## Stage 4 motor provası

Lobi artık seçilen rotayı **MOTOR PROVASINI BAŞLAT** düğmesiyle açabilir. Bu
akış gerçek mini oyun değildir; seçilen her oyun için ortak faz makinesini
gösterir:

- 10 saniye tutorial,
- hazır olma hazırlığı,
- 12 saniye prova hamlesi,
- sonuç ve geçiş fazları.

Prova sırasında kabul edilen her dolu hamle, yalnızca motoru görünür biçimde
test etmek için +1 prova puanı olarak gösterilir. Bu puan gerçek mini oyunların
puanlama kuralı değildir ve oyun adapter'ları geldiğinde değiştirilecektir.
Rastgele rota sunucu tarafında bir kez çözülür; seçilen oyunlar aynı maçta tekrar
etmez.

## Doğrulama

- `npm run typecheck` başarılı.
- `npm test` başarılı; 5 motor testi geçti.
- `npm run build` başarılı.
- İki WebSocket istemcisiyle faz akışı, erken hamle kilidi, tekil hamle, tekrar
  hamle reddi ve diğer istemcide payload görünmemesi doğrulandı.
- İki tarayıcı sekmesiyle motor provası açıldı; tutorial, oynama ve bitiş ekranı
  responsive UI üzerinde görüldü.

## Sonraki aşama

Aşama 5'te Neon Toybox 2.5D sahne sistemi, ortak karakter/efekt dili ve asset
pipeline kurulacak. Daha sonra Aşama 6'da `Butona Bas`, `Sızma` ve `Zaman
Bombası Hafızası` gerçek adapter'larla bu motora bağlanacak.
