---
name: hero-proof-visual
description: Design and build a "proof object" hero visual for a product landing page — a calm, data-grounded panel (outcome ledger, artifact cards, or cause→effect schematic) that shows real product output and outcome states instead of screenshots or invented stats. Use when a hero needs a visual that proves the product's value honestly. Covers hero composition, proof-shape selection, honesty rules, chip/typography/color craft, entrance and live-state animation, accessibility, and browser verification.
---

# Hero proof visual

Build the hero's visual as a **proof object**: one composed artifact that shows what the
product produces and what state that output reached. Not a screenshot dump, not a KPI
grid, not an illustration. It answers the visitor's real question — "what do I get?" —
in one reading order: *artifact → what it targeted → what happened to it*.

Works for any product whose value is its output: articles that ranked, invoices that
got paid, PRs that merged, models that deployed, candidates that got hired, tickets
that got resolved.

## When to use

Use this when outcomes are the product's strongest proof. If the strongest proof is
the interface itself (a beautiful editor, a novel canvas), use a real capture instead.
If the founder has real usage metrics they're allowed to publish, a proof object can
carry them — but this skill's default assumption is an early-stage product with no
publishable numbers, which is exactly when invented stats creep in and kill trust.

## Step 1 — Hero composition decisions

Decide these before designing the visual; they set its stage:

- **Copy above, visual below, centered.** The proof object is wide and list-like;
  side-by-side layouts cramp it. Centered copy with the panel below reads as calm
  and confident and scales down to mobile without reflowing the story.
- **Light ground by default.** Proof objects are documents/records; records read
  best on light surfaces, and chips/tints stay legible. A dark hero can work, but
  then the proof object should be the only light element (light = output becomes
  the semantic system) — commit to one of these, don't mix.
- **The visual is the hero's second beat, not a footnote.** Give it real width
  (up to ~56rem), and let it bleed toward the next section if the page continues
  the story below.
- **Headline pairs with the visual.** Outcome-led visuals want outcome-led
  headlines ("Built to rank. Built to be cited." beats "The AI writing platform").
  Two short beats, second beat in the brand accent, is a reliable shape.

## Step 2 — Pick the proof shape

1. **Outcome ledger** (default): a bordered panel with a small header strip and 2–4
   hairline-divided rows. Each row = one artifact: title, a small mono context line
   (what it targeted), and outcome chips right-aligned. Best when outcomes are
   states across a pipeline.

   ```text
   published output · yourproduct.com                          3 items
   ──────────────────────────────────────────────────────────────────
   <Artifact title>
   target: "<what it was aimed at>"     [↗ Outcome] [✓ Check] [State]
   ```

2. **Artifact cards**: 3 cards, each a *different* artifact paired with a
   *different* outcome rendered in the card's footer. Never the same artifact
   three ways. Best when each outcome type deserves its own visual treatment.
3. **Cause→effect schematic**: the artifact centered, its effects flanking it
   (e.g., a search result on one side, an AI answer citing it on the other).
   Deliberately stylized — no real-product chrome — so it reads as diagram,
   never as a fake screenshot. Best when one artifact has two distinct payoffs.

Comp the chosen shape (plus one alternate) as small rendered HTML mocks on one
exploration page and get the founder's pick BEFORE writing production code.
People decide from rendered comps, not descriptions.

## Step 3 — Honesty rules (non-negotiable)

These are what separate a proof object from marketing slop:

- Chips/labels are **states, never metrics**. "Cited in AI answers", "Paid",
  "Merged", "In review" — yes. "2.4k visits", "#3 on Google", "98% accuracy" — no,
  unless literally true and verifiable. A count is allowed only when real.
- Rows/cards show **different artifacts at different stages** — including one
  still in progress. The unfinished row is what makes the finished ones credible.
- The schema should match what the product could render with **live data later**:
  the visual is a screenshot-in-waiting, not an illustration.
- No fake logos, testimonials, or imitation of another product's UI chrome
  (no Google chrome, no ChatGPT UI, no Stripe dashboard cosplay).

