# GLIX — Kalıcı Hafıza

> **Kanonik redesign çalışma hafızası — son PM güncellemesi 2026-09-08**
>
> Bu dosya GLIX'in redesign sürecindeki tek kalıcı karar/ilerleme kaynağıdır. `GLIX-PROJE-HAFIZASI.md` tarihsel kayıttır.
>
> **PM kuralı:** Her aşamanın başında ve sonunda bu dosyayı asistan/PM bizzat okur/günceller. Oyun işi varsa PM ilgili kanonik kuralı + adapter/testleri tazeler ve görsel referansı inceler. Implementasyon AI'ları bu dosyayı okuyabilir ama nihai hafıza sahibi değildir. PM GitHub diff/SHA/test kanıtını bağımsız doğrulamadan ve bu dosyayı commit etmeden aşama tamamlanmış sayılmaz.

---

## 1. Değişmez kalite hedefleri

1. **Gerçek mobil oyun hissi:** GLIX web sitesi/dashboard gibi değil, telefonda kurulu bir parti oyunu gibi görünmeli ve davranmalı. Mobile-first, büyük touch target, safe-area, gerçek portrait/landscape, düşük görsel karmaşa, performans-dostu motion.
2. **24/24 doğru gameplay:** Kurallar, skor, gizli bilgi, server authority, phase, reconnect, timeout, target ve sonuç davranışları bozulmayacak. UI kural icat etmez veya client-side authoritative skor hesaplamaz.

Arkadaş grubu kullanımında bu iki hedef dışındaki süreçler ikincildir; gereksiz enterprise bürokrasisi yoktur.

---

## 2. Kanonik kaynak önceliği

Çelişkide sıra:

1. Kullanıcının bu dosyadan daha yeni açık kararı.
2. `GLIX-MINIOYUN-KURALLARI-FORMU.md` — 24 mini oyunun kanonik kuralları.
3. `packages/shared/src/` engine/adapters/contracts + testler — gerçek uygulanmış davranış.
4. Bu hafıza.
5. Eski dokümanlar.

**Görsel referans kuralı:** Onaylı referans görsel layout/sanat yönü için mümkün olduğunca birebir uygulanır. Referans üzerinde gameplay/contract ile çelişen örnek metin/değer varsa kanonik kural/contract kazanır. Örn. teknik 0,3 sn Butona Bas server kuralıdır ama oyuncuya radar/ms dashboard olarak gösterilmez.

---

## 3. Canlı taban ve redesign branch

- Repo: `xpike-dgm/glix`
- Protected `main`: `12e3e5253edf9a6babed863b2351d1493a738816`
- Canlı uygulama revizyonu: `ba6e895f2e71a9466bcf2d87770ece53f9902780`
- CI-only release head: `0ac9fc29ce33448be5fee8947281c18e4a9b09fc`
- Public: `https://glix.lynrax.com`
- Public version/protocol: `0.7.0 / v3`
- Public canlı redesign tamamlanana kadar değişmeyecek.

### Redesign

- Branch: `redesign-mobile-first-v1`
- R0 master commit: `a26ab81098d8b5b012522f5c94b7b02b9e517228`
- R1 PM başlangıç commit: `66eaef5fd22bb4032e7177a112e94a33a7f4a1cd`
- R1-A UI branch final: `6b98cef6d85e13c4d0eea4880f323e91febc69ba`
- R1-B Protocol/ready/kick branch final: `bc814dc7aa8bae051c90062f028dccbb7292f463`
- R1-A merge commit: `5cce80e6a79c4ec1b0e31808fffb51e34443c8e2`
- R1-B merge commit / integrated redesign head before this memory update: `d4c6c001a35d186d356f951b6af6246f6032f386`
- Production `main` bu merge'lerden etkilenmedi.

---

## 4. Görsel sistem — LOCKED

### İlk master

`docs/design/GLIX-MASTER-REFERENCE.png`

- SHA-256: `bdcc7072889d4cd053b84fe79acbfd5e38e97397ea3b79e5656081ebbca225f7`
- 1491×1055
- İlham değil, hedef tasarım.

### Güncel final referans politikası

