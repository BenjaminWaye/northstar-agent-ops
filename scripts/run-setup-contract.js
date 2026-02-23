const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { REQUIRED_REPO_PATH } = require('./check-workflow-repo-scope.js');

const MIN_NODE_MAJOR = 22;
const LOG_DIR = path.join('data', 'logs');
const MARKER_FILE = path.join('data', 'setup-step-result.json');
const LOG_FILE = path.join(LOG_DIR, 'setup-step.log');

function ensureDirFor(filePath, fsObj) {
  fsObj.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeResult(baseDir, status, details, fsObj = fs) {
  const markerPath = path.join(baseDir, MARKER_FILE);
  ensureDirFor(markerPath, fsObj);
  fsObj.writeFileSync(
    markerPath,
    `${JSON.stringify({ status, details, timestamp: new Date().toISOString() }, null, 2)}\n`
  );
}

function appendLog(baseDir, line, fsObj = fs) {
  const logPath = path.join(baseDir, LOG_FILE);
  ensureDirFor(logPath, fsObj);
  fsObj.appendFileSync(logPath, `${line}\n`);
}

function validateRepoRoot(baseDir) {
  const resolved = path.resolve(baseDir);
  if (resolved !== REQUIRED_REPO_PATH) {
    throw new Error(
      [
        'SETUP_CONTRACT_ERROR: invalid repository root.',
        `Expected: ${REQUIRED_REPO_PATH}`,
        `Got: ${resolved}`,
        'Remediation: run setup from the northstar-agent-ops repo root and do not cd into external repos.'
      ].join(' ')
    );
  }
}

function validateNodeVersion(nodeVersion) {
  const major = Number.parseInt(nodeVersion.replace(/^v/, '').split('.')[0], 10);
  if (!Number.isFinite(major) || major < MIN_NODE_MAJOR) {
    throw new Error(
      [
        `SETUP_CONTRACT_ERROR: unsupported Node.js version (${nodeVersion}).`,
        `Remediation: install Node.js v${MIN_NODE_MAJOR}+ (for example: nvm install ${MIN_NODE_MAJOR} && nvm use ${MIN_NODE_MAJOR}).`
      ].join(' ')
    );
  }
}

function runInstall(baseDir, execCmd = execFileSync) {
  try {
    execCmd('npm', ['install', '--no-audit', '--no-fund'], {
      cwd: baseDir,
      stdio: 'pipe',
      encoding: 'utf8'
    });
  } catch (error) {
    const stderr = error && error.stderr ? String(error.stderr).trim() : '';
    const stdout = error && error.stdout ? String(error.stdout).trim() : '';
    throw new Error(
      [
        'SETUP_CONTRACT_ERROR: npm install failed.',
        'Remediation: verify network access, npm registry credentials, and package-lock consistency.',
        stdout ? `stdout: ${stdout}` : '',
        stderr ? `stderr: ${stderr}` : ''
      ]
        .filter(Boolean)
        .join(' ')
    );
  }
}

function executeSetupContract(options = {}) {
  const baseDir = options.baseDir || process.cwd();
  const fsObj = options.fsObj || fs;
  const nodeVersion = (options.processObj || process).version;
  const execCmd = options.execCmd || execFileSync;

  appendLog(baseDir, 'SETUP_CONTRACT_STATUS: started', fsObj);

  try {
    validateRepoRoot(baseDir);
    appendLog(baseDir, `SETUP_CONTRACT_CHECK: repo_root=${path.resolve(baseDir)}`, fsObj);

    validateNodeVersion(nodeVersion);
    appendLog(baseDir, `SETUP_CONTRACT_CHECK: node_version=${nodeVersion}`, fsObj);

    runInstall(baseDir, execCmd);
    appendLog(baseDir, 'SETUP_CONTRACT_CHECK: npm_install=ok', fsObj);

    const successDetails = {
      repoRoot: path.resolve(baseDir),
      nodeVersion,
      installCommand: 'npm install --no-audit --no-fund',
      logFile: LOG_FILE
    };
    writeResult(baseDir, 'success', successDetails, fsObj);
    appendLog(baseDir, 'SETUP_CONTRACT_STATUS: success', fsObj);

    return { ok: true, details: successDetails };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeResult(baseDir, 'failure', { error: message, logFile: LOG_FILE }, fsObj);
    appendLog(baseDir, `SETUP_CONTRACT_STATUS: failure ${message}`, fsObj);
    return { ok: false, error: message };
  }
}

function main() {
  const result = executeSetupContract();
  if (!result.ok) {
    console.error(result.error);
    process.exit(1);
  }
  console.log('Setup contract passed.');
}

if (require.main === module) {
  main();
}

module.exports = {
  MIN_NODE_MAJOR,
  LOG_FILE,
  MARKER_FILE,
  executeSetupContract,
  validateNodeVersion,
  validateRepoRoot
};
