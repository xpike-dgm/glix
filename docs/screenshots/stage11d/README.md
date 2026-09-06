# GLIX Stage 11.8D — Social / Creative Visual Presentation Catalog

This directory contains durable, automated headless browser QA screenshot captures verifying the dedicated Premium 2D visual presentation rebuild for Batch D (Social & Creative games) in GLIX.

---

## 1. Visual Direction & Design Principles

All six Batch D games adhere to the locked **Premium 2D Arcade / Neon Social Arcade** design direction:
- **Atmospheric Dark Arcade**: Deep navy/slate backdrop (`#050914`) illuminated with vivid cyber-neon glows (cyan `#72f4ff`, pink `#ff55d8`, yellow `#ffc857`, lime `#a8f46a`, amber `#ff8c42`, violet `#b57cff`).
- **Tactile Affordances**: Custom physical metaphors for party gameplay rather than generic web SaaS forms:
  - **Yazı Yaz**: Anonymous mechanical ink reveal rail, sliding slip placeholders with tamper seals.
  - **Sözlük Blöfü**: Centered vintage dictionary word banner and rotating numbered definition drawer slips.
  - **Çağrışım Ağı**: Glowing central prompt node expanding into clustered elastic association groups.
  - **Rüşvet ve Darbe**: Grand parliamentary rostrum, sealed ballots, RPS duel tie-breaker cards, and president budget allocation ledger with numerical steppers.
  - **Karalama Defteri**: Spiral notebook sketchbook canvas with 6-color neon palette swatches, 3 brush stroke presets, undo/clear controls, and suspect drawing gallery.
  - **İttifak**: Roundtable alliance diplomatic chamber with sealed wax handshake tiles and directed connection graph reveals.
- **Strict Touch & Accessibility Targets**: Minimum 44×44px interactive touch targets across all interactive buttons, chips, and steppers. High contrast focus rings (`2px dashed var(--stage11d-focus)`) and `prefers-reduced-motion` safety overrides.
- **Zero DOM Privacy Leaks**: Secret roles, assigned words, and bluffs are never exposed via DOM attributes (`id`, `className`, `data-*`, `aria-label`).

---

## 2. Tested Device Viewport Matrix

| Viewport Preset | Dimensions | Target Category | Verification Criteria |
|---|---|---|---|
| **Standard Mobile** | `390 × 844 px` | Primary Mobile Target | Balanced layout, readable typography, comfortable spacing |
| **Compact Mobile** | `320 × 700 px` | Minimum Phone Width | No horizontal overflow, no clipping, hit targets >= 44px |
| **Keyboard Safe** | `390 × 520 px` | Mobile Virtual Keyboard Open | Scroll containment, critical CTA visible without obscuration |
| **Landscape Smoke** | `844 × 390 px` | Secondary Orientation | Contained aspect ratio, centered stage, responsive HUD |

---

## 3. Screenshot Catalog

### Yazı Yaz (`yazi-yaz`)
| Screenshot File | Subphase / State | Viewport | Visual Verification Details |
|---|---|---|---|
| `yazi-yaz-write-390x844.png` | Write (Secret Writer) | 390x844 | Mechanical ink reveal rail with anonymous slips, secret role banner, input form with seal CTA |
| `yazi-yaz-discussion-390x844.png` | Discussion | 390x844 | Social inquiry prompt card, live discussion countdown |
| `yazi-yaz-guess-390x844.png` | Guess | 390x844 | Suspect selection chips, word guess input, non-self target validation |
| `yazi-yaz-results-390x844.png` | Results Reveal | 390x844 | Guess breakdown, person/word correct indicators, scored point badges |
| `yazi-yaz-write-320x700.png` | Write (Compact) | 320x700 | Responsive compression on 320px viewport without horizontal overflow |
| `yazi-yaz-write-390x520.png` | Write (Keyboard Safe) | 390x520 | 520px height virtual keyboard safe layout with accessible submit button |
| `yazi-yaz-landscape-844x390.png` | Write (Landscape) | 844x390 | Contained 9:16 aspect ratio centered in landscape orientation |

### Sözlük Blöfü (`sozluk-blofu`)
| Screenshot File | Subphase / State | Viewport | Visual Verification Details |
|---|---|---|---|
| `sozluk-blofu-write-390x844.png` | Write | 390x844 | Central dictionary word banner (`MÜLHEM`), character counter, bluff input form |
| `sozluk-blofu-choose-390x844.png` | Choose | 390x844 | Numbered definition cards (`definition-1` to `4`), disabled own bluff card guard |
| `sozluk-blofu-results-390x844.png` | Results Reveal | 390x844 | Authentic dictionary definition reveal badge, bluff owner attributions |
| `sozluk-blofu-choose-320x700.png` | Choose (Compact) | 320x700 | Compact layout with legible multiline definition typography |
| `sozluk-blofu-write-390x520.png` | Write (Keyboard Safe) | 390x520 | Keyboard safe view ensuring bluff input and submit button stay in viewport |

