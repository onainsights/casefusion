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

  | Override                    | Parent that blocks the fix                                        |
  | --------------------------- | ----------------------------------------------------------------- |
  | `request>form-data` → 2.5.6 | `request` 2.88 (via `nodemailer-sendgrid` → `@sendgrid/client` 6) |
  | `request>qs` → 6.16.1       | same                                                              |

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
- **E2b Major-version security fixes (done 2026-10-20, PRs #12, #16–#19, #21, #22).**
  - E2b.1 `undici` 6 (Cloudinary, Supabase drivers). E2b.2 `nodemailer` 10; the SES transport uses SESv2
    (`@aws-sdk/client-sesv2`), same `EMAIL_SES_*` settings; the sending IAM policy must allow the SESv2 send action.
    E2b.3 `sharp` 0.35. E2b.4 TinyMCE 7 (`license_key: 'gpl'`), `unhead` 2, Vue 3.5. E2b.5 `samlify` 2.15 (SAML is
    unused, lightweight check only); `@directus/extensions-sdk` removed from the API's dependencies (unused). `tinypool`
    2 via Dependabot.
  - E2b.6: `argon2` 0.45 and `sqlite3` 6 (no more `node-gyp`/`tar` install chain; password hashes verified compatible
    both ways), `knex` 2.5.1 everywhere, AWS SDK v3.1154 (`@smithy/node-http-handler`; unused
    `@aws-sdk/abort-controller` dropped; the `fast-xml-parser` override is no longer needed), `@azure/storage-blob`
    12.34, `@google-cloud/storage` 7.22 (drops `node-forge`), `stream-json` 3 (fixes prototype pollution in JSON import:
    a `__proto__` key in an imported record could replace the record's prototype), `chokidar` 3.6, `cookie-parser`
    1.4.7, `tmp` 0.2.7, `inquirer` 9.3. The S3, Azure and GCS drivers were run against local emulators (S3Mock, Azurite,
    fake-gcs-server) on old and new SDKs with identical results.
  - Accepted or deferred, with reasons:
    - `braces` (via `chokidar` 3, no fixed release): only matters for attacker-controlled glob patterns; ours are fixed
      paths from server configuration. `chokidar` 4+ drops glob support, which would mean rewriting the extension
      watcher.
    - `request` / `tough-cookie` via `nodemailer-sendgrid` (no fix; `request` is deprecated): SendGrid can be used
      through the SMTP transport instead; replacing the plugin is a feature change.
    - `tedious` 16 → 19+ (MSSQL; moderate advisories in `@azure/identity`, `uuid`, `sprintf-js`): `knex` 2.5's MSSQL
      dialect targets `tedious` 15/16 and no deployment uses MSSQL; revisit with `knex` 3 or a real SQL Server test.
    - The extension build kit (`extensions-sdk`, `create-directus-extension`: `vite` 4, `esbuild`, plugin-terser) and
      the unused `update-check` package: developer tooling, not server code; handled in E5.
  - Status after E2b: API production dependencies 22 distinct advisories (0 critical, 6 high; all in the categories
    above), admin app bundle 1 (`maplibre-gl`, E4).
- **E3 `ldapjs` → `ldapts` (done 2026-10-20, PR #27).** `api/src/auth/drivers/ldap.ts` ported to `ldapts` 8.1.8 (promise
  API, same behaviour). Unix sockets (`client.socketPath`) are not supported by `ldapts` and are now rejected. Pinned to
  8.1.8 because 8.2+ publishes `catalog:` devDependency specs that break pnpm 9's `deploy`. Verified against an OpenLDAP
  test directory, old vs new identical (login, refresh, group → role mapping, profile fields, error codes).
- **E4 `maplibre-gl` 1.15 → 6.15 (done 2026-10-20).** Clears the last browser-bundle critical. The unused `mapbox-gl`
  dependency is removed. Changes: style types renamed (`StyleSpecification`, `LayerSpecification`, ...), namespace
  import (no default export), `getClusterExpansionZoom` returns a promise, the worker is a separate file (`setWorkerUrl`
  with Vite's emitted asset), and every `mapboxgl-*` CSS class in our code is now `maplibregl-*` (MapLibre 2+ dropped
  the Mapbox compatibility classes; the draw plugin's control classes are pointed at MapLibre's). Mapbox tokens are not
  used by any deployment; the Mapbox basemap and geocoder paths compile but are untested. Verified in headless Chromium
  against PostGIS, old vs new: map interface and map layout render identically, tiles load, controls present, drawing a
  point and saving stores the same coordinates.
- **E5 Toolchain (done 2026-10-21).** Scoped to what ships or runs for others; per-package Vitest 0.31 in packages that
  only use it for their own tests stays (dev-only, report-only in the full audit).
  - Extension SDK (published tool for extension authors): `@vitejs/plugin-vue` 5, Vite 6, `esbuild` 0.25,
    `rollup-plugin-esbuild` 6, `@rollup/plugin-terser` 1.0, `inquirer` 9.3 (also in `create-directus-extension`). An
    endpoint and an interface extension built with it load and work in the CaseFusion image.
  - Admin app dev toolchain: Vite 6, `@vitejs/plugin-vue` 5, Vitest 3, `happy-dom` 21 (fixes its RCE advisory),
    `@vue/test-utils` 2.4. 36 snapshot files rewritten by Vitest's new escaping (content verified identical); two tests
    corrected to real-DOM behaviour (cancelable keydown events, string `input.value`).
  - Storybook 7 removed (it does not support Vite 6 and pulled in Babel, webpack and React): `app/.storybook/`, the 41
    `*.stories.ts` files, two scripts and 19 dev dependencies.
  - Integration tests: MinIO images can no longer be pulled, so the `minio` compose service runs S3Mock 5.2.3 with the
    test bucket created at startup; the `minio-mc` helper is gone.
- **E6 Hardening (done 2026-10-21).**
  - Admin app on Vitest 4.1 (its 3.x `tinypool` had two criticals); all app tests pass unchanged.
  - `packages/update-check` and `packages/release-notes-generator` are excluded from the pnpm workspace (unused: the
    update check is disabled and upstream's changesets tooling was removed); the root `@changesets/cli` dependency is
    gone. The files stay in place to keep upstream merges clean.
  - `pnpm dedupe`: 156 duplicate package versions removed.
  - **CI audit is now blocking** for production dependencies at high and above. Accepted advisories are listed in
    `package.json` under `pnpm.auditConfig.ignoreGhsas`, each with its reason here:
    - `GHSA-vfj7-8cjw-p6xm` (`braces`, via `chokidar` 3 in the extension watcher): see E2b; patterns are fixed server
      configuration, not user input.
    - `GHSA-mrhx-c7xc-m3w5` (`zod` 3.22.4; accepted 2026-10-27 after GitHub widened the range to all `<4.6.6` on
      2026-10-23): memory exhaustion only when validating oversized collections that carry size constraints. The one
      untrusted-input use, the WebSocket message schemas in `api/src/websocket/messages.ts`, has no `.max()`, `.min()`
      or `.length()` on arrays or records; the other uses validate extension manifests and server configuration. Remove
      the entry once `zod` is on 4.6.6 or later.
  - The full audit (app bundle, build and test tooling) stays report-only. Status 2026-10-21: production dependencies 9
    distinct advisories (0 critical, 1 high accepted, 7 moderate, 1 low); app browser bundle 0 critical/high; the rest
    is development tooling (Vitest 0.31 in per-package tests, `histoire`, `swagger-ui-watcher`, ...).
- **Phase F working-version gate (done 2026-10-21).** The Docker image of `main` on PostGIS 16 passed a scripted
  25-point check (bootstrap, login, data model, REST and GraphQL CRUD, geometry, file upload and thumbnail, Run Script
  flow, field-level permissions on a restricted role, anonymous access blocked, branding, telemetry off), also with no
  internet access; the admin app contacts only the server and OpenStreetMap tiles. The upstream blackbox suite against
  Postgres found two regressions from Phase E, both fixed:
  - **Query arrays over 20 values.** `qs` 6.14+ (pulled in with Express 4.22) applies its `arrayLimit` of 20 to repeated
    keys, so `filter[id][_in]=1&filter[id][_in]=2&...` with more than 20 values became an object and the filter silently
    matched nothing. `api/src/app.ts` now parses with `arrayLimit: 1000` (qs' own parameter limit, so no new exposure);
    unit test in `api/src/app.test.ts`. The admin app was not affected (it sends filters as JSON).
  - **SAML test fixture.** `samlify` 2.10+ checks the assertion's `Recipient` against the SP's ACS URL; the fixture's SP
    metadata declared a different URL from the one the test IdP posts to. Fixed in `tests/blackbox/common/config.ts`.
    SHA-1 signed assertions (the test IdP uses RSA-SHA1) also fail on hosts whose Node uses a system OpenSSL that
    forbids SHA-1, such as Fedora's; the Docker image and official Node builds accept them.
  - Everything else that failed locally (health `warn`, rate limits, asset transforms, WebSockets) was load on the test
    machine and passed on GitHub's runner. The runner process can stay alive after printing its results; `blackbox.yml`
    now stops it and reads the summary.

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
2. ~~Storybook: keep (and bump to 8) or remove.~~ Removed in E5.
3. ESLint 9 flat config: only if ESLint 8 fails on Node 22.
