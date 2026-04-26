-- Migration v3 — Add manager_id to properties (2026-04-26)
-- Links a property_manager user to each property.
-- This enables PM-scoped dashboard queries:
--   SELECT * FROM properties WHERE manager_id = $pmUserId

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_properties_manager ON properties(manager_id);