### Çağrışım Ağı (`cagrisim-agi`)
| Screenshot File | Subphase / State | Viewport | Visual Verification Details |
|---|---|---|---|
| `cagrisim-agi-answer-390x844.png` | Answer | 390x844 | Glowing prompt node (`KÖPRÜ`), free-association input with submit CTA |
| `cagrisim-agi-results-390x844.png` | Results Reveal | 390x844 | Cluster grouping nodes (`NEHİR` group vs `HALAT` solo), points calculation |
| `cagrisim-agi-answer-320x700.png` | Answer (Compact) | 320x700 | Compressed node hierarchy on narrow viewports |
| `cagrisim-agi-answer-390x520.png` | Answer (Keyboard Safe)| 390x520 | Safe area layout for fast virtual keyboard association submissions |

### Rüşvet ve Darbe (`rusvet-darbe`)
| Screenshot File | Subphase / State | Viewport | Visual Verification Details |
|---|---|---|---|
| `rusvet-darbe-election-390x844.png` | Election | 390x844 | Parliamentary rostrum, sealed ballot candidate cards, non-self target selection |
| `rusvet-darbe-distribution-390x844.png` | Distribution | 390x844 | President budget ledger, 1-2 point stepper controls (-/+), remaining budget counter |
| `rusvet-darbe-results-390x844.png` | Results Reveal | 390x844 | Election tally, president bonus, bribe distribution ledger payouts |
| `rusvet-darbe-distribution-320x700.png` | Distribution (Compact)| 320x700 | Responsive budget stepper rows on 320px screens |
| `rusvet-darbe-distribution-390x520.png` | Distribution (Keyboard Safe) | 390x520 | Compact budget ledger view within restricted height |

### Karalama Defteri (`karalama-defteri`)
| Screenshot File | Subphase / State | Viewport | Visual Verification Details |
|---|---|---|---|
| `karalama-defteri-draw-390x844.png` | Draw | 390x844 | Spiral sketchbook canvas, 6-color neon palette, brush size toggles, undo/clear |
| `karalama-defteri-vote-390x844.png` | Vote | 390x844 | Suspect drawing gallery cards, anonymous stroke rendering |
| `karalama-defteri-results-390x844.png` | Results Reveal | 390x844 | Outsider caught/escaped banner, secret word (`ELMA`) vs outsider word (`ARMUT`) reveal |
| `karalama-defteri-draw-320x700.png` | Draw (Compact) | 320x700 | Responsive sketchbook canvas maintaining normalized 1:1 drawing coordinates |
| `karalama-defteri-draw-390x520.png` | Draw (Keyboard Safe) | 390x520 | Drawing toolbar compact layout |
| `karalama-defteri-landscape-844x390.png` | Draw (Landscape) | 844x390 | Contained canvas layout centered horizontally in landscape mode |

### İttifak (`ittifak`)
| Screenshot File | Subphase / State | Viewport | Visual Verification Details |
|---|---|---|---|
| `ittifak-bargain-390x844.png` | Bargain | 390x844 | Roundtable diplomatic chamber, negotiation timer, strategic prompt |
| `ittifak-vote-390x844.png` | Vote | 390x844 | Wax-sealed handshake vote cards, single-target selection |
| `ittifak-results-390x844.png` | Results Reveal | 390x844 | Directed alliance network reveal, received vote tally (exact sum = 4) and points |
| `ittifak-bargain-320x700.png` | Bargain (Compact) | 320x700 | Responsive roundtable table on 320px width |
| `ittifak-vote-390x520.png` | Vote (Keyboard Safe) | 390x520 | Compact vote grid |

### Cross-Cutting & Protocol v3 Action States
| Screenshot File | Description | Viewport | Visual Verification Details |
|---|---|---|---|
| `spectator-mode-390x844.png` | Spectator View | 390x844 | Read-only spectator badge, hidden action forms, secret state completely redacted |
| `density-8players-390x844.png` | 8-Player Density | 390x844 | Maximum room capacity (8 players) in HUD roster without wrapping or truncation |
| `action-accepted-390x844.png` | Action Confirmation (Positive ACK) | 390x844 | Protocol v3 action reducer feedback with sealed checkmark and disabled form |
| `action-pending-390x844.png` | Action Pending (In-Flight) | 390x844 | Action fence active with `aria-busy` and disabled controls during server roundtrip |
| `action-rejected-390x844.png` | Negative ACK (Rejection Feedback) | 390x844 | Visible alert banner (`stage11d-negative-ack-card`) indicating invalid move/target |
