import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getActiveIssueCount,
  getRecentRequests,
  getTenantOverview,
} from "@/lib/queries/tenant";

// TODO: Replace demo user ID with authenticated session user ID once real auth is implemented.
const DEMO_TENANT_ID = 5;

export const dynamic = "force-dynamic";

function getDashboardUserId(request: NextRequest) {
  return Number(request.nextUrl.searchParams.get("userId")) || DEMO_TENANT_ID;
}

export async function GET(request: NextRequest) {
  try {
    const userId = getDashboardUserId(request);
    const [overview, recentRequests, activeIssues] = await Promise.all([
      getTenantOverview(userId),
      getRecentRequests(userId, 5),
      getActiveIssueCount(userId),
    ]);

    return NextResponse.json({
      overview,
      recentRequests,
      activeIssues,
    });
  } catch (error) {
    console.error("Failed to load tenant dashboard data", error);

    return NextResponse.json(
      { error: "Failed to load tenant dashboard data" },
      { status: 500 }
    );
  }
}