## Step 4 — Craft bar

**Color.** Use the project's design tokens only; chip tints derive from existing
brand hues (background at low opacity or a computed tint, text at the hue's dark
end). Introducing a new hue just for chips — especially blue — is a smell. Three
tone roles are enough: positive, in-progress, neutral.

**Typography.** Three roles, not more: the brand face for artifact titles
(semibold), a monospace for system strings only (header strip, target lines —
mono is earned here because these ARE data readouts), and the body face for
everything else. Titles ~1rem, mono ~0.75rem, chips ~0.72rem with slight
letter-spacing if uppercase.

**Panel chrome.** 1px border in the page's hairline color, radius ≤10px, and at
most a subtle shadow (≤8px blur, low opacity). Never a heavy border-and-shadow
pair. Hairline dividers between rows, comfortable row padding (0.75–1rem vertical).

**Contrast, computed.** Every text/background pair ≥4.5:1 by WCAG relative
luminance — including muted mono lines and chip text on chip tints. Calculate it;
the most common failure is decorative gray mono text at 3:1.

**Data-driven markup.** Content lives in a typed array
(`{title, target, chips: [{label, tone}]}`) mapped in the template; tones map to
CSS modifier classes. Editing content must never mean editing markup.

## Step 5 — Motion

Motion is part of the design, not a garnish. Two tiers; pick deliberately:

**Tier 1 — Entrance choreography (default, always).**
- Two-beat stagger: copy block first, panel ~120–180ms later. Within the panel,
  rows may cascade 60–90ms apart. One orchestrated page-load beats scattered
  per-element effects.
- Ease-out curves only (quart/quint/expo). No bounce, no elastic, no spring
  overshoot on a credibility surface — the object is a record, and records don't
  wobble.
- Animate `transform` and `opacity` only (translateY 8–16px + fade is plenty).
  Never animate layout properties.
- Content must be **visible by default** and the animation layered on top —
  never gate visibility on a class an observer adds, or headless
  renderers/hidden tabs ship a blank hero.
- `prefers-reduced-motion: reduce` collapses everything to instant/static.

**Tier 2 — Live-state animation (optional, earn it).**
The proof object can *run*: chips resolving from "In review" → "✓ Approved",
a new row sliding in as if the pipeline just produced it, the header count
ticking up. This is powerful — it shows the product working — but has rules:
- Animate **state transitions the product actually performs**. The animation is
  documentation of behavior, not decoration.
- One cycle, then rest. If it loops, pause ≥6s between cycles and keep every
  end-state legible; a hero that never settles reads as anxious and hurts
  reading comprehension of the copy above it.
- The resting state must be the complete, honest composition — a visitor who
  arrives mid-cycle or with reduced motion sees the full proof, not a blank
  or partial panel.
- Typing/cursor effects: at most one, short, never on the headline.
- Keep it in CSS or a few lines of JS on transform/opacity/color; if it needs a
  physics library, it's over-designed for this surface.

## Step 6 — Accessibility and semantics

- The panel is non-interactive: `role="group"` + an `aria-label` stating what it
  shows ("Recent product output: three items with their outcome states"). No fake
  links or buttons inside — if a row looks clickable it must actually go somewhere.
- Chips are text, not color alone: the label carries the meaning; tone color is
  reinforcement.
- Live-state animation must not use `aria-live`; it's decorative narration, and
  screen readers should get the resting composition only.

## Step 7 — Verify like it ships

1. Typecheck + build.
2. Real browser at 360 / 768 / 1440: screenshot each; check for clipped text,
   lazy-image gaps, and horizontal overflow (`scrollWidth > clientWidth`). Rows
   must stack below ~640px (chips wrap under the title block).
3. If the hero changed polarity (dark → light or back), grep the codebase for
   assumptions tied to the old polarity: adaptive header section lists, button
   color overrides scoped to the hero's id, accent tokens that fail contrast on
   the new ground.
4. Reload with reduced motion enabled and with JS disabled: full composition
   visible both times.
5. Screenshot the final result for the founder before calling it done.
