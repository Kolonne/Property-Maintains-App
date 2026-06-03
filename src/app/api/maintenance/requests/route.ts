import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceUnitOptions,
} from "@/lib/queries/maintenance";
import type {
  RequestCategory,
  RequestPriority,
  RequestStatus,
  UserRole,
} from "@/lib/types";

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
const statuses: RequestStatus[] = [
  "submitted",
  "acknowledged",
  "in_progress",
  "awaiting_landlord_approval",
  "landlord_approved",
  "completed",
  "closed",
];

const tenantInProgressStatuses: RequestStatus[] = [
  "in_progress",
  "awaiting_landlord_approval",
  "landlord_approved",
];

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
    const requests = await getMaintenanceRequests(userId, role);
    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase();
    const filteredRequests = requests.filter((maintenanceRequest) => {
      const matchesStatus =
        !status ||
        status === "all" ||
        (role === "tenant" &&
          status === "in_progress" &&
          tenantInProgressStatuses.includes(maintenanceRequest.status)) ||
        (statuses.includes(status as RequestStatus) &&
          maintenanceRequest.status === status);

      const searchableText = [
        maintenanceRequest.title,
        maintenanceRequest.description,
        maintenanceRequest.category,
        maintenanceRequest.priority,
        maintenanceRequest.status,
        maintenanceRequest.property_address,
        maintenanceRequest.property_suburb,
        maintenanceRequest.unit_number,
        maintenanceRequest.reporter_first_name,
        maintenanceRequest.reporter_last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);

      return matchesStatus && matchesSearch;
    });

    return NextResponse.json({ units, requests: filteredRequests });
  } catch (error) {
    console.error("Failed to load maintenance requests", error);

    return NextResponse.json(
      { error: "Failed to load maintenance requests." },
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
