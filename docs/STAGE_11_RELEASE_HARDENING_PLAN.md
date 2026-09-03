# GLIX Stage 11 — Release / Security / PWA Hardening Plan

Audit tarihi: 2026-09-03
Audit referansı: `main` → `2118d9ab254c4e69988c6192e9fe6409dad333c7`
Kapsam: yalnızca audit, doğrulama ve uygulanabilir hardening planı.
Uygulama durumu: bu görevde runtime, PWA, Docker, Nginx, CI veya deployment dosyası değiştirilmedi.

Bu rapor güncel `main` blob'ları `git show main:<path>` ile incelenerek hazırlandı. Çalışma ağacı farklı bir asset branch'indedir ve kapsam dışı untracked dokümanlar audit kanıtı olarak kullanılmadı. Stage 10 ve Stage 11 dokümanları iddia/bağlam olarak ele alındı; tek başına doğrulama kanıtı sayılmadı.

## 1. Executive Summary

### Karar

- **P0:** Kanıtlanmış bir P0 yok.
- **Kapalı arkadaş grubu pilotu:** Yalnızca trusted/online ve erişimi kısıtlı bir pilot olarak, gerçek edge rotası ve odaklı telefon/multi-game QA kapıları geçildikten sonra koşullu olarak uygun.
- **Küçük public V1:** Bu ref için **NO-GO**. Public HTTPS/WSS rotası tamamlanmamış; WebSocket kaynak/abuse sınırları yok; PWA shell ve mobil lifecycle davranışı doğrulanmamış; mixed-version koruması ve otomatik release gate'leri eksik.

GLIX için offline gameplay hedeflenmemelidir; oyun WebSocket'e bağlıdır. Bununla birlikte, install edilmiş PWA'nın temiz shell yüklemesi, bağlantı kaybının anlaşılır gösterimi ve yeniden bağlanabilir bir UX public V1 için beklenmelidir.

### Öncelik özeti

| Alan | Mevcut karar | Pilot | Public V1 |
|---|---|---|---|
| Public DNS/TLS/WSS | Gerçek hostname ve host TLS route yok; placeholder var | Uzak telefon pilotu için P1 gate; yalnız private/LAN pilotunda kapsam dışı olabilir | P1 blocker |
| WebSocket abuse/resource kontrolü | `maxPayload`, rate, origin, global quota ve backpressure yok | P2, yalnız güvenilir ve kapalı erişimde | P1 blocker |
| PWA shell | Hashed JS/CSS service-worker precache yok; genel HTML fallback var | P2; online-only kapsam açıkça yazılmalı | P1 reliability gate |
| Protocol compatibility | Version yayınlanıyor, fakat mismatch enforce edilmiyor | P2; aynı build/atomic deploy ile geçici kabul | P1 gate if mixed/rolling release |
| Fiziksel cihaz QA | Tracked cihaz kanıtı yok | P1 pilot QA gate | P1 public evidence gate |
| CI/E2E | Local script'ler var, GitHub Actions/browser E2E yok | P2; tekrarlanabilir manuel checklist geçici olabilir | P1 release-governance gate |
| Container/Nginx hardening | Temel izolasyon iyi; public headers ve edge hardening eksik | P2 | P2, public route için gerekli alt maddeler P1 |

## 2. Current Release Posture

### GOOD

- `main` mevcut multiplayer participant/reconnect düzeltmelerini içeriyor: current-game participant snapshot, spectator izolasyonu, connected-player bazlı oyun uygunluğu ve invalid next-game tail'inin atlanması mevcut (`apps/server/src/index.ts:523-562`, `1125-1163`).
- Server tarafında 24-byte random reconnect token, room-bound session index, duplicate socket fencing, host migration, heartbeat, grace cleanup ve graceful shutdown var (`apps/server/src/index.ts:395-425`, `621-801`, `1555-1717`).
- Host yetkisi, phase/participant guard'ları ve temel JSON/finite-number/drawing doğrulamaları server tarafında uygulanıyor.
- `main` test script'i shared testleri ve server reconnect integration testlerini içeriyor; mevcut integration suite beş senaryoda current-game reconnect, spectator, host migration, duplicate socket, connected-player limit ve invalid next-game route davranışlarını kapsıyor (`package.json:18-20`, `apps/server/test/reconnect.integration.test.mjs:348-677`).
- Compose server'ı internal network'te tutuyor; client edge portunu varsayılan olarak loopback'e bağlıyor; healthcheck, restart policy ve log rotation mevcut (`deploy/docker-compose.yml:3-73`). Server image `USER node` kullanıyor (`deploy/server.Dockerfile:24-50`).

### NEEDS WORK

- Public internet availability/security baseline'ı yok: frame/resource limitleri, origin allowlist, abuse budget'leri ve public route henüz tamamlanmamış.
- PWA service worker generated bundle'ları bilmiyor; offline fallback asset türünü ayırt etmiyor.
- `PROTOCOL_VERSION` ve `server:ready` yalnızca ilan ediliyor; client/server mismatch fail-closed değil.
- Client WebSocket lifecycle'ı `close` ve `online` ile sınırlı; app resume/visibility, pong timeout, socket generation ve state ordering korumaları yok.
- Gerçek cihaz, tam multi-game route, 5/8 oyuncu ve aktif maç chaos kanıtı tracked değil.
- CI, browser E2E, Compose edge smoke, public HTTPS/WSS gate ve rollback kanıtı yok.

### BLOCKED

- Public release: gerçek DNS/TLS/host reverse-proxy rotası bilinçli olarak placeholder durumda (`deploy/nginx.conf:14-18`, `docs/ASAMA-10-TESLIM-VE-YAYIN.md:52-65`).
- Public WebSocket exposure: anonim room/socket flooding'e karşı minimum kaynak ve abuse sınırları yok (`apps/server/src/index.ts:265-333`, `1590-1627`).
- Phone-targeted release confidence: Stage 10'da manuel browser/VDS iddiaları var, fakat current `main` içinde fiziksel cihaz veya yeniden üretilebilir browser artifact'ı yok (`docs/ASAMA-10-TESLIM-VE-YAYIN.md:36-50`).

## 3. Verified Existing Strengths

### Server ve oyun akışı

- **Participant semantiği:** `createMatch()` ve `startNextGame()` bağlı oyuncu snapshot'ını kullanıyor; uygun olmayan sonraki oyunlar atlanıyor, geçersiz route tail'i trim ediliyor (`apps/server/src/index.ts:983-1031`, `1125-1163`).
- **Reconnect continuity:** Token ile aynı player ID/room geri bulunuyor; mevcut game state ve score continuity integration testinde doğrulanıyor (`apps/server/src/index.ts:909-920`, `apps/server/test/reconnect.integration.test.mjs:348-519`).
- **Spectator isolation:** Current game participant olmayan oyuncuya private state/input count verilmiyor; ready ve submit server tarafında reddediliyor (`apps/server/src/index.ts:565-590`, `1230-1260`, `1378-1389`).
- **Host migration:** Eski host geri bağlandığında ownership otomatik geri alınmıyor; test mevcut davranışı doğruluyor (`apps/server/src/index.ts:665-710`, `apps/server/test/reconnect.integration.test.mjs:564-606`).
- **Server authority:** Gameplay acceptance server `now` ile yapılıyor; `clientTime` authoritative puanlama/süre kaynağı değil (`apps/server/src/index.ts:1413-1439`, `packages/shared/src/engine.ts:460-516`).

