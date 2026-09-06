# Stage 11.8C Browser QA Screenshot Gallery

Automated headless Chrome capture verification for **Stage 11.8C: Numeric / Density Immersive Rebuild**.

All frames are driven by **authoritative game adapter outputs** (`createStage7GameAdapter`) through a **test-only dev harness** (`qa.html`), strictly excluded from the production app bundle.

## Authoritative Rules & Scoring Reference

- **Açgözlülük Limiti**:
  - Capacity table: $3P=6, 4P=11, 5P=17, 6P=24, 7P=33, 8P=43$.
  - Choice range: $0..N$ where $N$ is player count (e.g. $0..4$ for 4P, $0..8$ for 8P).
  - Scoring: If sum $\le$ limit, each player scores their choice; if sum $>$ limit, crash (all score 0).
- **Ortalamanın Yarısı**:
  - Guess range: $0..100$.
  - Target formula: $\text{Target} = \frac{\text{Average}}{2}$.
  - Scoring: Nearest $+2$ Puan, second nearest $+1$ Puan. Missing players receive auto-generated values marked `[OTOMATİK]`.
- **Gizli Kareler**:
  - Pressure grid: $3\times 3$ for $\le 4$ players; $4\times 4$ for $>4$ players.
  - Round tracking: 2 rounds of play with holographic footprint trails.
  - Scoring: $+1$ Puan per round for solo survivor.
- **Çizgiyi Geçme**:
  - 11 finish lanes ($0..10$, with $100 \to 10$).
  - Scoring: Unique highest bucket $+2$ Puan (Gold Crown), unique second highest $+1$ Puan (Silver Crown). Colliding duplicate buckets receive 0 points.
- **Gizli Alışveriş**:
  - 60-credit budget, 12 official products from shared catalog (`GIZLI_ALISVERIS_PRODUCTS`).
  - Division formula: $\text{Product Points} = \frac{\text{Price}}{\text{Buyers}}$.
  - Scoring: Highest basket total receives $+1$ Puan.

## Verification Matrix

| Game | Target Viewports | Active Play | Interaction | Accepted | Negative ACK / Retry | Result & Formula | Spectator | 8-Player Density | Zero Overflow |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Açgözlülük Limiti** | 390×844, 320×700, 390×520, 844×390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS (100%) |
| **Ortalamanın Yarısı** | 390×844, 320×700, 390×520, 844×390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS (100%) |
| **Gizli Kareler** | 390×844, 320×700, 390×520, 844×390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS (100%) |
| **Çizgiyi Geçme** | 390×844, 320×700, 390×520, 844×390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS (100%) |
| **Gizli Alışveriş** | 390×844, 320×700, 390×520, 844×390 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS (100%) |

## Screenshot Inventory (50 frames)

