# GLIX — 24 Games Visual UX Audit

**Status:** Audit specification complete; Premium 2D Arcade override and C6 corrective pass applied
**Baseline:** `main` at `2118d9a` (`fix: stabilize multiplayer participants and reconnects`)
**Scope:** Future visual/interaction specification only. No production/runtime implementation is authorized by this document.
**Write scope:** Only `docs/GAME_VISUAL_SPEC_24.md` is created for this audit.

**Canonical companions:** Direction selection and C6 record live in
`docs/GLIX_CREATIVE_DIRECTIONS.md`; reusable asset prompts live in
`docs/GLIX_ASSET_PROMPT_LIBRARY.md`; the broader visual contract is
`docs/GLIX_VISUAL_BIBLE.md`. This audit remains specification-only and does not
authorize runtime implementation.

## 1. Executive Summary

GLIX’in 24 gerçek mini oyunu catalog, adapter, shared engine, client controls ve testlerden doğrulandı. Bu belge kuralları değiştirmez; gelecekteki fullscreen **Premium 2D Arcade** rebuild için görsel/UX contract üretir.

Bağlayıcı görsel yön: GLIX koyu arcade arka planı, güçlü cyan/magenta/violet aksanları, okunaklı gerçek HTML/SVG metin, yüksek kaliteli 2D game art ve kontrollü 2D motion kullanır. Core gameplay, HUD, interaction surface, game-specific object ve avatarlar 2D-first’tir. 2.5D architecture, gerçek zamanlı 3D scene, WebGL layer, 3D model ve photorealistic asset hedef değildir.

Derinlik hissi layered 2D composition, shadow/inner-shadow, bevel, rim light, gradient, sınırlı parallax, scale/sprite/SVG animation ve particles ile verilebilir. Asset önceliği SVG, transparent PNG/WebP, layered 2D background, gerektiğinde sprite sheet, procedural CSS/SVG ve yalnız net gameplay faydası varsa Canvas’tır. UI text raster asset içine gömülmez.

Ana UX kararı: aktif mini-game, dekoratif bir sahnenin altında duran HTML form değil, tek viewport’luk mobil party-game stage’idir. Generic backdrop, üstte dekoratif sahne, altta form, ayrı büyük player listesi, SaaS/dashboard kartları ve gameplay scroll tekrar oluşturulmayacaktır. Ortak olan stage shell/HUD/feedback erişilebilirlik kontratıdır; hero object, primary verb, bilgi açılımı, motion ritmi ve result metaforu oyun özel kalır.

### G0 / multi-agent orchestration

G0 Orchestrator olarak 24 oyun, interaction ve kategori benzerliğine göre altı disjoint uzman grubuna ayrıldı. G1–G6 aynı anda main source’u okuyarak kural, state, UI ve test kanıtı çıkardı. G7 için bağımsız adversarial review başlatıldı; ajan usage-limit nedeniyle tamamlanamadı, bu nedenle G0 aşağıdaki G7 lenslerini ayrı bir bağımsız QA pass olarak uyguladı ve bulguları Risks bölümüne aldı.

| Grup | Uzmanlık | Oyunlar |
|---|---|---|
| G1 | Reflex / timing / hidden deadline | Butona Bas, Gizli Hırsız, Kör Kronometre, Son Kişi |
| G2 | Social / text / deception | Yazı Yaz, Sızma, Sözlük Blöfü, Çağrışım Ağı |
| G3 | Hidden information / risk | Rus Ruleti, Kör Bomba, Kontrol Paneli Kaosu, Zehirli Kadeh |
| G4 | Number / strategy / choice | Rüşvet ve Darbe, Açgözlülük Limiti, Ortalamaya En Yakın, Çizgiyi Geçme |
| G5 | Memory / grid / drawing / market | Zaman Bombası Hafızası, Gizli Kareler, Karalama Defteri, Gizli Alışveriş |
| G6 | Social choice / negotiation / compound interaction | Kendim, İttifak, Aşırı Yükleme, Çapraz Ateş |

### Ortak dış faz contract’ı

Gerçek engine akışı `tutorial (10 sn) → preparing (5 sn / ready bariyeri veya timeout) → playing → results (6 sn) → transition (3 sn)` şeklindedir. Oyun içi alt fazlar adapter tarafından server clock ile ilerletilir. Visual rebuild bu süreleri kısaltamaz, gizli deadline uyduramaz ve result’ı erkene alamaz.

### İncelenen kanıt yüzeyi

- Catalog/factory: `packages/shared/src/index.ts`, `catalog-stage10.test.ts`.
- Stage 6: `packages/shared/src/games.ts`, `games.test.ts`.
- Stage 7: `packages/shared/src/games-stage7.ts`, `games-stage7.test.ts`.
- Stage 8: `packages/shared/src/games-stage8.ts`, `games-stage8.test.ts`.
- Stage 9: `packages/shared/src/games-stage9.ts`, `games-stage9.test.ts`.
- Shared phases/privacy: `packages/shared/src/engine.ts`, `engine.test.ts`.
- Live composition and controls: `apps/client/src/App.tsx`, `NeonToyboxScene.tsx`, `Stage6GameControls.tsx`, `Stage7GameControls.tsx`, `Stage8GameControls.tsx`, `Stage9GameControls.tsx`.
- `main=2118d9a` participant/reconnect değişiklikleri: current-game participant, connected-player count ve spectator gating ayrıca dikkate alındı.

## 2. Catalog Verification

Catalog 24 ID’yi birebir kapatır; tüm oyunların max oyuncusu 8’dir. `supportsPortrait: true` bu auditte Portrait, `false` Landscape olarak raporlanmıştır. Catalog’da Adaptive yoktur; mevcut manifest orientation politikası gerçek bir lock uygulamadığı için orientation bulguları ayrıca risk olarak yazılmıştır.

| # | Game ID | Display Name | Stage | Category | Min–Max | Orientation | Gerçek playing akışı |
|---:|---|---|---:|---|---:|---|---|
| 1 | `yazi-yaz` | Yazı Yaz | 8 | sosyal | 3–8 | Portrait | 30 sn yaz → 60 sn tartışma → 30 sn writer/kelime tahmini |
| 2 | `kendim` | Kendim | 8 | sosyal | 3–8 | Portrait | 30 sn kelime → 30 sn kart eşleştirme |
| 3 | `sizma` | Sızma | 6 | sosyal | 3–8 | Portrait | 2 clue round → ready bariyeri → 30 sn vote |
| 4 | `sozluk-blofu` | Sözlük Blöfü | 8 | sosyal | 3–8 | Portrait | 50 sn bluff → 30 sn definition seçimi |
| 5 | `cagrisim-agi` | Çağrışım Ağı | 8 | sosyal | 2–8 | Portrait | 30 sn tek normalize answer |
| 6 | `butona-bas` | Butona Bas | 6 | zaman | 2–8 | Portrait | 45 sn / 150 × 300 ms pencere |
| 7 | `rus-ruleti` | Rus Ruleti | 9 | risk | 2–8 | Landscape | holder başına 18 sn; risk artışı/eliminasyon |
| 8 | `gizli-hirsiz` | Gizli Hırsız | 7 | zaman | 2–8 | Portrait | 30 sn içinde tek gizli steal |
| 9 | `kor-kronometre` | Kör Kronometre | 7 | zaman | 2–8 | Portrait | 18 sn; görünmeyen 10.000 ms hedef |
| 10 | `kor-bomba` | Kör Bomba | 7 | risk | 2–8 | Landscape | 15–20 sn gizli fuse; pas başına +1–4 sn |
| 11 | `rusvet-darbe` | Rüşvet ve Darbe | 8 | strateji | 3–8 | Portrait | 20 sn election → gerekirse RPS → 25 sn dağıtım |
| 12 | `acgozluluk-limiti` | Açgözlülük Limiti | 7 | sayı | 3–8 | Portrait | 20 sn; player-count limit |
| 13 | `ortalamanin-yarisi` | Ortalamaya En Yakın | 7 | sayı | 3–8 | Portrait | 20 sn; 0–100, average/2 hedefi |
| 14 | `gizli-kareler` | Gizli Kareler | 7 | strateji | 2–8 | Portrait | 2 × 20 sn hidden cell; collision elimination |
| 15 | `karalama-defteri` | Karalama Defteri | 8 | sosyal | 3–8 | Portrait* | 75 sn draw → 20 sn vote |
| 16 | `ittifak` | İttifak | 8 | sosyal | 3–8 | Portrait | 60 sn bargain → 15 sn hidden vote |
| 17 | `son-kisi` | Son Kişi | 9 | zaman | 2–8 | Portrait | server’da gizli 10–20 sn finish; one escape |
| 18 | `cizgiyi-gecme` | Çizgiyi Geçme | 7 | sayı | 2–8 | Portrait | 30 sn; unique ten-bucket risk |
| 19 | `gizli-alisveris` | Gizli Alışveriş | 7 | strateji | 3–8 | Portrait | 30 sn; 60 krediyle hidden cart |
| 20 | `asiri-yukleme` | Aşırı Yükleme | 7 | zaman | 2–8 | Portrait | energy 100 → hidden 3 sn armed → overflow |
| 21 | `kontrol-paneli-kaosu` | Kontrol Paneli Kaosu | 8 | strateji | 2–8 | Landscape | 60 sn private panel/clue, one cable cut |
| 22 | `zehirli-kadeh` | Zehirli Kadeh | 8 | risk | 2–8 | Portrait | 20 sn; one trade, +5 sn extension |
| 23 | `capraz-ates` | Çapraz Ateş | 7 | strateji | 3–8 | Portrait | 25 sn hidden target veya miss |
| 24 | `zaman-bombasi-hafizasi` | Zaman Bombası Hafızası | 6 | hafıza | 2–8 | Portrait | sequence display → timed repeat → elimination |

`*` Karalama Defteri catalog’da Portrait destekler, fakat current Canvas `720×440` ve no-lock davranışı Landscape bias taşır; bu bir rebuild acceptance blocker’ıdır.

## 3. Shared Visual Rules

1. **2D gameplay stage:** viewport `100dvh × 100vw`; layered 2D background, game-specific 2D hero, interaction-on-object, compact player/status layer ve temporary tutorial/result overlay aynı stage’te yaşar.
2. **Bir oyun, bir başrol objesi:** aynı orb, rounded card veya generic gradient card 24 oyunun ana objesi olamaz. Bevel, shadow, rim light ve parallax yalnız hero object okunurluğunu artırır.
3. **HUD çevresel ve 2D:** phase, timer, connection, score ve progress edge rail/hero çevresinde kalır. Ayrı büyük live roster yok; 8 oyuncu compact token/ring/arc/pip olur.
4. **Scroll gameplay yok:** karar alanı tek viewport’a sığar. Uzun result paged/reveal olur; ana hit-area page scroll’a bağlı olmaz.
5. **Generic HTML form yok:** native input/select/textarea erişilebilir semantic layer olarak korunabilir, fakat görünen yüzey physical 2D object, card, dial, cable, stamp, pad veya board’dur.
6. **Information boundary:** `publicState`, `ownGameState` ve server result ayrımı görsel/ARIA/animation ile korunur. Secret state color, avatar pose, width, placeholder, pulse, sound/haptic veya prefetch ile kodlanmaz.
7. **Local vs server feedback:** local input anında kişisel geri bildirim alabilir; group/result geri bildirimi yalnız server resolve sonrası gelir. Color tek başına success/fail taşımaz.
8. **Orientation gate:** Rus Ruleti, Kör Bomba ve Kontrol Paneli Kaosu Landscape stage olarak kilitlenir; diğerleri Portrait-first kalır. Current `supportsPortrait` metadata’sı tek başına yeterli değildir.
9. **Premium 2D ton:** young-adult, playful ama childish/candy değil; dark arcade, cyan/magenta/violet accents, bold readable text, energetic motion, restrained glow. Preschool mascot, photorealism, fake 3D clutter ve excessive cute character yok.
10. **Text canlı kalır:** all game copy, player names, words, numbers and scores HTML/SVG text; raster asset’te baked text yok.
11. **Canvas istisnası:** sadece Karalama Defteri user-authored stroke gameplay’i için Canvas justified’ır. Diğer oyunlar SVG/CSS/DOM-first’tir.

### Stage wireframe contract

```text
┌──────────────────────────────────────────────┐
│ phase/goal       timer / connection     HUD   │
│                                              │
│           2D HERO OBJECT / SPRITES           │
│         primary interaction on-object        │
│                                              │
│ self status      compact player tokens       │
│ tutorial/result as temporary overlay         │
└──────────────────────────────────────────────┘
```

Bu wireframe bilgi hiyerarşisidir, her oyun için aynı layout kopyası değildir. Hero object, token düzeni, primary verb ve result motion her spec’te yeniden seçilir.

### Information visibility contract

| State | Görsel davranış |
|---|---|
| Public | Faz, server clock, izin verilen ortak status; seçim/secret value yok |
| Private | İlgili oyuncunun local stage layer’ında; shared animation/roster ile kodlanmaz |
| Secret until result | Opaque/masked placeholder; doğru değer, hedef, renk, zaman veya owner çıkarılamaz |
| Opponent status | Ready/submitted/alive/eliminated/turn owner compact semantic pip olarak; secret role/value değil |
| Spectator | No input hit-area; dimmed stage + açık spectator banner |

## 4. 24 Game Specs

Her spec tam olarak prompttaki 26 zorunlu alanı kullanır. Implementation truth, önerinin gerçek adapter kuralına bağlı kalması için kısa kanıt özetidir.

### 4.1 `yazi-yaz` — Yazı Yaz

**Implementation truth:** Stage 8 `YaziYazAdapter` iki writer seçer. 30 sn write’ta writer kendi kelimesini, diğerleri `MASUM` gönderir; ardından 60 sn discussion ve 30 sn guess gelir. Tahminde kişi doğruysa +1, kişi doğru ve word de doğruysa ek +1. Public writer IDs result’a kadar null tutulmak istenir; ancak `ownState.guessTargetPlayerIds` writer aday ID’lerini her client’a verir ve client select’inde gösterir. Kanıt: `packages/shared/src/games-stage8.ts`, `Stage8GameControls.tsx`, `games-stage8.test.ts`.

1. **Game ID:** `yazi-yaz`
2. **Display Name:** Yazı Yaz
3. **Category:** sosyal / hidden text deduction
4. **Min / Max Players:** 3 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Masaya iz bırakıp kimliğini saklamak, tartışmadan writer’ı ve kelimesini çözmek.
7. **Primary Interaction:** private text entry → social discussion → writer/word guess.
8. **Information Model:** Public: phase, timer, submitted rhythm. Private: own role and assigned word. Intended secret: two writer IDs, writer words and guesses until result; actual writer candidate IDs leak through `guessTargetPlayerIds`. Opponent status only phase-safe submitted/ready.
9. **Current UI Problem:** Generic Stage 8 form panel, input/select/button, discussion card, player choice grid and separate live roster deduction gerilimini dashboard akışına çeviriyor; guess candidate select’i writer IDs’ni erken açıyor.
10. **Fullscreen Stage Concept:** Portrait 2D ink room: two sealed typewriter capsules, a dark confession beam, and a flip reveal. Write’ta capsule kapanır; discussion’da masked silhouettes; guess’te anonymous candidate seals rotate.
11. **Main Physical / Visual Object:** Two locked 2D typewriter/ink capsules with press seals.
12. **HUD Placement:** Upper rail `WRITE / DISCUSS / GUESS` and timer; own role local lower rail; guess targets capsule face; score only after result.
13. **Player Representation:** 3–8 masked speech tokens around the capsules; all role-neutral before result; active discussion focus only, no role color.
14. **Input Surface:** HTML text input is visually an ink strip/typewriter key bed; guess is two-part flip card with a physical lock. No generic form row as primary presentation.
15. **Tutorial Overlay:** `AMAÇ — iki yazanı ve kelimelerini çöz.` / `HAMLE — kelimeyi gizlice bırak, sonra writer + kelime seç.` / `RİSK — yanlış kişi veya kelime puanı kaçırır.`
16. **Result Feedback:** Two seals break after server resolve; person +1 and word +1 are separate beats; group writer reveal comes last.
17. **Audio Opportunities:** Typewriter key, ink stamp, quiet discussion room tone, two distinct writer reveal stamps.
18. **Haptic Opportunities:** Local write lock; guess double pulse; separate person/word confirmation pulses.
19. **Required Assets:** MUST: capsule/typewriter silhouette, seal, word strip, neutral mask. SHOULD: ink particles, paper grain, reveal shutters. OPTIONAL: pen-nib variants.
20. **Can Be Procedural?:** Capsule, key grid, glow beam, mask, shutters and particles via SVG/CSS; one small paper texture.
21. **Asset Priority:** MUST capsule + anonymous writer tokens; SHOULD reveal FX; OPTIONAL paper/roster skins.
22. **Mobile Risks:** Keyboard can push hero below fold; 8 masks and target names must remain readable; safe-area and word/target surface separation.
23. **Fairness / Hidden-info Risks:** **P1 current leak:** `guessTargetPlayerIds` exposes writer candidate IDs before result. Future UI must use opaque candidate tokens or wait for API privacy fix; role/word/typed text also cannot leak via color, animation, or autocomplete.
24. **Estimated Visual Complexity:** L
25. **Reuse Group:** `WordInputSurface`, `PrivateInfoRibbon`, `TargetTokenSurface`, `TutorialOverlay`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Only Yazı Yaz owns the two-sealed writer reveal and ink/typewriter deduction rhythm.

