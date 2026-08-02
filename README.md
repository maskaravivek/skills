# Agent skills

A small collection of agent skills, usable with Codex, Claude Code, and other
harnesses that load `SKILL.md`-based skills.

## Skills

| Skill | What it does |
|---|---|
| [`gh-plan-to-issues`](gh-plan-to-issues/) | Turn a plan/spec into GitHub Issues via `gh`: 1 epic + up to 10 linked task issues. Includes standalone scripts and a validator. |
| [`hero-proof-visual`](hero-proof-visual/) | Design and build a "proof object" hero visual for a product landing page: an outcome ledger, artifact cards, or cause→effect schematic that shows real output and outcome states instead of screenshots or invented stats. Covers composition, craft, honesty rules, and motion. |

## Install

Copy the skill folder you want into your agent's skills directory and restart the
app (skills are typically loaded on startup).

Common locations:

- Codex: `~/.codex/skills/<skill-name>/` (or `$CODEX_HOME/skills/<skill-name>/`)
- Claude Code (all projects): `~/.claude/skills/<skill-name>/`
- Claude Code (one project): `<repo>/.claude/skills/<skill-name>/`

Each skill's own README/SKILL.md documents its requirements and usage.
