# Tool recipes and known gaps

Use installed `--help` and previews to verify capabilities. These are examples, not an unattended shell script. Run only applicable, authorized operations. Capture command completion and errors.

## Mole

```sh
mo --version
mo clean --dry-run
mo purge --dry-run
mo clean
mo purge
```

Some commands need a terminal for selection or sudo. Never supply stored passwords, pipe blind answers, or wait indefinitely for authentication. If the tool cannot run noninteractively, use documented noninteractive options or clean the same authorized targets with their native tools. Report the specific blocked portion after finishing independent work.

`mo purge --paths` edits the project-root configuration at `~/.config/mole/purge_paths`. Use the current user's discovered/configured project roots and any existing agent workspace roots such as `~/.codex/worktrees`, `~/.claude/worktrees`, or `~/.symphony/workspaces`. Exclude iCloud-backed roots, even when they look like ordinary Documents folders. Do not add nonexistent roots or replace existing roots blindly. A specific project root is preferable when discovery is too broad.

Mole behavior to check in the installed version (these gaps were verified in CLI 1.33.0):
- Docker logic reports `docker system df`; it does not prune Docker objects.
- Project auto-discovery skips hidden folders. Default conventional roots miss many nested or agent-created workspaces.
- Purge targets generated directories, not entire repository/workspace copies. It uses a seven-day minimum age and bounded scan depth.
- `clean` and `purge` are distinct operations. Existing whitelists may preserve caches intentionally; do not override them without applicable authorization.