### Transport ve operasyon

- Server heartbeat 30 saniyelik native WebSocket ping/pong ile dead transport'ı sonlandırıyor (`apps/server/src/index.ts:1555-1629`).
- 120 saniyelik disconnected-player/empty-room grace ve token temizliği var (`apps/server/src/index.ts:621-663`, `760-801`).
- `SIGINT`/`SIGTERM` health'i draining yapıyor, odaları/soketleri kapatıyor ve 10 saniyelik hard deadline uyguluyor (`apps/server/src/index.ts:1659-1717`).
- Server container host portuna publish edilmiyor; client proxy ile server internal network üzerinden konuşuyor (`deploy/docker-compose.yml:9-73`).
- Nginx `/ws` için HTTP/1.1 upgrade, forwarded headers, buffering off ve uzun read/send timeout kullanıyor; `/assets/` için mevcut dosya dışında SPA HTML fallback'i yapmıyor (`deploy/nginx.conf:39-66`).

### PWA ve release altyapısı

- Manifest linki, `start_url`, `standalone`, theme/background renkleri ve root-scoped production service-worker registration mevcut (`apps/client/index.html:5-14`, `apps/client/public/manifest.webmanifest:2-18`, `apps/client/src/main.tsx:6-9`).
- Production WebSocket URL'si default olarak aynı-origin `ws/wss://<host>/ws`; development için localhost path'i seçiyor (`apps/client/src/App.tsx:35-50`).
- `.gitignore` `.env` dosyalarını koruyor; lockfile ve Docker'da `npm ci` kullanımı dependency reproducibility için olumlu (`.gitignore:1-12`, `.dockerignore:1-8`, `deploy/server.Dockerfile:7-22`).

## 4. Blockers

Bu bölüm yalnızca release kararını gerçekten durduran maddeleri içerir. Her eksiklik blocker değildir; pilot/public bağlamı ayrıca belirtilmiştir.

### B-01 — Public HTTPS/WSS route yok

- **Current state:** Nginx yalnızca HTTP dinliyor ve `glix.example.invalid` placeholder'ını kullanıyor. Stage 10, `glix.lynrax.com` DNS ve host Caddy/TLS route'unun bilinçli olarak eklenmediğini söylüyor.
- **Evidence:** `deploy/nginx.conf:14-18`; `deploy/.env.example:9-18`; `docs/ASAMA-10-TESLIM-VE-YAYIN.md:52-65`; `deploy/README.md:29-37,93-124`.
- **Risk:** Remote phone clients gerçek HTTPS origin ve `wss://` üzerinden doğrulanamaz; browser secure-context/PWA ve WebSocket deployment varsayımları kanıtsız kalır.
- **Severity:** **P1 public blocker**; uzak telefon pilotu için **P1 operational gate**; yalnız loopback/LAN/SSH ile kapalı pilot yapılırsa pilot blocker değildir.
- **Minimal recommended fix:** Gerçek DNS, host-level TLS ve ayrı Glix proxy server block'u kur; placeholder'ı gerçek hostname ile değiştir; aynı origin `/`, `/health`, `/ws` akışını koru.
- **Validation/test strategy:** Gerçek hostname üzerinden HTTPS PWA açılışı, certificate/redirect kontrolü, `/health`, iki-client `wss://host/ws` smoke, browser console ve external port scan. Mevcut Lynrax servislerinin etkilenmediğini ayrıca doğrula.

### B-02 — Public WebSocket kaynak/abuse baseline'ı yok

- **Current state:** WebSocket server explicit `maxPayload` veya Origin policy olmadan kuruluyor; parse öncesi frame byte cap, per-socket/IP/global rate, connection/room quota, invalid-message penalty ve outbound backpressure yok. Room create her socket için açık.
- **Evidence:** `apps/server/src/index.ts:265-333`, `862-948`, `1590-1627`; `packages/shared/src/index.ts:6-12`.
- **Risk:** Anonim bir istemci büyük JSON parse ettirebilir, geçerli input'ları tekrar tekrar gönderip input history ve broadcast fan-out yaratabilir, room/socket kaynaklarını 120 saniyelik grace boyunca tutabilir. Bu gerçek bir public availability riskidir; authentication eklemeden de oluşur.
- **Severity:** **P1 public blocker**; trusted/private pilot için **P2**. P0 değildir; ölçülmüş exploit veya production outage kanıtı yoktur.
- **Minimal recommended fix:** Ölçülmüş meşru payload'a göre explicit küçük `maxPayload`; binary reject; bounded field/string/array/object/depth validation; per-socket ve trusted-proxy-aware per-IP token bucket; room/socket/input-history/outbound buffer ceiling; invalid frame strike/backoff; drawing save quota. OAuth/JWT gerekli değildir.
- **Validation/test strategy:** Black-box oversized/deep/wide/binary frame, malformed-message flood, valid input flood, room-create/join flood, slow receiver, max drawing ve heartbeat testleri; CPU/memory/active-socket/room/output queue ölçümleri.

### B-03 — Phone release QA kanıtı ve tam route gate'i yok

- **Current state:** Current `main` server integration testleri 2/3 oyunculu belirli reconnect/participant invariants'larını kapsıyor; tam browser journey, fiziksel iOS/Android cihaz, 5/8 oyuncu, keyboard/background/lock/Wi-Fi ve complete multi-game route artifact'ı yok.
- **Evidence:** `apps/server/test/reconnect.integration.test.mjs:348-677`; `package.json:18-22`; `docs/ASAMA-10-TESLIM-VE-YAYIN.md:36-50`; `GLIX-PROJE-HAFIZASI.md:990-1008`.
- **Risk:** Server-side invariant'lar doğru olsa bile mobile viewport, installed PWA lifecycle, stale tab, orientation veya transition sırasında kullanıcı akışı bozulabilir.
- **Severity:** Phone-targeted **P1 evidence/QA gate**; bir exploit blocker değildir. Trusted pilot için de pilot tamamlandı denmeden önce P1 gate olarak geçmelidir; local smoke-only prototip için blocker değildir.
- **Minimal recommended fix:** Aşağıdaki Device QA ve Chaos matrisi ile ölçülebilir acceptance artifact'ları üret; pilotu önce 2/3 oyuncu ve temel route ile daralt; public V1 öncesi dört runtime ve 2/3/5/8 kapsamını kapat.
- **Validation/test strategy:** Her testte commit SHA, device/OS/browser mode, route, player count, timestamps, phase/game/stateVersion, screenshot/video, console ve server `/health` kaydet.

### B-04 — PWA shell reliability claim'i doğrulanamıyor

- **Current state:** PWA olarak sunulan worker yalnızca elle yazılmış root/manifest/SVG/PNG listesini precache ediyor; generated Vite JS/CSS yok. Her başarısız GET, request türü ayrılmadan cached `/` döndürebiliyor.
- **Evidence:** `apps/client/public/sw.js:1-38`; generated bundle entry/CSS kaynakları `apps/client/index.html:13-14`, `apps/client/src/main.tsx:4`, build `apps/client/vite.config.ts:11-13`; online asset 404 koruması `deploy/nginx.conf:61-72`.
- **Risk:** Offline/connection-loss reload sırasında script/style isteği `text/html` alıp MIME/module yüklemesini bozabilir; service worker kontrolündeki istemci Nginx'in doğru 404 davranışını bypass edebilir.
- **Severity:** **P1 public PWA reliability gate** if installable/recoverable PWA is claimed; **P2 pilot** if pilot açıkça online-only ve offline shell garanti etmiyorsa. Offline gameplay blocker değildir.
- **Minimal recommended fix:** Build çıktısından generated JS/CSS precache manifest üret; only-document navigation fallback uygula; `/assets/`, scripts, styles, API ve WebSocket'i HTML fallback'ten ayır; cache revision'ı build'e bağla.
- **Validation/test strategy:** Production build sonrası index'teki her JS/CSS URL'yi enumerate et; online install → controlled reload → offline reload; shell render, no MIME error, missing asset non-HTML failure ve SPA navigation fallback assertion.

