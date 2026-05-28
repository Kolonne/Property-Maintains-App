import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getUserProfile,
  updateUserProfile,
  type DevUserRole,
} from "@/lib/queries/users";

const roles: DevUserRole[] = ["tenant", "landlord", "property_manager"];

function getValidRole(value: unknown): DevUserRole | null {
  return roles.includes(value as DevUserRole) ? (value as DevUserRole) : null;
}

function normaliseText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET(request: NextRequest) {
  try {
    const userId = Number(request.nextUrl.searchParams.get("userId"));
    const role = getValidRole(request.nextUrl.searchParams.get("role"));

    if (!userId || !role) {
      return NextResponse.json(
        { error: "A valid current user is required." },
        { status: 400 }
      );
    }

    const profile = await getUserProfile(userId, role);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Failed to load profile", error);

    return NextResponse.json(
      { error: "Failed to load profile." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: number;
      role?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };

    const userId = Number(body.userId);
    const role = getValidRole(body.role);
    const email = body.email?.trim().toLowerCase();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "A valid current user is required." },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const profile = await updateUserProfile(userId, role, {
      first_name: normaliseText(body.firstName),
      last_name: normaliseText(body.lastName),
      email,
      phone: normaliseText(body.phone),
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Failed to update profile", error);

    const message =
      error instanceof Error && error.message.includes("duplicate key")
        ? "A user with that email already exists."
        : "Failed to update profile.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