### 4.2 `kendim` — Kendim

**Implementation truth:** 30 sn boyunca her oyuncu bir word gönderir; adapter words’ü shuffle ederek public cards üretir ve 30 sn match fazına geçer. Oyuncular partial/empty card→player mapping gönderebilir. Correct match +1, wrong −1; bir card’ı exactly one correct guesser bulursa owner +1; mini-score liderlerine `kendim:lider` ile +1 general delta gelir. Owner result’a kadar gizlidir. Adapter word overwrite’a duplicate guard koymaz; client ise visible button’ı kilitler. Kanıt: `games-stage8.ts`, `Stage8GameControls.tsx`, Stage 8 test.

1. **Game ID:** `kendim`
2. **Display Name:** Kendim
3. **Category:** sosyal / identity matching
4. **Min / Max Players:** 3 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Tek kelimeyle kişilik bırakmak ve arkadaşların “bu kim?” sezgisini okumak.
7. **Primary Interaction:** private word entry, card flip, player mapping, partial batch submit.
8. **Information Model:** Public: match fazında words/cards; owner IDs, matches ve score secret. Private: own word/card and submission state. Result: owners, guesses, correctness, owner bonus and leader delta. Opponent status only alive/submitted.
9. **Current UI Problem:** Her card label/select satırına dönüşüyor; çoklu select ve batch button identity game’ini form doldurmaya çeviriyor. Separate player sidebar mapping’i fiziksel ilişki yerine tablo yapıyor.
10. **Fullscreen Stage Concept:** Portrait 2D identity scanner: word cards dönen bir deck; card tap ile portrait token tray açılır, pin/tether ile bağlanır. Result’ta kartların back’i owner portrait’a döner.
11. **Main Physical / Visual Object:** Word-card deck / portrait carousel with magnetic pin.
12. **HUD Placement:** Top deck label + 30 sn timer; bottom `eşleştirme kilitleri` status; own card backside local-only; score result’a kadar yok.
13. **Player Representation:** 8 compact portrait tokens around deck; selected token temporary tether ile görünür; owner status result öncesi hiçbir token’da yok.
14. **Input Surface:** Select yerine tap-to-pair card + portrait token + physical pin. Drag optional enhancement, never drag-only; semantic select remains accessible.
15. **Tutorial Overlay:** `AMAÇ — kelimeleri sahipleriyle eşleştir.` / `HAMLE — kartı portreye bağla; boş bırakabilirsin.` / `RİSK — yanlış bağ −1 getirir.`
16. **Result Feedback:** Cards one-by-one flip; correct cyan pin, wrong red crack; unique owner bonus gold halo; leader delta final stamp.
17. **Audio Opportunities:** Card shuffle, pin click, wrong lock, owner-bonus gold chime.
18. **Haptic Opportunities:** Card focus, pin, wrong warning, owner bonus double tap.
19. **Required Assets:** MUST: card front/back, portrait token frame, pin/connector. SHOULD: carousel housing and paper/foil texture. OPTIONAL: portrait badge variants.
20. **Can Be Procedural?:** Card geometry/flip, tether, frame, glow and drag ghost SVG/CSS; texture only as small layer.
21. **Asset Priority:** MUST deck + portrait connector; SHOULD flip/pin FX; OPTIONAL character art.
22. **Mobile Risks:** 8 tokens, drag targets, keyboard overlap, accidental self-card reveal and no scroll dependency.
23. **Fairness / Hidden-info Risks:** Owner ID must stay absent from match state, CSS class, card geometry, color or animation. Current adapter permits repeat word overwrite despite one-shot visual; implementation gate required.
24. **Estimated Visual Complexity:** L
25. **Reuse Group:** `WordInputSurface`, `CardMappingSurface`, `PlayerStatusPips`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Kendim’s signature is a word physically pinned to a portrait, with ownership revealed only at result.

### 4.3 `sizma` — Sızma

**Implementation truth:** Stage 6’da ortak/outsider word pair ve random outsider atanır. Her oyuncu iki clue round’da sıralı `clue-complete` gönderir; clue action’ın kendi timer’ı yoktur. Herkes iki clue’yu tamamlayınca `ready-for-vote` bariyeri açılır; ready tamamlanınca 30 sn vote başlar ve self-vote geçerlidir. Unique top outsider ise normals +1; tie veya kaçışta outsider +2. Role/word result’a kadar hidden. Stage 6 detailed result controls normal App results branch’inde mount edilmez. Kanıt: `games.ts`, `Stage6GameControls.tsx`, `games.test.ts`.

1. **Game ID:** `sizma`
2. **Display Name:** Sızma
3. **Category:** sosyal / hidden role / verbal clue
4. **Min / Max Players:** 3 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Farklı kelime taşıyan outsider olarak çoğunluğa karışmak veya onu yakalamak.
7. **Primary Interaction:** sequential clue action, ready gate, hidden player vote.
8. **Information Model:** Public: clue turn/index, round progress, ready IDs, voted IDs and vote timer. Private: own role/word and completed clues. Secret: outsider identity, word pair and vote targets until result. Opponent status clue-turn/ready/voted only.
9. **Current UI Problem:** Secret word card, clue, ready and vote aynı vertical control card/HTML grid içinde; separate roster deduction’ı dashboard’a çekiyor. Ayrıca Stage 6 result component outer `results` fazında mount edilmediği için final reveal gerçek match’te kayboluyor.
10. **Fullscreen Stage Concept:** Portrait 2D whisper prism: opaque two-sided word core, active speaker microphone beam, shutter lock at ready, and anonymous accusation orbit at vote.
11. **Main Physical / Visual Object:** Opaque double-channel whisper prism / masked word core.
12. **HUD Placement:** Top `ROUND 1/2` + active speaker; vote’ta only 30 sn timer; ready/vote progress outer ring; own word on local prism face.
13. **Player Representation:** 8 mask tokens around prism; active speaker notch, ready/voted semantic pips; no outsider color/pose/tilt.
14. **Input Surface:** Clue completion is a talk-pass lever; ready is a shutter switch; vote is mask token into accusation slot. No voice capture is implied; action receipt only.
15. **Tutorial Overlay:** `AMAÇ — farklı kelime taşıyan sızmayı bul.` / `HAMLE — iki clue turunu tamamla, sonra bir oyuncuyu seç.` / `RİSK — eşitlikte sızma +2 alır.`
16. **Result Feedback:** Vote shutters open together; unique outsider caught gives normals +1, escape/tie gives outsider +2; word pair is last reveal. Stage 6 result gap remains a QA gate.
17. **Audio Opportunities:** Lever click, low whisper bed, vote lock, caught clean resolve or escape motif.
18. **Haptic Opportunities:** Turn handoff, ready shutter, vote lock, caught/escape result pattern.
19. **Required Assets:** MUST prism, mask tokens, microphone/lever glyph, word reveal plate. SHOULD shutter/orbit/whisper particles. OPTIONAL word texture.
20. **Can Be Procedural?:** Prism, orbit, masks, shutter, rings, pips and particles SVG/CSS.
21. **Asset Priority:** MUST prism + mask; SHOULD clue/ready/vote states; OPTIONAL language ornament.
22. **Mobile Risks:** 8 mask names, turn confusion, ready/vote mode confusion, safe-area and thumb reach.
23. **Fairness / Hidden-info Risks:** Role/word cannot leak through color, avatar pose, animation delay or label. `votedPlayerIds` only submitted status; target ID remains hidden. Result mount gap must be resolved in future runtime work.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `PrivateInfoRibbon`, `TargetTokenSurface`, `PlayerStatusPips`, `GameTimer`, `TutorialOverlay`, `ResultReveal`.
26. **Unique Identity Rule:** Sızma is the only two-faced whisper prism game: spoken clue first, masked accusation second, word reveal last.

### 4.4 `sozluk-blofu` — Sözlük Blöfü

**Implementation truth:** 50 sn write’ta her player ≤100 karakter bluff yazar; sonra gerçek definition ve bluff’lar shuffle edilerek 30 sn choose açılır. Real definition seçen chooser +1, bluff seçilen owner +1; own bluff seçilemez. Definition `ownerId`, `isReal` ve chooser IDs result’a kadar maskelenmek istenir, fakat public IDs `bluff-${playerId}` formatında olduğu için owner state inspection ile leak edilebilir. Kanıt: `games-stage8.ts`, `Stage8GameControls.tsx`, Stage 8 test.

1. **Game ID:** `sozluk-blofu`
2. **Display Name:** Sözlük Blöfü
3. **Category:** sosyal / text bluff
4. **Min / Max Players:** 3 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** İnandırıcı sahte tanım uydurup gerçek tanımı kalabalıkta ayırt etmek.
7. **Primary Interaction:** text authoring → read anonymous definition pages → choose real definition.
8. **Information Model:** Public: target word, phase, timer, anonymous definition texts in choose. Private: own bluff/submission. Secret: author, real/bluff flag and chooser IDs until result; current `bluff-${playerId}` IDs violate this. Opponent status submitted only.
9. **Current UI Problem:** Textarea, character count, button and definition card list are a generic form/card stack; no persistent dictionary object. Result uses same card stack and `id` substring creates identity leak.
10. **Fullscreen Stage Concept:** Portrait 2D living dictionary: sealed folio opens into a small page fan; write seals a page, choose flips anonymous pages, result applies real/bluff stamps.
11. **Main Physical / Visual Object:** Neon-rimmed dictionary folio / definition page deck.
12. **HUD Placement:** Target word on folio spine; timer upper edge; character count as page-line fill; choose pages center; owner stamp appears only result.
13. **Player Representation:** Definition phase no author identity; small quill pips may show aggregate submissions only. Result pins chooser/owner relationship to page edges.
14. **Input Surface:** Textarea becomes folio writing surface with physical line fill; submit presses a seal; definition choose is page tap/flip + bookmark, not dropdown.
15. **Tutorial Overlay:** `AMAÇ — gerçek tanımı blöflerden ayır.` / `HAMLE — 100 karaktere kadar tanım yaz veya bir sayfayı mühürle.` / `RİSK — seçilen blöf sahibine puan kazandırır.`
16. **Result Feedback:** Real page gets gold dictionary stamp; chosen bluff has owner thread; each +1 gets a coin beat; all pages reveal in a short sequence.
17. **Audio Opportunities:** Page flutter, quill scratch, seal press, real-definition bell, bluff accent.
18. **Haptic Opportunities:** Character threshold tick, seal, page selection, real reveal pulse.
19. **Required Assets:** MUST folio/page, seal/stamp, bookmark, anonymous page back. SHOULD quill/paper grain/owner thread. OPTIONAL cover skins.
20. **Can Be Procedural?:** Page layout/flip/seal/threads/bookmark CSS/SVG; one paper grain texture.
21. **Asset Priority:** MUST folio + opaque page IDs; SHOULD page/reveal FX; OPTIONAL cover variants.
22. **Mobile Risks:** Keyboard/safe-area, definition wrapping, 8 pages, accidental page gesture selection.
23. **Fairness / Hidden-info Risks:** **P1 current leak:** public definition IDs include `bluff-${playerId}`; UI must never expose owner ID substring. `ownerId`, `isReal`, chooser IDs and own authorship remain opaque until result.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `WordInputSurface`, `AnonymousCardStack`, `PrivateInfoRibbon`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Sözlük Blöfü alone owns the dictionary folio, anonymous page shuffle and real-definition stamp reveal.

### 4.5 `cagrisim-agi` — Çağrışım Ağı

**Implementation truth:** Adapter public `mainWord` seçer ve 30 sn tek answer alır; answer normalize edilir. Aynı normalized answer’da en az iki player varsa group üyeleri group size kadar puan alır; singleton 0’dır. Other answers/groups result’a kadar hidden; own answer own state’tedir. Kanıt: `games-stage8.ts`, `Stage8GameControls.tsx`, Stage 8 test.

1. **Game ID:** `cagrisim-agi`
2. **Display Name:** Çağrışım Ağı
3. **Category:** sosyal / association clustering
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Aynı kelimeyi aynı anda düşünerek görünmez bir zihinsel ağ kurmak.
7. **Primary Interaction:** one-shot free-text association.
8. **Information Model:** Public: main word, phase and 30 sn deadline. Private: own normalized answer/submitted state. Secret: other answers and group membership until result. Opponent status submitted only; no answer-specific hint.
9. **Current UI Problem:** Tek native text input + generic submit, main word only heading’de; result group cards mental network’i oyun objesine dönüştürmüyor.
10. **Fullscreen Stage Concept:** Portrait 2D thought lattice: center word node, local answer tile that magnetically locks without public text, then result graph connects matching tiles in waves.
11. **Main Physical / Visual Object:** Animated 2D word core / magnetic nexus.
12. **HUD Placement:** Main word large center-top; timer upper edge; bottom local sealed-tile status; result groups orbit node. No live answer list.
13. **Player Representation:** 8 neutral answer capsules around core; submitted pip may glow generically, never by answer/group.
14. **Input Surface:** Type-to-engrave hidden word tile; submit magnetically attaches tile to core. Semantic input stays real HTML/SVG text, not a visible generic form row.
15. **Tutorial Overlay:** `AMAÇ — ana kelimeye aynı çağrışımı yakala.` / `HAMLE — tek kelimeyi gizlice mühürle.` / `RİSK — yalnız kalan cevap puan vermez.`
16. **Result Feedback:** Matching tiles connect in waves and show `n kişi × n puan`; singleton fades neutrally; direct deltas near nodes.
17. **Audio Opportunities:** Magnetic snap, word hum, matching chord, singleton air release.
18. **Haptic Opportunities:** Tile submit snap, group rhythmic pulses, singleton neutral tap.
19. **Required Assets:** MUST 2D nexus, tile/back, capsule, connection line. SHOULD particles/group markers/result labels. OPTIONAL glyph skins.
20. **Can Be Procedural?:** Nexus, nodes, tethers, glow, sparks and graph reveal SVG/CSS; no large raster.
21. **Asset Priority:** MUST nexus + anonymous tile; SHOULD graph FX; OPTIONAL word-glyph textures.
22. **Mobile Risks:** Keyboard/safe-area, long word wrap, 8 nodes, answer must never be readable publicly.
23. **Fairness / Hidden-info Risks:** Normalize exactly as adapter; do not expose typed answer via width, color, text measurement, `inputCount` or animation. Group size only after result.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `WordInputSurface`, `SecretGraph`, `PlayerStatusPips`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Çağrışım Ağı’s signature is that hidden answers become physical clusters on one animated 2D nexus only at result.

### 4.6 `butona-bas` — Butona Bas

**Implementation truth:** 45 saniye 150 × 300 ms window’a bölünür. Aynı player aynı window’da tekrar tap etse de one participant sayılır. Window’da ≥2 participant varsa her biri +1; exactly one −1; empty 0. Final mini-score leader unique ise general +2, next rank +1; tied leaders +1. Public state window/end/finished, own state mini-score/last tap window verir. Generic `inputCount` aggregate activity leak eder. Kanıt: `games.ts`, `Stage6GameControls.tsx`, `games.test.ts`.

