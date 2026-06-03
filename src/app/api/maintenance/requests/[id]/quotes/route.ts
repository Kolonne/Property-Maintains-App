import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createMaintenanceQuote,
  getMaintenanceQuoteRequirement,
  getMaintenanceQuotes,
  getMaintenanceRequestDetail,
  progressMaintenanceRequestAfterQuote,
  type MaintenanceRequestQuote,
} from "@/lib/queries/maintenance";
import type { UserRole } from "@/lib/types";

const roles: UserRole[] = ["tenant", "landlord", "property_manager"];

type ClientMaintenanceQuote = {
  id: number;
  contractorName: string;
  quotedAmount: string;
  availabilityNote: string | null;
  quoteNotes: string | null;
  isPreapprovedContractor: boolean;
  createdByName: string;
  createdAt: string;
};

function getValidUserRole(value: string | null): UserRole | null {
  return roles.includes(value as UserRole) ? (value as UserRole) : null;
}

function getCreatorName(quote: MaintenanceRequestQuote) {
  const fullName = [quote.creator_first_name, quote.creator_last_name]
    .filter(Boolean)
    .join(" ");

  return fullName || quote.creator_email;
}

function toClientQuote(quote: MaintenanceRequestQuote): ClientMaintenanceQuote {
  return {
    id: quote.quote_id,
    contractorName: quote.contractor_name,
    quotedAmount: quote.quoted_amount,
    availabilityNote: quote.availability_note,
    quoteNotes: quote.quote_notes,
    isPreapprovedContractor: quote.is_preapproved_contractor,
    createdByName: getCreatorName(quote),
    createdAt: quote.created_at,
  };
}

async function validateAccess(request: NextRequest, requestId: number) {
  const userId = Number(request.nextUrl.searchParams.get("userId"));
  const role = getValidUserRole(request.nextUrl.searchParams.get("role"));

  if (!requestId || !userId || !role) {
    return {
      error: NextResponse.json(
        { error: "A valid request id, userId, and role are required." },
        { status: 400 }
      ),
    };
  }

  if (role === "tenant") {
    return {
      error: NextResponse.json(
        { error: "You are not authorised to access request quotes." },
        { status: 403 }
      ),
    };
  }

  const maintenanceRequest = await getMaintenanceRequestDetail(
    requestId,
    userId,
    role
  );

  if (!maintenanceRequest) {
    return {
      error: NextResponse.json(
        { error: "Maintenance request not found or access denied." },
        { status: 404 }
      ),
    };
  }

  return { userId, role, maintenanceRequest };
}

function getRequirementStatus(quotes: MaintenanceRequestQuote[]) {
  const hasPreapprovedQuote = quotes.some(
    (quote) => quote.is_preapproved_contractor
  );

  return {
    isRequirementMet: quotes.length >= 3 || hasPreapprovedQuote,
    quoteCount: quotes.length,
    hasPreapprovedQuote,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestId = Number(id);

  try {
    const access = await validateAccess(request, requestId);

    if ("error" in access) {
      return access.error;
    }

    const quotes = await getMaintenanceQuotes(requestId);

    return NextResponse.json({
      quotes: quotes.map(toClientQuote),
      requirement: getRequirementStatus(quotes),
      approvedQuoteId: access.maintenanceRequest.approved_quote_id,
    });
  } catch (error) {
    console.error("Failed to load maintenance quotes", error);

    return NextResponse.json(
      { error: "Failed to load maintenance quotes." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestId = Number(id);

  try {
    const access = await validateAccess(request, requestId);

    if ("error" in access) {
      return access.error;
    }

    if (access.role !== "property_manager") {
      return NextResponse.json(
        { error: "Only property managers can add quotes." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as {
      contractorName?: unknown;
      quotedAmount?: unknown;
      availabilityNote?: unknown;
      quoteNotes?: unknown;
      isPreapprovedContractor?: unknown;
    };

    const contractorName =
      typeof body.contractorName === "string"
        ? body.contractorName.trim()
        : "";
    const quotedAmount =
      typeof body.quotedAmount === "string" ||
      typeof body.quotedAmount === "number"
        ? String(body.quotedAmount).trim()
        : "";
    const numericAmount = Number(quotedAmount);
    const availabilityNote =
      typeof body.availabilityNote === "string"
        ? body.availabilityNote.trim()
        : "";
    const quoteNotes =
      typeof body.quoteNotes === "string" ? body.quoteNotes.trim() : "";

    if (!contractorName) {
      return NextResponse.json(
        { error: "Contractor name is required." },
        { status: 400 }
      );
    }

    if (!quotedAmount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Quoted amount must be a positive number." },
        { status: 400 }
      );
    }

    const quote = await createMaintenanceQuote({
      requestId,
      createdBy: access.userId,
      contractorName,
      quotedAmount,
      availabilityNote: availabilityNote || null,
      quoteNotes: quoteNotes || null,
      isPreapprovedContractor: body.isPreapprovedContractor === true,
    });
    const status = await progressMaintenanceRequestAfterQuote(requestId);
    const requirement = await getMaintenanceQuoteRequirement(requestId);

    return NextResponse.json(
      {
        quote: toClientQuote(quote),
        requirement,
        status,
        approvedQuoteId: access.maintenanceRequest.approved_quote_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create maintenance quote", error);

    return NextResponse.json(
      { error: "Failed to add maintenance quote." },
      { status: 500 }
    );
  }
}
