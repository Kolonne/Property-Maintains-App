import { NextResponse } from "next/server";
import { getDevUsersByRole } from "@/lib/queries/users";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const usersByRole = await getDevUsersByRole();

    return NextResponse.json(usersByRole);
  } catch (error) {
    console.error("Failed to load dev users", error);

    return NextResponse.json(
      { error: "Failed to load dev users" },
      { status: 500 }
    );
  }
}
