const fs = require('fs');
const path = require('path');

const leadsPath = path.join(__dirname, '..', 'data', 'crm-leads.json');
const dashboardPath = path.join(__dirname, '..', 'data', 'dashboard-sample.json');
const crmStages = [
  'Target identified',
  'Qualified',
  'Outreach drafted',
  'Outreach sent',
  'Replied',
  'Meeting requested',
  'Won/Lost'
];
const requiredColumns = [
  'company',
  'contactRole',
  'stage',
  'lastTouch',
  'nextAction',
  'notes',
  'tags',
  'sourceLink'
];

function validateLead(lead, index) {
  for (const field of requiredColumns) {
    if (!Object.prototype.hasOwnProperty.call(lead, field)) {
      throw new Error(`Lead at index ${index} is missing field: ${field}`);
    }
  }
  if (!crmStages.includes(lead.stage)) {
    throw new Error(`Lead at index ${index} has invalid stage: ${lead.stage}`);
  }
  if (!Array.isArray(lead.tags) || lead.tags.length === 0) {
    throw new Error(`Lead at index ${index} must include at least one Swedish-market tag.`);
  }
  if (typeof lead.sourceLink !== 'string' || !lead.sourceLink.startsWith('http')) {
    throw new Error(`Lead at index ${index} must include a valid sourceLink.`);
  }
}

function main() {
  const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
  if (!Array.isArray(leads) || leads.length < 10) {
    throw new Error('CRM requires at least 10 leads to render the dashboard.');
  }

  leads.forEach(validateLead);

  const pipeline = crmStages.map((stage) => {
    const stageLeads = leads.filter((lead) => lead.stage === stage);
    return {
      stage,
      count: stageLeads.length,
      companies: stageLeads.map((lead) => lead.company)
    };
  });

  const uniqueTags = Array.from(
    new Set(
      leads.flatMap((lead) => (Array.isArray(lead.tags) ? lead.tags : []))
    )
  ).sort((a, b) => a.localeCompare(b));

  const crmSection = {
    tableColumns: [
      'Company',
      'Contact Role',
      'Stage',
      'Last Touch',
      'Next Action',
      'Notes',
      'Tags',
      'Source Link'
    ],
    stages: crmStages,
    pipeline,
    leads,
    metadata: {
      totalLeads: leads.length,
      updatedAt: new Date().toISOString(),
      tags: uniqueTags,
      source: 'data/crm-leads.json',
      swedishMarket: true
    }
  };

  const dashboard = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));
  dashboard.crm = crmSection;
  fs.writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));
  console.log('CRM section synced to dashboard sample.');
}

main();
