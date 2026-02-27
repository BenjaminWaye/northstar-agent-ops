const fs = require('fs');

const dashboardPath = 'data/dashboard-sample.json';
const crmLeadsPath = 'data/crm-leads.json';
const crmStages = [
  'Target identified',
  'Qualified',
  'Outreach drafted',
  'Outreach sent',
  'Replied',
  'Meeting requested',
  'Won/Lost'
];
const crmLeadFields = [
  'company',
  'contactRole',
  'stage',
  'lastTouch',
  'nextAction',
  'notes',
  'tags',
  'sourceLink'
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function validateTopLevel(data) {
  const requiredTop = ['northStar', 'leadingIndicators', 'boards'];
  for (const key of requiredTop) {
    if (!(key in data)) {
      fail(`Missing top-level key: ${key}`);
    }
  }
  if (!Array.isArray(data.leadingIndicators) || data.leadingIndicators.length < 3) {
    fail('leadingIndicators must contain at least 3 items');
  }
}

function validateCrm(dashboard, crmLeads) {
  if (!dashboard.crm) {
    fail('CRM section missing from dashboard sample data.');
  }
  const crm = dashboard.crm;
  if (!Array.isArray(crm.leads) || crm.leads.length < 10) {
    fail('CRM section must include at least 10 leads.');
  }
  crm.leads.forEach((lead, idx) => {
    for (const field of crmLeadFields) {
      if (!Object.prototype.hasOwnProperty.call(lead, field)) {
        fail(`CRM lead at index ${idx} missing field: ${field}`);
      }
    }
    if (!crmStages.includes(lead.stage)) {
      fail(`CRM lead at index ${idx} has invalid stage: ${lead.stage}`);
    }
    if (!Array.isArray(lead.tags) || lead.tags.length === 0) {
      fail(`CRM lead at index ${idx} must have at least one Swedish-market tag.`);
    }
    if (typeof lead.sourceLink !== 'string' || !lead.sourceLink.startsWith('http')) {
      fail(`CRM lead at index ${idx} has invalid sourceLink.`);
    }
  });

  if (!Array.isArray(crm.pipeline) || crm.pipeline.length !== crmStages.length) {
    fail('CRM pipeline must include each defined stage.');
  }
  crm.pipeline.forEach((stageEntry, idx) => {
    if (stageEntry.stage !== crmStages[idx]) {
      fail(`CRM pipeline entry ${idx} expected stage ${crmStages[idx]} but found ${stageEntry.stage}`);
    }
    if (typeof stageEntry.count !== 'number') {
      fail(`CRM pipeline entry ${stageEntry.stage} missing numeric count.`);
    }
  });

  if (!Array.isArray(crm.tableColumns) || crm.tableColumns.length < 6) {
    fail('CRM tableColumns must list the lead table headers.');
  }

  if (!crm.metadata || crm.metadata.source !== 'data/crm-leads.json') {
    fail('CRM metadata must include source reference to data/crm-leads.json.');
  }

  if (JSON.stringify(crm.leads) !== JSON.stringify(crmLeads)) {
    fail('CRM leads embedded in dashboard do not match data/crm-leads.json. Run npm run crm:sync.');
  }
}

function main() {
  const dashboard = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));
  const crmLeads = JSON.parse(fs.readFileSync(crmLeadsPath, 'utf8'));
  validateTopLevel(dashboard);
  validateCrm(dashboard, crmLeads);
  console.log('Dashboard + CRM data validation passed.');
}

main();
