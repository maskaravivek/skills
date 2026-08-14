---
name: github-issue-planner
description: Create, split, label, and organize high-quality GitHub issues, roadmap tasks, planning tickets, and native GitHub epics. Use when asked to turn a plan, audit, PRD, roadmap, feature review, QA findings, or product or engineering initiative into actionable GitHub issues; to improve an existing issue breakdown; or to create and verify native sub-issue and dependency relationships.
---

# GitHub Issue Planner

Create fewer, better GitHub issues. Ground every ticket in the target repository's real policies, labels, architecture, and automation rather than imposing a universal taxonomy.

Read [references/issue-templates.md](references/issue-templates.md) when drafting issue bodies or using the native relationship APIs.

## Workflow

1. Identify the source of truth: user request, plan, audit, PRD, issue, roadmap, code finding, or QA evidence.
2. Resolve the target repository and read its local instructions before planning:
   - Run `gh repo view --json nameWithOwner -q .nameWithOwner` when inside a checkout, or use the repository the user named.
   - Read applicable `AGENTS.md`, contribution guides, issue templates, roadmap or priority docs, and agent workflow configuration.
   - Inspect live labels with `gh label list --repo OWNER/REPO --limit 200`.
   - Discover the repository's actual priority, triage, readiness, area, surface, and automation labels. Do not assume any label names.
3. Search open and closed issues for duplicates and related work:
   ```bash
   gh issue list --repo OWNER/REPO --state all --search '<keywords>' \
     --json number,title,state,labels,url
   ```
4. Decide whether the work belongs in one issue or an epic:
   - Use one issue when one owner can complete and verify it end to end.
   - Use an epic when the work contains independently shippable outcomes, crosses ownership boundaries, or needs explicit sequencing.
   - Do not create an epic merely because a plan has several implementation steps.
5. Draft each issue with a concise title, outcome-focused summary, source or evidence, bounded scope, acceptance criteria, observable verification, dependencies, non-goals, and priority rationale when the repository uses priorities.
6. Review the complete issue set before creating anything:
   - Remove duplicates and speculative tickets.
   - Prefer vertical, independently verifiable outcomes over file-by-file slices.
   - Represent real sequencing with native dependencies when available.
   - Confirm that each child belongs to the proposed parent.
7. If the user asked to create or publish issues, create them with `gh`; do not stop at Markdown drafts. If the user requested a preview, do not mutate GitHub.
8. For an epic, create the parent first, create its children, add native sub-issue relationships, add native dependencies, then update the parent body with a readable child summary.
9. Read every created issue back from GitHub and verify titles, bodies, labels, readiness state, parent-child relationships, and dependencies before reporting completion.

## Label and Readiness Rules

- Apply only labels that exist or that repository policy explicitly requires creating.
- Follow repository policy for required label groups. If it requires exactly one priority label, enforce that; otherwise do not invent a priority scheme.
- Use the narrowest useful type, area, surface, feature, and project labels defined by the repository. Avoid decorative label piles.
- Treat readiness labels as operational controls. Add an autonomous-agent or implementation-ready label only when repository policy defines it and all of these are true:
  - The issue can proceed without another product, design, security, migration, or operational decision.
  - Scope and non-goals are explicit.
  - Acceptance criteria and verification are observable.
  - Dependencies are resolved or represented natively.
  - The issue contains enough source pointers to begin without broad rediscovery.
- Use the repository's triage or human-review state when a decision is still needed.
- Use planning-only or specification labels only when the repository defines their behavior. Make those acceptance criteria about the expected plan, not merged code.
- Apply agent-provider, complexity, stacking, or routing labels only when the repository's workflow documents their exact meaning.

## Native GitHub Relationships

Use native sub-issues for hierarchy. A Markdown checklist is useful for readers but is not a substitute for the native relationship.

For sequencing, prefer native `blocked by` relationships over dependency prose. Keep plain-text references in issue bodies for readability, but treat the native graph as authoritative.

Use the commands in [references/issue-templates.md](references/issue-templates.md) to create and verify both relationship types. Resolve database IDs through the API; do not confuse an issue number with its database ID.

When converting a checklist epic, parse only the leading issue reference in each task row. Do not treat issue numbers mentioned in dependency notes as children.

## Issue Quality Bar

An implementation issue is ready only when it has:

- One clear ownership boundary.
- A user-visible or engineering outcome, not merely a list of files to edit.
- Enough evidence and source pointers to start efficiently.
- Observable acceptance criteria.
- A verification contract naming the execution target, expected result, evidence kind, and important degraded or error state.
- Explicit non-goals for scope that could sprawl.
- Dependencies represented and a statement of whether it can merge independently.
- A priority rationale when the repository uses priorities.

A planning issue is ready when an agent or engineer can produce a useful decision document without first asking another human what question to answer. Include the questions, constraints, expected depth of repository investigation, and expected output.

Do not create vague idea tickets, duplicates, tickets unsupported by evidence, or implementation tickets that conceal unresolved strategy decisions. For broad audits, create fewer high-confidence issues instead of one issue per observation.

## Epic Rules

- Keep the parent focused on the shared outcome, sequencing, boundaries, and definition of done. Do not duplicate every child acceptance criterion in the parent.
- Make every child independently deliverable when practical.
- If a child cannot be verified or merged without an unfinished sibling, redefine it around a vertical outcome or add a native dependency.
- Use stacked or sequential execution only when required by real dependencies or repository policy.
- Apply an epic label or parent readiness label only if the target repository defines one.
- Verify the native parent-child graph after creation.

## Reporting

After creating or reorganizing issues, report:

- The parent and child issue numbers with URLs.
- Labels applied and any required label intentionally withheld.
- Whether an implementation-ready or planning-ready state was applied and why.
- Native sub-issue and dependency verification results.
- Existing issues reused instead of duplicated.
- Skipped candidates, unresolved decisions, or permission failures.
