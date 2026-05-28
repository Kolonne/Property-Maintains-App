"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";
import type { PropertyDashboard } from "@/lib/queries/properties";
import EmptyState from "@/components/shared/EmptyState";

type PropertyDashboardClientProps = {
  propertyId: number;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: string | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function personName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback = "Not assigned"
) {
  return [firstName, lastName].filter(Boolean).join(" ") || fallback;
}

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function PropertyDashboardClient({
  propertyId,
}: PropertyDashboardClientProps) {
  const { currentUser } = useCurrentUser();
  const [dashboard, setDashboard] = useState<PropertyDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canViewProperty =
    currentUser.id !== null &&
    hasPermission(currentUser.role, "properties", "view");
  const isPropertyManager = currentUser.role === "property_manager";
  const isLandlord = currentUser.role === "landlord";

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (!canViewProperty || currentUser.id === null) {
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
        const response = await fetch(`/api/properties/${propertyId}?${params}`);
        const data = (await response.json()) as {
          error?: string;
          dashboard?: PropertyDashboard;
        };

        if (!response.ok || !data.dashboard) {
          throw new Error(data.error ?? "Failed to load property dashboard.");
        }

        if (isMounted) {
          setDashboard(data.dashboard);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load property dashboard."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [canViewProperty, currentUser.id, currentUser.role, propertyId]);

  if (!canViewProperty) {
    return (
      <EmptyState
        title="Access denied"
        message="You do not have permission to view property dashboards."
      />
    );
  }

  if (isLoading) {
    return (
      <section className="pm-dashboard-page mx-auto px-2 px-lg-3 py-3">
        <div className="pm-dashboard-card p-4">
          <p className="text-muted mb-0">Loading property dashboard...</p>
        </div>
      </section>
    );
  }

  if (error || !dashboard) {
    return (
      <section className="pm-dashboard-page mx-auto px-2 px-lg-3 py-3">
        <div className="alert alert-danger mb-0">
          {error ?? "Property dashboard unavailable."}
        </div>
      </section>
    );
  }

  const { property, landlord, stats, units, maintenance } = dashboard;
  const fullAddress = [property.address, property.suburb, property.state, property.postcode]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="pm-dashboard-page mx-auto px-2 px-lg-3 py-3">
      <div className="pm-maintenance-new-header mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="h3 mb-2">{property.address}</h1>
            <p className="text-muted mb-0">{fullAddress}</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link
              href="/properties"
              className="btn pm-dashboard-pill-button"
              style={{
                background: "#ffffff",
                border: "1px solid #e8e2da",
                color: "#1f2933",
              }}
            >
              <i className="bi bi-arrow-left me-2" aria-hidden="true" />
              Properties
            </Link>
            {isPropertyManager ? (
              <>
                <Link
                  href={`/properties/new?propertyId=${property.property_id}`}
                  className="btn pm-dashboard-pill-button"
                  style={{
                    background: "#f97316",
                    border: "1px solid #f97316",
                    color: "#ffffff",
                  }}
                >
                  <i className="bi bi-pencil-square me-2" aria-hidden="true" />
                  Edit
                </Link>
                <Link
                  href={`/properties/${property.property_id}/tenancies/new`}
                  className="btn pm-dashboard-pill-button"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e8e2da",
                    color: "#1f2933",
                  }}
                >
                  <i className="bi bi-person-plus me-2" aria-hidden="true" />
                  Add Tenancy
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <MetricCard
          icon="bi-door-open"
          label="Units"
          value={String(stats.total_units)}
          detail={`${stats.occupied_units} occupied, ${stats.vacant_units} vacant`}
        />
        <MetricCard
          icon="bi-tools"
          label="Open maintenance"
          value={String(stats.open_requests)}
          detail={`${stats.urgent_requests} urgent`}
        />
        <MetricCard
          icon="bi-check2-square"
          label="Awaiting approval"
          value={String(stats.awaiting_landlord_approval)}
          detail="Landlord sign-off items"
        />
        <MetricCard
          icon="bi-folder2-open"
          label="Attached documents"
          value={String(stats.attached_documents)}
          detail="Files attached to requests"
        />
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <DashboardCard title="Details" icon="bi-house-door">
            <InfoRow label="Property type" value={property.property_type ?? "Not set"} />
            <InfoRow label="Listed units" value={String(property.num_units)} />
            <InfoRow label="Database units" value={String(stats.total_units)} />
            <InfoRow label="Active tenancies" value={String(stats.active_tenancies)} />
          </DashboardCard>
        </div>

        {isPropertyManager ? (
          <div className="col-12 col-xl-4">
            <DashboardCard title="Landlord Contact Details" icon="bi-person-lines-fill">
              <InfoRow
                label="Name"
                value={personName(
                  landlord?.first_name,
                  landlord?.last_name,
                  "No landlord linked"
                )}
              />
              <InfoRow label="Email" value={landlord?.email ?? "Not set"} />
              <InfoRow label="Phone" value={landlord?.phone ?? "Not set"} />
            </DashboardCard>
          </div>
        ) : null}

        <div className="col-12 col-xl-4">
          <DashboardCard title="Work Snapshot" icon="bi-clipboard2-data">
            <InfoRow label="Work orders" value={String(stats.work_orders)} />
            <InfoRow
              label="Estimated value"
              value={formatMoney(stats.estimated_work_value)}
            />
            <InfoRow
              label="Completed requests"
              value={String(stats.completed_requests)}
            />
          </DashboardCard>
        </div>

        <div className="col-12 col-xl-5">
          <DashboardCard title="Units and Tenancies" icon="bi-building">
            {isPropertyManager ? (
              <div className="mb-3">
                <Link
                  href={`/properties/${property.property_id}/tenancies/new`}
                  className="btn btn-sm pm-dashboard-pill-button"
                  style={{
                    background: "#fff1e7",
                    border: "1px solid #f3c6a7",
                    color: "#f97316",
                  }}
                >
                  <i className="bi bi-plus-lg me-2" aria-hidden="true" />
                  Add Tenancy
                </Link>
              </div>
            ) : null}
            {units.length === 0 ? (
              <p className="text-muted mb-0">No units recorded for this property.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {units.map((unit) => (
                  <div
                    key={unit.unit_id}
                    className="p-3"
                    style={{
                      background: "#fffdf9",
                      border: "1px solid #e8e2da",
                      borderRadius: "12px",
                    }}
                  >
                    <div className="d-flex justify-content-between gap-3">
                      <div>
                        <div className="fw-bold">
                          {unit.unit_number ? `Unit ${unit.unit_number}` : "Primary dwelling"}
                        </div>
                        <div className="small text-muted text-capitalize">
                          {unit.status}
                          {unit.bedrooms ? ` · ${unit.bedrooms} bed` : ""}
                          {unit.bathrooms ? ` · ${unit.bathrooms} bath` : ""}
                        </div>
                      </div>
                      <span className="badge text-bg-light align-self-start">
                        #{unit.unit_id}
                      </span>
                    </div>
                    {!isLandlord ? (
                      <>
                        <div className="small mt-2">
                          {personName(
                            unit.tenant_first_name,
                            unit.tenant_last_name,
                            "No active tenant"
                          )}
                        </div>
                        {unit.tenant_email ? (
                          <div className="small text-muted">{unit.tenant_email}</div>
                        ) : null}
                      </>
                    ) : null}
                    {unit.lease_start || !isLandlord ? (
                      <div className={`small text-muted ${isLandlord ? "mt-2" : "mt-1"}`}>
                        Lease: {formatDate(unit.lease_start)} to {formatDate(unit.lease_end)}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="col-12 col-xl-7">
          <DashboardCard title="Recent Maintenance" icon="bi-clock-history">
            {maintenance.length === 0 ? (
              <p className="text-muted mb-0">No maintenance requests recorded yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Attachments</th>
                      <th className="text-end">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.map((request) => (
                      <tr key={request.request_id}>
                        <td>
                          <Link
                            href={`/maintenance/${request.request_id}`}
                            className="fw-semibold pm-dashboard-link"
                          >
                            {request.title}
                          </Link>
                          <div className="small text-muted">
                            {request.unit_number
                              ? `Unit ${request.unit_number}`
                              : "Primary dwelling"}
                            {" · "}
                            {personName(
                              request.reporter_first_name,
                              request.reporter_last_name,
                              isLandlord ? "Tenant details hidden" : "Reporter unknown"
                            )}
                          </div>
                        </td>
                        <td className="text-capitalize">{statusLabel(request.status)}</td>
                        <td className="text-capitalize">{request.priority}</td>
                        <td>{request.image_count}</td>
                        <td className="text-end">{formatDate(request.submitted_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div className="pm-dashboard-card h-100 p-4">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div>
            <div className="text-muted small fw-semibold">{label}</div>
            <div className="h3 fw-bold mb-1">{value}</div>
            <div className="small text-muted">{detail}</div>
          </div>
          <span
            className="d-inline-flex align-items-center justify-content-center"
            style={{
              background: "#fff1e7",
              border: "1px solid #f3c6a7",
              borderRadius: "999px",
              color: "#f97316",
              height: "46px",
              width: "46px",
            }}
          >
            <i className={`bi ${icon}`} aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pm-dashboard-card h-100 p-4">
      <h2 className="h5 fw-bold mb-3">
        <i className={`bi ${icon} me-2`} style={{ color: "#f97316" }} aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="d-flex justify-content-between gap-3 py-2"
      style={{ borderBottom: "1px solid #f0ebe5" }}
    >
      <span className="text-muted">{label}</span>
      <span className="fw-semibold text-end">{value}</span>
    </div>
  );
}
