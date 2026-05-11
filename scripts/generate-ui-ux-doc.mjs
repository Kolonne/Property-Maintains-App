import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, Header, Footer, PageNumber, LevelFormat, UnderlineType
} from "/opt/homebrew/lib/node_modules/docx/dist/index.mjs";
import fs from "fs";

// ── colour helpers ──────────────────────────────────────────────────
const CREAM   = "FFFEFB";
const ORANGE  = "FF4F00";
const DARK    = "201515";
const SAND    = "C5C0B1";
const LITE    = "ECEAE3";
const GREY    = "939084";
const CHAR    = "36342E";

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "C5C0B1" };
const borders    = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const noBorder   = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders  = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ── tiny helpers ────────────────────────────────────────────────────
const pageWidth = 9360; // US Letter, 1" margins each side

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 36, color: DARK, font: "Arial" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    children: [new TextRun({ text, bold: true, size: 28, color: DARK, font: "Arial" })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: ORANGE, font: "Arial" })]
  });
}

function body(runs) {
  const children = typeof runs === "string"
    ? [new TextRun({ text: runs, size: 22, color: DARK, font: "Arial" })]
    : runs;
  return new Paragraph({ spacing: { before: 60, after: 60 }, children });
}

function mono(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 360 },
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "36342E" })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, color: DARK, font: "Arial" })]
  });
}

function boldBullet(label, rest) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({ text: label, bold: true, size: 22, color: DARK, font: "Arial" }),
      new TextRun({ text: rest, size: 22, color: DARK, font: "Arial" })
    ]
  });
}

function rule() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: SAND, space: 1 } },
    children: []
  });
}

function gap(pts = 80) {
  return new Paragraph({ spacing: { before: pts, after: 0 }, children: [] });
}

// ── table builder ───────────────────────────────────────────────────
function makeTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      // header row
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
          borders,
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: LITE, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            children: [new TextRun({ text: h, bold: true, size: 20, color: CHAR, font: "Arial" })]
          })]
        }))
      }),
      // data rows
      ...rows.map((cells, ri) => new TableRow({
        children: cells.map((c, i) => new TableCell({
          borders,
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? CREAM : "FFFDF9", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: c, size: 20, color: DARK, font: "Arial" })]
          })]
        }))
      }))
    ]
  });
}

// ── code block ──────────────────────────────────────────────────────
function codeBlock(lines) {
  return [
    new Paragraph({
      spacing: { before: 80, after: 0 },
      shading: { fill: "F4F2EE", type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } },
      indent: { left: 360 },
      children: [new TextRun({ text: "" })]
    }),
    ...lines.map(l => new Paragraph({
      spacing: { before: 0, after: 0 },
      shading: { fill: "F4F2EE", type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } },
      indent: { left: 360, right: 360 },
      children: [new TextRun({ text: l, font: "Courier New", size: 18, color: "36342E" })]
    })),
    new Paragraph({
      spacing: { before: 0, after: 80 },
      shading: { fill: "F4F2EE", type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } },
      indent: { left: 360 },
      children: [new TextRun({ text: "" })]
    })
  ];
}

