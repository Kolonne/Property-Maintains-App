import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getApprovalQueue,
  getLandlordDashboardStats,
  getLandlordPendingCount,
  getLandlordProperties,
  getLandlordRecentRequests,
} from "@/lib/queries/landlord";

// TODO: Replace demo user ID with authenticated session user ID once real auth is implemented.
const DEMO_LANDLORD_ID = 1;

export const dynamic = "force-dynamic";

function getDashboardUserId(request: NextRequest) {
  return Number(request.nextUrl.searchParams.get("userId")) || DEMO_LANDLORD_ID;
}

export async function GET(request: NextRequest) {
  try {
    const userId = getDashboardUserId(request);
    const [properties, pendingCount, approvalQueue, recentRequests, stats] =
      await Promise.all([
        getLandlordProperties(userId),
        getLandlordPendingCount(userId),
        getApprovalQueue(userId),
        getLandlordRecentRequests(userId, 5),
        getLandlordDashboardStats(userId),
      ]);

    return NextResponse.json({
      properties,
      pendingCount,
      approvalQueue,
      recentRequests,
      stats,
    });
  } catch (error) {
    console.error("Failed to load landlord dashboard data", error);

    return NextResponse.json(
      { error: "Failed to load landlord dashboard data" },
      { status: 500 }
    );
  }
}