1. **Game ID:** `butona-bas`
2. **Display Name:** Butona Bas
3. **Category:** zaman / synchronized reflex
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Aynı 0,3 saniyelik fırsat penceresine başkalarıyla denk gelip yalnız basmaktan kaçmak.
7. **Primary Interaction:** repeated pointer-down tap on one shared button.
8. **Information Model:** Public: current window index/end, 45 sn rhythm, finished. Private: own mini-score/last tap window. Secret until result: window participants and tap pattern. Opponent status common alive/connected only.
9. **Current UI Problem:** Dedicated artwork exists, but actual pressure button is below generic stage; three stat blocks/progress bar read as dashboard. `inputCount` reveals aggregate activity; Stage 6 result detail is not mounted in normal App results branch.
10. **Fullscreen Stage Concept:** Portrait full-bleed 2D pressure deck; giant red button low-center, current 300 ms gate as ring, avatars as stable spectators, result as arcade ticket strip.
11. **Main Physical / Visual Object:** Heavy illustrated red arcade button on a spring pedestal.
12. **HUD Placement:** Top-left `PENCERE n/150`; top-right server-clock pulse; bottom local mini-score/lock. Remote participant count never shown.
13. **Player Representation:** 8 avatar tokens around deck; self outlined; remote taps never light live. Result may show abstract streaks, not raw event stream.
14. **Input Surface:** One oversized thumb-safe `BAS` cap with press/recoil and pointer-down; real accessible button semantics beneath, no small grid or scroll.
15. **Tutorial Overlay:** `AMAÇ — aynı pencereye denk gel.` / `HAMLE — 0,3 saniyelik pencerede BAS.` / `RİSK — yalnız basarsan −1.`
16. **Result Feedback:** Last windows resolve first; paired windows cyan, solo windows red recoil, final rank payout +2/+1 or tied +1 as ticket stamps.
17. **Audio Opportunities:** Mechanical thump local, server-resolved group chord, solo recoil click, final ticket chime; no live remote tap sound.
18. **Haptic Opportunities:** Local press, server-confirmed window result, distinct group/solo final pattern.
19. **Required Assets:** MUST button/pedestal, press/recoil states, window ring. SHOULD paired/solo burst, status LEDs, result ticket. OPTIONAL industrial decals.
20. **Can Be Procedural?:** Button/rings/gates/glow/recoil/sparks/shake/tickets CSS/SVG; existing PNG only as optional 2D layer.
21. **Asset Priority:** MUST hero button + press/result; SHOULD platform; OPTIONAL window-history polish.
22. **Mobile Risks:** 300 ms latency, hit area, `touch-action: manipulation`, no page scroll, server-clock sync and reduced motion.
23. **Fairness / Hidden-info Risks:** Server receipt time defines window; latency is inherent. Never translate `inputCount` into group/solo hint or live participant lights.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `SecretActionSurface`, `SynchronizedImpact`, `GameTimer`, `PlayerStatusPips`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Only Butona Bas owns the red spring button and paired-versus-solo 300 ms gate language; remote actions stay invisible until resolve.

### 4.7 `gizli-hirsiz` — Gizli Hırsız

**Implementation truth:** Stage 7 `GizliHirsizAdapter` 30 saniyelik tek bir gizli action penceresi açar. Her oyuncu en fazla bir `steal` gönderir: tam bir basan varsa o oyuncu +1, birden fazla basan varsa basanların her biri −1, kimse basmazsa 0. Press identities public state’te finish’e kadar saklanır; own state yalnız `hasPressed` taşır. Kanıt: `games-stage7.ts`, `Stage7GameControls.tsx`, Stage 7 test.

1. **Game ID:** `gizli-hirsiz`
2. **Display Name:** Gizli Hırsız
3. **Category:** zaman / hidden simultaneous action
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Alarm çalmadan tek başına çekirdeği çalan gizli suçlu olmak.
7. **Primary Interaction:** One-shot secret tap during a 30-second window.
8. **Information Model:** Public: phase, server deadline and finished state. Private: own `hasPressed`. Secret until result: all press identities/count and one-vs-many outcome. Opponent status: alive/connected only; no press marker.
9. **Current UI Problem:** Current `steal-core` orb and generic action button are a small control card below the generic stage. Shared `inputCount` aggregate activityyi açabilir; Stage 7 result component normal outer `results` branch’inde mount edilmez.
10. **Fullscreen Stage Concept:** Portrait 2D vault door: central closed iris, silent alarm filament and local fingerprint press. Remote activity never reacts live; result opens the lock or triggers an alarm.
11. **Main Physical / Visual Object:** Illustrated 2D vault latch with sealed keyhole and rotating iris.
12. **HUD Placement:** Covert label/timer upper edge; vault center; local one-use seal bottom. No live press count or winner hint.
13. **Player Representation:** 2–8 identical masked thief tokens behind privacy glass; own token thin outline; result converts one token to thief or several to alarm marks.
14. **Input Surface:** Large pressure latch/lock plate with local depression; underlying real button remains keyboard-accessible, but no generic form row.
15. **Tutorial Overlay:** `AMAÇ — tek gizli hırsız ol.` / `HAMLE — 30 saniye içinde bir kez kilide dokun.` / `RİSK — kalabalık basarsa basanlar eksi alır.`
16. **Result Feedback:** Unique press opens vault; multiple presses create red alarm strikes; no press leaves the seal closed. Apply +1/−1 after server result.
17. **Audio Opportunities:** Muffled latch, low alarm hum, solitary unlock, multi-press alarm.
18. **Haptic Opportunities:** Local latch, server-confirmed result, double warning on collision; no remote press haptic.
19. **Required Assets:** MUST vault/iris SVG, alarm filament, keyhole, thief badge. SHOULD open/alarm sprite states. OPTIONAL heist decals.
20. **Can Be Procedural?:** Iris, scan line, glow, shake, alarm and result marks SVG/CSS; one small latch texture optional.
21. **Asset Priority:** MUST vault + one-vs-many states; SHOULD scan/alarm motion; OPTIONAL skins.
22. **Mobile Risks:** One-shot accidental activation, scroll/gesture conflict, thumb reach and small viewport height.
23. **Fairness / Hidden-info Risks:** Do not style `inputCount` as press meter or vary local animation by remote activity. Server receipt/order is authoritative; press state stays silent until result.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `SecretActionSurface`, `ServerClockTimer`, `PlayerStatusPips`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Gizli Hırsız alone owns the sealed-vault/one-thief reveal; live art is intentionally quiet.

### 4.8 `kor-kronometre` — Kör Kronometre

**Implementation truth:** Stage 7 `KorKronometreAdapter` 18 saniyelik pencerede her oyuncunun bir kez stop yapmasını alır. Server `elapsedMs` ölçer; hedef 10.000 ms’dir. En yakın unique oyuncu +2, ikinci farklı mesafe +1; closest tie’da adapter’ın configured tied-leader reward’u +2’dir. No-tap 18.000 ms kabul edilir. Public canlı state deadline’i verir, tap/elapsed/target’ı vermez; own state kendi elapsed’ını verir. Kanıt: `games-stage7.ts`, `KorKronometreControls`, Stage 7 test.

1. **Game ID:** `kor-kronometre`
2. **Display Name:** Kör Kronometre
3. **Category:** zaman / blind timing
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Görmeden içinden sayıp tam onuncu saniyede zamanı kilitlemek.
7. **Primary Interaction:** One-shot blind stop.
8. **Information Model:** Public: phase and 18-second outer deadline. Private: own stop/elapsed. Secret: target, opponent elapsed and distance until result. Opponent status must not become a timing hint.
9. **Current UI Problem:** Question-mark dial + generic action button is an ornament/card, not a game instrument. `inputCount` aggregate stop activity leaks; Stage 7 result path is not mounted in outer results.
10. **Fullscreen Stage Concept:** Portrait 2D sealed metronome plate with a non-calibrated breathing pulse; after local stop, an opaque mark locks. No readable hand/target during play.
11. **Main Physical / Visual Object:** Flat blind stopwatch face with shuttered hand and single neon pulse.
12. **HUD Placement:** Outer 18-second timer edge; sealed dial center; local stop lock bottom. No live elapsed counter or target line.
13. **Player Representation:** Anonymous timing chips around dial; submitted chips only show generic lock, never closeness/time.
14. **Input Surface:** Entire dial is tactile `ŞİMDİ` stop plate; semantic button/keyboard path remains under the illustration.
15. **Tutorial Overlay:** `AMAÇ — 10,00 saniyeye yaklaş.` / `HAMLE — içinden say ve tek kez DURDUR.` / `RİSK — durmazsan 18 saniye sayılır.`
16. **Result Feedback:** Reveal target and server marks only after finish; closest +2, second +1, closest tie per adapter +2; no-tap dim 18s tick.
17. **Audio Opportunities:** Non-calibrated room hum, local stop thunk, bullseye/result tones; no metronome that reveals elapsed.
18. **Haptic Opportunities:** Local stop and server result pulses; no proximity cue during blind interval.
19. **Required Assets:** MUST shuttered dial, pulse, stop plate, rank marks. SHOULD tick/result sprites. OPTIONAL face skins.
20. **Can Be Procedural?:** Dial, shutter, pulse, rings and result traces SVG/CSS.
21. **Asset Priority:** MUST blind dial/stop; SHOULD result ranking; OPTIONAL face variants.
22. **Mobile Risks:** Latency, pointer-down semantics, accidental tap, screen sleep/background throttling; large stable target and no scroll.
23. **Fairness / Hidden-info Risks:** Never expose elapsed, target, remote stop or closeness via hand, fill, pulse frequency, color, `inputCount`, audio or haptic. Server result ranks.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `SecretActionSurface`, `PrivateRiskMeter`, `ServerClockTimer`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Kör Kronometre is defined by the absence of a readable clock/target; no other game may imitate this blind-dial silence.

### 4.9 `son-kisi` — Son Kişi

**Implementation truth:** Stage 9 `SonKisiAdapter` start’ta inclusive random 10–20 saniyelik hidden finish seçer. Each player once `escape` gönderir. En son escaped timestamp +1, earlier escapes 0, non-escape −1; equal final timestamps all +1. Public state `phaseEndsAt:null`, escape count/IDs and finish verir; exact deadline/times only result/own state’te. Kanıt: `games-stage9.ts`, `SonKisiControls`, Stage 9 test.

1. **Game ID:** `son-kisi`
2. **Display Name:** Son Kişi
3. **Category:** zaman / social nerve
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Herkes kaçarken soğukkanlı kalıp son güvenli anda kapıdan çıkmak.
7. **Primary Interaction:** One-shot escape under a hidden server deadline.
8. **Information Model:** Public: escaped IDs/count and finished state. Private: own escape state/time. Secret: exact deadline and opponent timestamps until result. Opponent status escaped/not escaped may be shown because adapter exposes it, but it must not become a deadline hint.
9. **Current UI Problem:** Existing corridor is the strongest motif but still a CSS card + button + escape list; live escaped names can become a roster. No countdown is intentional, and only result has meaningful timing detail.
10. **Fullscreen Stage Concept:** Portrait 2D emergency corridor made of flat layered panels, exit gate, silent alarm strip and retreating light bands. No timer hand or progress bar.
11. **Main Physical / Visual Object:** 2D emergency exit gate with pull latch.
12. **HUD Placement:** Top edge only compact escape count/connection; gate center; own one-use latch bottom. Never show time remaining.
13. **Player Representation:** Escaped players become door badges/light marks; waiting players muted silhouettes. No tall roster.
14. **Input Surface:** Large emergency latch/gate-pull surface; local lock, accessible semantic button and no scroll dependency.
15. **Tutorial Overlay:** `AMAÇ — son güvenli anda kaç.` / `HAMLE — kapı kolunu bir kez çek.` / `RİSK — erken kaçarsan 0, kalırsan −1.`
16. **Result Feedback:** Alarm freezes at hidden deadline, then escape order appears; last/equal gets +1, early 0, non-escape −1.
17. **Audio Opportunities:** Irregular corridor hum, latch, restrained door clicks, final alarm; no countdown rhythm.
18. **Haptic Opportunities:** Local latch, public escape status and final alarm; no deadline-proximity cue.
19. **Required Assets:** MUST exit gate/latch, light bands, alarm strip. SHOULD door badges/result stamp. OPTIONAL signage skins.
20. **Can Be Procedural?:** Corridor panels, bands, gate, tokens and alarm sweep SVG/CSS.
21. **Asset Priority:** MUST gate/latch/no-countdown state; SHOULD escape-order reveal; OPTIONAL skins.
22. **Mobile Risks:** Irreversible action, no visible timer, 8-player result density, safe-area and vertical scroll.
23. **Fairness / Hidden-info Risks:** Never add progress, accelerating glow, hidden-deadline pulse or player-specific timing. Public escape IDs/count are allowed; exact timestamps stay masked.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `SecretActionSurface`, `SecretDeadline`, `PlayerStatusPips`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Son Kişi alone uses a silent corridor and final alarm; it must never become a visible-timer game.

### 4.10 `rus-ruleti` — Rus Ruleti

**Implementation truth:** Stage 9 `RusRuletiAdapter` random holder seçer; holder 18 saniye içinde any alive target’ı, self dahil, seçip ateş eder. Initial risk 16%, each safe shot +10 percentage points up to 76%, explosion risk reset 16%. Explosion target’ı eler; alive count `floor(initial/2)` veya altına inince survivors +1 alır; timeout random target fires. Public `lastShot` current risk-before-shot değerini içerir ve client bunu herkese render eder, bu nedenle private risk leak vardır. Kanıt: `games-stage9.ts`, `Stage9GameControls.tsx`, Stage 9 test.

1. **Game ID:** `rus-ruleti`
2. **Display Name:** Rus Ruleti
3. **Category:** risk / elimination
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Landscape (`supportsPortrait: false`)
6. **Core Player Fantasy:** Tehlikeli kararı sıradaki oyuncuya devredip risk yükselirken hayatta kalmak.
7. **Primary Interaction:** Select self/any alive target, then fire; timeout chooses random target.
8. **Information Model:** Public: holder, alive/eliminated, shot count, deadline and shot outcome. Private: holder-only current risk and fire ability. Secret: random roll/outcome until server resolution; current `lastShot.riskPercent` is accidentally public and reveals risk history. Opponent status holder/alive is public.
9. **Current UI Problem:** Risk orb, stats, target grid and fire button form a vertical status dashboard. `lastShot` feed prints risk to everyone; 8 target buttons overload the landscape/phone transition. Generic scene has no weapon identity.
10. **Fullscreen Stage Concept:** Wide 2D firing lane with a centered illustrated cylinder/chamber, holder token and bottom target arc. Cylinder moves only after server shot; no 3D room.
11. **Main Physical / Visual Object:** Flat 2D roulette cylinder/chamber with private risk ring and trigger.
12. **HUD Placement:** Top `SIRA KİMDE`, shot/alive count, connection; holder-only risk inset; target selection on a wide lower action rail.
13. **Player Representation:** 2D portrait tokens on curved lane; holder turn arrow; eliminated crossed token. Tokens never encode risk/roll.
14. **Input Surface:** Target tokens become lockable chamber slots; firing is a large trigger plate integrated with chamber; real buttons remain accessible.
15. **Tutorial Overlay:** `AMAÇ — hayatta kalan tarafta kal.` / `HAMLE — silah sende olduğunda hedef seçip ATEŞ ET.` / `RİSK — güvenli atışta risk artar; süre dolarsa hedef rastgele seçilir.`
16. **Result Feedback:** Safe rotation passes holder; explosion cracks target token and resets ring; final survivors get +1. Roll appears only after server resolve.
17. **Audio Opportunities:** Cylinder ratchet, private risk hum, trigger, safe pass, restrained explosion, survivor fanfare.
18. **Haptic Opportunities:** Holder trigger, server-confirmed safe/explosion, elimination pulse; no observer risk signal.
19. **Required Assets:** MUST cylinder/chamber SVG, trigger, risk ring, token states. SHOULD safe/explosion frames. OPTIONAL cylinder skins.
20. **Can Be Procedural?:** Cylinder rotation, ring, target rail, trigger and sparks SVG/CSS; small impact texture optional.
21. **Asset Priority:** MUST chamber/masked risk; SHOULD safe/explosion result; OPTIONAL skins.
22. **Mobile Risks:** Landscape rotate gate, safe-area, 8 targets, target-name readability, no horizontal page scroll.
23. **Fairness / Hidden-info Risks:** **P1:** redact/mask public `lastShot.riskPercent`; live feed may show safe/explosion/turn only. Never infer current risk from prior shot, fill, color, vibration or history. Server random/timeout is authoritative.
24. **Estimated Visual Complexity:** L
25. **Reuse Group:** `PrivateRiskMeter`, `TargetTokenSurface`, `ServerClockTimer`, `ResultReveal`, `EliminationMark`, `OrientationGate`.
26. **Unique Identity Rule:** Rus Ruleti alone owns private escalating weapon risk and elimination chamber; it must not resemble bomb fuse or poison trade.

