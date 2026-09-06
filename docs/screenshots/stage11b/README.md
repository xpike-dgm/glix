# Stage 11.8B screenshot index

These durable captures were taken against the real client at `http://127.0.0.1:5173/` and websocket server at `ws://127.0.0.1:8787/ws`. The route used exactly the six Batch B games and eight players. Negative target, stale-ACK and disconnect cases are protocol outcomes and are recorded by the permanent regression suite rather than represented by fabricated UI frames.

## Load check

- [dev-check.png](./dev-check.png) — agent-browser load check; DOM assertions passed with no browser errors or warnings.

## Durable runtime frames

These frames are from the real eight-player Batch B route. Negative target, stale-ACK and disconnect cases are protocol outcomes and are recorded by the permanent regression suite rather than represented by fabricated UI frames.

| Game | Primary / private | Interaction / accepted | Spectator / result | Responsive evidence |
| --- | --- | --- | --- | --- |
| Sızma | [primary 390×844](./sizma-primary-private-390x844-real.png) | [clue interaction](./sizma-interaction-390x844-real.png), [accepted transition](./sizma-accepted-390x844-real.png) | [8-player vote](./sizma-vote-8p-390x844-real.png), [result](./sizma-result-390x844-8p-real.png) | [ready barrier](./sizma-ready-390x844-real.png), [320×700](./sizma-density-320x700-real.png), [390×520](./sizma-density-390x520-real.png) |
| Rus Ruleti | [private risk 844×390](./rus-ruleti-primary-private-844x390-real.png) | live target tray in [667×375](./rus-ruleti-landscape-667x375-real.png) | [8-player result](./rus-ruleti-result-667x375-8p.png) | [portrait rotate gate](./rus-ruleti-rotate-390x844-real.png), [844×390](./rus-ruleti-primary-private-844x390-real.png), [667×375](./rus-ruleti-landscape-667x375-real.png) |
| Kör Bomba | [sealed live bomb](./kor-bomba-play-844x390-live-2.png) | repeatable target tray in live frame | [result 844×390](./kor-bomba-result-844x390.png), [result 667×375](./kor-bomba-result-667x375.png) | [portrait rotate gate](./kor-bomba-rotate-390x844.png), [landscape live](./kor-bomba-play-844x390-live-2.png) |
| Zehirli Kadeh | [glass chain 390×844](./zehirli-kadeh-primary-private-390x844-real.png) | [target selection](./zehirli-kadeh-interaction-390x844-real.png), [accepted trade](./zehirli-kadeh-accepted-390x844-real.png) | [8-player result](./zehirli-kadeh-result-390x844-8p.png) | [ready barrier](./zehirli-kadeh-ready-390x844-real.png), portrait responsive live frame |
| Çapraz Ateş | [private reticle / target matrix](./capraz-ates-primary-390x844-real.png) | [live target tray](./capraz-ates-play-390x844-8p-live.png) | [result arena](./capraz-ates-result-390x844-8p.png) | portrait 390×844; responsive density rules are permanent CSS coverage |
| Zaman Bombası Hafızası | [display wall](./memory-display-390x844-8p-real2.png) | [covered input batch](./memory-input-390x844-8p-real.png), [input interaction](./memory-interaction-390x844-8p-real.png) | [spectator display](./memory-spectator-390x844-8p-real.png), [result recap](./memory-result-390x844-8p.png) | [390×520 spectator](./memory-spectator-390x520-8p-real.png), [390×520 result](./memory-result-390x520-8p.png) |

CSS/runtime checks cover 390×844, 320×700, 390×520, Rus 844×390 + 667×375, Kör Bomba 844×390 + 667×375, portrait rotate overlays, 44×44 controls, focus-visible and reduced-motion behavior. The permanent tests cover rejected/retry, self-target exception (Rus only), disconnected target/holder, active disconnect, reconnect, stale scope/ACK, hidden-state redaction, result-only reveal, all-disconnected pause/resume and 2–8 player roster behavior.

