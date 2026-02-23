const fs = require('fs');
const path = 'data/dashboard-sample.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const requiredTop = ['northStar', 'leadingIndicators', 'boards'];
for (const k of requiredTop) {
  if (!(k in data)) {
    console.error(`Missing top-level key: ${k}`);
    process.exit(1);
  }
}
if (!Array.isArray(data.leadingIndicators) || data.leadingIndicators.length < 3) {
  console.error('leadingIndicators must contain at least 3 items');
  process.exit(1);
}
console.log('Dashboard sample data validation passed.');
