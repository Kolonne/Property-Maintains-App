"use client";

import Link from "next/link";
import { useState } from "react";

export default function PropertyManagerMaintenanceList() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const requests = [
  {
    id: 1,
    title: "Leaking Kitchen Sink",
    tenant: "John Smith",
    unit: "A-102",
    status: "OPEN",
    priority: "HIGH PRIORITY",
  },
  {
    id: 2,
    title: "Air Conditioner Issue",
    tenant: "Emma Watson",
    unit: "B-204",
    status: "IN PROGRESS",
    priority: "MEDIUM PRIORITY",
  },
];

  const filteredRequests = requests.filter((request) => {
    const matchesFilter =
      activeFilter === "ALL" || request.status === activeFilter;

    const matchesSearch = request.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container py-4">
      {/* Heading */}
      <div className="mb-4">
        <h2 className="fw-normal text-dark">ALL Maintenance Requests</h2>

        <p className="text-secondary mb-0">
          view and manage ALL requests.
        </p>        
      </div>

      {/* Filters */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {["ALL", "OPEN", "IN PROGRESS", "COMPLETED"].map((filter) => (
            <button
              key={filter}
              className={`btn custom-filter-btn ${
                activeFilter === filter
                    ? "text-white"
                    : "btn-outline-secondary"
                }`}
              style={{
                backgroundColor:
                  activeFilter === filter ? "orangered" : "transparent",
                borderColor:
                  activeFilter === filter ? "orangered" : "#ced4da",
              }}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div style={{ minWidth: "200px" }}>
            <select className="form-select">
                <option>ALL Properties</option>
                <option>Sunset Apartments</option>
                <option>City Heights</option>
                <option>Green Villas</option>
            </select>
        </div>

        {/* Search */}
     <div className="d-flex align-items-center gap-2 flex-wrap">
        <div style={{ minWidth: "250px" }}>
          <div className="position-relative">
            <i
              className="bi bi-search position-absolute"
              style={{
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6c757d",
                fontSize: "14px",
              }}
            ></i>

            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Add New Button */}
        <Link
          href="/maintenance/new"
          className="btn text-white"
          style={{
            backgroundColor: "orangered",
            borderColor: "orangered",
            whiteSpace: "nowrap",
          }}
        >
          Add New
        </Link>
      </div>
      </div>

      {/* Table */}
      <div className="table-responsive shadow-sm rounded bg-white">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
                <th
                style={{
                    backgroundColor: "#e8e8e8",
                    color: "black",
                    borderColor: "black"
                }}
                >
                REQUEST
                </th>

                <th
                style={{
                    backgroundColor: "#e8e8e8",
                    color: "black",
                    borderColor: "black"
                }}
                >
                TENANT
                </th>

                <th
                style={{
                    backgroundColor: "#e8e8e8",
                    color: "black",
                    borderColor: "black"
                }}
                >
                UNIT
                </th>

                <th
                style={{
                    backgroundColor: "#e8e8e8",
                    color: "black",
                    borderColor: "black"
                }}
                >
                STATUS
                </th>

                <th
                style={{
                    backgroundColor: "#e8e8e8",
                    color: "black",
                    borderColor: "black"
                }}
                >
                PRIORITY
                </th>
                <th
                style={{
                    backgroundColor: "#e8e8e8",
                    color: "black",
                    borderColor: "black"
                }}
                >
                ACTION
                </th>
            </tr>
            </thead>

          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.title}</td>

                <td className="text-secondary">
                    {request.tenant}
                </td>

                <td className="text-secondary">
                    {request.unit}
                </td>

                <td>
                  <span
                    className="badge"
                    style={{
                      backgroundColor:
                        request.status === "COMPLETED"
                          ? "#E8F7EE"
                          : request.status === "IN PROGRESS"
                          ? "#FFF8E1"
                          : "#F3EEFF",

                      color:
                        request.status === "COMPLETED"
                          ? "#2E8B57"
                          : request.status === "IN PROGRESS"
                          ? "#B78103"
                          : "#7C4DCC",

                      border:
                        request.status === "COMPLETED"
                          ? "1px solid #2E8B57"
                          : request.status === "IN PROGRESS"
                          ? "1px solid #B78103"
                          : "1px solid #7C4DCC",

                      fontWeight: 600,
                      padding: "7px 12px",
                      
                      fontSize: "12px",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {request.status}
                  </span>
                </td>

                <td>
                  <span
                    style={{
                      color:
                        request.priority === "HIGH PRIORITY"
                          ? "#e8793d"
                          : "#939084",
                      fontWeight: 600,
                      fontSize: "13px",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {request.priority}
                  </span>
                </td>

                <td>
                    <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn btn-sm"
                         style={{
                        backgroundColor: "#ECEAE3",
                        color: "#36342E",
                        border: "1px solid #C5C0B1",
                        borderRadius: "8px",
                        fontWeight: 600,
                        padding: "6px 14px",
                      }}
                    >
                        Assign
                    </button>

                    <Link
                      href={`/maintenance/${request.id}`}
                      className="btn btn-sm btn-light border"
                      aria-label={`View details for ${request.title}`}
                      title="View details"
                    >
                        <i className="bi bi-three-dots-vertical"></i>
                    </Link>
                    </div>
                </td>
                </tr>
            ))}

            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-secondary">
                  No requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-3">
        <p className="text-secondary mb-0">
          Showing 1 to {filteredRequests.length} of{" "}
          {filteredRequests.length} requests
        </p>
      </div>
    </div>
  );
}
