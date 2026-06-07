"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";
import type {
  LandlordOption,
  PropertyOverview,
} from "@/lib/queries/properties";
import type { PropertyType } from "@/lib/types";
import EmptyState from "@/components/shared/EmptyState";

type PropertyFormState = {
  propertyId: number | null;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  propertyType: PropertyType;
  numUnits: string;
};

type LandlordFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

const emptyPropertyForm: PropertyFormState = {
  propertyId: null,
  address: "",
  suburb: "",
  state: "QLD",
  postcode: "",
  propertyType: "house",
  numUnits: "1",
};

const emptyLandlordForm: LandlordFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
};

function propertyToForm(property: PropertyOverview): PropertyFormState {
  return {
    propertyId: property.property_id,
    address: property.address,
    suburb: property.suburb ?? "",
    state: property.state ?? "",
    postcode: property.postcode ?? "",
    propertyType: property.property_type ?? "house",
    numUnits: String(property.num_units),
  };
}

function landlordLabel(landlord: LandlordOption) {
  const name =
    [landlord.first_name, landlord.last_name].filter(Boolean).join(" ") ||
    "Unnamed landlord";

  return `${name} (${landlord.email})`;
}

function ownerName(property: PropertyOverview) {
  if (!property.owner_email) {
    return "No landlord linked";
  }

  return (
    [property.owner_first_name, property.owner_last_name]
      .filter(Boolean)
      .join(" ") || property.owner_email
  );
}

type PropertyOnboardingClientProps = {
  mode?: "list" | "form";
};

