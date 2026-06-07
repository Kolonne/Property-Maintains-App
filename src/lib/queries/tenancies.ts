import { getSql } from "@/lib/db";
import type { RentFrequency, TenancyStatus } from "@/lib/types";
import { hasManagedProperty } from "@/lib/queries/properties";

export interface TenancyUnitOption {
  unit_id: number;
  unit_number: string | null;
  address: string;
  suburb: string | null;
  status: string;
  current_tenant_id: number | null;
}

export interface TenantOption {
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  active_tenancy_id: number | null;
  active_unit_id: number | null;
  active_property_id: number | null;
  active_property_address: string | null;
  active_unit_number: string | null;
}

export interface TenancyInput {
  unit_id: number;
  tenant_id: number;
  lease_start: string;
  lease_end: string | null;
  rent_amount: string | null;
  rent_frequency: RentFrequency | null;
  status: TenancyStatus;
  confirm_move: boolean;
}

export interface TenantInput {
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export interface TenancyResult {
  tenancy_id: number;
  unit_id: number;
  tenant_id: number;
  lease_start: string;
  lease_end: string | null;
  rent_amount: string | null;
  rent_frequency: RentFrequency | null;
  status: TenancyStatus;
}

export async function getTenancyUnitOptions(
  propertyId: number,
  managerId: number
): Promise<TenancyUnitOption[]> {
  if (!(await hasManagedProperty(propertyId, managerId))) {
    return [];
  }

  const sql = getSql();

  return (await sql`
    SELECT
      u.unit_id,
      u.unit_number,
      p.address,
      p.suburb,
      u.status,
      u.current_tenant_id
    FROM units u
    JOIN properties p ON p.property_id = u.property_id
    WHERE u.property_id = ${propertyId}
    ORDER BY u.unit_number NULLS FIRST, u.unit_id
  `) as TenancyUnitOption[];
}

export async function getTenantOptions(): Promise<TenantOption[]> {
  const sql = getSql();

  return (await sql`
    SELECT
      tenant.user_id,
      tenant.email,
      tenant.first_name,
      tenant.last_name,
      tenant.phone,
      active_tenancy.tenancy_id AS active_tenancy_id,
      active_unit.unit_id AS active_unit_id,
      active_property.property_id AS active_property_id,
      active_property.address AS active_property_address,
      active_unit.unit_number AS active_unit_number
    FROM users tenant
    LEFT JOIN LATERAL (
      SELECT tenancy_id, unit_id
      FROM tenancies
      WHERE tenant_id = tenant.user_id
        AND status = 'active'
      ORDER BY lease_start DESC, tenancy_id DESC
      LIMIT 1
    ) active_tenancy ON TRUE
    LEFT JOIN units active_unit ON active_unit.unit_id = active_tenancy.unit_id
    LEFT JOIN properties active_property ON active_property.property_id = active_unit.property_id
    WHERE tenant.role = 'tenant'
      AND tenant.is_active = TRUE
    ORDER BY tenant.first_name NULLS LAST, tenant.last_name NULLS LAST, tenant.email
  `) as TenantOption[];
}

export async function createTenantAccount(
  input: TenantInput
): Promise<TenantOption> {
  const sql = getSql();

  const rows = (await sql`
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
      'tenant'
    )
    RETURNING
      user_id,
      email,
      first_name,
      last_name,
      phone,
      NULL::integer AS active_tenancy_id,
      NULL::integer AS active_unit_id,
      NULL::integer AS active_property_id,
      NULL::varchar AS active_property_address,
      NULL::varchar AS active_unit_number
  `) as TenantOption[];

  return rows[0];
}

export async function createTenancyForManagedProperty(
  propertyId: number,
  managerId: number,
  input: TenancyInput
): Promise<TenancyResult | null> {
  const sql = getSql();

  if (!(await hasManagedProperty(propertyId, managerId))) {
    return null;
  }

  const tenantRows = (await sql`
    SELECT
      tenant.user_id,
      active_tenancy.tenancy_id AS active_tenancy_id
    FROM users tenant
    LEFT JOIN LATERAL (
      SELECT tenancy_id
      FROM tenancies
      WHERE tenant_id = tenant.user_id
        AND status = 'active'
      ORDER BY lease_start DESC, tenancy_id DESC
      LIMIT 1
    ) active_tenancy ON TRUE
    WHERE tenant.user_id = ${input.tenant_id}
      AND tenant.role = 'tenant'
      AND tenant.is_active = TRUE
    LIMIT 1
  `) as { user_id: number; active_tenancy_id: number | null }[];

  const tenant = tenantRows[0];

  if (!tenant) {
    return null;
  }

  if (tenant.active_tenancy_id && !input.confirm_move) {
    throw new Error("TENANT_ALREADY_LINKED");
  }

  const unitRows = (await sql`
    SELECT unit_id
    FROM units
    WHERE unit_id = ${input.unit_id}
      AND property_id = ${propertyId}
    LIMIT 1
  `) as { unit_id: number }[];

  if (!unitRows[0]) {
    return null;
  }

  if (tenant.active_tenancy_id) {
    await sql`
      UPDATE tenancies
      SET status = 'terminated'
      WHERE tenant_id = ${input.tenant_id}
        AND status = 'active'
    `;

    await sql`
      UPDATE units
      SET current_tenant_id = NULL,
          status = 'vacant'
      WHERE current_tenant_id = ${input.tenant_id}
    `;
  }

  const tenancyRows = (await sql`
    INSERT INTO tenancies (
      unit_id,
      tenant_id,
      lease_start,
      lease_end,
      rent_amount,
      rent_frequency,
      status
    )
    VALUES (
      ${input.unit_id},
      ${input.tenant_id},
      ${input.lease_start},
      ${input.lease_end},
      ${input.rent_amount},
      ${input.rent_frequency},
      ${input.status}
    )
    RETURNING
      tenancy_id,
      unit_id,
      tenant_id,
      lease_start,
      lease_end,
      rent_amount::text,
      rent_frequency,
      status
  `) as TenancyResult[];

  if (input.status === "active") {
    await sql`
      UPDATE units
      SET current_tenant_id = ${input.tenant_id},
          status = 'occupied'
      WHERE unit_id = ${input.unit_id}
    `;
  }

  return tenancyRows[0] ?? null;
}
