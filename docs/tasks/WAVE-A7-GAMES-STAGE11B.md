# WAVE A7 — Stage11B / Risk Five-Game Visual Implementation

## Branch / base
- Branch: `wave-a7-games-stage11b`
- Exact base: `152d8a4604465dfe80671be5c3b50a7e9d9e6acb`
- Codex: **gpt-5.6-luna / reasoning=max only**.
- Do not edit `GLIX-KALICI-HAFIZA.md`.

## Your 5 exact primary references
1. `24-zaman-bombasi-hafizasi-reference-v3.png`
2. `23-capraz-ates-reference-v3.png`
3. `07-rus-ruleti-reference-v3.png`
4. `03-sizma-reference-v3.png`
5. `22-zehirli-kadeh-reference-v2.png`

Build real interactive UI; never use the whole PNG as a static background. Match the final reference layout/art as tightly as possible.

## Canonical rules — re-read source + corresponding adapters/tests
### Zaman Bombası Hafızası — `zaman-bombasi-hafizasi`
- 2–8; four colors.
- Starting sequence length 2; colors random, repeats allowed.
- Player order is shuffled once and then repeats cyclically, skipping eliminated players.
- Everyone can observe sequence playback; active player repeats it. Correct → sequence grows by 1 and turn passes.
- Wrong/no response → active player is eliminated/passive and gets -1 general; each other still-active player gets +1 general. Sequence resets to length 2 and cycle continues.
- Active input time = `sequence length × 3` seconds.
- Game ends when at least half of starting players are eliminated. Eliminated players do not re-enter.
- Never expose future sequence or hidden server data.

### Çapraz Ateş — `capraz-ates`
- 3–8; choose exactly one **other** player as target, hidden until result; 25 s.
- An attacker who targets someone and is targeted by nobody gets +1 general.
- A targeted player gets -1 general, only once even if targeted by many.
- Mutual targeting between two players makes that pair's mutual outcome 0; canonical adapter rules resolve combined cases.
- No/missing target = shot wasted; player may still be targeted and receive target penalty.
- Self-target forbidden. Do not reveal any live targets.

### Rus Ruleti — `rus-ruleti`
- 2–8; all alive initially; first gun holder random.
- Only holder fires; may target self or another alive player.
- Explosion risk starts 16%; safe shot transfers gun to target (self-target keeps it) and increases risk +10, max 76%.
- Explosion eliminates target, resets risk to 16%, and if continuing gun goes randomly to an alive player.
- Decision window 18 s; timeout auto-fires at random alive non-holder target if possible.
- Eliminated players spectate until end.
- End when alive count <= half starting count; survivors +1 general, eliminated 0.

### Sızma — `sizma`
- 3–8; exactly one infiltrator gets a different word, everyone else common word.
- Two **spoken** clue rounds, turn-based, no written clue, no clue timer.
- Every player gives one spoken clue in each round.
- Everyone presses `Oylamaya geç`; then 30 s vote, one vote each; self-vote allowed.
- If infiltrator caught: each normal player +1, infiltrator 0. Otherwise infiltrator +2, others 0.
- Vote tie means infiltrator wins.
- Do not implement voice recording/chat; clues are spoken in the room.

### Zehirli Kadeh — `zehirli-kadeh`
- 2–8. Poison count: 2–3 players→1; 4–5→2; 6–8→3.
- Players cannot see whether their own/others' goblet is poisoned before result.
- Each player has at most one optional swap with another player; no self-swap.
- Base duration 20 s; each successful swap immediately adds 5 s.
- Swaps are server-ordered/atomic; no live poison hints.
- At finish, clean goblet owner +1 general, poison goblet owner 0. No tie special case.

## Orientation / privacy
- If any of these are designated landscape by existing game metadata, use the real common landscape shell after A3 integration; do not create a desktop scroll board.
- Never put hidden target/poison/role/future sequence state in DOM/ARIA/data ids.
- Use actual real roster and server-authoritative state; reference names are examples.

## Ownership
Focus on `apps/client/src/visuals/games/stage11-8b/*` and scoped shared stage11b CSS. Avoid common shell/App.tsx and shared adapter edits unless a verified canonical mismatch is found and explicitly reported.

## Acceptance / verification
- Portrait targets: 360×800/390×844/412×915. Landscape targets: 844×390 if game metadata requires it.
- Touch targets large; no horizontal overflow.
- Run relevant five-game tests + client typecheck/build.
- Screenshot compare each reference if available; `git diff --stat`, `git status`.
- Commit/push only this branch and report exact SHA/tests/deltas.