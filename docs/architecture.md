# Architecture & Operating Model

## Data/Control Flow
```text
[Planner] -> creates goals/tasks -> [Task Queue]
[Analyst] -> updates KPI snapshots -> [Metrics Store]
[Engineer/Tester] -> executes tasks -> [PR/CI Events]
[Reviewer] -> approval gates -> [Release Decisions]
[Growth] -> experiment proposals/results -> [Experiment Log]

All agents publish updates to [Shared Group Chat Bus]
Human operator can override via [Control Console]
Dashboard reads from Task Queue + Metrics + PR/Deploy + Risks
```

## Shared Task State Schema
- `task_id`, `title`, `owner_agent_role`, `status`
- `priority`, `northstar_impact_score`, `risk_level`
- `created_at`, `updated_at`, `due_at`
- `blocked_by[]`, `depends_on[]`
- `approval_required` (bool), `approved_by`, `approved_at`
- `escalation_state` (none|warn|critical)

## Decision/Approval Gates
- Gate A (Spec): planner + analyst sign-off
- Gate B (Implementation): engineer + tester pass checks
- Gate C (Release): reviewer/human sign-off if guardrails breached

## Escalation Rules
- Blocked > 24h => warn
- Blocked > 72h or guardrail breach => critical + human page
- 2+ conflicting agent actions on same task => freeze task and request reviewer

## Operating Cadence
- Daily: standup summary, KPI refresh, blocker triage
- Weekly: north-star review, experiment retro, roadmap reprioritization
