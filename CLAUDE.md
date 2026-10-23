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
  `directus`), `sdk/`, `packages/*`, `tests/**`. `docs/` is not a workspace: it is the documentation site (VitePress),
  with its own lockfile, published to https://onainsights.github.io/casefusion/ by `.github/workflows/docs.yml`.
- **Backend:** Node.js + TypeScript, Express 4, Knex 2.5, Pino 8, under `api/`
- **Frontend:** Vue 3.5 + Vite 6 + Pinia + vue-i18n, under `app/`; Ona Insights brand theme (`brand/readme.md`)
- **Tests:** Vitest per workspace (4.1 in `app/`, 0.31 elsewhere); integration suite in `tests/blackbox` (Vitest, Docker
  DB matrix; CI workflow `blackbox.yml`, Postgres, run by hand)
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
- **Docs: rebrand the product name, keep the content.** `scripts/rebrand-docs.mjs` replaces "Directus" with "CaseFusion"
  in prose (not code, URLs, Directus Cloud or the trademark notices); run it after every upstream merge, CI checks it.
  Otherwise only the site config and theme (`docs/.vitepress/`) are ours; keep page content as upstream wrote it so
  merges stay clean.
- **Security first, then our own features.** Advisory fixes and dependency work come before features. Features are
  allowed: build them in new files or a new workspace package where possible, off by default behind env settings, with
  tests and a page in the docs. When a converted upstream release brings an overlapping feature, decide whether to keep
  ours or migrate to upstream's, and record the decision in `UPSTREAM.md`.
- **Clean room.** Never open, copy or diff upstream's BUSL code (newer commits in local history included), whether for a
  fix or a feature. Work from public advisory text and public documentation only. Each advisory fix
  (`security/directus-advisories.md`) cites the GHSA and adds a regression test.
- **Keep the upstream diff small.** Every touched upstream file is a future merge conflict. Prefer config, env defaults
  and new files over edits to upstream code.
- **One phase or step per PR**, with the verification gate in `UPGRADE-PLAN.md` run before merging.
- **Never hand-edit `pnpm-lock.yaml`.** Let pnpm regenerate it.
- **Preserve copyright.** `Copyright © 2023 Monospace, Inc.` stays wherever it appears.
- **Licence fields.** Every workspace that was BUSL-1.1 is GPL-3.0-only (`package.json` and its `license` file); MIT
  packages stay MIT. Upstream merges re-add BUSL: after each merge, `git grep -n BUSL -- '*package.json' '*license'`
  must come back empty.

## Known landmines

Resolved in Phase E (see `UPGRADE-PLAN.md`); do not undo them:

- **LDAP** uses `ldapts` 8.1.8 (`api/src/auth/drivers/ldap.ts`). 8.2+ publishes `catalog:` devDependency specs that
  break `pnpm deploy` (the Docker build); stay on 8.1.x until pnpm is upgraded.
- **Maps** use `maplibre-gl`. Never bring back `mapbox-gl` 2+ (proprietary, GPL incompatible). Mapbox-specific basemaps
  are not supported (no client uses a Mapbox token).
- **SAML** uses `samlify` 2.15, which checks the assertion's `Recipient` against the SP's ACS URL. SHA-1 signed
  assertions fail on hosts whose Node uses a system OpenSSL that forbids SHA-1 (Fedora's default crypto policy); the
  Docker image and the official Node builds are fine.
- **Telemetry** (`api/src/utils/telemetry.ts`) and the update check call Monospace services; they must default off.
- **Production audit is blocking** in CI at high and above. An accepted advisory goes in `package.json`
  (`pnpm.auditConfig.ignoreGhsas`) with its reason in `UPGRADE-PLAN.md`.

Still true:

- `isolated-vm` (Run Script operation, `api/src/operations/exec/`) is a native module: it must be rebuilt for each Node
  major, and Node 20+ must run with `--no-node-snapshot`.
- Per-package tests outside `app/` still run Vitest 0.31 (development tooling only; report-only in the audit).
- The blackbox runner (`pnpm test:blackbox`) can stay alive after printing its results; stop it once "Tests complete"
  appears. Run it on an otherwise idle machine: under load, timing-sensitive tests (health, rate limits, asset
  transforms, WebSockets) fail.
