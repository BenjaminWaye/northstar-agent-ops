const fs = require('fs');
const path = require('path');

const leadsPath = path.join(__dirname, '..', 'data', 'crm-leads.json');
const crmStages = [
  'Target identified',
  'Qualified',
  'Outreach drafted',
  'Outreach sent',
  'Replied',
  'Meeting requested',
  'Won/Lost'
];

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith('--')) {
      throw new Error(`Unexpected argument: ${key}. Use --flag value format.`);
    }
    if (typeof value === 'undefined') {
      throw new Error(`Missing value for flag ${key}`);
    }
    args[key.slice(2)] = value;
  }
  return args;
}

function loadLeads() {
  return JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
}

function saveLeads(leads) {
  fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2));
}

function main() {
  const rawArgs = process.argv.slice(2);
  if (rawArgs.length === 0 || rawArgs.includes('--help')) {
    console.log('Usage: node scripts/crm-update-lead.js --company "Company" [--stage "Stage"] [--lastTouch 2026-02-27] [--nextAction "text"] [--notes "text"] [--sourceLink "https://..."] [--tags "tag1,tag2"]');
    process.exit(0);
  }

  if (rawArgs.length % 2 !== 0) {
    throw new Error('Please provide flag and value pairs. Use --help for usage.');
  }

  const args = parseArgs(rawArgs);
  const company = args.company;
  if (!company) {
    throw new Error('Company is required. Example: --company "Telia Cx Labs"');
  }

  const leads = loadLeads();
  const leadIndex = leads.findIndex((lead) => lead.company.toLowerCase() === company.toLowerCase());
  if (leadIndex === -1) {
    throw new Error(`No lead found for company "${company}"`);
  }

  const updates = {};
  const stage = args.stage;
  if (stage) {
    if (!crmStages.includes(stage)) {
      throw new Error(`Stage must be one of: ${crmStages.join(', ')}`);
    }
    updates.stage = stage;
  }

  const fields = ['lastTouch', 'nextAction', 'notes', 'sourceLink'];
  for (const field of fields) {
    if (args[field]) {
      updates[field] = args[field];
    }
  }

  if (args.tags) {
    updates.tags = args.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    if (updates.tags.length === 0) {
      throw new Error('Provide at least one tag when using --tags.');
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('Provide at least one field to update (stage, lastTouch, nextAction, notes, sourceLink, tags).');
  }

  const updatedLead = { ...leads[leadIndex], ...updates };
  leads[leadIndex] = updatedLead;
  saveLeads(leads);
  console.log(`Updated lead for ${updatedLead.company}.`);
}

main();