Kullanıcı 24 mini oyun için **1 oyun = 1 ayrı PNG** referans setini ve ayrıca 13 ortak ekranın final referanslarını onayladı. Uygulama AI'ları hedef ekranı yeniden tasarlamayacak; verilen PNG'yi mümkün olduğunca birebir kodlayacak.

Ortak sanat dili:

- deep navy / gece tabanı
- cyan + magenta + violet + lime neon vurgu
- aynı GLIX wordmark/logo sistemi
- aynı yuvarlak 2.5D blob/maskot karakter ailesi
- büyük mobil tipografi ve touch targets
- az panel, az HUD, teknik jargon yok
- desktop/SaaS/dashboard hissi yok
- ağır sürekli blur/parallax yok

### 13 ortak final referans

1. Home
2. Nasıl Oynanır
3. Oda Kur
4. Odaya Katıl
5. Host Lobi
6. Minigame Seçimi — **bağımsız full-screen sayfa**
7. Guest Lobi
8. Detailed game briefing + Hazırım
9. Tur Sonucu
10. Oyun Bitti / Genel Skor
11. Telefonunu Yana Çevir
12. Bağlantın Kesildi / auto reconnect
13. Odadan Çıkarıldın

Bu dosyalar final uygulama dalgasında `docs/design/references/common/` altına exact binary olarak kurulacak. 24 oyun referansları `docs/design/references/games/` altında tutulacak. AI başına görevle ilgili **5 referans görsel** verilecek; hedef ekran PNG'si primary reference, kalanlar ortak stil/kompozisyon desteğidir.

---

## 5. Kilitli ortak UX kararları

### Home

- Root ekranda geri oku yok.
- Mascotların altında örnek kişi isimleri yok.
- Slogan: `Aynı oda. Farklı hamle.`
- Alt açıklama: `Arkadaşlarınla en eğlenceli mini oyunlar burada.`
- Ana eylemler: `Oda Kur`, `Odaya Katıl`, `Nasıl Oynanır?`
- Alt bilgi: `2–8 Oyuncu • Herkes Kendi Telefonundan`.
- Normal bağlı durumda teknik connection badge yok.

### Nasıl Oynanır

- Genel oyun ailesini anlatır; tüm oyunları “gizli karar” veya “cevap gir” diye yanlış genellemez.
- 3 sade adım, mobile-first.

### Oda Kur / Katıl

- Takma ad + gerekiyorsa oda kodu dışında gereksiz alan yok.
- Avatar seçimi yok.
- Room code 5 karakter uppercase format; örnek `NQSX9`.
- Nickname sınırında referans görsel üzerindeki örnek sayı authoritative değildir; shared `MAX_NICKNAME_LENGTH` contract'ı korunur.

### Host Lobi

- Oda kodu büyük/kopyalanabilir.
- Self `Sen`, host `Oda Sahibi` olarak ayırt edilir.
- Host yalnız lobide diğer oyuncuları kick edebilir; kendisini kick edemez.
- Tek `Minigame Seçimi` aksiyonu bağımsız seçim sayfasına götürür.
- `Oyunu Başlat` büyük primary CTA.
- Teknik connection/protocol/server metni yok.

### Minigame Seçimi

- **Accordion kararı iptal edildi. Kullanıcının yeni kararı: bağımsız full-screen sayfa.**
- `Rastgele Seç` / `Elle Seç` modları; gerçek game catalog/availability korunur.
- Seçimi kaydet ve host lobisine dön.

### Guest Lobi

- Self `Sen`, host `Oda Sahibi`.
- Guest hostun seçtiği minigame/rota bilgisini görmez.
- Start/kick/selection kontrolü yok.
- Metin: oda sahibi oyunu başlattığında oyun başlayacak.

### Briefing / Hazırım

- Gameplay üstüne binen overlay değil, bağımsız full-screen ekran.
- Görünür countdown/progress yok.
- Kullanıcı yeni kararı: oyun oyuncunun gerçekten anlayacağı kadar detaylı anlatılacak; sabit “en fazla 3 madde” limiti yok.
- Uygun yapı: `Amaç`, `Nasıl Oynanır`, gerekiyorsa `Gizlilik`, `Puanlama` / kritik özel durumlar. Teknik iç detay yok.
- Ready avatar/count matematiksel tutarlı olmalı.
- Büyük `Hazırım`; server-authoritative ready bariyeri.
- Eligible = current-game participant + connected + not eliminated/spectator. Disconnected/spectator/eliminated bariyeri kilitlemez.

