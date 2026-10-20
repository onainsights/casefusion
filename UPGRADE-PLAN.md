# Security and modernisation plan

Base: Directus **v10.6.4** (released 2023-10-20). Re-baselined on 2026-10-20 from the earlier plan written against
v10.0.0 (tag `archive/2026-06-snapshot`).

**Goal:** a working build on a supported Node with no known high or critical vulnerabilities in production dependencies,
**without changing user-facing functionality**. Dependency and tooling changes only.

**Not in this round:** Express 5, CodeMirror 6, Zod 4, Vue 3.5 / Vite 6, Prettier 3 reformat, making the private
extensions load (they target 10.10+/11.x).

## What moved upstream between 10.0.0 and 10.6.4

Items from the old plan that no longer apply:

- `vm2` is gone; the Run Script operation uses `isolated-vm` 4.6.0 (`api/src/operations/exec/`).
- `tests/blackbox` already runs on Vitest (was Jest).
- `axios` 1.4 / 1.5, TypeScript 5.2.2, pnpm 8.9.0, helmet 7, Vitest 0.34 in most workspaces.

## Current versions (v10.6.4)

| Area      | Package                                                                          | Now              | Target                           | Why                                      |
| --------- | -------------------------------------------------------------------------------- | ---------------- | -------------------------------- | ---------------------------------------- |
| Engine    | Node                                                                             | `>=18` (EOL)     | 22 LTS                           | Node 18 EOL 2025-04-30                   |
| Engine    | pnpm                                                                             | 8.9.0            | 9.x                              | pnpm 8 unsupported                       |
| Engine    | Docker base                                                                      | `node:18-alpine` | `node:22-alpine`                 |                                          |
| Engine    | `@types/node`, `tsx`                                                             | 18.16 / 3.12     | 22 / 4                           |                                          |
| Security  | `axios`                                                                          | 1.4.0, 1.5.1     | 1.7+ (latest 1.x)                | SSRF / CSRF CVEs                         |
| Security  | `jsonwebtoken`                                                                   | 9.0.1            | 9.0.2                            |                                          |
| Security  | `undici`                                                                         | 5.22.1           | 6.x                              | multiple CVEs in 5.x                     |
| Security  | `sharp`                                                                          | 0.32.5           | 0.33.x                           | libvips CVEs; Node 22 prebuilds          |
| Security  | `happy-dom`                                                                      | 9.18.3           | 15+                              | RCE CVE (dev/test only)                  |
| Security  | `samlify`                                                                        | 2.8.10           | 2.10+                            | CVE-2024-45389                           |
| Security  | `@aws-sdk/*`                                                                     | 3.332            | current 3.x                      | drop `@aws-sdk/abort-controller`         |
| Security  | `@azure/storage-blob`                                                            | 12.14.0          | current 12.x                     |                                          |
| Security  | `@google-cloud/storage`                                                          | 6.10.1           | 7.x                              |                                          |
| Server    | `helmet`                                                                         | 7.0.0            | 8                                |                                          |
| Server    | `argon2`                                                                         | 0.30.3, 0.31.1   | 0.41                             | Node 22 prebuilds                        |
| Server    | `isolated-vm`                                                                    | 4.6.0            | 5.x                              | expect 4.x not to build on Node 22       |
| Server    | `pino` / `pino-http`                                                             | 8.14 / 8.3       | 9 / 10                           | drop abandoned `pino-http-print`         |
| Server    | `ioredis`, `nodemailer`, `liquidjs`, `openid-client`, `pg`, `tedious`, `sqlite3` | various          | latest patch/minor               |                                          |
| Server    | `express`                                                                        | 4.18.2           | 4.21+ (stay on 4)                | path-to-regexp / qs CVEs                 |
| Replace   | `ldapjs`                                                                         | 2.3.3            | `ldapts`                         | decommissioned, no patch path            |
| Replace   | `mapbox-gl`                                                                      | 1.13.3           | `maplibre-gl` 4.x                | Mapbox 2.x is not OSS; licence hygiene   |
| Replace   | `@mapbox/mapbox-gl-geocoder`                                                     | 5.0.1            | `@maplibre/maplibre-gl-geocoder` |                                          |
| Replace   | `json2csv`                                                                       | 5.0.7            | `@json2csv/node`                 | unmaintained                             |
| Toolchain | TypeScript                                                                       | 5.2.2            | 5.6                              |                                          |
| Toolchain | Vite / `@vitejs/plugin-vue`                                                      | 4.3.7 / 4.2.3    | 5 / 5                            | only if needed for Node 22               |
| Toolchain | Vitest                                                                           | 0.31.1, 0.34.6   | 2.x                              | `@vitest/coverage-c8` → `coverage-v8`    |
| Toolchain | ESLint                                                                           | 8.40.0           | 8.57 (9 only if forced)          |                                          |
| Toolchain | esbuild / rollup                                                                 | 0.17 / 3.22      | as needed by extensions-sdk      |                                          |
| Toolchain | Storybook                                                                        | 7.0.12           | remove or 8                      | 41 stories in `app/`; ~80 deps           |
| Docs      | VitePress                                                                        | 1.0.0-rc.4       | leave                            | `docs/` is upstream reference, not built |

