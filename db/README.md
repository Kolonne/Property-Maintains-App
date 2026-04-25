# Database

PostgreSQL schema for the Property Maintenance App, hosted on [Neon](https://neon.tech).

## Files

| File | Purpose |
| --- | --- |
| `schema.sql` | All `CREATE TABLE` / index / constraint statements. **Source of truth.** |
| `seed.sql`   | Sample data for development (5 users, 2 properties, 3 units, 2 maintenance requests, etc.) |

## Running these scripts

The easiest way is to paste them into the **Neon SQL Editor**.

### First-time setup (you only do this once)

1. Go to https://console.neon.tech and open the project.
2. Click **SQL Editor** in the left nav.
3. Open `db/schema.sql`, copy the entire contents, paste, click **Run**.
   - It uses `CREATE TABLE IF NOT EXISTS`, so it's safe to re-run.
4. Open `db/seed.sql`, copy, paste, click **Run**.
   - User inserts use `ON CONFLICT DO NOTHING` — safe to re-run.
   - Other inserts will duplicate rows if re-run.

### Resetting the database

Neon's branch feature is the cleanest way to reset:
- Create a new branch from the parent for a clean slate, or
- Run `DROP TABLE IF EXISTS ... CASCADE;` for the tables you want to wipe, then re-run `schema.sql` and `seed.sql`.

> ⚠️ Never paste these against the production DB without checking which branch you're on.

## Table relationships

```
users ─┬─ properties ── units ── tenancies
       ├─ maintenance_requests ── work_orders ── work_order_materials
       │       │                       │
       │       ├─ request_images       └─ contractors
       │       ├─ comments
       │       ├─ notifications
       │       └─ audit_log
       └─ inspections

contractors ── recurring_maintenance
```

**Core flow:** `Property → Unit → Tenancy → Tenant → Maintenance Request → Work Order → Contractor`

## Adding TypeScript types

When you query a table, cast to the matching interface from `src/lib/types.ts`:

```ts
import { getSql } from "@/lib/db";
import type { MaintenanceRequest } from "@/lib/types";

const sql = getSql();
const requests = (await sql`
  SELECT * FROM maintenance_requests
  WHERE status = ${"submitted"}
  ORDER BY submitted_at DESC
`) as MaintenanceRequest[];
```

## Schema changes

If you change a table:
1. Update `db/schema.sql` (the source of truth)
2. Update the matching interface in `src/lib/types.ts`
3. Apply the change to Neon (via SQL Editor)
4. Note the change in your PR description so the team knows to re-pull
