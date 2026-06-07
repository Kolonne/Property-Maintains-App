import Link from "next/link";

type DashboardReportPhotoCardProps = {
  href?: string;
  ctaLabel?: string;
};

export function DashboardReportPhotoCard({
  href = "/maintenance/new",
  ctaLabel = "New Request",
}: DashboardReportPhotoCardProps) {
  return (
    <section className="pm-dashboard-photo-card">
      <div
        className="pm-dashboard-photo-card-content p-3 p-lg-4"
        style={{
          minHeight: "145px",
        }}
      >
        <div className="pm-dashboard-photo-card-inner d-flex align-items-center h-100" style={{ gap: "28px" }}>
          <span
            className="pm-dashboard-photo-card-icon d-inline-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              background: "#f97316",
              borderRadius: "999px",
              color: "#ffffff",
              height: "52px",
              width: "52px",
            }}
          >
            <i className="bi bi-camera" style={{ fontSize: "21px" }} aria-hidden="true" />
          </span>
          <div className="pm-dashboard-photo-card-copy" style={{ maxWidth: "290px", marginLeft: "10px" }}>
            <h2 style={{ color: "#1f2933", fontSize: "18px", fontWeight: 800, marginBottom: "7px" }}>
              Report an issue with photos
            </h2>
            <p style={{ color: "#374151", fontSize: "13px", lineHeight: 1.5, marginBottom: "14px" }}>
              Attach clear photos to help get maintenance requests resolved faster.
            </p>
            <Link
              href={href}
              className="btn pm-dashboard-pill-button pm-dashboard-photo-card-button"
              style={{
                background: "#f97316",
                border: "1px solid #f97316",
                color: "#ffffff",
                fontSize: "12px",
                padding: "8px 14px",
              }}
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
