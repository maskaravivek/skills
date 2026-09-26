# Recording schema

Write one file per round (`observations-YYYY-MM-DD.md` or `.csv` — whatever the
project's docs convention is), with one row per observation and exactly these
columns, in this order. State at the top of the file: matrix version used, which
engines were sampled and which were skipped, which cohorts were sampled if not
all of them, and the discovery/branded/baseline counts separately.

| Column | What goes in it |
| --- | --- |
| `observedAt` | Timestamp of the sample. |
| `engine` | The engine sampled (e.g. "ChatGPT Search", "Claude", "Google AI Overview"). |
| `locale` | The actual locale used — don't normalize it. |
| `device` | The actual device — don't normalize it. |
| `signedIn` | The actual signed-in state for this observation. |
| `prompt` | The exact prompt text, verbatim. |
| `promptIntent` | `discovery`, `branded`, or `baseline`, copied from the matrix. |
| `productMentioned` | Whether the product was named in the answer at all. |
| `productCited` | Whether the product appears among the answer's sources/citations. |
| `productLinked` | Whether a clickable link to the product's own site appears. |
| `citedUrls` | Every URL the answer cites, not just the product's. |
| `competingSources` | Which competitor or third-party source won the slot. |
| `answerSummary` | A short summary of what the answer actually said. |
| `answerModality` | One of `cited-pages`, `widget`, or `no-sources` — see below. |
| `consultedNotCited` | Sources the engine visibly browsed/fetched but didn't cite — see below. |
| `citedSourceDates` | Published/updated date of each cited URL, or `unknown`. |
| `domainSlotObserved` | The host, only when the engine visibly displays the domain/query it searched. Empty otherwise. |
| `retrievalTrace` | Verbatim, unedited capture of any query construction the engine exposes (search strings, freshness windows, domain targeting). Empty when the engine shows nothing. |
| `limitations` | Anything about the observation that limits how much weight it should carry (personalization, ambiguous phrasing, engine refused to answer, etc). |

## Filling the fields that require judgment

### `answerModality`

Pick exactly one:

| Value | When |
| --- | --- |
| `cited-pages` | The answer names or links sources — a slot exists to win. |
| `widget` | The answer is a rendered component (table, chart, converter, computed result, product card) with no source list — no citation slot exists for anyone, so losing it isn't a content problem. |
| `no-sources` | Prose with no citations and no component — the engine answered from its own weights; a citation slot might still appear for a different phrasing. |

If an answer shows both a component and a source list, record `cited-pages` — the
slot exists. Computation-shaped cohorts (converters, unit questions, counters) are
the ones most likely to come back `widget` — that's a hypothesis to test, not an
assumption to make going in.

### `consultedNotCited`

List sources the engine visibly browsed, fetched, or named in its reasoning
(often behind a "searching…" or "sources consulted" affordance — open it) that do
**not** appear in the final citations. If the engine exposes nothing, record an
empty list plus a note that it hides this rather than guessing from the answer's
content. This is what makes a "consulted heavily, cited rarely" pattern (common
with forum threads) measurable instead of assumed.

### `citedSourceDates`

The published or updated date shown by the citing surface, or visible on the page
itself. Record `unknown` when neither exists — that's data, not a gap to fill by
guessing. The age distribution across a round is the only externally observable
evidence of whether a recency gate exists: citations clustered in a few weeks
looks gated, citations spanning years does not.

### `domainSlotObserved`

Record the host **only** when the engine displays the query or domain it actually
searched. Never infer it from which page got cited — that's the answer, not the
probe.

### `retrievalTrace`

When an engine exposes its own query construction — search strings, freshness
windows, domain targeting — paste it verbatim, unedited. Don't summarize or
reformat it. This is the only mechanism for dating a change in how an engine
retrieves, since these formats change without notice.

## Interpretation rules

- One generated answer is an observation, not a rank. Call an outcome repeatable
  only when the same URL or entity result appears in at least 2 of 3 controlled
  samples.
- Report discovery, branded, and baseline rates separately, every time, including
  in summary lines. A blended rate is the exact defect this schema exists to
  prevent — a `compare` cohort that looks like 7-of-9 on a blended basis can be
  0-of-3 on its only `discovery` prompt.
- Don't backfill fields from an earlier round that didn't record them. A round
  that used a smaller schema stays comparable on the fields it shares with a later
  round, not on fields it never captured.
