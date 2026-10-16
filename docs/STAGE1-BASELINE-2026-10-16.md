# GLIX v1.0 — Aşama 1 Stabilizasyon ve QA Temel Raporu

**Tarih:** 2026-10-16  
**Korunan canlı taban:** `main` @ `12e3e5253edf9a6babed863b2351d1493a738816` (v0.7.0 / protocol v3)  
**Çalışma tabanı:** `redesign-mobile-first-v1` @ `1341a386fe35ac8b24d4ec29ad9c1c9581fae5ed` (protocol v4)  
**İzole branch:** `fix/stage1-core-stabilization-20261016`  
**Taslak kalite PR:** https://github.com/xpike-dgm/glix/pull/5  
**QA çalışma yolu:** `/srv/glix-stage1-qa` (canlıya bağlı olmayan çalışma kopyası)

## 1. Kapsam ve emniyet

Bu turda `main` branch'e merge veya canlı GLIX deploy yapılmadı. VDS üzerinde DGMusic/Mailu servisleri ve domain/proxy yapılandırması değiştirilmedi. Özel GitHub deposu VDS içindeki `git` ile kimlik doğrulayamadığı ve host'ta Node.js bulunmadığı için kaynak kodun **148 adet** gerekli kod/yapılandırma dosyası GitHub bağlantısıyla izole QA klasörüne kopyalandı. Ekran görüntüleri ve büyük görsel asset seti test kopyasına alınmadı; bu yüzden görsel parity ve gerçek telefon QA burada iddia edilmiyor. Node.js 22 Alpine yalnızca kaynak kısıtlı, ephemeral Docker QA konteynerinde çalıştırıldı.

## 2. Yapılan kod düzeltmeleri

- `apps/client/src/App.tsx`: server-authoritative `tutorial` fazındaki `Hazırım` butonu artık uygun bağlı katılımcıda kullanılabilir; spectator/offline/ready için kilit korunur.
- `apps/client/src/App.tsx`: Hazır sayımı yalnız bağlı, bu oyun için katılımcı ve elenmemiş oyuncuları kapsar.
- `apps/client/src/App.tsx`: lobby `onKickPlayer` arayüzü mevcut host-only sunucu protokolüne bağlandı.
- `apps/client/src/dev-r1.tsx`: preview mock'ları protocol v4 ile type-safe yapıldı.
- `apps/client/src/App.tsx`: jenerik kategori anlatımı yerine gerçek 24 oyun ID'sinin tamamı için ayrı mini oyun briefingi yazıldı.
- `scripts/stage1-ui-regression.test.mjs`: hazır butonunun enabled/disabled durumları ve App bağlantıları için 4 regresyon kontrolü eklendi.
- `package.json`: `test:client-ui` komutu genel `npm test` zincirine dahil edildi.

## 3. Gerçek çalıştırılmış QA sonuçları

| Kontrol | Sonuç | Kanıt |
| --- | --- | --- |
| `npm ci --no-audit --no-fund` | PASS | Node 22 / Alpine, ephemeral Docker |
| `npm run typecheck` | PASS | shared + client + server TypeScript |
| `npm run build` | PASS | shared + Vite PWA + server |
| Oyun motoru testleri | **119/119 PASS** | `npm run test:engine` |
| PWA / protocol grupları | **6 grup PASS** | `npm run test:client-pwa` |
| Privacy testleri | **3/3 PASS** | `npm run test:client-privacy` |
| Sunucu entegrasyon testleri | **28/28 PASS** | `npm run test:server` |
| Yeni UI regresyon testleri | **4/4 PASS** | `npm run test:client-ui` |
| Gerçek WebSocket smoke | PASS (oda + ilk `tutorial`) | `npm run smoke:realtime` |
| Değişiklik sonrası yeniden typecheck/build/UI/PWA | PASS | İzole QA Docker |

**Toplam numaralı test:** 154/154. PWA/protocol kontrol grupları bu sayıya dahil edilmeyip ayrıca raporlanır.

**Sınır:** Smoke script'i maçın tüm turlarını tamamlamaz. Testlerin geçmesi gerçek 3–8 telefon ve referans ekran paritesi garantisi değildir.

**GitHub Actions:** Draft PR #5'in `CI Release Gate` koşusu 2026-10-16 tarihinde kısa sürede `failure` sonucuyla bitti; GitHub eklentisi job steps ve job log'larını boş/404 döndürdü. Dolayısıyla GitHub CI'nin kök nedeni **doğrulanamadı**. Bu, release gate için **açık engel** olarak tutuluyor; yalnız yerel QA yeşil diye CI'nin başarıyla geçtiği iddia edilmez.

