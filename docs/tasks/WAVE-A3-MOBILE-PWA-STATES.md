# WAVE A3 — Mobile/PWA + Exceptional States

## Branch / base
- Branch: `wave-a3-mobile-pwa-states`
- Exact base: `152d8a4604465dfe80671be5c3b50a7e9d9e6acb`
- Codex: **gpt-5.6-luna / reasoning=max only**.
- Do not edit `GLIX-KALICI-HAFIZA.md`.

## Your 5 references
Primary targets:
1. `11-rotate-device-final-reference(2).png`
2. `12-reconnecting-final-reference(2).png`
3. `13-kicked-final-reference(2).png`
Style support:
4. `01-home-final-reference(2).png`
5. `08-briefing-ready-final-reference(2).png`

## Goal
Make GLIX behave like a mobile app/PWA rather than a zoomable desktop webpage while reproducing the three state screens as closely as possible to the primary references.

## 1) Telefonunu yana çevir
- Full-screen orientation gate for games that truly require landscape.
- No back arrow, no `Tamam`, no manual continue button.
- Approved copy: `Telefonunu yana çevir`; `Bu mini oyun yatay modda oynanır.`; `Telefonunu çevirdiğinde oyun otomatik devam eder.`; `Telefonunu yatay konuma getir`.
- As soon as device orientation satisfies game requirement, gate disappears automatically.
- Do not put actual landscape game inside a portrait scroll pane.

## 2) Bağlantın kesildi
- Generic recoverable reconnect state usable from lobby/game without lying about current phase.
- Approved copy: `Bağlantın kesildi`, `Oyuna yeniden bağlanıyoruz…`, `Uygulamayı kapatma. Kaldığın yere dönmeye çalışıyoruz.`
- No `Tekrar Dene`, `Lobiden Çık`, protocol/server/debug wording.
- Existing automatic reconnect token/session logic remains authoritative.
- Must not accidentally reveal private state while reconnecting.

## 3) Odadan çıkarıldın
- Distinct terminal kicked state, not generic disconnect.
- Copy: `Odadan çıkarıldın`, `Oda sahibi seni bu odadan çıkardı.`, CTA `Ana Ekrana Dön`.
- No `Tekrar Katıl`.
- Only show this for actual kicked reason. If room-closed semantics exist separately, do not falsely label them kicked.

## 4) App-like PWA behavior
Implement carefully, especially on gameplay surfaces:
- viewport meta with `viewport-fit=cover`, initial/max scale appropriate to app-like no-zoom behavior;
- safe-area env insets;
- `100dvh` / dynamic mobile viewport rather than fixed desktop vh assumptions;
- prevent accidental horizontal scroll/overscroll during gameplay;
- prevent double-tap/pinch zoom on game interaction surfaces where safe;
- use `touch-action` intentionally (`none`/`manipulation` only where appropriate), **do not break text input selection/keyboard on create/join/text games**;
- prevent text/image selection/drag ghosting on game controls;
- standalone PWA should fill available viewport and remain usable under browser UI when not installed;
- orientation resize must not preserve stale width/height causing clipping.

## Ownership
Primary files: OrientationGate/GameViewport/RotateDeviceOverlay/reconnect/kicked state/common viewport/PWA shell/manifest/index viewport CSS. Avoid mini-game component redesigns and avoid A1/A2 page presentation except minimal hooks.

## Acceptance
- portrait: 360×800, 390×844, 412×915 no horizontal overflow.
- landscape: 844×390 and equivalent phone landscape genuinely fills screen.
- no browser-like zoom/selection/overscroll during gameplay on touch.
- forms/text-entry games remain typeable.
- reconnect and kicked states are reachable from real state machine events, not demo-only routes.

## Verification
Run client typecheck/build/PWA tests plus any reconnect/orientation tests. If local browser automation exists, test pinch/double-tap/resize behavior as far as tooling allows. Commit/push this branch only; final report exact SHA, tests, changed files and known device-specific limitations.