### 4.11 `kor-bomba` — Kör Bomba

**Implementation truth:** Stage 7 `KorBombaAdapter` random holder ve 15–20 saniyelik explosion deadline seçer. Holder `visibleRemainingMs:null` görür; non-holder own state gerçek süreyi görür. Holder başka bir player’a sınırsız kez pass yapabilir; each accepted pass passCount’ı +1 artırır ve deadline’a random 1–4 sn ekler. Deadline holder’da patlar ve −1 alır; game finish olur, survivor score yoktur. Kanıt: `games-stage7.ts`, `KorBombaControls`, Stage 7 test.

1. **Game ID:** `kor-bomba`
2. **Display Name:** Kör Bomba
3. **Category:** risk / hidden timer / social pass
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Landscape (`supportsPortrait: false`)
6. **Core Player Fantasy:** Bombayı taşıyan zamanı göremezken gözlemcilerin doğruyu/blöfü söylemesi.
7. **Primary Interaction:** Current holder selects another player and passes the bomb; repeatable until explosion.
8. **Information Model:** Public: holder, pass count, phase/finished. Private: non-holder exact remaining time; holder no time. Secret: exact deadline/final explosion until resolve. Opponent status holder is public, each player’s timer visibility asymmetric.
9. **Current UI Problem:** Bomb orb, pass count and target chips are a vertical card; no full 2D handoff chain. Landscape is catalog metadata only; detailed result control is not mounted in the outer results branch.
10. **Fullscreen Stage Concept:** Wide 2D hot-potato lane: bomb sprite travels between portrait tokens over a cable. Non-holder gets a private readable fuse; holder sees opaque pulse only.
11. **Main Physical / Visual Object:** Layered 2D bomb sprite with split fuse states.
12. **HUD Placement:** Public holder/pass count top; exact observer timer local inset; holder gets `ZAMAN GİZLİ`; target rail bottom.
13. **Player Representation:** Handoff-chain token positions; bomb overlay follows holder; no holder-time information in shared token art.
14. **Input Surface:** Target token press animates cable handoff; underlying real target buttons preserve accessibility; no gesture-only pass.
15. **Tutorial Overlay:** `AMAÇ — bomba sende değilken zamanı oku.` / `HAMLE — taşıyıcıysan yaşayan başka birine PASLA.` / `RİSK — süre biterken taşıyıcı patlar.`
16. **Result Feedback:** Fuse freezes, bomb bursts over holder and −1 appears. Do not invent survivor ranking or extra elimination.
17. **Audio Opportunities:** Observer-only fuse hiss, holder-opaque heartbeat, pass whoosh, final pop.
18. **Haptic Opportunities:** Pass transfer, observer timer pulse, holder-safe opaque warning, server explosion; never precise holder timer.
19. **Required Assets:** MUST bomb sprite/split fuse, cable, token overlay. SHOULD pass trail/explosion. OPTIONAL casing skins.
20. **Can Be Procedural?:** Cable paths, rings, transfer and particles SVG/CSS; bomb body layered transparent SVG/PNG.
21. **Asset Priority:** MUST bomb + asymmetric timer states; SHOULD pass/explosion; OPTIONAL skins.
22. **Mobile Risks:** Landscape target rail, 7 targets, orientation gate, safe-area, small token chain.
23. **Fairness / Hidden-info Risks:** Carrier timer must stay null visually and audibly; no fuse scale/color/haptic leaks. Unlimited passes can stall indefinitely; holder departure fixed-first transfer and disconnect-grace target eligibility require QA/product decision before sign-off.
24. **Estimated Visual Complexity:** L
25. **Reuse Group:** `PrivateRiskMeter`, `TargetTokenSurface`, `PassTradeTransfer`, `ServerClockTimer`, `ResultReveal`, `OrientationGate`.
26. **Unique Identity Rule:** Kör Bomba alone owns the asymmetric “I know the fuse, you hold the bomb” pass chain.

### 4.12 `kontrol-paneli-kaosu` — Kontrol Paneli Kaosu

**Implementation truth:** Stage 8 `KontrolPaneliAdapter` each player’a dört renk permutation panel verir. Random cycle içinde next target paneli hakkında two-position clue dağıtılır; player kendi panelinden one color `panel-cut` eder. Correct cutter +1 and clue holder +1; wrong/empty 0. 60 sn timer; panel, clue, target relation and correct color own/secret state’te, result’ta all reveal. Departure mapping cleanup için ayrıca QA gerekir. Kanıt: `games-stage8.ts`, `PanelControls`, Stage 8 test.

1. **Game ID:** `kontrol-paneli-kaosu`
2. **Display Name:** Kontrol Paneli Kaosu
3. **Category:** strateji / private panel deduction
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Landscape (`supportsPortrait: false`)
6. **Core Player Fantasy:** Kendi panelini okurken başka oyuncunun ipucunu doğru kablo kesimine çevirmek.
7. **Primary Interaction:** Inspect private four-color panel and cut exactly one color.
8. **Information Model:** Public: phase/deadline only plus generic submitted status. Private: own permutation, clue and cut. Secret: clue holder/target relationship, correct color and cuts until result. Opponent status no panel/role hint.
9. **Current UI Problem:** Current four wire rows + four cut buttons are below generic stage and still read as a form/card. Result abbreviates player IDs; landscape is not enforced. Departure can leave stale clue-holder mapping/phantom bonus.
10. **Fullscreen Stage Concept:** Wide full-bleed 2D illustrated console: four cable strips, private clue ribbon and one cutter cursor. Flat SVG layers use shadow, bevel/rim light and animated cable tension; no 3D console.
11. **Main Physical / Visual Object:** High-quality 2D control panel with four cable lanes and lit terminals.
12. **HUD Placement:** Timer/status top; panel center; clue ribbon private side layer; cut rail attached to panel bottom. No separate roster.
13. **Player Representation:** 2–8 cable-end tokens around board showing only local ready/cut status; clue relation masked until result.
14. **Input Surface:** Four cable terminals; pressing one animates cutter across that lane. Real SVG/HTML buttons remain semantic, not visually generic.
15. **Tutorial Overlay:** `AMAÇ — kendi panelindeki doğru rengi bul.` / `HAMLE — gizli ipucunu karşılaştır ve tek kablo kes.` / `RİSK — doğru kesim sana ve ipucu sahibine +1.`
16. **Result Feedback:** Cut cable flashes; correct continuity pulse benefits cutter + clue holder; wrong/empty open circuit. Reveal relationship pairs, not dense rows.
17. **Audio Opportunities:** Cable hum, clue ribbon unfold, cutter snap, continuity chime, open-circuit click.
18. **Haptic Opportunities:** Terminal, cutter, correct connection, wrong tap; no hidden-color haptic.
19. **Required Assets:** MUST console SVG, four cable lanes, terminal/cutter states, clue ribbon. SHOULD cable glow/break, screws/shadows. OPTIONAL text-free skins.
20. **Can Be Procedural?:** Cables, shadows, glows, cut transitions, tokens and result lines SVG/CSS; layered transparent console art.
21. **Asset Priority:** MUST console/cable system; SHOULD cutter/continuity; OPTIONAL plate variants.
22. **Mobile Risks:** Landscape-only board, clue text, 8 tokens and safe-area; rotate overlay and no shrink-to-card.
23. **Fairness / Hidden-info Risks:** Do not expose permutation, clue relation, correct color or cut through shared cable length/color/timing/avatar. Current removal mapping bug can award phantom clue bonus; fix/test before visual sign-off.
24. **Estimated Visual Complexity:** L
25. **Reuse Group:** `PrivateBoardSurface`, `ColorChoiceSurface`, `PrivateInfoRibbon`, `ResultReveal`, `ScoreDelta`, `OrientationGate`.
26. **Unique Identity Rule:** Kontrol Paneli Kaosu alone owns the four-color clue-to-cable-cut loop and paired bonus reveal.

### 4.13 `zehirli-kadeh` — Zehirli Kadeh

**Implementation truth:** Stage 8 `ZehirliKadehAdapter` player count’a göre 1 poison (≤3), 2 (4–5) veya 3 (>5) dağıtır. 20 sn phase’de each player once another player ile trade yapabilir; poison statuses differ ise swap olur, same ise state değişmez. Accepted trade deadline’a +5 sn ekler. Finish’te clean +1, poisoned 0; poison/trades result’a kadar hidden. Kanıt: `games-stage8.ts`, `GlassControls`, Stage 8 test.

1. **Game ID:** `zehirli-kadeh`
2. **Display Name:** Zehirli Kadeh
3. **Category:** risk / social trade
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Kadehin içini bilmeden güven seçip zehri başkasına itmek veya temiz kalmak.
7. **Primary Interaction:** Optional one-shot trade with another player.
8. **Information Model:** Public: phase, trade count and extended deadline. Private: own trade availability; own poison is null until result. Secret: poison IDs and trade history until result. Opponent status eligible/traded/alive only.
9. **Current UI Problem:** Generic orb + long target button roster hides the social trade object; public trade count becomes a dashboard stat; eight players create four rows and target names truncate.
10. **Fullscreen Stage Concept:** Portrait 2D banquet: central masked glass, neutral coaster tokens around it and one trade ribbon between two tokens. Liquid capsule swaps without poison reveal.
11. **Main Physical / Visual Object:** Layered 2D goblet/glass with opaque liquid capsule and rim shine.
12. **HUD Placement:** Phase, deadline and compact trade count top; glass center; target coaster arc/bottom tray; own-used seal beside glass.
13. **Player Representation:** Neutral glass coaster portrait tokens; selected pair gets neutral ribbon; poison marks only at result.
14. **Input Surface:** Tap coaster to slide sealed glass token along ribbon; optional confirmation as safety, underlying target button accessible.
15. **Tutorial Overlay:** `AMAÇ — temiz kadehle turu bitir.` / `HAMLE — bir oyuncuyla tek kez TAKAS yap.` / `RİSK — zehri bilmiyorsun; her takas süreyi uzatır.`
16. **Result Feedback:** Freeze last trade; reveal liquid simultaneously; clean +1 gold rim, poisoned no score violet seal; trade history after outcome.
17. **Audio Opportunities:** Glass ping, sealed slide, +5s shimmer, clean chime, poison reveal.
18. **Haptic Opportunities:** Target, trade lock, extension pulse, final result; no poison-specific pre-result feedback.
19. **Required Assets:** MUST glass/goblet SVG, masked liquid, coaster/token, trade ribbon. SHOULD rim/trail/reveal. OPTIONAL glass skins.
20. **Can Be Procedural?:** Highlights, liquid masking, ribbon, token layout and marks SVG/CSS; one transparent glass sprite optional.
21. **Asset Priority:** MUST neutral glass/masked liquid; SHOULD trade/reveal motion; OPTIONAL variants.
22. **Mobile Risks:** Seven targets in portrait, keyboard/safe-area, no scroll-dependent choice, clear one-use lock.
23. **Fairness / Hidden-info Risks:** No liquid color, shine, avatar tint, target glow, timing or haptic may reveal poison. Public tradeCount/deadline extension is valid; poison/trade provenance stays hidden. Filter disconnected-but-retained targets in future runtime.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `TargetTokenSurface`, `PassTradeTransfer`, `PrivateInfoRibbon`, `ServerClockTimer`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Zehirli Kadeh alone owns the masked-liquid trade ritual; uncertainty is the hero, not a fuse or elimination board.

### 4.14 `rusvet-darbe` — Rüşvet ve Darbe

**Implementation truth:** Stage 8 `RusvetDarbeAdapter` 20 sn election’da self dışı adaya oy alır; missing votes random tamamlanır. Unique president çıkarsa vote count kadar budget’ı target başına 1–2 dağıtabilir; tie olursa candidates 20 sn RPS turlarına girer. President +1, allocated token hedefe puan, kalan dağıtım deadline’da random tamamlanır. Vote count/president budget/allocations result’a kadar hidden; RPS candidates/round public. `fillRandomAllocations()` manual allocation üzerine full budget başlatabildiği için accounting QA gate gerekir. Kanıt: `games-stage8.ts`, `RusvetControls`, Stage 8 test.

1. **Game ID:** `rusvet-darbe`
2. **Display Name:** Rüşvet ve Darbe
3. **Category:** strateji / political social choice
4. **Min / Max Players:** 3 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Halk oyuyla tahta çıkıp jetonları stratejik dağıtmak; eşitlikte darbeyi kazanmak.
7. **Primary Interaction:** secret candidate vote → conditional RPS → president token allocation.
8. **Information Model:** Public: phase/deadline, RPS candidate IDs/round. Private: own vote/RPS and president allocation editing. Secret: vote counts, budget, bribes and voter provenance until result. Opponent status phase-safe only.
9. **Current UI Problem:** Player choice grid, RPS buttons and allocation grid are separate generic panels, a multi-step dashboard wizard; 8 candidates/tokens can overflow portrait. Result ledger lacks a coherent coup reveal and adapter accounting defect can make visuals show an impossible budget.
10. **Fullscreen Stage Concept:** Portrait 2D election wall: central crown/ballot seal, candidate token arc, then a coup coin and vertical bribe ledger. One flat illustrated wall transforms between subphases.
11. **Main Physical / Visual Object:** 2D crown over ballot seal with detachable influence tokens.
12. **HUD Placement:** Phase/timer top; crown center; candidate arc; president-only ledger anchored bottom; no live vote/token count.
13. **Player Representation:** Candidate portrait tokens; RPS candidates neutral duel brackets; president crown only after resolution; no vote weight before result.
14. **Input Surface:** Candidate token becomes ballot stamp; RPS is a three-symbol wheel; allocation uses tap-to-increment token slots, not a generic form or drag-only surface.
15. **Tutorial Overlay:** `AMAÇ — başkanı ve darbenin sonucunu doğru oku.` / `HAMLE — gizli oy ver; başkansan jeton dağıt.` / `RİSK — eşitlik darbeyi başlatır, kalan jetonlar rastgele gider.`
16. **Result Feedback:** Crown locks, RPS resolves, tokens travel to recipients; president +1 and bribe deltas appear as ledger entries. Render only server payload after accounting QA.
17. **Audio Opportunities:** Ballot stamp, crown rise, RPS slap, token clink, allocation shuffle, coup sting.
18. **Haptic Opportunities:** Ballot lock, RPS selection, token placement and result arrival; no hidden vote/token feedback.
19. **Required Assets:** MUST crown/ballot SVG, candidate token, RPS symbols, ledger token. SHOULD stamp/coin/token travel. OPTIONAL seal skins.
20. **Can Be Procedural?:** Ballot wall, arcs, ledger, token paths and RPS transition SVG/CSS; transparent crown/seal layers.
21. **Asset Priority:** MUST crown/ballot/ledger; SHOULD coup feedback; OPTIONAL cosmetic seals.
22. **Mobile Risks:** Portrait candidate/ledger density, keyboard/safe-area, 8-player targets, no gameplay scroll and readable live text.
23. **Fairness / Hidden-info Risks:** Do not show vote heat, token budget, voter IDs or allocation paths before result. Verify random+manual allocation accounting; visual result cannot repair rules.
24. **Estimated Visual Complexity:** L
25. **Reuse Group:** `TargetTokenSurface`, `SecretBallot`, `RpsWheel`, `TokenLedger`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Rüşvet ve Darbe alone owns ballot-to-crown-to-bribe-ledger progression; RPS is its coup beat, not the entire identity.

### 4.15 `acgozluluk-limiti` — Açgözlülük Limiti