## Inline runtime captures

| ID | Game / surface | Viewport | Evidence |
| --- | --- | --- | --- |
| CUA-01 | Sızma valve/pipe private play surface | 390×844 | Inline CUA capture: active valve, private clue panel, public clue lane, no secret word in public surface. |
| CUA-02 | Sızma keyboard-safe clue interaction | 390×844 | Inline CUA capture: clue input focused with a long-enough Turkish clue and submit control. |
| CUA-03 | Sızma pressure-gate ready barrier | 390×844 | Inline CUA capture: READY BARRIER / HAZIRIM gate with per-device ready state. |
| CUA-04 | Landscape-only rotate gate | 390×844 portrait | Inline CUA capture: accessible `YATAY GÖRÜNÜM GEREKLİ` overlay for the landscape exceptions. |
| CUA-05 | Kör Bomba sealed bomb result | 844×390 | Inline CUA capture: covered fuse chamber, explosion result, final holder and pass timeline. |
| CUA-06 | Çapraz Ateş private aim reticle | 390×844 | Inline CUA capture: private target tray and social reticle without a public beam graph during play. |
| CUA-07 | Çapraz Ateş accepted miss | 390×844 | Inline CUA capture: `BOŞ ATIŞ`, accepted/pending feedback and disabled repeat guard. |
| CUA-08 | Zaman Bombası Hafızası display | 390×844 | Inline CUA capture: luminous sequence wall with covered input boundary. |
| CUA-09 | Zaman Bombası Hafızası spectator/eliminated view | 390×844 | Inline CUA capture: redacted covered wall and spectator banner; input pads are not actionable. |
| CUA-10 | Zaman Bombası Hafızası result recap | 390×844 | Inline CUA capture: allowed result sequence, mistake count, elimination and survivor ladder. |

## Matrix coverage

The CUA run covered primary, rightful-private, spectator/redacted, interaction/pending, accepted, result, and landscape-gate states across the route. The permanent engine and static privacy regressions cover the corresponding rejected/stale/self-target/disconnect/reconnect states; those states are intentionally not rendered as fake screenshots because they are negative protocol outcomes. Responsive CSS includes the required 390×844, 320×700, 390×520, 844×390 and 667×375 breakpoints, with `overflow: hidden`, focus-visible controls, reduced-motion rules and 44px minimum action targets.

| Game | Primary / private | Spectator / result | Interaction / rejection / roster | Density / orientation |
| --- | --- | --- | --- | --- |
| Sızma | CUA-01, CUA-02 | CUA-03; result covered by adapter/result tests | clue/vote stale, active disconnect and ready disconnect in permanent tests | portrait CSS matrix; 8-player clue lane in adapter coverage |
| Rus Ruleti | live CUA route | result route exercised; result reveal in adapter tests | self-target allowed, disconnected target rejection and reconnect in permanent tests | CUA-04 rotate gate; landscape CSS 844×390 / 667×375 |
| Kör Bomba | live CUA route | CUA-05 | target validity, stale rejection, repeatable pass and holder disconnect in permanent tests | CUA-05 landscape; CUA-04 portrait gate; landscape CSS matrix |
| Zehirli Kadeh | live CUA route | result reveal in adapter tests | valid/stale/self/disconnected target and reconnect in permanent tests | portrait CSS 390×844 / 320×700 / 390×520 |
| Çapraz Ateş | CUA-06 | CUA-07 result arena contract plus adapter result tests | miss, stale/self/disconnected target and reconnect in permanent tests | portrait CSS density fallback and keyboard target controls |
| Zaman Bombası Hafızası | CUA-08 | CUA-09, CUA-10 | batch ACK, wrong-sequence rejection, active disconnect and reconnect in permanent tests | portrait CSS density matrix; 8-player order/state coverage |
