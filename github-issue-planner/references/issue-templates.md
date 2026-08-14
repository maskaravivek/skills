# GitHub Issue Templates and Relationship Commands

Use these templates with `gh issue create --body-file`. Delete irrelevant sections and replace every placeholder. Store multi-line bodies in a temporary file created with `mktemp`; do not embed large Markdown bodies directly in shell arguments.

## Task issue

```markdown
Epic: #<parent-number> <!-- omit for a standalone issue -->
Source: <plan, document, audit, issue, PR, file, or evidence link>

## Summary
<One paragraph describing the user-visible or engineering outcome.>

## Scope
- <Concrete change or boundary>
- <Tests, docs, migrations, or rollout work in scope>

## Acceptance criteria
- [ ] <Observable result>
- [ ] <Relevant edge case or non-regression>
- [ ] <Required test, documentation, or rollout result>

## Observable verification
- Execution target: <command, workflow, URL, app, service, or environment>
- Expected result: <externally visible behavior>
- Evidence: <test output, screenshot, recording, log, query result, or other artifact>
- Degraded/error state: <important failure behavior to verify>
- Merge independence: <yes, or blocked by #issue>

## Dependencies
- <Native issue relationships to add, decisions, or "None">

## Non-goals
- <Explicitly out of scope>

## Priority
- Label: <repository-defined priority label, if applicable>
- Rationale: <why this should be scheduled at that priority>
```

## Planning or specification issue

```markdown
Source: <plan, document, audit, issue, PR, file, or evidence link>

## Planning goal
<The decision, architecture, implementation approach, investigation, or ticket breakdown to produce.>

## Context
- <Relevant product or code context>
- <Known constraints and prior decisions>
- <Related issues, docs, PRs, or files>

## Questions to answer
- [ ] <Required question>
- [ ] <Tradeoff or approach to evaluate>
- [ ] <Risk, rollout, migration, security, or compatibility concern>

## Expected output
- <Where the plan should be delivered>
- Relevant existing code and architecture findings.
- Recommended approach, alternatives, and tradeoffs.
- Implementation sequence and likely ownership boundaries.
- Test and verification strategy.
- Open decisions and recommended follow-up tickets.

## Non-goals
- Do not implement code changes unless explicitly requested.

## Priority
- Label: <repository-defined priority label, if applicable>
- Rationale: <why this planning work matters now>
```

## Epic issue

```markdown
Source: <plan, document, audit, issue, or roadmap link>

## Summary
<The shared outcome and why the work belongs together.>

## Child issues
- [ ] #<child> - <short outcome>
- [ ] #<child> - <short outcome>

## Sequencing
- <Parallelization and native dependency notes>

## Definition of done
- [ ] All native sub-issues are closed or otherwise terminal.
- [ ] Cross-issue integration, documentation, migration, and release work is complete.

## Non-goals
- <Boundaries that keep the epic coherent>
```

## Resolve the repository

When inside the target checkout:

```bash
repo="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
```

Otherwise set `repo` to the explicit `OWNER/REPO` supplied by the user.

## Add and verify a native sub-issue

```bash
api_version="2026-03-10"
parent_number=<parent-number>
child_number=<child-number>

child_id="$(gh api \
  -H "X-GitHub-Api-Version: $api_version" \
  "repos/$repo/issues/$child_number" --jq '.id')"

gh api -X POST \
  -H 'Accept: application/vnd.github+json' \
  -H "X-GitHub-Api-Version: $api_version" \
  "repos/$repo/issues/$parent_number/sub_issues" \
  -F sub_issue_id="$child_id"

gh api \
  -H "X-GitHub-Api-Version: $api_version" \
  "repos/$repo/issues/$parent_number/sub_issues" \
  --jq 'map({number,title,state})'
```

## Add and verify a native dependency

The dependent issue is blocked by the blocking issue:

```bash
api_version="2026-03-10"
dependent_number=<dependent-issue-number>
blocking_number=<blocking-issue-number>

blocking_id="$(gh api \
  -H "X-GitHub-Api-Version: $api_version" \
  "repos/$repo/issues/$blocking_number" --jq '.id')"

gh api -X POST \
  -H 'Accept: application/vnd.github+json' \
  -H "X-GitHub-Api-Version: $api_version" \
  "repos/$repo/issues/$dependent_number/dependencies/blocked_by" \
  -F issue_id="$blocking_id"

gh api \
  -H "X-GitHub-Api-Version: $api_version" \
  "repos/$repo/issues/$dependent_number/dependencies/blocked_by" \
  --jq 'map({number,title,state})'
```

The API expects database IDs in `sub_issue_id` and `issue_id`, even though the endpoint paths use issue numbers.
