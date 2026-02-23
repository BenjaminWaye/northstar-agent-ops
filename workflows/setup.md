# Setup Step Input

Repository path: `/Users/benjaminwaye/.openclaw/workspace/northstar-agent-ops`

Run all setup actions in this repository only.
Create and manage branches only within this repository.

## Executable Setup Contract

Run from repo root only:

```bash
npm run setup:contract
```

Command sequence executed by the contract:
1. Validate current working directory is exactly `/Users/benjaminwaye/.openclaw/workspace/northstar-agent-ops`
2. Validate Node.js major version is `>= 22`
3. Run `npm install --no-audit --no-fund`

Success markers (machine-checkable):
- `data/setup-step-result.json` contains `"status": "success"`
- `data/logs/setup-step.log` contains `SETUP_CONTRACT_STATUS: success`

Failure markers (machine-checkable):
- `data/setup-step-result.json` contains `"status": "failure"`
- `data/logs/setup-step.log` contains `SETUP_CONTRACT_STATUS: failure ...`
- stderr includes actionable remediation hints for repo-root mismatch, unsupported Node version, or npm install failure