**Implementation truth:** Stage 7 limit is player-count dependent: 3→6, 4→11, 5→17, 6→24, 7→33, 8→43; max choice is player count. Each player chooses 0..N in 20 sn. Total ≤ limit means each gets own value; total > limit means everyone 0. Choices live private until result; own state selected/submitted. Adapter has no duplicate guard, so later valid submissions overwrite the supposed one-shot value; client tiles do not fully lock. Kanıt: `games-stage7.ts`, `AcgozlulukControls`, Stage 7 test.

1. **Game ID:** `acgozluluk-limiti`
2. **Display Name:** Açgözlülük Limiti
3. **Category:** sayı / collective threshold
4. **Min / Max Players:** 3 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Ortak kasayı taşırmadan mümkün olan en yüksek payı kapmak.
7. **Primary Interaction:** Choose and lock one integer within player-count cap.
8. **Information Model:** Public: limit, max choice, deadline. Private: own value/submission. Secret: other choices, total and safe/overflow outcome until result. Opponent status submitted/alive only.
9. **Current UI Problem:** Number tile grid + limit meter + rule copy reads as dashboard; personal meter can imply collective state. Visual one-choice lock conflicts with adapter overwrite behavior.
10. **Fullscreen Stage Concept:** Portrait 2D pressure vault: one shared sealed lid with capacity line; personal number token inserts into the lid while collective total remains hidden.
11. **Main Physical / Visual Object:** Layered 2D pressure vault with sealed capacity line.
12. **HUD Placement:** Limit/player count top; vault center; local number token and lock bottom; no aggregate fill live.
13. **Player Representation:** 8 weight chips around vault showing only generic locked status; result stacks them into safe/overflow resolution.
14. **Input Surface:** Radial number dial or numbered token stack (0…N) into central lock; semantic buttons stay accessible, no generic row-only form.
15. **Tutorial Overlay:** `AMAÇ — ortak limiti aşmadan en çok payı al.` / `HAMLE — 0–N arasında tek sayı seç ve kilitle.` / `RİSK — limit aşılırsa herkes 0 alır.`
16. **Result Feedback:** Tokens drop after deadline; lid seals on success or bursts on overflow; individual values and deltas appear as ledger.
17. **Audio Opportunities:** Token drop, pressure creak, safe seal, overflow rattle, score coin.
18. **Haptic Opportunities:** Choice, lock, collective resolve and overflow/safe pulse; no remote total cue.
19. **Required Assets:** MUST vault/capacity SVG, numbered tokens, lid/lock states. SHOULD crack/safe seal/token stack. OPTIONAL plate skins.
20. **Can Be Procedural?:** Dial/tokens/fill-at-result/lid/particles SVG/CSS.
21. **Asset Priority:** MUST capacity vault/token language; SHOULD safe/overflow result; OPTIONAL variants.
22. **Mobile Risks:** 0–8 targets, large touch, safe-area bottom lock, no scroll, accidental double tap.
23. **Fairness / Hidden-info Risks:** No aggregate total through fill, color, vibration or submitted-player animation. Add server duplicate/atomicity gate; current overwrite cannot be hidden by UI.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `NumberChoiceSurface`, `PrivateLock`, `CollectiveResolve`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Açgözlülük Limiti visualizes individual greed as sealed weight tokens around one capacity lid, not as an ordinary number slider.

### 4.16 `ortalamanin-yarisi` — Ortalamaya En Yakın

**Implementation truth:** Stage 7 20 sn’de 0–100 integer choice alır. Missing values resolve anında random 0–100 olur; all values average’ının yarısı target’tır. En yakın unique +2; second different distance +1; closest tie’da tied leaders +1. Target/average/results result’a kadar null. Client native range slider ve static marker kullanır; adapter duplicate guard içermez, overwrite mümkündür. Kanıt: `games-stage7.ts`, `OrtalamaninYarisiControls`, Stage 7 test.

1. **Game ID:** `ortalamanin-yarisi`
2. **Display Name:** Ortalamaya En Yakın
3. **Category:** sayı / prediction
4. **Min / Max Players:** 3 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Masanın kolektif sezgisini okuyup görünmeyen hedefin merkezine yaklaşmak.
7. **Primary Interaction:** Choose 0–100 value and lock once.
8. **Information Model:** Public: phase/deadline. Private: own value/submitted. Secret: all values, average, half-average target and ranks until result. Opponent status submitted only.
9. **Current UI Problem:** Native range slider + lock button is a generic form; static risk marker looks like a target hint. No collective prediction object; duplicate overwrite breaks one-shot mental model.
10. **Fullscreen Stage Concept:** Portrait 2D balance arc: personal bead glides on a broad arc, center notch stays empty; at result all beads balance and target ray appears.
11. **Main Physical / Visual Object:** 2D balance arc with number bead and sealed center notch.
12. **HUD Placement:** Timer and 0/100 endpoints edge; arc center; local value/lock bottom; no live target marker.
13. **Player Representation:** 8 outer bead capsules show only submitted status; result nests beads around target with names.
14. **Input Surface:** Tactile arc/number bead with hidden semantic range input for keyboard; bead snaps into lock socket, not a generic submit row.
15. **Tutorial Overlay:** `AMAÇ — ortalamanın yarısına yaklaş.` / `HAMLE — 0–100 arasında sayını seç ve kilitle.` / `RİSK — hedefi ve diğer sayıları göremezsin.`
16. **Result Feedback:** Average line, half-target ray, beads settle by distance; closest/second/tie score per server result. Missing random entries labeled only at result.
17. **Audio Opportunities:** Bead slide, balance settle, target ray, rank chimes.
18. **Haptic Opportunities:** Bead ticks, lock socket, result balance/rank; no near/far signal live.
19. **Required Assets:** MUST balance arc/bead, socket, target ray. SHOULD bead trails/result scale. OPTIONAL gauge skin.
20. **Can Be Procedural?:** Arc, bead, glow, ray, rank SVG/CSS.
21. **Asset Priority:** MUST 0–100 arc/bead; SHOULD result motion; OPTIONAL skin.
22. **Mobile Risks:** Precision, keyboard overlap, drag zone, safe-area lock, no scroll, clear value readout.
23. **Fairness / Hidden-info Risks:** Remove static target-looking marker; no target/average/other value/distance through marker, color, `inputCount` or animation. Duplicate/atomicity QA is required.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `NumberChoiceSurface`, `PrivateLock`, `MetricResolve`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Ortalamaya En Yakın alone uses a collective balance and half-target ray reveal, not a danger meter.

### 4.17 `cizgiyi-gecme` — Çizgiyi Geçme

**Implementation truth:** Stage 7 30 sn’de 0–100 value alır; `floor(value/10)` bucket, 100 özel bucket 10’dur. Same bucket players evaluation dışı; unique bucket’lar içinde highest value +2, second +1. Missing null/0; choices result’a kadar hidden; duplicate guard var. Kanıt: `games-stage7.ts`, `CizgiyiGecmeControls`, Stage 7 test.

1. **Game ID:** `cizgiyi-gecme`
2. **Display Name:** Çizgiyi Geçme
3. **Category:** sayı / risk threshold
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Başkalarının gireceği onluk bölgeyi sezerek en yüksek benzersiz riski almak.
7. **Primary Interaction:** Choose 0–100 risk value and lock.
8. **Information Model:** Public: phase/deadline. Private: own value/submitted. Secret: values, buckets and uniqueness until result. Opponent status submitted/alive only.
9. **Current UI Problem:** Range slider, static risk track and lock button are a generic gauge; static marker is ambiguous. Stage 7 result control is not mounted in normal outer results.
10. **Fullscreen Stage Concept:** Portrait 2D neon line with ten locked zones and a personal marker. Zones are silhouettes live; result stacks markers and crosses duplicate buckets.
11. **Main Physical / Visual Object:** Ten-zone 2D risk rail with marker and boundary clamp.
12. **HUD Placement:** Timer top; rail center; personal value/lock bottom; no remote marker/heatmap.
13. **Player Representation:** Small masked marker tabs around rail; result moves tabs into bucket stacks and highlights top unique.
14. **Input Surface:** Large rail scrubber with magnetic marker; hidden HTML range for keyboard; clamp marker to lock, not plain button.
15. **Tutorial Overlay:** `AMAÇ — benzersiz en yüksek riski bul.` / `HAMLE — 0–100 arasında nokta seç ve kilitle.` / `RİSK — aynı onluk bölgeye girerseniz değerlendirme dışı kalırsınız.`
16. **Result Feedback:** Reveal bucket stacks, duplicate collision marks, then unique highest +2/second +1. Missing player remains unmarked.
17. **Audio Opportunities:** Rail scrape, clamp, bucket collision, unique climb, rank chime.
18. **Haptic Opportunities:** Marker tick, clamp, collision and unique result; no live heat feedback.
19. **Required Assets:** MUST ten-zone rail, marker/clamp, duplicate mark. SHOULD stack/collision sprites. OPTIONAL rail skins.
20. **Can Be Procedural?:** Rail, snap, stacks, collision and reveal SVG/CSS.
21. **Asset Priority:** MUST zone/boundary rail; SHOULD duplicate/result motion; OPTIONAL skins.
22. **Mobile Risks:** Precise scrub, large drag zone, keyboard/safe-area, no scroll, clear irreversible lock.
23. **Fairness / Hidden-info Risks:** No live bucket occupancy, heat, remote marker or inferred uniqueness. Server one-shot/value is authoritative; reveal only at result.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `NumberChoiceSurface`, `PrivateLock`, `BucketReveal`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Çizgiyi Geçme alone makes uniqueness-by-ten-zone collision the hero; it is a social minefield, not a percentage meter.

### 4.18 `zaman-bombasi-hafizasi` — Zaman Bombası Hafızası

**Implementation truth:** Stage 6 sequence iki random renk ile başlar. Display süresi `sequence.length × 500 + 500 ms`; input süresi `sequence.length × 3.000 ms` server clock’a göre verilir. Active player sequence’i doğru tekrarlarsa bir random renk eklenir ve next active player’a geçer. Wrong/timeout/late active player’ı eler ve −1 verir; o turdaki diğer active player’lar +1 alır. Elimination threshold `ceil(initialPlayerCount/2)`’dir. Public state sequence’i input sırasında da içerir; client CSS ile saklasa da veri düzeyinde leak vardır. Kanıt: `games.ts`, `Stage6GameControls.tsx`, Stage 6 test.

1. **Game ID:** `zaman-bombasi-hafizasi`
2. **Display Name:** Zaman Bombası Hafızası
3. **Category:** hafıza / sequence recall
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Kısa renk patlamasını zihinde tutup baskı altında geri çalmak.
7. **Primary Interaction:** Observe sequence, then tap four color pads in order.
8. **Information Model:** Public: active player/order, sequence length, timing, eliminated IDs; current code also sends full sequence. Private: active input index/deadline. Intended secret: recall sequence should not be inspectable by other clients; public payload leak is P1 fairness blocker.
9. **Current UI Problem:** Sequence strip + four native color buttons are separate controls below generic stage. Strip animates colors in one visual strip rather than a strict one-by-one reveal; public sequence can be inspected; Stage 6 result detail is missing from outer results.
10. **Fullscreen Stage Concept:** Portrait 2D memory instrument: four large pads and a sequence ribbon that reveals then folds shut. Input phase ribbon masked; only local progress visible.
11. **Main Physical / Visual Object:** Four-pad 2D memory instrument with fold-away sequence ribbon.
12. **HUD Placement:** Sequence length/active player top; pads center; local index/deadline bottom; never show sequence to non-active clients during recall.
13. **Player Representation:** 8 turn tokens perimeter; active pulses, eliminated dim; remote spectators see turn but not answer progress.
14. **Input Surface:** Four large color+shape pads; press/recoil and server confirmation. Semantic accessible buttons, no generic form row.
15. **Tutorial Overlay:** `AMAÇ — renk dizisini hatasız tekrarla.` / `HAMLE — gösterim bitince pedlere sırayla bas.` / `RİSK — hata/süre aşımı aktif oyuncuyu eler.`
16. **Result Feedback:** Correct turn extends sequence and hands off; wrong/late breaks fuse, active −1 and remaining active +1; elimination threshold clearly shown. Correct turns do not score.
17. **Audio Opportunities:** Four pad tones, sequence melody, input confirm, wrong-note break, elimination sting.
18. **Haptic Opportunities:** Pad press, correct step, wrong-note, turn handoff and elimination; never future-sequence cue.
19. **Required Assets:** MUST pad SVG states, sequence ribbon, fuse/turn marker, eliminated mark. SHOULD press/result sprites. OPTIONAL existing transparent 2D prop as background layer.
20. **Can Be Procedural?:** Pads, ribbon fold, glow, fuse, particles and tokens SVG/CSS; Canvas unnecessary.
21. **Asset Priority:** MUST accessible pads + masked ribbon; SHOULD result motion; OPTIONAL backdrop skin.
22. **Mobile Risks:** Thumb-sized shape-distinct pads, timing, cognitive load, no scroll, reduced motion and spectator masking.
23. **Fairness / Hidden-info Risks:** **P1 current leak:** full sequence is public during input. Future API/state contract must scope it to active player or remove it; CSS masking is insufficient. No input/haptic animation may reveal future sequence.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `ColorPadSurface`, `SequenceReveal`, `TurnRail`, `EliminationMark`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Zaman Bombası Hafızası alone owns the reveal-fold-repeat four-pad memory instrument.

### 4.19 `gizli-kareler` — Gizli Kareler

**Implementation truth:** Stage 7 grid is 3×3 for 2–4 players, 4×4 for 5–8. Two 20 sn rounds exist. Each alive player submits one hidden cell; same-cell groups collide/eliminate, singleton gets +1. If round 1 all eligible players select the same cell, adapter sets `earlyFinish` and gives no score. If round 1 leaves one alive, that player gets +1 bonus and game ends; otherwise round 2 runs. Selections are hidden until results. Kanıt: `games-stage7.ts`, `GizliKarelerControls`, Stage 7 test.

1. **Game ID:** `gizli-kareler`
2. **Display Name:** Gizli Kareler
3. **Category:** strateji / hidden spatial choice
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Herkesin gideceği kareyi seçmeden gizli kaçış noktasında tek kalmak.
7. **Primary Interaction:** One irreversible tap on one hidden cell per round.
8. **Information Model:** Public: round, grid size/count, deadline, resolved eliminated IDs, finish/early flag. Private: own selected cell/can-select. Secret: other cell choices and collision groups until resolution.
9. **Current UI Problem:** Raw responsive button grid is correct interaction but lives in control card with generic framing; no spatial reveal. Accidental choice irreversible; no roving tabindex/arrow navigation.
10. **Fullscreen Stage Concept:** Portrait 2D floor plan with large closed-door tile board. Live tiles identical; result closes collision doors and lights singleton doors; round 2 reuses same board.
11. **Main Physical / Visual Object:** Hidden-door 2D tile board.
12. **HUD Placement:** Round/timer top; grid center; own lock/spectator bottom; no hover/remote selection markers.
13. **Player Representation:** Neutral numbered seals outside board; result moves tokens into door groups and collision/singleton marks.
14. **Input Surface:** Large square doors with shape glyph/focus ring and tap lock; add roving tabindex/arrow keys with native buttons.
15. **Tutorial Overlay:** `AMAÇ — tek başına kalacağın kareyi bul.` / `HAMLE — her rauntta bir kapıyı gizlice seç.` / `RİSK — aynı kapıya girenler elenir; herkes aynıysa ilk tur puan yok.`
16. **Result Feedback:** Map reveal: collisions close/eliminate, singleton +1; all-same path explicitly `erken bitiş / puan yok`; sole-survivor bonus shown without fake round.
17. **Audio Opportunities:** Door thunk, board lock, collision slam, singleton light, early-finish neutral chord.
18. **Haptic Opportunities:** Cell lock, round close, collision/singleton; no remote selection cue.
19. **Required Assets:** MUST tile/door SVG states, grid frame, collision/singleton marks. SHOULD close/light sprites. OPTIONAL floor-plan decals.
20. **Can Be Procedural?:** Grid, doors, focus, group lines and reveal SVG/CSS.
21. **Asset Priority:** MUST closed/open/collision states; SHOULD round transition; OPTIONAL floor skins.
22. **Mobile Risks:** 4×4 hit targets, no scroll, bottom status not shrinking grid, accessible keyboard focus.
23. **Fairness / Hidden-info Risks:** No occupancy, heat, cursor or selection count before result. Early all-same must not look like scored collision.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `GridChoiceSurface`, `RoundTimer`, `CollisionReveal`, `EliminationMark`, `ResultReveal`.
26. **Unique Identity Rule:** Gizli Kareler alone turns a closed spatial grid into a two-round collision map of doors and groups.

