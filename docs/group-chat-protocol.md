# Group Chat Collaboration Protocol

## Message Contract
```json
{
  "timestamp": "ISO-8601",
  "agent_role": "planner|analyst|engineer|tester|reviewer|growth",
  "task_id": "TASK-123",
  "message_type": "status|decision|blocker|handoff|metric_update|escalation",
  "summary": "short update",
  "details": "markdown-compatible body",
  "requires_action": true,
  "action_owner": "reviewer",
  "deadline": "ISO-8601|null",
  "confidence": 0.0,
  "references": ["PR#10", "dashboard:kpi:activation_rate"]
}
```

## Conflict Resolution
1. Detect conflict (same task, incompatible decisions within 2h window).
2. Auto-open `CONFLICT` thread with both positions and evidence.
3. Reviewer mediates within SLA (4h).
4. If unresolved, escalate to human override.

## Human Override Controls
- Pause/resume agent role
- Force task owner reassignment
- Approve/deny gate manually
- Trigger rollback and lock further deploys

## Summary Cadence
- Hourly rolling summary for active incidents
- Daily digest for all open tasks and metric movements
- Weekly executive summary (north-star and leading indicators)
