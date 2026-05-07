"use client";

import { useState } from "react";

export default function PropertyManagerMaintenanceList() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const requests = [
  {
    id: 1,
    title: "Leaking Kitchen Sink",
    tenant: "John Smith",
    unit: "A-102",
    status: "Open",
    priority: "High",
  },
  {
    id: 2,
    title: "Air Conditioner Issue",
    tenant: "Emma Watson",
    unit: "B-204",
    status: "In Progress",
    priority: "Medium",
  },
];

  const filteredRequests = requests.filter((request) => {
    const matchesFilter =
      activeFilter === "All" || request.status === activeFilter;

    const matchesSearch = request.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container py-4">
      {/* Heading */}
      <div className="mb-4">
        <h2 className="fw-normal text-dark">All Maintenance Requests</h2>

        <p className="text-secondary mb-0">
          view and manage all requests.
        </p>        
      </div>

      {/* Filters */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {["All", "Open", "In Progress", "Completed"].map((filter) => (
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
                <option>All Properties</option>
                <option>Sunset Apartments</option>
                <option>City Heights</option>
                <option>Green Villas</option>
            </select>
        </div>

        {/* Search */}
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
            placeholder="Search ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
        </div>
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
                        request.status === "Completed"
                            ? "#198754"
                            : request.status === "In Progress"
                            ? "#fd7e14"
                            : "#0d6efd",
                    }}
                    >
                    {request.status}
                    </span>
                </td>

                <td className="text-secondary">
                    {request.priority}
                </td>

                <td>
                    <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn btn-sm text-white"
                        style={{
                        backgroundColor: "orangered",
                        }}
                    >
                        Assign
                    </button>

                    <button className="btn btn-sm btn-light border">
                        <i className="bi bi-three-dots-vertical"></i>
                    </button>
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