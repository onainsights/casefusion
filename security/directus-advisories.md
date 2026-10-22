# Directus advisories affecting the base

CaseFusion is based on Directus **v10.6.4**. This register lists every Directus security advisory whose affected range
includes 10.6.4, whether it applies to our code, how to mitigate it until it is fixed, and how it gets fixed.

Upstream fixes are in BUSL-licensed releases and only become usable when each tag converts (`UPSTREAM.md`). Until then
we write our own fixes from the public advisory text only: never open, copy or diff upstream code for these fixes. Each
fix PR cites the GHSA ID and adds a regression test.

Source: `gh api repos/directus/directus/security-advisories`, filtered on the `vulnerable_version_range` of `directus`,
`@directus/api` and `@directus/app`. Last checked: 2026-10-22 (49 advisories). Applicability was assessed by reading our
code; it is confirmed by the regression test in each fix PR.

## Status values

- **Applies**: the vulnerable code path exists in our tree with default settings.
- **Feature**: applies only when the named feature or setting is enabled.
- **Partial**: part of the advisory applies; the note says which.
- **No**: does not apply to our code (reason given).
- **Fixed**: fixed in CaseFusion (PR linked).

Priority **P1** is reachable without logging in, or lets a normal user read data their role should not see. P1 items are
fixed before anything else.

## Register

