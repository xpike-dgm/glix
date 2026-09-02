# Aşama 8 — Oyun Paketi B

## Sonuç

Aşama 8 tamamlandı. Sosyal, stratejik ve etkileşimli dokuz mini oyun ortak
sunucu otoritesi, özel oyuncu state'i, telefon kontrolü ve puan akışıyla
uygulamaya bağlandı.

## Eklenen oyunlar

- `yazi-yaz`: iki gizli yazan, `MASUM` girişi, 30 / 60 / 30 saniye akışı ve
  kişi/kelime tahminlerinin ayrı +1 puanları.
- `kendim`: gizli kelime kartları, isteğe bağlı eşleştirme, doğru +1, yanlış -1,
  tek doğru eşleşen kart sahibine mini puan bonusu ve lider +1 genel puan.
- `sozluk-blofu`: 50 saniye sahte tanım, 30 saniye karışık tanım seçimi; gerçek
  tanım ve seçilen blöfler doğrudan genel skora aktarılır.
- `cagrisim-agi`: tek normalleştirilmiş çağrışım, aynı cevap grubuna grup
  büyüklüğü kadar doğrudan puan.
- `rusvet-darbe`: gizli başkanlık oyu, eşitlikte sunucu kontrollü taş-kağıt-
  makas, başkanın oy sayısı kadar rüşvet jetonu ve eksik dağıtım için rastgele
  tamamlama.
- `karalama-defteri`: 75 saniyelik düzenlenebilir neon canvas çizimi, tüm
  çizimlerin birlikte açılması, 20 saniye oy ve bilgisizin yakalanma/kurtulma
  puanı.
- `ittifak`: sistemde anlaşma nesnesi oluşturmayan 60 saniyelik sözlü pazarlık,
  15 saniye gizli oy ve alınan oy başına doğrudan genel puan.
- `kontrol-paneli-kaosu`: her telefonda farklı dört renk kablo, başka paneli
  tarif eden özel ipucu, tek kablo kesme ve doğru kesimde kesen/ipuç sahibine +1.
- `zehirli-kadeh`: gizli zehir dağılımı, tek isteğe bağlı anlık takas, takas
  başına +5 saniye ve süre sonunda temiz kadehe +1.

## Teknik uygulama

- `packages/shared/src/games-stage8.ts` içinde dokuz `Stage8GameAdapter` bulunur.
- Gizli roller, kelimeler, blöf sahipleri, çizim görevi, panel ilişkisi ve zehir
  durumu sunucuda tutulur; maç state'inde yalnızca o oyuncuya ait
  `ownGameState` alanına gereken bilgiler gönderilir.
- Çok fazlı oyunların iç akışı (`write → discussion → guess`, `draw → vote`,
  `bargain → vote` vb.) dış motorun `playing` fazı içinde sunucu saatiyle
  ilerler. Adapter bittiğinde ortak motor sonuç fazına geçer.
- Çizim için ağ üzerinden kare gönderilmez; oyuncunun vektör stroke listesi
  saklanır ve sonuçta birlikte çizilir. Stroke sayısı, nokta sayısı ve renkler
  kontrollü bir sözleşmeyle kabul edilir.
- `apps/client/src/games/Stage8GameControls.tsx` tüm dokunmatik formları,
  seçim kartlarını, canvas çizimini, kablo panelini ve kadeh takasını içerir.
- Neon Toybox görsel tokenları ve `glix-shell-v5` PWA cache sürümü korunur.

## Doğrulama

- `npm test`: 27 test geçti; Stage 8 için dokuz adapter davranış testi eklendi.
- `npm run typecheck`: shared, client ve server geçti.
- `npm run build`: shared, client ve server production build'i geçti.

## Kapsam notu

Katalogdaki iki oyun (`rus-ruleti`, `son-kisi`) henüz gerçek adapter'a alınmadı.
Bunlar Aşama 9'un kalan oyun diliminde ele alınacak; bu nedenle Aşama 8,
Paket B'nin formda kuralları kilitli olan dokuz oyununu kapsar.