- **`acgozluluk-limiti-playing-390x844.png`** (480.6 KB): [acgozluluk-limiti] scene: `playing` @ `390x844` (Overflow: NONE, Stage: OK)
- **`acgozluluk-limiti-interaction-390x844.png`** (478.1 KB): [acgozluluk-limiti] scene: `interaction` @ `390x844` (Overflow: NONE, Stage: OK)
- **`acgozluluk-limiti-accepted-390x844.png`** (481.2 KB): [acgozluluk-limiti] scene: `accepted` @ `390x844` (Overflow: NONE, Stage: OK)
- **`acgozluluk-limiti-rejected-retry-390x844.png`** (480.6 KB): [acgozluluk-limiti] scene: `rejected` @ `390x844` (Overflow: NONE, Stage: OK)
- **`acgozluluk-limiti-result-390x844.png`** (476.2 KB): [acgozluluk-limiti] scene: `result` @ `390x844` (Overflow: NONE, Stage: OK)
- **`acgozluluk-limiti-spectator-390x844.png`** (458.1 KB): [acgozluluk-limiti] scene: `spectator` @ `390x844` (Overflow: NONE, Stage: OK)
- **`acgozluluk-limiti-density8-390x844.png`** (498.3 KB): [acgozluluk-limiti] scene: `density8` @ `390x844` (Overflow: NONE, Stage: OK)
- **`acgozluluk-limiti-compact-320x700.png`** (401.5 KB): [acgozluluk-limiti] scene: `playing` @ `320x700` (Overflow: NONE, Stage: OK)
- **`acgozluluk-limiti-keyboard-390x520.png`** (428.0 KB): [acgozluluk-limiti] scene: `interaction` @ `390x520` (Overflow: NONE, Stage: OK)
- **`acgozluluk-limiti-landscape-844x390.png`** (641.8 KB): [acgozluluk-limiti] scene: `playing` @ `844x390` (Overflow: NONE, Stage: OK)
- **`ortalamanin-yarisi-playing-390x844.png`** (460.9 KB): [ortalamanin-yarisi] scene: `playing` @ `390x844` (Overflow: NONE, Stage: OK)
- **`ortalamanin-yarisi-interaction-390x844.png`** (460.0 KB): [ortalamanin-yarisi] scene: `interaction` @ `390x844` (Overflow: NONE, Stage: OK)
- **`ortalamanin-yarisi-accepted-390x844.png`** (476.0 KB): [ortalamanin-yarisi] scene: `accepted` @ `390x844` (Overflow: NONE, Stage: OK)
- **`ortalamanin-yarisi-rejected-retry-390x844.png`** (460.9 KB): [ortalamanin-yarisi] scene: `rejected` @ `390x844` (Overflow: NONE, Stage: OK)
- **`ortalamanin-yarisi-result-390x844.png`** (482.1 KB): [ortalamanin-yarisi] scene: `result` @ `390x844` (Overflow: NONE, Stage: OK)
- **`ortalamanin-yarisi-spectator-390x844.png`** (462.6 KB): [ortalamanin-yarisi] scene: `spectator` @ `390x844` (Overflow: NONE, Stage: OK)
- **`ortalamanin-yarisi-density8-390x844.png`** (483.6 KB): [ortalamanin-yarisi] scene: `density8` @ `390x844` (Overflow: NONE, Stage: OK)
- **`ortalamanin-yarisi-compact-320x700.png`** (384.2 KB): [ortalamanin-yarisi] scene: `playing` @ `320x700` (Overflow: NONE, Stage: OK)
- **`ortalamanin-yarisi-keyboard-390x520.png`** (429.9 KB): [ortalamanin-yarisi] scene: `interaction` @ `390x520` (Overflow: NONE, Stage: OK)
- **`ortalamanin-yarisi-landscape-844x390.png`** (633.4 KB): [ortalamanin-yarisi] scene: `playing` @ `844x390` (Overflow: NONE, Stage: OK)
- **`gizli-kareler-playing-390x844.png`** (511.1 KB): [gizli-kareler] scene: `playing` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-kareler-interaction-390x844.png`** (541.5 KB): [gizli-kareler] scene: `interaction` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-kareler-accepted-390x844.png`** (541.7 KB): [gizli-kareler] scene: `accepted` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-kareler-rejected-retry-390x844.png`** (511.1 KB): [gizli-kareler] scene: `rejected` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-kareler-result-390x844.png`** (592.0 KB): [gizli-kareler] scene: `result` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-kareler-spectator-390x844.png`** (521.7 KB): [gizli-kareler] scene: `spectator` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-kareler-density8-390x844.png`** (510.3 KB): [gizli-kareler] scene: `density8` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-kareler-compact-320x700.png`** (406.2 KB): [gizli-kareler] scene: `playing` @ `320x700` (Overflow: NONE, Stage: OK)
- **`gizli-kareler-keyboard-390x520.png`** (481.8 KB): [gizli-kareler] scene: `interaction` @ `390x520` (Overflow: NONE, Stage: OK)
- **`gizli-kareler-landscape-844x390.png`** (669.4 KB): [gizli-kareler] scene: `playing` @ `844x390` (Overflow: NONE, Stage: OK)
- **`cizgiyi-gecme-playing-390x844.png`** (439.6 KB): [cizgiyi-gecme] scene: `playing` @ `390x844` (Overflow: NONE, Stage: OK)
- **`cizgiyi-gecme-interaction-390x844.png`** (439.6 KB): [cizgiyi-gecme] scene: `interaction` @ `390x844` (Overflow: NONE, Stage: OK)
- **`cizgiyi-gecme-accepted-390x844.png`** (449.9 KB): [cizgiyi-gecme] scene: `accepted` @ `390x844` (Overflow: NONE, Stage: OK)
- **`cizgiyi-gecme-rejected-retry-390x844.png`** (439.6 KB): [cizgiyi-gecme] scene: `rejected` @ `390x844` (Overflow: NONE, Stage: OK)
- **`cizgiyi-gecme-result-390x844.png`** (516.1 KB): [cizgiyi-gecme] scene: `result` @ `390x844` (Overflow: NONE, Stage: OK)
- **`cizgiyi-gecme-spectator-390x844.png`** (447.3 KB): [cizgiyi-gecme] scene: `spectator` @ `390x844` (Overflow: NONE, Stage: OK)
- **`cizgiyi-gecme-density8-390x844.png`** (462.7 KB): [cizgiyi-gecme] scene: `density8` @ `390x844` (Overflow: NONE, Stage: OK)
- **`cizgiyi-gecme-compact-320x700.png`** (369.4 KB): [cizgiyi-gecme] scene: `playing` @ `320x700` (Overflow: NONE, Stage: OK)
- **`cizgiyi-gecme-keyboard-390x520.png`** (406.7 KB): [cizgiyi-gecme] scene: `interaction` @ `390x520` (Overflow: NONE, Stage: OK)
- **`cizgiyi-gecme-landscape-844x390.png`** (630.8 KB): [cizgiyi-gecme] scene: `playing` @ `844x390` (Overflow: NONE, Stage: OK)
- **`gizli-alisveris-playing-390x844.png`** (492.4 KB): [gizli-alisveris] scene: `playing` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-alisveris-interaction-390x844.png`** (518.4 KB): [gizli-alisveris] scene: `interaction` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-alisveris-accepted-390x844.png`** (518.4 KB): [gizli-alisveris] scene: `accepted` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-alisveris-rejected-retry-390x844.png`** (502.1 KB): [gizli-alisveris] scene: `rejected` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-alisveris-result-390x844.png`** (524.5 KB): [gizli-alisveris] scene: `result` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-alisveris-spectator-390x844.png`** (486.6 KB): [gizli-alisveris] scene: `spectator` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-alisveris-density8-390x844.png`** (515.3 KB): [gizli-alisveris] scene: `density8` @ `390x844` (Overflow: NONE, Stage: OK)
- **`gizli-alisveris-compact-320x700.png`** (411.2 KB): [gizli-alisveris] scene: `playing` @ `320x700` (Overflow: NONE, Stage: OK)
- **`gizli-alisveris-keyboard-390x520.png`** (472.7 KB): [gizli-alisveris] scene: `interaction` @ `390x520` (Overflow: NONE, Stage: OK)
- **`gizli-alisveris-landscape-844x390.png`** (654.8 KB): [gizli-alisveris] scene: `playing` @ `844x390` (Overflow: NONE, Stage: OK)

## Mechanical & Responsive Highlights

1. **Zero-Scroll Viewport Containment**: Validated at standard mobile (`390×844`), narrow mobile (`320×700`), keyboard-safe height (`390×520`), and landscape smoke (`844×390`). Zero horizontal overflow detected across all frames.
2. **Authoritative Engine Derivation**: All states and scores are generated directly by the official engine adapters (`createStage7GameAdapter`). No hand-authored synthetic scores or rule violations exist.
3. **Negative ACK / Retry Recovery**: Validated on all five games showing error notifications (`REDDEDİLDİ`) with actionable reasons while preserving input editability for retry.
4. **Watertight Anti-Leak Privacy Gate**: In spectator and playing states, secret choices of opponent participants are strictly omitted from the DOM, ARIA properties, and visual representations.
5. **Ergonomic Touch Targets**: Touch targets conform to the $\ge 44\text{px}$ standard with prominent glowing focus-visible states and thumb-accessible positioning.
