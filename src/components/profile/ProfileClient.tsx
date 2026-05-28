"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";
import type { UserProfile } from "@/lib/queries/users";
import EmptyState from "@/components/shared/EmptyState";

const roleLabel: Record<string, string> = {
  tenant: "Tenant",
  landlord: "Landlord",
  property_manager: "Property Manager",
};

function displayName(profile: UserProfile) {
  return (
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.email
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function ProfileClient() {
  const { currentUser, setCurrentUser } = useCurrentUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canViewProfile =
    currentUser.id !== null && hasPermission(currentUser.role, "profile", "view");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!canViewProfile || currentUser.id === null || currentUser.role === "null") {
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
        const response = await fetch(`/api/profile?${params}`);
        const data = (await response.json()) as {
          error?: string;
          profile?: UserProfile;
        };

        if (!response.ok || !data.profile) {
          throw new Error(data.error ?? "Failed to load profile.");
        }

        if (isMounted) {
          setProfile(data.profile);
          setFirstName(data.profile.first_name ?? "");
          setLastName(data.profile.last_name ?? "");
          setEmail(data.profile.email);
          setPhone(data.profile.phone ?? "");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load profile."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [canViewProfile, currentUser.id, currentUser.role]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentUser.id === null || currentUser.role === "null") {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          role: currentUser.role,
          firstName,
          lastName,
          email,
          phone,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        profile?: UserProfile;
      };

      if (!response.ok || !data.profile) {
        throw new Error(data.error ?? "Failed to update profile.");
      }

      setProfile(data.profile);
      setCurrentUser({
        id: data.profile.user_id,
        role: data.profile.role,
        name: displayName(data.profile),
        email: data.profile.email,
      });
      setSuccessMessage("Profile updated.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to update profile."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!canViewProfile) {
    return (
      <EmptyState
        title="Access denied"
        message="You do not have permission to view this profile."
      />
    );
  }

  if (isLoading) {
    return (
      <section className="pm-dashboard-page mx-auto px-2 px-lg-3 py-3">
        <div className="pm-dashboard-card p-4">
          <p className="text-muted mb-0">Loading profile...</p>
        </div>
      </section>
    );
  }

  if (error && !profile) {
    return (
      <section className="pm-dashboard-page mx-auto px-2 px-lg-3 py-3">
        <div className="alert alert-danger mb-0">{error}</div>
      </section>
    );
  }

  return (
    <section className="pm-dashboard-page mx-auto px-2 px-lg-3 py-3">
      <div className="pm-maintenance-new-header mb-4">
        <h1 className="h3 mb-2">Profile</h1>
        <p className="text-muted mb-0">
          View and update your own contact details.
        </p>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {successMessage ? (
        <div className="alert alert-success">{successMessage}</div>
      ) : null}

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <form className="pm-maintenance-request-form p-4" onSubmit={handleSubmit}>
            <h2 className="h5 fw-bold mb-3">Contact Details</h2>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="firstName" className="form-label">
                  First name
                </label>
                <input
                  id="firstName"
                  className="form-control"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="lastName" className="form-label">
                  Last name
                </label>
                <input
                  id="lastName"
                  className="form-control"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">
                  Phone
                </label>
                <input
                  id="phone"
                  className="form-control"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                type="submit"
                className="btn pm-dashboard-pill-button"
                disabled={isSaving}
                style={{
                  background: "#f97316",
                  border: "1px solid #f97316",
                  color: "#ffffff",
                }}
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        <div className="col-12 col-xl-5">
          <section className="pm-dashboard-card h-100 p-4">
            <h2 className="h5 fw-bold mb-3">Account</h2>
            {profile ? (
              <>
                <InfoRow label="Name" value={displayName(profile)} />
                <InfoRow label="Role" value={roleLabel[profile.role] ?? profile.role} />
                <InfoRow label="User ID" value={String(profile.user_id)} />
                <InfoRow label="Created" value={formatDate(profile.created_at)} />
              </>
            ) : null}
          </section>
        </div>
      </div>
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
