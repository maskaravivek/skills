# Agent skills

A small collection of agent skills, usable with Codex, Claude Code, and other
harnesses that load `SKILL.md`-based skills.

## Skills

| Skill | What it does |
|---|---|
| [`gh-plan-to-issues`](gh-plan-to-issues/) | Turn a plan/spec into GitHub Issues via `gh`: 1 epic + up to 10 linked task issues. Includes standalone scripts and a validator. |
| [`github-issue-planner`](github-issue-planner/) | Turn plans, audits, PRDs, roadmaps, and findings into repository-aware GitHub issues, native epics, dependencies, labels, and readiness states. |
| [`hero-proof-visual`](hero-proof-visual/) | Design and build a "proof object" hero visual for a product landing page: an outcome ledger, artifact cards, or cause→effect schematic that shows real output and outcome states instead of screenshots or invented stats. Covers composition, craft, honesty rules, and motion. |

## Install

Clone the repo and copy the skill folder you want into your agent's skills
directory, then restart the app (skills are typically loaded on startup):

```bash
git clone https://github.com/maskaravivek/skills.git

# Codex
cp -r skills/gh-plan-to-issues ~/.codex/skills/

# Claude Code, available in all projects
cp -r skills/hero-proof-visual ~/.claude/skills/

# Claude Code, single project only
cp -r skills/hero-proof-visual <your-repo>/.claude/skills/
```

If `CODEX_HOME` is set, Codex loads skills from `$CODEX_HOME/skills/` instead of
`~/.codex/skills/`.

Each skill's `SKILL.md` documents its requirements and usage.
