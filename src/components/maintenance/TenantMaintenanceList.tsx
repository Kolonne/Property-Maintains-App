"use client";

import { useState } from "react";

export default function TenantMaintenanceList() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const requests = [
    {
      id: 1,
      title: "Leaking Kitchen Sink",
      status: "Open",
      priority: "High",
      date: "2026-05-01",
    },
    {
      id: 2,
      title: "Bedroom Light Not Working",
      status: "In Progress",
      priority: "Medium",
      date: "2026-05-03",
    },
    {
      id: 3,
      title: "Air Conditioner Issue",
      status: "Completed",
      priority: "Low",
      date: "2026-05-05",
    },
    {
      id: 4,
      title: "Broken Bathroom Door",
      status: "Open",
      priority: "High",
      date: "2026-05-06",
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
        <h2 className="fw-normal text-dark">My Maintenance Requests</h2>

        <p className="text-secondary mb-0">
          Track the status of your submitted requests
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
            placeholder="Search requests..."
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
                TITLE
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
                DATE SUBMITTED
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

                <td>
                  <span className="text-secondary">
                    {request.priority}
                  </span>
                </td>

                <td className="text-secondary">{request.date}</td>

                <td>
                  <button
                    className="btn btn-sm text-white"
                    style={{
                      backgroundColor: "orangered",
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-secondary">
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