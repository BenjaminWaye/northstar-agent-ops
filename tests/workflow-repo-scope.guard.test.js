const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  REQUIRED_REPO_PATH,
  WORKFLOW_STEP_FILES,
  checkWorkflowRepoScope
} = require('../scripts/check-workflow-repo-scope.js');

function mkTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-scope-'));
}

function writeFile(base, rel, content) {
  const out = path.join(base, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
}

test('guard passes when required workflow files include required repo path', () => {
  const dir = mkTempDir();

  for (const rel of WORKFLOW_STEP_FILES) {
    writeFile(dir, rel, `Repo: ${REQUIRED_REPO_PATH}\n`);
  }
  writeFile(dir, 'scripts/local-check.js', 'console.log("ok")\n');

  const violations = checkWorkflowRepoScope(dir);
  assert.equal(violations.length, 0);
});

test('guard fails when forbidden repo identifier appears in workflow file', () => {
  const dir = mkTempDir();

  for (const rel of WORKFLOW_STEP_FILES) {
    writeFile(dir, rel, `Repo: ${REQUIRED_REPO_PATH}\n`);
  }
  const forbiddenToken = ['rinderr', 'gemstone', 'hub'].join('-');
  writeFile(dir, 'scripts/bad.js', `const s = "${forbiddenToken}";\n`);

  const violations = checkWorkflowRepoScope(dir);
  assert.ok(violations.some((v) => v.includes('Forbidden repo identifier')));
});

test('guard fails when a workflow step file is missing required repo path', () => {
  const dir = mkTempDir();

  for (const rel of WORKFLOW_STEP_FILES) {
    writeFile(dir, rel, 'Repo: /tmp/other\n');
  }

  const violations = checkWorkflowRepoScope(dir);
  assert.ok(violations.some((v) => v.includes('missing required repo path')));
});
