# Dashboard MVP Specification

## Boards
1. **Run Status Board**: task states by role, SLA timers, queue depth
2. **KPI Trend Board**: north-star + leading indicators over time
3. **Experiment Board**: hypotheses, status, impact deltas, decisions
4. **PR/Deploy Board**: PR state, CI pass/fail, deploy cadence, rollback count
5. **Blocker/Risk Board**: top blockers, risk heatmap, escalation age

## KPI Model
- North-star metric: **Weekly Active Teams Delivering Value**
- Leading indicators:
  1. Idea-to-PR cycle time
  2. PR merge rate within 48h
  3. Deploy success rate
  4. Experiment win rate
  5. Blocker resolution time

## Baseline/Target Format
- `metric_name`, `baseline_value`, `target_value`, `window`, `owner_role`

## Ingestion Cadence
- Task + run metrics: every 15 min
- PR/deploy events: every 5 min webhook or poll
- KPI snapshots: hourly

## Guardrails / Rollback
- Deploy success rate < 95% over 24h => rollback review required
- Blocker resolution time > 72h median => freeze new experiments
- North-star drops > 15% WoW => incident mode
