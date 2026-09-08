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
