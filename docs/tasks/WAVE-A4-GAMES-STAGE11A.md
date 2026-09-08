# WAVE A4 — Stage11A Five-Game Visual Implementation

## Branch / base
- Branch: `wave-a4-games-stage11a`
- Exact base: `152d8a4604465dfe80671be5c3b50a7e9d9e6acb`
- Codex: **gpt-5.6-luna / reasoning=max only**.
- Do not edit `GLIX-KALICI-HAFIZA.md`.

## Your 5 exact primary references
1. `06-butona-bas-reference-v2.png`
2. `08-gizli-hirsiz-reference-v3.png`
3. `09-kor-kronometre-reference-v3.png`
4. `20-asiri-yukleme-reference-v2.png`
5. `17-son-kisi-reference-v3.png`

Implement the real interactive screens to match these PNGs as closely as practical: hierarchy, geometry, mascot/cards, glows, primary action size/location, spacing and phone fit. Do not use the whole screenshot as a background and do not redesign it.

## Canonical rules you must preserve
Always re-read the exact sections in `GLIX-MINIOYUN-KURALLARI-FORMU.md` and corresponding adapter/tests before coding. These summaries are reminders, not permission to override the source.

### Butona Bas — `butona-bas`
- 2–8 players, 45 s total.
- Server evaluates 0.3 s windows.
- In one window, 2+ distinct pressers: each +1 mini-game point; exactly one presser: that player -1; no press: no change; repeat press by same player in same window counts once.
- Unique top mini-game player → general +2; next rank +1. Tied top → all tied leaders +1, no +2.
- UI copy stays simple: same-time +1 / alone -1. **No radar/ms engineering UI.**

### Gizli Hırsız — `gizli-hirsiz`
- 2–8, one 30 s phase.
- Every player has `ÇAL`, can act at most once; first valid press recorded, second ignored.
- Actions hidden until result.
- Exactly one stealer → that player +1 general. Multiple stealers → stealers -1, non-stealers 0. Nobody/no action → 0.
- No shared visible vault target is required by rule.

### Kör Kronometre — `kor-kronometre`
- 2–8, 18 s.
- Real timer completely hidden. Target = 10th second.
- Each player presses once; no press is treated as 18 s.
- Closest → general +2; second closest +1. Exact rare ties share rank/reward and next rank skips according to existing adapter/tests.

### Aşırı Yükleme — `asiri-yukleme`
- 2–8; shared capacity 100, each tap +1; unlimited taps.
- Individual tap counts/competitive detail hidden until result as defined by private/public state.
- Reaching 100 starts a hidden 3-second danger window; 100 itself does **not** end the game.
- First server-ordered tap over capacity during danger window ends round; that player -1 and is excluded from ranking.
- Non-exploded unique tap leader +2, second +1; tied leaders all +1 and no +2.
- Do not expose a visible hidden-3-second countdown.

### Son Kişi — `son-kisi`
- 2–8; hidden random finish in 10–20 s, never shown.
- Each player can press `KAÇ` once at any time; server records time.
- Last valid presser before hidden finish +1 general; non-pressers at finish -1; earlier pressers 0. Exact same last timestamp → tied last players +1.
- If nobody escapes, everyone -1.
- No visible finish countdown.

## Privacy / UI rules
- Never render other players' still-private press/tap/decision state in DOM, aria labels, data attributes or off-screen text.
- Server time/score remains authoritative.
- Reference sample player names/colors are presentation examples; bind real roster.
- Reference text that conflicts with canonical rules must be corrected while preserving layout.

## File ownership
Focus on `apps/client/src/visuals/games/stage11a/*` and local/scoped CSS. Avoid `App.tsx` and giant shared `styles.css` unless absolutely necessary; common shell is owned by A1–A3. Do not modify shared scoring/adapters just to fit visuals.

## Acceptance / verification
- Portrait phone first: 360×800, 390×844, 412×915; no horizontal overflow or nested desktop-scroll layout.
- One clear primary action per game, large touch target.
- Run relevant tests for all five games + client typecheck/build.
- `git diff --stat` + `git status`; screenshot compare each game if available.
- Commit/push this branch only and report exact SHA, tests and any verified rule/visual delta.