### Result

- Tur sonucu authoritative server verisini render eder; client skor kuralını hesaplamaz.
- Tur sonucu manuel `Sonraki Tur` / uydurma `Detayı Gör` aksiyonu yok; otomatik progression durumu gösterilebilir.
- Finalde `Lobiye Dön`; uydurma `Yeniden Oyna` yok.

### Sistem ekranları

- Landscape gate: geri/Tamam yok; telefonu yataya çevirince otomatik devam.
- Reconnect: teknik `server` dili yok, otomatik yeniden bağlanma; gameplay/lobby fark etmeksizin güvenli generic copy.
- Kicked: ayrı state — `Odadan çıkarıldın`, `Oda sahibi seni bu odadan çıkardı.`, `Ana Ekrana Dön`; `Tekrar Katıl` yok.

### PWA / mobile-app davranışı

- Standalone PWA, safe-area ve `100dvh` benzeri gerçek mobil viewport.
- Gameplay sırasında scroll/overscroll/text-selection/double-tap zoom gibi web hissi mümkün olduğunca engellenir.
- Canvas/gesture yüzeylerinde uygun `touch-action` kullanılır; input/form ekranlarının kullanılabilirliği bozulmaz.
- Landscape oyun gerçek full-screen landscape shell kullanır; ortada scroll edilen desktop panel yok.

---

## 6. R1 teknik sonuç — TAMAMLANDI / ENTEGRE

R1-A ve R1-B ayrı branchlerde tamamlandı ve 2026-09-08'de PM tarafından redesign branch'e merge edildi.

### Protocol v4 redesign

- Public canlı v3 kalır; redesign branch v4'e ilerler.
- `client:room:kick` + kicked room-left sonucu.
- Tutorial/briefing server-authoritative all-ready bariyeri.
- Gerekirse 0 ms internal preparing bridge; oyuncu ayrı preparing ekranı görmez.
- Disconnect/reconnect ready bariyerini deadlock etmez.
- Host kick yalnız lobby, only-host, no-self; reconnect session/token geçersizleşir.

### R1 merge kayıtları

- PR #3 R1-A → `redesign-mobile-first-v1`: merge `5cce80e6a79c4ec1b0e31808fffb51e34443c8e2`
- PR #4 R1-B → `redesign-mobile-first-v1`: merge `d4c6c001a35d186d356f951b6af6246f6032f386`
- R1-A değişikliği 27 dosya; R1-B 12 dosya.
- Bu entegrasyon yalnız redesign branch'tedir; public `main` değişmedi.
- Final referans dalgası R1-A'nın ilk görsel yaklaşımını gerektiği yerde yeniden/üzerine birebir uygulayacaktır.

---

## 7. Yeni aktif aşama — R2/R3/R4 PARALLEL REFERENCE IMPLEMENTATION WAVE

**Durum: AKTİF — 2026-09-08**

Kullanıcının kararıyla R2/R3/R4 seri yürütülmeyecek; 8 ayrı Luna Max Codex ajanıyla paralel büyük dalga yürütülecek. Bütün ajanlar integrated redesign base'den ayrı branch/worktree alır. Aynı branch'e eşzamanlı yazmazlar.

### Codex çalışma standardı

Windows Local Coder üzerinden tüm Codex işleri yalnız:

- model: `gpt-5.6-luna`
- reasoning effort: `max`

Uzun görevler blocking `run_command` ile değil `start_process` background + `process_output` takibiyle başlatılır. Mümkünse stdin kapalı/DEVNULL. `running:false` + gerçek exit code görülmeden tamamlandı varsayılmaz. Codex self-report tek kanıt değildir; PM dosya/git diff/status + test/build ile doğrular. Kullanıcı değişikliklerine izinsiz reset/restore yok.

