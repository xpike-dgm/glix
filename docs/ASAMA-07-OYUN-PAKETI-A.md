# Aşama 7 — Oyun Paketi A

Bu aşamada kural formunda kilitlenen zaman, sayı, gizli hamle ve risk oyunları
ortak gerçek zamanlı motorun üzerine alındı. Paket A'daki 10 oyunun her biri
kendi sunucu adapter'ı, private state'i, telefon kontrolü ve sonuç puanlamasıyla
çalışır.

## Kapsamdaki oyunlar

| Oyun | Oyuncu | Oynanış süresi | Adapter özeti |
|---|---:|---:|---|
| Gizli Hırsız | 2–8 | 30 sn | Tek gizli `ÇAL`; tek basan +1, çoklu basanlar −1 |
| Kör Kronometre | 2–8 | 18 sn | Görünmeyen 10. saniyeye en yakın basış +2, ikinci +1 |
| Kör Bomba | 2–8 | Patlayana kadar | Taşıyıcı zamanı görmez; başarılı pas kalan süreye 1–4 sn ekler |
| Açgözlülük Limiti | 3–8 | 20 sn | Seçim toplamı sabit limiti aşmazsa seçilen sayı kadar puan |
| Ortalamaya En Yakın | 3–8 | 20 sn | Hedef, seçimlerin ortalamasının yarısıdır |
| Gizli Kareler | 2–8 | 2 × 20 sn | Aynı kareye basanlar elenir; tek kalanlar +1 |
| Çizgiyi Geçme | 2–8 | 30 sn | Aynı onluk bölgede olanlar pasif; tek bölgelerden en yüksek +2 |
| Gizli Alışveriş | 3–8 | 30 sn | 60 krediyle gizli sepet; ürün değeri alıcı sayısına bölünür |
| Aşırı Yükleme | 2–8 | Enerji + gizli 3 sn | 100 sonrası taşıran tık patlar; diğerleri tık sayısına göre sıralanır |
| Çapraz Ateş | 3–8 | 25 sn | Tek gizli hedef; karşılıklı hedefler 0, hedeflenen −1 |

## Ortak teknik sözleşme

`packages/shared/src/games-stage7.ts` içinde `Stage7GameAdapter` sözleşmesi ve
10 adapter bulunur. Her adapter:

- sunucu zamanını kullanır;
- hamleyi kendi kuralına göre doğrular;
- tekrar, geç, geçersiz ve seyirci hamlelerini ayırır;
- public state ile oyuncuya özel state'i birbirinden ayırır;
- mini oyun puanını ve genel skora yazılacak `ScoreDelta` kayıtlarını üretir;
- oda içindeki oyuncu ayrılmasını kendi geçici state'ine işler.

Ortak dış fazlar değişmeden kalır:

`tutorial (10 sn) → preparing (5 sn) → playing → results (6 sn) → transition (3 sn)`

Süreli oyunlarda `playing` fazı ortak motor tarafından, özel bitiş koşullu
oyunlarda (`Kör Bomba`, `Gizli Kareler`, `Aşırı Yükleme`) adapter tarafından
kapatılır. Sunucu adapter bitişini gördüğünde dış motoru manuel olarak sonuç
fazına taşır.

## Gizlilik ve sonuç görünümü

Oyun devam ederken aşağıdaki bilgiler diğer oyunculara gönderilmez:

- Gizli Hırsız basış yapan oyuncular
- Kör Kronometre basış zamanları
- Kör Bomba'nın gerçek patlama zamanı; taşıyıcıya kalan süre hiç verilmez
- Sayı/risk oyunlarındaki seçimler
- Gizli Kareler'deki hücre seçimleri
- Gizli Alışveriş sepetleri ve ürün alıcı sayıları
- Çapraz Ateş hedefleri

Sonuç fazında ilgili public state açılır. `ownGameState`, her telefonda yalnızca
oyuncunun kendi seçimini, sepetini, pas hakkını, tık sayısını veya hedef
durumunu taşır. İstemcinin `clientTime` alanı puanlama için kullanılmaz.

## İstemci kontrol yüzeyi

`apps/client/src/games/Stage7GameControls.tsx` içinde her oyun için ayrı
kontrol bulunur:

- büyük tek dokunuş butonları: Gizli Hırsız, Kör Kronometre, Aşırı Yükleme;
- taşıyıcıya özel hedef seçimi: Kör Bomba;
- sayı seçiciler ve slider'lar: Açgözlülük, Ortalama, Çizgiyi Geçme;
- gizli hücre ızgarası: Gizli Kareler;
- kredi ve ürün kartı sepeti: Gizli Alışveriş;
- hedef kartları ve boşa sıkma seçeneği: Çapraz Ateş.

Kontroller CSS ile Neon Toybox katmanına bağlanır. Sahne tarafında oyun özel
renk/reaktör durumları prosedürel olarak üretilir; ağ üzerinden animasyon karesi
gönderilmez. Yeni istemci yüzeyleri için PWA shell cache'i `glix-shell-v4`
olarak yenilenir.

## Test ve kabul

- `packages/shared/src/games-stage7.test.ts` her oyun için kuralın kritik
  sonucunu test eder.
- `npm test` — ortak motor ve üç önceki oyun dahil **18 test geçti**.
- `npm run typecheck` — shared, client ve server geçti.
- `npm run build` — üretim istemci ve sunucu derlemesi geçti.
- Canlı WebSocket smoke testinde Aşırı Yükleme 100 enerjiye ulaştırıldı;
  gizli pencere içinde taşma tıklamasıyla oyuncu patlatıldı ve dış sonuç fazı
  açıldı.

## Sonraki aşama

Aşama 8'de sosyal, stratejik ve etkileşimli oyunlar (`Yazı Yaz`, `Kendim`,
`Sözlük Blöfü`, `Çağrışım Ağı`, `Rüşvet ve Darbe`, `Karalama Defteri`, `İttifak`,
`Kontrol Paneli Kaosu`, `Zehirli Kadeh`) aynı adapter sözleşmesine alınacak.
Sesli iletişim uygulamaya eklenmeyecek; sözlü pazarlık gereken oyunlarda
uygulama yalnızca sıra, gizli bilgi, hazır ve oy durumunu yönetecek.
