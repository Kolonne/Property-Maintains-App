"use client";

import { useState } from "react";
import Link from "next/link";

export default function RequestDetailsPage() {
  const [isEditing, setIsEditing] = useState(false);

  const [data, setData] = useState({
    title: "Kitchen sink leak",
    description:
      "Water is leaking from the kitchen sink pipe underneath the cabinet causing water accumulation.",
    property: "Sunrise Apartments",
    room: "Unit 4B - Kitchen",
    category: "Plumbing",
    priority: "Urgent",
    status: "In Progress",
    date: "2026-05-10",
    submittedBy: "John Doe (Tenant)",
  });

  const handleChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    alert("Request updated successfully (mock save)");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <main
      style={{
        background: "#fffefb",
        minHeight: "100vh",
        color: "#201515",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          borderBottom: "1px solid #eceae3",
          padding: "18px 0",
        }}
      >
        <div className="container d-flex justify-content-between align-items-center">
          <h2 style={{ fontWeight: 800, margin: 0 }}>
            Maintenance Request Details
          </h2>

          <Link
            href="/"
            style={{
              color: "#ff4f00",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="container" style={{ padding: "40px 0" }}>
        <div className="row g-4">
          {/* LEFT MAIN CARD */}
          <div className="col-lg-8">
            <div
              style={{
                background: "#fff",
                border: "1px solid #eceae3",
                borderRadius: "26px",
                padding: "28px",
                boxShadow: "0 20px 60px rgba(32,21,21,0.06)",
              }}
            >
              {/* TITLE */}
              <div className="d-flex justify-content-between align-items-start">
                {isEditing ? (
                  <input
                    value={data.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    style={inputStyle}
                  />
                ) : (
                  <h3 style={{ fontWeight: 800 }}>{data.title}</h3>
                )}

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={editBtn}
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* DESCRIPTION */}
              <div style={{ marginTop: "20px" }}>
                <label style={labelStyle}>Description</label>

                {isEditing ? (
                    <textarea
                    value={data.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={4}
                    style={inputStyle}
                    />
                ) : (
                    <p>
                    {data.description}
                    </p>
                )}
                </div>

              {/* GRID FIELDS */}
              <div className="row g-3" style={{ marginTop: "10px" }}>
                <Field
                  label="Property"
                  value={data.property}
                  isEditing={isEditing}
                  onChange={(v) => handleChange("property", v)}
                />

                <Field
                  label="Room / Location"
                  value={data.room}
                  isEditing={isEditing}
                  onChange={(v) => handleChange("room", v)}
                />

                <Field
                  label="Category"
                  value={data.category}
                  isEditing={isEditing}
                  onChange={(v) => handleChange("category", v)}
                />

                <Field
                  label="Priority"
                  value={data.priority}
                  isEditing={isEditing}
                  accent="#ff4f00"
                  onChange={(v) => handleChange("priority", v)}
                />

                <Field
                    label="Status"
                    value={data.status}
                    isEditing={false}
                    accent="#7d8a6a"
                    />

                <Field
                  label="Submitted Date"
                  value={data.date}
                  isEditing={false}
                />

                <Field
                  label="Submitted By"
                  value={data.submittedBy}
                  isEditing={false}
                />
              </div>

              {/* BUTTONS */}
              {isEditing && (
                <div
                  className="d-flex gap-3"
                  style={{ marginTop: "30px" }}
                >
                  <button onClick={handleSave} style={saveBtn}>
                    Save Changes
                  </button>

                  <button onClick={handleCancel} style={cancelBtn}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-lg-4">
            {/* STATUS CARD */}
            <div style={sideCard}>
              <h5 style={{ fontWeight: 800 }}>Request Status</h5>

              <span style={badge}>{data.status}</span>

              <p style={{ marginTop: "12px", color: "#6b665e" }}>
                This request is currently being handled by the property manager.
              </p>
            </div>

            {/* EVIDENCE */}
            <div style={{ ...sideCard, marginTop: "20px" }}>
              <h5 style={{ fontWeight: 800 }}>Evidence</h5>

              <div style={imageBox}>
                No image uploaded (mock placeholder)
              </div>
            </div>

            {/* HISTORY */}
            <div style={{ ...sideCard, marginTop: "20px" }}>
              <h5 style={{ fontWeight: 800 }}>Activity History</h5>

              <ul style={{ paddingLeft: "18px", color: "#6b665e" }}>
                <li>Request created</li>
                <li>Assigned to manager</li>
                <li>Status updated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* FIELD COMPONENT */
function Field({
  label,
  value,
  isEditing,
  onChange,
  accent,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange?: (v: string) => void;
  accent?: string;
}) {
  return (
    <div className="col-md-6">
      <label style={labelStyle}>{label}</label>

      {isEditing ? (
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            ...inputStyle,
            borderLeft: accent ? `4px solid ${accent}` : "1px solid #ddd",
          }}
        />
      ) : (
        <div style={readonlyBox}>{value}</div>
      )}
    </div>
  );
}

/* STYLES */
const labelStyle = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#7b766e",
  marginBottom: "6px",
  display: "block",
  textTransform: "uppercase",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",

  background: "#ffffff", // ✅ force white
  color: "#201515",      // text color

  border: "1px solid #e6e2db",
  outline: "none",

  fontWeight: 600,
  transition: "0.2s ease",
};

const readonlyBox = {
  padding: "10px 12px",
  borderRadius: "12px",
  background: "#f8f7f3",
  fontWeight: 600,
};

const sideCard = {
  background: "#fff",
  border: "1px solid #eceae3",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 12px 40px rgba(218, 218, 218, 0.05)",
};

const badge = {
  display: "inline-block",
  marginTop: "10px",
  padding: "6px 12px",
  borderRadius: "999px",
  background: "#ff4f00",
  color: "#fff",
  fontSize: "12px",
  fontWeight: 700,
};

const imageBox = {
  marginTop: "10px",
  height: "120px",
  borderRadius: "14px",
  background: "#f4f4f4",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#999",
};

const editBtn = {
  background: "#ff4f00",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: 700,
};

const saveBtn = {
  background: "#ff4f00",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: "999px",
  fontWeight: 800,
};

const cancelBtn = {
  background: "#eceae3",
  color: "#201515",
  border: "none",
  padding: "10px 18px",
  borderRadius: "999px",
  fontWeight: 700,
};