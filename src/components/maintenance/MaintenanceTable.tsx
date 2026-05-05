import type { UserRole, MaintenanceRequest } from "@/lib/types";
import MaintenanceRowActions from "./MaintenanceRowActions";
import StatusBadge from "./StatusBadge";

type MaintenanceTableProps = {
    role: UserRole;
    requests: MaintenanceRequest[];
};

export default function MaintenanceTable({
    role,
    requests,
}: MaintenanceTableProps) {
    /*
      UI DEV NOTES:
  
      This component displays maintenance requests in a table.
  
      The request data uses the MaintenanceRequest type from src/lib/types.ts.
  
      Available fields:
      - request_id
      - unit_id
      - reported_by
      - title
      - description
      - category
      - priority
      - status
      - submitted_at
      - acknowledged_at
      - completed_at
      - closed_at
  
      Property address, tenant name, unit number, and cost are not directly
      available here yet. Those will come later from related database tables.
    */

    if (requests.length === 0) {
        return (
            <div className="border rounded p-4 text-center text-muted">
                No maintenance requests found.
            </div>
        );
    }

    if (role === "tenant") {
        return (
            <table className="table table-bordered align-middle">
                <thead className="table-light">
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Date Submitted</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {requests.map((request) => (
                        <tr key={request.request_id}>
                            <td>{request.title}</td>
                            <td>
                                <StatusBadge status={request.status} />
                            </td>
                            <td>{request.priority}</td>
                            <td>{request.submitted_at}</td>
                            <td>
                                <MaintenanceRowActions role={role} request={request} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    if (role === "property_manager") {
        return (
            <table className="table table-bordered align-middle">
                <thead className="table-light">
                    <tr>
                        <th>Request</th>
                        <th>Category</th>
                        <th>Unit ID</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {requests.map((request) => (
                        <tr key={request.request_id}>
                            <td>{request.title}</td>
                            <td>{request.category ?? "Uncategorised"}</td>
                            <td>{request.unit_id}</td>
                            <td>
                                <StatusBadge status={request.status} />
                            </td>
                            <td>{request.priority}</td>
                            <td>
                                <MaintenanceRowActions role={role} request={request} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    return (
        <table className="table table-bordered align-middle">
            <thead className="table-light">
                <tr>
                    <th>Request</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>
                {requests.map((request) => (
                    <tr key={request.request_id}>
                        <td>{request.title}</td>
                        <td>{request.category ?? "Uncategorised"}</td>
                        <td>
                            <StatusBadge status={request.status} />
                        </td>
                        <td>{request.submitted_at}</td>
                        <td>
                            <MaintenanceRowActions role={role} request={request} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}