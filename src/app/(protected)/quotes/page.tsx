"use client";

import Link from "next/link";
import { useCurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";

export default function QuotesPage() {
  const { currentUser } = useCurrentUser();

  if (!hasPermission(currentUser.role, "quotes", "view")) {
    return (
      <section className="pm-dashboard-page px-2 px-lg-3 py-4">
        <div className="pm-dashboard-card p-4">
          <h1 className="h4 fw-bold mb-2">Quotes unavailable</h1>
          <p className="text-muted mb-0">
            You do not have permission to view repair quotes.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="pm-dashboard-page px-2 px-lg-3 py-4">
      <div className="pm-dashboard-card p-4 p-lg-5">
        <div className="d-flex align-items-center gap-3 mb-3">
          <span
            className="d-inline-flex align-items-center justify-content-center"
            style={{
              background: "#fff1e7",
              border: "1px solid #f3c6a7",
              borderRadius: "14px",
              color: "#f97316",
              height: "46px",
              width: "46px",
            }}
          >
            <i className="bi bi-receipt" aria-hidden="true" />
          </span>
          <div>
            <h1 className="h4 fw-bold mb-1">Quotes</h1>
            <p className="text-muted mb-0">
              Repair quote management will be connected here as the prototype expands.
            </p>
          </div>
        </div>

        <Link href="/maintenance" className="btn pm-dashboard-pill-button">
          View maintenance requests
        </Link>
      </div>
    </section>
  );
}
