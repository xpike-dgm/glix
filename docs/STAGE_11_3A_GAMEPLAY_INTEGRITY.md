# Stage 11.3A — Gameplay Integrity

This release closes the gameplay-integrity findings verified against the Stage 11 visual audit input.

## Wire contract

`PROTOCOL_VERSION` is `2`. Clients must treat game-specific state as server-authoritative and must not infer private roles, answers, risk history, or target availability from presentation-only fields.

The public state changes are intentionally coordinated with the version bump:

- Zaman Bombası Hafızası exposes its sequence only during the display phase; input and result snapshots carry an empty sequence.
- Rus Ruleti public shot views contain only shooter, target, and safe/explosion outcome. Risk remains in the current holder's private state.
- Sözlük Blöfü definition IDs are opaque, round-stable tokens and do not derive from player IDs.

## Gameplay invariants

- Açgözlülük Limiti and Ortalamaya En Yakın accept the first valid choice only.
- Rüşvet ve Darbe never allocates more than the president's exact vote budget; manual and automatic allocation share one ledger.
- Kör Bomba uses a server-authoritative `startedAt + 45_000 ms` hard cap. Passes and holder transfer cannot extend or reset it, and the fuse is not sent to clients.
- Target inputs and generated target pools use currently connected, current-game participants. Reconnectable room members remain in the room but are unavailable targets while disconnected.
- Kontrol Paneli Kaosu removes both endpoints of a clue relationship when a player permanently leaves, preventing stale clues and phantom bonuses.