## 4. 24 oyun için sistematik QA envanteri

Kod ve shared adapter/katalog varlığı doğrulandı. Aşağıdaki her mini oyun, Aşama 3'te sunucu kuralları + UI + 2/3/5/8 oyuncu varyantlarıyla ayrı ayrı gerçek turlarda doğrulanacaktır. 'Audit pending' ifadesi bu turdaki **gerçek telefon onayı verilmedi** anlamındadır.

| # | ID | Kategori | Test zorunluluğu |
|---:|---|---|---|
| 1 | `yazi-yaz` | Sosyal | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 2 | `kendim` | Sosyal | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 3 | `sizma` | Sosyal | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 4 | `sozluk-blofu` | Sosyal | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 5 | `cagrisim-agi` | Sosyal | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 6 | `butona-bas` | Zaman | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 7 | `rus-ruleti` | Risk | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 8 | `gizli-hirsiz` | Zaman | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 9 | `kor-kronometre` | Zaman | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 10 | `kor-bomba` | Risk | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 11 | `rusvet-darbe` | Strateji | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 12 | `acgozluluk-limiti` | Sayı | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 13 | `ortalamanin-yarisi` | Sayı | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 14 | `gizli-kareler` | Strateji | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 15 | `karalama-defteri` | Sosyal | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 16 | `ittifak` | Sosyal | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 17 | `son-kisi` | Zaman | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 18 | `cizgiyi-gecme` | Sayı | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 19 | `gizli-alisveris` | Strateji | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 20 | `asiri-yukleme` | Zaman | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 21 | `kontrol-paneli-kaosu` | Strateji | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 22 | `zehirli-kadeh` | Risk | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 23 | `capraz-ates` | Strateji | Kural / gizlilik / skor / timeout / reconnect / mobil UI |
| 24 | `zaman-bombasi-hafizasi` | Hafıza | Kural / gizlilik / skor / timeout / reconnect / mobil UI |

## 5. Açık kusur / risk kaydı

| ID | Öncelik | Durum | Gerekli iş |
|---|---|---|---|
| S1-01 | P0 | KOD DÜZELDİ, UI regresyon testi geçti | Gerçek çoklu telefonda briefing → playing akışı doğrulanacak |
| S1-02 | P1 | KOD DÜZELDİ, sunucu H17 geçti | Host kick UI gerçek tarayıcı akışı doğrulanacak |
| S1-03 | P1 | KOD DÜZELDİ | 24 oyun özel anlatımlarını kural formu ile editöryel doğrula ve Stage 2 görsellerine uygula |
| S1-04 | P1 | AÇIK | Guest lobisinde oyun seçimi görünürlüğü ve sunucu private/public lobi projeksiyonu ayrılacak |
| S1-05 | P1 | AÇIK | R2/R3/R4 referans eşleşmesi, 24 oyun sahne görsel paritesi ve touch QA |
| S1-06 | P1 | AÇIK | GitHub Actions PR #5 CI failure, job log erişimi sağlanıp kök neden kapatılmalı |
| S1-07 | P1 | AÇIK | Gerçek iOS/Android cihazlarda 3–8 oyunculu oturum/yeniden bağlantı QA |
| S1-08 | P2 | AÇIK | Eski ve yeni branch değişimlerinin yeniden entegrasyon/owner review'u |
| S1-09 | P2 | AÇIK | Büyük tek dosya App/server ve ortak CSS modülerleştirme (kontrollü, kuralsız refactor yok) |
| S1-10 | P2 | AÇIK | QA statik asset eksikliğinden gelen Workbox glob uyarısının tam asset release kopyasında doğrulanması |

## 6. Durum ve sonraki kapı

**Aşama 1 kod / yerel QA başlangıç kapısı başarılı. Aşama 1'in tam release kabulü henüz verilmedi:** GitHub CI job hata nedeni doğrulanmadı; 24 oyunun eksiksiz gerçek cihaz ve referans kontrolü zaten sonraki aşamaların kapsamı. Tamamlanmayan işi 'tamamlandı' olarak işaretleme.

Aşama 2'ye geçmeden önce tasarım kanonunu `docs/design/GLIX-MASTER-REFERENCE.png`, 13 ortak ve 24 oyun için onaylı ayrı PNG referanslarıyla eşleştir. Sunucu authority / gizli state / kural formunu koru.
