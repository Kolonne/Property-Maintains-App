import Link from "next/link";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({ icon, title, message, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center p-5"
      style={{
        background: "#fffdf9",
        border: "1px dashed #c5c0b1",
        borderRadius: "8px",
        minHeight: "240px",
      }}
    >
      {icon && (
        <div style={{ color: "#c5c0b1", marginBottom: "16px", fontSize: "48px" }}>
          {icon}
        </div>
      )}
      <div style={{ fontSize: "20px", fontWeight: 500, color: "#201515", marginBottom: "8px" }}>
        {title}
      </div>
      {message && (
        <div style={{ fontSize: "16px", color: "#939084", marginBottom: "20px", maxWidth: "360px" }}>
          {message}
        </div>
      )}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="btn"
          style={{
            background: "#ff4f00",
            color: "#fffefb",
            border: "1px solid #ff4f00",
            borderRadius: "4px",
            fontWeight: 600,
            padding: "10px 20px",
          }}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
