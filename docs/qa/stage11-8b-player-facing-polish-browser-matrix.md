# Stage 11.8B — player-facing polish browser matrix

Tarih: 2026-09-06<br>
Ortam: Vite istemcisi (`http://localhost:5173`), gerçek WebSocket sunucusu (`ws://127.0.0.1:8787/ws`), Chromium üzerinden `npx --yes agent-browser`.

Bu dosyadaki görseller gerçek tarayıcı akışından alınmıştır; temsili/mock ekran değildir. Her ana oyun akışında erişilebilirlik snapshot'ı, konsol ve sayfa hata kontrolü yapıldı. Konsolda yalnızca Vite/React geliştirme bilgilendirmeleri görüldü; sayfa hatası görülmedi.

## Ana oyun yüzleri

| Oyun / durum | Viewport | Kanıt | Kontrol |
| --- | ---: | --- | --- |
| Sızma — oynanış | 390×844 | [sizma-390x844-playing.png](screenshots/stage11-8b-player-facing-polish/sizma-390x844-playing.png) | Boru/valf ana nesne, doğal Türkçe panel, iç kaydırma |
| Rus Ruleti — yatay oynanış | 844×390 | [rus-ruleti-844x390-playing.png](screenshots/stage11-8b-player-facing-polish/rus-ruleti-844x390-playing.png) | Kapalı hazne ana nesne, yatay yerleşim |
| Kör Bomba — yatay oynanış | 844×390 | [kor-bomba-844x390-playing.png](screenshots/stage11-8b-player-facing-polish/kor-bomba-844x390-playing.png) | Sigorta/bomba ana nesne, hedef tepsisi |
| Zehirli Kadeh — oynanış | 390×844 | [zehirli-kadeh-390x844-playing.png](screenshots/stage11-8b-player-facing-polish/zehirli-kadeh-390x844-playing.png) | Bağlı kadehler ana nesne, takas paneli |
| Çapraz Ateş — oynanış | 390×844 | [capraz-ates-390x844-playing.png](screenshots/stage11-8b-player-facing-polish/capraz-ates-390x844-playing.png) | Neon retikül ana nesne, hedef düğümleri |
| Zaman Bombası Hafızası — oynanış | 390×844 | [zaman-bombasi-hafizasi-390x844-playing.png](screenshots/stage11-8b-player-facing-polish/zaman-bombasi-hafizasi-390x844-playing.png) | Işık duvarı ana nesne, renk pedleri |

## Durum ve etkileşim matrisi

