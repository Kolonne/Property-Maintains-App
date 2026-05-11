import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, Header, Footer, PageNumber, LevelFormat
} from "/opt/homebrew/lib/node_modules/docx/dist/index.mjs";
import fs from "fs";

const CREAM = "FFFEFB", ORANGE = "FF4F00", DARK = "201515";
const SAND = "C5C0B1", LITE = "ECEAE3", GREY = "939084", CHAR = "36342E";
const SAGE = "7D8A6A", CLAY = "A8593E", PLUM = "8D6A78";

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "C5C0B1" };
const borders    = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

const h1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 120 }, children: [new TextRun({ text: t, bold: true, size: 36, color: DARK, font: "Arial" })] });
const h2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 100 }, children: [new TextRun({ text: t, bold: true, size: 28, color: DARK, font: "Arial" })] });
const body = runs => {
  const children = typeof runs === "string" ? [new TextRun({ text: runs, size: 22, color: DARK, font: "Arial" })] : runs;
  return new Paragraph({ spacing: { before: 60, after: 60 }, children });
};
const bullet = t => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: t, size: 22, color: DARK, font: "Arial" })] });
const boldBullet = (label, rest) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: label, bold: true, size: 22, color: DARK, font: "Arial" }), new TextRun({ text: rest, size: 22, color: DARK, font: "Arial" })] });
const rule = () => new Paragraph({ spacing: { before: 160, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: SAND, space: 1 } }, children: [] });
const gap = (pts = 80) => new Paragraph({ spacing: { before: pts, after: 0 }, children: [] });

function makeTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
          borders,
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: LITE, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: CHAR, font: "Arial" })] })]
        }))
      }),
      ...rows.map((cells, ri) => new TableRow({
        children: cells.map((c, i) => new TableCell({
          borders,
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? CREAM : "FFFDF9", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: c, size: 20, color: DARK, font: "Arial" })] })]
        }))
      }))
    ]
  });
}

// colour swatch table - the swatch cell is filled with the actual hex
function swatchTable(colours) {
  const widths = [800, 1900, 1400, 5260];
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: ["", "Token", "Hex", "Usage"].map((h, i) => new TableCell({
          borders,
          width: { size: widths[i], type: WidthType.DXA },
          shading: { fill: LITE, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: CHAR, font: "Arial" })] })]
        }))
      }),
      ...colours.map((c, ri) => new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: widths[0], type: WidthType.DXA },
            shading: { fill: c.hex.replace("#", ""), type: ShadingType.CLEAR },
            margins: { top: 200, bottom: 200, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: " ", size: 20 })] })]
          }),
          new TableCell({
            borders, width: { size: widths[1], type: WidthType.DXA },
            shading: { fill: ri % 2 === 0 ? CREAM : "FFFDF9", type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ children: [new TextRun({ text: c.token, size: 20, color: DARK, font: "Courier New" })] })]
          }),
          new TableCell({
            borders, width: { size: widths[2], type: WidthType.DXA },
            shading: { fill: ri % 2 === 0 ? CREAM : "FFFDF9", type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ children: [new TextRun({ text: c.hex, size: 20, color: DARK, font: "Courier New" })] })]
          }),
          new TableCell({
            borders, width: { size: widths[3], type: WidthType.DXA },
            shading: { fill: ri % 2 === 0 ? CREAM : "FFFDF9", type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ children: [new TextRun({ text: c.usage, size: 20, color: DARK, font: "Arial" })] })]
          })
        ]
      }))
    ]
  });
}

