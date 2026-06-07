import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  approveMaintenanceRequestQuote,
  getMaintenanceQuoteRequirement,
  getMaintenanceRequestDetail,
  markMaintenanceInvoiceReceived,
  updateMaintenanceRequestStatus,
  type MaintenanceRequestQuote,
} from "@/lib/queries/maintenance";
import type { RequestStatus, UserRole } from "@/lib/types";

const roles: UserRole[] = ["tenant", "landlord", "property_manager"];

type StatusAction =
  | "acknowledge"
  | "approve"
  | "invoice_received"
  | "complete"
  | "close";

function getValidUserRole(value: string | null): UserRole | null {
  return roles.includes(value as UserRole) ? (value as UserRole) : null;
}

function getNextStatus(action: StatusAction): RequestStatus {
  if (action === "acknowledge") {
    return "acknowledged";
  }

  if (action === "approve") {
    return "landlord_approved";
  }

  if (action === "complete") {
    return "completed";
  }

  return "closed";
}

function isValidTransition(
  currentStatus: RequestStatus,
  action: StatusAction,
  role: UserRole
) {
  if (role === "tenant") {
    return false;
  }

  if (action === "acknowledge") {
    return role === "property_manager" && currentStatus === "submitted";
  }

  if (action === "approve") {
    return (
      role === "landlord" &&
      (currentStatus === "in_progress" ||
        currentStatus === "awaiting_landlord_approval")
    );
  }

  if (action === "invoice_received") {
    return role === "property_manager" && currentStatus === "landlord_approved";
  }

  if (action === "complete") {
    return (
      role === "property_manager" &&
      (currentStatus === "landlord_approved" || currentStatus === "in_progress")
    );
  }

  return role === "property_manager" && currentStatus !== "closed";
}

function getCreatorName(quote: MaintenanceRequestQuote) {
  const fullName = [quote.creator_first_name, quote.creator_last_name]
    .filter(Boolean)
    .join(" ");

  return fullName || quote.creator_email;
}

function toClientQuote(quote: MaintenanceRequestQuote) {
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestId = Number(id);
  const userId = Number(request.nextUrl.searchParams.get("userId"));
  const role = getValidUserRole(request.nextUrl.searchParams.get("role"));

  if (!requestId || !userId || !role) {
    return NextResponse.json(
      { error: "A valid request id, userId, and role are required." },
      { status: 400 }
    );
  }

  try {
    const body = (await request.json()) as {
      action?: unknown;
      quoteId?: unknown;
    };
    const action =
      typeof body.action === "string" ? (body.action as StatusAction) : null;

    if (
      action !== "acknowledge" &&
      action !== "approve" &&
      action !== "invoice_received" &&
      action !== "complete" &&
      action !== "close"
    ) {
      return NextResponse.json(
        { error: "A valid status action is required." },
        { status: 400 }
      );
    }

    const maintenanceRequest = await getMaintenanceRequestDetail(
      requestId,
      userId,
      role
    );

    if (!maintenanceRequest) {
      return NextResponse.json(
        { error: "Maintenance request not found or access denied." },
        { status: 404 }
      );
    }

    if (!isValidTransition(maintenanceRequest.status, action, role)) {
      return NextResponse.json(
        { error: "You are not authorised to make this status change." },
        { status: 403 }
      );
    }

    if (action === "approve") {
      const requirement = await getMaintenanceQuoteRequirement(requestId);
      const quoteId = Number(body.quoteId);

      if (requirement.quoteCount < 1) {
        return NextResponse.json(
          {
            error: "At least one quote is required before landlord approval.",
          },
          { status: 400 }
        );
      }

      if (!quoteId) {
        return NextResponse.json(
          { error: "Please select a quote before approving." },
          { status: 400 }
        );
      }

      const approval = await approveMaintenanceRequestQuote(
        requestId,
        quoteId,
        userId
      );

      if (!approval) {
        return NextResponse.json(
          { error: "Selected quote does not belong to this request." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        status: approval.status,
        approvedQuote: toClientQuote(approval.quote),
      });
    }

    if (
      action === "complete" &&
      maintenanceRequest.status === "landlord_approved" &&
      !maintenanceRequest.invoice_received_at
    ) {
      return NextResponse.json(
        { error: "Invoice must be marked received before completion." },
        { status: 400 }
      );
    }

    if (action === "invoice_received") {
      const status = await markMaintenanceInvoiceReceived(requestId);

      return NextResponse.json({ status });
    }

    const status = await updateMaintenanceRequestStatus(
      requestId,
      getNextStatus(action)
    );

    return NextResponse.json({ status });
  } catch (error) {
    console.error("Failed to update maintenance request status", error);

    return NextResponse.json(
      { error: "Failed to update maintenance request status." },
      { status: 500 }
    );
  }
}
