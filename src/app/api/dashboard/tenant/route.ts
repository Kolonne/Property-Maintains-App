import { NextResponse } from "next/server";
import {
  getActiveIssueCount,
  getRecentRequests,
  getTenantOverview,
} from "@/lib/queries/tenant";

// TODO: Replace demo user ID with authenticated session user ID once real auth is implemented.
const DEMO_TENANT_ID = 5;

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [overview, recentRequests, activeIssues] = await Promise.all([
      getTenantOverview(DEMO_TENANT_ID),
      getRecentRequests(DEMO_TENANT_ID, 5),
      getActiveIssueCount(DEMO_TENANT_ID),
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
