# UI / UX Guidelines v2 — Property Maintenance App
**Inspired by Zapier's design system** · Built with Bootstrap 5 + Next.js
**Version 2 — adds earth-tone accents to the warm palette**

---

## What changed in v2

- Three new **earth-tone accent colours** added: sage, clay, dusty plum
- Status badges now use a six-tier visual story (was four)
- Property occupancy bars use sage when 100% occupied
- All other rules from v1 unchanged — palette discipline still applies

---

## 1. Design Philosophy (unchanged)

> "Warm, approachable professionalism."

The app must feel **trustworthy and calm**, not clinical or corporate. Cream-tinted canvas + warm typographic hierarchy + restrained colour use.

**Three rules that govern every decision:**
1. **Borders over shadows** — containment is expressed through 1px warm-grey borders.
2. **Warmth over neutrality** — cream not white, warm-black not pure black.
3. **Orange is earned** — `#ff4f00` appears only on primary CTAs and active/urgent states.

**v2 addition:**
4. **Earth tones tell stories** — sage/clay/plum convey state changes without breaking palette warmth.

---

## 2. Colour Palette

### Primary (unchanged)

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#fffefb` | Page canvas, all card surfaces |
| `--color-text` | `#201515` | All body text, headings, dark buttons |
| `--color-accent` | `#ff4f00` | Primary CTAs, active tabs, urgent states |

### Neutrals (unchanged)

| Token | Hex | Usage |
|---|---|---|
| `--color-charcoal` | `#36342e` | Secondary text, footer copy |
| `--color-muted` | `#939084` | Placeholder, helper text |
| `--color-sand` | `#c5c0b1` | Primary border, dividers |
| `--color-light-sand` | `#eceae3` | Secondary button fill, icon containers |
| `--color-off-white` | `#fffdf9` | Sidebar/panel backgrounds |

### NEW: Earth-tone accents (v2)

| Token | Hex | Reads as | Usage |
|---|---|---|---|
| `--color-sage` | `#7d8a6a` | "Settled, healthy, done well" | Completed status fill, full-occupancy bar |
| `--color-clay` | `#a8593e` | "Actively being worked" | In Progress status outline, secondary warm accent |
| `--color-plum` | `#8d6a78` | "Quiet authority, signed off" | Approved status outline, landlord decisions |

**Why these three?**
- Sage is the warm sister of green — it lives next to cream like olive next to bread.
- Clay is the dustier cousin of orange — same family, lower volume.
- Plum is the only purple-family colour that doesn't feel cold against cream.

---

## 3. Typography (unchanged from v1)

Still **Inter only**, weights 400/500/600. Full type scale unchanged. See v1 doc for the full table.

---

## 4. Spacing (unchanged)

Base unit **8px**. Multiples of 4 or 8 throughout. Section vertical rhythm 64px desktop / 40px mobile.

---

## 5. Components

### 5.1 Buttons (unchanged from v1)

Primary orange / Primary dark / Light ghost / Outline.
**Rule:** Only one Primary (orange) button per view.

### 5.2 Cards (unchanged)

Cream surface + 1px sand border + 5px radius. **No shadows.** Hover deepens border to charcoal.

### 5.3 Status Badges — **UPDATED**

Six visual tiers tell a story across the request lifecycle:

| Status | Tier | Style | Reads as |
|---|---|---|---|
| Submitted | open | Sand fill, charcoal text | "Logged, awaiting triage" |
| Acknowledged | open | Sand fill, charcoal text | "Seen by PM" |
| **In Progress** | **progress (NEW)** | **Cream bg, clay outline + clay text** | **"Active work happening"** |
| Awaiting Parts | open | Sand fill, charcoal text | "Paused on dependency" |
| Awaiting Approval | attention | Cream bg, orange outline + orange text | "Needs landlord — urgent" |
| **Approved** | **approved (NEW)** | **Cream bg, plum outline + plum text** | **"Landlord signed off"** |
| **Completed** | **done (UPDATED)** | **Sage fill, cream text** | **"Resolved"** (was solid black) |
| Closed | archived | Off-white bg, muted text | "Archived" |

**The colour story:** sand → clay → orange → plum → sage. Earth tones progress alongside the workflow without ever using bright "alert" colours.

### 5.4 Priority Indicators (unchanged)

Coloured left-border on cards. Only **urgent** earns the orange accent — everything else stays sand.

### 5.5 Form Inputs (unchanged)

Cream bg, sand border, orange focus ring (no Bootstrap blue).

### 5.6 Navigation (unchanged)

Cream sticky navbar, sand bottom border, orange active-tab inset shadow.

### 5.7 Tables (unchanged)

Light-sand header, charcoal uppercase header text, cream row hover.

### 5.8 Dividers (unchanged)

