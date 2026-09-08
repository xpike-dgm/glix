# WAVE A2 — Minigame Selection / Guest Lobby / Briefing / Results

## Branch / base
- Branch: `wave-a2-lobby-briefing-results`
- Exact base: `152d8a4604465dfe80671be5c3b50a7e9d9e6acb`
- Codex model: **gpt-5.6-luna / reasoning=max only**.
- Do not edit `GLIX-KALICI-HAFIZA.md`.

## Your 5 locked references
1. `06-minigame-selection-final-reference(2).png`
2. `07-guest-lobby-final-reference(2).png`
3. `08-briefing-ready-final-reference(2).png`
4. `09-round-result-final-reference(2).png`
5. `10-final-score-final-reference(2).png`

These are exact visual targets. No full-screenshot-background cheat; build interactive UI.

## 1) Minigame Seçimi
- User explicitly chose **independent full-screen page**, not lobby accordion.
- Header/back + GLIX + title.
- Modes: `Rastgele Seç` / `Elle Seç`.
- Manual list uses real 24-game catalog and actual availability/min-player rules from shared config.
- Selected rows/check states exactly follow the visual system; scroll list only where natural.
- `Seçimi Kaydet` returns/saves to host lobby using current real host flow.
- Never expose internal ids/stage names.

## 2) Guest Lobi
- Big room code, player list, `Sen` and `Oda Sahibi` labels.
- **Do not show host-selected minigame/route to guest.**
- No start/kick/selection controls.
- Waiting card copy equivalent to `Oda sahibi oyunu başlattığında oyun başlayacak.`
- `Lobiden Ayrıl` remains the only guest exit action.

## 3) Full-screen game briefing + Hazırım
- Separate screen, not overlay on gameplay.
- Must be driven by the **actual current game's canonical rule**, not generic fake copy.
- Detail level: enough to understand the game. No fixed three-bullet limit.
- Prefer `AMAÇ`, `NASIL OYNANIR`, and when relevant `GİZLİLİK`, `PUANLAMA` / critical special rule.
- No technical implementation details.
- Ready count/avatar status must be mathematically consistent.
- Large `Hazırım` button; no visible countdown/progress bar.
- Wire into already-integrated Protocol v4/server-authoritative `client:game:ready` barrier. Do not reimplement a client-only ready system.
- Disconnected/spectator/eliminated participants must not deadlock the barrier; preserve R1-B server semantics.

## 4) Tur Sonucu
- Render server-authoritative round score/rank/result fields only.
- Do not invent generic `+12/+8` if game reports different values.
- No `Sonraki Tur` or `Detayı Gör` button. The approved state is automatic progression: `Sıradaki oyun hazırlanıyor…`.
- Winner/leader presentation must tolerate ties and games with negative/zero/general-direct scoring.

## 5) Oyun Bitti
- Final total scoreboard, authoritative order/score.
- Main winner card adapts to actual winner/tie semantics.
- Only `Lobiye Dön` action. No invented `Yeniden Oyna`.

## Functional constraints
- Preserve room/match state machine, reconnect, privacy and action fencing.
- Use existing Protocol v4 ready/kick changes from base; do not downgrade protocol.
- Do not modify gameplay scoring adapters to make a UI sample fit.
- If the PNG's example number/copy conflicts with live contract, contract/rules win while geometry/style remains exact.

## Mobile/visual acceptance
- 360×800, 390×844, 412×915: no horizontal overflow.
- Briefing may vertically scroll only when the actual game's necessary rule text exceeds one viewport; primary CTA remains easy to reach and never overlaps content.
- Neon treatment and mascot family must be visually consistent with the five PNGs.

## Verification
- Relevant shared/server/client tests for ready/kick + client typecheck/build.
- `git diff --stat`, `git status`.
- Screenshot comparison for all five target pages where tooling permits.
- Commit/push this branch only; report exact SHA, tests and any real deltas.