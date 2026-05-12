import { NextResponse } from "next/server";
import {
  getPMOpenRequests,
  getPMRecentCompleted,
  getPMStats,
} from "@/lib/queries/pm";

// TODO: Replace demo user ID with authenticated session user ID once real auth is implemented.
const DEMO_PROPERTY_MANAGER_ID = 2;

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [stats, openRequests, recentCompleted] = await Promise.all([
      getPMStats(DEMO_PROPERTY_MANAGER_ID),
      getPMOpenRequests(DEMO_PROPERTY_MANAGER_ID),
      getPMRecentCompleted(DEMO_PROPERTY_MANAGER_ID),
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