| GHSA                                                                | Sev      | Area                                               | Status  | Mitigation until fixed                                                     | Fix       |
| ------------------------------------------------------------------- | -------- | -------------------------------------------------- | ------- | -------------------------------------------------------------------------- | --------- |
| [2xcm-7h22-3m66](https://github.com/advisories/GHSA-2xcm-7h22-3m66) | medium   | Update/delete by query evaluates filters unchecked | Applies | Reject a `query` key in `PATCH`/`DELETE` bodies at ingress                 | P1, code  |
| [gwvv-rr68-cmv6](https://github.com/advisories/GHSA-gwvv-rr68-cmv6) | high     | Prototype pollution via `deep`                     | Applies | Reject `deep` keys named after `Object.prototype` members (query and body) | P1, code  |
| [38hg-ww64-rrwc](https://github.com/advisories/GHSA-38hg-ww64-rrwc) | high     | Concealed fields via aggregates                    | Applies | Limit `directus_users` read to the user's own row                          | P1, code  |
| [p8v3-m643-4xqx](https://github.com/advisories/GHSA-p8v3-m643-4xqx) | medium   | Redacted data via `alias`                          | Applies | Limit `directus_users` read to the user's own row                          | P1, code  |
| [7wq3-jr35-275c](https://github.com/advisories/GHSA-7wq3-jr35-275c) | medium   | `search` enumerates non-permitted fields           | Applies | Keep sensitive columns in collections the public role cannot read          | P1, code  |
| [8jpw-gpr4-8cmh](https://github.com/advisories/GHSA-8jpw-gpr4-8cmh) | medium   | Concealed fields searchable                        | Applies | Limit `directus_users` read to the user's own row                          | P1, code  |
| [p623-wgx3-wxp8](https://github.com/advisories/GHSA-p623-wgx3-wxp8) | medium   | Side effects before permission checks              | Partial | Flows and users parts apply; shares part does not                          | P1, code  |
| [7cvf-pxgp-42fc](https://github.com/advisories/GHSA-7cvf-pxgp-42fc) | medium   | Manual-trigger flows lack permission checks        | Applies | No manual-trigger flows, or a first Condition step requiring a user        | P1, code  |
| [g293-vf99-xv36](https://github.com/advisories/GHSA-g293-vf99-xv36) | high     | GraphQL alias amplification (system)               | Applies | Block anonymous `/graphql/system` at ingress                               | code      |
| [6q22-g298-grjh](https://github.com/advisories/GHSA-6q22-g298-grjh) | high     | GraphQL alias amplification (health)               | Applies | Block anonymous `/graphql/system` at ingress                               | code      |
| [ph52-67fq-75wj](https://github.com/advisories/GHSA-ph52-67fq-75wj) | medium   | GraphQL query cost                                 | Applies | Smaller request body limit, `QUERY_LIMIT_MAX`                              | code      |
| [ff8w-8crv-9rcf](https://github.com/advisories/GHSA-ff8w-8crv-9rcf) | medium   | Unbounded GraphQL documents over WebSocket         | Feature | `WEBSOCKETS_ENABLED=false` (default) or `WEBSOCKETS_GRAPHQL_ENABLED=false` | code      |
| [cf45-hxwj-4cfj](https://github.com/advisories/GHSA-cf45-hxwj-4cfj) | medium   | Open redirect in OAuth2/SAML flow                  | Feature | No SSO providers, or reject off-origin `redirect`/`RelayState` at ingress  | code      |
| [3573-4c68-g8cc](https://github.com/advisories/GHSA-3573-4c68-g8cc) | medium   | Open redirect in SAML                              | Feature | As above                                                                   | code      |
| [jgf4-vwc3-r46v](https://github.com/advisories/GHSA-jgf4-vwc3-r46v) | high     | SSO user enumeration                               | Feature | `AUTH_DISABLE_DEFAULT=true` when SSO is the only login                     | code      |
| [cff8-x7jv-4fm8](https://github.com/advisories/GHSA-cff8-x7jv-4fm8) | high     | SSO session cached                                 | Feature | `CACHE_ENABLED=false` (default)                                            | code      |
| [jr94-gj3h-c8rf](https://github.com/advisories/GHSA-jr94-gj3h-c8rf) | medium   | User enumeration via password reset                | Applies | Rate limiter on                                                            | code      |
| [2ccr-g2rv-h677](https://github.com/advisories/GHSA-2ccr-g2rv-h677) | low      | Session token in URL                               | Applies | `Referrer-Policy: same-origin`, scrub `access_token` from proxy logs       | code      |
| [vw58-ph65-6rxp](https://github.com/advisories/GHSA-vw58-ph65-6rxp) | medium   | Query-string token in logs                         | Feature | Keep `LOG_STYLE` unset (pretty); applies with `raw`                        | code      |
| [rmjh-cf9q-pv7q](https://github.com/advisories/GHSA-rmjh-cf9q-pv7q) | medium   | Version disclosure                                 | Applies | Block `/server/specs/*` for anonymous callers at ingress                   | code      |
| [wxwm-3fxv-mrvx](https://github.com/advisories/GHSA-wxwm-3fxv-mrvx) | medium   | GraphQL SDL despite introspection off              | Feature | Applies with `GRAPHQL_INTROSPECTION=false`; block `/server/specs/graphql`  | code      |
| [8m32-p958-jg99](https://github.com/advisories/GHSA-8m32-p958-jg99) | high     | Missing Cross-Origin-Opener-Policy                 | Applies | Proxy adds `Cross-Origin-Opener-Policy: same-origin`                       | config    |
| [393c-p46r-7c95](https://github.com/advisories/GHSA-393c-p46r-7c95) | high     | File API access control                            | Partial | Leave `filename_disk` out of role field permissions                        | code      |
| [3fff-gqw3-vj86](https://github.com/advisories/GHSA-3fff-gqw3-vj86) | medium   | IDOR via path presets                              | Applies | None by configuration                                                      | code      |
| [pmf4-v838-29hg](https://github.com/advisories/GHSA-pmf4-v838-29hg) | medium   | Privilege escalation via shares                    | Feature | No `directus_shares` create/update for non-admin roles                     | code      |
| [7h45-q5jx-7r87](https://github.com/advisories/GHSA-7h45-q5jx-7r87) | medium   | Share update reassigns creator/role                | Feature | As above                                                                   | code      |
| [mvv8-v4jj-g47j](https://github.com/advisories/GHSA-mvv8-v4jj-g47j) | medium   | Sensitive fields in revisions                      | Partial | No `directus_revisions` read for non-admins                                | code      |
| [9x5g-62gj-wqf2](https://github.com/advisories/GHSA-9x5g-62gj-wqf2) | medium   | Permissions kept for deleted fields                | Applies | Remove a field's permissions before deleting it                            | code      |
| [x3vm-88hf-gpxp](https://github.com/advisories/GHSA-x3vm-88hf-gpxp) | medium   | User data in hook/flow logs                        | Applies | `LOG_LEVEL=warn`; flows not logging full accountability                    | code      |
| [f24x-rm6g-3w5v](https://github.com/advisories/GHSA-f24x-rm6g-3w5v) | medium   | Tokens in flow logs                                | Partial | Most redaction already present; flows admin-only                           | code      |
| [5h38-6755-g83w](https://github.com/advisories/GHSA-5h38-6755-g83w) | medium   | Path traversal in mail templates                   | Applies | Flows admin-only                                                           | code      |
| [c6w9-5g5j-jh2p](https://github.com/advisories/GHSA-c6w9-5g5j-jh2p) | high     | Unsegmented response cache                         | Feature | `CACHE_ENABLED=false` (default)                                            | code      |
| [wv3h-5fx7-966h](https://github.com/advisories/GHSA-wv3h-5fx7-966h) | high     | SSRF via IPv4-mapped IPv6 in file import           | Applies | Block `POST /files/import` at ingress, egress firewall                     | code      |
| [j5h6-vqc3-phqh](https://github.com/advisories/GHSA-j5h6-vqc3-phqh) | high     | SSRF via `0.0.0.0` in file import                  | Partial | As above (literal `0.0.0.0` already blocked)                               | code      |
| [68g8-c275-xf2m](https://github.com/advisories/GHSA-68g8-c275-xf2m) | medium   | SSRF loopback filter bypass                        | Applies | As above; `IMPORT_IP_DENY_LIST` matches exact addresses, not ranges        | code      |
| [7vcx-mhxq-9j96](https://github.com/advisories/GHSA-7vcx-mhxq-9j96) | high     | Image transform dimensions DoS                     | Applies | `ASSETS_TRANSFORM_IMAGE_MAX_DIMENSION` low; transforms set to presets      | code      |
| [j8xj-7jff-46mx](https://github.com/advisories/GHSA-j8xj-7jff-46mx) | medium   | S3 assets after malformed transforms               | Feature | S3 storage only; transforms set to presets                                 | code      |
| [rv78-qqrq-73m5](https://github.com/advisories/GHSA-rv78-qqrq-73m5) | medium   | S3 assets after HEAD burst                         | Feature | S3 storage only; rate limiter on                                           | code      |
| [xw72-c69j-h2rj](https://github.com/advisories/GHSA-xw72-c69j-h2rj) | high     | Argon2 hash utility DoS                            | Applies | Block `/utils/hash/*` at ingress                                           | code      |
| [chfm-g7r3-vv42](https://github.com/advisories/GHSA-chfm-g7r3-vv42) | high     | SQL injection via geometry type (PostGIS)          | Feature | PostGIS only, admin only; least-privilege database role                    | code      |
| [vv2v-pw69-8crf](https://github.com/advisories/GHSA-vv2v-pw69-8crf) | medium   | Stored XSS                                         | Feature | Block Editor fields only; keep the default CSP                             | code      |
| [788p-cvgf-q973](https://github.com/advisories/GHSA-788p-cvgf-q973) | medium   | Stored XSS via project colour favicon              | Applies | Default CSP blocks execution; settings writes admin-only                   | code      |
| [9qrm-48qf-r2rw](https://github.com/advisories/GHSA-9qrm-48qf-r2rw) | low      | DOM XSS via `layout_options`                       | Applies | Default CSP; users can only write their own presets                        | code      |
| [97xr-jchp-xm3c](https://github.com/advisories/GHSA-97xr-jchp-xm3c) | critical | WebSocket access after failed auth                 | No      | Each message re-resolves a missing identity to the public role             | hardening |
| [qqmv-5p3g-px89](https://github.com/advisories/GHSA-qqmv-5p3g-px89) | high     | TUS upload overwrite                               | No      | No TUS uploads in 10.6.4                                                   | none      |
| [qw9g-7549-7wg5](https://github.com/advisories/GHSA-qw9g-7549-7wg5) | high     | MySQL accent-insensitive email match               | No      | MySQL only; we support Postgres                                            | none      |
| [cph6-524f-3hgr](https://github.com/advisories/GHSA-cph6-524f-3hgr) | medium   | Collection existence leak                          | No      | Both cases return the same 403                                             | none      |
| [632p-p495-25m5](https://github.com/advisories/GHSA-632p-p495-25m5) | high     | Random string util soft-lock                       | No      | Our upgraded `nanoid` cannot reach the broken state                        | none      |
| [q75c-4gmv-mg9x](https://github.com/advisories/GHSA-q75c-4gmv-mg9x) | medium   | Open redirect on 2FA setup                         | No      | Redirect stays inside the app                                              | hardening |

## Deployment baseline

Settings that mitigate several rows above. They belong in every client deployment until the code fixes land:

- `WEBSOCKETS_ENABLED=false`, `CACHE_ENABLED=false` (both defaults; do not change them)
- `RATE_LIMITER_ENABLED=true`
- `ASSETS_TRANSFORM_IMAGE_MAX_DIMENSION` set low, and transforms limited to presets
- ingress: block `POST /files/import`, `/utils/hash/*`, anonymous `/graphql/system` and `/server/specs/*`; add
  `Cross-Origin-Opener-Policy: same-origin` and `Referrer-Policy: same-origin`
- egress: the API container cannot reach the metadata service or other internal hosts except its database, cache and
  mail
- roles: no `directus_shares` or `directus_revisions` access for non-admins; `directus_users` read limited to the user's
  own row

## Keeping it current

Re-run the source query when Directus publishes new advisories, add new rows, and update **Status** and **Fix** as PRs
merge. When a fix's upstream tag converts and is merged, note the tag and drop our version if it differs.
