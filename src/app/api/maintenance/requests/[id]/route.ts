import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getMaintenanceRequestDetail } from "@/lib/queries/maintenance";
import type { UserRole } from "@/lib/types";

const roles: UserRole[] = ["tenant", "landlord", "property_manager"];

function getValidUserRole(value: string | null): UserRole | null {
  return roles.includes(value as UserRole) ? (value as UserRole) : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestId = Number(id);
  const userId = Number(request.nextUrl.searchParams.get("userId"));
  const role = getValidUserRole(request.nextUrl.searchParams.get("role"));

  if (!requestId || !userId || !role) {
    return NextResponse.json(
      { error: "A valid request id, userId, and role are required." },
      { status: 400 }
    );
  }

  try {
    const maintenanceRequest = await getMaintenanceRequestDetail(
      requestId,
      userId,
      role
    );

    if (!maintenanceRequest) {
      return NextResponse.json(
        { error: "Maintenance request not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ request: maintenanceRequest });
  } catch (error) {
    console.error("Failed to load maintenance request detail", error);

    return NextResponse.json(
      { error: "Failed to load maintenance request detail." },
      { status: 500 }
    );
  }
}