## Steps

One PR per step. Each ends with the verification gate below.

- **E0 Baseline.** On Node 18 and pnpm 8.9.0, untouched: `pnpm install --frozen-lockfile && pnpm build && pnpm test`.
  Save `pnpm audit --prod --json` and `osv-scanner --lockfile pnpm-lock.yaml` output under
  `security/baseline-2026-10.json` so progress is measurable. Record anything already failing.
- **E1 Engine.** Node 22 LTS, pnpm 9, `node:22-alpine`, `@types/node` 22, `tsx` 4. `engines.node` in root, `api/`,
  `directus/`, `sdk/`, `packages/extensions-sdk/`. Bump native modules that do not build on Node 22 (`isolated-vm` 5,
  `argon2`, `sharp`, `sqlite3`). Fix fetch/undici typing and ESM edges as they appear.
- **E2 Security sweep.** Curated allowlist from the Security and Server rows above, not `pnpm update --latest`. Exit
  criterion: `pnpm audit --prod` reports zero high/critical, or each remaining one is documented with why it is not
  exploitable here.
- **E3 `ldapjs` → `ldapts`.** Rewrite `api/src/auth/drivers/ldap.ts` with the same behaviour and config. May be deferred
  behind an "LDAP disabled" default if it blocks the working build.
- **E4 `mapbox-gl` → `maplibre-gl`.** `app/src/interfaces/map/`, `app/src/layouts/map/`,
  `app/src/styles/lib/_mapbox.scss`, geocoder and draw plugins. Mapbox basemaps keep working with a user token through
  MapLibre's style URL support.
- **E5 Toolchain.** Only what E1–E4 need to build cleanly. Decide Storybook: remove if nobody uses it.
- **E6 Hardening.** `pnpm dedupe`; `license-checker --summary` clean (no BUSL, SSPL, Commons Clause); README and
  `contributing.md` state the Node/pnpm matrix.

## Verification gate

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm lint`
- `pnpm --recursive exec tsc --noEmit`
- `pnpm test`
- `pnpm audit --prod` (compare against the E0 baseline)
- After E1, E2, E3: `pnpm test:blackbox` against Postgres at least.
- Manual smoke (API + app dev): bootstrap and admin login, collection and field creation, item CRUD via app, REST and
  GraphQL, local file upload, a flow with a Run Script operation, role permissions on a second user, map interface
  renders (after E4).

## Decisions deferred

1. Drop optional DB drivers we will never support (`tedious`/MSSQL, Oracle, CockroachDB) to shrink audit surface?
   Changes behaviour for anyone using them; default: keep.
2. Storybook: keep (and bump to 8) or remove.
3. ESLint 9 flat config: only if ESLint 8 fails on Node 22.
