import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const flags = new Map();
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      positional.push(a);
      continue;
    }
    const key = a;
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      flags.set(key, next);
      i++;
    } else {
      flags.set(key, true);
    }
  }
  return { flags, positional };
}

function usage() {
  const script = path.basename(process.argv[1] || "spec_from_markdown.mjs");
  return [
    `Usage: node scripts/${script} <plan.md|-> [--repo OWNER/REPO] [--max-tasks 10]`,
    "",
    "Converts a Markdown plan/proposal into a JSON spec consumable by create_issues_from_spec.mjs.",
    "This is best-effort parsing; review the output before creating issues.",
  ].join("\n");
}

function readInput(inputPath) {
  if (inputPath === "-") return fs.readFileSync(0, "utf8");
  return fs.readFileSync(inputPath, "utf8");
}

function firstNonEmptyLine(text) {
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (t) return t;
  }
  return "";
}

function extractEpicTitle(md) {
  // Prefer first H1 heading.
  const h1 = md.match(/^#\s+(.+)\s*$/m);
  if (h1?.[1]) return h1[1].trim();

  // Fallback: explicit "Epic:" prefix.
  const epic = md.match(/^\s*Epic:\s*(.+)\s*$/mi);
  if (epic?.[1]) return `Epic: ${epic[1].trim()}`;

  // Fallback: first non-empty line, truncated.
  const line = firstNonEmptyLine(md);
  return line.length > 80 ? line.slice(0, 77) + "…" : line;
}

function splitOnTasksSection(md) {
  // Returns [beforeTasks, tasksAndAfter] if a Tasks header exists.
  const m = md.match(/^\s*##\s+Tasks\s*$/m);
  if (!m || m.index == null) return [md, ""];
  const idx = m.index;
  return [md.slice(0, idx).trimEnd(), md.slice(idx).trim()];
}

function extractTaskTitles(md, maxTasks) {
  // Prefer task list items: - [ ] Title or - Title
  const lines = md.split("\n");
  const titles = [];
  for (const line of lines) {
    const m =
      line.match(/^\s*-\s*\[\s*[xX ]\s*\]\s+(.+?)\s*$/) ||
      line.match(/^\s*-\s+(.+?)\s*$/);
    if (!m?.[1]) continue;
    const title = m[1].trim();
    if (!title) continue;
    titles.push(title);
    if (titles.length >= maxTasks) break;
  }

  if (titles.length) return titles;

  // Fallback: headings like "## Task: ..." or "### Task: ..."
  for (const m of md.matchAll(/^\s*#{2,4}\s+(?:Task:?\s*)?(.+?)\s*$/gim)) {
    const title = String(m[1] ?? "").trim();
    if (!title) continue;
    titles.push(title);
    if (titles.length >= maxTasks) break;
  }

  return titles;
}

function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const inputPath = positional[0];
  if (!inputPath) {
    console.error(usage());
    process.exit(2);
  }

  const repo = typeof flags.get("--repo") === "string" ? flags.get("--repo") : undefined;
  const maxTasksRaw = flags.get("--max-tasks");
  const maxTasks = Number.isFinite(Number(maxTasksRaw)) ? Number(maxTasksRaw) : 10;

  const md = readInput(inputPath);
  const epicTitle = extractEpicTitle(md) || "Epic: <title>";
  const [epicBodyPre, tasksSection] = splitOnTasksSection(md);

  const tasksTitles = extractTaskTitles(tasksSection || md, maxTasks);
  const tasks =
    tasksTitles.length > 0
      ? tasksTitles.map((t, i) => ({
          title: t,
          body: `## Summary\n\n## Scope\n\n## Acceptance Criteria\n\n## Test Plan\n`,
        }))
      : Array.from({ length: Math.min(1, maxTasks) }).map((_, i) => ({
          title: `Task ${i + 1}: <title>`,
          body: `## Summary\n\n## Scope\n\n## Acceptance Criteria\n\n## Test Plan\n`,
        }));

  const spec = {
    ...(repo ? { repo } : {}),
    constraints: { maxTasks },
    epic: {
      title: epicTitle,
      labels: ["epic", "enhancement"],
      body:
        epicBodyPre.trim() ||
        "## Goal\n\n## Definition of Done\n\n## Tasks\n- [ ] (autofilled by script)\n",
    },
    taskDefaults: {
      labels: ["enhancement"],
    },
    tasks,
  };

  process.stdout.write(JSON.stringify(spec, null, 2) + "\n");
}

main();

