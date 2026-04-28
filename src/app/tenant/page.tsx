import { hasPermission } from "../../lib/permissions";
import { currentUser } from "../../lib/auth";

export default function TenantPage() {
  if (!hasPermission(currentUser.role, "tenant_dashboard", "view")) {
    return <h1>Access Denied</h1>;
  }

  return (
    <div>
      <h1>Tenant Dashboard</h1>

      {hasPermission(currentUser.role, "maintenance", "create") && (
        <button>Create Maintenance Request</button>
      )}
    </div>
  );
}