## 5. High Priority

### H-01 — Transport ve message budgets

- **Current state:** Basic parser `JSON.parse` ve recursive `isJsonValue` depth limit 8 kullanıyor; finite numbers, game IDs ve adapter-specific shape guard'ları var. Ancak raw byte limit, aggregate node/key/string/array limits, binary policy ve unknown-field budget yok.
- **Evidence:** `apps/server/src/index.ts:142-163`, `265-333`, `1613-1627`; drawing parser `packages/shared/src/games-stage8.ts:526-543`.
- **Risk:** Depth sınırı tek başına parse öncesi allocation/CPU maliyetini sınırlamaz. Drawing tek payload'da 180 stroke × 140 point'e kadar çıkabilir; total encoded byte ve save frequency sınırı yok.
- **Severity:** **P1 public / P2 pilot**.
- **Minimal recommended fix:** Meşru maksimumu ölçüp explicit frame cap seç; message-type-specific decoder ve total point/byte cap ekle; repeated save'leri coalesce veya quota ile sınırla; generic engine input history/outbound payload'ı bounded yap.
- **Validation/test strategy:** Maksimum meşru drawing, +1 boundary, oversized JSON, wide object/array, giant string, binary frame ve repeated save tests; rejection latency/memory ölç.

### H-02 — Connection, room ve Origin abuse kontrolleri

- **Current state:** Room başına `MAX_PLAYERS=8` var; global socket/room/player ceiling, create/join quota, join failure backoff ve Origin allowlist yok. Token room'a bağlı olsa da known room code abuse'e karşı değil.
- **Evidence:** `packages/shared/src/index.ts:6-12`; `apps/server/src/index.ts:862-948`; `deploy/nginx.conf:14-52`.
- **Risk:** Room hoarding, room-code probing, cross-site socket creation ve connected socket'lerle memory retention public endpoint'i availability açısından zayıflatıyor.
- **Severity:** **P1 public / P2 pilot**.
- **Minimal recommended fix:** Gerçek public origin allowlist; connection/IP/session budgets; create/join/invalid-message quotas; global rooms/players ceiling ve controlled rejection. Origin authentication değildir; room code yine bearer invite secret olarak değerlendirilmelidir.
- **Validation/test strategy:** Allowed/denied Origin upgrade, absent/foreign Origin policy, create/join flood, full-room occupation, room expiry ve `/health` counter assertions.

### H-03 — Reconnect token bearer policy

- **Current state:** 24 random bytes güçlü entropy sağlar; room-bound lookup, revoke-on-leave/delete ve duplicate-socket replacement var. Token browser `localStorage`'da tutuluyor, rotate edilmiyor ve 120 saniyelik room/player grace boyunca bearer takeover yetkisi taşıyor.
- **Evidence:** `apps/server/src/index.ts:395-425`, `909-920`; `apps/client/src/App.tsx:51-79`, `223-230`; integration `apps/server/test/reconnect.integration.test.mjs:564-645`.
- **Risk:** XSS/compromised browser storage veya token sızıntısı, host dahil player session replacement'a izin verebilir. Bu model friends pilotunda kabul edilebilir, public'te threat model'e yazılmalıdır.
- **Severity:** **P2 pilot/public follow-up**; token çalınması halinde impact yüksek olsa da mevcut tasarım açıkça accountless pilot modelidir.
- **Minimal recommended fix:** Token format/length check, grace expiry/revocation, successful resume rotation where compatible, active-socket replacement policy ve client storage risk dokümantasyonu. OAuth/JWT zorunlu değil.
- **Validation/test strategy:** Replay, wrong-room, expired-grace, rotate/reconnect, duplicate tab ve host takeover testleri; loglarda token asla yazılmamalı.

### H-04 — Client socket generation ve stale-state koruması

- **Current state:** Server eski socket close event'ini `player.socket !== socket` ile doğru ignore ediyor. Client ise her socket'in message/close callback'ini işler; `socketRef.current` değişmiş olsa da eski socket close'u offline/reconnect tetikleyebilir. `stateVersion` gönderiliyor fakat `server:match-state` koşulsuz uygulanıyor.
- **Evidence:** Server fencing `apps/server/src/index.ts:716-801`; client lifecycle/message handling `apps/client/src/App.tsx:174-317`, `325-369`, state apply `248-260`.
- **Risk:** Duplicate tab/late event sırasında yanlış offline state, beklenmeyen üçüncü socket veya eski phase/game state görülebilir. Bu özellikle transition ve reconnect'te kullanıcı deneyimini bozabilir.
- **Severity:** **P1 mobile/reconnect reliability**; public mixed-client riskini artırır; pilot için focused gate.
- **Minimal recommended fix:** Socket generation/correlation check; yalnız güncel socket'in message/close state mutation'ına izin ver; `(matchId,stateVersion)` monotonic filter; lobby için de revision veya resync policy belirle.
- **Validation/test strategy:** Two sockets, old message after replacement, old close after replacement, reordered state, refresh/background and reconnect during transition; newest state convergence assertion.

### H-05 — Protocol handshake ve stale PWA gate

- **Current state:** `PROTOCOL_VERSION=1` shared'de merkezi; `server:ready` bunu yayınlıyor. `client:hello` yalnız arbitrary `clientVersion` taşıyor, server bunu kaydedip karşılaştırmıyor; client `protocolVersion` okumuyor ve `server:ready` beklemeden hello + resume join gönderiyor.
- **Evidence:** `packages/shared/src/index.ts:3`, `124-165`, `193-249`; server `apps/server/src/index.ts:1476-1500`, `1607-1611`; client `apps/client/src/App.tsx:191-205`, `218-221`.
- **Risk:** Additive veya semantic game-state değişiklikleri eski client/new server arasında sessiz divergence yaratabilir. A0 document current protocol gate'i kapsam dışı bırakıyor (`docs/ASAMA-11-1-A0-DECISION-RECORD.md:139-148`).
- **Severity:** **P2** atomic matched pilot için; **P1 conditional gate** mixed/rolling public deployment için.
- **Minimal recommended fix:** Client hello protocol version göndermeli; server compatible version doğrulayıp mismatch'i explicit update-required + close ile fail-closed yapmalı; client update prompt/reload göstermeli; incompatible semantic change'te version bump yapılmalı. Client/server immutable pair deploy edilmeli.
- **Validation/test strategy:** Matching/mismatching old/new fixtures, missing hello/pre-hello action, additive field, protocol bump, stale cached PWA ve deployment rollback testleri.

### H-06 — PWA update, resume ve connection-lost UX

