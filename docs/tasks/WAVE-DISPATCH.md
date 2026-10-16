# GLIX — 8 Agent Dispatch Manifest

Created by PM after R1 integration. All implementation branches were created from exact base `152d8a4604465dfe80671be5c3b50a7e9d9e6acb`.

## Mandatory execution model
Use Windows Local Coder → Codex with **only**:
- model: `gpt-5.6-luna`
- reasoning: `max`

For real work use background `start_process`, not blocking `run_command`. Follow with `process_output`. Prefer closed/DEVNULL stdin. Do not mark complete until `running:false` + real exit code, then independently verify file/diff/tests. Never reset/restore user work without approval.

## Parallel jobs
| Agent | Branch | Task file | Task setup commit |
|---|---|---|---|
| A1 | `wave-a1-common-entry` | `docs/tasks/WAVE-A1-COMMON-ENTRY.md` | `0e4ceec923c0a97671950e096416cc5e2f8361a2` |
| A2 | `wave-a2-lobby-briefing-results` | `docs/tasks/WAVE-A2-LOBBY-BRIEFING-RESULTS.md` | `47dd5790933125ff40cc8f5367b016790ca7c2ff` |
| A3 | `wave-a3-mobile-pwa-states` | `docs/tasks/WAVE-A3-MOBILE-PWA-STATES.md` | `e73cb3c5ef4caa58dc81fd9d749cacb0ba0b6abc` |
| A4 | `wave-a4-games-stage11a` | `docs/tasks/WAVE-A4-GAMES-STAGE11A.md` | `29e9566d799fe15b333f6275baefcf18b6d43316` |
| A5 | `wave-a5-games-stage11c` | `docs/tasks/WAVE-A5-GAMES-STAGE11C.md` | `bfcbc019c25af6e523009b614ee3fded227e3066` |
| A6 | `wave-a6-games-stage11d` | `docs/tasks/WAVE-A6-GAMES-STAGE11D.md` | `30b5fd43750d4f4287662faa948588dfe9c7aa39` |
| A7 | `wave-a7-games-stage11b` | `docs/tasks/WAVE-A7-GAMES-STAGE11B.md` | `2af1845f6d294aa0644408f9415fe0d4449ac32c` |
| A8 | `wave-a8-games-complex` | `docs/tasks/WAVE-A8-GAMES-COMPLEX.md` | `8ddf4fb9bf8d43de16a2f3dbc7b7ca16b31f00a7` |

## Worktree isolation
Create one worktree per branch. Example pattern only:
`git worktree add <isolated-path> <branch>`

Each Codex prompt should be short and deterministic:
`Read GLIX-KALICI-HAFIZA.md and your docs/tasks/WAVE-*.md. Confirm all five required PNG references are actually available. Then execute the task completely on your assigned branch. Do not edit persistent memory. Run required tests/build, commit and push. In final output report exact SHA, changed files, tests and remaining visual deltas.`

## Reference gate
Every AI must receive exactly the 5 reference images named in its task file. The 24 game PNGs and 13 common PNGs are the user's approved source of truth. If a required PNG is missing, the agent must not fabricate a substitute or claim visual completion.

## PM acceptance gate
Agent completion is only a candidate. PM must independently verify:
- branch/head SHA
- diff scope
- canonical rule compatibility
- no private-state leak
- client/shared/server tests as appropriate
- build/typecheck
- phone viewport fit
- visual comparison against primary PNGs

Only accepted branches are integrated. Production main remains untouched until R5.