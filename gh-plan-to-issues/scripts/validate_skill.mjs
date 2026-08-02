import fs from "node:fs";
import path from "node:path";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function ok(message) {
  console.log(`[OK] ${message}`);
}

function readFile(p) {
  return fs.readFileSync(p, "utf8");
}

function exists(p) {
  return fs.existsSync(p);
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---\n")) return null;
  const end = markdown.indexOf("\n---\n", 4);
  if (end === -1) return null;
  const fm = markdown.slice(4, end);
  const rest = markdown.slice(end + "\n---\n".length);
  return { frontmatter: fm, body: rest };
}

function getYamlScalar(frontmatter, key) {
  // Minimal YAML: supports `key: value` and folded `key: >-` with indented lines.
  const lines = frontmatter.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(new RegExp(`^${key}:\\s*(.*)$`));
    if (!m) continue;
    const value = m[1];
    if (value === ">-" || value === ">" || value === "|-" || value === "|") {
      const parts = [];
      for (let j = i + 1; j < lines.length; j++) {
        const l = lines[j];
        if (!l.startsWith("  ")) break;
        parts.push(l.slice(2));
      }
      return parts.join("\n").trim();
    }
    return value.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }
  return null;
}

function main() {
  const skillDir = path.resolve(process.argv[2] ?? process.cwd());
  const skillName = path.basename(skillDir);

  const skillMd = path.join(skillDir, "SKILL.md");
  if (!exists(skillMd)) fail(`Missing ${skillMd}`);
  const skillText = readFile(skillMd);
  const fmParsed = parseFrontmatter(skillText);
  if (!fmParsed) fail(`Invalid frontmatter in ${skillMd} (expected --- ... ---)`);

  const name = getYamlScalar(fmParsed.frontmatter, "name");
  const description = getYamlScalar(fmParsed.frontmatter, "description");
  if (!name) fail(`Missing 'name' in ${skillMd} frontmatter`);
  if (!description) fail(`Missing 'description' in ${skillMd} frontmatter`);
  if (name !== skillName) {
    fail(
      `SKILL.md frontmatter name (${name}) does not match folder name (${skillName})`,
    );
  }
  ok(`SKILL.md frontmatter ok (${name})`);

  const openAiYaml = path.join(skillDir, "agents", "openai.yaml");
  if (!exists(openAiYaml)) fail(`Missing ${openAiYaml}`);
  const openAiText = readFile(openAiYaml);
  if (!openAiText.includes("interface:")) fail(`Missing 'interface:' in ${openAiYaml}`);
  if (!openAiText.includes("display_name:")) fail(`Missing 'display_name' in ${openAiYaml}`);
  if (!openAiText.includes("short_description:")) fail(`Missing 'short_description' in ${openAiYaml}`);
  if (!openAiText.includes("default_prompt:")) fail(`Missing 'default_prompt' in ${openAiYaml}`);
  ok(`agents/openai.yaml ok`);

  const createScript = path.join(skillDir, "scripts", "create_issues_from_spec.mjs");
  if (!exists(createScript)) fail(`Missing ${createScript}`);
  ok(`scripts/create_issues_from_spec.mjs present`);

  const specExample = path.join(skillDir, "references", "spec.example.json");
  if (!exists(specExample)) fail(`Missing ${specExample}`);
  try {
    JSON.parse(readFile(specExample));
  } catch {
    fail(`Invalid JSON in ${specExample}`);
  }
  ok(`references/spec.example.json ok`);

  ok("Skill validation passed.");
}

main();

