# WAVE A6 — Stage11D Five-Game Visual Implementation

## Branch / base
- Branch: `wave-a6-games-stage11d`
- Exact base: `152d8a4604465dfe80671be5c3b50a7e9d9e6acb`
- Codex: **gpt-5.6-luna / reasoning=max only**.
- Do not edit `GLIX-KALICI-HAFIZA.md`.

## Your 5 exact primary references
1. `01-yazi-yaz-reference-v3.png`
2. `04-sozluk-blofu-reference-v2.png`
3. `05-cagrisim-agi-reference-v3.png`
4. `11-rusvet-darbe-reference-v2.png`
5. `15-karalama-defteri-reference-v3.png`

Build interactive UI, not screenshot backgrounds. Reproduce the approved composition, character/cards, glows, spacing and mobile proportions as closely as possible.

## Canonical rules — re-read full source + adapters/tests
### Yazı Yaz — `yazi-yaz`
- 3–8 players. Exactly two secret `yazan` players each write their own secret word; all others enter `MASUM` (case-insensitive/normalized).
- Phases: 30 s writing → 60 s spoken discussion → 30 s guessing.
- A normal player guesses **one writer and that writer's word**. Each writer guesses the other writer and the other writer's word.
- Correct writer identity = +1 general; correct word = +1 general, scored separately. Missing guess has no negative.
- Same writer words are allowed. No extra tie/final bonus.
- Never reveal writer identity/secret words before the phase that canonically allows it.

### Sözlük Blöfü — `sozluk-blofu`
- 3–8. System chooses a strange word + real definition from dedicated pool.
- Every player must write one fake definition, max 100 chars.
- 50 s bluff writing → 30 s selection.
- Real + all fake definitions are fully shuffled. Player picks one definition and cannot pick their own bluff.
- Picking real definition = +1 mini-game point; wrong = 0. Every time another player selects your bluff, bluff owner gets +1 mini-game point.
- Preserve adapter/general-score transfer; do not invent penalties.

### Çağrışım Ağı — `cagrisim-agi`
- 2–8; shared main word; one mandatory free-text association each; 30 s; no multiple submission.
- Turkish case/extra-space normalization groups equivalent exact normalized answers.
- Group exists at 2+ identical normalized answers. Every member gets mini-game points equal to group size. Singleton = 0; no negative.
- Answers remain private until result. UI must not leak live answers through DOM/ARIA/debug state.

### Rüşvet ve Darbe — `rusvet-darbe`
- 3–8. President election: one mandatory secret vote per player, no self-vote, 20 s; missing vote goes to random eligible other player.
- Most votes wins. Election tie is resolved with simultaneous rock-paper-scissors among tied candidates, repeating as canonical rule specifies until one president remains.
- President immediately gets +1 general.
- Distribution phase 25 s. President receives distributable points equal to election votes received; must distribute all to **other** players, max 2 per recipient. Unallocated points at timeout are randomly distributed validly.
- Distributed points are direct general score.

### Karalama Defteri — `karalama-defteri`
- 3–8; random one uninformed player. Most see common word; uninformed sees a related/near word, not nothing.
- Drawing: 75 s, one drawing per player, editable until timeout; pen + 6-color palette + eraser.
- Then all drawings reveal; 20 s vote, one vote each, self-vote forbidden; missing votes are not randomized.
- If uninformed receives sole highest vote: all informed players +1 general. Otherwise uninformed +1. Any top-vote tie involving/around uninformed means uninformed survives/wins.
- No negative points.

## Privacy / interaction
- Spoken-discussion games should not add fake in-app chat/recording unless canonical rules require it.
- Never render hidden writer roles, answers, votes, words or drawing identity metadata before reveal.
- Reference sample names/words are examples; bind actual state.

## Ownership
Focus on `apps/client/src/visuals/games/stage11-8d/*` and scoped CSS. Avoid shared shell/App.tsx and gameplay adapters unless reporting a verified bug. Drawing performance must remain smooth on mid-range phones.

## Acceptance / verification
- 360×800, 390×844, 412×915; no desktop nested panels/overflow.
- Text input works with mobile keyboard and is not broken by A3 touch/zoom policies after integration.
- Drawing canvas respects pointer/touch and safe resizing.
- Run relevant tests for all five + client typecheck/build.
- Screenshot compare all five if possible; `git diff --stat`, `git status`.
- Commit/push this branch only; final report exact SHA/tests/deltas.