-- =============================================================================
-- Seed data — Maintenance Management Application
-- Updated 2026-04-26: comprehensive data covering all three user roles,
-- all request statuses, and landlord approval flow.
--
-- Users seeded:
--   landlord@example.com     — Linda Larson (landlord, owns both properties)
--   pm@example.com           — Peter Manager (property_manager, manages both)
--   tenant1@example.com      — Tina Tenant (tenant, 12 Eucalyptus Rd)
--   tenant2@example.com      — Tom Renter (tenant, Unit 1A 45 Banksia Ct)
--   tenant3@example.com      — Sara Occupant (tenant, Unit 1B 45 Banksia Ct)
--
-- Requests seeded (one per status to enable full workflow testing):
--   1. submitted             — new report, not yet seen by PM
--   2. acknowledged          — PM has seen it, no action yet
--   3. in_progress           — work order raised, contractor scheduled
--   4. awaiting_parts        — job started, waiting on parts
--   5. awaiting_landlord_approval — quote exceeds PM authority, needs landlord
--   6. landlord_approved     — landlord approved, ready to proceed
--   7. completed             — job done, awaiting tenant confirmation
--   8. closed                — fully resolved and closed
-- =============================================================================

-- =====================================================================
-- USERS
-- =====================================================================
INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES
    ('landlord@example.com',  '$2b$10$placeholderhashlandlord1234567890', 'Linda',  'Larson',   '+61400000001', 'landlord'),
    ('pm@example.com',        '$2b$10$placeholderhashpm12345678901234567', 'Peter',  'Manager',  '+61400000002', 'property_manager'),
    ('tenant1@example.com',   '$2b$10$placeholderhashtenant123456789012',  'Tina',   'Tenant',   '+61400000003', 'tenant'),
    ('tenant2@example.com',   '$2b$10$placeholderhashtenant234567890123',  'Tom',    'Renter',   '+61400000004', 'tenant'),
    ('tenant3@example.com',   '$2b$10$placeholderhashtenant345678901234',  'Sara',   'Occupant', '+61400000005', 'tenant')
ON CONFLICT (email) DO NOTHING;