Aktif Codex desktop/thread kontrolünde yalnız thread listesine güvenilmez; gerektiğinde `.codex/sessions/.../*.jsonl` büyümesi, son timestamps ve `task_started/task_complete` olayları kontrol edilir.

### 8 ajan dağılımı

**A1 — Common Entry / Core Flow**
- Home
- Nasıl Oynanır
- Oda Kur
- Odaya Katıl
- Host Lobi
- 5 primary/supporting common refs
- Common flow components; mümkün olduğunca global `App.tsx/styles.css` sahipliği bu ajanda toplanır.

**A2 — Lobby Selection / Briefing / Results + integration wiring**
- Minigame Seçimi
- Guest Lobi
- Briefing/Hazırım
- Tur Sonucu
- Final Sonuç
- R1-B Protocol v4 ready/kick ile UI wiring.

**A3 — Mobile/PWA exceptional states**
- Rotate device
- Reconnect
- Kicked
- + Home ve Briefing style support ref = toplam 5 ref
- OrientationGate/GameViewport/PWA viewport, safe-area, gameplay app-lock/overscroll/touch behavior.

**A4 — Game batch Stage11A (5 oyun)**
- `butona-bas`
- `gizli-hirsiz`
- `kor-kronometre`
- `asiri-yukleme`
- `son-kisi`

**A5 — Game batch Stage11C (5 oyun)**
- `acgozluluk-limiti`
- `ortalamanin-yarisi`
- `gizli-kareler`
- `cizgiyi-gecme`
- `gizli-alisveris`

**A6 — Game batch Stage11D (5 oyun)**
- `yazi-yaz`
- `sozluk-blofu`
- `cagrisim-agi`
- `rusvet-darbe`
- `karalama-defteri`

**A7 — Stage11B/risk/social (5 oyun)**
- `zaman-bombasi-hafizasi`
- `capraz-ates`
- `rus-ruleti`
- `sizma`
- `zehirli-kadeh`

**A8 — complex/remaining (4 oyun + 1 common style ref)**
- `kor-bomba`
- `ittifak`
- `kendim`
- `kontrol-paneli-kaosu`
- + approved common/rotate/master support ref

Toplam: 24/24 oyun + 13 ortak ekran kapsamda.

### Paralel branch kuralı

Her ajan ayrı branch/worktree. Game ajanları mümkün olduğunca kendi stage/dedicated component + scoped CSS dosyalarında kalır; büyük ortak `styles.css` / `App.tsx` değişikliği yapmaz. Ortak orchestrator conflict'leri A1/A2/A3 sahipliğinde tutulur. Gameplay adapter/scoring değişikliği ancak gerçek rule bug kanıtı varsa ve ayrı raporlanır.

### Her oyun ajanının zorunlu girdisi

- Hedef oyunun final PNG referansı.
- Toplam 5 reference image.
- `GLIX-MINIOYUN-KURALLARI-FORMU.md` ilgili bölüm.
- İlgili adapter/engine testleri.
- Primary talimat: referansı mümkün olduğunca **tıpa tıp** uygula; kural/hidden-state sınırını bozma.

---

## 8. Sonraki aşama — R5

Parallel wave merge/QA sonrasında:

- independent 24/24 gameplay regression
- visual reference similarity review
- reconnect/privacy/ready/kick
- portrait 360×800, 390×844, 412×915
- landscape 844×390
- no horizontal overflow
- reduced-motion
- mid-range Android performance
- PWA app-like gesture/zoom/scroll behavior
- 3–8 gerçek telefon
- kontrollü redesign deploy; Caddy'ye gereksiz dokunma yok; `game.lynrax.com` etkilenmez.

---

## 9. Yasaklar

- Dashboard/SaaS görünümü
- Player-facing debug/telemetry/protocol/stage/batch/server dili
- Referansı “iyileştirme” bahanesiyle yeniden tasarlama
- Kural dosyasında olmayan gameplay action/button
- Gizli state'i DOM/ARIA/class/data/id/SVG metadata'ya sızdırma
- UI'nın authoritative skor/rank hesaplaması
- Public canlıya wave ve R5 tamamlanmadan deploy
- Caddy restart/reload veya unrelated `game.lynrax.com` değişikliği

---

## 10. PM aşama günlüğü

