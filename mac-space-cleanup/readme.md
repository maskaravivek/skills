# Mac Space Cleanup

An agent skill for reclaiming macOS storage with Mole and native developer tools.
It measures actual disk recovery, finds large areas that generic cleaners miss,
and carries authorized cleanup through completion.

## What it does

- Uses Mole for general caches and project build artifacts.
- Supplements Mole with Docker image/build-cache pruning, package caches,
  Gradle caches, editor update downloads and disposable temporary files.
- Reviews stale agent workspaces and Git worktrees while preserving unique work.
- Reads your Android projects' current build requirements and retains the SDK,
  Build Tools, NDK and CMake versions they need, plus one usable emulator.
- Compares before/after APFS free capacity and reports recovered GB/GiB, actions,
  skips and any limitations.

**iCloud is always excluded**, including local download eviction and sync settings.
Running workloads, source files, databases, Docker volumes and user history are
preserved unless the user explicitly authorizes a specific deletion. An audit
request performs no cleanup. Model deletion and whole-workspace deletion are
conditional, not automatic defaults.

This is an agent workflow, not a standalone unattended cleaner. The included
Python scripts configure a local profile and collect read-only measurements;
cleanup decisions and execution are handled by the agent.

## Install

Requires macOS, Python 3 and an agent that loads `SKILL.md` skills. Mole is
recommended; Docker and other developer tools are used only when installed and
relevant. This skill does not require paid software or a connector.

From the cloned repository:

```sh
# Codex
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R mac-space-cleanup "${CODEX_HOME:-$HOME/.codex}/skills/"

# Or Claude Code, available across projects
mkdir -p ~/.claude/skills
cp -R mac-space-cleanup ~/.claude/skills/
```

Reload your agent's skills or restart its app if the new skill is not visible.
The workflow uses ordinary shell tools. Codex-managed worktree tools are optional;
other agents can use Git for ordinary worktrees and leave managed checkouts alone
when ownership cannot be established.

## Setup

Run these from the installed skill folder or `mac-space-cleanup` in this repository.
Preview tool availability and profile changes:

```sh
python3 scripts/setup.py --dry-run
```

Create/update a local profile for your Android apps:

```sh
python3 scripts/setup.py \
  --android-project ~/Projects/app-one/android \
  --android-project ~/Projects/app-two/android
```

Pass Android **Gradle root directories** containing `settings.gradle` or
`settings.gradle.kts`. Supplying project flags replaces the configured project
list with those paths. Omitting them preserves the existing list. Other existing
profile fields are preserved.

Optionally select the existing emulator you want retained:

```sh
python3 scripts/setup.py --preferred-avd My_API_36_Device
```

Without a preferred device, the agent chooses a running compatible device or the
newest stable compatible device. If no emulator exists, cleanup does not create
one. SDK requirements are derived each run; versions are not pinned in the
profile. Multiple NDK versions can remain when different apps require them.

The profile lives at:

```text
${XDG_CONFIG_HOME:-$HOME/.config}/mac-space-cleanup/profile.json
```

Keep it outside iCloud and outside the shared skill folder. It contains local
project paths and emulator preferences and should not be committed/shared.
`--config-dir` overrides the location for testing; the skill's workflow reads the
standard location, so a custom location must also be supplied to the agent.

Mole can be installed explicitly through existing Homebrew:

```sh
python3 scripts/setup.py --install-mole
```

Setup never runs cleanup. Without `--install-mole`, it never installs software.
With `--dry-run`, it neither writes configuration nor installs anything. Docker,
SDKs, Python package tools and Homebrew itself are never auto-installed.

## Use

Example prompts:

> Use $mac-space-cleanup to reclaim as much disposable space as possible on my Mac.

> Use $mac-space-cleanup for a read-only storage audit and rank cleanup candidates.

> Clean caches and unused Android packages; keep the apps in my local profile and one emulator.

For agents without `$skill-name` invocation syntax, ask them to load this skill's
`SKILL.md` and follow it.

The snapshot helper can also be used directly:

```sh
python3 scripts/storage_snapshot.py --output /tmp/mac-space-before.json
# After authorized cleanup:
python3 scripts/storage_snapshot.py \
  --compare /tmp/mac-space-before.json --output /tmp/mac-space-after.json
```

Choose fresh paths; snapshots do not overwrite files. Docker's internal reclaimed
space, sparse disk-file sizes and summed APFS clone sizes can differ from the
actual increase in host free space. Other workloads and swap can also change the
before/after result.

For weekly use, configure your agent's scheduler to invoke the skill on your Mac
with its local profile. The skill does not install a background job itself. Tell
the scheduler to preserve active work and notify after meaningful recovery,
failures or required decisions.

## Files

- `SKILL.md`: workflow, authorization scope and portable defaults.
- `references/cleanup-recipes.md`: native commands and Android retention procedure.
- `scripts/setup.py`: local setup and optional Mole installation.
- `scripts/storage_snapshot.py`: read-only APFS/storage measurement.
- `agents/openai.yaml`: Codex skill metadata.

Tool references: [Mole CLI](https://github.com/tw93/Mole) and
[Docker pruning documentation](https://docs.docker.com/reference/cli/docker/system/prune/).