-- =====================================================================
-- PROPERTIES  (owner = landlord, manager = PM)
-- =====================================================================
INSERT INTO properties (address, suburb, state, postcode, property_type, num_units, owner_id, manager_id) VALUES
    ('12 Eucalyptus Road', 'Rockhampton', 'QLD', '4700', 'house', 1,
        (SELECT user_id FROM users WHERE email = 'landlord@example.com'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com')),
    ('45 Banksia Court',   'Brisbane',    'QLD', '4000', 'unit',  3,
        (SELECT user_id FROM users WHERE email = 'landlord@example.com'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'));

-- =====================================================================
-- UNITS
-- =====================================================================
INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, floor_area_sqm, status, current_tenant_id) VALUES
    -- 12 Eucalyptus Road — single house
    ((SELECT property_id FROM properties WHERE address = '12 Eucalyptus Road'),
        NULL, 3, 2, 145.50, 'occupied',
        (SELECT user_id FROM users WHERE email = 'tenant1@example.com')),
    -- 45 Banksia Court — 3 units, 2 occupied
    ((SELECT property_id FROM properties WHERE address = '45 Banksia Court'),
        '1A', 2, 1, 78.20, 'occupied',
        (SELECT user_id FROM users WHERE email = 'tenant2@example.com')),
    ((SELECT property_id FROM properties WHERE address = '45 Banksia Court'),
        '1B', 1, 1, 52.00, 'occupied',
        (SELECT user_id FROM users WHERE email = 'tenant3@example.com')),
    ((SELECT property_id FROM properties WHERE address = '45 Banksia Court'),
        '2A', 2, 1, 78.20, 'vacant', NULL);

-- =====================================================================
-- TENANCIES
-- =====================================================================
INSERT INTO tenancies (unit_id, tenant_id, lease_start, lease_end, rent_amount, rent_frequency, status) VALUES
    ((SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant1@example.com')),
        (SELECT user_id FROM users WHERE email = 'tenant1@example.com'),
        '2026-01-15', '2027-01-14', 580.00, 'weekly', 'active'),
    ((SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant2@example.com')),
        (SELECT user_id FROM users WHERE email = 'tenant2@example.com'),
        '2026-03-01', '2027-02-28', 420.00, 'weekly', 'active'),
    ((SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant3@example.com')),
        (SELECT user_id FROM users WHERE email = 'tenant3@example.com'),
        '2026-02-01', '2027-01-31', 395.00, 'weekly', 'active');

-- =====================================================================
-- CONTRACTORS
-- =====================================================================
INSERT INTO contractors (business_name, contact_name, phone, email, abn, specialties, hourly_rate, is_preferred, license_number) VALUES
    ('AquaFix Plumbing',    'Jane Doe',  '+61400111222', 'jane@aquafix.example',  '12345678901', '["plumbing"]'::jsonb,            95.00, TRUE,  'PL-12345'),
    ('Sparky Electricians', 'John Volt', '+61400333444', 'john@sparky.example',   '98765432109', '["electrical"]'::jsonb,          110.00, TRUE,  'EL-67890'),
    ('All Trades Co',       'Alex Tan',  '+61400555666', 'alex@alltrades.example','55555555555', '["general","appliance"]'::jsonb,  85.00, FALSE, NULL);

-- =====================================================================
-- MAINTENANCE REQUESTS — one per status for complete workflow testing
-- =====================================================================

-- 1. SUBMITTED — just reported, PM not yet seen it
INSERT INTO maintenance_requests
    (unit_id, reported_by, title, description, category, priority, status, submitted_at)
VALUES (
    (SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant3@example.com')),
    (SELECT user_id FROM users WHERE email = 'tenant3@example.com'),
    'Bathroom exhaust fan not working',
    'The exhaust fan stopped spinning about two days ago. Bathroom gets very humid after showers.',
    'general', 'low', 'submitted', NOW() - INTERVAL '4 hours'
);

-- 2. ACKNOWLEDGED — PM has seen it, no contractor assigned yet
INSERT INTO maintenance_requests
    (unit_id, reported_by, title, description, category, priority, status, submitted_at, acknowledged_at)
VALUES (
    (SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant2@example.com')),
    (SELECT user_id FROM users WHERE email = 'tenant2@example.com'),
    'Front door lock stiff',
    'The deadbolt on the front door is increasingly hard to turn. Sometimes takes a few attempts to lock.',
    'general', 'medium', 'acknowledged', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
);

-- 3. IN_PROGRESS — work order raised, contractor on the job
INSERT INTO maintenance_requests
    (unit_id, reported_by, title, description, category, priority, status, submitted_at, acknowledged_at)
VALUES (
    (SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant1@example.com')),
    (SELECT user_id FROM users WHERE email = 'tenant1@example.com'),
    'Kitchen tap leaking',
    'Constant drip from the cold tap, getting worse over the past week. Water pooling under the sink.',
    'plumbing', 'high', 'in_progress', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'
);

-- 4. AWAITING_PARTS — job started, waiting on parts to arrive
INSERT INTO maintenance_requests
    (unit_id, reported_by, title, description, category, priority, status, submitted_at, acknowledged_at)
VALUES (
    (SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant2@example.com')),
    (SELECT user_id FROM users WHERE email = 'tenant2@example.com'),
    'Dishwasher not draining',
    'Dishwasher finishes cycle but leaves standing water in the bottom. Has been like this for 3 days.',
    'appliance', 'medium', 'awaiting_parts', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days'
);

-- 5. AWAITING_LANDLORD_APPROVAL — quote over PM threshold, escalated
INSERT INTO maintenance_requests
    (unit_id, reported_by, title, description, category, priority, status, submitted_at, acknowledged_at)
VALUES (
    (SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant2@example.com')),
    (SELECT user_id FROM users WHERE email = 'tenant2@example.com'),
    'Powerpoint not working',
    'Bedroom powerpoint stopped working entirely — tested with multiple devices, no power at outlet.',
    'electrical', 'high', 'awaiting_landlord_approval', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
);

-- 6. LANDLORD_APPROVED — landlord approved the quote, PM can proceed
INSERT INTO maintenance_requests
    (unit_id, reported_by, title, description, category, priority, status, submitted_at, acknowledged_at)
VALUES (
    (SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant1@example.com')),
    (SELECT user_id FROM users WHERE email = 'tenant1@example.com'),
    'Hot water system making noise',
    'Loud banging/rumbling from the hot water unit in the laundry, especially in the morning.',
    'plumbing', 'high', 'landlord_approved', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'
);

-- 7. COMPLETED — job done, not yet formally closed
INSERT INTO maintenance_requests
    (unit_id, reported_by, title, description, category, priority, status, submitted_at, acknowledged_at, completed_at)
VALUES (
    (SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant3@example.com')),
    (SELECT user_id FROM users WHERE email = 'tenant3@example.com'),
    'Bedroom window latch broken',
    'Window latch on master bedroom window snapped off — window cannot be secured.',
    'structural', 'medium', 'completed',
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', NOW() - INTERVAL '2 days'
);

-- 8. CLOSED — fully resolved
INSERT INTO maintenance_requests
    (unit_id, reported_by, title, description, category, priority, status, submitted_at, acknowledged_at, completed_at, closed_at)
VALUES (
    (SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant1@example.com')),
    (SELECT user_id FROM users WHERE email = 'tenant1@example.com'),
    'Smoke alarm battery flat',
    'Smoke alarm in hallway beeping every 30 seconds indicating low battery.',
    'general', 'urgent', 'closed',
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days',
    NOW() - INTERVAL '18 days', NOW() - INTERVAL '17 days'
);

-- =====================================================================
-- REQUEST IMAGES
-- =====================================================================
INSERT INTO request_images (request_id, file_path, uploaded_by) VALUES
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
        '/uploads/requests/leak1.jpg',
        (SELECT user_id FROM users WHERE email = 'tenant1@example.com')),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
        '/uploads/requests/leak2.jpg',
        (SELECT user_id FROM users WHERE email = 'tenant1@example.com')),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Powerpoint not working'),
        '/uploads/requests/powerpoint1.jpg',
        (SELECT user_id FROM users WHERE email = 'tenant2@example.com')),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Hot water system making noise'),
        '/uploads/requests/hotwater1.jpg',
        (SELECT user_id FROM users WHERE email = 'tenant1@example.com'));

-- =====================================================================
-- WORK ORDERS
-- =====================================================================
INSERT INTO work_orders (request_id, assigned_to_contractor_id, assigned_by, scheduled_date, scheduled_time_slot, estimated_cost, status, notes) VALUES
    -- Kitchen tap — in_progress
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
        (SELECT contractor_id FROM contractors WHERE business_name = 'AquaFix Plumbing'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        CURRENT_DATE + INTERVAL '1 day', '9am–12pm', 180.00, 'in_progress',
        'Tenant prefers morning. Access via front door.'),
    -- Dishwasher — in_progress, parts on order
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Dishwasher not draining'),
        (SELECT contractor_id FROM contractors WHERE business_name = 'All Trades Co'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        CURRENT_DATE + INTERVAL '3 days', 'Afternoon', 240.00, 'in_progress',
        'Drain pump needs replacing. Part ordered from supplier, ETA 3 days.'),
    -- Hot water — landlord approved, not yet scheduled
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Hot water system making noise'),
        (SELECT contractor_id FROM contractors WHERE business_name = 'AquaFix Plumbing'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        CURRENT_DATE + INTERVAL '5 days', 'Morning', 850.00, 'assigned',
        'Full hot water unit replacement approved by landlord. Scheduling this week.'),
    -- Window latch — completed
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Bedroom window latch broken'),
        (SELECT contractor_id FROM contractors WHERE business_name = 'All Trades Co'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        CURRENT_DATE - INTERVAL '4 days', 'Morning', 95.00, 'completed',
        'Latch replaced. Tenant confirmed window now locks correctly.'),
    -- Smoke alarm — completed (closed request)
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Smoke alarm battery flat'),
        (SELECT contractor_id FROM contractors WHERE business_name = 'All Trades Co'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        CURRENT_DATE - INTERVAL '18 days', 'Any time', 45.00, 'completed',
        'Battery replaced same day. All alarms tested and functional.');

-- =====================================================================
-- COMMENTS
-- =====================================================================
INSERT INTO comments (request_id, user_id, comment_text, is_internal) VALUES
    -- Kitchen tap
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'AquaFix quoted $180 including parts. Scheduling for tomorrow morning.', FALSE),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
        (SELECT user_id FROM users WHERE email = 'tenant1@example.com'),
        'Thanks, morning works well for me. I will be home from 8am.', FALSE),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'Internal: washer replacement likely, may need to isolate supply. Warn tenant.', TRUE),
    -- Front door lock
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Front door lock stiff'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'Will arrange a locksmith this week. Will confirm time shortly.', FALSE),
    -- Dishwasher
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Dishwasher not draining'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'Technician attended — drain pump faulty. Part on order, ETA 3 days.', FALSE),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Dishwasher not draining'),
        (SELECT user_id FROM users WHERE email = 'tenant2@example.com'),
        'Thanks for the update. Will hand-wash in the meantime.', FALSE),
    -- Powerpoint — landlord approval chain
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Powerpoint not working'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'Sparky Electricians quoted $320 for full circuit inspection and repair. Exceeds my approval limit — sent to landlord for sign-off.', FALSE),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Powerpoint not working'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'Internal: circuit may be tripping due to overload. Advise tenant not to use that circuit.', TRUE),
    -- Hot water — landlord approved
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Hot water system making noise'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'AquaFix inspected — system is 12 years old and failing. Full replacement recommended at $850.', FALSE),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Hot water system making noise'),
        (SELECT user_id FROM users WHERE email = 'landlord@example.com'),
        'Approved. Please proceed with replacement as soon as possible.', FALSE),
    -- Window latch — completed
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Bedroom window latch broken'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'Repair completed. New latch fitted and tested. Please confirm all is OK.', FALSE),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Bedroom window latch broken'),
        (SELECT user_id FROM users WHERE email = 'tenant3@example.com'),
        'Confirmed — window locks properly now. Thank you!', FALSE),
    -- Smoke alarm — closed
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Smoke alarm battery flat'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'Battery replaced same day. All smoke alarms in the property tested and operational.', FALSE);