### 2026-09-07 — R0

- Public `0.7.0 / Protocol v3` dışarıdan doğrulandı; gerçek telefon testinde eski görsel UX reddedildi.
- Mobile-first neon master kilitlendi.
- Master exact binary repo'ya eklendi; R0 commit `a26ab81098d8b5b012522f5c94b7b02b9e517228`.

### 2026-09-07 — R1 başlangıç

- PM hafıza/master/rule/engine/common UI kaynaklarını tekrar okudu.
- R1-A UI ve R1-B ready/kick/protocol paralel başlatıldı; base `66eaef5fd22bb4032e7177a112e94a33a7f4a1cd`.

### 2026-09-08 — R1 entegrasyon / parallel wave başlangıcı

- PM GitHub'dan R1-A final SHA `6b98cef6d85e13c4d0eea4880f323e91febc69ba` ve R1-B final SHA `bc814dc7aa8bae051c90062f028dccbb7292f463` doğruladı.
- R1-A PR #3 merge edildi → `5cce80e6a79c4ec1b0e31808fffb51e34443c8e2`.
- R1-B PR #4 merge edildi → `d4c6c001a35d186d356f951b6af6246f6032f386`.
- Kullanıcının final 24 oyun + 13 common reference seti kilitlendi; ortak ekran kararlarındaki son overrides bu hafızaya işlendi.
- R2/R3/R4 yerine 8-agent parallel reference implementation wave **AKTİF** olarak açıldı.
- Sonraki iş: bu memory commit'inden exact base alarak 8 izolasyon branch/worktree oluştur; Luna Max ajanlarını background process olarak başlat; sonuçları PM bağımsız doğrula.

### 2026-09-08 — Parallel wave PM acceptance: A7 entegre

- PM bu çalışmada GitHub'daki `GLIX-KALICI-HAFIZA.md` ve `docs/tasks/WAVE-DISPATCH.md` dosyalarını yeniden okudu; aktif aşama 8-agent parallel reference implementation wave olarak devam ediyor.
- A7 branch: `wave-a7-games-stage11b`.
- A7 implementation commit: `798c158` (`feat: implement A7 risk game references`), 7 dosya; yalnız `apps/client/src/visuals/games/stage11-8b/` scope'u.
- PM acceptance kanıtı: `git diff --check` temiz; Stage11B/shared privacy tests `11/11` geçti; client privacy tests `3/3` geçti; shared build geçti; production client Vite build PM tarafından sandbox dışında geçti.
- Full client typecheck hâlâ A7'nin dokunmadığı `apps/client/src/dev-r1.tsx` içindeki mevcut harness type hatalarında duruyor; A7 scope'una ait yeni type error kanıtı yok.
- A7 kontrollü olarak `redesign-mobile-first-v1` branch'ine cherry-pick edildi. Entegrasyon commit'i: `62c2725cddbe78ba577e4f6d2fa504ff28973aed`.
- A7 kapsamındaki oyunlar: `zaman-bombasi-hafizasi`, `capraz-ates`, `rus-ruleti`, `sizma`, `zehirli-kadeh`. Canonical gameplay/scoring/private-state adapterları değiştirilmedi; privacy regresyonları geçti.
- A5 Codex süreci bu kontrolde gerçek exit code `1` ile usage-limit nedeniyle durdu; worktree değişiklikleri korunuyor ve tamamlandı/accepted sayılmadı.
- Diğer A1-A6/A8 worktree'leri korunuyor; kullanıcı değişikliklerine reset/restore yapılmadı. A8'de A7-owned Stage11B dosyalarının kopya/overlap riski acceptance sırasında temiz ownership kuralıyla ayrıştırılacak.
- Sonraki PM adımı: A1-A6/A8 ajan çıktılarının gerçek exit durumunu ve branch diff/test/build kanıtını bağımsız doğrulamak; önce scope-temiz adayları commit/push etmek, sonra accepted olanları redesign branch'e sırayla entegre etmek.

### 2026-09-08 — Parallel wave PM review: A5 visual gate RED / Codex limit

