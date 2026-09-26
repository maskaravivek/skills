# Answer-engine audit

Find out whether ChatGPT, Claude, Gemini, Perplexity, and the other AI answer
engines cite your product — and if they don't, exactly which pages would fix
that. See [`SKILL.md`](./SKILL.md) for the full instructions this skill runs.

![Pipeline diagram: 24 intent-tagged prompts sampled three times across six AI engines, split into a win lane, a widget lane with no citation slot, and a loss lane that gets checked against a keyword-ownership map to produce a recorded gap or an explicit no-change decision.](./diagram.png)

## What it does

1. **Setup (once per product)** — find or draft a versioned prompt matrix with
   the user's real buyer questions, each tagged `discovery`, `branded`, or
   `baseline`. This step is interactive by design: the skill proposes the
   matrix and waits for the user to confirm it before anything gets committed,
   because every future round depends on the matrix staying stable.
2. **Sample** — ask each prompt 3 times across every reachable engine. One
   answer is noise; a repeat across runs is signal.
3. **Record** — one row per observation, with a fixed schema (see
   [`references/recording-schema.md`](./references/recording-schema.md)),
   including whether the engine even offered a citation slot to win
   (`cited-pages` vs. `widget` vs. `no-sources`).
4. **Classify and diff** — for real losses, work out what the winning page has
   that yours doesn't.
5. **Report** — split every rate by intent (never one blended number), and end
   with the concrete output: pages to write or gaps to fix, not just a score.

## Using this skill

Copy the folder into your agent's skills directory, per the
[repo README](../README.md#install):

```bash
# Claude Code, single project
cp -r answer-engine-audit <your-repo>/.claude/skills/

# Claude Code, all projects
cp -r answer-engine-audit ~/.claude/skills/

# Codex
cp -r answer-engine-audit ~/.codex/skills/   # or $CODEX_HOME/skills/
```

Then just ask for it in plain language — "why does ChatGPT recommend
[competitor] instead of us", "set up a visibility audit for our product",
"run this quarter's answer-engine round" — the skill's description is written
to trigger on intent, not on an exact skill name.

### First run vs. every run after

The first run is a conversation, not a batch job: the agent needs the user's
real buyer questions and needs the drafted matrix confirmed before it commits
anything (see `SKILL.md`'s Setup section and its "never commit a prompt
matrix the user hasn't seen" rule). Don't skip this by pre-answering it
yourself — a matrix nobody reviewed is the thing every later round silently
inherits mistakes from.

Every run after that is the repeatable part: sample, record, classify,
report. That's the part worth automating.

### Running it as a recurring automation (Codex + computer use)

Sampling means actually asking ChatGPT, Claude, Gemini, Perplexity, and the
others a prompt and reading what they answer — there's no API for "what does
ChatGPT Search cite for this query," so this has to go through each engine's
real web UI. Codex's computer-use mode is what drives that part unattended:

1. **Do the interactive setup once, with a human**, following `SKILL.md`'s
   Setup section, so a confirmed prompt matrix is committed to the repo
   (e.g. `docs/aeo/prompt-matrix.json`) before any automation touches it.
2. **Schedule a recurring Codex task** (cron, or whatever your Codex
   automation trigger is) that loads this skill and runs only the Workflow
   steps — it should never re-run Setup or invent new questions on its own.
3. Point it at the existing matrix and give it computer-use access to a
   browser. On each scheduled run it should, per prompt per engine:
   - open a fresh session (no signed-in state carried over between prompts,
     per the recording schema's `signedIn` column),
   - ask the prompt exactly as written in the matrix — the automation must
     never reword a prompt or insert the product's name to "help" the engine,
   - capture the full answer, cited URLs, and whatever consulted-but-uncited
     or query-trace detail the engine's UI exposes,
   - repeat 3 times per engine before moving to the next prompt.
4. Have it write the observations file (one row per sample, exact columns
   from `references/recording-schema.md`) into the observations folder
   confirmed during setup, then produce the step-5 report — split by intent,
   with the concrete gap/no-change output.
5. Review the report yourself before treating any "gap" as something to act
   on. The automation should flag anything it couldn't observe (an engine
   that refused, a personalization signal, a citation it couldn't verify)
   rather than silently guessing — that's a non-negotiable rule in
   `SKILL.md`, and it applies just as much to an unattended run as to a
   manual one.

The value of automating this is cadence, not judgment: a computer-use run can
reliably repeat the same 24 (or however many) prompts 3x across 6 engines on
a schedule, which is tedious to do by hand every time but is exactly the kind
of controlled, repeatable sampling this workflow depends on. It should not be
trusted to source new buyer questions, relabel intents, or decide what counts
as an actionable gap without a human reading the result.