- **Current state:** Close-triggered exponential reconnect, `online` listener, stored resume token ve server heartbeat mevcut. `visibilitychange/pageshow/focus` resume probe, client-side pong timeout, match-screen connection indicator, update prompt/controllerchange ve controlled reload yok.
- **Evidence:** `apps/client/src/App.tsx:157-207`, `248-260`, `319-354`; `apps/client/public/sw.js:14-25`; `apps/client/src/main.tsx:6-9`; `MatchScreen` `apps/client/src/App.tsx:947-985`.
- **Risk:** Background-suspended socket OPEN kalıp stale olabilir; foreground'da reconnect başlamayabilir. Match kullanıcıya donmuş countdown gibi görünebilir. Worker update'i açık tab'daki eski JS'yi otomatik düzeltmez.
- **Severity:** **P1 mobile reliability gate / P2 implementation priority** for closed pilot; **P1** for public phone V1.
- **Minimal recommended fix:** Resume'da liveness probe/reconnect, explicit reconnecting/offline state, match-level banner ve action disable; worker update notice + lobby/match-end reload boundary. Active match'i sessizce reload etme; session expiry'yi anlaşılır göster.
- **Validation/test strategy:** Background/foreground, lock/unlock, Wi-Fi blackhole/recovery, old tab across deploy, `server:pong` timeout, session expiry and user-visible recovery tests.

### H-07 — CI ve repeatable release gates

- **Current state:** Root scripts `npm test`, `npm run typecheck`, `npm run build`, `npm run smoke:realtime` sağlıyor; current test script shared + server integration testlerini çağırıyor. Ancak `.github/workflows` yok, browser E2E yok, smoke external server/127.0.0.1 varsayıyor ve edge HTTPS/WSS/Compose gate'i yok.
- **Evidence:** `package.json:13-22`; `scripts/realtime-smoke.mjs:4-5,83-147`; absence of `.github/workflows`; `apps/client/package.json:6-21`.
- **Risk:** Release sonucu kişinin local state'ine bağlı; client build/PWA, proxy, Docker ve public edge otomatik doğrulanmıyor. Stage 10 `37/37` iddiası current main'in 47 testlik script'iyle dokümantasyon olarak uyuşmuyor (`docs/ASAMA-10-TESLIM-VE-YAYIN.md:36-42`, `GLIX-PROJE-HAFIZASI.md:1538-1540`).
- **Severity:** **P2 pilot process risk**; **P1 public release-governance gate**. Manual evidence kısa süreli substitute olabilir, fakat public'te CI kurulmalıdır.
- **Minimal recommended fix:** Required workflow: pinned Node/npm → `npm ci` → test → typecheck → build → self-start server + health → realtime smoke. Ayrı Compose edge `/health` + `/ws` smoke; browser E2E küçük bir representative journey olarak sonraki gate. Deployment SHA/image tag/rollback kanıtı tutulmalı.
- **Validation/test strategy:** Clean checkout'ta workflow pass/fail, artifact retention, server child cleanup, Docker config/build, edge route and rollback drill.

### H-08 — Complete multi-game and player-count proof

- **Current state:** New integration test current game reconnect ve third-game spectator boundary'ye kadar ilerliyor; iki oyunculu invalid next-game route da doğrulanıyor. Fakat complete final-results route, 5/8 player load ve all 24 game end-to-end coverage yok.
- **Evidence:** `apps/server/test/reconnect.integration.test.mjs:348-519`, `648-677`; catalog definitions/tests `packages/shared/src/index.ts:41-66`, `packages/shared/src/catalog-stage10.test.ts:125-190`.
- **Risk:** Adapter factory/shape testleri gerçek server timer, client control, scoring, transition veya mobile layout regression'ını yakalamayabilir.
- **Severity:** **P1 pilot QA gate** for claiming a working phone pilot; **P1 public**.
- **Minimal recommended fix:** 2/3/5/8 player route suite; at least two canonical heterogeneous routes below; all 24 games at least one integration/visual control path; phase/score/stateVersion convergence assertion.
- **Validation/test strategy:** Full tutorial → preparing → playing → results → transition → next game → final results; disconnect/reconnect each boundary and deterministic oracle for score/roster.

## 6. Medium Priority

### M-01 — Installability icon set

- **Current state:** Manifest basics and `purpose: "any maskable"` SVG exist, but no explicit 192×192 PNG, 512×512 PNG, dedicated maskable raster icon or `apple-touch-icon` tracked.
- **Evidence:** `apps/client/public/manifest.webmanifest:6-18`; `apps/client/index.html:8-10`; public asset tree on `main` includes `icon.svg`/`favicon.svg` but no required raster icon paths.
- **Risk:** Android installability/launcher selection and iOS web clip icon behavior cannot be assumed; `sizes: any` SVG is not equivalent to tested platform raster coverage.
- **Severity:** **P2**; conditional **P1** only if release explicitly promises installable PWA on all four surfaces.
- **Minimal recommended fix:** Add explicit 192 and 512 PNG entries, a safe-zone maskable PNG, and iOS `apple-touch-icon`; keep `standalone` and validate contrast/safe area.
- **Validation/test strategy:** Chrome installability audit, Android launcher inspection, Safari Add to Home Screen and installed iOS PWA icon/startup screenshot.

### M-02 — Server pong / RTT / clock compensation

- **Current state:** Server emits `server:pong` echoing `clientTime` and `serverTime`; client sends 10-second pings but has no pong handler. Match clock offset is set from `serverNow - Date.now()` at snapshot receipt, not midpoint RTT.
- **Evidence:** server `apps/server/src/index.ts:1484-1490`; client `apps/client/src/App.tsx:336-342` and `248-260`; engine server authority `packages/shared/src/engine.ts:460-516`.
- **Risk:** Countdown visuals can be biased by one-way latency; scoring remains server-authoritative, so this is UX precision rather than a direct integrity failure.
- **Severity:** **P2**; P3 for low-latency trusted pilot.
- **Minimal recommended fix:** Consume pong using send/receive midpoint, smooth and clamp offset, expose liveness timeout; do not use client time for authoritative scoring.
- **Validation/test strategy:** Inject 50/100/250 ms asymmetric latency, compare display countdown vs server phase, verify reconnect after missing pong.

### M-03 — Nginx security headers and public health exposure

- **Current state:** Nginx has cache and routing headers but no explicit CSP, HSTS, `X-Content-Type-Options`, frame/referrer/permissions policy, or endpoint access policy. `/health` includes counters and version.
- **Evidence:** `deploy/nginx.conf:25-72`; server health response `apps/server/src/index.ts:228-248`.
- **Risk:** Browser hardening and information exposure are weaker than a public release baseline; absence of CSP leaves future client mistakes more costly.
- **Severity:** **P2**; HSTS only after HTTPS is real and correctly scoped.
- **Minimal recommended fix:** Add least-permissive headers compatible with the app, redact or restrict operational counters if not needed publicly, and document host-proxy header ownership.
- **Validation/test strategy:** `curl -I` public/static/health/404 routes; verify CSP does not break Vite assets or WebSocket; security header regression check.

### M-04 — Client container least privilege and runtime limits

- **Current state:** Server runtime is explicit `USER node`; Nginx client image has no explicit non-root declaration. Compose has no `read_only`, `cap_drop`, `no-new-privileges`, CPU/memory/PID limits or unhealthy remediation/alert policy.
- **Evidence:** `deploy/server.Dockerfile:24-50`; `deploy/client.Dockerfile:25-35`; `deploy/docker-compose.yml:9-59`.
- **Risk:** A web-edge compromise has a broader container/runtime blast radius and resource exhaustion is less bounded.
- **Severity:** **P2 public hardening**, P3 pilot.
- **Minimal recommended fix:** Verify non-root Nginx-compatible image mode; add least-privilege flags and conservative resource budgets after measuring; monitor unhealthy state with a simple host-level action.
- **Validation/test strategy:** Inspect effective UID/capabilities/read-only mounts, rebuild/restart behavior, health recovery and resource-limit stress.

