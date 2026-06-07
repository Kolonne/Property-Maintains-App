"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";
import type { RentFrequency, TenancyStatus } from "@/lib/types";
import type {
  TenancyUnitOption,
  TenantOption,
} from "@/lib/queries/tenancies";
import EmptyState from "@/components/shared/EmptyState";

type TenantOnboardingClientProps = {
  propertyId: number;
};

type TenantFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
};

const emptyTenantForm: TenantFormState = {
  firstName: "",
  lastName: "",
  phone: "",
  password: "",
};

function tenantLabel(tenant: TenantOption) {
  const name =
    [tenant.first_name, tenant.last_name].filter(Boolean).join(" ") ||
    "Unnamed tenant";

  return `${name} (${tenant.email})`;
}

function unitLabel(unit: TenancyUnitOption) {
  const unitName = unit.unit_number ? `Unit ${unit.unit_number}` : "Primary dwelling";
  const suburb = unit.suburb ? `, ${unit.suburb}` : "";

  return `${unit.address}${suburb} - ${unitName}`;
}

export default function TenantOnboardingClient({
  propertyId,
}: TenantOnboardingClientProps) {
  const { currentUser } = useCurrentUser();
  const [units, setUnits] = useState<TenancyUnitOption[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [unitId, setUnitId] = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [rentFrequency, setRentFrequency] = useState<RentFrequency | "">("weekly");
  const [tenancyStatus, setTenancyStatus] = useState<TenancyStatus>("active");
  const [tenantEmail, setTenantEmail] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [tenantForm, setTenantForm] = useState<TenantFormState>(emptyTenantForm);
  const [showNewTenantFields, setShowNewTenantFields] = useState(false);
  const [confirmMove, setConfirmMove] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canManageTenancies =
    currentUser.id !== null &&
    currentUser.role === "property_manager" &&
    hasPermission(currentUser.role, "properties", "update") &&
    hasPermission(currentUser.role, "users", "create");

  const filteredTenants = useMemo(() => {
    const query = tenantEmail.trim().toLowerCase();

    if (!query) {
      return tenants;
    }

    return tenants.filter((tenant) =>
      [
        tenant.first_name,
        tenant.last_name,
        tenant.email,
        tenant.phone,
        tenant.active_property_address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [tenantEmail, tenants]);

  const selectedTenant = selectedTenantId
    ? tenants.find((tenant) => tenant.user_id === Number(selectedTenantId)) ?? null
    : null;

  useEffect(() => {
    let isMounted = true;

    async function loadOptions() {
      if (!canManageTenancies || currentUser.id === null) {
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
          `/api/properties/${propertyId}/tenant-onboarding?${params}`
        );
        const data = (await response.json()) as {
          error?: string;
          units?: TenancyUnitOption[];
          tenants?: TenantOption[];
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load tenant onboarding.");
        }

        if (isMounted) {
          const loadedUnits = data.units ?? [];
          setUnits(loadedUnits);
          setTenants(data.tenants ?? []);
          setUnitId(loadedUnits[0] ? String(loadedUnits[0].unit_id) : "");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load tenant onboarding."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, [canManageTenancies, currentUser.id, currentUser.role, propertyId]);

  function findTenantByEmail(email: string) {
    return tenants.find(
      (tenant) => tenant.email.toLowerCase() === email.trim().toLowerCase()
    );
  }

  function handleTenantEmailChange(value: string) {
    setTenantEmail(value);
    setError(null);
    setSuccessMessage(null);
    setConfirmMove(false);

    const existingTenant = findTenantByEmail(value);

    if (existingTenant) {
      setSelectedTenantId(String(existingTenant.user_id));
      setShowNewTenantFields(false);
      setTenantForm(emptyTenantForm);
      return;
    }

    setSelectedTenantId("");
    setShowNewTenantFields(false);
  }

  function handleTenantEmailBlur() {
    const email = tenantEmail.trim();

    if (!email) {
      setSelectedTenantId("");
      setShowNewTenantFields(false);
      return;
    }

    const existingTenant = findTenantByEmail(email);

    if (existingTenant) {
      setSelectedTenantId(String(existingTenant.user_id));
      setShowNewTenantFields(false);
      setTenantForm(emptyTenantForm);
      return;
    }

    setSelectedTenantId("");
    setShowNewTenantFields(true);
  }

  function handleTenantField(field: keyof TenantFormState, value: string) {
    setTenantForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser.id) {
      return;
    }

    if (!selectedTenantId && !showNewTenantFields) {
      handleTenantEmailBlur();
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/properties/${propertyId}/tenant-onboarding`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            role: currentUser.role,
            mode: selectedTenantId ? "existing" : "new",
            unitId: Number(unitId),
            leaseStart,
            leaseEnd,
            rentAmount,
            rentFrequency,
            tenancyStatus,
            tenantId: selectedTenantId ? Number(selectedTenantId) : undefined,
            email: tenantEmail,
            firstName: tenantForm.firstName,
            lastName: tenantForm.lastName,
            phone: tenantForm.phone,
            password: tenantForm.password,
            confirmMove,
          }),
        }
      );
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        tenants?: TenantOption[];
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to onboard tenant.");
      }

      setTenants(data.tenants ?? tenants);
      setTenantForm(emptyTenantForm);
      setTenantEmail("");
      setSelectedTenantId("");
      setShowNewTenantFields(false);
      setConfirmMove(false);
      setSuccessMessage(
        data.message ?? "Tenant account linked to tenancy."
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to onboard tenant."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!canManageTenancies) {
    return (
      <EmptyState
        title="Access denied"
        message="Only Property Managers can create tenancy records and tenant accounts."
      />
    );
  }

  return (
    <section className="pm-dashboard-page mx-auto px-2 px-lg-3 py-3">
      <div className="pm-maintenance-new-header mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="h3 mb-2">Tenant Onboarding</h1>
            <p className="text-muted mb-0">
              Create the tenancy, then select or create the tenant account.
            </p>
          </div>
          <Link
            href={`/properties/${propertyId}`}
            className="btn pm-dashboard-pill-button"
            style={{
              background: "#ffffff",
              border: "1px solid #e8e2da",
              color: "#1f2933",
            }}
          >
            <i className="bi bi-arrow-left me-2" aria-hidden="true" />
            Property
          </Link>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {successMessage ? (
        <div className="alert alert-success">{successMessage}</div>
      ) : null}

      <form className="pm-maintenance-request-form p-4 p-lg-5" onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-12 col-xl-5">
            <h2 className="h5 fw-bold mb-3">Tenancy Details</h2>

            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="unitId" className="form-label">
                  Property / Unit
                </label>
                <select
                  id="unitId"
                  className="form-select"
                  value={unitId}
                  onChange={(event) => setUnitId(event.target.value)}
                  disabled={isLoading || isSubmitting}
                  required
                >
                  {isLoading ? <option value="">Loading units...</option> : null}
                  {!isLoading && units.length === 0 ? (
                    <option value="">No units available</option>
                  ) : null}
                  {units.map((unit) => (
                    <option key={unit.unit_id} value={unit.unit_id}>
                      {unitLabel(unit)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label htmlFor="leaseStart" className="form-label">
                  Lease start
                </label>
                <input
                  id="leaseStart"
                  className="form-control"
                  type="date"
                  value={leaseStart}
                  onChange={(event) => setLeaseStart(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="leaseEnd" className="form-label">
                  Lease end
                </label>
                <input
                  id="leaseEnd"
                  className="form-control"
                  type="date"
                  value={leaseEnd}
                  onChange={(event) => setLeaseEnd(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="rentAmount" className="form-label">
                  Rent amount
                </label>
                <input
                  id="rentAmount"
                  className="form-control"
                  type="number"
                  min={0}
                  step="0.01"
                  value={rentAmount}
                  onChange={(event) => setRentAmount(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="rentFrequency" className="form-label">
                  Rent frequency
                </label>
                <select
                  id="rentFrequency"
                  className="form-select"
                  value={rentFrequency}
                  onChange={(event) =>
                    setRentFrequency(event.target.value as RentFrequency | "")
                  }
                  disabled={isSubmitting}
                >
                  <option value="">Not set</option>
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="col-12">
                <label htmlFor="tenancyStatus" className="form-label">
                  Tenancy status
                </label>
                <select
                  id="tenancyStatus"
                  className="form-select"
                  value={tenancyStatus}
                  onChange={(event) =>
                    setTenancyStatus(event.target.value as TenancyStatus)
                  }
                  disabled={isSubmitting}
                  required
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-7">
            <h2 className="h5 fw-bold mb-3">Tenant Account</h2>

            <label htmlFor="tenantEmail" className="form-label">
              Tenant email
            </label>
            <input
              id="tenantEmail"
              className="form-control"
              type="email"
              list="tenantEmailOptions"
              value={tenantEmail}
              onChange={(event) => handleTenantEmailChange(event.target.value)}
              onBlur={handleTenantEmailBlur}
              disabled={isSubmitting}
              required
            />
            <datalist id="tenantEmailOptions">
              {filteredTenants.map((tenant) => (
                <option key={tenant.user_id} value={tenant.email}>
                  {tenantLabel(tenant)}
                </option>
              ))}
            </datalist>

            {selectedTenant ? (
              <div className="alert alert-light mt-3 mb-0">
                Existing tenant selected: {tenantLabel(selectedTenant)}.
              </div>
            ) : null}

            {selectedTenant?.active_tenancy_id ? (
              <div className="alert alert-warning mt-3">
                <div className="fw-semibold mb-2">
                  This tenant is already linked to an active tenancy.
                </div>
                <div className="small mb-3">
                  Current tenancy: {selectedTenant.active_property_address}
                  {selectedTenant.active_unit_number
                    ? `, Unit ${selectedTenant.active_unit_number}`
                    : ""}
                  . Confirm that you intend to remove them from that tenancy
                  and move them to this one.
                </div>
                <label className="form-check mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={confirmMove}
                    onChange={(event) => setConfirmMove(event.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span className="form-check-label">
                    Move tenant to this tenancy
                  </span>
                </label>
              </div>
            ) : null}

            {showNewTenantFields ? (
              <div className="mt-4">
                <h3 className="h6 fw-bold mb-3">New tenant details</h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">
                      First name
                    </label>
                    <input
                      id="firstName"
                      className="form-control"
                      value={tenantForm.firstName}
                      onChange={(event) =>
                        handleTenantField("firstName", event.target.value)
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      className="form-control"
                      value={tenantForm.lastName}
                      onChange={(event) =>
                        handleTenantField("lastName", event.target.value)
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label">
                      Phone
                    </label>
                    <input
                      id="phone"
                      className="form-control"
                      value={tenantForm.phone}
                      onChange={(event) =>
                        handleTenantField("phone", event.target.value)
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      id="password"
                      className="form-control"
                      type="password"
                      minLength={6}
                      value={tenantForm.password}
                      onChange={(event) =>
                        handleTenantField("password", event.target.value)
                      }
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Link
            href={`/properties/${propertyId}`}
            className="btn pm-maintenance-secondary-button"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="btn pm-dashboard-pill-button"
            disabled={
              isSubmitting ||
              units.length === 0 ||
              !tenantEmail.trim() ||
              (!selectedTenantId && !showNewTenantFields) ||
              (Boolean(selectedTenant?.active_tenancy_id) && !confirmMove)
            }
            style={{
              background: "#f97316",
              border: "1px solid #f97316",
              color: "#ffffff",
            }}
          >
            <i className="bi bi-person-plus me-2" aria-hidden="true" />
            {isSubmitting ? "Saving..." : "Create Tenancy and Link Tenant"}
          </button>
        </div>
      </form>
    </section>
  );
}
