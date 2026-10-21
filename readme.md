<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/casefusion-wordmark-dark.svg" />
    <img alt="CaseFusion" src="brand/casefusion-wordmark.svg" width="420" />
  </picture>
</p>

# CaseFusion

CaseFusion is the skeleton application maintained by [Ona Insights](https://onainsights.io): a GPLv3 fork of
[Directus](https://github.com/directus/directus) (currently based on **10.6.4**), kept current with upstream as versions
convert from BUSL to GPL, and hardened for use as a case-management platform.

Any implementation (UNICEF CFM, UN Women Wasil, …) is built from this core plus custom modules. Those modules are
dedicated intellectual property of Ona Insights or its clients and are **not included in this repository**. On its own,
this repository gives you a working data platform, not a case-management product.

> ⚠️ **Not ready for production yet.** This is Directus 10.6.4's code, and some of its dependencies still have known
> vulnerabilities that need major-version upgrades: as of 20 October 2026, 4 critical and 30 high advisories in the
> API's dependencies (295 advisories when the fork started), and 1 critical and 4 high in the admin app's browser bundle
> (the map and rich-text editor). The remaining upgrades are tracked in [`UPGRADE-PLAN.md`](UPGRADE-PLAN.md); this
> notice will be removed once they land.

## What works out of the box

Everything Directus 10.6.4 provides:

- REST and GraphQL APIs over a SQL database (PostgreSQL, MySQL/MariaDB, SQLite, MS SQL, Oracle, CockroachDB)
- The admin app: collections and fields, items, files, users, roles and permissions, insights dashboards
- Flows (automation), including sandboxed "Run Script" operations (`isolated-vm`)
- Authentication: local, OAuth 2.0, OpenID Connect, SAML, LDAP; two-factor authentication
- File storage on local disk, S3, Azure, Google Cloud Storage, Cloudinary or Supabase
- The extension system (interfaces, displays, layouts, modules, panels, hooks, endpoints, operations)

Differences from upstream: CaseFusion branding, telemetry and the update check are off by default, and dependencies are
being updated for security (see [`UPGRADE-PLAN.md`](UPGRADE-PLAN.md)).

## Running it

Requirements: Node.js 22 and pnpm 9. Start Node with `--no-node-snapshot` (needed by `isolated-vm` for "Run Script" flow
operations): the `casefusion` CLI and the `pnpm dev` / `pnpm cli` scripts do this for you; set it yourself, for example
in `NODE_OPTIONS`, if you start the API another way.

```bash
pnpm install --frozen-lockfile
NODE_OPTIONS=--max-old-space-size=8192 pnpm build

# API (http://localhost:8055) and app, in two terminals
pnpm --filter @directus/api dev
pnpm --filter @directus/app dev
```

The API reads `api/.env`. It needs at least `KEY`, `SECRET`, the database settings (`DB_CLIENT`, …) and `ADMIN_EMAIL` /
`ADMIN_PASSWORD`; the commented list of options is in `api/src/cli/utils/create-env/env-stub.liquid`. Install the system
tables once with `pnpm --filter @directus/api cli bootstrap`.

With Docker (the image defaults to SQLite in `/directus/database`):

```bash
docker build -t casefusion .
docker run -p 8055:8055 -e KEY=... -e SECRET=... -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... casefusion
```

Images are published to `ghcr.io/onainsights/casefusion`: `main` and `sha-<commit>` from the main branch (amd64), and a
version tag plus `latest` for each `casefusion-v<version>` release tag (amd64 and arm64). A manual run of the Docker
image workflow also builds both architectures. (Plain `v<version>` tags are upstream Directus releases.)

## Documentation

The documentation is at [onainsights.github.io/casefusion](https://onainsights.github.io/casefusion/), built from
`docs/`: upstream's Directus 10.6.4 documentation with the product name changed to CaseFusion, so it matches this
codebase (docs.directus.io describes newer Directus releases). Anything about Directus Cloud, licensing or the
marketplace does not apply. Internal names (`directus_*` tables, `@directus/*` packages, env vars, API routes, the
`directus` CLI command) are deliberately unchanged so that extensions and databases stay compatible, so code samples
that use them are correct as written.

## Relationship with upstream

Directus is published under the Business Source License 1.1, and each release converts to GPLv3 three years after it was
released. CaseFusion keeps the full upstream git history and merges each upstream tag only once it has converted. The
calendar and merge procedure are in [`UPSTREAM.md`](UPSTREAM.md): next are 10.7.0 (2026-10-23) and 10.8.0 (2026-11-16);
11.0.0 converts on 2027-08-06.

## Licence

GPLv3; see [`license`](license) and [`LICENSE-NOTICE.md`](LICENSE-NOTICE.md) for why this code is GPL. Original
copyright © 2023 Monospace, Inc.; modifications © 2026 Ona Insights.

CaseFusion is not affiliated with, sponsored by or endorsed by Monospace, Inc. "Directus" is a trademark of Monospace,
Inc.; this fork is distributed under the CaseFusion name. The CaseFusion name and logos are Ona Insights' marks; see
[`brand/`](brand/readme.md).

## Support and contributing

Maintained by Ona Insights on a best-effort basis, with no support commitment for third-party use. Bug reports and pull
requests are welcome; see [`contributing.md`](contributing.md). Report security issues privately as described in
[`security.md`](security.md).
