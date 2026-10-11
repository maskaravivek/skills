---
name: mac-space-cleanup
description: Reclaim macOS storage using Mole plus Docker, package caches, build artifacts and stale development workspaces. Use when the user asks to clean their Mac or recover disk space; also supports read-only storage diagnosis.
---

# Mac Space Cleanup

Recover as much authorized, disposable storage as practical, carry cleanup through completion, and report the measured result. Mole is one component, not the entire workflow. Do not stop after listing candidates when the user asked to clean.

## Setup

For first-time setup or missing configuration, read [readme.md](readme.md). `python3 scripts/setup.py --dry-run` detects available tools and previews the local profile. Run setup with the user's chosen Android roots and emulator when setup is requested. It preserves existing profile fields; specify `--install-mole` only when the user authorizes installing Mole. Do not install Docker or unrelated ecosystems just because cleanup tools are absent. If setup is unnecessary, proceed directly to the workflow.

## Scope and authorization

A cleanup request authorizes removal of regenerable package/download caches, unused Docker images/build cache, and disposable generated outputs in idle projects. Execute these without repeatedly asking permission. An audit or dry-run request is read-only. Creating this skill alone does not authorize running cleanup.

Whole repositories, worktrees with unique work, Docker volumes/container data, databases, editor/chat history, personal files, and model downloads need the user's applicable authorization or evidence that they are disposable. Complete independent cleanup before asking about remaining data. Group any necessary questions around measured high-value candidates, rather than requesting permission for every command.

Follow explicit exclusions and deletions. If the user says an entire named workspace folder is unnecessary and asks to skip activity checks, remove that exact folder without re-asking or performing those checks. That exception does not extend to other folders or future newly created work.

## Portable defaults and local preferences

**Always leave iCloud untouched during cleanup.** Do not delete, evict downloads, hydrate files, change syncing, or change iCloud settings. Exclude iCloud Drive/Mobile Documents/FileProvider-backed iCloud paths from Mole and custom deletion targets, including paths reached through aliases or symlinks. If a Mole operation cannot honor this exclusion, skip that portion and use scoped native tools. Metadata-only size inspection is permitted when useful. Keep cleanup logs and reports outside iCloud too; if the current workspace is cloud-backed, use a local temporary/output directory.

**Retain only Android SDK packages required by the selected projects and one usable emulator.** Derive versions from current manifests and dependency/plugin version catalogs each run; do not retain merely the numerically newest version or hardcode the versions from a previous cleanup. Preserve distinct pinned NDK/Build Tools versions when different apps need them, plus required supporting tools. Use the Android procedure in the recipes.

If present, read `${XDG_CONFIG_HOME:-$HOME/.config}/mac-space-cleanup/profile.json` for local preferences. The profile stays outside the shared skill and must not be bundled when sharing. It can specify `android_projects` (a list of Android project-root paths) and `preferred_avd` (an existing AVD name). Expand `~` against the current home, resolve paths, and inspect the listed projects. An absent profile is normal: use the current user's named projects/current workspace; when project scope is unclear, clean independent caches and clarify project roots before SDK removal. A profile configures cleanup scope, but an audit remains read-only.

Keep the shared files free of usernames, local absolute paths, private project names, historical cleanup totals and one-time deletion authorizations. User instructions can update the defaults; do not silently widen the configured project scope.

## Measure, then target the largest areas

1. Discover the actual host, user, installed Mole version, Docker context and available package tools. Use `Path.home()` or `$HOME`; do not hardcode another user's home. Discover real project roots from local preferences, the current workspace and manifests; include hidden agent workspace roots rather than only conventional `~/Projects` folders.
2. Save a before snapshot with `python3 scripts/storage_snapshot.py --output <run-dir>/before.json` (resolve script relative to this skill). The script is read-only. Use the same container for the after comparison.
3. Read [cleanup-recipes.md](references/cleanup-recipes.md) for tool-specific commands and gaps. Start with fast inventories and focused `du -x -k -d 1` scans, then drill into the largest paths. Check existing `du` processes before launching scans. Avoid overlapping full-home/Data/projects/Library scans; use one traversal with saved output where possible. Do not recursively audit every small cache before taking action on known large candidates.
4. Capture errors and distinguish unreadable locations from zero usage. Directory sizes overlap their child rows. Sparse file logical size, APFS clone allocation and `du` totals do not equal guaranteed recovered bytes. VM disks require allocated-size measurements. Time Machine snapshots and swap are separate from project files.

## Clean in useful order

- Preview Mole `clean` and `purge` targets. Inspect significant unfamiliar targets, then run supported cleanup within scope. Mole's project roots may need explicit configuration; changing that persistent config is optional and should be stated. Follow installed behavior, not assumptions about a newer release.
- Clean unused Docker images/build cache on the local daemon. For maximum reclamation, clean each relevant local builder cache, not just one selected builder. Preserve running workloads, persisted volumes and valuable stopped-container data unless removal is authorized.
- Clean large package caches and generated outputs in idle projects. Include Yarn/npm/pnpm, Python/uv, Gradle, Homebrew, VS Code/Cursor update downloads and project .next/build caches when present. Prefer native cleanup commands. Avoid deleting the same cache twice through Mole and another tool.
- Review stale agent/CI workspaces and Git worktrees missed by Mole. Prune nonexistent Git registrations. For otherwise disposable worktrees, retain unique commits and changed files before removal unless the user explicitly authorizes discarding them. Use managed worktree APIs for managed Codex checkouts, and Git commands for ordinary worktrees.
- Prune obsolete Android packages/emulators using the configured project requirements and one-emulator policy. Continue with large conditional candidates: Conda environments, models, installer files and abandoned temporary VM/browser copies. Re-check relevance and use native managers where practical. Missing tools should lead to a scoped alternative or a recorded skip, not an unsolicited install/update.

For direct deletion, resolve the exact intended target, reject unexpected symlinks, and ensure it is neither `/`, the home directory, nor an unintended ancestor. Use bounded, disjoint deletion workers (e.g. four) for millions of dependency files if sequential removal is too slow. If interrupted, finish and verify the partial deletion. Do not silently widen the path or follow links. Never use a bulk-delete helper as a substitute for deciding the scope.

Use Mole previews as discovery, not proof that all listed data is expendable. Do not use auto-whitelisting, disable macOS protection, change privacy permissions, stop active development services, reboot, or manipulate raw swap/APFS system files to maximize the number. A restart recommendation may explain transient swap; it is not recovered storage until performed and measured.

## Finish and verify

Wait for deletion/prune commands to complete. Verify removed paths are absent, native inventories changed, protected paths remain where relevant, and all errors are resolved or reported. Collect `after.json` with the snapshot helper. Calculate net recovered bytes from the same APFS container's free capacity; report decimal GB and GiB. Other live tasks and swap can change the result.

If Docker reports reclaimed space but the host file remains large, measure allocated Docker.raw blocks again after a short bounded interval. Do not equate Docker's internal reclaim estimate with host recovery or delete its VM disk. Explain any remaining mismatch.

Save a compact report under the current task's outputs directory with before/after storage, actions, skips, preserved changes/recovery paths, and limitations. Keep detailed logs in work/. For a read-only audit, report concrete candidates and do not perform mutation. For cleanup, continue until authorized candidates are handled; if only data requiring a decision remains, state that clearly with measured sizes.
