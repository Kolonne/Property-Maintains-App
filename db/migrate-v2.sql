-- Migration v2 — Scope reduction per Rebekah Coleman's review (2026-04-26)
-- Applies to an existing Neon database that already has the v1 schema.
-- Safe to run multiple times (IF EXISTS guards throughout).
--
-- Changes:
--   1. Drop out-of-scope tables (order matters for FK deps)
--   2. Remove 'maintenance_staff' from users.role
--   3. Remove 'commercial' from properties.property_type
--   4. Add 'awaiting_landlord_approval' + 'landlord_approved' to maintenance_requests.status
--   5. Remove 'sms' from notifications.type
--   6. Remove seed user with maintenance_staff role

-- =====================================================================
-- 1. Drop out-of-scope tables
-- =====================================================================
DROP TABLE IF EXISTS recurring_maintenance;
DROP TABLE IF EXISTS inspections;
DROP TABLE IF EXISTS work_order_materials;

-- =====================================================================
-- 2. users.role — remove 'maintenance_staff'
-- =====================================================================

-- Remove any existing maintenance_staff seed rows first (no FK deps after
-- the tables above are dropped)
DELETE FROM users WHERE role = 'maintenance_staff';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('tenant', 'landlord', 'property_manager'));

-- =====================================================================
-- 3. properties.property_type — remove 'commercial'
-- =====================================================================
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_type_check;
ALTER TABLE properties ADD CONSTRAINT properties_property_type_check
  CHECK (property_type IN ('house', 'unit'));

-- =====================================================================
-- 4. maintenance_requests.status — add landlord approval stages
-- =====================================================================
ALTER TABLE maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_status_check;
ALTER TABLE maintenance_requests ADD CONSTRAINT maintenance_requests_status_check
  CHECK (status IN (
    'submitted',
    'acknowledged',
    'in_progress',
    'awaiting_parts',
    'awaiting_landlord_approval',
    'landlord_approved',
    'completed',
    'closed'
  ));

-- =====================================================================
-- 5. notifications.type — remove 'sms'
-- =====================================================================

-- Remove any sms notifications first (no existing seed data uses sms,
-- but guard against future data)
DELETE FROM notifications WHERE type = 'sms';

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('email', 'in_app'));
