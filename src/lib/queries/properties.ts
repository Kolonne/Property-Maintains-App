import { getSql } from "@/lib/db";
import type { PropertyType } from "@/lib/types";

export interface PropertyOverview {
  property_id: number;
  address: string;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  property_type: PropertyType | null;
  num_units: number;
  owner_id: number | null;
  owner_first_name: string | null;
  owner_last_name: string | null;
  owner_email: string | null;
  manager_id: number | null;
}

export interface PropertyDashboardLandlord {
  user_id: number | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export interface PropertyDashboardStats {
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  active_tenancies: number;
  open_requests: number;
  urgent_requests: number;
  awaiting_landlord_approval: number;
  completed_requests: number;
  attached_documents: number;
  work_orders: number;
  estimated_work_value: string;
}

export interface PropertyDashboardUnit {
  unit_id: number;
  unit_number: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  status: string;
  tenant_first_name: string | null;
  tenant_last_name: string | null;
  tenant_email: string | null;
  lease_start: string | null;
  lease_end: string | null;
}

export interface PropertyDashboardRequest {
  request_id: number;
  title: string;
  status: string;
  priority: string;
  submitted_at: string;
  unit_number: string | null;
  reporter_first_name: string | null;
  reporter_last_name: string | null;
  image_count: number;
  work_order_count: number;
  estimated_cost: string | null;
}

export interface PropertyDashboard {
  property: PropertyOverview;
  landlord: PropertyDashboardLandlord | null;
  stats: PropertyDashboardStats;
  units: PropertyDashboardUnit[];
  maintenance: PropertyDashboardRequest[];
}

export interface LandlordOption {
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export interface PropertyInput {
  address: string;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  property_type: PropertyType;
  num_units: number;
  manager_id: number;
}

export interface LandlordInput {
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export async function isActivePropertyManager(userId: number): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    SELECT user_id
    FROM users
    WHERE user_id = ${userId}
      AND role = 'property_manager'
      AND is_active = TRUE
    LIMIT 1
  `) as { user_id: number }[];

  return rows.length > 0;
}

export async function isActiveLandlord(userId: number): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    SELECT user_id
    FROM users
    WHERE user_id = ${userId}
      AND role = 'landlord'
      AND is_active = TRUE
    LIMIT 1
  `) as { user_id: number }[];

