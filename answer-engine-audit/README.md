# Answer-engine audit

Find out whether ChatGPT, Claude, Gemini, Perplexity, and other AI answer
engines cite your product — and if they don't, exactly which pages would fix
that. See [`SKILL.md`](./SKILL.md) for the full instructions.

![Pipeline diagram: 24 intent-tagged prompts sampled three times across six AI engines, split into a win lane, a widget lane with no citation slot, and a loss lane checked against a keyword-ownership map to produce a recorded gap or an explicit no-change decision.](./diagram.png)

## Install

```bash
# Claude Code, single project
cp -r answer-engine-audit <your-repo>/.claude/skills/

# Claude Code, all projects
cp -r answer-engine-audit ~/.claude/skills/

# Codex
cp -r answer-engine-audit ~/.codex/skills/   # or $CODEX_HOME/skills/
```

Then just ask for it in plain language — "why does ChatGPT recommend
[competitor] instead of us", "run this quarter's answer-engine round."

## First run vs. every run after

The first run is interactive: the agent needs the user's real buyer
questions and needs the drafted prompt matrix confirmed before committing
anything. Every run after that — sample, record, classify, report — is
repeatable and safe to automate.

## Automating it (Codex + computer use)

Sampling means reading what ChatGPT, Claude, Gemini, and Perplexity actually
answer in their web UI — there's no API for that, so a recurring run needs
computer use to drive a browser. Once a human has confirmed the prompt
matrix (the one-time setup above), a scheduled Codex task can load this
skill and run only the Workflow steps: open a fresh session per prompt, ask
it exactly as written, capture the answer and cited URLs 3x per engine, then
write the observations and the step-5 report. Keep judgment calls — sourcing
new questions, relabeling intent, deciding what's an actionable gap — with a
human; automate the repetition, not the decisions.
