# Database Query Tests

This document accompanies the test harness at `scripts/test-db-queries.mjs`
and the Trello card **DB: Test Basic Read/Write/Update Queries**.

## Purpose

Confirm that the application can connect to the Neon Postgres database and
successfully **read**, **write**, and **update** data using the same client
the application code uses (`@neondatabase/serverless`) — before the UI is
wired to live data.

## How to run

```bash
npm run db:test
```

The script self-contains everything it needs (it inserts its own test row
and then deletes it), so it can be run repeatedly without polluting the
seed data.

## What the script tests

| Step | Operation | Tables touched |
| ---- | --------- | -------------- |
| 1 | READ — list all users | `users` |
| 2 | READ — properties joined to owner + manager | `properties`, `users` |
| 3 | READ — list all maintenance requests | `maintenance_requests` |
| 4 | CREATE — insert a new maintenance request | `maintenance_requests` |
| 5 | UPDATE — change status `submitted → acknowledged`, write audit row | `maintenance_requests`, `audit_log` |
| 6 | READ-AFTER-WRITE — fetch the updated row | `maintenance_requests` |
| 7 | RE-READ — second query joins the audit row back | `maintenance_requests`, `audit_log` |
| ⌫ | CLEANUP — delete the test request | `maintenance_requests` (cascades to `audit_log`) |

## How the queries work — code breakdown

### Connecting to the database

```js
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
```

`neon()` returns a tagged template-literal function. Every call sends a
single HTTP request to Neon's serverless endpoint — there is no
long-lived TCP connection to manage, which is exactly what Next.js
serverless route handlers need.

### Reading rows (Step 1)

```js
const users = await sql`
  SELECT user_id, email, first_name, last_name, role
  FROM users
  ORDER BY user_id
`;
```

Because `sql` is a tagged template, the SQL string is sent **without**
any user-supplied values interpolated as text. Any expression placed
inside `${ ... }` is sent as a parameter, never as raw SQL — this gives
us automatic protection against SQL injection.

### Joining across tables (Step 2)

```js
const properties = await sql`
  SELECT
    p.property_id,
    p.address,
    o.email AS owner_email,
    m.email AS manager_email
  FROM properties p
  LEFT JOIN users o ON o.user_id = p.owner_id
  LEFT JOIN users m ON m.user_id = p.manager_id
  ORDER BY p.property_id
`;
```

Two `LEFT JOIN`s onto the same `users` table demonstrate that each
property correctly links to both the **landlord** (owner) and the
**property manager** (manager) — the relationships introduced in
migration v3.

### Inserting a row and getting its new ID (Step 4)

```js
const inserted = await sql`
  INSERT INTO maintenance_requests
    (unit_id, reported_by, title, description, category, priority, status)
  VALUES
    (${target.unit_id},
     ${target.current_tenant_id},
     'TEST: Front gate squeaking',
     'Inserted by scripts/test-db-queries.mjs — safe to delete.',
     'general',
     'low',
     'submitted')
  RETURNING request_id, title, status, submitted_at
`;
const newRequestId = inserted[0].request_id;
```

`RETURNING` is the Postgres way to read columns from an `INSERT`/`UPDATE`
in a single round-trip. We use the returned `request_id` to drive the
follow-up update.

### Updating + recording history (Step 5)

```js
await sql`
  UPDATE maintenance_requests
  SET status          = 'acknowledged',
      acknowledged_at = NOW()
  WHERE request_id = ${newRequestId}
  RETURNING request_id, status, acknowledged_at
`;

await sql`
  INSERT INTO audit_log (request_id, changed_by, old_status, new_status, notes)
  VALUES
    (${newRequestId}, ${target.current_tenant_id},
     'submitted', 'acknowledged',
     'Status change recorded by db:test harness')
`;
```

The application will always pair a status `UPDATE` with an `audit_log`
`INSERT` so the request-history view stays in sync. The two statements
are ordinary SQL queries here; in production code they should be wrapped
in a transaction.

### Read-after-write (Steps 6 + 7)

Reading the row immediately (Step 6) verifies that the change is visible
to the same client. The second, separate query in Step 7 — a `JOIN`
between the request and its newest audit row — confirms that the change
is **durable in Postgres**, not just an artefact of the previous
statement's return value.

### Cleanup

```js
await sql`DELETE FROM maintenance_requests WHERE request_id = ${newRequestId}`;
```

The `audit_log.request_id` foreign key is declared `ON DELETE CASCADE`,
so the matching audit row is deleted automatically. This keeps the
seeded data set unchanged across repeated test runs.

## How to capture evidence

1. `npm run db:test` and screenshot the terminal output (the seven
   green ticks plus the final summary banner is the proof).
2. Open the Neon SQL editor and run
   `SELECT count(*) FROM maintenance_requests;` before and after — it
   should return the same number both times (because cleanup ran).
3. Attach both screenshots to the Trello card alongside the GitHub link.

## Issues / missing fields recorded

None — every required query ran successfully against the current schema.
If a future schema change breaks any step, this script will fail loudly
and the broken step number will pinpoint the affected table.