-- =====================================================================
-- NOTIFICATIONS
-- =====================================================================
INSERT INTO notifications (user_id, request_id, type, message) VALUES
    -- Tenant1 — kitchen tap scheduled
    ((SELECT user_id FROM users WHERE email = 'tenant1@example.com'),
        (SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
        'in_app', 'Your maintenance request "Kitchen tap leaking" has been scheduled for tomorrow 9am–12pm.'),
    -- Tenant2 — front door acknowledged
    ((SELECT user_id FROM users WHERE email = 'tenant2@example.com'),
        (SELECT request_id FROM maintenance_requests WHERE title = 'Front door lock stiff'),
        'in_app', 'Your maintenance request "Front door lock stiff" has been acknowledged. A tradesperson will be arranged shortly.'),
    -- Tenant2 — dishwasher update
    ((SELECT user_id FROM users WHERE email = 'tenant2@example.com'),
        (SELECT request_id FROM maintenance_requests WHERE title = 'Dishwasher not draining'),
        'in_app', 'Update on "Dishwasher not draining": a replacement part has been ordered and will be installed within 3 days.'),
    -- Landlord — approval request for powerpoint
    ((SELECT user_id FROM users WHERE email = 'landlord@example.com'),
        (SELECT request_id FROM maintenance_requests WHERE title = 'Powerpoint not working'),
        'in_app', 'Approval required: electrical repair quote of $320 for Unit 1A at 45 Banksia Court. Please review and approve.'),
    ((SELECT user_id FROM users WHERE email = 'landlord@example.com'),
        (SELECT request_id FROM maintenance_requests WHERE title = 'Powerpoint not working'),
        'email', 'Approval required: electrical repair quote of $320 for Unit 1A at 45 Banksia Court. Please review and approve.'),
    -- Landlord — approval request for hot water
    ((SELECT user_id FROM users WHERE email = 'landlord@example.com'),
        (SELECT request_id FROM maintenance_requests WHERE title = 'Hot water system making noise'),
        'in_app', 'Approval required: hot water system replacement quote of $850 at 12 Eucalyptus Road. Please review and approve.'),
    -- Tenant1 — hot water approved, work coming
    ((SELECT user_id FROM users WHERE email = 'tenant1@example.com'),
        (SELECT request_id FROM maintenance_requests WHERE title = 'Hot water system making noise'),
        'in_app', 'Good news — your hot water system replacement has been approved. A tradesperson will be in touch to schedule.'),
    -- Tenant3 — window completed
    ((SELECT user_id FROM users WHERE email = 'tenant3@example.com'),
        (SELECT request_id FROM maintenance_requests WHERE title = 'Bedroom window latch broken'),
        'in_app', 'Your maintenance request "Bedroom window latch broken" has been completed. Please confirm everything is OK.');

-- =====================================================================
-- AUDIT LOG — full status history for each request
-- =====================================================================
INSERT INTO audit_log (request_id, changed_by, old_status, new_status, notes, changed_at) VALUES
    -- Front door: submitted → acknowledged
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Front door lock stiff'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'submitted', 'acknowledged', 'PM reviewed.', NOW() - INTERVAL '1 day'),
    -- Kitchen tap: submitted → acknowledged → in_progress
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'submitted', 'acknowledged', 'PM reviewed and acknowledged.', NOW() - INTERVAL '4 days'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'acknowledged', 'in_progress', 'Work order raised with AquaFix Plumbing.', NOW() - INTERVAL '3 days'),
    -- Dishwasher: submitted → acknowledged → in_progress → awaiting_parts
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Dishwasher not draining'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'submitted', 'acknowledged', 'PM reviewed.', NOW() - INTERVAL '7 days'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Dishwasher not draining'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'acknowledged', 'in_progress', 'All Trades Co attended — drain pump faulty.', NOW() - INTERVAL '6 days'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Dishwasher not draining'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'in_progress', 'awaiting_parts', 'Replacement drain pump ordered. ETA 3 days.', NOW() - INTERVAL '5 days'),
    -- Powerpoint: submitted → acknowledged → awaiting_landlord_approval
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Powerpoint not working'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'submitted', 'acknowledged', 'PM reviewed urgently — high priority electrical.', NOW() - INTERVAL '2 days'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Powerpoint not working'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'acknowledged', 'awaiting_landlord_approval', 'Quote of $320 exceeds PM approval authority. Escalated to landlord.', NOW() - INTERVAL '1 day'),
    -- Hot water: submitted → acknowledged → awaiting_landlord_approval → landlord_approved
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Hot water system making noise'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'submitted', 'acknowledged', 'PM reviewed — urgent, hot water failure imminent.', NOW() - INTERVAL '9 days'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Hot water system making noise'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'acknowledged', 'awaiting_landlord_approval', 'Replacement quote $850 — sent to landlord for approval.', NOW() - INTERVAL '8 days'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Hot water system making noise'),
        (SELECT user_id FROM users WHERE email = 'landlord@example.com'),
        'awaiting_landlord_approval', 'landlord_approved', 'Landlord approved via portal.', NOW() - INTERVAL '7 days'),
    -- Window latch: submitted → acknowledged → in_progress → completed
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Bedroom window latch broken'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'submitted', 'acknowledged', 'PM reviewed.', NOW() - INTERVAL '13 days'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Bedroom window latch broken'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'acknowledged', 'in_progress', 'All Trades Co scheduled.', NOW() - INTERVAL '12 days'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Bedroom window latch broken'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'in_progress', 'completed', 'Latch replaced successfully.', NOW() - INTERVAL '2 days'),
    -- Smoke alarm: submitted → acknowledged → in_progress → completed → closed
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Smoke alarm battery flat'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'submitted', 'acknowledged', 'Urgent — same day response required.', NOW() - INTERVAL '19 days'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Smoke alarm battery flat'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'acknowledged', 'in_progress', 'All Trades Co attending same day.', NOW() - INTERVAL '19 days'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Smoke alarm battery flat'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'in_progress', 'completed', 'Battery replaced, all alarms tested.', NOW() - INTERVAL '18 days'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Smoke alarm battery flat'),
        (SELECT user_id FROM users WHERE email = 'pm@example.com'),
        'completed', 'closed', 'Tenant confirmed, request closed.', NOW() - INTERVAL '17 days');