  return rows.length > 0;
}

export async function getPropertiesForManager(
  managerId: number
): Promise<PropertyOverview[]> {
  const sql = getSql();

  return (await sql`
    SELECT
      p.property_id,
      p.address,
      p.suburb,
      p.state,
      p.postcode,
      p.property_type,
      p.num_units,
      p.owner_id,
      owner.first_name AS owner_first_name,
      owner.last_name AS owner_last_name,
      owner.email AS owner_email,
      p.manager_id
    FROM properties p
    LEFT JOIN users owner ON owner.user_id = p.owner_id
    WHERE p.manager_id = ${managerId}
    ORDER BY p.created_at DESC, p.property_id DESC
  `) as PropertyOverview[];
}

export async function getPropertiesForLandlord(
  landlordId: number
): Promise<PropertyOverview[]> {
  const sql = getSql();

  return (await sql`
    SELECT
      p.property_id,
      p.address,
      p.suburb,
      p.state,
      p.postcode,
      p.property_type,
      p.num_units,
      p.owner_id,
      owner.first_name AS owner_first_name,
      owner.last_name AS owner_last_name,
      owner.email AS owner_email,
      p.manager_id
    FROM properties p
    LEFT JOIN users owner ON owner.user_id = p.owner_id
    WHERE p.owner_id = ${landlordId}
    ORDER BY p.created_at DESC, p.property_id DESC
  `) as PropertyOverview[];
}

export async function getLandlordOptions(): Promise<LandlordOption[]> {
  const sql = getSql();

  return (await sql`
    SELECT user_id, email, first_name, last_name, phone
    FROM users
    WHERE role = 'landlord'
      AND is_active = TRUE
    ORDER BY first_name NULLS LAST, last_name NULLS LAST, email
  `) as LandlordOption[];
}

export async function hasManagedProperty(
  propertyId: number,
  managerId: number
): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    SELECT property_id
    FROM properties
    WHERE property_id = ${propertyId}
      AND manager_id = ${managerId}
    LIMIT 1
  `) as { property_id: number }[];

  return rows.length > 0;
}

export async function getPropertyDashboardForManager(
  propertyId: number,
  managerId: number
): Promise<PropertyDashboard | null> {
  const sql = getSql();

  const propertyRows = (await sql`
    SELECT
      p.property_id,
      p.address,
      p.suburb,
      p.state,
      p.postcode,
      p.property_type,
      p.num_units,
      p.owner_id,
      owner.first_name AS owner_first_name,
      owner.last_name AS owner_last_name,
      owner.email AS owner_email,
      p.manager_id
    FROM properties p
    LEFT JOIN users owner ON owner.user_id = p.owner_id
    WHERE p.property_id = ${propertyId}
      AND p.manager_id = ${managerId}
    LIMIT 1
  `) as PropertyOverview[];

  const property = propertyRows[0];

  if (!property) {
    return null;
  }

  const landlordRows = (await sql`
    SELECT user_id, email, first_name, last_name, phone
    FROM users
    WHERE user_id = ${property.owner_id}
      AND role = 'landlord'
    LIMIT 1
  `) as PropertyDashboardLandlord[];

  const statsRows = (await sql`
    SELECT
      COUNT(DISTINCT u.unit_id)::int AS total_units,
      COUNT(DISTINCT u.unit_id) FILTER (WHERE u.status = 'occupied')::int AS occupied_units,
      COUNT(DISTINCT u.unit_id) FILTER (WHERE u.status = 'vacant')::int AS vacant_units,
      COUNT(DISTINCT t.tenancy_id) FILTER (WHERE t.status = 'active')::int AS active_tenancies,
      COUNT(DISTINCT mr.request_id) FILTER (
        WHERE mr.status NOT IN ('completed', 'closed')
      )::int AS open_requests,
      COUNT(DISTINCT mr.request_id) FILTER (
        WHERE mr.status NOT IN ('completed', 'closed')
          AND mr.priority = 'urgent'
      )::int AS urgent_requests,
      COUNT(DISTINCT mr.request_id) FILTER (
        WHERE mr.status = 'awaiting_landlord_approval'
      )::int AS awaiting_landlord_approval,
      COUNT(DISTINCT mr.request_id) FILTER (
        WHERE mr.status IN ('completed', 'closed')
      )::int AS completed_requests,
      COUNT(DISTINCT ri.image_id)::int AS attached_documents,
      COUNT(DISTINCT wo.work_order_id)::int AS work_orders,
      COALESCE(SUM(DISTINCT wo.estimated_cost), 0)::text AS estimated_work_value
    FROM properties p
    LEFT JOIN units u ON u.property_id = p.property_id
    LEFT JOIN tenancies t ON t.unit_id = u.unit_id
    LEFT JOIN maintenance_requests mr ON mr.unit_id = u.unit_id
    LEFT JOIN request_images ri ON ri.request_id = mr.request_id
    LEFT JOIN work_orders wo ON wo.request_id = mr.request_id
    WHERE p.property_id = ${propertyId}
  `) as PropertyDashboardStats[];

  const unitRows = (await sql`
    SELECT
      u.unit_id,
      u.unit_number,
      u.bedrooms,
      u.bathrooms,
      u.status,
      tenant.first_name AS tenant_first_name,
      tenant.last_name AS tenant_last_name,
      tenant.email AS tenant_email,
      tenancy.lease_start,
      tenancy.lease_end
    FROM units u
    LEFT JOIN tenancies tenancy
      ON tenancy.unit_id = u.unit_id
     AND tenancy.status = 'active'
    LEFT JOIN users tenant ON tenant.user_id = tenancy.tenant_id
    WHERE u.property_id = ${propertyId}
    ORDER BY u.unit_number NULLS FIRST, u.unit_id
  `) as PropertyDashboardUnit[];

  const requestRows = (await sql`
    SELECT
      mr.request_id,
      mr.title,
      mr.status,
      mr.priority,
      mr.submitted_at,
      u.unit_number,
      reporter.first_name AS reporter_first_name,
      reporter.last_name AS reporter_last_name,
      COUNT(DISTINCT ri.image_id)::int AS image_count,
      COUNT(DISTINCT wo.work_order_id)::int AS work_order_count,
      MAX(wo.estimated_cost)::text AS estimated_cost
    FROM maintenance_requests mr
    JOIN units u ON u.unit_id = mr.unit_id
    LEFT JOIN users reporter ON reporter.user_id = mr.reported_by
    LEFT JOIN request_images ri ON ri.request_id = mr.request_id
    LEFT JOIN work_orders wo ON wo.request_id = mr.request_id
    WHERE u.property_id = ${propertyId}
    GROUP BY
      mr.request_id,
      mr.title,
      mr.status,
      mr.priority,
      mr.submitted_at,
      u.unit_number,
      reporter.first_name,
      reporter.last_name
    ORDER BY mr.submitted_at DESC
    LIMIT 10
  `) as PropertyDashboardRequest[];

  return {
    property,
    landlord: landlordRows[0] ?? null,
    stats: statsRows[0] ?? {
      total_units: 0,
      occupied_units: 0,
      vacant_units: 0,
      active_tenancies: 0,
      open_requests: 0,
      urgent_requests: 0,
      awaiting_landlord_approval: 0,
      completed_requests: 0,
      attached_documents: 0,
      work_orders: 0,
      estimated_work_value: "0",
    },
    units: unitRows,
    maintenance: requestRows,
  };
}

export async function getPropertyDashboardForLandlord(
  propertyId: number,
  landlordId: number
): Promise<PropertyDashboard | null> {
  const sql = getSql();

  const propertyRows = (await sql`
    SELECT
      p.property_id,
      p.address,
      p.suburb,
      p.state,
      p.postcode,
      p.property_type,
      p.num_units,
      p.owner_id,
      owner.first_name AS owner_first_name,
      owner.last_name AS owner_last_name,
      owner.email AS owner_email,
      p.manager_id
    FROM properties p
    LEFT JOIN users owner ON owner.user_id = p.owner_id
    WHERE p.property_id = ${propertyId}
      AND p.owner_id = ${landlordId}
    LIMIT 1
  `) as PropertyOverview[];

  const property = propertyRows[0];

  if (!property) {
    return null;
  }

  const landlordRows = (await sql`
    SELECT user_id, email, first_name, last_name, phone
    FROM users
    WHERE user_id = ${property.owner_id}
      AND role = 'landlord'
    LIMIT 1
  `) as PropertyDashboardLandlord[];

  const statsRows = (await sql`
    SELECT
      COUNT(DISTINCT u.unit_id)::int AS total_units,
      COUNT(DISTINCT u.unit_id) FILTER (WHERE u.status = 'occupied')::int AS occupied_units,
      COUNT(DISTINCT u.unit_id) FILTER (WHERE u.status = 'vacant')::int AS vacant_units,
      COUNT(DISTINCT t.tenancy_id) FILTER (WHERE t.status = 'active')::int AS active_tenancies,
      COUNT(DISTINCT mr.request_id) FILTER (
        WHERE mr.status NOT IN ('completed', 'closed')
      )::int AS open_requests,
      COUNT(DISTINCT mr.request_id) FILTER (
        WHERE mr.status NOT IN ('completed', 'closed')
          AND mr.priority = 'urgent'
      )::int AS urgent_requests,
      COUNT(DISTINCT mr.request_id) FILTER (
        WHERE mr.status = 'awaiting_landlord_approval'
      )::int AS awaiting_landlord_approval,
      COUNT(DISTINCT mr.request_id) FILTER (
        WHERE mr.status IN ('completed', 'closed')
      )::int AS completed_requests,
      COUNT(DISTINCT ri.image_id)::int AS attached_documents,
      COUNT(DISTINCT wo.work_order_id)::int AS work_orders,
      COALESCE(SUM(DISTINCT wo.estimated_cost), 0)::text AS estimated_work_value
    FROM properties p
    LEFT JOIN units u ON u.property_id = p.property_id
    LEFT JOIN tenancies t ON t.unit_id = u.unit_id
    LEFT JOIN maintenance_requests mr ON mr.unit_id = u.unit_id
    LEFT JOIN request_images ri ON ri.request_id = mr.request_id
    LEFT JOIN work_orders wo ON wo.request_id = mr.request_id
    WHERE p.property_id = ${propertyId}
  `) as PropertyDashboardStats[];

  const unitRows = (await sql`
    SELECT
      u.unit_id,
      u.unit_number,
      u.bedrooms,
      u.bathrooms,
      u.status,
      NULL::varchar AS tenant_first_name,
      NULL::varchar AS tenant_last_name,
      NULL::varchar AS tenant_email,
      tenancy.lease_start,
      tenancy.lease_end
    FROM units u
    LEFT JOIN tenancies tenancy
      ON tenancy.unit_id = u.unit_id
     AND tenancy.status = 'active'
    WHERE u.property_id = ${propertyId}
    ORDER BY u.unit_number NULLS FIRST, u.unit_id
  `) as PropertyDashboardUnit[];

  const requestRows = (await sql`
    SELECT
      mr.request_id,
      mr.title,
      mr.status,
      mr.priority,
      mr.submitted_at,
      u.unit_number,
      NULL::varchar AS reporter_first_name,
      NULL::varchar AS reporter_last_name,
      COUNT(DISTINCT ri.image_id)::int AS image_count,
      COUNT(DISTINCT wo.work_order_id)::int AS work_order_count,
      MAX(wo.estimated_cost)::text AS estimated_cost
    FROM maintenance_requests mr
    JOIN units u ON u.unit_id = mr.unit_id
    LEFT JOIN request_images ri ON ri.request_id = mr.request_id
    LEFT JOIN work_orders wo ON wo.request_id = mr.request_id
    WHERE u.property_id = ${propertyId}
    GROUP BY
      mr.request_id,
      mr.title,
      mr.status,
      mr.priority,
      mr.submitted_at,
      u.unit_number
    ORDER BY mr.submitted_at DESC
    LIMIT 10
  `) as PropertyDashboardRequest[];

  return {
    property,
    landlord: landlordRows[0] ?? null,
    stats: statsRows[0] ?? {
      total_units: 0,
      occupied_units: 0,
      vacant_units: 0,
      active_tenancies: 0,
      open_requests: 0,
      urgent_requests: 0,
      awaiting_landlord_approval: 0,
      completed_requests: 0,
      attached_documents: 0,
      work_orders: 0,
      estimated_work_value: "0",
    },
    units: unitRows,
    maintenance: requestRows,
  };
}

export async function createProperty(
  input: PropertyInput
): Promise<PropertyOverview> {
  const sql = getSql();

  const rows = (await sql`
    INSERT INTO properties (
      address,
      suburb,
      state,
      postcode,
      property_type,
      num_units,
      manager_id
    )
    VALUES (
      ${input.address},
      ${input.suburb},
      ${input.state},
      ${input.postcode},
      ${input.property_type},
      ${input.num_units},
      ${input.manager_id}
    )
    RETURNING
      property_id,
      address,
      suburb,
      state,
      postcode,
      property_type,
      num_units,
      owner_id,
      NULL::varchar AS owner_first_name,
      NULL::varchar AS owner_last_name,
      NULL::varchar AS owner_email,
      manager_id
  `) as PropertyOverview[];

  return rows[0];
}

export async function updateProperty(
  propertyId: number,
  input: PropertyInput
): Promise<PropertyOverview | null> {
  const sql = getSql();

  const rows = (await sql`
    WITH updated_property AS (
      UPDATE properties
      SET
        address = ${input.address},
        suburb = ${input.suburb},
        state = ${input.state},
        postcode = ${input.postcode},
        property_type = ${input.property_type},
        num_units = ${input.num_units}
      WHERE property_id = ${propertyId}
        AND manager_id = ${input.manager_id}
      RETURNING
        property_id,
        address,
        suburb,
        state,
        postcode,
        property_type,
        num_units,
        owner_id,
        manager_id
    )
    SELECT
      updated_property.property_id,
      updated_property.address,
      updated_property.suburb,
      updated_property.state,
      updated_property.postcode,
      updated_property.property_type,
      updated_property.num_units,
      updated_property.owner_id,
      owner.first_name AS owner_first_name,
      owner.last_name AS owner_last_name,
      owner.email AS owner_email,
      updated_property.manager_id
    FROM updated_property
    LEFT JOIN users owner ON owner.user_id = updated_property.owner_id
  `) as PropertyOverview[];

  return rows[0] ?? null;
}

export async function linkLandlordToProperty(
  propertyId: number,
  managerId: number,
  landlordId: number
): Promise<PropertyOverview | null> {
  const sql = getSql();

  const rows = (await sql`
    UPDATE properties p
    SET owner_id = landlord.user_id
    FROM users landlord
    WHERE p.property_id = ${propertyId}
      AND p.manager_id = ${managerId}
      AND landlord.user_id = ${landlordId}
      AND landlord.role = 'landlord'
      AND landlord.is_active = TRUE
    RETURNING
      p.property_id,
      p.address,
      p.suburb,
      p.state,
      p.postcode,
      p.property_type,
      p.num_units,
      p.owner_id,
      landlord.first_name AS owner_first_name,
      landlord.last_name AS owner_last_name,
      landlord.email AS owner_email,
      p.manager_id
  `) as PropertyOverview[];

  return rows[0] ?? null;
}

export async function createLandlordAndLinkToProperty(
  propertyId: number,
  managerId: number,
  input: LandlordInput
): Promise<{ landlord: LandlordOption; property: PropertyOverview } | null> {
  const sql = getSql();

  if (!(await hasManagedProperty(propertyId, managerId))) {
    return null;
  }

  const landlordRows = (await sql`
    INSERT INTO users (
      email,
      password_hash,
      first_name,
      last_name,
      phone,
      role
    )
    VALUES (
      ${input.email},
      ${input.password_hash},
      ${input.first_name},
      ${input.last_name},
      ${input.phone},
      'landlord'
    )
    RETURNING user_id, email, first_name, last_name, phone
  `) as LandlordOption[];

  const landlord = landlordRows[0];

  if (!landlord) {
    return null;
  }

  const property = await linkLandlordToProperty(
    propertyId,
    managerId,
    landlord.user_id
  );

  if (!property) {
    return null;
  }

  return { landlord, property };
}
