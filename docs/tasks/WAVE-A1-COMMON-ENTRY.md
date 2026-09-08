# WAVE A1 — Common Entry / Core Flow

## Branch / base
- Branch: `wave-a1-common-entry`
- Exact base: `152d8a4604465dfe80671be5c3b50a7e9d9e6acb`
- Model when executed through Codex: **gpt-5.6-luna / reasoning=max only**.
- Do **not** edit `GLIX-KALICI-HAFIZA.md`; PM owns it.

## Your 5 locked references
PM will mount/install these exact approved PNGs. They are primary targets, not inspiration:
1. `01-home-final-reference(2).png`
2. `02-how-to-play-final-reference(2).png`
3. `03-create-room-final-reference(2).png`
4. `04-join-room-final-reference(2).png`
5. `05-host-lobby-final-reference(2).png`

If the exact PNGs are unavailable in your worktree/input, do not invent replacements; report the missing reference.

## Goal
Implement these 5 screens so that a side-by-side phone screenshot is as close as practical to the approved PNG: same composition, spacing, hierarchy, neon borders/glows, mascot scale, CTA position, card geometry and responsive proportions. This is **not** a redesign exercise. Do not reinterpret the reference.

Do not cheat by placing the full screenshot as a background. Build the real interactive UI. Individual extracted/real image assets are fine if needed.

## Locked behavior
### 1) Home
- Root screen: **no back arrow**.
- No names under the four decorative mascots.
- Copy: `Aynı oda. Farklı hamle.` / `Arkadaşlarınla en eğlenceli mini oyunlar burada.`
- Buttons: `Oda Kur`, `Odaya Katıl`, `Nasıl Oynanır?`.
- Bottom info: `2–8 Oyuncu • Herkes Kendi Telefonundan`.
- No normal-state `Bağlantı hazır`, protocol, stage or server text.

### 2) Nasıl Oynanır
- Separate full-screen page, close/back works.
- Three broad steps; do not falsely say every game is only hidden voting/typing.
- Explain room → different mini-games → do your move and see results.

### 3) Oda Kur
- No avatar selector.
- Nickname only + `Oda Kur`.
- Use the repo/shared nickname constant; **do not hardcode the reference's example `12` if contract differs**.
- On success keep existing server-authoritative create-room flow.

### 4) Odaya Katıl
- Decorative mascot row can match reference; no avatar selection behavior.
- Nickname + 5-character uppercase room code.
- Existing validation/reconnect identity semantics stay intact.

### 5) Host Lobi
- Big copyable room code.
- `Sen` for self and `Oda Sahibi` for host.
- Host can remove **other** players only; no self-kick.
- One `Minigame Seçimi` action; it opens the independent page owned by A2.
- Big `Oyunu Başlat` CTA.
- No technical connection/status text.

## Ownership / conflict rules
- You are primary owner for common entry presentation and may touch `App.tsx` / common flow CSS only as needed.
- Keep changes focused. Do not modify mini-game gameplay adapters/scoring.
- Coordinate by component boundaries: A2 owns minigame selection/briefing/results; A3 owns orientation/reconnect/kicked/PWA state screens.
- Prefer reusable `GlixWordmark`, mascot/card/button primitives instead of copy-pasting giant CSS blocks.

## Mobile acceptance
- 360×800, 390×844, 412×915: no horizontal overflow.
- Use safe-area aware padding and mobile `dvh` behavior.
- Touch targets >= ~44 CSS px where practical.
- Normal home/form/lobby scrolling is allowed only when viewport height truly requires it; no desktop dashboard middle-pane scrolling.

## Verification before finishing
1. Run client typecheck/build and relevant tests.
2. Verify exact changed files with `git diff --stat` + `git status`.
3. Take/render representative mobile screenshots if local tooling permits and compare visually to all five refs.
4. Commit and push to **this branch only**.
5. Final report: exact commit SHA, changed files, tests/build, known visual deltas. Do not claim pixel match without checking.