| Durum | Oyun / viewport | Kanıt | Gerçek gözlem |
| --- | --- | --- | --- |
| Etkileşim | Sızma 320×700, Memory 320×700 ve 390×520 | [sizma-320x700-playing.png](screenshots/stage11-8b-player-facing-polish/sizma-320x700-playing.png), [zaman-bombasi-hafizasi-320x700-playing.png](screenshots/stage11-8b-player-facing-polish/zaman-bombasi-hafizasi-320x700-playing.png) | Dar portrede kontroller iç sahne içinde kalıyor; yatay taşma yok |
| Dar yatay | Rus Ruleti 667×375, Kör Bomba 667×375 | [rus-ruleti-667x375-playing.png](screenshots/stage11-8b-player-facing-polish/rus-ruleti-667x375-playing.png), [kor-bomba-667x375-result.png](screenshots/stage11-8b-player-facing-polish/kor-bomba-667x375-result.png) | Her iki yatay genişlikte de sahne taşmadan okunuyor; Kör Bomba sonucu da kontrol edildi |
| Bekleyen hamle | Çapraz Ateş 390×844 | [capraz-ates-pending-390x844.png](screenshots/stage11-8b-player-facing-polish/capraz-ates-pending-390x844.png) | Seçilen düğümde `SEÇİM BEKLENİYOR` durumu görünür; hedef geçici olarak kilitleniyor |
| Kabul edilmiş hamle | Çapraz Ateş 390×844 | [capraz-ates-accepted-390x844.png](screenshots/stage11-8b-player-facing-polish/capraz-ates-accepted-390x844.png) | Sunucu sonrası DOM: `Seçimin kaydedildi. Sonuç açılana kadar hedefin gizli.` |
| Sonuç | Kör Bomba 667×375 | [kor-bomba-667x375-result.png](screenshots/stage11-8b-player-facing-polish/kor-bomba-667x375-result.png) | Gerçek sonuç katmanı ve `Rota tamamlandı.` |
| Sonuç | Memory 390×844 | [zaman-bombasi-hafizasi-result-overlay-390x844.png](screenshots/stage11-8b-player-facing-polish/zaman-bombasi-hafizasi-result-overlay-390x844.png) | Sonuç katmanı skorları ve elenenleri gösteriyor |
| Seyirci / elenen oyuncu | Memory 390×844 | [zaman-bombasi-hafizasi-spectator-390x844.png](screenshots/stage11-8b-player-facing-polish/zaman-bombasi-hafizasi-spectator-390x844.png) | Gerçek elenme sonrası `SEYİRCİ MODU` DOM durumu; özel renk pedi devre dışı |
| 8 oyuncu yoğunluğu | Memory 390×844 | [zaman-bombasi-hafizasi-8-player-density-playing-390x844.png](screenshots/stage11-8b-player-facing-polish/zaman-bombasi-hafizasi-8-player-density-playing-390x844.png) | Gerçek oda `8/8`; üst oyuncu şeridinde sekiz oyuncu pipi ve kısaltılmış uzun adlar |
| Yönlendirme | Rus Ruleti 390×844 | [rus-ruleti-portrait-rotate-overlay-390x844.png](screenshots/stage11-8b-player-facing-polish/rus-ruleti-portrait-rotate-overlay-390x844.png) | `Cihazını yatay çevir.` yönlendirmesi ve sahne karartması |
| Bağlantı kesintisi | Rus Ruleti 844×390 | [rus-ruleti-reconnect-844x390.png](screenshots/stage11-8b-player-facing-polish/rus-ruleti-reconnect-844x390.png) | Ağ kesintisi simülasyonunda `navigator.onLine=false`, `glix-connection-offline` ve `BAĞLANTI YOK` |

## Responsive ölçüm özeti

`document.documentElement.scrollWidth/scrollHeight` her kontrol edilen viewport'ta viewport ölçüsüne eşitti. Sahne içindeki `scrollWidth`, `clientWidth` değerine eşitti; uzun içerik yalnızca sahnenin kendi kaydırma alanında kaldı. Görünür küçük buton ölçümünde (`rect.width < 44 || rect.height < 44`) sonuç her kontrol edilen ekranda `[]` oldu.

| Akış | Viewport | Belirlenen sahne ölçüsü (`scrollWidth/clientWidth × scrollHeight/clientHeight`) |
| --- | ---: | ---: |
| Sızma | 390×844 | 366/366 × 663/663 |
| Sızma | 320×700 | 296/296 × 519/519 |
| Sızma | 390×520 | 366/366 × 339/339 |
| Rus Ruleti | 667×375 | 643/643 × 255/255 |
| Kör Bomba | 667×375 | 643/643 × 255/255 |
| Zehirli Kadeh | 390×844 | 366/366 × 663/663 |
| Çapraz Ateş | 390×844 | 366/366 × 663/663 |
| Memory | 390×844 | 366/366 × 663/663 |
| Memory | 320×700 | 296/296 × 519/519 |
| Memory | 390×520 | 366/366 × 339/339 |

## Otomatik doğrulama

- `npm test`: engine `86/86`, server entegrasyon `10/10`, hata `0`.
- `npm run typecheck`: shared, client ve server başarılı.
- `npm run build`: client Vite derlemesi ve server TypeScript derlemesi başarılı.
- `npm run smoke:realtime`: gerçek WebSocket oda/maç smoke akışı başarılı.
- `git diff --check`: temiz.

## Kapsam notu

Değişiklikler yalnızca Stage 11.8B'nin altı görseli, ortak istemci HUD/viewport kopyası ve responsive CSS ile sınırlıdır. KPK, Kendim ve sunucu/shared oyun kontratları değiştirilmedi. Görsellerde özel oyun durumu DOM kimliği, erişilebilirlik adı, CSS sınıf eki veya SVG metadata'sına taşınmadı.

Son durum: `INDEPENDENT REVIEW REQUIRED — NOT YET ACCEPTED`
