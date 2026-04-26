-- Wipe all data in reverse FK order, reset ID sequences.
-- Use before re-seeding in development.
-- Does NOT drop tables — schema is preserved.

TRUNCATE TABLE
  audit_log,
  notifications,
  comments,
  work_orders,
  request_images,
  maintenance_requests,
  tenancies,
  units,
  properties,
  contractors,
  users
RESTART IDENTITY CASCADE;
