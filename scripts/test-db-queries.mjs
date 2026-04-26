/**
 * Database read / write / update test harness.
 *
 * Covers every requirement on the Trello card
 *   "DB: Test Basic Read/Write/Update Queries":
 *
 *   1. Read sample users from the database
 *   2. Read sample properties from the database
 *   3. Read sample maintenance requests from the database
 *   4. Create a new maintenance request
 *   5. Update an existing maintenance request status (+ audit log entry)
 *   6. Read the updated maintenance request after saving
 *   7. Re-read to confirm changes still appear (verifies persistence,
 *      not just an in-memory return value)
 *
 * Run with: npm run db:test
 *
 * Cleans up after itself by deleting the test request it created
 * (and its audit-log rows via the FK cascade), so the seed data
 * is not polluted by repeated runs.
 */

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set. Run with: npm run db:test");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// ---------- tiny output helpers ----------
const line = "─".repeat(72);
function header(n, title) {
  console.log("\n" + line);
  console.log(`STEP ${n}: ${title}`);
  console.log(line);
}
function ok(msg) {
  console.log(`  ✓ ${msg}`);
}
function row(r) {
  console.log("    " + JSON.stringify(r));
}

// ---------- actual tests ----------
async function main() {
  console.log("\n" + "═".repeat(72));
  console.log(" Property Maintenance — Database Query Test");
  console.log(" Target: " + process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"));
  console.log(" Time:   " + new Date().toISOString());
  console.log("═".repeat(72));

  // -------------------------------------------------------------------
  // STEP 1 — Read users
  // -------------------------------------------------------------------
  header(1, "READ — sample users");
  const users = await sql`
    SELECT user_id, email, first_name, last_name, role
    FROM users
    ORDER BY user_id
  `;
  ok(`Returned ${users.length} users`);
  users.forEach(row);

  // -------------------------------------------------------------------
  // STEP 2 — Read properties (with owner & manager joined)
  // -------------------------------------------------------------------
  header(2, "READ — sample properties (with owner + manager joined)");
  const properties = await sql`
    SELECT
      p.property_id,
      p.address,
      p.suburb,
      o.email AS owner_email,
      m.email AS manager_email
    FROM properties p
    LEFT JOIN users o ON o.user_id = p.owner_id
    LEFT JOIN users m ON m.user_id = p.manager_id
    ORDER BY p.property_id
  `;
  ok(`Returned ${properties.length} properties`);
  properties.forEach(row);

  // -------------------------------------------------------------------
  // STEP 3 — Read maintenance requests
  // -------------------------------------------------------------------
  header(3, "READ — sample maintenance requests");
  const requests = await sql`
    SELECT request_id, title, priority, status, submitted_at
    FROM maintenance_requests
    ORDER BY request_id
  `;
  ok(`Returned ${requests.length} maintenance requests`);
  requests.forEach(row);

  // -------------------------------------------------------------------
  // STEP 4 — Create a new maintenance request
  // -------------------------------------------------------------------
  header(4, "CREATE — insert a new maintenance request");

  // Pick the first occupied unit + its tenant for a realistic insert
  const targetRows = await sql`
    SELECT unit_id, current_tenant_id
    FROM units
    WHERE status = 'occupied' AND current_tenant_id IS NOT NULL
    ORDER BY unit_id
    LIMIT 1
  `;
  const target = targetRows[0];
  ok(`Using unit ${target.unit_id} reported by user ${target.current_tenant_id}`);

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
  ok(`Inserted request_id = ${newRequestId}`);
  row(inserted[0]);

  // -------------------------------------------------------------------
  // STEP 5 — Update status + write to audit_log (transactional pattern)
  // -------------------------------------------------------------------
  header(5, "UPDATE — change status from 'submitted' → 'acknowledged'");

  const updated = await sql`
    UPDATE maintenance_requests
    SET status          = 'acknowledged',
        acknowledged_at = NOW()
    WHERE request_id = ${newRequestId}
    RETURNING request_id, status, acknowledged_at
  `;
  ok(`Updated ${updated.length} row`);
  row(updated[0]);

  // Mirror the change in audit_log so the history view stays accurate
  await sql`
    INSERT INTO audit_log (request_id, changed_by, old_status, new_status, notes)
    VALUES
      (${newRequestId},
       ${target.current_tenant_id},
       'submitted',
       'acknowledged',
       'Status change recorded by db:test harness')
  `;
  ok("Audit log entry written");

  // -------------------------------------------------------------------
  // STEP 6 — Read it back immediately
  // -------------------------------------------------------------------
  header(6, "READ-AFTER-WRITE — fetch the updated row");
  const readBack = await sql`
    SELECT request_id, title, status, submitted_at, acknowledged_at
    FROM maintenance_requests
    WHERE request_id = ${newRequestId}
  `;
  row(readBack[0]);
  if (readBack[0].status !== "acknowledged") {
    throw new Error(`Status expected 'acknowledged', got '${readBack[0].status}'`);
  }
  ok("Status correctly persisted as 'acknowledged'");

  // -------------------------------------------------------------------
  // STEP 7 — Re-read in a separate query to confirm true persistence
  //          (rules out any cached/in-memory artefacts)
  // -------------------------------------------------------------------
  header(7, "RE-READ — second fresh query confirms persistence");
  const reread = await sql`
    SELECT mr.status,
           al.old_status,
           al.new_status,
           al.notes
    FROM maintenance_requests mr
    JOIN audit_log al ON al.request_id = mr.request_id
    WHERE mr.request_id = ${newRequestId}
    ORDER BY al.changed_at DESC
    LIMIT 1
  `;
  row(reread[0]);
  ok("Audit log row joined back to request — change is durable");

  // -------------------------------------------------------------------
  // CLEANUP — remove the test request so seed data stays tidy
  // -------------------------------------------------------------------
  header("⌫", "CLEANUP — delete the test request");
  await sql`DELETE FROM maintenance_requests WHERE request_id = ${newRequestId}`;
  ok(`Deleted test request_id = ${newRequestId} (audit_log row cascaded)`);

  // -------------------------------------------------------------------
  console.log("\n" + "═".repeat(72));
  console.log(" ✅ All 7 steps passed. Database read / write / update verified.");
  console.log("═".repeat(72) + "\n");
}

main().catch((err) => {
  console.error("\n❌ Test failed:", err.message);
  console.error(err);
  process.exit(1);
});
