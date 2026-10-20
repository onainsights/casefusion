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

Order: E0, E2a, E1, E2b, E3, E4, E5, E6. The easy security fixes (E2a) come before the engine change because they do not
need Node 22 and remove most of the inherited advisories.

- **E0 Baseline (done 2026-10-20).** On Node 18.20.8 and pnpm 8.9.0, `pnpm install --frozen-lockfile`, `pnpm build`
  (with `NODE_OPTIONS=--max-old-space-size=8192`, as in the Dockerfile) and `pnpm test` pass. `pnpm audit --prod`: 295
  distinct advisories (12 critical, 156 high, 142 moderate, 32 low by path count). Per-advisory summary in
  `security/baseline-2026-10.json`, each classed by the update that fixes it:

  | Fix                         | Critical | High | Moderate | Low | Total |
  | --------------------------- | -------- | ---- | -------- | --- | ----- |
  | Patch/minor, same major     | 8        | 108  | 79       | 17  | 212   |
  | Major version bump          | 3        | 26   | 32       | 10  | 71    |
  | No patched version released | 0        | 7    | 5        | 0   | 12    |

- **E2a Easy security fixes (Node 18).** Same-major updates only, no API changes. One PR each:

  1. Refresh transitive dependencies within their declared ranges (`pnpm update --recursive --depth Infinity`, which
     leaves our exactly-pinned direct dependencies alone).
  2. Bump directly pinned dependencies to the latest patch/minor of their current major: `axios` 1.x, `liquidjs` 10.x,
     `sharp` 0.32.x, `undici` 5.x, `ws` 8.x, `js-yaml` 4.x, `joi` 17.x, `nodemailer` 6.x, `vite` 4.x, `rollup` 3.x,
     `vue-i18n` 9.x, `jsonwebtoken` 9.x, `express` 4.x, and whatever else the audit lists.
  3. `pnpm.overrides` in the root `package.json` for transitive packages that stay stuck because a parent pins an old
     version. Record each override in this file with the parent that blocks it, so it can be dropped once the parent
     updates. Overrides in place (drop each once its parent no longer needs it):

  | Override                        | Parent that blocks the fix                                            |
  | ------------------------------- | --------------------------------------------------------------------- |
  | `fast-xml-parser@4.1.2` → 4.5.7 | `@aws-sdk/client-s3`, `client-ses`, `client-sts` 3.332 pin it exactly |
  | `request>form-data` → 2.5.6     | `request` 2.88 (via `nodemailer-sendgrid` → `@sendgrid/client` 6)     |
  | `request>qs` → 6.16.1           | same                                                                  |

- **E2a.4 Admin app bundle (done 2026-10-20, after E1).** `pnpm audit --prod` skips `app/` entirely: its packages are
  devDependencies because Vite bundles them, so E0 to E2a.3 measured the API only. Classifying the app's advisories by
  whether the package is imported from `app/src` (and not only by build or test tooling) gave 44 advisories in the
  browser bundle (1 critical, 11 high). Fixed: `dompurify` 3.0.3 → 3.4.17 (21 advisories, XSS sanitiser bypasses),
  `tinymce` 6.6.0 → 6.8.6, `nanoid` 4.0.2 → 5.1.16 in app, api and composables (same API; the 4.x fixes only exist in
  5.x), and an in-range refresh of `protocol-buffers-schema`. Left for majors: `tinymce` 7 (E2b; its licence is
  GPLv2-or-later, compatible), `unhead` 2 (E2b), `maplibre-gl` (E4). CI's audit job now also runs a full audit.

  Totals on 2026-10-20 after E2a.4, distinct advisories: API production dependencies 79 (4 critical, 30 high); admin app
  bundle 9 (1 critical, 4 high); everything including build and test tooling 157 (10 critical, 65 high).

- **E1 Engine (done 2026-10-20).** Node 22 LTS and pnpm 9.15.9 (`packageManager`, `engines`, lockfile v9),
  `node:22-alpine`, CI on Node 22, `@types/node` 22.20.5, `tsx` 4.23.15, `isolated-vm` 5.0.4. `engines.node` raised in
  root, `api/` and `casefusion/` only: `sdk/` and `packages/extensions-sdk/` are libraries that run in other projects.
  `argon2`, `sharp` and `sqlite3` work unchanged on Node 22 (N-API binaries). Minimum is Node 22.12 because
  `sanitize-html` 2.17.6+ (two XSS fixes) needs it; it moves to 2.18.1. pnpm 9's audit also reports `handlebars`,
  `underscore`, `ejs` and `pug` (via `nodemailer-mailgun-transport`), refreshed in range. `tedious` (MSSQL driver)
  16.1.0 → 16.7.1, because 16.1's `@azure/msal-node` 1.x declares Node ≤ 18 and fails the Docker build's `pnpm deploy`.
  `NodeJS.Timer` annotations in `sdk/` and `api/src/websocket/` changed to the timer types `@types/node` 22 expects
  (type-only). Audit: 85 → 83 advisories. `isolated-vm` needs `--no-node-snapshot` on Node 20+: `casefusion/cli.js`
  re-launches itself with it, and the api `dev`/`cli` scripts set it in `NODE_OPTIONS`.
- **E2b Remaining security fixes.** The major bumps the audit still lists after E2a and E1: `samlify` 2.10+ (SAML
  behaviour, test against a real IdP), `nodemailer` 7+, `tinypool` 2, `undici` 6, `helmet` 8, `@aws-sdk/*`, and the rest
  of the Security and Server rows above. Exit criterion: `pnpm audit --prod` reports zero high/critical, or each
  remaining one is documented with why it is not exploitable here; then make the CI audit job blocking.
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