export default function PropertyOnboardingClient({
  mode = "form",
}: PropertyOnboardingClientProps) {
  const { currentUser } = useCurrentUser();
  const [properties, setProperties] = useState<PropertyOverview[]>([]);
  const [landlords, setLandlords] = useState<LandlordOption[]>([]);
  const [propertyForm, setPropertyForm] =
    useState<PropertyFormState>(emptyPropertyForm);
  const [landlordForm, setLandlordForm] =
    useState<LandlordFormState>(emptyLandlordForm);
  const [selectedLandlordId, setSelectedLandlordId] = useState("");
  const [landlordSearch, setLandlordSearch] = useState("");
  const [showNewLandlordFields, setShowNewLandlordFields] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProperty, setIsSavingProperty] = useState(false);
  const [isSavingLandlord, setIsSavingLandlord] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canManageProperties =
    currentUser.id !== null &&
    currentUser.role === "property_manager" &&
    hasPermission(currentUser.role, "properties", "create") &&
    hasPermission(currentUser.role, "users", "create");
  const canViewProperties =
    currentUser.id !== null && hasPermission(currentUser.role, "properties", "view");

  const selectedProperty = useMemo(
    () =>
      propertyForm.propertyId
        ? properties.find(
            (property) => property.property_id === propertyForm.propertyId
          ) ?? null
        : null,
    [properties, propertyForm.propertyId]
  );

  const filteredLandlords = useMemo(() => {
    const query = landlordSearch.trim().toLowerCase();

    if (!query) {
      return landlords;
    }

    return landlords.filter((landlord) =>
      [
        landlord.first_name,
        landlord.last_name,
        landlord.email,
        landlord.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [landlordSearch, landlords]);

  useEffect(() => {
    let isMounted = true;

    async function loadProperties() {
      const canLoad =
        mode === "list" ? canViewProperties : canManageProperties;

      if (!canLoad || currentUser.id === null) {
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
        const response = await fetch(`/api/properties?${params}`);
        const data = (await response.json()) as {
          error?: string;
          properties?: PropertyOverview[];
          landlords?: LandlordOption[];
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load property records.");
        }

        if (isMounted) {
          const loadedProperties = data.properties ?? [];
          setProperties(loadedProperties);
          setLandlords(data.landlords ?? []);

          if (mode === "form") {
            const propertyId = Number(
              new URLSearchParams(window.location.search).get("propertyId")
            );
            const property = loadedProperties.find(
              (item) => item.property_id === propertyId
            );

            if (property) {
              setPropertyForm(propertyToForm(property));
              setSelectedLandlordId(
                property.owner_id ? String(property.owner_id) : ""
              );
              setLandlordSearch(property.owner_email ?? "");
              setShowNewLandlordFields(false);
            }
          }
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load property records."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, [canManageProperties, canViewProperties, currentUser.id, currentUser.role, mode]);

  function handlePropertyField(
    field: keyof PropertyFormState,
    value: string
  ) {
    setPropertyForm((current) => ({ ...current, [field]: value }));
  }

  function handleLandlordField(field: keyof LandlordFormState, value: string) {
    setLandlordForm((current) => ({ ...current, [field]: value }));
  }

  function findLandlordByEmail(email: string) {
    return landlords.find(
      (landlord) => landlord.email.toLowerCase() === email.trim().toLowerCase()
    );
  }

  function handleLandlordEmailChange(value: string) {
    setLandlordSearch(value);
    setSuccessMessage(null);
    setError(null);

    const existingLandlord = findLandlordByEmail(value);

    if (existingLandlord) {
      setSelectedLandlordId(String(existingLandlord.user_id));
      setShowNewLandlordFields(false);
      setLandlordForm(emptyLandlordForm);
      return;
    }

    setSelectedLandlordId("");
    setShowNewLandlordFields(false);
  }

  function handleLandlordEmailBlur() {
    const email = landlordSearch.trim();

    if (!email) {
      setSelectedLandlordId("");
      setShowNewLandlordFields(false);
      return;
    }

    const existingLandlord = findLandlordByEmail(email);

    if (existingLandlord) {
      setSelectedLandlordId(String(existingLandlord.user_id));
      setShowNewLandlordFields(false);
      setLandlordForm(emptyLandlordForm);
      return;
    }

    setSelectedLandlordId("");
    setShowNewLandlordFields(true);
    setLandlordForm((current) => ({ ...current, email }));
  }

  function editProperty(property: PropertyOverview) {
    setPropertyForm(propertyToForm(property));
    setSelectedLandlordId(property.owner_id ? String(property.owner_id) : "");
    setLandlordSearch(property.owner_email ?? "");
    setShowNewLandlordFields(false);
    setLandlordForm(emptyLandlordForm);
    setSuccessMessage(null);
    setError(null);
  }

  async function saveProperty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser.id) {
      return;
    }

    setIsSavingProperty(true);
    setError(null);
    setSuccessMessage(null);

    const isUpdate = propertyForm.propertyId !== null;
    const endpoint = isUpdate
      ? `/api/properties/${propertyForm.propertyId}`
      : "/api/properties";

    try {
      const response = await fetch(endpoint, {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          role: currentUser.role,
          address: propertyForm.address,
          suburb: propertyForm.suburb,
          state: propertyForm.state,
          postcode: propertyForm.postcode,
          propertyType: propertyForm.propertyType,
          numUnits: Number(propertyForm.numUnits),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        property?: PropertyOverview;
      };

      if (!response.ok || !data.property) {
        throw new Error(data.error ?? "Failed to save property.");
      }

      setProperties((current) => {
        const withoutSaved = current.filter(
          (property) => property.property_id !== data.property?.property_id
        );
        return [data.property as PropertyOverview, ...withoutSaved];
      });
      editProperty(data.property);
      setSuccessMessage("Property saved. You can now link or create the landlord.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save property."
      );
    } finally {
      setIsSavingProperty(false);
    }
  }

  async function linkExistingLandlord() {
    if (!currentUser.id || !propertyForm.propertyId) {
      return;
    }

    setIsSavingLandlord(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/properties/${propertyForm.propertyId}/landlord`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            role: currentUser.role,
            mode: "existing",
            landlordId: Number(selectedLandlordId),
          }),
        }
      );
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        property?: PropertyOverview;
        landlords?: LandlordOption[];
      };

      if (!response.ok || !data.property) {
        throw new Error(data.error ?? "Failed to link landlord.");
      }

      setProperties((current) =>
        current.map((property) =>
          property.property_id === data.property?.property_id
            ? (data.property as PropertyOverview)
            : property
        )
      );
      setLandlords(data.landlords ?? landlords);
      editProperty(data.property);
      setSuccessMessage(data.message ?? "Landlord linked to property.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to link landlord."
      );
    } finally {
      setIsSavingLandlord(false);
    }
  }

  async function createLandlord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser.id || !propertyForm.propertyId) {
      return;
    }

    setIsSavingLandlord(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (selectedLandlordId) {
        await linkExistingLandlord();
        return;
      }

      if (!showNewLandlordFields) {
        handleLandlordEmailBlur();
        setIsSavingLandlord(false);
        return;
      }

      const response = await fetch(
        `/api/properties/${propertyForm.propertyId}/landlord`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            role: currentUser.role,
            mode: "new",
            firstName: landlordForm.firstName,
            lastName: landlordForm.lastName,
            email: landlordSearch,
            phone: landlordForm.phone,
            password: landlordForm.password,
          }),
        }
      );
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        property?: PropertyOverview;
        landlord?: LandlordOption;
        landlords?: LandlordOption[];
      };

      if (!response.ok || !data.property) {
        throw new Error(data.error ?? "Failed to create landlord.");
      }

      setProperties((current) =>
        current.map((property) =>
          property.property_id === data.property?.property_id
            ? (data.property as PropertyOverview)
            : property
        )
      );
      setLandlords(data.landlords ?? landlords);
      editProperty(data.property);
      setLandlordForm(emptyLandlordForm);
      setShowNewLandlordFields(false);
      setSuccessMessage(
        data.message ?? "Landlord account created and linked to property."
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create landlord."
      );
    } finally {
      setIsSavingLandlord(false);
    }
  }

  if (mode === "list" && !canViewProperties) {
    return (
      <EmptyState
        title="Access denied"
        message="You do not have permission to view properties."
      />
    );
  }

  if (mode !== "list" && !canManageProperties) {
    return (
      <EmptyState
        title="Access denied"
        message="Only Property Managers can create property records and landlord accounts."
      />
    );
  }

  if (mode === "list") {
    return (
      <section className="pm-dashboard-page pm-properties-page mx-auto px-2 px-lg-3 py-3">
        <div className="pm-maintenance-new-header mb-4">
          <div className="pm-property-page-heading">
            <div>
              <h1 className="h3 mb-2">Properties</h1>
              <p className="text-muted mb-0">
                {currentUser.role === "landlord"
                  ? "Properties linked to your landlord account."
                  : "Managed property records and their linked landlords."}
              </p>
            </div>
            {currentUser.role === "property_manager" ? (
              <Link
                href="/properties/new"
                className="btn pm-dashboard-pill-button pm-property-heading-action"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e8e2da",
                  color: "#1f2933",
                }}
              >
                <i className="bi bi-plus-lg me-2" aria-hidden="true" />
                New Property
              </Link>
            ) : null}
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <div className="pm-dashboard-card p-4">
          <h2 className="h5 fw-bold mb-3">
            {currentUser.role === "landlord" ? "Linked Properties" : "Managed Properties"}
          </h2>
          {isLoading ? (
            <p className="text-muted mb-0">Loading properties...</p>
          ) : properties.length === 0 ? (
            <p className="text-muted mb-0">No property records yet.</p>
          ) : (
            <>
            <div className="table-responsive pm-property-list-table">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Units</th>
                    <th>Landlord</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.property_id}>
                      <td>
                        <div className="fw-semibold">{property.address}</div>
                        <div className="small text-muted">
                          {[property.suburb, property.state, property.postcode]
                            .filter(Boolean)
                            .join(" ")}
                        </div>
                      </td>
                      <td className="text-capitalize">
                        {property.property_type ?? "Unknown"}
                      </td>
                      <td>{property.num_units}</td>
                      <td>
                        <div className="fw-semibold">{ownerName(property)}</div>
                        {property.owner_email ? (
                          <div className="small text-muted">
                            {property.owner_email}
                          </div>
                        ) : null}
                      </td>
                      <td className="text-end">
                        <Link
                          href={`/properties/${property.property_id}`}
                          className="btn btn-sm pm-dashboard-pill-button"
                          style={{
                            background: "#ffffff",
                            border: "1px solid #e8e2da",
                            color: "#1f2933",
                          }}
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-property-mobile-list">
              {properties.map((property) => (
                <article className="pm-property-mobile-card" key={property.property_id}>
                  <div className="pm-property-mobile-card-heading">
                    <div>
                      <h3>{property.address}</h3>
                      <p>
                        {[property.suburb, property.state, property.postcode]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    </div>
                    <span className="pm-property-mobile-type">
                      {property.property_type ?? "Unknown"}
                    </span>
                  </div>
                  <dl className="pm-property-mobile-meta">
                    <div>
                      <dt>Units</dt>
                      <dd>{property.num_units}</dd>
                    </div>
                    <div>
                      <dt>Landlord</dt>
                      <dd>
                        {ownerName(property)}
                        {property.owner_email ? (
                          <span>{property.owner_email}</span>
                        ) : null}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href={`/properties/${property.property_id}`}
                    className="btn btn-sm pm-dashboard-pill-button pm-property-mobile-action"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e8e2da",
                      color: "#1f2933",
                    }}
                  >
                    Details
                  </Link>
                </article>
              ))}
            </div>
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="pm-dashboard-page mx-auto px-2 px-lg-3 py-3">
      <div className="pm-maintenance-new-header mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="h3 mb-2">Property Onboarding</h1>
            <p className="text-muted mb-0">
              Create or update a property, then link the landlord account.
            </p>
          </div>
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
            Managed Properties
          </Link>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {successMessage ? (
        <div className="alert alert-success">{successMessage}</div>
      ) : null}

      <div className="row g-4">
        <div className="col-12 col-xl-5">
          <form
            className="pm-maintenance-request-form p-4"
            onSubmit={saveProperty}
          >
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <h2 className="h5 fw-bold mb-0">
                {propertyForm.propertyId ? "Update Property" : "Create Property"}
              </h2>
              {propertyForm.propertyId ? (
                <span className="badge text-bg-light">
                  #{propertyForm.propertyId}
                </span>
              ) : null}
            </div>

            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  id="address"
                  className="form-control"
                  value={propertyForm.address}
                  onChange={(event) =>
                    handlePropertyField("address", event.target.value)
                  }
                  required
                  disabled={isSavingProperty}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="suburb" className="form-label">
                  Suburb
                </label>
                <input
                  id="suburb"
                  className="form-control"
                  value={propertyForm.suburb}
                  onChange={(event) =>
                    handlePropertyField("suburb", event.target.value)
                  }
                  disabled={isSavingProperty}
                />
              </div>

              <div className="col-md-3">
                <label htmlFor="state" className="form-label">
                  State
                </label>
                <input
                  id="state"
                  className="form-control"
                  value={propertyForm.state}
                  onChange={(event) =>
                    handlePropertyField("state", event.target.value)
                  }
                  maxLength={10}
                  disabled={isSavingProperty}
                />
              </div>

              <div className="col-md-3">
                <label htmlFor="postcode" className="form-label">
                  Postcode
                </label>
                <input
                  id="postcode"
                  className="form-control"
                  value={propertyForm.postcode}
                  onChange={(event) =>
                    handlePropertyField("postcode", event.target.value)
                  }
                  maxLength={10}
                  disabled={isSavingProperty}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="propertyType" className="form-label">
                  Property type
                </label>
                <select
                  id="propertyType"
                  className="form-select"
                  value={propertyForm.propertyType}
                  onChange={(event) =>
                    handlePropertyField("propertyType", event.target.value)
                  }
                  disabled={isSavingProperty}
                  required
                >
                  <option value="house">House</option>
                  <option value="unit">Unit</option>
                </select>
              </div>

              <div className="col-md-6">
                <label htmlFor="numUnits" className="form-label">
                  Number of units
                </label>
                <input
                  id="numUnits"
                  className="form-control"
                  type="number"
                  min={1}
                  max={200}
                  value={propertyForm.numUnits}
                  onChange={(event) =>
                    handlePropertyField("numUnits", event.target.value)
                  }
                  disabled={isSavingProperty}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                type="submit"
                className="btn pm-dashboard-pill-button"
                disabled={isSavingProperty}
                style={{
                  background: "#f97316",
                  border: "1px solid #f97316",
                  color: "#ffffff",
                }}
              >
                {isSavingProperty ? "Saving..." : "Save Property"}
              </button>
            </div>
          </form>
        </div>

        <div className="col-12 col-xl-7">
          <div className="pm-maintenance-request-form p-4 h-100">
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
              <div>
                <h2 className="h5 fw-bold mb-1">Landlord Link</h2>
                <p className="text-muted mb-0">
                  {selectedProperty
                    ? `${selectedProperty.address} is ready for landlord linking.`
                    : "Save or select a property before linking a landlord."}
                </p>
              </div>
              {selectedProperty ? (
                <span className="badge text-bg-light">
                  {ownerName(selectedProperty)}
                </span>
              ) : null}
            </div>

            {!selectedProperty ? (
              <div className="alert alert-light mb-0">
                Property details must be saved before a landlord account can be
                linked.
              </div>
            ) : (
              <form onSubmit={createLandlord}>
                <label htmlFor="landlordEmailSearch" className="form-label">
                  Landlord email
                </label>
                <input
                  id="landlordEmailSearch"
                  className="form-control"
                  type="email"
                  list="landlordEmailOptions"
                  value={landlordSearch}
                  onChange={(event) =>
                    handleLandlordEmailChange(event.target.value)
                  }
                  onBlur={handleLandlordEmailBlur}
                  disabled={isSavingLandlord}
                  required
                />
                <datalist id="landlordEmailOptions">
                  {filteredLandlords.map((landlord) => (
                    <option key={landlord.user_id} value={landlord.email}>
                      {landlordLabel(landlord)}
                    </option>
                  ))}
                </datalist>

                {selectedLandlordId ? (
                  <div className="alert alert-light mt-3 mb-0">
                    Existing landlord selected. Submit to link this landlord to
                    the property.
                  </div>
                ) : null}

                {showNewLandlordFields ? (
                  <div className="mt-4">
                    <h3 className="h6 fw-bold mb-3">New landlord details</h3>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="firstName" className="form-label">
                          First name
                        </label>
                        <input
                          id="firstName"
                          className="form-control"
                          value={landlordForm.firstName}
                          onChange={(event) =>
                            handleLandlordField("firstName", event.target.value)
                          }
                          disabled={isSavingLandlord}
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="lastName" className="form-label">
                          Last name
                        </label>
                        <input
                          id="lastName"
                          className="form-control"
                          value={landlordForm.lastName}
                          onChange={(event) =>
                            handleLandlordField("lastName", event.target.value)
                          }
                          disabled={isSavingLandlord}
                        />
                      </div>

                      <div className="col-12">
                        <label htmlFor="phone" className="form-label">
                          Phone
                        </label>
                        <input
                          id="phone"
                          className="form-control"
                          value={landlordForm.phone}
                          onChange={(event) =>
                            handleLandlordField("phone", event.target.value)
                          }
                          disabled={isSavingLandlord}
                        />
                      </div>

                      <div className="col-12">
                        <label htmlFor="password" className="form-label">
                          Password
                        </label>
                        <input
                          id="password"
                          className="form-control"
                          type="password"
                          minLength={6}
                          value={landlordForm.password}
                          onChange={(event) =>
                            handleLandlordField("password", event.target.value)
                          }
                          disabled={isSavingLandlord}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="btn pm-dashboard-pill-button mt-3"
                  disabled={
                    isSavingLandlord ||
                    !landlordSearch.trim() ||
                    (!selectedLandlordId && !showNewLandlordFields)
                  }
                  style={{
                    background: "#f97316",
                    border: "1px solid #f97316",
                    color: "#ffffff",
                  }}
                >
                  <i
                    className={`bi ${
                      selectedLandlordId ? "bi-link-45deg" : "bi-person-plus"
                    } me-2`}
                    aria-hidden="true"
                  />
                  {isSavingLandlord
                    ? "Saving..."
                    : selectedLandlordId
                      ? "Link Landlord"
                      : "Create and Link"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
