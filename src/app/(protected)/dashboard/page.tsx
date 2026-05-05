"use client";

import { useCurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";

import TenantDashboard from "@/components/dashboard/TenantDashboard";
import PropertyManagerDashboard from "@/components/dashboard/PropertyManagerDashboard";
import LandlordDashboard from "@/components/dashboard/LandlordDashboard";

export default function DashboardPage() {
  const { currentUser } = useCurrentUser();

  if (!hasPermission(currentUser.role, "dashboard", "view")) {
    return <p>You do not have permission to view this page.</p>;
  }

  if (currentUser.role === "tenant") {
    return <TenantDashboard />;
  }

  if (currentUser.role === "property_manager") {
    return <PropertyManagerDashboard />;
  }

  if (currentUser.role === "landlord") {
    return <LandlordDashboard />;
  }

  return <p>Unknown role.</p>;
}