---
name: gh-plan-to-issues
description: >-
  Create GitHub tickets from a plan using the GitHub CLI (gh). Use when asked to
  turn a Codex plan or proposal (including a <proposed_plan> block) into GitHub
  Issues: create exactly 1 epic issue plus up to 10 child task issues, link
  tasks to the epic (checklist + references), optionally apply existing
  labels/milestones/projects, avoid duplicates, and print created issue URLs.
---

# GH Plan -> Issues

## Overview

Turn a plan into GitHub Issues with a repeatable workflow: **1 epic + ≤10 tasks**, created via `gh` and linked together (task bodies reference the epic; epic contains a checklist of tasks).

## Workflow

## Supported input formats
This skill is intentionally flexible about where the plan comes from. It can be used when:
- The **immediately previous** assistant message contains a plan/proposal to ticketize (prefer the most recent plan; do not dredge up old plans).
- The user points to a **local `.md` plan/spec file**.
- The user **pastes a plan** in the same message while invoking the skill.

Regardless of plan source, the workflow is:
1) Convert plan -> JSON spec (epic + ≤10 tasks)
2) Create issues from spec via `gh`

### 0) Preconditions (always check)

- Confirm you are in the intended repo:
  - `git remote -v`
  - Prefer `gh repo view --json nameWithOwner -q .nameWithOwner` as the source of truth
- Confirm `gh` is installed and authenticated:
  - `gh --version`
  - `gh auth status`

### 1) Behavior rules (to keep it simple)

- When the user asks to “create tickets/issues”, **actually create them** using `gh` in this environment.
- Do **not** respond with only Markdown issue text or “you can run these commands…” unless the user explicitly requested a preview or dry-run.
- Create:
  - exactly **1 epic**
  - at most **10 tasks** (batch/group if needed)
- Linkage:
  - Each task body starts with `Epic: #<epicNumber>` (or contains it clearly).
  - The epic body contains a `## Tasks` checklist like `- [ ] #123`.
- Output at end: print the epic URL and all task URLs.

### 1) Convert the plan into a ticket outline
Produce:
- **Epic** (single): title + body (goal, scope, definition of done).
- **Tasks** (≤10): grouped batches if needed (e.g., by category/area). Each task includes:
  - scope (files/modules)
  - acceptance criteria
  - test plan
  - dependencies (optional)

Hard constraints:
- Create **exactly one** epic.
- Create **no more than 10** tasks under the epic.

### 2) Duplicate avoidance (default behavior)
Before creating anything, search for potential duplicates (same/similar titles), especially if running twice:
- `gh issue list --state all -S 'in:title \"<title>\"' --json number,title,url`

If duplicates exist:
- Prefer linking to existing issues rather than creating new ones.
- If you must create duplicates, do so only when explicitly requested.

### 3) Create issues via the bundled script (preferred)
This skill includes a deterministic script that creates:
1) Epic issue
2) Task issues
3) Updates the epic body to include a task checklist (`- [ ] #123`)

**Steps**
1. Write a JSON spec (use the example in `references/spec.example.json`).
2. Run:
    - `node scripts/create_issues_from_spec.mjs /tmp/gh-plan-to-issues-spec.json`

**Recommended defaults**
- Epic labels: `epic`, `enhancement` (only if those labels already exist in the repo)
- Task labels: `enhancement` (only if it exists)

### 4) Manual fallback (when needed)
If you can’t use Node or want a one-off:
- Create epic first (`gh issue create`)
- Create tasks referencing the epic number
- Update epic body with task checklist (`gh issue edit`)

## Validate the skill (optional)
Run the bundled validator:
- `node scripts/validate_skill.mjs`

## Helper: convert Markdown plan -> JSON spec (optional)
If the input is a Markdown plan and you want a starting point JSON spec:
- `node scripts/spec_from_markdown.mjs /path/to/plan.md > /tmp/gh-plan-to-issues-spec.json`
- Review/edit `/tmp/gh-plan-to-issues-spec.json` (especially task titles/bodies)
- Run issue creation:
  - `node scripts/create_issues_from_spec.mjs /tmp/gh-plan-to-issues-spec.json --dry-run`
  - `node scripts/create_issues_from_spec.mjs /tmp/gh-plan-to-issues-spec.json`

You can also pipe through stdin:
- `node scripts/spec_from_markdown.mjs /path/to/plan.md | node scripts/create_issues_from_spec.mjs - --dry-run`

## Script: `scripts/create_issues_from_spec.mjs`

### What it does
- Loads a JSON spec (epic + tasks).
- Infers repo if `repo` is omitted.
- Filters requested labels to only those that already exist in the repo.
- Checks for duplicate titles (abort unless `--allow-duplicates`).
- Creates epic + tasks using `gh api`.
- Ensures each task body references the epic (`Epic: #<num>`).
- Updates the epic body to contain a fresh checklist of created tasks.

### CLI options
- `--dry-run`: print what would be created, create nothing
- `--allow-duplicates`: skip duplicate-title abort

## Notes / Conventions
- Prefer task titles that are stable and scannable (e.g., “Batch A: …”).
- Keep tasks decision-complete: a teammate should be able to implement from the issue alone.
- Keep epic “Tasks” section as the canonical checklist (the script rewrites it).
