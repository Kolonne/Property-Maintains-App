import { NextResponse } from "next/server";
import {
  getApprovalQueue,
  getLandlordPendingCount,
  getLandlordProperties,
  getLandlordRecentRequests,
} from "@/lib/queries/landlord";

// TODO: Replace demo user ID with authenticated session user ID once real auth is implemented.
const DEMO_LANDLORD_ID = 1;

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [properties, pendingCount, approvalQueue, recentRequests] =
      await Promise.all([
        getLandlordProperties(DEMO_LANDLORD_ID),
        getLandlordPendingCount(DEMO_LANDLORD_ID),
        getApprovalQueue(DEMO_LANDLORD_ID),
        getLandlordRecentRequests(DEMO_LANDLORD_ID, 5),
      ]);

    return NextResponse.json({
      properties,
      pendingCount,
      approvalQueue,
      recentRequests,
    });
  } catch (error) {
    console.error("Failed to load landlord dashboard data", error);

    return NextResponse.json(
      { error: "Failed to load landlord dashboard data" },
      { status: 500 }
    );
  }
}