// ── DOCUMENT ────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 260 } } }
        }]
      },
      {
        reference: "numbered",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 260 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: DARK } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 280, after: 100 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: ORANGE },
        paragraph: { spacing: { before: 220, after: 80 }, outlineLevel: 2 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: SAND, space: 1 } },
          children: [
            new TextRun({ text: "UI / UX Guidelines  |  Property Maintenance App  |  Dilitha Dinisuru 12238934", size: 18, color: GREY, font: "Arial" })
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: SAND, space: 1 } },
          children: [
            new TextRun({ text: "Page ", size: 18, color: GREY, font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GREY, font: "Arial" }),
            new TextRun({ text: " of ", size: 18, color: GREY, font: "Arial" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: GREY, font: "Arial" }),
            new TextRun({ text: "   •   COIT13232   •   2026-05-05", size: 18, color: GREY, font: "Arial" })
          ]
        })]
      })
    },
    children: [

      // ── COVER ──────────────────────────────────────────────────────
      new Paragraph({
        spacing: { before: 1200, after: 80 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "UI / UX Guidelines", bold: true, size: 64, color: DARK, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 80 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Property Maintenance App", size: 36, color: ORANGE, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 320 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Inspired by Zapier's design system  ·  Built with Bootstrap 5 + Next.js", size: 24, color: GREY, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 80 },
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: SAND, space: 8 } },
        children: [new TextRun({ text: "Dilitha Dinisuru  ·  Student ID: 12238934  ·  COIT13232", size: 22, color: CHAR, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 1600 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "2026-05-05", size: 22, color: GREY, font: "Arial" })]
      }),

      rule(),

      // ── 1. DESIGN PHILOSOPHY ───────────────────────────────────────
      h1("1.  Design Philosophy"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        border: { left: { style: BorderStyle.SINGLE, size: 16, color: ORANGE, space: 8 } },
        indent: { left: 360 },
        children: [new TextRun({ text: "“Warm, approachable professionalism.”", italics: true, size: 24, color: DARK, font: "Arial" })]
      }),
      body("This app is used by real people dealing with real problems — a leaking tap, a broken heater, an urgent repair. The UI must feel trustworthy and calm, not clinical or corporate. We achieve this through a cream-tinted canvas, warm typographic hierarchy, and a restrained use of colour that makes the orange accent feel meaningful when it appears."),
      gap(),
      body([new TextRun({ text: "Three rules that govern every decision:", bold: true, size: 22, color: DARK, font: "Arial" })]),
      boldBullet("Borders over shadows — ", "containment is expressed through 1px warm-grey borders, never drop-shadows."),
      boldBullet("Warmth over neutrality — ", "cream (#fffefb) not white, warm-black (#201515) not pure black."),
      boldBullet("Orange is earned — ", "#ff4f00 appears only on primary CTAs and active states. Never scatter it."),

      rule(),

      // ── 2. COLOUR PALETTE ──────────────────────────────────────────
      h1("2.  Colour Palette"),

      h2("Primary Colours"),
      makeTable(
        ["Token", "Hex", "Bootstrap Override", "Usage"],
        [
          ["--color-bg",     "#fffefb", "body background, card background", "Page canvas, all card surfaces"],
          ["--color-text",   "#201515", "--bs-body-color",                  "All body text, headings, dark buttons"],
          ["--color-accent", "#ff4f00", "--bs-primary",                     "Primary CTAs, active tabs, focus rings"]
        ],
        [1800, 1200, 2160, 4200]
      ),

      gap(120),
      h2("Neutrals"),
      makeTable(
        ["Token", "Hex", "Usage"],
        [
          ["--color-charcoal",   "#36342e", "Secondary text, footer copy, strong borders"],
          ["--color-muted",      "#939084", "Placeholder text, disabled labels, helper text"],
          ["--color-sand",       "#c5c0b1", "Primary border, hover backgrounds, dividers"],
          ["--color-light-sand", "#eceae3", "Secondary button fill, card inner surfaces"],
          ["--color-off-white",  "#fffdf9", "Sidebar/panel backgrounds"]
        ],
        [2200, 1400, 5760]
      ),

      gap(120),
      h2("Status Colours (Maintenance-Specific)"),
      makeTable(
        ["Status", "Colour", "Hex", "Note"],
        [
          ["Submitted",                   "Blue",        "#3b82f6", "Neutral information"],
          ["Acknowledged",                "Indigo",      "#6366f1", "Seen, not yet actioned"],
          ["In Progress",                 "Amber",       "#f59e0b", "Active work"],
          ["Awaiting Parts",              "Orange-muted","#ea580c", "Blocked — warm but different from accent"],
          ["Awaiting Landlord Approval",  "Purple",      "#9333ea", "Landlord decision pending"],
          ["Landlord Approved",           "Teal",        "#0d9488", "Approved, ready to proceed"],
          ["Completed",                   "Green",       "#22c55e", "Done"],
          ["Closed",                      "Sand",        "#939084", "Archived"]
        ],
        [2000, 1600, 1400, 4360]
      ),
      gap(80),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } },
        indent: { left: 360 },
        children: [new TextRun({ text: "Rule: Status colours appear only in badges/pills. They never bleed into backgrounds or large elements.", italics: true, size: 20, color: CHAR, font: "Arial" })]
      }),

      rule(),

      // ── 3. TYPOGRAPHY ─────────────────────────────────────────────
      h1("3.  Typography"),

      h2("Font Stack"),
      body("We use only Inter (no display or editorial fonts) — it’s clean, readable, and free."),
      gap(80),
      ...codeBlock([
        "/* Primary — all UI */",
        "font-family: 'Inter', Helvetica, Arial, sans-serif;",
        "",
        "/* Google Fonts import (add to layout.tsx) */",
        "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');"
      ]),

      gap(120),
      h2("Type Scale"),
      makeTable(
        ["Role", "Size", "Weight", "Line Height", "Letter Spacing", "Bootstrap Class"],
        [
          ["Page title (H1)",    "36px", "500", "1.1",  "−0.5px", "fs-2 fw-medium"],
          ["Section heading (H2)","28px","500", "1.2",  "normal",       "fs-3 fw-medium"],
          ["Card title (H3)",    "20px", "600", "1.2",  "−0.3px", "fs-5 fw-semibold"],
          ["Sub-heading (H4)",   "16px", "600", "1.25", "normal",       "fs-6 fw-semibold"],
          ["Body",               "16px", "400", "1.5",  "−0.1px", "(default)"],
          ["Body emphasis",      "16px", "600", "1.5",  "normal",       "fw-semibold"],
          ["Caption / helper",   "14px", "500", "1.4",  "normal",       "small fw-medium"],
          ["Micro label",        "12px", "600", "1.3",  "+0.5px",       "text-uppercase"],
          ["Button",             "16px", "600", "1",    "normal",       "btn"],
          ["Button small",       "14px", "600", "1",    "normal",       "btn btn-sm"]
        ],
        [1800, 840, 800, 1000, 1120, 1800]
      ),

      gap(120),
      h2("Typography Rules"),
      bullet("Micro labels (section tags, status category labels): uppercase + 0.5px letter-spacing only"),
      bullet("Headings: weight 500 (medium), not bold — warmth not aggression"),
      bullet("Never use weight 700+ (bold) in headings"),
      bullet("Body text: #201515 on #fffefb — do not use pure black on pure white"),

      rule(),

      // ── 4. SPACING ────────────────────────────────────────────────
      h1("4.  Spacing"),
      body([
        new TextRun({ text: "Base unit: 8px. ", bold: true, size: 22, color: DARK, font: "Arial" }),
        new TextRun({ text: "All padding, margin, and gap values are multiples of 4 or 8.", size: 22, color: DARK, font: "Arial" })
      ]),
      gap(80),
      makeTable(
        ["Name", "Value", "Bootstrap Utility"],
        [
          ["XS",  "4px",  "p-1 / m-1"],
          ["SM",  "8px",  "p-2 / m-2"],
          ["MD",  "16px", "p-3 / m-3"],
          ["LG",  "24px", "p-4 / m-4 (+ gap-3)"],
          ["XL",  "32px", "p-5 (partial)"],
          ["2XL", "48px", "custom py-6"],
          ["3XL", "64px", "custom py-8"]
        ],
        [2000, 2000, 5360]
      ),
      gap(80),
      body("Section vertical rhythm: 64px top/bottom on desktop, 40px on mobile."),

      rule(),

      // ── 5. COMPONENTS ─────────────────────────────────────────────
      h1("5.  Components"),

      // 5.1 Buttons
      h2("5.1  Buttons"),
      makeTable(
        ["Variant", "When to Use", "Style"],
        [
          ["Primary (orange)", "Single main action per view — \"Submit Request\", \"Save Changes\"", "#ff4f00 bg, #fffefb text, 4px radius, 1px solid #ff4f00"],
          ["Primary (dark)",   "Destructive confirm, secondary page action",                         "#201515 bg, #fffefb text, 8px radius"],
          ["Light / Ghost",    "Cancel, secondary options",                                          "#eceae3 bg, #36342e text, 8px radius, 1px solid #c5c0b1"],
          ["Outline",          "Tertiary, filter buttons",                                            "Transparent bg, #201515 text, 1px solid #c5c0b1"]
        ],
        [1600, 3200, 4560]
      ),
      gap(80),
      body([new TextRun({ text: "Padding:", bold: true, size: 22, color: DARK, font: "Arial" })]),
      bullet("Standard: 8px 16px"),
      bullet("Large CTA (hero, empty state): 12px 24px"),
      gap(80),
      body([new TextRun({ text: "Rules:", bold: true, size: 22, color: DARK, font: "Arial" })]),
      bullet("Only one Primary (orange) button per view"),
      bullet("Buttons use 4–8px border-radius only — no pill shapes on primaries"),
      bullet("Hover states: shift border/bg to #c5c0b1 sand — no harsh colour jumps"),
      gap(80),
      body("Example HTML:"),
      ...codeBlock([
        "<!-- Primary Orange -->",
        "<button class=\"btn\" style=\"background:#ff4f00; color:#fffefb;",
        "  border:1px solid #ff4f00; border-radius:4px; font-weight:600;\">",
        "  Submit Request",
        "</button>",
        "",
        "<!-- Light Ghost -->",
        "<button class=\"btn\" style=\"background:#eceae3; color:#36342e;",
        "  border:1px solid #c5c0b1; border-radius:8px; font-weight:600;\">",
        "  Cancel",
        "</button>"
      ]),

      // 5.2 Cards
      gap(120),
      h2("5.2  Cards"),
      body("Cards are the primary layout container for maintenance requests, property listings, and dashboards."),
      gap(80),
      makeTable(
        ["Property", "Value"],
        [
          ["Background",    "#fffefb"],
          ["Border",        "1px solid #c5c0b1"],
          ["Border radius", "5px (standard), 8px (featured/hero card)"],
          ["Box shadow",    "None"],
          ["Padding",       "20px 24px"],
          ["Hover",         "border-color → #36342e"]
        ],
        [3000, 6360]
      ),
      gap(80),
      ...codeBlock([
        "<div class=\"card border-0 p-4\"",
        "  style=\"background:#fffefb; border:1px solid #c5c0b1 !important; border-radius:5px;\">",
        "  <div class=\"card-body p-0\">",
        "    <!-- content -->",
        "  </div>",
        "</div>"
      ]),

      // 5.3 Status Badges
      gap(120),
      h2("5.3  Status Badges"),
      makeTable(
        ["Status", "Badge Background", "Badge Text", "Border"],
        [
          ["submitted",                   "#eff6ff", "#3b82f6", "#bfdbfe"],
          ["acknowledged",                "#eef2ff", "#6366f1", "#c7d2fe"],
          ["in_progress",                 "#fffbeb", "#f59e0b", "#fde68a"],
          ["awaiting_parts",              "#fff7ed", "#ea580c", "#fed7aa"],
          ["awaiting_landlord_approval",  "#faf5ff", "#9333ea", "#e9d5ff"],
          ["landlord_approved",           "#f0fdfa", "#0d9488", "#99f6e4"],
          ["completed",                   "#f0fdf4", "#22c55e", "#bbf7d0"],
          ["closed",                      "#f5f5f4", "#939084", "#e7e5e4"]
        ],
        [2800, 1800, 1600, 1600]
      ),

      // 5.4 Priority Indicators
      gap(120),
      h2("5.4  Priority Indicators"),
      body("Priority uses a coloured left-border on the card, not a badge."),
      gap(80),
      makeTable(
        ["Priority", "Left Border", "Dot Colour"],
        [
          ["low",    "3px solid #22c55e", "green"],
          ["medium", "3px solid #f59e0b", "amber"],
          ["high",   "3px solid #ea580c", "orange"],
          ["urgent", "3px solid #ef4444", "red"]
        ],
        [2000, 3680, 1680]
      ),

      // 5.5 Form Inputs
      gap(120),
      h2("5.5  Form Inputs"),
      makeTable(
        ["Property", "Value"],
        [
          ["Background",   "#fffefb"],
          ["Border",       "1px solid #c5c0b1"],
          ["Border radius","5px"],
          ["Text",         "#201515"],
          ["Placeholder",  "#939084"],
          ["Focus border", "1px solid #ff4f00"],
          ["Focus ring",   "none (remove Bootstrap’s default)"]
        ],
        [3000, 6360]
      ),
      gap(80),
      body("Override Bootstrap’s blue focus ring:"),
      ...codeBlock([
        ".form-control:focus {",
        "  border-color: #ff4f00;",
        "  box-shadow: none;",
        "}"
      ]),

      // 5.6 Navigation
      gap(120),
      h2("5.6  Navigation"),
      makeTable(
        ["Property", "Value"],
        [
          ["Background",          "#fffefb (sticky)"],
          ["Border bottom",       "1px solid #c5c0b1"],
          ["Link colour",         "#201515, weight 500"],
          ["Active tab indicator","box-shadow: #ff4f00 0px -3px 0px 0px inset"],
          ["Hover tab indicator", "box-shadow: #c5c0b1 0px -3px 0px 0px inset"],
          ["CTA button",          "Orange primary, 4px radius"]
        ],
        [3000, 6360]
      ),

      // 5.7 Tables
      gap(120),
      h2("5.7  Tables (Maintenance Request Lists)"),
      makeTable(
        ["Property", "Value"],
        [
          ["Header background","#eceae3"],
          ["Header text",      "#36342e, weight 600, uppercase, 12px"],
          ["Row border",       "1px solid #eceae3"],
          ["Row hover",        "background: #fffdf9"],
          ["Selected row",     "background: #fff7ed; border-left: 3px solid #ff4f00"]
        ],
        [3000, 6360]
      ),

      // 5.8 Dividers
      gap(120),
      h2("5.8  Dividers"),
      body("Always override Bootstrap’s default <hr> border-color to #c5c0b1:"),
      ...codeBlock([
        "<hr style=\"border-color: #c5c0b1; margin: 24px 0;\">"
      ]),

      rule(),

      // ── 6. LAYOUT & GRID ──────────────────────────────────────────
      h1("6.  Layout & Grid"),

      h2("Page Structure"),
      bullet("Max content width: 1200px, centred"),
      bullet("Sidebar: 240px fixed on desktop, collapses to hamburger on mobile"),
      bullet("Main padding: 32px on desktop, 16px on mobile"),
      bullet("Card grid: Bootstrap row g-3 (24px gap)"),
      bullet("Section spacing: 48px between major sections"),

      gap(120),
      h2("Responsive Breakpoints"),
      makeTable(
        ["Bootstrap", "Width", "Behaviour"],
        [
          ["xs", "<576px",   "Single column, sidebar hidden"],
          ["sm", "≥576px", "Single column, sidebar toggle"],
          ["md", "≥768px", "Sidebar appears"],
          ["lg", "≥992px", "Full two-column layout"],
          ["xl", "≥1200px","Comfortable content width"]
        ],
        [1200, 1600, 6560]
      ),

      rule(),

      // ── 7. ROLE-BASED UI ──────────────────────────────────────────
      h1("7.  Role-Based UI Differences"),
      body("The same components appear for all roles; the content changes."),
      gap(80),
      makeTable(
        ["Element", "Tenant", "Property Manager", "Landlord"],
        [
          ["Sidebar nav",          "My Requests, Profile",  "All Requests, Properties, Work Orders", "Properties, Approvals"],
          ["Request card actions", "View only",              "Change status, assign, comment",         "Approve/reject quotes"],
          ["Status badge shown",   "All",                   "All",                                    "Relevant to landlord flow"],
          ["New request button",   "✅ (orange, prominent)", "✅ (on behalf of tenant)",      "❌ (hidden)"],
          ["Internal comments",    "❌ (hidden)",        "✅",                                 "✅"]
        ],
        [2200, 1760, 2720, 2680]
      ),

      rule(),

      // ── 8. EMPTY STATES ───────────────────────────────────────────
      h1("8.  Empty States"),
      body("Every list view must have a designed empty state — no blank white boxes."),
      gap(80),
      makeTable(
        ["Element", "Specification"],
        [
          ["Icon",     "Relevant to context, #c5c0b1 colour, 48px"],
          ["Heading",  "Inter 20px, weight 500, #201515"],
          ["Sub-text", "16px, #939084"],
          ["CTA",      "Only when the user can take action from here (orange primary button)"]
        ],
        [2000, 7360]
      ),

      rule(),

      // ── 9. FEEDBACK & ALERTS ──────────────────────────────────────
      h1("9.  Feedback & Alerts"),
      makeTable(
        ["Type", "Background", "Border", "Text"],
        [
          ["Success", "#f0fdf4", "1px solid #bbf7d0", "#166534"],
          ["Warning", "#fffbeb", "1px solid #fde68a", "#92400e"],
          ["Error",   "#fef2f2", "1px solid #fecaca", "#991b1b"],
          ["Info",    "#eff6ff", "1px solid #bfdbfe", "#1e40af"]
        ],
        [1440, 2000, 2400, 3520]
      ),
      gap(80),
      body("Toast notifications: appear bottom-right, auto-dismiss after 4 seconds, same colour system as alerts."),

      rule(),

      // ── 10. CSS OVERRIDE ──────────────────────────────────────────
      h1("10.  CSS Custom Properties / Bootstrap Override"),
      body("Add this to src/app/globals.css or a theme.css imported in layout.tsx:"),
      gap(80),
      ...codeBlock([
        ":root {",
        "  /* Colour tokens */",
        "  --color-bg:          #fffefb;",
        "  --color-text:        #201515;",
        "  --color-accent:      #ff4f00;",
        "  --color-charcoal:    #36342e;",
        "  --color-muted:       #939084;",
        "  --color-sand:        #c5c0b1;",
        "  --color-light-sand:  #eceae3;",
        "  --color-off-white:   #fffdf9;",
        "",
        "  /* Bootstrap overrides */",
        "  --bs-body-bg:        var(--color-bg);",
        "  --bs-body-color:     var(--color-text);",
        "  --bs-primary:        var(--color-accent);",
        "  --bs-primary-rgb:    255, 79, 0;",
        "  --bs-border-color:   var(--color-sand);",
        "  --bs-card-bg:        var(--color-bg);",
        "  --bs-card-border-color: var(--color-sand);",
        "  --bs-font-sans-serif: 'Inter', Helvetica, Arial, sans-serif;",
        "",
        "  /* Spacing */",
        "  --section-pad-y:     64px;",
        "}",
        "",
        "/* Reset Bootstrap's blue focus */",
        ".form-control:focus,",
        ".form-select:focus {",
        "  border-color: var(--color-accent);",
        "  box-shadow: none;",
        "}",
        "",
        "/* Warm body */",
        "body {",
        "  background-color: var(--color-bg);",
        "  color: var(--color-text);",
        "}"
      ]),

      rule(),

      // ── 11. ACCESSIBILITY ─────────────────────────────────────────
      h1("11.  Accessibility Checklist"),
      bullet("Minimum contrast ratio 4.5:1 for body text (#201515 on #fffefb = 14.7:1 ✅)"),
      bullet("Focus states visible on all interactive elements (orange outline)"),
      bullet("Status badges use text labels, not colour alone"),
      bullet("Priority indicators use text (“Urgent”) not colour alone"),
      bullet("All images have alt text"),
      bullet("Form inputs have associated <label> elements"),
      bullet("Buttons have descriptive text (not just icons)"),
      bullet("Touch targets ≥ 44×44px on mobile"),

      rule(),

      // ── 12. DO's AND DON'Ts ───────────────────────────────────────
      h1("12.  Do’s and Don’ts"),

      h2("✅  Do"),
      bullet("Use #fffefb (cream) — never pure #ffffff"),
      bullet("Use #201515 (warm black) — never pure #000000"),
      bullet("Express depth with 1px solid #c5c0b1 borders"),
      bullet("Reserve #ff4f00 for one primary CTA per view"),
      bullet("Use uppercase + 0.5px letter-spacing for micro labels only"),
      bullet("Keep Inter weight ≤ 600 (semibold)"),
      bullet("Apply 8px-grid spacing throughout"),

      gap(100),
      h2("❌  Don’t"),
      bullet("Add box-shadow to cards"),
      bullet("Scatter orange across the UI"),
      bullet("Use pure white or pure black anywhere"),
      bullet("Apply border-radius: 9999px to primary buttons"),
      bullet("Use font-weight 700+ (bold) in headings"),
      bullet("Mix status colours into backgrounds"),
      bullet("Leave list views without an empty state"),

      rule(),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 160, after: 0 },
        children: [new TextRun({
          text: "Last updated: 2026-05-05  ·  Dilitha Dinisuru — Property Maintenance App, COIT13232",
          size: 18, color: GREY, italics: true, font: "Arial"
        })]
      })
    ]
  }]
});

// ── Write file ──────────────────────────────────────────────────────
const outPath = "/Users/dilitha/uniwork/Property-Maintains-App/docs/UI-UX-Guidelines-Dilitha-12238934.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Written:", outPath);
}).catch(e => { console.error(e); process.exit(1); });
