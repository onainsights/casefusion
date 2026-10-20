# Security policy

## Reporting a vulnerability

Please report security issues privately, not in a public issue:

- through a [private vulnerability report](https://github.com/onainsights/casefusion/security/advisories/new) on GitHub
  (preferred), or
- by email to [alessandro@onainsights.io](mailto:alessandro@onainsights.io).

Include the affected version or commit, steps to reproduce, and the impact you expect. We aim to acknowledge reports
within five working days and will keep you informed while we work on a fix. We credit reporters in the advisory unless
you ask us not to.

Please give us a reasonable time to fix the issue before disclosing it publicly, and do not access or modify data that
is not yours while testing.

## Supported versions

Only the latest commit on `main` receives security fixes.

## Issues that also affect Directus

CaseFusion is based on an older Directus release. If the issue is also present in the current Directus release, please
report it to Directus as well, through
[their security advisories](https://github.com/directus/directus/security/advisories/new). Known upstream advisories
that apply to our base version are tracked as part of [`UPGRADE-PLAN.md`](UPGRADE-PLAN.md).