### M-05 — Deployment reproducibility and config consistency

- **Current state:** `GLIX_SERVER_PORT` is configurable, but Compose expose/healthchecks, Docker `EXPOSE`, and Nginx upstream hardcode `8787`; base images use mutable `node:22-alpine`/`nginx:1.27-alpine` tags. `GLIX_DOMAIN`/`GLIX_PUBLIC_ORIGIN` are examples only and not consumed.
- **Evidence:** `deploy/.env.example:9-18`; `deploy/docker-compose.yml:14-25`; `deploy/nginx.conf:9-11`; Dockerfiles `:3,24-47`.
- **Risk:** A non-default environment silently breaks health/proxy; mutable base tags and absent image digest/rollback mapping reduce reproducibility.
- **Severity:** **P2**.
- **Minimal recommended fix:** Make port a single source or remove misleading configurability; use SHA/digest-tagged image artifacts and retain previous pair for rollback.
- **Validation/test strategy:** `docker compose config` default + non-default port; container recreation; proxy DNS resolution; image provenance and rollback drill.

### M-06 — Test isolation and coverage seams

- **Current state:** Shared tests and new server integration tests are a meaningful improvement, but client/PWA, Nginx/Compose, protocol mismatch, flood, malformed frame, lifecycle and full score route tests are absent. Integration launch cleanup has a potential orphan child if startup fails before cleanup registration (`apps/server/test/reconnect.integration.test.mjs:65-68,208-212`).
- **Risk:** A failed test or missing test seam can leave process state and false confidence in release.
- **Severity:** **P2**.
- **Minimal recommended fix:** Ensure child cleanup in all setup failure paths; add server protocol/security integration and browser/PWA smoke without making every scenario a heavyweight E2E suite.
- **Validation/test strategy:** Kill-on-failure test, repeated clean runs, test discovery check, and artifact/log cleanup assertion.

## 7. Low / Nice-to-have

### L-01 — Account/auth architecture

OAuth, JWT, database-backed identity or enterprise account management are **not required** for the friends-group pilot or small V1. The room-code + opaque reconnect-token model can remain if its bearer risks, expiry, rate limits and abuse boundaries are explicit.

### L-02 — Persistence and orchestration

Database, Kubernetes, service mesh, multi-region deployment and persistent match storage are **not required** for the current RAM-only room product decision. Restart losing active rooms is documented and acceptable if the UX reports it clearly (`deploy/README.md:136-138`).

### L-03 — Heavy observability/security platforms

Enterprise SIEM, distributed tracing platform, full WAF/bot-management suite and heavy metrics stack are deferred. V1 needs bounded structured logs, health polling, a few counters and operator alerts; the existing JSON-file rotation is sufficient as a starting point.

### L-04 — Advanced latency model

Clock smoothing beyond a bounded midpoint RTT estimate, replay protection beyond the session model, and multi-region latency compensation can wait until measured usage justifies them.

## 8. WebSocket Security Plan

### 8.1 Control matrix

| Control | Current state | Risk/severity | Minimal V1 plan | Validation |
|---|---|---|---|---|
| Explicit `maxPayload` | Absent at `new WebSocketServer` (`apps/server/src/index.ts:1590-1592`) | Public parser/memory DoS; P1 public | Measure worst legal payload and set explicit frame cap below uncontrolled default | Boundary, oversized and binary frame tests |
| Message validation | JSON/type/finite/depth and adapter guards exist; raw byte, node, string, array and unknown-field budgets absent (`:142-163,265-333`) | P1 public resource risk | Type-specific decoders; bounded strings/arrays/objects; reject binary and malformed frames | Fuzz/wide/deep/giant string tests |
| Per-socket message rate | Absent | P1 public; P2 pilot | Token bucket for all messages plus stricter game-submit/drawing-save budget | Burst, sustained and invalid flood tests |
| Room create abuse | Any unauthenticated socket can create room (`:862-880`) | P1 public; P2 pilot | Per-IP/session create quota + global room ceiling; retain room code invite model | Room hoarding and quota tests |
| Room join abuse | No join/room-not-found throttle (`:882-948`) | P1 public; P2 pilot | Per-IP failed-join budget and backoff; do not leak more room data | Code probing/full-room tests |
| Origin | No upgrade allowlist in server or Nginx (`:1590-1592`, `deploy/nginx.conf:39-53`) | P1 public cross-site abuse reduction | Explicit production allowlist; define local/staging origins separately | Allowed/denied/missing Origin upgrade tests |
| Reconnect token | Random and room-bound, but bearer in localStorage; same token returned; grace-limited (`:395-425,909-920`) | P2 pilot/public integrity | Format/expiry/revocation/optional rotation; document active-socket takeover | Replay, wrong room, expiry, duplicate tab |
| Malformed frames | Error returned, connection remains; binary `.toString()` path is accepted for parse attempt (`:1613-1627`) | P2/P1 if flood | Reject binary; strike/backoff/close threshold; outer handler boundary | Invalid JSON/schema/binary flood |
| Drawing payload | ≤180 strokes, ≤140 points/stroke, finite/clamped values (`games-stage8.ts:526-543`) | P1 public amplification without aggregate cap | Total byte/point and save-frequency cap; bound retained history | Maximum and repeated drawing saves |
| Socket flood/backpressure | `sendJson` checks only OPEN and sends; accepted inputs broadcast and are retained (`index.ts:174-183`, `engine.ts:504-523`) | P1 public availability | `bufferedAmount` ceiling, slow-client termination, bounded input history and global connection limit | Slow receiver + valid flood |
| Heartbeat | 30s server ping, missed pong terminates (`index.ts:1555-1629`) | Strength; not abuse control | Retain; expose timeout counter | Dead socket and event-loop pressure |
| Stale cleanup | 120s player/room grace and session deletion (`:621-663,760-801`) | Strength; memory can be held by live sockets | Retain; add global ceiling and cleanup metrics | Before/after grace, `/health` zero counters |
| Graceful shutdown | Draining, room/socket close, HTTP/WS close, 10s hard timeout (`:1659-1717`) | Strength; needs test | Retain; test SIGTERM with active sockets and health 503 | Shutdown integration test |

`package-lock.json:2401-2421` yalnızca `ws` sürümünü (`8.21.3`) ve integrity bilgisini doğrular. Installed `ws` runtime'ında gözlenen 100 MiB default, commit/lockfile kanıtı değildir. Uygulama seviyesinde explicit `maxPayload` yine zorunludur; release planı bu değeri ölçülmüş meşru payload'ın altında seçip test etmelidir.

### 8.2 Scope rule

Origin checks reduce cross-site abuse but are not authentication. Room codes and reconnect tokens remain capabilities. The smallest proportionate public baseline is transport limit + message budget + room/socket quota + Origin allowlist + bounded reconnect policy; account system eklemek bu audit'in sonucu değildir.

## 9. PWA Reliability Plan

### 9.1 Current behavior and fixes

