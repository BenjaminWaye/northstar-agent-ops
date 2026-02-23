const fs = require('fs');
const path = require('path');

const REQUIRED_REPO_PATH = '/Users/benjaminwaye/.openclaw/workspace/northstar-agent-ops';
const FORBIDDEN_IDENTIFIERS = [['rinderr', 'gemstone', 'hub'].join('-')];
const WORKFLOW_STEP_FILES = [
  'workflows/planner.md',
  'workflows/setup.md',
  'workflows/develop.md',
  'workflows/verify.md',
  'workflows/test.md',
  'workflows/pr.md',
  'workflows/review.md'
];

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function checkWorkflowRepoScope(baseDir = process.cwd()) {
  const violations = [];
  const stepFiles = WORKFLOW_STEP_FILES.map((rel) => path.join(baseDir, rel));

  for (const stepFile of stepFiles) {
    if (!fs.existsSync(stepFile)) {
      violations.push(`Missing required workflow step file: ${path.relative(baseDir, stepFile)}`);
      continue;
    }
    const content = fs.readFileSync(stepFile, 'utf8');
    if (!content.includes(REQUIRED_REPO_PATH)) {
      violations.push(
        `Workflow step missing required repo path (${REQUIRED_REPO_PATH}): ${path.relative(baseDir, stepFile)}`
      );
    }
  }

  const scanDirs = ['workflows', 'scripts'];
  const scanExt = new Set(['.md', '.js', '.json', '.yml', '.yaml', '.txt']);
  for (const relDir of scanDirs) {
    const absDir = path.join(baseDir, relDir);
    for (const file of walkFiles(absDir)) {
      if (!scanExt.has(path.extname(file))) continue;
      const content = fs.readFileSync(file, 'utf8');
      for (const forbidden of FORBIDDEN_IDENTIFIERS) {
        if (content.includes(forbidden)) {
          violations.push(
            `Forbidden repo identifier "${forbidden}" found in ${path.relative(baseDir, file)}`
          );
        }
      }
    }
  }

  return violations;
}

function main() {
  const violations = checkWorkflowRepoScope(process.cwd());
  if (violations.length) {
    console.error('Workflow repo-scope guard failed:');
    for (const v of violations) console.error(`- ${v}`);
    process.exit(1);
  }
  console.log('Workflow repo-scope guard passed.');
}

if (require.main === module) {
  main();
}

module.exports = {
  REQUIRED_REPO_PATH,
  FORBIDDEN_IDENTIFIERS,
  WORKFLOW_STEP_FILES,
  checkWorkflowRepoScope
};
