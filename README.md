# Northstar Agent Ops

Bootstrap implementation for a North-Star Multi-Agent Ops MVP for Rinderr.

## Quickstart
```bash
npm install
npm run build
npm test
```

## CRM Module (CallMyCall)
The dashboard now ships with a minimal CRM workspace for CallMyCall sales. Data lives in `data/crm-leads.json` and is rendered into the dashboard sample via `npm run crm:sync` (which runs `scripts/update-crm-dashboard.js`).

### Leads table & pipeline
- Columns: Company, Contact Role, Stage, Last Touch, Next Action, Notes, Swedish-market Tags, Source Link.
- Pipeline stages: Target identified → Qualified → Outreach drafted → Outreach sent → Replied → Meeting requested → Won/Lost.
- Run `npm run crm:sync` after editing leads to refresh the CRM section inside `data/dashboard-sample.json` so the dashboard reflects the latest state.

### Updating leads
1. **Quick edit:** Modify `data/crm-leads.json` directly (at least 10 Swedish-market leads must be present).
2. **Scripted update:**
   ```bash
   node scripts/crm-update-lead.js \
     --company "Telia Cx Labs" \
     --stage "Qualified" \
     --lastTouch 2026-02-27 \
     --nextAction "Send security one-pager"
   ```
   Optional flags: `--notes`, `--sourceLink`, `--tags "Telecom,Stockholm"`.
3. Re-run `npm run crm:sync` to regenerate pipeline counts and embed the refreshed dataset into the dashboard sample.

## Docs
- `docs/implementation-plan.md`
- `docs/architecture.md`
- `docs/group-chat-protocol.md`
- `docs/dashboard-spec.md`
- `docs/task-queue-schema.md`
- `docs/backlog.md`
