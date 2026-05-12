import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createMaintenanceRequest,
  getMaintenanceUnitOptions,
} from "@/lib/queries/maintenance";
import type { RequestCategory, RequestPriority, UserRole } from "@/lib/types";

const categories: Array<RequestCategory | ""> = [
  "",
  "plumbing",
  "electrical",
  "structural",
  "appliance",
  "pest",
  "general",
];

const priorities: RequestPriority[] = ["low", "medium", "high", "urgent"];
const roles: UserRole[] = ["tenant", "landlord", "property_manager"];

function getValidUserRole(value: string | null): UserRole | null {
  return roles.includes(value as UserRole) ? (value as UserRole) : null;
}

export async function GET(request: NextRequest) {
  const userId = Number(request.nextUrl.searchParams.get("userId"));
  const role = getValidUserRole(request.nextUrl.searchParams.get("role"));

  if (!userId || !role) {
    return NextResponse.json(
      { error: "A valid userId and role are required." },
      { status: 400 }
    );
  }

  try {
    const units = await getMaintenanceUnitOptions(userId, role);

    return NextResponse.json({ units });
  } catch (error) {
    console.error("Failed to load maintenance form options", error);

    return NextResponse.json(
      { error: "Failed to load maintenance form options." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: number;
      role?: string;
      unitId?: number;
      title?: string;
      description?: string;
      category?: RequestCategory | "";
      priority?: RequestPriority;
    };

    const role = getValidUserRole(body.role ?? null);
    const title = body.title?.trim();
    const description = body.description?.trim() || null;
    const category = body.category ?? "";
    const priority = body.priority ?? "medium";

    if (!body.userId || !role) {
      return NextResponse.json(
        { error: "A valid current user is required." },
        { status: 400 }
      );
    }

    if (!body.unitId) {
      return NextResponse.json(
        { error: "Please select a property or unit." },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Please enter a request title." },
        { status: 400 }
      );
    }

    if (!categories.includes(category)) {
      return NextResponse.json(
        { error: "Please select a valid category." },
        { status: 400 }
      );
    }

    if (!priorities.includes(priority)) {
      return NextResponse.json(
        { error: "Please select a valid priority." },
        { status: 400 }
      );
    }

    const availableUnits = await getMaintenanceUnitOptions(body.userId, role);
    const canUseUnit = availableUnits.some(
      (unit) => unit.unit_id === body.unitId
    );

    if (!canUseUnit) {
      return NextResponse.json(
        { error: "You cannot create a request for that unit." },
        { status: 403 }
      );
    }

    const requestRow = await createMaintenanceRequest({
      unit_id: body.unitId,
      reported_by: body.userId,
      title,
      description,
      category: category === "" ? null : category,
      priority,
    });

    return NextResponse.json({ request: requestRow }, { status: 201 });
  } catch (error) {
    console.error("Failed to create maintenance request", error);

    return NextResponse.json(
      { error: "Failed to create maintenance request." },
      { status: 500 }
    );
  }
}
