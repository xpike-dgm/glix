# GLIX — Stage 11.3D CI / Release Gate Delivery Report

## 1. Branch
- **Branch Name:** `stage-11-3d-ci-release-gate`
- **Base Commit (from main):** `2118d9ab254c4e69988c6192e9fe6409dad333c7`

## 2. Full Commit SHA
- **CI Workflow Commit SHA:** `a165d17f779d19ae33e48311e809c2a52baae54b`
- **Head Commit:** Recorded at branch head upon delivery.

## 3. Workflow File(s)
- **Workflow Path:** [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml)
- **Workflow Name:** `CI Release Gate`
- **Job Name:** `release-gate` (`CI / Release Gate`)

## 4. Trigger Policy
The workflow automatically executes under the following conditions:
- `pull_request`: targeting the `main` branch.
- `push`: targeting the `main` branch.

### Concurrency and Cancellation
- **Concurrency Group:** `${{ github.workflow }}-${{ github.ref }}`
- **Cancel in Progress:** Enabled for pull requests (`${{ github.event_name == 'pull_request' }}`), canceling superseded workflow runs to conserve CI runner capacity while ensuring pushes to `main` run to completion.

### Security and Permissions
- Minimal explicit permissions:
  ```yaml
  permissions:
    contents: read
  ```
- No repository secrets or third-party paid services are required.

## 5. Node / Runtime Decision and Evidence
- **Selected Node Version:** Node.js `22` (specifically LTS Node 22 via `actions/setup-node@v4` with `node-version: 22` and `cache: 'npm'`).

### Supporting Evidence in Codebase:
1. `deploy/client.Dockerfile:3`:
   ```dockerfile
   FROM node:22-alpine AS build
   ```
2. `deploy/server.Dockerfile:3` and `24`:
   ```dockerfile
   FROM node:22-alpine AS build
   ...
   FROM node:22-alpine AS runtime
   ```
3. Root `package.json:6-8`:
   ```json
   "engines": {
     "node": ">=20"
   }
   ```
4. `apps/server/package.json:17`:
   ```json
   "@types/node": "^22.10.2"
   ```
5. Local verified baseline: Node `v22.19.0` and npm `10.9.3`.

## 6. Exact Required Gates
The workflow runs the exact mandatory validation sequence in a clean runner checkout:

1. **Dependency Installation:**
   - Command: `npm ci`
   - Uses the repository's authoritative `package-lock.json` (`lockfileVersion: 3`).
   - Caching enabled via `actions/setup-node` (`cache: 'npm'`).
2. **Automated Test Suite:**
   - Command: `npm test`
   - Executes engine unit tests (`npm run test:engine` - 42 tests across shared packages) and integration tests (`npm run test:server` - 5 integration tests covering reconnection, participants snapshot, host migration, and socket handling).
3. **Typecheck:**
   - Command: `npm run typecheck`
   - Runs TypeScript validation across `@glix/shared` (`tsc`), `@glix/client` (`tsc --noEmit`), and `@glix/server` (`tsc --noEmit`).
4. **Production Build:**
   - Command: `npm run build`
   - Builds `@glix/shared`, `@glix/client` (via Vite), and `@glix/server` (`tsc`).
5. **Realtime Smoke Test:**
   - Command: `npm run smoke:realtime`
   - Starts built server instance (`apps/server/dist/index.js`), verifies server `/health` endpoint readiness (15s timeout check), executes `scripts/realtime-smoke.mjs` against `http://127.0.0.1:8787` and `ws://127.0.0.1:8787/ws`, and safely terminates the server via process trap.
6. **Artifact Upload (Safe Improvement):**
   - Action: `actions/upload-artifact@v4`
   - Uploads `apps/client/dist`, `apps/server/dist`, and `packages/shared/dist` with 7-day retention for debugging.
7. **Step Summary (Safe Improvement):**
   - Emits a concise GitHub Actions job summary documenting all passed gates.

## 7. Local Validation Results
All gates were executed and validated locally in a clean isolated worktree:

| Step | Command | Status | Output / Timing Summary |
| --- | --- | --- | --- |
| 1 | `npm ci` | **PASS** | 79 packages added, audited 83 packages, 0 vulnerabilities (31s) |
| 2 | `npm test` | **PASS** | `test:engine`: 42/42 passed (1.03s)<br>`test:server`: 5/5 passed (64.7s) |
| 3 | `npm run typecheck` | **PASS** | Shared build + client `tsc --noEmit` + server `tsc --noEmit` clean |
| 4 | `npm run build` | **PASS** | Shared build + client Vite bundle (`dist/index.html`, `dist/assets/*`) + server `tsc` clean |
| 5 | `npm run smoke:realtime` | **PASS** | `{"ok":true,"health":{"version":"0.7.0","activeRooms":1},"roomCode":"Y63BD","game":"butona-bas","phase":"tutorial"}` |

## 8. Forbidden-Path Verification
Strict file boundary audit confirmed:

- **Allowed Paths Modified/Created:**
  - `.github/workflows/ci.yml` (new)
  - `docs/STAGE_11_3D_CI_RELEASE_GATE.md` (new)
- **Forbidden Paths Modified:**
  - `apps/**`: **0 files**
  - `packages/**`: **0 files**
  - `deploy/**`: **0 files**
  - `scripts/**`: **0 files**
  - `package.json`: **0 changes**
  - Lockfiles (`package-lock.json`): **0 changes**
  - Runtime CSS: **0 changes**
  - Assets: **0 changes**
  - Server/client source: **0 changes**

## 9. Known Limitations
1. **In-Workflow Server Lifecycle for Smoke Gate:**
   `scripts/realtime-smoke.mjs` connects to a running HTTP/WS server on `127.0.0.1:8787`. In CI, the workflow starts the compiled server (`apps/server/dist/index.js`) as a background job before invoking `npm run smoke:realtime`, using an automated health probe and a shell `trap` to ensure shutdown.
2. **Browser E2E Testing:**
   Per sprint specification, Playwright and browser-level UI tests are excluded from this release gate to maintain minimal dependencies and fast execution.
3. **Multi-Container Edge Verification:**
   Docker Compose and production edge Nginx proxy tests are deferred to deployment pipelines rather than unit/integration PR gates.

## 10. Git Diff Summary
```
 .github/workflows/ci.yml             | 95 ++++++++++++++++++++++++++++++++++++
 docs/STAGE_11_3D_CI_RELEASE_GATE.md  | 98 ++++++++++++++++++++++++++++++++++++
 2 files changed, 193 insertions(+)
```
