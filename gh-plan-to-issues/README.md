# gh-plan-to-issues (Codex skill)

Create GitHub Issues from a plan/spec using the GitHub CLI (`gh`).

It creates:
- **Exactly 1 epic** issue
- **Up to 10 task** issues
- A **task checklist** on the epic (e.g. `- [ ] #123`)
- A consistent **link back to the epic** in each task body (e.g. `Epic: #229`)

This skill exists to make the intent unambiguous: when you ask to “create issues”, Codex should **actually run `gh`** to create them (not just print Markdown drafts/commands).

## Requirements

- `gh` installed and authenticated (`gh auth status`)
- Node.js (to run the scripts)

## Install

Copy this folder into your Codex skills directory and restart the Codex app (skills are loaded on startup).

Common locations:
- `~/.codex/skills/gh-plan-to-issues/`
- `$CODEX_HOME/skills/gh-plan-to-issues/` (if `CODEX_HOME` is set)

## Validate the skill

Run:

```bash
node scripts/validate_skill.mjs
```

## Usage

## Using as a Codex skill

Typical flow:
1) Generate a plan (Codex or Claude)
2) Ask Codex: “Use `gh-plan-to-issues` to create GitHub issues from the plan (1 epic + up to 10 tasks).”

Codex should run `gh` and return the created issue URLs.

## Using as a standalone script

Create a JSON spec (start from `references/spec.example.json`), then dry-run:

```bash
node scripts/create_issues_from_spec.mjs /path/to/spec.json --dry-run
```

Create issues:

```bash
node scripts/create_issues_from_spec.mjs /path/to/spec.json
```

### Duplicate handling

By default the script aborts if it finds issues with matching titles.
To override:

```bash
node scripts/create_issues_from_spec.mjs /path/to/spec.json --allow-duplicates
```

## What the script does

`scripts/create_issues_from_spec.mjs`:
- Infers the repo (or uses `repo` from the spec)
- Filters requested labels to labels that already exist in the repo
- Creates the epic + tasks
- Updates the epic body to contain a `## Tasks` checklist referencing created tasks
