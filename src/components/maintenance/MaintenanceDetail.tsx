"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { CurrentUser } from "@/context/UserContext";
import type { MaintenanceRequestDetail } from "@/lib/queries/maintenance";
import { hasPermission } from "@/lib/permissions";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import RequestDiscussion from "./RequestDiscussion";
import RequestQuotes, {
  type MaintenanceQuote,
  type QuoteRequirement,
  type QuoteStatusUpdate,
} from "./RequestQuotes";
import StatusBadge from "./StatusBadge";

type MaintenanceDetailProps = {
  requestId: string;
  currentUser: CurrentUser;
};

const tenantWorkingStatuses = [
  "in_progress",
  "awaiting_landlord_approval",
  "landlord_approved",
];

const statusHelpText: Record<string, string> = {
  submitted: "The request has been submitted and is waiting for review.",
  acknowledged: "The property manager has reviewed the request.",
  in_progress:
    "The property manager is gathering or reviewing repair options.",
  awaiting_landlord_approval: "Quotes are ready for the landlord to review.",
  landlord_approved: "The landlord has approved the repair work.",
  completed: "The repair has been completed.",
  closed: "No further action is required.",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTimelineDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatLabel(value: string | null) {
  if (!value) {
    return "Not specified";
  }

  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function formatMoney(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(Number(value));
}

function getFileName(filePath: string) {
  return filePath.split("/").pop() || filePath;
}

function formatQuoteAmountSummary(quotes: MaintenanceQuote[]) {
  if (quotes.length === 0) {
    return "Not set";
  }

  const amounts = quotes
    .map((quote) => Number(quote.quotedAmount))
    .filter((amount) => Number.isFinite(amount))
    .sort((a, b) => a - b);

  if (amounts.length === 0) {
    return "Not set";
  }

  if (amounts.length === 1 || amounts[0] === amounts[amounts.length - 1]) {
    return formatMoney(String(amounts[0]));
  }

  return `${formatMoney(String(amounts[0]))} - ${formatMoney(
    String(amounts[amounts.length - 1])
  )}`;
}

function formatQuoteAvailabilitySummary(quotes: MaintenanceQuote[]) {
  const availabilityNotes = quotes
    .map((quote) => quote.availabilityNote?.trim())
    .filter((note): note is string => Boolean(note));

  if (availabilityNotes.length === 0) {
    return "Not set";
  }

  if (availabilityNotes.length === 1) {
    return availabilityNotes[0];
  }

  return "See quotes";
}

export default function MaintenanceDetail({
  requestId,
  currentUser,
}: MaintenanceDetailProps) {
  const [request, setRequest] = useState<MaintenanceRequestDetail | null>(null);
  const [quoteRequirement, setQuoteRequirement] =
    useState<QuoteRequirement | null>(null);
  const [quotes, setQuotes] = useState<MaintenanceQuote[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const [approvedQuote, setApprovedQuote] = useState<MaintenanceQuote | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusActionError, setStatusActionError] = useState<string | null>(
    null
  );
  const handleQuoteRequirementChange = useCallback(
    (requirement: QuoteRequirement | null) => {
      setQuoteRequirement(requirement);
    },
    []
  );
  const handleQuotesChange = useCallback((nextQuotes: MaintenanceQuote[]) => {
    setQuotes(nextQuotes);
  }, []);
  const applyStatusUpdate = useCallback((status: QuoteStatusUpdate | null) => {
    if (!status) {
      return;
    }

    setRequest((currentRequest) =>
      currentRequest
        ? {
            ...currentRequest,
            status: status.status,
            approved_quote_id: status.approved_quote_id,
            approved_by: status.approved_by,
            acknowledged_at: status.acknowledged_at,
            in_progress_at: status.in_progress_at,
            awaiting_landlord_approval_at:
              status.awaiting_landlord_approval_at,
            landlord_approved_at: status.landlord_approved_at,
            invoice_received_at: status.invoice_received_at,
            completed_at: status.completed_at,
            closed_at: status.closed_at,
          }
        : currentRequest
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadRequest() {
      if (currentUser.id === null || currentUser.role === "null") {
        setError("You must be logged in to view this request.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          userId: String(currentUser.id),
          role: currentUser.role,
        });

        const response = await fetch(
          `/api/maintenance/requests/${requestId}?${params}`
        );

        const data = (await response.json()) as {
          error?: string;
          request?: MaintenanceRequestDetail;
        };

        if (!response.ok || !data.request) {
          throw new Error(data.error ?? "Unable to load request.");
        }

        if (isMounted) {
          setRequest(data.request);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load request."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRequest();

    return () => {
      isMounted = false;
    };
  }, [currentUser.id, currentUser.role, requestId]);

  if (isLoading) {
    return <p>Loading maintenance request...</p>;
  }

  if (error || !request) {
    return (
      <div className="border rounded p-4 bg-white">
        <h1 className="h4">Request unavailable</h1>
        <p className="text-muted mb-3">
          {error ?? "This maintenance request could not be loaded."}
        </p>
        <Link href="/maintenance" className="btn btn-outline-secondary btn-sm">
          Back to maintenance
        </Link>
      </div>
    );
  }

  const reporterName =
    [request.reporter_first_name, request.reporter_last_name]
      .filter(Boolean)
      .join(" ") || request.reporter_email;
  const shouldHideReporterDetails =
    currentUser.role === "landlord" &&
    request.reporter_role === "tenant" &&
    request.reported_by !== currentUser.id;
  const reporterDisplayName = shouldHideReporterDetails
    ? "Tenant Report"
    : reporterName;
  const propertyLabel = `${request.property_address}${
    request.property_suburb ? `, ${request.property_suburb}` : ""
  }${request.unit_number ? ` - Unit ${request.unit_number}` : ""}`;
  const canLandlordAct =
    currentUser.role === "landlord" &&
    (request.status === "in_progress" ||
      request.status === "awaiting_landlord_approval") &&
    (quoteRequirement?.quoteCount ?? 0) > 0 &&
    hasPermission(currentUser.role, "approvals", "approve");
  const evidenceImages = Array.isArray(request.images) ? request.images : [];
  const canViewMaintenanceContext = currentUser.role !== "tenant";
  const isTenantWorkingStatus =
    currentUser.role === "tenant" &&
    tenantWorkingStatuses.includes(request.status);
  const statusLabel = isTenantWorkingStatus ? "Working on it" : undefined;
  const statusHelp = isTenantWorkingStatus
    ? "The property manager is working on this request."
    : statusHelpText[request.status];
  const canAcknowledge =
    currentUser.role === "property_manager" && request.status === "submitted";
  const canMarkCompleted =
    currentUser.role === "property_manager" &&
    ((request.status === "landlord_approved" && Boolean(request.invoice_received_at)) ||
      request.status === "in_progress");
  const canMarkInvoiceReceived =
    currentUser.role === "property_manager" &&
    request.status === "landlord_approved" &&
    !request.invoice_received_at;
  const canClose =
    currentUser.role === "property_manager" && request.status !== "closed";
  const currentApprovedQuote =
    approvedQuote ??
    quotes.find((quote) => quote.id === request.approved_quote_id) ??
    null;
  const tenantWorkingDate =
    request.in_progress_at ??
    request.awaiting_landlord_approval_at ??
    request.landlord_approved_at;
  const timelineItems =
    currentUser.role === "tenant"
      ? [
          { label: "Submitted", timestamp: request.submitted_at },
          { label: "Acknowledged", timestamp: request.acknowledged_at },
          { label: "Working on it", timestamp: tenantWorkingDate },
          { label: "Completed", timestamp: request.completed_at },
          { label: "Closed", timestamp: request.closed_at },
        ]
      : [
          { label: "Submitted", timestamp: request.submitted_at },
          { label: "Acknowledged", timestamp: request.acknowledged_at },
          { label: "In Progress", timestamp: request.in_progress_at },
          {
            label: "Awaiting Landlord Approval",
            timestamp: request.awaiting_landlord_approval_at,
          },
          {
            label: "Landlord Approved",
            timestamp: request.landlord_approved_at,
          },
          { label: "Completed", timestamp: request.completed_at },
          { label: "Closed", timestamp: request.closed_at },
        ];

  async function handleStatusAction(
    action:
      | "acknowledge"
      | "approve"
      | "invoice_received"
      | "complete"
      | "close"
  ) {
    if (currentUser.id === null || currentUser.role === "null") {
      return;
    }

    const params = new URLSearchParams({
      userId: String(currentUser.id),
      role: currentUser.role,
    });
    const body =
      action === "approve"
        ? { action, quoteId: selectedQuoteId }
        : { action };

    if (action === "approve" && !selectedQuoteId) {
      setStatusActionError("Please select a quote before approving.");
      return;
    }

    const response = await fetch(
      `/api/maintenance/requests/${requestId}/status?${params}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    const data = (await response.json()) as {
      error?: string;
      status?: QuoteStatusUpdate;
      approvedQuote?: MaintenanceQuote;
    };

    if (!response.ok || !data.status) {
      setError(data.error ?? "Unable to update request status.");
      return;
    }

    setError(null);
    setStatusActionError(null);
    applyStatusUpdate(data.status);
    if (data.approvedQuote) {
      setApprovedQuote(data.approvedQuote);
      setSelectedQuoteId(data.approvedQuote.id);
    }
  }

  return (
    <section className="pm-maintenance-detail-page">
      <div className="pm-maintenance-detail-heading">
        <div>
          <Link href="/maintenance" className="pm-maintenance-back-link">
            Back to maintenance
          </Link>
          <h1>{request.title}</h1>
          <p>{propertyLabel}</p>
        </div>

        {canLandlordAct ||
        canAcknowledge ||
        canMarkInvoiceReceived ||
        canMarkCompleted ||
        canClose ? (
          <div className="pm-maintenance-header-action-card">
            <div className="pm-maintenance-header-action-card-heading">
              <h2>Status Actions</h2>
              <span>
                {currentUser.role === "landlord"
                  ? "Landlord Decision"
                  : "PM Controls"}
              </span>
            </div>
            <p>
              {currentUser.role === "landlord"
                ? "Select the quote you approve before confirming the work."
                : "Update the request as work progresses."}
            </p>
            {statusActionError ? (
              <p className="pm-maintenance-action-error">
                {statusActionError}
              </p>
            ) : null}
            <div className="pm-maintenance-header-actions">
              {canAcknowledge ? (
                <button
                  className="btn pm-maintenance-primary-action"
                  onClick={() => handleStatusAction("acknowledge")}
                  type="button"
                >
                  Acknowledge
                </button>
              ) : null}
              {canLandlordAct ? (
                <button
                  className="btn pm-maintenance-primary-action"
                  onClick={() => handleStatusAction("approve")}
                  disabled={!selectedQuoteId}
                  type="button"
                >
                  Approve
                </button>
              ) : null}
              {canMarkInvoiceReceived ? (
                <button
                  className="btn pm-maintenance-primary-action"
                  onClick={() => handleStatusAction("invoice_received")}
                  type="button"
                >
                  Invoice Received
                </button>
              ) : null}
              {canMarkCompleted ? (
                <button
                  className="btn pm-maintenance-primary-action"
                  onClick={() => handleStatusAction("complete")}
                  type="button"
                >
                  Mark Completed
                </button>
              ) : null}
              {canClose ? (
                <button
                  className="btn"
                  onClick={() => handleStatusAction("close")}
                  type="button"
                >
                  Close Request
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="pm-maintenance-summary-grid">
        <div className="pm-maintenance-summary-card">
          <span className="pm-maintenance-summary-label">
            Status
            <button
              aria-label="Current status help"
              className="pm-maintenance-status-help"
              title={statusHelp}
              type="button"
            >
              ?
            </button>
          </span>
          <StatusBadge status={request.status} label={statusLabel} />
        </div>
        <div className="pm-maintenance-summary-card">
          <span>Priority</span>
          <PriorityBadge priority={request.priority} />
        </div>
        <div className="pm-maintenance-summary-card">
          <span>Category</span>
          <strong>{formatLabel(request.category)}</strong>
        </div>
        <div className="pm-maintenance-summary-card">
          <span>Submitted</span>
          <strong>{formatDate(request.submitted_at)}</strong>
        </div>
      </div>

      <div className="pm-maintenance-detail-layout">
        <div className="pm-maintenance-layout-main">
          <div className="pm-maintenance-layout-conversation">
            <RequestDiscussion requestId={requestId} currentUser={currentUser} />
          </div>

          {currentUser.role !== "tenant" && currentUser.role !== "null" ? (
            <div className="pm-maintenance-layout-quotes">
              <RequestQuotes
                requestId={requestId}
                currentUser={currentUser}
                selectedQuoteId={selectedQuoteId}
                approvedQuoteId={request.approved_quote_id}
                canSelectForApproval={canLandlordAct}
                onRequirementChange={handleQuoteRequirementChange}
                onStatusChange={applyStatusUpdate}
                onQuotesChange={handleQuotesChange}
                onSelectedQuoteChange={(quoteId) => {
                  setSelectedQuoteId(quoteId);
                  setStatusActionError(null);
                }}
                onApprovedQuoteChange={setApprovedQuote}
              />
            </div>
          ) : null}

          <div className="pm-maintenance-layout-evidence">
            <div className="pm-maintenance-detail-card">
              <div className="pm-maintenance-card-heading">
                <h2>Evidence</h2>
                <span>{request.image_count} uploaded</span>
              </div>

              {evidenceImages.length > 0 ? (
                <div className="pm-maintenance-evidence-grid">
                  {evidenceImages.map((image) => (
                    <div
                      className="pm-maintenance-evidence-item"
                      key={image.image_id}
                    >
                      <span aria-hidden="true">
                        <i className="bi bi-image" />
                      </span>
                      <div>
                        <strong>{getFileName(image.file_path)}</strong>
                        <small>{formatDate(image.uploaded_at)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pm-maintenance-empty-state">
                  No evidence uploaded.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pm-maintenance-layout-side">
          <div className="pm-maintenance-layout-details">
            <div className="pm-maintenance-detail-card">
              <div className="pm-maintenance-card-heading">
                <h2>Request Details</h2>
                <span>Maintenance context</span>
              </div>

              <dl className="pm-maintenance-detail-list">
                {canViewMaintenanceContext ? (
                  <>
                    <div>
                      <dt>Estimated quote</dt>
                      <dd>{formatQuoteAmountSummary(quotes)}</dd>
                    </div>
                    <div>
                      <dt>Work order status</dt>
                      <dd>{formatLabel(request.work_order_status)}</dd>
                    </div>
                    <div>
                      <dt>Availability</dt>
                      <dd>{formatQuoteAvailabilitySummary(quotes)}</dd>
                    </div>
                    <div className="pm-maintenance-detail-list-wide">
                      <dt>Approved quote</dt>
                      <dd>
                        {currentApprovedQuote
                          ? `${currentApprovedQuote.contractorName} - ${formatMoney(
                              currentApprovedQuote.quotedAmount
                            )}${
                              currentApprovedQuote.availabilityNote
                                ? ` - ${currentApprovedQuote.availabilityNote}`
                                : ""
                            }`
                          : "Not approved yet"}
                      </dd>
                    </div>
                  </>
                ) : null}
                <div className="pm-maintenance-detail-list-wide">
                  <dt>Description</dt>
                  <dd>{request.description || "No description provided."}</dd>
                </div>
                <div className="pm-maintenance-detail-list-wide">
                  <dt>Reported by</dt>
                  <dd>
                    {reporterDisplayName}
                    {!shouldHideReporterDetails ? (
                      <span>{request.reporter_email}</span>
                    ) : null}
                  </dd>
                </div>
                {canViewMaintenanceContext && request.work_order_notes ? (
                  <div className="pm-maintenance-detail-list-wide">
                    <dt>Quote / work notes</dt>
                    <dd>{request.work_order_notes}</dd>
                  </div>
                ) : null}
                {currentUser.role === "property_manager" &&
                request.invoice_received_at ? (
                  <div className="pm-maintenance-detail-list-wide">
                    <dt>Invoice received</dt>
                    <dd>{formatTimelineDate(request.invoice_received_at)}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>

          <div className="pm-maintenance-layout-history">
            <div className="pm-maintenance-timeline-card">
              <div className="pm-maintenance-timeline-header">
                <span className="pm-maintenance-timeline-icon" aria-hidden="true">
                  <i className="bi bi-clock-history" />
                </span>
                <div>
                  <h2>Activity History</h2>
                  <p>Current stage: {statusLabel ?? formatLabel(request.status)}.</p>
                </div>
              </div>

              <ol className="pm-maintenance-timeline-list">
                {timelineItems.map((item) => {
                  const isComplete = Boolean(item.timestamp);

                  return (
                    <li
                      key={item.label}
                      className={`pm-maintenance-timeline-item ${
                        isComplete ? "is-complete" : "is-pending"
                      }`}
                    >
                      <span
                        className="pm-maintenance-timeline-marker"
                        aria-hidden="true"
                      />
                      <div className="pm-maintenance-timeline-copy">
                        <h3>{item.label}</h3>
                        <time>{formatTimelineDate(item.timestamp)}</time>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
