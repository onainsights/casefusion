# Upstream relationship

CaseFusion is a fork of [Directus](https://github.com/directus/directus) that keeps the full upstream git history. We
only ever merge upstream **tags whose BUSL-1.1 Change Date has passed**, at which point that version is licensed under
GPLv3 (see `LICENSE-NOTICE.md`).

- Current base: **Directus v10.6.4** (released 2023-10-20, GPLv3 since 2026-10-20).
- Upstream remote: `upstream = https://github.com/directus/directus` (fetch only, push disabled).

## Licence rule

Directus 10.x and 11.x are BUSL-1.1 with "Change Date: three years from release date". A version becomes GPLv3 on the
third anniversary of its release. Anything newer stays BUSL and **must not** be merged, cherry-picked, copied or pushed
to this repository before its date.

The local clone contains upstream history beyond the current base (BUSL-era commits). Therefore:

- Push only `main` and our own branches: `git push origin main`. Never `git push --tags` or `--mirror`.
- Push a tag only by name, and only for a tag that has converted: `git push origin v10.7.0`.
- Never `git cherry-pick` an upstream commit that is not reachable from a converted tag.

## Conversion calendar

Dates are the upstream release dates plus three years. Before merging, confirm the release date on the
[upstream releases page](https://github.com/directus/directus/releases) (the date of the GitHub release is
authoritative, not the commit date).

| Upstream tag | Released   | GPLv3 from | Notes                                       |
| ------------ | ---------- | ---------- | ------------------------------------------- |
| v10.6.4      | 2023-10-20 | 2026-10-20 | Current base                                |
| v10.7.0      | 2023-10-23 | 2026-10-23 | First merge; proves the procedure           |
| v10.7.2      | 2023-11-02 | 2026-11-02 | Last 10.7 patch                             |
| v10.8.0      | 2023-11-16 | 2026-11-16 |                                             |
| v10.8.3      | 2023-12-21 | 2026-12-21 | Last 10.8 patch                             |
| v10.9.3      | 2024-02-23 | 2027-02-23 | Last 10.9 patch                             |
| v10.10.0     | 2024-03-05 | 2027-03-05 | Extension host `^10.10.0` becomes reachable |
| v11.0.0      | 2024-08-06 | 2027-08-06 | Major; plan separately                      |
| v10.13.4     | 2024-12-02 | 2027-12-02 | Last 10.x release                           |

Intermediate patch tags (v10.7.1, v10.8.1, …) convert on their own dates; it is fine to skip them and merge the latest
converted patch of a minor.

## Merge procedure

```bash
# 1. Fetch upstream tags (local only; never pushed wholesale)
git fetch upstream --tags

# 2. Confirm the tag has converted: today >= release date + 3 years
git log -1 --format=%cs v10.7.0     # cross-check against the GitHub release date

# 3. Merge on a branch
git switch -c merge/v10.7.0 main
git merge --no-ff v10.7.0 -m "Merge upstream v10.7.0 (GPLv3 since 2026-10-23)"

# 4. Resolve conflicts. Expected only in files we deliberately changed:
#    branding, readme/notice/licence files, package.json "license" fields,
#    telemetry/update-check defaults, .github/, Dockerfile, deps we bumped.
#    Files we deleted (upstream workflows, issue templates, crowdin.yml, cla.md,
#    contributors.yml, .changeset/) come back as modify/delete conflicts:
#    keep them deleted with `git rm`.
#    For pnpm-lock.yaml: take ours/theirs for package.json files first, then
#    `pnpm install` to regenerate the lockfile. Never hand-edit it.

# 5. Re-apply invariants
git grep -n BUSL -- '*package.json' '*license'   # must be empty (upstream re-adds it; CI checks too)
git grep -nE "telemetry.directus.io"    # must be empty

# 6. Verify (same gate as every phase)
pnpm install --frozen-lockfile && pnpm build && pnpm lint && pnpm test

# 7. Update this file and LICENSE-NOTICE.md ("Current base"), open a PR, merge, then:
git push origin main
git push origin v10.7.0
```

`git merge-base main <tag>` must equal the tag after the merge, which proves upstream history is preserved.
