const fs = require('fs');
const required = [
  'README.md',
  'docs/implementation-plan.md',
  'docs/architecture.md',
  'docs/group-chat-protocol.md',
  'docs/dashboard-spec.md',
  'docs/task-queue-schema.md',
  'docs/backlog.md',
  'data/dashboard-sample.json'
];
const missing = required.filter((p) => !fs.existsSync(p));
if (missing.length) {
  console.error('Missing required bootstrap files:\n' + missing.join('\n'));
  process.exit(1);
}
console.log('Build check passed. All required bootstrap artifacts exist.');
