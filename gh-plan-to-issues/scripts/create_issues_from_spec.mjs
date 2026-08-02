import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  }).trim();
}

function tryRun(cmd, args, opts = {}) {
  try {
    return { ok: true, stdout: run(cmd, args, opts) };
  } catch (err) {
    return {
      ok: false,
      error: err,
      stderr: (err && err.stderr ? String(err.stderr) : "").trim(),
    };
  }
}

function parseArgs(argv) {
  const flags = new Set();
  const positional = [];
  for (const arg of argv) {
    if (arg.startsWith("--")) flags.add(arg);
    else positional.push(arg);
  }
  return { flags, positional };
}

function readJson(filePath) {
  const raw =
    filePath === "-"
      ? fs.readFileSync(0, "utf8") // stdin
      : fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function normalizeRepo(repo) {
  // Accept OWNER/REPO or host/OWNER/REPO; keep as-is if host provided.
  if (!repo || typeof repo !== "string") return null;
  return repo.trim();
}

function inferRepo() {
  const viaGh = tryRun("gh", [
    "repo",
    "view",
    "--json",
    "nameWithOwner",
    "-q",
    ".nameWithOwner",
  ]);
  if (viaGh.ok && viaGh.stdout) return viaGh.stdout;

  const viaGit = tryRun("git", ["remote", "get-url", "origin"]);
  if (viaGit.ok && viaGit.stdout) {
    const url = viaGit.stdout;
    // git@github.com:OWNER/REPO.git or https://github.com/OWNER/REPO.git
    const m =
      url.match(/github\.com[:/](?<owner>[^/]+)\/(?<repo>[^/]+?)(?:\.git)?$/) ??
      null;
    if (m?.groups?.owner && m?.groups?.repo) {
      return `${m.groups.owner}/${m.groups.repo}`;
    }
  }

  return null;
}

function getExistingLabels(repo) {
  // Returns Set<labelName>. Uses pagination.
  const out = run("gh", [
    "api",
    `repos/${repo}/labels`,
    "--paginate",
    "-q",
    ".[].name",
  ]);
  const names = out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set(names);
}

function filterLabels(requested, existingSet) {
  if (!Array.isArray(requested) || requested.length === 0) return [];
  return requested
    .map((l) => String(l).trim())
    .filter(Boolean)
    .filter((l) => existingSet.has(l));
}

function findDuplicateIssues(repo, title) {
  const safeTitle = String(title).replace(/"/g, '\\"');
  const query = `in:title \"${safeTitle}\"`;
  const out = run("gh", [
    "issue",
    "list",
    "-R",
    repo,
    "--state",
    "all",
    "-S",
    query,
    "--json",
    "number,title,url",
  ]);
  const matches = JSON.parse(out);
  return Array.isArray(matches) ? matches : [];
}

function ghCreateIssueViaApi(repo, { title, body, labels }) {
  const args = ["api", "-X", "POST", `repos/${repo}/issues`, "-f", `title=${title}`];
  if (body) args.push("-f", `body=${body}`);
  for (const label of labels ?? []) {
    args.push("-f", `labels[]=${label}`);
  }
  const out = run("gh", args);
  const json = JSON.parse(out);
  return { number: json.number, url: json.html_url };
}

function ghUpdateIssueBodyViaApi(repo, issueNumber, body) {
  run("gh", [
    "api",
    "-X",
    "PATCH",
    `repos/${repo}/issues/${issueNumber}`,
    "-f",
    `body=${body}`,
  ]);
}

function ensureEpicRef(body, epicNumber) {
  const prefix = `Epic: #${epicNumber}`;
  if (!body) return prefix;
  if (body.includes(prefix)) return body;
  return `${prefix}\n\n${body}`;
}

function upsertTasksSection(epicBody, taskNumbers) {
  const tasksBlock =
    "## Tasks\n" + taskNumbers.map((n) => `- [ ] #${n}`).join("\n");

  const body = epicBody ?? "";
  const header = "## Tasks";
  const idx = body.indexOf(header);
  if (idx === -1) {
    return body.trimEnd() + (body.trim() ? "\n\n" : "") + tasksBlock + "\n";
  }

  // Replace existing "## Tasks" section until next "## " header (or end).
  const afterHeaderIdx = idx + header.length;
  const nextHeaderIdx = body.indexOf("\n## ", afterHeaderIdx);
  if (nextHeaderIdx === -1) {
    return body.slice(0, idx).trimEnd() + "\n\n" + tasksBlock + "\n";
  }

  return (
    body.slice(0, idx).trimEnd() + "\n\n" + tasksBlock + "\n\n" + body.slice(nextHeaderIdx + 1)
  );
}

function usage() {
  const script = path.basename(process.argv[1] || "create_issues_from_spec.mjs");
  return [
    `Usage: node scripts/${script} <spec.json> [--dry-run] [--allow-duplicates]`,
    "",
    "Creates exactly 1 epic issue and up to 10 task issues from a JSON spec, then updates",
    "the epic with a checklist referencing the created task issues.",
  ].join("\n");
}

function validateSpec(spec) {
  if (!spec || typeof spec !== "object") {
    throw new Error("Invalid spec: expected a JSON object.");
  }
  if (!spec.epic || typeof spec.epic !== "object") {
    throw new Error("Invalid spec: missing `epic` object.");
  }
  if (!spec.epic.title || typeof spec.epic.title !== "string") {
    throw new Error("Invalid spec: epic.title must be a string.");
  }
  if (!Array.isArray(spec.tasks)) {
    throw new Error("Invalid spec: tasks must be an array.");
  }
  for (const [i, t] of spec.tasks.entries()) {
    if (!t || typeof t !== "object") {
      throw new Error(`Invalid spec: tasks[${i}] must be an object.`);
    }
    if (!t.title || typeof t.title !== "string") {
      throw new Error(`Invalid spec: tasks[${i}].title must be a string.`);
    }
  }
}

function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const dryRun = flags.has("--dry-run");
  const allowDuplicates = flags.has("--allow-duplicates");

  const specPath = positional[0];
  if (!specPath) {
    console.error(usage());
    process.exit(2);
  }

  const spec = readJson(specPath);
  validateSpec(spec);

  const maxTasks = Number(spec.constraints?.maxTasks ?? 10);
  if (!Number.isFinite(maxTasks) || maxTasks < 1) {
    throw new Error("Invalid spec: constraints.maxTasks must be a positive number.");
  }
  if (spec.tasks.length > maxTasks) {
    throw new Error(
      `Spec has ${spec.tasks.length} tasks but maxTasks is ${maxTasks}. Reduce tasks or increase maxTasks.`,
    );
  }

  const repo = normalizeRepo(spec.repo) ?? inferRepo();
  if (!repo) {
    throw new Error(
      "Could not infer repo. Run inside a git repo with a GitHub remote, or set `repo` in the spec as OWNER/REPO.",
    );
  }

  // Preflight: ensure gh auth works (gives a clearer error early).
  const auth = tryRun("gh", ["auth", "status"]);
  if (!auth.ok) {
    throw new Error(
      `gh auth status failed. Log in with: gh auth login\n\n${auth.stderr || ""}`.trim(),
    );
  }

  const existingLabels = getExistingLabels(repo);
  const epicLabels = filterLabels(spec.epic.labels ?? ["epic", "enhancement"], existingLabels);
  const taskDefaultLabels = filterLabels(spec.taskDefaults?.labels ?? ["enhancement"], existingLabels);

  const planned = {
    repo,
    epic: { title: spec.epic.title, labels: epicLabels },
    tasks: spec.tasks.map((t) => ({
      title: t.title,
      labels: filterLabels(t.labels ?? taskDefaultLabels, existingLabels),
    })),
  };

  if (!allowDuplicates) {
    const dupes = [];
    const epicDupes = findDuplicateIssues(repo, spec.epic.title);
    if (epicDupes.length) dupes.push({ kind: "epic", title: spec.epic.title, matches: epicDupes });
    for (const t of spec.tasks) {
      const matches = findDuplicateIssues(repo, t.title);
      if (matches.length) dupes.push({ kind: "task", title: t.title, matches });
    }
    if (dupes.length) {
      const msg = [
        "Duplicate issues detected (use --allow-duplicates to override):",
        ...dupes.flatMap((d) => [
          `- ${d.kind}: ${d.title}`,
          ...d.matches.slice(0, 5).map((m) => `  - #${m.number} ${m.url}`),
        ]),
      ].join("\n");
      throw new Error(msg);
    }
  }

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, planned }, null, 2));
    return;
  }

  const epic = ghCreateIssueViaApi(repo, {
    title: spec.epic.title,
    body: spec.epic.body ?? "",
    labels: epicLabels,
  });

  const createdTasks = [];
  for (const t of spec.tasks) {
    const baseBody = t.body ?? "";
    const bodyWithEpic = ensureEpicRef(baseBody, epic.number);
    const labels = filterLabels(
      t.labels ?? taskDefaultLabels,
      existingLabels,
    );

    const created = ghCreateIssueViaApi(repo, {
      title: t.title,
      body: bodyWithEpic,
      labels,
    });
    createdTasks.push(created);
  }

  const taskNumbers = createdTasks.map((t) => t.number);
  const updatedEpicBody = upsertTasksSection(spec.epic.body ?? "", taskNumbers);
  ghUpdateIssueBodyViaApi(repo, epic.number, updatedEpicBody);

  console.log(
    JSON.stringify(
      {
        repo,
        epic,
        tasks: createdTasks,
      },
      null,
      2,
    ),
  );
}

main();
