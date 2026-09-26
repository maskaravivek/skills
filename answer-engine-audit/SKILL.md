---
name: answer-engine-audit
description: Diagnose why ChatGPT, Claude, Gemini, Perplexity, Bing Copilot, or Google AI Overview recommend a competitor instead of the user's product, and turn that gap into a short list of pages worth writing. Runs a controlled prompt-matrix sampling round across AI answer engines, records who gets mentioned/cited/linked, classifies whether a citation slot even exists, and diffs the winning answer's source page against the user's closest page to extract the exact facts and structure it's missing. Use whenever the user asks about AEO, GEO, answer-engine optimization, generative-engine optimization, AI search visibility, LLM citations, being recommended by ChatGPT/Perplexity/Claude/Gemini, or why a competitor keeps showing up in AI-generated answers instead of them — even if they don't use those exact terms (e.g. "why does ChatGPT recommend [competitor] instead of us", "how do we get cited by AI search", "our competitor keeps showing up when I ask AI about [category]"). Also use when the user wants to set up or repeat a recurring visibility-tracking round for their own product.
---

# Answer-engine audit

Find out whether AI answer engines cite you, and if they don't, exactly which pages
would fix that — in an afternoon, not a guess.

The mechanism only works if you resist two shortcuts: asking each engine once
(answers vary between runs — one answer is an observation, not a rank), and
reporting one blended "mention rate" across questions that name the product and
questions that don't (a branded question tests recall, not discovery, and blending
the two hid a real gap the last time this was tried).

## Setup (once per product, not once per audit)

The prompt matrix is the one artifact this whole workflow depends on being
*stable* across audits — a round is only comparable to the last one if it asked
the same questions the same way. Get this wrong on the first run and every future
round inherits the mistake, so this step is a conversation with the user, not
something to draft and commit alone. Nothing in setup gets written to the repo
until the user has seen and confirmed it — the same way a build plan gets
approved before code gets written, or a set of eval questions gets shown to the
user before a test run starts. If you can't ask (a fully autonomous run with no
user available), say explicitly in your output that the matrix was drafted
without review and should be checked before the next round relies on it.

1. **Find out if a matrix already exists** before writing one. Look for something
   like `docs/analytics/*prompt-matrix*.json`, `docs/aeo/`, `docs/geo/`, or ask the
   user directly. If one exists, tell the user you found it and confirm it's still
   the right one to extend before reusing it — adding a cohort or relabelling a
   `baseline` prompt to `discovery` (once a matching page ships) is a version
   bump, not a rewrite. Never reword an existing prompt just because this is a new
   session; that silently starts a new, incomparable series.

2. **If none exists, ask before inventing questions.** Ask the user for their
   real sources — sales call notes, support tickets, or a quick "what did your
   last 5 customers search before they paid?" Never write cohorts and questions
   from what you assume buyers ask; if the user has no time to gather sources
   right now, say so plainly rather than filling the gap with guesses, and mark
   whatever you draft as unvalidated.

3. **Draft the matrix as a proposal, not a final file.** Using
   `assets/prompt-matrix-template.json` as the shape, draft cohorts and
   questions from what the user gave you, and show the full draft back to them —
   every question, grouped by cohort, each tagged with an intent:

   | Intent | What it is | What it measures |
   | --- | --- | --- |
   | `discovery` | Unbranded, phrased the way someone who has never heard of the product would ask. | Whether the product's content earns citations. **This is the only visibility number.** |
   | `branded` | Names the product. | Whether an engine describes the product accurately when handed the name. Never counts as discovery. |
   | `baseline` | Unbranded, aimed at a competitor with no comparison page published against them yet. | The before-state, so a later page has something to be measured against. Expected to score zero — record the zero, don't drop the prompt. |

   Ask the user to correct wording, add or drop questions, and check every
   intent tag — a question mistagged `discovery` when it's actually `branded`
   corrupts the one number this whole workflow produces. Don't proceed on a
   partial or implied yes; wait for them to actually look at the list.

