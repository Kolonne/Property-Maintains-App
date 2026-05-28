import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isActivePropertyManager } from "@/lib/queries/properties";
import {
  createTenancyForManagedProperty,
  createTenantAccount,
  getTenancyUnitOptions,
  getTenantOptions,
} from "@/lib/queries/tenancies";
import type { RentFrequency, TenancyStatus } from "@/lib/types";

const rentFrequencies: RentFrequency[] = ["weekly", "fortnightly", "monthly"];
const tenancyStatuses: TenancyStatus[] = ["active", "expired", "terminated"];

function normaliseText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getRentFrequency(value: unknown): RentFrequency | null {
  if (!value) {
    return null;
  }

  return rentFrequencies.includes(value as RentFrequency)
    ? (value as RentFrequency)
    : null;
}

function getTenancyStatus(value: unknown): TenancyStatus {
  return tenancyStatuses.includes(value as TenancyStatus)
    ? (value as TenancyStatus)
    : "active";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);
    const userId = Number(request.nextUrl.searchParams.get("userId"));
    const role = request.nextUrl.searchParams.get("role");

    if (
      !propertyId ||
      role !== "property_manager" ||
      !(await isActivePropertyManager(userId))
    ) {
      return NextResponse.json(
        { error: "Only Property Managers can access tenant onboarding." },
        { status: 403 }
      );
    }

    const [units, tenants] = await Promise.all([
      getTenancyUnitOptions(propertyId, userId),
      getTenantOptions(),
    ]);

    return NextResponse.json({ units, tenants });
  } catch (error) {
    console.error("Failed to load tenant onboarding options", error);

    return NextResponse.json(
      { error: "Failed to load tenant onboarding options." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);
    const body = (await request.json()) as {
      userId?: number;
      role?: string;
      mode?: "existing" | "new";
      unitId?: number;
      leaseStart?: string;
      leaseEnd?: string;
      rentAmount?: string;
      rentFrequency?: RentFrequency | "";
      tenancyStatus?: TenancyStatus;
      tenantId?: number;
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      confirmMove?: boolean;
    };

    const userId = Number(body.userId);

    if (
      !propertyId ||
      body.role !== "property_manager" ||
      !(await isActivePropertyManager(userId))
    ) {
      return NextResponse.json(
        { error: "Only Property Managers can create tenancy records." },
        { status: 403 }
      );
    }

    const unitId = Number(body.unitId);
    const leaseStart = body.leaseStart?.trim();
    const leaseEnd = normaliseText(body.leaseEnd);
    const rentAmount = normaliseText(body.rentAmount);
    const rentFrequency = getRentFrequency(body.rentFrequency);
    const tenancyStatus = getTenancyStatus(body.tenancyStatus);

    if (!unitId) {
      return NextResponse.json(
        { error: "Select a property/unit for the tenancy." },
        { status: 400 }
      );
    }

    if (!leaseStart) {
      return NextResponse.json(
        { error: "Lease start date is required." },
        { status: 400 }
      );
    }

    if (rentAmount !== null && Number.isNaN(Number(rentAmount))) {
      return NextResponse.json(
        { error: "Rent amount must be numeric." },
        { status: 400 }
      );
    }

    let tenantId = Number(body.tenantId);

    if (body.mode === "new") {
      const email = body.email?.trim().toLowerCase();
      const password = body.password ?? "";

      if (!email || !isValidEmail(email)) {
        return NextResponse.json(
          { error: "Enter a valid tenant email address." },
          { status: 400 }
        );
      }

      if (password.trim().length < 6) {
        return NextResponse.json(
          { error: "Enter a password with at least 6 characters." },
          { status: 400 }
        );
      }

      const tenant = await createTenantAccount({
        email,
        password_hash: password,
        first_name: normaliseText(body.firstName),
        last_name: normaliseText(body.lastName),
        phone: normaliseText(body.phone),
      });

      tenantId = tenant.user_id;
    }

    if (body.mode === "existing" && !tenantId) {
      return NextResponse.json(
        { error: "Select an existing tenant account." },
        { status: 400 }
      );
    }

    if (body.mode !== "existing" && body.mode !== "new") {
      return NextResponse.json(
        { error: "Choose whether to use an existing tenant or create a new tenant." },
        { status: 400 }
      );
    }

    const tenancy = await createTenancyForManagedProperty(propertyId, userId, {
      unit_id: unitId,
      tenant_id: tenantId,
      lease_start: leaseStart,
      lease_end: leaseEnd,
      rent_amount: rentAmount,
      rent_frequency: rentFrequency,
      status: tenancyStatus,
      confirm_move: body.confirmMove === true,
    });

    if (!tenancy) {
      return NextResponse.json(
        { error: "Unable to create tenancy for this property/unit." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        tenancy,
        tenants: await getTenantOptions(),
        message: "Tenant account linked to tenancy.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to onboard tenant", error);

    let message = "Failed to onboard tenant.";
    let status = 500;

    if (error instanceof Error && error.message === "TENANT_ALREADY_LINKED") {
      message =
        "This tenant is already linked to an active tenancy. Confirm that you want to move them before continuing.";
      status = 409;
    } else if (
      error instanceof Error &&
      error.message.includes("duplicate key")
    ) {
      message =
        "A user with that email already exists. Search for the existing tenant and link them instead.";
    }

    return NextResponse.json({ error: message }, { status });
  }
}
