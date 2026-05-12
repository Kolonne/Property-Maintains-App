"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CurrentUser } from "@/context/UserContext";
import type { MaintenanceRequestDetail } from "@/lib/queries/maintenance";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import StatusBadge from "./StatusBadge";

type MaintenanceDetailProps = {
  requestId: string;
  currentUser: CurrentUser;
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

function formatLabel(value: string | null) {
  if (!value) {
    return "Not specified";
  }

  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function MaintenanceDetail({
  requestId,
  currentUser,
}: MaintenanceDetailProps) {
  const [request, setRequest] = useState<MaintenanceRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const canLandlordAct =
    currentUser.role === "landlord" &&
    request.status === "awaiting_landlord_approval";

  return (
    <section>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <Link href="/maintenance" className="small text-decoration-none">
            Back to maintenance
          </Link>
          <h1 className="h3 mt-2 mb-1">{request.title}</h1>
          <p className="text-muted mb-0">
            {request.property_address}
            {request.property_suburb ? `, ${request.property_suburb}` : ""}
            {request.unit_number ? ` - Unit ${request.unit_number}` : ""}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
          <PriorityBadge priority={request.priority} />
          <StatusBadge status={request.status} />
          {canLandlordAct && (
            <>
              <button
                className="btn btn-sm"
                type="button"
                style={{
                  backgroundColor: "#7d8a6a",
                  border: "1px solid #7d8a6a",
                  borderRadius: "999px",
                  color: "#fffefb",
                  fontWeight: 700,
                  padding: "7px 15px",
                }}
              >
                Approve
              </button>
              <button
                className="btn btn-sm"
                type="button"
                style={{
                  backgroundColor: "#fffefb",
                  border: "1px solid #a8593e",
                  borderRadius: "999px",
                  color: "#a8593e",
                  fontWeight: 700,
                  padding: "7px 15px",
                }}
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div
            className="p-4 h-100"
            style={{
              background: "#fffefb",
              border: "1px solid #c5c0b1",
              borderRadius: "6px",
            }}
          >
            <h2 className="pm-section-heading h5 mb-3">Request Details</h2>

            <dl className="row mb-0">
              <dt className="col-sm-4 text-muted">Category</dt>
              <dd className="col-sm-8">{formatLabel(request.category)}</dd>

              <dt className="col-sm-4 text-muted">Description</dt>
              <dd className="col-sm-8">
                {request.description || "No description provided."}
              </dd>

              <dt className="col-sm-4 text-muted">Reported by</dt>
              <dd className="col-sm-8">
                {reporterName}
                <div className="small text-muted">{request.reporter_email}</div>
              </dd>
            </dl>
          </div>
        </div>

        <div className="col-lg-4">
          <div
            className="p-4"
            style={{
              background: "#fffefb",
              border: "1px solid #c5c0b1",
              borderRadius: "6px",
            }}
          >
            <h2 className="pm-section-heading h5 mb-3">Timeline</h2>
            <dl className="mb-0">
              <dt className="text-muted">Submitted</dt>
              <dd>{formatDate(request.submitted_at)}</dd>

              <dt className="text-muted">Acknowledged</dt>
              <dd>{formatDate(request.acknowledged_at)}</dd>

              <dt className="text-muted">Completed</dt>
              <dd>{formatDate(request.completed_at)}</dd>

              <dt className="text-muted">Closed</dt>
              <dd className="mb-0">{formatDate(request.closed_at)}</dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
