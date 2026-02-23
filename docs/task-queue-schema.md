# Task Queue Schema (SQLite MVP)

```sql
CREATE TABLE tasks (
  task_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  owner_agent_role TEXT NOT NULL,
  status TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 3,
  northstar_impact_score REAL DEFAULT 0,
  risk_level TEXT DEFAULT 'medium',
  approval_required INTEGER DEFAULT 0,
  approved_by TEXT,
  approved_at TEXT,
  escalation_state TEXT DEFAULT 'none',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  due_at TEXT
);

CREATE TABLE task_dependencies (
  task_id TEXT NOT NULL,
  depends_on_task_id TEXT NOT NULL,
  PRIMARY KEY (task_id, depends_on_task_id)
);

CREATE TABLE chat_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  agent_role TEXT NOT NULL,
  task_id TEXT,
  message_type TEXT NOT NULL,
  payload_json TEXT NOT NULL
);
```

## Cron Strategy
- `*/5 * * * *` sync PR/deploy events
- `*/15 * * * *` reconcile task state + SLA checks
- `0 * * * *` KPI aggregation and snapshot write
- `0 8 * * 1` weekly planning packet generation