### 4.20 `karalama-defteri` — Karalama Defteri

**Implementation truth:** Stage 8 random outsider ve fixed word pair ile 75 sn draw, 20 sn vote oynar. Draw save normalized pointer strokes’tur; saves repeatable, empty drawing valid, stroke/byte/submission-rate cap yoktur. Drawings draw sırasında hidden, vote’ta player ID ile public. Unique top vote outsider’a gelirse informed players +1; aksi halde outsider +1. Kanıt: `games-stage8.ts`, `DrawingBoard/KaralamaControls`, Stage 8 test.

1. **Game ID:** `karalama-defteri`
2. **Display Name:** Karalama Defteri
3. **Category:** sosyal / drawing deception
4. **Min / Max Players:** 3 / 8
5. **Orientation:** Portrait metadata (`supportsPortrait: true`), fakat current 720×440 Canvas landscape bias taşır; portrait-first çözüm şart.
6. **Core Player Fantasy:** Kelimeyi söylemeden çizip kendini ele vermemek; yabancı çizimi yakalamak.
7. **Primary Interaction:** Draw/save strokes, then vote for an outsider.
8. **Information Model:** Public: phase/deadline; drawings only vote phase’ta public. Private: own role/word, drawing/vote state. Secret: outsider, word relation and votes until result. Opponent status only phase/alive/submitted.
9. **Current UI Problem:** Pointer canvas, color/eraser/size, save, gallery and player choice grid long tool/form panel oluşturuyor; gameplay scroll’a dönüşüyor. Empty/repeated large snapshots bandwidth riskidir; portrait catalog/current canvas conflict.
10. **Fullscreen Stage Concept:** Portrait full-bleed 2D sketchbook page; draw’ta one paper page, vote’ta anonymous-to-identified gallery wall; page is stage, not lower card.
11. **Main Physical / Visual Object:** Layered 2D sketchbook page/canvas with ink strokes and tabs.
12. **HUD Placement:** Word/draw timer top margin; tools compact bottom pencil rail; vote gallery paged; result stamp over outsider reveal.
13. **Player Representation:** Draw’ta local page identity; vote’ta adapter’ın expose ettiği player tab; eight pages 2×4/paged wall, no tall roster.
14. **Input Surface:** Canvas is primary; pointer/touch + keyboard/accessible mark alternative contract; save binds page, not generic submit row.
15. **Tutorial Overlay:** `AMAÇ — farklı kelimeyi bilen oyuncuyu bul.` / `HAMLE — kelimeni söylemeden çiz, sonra sayfa oyla.` / `RİSK — tek doğru outsider oyu yoksa outsider +1.`
16. **Result Feedback:** Gallery closes; outsider/common-nearby reveal; unique catch or outsider escape; score deltas readable, not buried in thumbnails.
17. **Audio Opportunities:** Pencil scratch, page turn, ink dab, vote pin, caught/escaped reveal.
18. **Haptic Opportunities:** Stroke/save, page pin, vote lock, result stamp; no role/word signal.
19. **Required Assets:** MUST paper/page, pencil/tool icons, gallery tabs, caught/survived stamps. SHOULD grain/ink/page turn. OPTIONAL stationery skins.
20. **Can Be Procedural?:** Canvas for user strokes; page/tools/shadows/ink/gallery SVG/CSS. User drawings are not static asset files.
21. **Asset Priority:** MUST paper/canvas + gallery transition; SHOULD ink/page motion; OPTIONAL skins.
22. **Mobile Risks:** Current landscape Canvas, pointer-only keyboard gap, touch capture, gallery density, keyboard/safe-area, payload size and no gameplay scroll.
23. **Fairness / Hidden-info Risks:** Drawings hidden during draw; outsider/word/votes cannot leak via label, color, stroke count or save timing. Empty drawing is valid; add payload/rate budget in future implementation gate.
24. **Estimated Visual Complexity:** L
25. **Reuse Group:** `DrawingCanvas`, `DrawingToolRail`, `GalleryPage`, `PrivateInfoRibbon`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Karalama Defteri alone makes player-authored strokes the evidence surface and transforms paper into a vote gallery.

### 4.21 `gizli-alisveris` — Gizli Alışveriş

**Implementation truth:** Stage 7 budget 60’dir; source’ta fixed order’da 12 products vardır: 8, 10, 12, 15, 18, 20, 22, 24, 26, 28, 32, 36. 30 sn toggle cart oynanır; empty cart valid. Product contribution `price / buyerCount`; highest basket value tie olan her player +1 alır. Cart/buyer counts result’a kadar secret; documentation shuffle diyorsa da adapter shuffle etmez. Kanıt: `games-stage7.ts`, `GizliAlisverisControls`, Stage 7 test.

1. **Game ID:** `gizli-alisveris`
2. **Display Name:** Gizli Alışveriş
3. **Category:** strateji / hidden market choice
4. **Min / Max Players:** 3 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Herkesin alacağı üründen kaçıp gizli azınlık değerini kapmak.
7. **Primary Interaction:** Repeatable toggle products into/out of private basket.
8. **Information Model:** Public: product names/prices, budget, phase/deadline. Private: own cart/spent/remaining. Secret: other carts, buyer counts and basket values until result. Opponent status only submitted/connected.
9. **Current UI Problem:** Product cards + budget meter + EKLE/SEPETTE + long list create scrollable e-commerce form/SaaS dashboard. Actual gameplay competes with product list and separate player UI.
10. **Fullscreen Stage Concept:** Portrait 2D arcade market counter: compact shelf bands feed one bottom tray; product tag flips into tray; demand curtain stays closed until result.
11. **Main Physical / Visual Object:** Layered 2D market shelf + sealed shopping tray/product tags.
12. **HUD Placement:** Timer/60 credit top; shelf center two bands/paged; tray bottom; no demand heat/buyer count live.
13. **Player Representation:** Closed receipt stubs along shelf; own receipt shows only own cart; result unfolds buyer counts and ledger.
14. **Input Surface:** Large tap-to-flip product tags with selected state; auto-resolve at deadline means no checkout button; semantic toggle buttons remain accessible.
15. **Tutorial Overlay:** `AMAÇ — en değerli gizli sepeti kur.` / `HAMLE — 60 krediyle etiketleri sepete al/çıkar.` / `RİSK — çok kişi alırsa ürün payı düşer.`
16. **Result Feedback:** Demand curtain opens, per-product split calculation, basket ledgers compare; tied leaders matching +1 receipt stamps; no invented rounding.
17. **Audio Opportunities:** Tag flip, coin subtraction, tray slide, demand lift, receipt stamp.
18. **Haptic Opportunities:** Add/remove, budget boundary, deadline lock, result receipt; no popularity cue before result.
19. **Required Assets:** MUST text-free shelf/tag/tray, budget coin/receipt. SHOULD 12 small product glyphs, demand curtain, ledger stamp. OPTIONAL category skins.
20. **Can Be Procedural?:** Shelf/tile/tray/meter/receipt/reveal SVG/CSS; small reusable glyph sprites, not 12 large illustrations.
21. **Asset Priority:** MUST shelf/tray/budget; SHOULD glyph family/ledger; OPTIONAL product skins.
22. **Mobile Risks:** 12 items, keyboard/safe-area, no scroll, large tiles, selected/removable state, fixed tray.
23. **Fairness / Hidden-info Risks:** No buyer counts, cart-size demand, tile heat or result-like popularity live. Current fixed source order vs documented shuffle must be resolved explicitly; empty cart remains valid.
24. **Estimated Visual Complexity:** L
25. **Reuse Group:** `ToggleCardSurface`, `BudgetTray`, `AnonymousReceipt`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Gizli Alışveriş alone owns sealed market demand and per-product value splitting; it is an arcade bazaar, not an e-commerce grid.

### 4.22 `ittifak` — İttifak

**Implementation truth:** Stage 8 `IttifakAdapter` 60 sn bargain phase’inde konuşmayı, promise veya agreement’ı state’e kaydetmez. Sonra 15 sn vote fazında each player self dışında bir target’a once vote verir; missing votes random other player’a tamamlanır. Target’ın aldığı her vote +1 point’tir; voter provenance result’tan sonra da public olmaz, yalnız aggregate vote counts görünür. Kanıt: `games-stage8.ts`, `IttifakControls`, Stage 8 test.