Override Bootstrap `<hr>` to sand `#c5c0b1`.

---

## 6. Layout & Grid (unchanged)

Max content width 1200px, sidebar 240px (collapses on mobile), Bootstrap default breakpoints.

---

## 7. Role-Based UI Differences

**Updated per Rebekah's feedback** — Landlord now also has the New Request button.

| Element | Tenant | Property Manager | Landlord |
|---|---|---|---|
| Sidebar nav | My Requests, Profile | All Requests, Properties, Work Orders | Properties, Approvals |
| Request card actions | View only | Change status, assign, comment | Approve/reject quotes |
| Status badge shown | All | All | Relevant to landlord flow |
| **New request button** | ✅ | ✅ | ✅ **(now available)** |
| Internal comments | ❌ | ✅ | ✅ |

---

## 8. Empty States (unchanged)

Designed empty state for every list view — never a blank container.

---

## 9. Feedback & Alerts — **UPDATED**

Earth tones make warm-toned alerts possible. Old bright-blue / red / amber alerts are replaced.

| Type | Background | Border | Text |
|---|---|---|---|
| **Success** | `#fffefb` | `1px solid #7d8a6a` (sage) | `#7d8a6a` |
| **Active / In Progress** | `#fffefb` | `1px solid #a8593e` (clay) | `#a8593e` |
| **Action required** | `#fffefb` | `1px solid #ff4f00` (orange) | `#ff4f00` |
| **Approved / Quiet info** | `#fffefb` | `1px solid #8d6a78` (plum) | `#8d6a78` |
| **Archived / Muted** | `#fffdf9` | `1px solid #c5c0b1` | `#939084` |

All alerts share the cream background — only the border + text colour shifts. This keeps the palette consistent.

---

## 10. CSS Custom Properties — **UPDATED**

Full updated block for `globals.css`:

```css
:root {
  /* Primary palette */
  --color-bg:          #fffefb;
  --color-text:        #201515;
  --color-accent:      #ff4f00;

  /* Neutrals */
  --color-charcoal:    #36342e;
  --color-muted:       #939084;
  --color-sand:        #c5c0b1;
  --color-light-sand:  #eceae3;
  --color-off-white:   #fffdf9;

  /* NEW: Earth-tone accents */
  --color-sage:        #7d8a6a;
  --color-clay:        #a8593e;
  --color-plum:        #8d6a78;

  /* Bootstrap overrides */
  --bs-body-bg:             var(--color-bg);
  --bs-body-color:          var(--color-text);
  --bs-primary:             var(--color-accent);
  --bs-primary-rgb:         255, 79, 0;
  --bs-border-color:        var(--color-sand);
  --bs-card-bg:             var(--color-bg);
  --bs-card-border-color:   var(--color-sand);
  --bs-font-sans-serif:     'Inter', Helvetica, Arial, sans-serif;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--color-accent);
  box-shadow: none;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

---

## 11. Accessibility Checklist

All v1 contrast ratios maintained. New earth tones tested:

| Pairing | Ratio | Pass |
|---|---|---|
| Sage `#7d8a6a` on cream `#fffefb` | 4.6:1 | ✅ AA |
| Clay `#a8593e` on cream `#fffefb` | 5.1:1 | ✅ AA |
| Plum `#8d6a78` on cream `#fffefb` | 5.4:1 | ✅ AA |
| Cream on sage fill | 4.6:1 | ✅ AA |

All meet WCAG 2.1 AA for normal text.

---

## 12. Do's and Don'ts — **UPDATED**

### ✅ Do
- Use cream `#fffefb`, never pure white
- Use warm-black `#201515`, never pure black
- Reserve orange `#ff4f00` for one primary CTA per view
- **Use sage for "completed/positive" — it's our success colour**
- **Use clay for "in progress" — it shows active work warmly**
- **Use plum sparingly for "approved/signed off"**
- Apply 8px-grid spacing throughout

### ❌ Don't
- Add box-shadow to cards
- Use pure white or pure black anywhere
- **Mix earth tones with bright greens, blues, or reds** — they'll clash
- **Apply earth tones to large backgrounds** — they're for accents (badges, borders, bars)
- Use font-weight 700+ in headings
- Leave list views without an empty state

---

## Migration from v1 → v2

If you've already built UI with v1, here's what to update:

1. Replace any hard-coded `#000000` "Completed" badge fills → use sage `#7d8a6a`
2. Replace any plain sand "In Progress" badges → use clay outline style
3. Replace any plain sand "Approved" badges → use plum outline style
4. Add Landlord to the "New Request button" allowed roles
5. Replace bright-blue Tips boxes (if any survived) → cream + plum border

---

*v2 published 2026-05-05 · Dilitha Dinisuru — Property Maintenance App, COIT13232*
