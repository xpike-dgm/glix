# WAVE A8 — Remaining / Complex Games

## Branch / base
- Branch: `wave-a8-games-complex`
- Exact base: `152d8a4604465dfe80671be5c3b50a7e9d9e6acb`
- Codex: **gpt-5.6-luna / reasoning=max only**.
- Do not edit `GLIX-KALICI-HAFIZA.md`.

## Your 5 references
Primary game targets:
1. `10-kor-bomba-reference-v2.png`
2. `16-ittifak-reference-v2.png`
3. `02-kendim-reference-v2.png`
4. `21-kontrol-paneli-kaosu-reference-final.png` — PM-approved corrected landscape image with `Seçilen kablo` / `KES`.
Supporting mobile/landscape style:
5. `11-rotate-device-final-reference(2).png`

Build the real interactive screens; do not use whole screenshots as backgrounds. Match composition/art/geometry as tightly as practical.

## Canonical rules — re-read source + adapter/tests first
### Kör Bomba — `kor-bomba`
- 2–8; bomb starts on random player.
- Initial hidden explosion duration random 15–20 s.
- Bomb holder does **not** see real explosion time/remaining timer. Other players see real remaining time and can verbally tell truth or lie.
- Only current holder can pass, to another alive player, unlimited passes; no self-pass.
- Every successful pass is immediate and adds random 1–4 s to remaining explosion time.
- Round lasts until explosion. Player holding bomb at explosion gets -1 general; everyone else 0. One explosion only.
- No fake written hint/chat system; social information is spoken in the room.

### İttifak — `ittifak`
- 3–8. First 60 s is **spoken negotiation only**; the app does not create formal alliance/offer objects.
- Then 15 s secret vote; one vote per player, no self-vote; missing vote goes randomly to an eligible other player.
- Every received vote is directly +1 general score to its recipient. No special winner/tie bonus.
- Votes/results stay hidden until reveal.

### Kendim — `kendim`
- 3–8. 30 s: each player writes one word describing themselves. Then 30 s matching.
- Word cards are shuffled; owner hidden. Same words allowed.
- A player cannot match their own word to themselves; matching all cards is not mandatory.
- Correct match +1 mini-game; wrong match -1; blank 0.
- If exactly one player correctly identifies a given word's owner, that word owner gets +1 mini-game bonus; if 0 or 2+ find it, no owner bonus.
- No guesses at all = 0.
- Highest mini-game score player(s) get +1 general; ties at top all +1.

### Kontrol Paneli Kaosu — `kontrol-paneli-kaosu`
- 2–8; one 60 s cooperative-deduction phase.
- Every player has four cables `mavi/yeşil/kırmızı/sarı` in a player-specific order.
- Every player receives a clue that describes **another player's** cable ordering/condition and tells which color that target should cut; target identity is not directly named.
- Server forms a non-self-targeting one-way cycle so each panel has exactly one clue holder.
- Players solve by talking aloud. Each player may cut exactly one cable on their own panel; cannot change after cut.
- Correct cutter +1 general **and** the player holding that panel's clue +1 general. Wrong/blank = 0.
- No speed race/tie scoring.
- Final reference correction is locked: right card says `Seçilen kablo`, not `Seçilen hedef`; CTA `KES`.

## Complex/landscape requirements
- `kontrol-paneli-kaosu` must be genuine phone landscape and fill 844×390 style viewport; no fixed top/bottom chrome with scrollable middle desktop area.
- Preserve readability of all four cable panels, clue card, selected cable card and player strip without browser zoom.
- After A3 merge, rely on common orientation gate; do not duplicate a different rotate-screen design.
- `kor-bomba` role-specific visibility must not leak holder-only/others-only timing into DOM on the wrong client.

## Ownership
Focus on dedicated components (`kontrol-paneli-kaosu`, `kendim`) plus the existing component paths for Kör Bomba/İttifak and scoped CSS. Avoid App/common shell and server scoring changes unless a verified rule bug is reported.

## Acceptance / verification
- Portrait games: 360×800/390×844/412×915.
- Landscape KPK: 844×390, no horizontal/vertical nested scrolling in the play surface.
- Hidden/private state audit in rendered DOM where practical.
- Run relevant four-game tests + client typecheck/build.
- Screenshot compare all four game refs + rotate style reference.
- `git diff --stat`, `git status`; commit/push only this branch; final report exact SHA/tests/deltas.