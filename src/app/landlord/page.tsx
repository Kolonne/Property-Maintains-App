import { hasPermission } from "../../lib/permissions";
import { currentUser } from "../../lib/auth";

export default function LandlordPage() {
  if (!hasPermission(currentUser.role, "landlord_dashboard", "view")) {
    return <h1>Access Denied</h1>;
  }

  return (
    <div>
      <h1>Landlord Dashboard</h1>

      {hasPermission(currentUser.role, "approvals", "view") && (
        <p>View approval requests</p>
      )}

      {hasPermission(currentUser.role, "approvals", "update") && (
        <button>Approve Request</button>
      )}
    </div>
  );
}