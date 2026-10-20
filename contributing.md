# Contributing

CaseFusion is maintained by Ona Insights on a best-effort basis. Bug reports and pull requests are welcome.

## What fits here

This repository is the CaseFusion core: a GPLv3 fork of Directus that tracks upstream as releases convert from BUSL to
GPL (see [`UPSTREAM.md`](UPSTREAM.md)). Changes we accept:

- security fixes and dependency updates (see [`UPGRADE-PLAN.md`](UPGRADE-PLAN.md));
- bug fixes;
- build, CI and documentation improvements;
- CaseFusion branding.

New features usually belong in an extension rather than in the core, because every change to upstream code becomes a
merge conflict the next time we merge an upstream release. If you want a core feature, open an issue first.

**Do not copy code from Directus releases that are still under BUSL**, i.e. any version newer than the latest converted
tag listed in `UPSTREAM.md`. That includes porting a fix by hand from a newer upstream commit. Reimplement it
independently or wait for the release to convert.

## Development

Requirements: Node.js 22 and pnpm 9.

```bash
pnpm install --frozen-lockfile
NODE_OPTIONS=--max-old-space-size=8192 pnpm build
pnpm lint
pnpm test
```

Run the API with `pnpm --filter @directus/api dev` and the app with `pnpm --filter @directus/app dev`; see the
[readme](readme.md#running-it). The integration suite (`pnpm test:blackbox`) needs Docker.

Internal names stay as upstream's (`directus_*` tables, `@directus/*` packages, env vars, API routes) so that databases,
extensions and upstream merges keep working. Please do not rename them.

## Pull requests

- Keep each pull request to one change, with tests where it changes behaviour.
- Run `pnpm lint`, `pnpm format` and the unit tests for the workspaces you touched.
- Do not edit `pnpm-lock.yaml` by hand; let pnpm regenerate it.
- Sign off every commit (`git commit -s`) to certify the
  [Developer Certificate of Origin](https://developercertificate.org/): that you wrote the change or have the right to
  submit it under the project's licence.

Contributions are accepted under the licence of the files they change: GPLv3 for most of the repository, MIT for the
workspaces that are MIT (each workspace has its own `license` file). There is no contributor licence agreement.

## Security issues

Do not open a public issue. See [`security.md`](security.md).

## Conduct

Everyone taking part is expected to follow the [code of conduct](code_of_conduct.md).
