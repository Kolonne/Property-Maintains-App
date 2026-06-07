-- Migration v3 — Add manager_id to properties (2026-04-26)
-- Links a property_manager user to each property.
-- This enables PM-scoped dashboard queries:
--   SELECT * FROM properties WHERE manager_id = $pmUserId

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_properties_manager ON properties(manager_id);

-- Add role-specific channels to maintenance comments.
-- Existing public comments default to the tenant channel; existing internal
-- comments are migrated to the internal PM-only channel.
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS channel VARCHAR(20) NOT NULL DEFAULT 'tenant';

UPDATE comments
SET channel = 'internal'
WHERE is_internal = TRUE;

ALTER TABLE comments
  DROP CONSTRAINT IF EXISTS chk_comments_channel;

ALTER TABLE comments
  ADD CONSTRAINT chk_comments_channel
  CHECK (channel IN ('landlord', 'tenant', 'internal'));

CREATE INDEX IF NOT EXISTS idx_comments_request_channel ON comments(request_id, channel);

CREATE TABLE IF NOT EXISTS maintenance_quotes (
    quote_id                    SERIAL PRIMARY KEY,
    request_id                  INTEGER NOT NULL REFERENCES maintenance_requests(request_id) ON DELETE CASCADE,
    contractor_name             VARCHAR(200) NOT NULL,
    quoted_amount               DECIMAL(10,2) NOT NULL CHECK (quoted_amount > 0),
    availability_note           VARCHAR(255),
    quote_notes                 TEXT,
    is_preapproved_contractor   BOOLEAN NOT NULL DEFAULT FALSE,
    created_by                  INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_quotes_request ON maintenance_quotes(request_id);

ALTER TABLE maintenance_requests
  ADD COLUMN IF NOT EXISTS approved_quote_id INTEGER REFERENCES maintenance_quotes(quote_id) ON DELETE SET NULL;

ALTER TABLE maintenance_requests
  ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_requests_approved_quote ON maintenance_requests(approved_quote_id);

ALTER TABLE maintenance_requests
  ADD COLUMN IF NOT EXISTS in_progress_at TIMESTAMPTZ;

ALTER TABLE maintenance_requests
  ADD COLUMN IF NOT EXISTS awaiting_landlord_approval_at TIMESTAMPTZ;

ALTER TABLE maintenance_requests
  ADD COLUMN IF NOT EXISTS landlord_approved_at TIMESTAMPTZ;

ALTER TABLE maintenance_requests
  ADD COLUMN IF NOT EXISTS invoice_received_at TIMESTAMPTZ;

UPDATE maintenance_requests
SET status = 'in_progress',
    in_progress_at = COALESCE(in_progress_at, acknowledged_at, submitted_at)
WHERE status = 'awaiting_parts';

UPDATE maintenance_requests
SET in_progress_at = COALESCE(in_progress_at, acknowledged_at, submitted_at)
WHERE status IN ('in_progress', 'awaiting_landlord_approval', 'landlord_approved', 'completed', 'closed');

UPDATE maintenance_requests
SET awaiting_landlord_approval_at = COALESCE(awaiting_landlord_approval_at, acknowledged_at, in_progress_at, submitted_at)
WHERE status IN ('awaiting_landlord_approval', 'landlord_approved');

UPDATE maintenance_requests
SET landlord_approved_at = COALESCE(landlord_approved_at, awaiting_landlord_approval_at, in_progress_at, submitted_at)
WHERE status = 'landlord_approved';

ALTER TABLE maintenance_requests
  DROP CONSTRAINT IF EXISTS maintenance_requests_status_check;

ALTER TABLE maintenance_requests
  ADD CONSTRAINT maintenance_requests_status_check
  CHECK (status IN (
    'submitted',
    'acknowledged',
    'in_progress',
    'awaiting_landlord_approval',
    'landlord_approved',
    'completed',
    'closed'
  ));