1. **Game ID:** `ittifak`
2. **Display Name:** İttifak
3. **Category:** sosyal / negotiation and vote
4. **Min / Max Players:** 3 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Masada vaat verip güven kazanmak, sonra sözü sessiz oyla puana çevirmek.
7. **Primary Interaction:** Social bargain followed by one secret target vote.
8. **Information Model:** Public: bargain/vote phase, timer, generic ready status. Private: own vote/submission. Secret: voter→target edge and live totals; provenance stays secret after result too. Opponent status only submitted/alive.
9. **Current UI Problem:** Bargain generic discussion card, vote `PlayerChoiceGrid` + action button; separate live roster social ritual’i form flow’a çeviriyor. No 2D object bridges public talk and sealed vote.
10. **Fullscreen Stage Concept:** Portrait 2D round table: speech ribbons orbit pact seal; vote phase folds them shut into sealed ballots; result opens aggregate spokes without voter edges.
11. **Main Physical / Visual Object:** 2D pact seal / folded ballot table.
12. **HUD Placement:** Phase/timer table rim; pact seal center; target ballot arc bottom; result aggregate vote spokes.
13. **Player Representation:** 8 portrait tokens around table; neutral speech marks then closed ballot marks. No live target line/count.
14. **Input Surface:** Tap token to place sealed ballot stamp; real player buttons remain semantic, visual is ballot ritual.
15. **Tutorial Overlay:** `AMAÇ — güven kazan, en çok oyu topla.` / `HAMLE — 60 saniye konuş, 15 saniyede gizli oy ver.` / `RİSK — eksik oyun rastgele hedefe gider.`
16. **Result Feedback:** Folded ballots become aggregate spokes; each target’s received votes become score stamps. Never animate individual voter lines.
17. **Audio Opportunities:** Table hum, paper fold, ballot seal, aggregate spoke, alliance chord.
18. **Haptic Opportunities:** Ballot lock, phase fold, aggregate pulse; no target-specific live feedback.
19. **Required Assets:** MUST pact seal, ballot/token SVG, speech ribbon, aggregate spoke. SHOULD fold/seal/result beam. OPTIONAL table/skin variants.
20. **Can Be Procedural?:** Table rings, ribbons, ballots, spokes, glow SVG/CSS; small transparent seal sprite.
21. **Asset Priority:** MUST pact/ballot transformation; SHOULD result spokes; OPTIONAL skins.
22. **Mobile Risks:** 8 targets, portrait bottom, keyboard/safe-area; compact arc/paged tokens and no scroll-dependent vote.
23. **Fairness / Hidden-info Risks:** Never show vote count, voter edges, selected target through tint/timing, or promises as stored facts. Missing-vote randomization must not be guessed live.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `TargetTokenSurface`, `SecretBallot`, `PlayerStatusPips`, `AggregateReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** İttifak alone turns social negotiation into sealed table ballots and aggregate alliance spokes.

### 4.23 `asiri-yukleme` — Aşırı Yükleme

**Implementation truth:** Stage 7 each `overload-click` global energy’yi +1 artırır. Energy 100 olunca hidden 3 sn armed window başlar; bu sırada next click gönderen player explode olur ve −1 ile game biter. Armed deadline click’siz geçerse explosion olmaz; eligible players click count rank’ına göre unique leader +2, next +1, tied leaders +1 alır. Public live state energy/armed; clickCounts result’a kadar hidden; own state own click count/exploded verir. `MatchState.inputCount` aggregate activity leak eder. Kanıt: `games-stage7.ts`, `AsiriYuklemeControls`, Stage 7 test.

1. **Game ID:** `asiri-yukleme`
2. **Display Name:** Aşırı Yükleme
3. **Category:** zaman / collective push-your-luck
4. **Min / Max Players:** 2 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Ortak energy core’u sınıra itip başkasının fazla tıklamasını ummak.
7. **Primary Interaction:** Repeated click on shared energy core; hidden 3-second armed danger window.
8. **Information Model:** Public: energy and armed flag. Private: own click count/exploded. Secret: opponent click totals/rank and exact armed deadline. Opponent status after resolve only.
9. **Current UI Problem:** Reactor orb, public meter, own count and TIKLA button dashboard card oluşturuyor; `inputCount` aggregate clue, armed state için distinct 2D danger composition yok; Stage 7 result normal outer results’ta mount edilmez.
10. **Fullscreen Stage Concept:** Portrait 2D reactor pressure plate: shared ring fills; at 100 plate flips to armed warning without precise countdown; click resolves local impact only after server.
11. **Main Physical / Visual Object:** Layered 2D reactor core with overload ring and flip-up danger plate.
12. **HUD Placement:** Energy ring top/center; reactor center; own count discreet lower chip; armed timerless warning band; no remote clicks.
13. **Player Representation:** 8 charge tabs around reactor; local tab may show own count; result stacks tabs by rank and marks explosion.
14. **Input Surface:** Reactor plate is large pointer-down arcade pad with recoil; accessible keyboard button under illustration; no plus/form control.
15. **Tutorial Overlay:** `AMAÇ — enerjiyi 100’e getirip en çok tıklayanlardan ol.` / `HAMLE — çekirdeğe tekrar tekrar dokun.` / `RİSK — 100’den sonra ilk fazla tıklayan patlar.`
16. **Result Feedback:** At 100 ring locks; overflow cracks plate over exploded tab −1; deadline vent produces click rank +2/+1/tie +1. Do not invent explosion on normal resolve.
17. **Audio Opportunities:** Charge tick, shared hum, armed flip, crack/vent, rank beats.
18. **Haptic Opportunities:** Local click, 100 milestone, armed state, server explosion/vent, rank; never relay remote clicks.
19. **Required Assets:** MUST reactor/ring SVG, danger plate, charge tab, crack/vent. SHOULD recoil/particles. OPTIONAL skins.
20. **Can Be Procedural?:** Ring/fill/plate/recoil/particles/rank/tabs SVG/CSS; transparent core sprite optional.
21. **Asset Priority:** MUST reactor normal/armed; SHOULD explosion/vent result; OPTIONAL skins.
22. **Mobile Risks:** Rapid tap gesture conflict, stable large hit area, safe-area HUD, throttled effects, reduced motion.
23. **Fairness / Hidden-info Risks:** Energy/armed are public by implementation, but `inputCount`, click timing, click totals/rank and exact armed deadline cannot become visual/haptic cues.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `SecretActionSurface`, `SharedMeter`, `SecretActivity`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Aşırı Yükleme alone owns the shared energy ring reaching 100 and the silent armed flip; it is not a one-button reflex clone.

### 4.24 `capraz-ates` — Çapraz Ateş

**Implementation truth:** Stage 7 25 sn’de each player another player target veya `crossfire-miss` gönderir; self target invalid, duplicate guarded, missing null kalır. Target map result’a kadar hidden. Resolve: mutual targets 0; incoming alan non-mutual shooter −1; incoming almayan ve target seçmiş shooter +1; miss/null 0. Kanıt: `games-stage7.ts`, `CaprazAtesControls`, Stage 7 test.

1. **Game ID:** `capraz-ates`
2. **Display Name:** Çapraz Ateş
3. **Category:** strateji / hidden targeting
4. **Min / Max Players:** 3 / 8
5. **Orientation:** Portrait (`supportsPortrait: true`)
6. **Core Player Fantasy:** Kalabalıkta hedef seçip ateş hattını başkasına yöneltmek; mutual nişanları boşa çıkarmak.
7. **Primary Interaction:** Choose one opponent or explicitly miss, once.
8. **Information Model:** Public: phase/deadline only. Private: own target/miss/submission. Secret: all edges, incoming counts and mutual pairs until result. Opponent status submitted/alive only.
9. **Current UI Problem:** Crosshair + target button grid + separate BOŞA SIK is generic target form; no graph/impact lane; 8 target buttons overload portrait.
10. **Fullscreen Stage Concept:** Portrait 2D crossfire graph: neutral player tokens on ring, sealed threads live; result draws mutual beams that collide, incoming strikes and safe outgoing paths.
11. **Main Physical / Visual Object:** 2D crosshair/chamber with sealed target threads.
12. **HUD Placement:** Timer top; chamber center; target ring around/below; miss and lock bottom; no live target lines/heat.
13. **Player Representation:** 8 portrait tokens with neutral sockets; own selected token local lock; remote tokens identical until result.
14. **Input Surface:** Tap token loads crosshair; empty chamber plate is explicit miss. Both real accessible buttons integrated into chamber.
15. **Tutorial Overlay:** `AMAÇ — seni hedeflemeyeni hedefle.` / `HAMLE — rakibe nişan al veya BOŞA SIK.` / `RİSK — karşılıklı hedefler çarpışır; vurulan −1 alır.`
16. **Result Feedback:** Seal sockets, draw edges; mutual sparks/cancel, incoming non-mutual −1, safe outgoing +1, miss/missing 0. Show every player’s result.
17. **Audio Opportunities:** Crosshair lock, chamber click, edge draw, beam collision, hit/score pulse.
18. **Haptic Opportunities:** Target/miss lock, server reveal, collision/hit/score; no pre-result target cue.
19. **Required Assets:** MUST crosshair/chamber SVG, token/socket, sealed thread, collision/hit marks. SHOULD beam/result graph. OPTIONAL sight skins.
20. **Can Be Procedural?:** Ring layout, threads, crosshair, beams and marks SVG/CSS.
21. **Asset Priority:** MUST sealed-edge graph/chamber; SHOULD reveal beams; OPTIONAL skins.
22. **Mobile Risks:** 8 target ring, keyboard/safe-area, large tokens, no scroll, clear irreversible lock.
23. **Fairness / Hidden-info Risks:** Never show target edges, incoming count, selection heat or mutuality via glow/color/animation. Missing input is null/0, not random target; no fallback shot.
24. **Estimated Visual Complexity:** M
25. **Reuse Group:** `TargetTokenSurface`, `SecretGraph`, `SealedEdgeReveal`, `ResultReveal`, `ScoreDelta`.
26. **Unique Identity Rule:** Çapraz Ateş alone turns hidden targets into sealed edge graphs whose mutual beams collide at reveal.

## 5. Shared Runtime Primitives

Bu liste gelecekteki implementation için öneridir; bu auditte production runtime’a eklenmemiştir. Her primitive 2D visual shell, semantic accessibility ve common motion contract sağlar. Hiçbir primitive bütün oyunları aynı rounded card, neon orb, roster veya form layout’una zorlamamalıdır.

| Primitive | Kullanan oyunlar | Ortaklaştıracağı şey | Ortaklaştırmaması gereken şey |
|---|---|---|---|
| `GameViewport` | 24/24 | `100dvh`, safe-area, overflow guard, focus layer, reduced-motion, stage lifecycle | Hero art, camera framing, background crop, parallax rhythm |
| `GameHUD` | 24/24 | Live HTML/SVG text, phase label, connection state, edge spacing, aria-live | Timer location, game-specific stats, secret values, same top bar layout |
| `PlayerAvatarStrip` | 24/24 | Stable 2–8 player identity tokens, alive/eliminated/ready/submitted semantics | Large sidebar roster, target meaning, role/poison/risk encoding, token silhouette |
| `GameTimer` | Deadline kullanan 23 oyun | Server-time interpolation, expiry, late state, accessible remaining text | Hidden deadline visibility, timer shape/tempo, Son Kişi countdown |
| `TutorialOverlay` | 24/24 | Max 3 short messages, focus trap/dismiss, phase-safe announce | Rules, copy tone and game-specific risk language |
| `ResultOverlay` | 24/24 | Server result staging, accessible summary, reduced-motion result mode | Same score-card template, reveal metaphor, timing order |
| `RotateDeviceOverlay` | Rus Ruleti, Kör Bomba, Kontrol Paneli Kaosu | Orientation gate, rotate prompt, safe-area fallback | Adaptive orientation; catalog’da Adaptive yok |
| `ConnectionBadge` | 24/24 | Connected/disconnected/spectator semantics | Disconnection as secret gameplay signal or target availability assumption |
| `ScoreDelta` | 24/24 | `+1`, `+2`, `−1`, tie and reason-safe text/animation | Payout story, score timing and audio/haptic signature |
| `PhysicalButton` | Butona Bas, Gizli Hırsız, Kör Kronometre, Son Kişi, Aşırı Yükleme | Large semantic press, pointer/keyboard, local press/recoil, one-shot lock | Red button/latch/dial/reactor/escape visual identity |
| `HologramPanel2D` | Çağrışım Ağı, Sızma, Yazı Yaz | Flat illuminated panel, masked content slot, live text placement | Volumetric/floating 3D object, word/role styling, core silhouette |
| `ChoiceSurface` | Rus Ruleti, Kör Bomba, İttifak, Zehirli Kadeh, Çapraz Ateş | Focus, selected state, target validation and compact 8-player navigation | Target semantics, live edge visibility, radial vs arc composition |
| `WordInputSurface` | Yazı Yaz, Kendim, Sözlük Blöfü, Çağrışım Ağı, Sızma | Keyboard-safe text entry, length/normalization display, submit lock | Typewriter, folio, card, prism and nexus art |
| `NumberChoiceSurface` | Açgözlülük Limiti, Ortalamaya En Yakın, Çizgiyi Geçme | Integer validation, value readout, large touch/keyboard control | Vault, balance and line metaphors, hidden collective information |
| `RiskMeter` | Rus Ruleti, Kör Bomba, Kör Kronometre, Çizgiyi Geçme | Redacted/owner-only value treatment, no color-only state | Risk curve, fuse, blind target, ten-zone rail |
| `GridSurface` | Gizli Kareler | Responsive 3×3/4×4 sizing, roving tabindex, cell lock | Floor-plan/door art, collision reveal, early-finish scoring |
| `ColorPadSurface` | Zaman Bombası Hafızası | Four color+shape pads, press state, semantic labels | Sequence reveal, turn order and elimination story |
| `CardMappingSurface` | Kendim, Sözlük Blöfü, Gizli Alışveriş | Anonymous card focus, tap-to-pair/toggle, flip states | Identity card vs dictionary page vs product tag |
| `PrivateInfoRibbon` | Yazı Yaz, Sızma, Sözlük Blöfü, KPK, Zehirli Kadeh, Memory | Local-only masked region, privacy-safe placeholder and aria boundary | Role, clue, poison, writer, word and sequence content |
| `SecretGraph` | Çağrışım Ağı, Çapraz Ateş, İttifak, KPK | Hidden edge lifecycle, reveal order, no live edge | Word grouping, target shot, vote aggregate, clue map |
| `PassTradeTransfer` | Kör Bomba, Zehirli Kadeh, İttifak | Accepted target transfer motion, late/disabled treatment | Bomb fuse, poison liquid and ballot identity |
| `DrawingCanvas` | Karalama Defteri | Normalized strokes, pointer capture, byte/rate budget, keyboard alternative | Word/outsider privacy, paper/gallery art, vote logic |
| `TokenLedger` | Rüşvet ve Darbe, Gizli Alışveriş | Token placement, count formatting, result ledger accessibility | Political bribe meaning vs product value split |
| `AudioHapticBus` | Opportunity in 24/24; currently not implemented | Event names, local/server-confirmed channel, preferences | Timbral identity or hidden-state signal |

Spec’lerin 25. alanındaki `Reuse Group` adları composition-level önerilerdir. Bu
tabloda listelenmeyen adlar (ör. `RpsWheel`, `GalleryPage`, `SequenceReveal`)
oyuna özel bileşen olarak kalır; shared runtime primitive’e ancak aynı
erişilebilirlik, lifecycle ve bilgi-güvenliği contract’ını gerçekten paylaşırsa
terfi eder. Böylece reuse, oyunların hero metaforunu ve identity rule’unu
genericleştirmez.

### Primitive boundary rules

- `GameViewport` stage shell’dir; decorative layer gameplay’in üstüne çıkmaz ve generic Neon Toybox fallback’i hero object olamaz.
- `PlayerAvatarStrip` büyük live player listesi yerine compact identity sağlar. Target list, secret role, vote count veya clue owner için universal roster yapılmaz.
- Native `<input>`, `<textarea>`, `<select>` gerektiğinde erişilebilir semantic layer olarak kalır; görünen interaction surface fiziksel/metaforik 2D object’tir.
- `ResultOverlay` ortak server-result/accessibility contract’ıdır; her oyun aynı leaderboard/SaaS card stack’i kullanmaz.
- Secret state hiçbir shared animation, aria-label, placeholder width, avatar tint, particle count, sound/haptic cadence veya prefetch ile kodlanmaz.

## 6. Asset Inventory Summary

### 6.1 Shared 2D asset families

| Family | Format | Reuse | Contract |
|---|---|---:|---|
| Dark arcade backplate | SVG/transparent PNG/WebP layered background | 24 | Koyu indigo/grafit; low-contrast; her oyunda crop/pattern farklı; gameplay objesinin yerine geçmez |
| HUD frame/icon kit | SVG + live HTML/SVG text | 24 | phase, timer, connection, lock, spectator, focus; label text asset’e gömülmez |
| Avatar/token kit | Transparent SVG/PNG sprite sheet | 24 | 8 stable identity states + neutral/active/eliminated; role/poison/risk rengi yok |
| Motion/effect kit | CSS/SVG + small transparent particles | 24 | shadow, inner shadow, bevel, rim, glow, snap, burst; effect meaning game-specific kalır |
| Tutorial/result frames | SVG | 24 | max-3 tutorial, result slot, rotate gate; hero object içermez |
| Typography/numbers | HTML/SVG text | 24 | localizable, high contrast, live; baked-in text yok |

### 6.2 Game-specific inventory

`Cost` yalnız 2D art/animation maliyetidir: `H` yüksek, `M` orta, `L` düşük. 3D model, WebGL renderer veya photorealistic asset hiçbir satırda önerilmez.

| Game | MUST | SHOULD | Procedural / Canvas | Cost |
|---|---|---|---|:---:|
| Yazı Yaz | ink/typewriter capsules, seal, mask, word strip | ink/paper/reveal FX | capsule/key grid SVG/CSS | M |
| Kendim | word card front/back, portrait token, pin | carousel/foil | flip/tether/frame SVG/CSS | M |
| Sızma | opaque prism, mask, clue lever, shutter | orbit/whisper particles | prism/orbit/pips | M |
| Sözlük Blöfü | folio/page, seal, bookmark, anonymous page | quill/paper grain | page/flip/thread | M |
| Çağrışım Ağı | 2D word core, tile/back, node/link | group markers/particles | graph/glow/reveal | M |
| Butona Bas | red button/pedestal, recoil, window ring | paired/solo burst, ticket | rings/recoil/sparks | M |
| Rus Ruleti | cylinder/chamber, trigger, risk ring, token states | safe/explosion frames | rotation/target rail/ring | H |
| Gizli Hırsız | vault latch, iris, alarm filament, thief badge | scan/alarm sprites | iris/shake/scan | M |
| Kör Kronometre | blind dial, shutter, stop plate | bullseye/rank | dial/ticks/reveal | M |
| Kör Bomba | bomb sprite, split fuse, cable | pass trail/explosion | timer/cable/transfer | M |
| Rüşvet ve Darbe | crown/ballot, candidate token, RPS, ledger tokens | coup stamp/token travel | ballot/arc/ledger | H |
| Açgözlülük Limiti | pressure vault, capacity line, numbered tokens | safe/overflow lid | dial/token stack | M |
| Ortalamaya En Yakın | balance arc, bead, lock socket | target ray/trails | arc/bead/settle | M |
| Gizli Kareler | door/tile states, grid frame, collision marks | close/light sprites | grid/reveal/focus | M |
| Karalama Defteri | page/canvas frame, tool icons, gallery tabs | grain/ink/page turn | Canvas strokes, page layout | H |
| İttifak | pact seal, ballot, speech ribbon, aggregate spokes | fold/seal beams | rings/ribbons/spokes | M |
| Son Kişi | exit gate/latch, light bands, alarm strip | door badges/stamp | corridor/gate/alarm | M |
| Çizgiyi Geçme | ten-zone rail, marker/clamp, duplicate mark | bucket stack | rail/snap/reveal | L |
| Gizli Alışveriş | shelf/tray, reusable 12 glyphs, coin/receipt, curtain | ledger/demand FX | tile/tray/reveal | H |
| Aşırı Yükleme | reactor/ring, danger plate, charge tab | crack/vent/recoil | meter/plate/particles | M |
| Kontrol Paneli Kaosu | illustrated 2D console, 4 cable lanes, cutter, clue ribbon | break/continuity | cable/shadow/result lines | H |
| Zehirli Kadeh | glass/goblet, masked liquid, coaster, trade ribbon | rim/trail/reveal | liquid mask/ribbon | M |
| Çapraz Ateş | crosshair/chamber, sockets, sealed threads, collision mark | beam/result graph | ring/thread/beam | M |
| Zaman Bombası Hafızası | 4 pad states, sequence ribbon, fuse marker | press/result sprites | pads/fold/particles | M |

### 6.3 Asset controls

- 24 ayrı büyük illustration yerine shared sprite families, text-free transparent layers ve procedural SVG/CSS tercih edilir.
- Product, avatar, token ve cable gibi tekrar eden öğeler symbol/sprite library olur; global collision yaratmayacak game-ID prefix’li adlandırma kullanılır.
- `Karalama Defteri` Canvas user-authored strokes içindir; static asset pipeline’a sokulmaz. `Gizli Alışveriş` 12 glyph’i küçük, flat, reusable olur.
- MUST asset’ler önce; SHOULD/OPTIONAL skin’ler batch sonrasına. 3D model/renderer dependency yok.

## 7. Complexity Matrix

`Visual` 2D composition/motion/interaction density; `Info` hidden-state leakage sensitivity; `Asset` 2D asset cost. Orientation `P=Portrait`, `L=Landscape`.

| # | Game | Ori. | Core interaction | Visual | Info | Asset | Main QA flag |
|---:|---|:---:|---|:---:|:---:|:---:|---|
| 1 | Yazı Yaz | P | text + social + guess | L | H | M | writer ID leak, keyboard, 8 masks |
| 2 | Kendim | P | card mapping | L | M | M | owner privacy, 8 targets |
| 3 | Sızma | P | clue + hidden vote | M | H | M | result mount gap, role masking |
| 4 | Sözlük Blöfü | P | text + definition | M | H | M | bluff ID leak, text wrap |
| 5 | Çağrışım Ağı | P | one-shot association | M | H | M | hidden answers, 8 nodes |
| 6 | Butona Bas | P | 300ms repeated tap | M | M | M | latency, inputCount |
| 7 | Rus Ruleti | L | target + fire | L | H | H | public risk leak, rotate, 8 targets |
| 8 | Gizli Hırsız | P | one secret tap | M | M | M | one-shot, inputCount |
| 9 | Kör Kronometre | P | blind stop | M | H | M | latency, no target hint |
| 10 | Kör Bomba | L | hidden pass | L | H | M | asymmetric timer, unlimited pass |
| 11 | Rüşvet ve Darbe | P | vote + RPS + ledger | L | H | H | multi-phase, allocation accounting |
| 12 | Açgözlülük Limiti | P | integer choice | M | H | M | duplicate overwrite, total privacy |
| 13 | Ortalamaya En Yakın | P | range choice | M | H | M | duplicate overwrite, false marker |
| 14 | Gizli Kareler | P | hidden grid cell | M | H | M | 4×4 focus, early finish |
| 15 | Karalama Defteri | P* | Canvas + vote | L | H | H | landscape Canvas, payload budget |
| 16 | İttifak | P | bargain + vote | M | H | M | no promise persistence, 8 targets |
| 17 | Son Kişi | P | hidden-deadline escape | M | H | M | never add countdown |
| 18 | Çizgiyi Geçme | P | risk rail | M | H | L | precise scrub, no live buckets |
| 19 | Gizli Alışveriş | P | private cart toggle | L | H | H | 12 items/no scroll, order drift |
| 20 | Aşırı Yükleme | P | shared repeated click | M | M | M | armed window, inputCount |
| 21 | Kontrol Paneli Kaosu | L | private panel cut | L | H | H | rotate, clue departure mapping |
| 22 | Zehirli Kadeh | P | one social trade | M | H | M | poison mask, 7 targets |
| 23 | Çapraz Ateş | P | hidden target/miss | M | H | M | 8 target ring, sealed edges |
| 24 | Zaman Bombası Hafızası | P | sequence pads | M | H | M | public sequence leak, cognitive load |

`P*`: Catalog Portrait olsa da current drawing Canvas `720×440` olduğundan portrait-first rebuild çözülmeden acceptance kapanmaz.

## 8. Rebuild Batches

Bu batch’ler gelecekteki visual implementation sırasıdır; bu auditte hiçbir batch uygulanmamıştır. Shared primitive contract’ı ve adapter/test kuralları korunur.

| Batch | Oyunlar | Interaction/orientation | Shared prerequisites | Asset prerequisites | Risk / merge order |
|---:|---|---|---|---|---|
| B1 — physical calibration | `kontrol-paneli-kaosu`, `butona-bas`, `gizli-hirsiz`, `kor-kronometre` | 2D physical action; KPK L, diğerleri P | `GameViewport`, `GameHUD`, `OrientationGate`, `ResultOverlay`, `PhysicalButton`, `PrivateInfoRibbon` | console/cable, red button, latch, blind dial | H; first lock stage/HUD/press semantics, KPK privacy gate first |
| B2 — timing/number | `son-kisi`, `asiri-yukleme`, `acgozluluk-limiti`, `ortalamanin-yarisi`, `cizgiyi-gecme` | hidden deadline/number; P | `GameTimer`, `NumberChoiceSurface`, `RiskMeter`, `PrivateLock`, `SharedMeter` | gate, reactor, vault, balance, rail | M; Son Kişi no-countdown test, number duplicate gate |
| B3 — hidden risk/target | `rus-ruleti`, `kor-bomba`, `zehirli-kadeh`, `capraz-ates` | target/pass/trade; L+P | `ChoiceSurface`, `SecretGraph`, `RiskMeter`, `PassTradeTransfer`, `PlayerAvatarStrip` | cylinder, bomb, glass, crosshair | H; risk redaction, disconnect targets, 8-player rail |
| B4 — portrait social | `kendim`, `yazi-yaz`, `sizma`, `sozluk-blofu`, `cagrisim-agi`, `ittifak` | text/verbal/card/ballot; P | `WordInputSurface`, `CardMappingSurface`, `PrivateInfoRibbon`, `SecretBallot`, `AggregateReveal` | card, folio, prism, word core, pact | M; text semantics shared but hero art disjoint; ID leaks block |
| B5 — dense authored/board | `zaman-bombasi-hafizasi`, `gizli-kareler`, `karalama-defteri`, `gizli-alisveris`, `rusvet-darbe` | sequence/grid/Canvas/market/ledger; mostly P | `ColorPadSurface`, `GridSurface`, `DrawingCanvas`, `BudgetTray`, `TokenLedger` | pads, doors, paper, 12 glyphs, crown | H; Canvas/payload, fixed product order, memory privacy, allocation QA |

### Batch sequencing and conflict controls

1. B1 shared 2D stage/HUD semantic contract’ını kilitlemeden B2–B5 game-specific stages merge edilmez.
2. Her batch game-specific SVG/PNG/WebP layers, copy mapping ve interaction composition’ında disjoint ownership kullanır; shared primitive API’si ayrı review’dan geçer.
3. Asset adları `game-id/family/state` prefix’iyle; text-free, transparent/background-separated ve mobile-optimized tutulur. Global `button.svg`, `panel.svg` gibi collision-prone adlar yoktur.
4. P1 privacy, Stage 6/7 result gap, orientation ve server-rule testleri geçmeden asset polish done sayılmaz.
5. Paralel yapılabilecek işler yalnız disjoint asset family/read-only QA’dır. Shared `GameHUD`, `ResultOverlay`, target rail veya input primitive’lerine farklı batch’ler aynı anda yeni API eklemez.

## 9. Calibration Games

### 9.1 First calibration — `Kontrol Paneli Kaosu`

İlk calibration için uygundur. Landscape orientation, private panel/clue boundary, tek geri döndürülemez cut, dört renkli hero object, 8-player HUD density ve paired bonus reveal’i aynı anda zorlar. Bu yüzden ortak 2D stage kalitesini en görünür biçimde test eder.

- Gerçek 3D console değil, high-quality layered 2D illustrated console chassis kullanılmalı.
- Four cable lanes, cable shadows/inner-shadows, bevel/rim light, lit terminal states, animated glow ve press/cut feedback aynı board’da yaşamalı.
- Clue ribbon ve panel permutation yalnız ilgili client’ta private olmalı; clue holder/correct color result’a kadar çıkmamalı.
- Cable cut panel üzerinde gerçekleşmeli; generic `form-panel + button grid`, separate roster veya dekoratif scene-above-controls olmamalı.
- Landscape rotate overlay, 8 compact tokens ve result relationship reveal tek viewport’ta okunmalı.
- Departure mapping, disconnected target ve paired bonus rendering G7 sign-off gate’leridir.

Bu bölüm implementasyon talimatı değil, gelecekteki rebuild acceptance fixture’ıdır. Adapter kuralı değişmez.

### 9.2 Second calibration — `Kendim`

İkinci calibration olarak `Kendim` seçildi. Landscape physical-panel dilini kopyalamadan Portrait + social/text + card mapping eksenini test eder: private single-word entry, public shuffled cards, multi-card mapping, wrong/correct feedback, owner bonus ve leader delta aynı stage’te okunur.

- Ana surface portrait scanner/card carousel’dır; console/cable metaphor kullanılmaz.
- Text HTML/SVG olarak canlı kalır; owner ID ve mapping result’a kadar maskelidir.
- 8 portrait token compact kalır; player sidebar veya tall form listesi geri gelmez.
- Card flip, pin/tether, wrong crack ve owner-bonus reveal ikinci motion grammar’dır.
- Keyboard/screen-reader mapping, accidental self-card reveal ve adapter word-overwrite gate’i test edilir.

İki calibration’ın ortak ölçtüğü şey palette değil: stage-first hierarchy, 2D depth treatment, private-info discipline, orientation, text readability, compact player representation ve non-generic primary interaction.

## 10. G7 Cross-Game Consistency Review

G7 reviewer contract’ı G0’dan bağımsız adversarial checklist olarak uygulandı. G7 alt-agent çağrısı platform usage-limit nedeniyle sonuç vermedi; aşağıdaki pass, G0’ın mevcut 24 spec’i source’a yeniden bakmadan yalnız consistency lensleriyle ayrı bir inceleme turunda denetlemesini ve disposition’ları Risks bölümüne yazmasını kaydeder. Bu nedenle “G7 agent completed” iddiası yapılmaz; review sonucu ve açık gates şeffaftır.

| G7 lens | Bağımsız kontrol | Disposition |
|---|---|---|
| Private information leak | `publicState`, `ownGameState`, `inputCount`, client labels, ARIA, color/animation, result prefetch | P1 leaks explicitly recorded for Yazı Yaz, Sözlük Blöfü, Memory, Rus Ruleti; masked visual cannot repair API leak |
| Genericization | Same generic scene/form/sidebar/scroll/dashboard repeating across games | Every spec has distinct 2D hero, on-object input and unique identity; shared primitives are shell-only |
| 8-player overload | Target grids, card mapping, market list, result density, name truncation | Compact arcs/rings/pips/paged reveal mandated; no gameplay scroll; 8-player fixtures required |
| Asset explosion | 24 custom hero illustrations, variants, sprites, audio/haptic cost | Shared 2D families, procedural SVG/CSS and MUST/SHOULD/OPTIONAL inventory; five high-cost games gated |
| Orientation conflict | Catalog boolean, manifest advisory `any`, current Canvas dimensions | No Adaptive invented; three Landscape rotate gates; Karalama portrait blocker recorded |
| Rule fidelity | Durations, missing/duplicate/late behavior, score, secret boundary, early finish | Each spec has implementation truth; visual layer may not infer or change rule |
| Runtime result gaps | Stage 6/7 controls vs outer App results branch | P2 gate recorded; future runtime task, not silently implemented here |
| Disconnect/duplicate/stall defects | current main participant gates, target filters, duplicate choices, KPK map, Bomb passes | P2/P3 gates recorded; this document does not patch runtime |

### G7 identity verdict

GLIX can share a Premium 2D language without making 24 generic scenes, provided the five gates are enforced: (1) hero object owns the interaction, (2) hidden state is absent from public render paths, (3) 8-player information is compact, (4) asset families are layered/reusable, (5) orientation is a real stage constraint. Current repository passes catalog completeness, but does not yet pass all privacy/result/orientation gates.

## 11. Risks and QA Findings

| Severity | Finding / evidence | Affected games | Consequence | Required disposition |
|---|---|---|---|---|
| P1 | `YaziYazOwnState.guessTargetPlayerIds` writer candidate IDs verir; `YaziYazControls` select’inde gösterir | Yazı Yaz | Writer identity result’tan önce çıkar | Anonymous candidates veya API privacy fix; visual masking tek başına yetmez |
| P1 | `SozlukBlofu` public definition IDs `bluff-${playerId}` formatındadır | Sözlük Blöfü | Bluff owner ID inspection ile bulunur | Opaque definition IDs; UI substring/label kullanmaz |
| P1 | `MemoryPublicState.sequence` input sırasında full sequence’i taşır; client yalnız maskeler | Zaman Bombası Hafızası | Devtools/network ile recall cevabı okunur | Sequence active-player scoped/private yapılmadan fairness sign-off yok |
| P1 | `RusRuletiPublicState.lastShot.riskPercent` public’tir ve shot feed’de render edilir | Rus Ruleti | Prior risk’ten current risk history çıkarılır | Risk redaction; feed safe/explosion/turn-only olabilir |
| P2 | Outer App `results` branch’i Stage 8/9 controls’ı mount eder; Stage 6/7 detailed results çoğunlukla generic callout’ta kalır | Stage 6/7; Butona, Sızma, Memory, Kör Bomba, number games | Adapter result state görsel olarak kaybolur | Future runtime task: stage-specific result presentation; bu auditte kod yok |
| P2 | Generic `MatchState.inputCount` scene HUD/result copy’de aggregate event sayısı olarak görünür | Özellikle Butona Bas, Gizli Hırsız, Aşırı Yükleme; genel shell | Hidden activity/pacing clue ve dashboard hissi | Shared HUD’den kaldır/semantic status’a indir; hidden choice infer ettirme |
| P2 | Açgözlülük Limiti ve Ortalamaya En Yakın duplicate guard’sız overwrite kabul eder | Number games | One-shot visual lock server state’ten ayrışabilir | Atomic duplicate semantics + tests |
| P2 | Rüşvet random allocation manual allocation üzerine full budget ile başlayabilir | Rüşvet ve Darbe | Result ledger impossible budget/points gösterebilir | Allocation accounting test/fix; animation server payload’a bağlı |
| P2 | Kör Bomba unlimited pass stalling; holder departure fixed-first transfer; result UI gap | Kör Bomba | Maç uzayabilir, result okunmayabilir | Product decision/pass policy + departure/result QA |
| P2 | KPK departure’da `clueHolderByTarget` value mappings temizlenmeyebilir; phantom bonus riski | Kontrol Paneli Kaosu | İpucu bonusu yanlış/ayrılmış oyuncuya yazılabilir | Mapping cleanup + departure fixture |
| P2 | Disconnect grace sırasında target controls `eliminated` olmayan disconnected oyuncuyu gösterebilir | Rus Ruleti, Kör Bomba, KPK, Zehirli Kadeh ve target oyunları | Unavailable hedef seçilebilir | connected/current-participant filtering + spectator QA |
| P2 | Karalama save pointer-only, empty drawing valid, repeated large snapshots için cap yok | Karalama Defteri | Mobile bandwidth/memory ve input accessibility riski | Stroke/byte/rate budget; empty state’i geçerli göster |
| P2 | Karalama current Canvas 720×440 landscape, catalog Portrait; keyboard fallback yok | Karalama Defteri | Orientation/accessibility failure | Portrait-first Canvas/alternate mark mode + viewport fixture |
| P3 | Catalog orientation yalnız metadata; manifest `any`, gerçek rotate lock yok | 3 Landscape + 21 Portrait-marked | Hero object sıkışır, safe-area bozulur | `RotateDeviceOverlay` ve device QA |
| P3 | `NeonToyboxScene` yalnız birkaç dedicated prop’a sahip; geri kalanlar generic backdrop/characters | 21 oyun | 24 oyun aynı generic scene varyasyonu gibi görünür | 2D game-specific stage config; generic layer atmosphere-only |
| P3 | 8-player target rows, card lists, market items, result rows ve separate roster yoğunluğu | 24 genel shell; özellikle target/market/card games | Scroll, truncation, primary action kaybı | Compact token rails, paged reveal, no gameplay scroll |
| P3 | Audio/haptic implementation yok | 24 | Feedback text/color’a kalır | Optional event bus + preference/reduced-motion; secret signal yapma |
| P3 | Docs shuffle dese de `Gizli Alışveriş` adapter product order fixed | Gizli Alışveriş | Contract/reveal order drift | Source behavior ya da written contract açıkça seçilmeli; audit fixed’i kaydeder |

### Future QA fixtures

- Catalog gate: 2/3/4/5/6/7/8 players; every min/max; Portrait/Landscape device snapshots; safe-area and keyboard-open snapshots.
- Private JSON snapshots: writer IDs, bluff IDs, memory sequence, Russian risk, bomb remaining, poison, panel/clue and target edges.
- 8-player stress: target rail, card mapping, 4×4 grid, 12-product shelf, RPS/ledger and result reveal with no gameplay scroll.
- Server-late, duplicate, missing, disconnect-grace and result-transition cases; result animation uses received server view only.
- Keyboard focus/screen reader/reduced motion; no non-owner aria-label contains a secret value.
- Asset budget: SVG/PNG/WebP dimensions, sprite count, compressed bytes, loading priority; no 3D model/WebGL dependency.

## 12. Acceptance Checklist

- [x] `main=2118d9a` baseline inspected; pre-existing dirty/untracked work preserved.
- [x] Catalog, factories, Stage 6/7/8/9 adapters, client controls, engine, server snapshot path and tests inspected.
- [x] Exact 24 real catalog game IDs verified; no invented game/rule.
- [x] G0 split 24 games into six interaction-similar specialist groups and integrated G1–G6 findings.
- [x] All 24 games have a complete numbered 26-field Visual UX Spec and implementation-truth note.
- [x] Every spec includes actual logic, min/max, orientation, fantasy, interaction, public/private/secret/opponent model, UI problem, fullscreen 2D stage, hero object, HUD, players, input surface, max-3 tutorial, result, audio, haptic, assets, procedural split, priority, mobile, fairness, complexity, reuse and unique identity.
- [x] Premium 2D Arcade override applied: no 2.5D/3D/WebGL architecture or 3D pipeline is a target; HTML/SVG text stays live; Canvas only for clear drawing gameplay.
- [x] Generic scene-above-controls, separate large player list, SaaS/dashboard card, generic form and gameplay scroll patterns explicitly rejected.
- [x] Shared Runtime Primitives list explains both commonization and non-commonization.
- [x] Asset Inventory Summary, MUST/SHOULD/OPTIONAL strategy and Complexity Matrix include all 24 games.
- [x] Five rebuild batches include games, primitives, orientation, asset prerequisites, order and merge-conflict risks.
- [x] `Kontrol Paneli Kaosu` first calibration and `Kendim` second Portrait/social/text calibration defined.
- [x] G7 adversarial lenses independently applied by G0; findings/dispositions recorded transparently because G7 agent hit platform usage limit.
- [x] Private-info leak, genericization, 8-player overload, asset explosion, orientation and rule-fidelity gates are explicit.
- [x] No `App.tsx`, CSS, GameViewport implementation, server, shared rules, runtime asset integration or asset manifest changed by this audit.
- [x] The audit deliverable is only `docs/GAME_VISUAL_SPEC_24.md`; unrelated existing docs/assets were not modified.

**Conclusion:** 24/24 games are analyzed and specified for a shared-but-not-generic Premium 2D Arcade visual rebuild. Remaining P1/P2 findings are future implementation gates, not silently changed game rules.

**24 GAME VISUAL UX AUDIT: COMPLETE**
