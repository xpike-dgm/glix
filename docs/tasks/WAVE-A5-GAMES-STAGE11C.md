# WAVE A5 — Stage11C Five-Game Visual Implementation

## Branch / base
- Branch: `wave-a5-games-stage11c`
- Exact base: `152d8a4604465dfe80671be5c3b50a7e9d9e6acb`
- Codex: **gpt-5.6-luna / reasoning=max only**.
- Do not edit `GLIX-KALICI-HAFIZA.md`.

## Your 5 exact primary references
1. `12-acgozluluk-limiti-reference-v3.png`
2. `13-ortalamaya-en-yakin-reference-v2.png`
3. `14-gizli-kareler-reference-v3.png`
4. `18-cizgiyi-gecme-reference-final.png` — PM-approved final microcopy image (`Aynı bölgeye düşme, mümkün olduğunca yüksek seç.`)
5. `19-gizli-alisveris-reference-v3.png`

Build real UI; do not use full screenshots as static backgrounds. Match the approved PNG composition as closely as practical.

## Canonical rules — re-read source + adapters/tests before coding
### Açgözlülük Limiti — `acgozluluk-limiti`
- 3–8 players, one 20 s hidden selection.
- Choose integer 0..playerCount; no selection = 0.
- Common limit is fixed by player count: 3→6, 4→11, 5→17, 6→24, 7→33, 8→43.
- If total selections **exceed** limit: everyone gets 0. Otherwise every player gets exactly their selected number as direct general score.
- Do not implement old “highest selector -1” draft rule.

### Ortalamanın Yarısı — `ortalamanin-yarisi`
- 3–8; hidden integer 0–100; one 20 s phase.
- Target = **half of the average**, not raw average.
- Missing selection receives a server random integer 0–100 and participates normally.
- Closest target → general +2; second closest +1.
- If closest is tied, all tied closest get +1, no +2 and no second-place award.
- Results only reveal after phase ends.

### Gizli Kareler — `gizli-kareler`
- 2–4 players: 3×3; 5–8: 4×4.
- No mines. One hidden square choice per stage.
- Two stages, each 20 s.
- Players choosing the same square collide and are eliminated from this mini-game; unique square players get +1 general in that stage.
- Blank/late = passive/no score/no collision.
- If everyone collides in stage 1, game ends 0. If one player remains after stage 1, that player is uncontested in stage 2, automatically receives +1 and game closes.

### Çizgiyi Geçme — `cizgiyi-gecme`
- 2–8; one hidden 30 s selection, integer 0–100.
- Regions: 0–9, 10–19 … 90–99, and 100 alone.
- Goal: pick high **without another player landing in the same region**.
- Every player in a duplicated region becomes passive for scoring; no negative points.
- Among unique-region players, highest selected number +2 general, second highest +1.
- Blank/late = passive.
- Player-facing microcopy must say the actual rule: `Aynı bölgeye düşme, mümkün olduğunca yüksek seç.`

### Gizli Alışveriş — `gizli-alisveris`
- 3–8; 60-credit private budget, 30 s.
- Fixed 12-product pool; order shuffled. One unit max per product; as many products as budget allows; budget cannot exceed 60.
- Selections hidden until result.
- Final item value = item price ÷ number of players who selected that item. Basket value = sum of those values.
- Highest basket gets +1 general; ties for highest all +1. Empty/not submitted basket = 0.
- Keep pricing/catalog from canonical rule/adapters; reference products are visual examples only if they differ.

## Privacy / fidelity
- Never expose live hidden numbers/squares/baskets from other players in DOM/ARIA/data attributes.
- Use real server state and real roster; do not calculate authoritative results from reference examples.
- Reference is locked layout/art direction. Correct only actual rule conflicts.

## Ownership
Focus on `apps/client/src/visuals/games/stage11c/*` and its scoped CSS. Avoid common App/shell files and shared gameplay adapters unless a verified rule bug exists; report such bug instead of silently changing it.

## Acceptance / verification
- 360×800, 390×844, 412×915 phone-first; no horizontal overflow.
- Selection controls must be touch-friendly and not look like a desktop dashboard.
- Run all relevant five-game tests + client typecheck/build.
- Screenshot compare all five where possible; `git diff --stat`, `git status`.
- Commit/push only this branch; report exact SHA/tests/deltas.