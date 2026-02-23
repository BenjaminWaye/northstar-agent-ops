const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { REQUIRED_REPO_PATH } = require('../scripts/check-workflow-repo-scope.js');
const {
  executeSetupContract,
  MARKER_FILE,
  LOG_FILE,
  MIN_NODE_MAJOR
} = require('../scripts/run-setup-contract.js');

function mkTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'setup-contract-'));
}

test('setup contract succeeds and writes success markers', () => {
  const writes = [];
  const appends = [];
  const fsObj = {
    mkdirSync: () => {},
    writeFileSync: (file, content) => writes.push({ file, content }),
    appendFileSync: (file, content) => appends.push({ file, content })
  };

  const result = executeSetupContract({
    baseDir: REQUIRED_REPO_PATH,
    processObj: { version: `v${MIN_NODE_MAJOR}.0.0` },
    fsObj,
    execCmd: () => {}
  });

  assert.equal(result.ok, true);
  assert.ok(writes.some((w) => w.file.endsWith(MARKER_FILE) && w.content.includes('"status": "success"')));
  assert.ok(appends.some((a) => a.file.endsWith(LOG_FILE) && a.content.includes('SETUP_CONTRACT_STATUS: success')));
});

test('setup contract fails outside required repo root with remediation hint', () => {
  const dir = mkTempDir();
  const result = executeSetupContract({
    baseDir: dir,
    processObj: { version: `v${MIN_NODE_MAJOR}.0.0` },
    execCmd: () => {}
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /run setup from the northstar-agent-ops repo root/i);
});

test('setup contract fails on unsupported Node version with remediation hint', () => {
  const result = executeSetupContract({
    baseDir: REQUIRED_REPO_PATH,
    processObj: { version: 'v18.19.0' },
    execCmd: () => {}
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /install Node\.js v22\+/i);
});

test('setup contract surfaces npm install failures with actionable guidance', () => {
  const result = executeSetupContract({
    baseDir: REQUIRED_REPO_PATH,
    processObj: { version: `v${MIN_NODE_MAJOR}.0.0` },
    execCmd: () => {
      const err = new Error('install failed');
      err.stderr = 'network timeout';
      throw err;
    }
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /npm install failed/i);
  assert.match(result.error, /verify network access/i);
  assert.match(result.error, /network timeout/i);
});
