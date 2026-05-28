import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createProperty,
  getLandlordOptions,
  getPropertiesForLandlord,
  getPropertiesForManager,
  isActiveLandlord,
  isActivePropertyManager,
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

async function assertPropertyManager(userId: number, role: unknown) {
  if (!userId || role !== "property_manager") {
    return false;
  }

  return isActivePropertyManager(userId);
}

export async function GET(request: NextRequest) {
  const userId = Number(request.nextUrl.searchParams.get("userId"));
  const role = request.nextUrl.searchParams.get("role");

  try {
    if (role === "landlord" && (await isActiveLandlord(userId))) {
      const properties = await getPropertiesForLandlord(userId);
      return NextResponse.json({ properties, landlords: [] });
    }

    if (!(await assertPropertyManager(userId, role))) {
      return NextResponse.json(
        { error: "Only Property Managers and linked Landlords can access properties." },
        { status: 403 }
      );
    }

    const [properties, landlords] = await Promise.all([
      getPropertiesForManager(userId),
      getLandlordOptions(),
    ]);

    return NextResponse.json({ properties, landlords });
  } catch (error) {
    console.error("Failed to load properties", error);

    return NextResponse.json(
      { error: "Failed to load properties." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const isPropertyManager = await assertPropertyManager(userId, body.role);

    if (!isPropertyManager) {
      return NextResponse.json(
        { error: "Only Property Managers can create property records." },
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

    const property = await createProperty({
      address,
      suburb: normaliseText(body.suburb),
      state: normaliseText(body.state),
      postcode: normaliseText(body.postcode),
      property_type: propertyType,
      num_units: numUnits,
      manager_id: userId,
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Failed to create property", error);

    return NextResponse.json(
      { error: "Failed to create property." },
      { status: 500 }
    );
  }
}