4. **Ask where this should live in their repo**, both the matrix file (e.g.
   `docs/aeo/prompt-matrix.json`) and the observations write-ups (e.g.
   `docs/aeo/observations/`) — propose a path if they have no existing
   convention, but let them confirm or redirect it before you commit anything.
   Only write and commit the matrix once the user has signed off on both the
   questions and the location.

Once the matrix and the observations folder exist and are confirmed, every
future audit starts directly at Workflow step 1 below — no setup to repeat,
unless the user wants to add a cohort or relabel a prompt, which is a small,
same-conversation confirmation rather than the full setup again.

## Workflow

### 1. Sample each question 3 times per engine

Ask every prompt exactly as written — rewording it mid-round starts a new series,
and inserting the product's name into a `discovery` or `baseline` prompt to "help"
the engine find it converts the prompt to `branded` and destroys the only thing it
was measuring. Sample across whichever engines are reachable (ChatGPT Search,
Claude, Gemini, Perplexity, Bing Copilot, Google AI Overview/AI Mode, Google
standard web as a control) three times each, using a fresh session per cohort
where the engine allows it. A single-engine or single-cohort round is legitimate;
just say which engines or cohorts were skipped instead of implying full coverage.

### 2. Record every observation with the fixed schema

One generated answer is one row, not a rank. Read
`references/recording-schema.md` for the exact columns and how to fill the fields
that require judgment (`answerModality`, `consultedNotCited`, `citedSourceDates`,
`domainSlotObserved`, `retrievalTrace`) — these are the fields that turn "we got
cited 7 of 9 times" into something actionable, and filling them inconsistently
between rounds makes the whole round incomparable to the last one.

Call an outcome repeatable only when the same URL or entity result appears in at
least 2 of the 3 samples for that prompt/engine pair.

### 3. Classify what you lost to

For every cited URL on a question the product didn't win, open it and label the
page type: comparison page, listicle, forum/community thread, docs page, review
site, or something else. This is the fastest way to see a pattern across losses —
"we lose to Reddit threads on pricing questions" is a different fix than "we lose
to a competitor's comparison page."

### 4. Diff every loss against the page that won

For each question the product lost, take the URL that won and the product's own
closest page on that topic, and run this exact prompt against both (Claude or
another capable model):

> Both pages answer [question]. List every specific fact, product name, and
> number the first page states that the second doesn't. Then say which page
> answers the question in its first 100 words.

The output of this step — not the mention-rate table — is the actual deliverable:
a list of the specific facts, numbers, and structural choices the losing page is
missing. Most rounds turn up 5-6 pages the product doesn't have yet, not tweaks to
pages it already has.

### 5. Report the round

Always split every rate by intent — discovery, branded, baseline, never blended —
and compare each intent only against the same intent in an earlier round. State up
front which engines and cohorts were sampled (and which were skipped), the
locale/device/signed-in state per observation, and the discovery/branded/baseline
counts separately. Close with the concrete output: the pages to write, and the
specific facts each one needs to include based on the diffs from step 4. Save the
write-up in the observations folder chosen during setup.

## Non-negotiable rules

- **Never report one blended mention rate.** A `branded` prompt scoring well and a
  `discovery` prompt scoring zero is not "70% visibility" — it's a discovery
  problem wearing a good-looking average.
- **A branded prompt can never justify building or keeping a page.** It measures
  recall of a name already handed to the engine, not whether the engine would have
  found the product unprompted.
- **`answerModality` matters before anything else does.** If the engine renders a
  widget (a table, converter, or computed result with no source list), there is no
  citation slot to lose — that's a different problem than a `no-sources` prose
  answer, which might still cite someone with a different phrasing. Route content
  effort at cohorts that come back `cited-pages`.
- **Never infer what an engine didn't show.** Record `domainSlotObserved` only when
  the engine visibly displays the domain or query it searched, and leave
  `retrievalTrace` empty rather than reconstructing it from the answer's content.
- **Never commit a prompt matrix the user hasn't seen.** It's the one artifact
  every future round depends on being right; drafting it alone and writing it
  straight to the repo trades a five-minute review for audits that quietly
  measure the wrong questions for months.
