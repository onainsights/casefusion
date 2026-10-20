# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

CaseFusion is the skeleton application maintained by Ona Insights: a **GPLv3 fork of Directus**, currently based on
upstream **v10.6.4** (released 2023-10-20, GPLv3 since 2026-10-20). Client implementations are built from this core plus
private custom modules that are **not** in this repository.

- `LICENSE-NOTICE.md`: why this code is GPLv3, trademark position.
- `UPSTREAM.md`: conversion calendar and the merge procedure for new upstream tags.
- `UPGRADE-PLAN.md`: security and modernisation plan; consult before any dependency change.

The repository keeps full upstream git history. `upstream` is a fetch-only remote.

## Stack

- **Monorepo:** pnpm workspaces (`pnpm-workspace.yaml`): `api/`, `app/`, `casefusion/` (CLI entry, bins `casefusion` and
  `directus`), `sdk/`, `packages/*`, `tests/**`. `docs/` is not a workspace: it is kept as upstream reference text and
  never installed or built.
- **Backend:** Node.js + TypeScript, Express 4, Knex 2.5, Pino 8, under `api/`
- **Frontend:** Vue 3.3 + Vite 4 + Pinia + vue-i18n, under `app/`
- **Tests:** Vitest per workspace; integration suite in `tests/blackbox` (Vitest, Docker DB matrix)
- **Currently pinned:** Node `>=22`, pnpm 9.15, TypeScript 5.2.2. `--no-node-snapshot` is required for `isolated-vm`
  (`casefusion/cli.js` re-launches with it; the api `dev`/`cli` scripts set it).

## Commands

```bash
pnpm install --frozen-lockfile     # clean install
pnpm build                         # build all workspaces except docs
pnpm lint                          # eslint
pnpm format                        # prettier --check
pnpm test                          # unit tests (all workspaces except blackbox)
pnpm test:blackbox                 # integration tests (requires Docker)
pnpm --filter @directus/api dev    # API in dev mode
pnpm --filter @directus/app dev    # app in dev mode
pnpm --recursive exec tsc --noEmit # typecheck only
```

## Working rules

- **Never push BUSL code.** Local history contains upstream commits newer than the base. Push `main` and our branches by
  name only; never `git push --tags` or `--mirror`; merge only converted tags (`UPSTREAM.md`).
- **Rebrand what a user sees, not what code depends on.** Change product name, logos, README, image name, docs links. Do
  **not** rename `directus_*` tables, cookies, env var names, API routes, `@directus/*` package names or extension type
  strings: that breaks databases, extensions and upstream merges.
- **Keep `docs/` as upstream.** It is reference documentation; do not rebrand it.
- **Security first, features never.** Dependency and tooling changes only. The one allowed behaviour change is disabling
  phone-home (telemetry, update check) by default.
- **Keep the upstream diff small.** Every touched upstream file is a future merge conflict. Prefer config, env defaults
  and new files over edits to upstream code.
- **One phase or step per PR**, with the verification gate in `UPGRADE-PLAN.md` run before merging.
- **Never hand-edit `pnpm-lock.yaml`.** Let pnpm regenerate it.
- **Preserve copyright.** `Copyright © 2023 Monospace, Inc.` stays wherever it appears.
- **Licence fields.** Every workspace that was BUSL-1.1 is GPL-3.0-only (`package.json` and its `license` file); MIT
  packages stay MIT. Upstream merges re-add BUSL: after each merge, `git grep -n BUSL -- '*package.json' '*license'`
  must come back empty.

## Known landmines

- **`ldapjs` 2.3.3** (`api/src/auth/drivers/ldap.ts`) is decommissioned upstream; replace with `ldapts`.
- **`mapbox-gl` 1.13.3** is the last BSD-licensed Mapbox release. Never bump to 2.x (proprietary, GPL incompatible).
  Migration target is `maplibre-gl`.
- **`samlify` 2.8.10** has CVE-2024-45389 (signature wrapping); bump to 2.10+.
- **`@aws-sdk/abort-controller`** is deprecated; use native `AbortController` in `packages/storage-driver-s3`.
- **Telemetry** (`api/src/utils/telemetry.ts`) and `packages/update-check` call Monospace services; they must default
  off.
- `isolated-vm` (Run Script operation, `api/src/operations/exec/`) is a native module: it must be rebuilt for each Node
  major, and Node 20+ must run with `--no-node-snapshot`.
