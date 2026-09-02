# Aşama 10 — Teslim, yayın hazırlığı ve kalite kapısı

## Kapsam

Bu aşama, 24 mini oyun adapter'ı tamamlandıktan sonra Glix'i yerel prototipten
production'a taşımak için gereken son ortak işleri kapsar:

- aynı origin üzerinden PWA + WebSocket bağlantısı;
- küçük telefonlarda safe-area, dokunma hedefi ve yatay taşma düzeni;
- server health, heartbeat ve kontrollü kapanış;
- katalog/adapter kapsam testi;
- Ubuntu VDS için mevcut servislerden izole Docker Compose yayını.

## Uygulanan değişiklikler

- `apps/client/src/App.tsx` production build'de `wss://aynı-host/ws`, geliştirme
  ortamında `ws://localhost:8787/ws` kullanıyor. `VITE_WS_URL` verilirse açık
  yapılandırma öncelikli; istemci 10 saniyede bir uygulama ping'i gönderiyor ve
  ağ geri geldiğinde yeniden bağlanmayı deniyor.
- `apps/client/src/styles.css` 320px alt sınır, safe-area, landscape oyun
  sıkıştırması, en az 44px dokunma alanı, iOS input zoom ve reduced-motion
  kurallarını kapsıyor.
- `apps/client/public/sw.js` `glix-shell-v7` ile güncellendi; ortak sahne,
  karakter roster'ı ve ilk oyun görselleri kabuk önbelleğinde.
- `apps/server/src/index.ts` geçerli port doğrulaması, daha açıklayıcı `/health`,
  WebSocket ping/pong heartbeat, gönderim hatası yakalama ve `SIGINT`/`SIGTERM`
  graceful shutdown davranışı içeriyor.
- `packages/shared/src/catalog-stage10.test.ts`, 24 oyunun katalogda eksiksiz
  ve tekrarsız olduğunu, Stage 6–9 factory/guard gruplarının tam kapandığını,
  minimum oyuncu filtrelerini ve her adapter'ın başlangıç state'ini test ediyor.
- `scripts/realtime-smoke.mjs`, health → iki istemci → oda → oyun seçimi →
  maç/tutorial akışını çalışan server üzerinde hızlıca doğruluyor.
- `deploy/` altında client/server Dockerfile, Compose, Nginx WebSocket/SPA
  proxy'si, örnek environment ve Ubuntu işletim notları bulunuyor.

## Doğrulama kanıtı

- `npm test`: **37/37** başarılı.
- `npm run typecheck`: shared, client ve server başarılı.
- `npm run build`: production client/server build başarılı.
- `npm run smoke:realtime`: health ve iki istemcili oda/maç tutorial smoke
  başarılı.
- Browser QA: 320×700 ve 844×390 viewport'larında DOM, safe-area/yatay taşma
  metrikleri ve responsive lobi kontrol edildi; `scrollWidth`, viewport
  genişliğini aşmadı; konsol warning/error görülmedi.
- VDS read-only kontrolü: Ubuntu kernel, Docker Engine ve Docker Compose mevcut;
  mevcut `deploy-web`, `deploy-api`, `deploy-caddy` stack'i ayrı çalışıyor.

## VDS yayın sınırı

Glix için ayrı Compose projesi `glix-party`, loopback edge portu `127.0.0.1:18080`
ve `glix-internal` ağı kullanır. Mevcut `api.lynrax.com` ve `game.lynrax.com`
servislerine dokunulmaz.

`glix.lynrax.com` şu an DNS'te tanımlı olmadığı için mevcut host Caddy
yapılandırmasına public route/SSL bloğu eklenmedi. Bu bilgi tamamlandığında

1. `deploy/.env` içindeki alan adı placeholder'ı değiştirilir;
2. `docker compose ... config` ve `up -d --build` çalıştırılır;
3. host Caddy'ye yalnızca yeni Glix alan adı için `127.0.0.1:18080` proxy bloğu
   eklenir;
4. HTTPS `/health`, PWA açılışı ve `wss://.../ws` smoke testi yapılır.

Oyun odaları RAM'de kaldığı için container restart'ında aktif odaların silinmesi
beklenen davranıştır; kalıcı veri deposu eklenmedi.

## Aşama sonucu

Katalog, istemci, server ve production paketleme ilk arkadaş grubu pilotuna
hazırdır. Public erişimin son adımı domain DNS ve host TLS proxy bilgisidir;
bu iki bilgi olmadan mevcut çalışan servisleri riske atmamak için yalnızca izole
yayın paketlendi.
