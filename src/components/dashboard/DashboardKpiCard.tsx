type KpiTone = "orange" | "yellow" | "green" | "blue" | "peach";

type DashboardKpiCardProps = {
  icon: string;
  label: string;
  value: string | number;
  helper?: string;
  tone?: KpiTone;
};

const toneStyles: Record<KpiTone, { background: string; color: string }> = {
  orange: { background: "#fff1e7", color: "#f97316" },
  yellow: { background: "#fef3c7", color: "#d97706" },
  green: { background: "#dcfce7", color: "#16a34a" },
  blue: { background: "#e0f2fe", color: "#0284c7" },
  peach: { background: "#fff7f1", color: "#f97316" },
};

export function DashboardKpiCard({
  icon,
  label,
  value,
  helper,
  tone = "orange",
}: DashboardKpiCardProps) {
  const colours = toneStyles[tone];

  return (
    <article
      className="h-100"
      style={{
        background: "#ffffff",
        border: "1px solid #e8e2da",
        borderRadius: "14px",
        boxShadow: "0 10px 26px rgba(31, 41, 51, 0.07)",
        padding: "18px",
      }}
    >
      <div className="d-flex align-items-center" style={{ gap: "16px" }}>
        <span
          className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            background: colours.background,
            borderRadius: "11px",
            color: colours.color,
            height: "58px",
            width: "58px",
          }}
        >
          <i className={`bi ${icon}`} style={{ fontSize: "25px" }} aria-hidden="true" />
        </span>
        <span className="d-flex flex-column">
          <span style={{ color: "#1f2933", fontSize: "13px", fontWeight: 800 }}>
            {label}
          </span>
          <span style={{ color: "#111827", fontSize: "32px", fontWeight: 850, lineHeight: 1.05 }}>
            {value}
          </span>
          {helper ? (
            <span style={{ color: colours.color, fontSize: "12px", fontWeight: 650, marginTop: "4px" }}>
              {helper}
            </span>
          ) : null}
        </span>
      </div>
    </article>
  );
}


