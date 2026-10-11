# Mac Space Cleanup

Reclaim Mac storage with Mole and native tools: Docker, package/Gradle caches,
editor downloads, disposable build files and stale Codex/Claude/other agent
workspaces and worktrees. Measures actual disk recovery.

**Always leaves iCloud untouched.** Preserves active work, unique changes,
history, databases and Docker volumes. Keeps the Android SDK packages your
selected apps need and one usable emulator.

## Let your agent set it up

Give local Codex or Claude Code this folder/link and ask:

> Read mac-space-cleanup/SKILL.md, install this skill for my agent and set it up
> on this Mac. Preview available tools, configure my Android projects if relevant,
> and install Mole if missing and Homebrew is available. Do not run cleanup yet.

The agent can download/copy the folder and run the included setup helper.
Opening the folder alone does not install it. Requires macOS, Python 3 and an
agent with local file/shell access; a cloud session cannot clean your Mac.

## Manual setup

Copy this folder into your agent's personal skills directory:

- Codex: `~/.agents/skills/mac-space-cleanup/`
- Claude Code: `~/.claude/skills/mac-space-cleanup/`

Reload/restart the agent if needed. From the skill folder:

```sh
python3 scripts/setup.py --dry-run
# Optional: configure Android Gradle roots and an existing emulator
python3 scripts/setup.py --android-project ~/Projects/my-app/android --preferred-avd My_Emulator
# Optional: install Mole using existing Homebrew
python3 scripts/setup.py --install-mole
```

Setup never runs cleanup. Preferences stay in
`${XDG_CONFIG_HOME:-$HOME/.config}/mac-space-cleanup/profile.json`, outside the
shared skill. Android project flags replace the project list; omit them to keep it.
Other cleanup tools are used when installed; setup does not install them or Homebrew.

## Use

Ask: **“Use mac-space-cleanup to clean my Mac”** or **“Run a read-only storage audit.”**
For weekly cleanup, have your agent's local scheduler invoke the skill.
See [SKILL.md](SKILL.md) for the workflow and
[cleanup recipes](references/cleanup-recipes.md) for tool-specific details.
