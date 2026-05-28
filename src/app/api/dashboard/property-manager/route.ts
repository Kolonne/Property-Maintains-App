import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getPMOpenRequests,
  getPMRecentCompleted,
  getPMStats,
} from "@/lib/queries/pm";

// TODO: Replace demo user ID with authenticated session user ID once real auth is implemented.
const DEMO_PROPERTY_MANAGER_ID = 2;

export const dynamic = "force-dynamic";

function getDashboardUserId(request: NextRequest) {
  return (
    Number(request.nextUrl.searchParams.get("userId")) ||
    DEMO_PROPERTY_MANAGER_ID
  );
}

export async function GET(request: NextRequest) {
  try {
    const userId = getDashboardUserId(request);
    const [stats, openRequests, recentCompleted] = await Promise.all([
      getPMStats(userId),
      getPMOpenRequests(userId),
      getPMRecentCompleted(userId),
    ]);

    return NextResponse.json({
      stats,
      openRequests,
      recentCompleted,
    });
  } catch (error) {
    console.error("Failed to load property manager dashboard data", error);

    return NextResponse.json(
      { error: "Failed to load property manager dashboard data" },
      { status: 500 }
    );
  }
}
