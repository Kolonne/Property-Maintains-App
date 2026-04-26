-- Property Maintenance System — Database Schema
-- Source of truth, derived from property_maintenance_db_schema.pdf
-- Updated 2026-04-26: scope reduction per Rebekah Coleman's review
--   • Removed maintenance_staff user role (trades not logging into prototype)
--   • Removed 'commercial' property type (rental market = residential only)
--   • Added awaiting_landlord_approval + landlord_approved to RequestStatus
--   • Removed 'sms' notification type (no SMS integration in scope)
--   • Removed inspections table (general inspections out of scope)
--   • Removed recurring_maintenance table (out of scope for prototype)
--   • Removed work_order_materials table (cost tracking out of scope)
-- Target: PostgreSQL (Neon)
-- Order matters: parent tables before child tables (FK dependencies).

-- =====================================================================
-- 1. PEOPLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
    user_id          SERIAL PRIMARY KEY,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    first_name       VARCHAR(100),
    last_name        VARCHAR(100),
    phone            VARCHAR(20),
    role             VARCHAR(30) NOT NULL
                       CHECK (role IN ('tenant', 'landlord', 'property_manager')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =====================================================================
-- 2. PROPERTIES & UNITS
-- =====================================================================

CREATE TABLE IF NOT EXISTS properties (
    property_id      SERIAL PRIMARY KEY,
    address          VARCHAR(255) NOT NULL,
    suburb           VARCHAR(100),
    state            VARCHAR(10),
    postcode         VARCHAR(10),
    property_type    VARCHAR(50)
                       CHECK (property_type IN ('house', 'unit')),
    num_units        INTEGER NOT NULL DEFAULT 1,
    owner_id         INTEGER REFERENCES users(user_id) ON DELETE RESTRICT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);

CREATE TABLE IF NOT EXISTS units (
    unit_id              SERIAL PRIMARY KEY,
    property_id          INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE RESTRICT,
    unit_number          VARCHAR(20),
    bedrooms             SMALLINT,
    bathrooms            SMALLINT,
    floor_area_sqm       DECIMAL(8,2),
    status               VARCHAR(20) NOT NULL DEFAULT 'vacant'
                           CHECK (status IN ('occupied', 'vacant')),
    current_tenant_id    INTEGER REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_units_property ON units(property_id);
CREATE INDEX IF NOT EXISTS idx_units_tenant   ON units(current_tenant_id);

CREATE TABLE IF NOT EXISTS tenancies (
    tenancy_id       SERIAL PRIMARY KEY,
    unit_id          INTEGER NOT NULL REFERENCES units(unit_id) ON DELETE RESTRICT,
    tenant_id        INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    lease_start      DATE NOT NULL,
    lease_end        DATE,
    rent_amount      DECIMAL(10,2),
    rent_frequency   VARCHAR(20)
                       CHECK (rent_frequency IN ('weekly', 'fortnightly', 'monthly')),
    status           VARCHAR(20) NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active', 'expired', 'terminated'))
);

CREATE INDEX IF NOT EXISTS idx_tenancies_unit   ON tenancies(unit_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_tenant ON tenancies(tenant_id);

-- =====================================================================
-- 3. MAINTENANCE REQUESTS
-- =====================================================================

CREATE TABLE IF NOT EXISTS maintenance_requests (
    request_id          SERIAL PRIMARY KEY,
    unit_id             INTEGER NOT NULL REFERENCES units(unit_id) ON DELETE RESTRICT,
    reported_by         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    category            VARCHAR(50)
                          CHECK (category IN ('plumbing', 'electrical', 'structural', 'appliance', 'pest', 'general')),
    priority            VARCHAR(20) NOT NULL DEFAULT 'medium'
                          CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status              VARCHAR(30) NOT NULL DEFAULT 'submitted'
                          CHECK (status IN (
                            'submitted',
                            'acknowledged',
                            'in_progress',
                            'awaiting_parts',
                            'awaiting_landlord_approval',
                            'landlord_approved',
                            'completed',
                            'closed'
                          )),
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at     TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_requests_unit     ON maintenance_requests(unit_id);
CREATE INDEX IF NOT EXISTS idx_requests_reporter ON maintenance_requests(reported_by);
CREATE INDEX IF NOT EXISTS idx_requests_status   ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON maintenance_requests(priority);

CREATE TABLE IF NOT EXISTS request_images (
    image_id        SERIAL PRIMARY KEY,
    request_id      INTEGER NOT NULL REFERENCES maintenance_requests(request_id) ON DELETE CASCADE,
    file_path       VARCHAR(500) NOT NULL,
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    uploaded_by     INTEGER REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_request_images_request ON request_images(request_id);

-- =====================================================================
-- 4. WORK MANAGEMENT
-- =====================================================================

CREATE TABLE IF NOT EXISTS contractors (
    contractor_id    SERIAL PRIMARY KEY,
    business_name    VARCHAR(200) NOT NULL,
    contact_name     VARCHAR(100),
    phone            VARCHAR(20),
    email            VARCHAR(255),
    abn              VARCHAR(20),
    specialties      JSONB,
    hourly_rate      DECIMAL(8,2),
    is_preferred     BOOLEAN NOT NULL DEFAULT FALSE,
    license_number   VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS work_orders (
    work_order_id             SERIAL PRIMARY KEY,
    request_id                INTEGER NOT NULL REFERENCES maintenance_requests(request_id) ON DELETE RESTRICT,
    -- assigned_to may reference either an internal user or an external contractor.
    -- We model both with nullable FKs; at most one should be set.
    assigned_to_user_id       INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    assigned_to_contractor_id INTEGER REFERENCES contractors(contractor_id) ON DELETE SET NULL,
    assigned_by               INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    scheduled_date            DATE,
    scheduled_time_slot       VARCHAR(50),
    estimated_cost            DECIMAL(10,2),
    actual_cost               DECIMAL(10,2),
    status                    VARCHAR(30) NOT NULL DEFAULT 'assigned'
                                CHECK (status IN ('assigned', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    notes                     TEXT,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at              TIMESTAMPTZ,
    CONSTRAINT chk_work_order_assignee
      CHECK (
        (assigned_to_user_id IS NOT NULL)::int + (assigned_to_contractor_id IS NOT NULL)::int <= 1
      )
);

CREATE INDEX IF NOT EXISTS idx_work_orders_request    ON work_orders(request_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_user       ON work_orders(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_contractor ON work_orders(assigned_to_contractor_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status     ON work_orders(status);

-- =====================================================================
-- 5. COMMUNICATIONS & AUDIT
-- =====================================================================

CREATE TABLE IF NOT EXISTS comments (
    comment_id       SERIAL PRIMARY KEY,
    request_id       INTEGER NOT NULL REFERENCES maintenance_requests(request_id) ON DELETE CASCADE,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    comment_text     TEXT NOT NULL,
    is_internal      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_request ON comments(request_id);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id  SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    request_id       INTEGER REFERENCES maintenance_requests(request_id) ON DELETE CASCADE,
    type             VARCHAR(20) NOT NULL
                       CHECK (type IN ('email', 'in_app')),
    message          TEXT NOT NULL,
    sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

CREATE TABLE IF NOT EXISTS audit_log (
    log_id           SERIAL PRIMARY KEY,
    request_id       INTEGER NOT NULL REFERENCES maintenance_requests(request_id) ON DELETE CASCADE,
    changed_by       INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    old_status       VARCHAR(30),
    new_status       VARCHAR(30),
    changed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes            TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_request ON audit_log(request_id);
