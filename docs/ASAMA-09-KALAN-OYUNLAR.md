# Aşama 9 — Kalan Oyunlar ve Tam Katalog Kapısı

## Sonuç

Aşama 9 tamamlandı. Katalogda gerçek adapter bekleyen son iki mini oyun,
ortak WebSocket maç akışına ve telefon kontrol yüzeyine bağlandı.

## Eklenen oyunlar

- `rus-ruleti`: Rastgele silah sahibi, 18 saniyelik karar süresi, kendini veya
  hayatta olan başka bir oyuncuyu hedefleme, %16 başlangıç riski, güvenli atışta
  +10 risk ve %76 üst sınır, patlamada hedef eliminasyonu, yarı eşiğinde bitiş.
  Risk yüzdesi yalnızca silah sahibinin `ownGameState` alanında gösterilir.
- `son-kisi`: Sunucuda seçilen ve oyunculara gönderilmeyen 10–20 saniyelik gizli
  bitiş, oyuncu başına tek kaçış hakkı, sunucu alım zamanına göre son kaçışın
  +1, erken kaçışın 0, kaçmamanın -1 puan olması. Aynı milisaniyedeki son
  kaçışların tamamı +1 alır.

## Teknik uygulama

- `packages/shared/src/games-stage9.ts` içinde iki `Stage9GameAdapter`
  bulunur; olay, zaman ve sonuçlar sunucu saatine göre çözülür.
- `apps/server/src/index.ts` Stage 9 adapter'larını oda rotasına, manuel faz
  geçişine, input rejection kodlarına ve sonuç aktarımına bağlar.
- `apps/client/src/games/Stage9GameControls.tsx` Rus Ruleti hedef/risk paneli
  ile Son Kişi gizli zaman/kaçış panelini Neon Toybox mobil yüzeyi olarak sunar.
- Rus Ruleti'nde risk yalnızca ilgili oyuncunun ekranında görünür. Son Kişi'nin
  gerçek bitiş zamanı ve sayaç değeri sonuç ekranına kadar istemciye hiç verilmez.
- PWA shell cache'i `glix-shell-v6`, client/server sürüm bilgisi `0.7.0` oldu.

## Doğrulama

- `npm test`: 33 test geçti; Stage 9 için 6 adapter testi eklendi.
- `npm run typecheck`: shared, client ve server geçti.
- `npm run build`: shared, client ve server production build'i geçti.
- Canlı iki istemcili WebSocket testinde `son-kisi` tutorial → preparing →
  playing → results akışı, gizli alanların (`phaseEndsAt`, `durationMs`) null
  kalması ve sonuç puanları doğrulandı.

## Durum

24 oyunluk katalogda gerçek adapter bekleyen oyun kalmadı. Sonraki çalışma;
tam rota testi, mobil tarayıcı UX/performance kontrolü, hata/yeniden bağlanma
senaryoları ve VDS dağıtım kapısıdır.
