import { hasPermission } from "../../lib/permissions";
import { currentUser } from "../../lib/auth";

export default function PMPage() {
  if (!hasPermission(currentUser.role, "pm_dashboard", "view")) {
    return <h1>Access Denied</h1>;
  }

  return (
    <div>
      <h1>Property Manager Dashboard</h1>

      {hasPermission(currentUser.role, "allRequests", "view") && (
        <p>View all maintenance requests</p>
      )}

      {hasPermission(currentUser.role, "allRequests", "delete") && (
        <button>Delete Request</button>
      )}
    </div>
  );
}