- PM bu çalışmada GitHub'daki `GLIX-KALICI-HAFIZA.md` ve `docs/tasks/WAVE-DISPATCH.md` dosyalarını yeniden okudu; aktif aşama değişmedi.
- A2/A3/A4/A5/A6/A8 için `gpt-5.6-luna` + `model_reasoning_effort=max` resume süreçleri exact 5 PNG girdileriyle yeniden denendi. Süreçler gerçek exit code `1` ile Codex usage-limit'e takıldı (`try again at 12:38 PM`); worktree değişiklikleri korunuyor ve hiçbiri tamamlandı/accepted sayılmadı.
- A5 worktree PM tarafından bağımsız incelendi. Scope temizliği ana olarak `apps/client/src/visuals/games/stage11c/` altında; `apps/client/.local-vite-stage11c.mjs` untracked local QA yardımcı dosyasıdır ve acceptance commit'ine alınmayacak.
- A5 canonical Stage11C regresyonu PM tarafından sandbox dışında yeniden çalıştırıldı: `games-stage11c.test.js` 9/9 PASS; shared build PASS; `git diff --check` temiz.
- A5 production client Vite/PWA build PM tarafından sandbox dışında exit code `0` ile geçti.
- Full client typecheck exit code `2`; hatalar A5'in değiştirmediği mevcut `apps/client/src/dev-r1.tsx` harness alanında (`JSX`, eksik `LobbyState.phase`, eksik `MatchPlayerState` alanları). A5 scope'una ait yeni type error görülmedi.
- A5 browser QA `qa:stage11c` exit code `0`: 5 oyun için toplam 50/50 layout/stage integrity kontrolü geçti; 320x700, 390x520, 390x844 ve 844x390 senaryolarında overflow bulunmadı.
- Ancak PM exact reference görsel karşılaştırmasında A5'i **REJECT / REVISION REQUIRED** yaptı. Örnek `acgozluluk-limiti-playing-390x844.png`, kilitli `12-acgozluluk-limiti-reference-v3.png` kompozisyonunu takip etmiyor; eski `OYUN 02/05`, `BAĞLI`, `ÇIK`, büyük legacy HUD/arena shell'i ve farklı kart/CTA düzeni hâlâ görünür. Bu, 50/50 teknik layout QA'ya rağmen visual acceptance gate'i geçmez.
- A5 branch commit/push/merge yapılmadı; mevcut dirty implementasyon ve PM QA çıktıları korunuyor. Kullanıcı işi reset/restore edilmedi.
- Sonraki PM adımı: Codex limiti açıldığında A5'i exact v3/v2 PNG kompozisyonuna göre legacy stage shell/HUD'dan arındıracak net revision prompt ile resume etmek; ardından 5 primary screenshot'u exact referanslarla yeniden görsel karşılaştırıp ancak sonra commit/push/acceptance değerlendirmek. Paralelde A1/A2/A3/A4/A6/A8 adayları aynı gate ile sürdürülecek.

### 2026-09-08 — Parallel wave PM verification checkpoint: A2/A4

