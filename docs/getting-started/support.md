---
description: How to get support for your CaseFusion project.
readTime: 4 min read
---

# Help & Support

> CaseFusion is maintained by [Ona Insights](https://onainsights.io/) on a best-effort basis, with no support commitment
> for third-party use.

## Troubleshooting Steps

If you're experiencing issues or think you have found a problem in CaseFusion, follow these steps before reporting a
bug:

1. Ensure your server and database meet the [minimum requirements](/self-hosted/docker-guide#supported-databases).
2. Ensure you’re on the [latest version](https://github.com/onainsights/casefusion/releases) of CaseFusion.
3. Stop `CTRL+C` and restart the server `npx directus start`.
4. Run the database migration script: `directus database migrate:latest`\
   _Note: backup your database first._
5. Disable any data-caching within your project.
6. Test any app issues with both browser extensions and caching disabled _(i.e. Incognito Mode)_.
7. Confirm the issue is not related to your own custom code.
8. Check for [existing issues](https://github.com/onainsights/casefusion/issues) that match your problem.

## Reporting Bugs

Open an issue on [GitHub](https://github.com/onainsights/casefusion/issues) with the steps to reproduce the problem.
Pull requests are welcome; see the
[contributing guide](https://github.com/onainsights/casefusion/blob/main/contributing.md).

Report security issues privately, never in a public issue: see the
[security policy](https://github.com/onainsights/casefusion/blob/main/security.md).

<!-- rebrand-docs: off -->

## Upstream Directus

CaseFusion is a fork of Directus 10.6.4. The Directus community and Monospace, Inc.'s commercial support cover Directus,
not CaseFusion, and newer Directus releases differ from this codebase.

<!-- rebrand-docs: on -->

## Frequently Asked Questions

### Does CaseFusion support Mongo/NoSQL?

No. CaseFusion is built specifically for wrapping _relational_ databases.