| Area | Current state | Severity | Minimal fix | Test |
|---|---|---|---|---|
| Hashed JS/CSS cache | `APP_SHELL` only hand-written root/static files; Vite generated bundles absent (`sw.js:1-12`, `index.html:13-14`) | P1 public PWA / P2 pilot | Build-generated precache manifest including every JS/CSS | Enumerate build URLs and Cache Storage |
| Navigation fallback | Worker applies same catch to every GET; no navigation guard (`sw.js:28-38`) | P1 conditional | Fallback only `request.mode === "navigate"`; other failures remain failure/404 | Offline route + missing asset tests |
| Wrong MIME | Failed script/style/asset can return cached `/` HTML | P1 conditional | Never HTML-fallback scripts/styles/assets/API | Offline module/style load, response MIME assertions |
| Runtime caching | Successful fetches are never cache-written | P2 | Precache immutable build assets; optional network-first document | First-load/offline reload |
| Service-worker update | `skipWaiting`/`clients.claim`, no update prompt/controller boundary (`sw.js:14-25`, `main.tsx:6-9`) | P2 / P1 public stale-client | Tie revision to build; show update notice; reload at safe boundary | V1→V2 open tab and active match |
| Installability | standalone/start URL/colors exist; only SVG `sizes:any` icon | P2 / conditional P1 | 192/512 PNG, maskable raster and Apple icon | Android/iOS install audit |
| Same-origin | Production client derives `ws/wss` from current host; Nginx `/ws` proxy exists | Strength, pending public route | Keep same-origin; no separate API host needed | HTTPS/WSS edge smoke |
| Resume/reconnect | close + `online` retry and local resume token; no visibility/pageshow/focus probe | P1 mobile reliability | Resume liveness probe, pong timeout, socket-generation guard | Background/lock/Wi-Fi matrix |
| Connection UX | Header/lobby indicators exist; MatchScreen has no persistent connection banner (`App.tsx:947-985`) | P1 public phone UX / P2 pilot | Match-level reconnecting/offline state; disable misleading actions; retry/expired session action | Disconnect during turn/transition |

Offline gameplay is explicitly out of scope. The acceptance target is: cached shell can boot and explain that gameplay is unavailable until the WebSocket reconnects; it is not that a match continues offline.

## 10. Protocol Compatibility Plan

### Current protocol facts

- `PROTOCOL_VERSION = 1` shared'de tanımlı (`packages/shared/src/index.ts:3`).
- `server:ready` `serverVersion` ve `protocolVersion` gönderiyor (`apps/server/src/index.ts:1607-1611`).
- `client:hello` yalnız `clientVersion` gönderiyor; server bunu sadece context'e yazıyor (`apps/client/src/App.tsx:191`, `apps/server/src/index.ts:1476-1481`).
- Client `server:ready` içinde `serverVersion` okuyor, `protocolVersion` karşılaştırmıyor (`apps/client/src/App.tsx:218-221`).
- `server:pong` server'da var, client tarafından kullanılmıyor (`apps/server/src/index.ts:1484-1490`, `apps/client/src/App.tsx:336-342`).
- `stateVersion` mevcut, ancak client match state'i koşulsuz replace ediyor (`packages/shared/src/index.ts:115-122`, `apps/client/src/App.tsx:248-260`).
- Current main participant policy server-side corrected: next game connected snapshot alıyor ve unplayable tail'i atlıyor (`apps/server/src/index.ts:1125-1163`).

### Recommended compatibility policy

1. **Pilot:** Client/server aynı commit ve immutable pair olarak deploy edilir; rolling update yapılmaz; release sırasında hard refresh istenir.
2. **Public V1:** Client hello protocol version'ı taşımalı; server `server:ready` sonrası compatible version doğrulamalı; mismatch'te explicit `update-required` response + close; client update/reload prompt göstermeli.
3. **Versioning:** Cosmetic `serverVersion` ile semantic `PROTOCOL_VERSION` ayrılmalı. Game-state/message meaning değişirse protocol bump; additive, backward-compatible alanlar için migration planı.
4. **Ordering:** Client socket generation ve `(matchId,stateVersion)` monotonic guard kullanmalı; server observable connection/roster değişikliklerinde revision semantiğini tutarlı hale getirmeli.
5. **Timing:** `server:pong` RTT sample yalnız visual clock/liveness içindir; score, phase acceptance ve result server clock'unda kalmalıdır.

## 11. CI Plan

### Mevcut durum

`package.json:16-22` build/typecheck/test/smoke script'lerini içeriyor. Current `npm test`, `test:engine` içindeki shared test listesine ek olarak `test:server` ile reconnect integration suite'i çağırıyor. Ancak `.github/workflows` yok; client test script'i/browser E2E yok; realtime smoke already-running direct server varsayıyor; Compose/public edge otomatik gate değil.

### Minimal pipeline (öneri, uygulanmadı)

1. Checkout + pinned Node/npm + `npm ci`.
2. `npm test`.
3. `npm run typecheck`.
4. `npm run build`.
5. Build edilmiş server'ı ephemeral portta başlat, `/health` ready olana kadar bekle; smoke çalıştırırken `GLIX_SMOKE_HTTP_URL=http://127.0.0.1:<port>` ve `GLIX_SMOKE_WS_URL=ws://127.0.0.1:<port>/ws` değerlerini ata (`scripts/realtime-smoke.mjs:4-5` bu değişkenleri tüketiyor); `finally` ile process'i kapat.
6. Optional/sonraki gate: Compose `config`, image build, loopback edge `/health` ve `/ws` smoke.
7. Public V1 gate: gerçek HTTPS/WSS smoke, representative browser E2E (create/join/start/input/reconnect/mobile overflow) ve rollback artifact.

### CI severity

No CI tek başına runtime blocker değildir. Pilot için captured clean-checkout checklist geçici substitute olabilir. Public V1 için required status check haline gelmelidir; aksi halde release reproducibility kişiye bağlı kalır.

## 12. Deployment Plan

### Existing deployment strengths

- `glix-server` yalnız `glix-internal` network'ünde; client edge/internal'e bağlı; edge default `127.0.0.1:18080` (`deploy/docker-compose.yml:9-73`).
- Compose `depends_on` server health'i bekliyor; iki serviste healthcheck, `unless-stopped`, `init`, grace period ve `json-file 10m × 5` logging var (`deploy/docker-compose.yml:21-59`).
- Server runtime `USER node`; server host port publish edilmiyor (`deploy/server.Dockerfile:24-50`).
- Nginx `/health`, `/ws`, `/sw.js`, `/assets/` ve SPA route'larını aynı-origin tasarımda bağlıyor (`deploy/nginx.conf:25-72`).

### Release sequence

1. Gerçek hostname/DNS ve host TLS proxy block'unu provision et; mevcut `api.lynrax.com`/`game.lynrax.com` servislerine dokunma.
2. `deploy/.env` placeholder, server port ve image pair'i doğrula; `docker compose config` çıktısını artifact olarak sakla.
3. Immutable client/server image pair build et; önce loopback `/health`, sonra edge `/health`, sonra edge `/ws` smoke çalıştır.
4. PWA production build'inde worker, generated assets, manifest icons ve public headers'ı doğrula.
5. HTTPS/WSS gerçek hostname smoke ve odaklı device/chaos matrix geçmeden public DNS trafiğini açma.
6. Release SHA/image digest, health response, smoke log ve rollback pair'ini sakla.

### Known deployment gaps

