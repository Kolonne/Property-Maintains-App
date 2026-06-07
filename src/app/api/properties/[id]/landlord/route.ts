import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createLandlordAndLinkToProperty,
  getLandlordOptions,
  isActivePropertyManager,
  linkLandlordToProperty,
} from "@/lib/queries/properties";

function normaliseText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);
    const body = (await request.json()) as {
      userId?: number;
      role?: string;
      mode?: "existing" | "new";
      landlordId?: number;
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    };

    const userId = Number(body.userId);

    if (
      !propertyId ||
      body.role !== "property_manager" ||
      !(await isActivePropertyManager(userId))
    ) {
      return NextResponse.json(
        { error: "Only Property Managers can create or link landlord accounts." },
        { status: 403 }
      );
    }

    if (body.mode === "existing") {
      const landlordId = Number(body.landlordId);

      if (!landlordId) {
        return NextResponse.json(
          { error: "Select an existing landlord to link." },
          { status: 400 }
        );
      }

      const property = await linkLandlordToProperty(
        propertyId,
        userId,
        landlordId
      );

      if (!property) {
        return NextResponse.json(
          { error: "Unable to link that landlord to this property." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        property,
        landlords: await getLandlordOptions(),
        message: "Landlord linked to property.",
      });
    }

    if (body.mode !== "new") {
      return NextResponse.json(
        { error: "Choose whether to link an existing landlord or create a new one." },
        { status: 400 }
      );
    }

    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Enter a valid landlord email address." },
        { status: 400 }
      );
    }

    if (password.trim().length < 6) {
      return NextResponse.json(
        { error: "Enter a password with at least 6 characters." },
        { status: 400 }
      );
    }

    const result = await createLandlordAndLinkToProperty(propertyId, userId, {
      email,
      password_hash: password,
      first_name: normaliseText(body.firstName),
      last_name: normaliseText(body.lastName),
      phone: normaliseText(body.phone),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Unable to create and link the landlord account." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        property: result.property,
        landlord: result.landlord,
        landlords: await getLandlordOptions(),
        message: "Landlord account created and linked to property.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create or link landlord", error);

    const message =
      error instanceof Error && error.message.includes("duplicate key")
        ? "A user with that email already exists. Search for the existing landlord and link them instead."
        : "Failed to create or link landlord.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
