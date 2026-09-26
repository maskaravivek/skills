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

## Workflow

### 1. Build the prompt matrix

Pull 8-12 real buyer questions — from sales calls, support tickets, or by asking
the last 5 customers what they searched before they paid. Do not write questions
from what you assume buyers ask; use what they actually typed or said.

Tag every question with an **intent** before sampling anything:

| Intent | What it is | What it measures |
| --- | --- | --- |
| `discovery` | Unbranded, phrased the way someone who has never heard of the product would ask. | Whether the product's content earns citations. **This is the only visibility number.** |
| `branded` | Names the product. | Whether an engine describes the product accurately when handed the name. Never counts as discovery. |
| `baseline` | Unbranded, aimed at a competitor with no comparison page published against them yet. | The before-state, so a later page has something to be measured against. Expected to score zero — record the zero, don't drop the prompt. |

Copy `assets/prompt-matrix-template.json` and fill in `cohorts` for the product's
own question groups. Keep the schema exactly — the recording step depends on it.

### 2. Sample each question 3 times per engine

Ask every prompt exactly as written — rewording it mid-round starts a new series,
and inserting the product's name into a `discovery` or `baseline` prompt to "help"
the engine find it converts the prompt to `branded` and destroys the only thing it
was measuring. Sample across whichever engines are reachable (ChatGPT Search,
Claude, Gemini, Perplexity, Bing Copilot, Google AI Overview/AI Mode, Google
standard web as a control) three times each, using a fresh session per cohort
where the engine allows it. A single-engine or single-cohort round is legitimate;
just say which engines or cohorts were skipped instead of implying full coverage.

### 3. Record every observation with the fixed schema

One generated answer is one row, not a rank. Read
`references/recording-schema.md` for the exact columns and how to fill the fields
that require judgment (`answerModality`, `consultedNotCited`, `citedSourceDates`,
`domainSlotObserved`, `retrievalTrace`) — these are the fields that turn "we got
cited 7 of 9 times" into something actionable, and filling them inconsistently
between rounds makes the whole round incomparable to the last one.

Call an outcome repeatable only when the same URL or entity result appears in at
least 2 of the 3 samples for that prompt/engine pair.

### 4. Classify what you lost to

For every cited URL on a question the product didn't win, open it and label the
page type: comparison page, listicle, forum/community thread, docs page, review
site, or something else. This is the fastest way to see a pattern across losses —
"we lose to Reddit threads on pricing questions" is a different fix than "we lose
to a competitor's comparison page."

### 5. Diff every loss against the page that won

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

### 6. Report the round

Always split every rate by intent — discovery, branded, baseline, never blended —
and compare each intent only against the same intent in an earlier round. State up
front which engines and cohorts were sampled (and which were skipped), the
locale/device/signed-in state per observation, and the discovery/branded/baseline
counts separately. Close with the concrete output: the pages to write, and the
specific facts each one needs to include based on the diffs from step 5.

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