Source: [Mole CLI](https://github.com/tw93/Mole). Installed shell files under `~/.config/mole/lib/clean` are stronger evidence for local behavior than current upstream documentation.

## Docker

```sh
docker context show
docker context inspect
docker system df
docker ps -a
docker buildx ls
```

Ensure the endpoint belongs to this Mac; do not prune a remote daemon under a local Mac-cleanup request. If Docker is stopped, do not launch its VM just to inspect it unless doing so is needed and appropriate to the request.

For ordinary cleanup with preserved container data:

```sh
docker builder prune --all --force
docker image prune --all --force
```

Check `docker buildx ls` for additional local builders. If additional unused caches matter, use `docker buildx prune --builder BUILDER --all --force`, after verifying that builder is local and idle. Inspect `--help` because `docker builder` may be implemented through buildx on the installed client.

When stopped containers are also disposable or explicitly authorized:

```sh
docker system prune --all --force
```

`system prune` removes stopped containers and unused networks as well as images/cache. It preserves running containers. Do not add `--volumes` or run volume prune as routine cache cleanup: volumes can hold databases. Stopped containers may have valuable writable-layer files even without volumes. Inspect/bundle those before discarding unless the user authorizes doing so.

Common Desktop disk: `~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw`. Measure allocation with `stat -f '%b %z %N'`: blocks are 512 bytes, logical bytes are separate. Do not unlink, truncate, reset Docker Desktop or run privileged reclaim containers just to improve the headline number. Internal pruning often releases host allocation asynchronously; validate the actual result.

Source: [Docker system prune](https://docs.docker.com/reference/cli/docker/system/prune/).

## Package and build caches

Determine actual cache paths first; clean the largest installed ecosystems rather than running a universal command list.

| Ecosystem | Discovery | Cleanup examples |
|---|---|---|
| Yarn | `yarn --version`, `yarn cache dir` when supported | Yarn Classic: `yarn cache clean`; inspect modern Yarn's flags and cache location |
| npm | `npm config get cache` | `npm cache clean --force` for expendable downloads; inspect `_npx` separately |
| pnpm | `pnpm store path` | `pnpm store prune` |
| uv | `uv cache dir` | `uv cache clean` |
| pip | `python3 -m pip cache info` | `python3 -m pip cache purge` |
| Homebrew | `brew --cache`, `brew cleanup --dry-run --prune=all -s` | `brew cleanup --prune=all -s`; inspect retained installed-package downloads separately |
| Conda | `conda clean --all --dry-run` | `conda clean --all -y`; do not force-remove package directories linked by environments |
| Gradle | `~/.gradle/caches`, wrapper versions, project `.gradle` | Remove expendable caches while no related builds run; preserve `gradle.properties`, init scripts and credentials |

Generated project directories may include node_modules, .next, .turbo, build, dist, target, .venv and cdk.out. Directory names alone do not prove disposal: `build` or `dist` can hold hand-maintained/distributed artifacts. Check repository ignore/tracking rules and reproducibility. Installed environments can be recreated only if their dependency manifests/lockfiles and necessary artifacts remain. Preserve .env, credentials, source, Git history and unpublished changes.

## Agent worktrees and sessions

Inspect `.codex`, `.claude`, `.cursor`, `.symphony` and CI workspace roots if present. Do not assume that a folder is stale because it is large or old. Respect a user's explicit instruction to delete a named folder without usage checks.

For Git worktrees, `git worktree list --porcelain`, `git status --porcelain`, and `git worktree prune --dry-run` establish current state. Preserve unique commits with stable Git refs or a bundle and changed/untracked/non-build ignored files in a recovery folder when preservation is required. Use `git worktree remove` rather than unlinking a registered worktree, then prune missing registrations. Do not force past locked/managed worktree ownership without understanding it.

Codex chat databases and archived sessions are user history, not disposable package caches. Do not delete them under generic cleanup. Transparent archived-log compression is optional only when supported, with original paths/contents preserved and content hashes verified; don't invent a risky compression implementation if the gain is small.

## Larger conditional areas

- Android SDK/emulators: follow the retention procedure below, using current project requirements and a single usable AVD.
- Xcode: DerivedData, old device support, unused runtimes/devices; use xcrun simctl and Xcode-supported managers. Keep archives/dSYMs needed for releases and crash symbolication.
- Models: Ollama and Hugging Face stores. Treat named model removal as conditional; deleting them costs redownload/reproduction time. Preserve custom model definitions and outputs.
- Editor/AI app data: Cursor databases, Claude VM bundles and agent worker files can include durable state. Don't assume all Application Support is cache.
- PostgreSQL/data stores: use database size metadata to explain usage. A reset, retention change, table deletion or backup removal needs applicable authorization; never delete raw files of a running database.
- iCloud: always exclude it from cleanup. Do not use “Remove Download,” delete cloud-backed files, hydrate placeholders, or change sync settings. Read-only metadata measurements are permitted.
- APFS/Time Machine: use `diskutil apfs listSnapshots` and `tmutil listlocalsnapshots`. Never remove the sealed System snapshot. Don't thin/delete backups under generic package-cache cleanup without an applicable backup decision.
- macOS Install Data, VM/swap and protected assets: report measured sizes; verify update state before installer cleanup. Do not manually remove swap or protected system assets.
- Chrome signing clones and Docker Scout temporary files: inspect age and open/update activity before deletion. APFS clones may share blocks, reducing actual recovery below summed `du` sizes.


## Android retention procedure

1. Resolve the SDK location from the selected projects' local.properties and environment (`ANDROID_HOME`/`ANDROID_SDK_ROOT`), falling back to the current user's `~/Library/Android/sdk`. Ensure the intended local SDK is targeted. Inventory `sdkmanager --list_installed`, `avdmanager list avd`, and emulator processes.
2. Read the configured Android project roots' root/app Gradle files, gradle.properties, version catalogs, and applied plugins. Trace inherited React Native/Expo defaults into installed dependencies instead of guessing from the app's build.gradle. Record compileSdk, Build Tools, NDK and CMake requirements. Different projects can legitimately require multiple pinned native-tool versions. Keep required platforms even when a newer API is installed. Do not edit project versions to make cleanup simpler.
3. Retain the union of all selected projects' required packages, plus current compatible platform-tools, command-line tools, emulator runtime and licenses. Keep only the system image required by the surviving AVD. Remove obsolete platform/source/Build Tools/NDK/CMake/system-image packages with `sdkmanager --uninstall`, using structured argument arrays for semicolon-containing package IDs. If required packages are missing or requirements remain unresolved, preserve potentially needed versions and report that uncertainty; do not delete them based on age.
4. Keep exactly one usable existing AVD when devices exist. Prefer a valid `preferred_avd`, otherwise the currently running compatible device, otherwise the newest stable compatible ARM64 device on Apple Silicon (matching the host architecture elsewhere). Preserve the chosen device's config, writable disks and image. Delete the others with `avdmanager delete avd -n NAME`. If multiple devices are running, don't silently interrupt them: remove idle extras and resolve the remaining active-device constraint. If none exist, do not install/create one solely for cleanup.
5. Delete obsolete AVDs before removing their images. Re-inventory installed packages and AVDs; verify retained package paths and the surviving system image exist. Empty parent directories can be removed after native uninstall. Stale SDK download intermediates and deprecated SDK tools are additional candidates once current tools are verified and no install is running.
6. Do not run full application builds merely to verify deletion: they immediately regenerate caches. Validate retained requirements, package inventory and device registration; say when full build/runtime verification was not performed. An SDK XML metadata warning requires verifying actual inventory/path results before claiming completion.

## Scoped cache details learned from cleanup

- Gradle: remove only ~/.gradle/caches for cache cleanup; retain properties, init scripts, credentials and required wrappers. Confirm there are no related builds/open files first.
- Editor updater downloads: use `~/Library/Caches/com.microsoft.VSCode.ShipIt` and `~/Library/Caches/com.todesktop.230313mzl4w4u92.ShipIt` when present and unused. Discover changed updater IDs from the installed apps/cache inventory. Leave Cursor/VS Code databases, profiles, extensions and user settings intact.
- Yarn Classic: `yarn cache dir` confirms the download store; `yarn cache clean` preserves installed project dependencies. uv: `uv cache dir` then `uv cache clean`. Caches may regrow immediately during other work; report that instead of repeatedly deleting live allocations.
- Ollama: when all model removal is explicitly authorized, use `ollama list` and remove each model with `ollama rm`. If the CLI is absent, identify the actual model store (including OLLAMA_MODELS overrides) before scoped deletion. Preserve custom definitions, credentials, logs and unrelated Hugging Face stores. A one-time model deletion is not blanket permission for future model removal.
- Chrome signing copies: discover the user cache location using `getconf DARWIN_USER_CACHE_DIR`; its parent can contain `X/com.google.Chrome.code_sign_clone`. Inspect open paths/update activity, then remove only the disposable signing-copy directory. Don't hardcode the opaque /var/folders user token, delete browser profiles, or confuse attributed clone sizes with actual recovered bytes.
