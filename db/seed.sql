-- Seed data for development and testing.
-- Safe to re-run: uses ON CONFLICT DO NOTHING where possible.
-- Passwords below are NOT real — they are placeholder bcrypt-style strings.
-- Replace with real hashes when auth is implemented.

-- ----- Users -----
INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES
    ('landlord@example.com',  '$2b$10$placeholderhashlandlord1234567890', 'Linda',   'Larson',   '+61400000001', 'landlord'),
    ('pm@example.com',        '$2b$10$placeholderhashpm12345678901234567', 'Peter',   'Manager',  '+61400000002', 'property_manager'),
    ('tenant1@example.com',   '$2b$10$placeholderhashtenant123456789012',  'Tina',    'Tenant',   '+61400000003', 'tenant'),
    ('tenant2@example.com',   '$2b$10$placeholderhashtenant234567890123',  'Tom',     'Renter',   '+61400000004', 'tenant')
ON CONFLICT (email) DO NOTHING;

-- ----- Properties -----
INSERT INTO properties (address, suburb, state, postcode, property_type, num_units, owner_id) VALUES
    ('12 Eucalyptus Road',  'Rockhampton', 'QLD', '4700', 'house', 1,
       (SELECT user_id FROM users WHERE email = 'landlord@example.com')),
    ('45 Banksia Court',    'Brisbane',    'QLD', '4000', 'unit',  4,
       (SELECT user_id FROM users WHERE email = 'landlord@example.com'));

-- ----- Units -----
INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, floor_area_sqm, status, current_tenant_id) VALUES
    ((SELECT property_id FROM properties WHERE address = '12 Eucalyptus Road'),
       NULL, 3, 2, 145.50, 'occupied',
       (SELECT user_id FROM users WHERE email = 'tenant1@example.com')),
    ((SELECT property_id FROM properties WHERE address = '45 Banksia Court'),
       '1A', 2, 1, 78.20, 'occupied',
       (SELECT user_id FROM users WHERE email = 'tenant2@example.com')),
    ((SELECT property_id FROM properties WHERE address = '45 Banksia Court'),
       '1B', 1, 1, 52.00, 'vacant', NULL);

-- ----- Tenancies -----
INSERT INTO tenancies (unit_id, tenant_id, lease_start, lease_end, rent_amount, rent_frequency, status) VALUES
    ((SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant1@example.com')),
       (SELECT user_id FROM users WHERE email = 'tenant1@example.com'),
       '2026-01-15', '2027-01-14', 580.00, 'weekly', 'active'),
    ((SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant2@example.com')),
       (SELECT user_id FROM users WHERE email = 'tenant2@example.com'),
       '2026-03-01', '2027-02-28', 420.00, 'weekly', 'active');

-- ----- Contractors -----
INSERT INTO contractors (business_name, contact_name, phone, email, abn, specialties, hourly_rate, is_preferred, license_number) VALUES
    ('AquaFix Plumbing',    'Jane Doe',  '+61400111222', 'jane@aquafix.example',  '12345678901', '["plumbing"]'::jsonb,             95.00, TRUE,  'PL-12345'),
    ('Sparky Electricians', 'John Volt', '+61400333444', 'john@sparky.example',   '98765432109', '["electrical"]'::jsonb,          110.00, TRUE,  'EL-67890'),
    ('All Trades Co',       'Alex Tan',  '+61400555666', 'alex@alltrades.example','55555555555', '["general","appliance"]'::jsonb,  85.00, FALSE, NULL);

-- ----- Maintenance Requests -----
-- Request 1: in_progress (standard flow)
INSERT INTO maintenance_requests (unit_id, reported_by, title, description, category, priority, status, submitted_at, acknowledged_at) VALUES
    ((SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant1@example.com')),
       (SELECT user_id FROM users WHERE email = 'tenant1@example.com'),
       'Kitchen tap leaking', 'Constant drip from the cold tap, getting worse over the past week.',
       'plumbing', 'high', 'in_progress', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days');

-- Request 2: awaiting_landlord_approval (demonstrates new landlord approval flow)
INSERT INTO maintenance_requests (unit_id, reported_by, title, description, category, priority, status, submitted_at, acknowledged_at) VALUES
    ((SELECT unit_id FROM units WHERE current_tenant_id = (SELECT user_id FROM users WHERE email = 'tenant2@example.com')),
       (SELECT user_id FROM users WHERE email = 'tenant2@example.com'),
       'Powerpoint not working', 'Bedroom powerpoint stopped working — no power at all.',
       'electrical', 'medium', 'awaiting_landlord_approval', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours');

-- ----- Request Images -----
INSERT INTO request_images (request_id, file_path, uploaded_by) VALUES
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
       '/uploads/requests/1/leak1.jpg',
       (SELECT user_id FROM users WHERE email = 'tenant1@example.com'));

-- ----- Work Orders -----
INSERT INTO work_orders (request_id, assigned_to_contractor_id, assigned_by, scheduled_date, scheduled_time_slot, estimated_cost, status, notes) VALUES
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
       (SELECT contractor_id FROM contractors WHERE business_name = 'AquaFix Plumbing'),
       (SELECT user_id FROM users WHERE email = 'pm@example.com'),
       CURRENT_DATE + INTERVAL '2 days', '9am-12pm', 180.00, 'scheduled',
       'Tenant prefers morning. Access via front door, dog will be inside.');

-- ----- Comments -----
INSERT INTO comments (request_id, user_id, comment_text, is_internal) VALUES
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
       (SELECT user_id FROM users WHERE email = 'pm@example.com'),
       'Quoted by AquaFix Plumbing — $180 incl. parts. Scheduling for Wed morning.', FALSE),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
       (SELECT user_id FROM users WHERE email = 'pm@example.com'),
       'Internal note: tenant has been patient, prioritise.', TRUE),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Powerpoint not working'),
       (SELECT user_id FROM users WHERE email = 'pm@example.com'),
       'Quoted $320 for full circuit inspection. Awaiting landlord sign-off.', FALSE);

-- ----- Notifications -----
INSERT INTO notifications (user_id, request_id, type, message) VALUES
    ((SELECT user_id FROM users WHERE email = 'tenant1@example.com'),
       (SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
       'in_app', 'Your maintenance request has been scheduled for Wed 9am–12pm.'),
    ((SELECT user_id FROM users WHERE email = 'landlord@example.com'),
       (SELECT request_id FROM maintenance_requests WHERE title = 'Powerpoint not working'),
       'in_app', 'Approval required: electrical repair quote of $320 for Unit 1A at 45 Banksia Court.');

-- ----- Audit Log -----
INSERT INTO audit_log (request_id, changed_by, old_status, new_status, notes) VALUES
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
       (SELECT user_id FROM users WHERE email = 'pm@example.com'),
       'submitted', 'acknowledged', 'PM reviewed and acknowledged.'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Kitchen tap leaking'),
       (SELECT user_id FROM users WHERE email = 'pm@example.com'),
       'acknowledged', 'in_progress', 'Work order created with AquaFix.'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Powerpoint not working'),
       (SELECT user_id FROM users WHERE email = 'pm@example.com'),
       'submitted', 'acknowledged', 'PM reviewed.'),
    ((SELECT request_id FROM maintenance_requests WHERE title = 'Powerpoint not working'),
       (SELECT user_id FROM users WHERE email = 'pm@example.com'),
       'acknowledged', 'awaiting_landlord_approval', 'Quote exceeds PM approval threshold — escalated to landlord.');