- `GLIX_SERVER_PORT` değişkeni verilebilir görünse de Compose health/expose, Docker `EXPOSE` ve Nginx upstream 8787'ye sabit (`deploy/.env.example:9-18`, `deploy/docker-compose.yml:18-25`, `deploy/nginx.conf:9-11`).
- Client Nginx image non-root olarak doğrulanmıyor; Compose resource/security flags yok (`deploy/client.Dockerfile:25-35`, `deploy/docker-compose.yml:9-59`).
- Nginx security headers yok; health response operational counters/version içeriyor (`deploy/nginx.conf:55-72`, `apps/server/src/index.ts:228-248`).
- Base image tags mutable; rollback için immutable pair mapping dokümante değil.
- RAM-only room kaybı restart sonrası beklenen davranış; public UX bu durumu “room expired/server restarted” olarak göstermelidir.

## 13. Device QA Matrix

Bu matristeki tüm hücreler **önerilen validation**'dır; current `main` içinde fiziksel cihaz sonucu yoktur. `Priority` sütunu test/release-gate önceliğidir; P0/P1/P2 güvenlik veya arıza severity'si olarak okunmamalıdır. Bu planın executive kararında kanıtlanmış P0 yoktur.

### Canonical routes

- **R2 (2/3/5/8 oyuncu):** `butona-bas → rus-ruleti → gizli-kareler → kontrol-paneli-kaosu` — hızlı input, risk, target/grid ve iki landscape-oriented oyun.
- **R3 (3/5/8 oyuncu):** `yazi-yaz → ortalamanin-yarisi → karalama-defteri → capraz-ates` — text entry, numeric/slider, drawing ve target/choice input.

Her complete route; tutorial, preparing, playing, results, transition, sonraki game ve final results'a ulaşmalı; tüm client'lar `gameId`, phase, score ve `stateVersion` üzerinde converge etmelidir.

### Runtime/surface matrix

| Runtime | Portrait | Landscape | Keyboard open/close | Background/foreground | Lock/unlock | Wi-Fi off/on | Refresh/reconnect | Priority |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| iOS Safari | Required | Required | Required | Required | Required | Required | Required | Pilot P1 focus; public P1 evidence gate |
| Installed iOS PWA | Required | Required | Required | Required | Required | Required | Required | Pilot P2; public P1 evidence gate |
| Android Chrome | Required | Required | Required | Required | Required | Required | Required | Pilot P1 focus; public P1 evidence gate |
| Installed Android PWA | Required | Required | Required | Required | Required | Required | Required | Pilot P2; public P1 evidence gate |

### Player-count matrix

| Players | Required coverage | Current evidence |
|---:|---|---|
| 2 | R2; guest disconnect during turn; reconnect before grace; complete route; invalid next-game tail | Partial server integration (`reconnect.integration.test.mjs:648-677`) |
| 3 | R2/R3; current participant reconnect; spectator reconnect; host migration; complete route | Partial server integration (`:348-519`, `:564-606`) |
| 5 | R2/R3; simultaneous guest churn; max normal input burst; full route | No tracked end-to-end evidence |
| 8 | R2/R3; maximum roster; host loss; multiple disconnect/reconnect; touch/overflow | No tracked end-to-end evidence |

### Per-device execution checklist

- Create/join form, room roster, host controls, connection status.
- Portrait and landscape rotation; especially `rus-ruleti`, `kor-bomba`, `kontrol-paneli-kaosu` where catalog says `supportsPortrait: false` (`packages/shared/src/index.ts:48,51,62`).
- Keyboard open/close on nickname, room code, `yazi-yaz`, `kendim`, dictionary/association inputs; no CTA occlusion, scroll jump, lost input or accidental submit.
- Background/foreground and lock/unlock during lobby, tutorial, preparing, playing, results and transition.
- Wi-Fi loss/recovery before and after 120-second grace; refresh during lobby/active match/transition.
- Host and guest explicit leave/abrupt disconnect; no duplicate roster, wrong host, lost score or stale controls.
- Installed PWA safe-area/status-bar/standalone presentation; icon and update behavior.

## 14. Chaos Test Matrix

| Scenario | Injection | Current proof | Expected oracle | Priority |
|---|---|---|---|---|
| Disconnect during turn | Kill host/guest socket while `playing` | 3-player server reconnect/current-state path partial (`reconnect.integration.test.mjs:364-399`) | Remaining clients continue or fail deterministically; reconnect preserves player ID/score/current game; no duplicate | Pilot P1; public P1 |
| Reconnect during transition | Drop socket between `results` and next `tutorial` | Boundary reconnect is partially covered (`:400-458`) | Client lands on current game/phase; monotonic state; participant/spectator correct | Pilot P1; public P1 |
| Host leaves | Explicit `room:leave` and abrupt close in lobby/playing/results | Lobby migration tested (`:564-606`) | Explicit leave removes; abrupt loss transfers host; active match policy deterministic | Pilot P1; public P1 |
| Socket dies | Terminate transport without Wi-Fi change | Heartbeat/shutdown code exists | Bounded offline detection, one recovery path, no duplicate join | Pilot P1; public P1 |
| Phone lock/unlock | Lock 5–60s in turn/transition | No physical proof | Server timer authoritative; resume/reconnect or explicit expiry; no phantom controls | Pilot P2; public P1 |
| App background/foreground | Switch app/browser in every phase | No lifecycle handler/evidence | Resume probe handles stale OPEN socket; no duplicate WebSocket/session | Pilot P1; public P1 |
| Wi-Fi off/on | Airplane/router loss before/after grace | `online` hook only | Clear offline UX; recovery before grace; after grace clean room-not-found | Pilot P1; public P1 |
| Stale client | Old cached bundle/new server and reverse | Version is published but unenforced | Explicit update-required or proven compatibility; no silent divergence | Pilot P2; public P1 |
| Server restart | Restart during lobby, turn, transition | Graceful shutdown and RAM-loss documented | Sockets close; no phantom match; user returns to join/home with clear reason | Pilot P2; public P1 |
| Room cleanup | Disconnect everyone; check before/after 120s | Timers/code exist | Reconnect succeeds before grace; after expiry token invalid; health counters zero | Pilot P1; public P1 |
| Oversized/malformed frame | Binary, invalid JSON, deep/wide, giant string | Parser catch only | Bounded reject/close, no event-loop/resource spike | Pilot P2; public P1 |
| Valid input/drawing flood | Burst accepted game/drawing messages | No rate/backpressure control | Quota/backpressure; server stays responsive; bounded history/memory | Pilot P2; public P1 |
| PWA update | Keep V1 open, deploy V2, background/resume | No update prompt | New worker/build detected; safe reload notice; no active-match corruption | Pilot P2; public P1 |

## 15. Observability for V1

Heavy monitoring platformı gerekli değildir. Başlangıç için mevcut stdout JSON-file rotation, `/health` ve küçük bir host-level check yeterlidir.

### Record

- Release SHA, client/server image tag/digest, protocol version, deploy timestamp.
- Connection open/close, close code, heartbeat timeout, reconnect success/failure, protocol mismatch.
- Rejection counts by coarse code (`invalid_message`, rate/size/origin/room limit, spectator/input rejection); token, nickname ve room code loglama.
- Active rooms, active matches, connected players, active sockets, cleanup count, room-create/join reject count.
- Message-rate/payload-limit rejects, drawing-limit rejects, slow-client termination.
- Deploy/rollback event, `/health` status and public HTTPS/WSS smoke result.

### Avoid

- Reconnect token, full user payload, drawing contents or private game state loglama.
- Publicly exposing more health detail than operator needs; counters/version için access policy belirleme.
- SIEM, distributed tracing, multi-region metrics or heavy alerting before usage justifies them.

### Minimal alerts

