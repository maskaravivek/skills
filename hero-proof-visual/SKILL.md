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

## Step 2.5 — Run the decision loop (hard-won lessons)

Expect 2–3 feedback rounds. These patterns come from real iterations; skipping
them costs a round each:

- **Include the current design as a labeled baseline** in the exploration page.
  Directions are judged relative to what exists, and "the current hero is
  already good at X" is a legitimate outcome.
- **Decompose praise into properties.** When the founder likes parts of several
  directions ("A's layout, C's title, D's angle"), don't graft the pieces
  together literally. Each direction bundles independent properties — ground
  (light/dark), layout (centered/split), content (artifact/outcome/data), mood
  (calm/dense) — and praise usually targets ONE of them. Liking a direction's
  crisp headline does not mean liking its dark background. Restate which
  property you think they liked; synthesize at the property level.
- **Beware over-rotation.** Enthusiasm for a bold direction is not approval of
  all its properties. If a synthesis changes something the founder never
  commented on (e.g., flipping the page dark), flag it explicitly — don't let
  it ride in as part of the package.
- **One variable per round.** The round that converges is the one that holds
  the hero shell (copy, headline, CTAs, ground) constant and renders 2–3
  candidates for ONLY the visual slot. Compare like with like.
- **Repeating the same artifact across cards/rows is a tell.** Three views of
  one artifact reads as padding; three different artifacts at different stages
  reads as a working product.
- **Artifact-led vs outcome-led is a positioning question, not a design one.**
  If buyers shop for results (traffic, citations, revenue) rather than the
  artifact's intrinsic quality, the outcome must lead and the artifact appears
  as the cause. Ask the founder which their buyers pay for before comping.
- **Deep artifact showcases belong on a dedicated page.** If the founder loves
  an immersive "here's a real example" concept but hesitates to lead with it,
  give it its own route (e.g. `/example`) as the hero's secondary-CTA
  destination instead of forcing it into the hero.

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

### Choosing the animation stack

Match the tool to the tier; every step up costs bundle size, SSR complexity,
and maintenance. Start at the top of this list and move down only when the
current level demonstrably can't express the design:

1. **CSS transitions + keyframes** — the default, and enough for Tier 1 and
   most of Tier 2 (staggers via `animation-delay` or custom properties, chip
   state changes via class swaps + `transition`). Zero bytes, SSR-safe,
   reduced-motion via one media query.
2. **Web Animations API (WAAPI)** — when you need runtime orchestration
   (sequencing a Tier 2 cycle, pausing between loops) without a dependency.
   `element.animate()` + `Promise`-chained steps covers a running-pipeline
   effect in ~30 lines.
3. **Motion (Framer Motion) / vue-motion / solid-motion** — worth it in a
   component-framework hero when choreography is genuinely multi-step:
   variants propagating stagger to children, `useInView` triggers, layout
   animations when a row is added mid-cycle. Import only the parts you use;
   the hero should not ship >30–40kb of animation runtime. Ensure the
   pre-hydration SSR frame shows the finished composition, not initial-hidden.
4. **GSAP** — for timeline-heavy work: a long scroll-linked narrative (e.g., a
   dedicated example/demo page where the document assembles as you scroll),
   SplitText-style typographic choreography. Overkill for the hero panel
   itself; right for the immersive companion page.
5. **Lottie / Rive** — when a designer authors the motion as an asset
   (schematic shapes with illustrative movement, animated connectors). Rive's
   state machines suit interactive proof objects. Mind payload and make the
   static poster frame the no-JS/reduced-motion fallback.
6. **Three.js / React Three Fiber / WebGL shaders** — almost never for a proof
   object; records don't need 3D. Legitimate only as a subtle atmospheric
   backdrop behind the panel, and only if it degrades to a static gradient on
   low-power devices and never competes with the panel for attention.
7. **Remotion** — not a live-hero tool at all: it renders React to video. Use
   it when you want an .mp4/.webm of the pipeline running (for social cards,
   a demo embed, or a `<video>` fallback of a heavy animation) — authored with
   the same component code, rendered offline.

Regardless of stack: animate `transform`/`opacity`/`color` only, respect
`prefers-reduced-motion` at the stack level (Motion's `useReducedMotion`,
GSAP's `matchMedia`, or the CSS query), and keep the finished composition as
the SSR/no-JS/poster state so the proof is never invisible.

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
   the new ground. These bugs hide in files you didn't edit.
4. **Inspect reused image assets at their new display size.** A capture made
   for a cover-cropped composition often has sliced text or UI baked into its
   edges; at natural fit those torn edges become visible. Open the raw asset,
   check its edges, and trim at display time (or re-capture) — don't assume an
   asset that looked fine in its old context is clean.
5. **Distinguish lazy-load gaps from missing images.** Below-the-fold images
   report `naturalWidth: 0` and render blank in full-page screenshots until
   scrolled into view. Before debugging a "broken" image, scroll to it and
   re-check `img.complete` — and remember automated full-page screenshots
   don't trigger native lazy loading.
6. Reload with reduced motion enabled and with JS disabled: full composition
   visible both times. If the animation stack is JS-driven, this is where
   initial-hidden bugs surface.
7. Screenshot the final result for the founder before calling it done.
