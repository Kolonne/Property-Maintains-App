import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getPropertyDashboardForManager,
  getPropertyDashboardForLandlord,
  isActiveLandlord,
  isActivePropertyManager,
  updateProperty,
} from "@/lib/queries/properties";
import type { PropertyType } from "@/lib/types";

const propertyTypes: PropertyType[] = ["house", "unit"];

function normaliseText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getPropertyType(value: unknown): PropertyType | null {
  return propertyTypes.includes(value as PropertyType)
    ? (value as PropertyType)
    : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);
    const userId = Number(request.nextUrl.searchParams.get("userId"));
    const role = request.nextUrl.searchParams.get("role");

    if (!propertyId) {
      return NextResponse.json(
        { error: "A valid property id is required." },
        { status: 400 }
      );
    }

    const dashboard =
      role === "property_manager" && (await isActivePropertyManager(userId))
        ? await getPropertyDashboardForManager(propertyId, userId)
        : role === "landlord" && (await isActiveLandlord(userId))
          ? await getPropertyDashboardForLandlord(propertyId, userId)
          : null;

    if (!dashboard) {
      return NextResponse.json(
        { error: "Property not found or not available to this user." },
        { status: role === "property_manager" || role === "landlord" ? 404 : 403 }
      );
    }

    return NextResponse.json({ dashboard });
  } catch (error) {
    console.error("Failed to load property dashboard", error);

    return NextResponse.json(
      { error: "Failed to load property dashboard." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);
    const body = (await request.json()) as {
      userId?: number;
      role?: string;
      address?: string;
      suburb?: string;
      state?: string;
      postcode?: string;
      propertyType?: PropertyType;
      numUnits?: number;
    };

    const userId = Number(body.userId);

    if (
      !propertyId ||
      body.role !== "property_manager" ||
      !(await isActivePropertyManager(userId))
    ) {
      return NextResponse.json(
        { error: "Only Property Managers can update property records." },
        { status: 403 }
      );
    }

    const address = body.address?.trim();
    const propertyType = getPropertyType(body.propertyType);
    const numUnits = Number(body.numUnits);

    if (!address) {
      return NextResponse.json(
        { error: "Property address is required." },
        { status: 400 }
      );
    }

    if (!propertyType) {
      return NextResponse.json(
        { error: "Select a valid property type." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(numUnits) || numUnits < 1 || numUnits > 200) {
      return NextResponse.json(
        { error: "Number of units must be between 1 and 200." },
        { status: 400 }
      );
    }

    const property = await updateProperty(propertyId, {
      address,
      suburb: normaliseText(body.suburb),
      state: normaliseText(body.state),
      postcode: normaliseText(body.postcode),
      property_type: propertyType,
      num_units: numUnits,
      manager_id: userId,
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or not managed by this Property Manager." },
        { status: 404 }
      );
    }

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Failed to update property", error);

    return NextResponse.json(
      { error: "Failed to update property." },
      { status: 500 }
    );
  }
}