- `/health` non-200 or `draining` outside an intentional deploy.
- WebSocket connection/message rejection spike.
- Active connections/rooms beyond configured ceiling.
- Reconnect failure spike, cleanup not reducing empty rooms, repeated container unhealthy state.
- Public smoke failure after deploy.

## 16. Recommended Implementation Order

Bu sıra implementation planıdır; bu audit sırasında uygulanmamıştır.

1. **Release scope lock:** Pilot online-only/private mi, yoksa remote public hostname mı; offline gameplay ve persistence'ın kapsam dışı olduğunu yazılı sabitle.
2. **Real edge route:** DNS + TLS + host proxy + HTTPS/WSS smoke; placeholder kalmayacak.
3. **WebSocket minimum public baseline:** explicit payload cap, binary/malformed policy, message/room/socket/IP quotas, drawing aggregate cap, backpressure/history ceiling, Origin allowlist.
4. **Client reliability seam:** socket generation/late-event guard, monotonic match state, pong timeout and app resume probe, match-level connection UX.
5. **Protocol/update gate:** protocol hello/mismatch reject, update-required UX, immutable client/server pair, service-worker revision/update boundary.
6. **PWA shell/installability:** generated JS/CSS precache, navigation-only fallback, no HTML fallback for assets, 192/512/maskable/Apple icons.
7. **Server integration expansion:** protocol/security/flood/cleanup/shutdown tests; complete R2/R3 route, 2/3/5/8 count and 24-game representation.
8. **Physical QA:** iOS Safari, installed iOS PWA, Android Chrome, installed Android PWA; orientation, keyboard, lifecycle, network and chaos matrix.
9. **CI/release governance:** npm CI gates, self-contained smoke, Compose edge smoke, representative browser E2E, immutable artifact and rollback evidence.
10. **Public V1 gate:** all P1 acceptance criteria below; then controlled exposure and post-release health watch.

Pilot için minimum daraltılmış sıra: **1 → 2 (private pilot ise route yerine private access) → 4 → 7 (2/3 route) → 8 (iOS Safari + Android Chrome, 2/3 players) → pilot sign-off**. Public V1 için 2–10 tamamlanmalıdır.

## 17. Acceptance Criteria

### Evidence rule for every criterion

“Pass” yalnızca kayıtlı bir artifact ile kullanılmalıdır. Her route/chaos/ci/device sonucu en az commit SHA, test veya device/build bilgisi, canonical route, oyuncu sayısı, çalıştırma zamanı, beklenen oracle, gerçek sonuç ve pass/fail içerir. “All chaos cases” ifadesi §14'teki her satırın ayrı sonucu ve artifact ID'si anlamına gelir; “all 24 games” her game ID için kontrol/integration sonucu anlamına gelir. Güvenlik ve kaynak kontrolleri için seçilen sayısal frame/aggregate/rate/room/socket eşikleri testten önce kaydedilmelidir.

### Closed friends-only pilot

- Access is private/trusted or an actual TLS edge is in place; no accidental broad public exposure.
- Same client/server commit pair is used; active rolling update yok.
- `npm ci`, `npm test`, `npm run typecheck`, `npm run build` clean-checkout evidence'i kayıtlı.
- R2/R3 route at 2/3 players, all core phases, reconnect during turn/transition, host/guest disconnect and room cleanup pass.
- iOS Safari + Android Chrome physical checks pass for portrait/landscape, keyboard, refresh, background/foreground, lock/unlock, Wi-Fi off/on and visible connection loss.
- Public abuse controls are not claimed as complete; pilot traffic remains constrained and online-only scope is explicit.
- Restart room loss is communicated as expected behavior; no promise of offline gameplay.

### Small public V1

- Real DNS/HTTPS/TLS and same-origin `wss://<real-host>/ws` pass from external networks; no placeholder hostname.
- Explicit WebSocket frame/aggregate limits, binary/malformed policy, per-socket/IP/message/room/socket quotas, Origin allowlist, drawing byte/point/save limits and outbound backpressure pass adversarial tests.
- Reconnect token bearer policy, grace expiry, duplicate sockets and host takeover semantics are documented and tested; tokens never appear in logs.
- Protocol handshake rejects incompatible clients or proves supported backward compatibility; stale PWA gets update-required/reload UX; client ignores stale socket/state messages.
- PWA production build caches every generated JS/CSS asset; navigation fallback is navigation-only; offline shell loads without HTML-as-module/style MIME errors; missing assets do not receive HTML.
- Manifest has tested 192×192 and 512×512 PNG icons, dedicated maskable safe-zone icon and iOS `apple-touch-icon`; installed iOS/Android PWA launch is verified.
- Full R2/R3 route and every §14 chaos row have a passing artifact at 2/3/5/8 players; all 24 games have a recorded integration/control result by game ID; no wrong phase, score, roster, orientation or stale-state result.
- iOS Safari, installed iOS PWA, Android Chrome and installed Android PWA all pass the required orientation, keyboard, lifecycle, lock, Wi-Fi, refresh, reconnect and host/guest scenarios.
- Required CI runs install/test/typecheck/build, self-contained realtime smoke and deployment config checks; public edge HTTPS/WSS smoke and rollback evidence are retained.
- Minimal V1 observability records health, connection/reconnect/rejection/cleanup signals without secrets or heavy platform dependency.

### Not acceptance criteria for this phase

OAuth/JWT, database, Kubernetes, service mesh, multi-region, enterprise SIEM, heavy monitoring platformı, offline gameplay and persistent active-match recovery are not required unless product scope later changes.

## R8 QA Decision

**R8 decision: PASS WITH REVISIONS — public NO-GO, trusted pilot conditional.** The revisions requested by the final gate were applied below. This document is an audit/plan, not a release approval; the release disposition at the audited ref remains public **NO-GO**, closed pilot **conditional**.

### Quick wins

- Release packet'ına audited SHA `2118d9ab254c4e69988c6192e9fe6409dad333c7` ve bu planı ekle; stale Stage 10/A0 sayımlarını yeni kanıt üretmeden approval kanıtı olarak kullanma.
- CI smoke adımını ephemeral port + `GLIX_SMOKE_HTTP_URL`/`GLIX_SMOKE_WS_URL` ile deterministik hale getir ve her koşuda commit/build/route/player-count/oracle artifact'ı sakla.
- Public edge için DNS/TLS, same-origin `/health` + `/ws`, Origin allowlist, güvenlik header'ları ve rollback kontrolünü tek release checklist'inde sırala.
- PWA release checklist'inde generated JS/CSS asset listesi, navigation-only fallback, MIME/404 kontrolü, 192/512 PNG + iOS icon ve safe update/resume smoke'ını zorunlu tut.

## Audit Artifacts and Git Diff Summary

- **Created by this audit:** `docs/STAGE_11_RELEASE_HARDENING_PLAN.md` only.
- Runtime, PWA, Docker, Nginx, CI and deployment configuration changes: **none**.
- Audit baseline: `main` at `2118d9ab254c4e69988c6192e9fe6409dad333c7`.
- Existing unrelated untracked docs in the workspace were not inspected, modified or included as evidence.
- Stage 10's `37/37` count and A0's recorded `HEAD: fe2d79c` are stale relative to current `main`; current project memory records `47/47` (42 shared + 5 server integration), but this audit did not rerun artifact-producing commands.

## R8 Gate

R8: **PASS WITH REVISIONS — public NO-GO, trusted pilot conditional**

RELEASE / SECURITY / PWA AUDIT: COMPLETE