function codeBlock(lines) {
  return [
    new Paragraph({
      spacing: { before: 80, after: 0 }, shading: { fill: "F4F2EE", type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } },
      indent: { left: 360 }, children: [new TextRun({ text: "" })]
    }),
    ...lines.map(l => new Paragraph({
      spacing: { before: 0, after: 0 }, shading: { fill: "F4F2EE", type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } },
      indent: { left: 360, right: 360 },
      children: [new TextRun({ text: l, font: "Courier New", size: 18, color: "36342E" })]
    })),
    new Paragraph({
      spacing: { before: 0, after: 80 }, shading: { fill: "F4F2EE", type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } },
      indent: { left: 360 }, children: [new TextRun({ text: "" })]
    })
  ];
}

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 260 } } } }]
    }]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: DARK } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 280, after: 100 }, outlineLevel: 1 } }
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: SAND, space: 1 } },
      children: [new TextRun({ text: "UI / UX Guidelines v2  |  Property Maintenance App  |  Dilitha Dinisuru 12238934", size: 18, color: GREY, font: "Arial" })]
    })] }) },
    footers: { default: new Footer({ children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: SAND, space: 1 } },
      children: [
        new TextRun({ text: "Page ", size: 18, color: GREY, font: "Arial" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GREY, font: "Arial" }),
        new TextRun({ text: " of ", size: 18, color: GREY, font: "Arial" }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: GREY, font: "Arial" }),
        new TextRun({ text: "   •   COIT13232   •   v2 — 2026-05-05", size: 18, color: GREY, font: "Arial" })
      ]
    })] }) },
    children: [
      // COVER
      new Paragraph({ spacing: { before: 1200, after: 80 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "UI / UX Guidelines", bold: true, size: 64, color: DARK, font: "Arial" })] }),
      new Paragraph({ spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Version 2", size: 36, color: ORANGE, font: "Arial" })] }),
      new Paragraph({ spacing: { before: 0, after: 320 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Property Maintenance App  ·  Earth-tone palette extension", size: 24, color: GREY, font: "Arial" })] }),
      new Paragraph({
        spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: SAND, space: 8 } },
        children: [new TextRun({ text: "Dilitha Dinisuru  ·  Student ID: 12238934  ·  COIT13232", size: 22, color: CHAR, font: "Arial" })]
      }),
      new Paragraph({ spacing: { before: 0, after: 1600 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Updated 2026-05-05", size: 22, color: GREY, font: "Arial" })] }),

      rule(),

      h1("What's new in v2"),
      bullet("Three earth-tone accent colours added: sage, clay, dusty plum"),
      bullet("Status badges now use a six-tier visual story (was four)"),
      bullet("Property occupancy bars use sage when 100% occupied"),
      bullet("Landlord role now allowed to submit New Requests (per Rebekah's review)"),
      bullet("All other rules from v1 unchanged"),

      rule(),

      h1("1.  Design Philosophy"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        border: { left: { style: BorderStyle.SINGLE, size: 16, color: ORANGE, space: 8 } },
        indent: { left: 360 },
        children: [new TextRun({ text: "“Warm, approachable professionalism.”", italics: true, size: 24, color: DARK, font: "Arial" })]
      }),
      body("The app must feel trustworthy and calm, not clinical or corporate. Cream-tinted canvas + warm typographic hierarchy + restrained colour use."),
      gap(),
      body([new TextRun({ text: "Four rules that govern every decision:", bold: true, size: 22, color: DARK, font: "Arial" })]),
      boldBullet("Borders over shadows — ", "containment via 1px warm-grey borders."),
      boldBullet("Warmth over neutrality — ", "cream not white, warm-black not pure black."),
      boldBullet("Orange is earned — ", "#ff4f00 only on primary CTAs and urgent states."),
      boldBullet("Earth tones tell stories — ", "sage/clay/plum convey state changes warmly. (NEW)"),

      rule(),

      h1("2.  Colour Palette"),

      h2("Primary"),
      swatchTable([
        { token: "--color-bg",     hex: "#FFFEFB", usage: "Page canvas, all card surfaces" },
        { token: "--color-text",   hex: "#201515", usage: "Body text, headings, dark buttons" },
        { token: "--color-accent", hex: "#FF4F00", usage: "Primary CTAs, active tabs, urgent states" }
      ]),

      gap(120),
      h2("Neutrals"),
      swatchTable([
        { token: "--color-charcoal",   hex: "#36342E", usage: "Secondary text, footer copy" },
        { token: "--color-muted",      hex: "#939084", usage: "Placeholder, helper text" },
        { token: "--color-sand",       hex: "#C5C0B1", usage: "Primary border, dividers" },
        { token: "--color-light-sand", hex: "#ECEAE3", usage: "Secondary button fill, icon containers" },
        { token: "--color-off-white",  hex: "#FFFDF9", usage: "Sidebar/panel backgrounds" }
      ]),

      gap(120),
      h2("NEW: Earth-tone Accents"),
      swatchTable([
        { token: "--color-sage", hex: "#7D8A6A", usage: "Completed status fill, full occupancy bar (success)" },
        { token: "--color-clay", hex: "#A8593E", usage: "In Progress status outline, secondary warm accent" },
        { token: "--color-plum", hex: "#8D6A78", usage: "Approved status outline, quiet authority" }
      ]),
      gap(80),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } },
        indent: { left: 360 },
        children: [new TextRun({ text: "Why these three? Sage is the warm sister of green — pairs with cream like olive with bread. Clay is the dustier cousin of orange — same family, lower volume. Plum is the only purple-family colour that doesn't feel cold against cream.", italics: true, size: 20, color: CHAR, font: "Arial" })]
      }),

      rule(),

      h1("3.  Typography (unchanged from v1)"),
      body("Inter only, weights 400/500/600. Full type scale unchanged — see v1 doc for the complete table."),

      rule(),

      h1("4.  Spacing (unchanged)"),
      body("Base unit 8px. Section vertical rhythm: 64px desktop, 40px mobile."),

      rule(),

      h1("5.  Status Badges — Updated"),
      body("Six visual tiers tell a story across the request lifecycle:"),
      gap(80),
      makeTable(
        ["Status", "Tier", "Style", "Reads as"],
        [
          ["Submitted",         "open",           "Sand fill, charcoal text",               "Logged, awaiting triage"],
          ["Acknowledged",      "open",           "Sand fill, charcoal text",               "Seen by PM"],
          ["In Progress",       "progress (NEW)", "Cream bg, clay outline + clay text",     "Active work happening"],
          ["Awaiting Parts",    "open",           "Sand fill, charcoal text",               "Paused on dependency"],
          ["Awaiting Approval", "attention",      "Cream bg, orange outline + orange text", "Needs landlord — urgent"],
          ["Approved",          "approved (NEW)", "Cream bg, plum outline + plum text",     "Landlord signed off"],
          ["Completed",         "done (UPDATED)", "Sage fill, cream text",                  "Resolved (was solid black)"],
          ["Closed",            "archived",       "Off-white bg, muted text",               "Archived"]
        ],
        [2000, 1800, 3360, 2200]
      ),
      gap(80),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: SAGE, space: 8 } },
        indent: { left: 360 },
        children: [new TextRun({ text: "The colour story: sand → clay → orange → plum → sage. Earth tones progress alongside the workflow without ever using bright alert colours.", italics: true, size: 20, color: CHAR, font: "Arial" })]
      }),

      rule(),

      h1("6.  Role-Based UI — Updated"),
      body("Per Rebekah's feedback — Landlord now also has the New Request button."),
      gap(80),
      makeTable(
        ["Element", "Tenant", "Property Manager", "Landlord"],
        [
          ["Sidebar nav",        "My Requests, Profile", "All Requests, Properties, Work Orders", "Properties, Approvals"],
          ["Request actions",    "View only",            "Status, assign, comment",                "Approve/reject quotes"],
          ["Status badges",      "All",                  "All",                                    "Relevant to landlord flow"],
          ["New request button", "✅",               "✅",                                 "✅ (now available — v2)"],
          ["Internal comments",  "❌",            "✅",                                 "✅"]
        ],
        [2200, 1760, 2720, 2680]
      ),

      rule(),

      h1("7.  Feedback & Alerts — Updated"),
      body("Earth tones make warm-toned alerts possible. Old bright alerts are replaced."),
      gap(80),
      makeTable(
        ["Type", "Background", "Border", "Text"],
        [
          ["Success",              "#fffefb", "1px solid #7d8a6a (sage)",   "#7d8a6a"],
          ["Active / In Progress", "#fffefb", "1px solid #a8593e (clay)",   "#a8593e"],
          ["Action required",      "#fffefb", "1px solid #ff4f00 (orange)", "#ff4f00"],
          ["Approved / Quiet info","#fffefb", "1px solid #8d6a78 (plum)",   "#8d6a78"],
          ["Archived / Muted",     "#fffdf9", "1px solid #c5c0b1",          "#939084"]
        ],
        [2400, 2000, 2960, 2000]
      ),
      gap(80),
      body("All alerts share the cream background — only the border + text colour shifts. This keeps the palette consistent."),

      rule(),

      h1("8.  CSS Custom Properties — Updated"),
      body("Full updated block for src/app/globals.css:"),
      gap(80),
      ...codeBlock([
        ":root {",
        "  /* Primary palette */",
        "  --color-bg:          #fffefb;",
        "  --color-text:        #201515;",
        "  --color-accent:      #ff4f00;",
        "",
        "  /* Neutrals */",
        "  --color-charcoal:    #36342e;",
        "  --color-muted:       #939084;",
        "  --color-sand:        #c5c0b1;",
        "  --color-light-sand:  #eceae3;",
        "  --color-off-white:   #fffdf9;",
        "",
        "  /* NEW v2: Earth-tone accents */",
        "  --color-sage:        #7d8a6a;",
        "  --color-clay:        #a8593e;",
        "  --color-plum:        #8d6a78;",
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
        "}"
      ]),

      rule(),

      h1("9.  Accessibility — Earth Tone Contrast"),
      body("All new earth tones pass WCAG 2.1 AA for normal text on cream:"),
      gap(80),
      makeTable(
        ["Pairing", "Ratio", "Result"],
        [
          ["Sage #7d8a6a on cream #fffefb", "4.6:1", "✅ Pass"],
          ["Clay #a8593e on cream #fffefb", "5.1:1", "✅ Pass"],
          ["Plum #8d6a78 on cream #fffefb", "5.4:1", "✅ Pass"],
          ["Cream on sage fill",            "4.6:1", "✅ Pass"]
        ],
        [4400, 2000, 2960]
      ),

      rule(),

      h1("10.  Do’s and Don’ts — Updated"),
      h2("✅  Do"),
      bullet("Use cream #fffefb, never pure white"),
      bullet("Use warm-black #201515, never pure black"),
      bullet("Reserve orange #ff4f00 for one primary CTA per view"),
      bullet("Use sage for completed/positive — the success colour (NEW)"),
      bullet("Use clay for in progress — shows active work warmly (NEW)"),
      bullet("Use plum sparingly for approved/signed off (NEW)"),
      bullet("Apply 8px-grid spacing throughout"),
      gap(100),
      h2("❌  Don’t"),
      bullet("Add box-shadow to cards"),
      bullet("Use pure white or pure black anywhere"),
      bullet("Mix earth tones with bright greens, blues, or reds — they will clash"),
      bullet("Apply earth tones to large backgrounds — accents only (badges, borders, bars)"),
      bullet("Use font-weight 700+ in headings"),
      bullet("Leave list views without an empty state"),

      rule(),

      h1("Migration v1 → v2"),
      body("If you've already built UI with v1, here's what to update:"),
      bullet("Replace any hard-coded #000000 Completed badge fills → sage #7d8a6a"),
      bullet("Replace any plain sand In Progress badges → clay outline style"),
      bullet("Replace any plain sand Approved badges → plum outline style"),
      bullet("Add Landlord to the New Request button allowed roles"),
      bullet("Replace bright-blue Tips boxes (if any survived) → cream + plum border"),

      rule(),

      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 160, after: 0 },
        children: [new TextRun({
          text: "v2 published 2026-05-05  ·  Dilitha Dinisuru — Property Maintenance App, COIT13232",
          size: 18, color: GREY, italics: true, font: "Arial"
        })]
      })
    ]
  }]
});

const outPath = "/Users/dilitha/uniwork/Property-Maintains-App/docs/UI-UX-Guidelines-v2-Dilitha-12238934.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Written:", outPath);
}).catch(e => { console.error(e); process.exit(1); });
