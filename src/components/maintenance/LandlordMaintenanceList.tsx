"use client";

import { useState } from "react";

export default function LandlordMaintenanceList() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const requests = [
  {
    id: 1,
    title: "Leaking Kitchen Sink",
    property: "Sunset Apartments",
    cost: "$120",
    submitted: "2026-05-01",
    status: "PENDING",
  },
  {
    id: 2,
    title: "Air Conditioner Repair",
    property: "City Heights",
    cost: "$300",
    submitted: "2026-05-03",
    status: "APPROVED",
  },
  {
    id: 3,
    title: "Bathroom Door Replacement",
    property: "Green Villas",
    cost: "$180",
    submitted: "2026-05-05",
    status: "REJECTED",
  },
];

  const filteredRequests = requests.filter((request) => {
    const matchesFilter = activeFilter === "ALL" || request.status === activeFilter;

    const matchesSearch = request.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container py-4">
      {/* Heading */}
      <div className="mb-4">
        <h2 className="fw-normal text-dark">Requests for Your Approval</h2>

        <p className="text-secondary mb-0">
          Review and approve or reject maintenance requests.
        </p>        
      </div>

      {/* Filters */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((filter) => (
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
              placeholder="Search ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Add New Button */}
        <button
          className="btn text-white"
          style={{
            backgroundColor: "orangered",
            borderColor: "orangered",
            whiteSpace: "nowrap",
          }}
        >
          Add New
        </button>
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
                PROPERTY
                </th>

                <th
                style={{
                    backgroundColor: "#e8e8e8",
                    color: "black",
                    borderColor: "black"
                }}
                >
                COST
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
                STATUS
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

      <td className="text-secondary">{request.property}</td>

      <td className="text-secondary">{request.cost}</td>

      <td className="text-secondary">{request.submitted}</td>

      {/* STATUS COLUMN */}
     {/* STATUS COLUMN */}
    <td>
      <span
        className="badge"
        style={{
          backgroundColor:
            request.status === "APPROVED"
              ? "#e8f6f7"
              : request.status === "REJECTED"
              ? "#FDECEC"
              : "#FFF8E1",

          color:
            request.status === "APPROVED"
              ? "#2E8B57"
              : request.status === "REJECTED"
              ? "#C45757"
              : "#B78103",

          border:
            request.status === "APPROVED"
              ? "1px solid #2E8B57"
              : request.status === "REJECTED"
              ? "1px solid #C45757"
              : "1px solid #B78103",

          fontWeight: 600,
          padding: "7px 12px",
          fontSize: "12px",
          letterSpacing: "0.3px",          
        }}
      >
        {request.status}
      </span>
    </td>

      {/* ACTION COLUMN */}
      <td>
        {request.status === "PENDING" ? (
          <div className="d-flex gap-2">

  {/* Approve */}
  <button
    className="btn btn-sm d-flex align-items-center gap-2 px-3 py-2 text-white"
    style={{
      background: "linear-gradient(135deg, #28a745, #20c997)",
      border: "none",
      borderRadius: "50px",
      fontWeight: 600,
      boxShadow: "0 4px 12px rgba(40, 167, 69, 0.25)",
      transition: "all 0.25s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 8px 18px rgba(40, 167, 69, 0.35)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(40, 167, 69, 0.25)";
    }}
  >
    <i className="bi bi-check2-circle"></i>
    Approve
  </button>

  {/* Reject */}
  <button
    className="btn btn-sm d-flex align-items-center gap-2 px-3 py-2"
    style={{
      background: "#fff",
      color: "#dc3545",
      border: "2px solid #dc3545",
      borderRadius: "50px",
      fontWeight: 600,
      boxShadow: "0 3px 10px rgba(220, 53, 69, 0.15)",
      transition: "all 0.25s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#dc3545";
      e.currentTarget.style.color = "#fff";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#fff";
      e.currentTarget.style.color = "#dc3545";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <i className="bi bi-x-circle"></i>
    Reject
  </button>

</div>
        ) : null}
      </td>
    </tr>
  ))}
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