- PM bu çalışmada GitHub'daki `GLIX-KALICI-HAFIZA.md` ve `docs/tasks/WAVE-DISPATCH.md` dosyalarını yeniden okudu; aktif aşama 8-agent parallel reference implementation wave olarak devam ediyor.
- Redesign çalışma head'i bu checkpoint başında `286636bd2cb4a7a8998112cb1e299851a8a7d1f6` idi; production `main` değiştirilmedi.
- A4 `wave-a4-games-stage11a` worktree'si hâlâ task setup head `29e9566d799fe15b333f6275baefcf18b6d43316` üzerinde dirty implementasyon taşıyor. Beş oyun kaynakları + scoped CSS/shared helper değişmiş; kullanıcı işi reset/restore edilmedi.
- A4 task dosyasındaki exact refs yeniden doğrulandı: `06-butona-bas-reference-v2.png`, `08-gizli-hirsiz-reference-v3.png`, `09-kor-kronometre-reference-v3.png`, `20-asiri-yukleme-reference-v2.png`, `17-son-kisi-reference-v3.png`. Worktree'de `docs/design/references/wave-inputs` ve `artifacts/stage11a-screenshots` dizinleri mevcut; fakat exact dosya listesini okuyan local komutlar bu turda araç güvenlik katmanında engellendi. Bu nedenle A4 visual gate tamamlandı sayılmadı ve merge yapılmadı.
- A2 `wave-a2-lobby-briefing-results` worktree'si task setup head `47dd5790933125ff40cc8f5367b016790ca7c2ff` üzerinde dirty implementasyon taşıyor; scope `App/main`, lobby/briefing/wave-a2 UI, QA config ve Protocol v4 wiring için shared/server değişikliklerini içeriyor.
- A2 bağımsız PM client typecheck: `npm run typecheck --workspace @glix/client` gerçek `running:false`, exit code `0`.
- A2 bağımsız PM production client build: `npm run build --workspace @glix/client` gerçek `running:false`, exit code `0`; Vite build + PWA `generateSW` tamamlandı.
- A2 client protocol/PWA regression: `npm run test:client-pwa` gerçek exit code `0`, 6/6 suite PASS. Client privacy regression: `npm run test:client-privacy` gerçek exit code `0`, 3/3 PASS.
- A2 server regression `npm run test:server` background süreçte shared/server build'i geçti ve H1-H18 + reconnect testlerinin en az ilk 21 alt testi PASS verdi; bu checkpoint yazılırken süreç henüz `running:false` + gerçek exit code vermemişti. Tamamlandı varsayılmadı.
- A2 henüz visual reference gate, diff-scope acceptance ve server test final exit gate'ini tamamlamadığı için commit/push/merge edilmedi.
- Sonraki PM adımı: A2 server test sürecinin gerçek final exit'ini almak; A2'nin 5 locked common PNG'siyle mobil screenshot/reference gate'ini tamamlamak; A4 exact PNG dosya erişimi araç katmanında yeniden doğrulanınca beş oyun screenshot karşılaştırmasını bitirmek. Yalnız gate geçen adaylar redesign branch'e entegre edilecek.


---

## 11. 2026-10-16 — GLIX v1.0 Aşama 1 Stabilizasyon

- Kullanıcı GLIX 5 aşama v1.0 planını onayladı ve Aşama 1'i başlatmamızı istedi. Bu kayıt Stage 1 uygulama / QA çalışmasına aittir; R2-R5 veya canlı release kabulü anlamına gelmez.
- Güvenli temel: `main 12e3e525` korunuyor. Yeni isolated branch `fix/stage1-core-stabilization-20261016`; draft QA PR: https://github.com/xpike-dgm/glix/pull/5. Redesign basesi `1341a386`.
- VDS ön kontrol: GLIX checkout ve çalışan GLIX Docker servisi bulunmadı; `/srv/glix-stage1-qa` altında 148 önemli kaynak/config dosyası kopyalanarak Node.js 22 Alpine ephemeral Docker ile test çalıştırıldı. DGMusic ve Mailu servisleri değiştirilmedi.
- Kod düzeltmeleri: real match tutorial `canReady` engeli; connected/current participant eligible sayımı; host kick istemci wiring; protocol v4 typed R1 mock; 24 oyun için ayrı, anlaşılır briefing; 4 adet UI regresyon testi ve `npm test` entegrasyonu.
- Yerel QA sonuçları: `npm ci`, `npm run typecheck`, `npm run build` PASS; 119/119 shared, 28/28 server integration, 3/3 privacy, 4/4 yeni UI test PASS; 6 client PWA/protocol kontrol grubu PASS; gerçek WS smoke oda kurma/katılma ve tutorial girişinde PASS. 24 oyunun gerçek telefonda uçtan uca oynandığı iddia edilmez.
- GitHub Actions PR #5 workflow run `38907015269` başarısız; job steps boş ve log endpoint 404. CI kök nedeni henüz doğrulanmadı, release gate açık.
- Kanonik ayrıntılı rapor: `docs/STAGE1-BASELINE-2026-10-16.md`. 24 oyun QA matrisi, açık riskler, release engelleri burada takip edilir.
- Bu çalışma **main'e merge edilmedi, production'a yayınlanmadı**. Aşama 1 release kabulü GitHub CI kök nedeninin çözülmesine ve açık kapsam değerlendirmesine bağlıdır.
