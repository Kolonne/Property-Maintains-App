# UI / UX Guidelines — Property Maintenance App
**Inspired by Zapier's design system** · Built with Bootstrap 5 + Next.js

---

## 1. Design Philosophy

> "Warm, approachable professionalism."

This app is used by real people dealing with real problems — a leaking tap, a broken heater, an urgent repair. The UI must feel **trustworthy and calm**, not clinical or corporate. We achieve this through a cream-tinted canvas, warm typographic hierarchy, and a restrained use of colour that makes the orange accent feel meaningful when it appears.

**Three rules that govern every decision:**
1. **Borders over shadows** — containment is expressed through 1px warm-grey borders, never drop-shadows.
2. **Warmth over neutrality** — cream (`#fffefb`) not white, warm-black (`#201515`) not pure black.
3. **Orange is earned** — `#ff4f00` appears only on primary CTAs and active states. Never scatter it.

---

## 2. Colour Palette

### Primary

| Token | Hex | Bootstrap override | Usage |
|---|---|---|---|
| `--color-bg` | `#fffefb` | body background, card background | Page canvas, all card surfaces |
| `--color-text` | `#201515` | `--bs-body-color` | All body text, headings, dark buttons |
| `--color-accent` | `#ff4f00` | `--bs-primary` | Primary CTAs, active tabs, focus rings |

### Neutrals

| Token | Hex | Usage |
|---|---|---|
| `--color-charcoal` | `#36342e` | Secondary text, footer copy, strong borders |
| `--color-muted` | `#939084` | Placeholder text, disabled labels, helper text |
| `--color-sand` | `#c5c0b1` | Primary border, hover backgrounds, dividers |
| `--color-light-sand` | `#eceae3` | Secondary button fill, card inner surfaces |
| `--color-off-white` | `#fffdf9` | Sidebar/panel backgrounds |

### Status Colours (maintenance-specific)

| Status | Colour | Hex | Note |
|---|---|---|---|
| Submitted | Blue | `#3b82f6` | Neutral information |
| Acknowledged | Indigo | `#6366f1` | Seen, not yet actioned |
| In Progress | Amber | `#f59e0b` | Active work |
| Awaiting Parts | Orange-muted | `#ea580c` | Blocked — warm but different from accent |
| Awaiting Approval | Purple | `#9333ea` | Landlord decision pending |
| Landlord Approved | Teal | `#0d9488` | Approved, ready to proceed |
| Completed | Green | `#22c55e` | Done |
| Closed | Sand | `#939084` | Archived |

> **Rule:** Status colours appear only in badges/pills. They never bleed into backgrounds or large elements.

---

## 3. Typography

### Font Stack

```css
/* Primary — all UI */
font-family: 'Inter', Helvetica, Arial, sans-serif;

/* Google Fonts import (add to layout.tsx) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
```

We use only **Inter** (no display or editorial fonts) — it's clean, readable, and free. Degular Display and GT Alpina from the Zapier reference are proprietary; Inter covers all our needs.

### Type Scale

| Role | Size | Weight | Line Height | Letter Spacing | Bootstrap class |
|---|---|---|---|---|---|
| Page title (H1) | 36px | 500 | 1.1 | −0.5px | `fs-2 fw-medium` |
| Section heading (H2) | 28px | 500 | 1.2 | normal | `fs-3 fw-medium` |
| Card title (H3) | 20px | 600 | 1.2 | −0.3px | `fs-5 fw-semibold` |
| Sub-heading (H4) | 16px | 600 | 1.25 | normal | `fs-6 fw-semibold` |
| Body | 16px | 400 | 1.5 | −0.1px | (default) |
| Body emphasis | 16px | 600 | 1.5 | normal | `fw-semibold` |
| Caption / helper | 14px | 500 | 1.4 | normal | `small fw-medium` |
| Micro label | 12px | 600 | 1.3 | +0.5px | `text-uppercase` |
| Button | 16px | 600 | 1 | normal | `btn` |
| Button small | 14px | 600 | 1 | normal | `btn btn-sm` |

### Typography Rules

- **Micro labels** (section tags, status category labels): uppercase + 0.5px letter-spacing only
- **Headings**: weight 500 (medium), not bold — warmth not aggression
- **Never** use weight 700+ (bold) in headings
- **Body text**: `#201515` on `#fffefb` — do not use pure black on pure white

---

## 4. Spacing

**Base unit: 8px.** All padding, margin, and gap values are multiples of 4 or 8.

| Name | Value | Bootstrap utility |
|---|---|---|
| XS | 4px | `p-1` / `m-1` |
| SM | 8px | `p-2` / `m-2` |
| MD | 16px | `p-3` / `m-3` |
| LG | 24px | `p-4` / `m-4` (+ `gap-3`) |
| XL | 32px | `p-5` (partial) |
| 2XL | 48px | custom `py-6` |
| 3XL | 64px | custom `py-8` |

**Section vertical rhythm:** 64px top/bottom on desktop, 40px on mobile.

---

## 5. Components

### 5.1 Buttons

| Variant | When to use | Style |
|---|---|---|
| **Primary (orange)** | Single main action per view — "Submit Request", "Save Changes" | `#ff4f00` bg, `#fffefb` text, 4px radius, `1px solid #ff4f00` |
| **Primary (dark)** | Destructive confirm, secondary page action | `#201515` bg, `#fffefb` text, 8px radius |
| **Light / Ghost** | Cancel, secondary options | `#eceae3` bg, `#36342e` text, 8px radius, `1px solid #c5c0b1` |
| **Outline** | Tertiary, filter buttons | Transparent bg, `#201515` text, `1px solid #c5c0b1` |

**Padding:**
- Standard: `8px 16px`
- Large CTA (hero, empty state): `12px 24px`

**Rules:**
- Only one Primary (orange) button per view
- Buttons use 4–8px border-radius only — **no pill shapes** on primaries
- Hover states: shift border/bg to `#c5c0b1` sand — no harsh colour jumps

```html
<!-- Primary Orange -->
<button class="btn" style="background:#ff4f00; color:#fffefb; border:1px solid #ff4f00; border-radius:4px; font-weight:600;">
  Submit Request
</button>

<!-- Light Ghost -->
<button class="btn" style="background:#eceae3; color:#36342e; border:1px solid #c5c0b1; border-radius:8px; font-weight:600;">
  Cancel
</button>
```

---

### 5.2 Cards

Cards are the primary layout container for maintenance requests, property listings, and dashboards.

```
┌─────────────────────────────────────────┐  ← 1px solid #c5c0b1
│  Card Title                    [Badge]  │
│  ─────────────────────────────────────  │  ← 1px solid #eceae3 (internal divider)
│  Body content, description, metadata   │
│                                         │
│                          [Action btn]   │
└─────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Background | `#fffefb` |
| Border | `1px solid #c5c0b1` |
| Border radius | `5px` (standard), `8px` (featured/hero card) |
| Box shadow | **None** |
| Padding | `20px 24px` |
| Hover | border-color → `#36342e` |

```html
<div class="card border-0 p-4" style="background:#fffefb; border:1px solid #c5c0b1 !important; border-radius:5px;">
  <div class="card-body p-0">
    <!-- content -->
  </div>
</div>
```

---

### 5.3 Status Badges

Status badges sit on maintenance request cards and list rows.

```html
<!-- submitted -->
<span class="badge rounded-pill" style="background:#eff6ff; color:#3b82f6; border:1px solid #bfdbfe; font-size:12px; font-weight:600; letter-spacing:0.3px; text-transform:uppercase;">
  Submitted
</span>
```

| Status | Badge bg | Badge text | Border |
|---|---|---|---|
| submitted | `#eff6ff` | `#3b82f6` | `#bfdbfe` |
| acknowledged | `#eef2ff` | `#6366f1` | `#c7d2fe` |
| in_progress | `#fffbeb` | `#f59e0b` | `#fde68a` |
| awaiting_parts | `#fff7ed` | `#ea580c` | `#fed7aa` |
| awaiting_landlord_approval | `#faf5ff` | `#9333ea` | `#e9d5ff` |
| landlord_approved | `#f0fdfa` | `#0d9488` | `#99f6e4` |
| completed | `#f0fdf4` | `#22c55e` | `#bbf7d0` |
| closed | `#f5f5f4` | `#939084` | `#e7e5e4` |

---

### 5.4 Priority Indicators

Priority uses a coloured left-border on the card, not a badge.

| Priority | Left border | Dot colour |
|---|---|---|
| low | `3px solid #22c55e` | green |
| medium | `3px solid #f59e0b` | amber |
| high | `3px solid #ea580c` | orange |
| urgent | `3px solid #ef4444` | red |

```html
<div class="card" style="border-left: 3px solid #ef4444; border-radius:5px; ...">
  <!-- urgent request card -->
</div>
```

---

### 5.5 Form Inputs

```html
<input type="text" class="form-control"
  style="background:#fffefb; border:1px solid #c5c0b1; border-radius:5px; color:#201515;"
  placeholder="Describe the issue...">
```

| Property | Value |
|---|---|
| Background | `#fffefb` |
| Border | `1px solid #c5c0b1` |
| Border radius | `5px` |
| Text | `#201515` |
| Placeholder | `#939084` |
| Focus border | `1px solid #ff4f00` |
| Focus ring | none (remove Bootstrap's default) |

**Override Bootstrap's blue focus ring:**
```css
.form-control:focus {
  border-color: #ff4f00;
  box-shadow: none;
}
```

---

### 5.6 Navigation

```
┌──────────────────────────────────────────────────────────┐
│ 🏠 PropMaintain          Dashboard  Requests  Properties  [New Request] │
└──────────────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Background | `#fffefb` (sticky) |
| Border bottom | `1px solid #c5c0b1` |
| Link colour | `#201515`, weight 500 |
| Active tab indicator | `box-shadow: #ff4f00 0px -3px 0px 0px inset` |
| Hover tab indicator | `box-shadow: #c5c0b1 0px -3px 0px 0px inset` |
| CTA button | Orange primary, 4px radius |

---

### 5.7 Tables (Maintenance Request Lists)

| Property | Value |
|---|---|
| Header bg | `#eceae3` |
| Header text | `#36342e`, weight 600, uppercase, 12px |
| Row border | `1px solid #eceae3` |
| Row hover | `background: #fffdf9` |
| Selected row | `background: #fff7ed; border-left: 3px solid #ff4f00` |

---

### 5.8 Dividers

```html
<hr style="border-color: #c5c0b1; margin: 24px 0;">
```
Never use Bootstrap's default `<hr>` without overriding border-color to `#c5c0b1`.

---

## 6. Layout & Grid

### Page structure

```
┌──────────────── Navbar (sticky, 64px) ────────────────┐
├────────────── Sidebar (240px) │ Main Content ──────────┤
│  Nav links                    │                        │
│  User info                    │  Page title            │
│  Role badge                   │  ─────────────         │
│                               │  Cards / Table         │
│                               │                        │
└───────────────────────────────┴────────────────────────┘
```

- **Max content width:** 1200px, centred
- **Sidebar:** 240px fixed on desktop, collapses to hamburger on mobile
- **Main padding:** 32px on desktop, 16px on mobile
- **Card grid:** Bootstrap `row g-3` (24px gap)
- **Section spacing:** 48px between major sections

### Responsive breakpoints (Bootstrap defaults map well)

| Bootstrap | Width | Behaviour |
|---|---|---|
| `xs` | <576px | Single column, sidebar hidden |
| `sm` | ≥576px | Single column, sidebar toggle |
| `md` | ≥768px | Sidebar appears |
| `lg` | ≥992px | Full two-column layout |
| `xl` | ≥1200px | Comfortable content width |

---

## 7. Role-based UI Differences

The same components appear for all roles; the **content** changes.

| Element | Tenant | Property Manager | Landlord |
|---|---|---|---|
| Sidebar nav | My Requests, Profile | All Requests, Properties, Work Orders | Properties, Approvals |
| Request card actions | View only | Change status, assign, comment | Approve/reject quotes |
| Status badge shown | All | All | Relevant to landlord flow |
| New request button | ✅ (orange, prominent) | ✅ (on behalf of tenant) | ❌ (hidden) |
| Internal comments | ❌ (hidden) | ✅ | ✅ |

---

## 8. Empty States

Every list view must have a designed empty state — no blank white boxes.

```
     ┌──────────────────────────────┐
     │                              │
     │    🔧  (icon, 48px)         │
     │                              │
     │    No maintenance requests   │
     │    yet.                      │
     │                              │
     │    [Submit your first one]   │  ← orange button
     │                              │
     └──────────────────────────────┘
```

- Icon: relevant to context, `#c5c0b1` colour
- Heading: Inter 20px, weight 500, `#201515`
- Sub-text: 16px, `#939084`
- CTA: only when the user can take action from here

---

## 9. Feedback & Alerts

Bootstrap alerts, overridden to match the warm palette.

| Type | Background | Border | Text |
|---|---|---|---|
| Success | `#f0fdf4` | `1px solid #bbf7d0` | `#166534` |
| Warning | `#fffbeb` | `1px solid #fde68a` | `#92400e` |
| Error | `#fef2f2` | `1px solid #fecaca` | `#991b1b` |
| Info | `#eff6ff` | `1px solid #bfdbfe` | `#1e40af` |

Toast notifications: appear bottom-right, auto-dismiss after 4s, same colour system.

---

## 10. CSS Custom Properties Bootstrap Override

Add this to `src/app/globals.css` or a `theme.css` imported in `layout.tsx`:

```css
:root {
  /* Colour tokens */
  --color-bg:          #fffefb;
  --color-text:        #201515;
  --color-accent:      #ff4f00;
  --color-charcoal:    #36342e;
  --color-muted:       #939084;
  --color-sand:        #c5c0b1;
  --color-light-sand:  #eceae3;
  --color-off-white:   #fffdf9;

  /* Bootstrap overrides */
  --bs-body-bg:        var(--color-bg);
  --bs-body-color:     var(--color-text);
  --bs-primary:        var(--color-accent);
  --bs-primary-rgb:    255, 79, 0;
  --bs-border-color:   var(--color-sand);
  --bs-card-bg:        var(--color-bg);
  --bs-card-border-color: var(--color-sand);
  --bs-font-sans-serif: 'Inter', Helvetica, Arial, sans-serif;

  /* Spacing */
  --section-pad-y:     64px;
}

/* Reset Bootstrap's blue focus */
.form-control:focus,
.form-select:focus {
  border-color: var(--color-accent);
  box-shadow: none;
}

/* Warm body */
body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

---

## 11. Accessibility Checklist

- [ ] Minimum contrast ratio 4.5:1 for body text (`#201515` on `#fffefb` = ✅ 14.7:1)
- [ ] Focus states visible on all interactive elements (orange outline)
- [ ] Status badges use text labels, not colour alone
- [ ] Priority indicators use text ("Urgent") not colour alone
- [ ] All images have `alt` text
- [ ] Form inputs have associated `<label>` elements
- [ ] Buttons have descriptive text (not just icons)
- [ ] Touch targets ≥ 44×44px on mobile

---

## 12. Do's and Don'ts

### ✅ Do
- Use `#fffefb` (cream) — never pure `#ffffff`
- Use `#201515` (warm black) — never pure `#000000`
- Express depth with `1px solid #c5c0b1` borders
- Reserve `#ff4f00` for one primary CTA per view
- Use uppercase + `0.5px` letter-spacing for micro labels only
- Keep Inter weight ≤ 600 (semibold)
- Apply 8px-grid spacing throughout

### ❌ Don't
- Add box-shadow to cards
- Scatter orange across the UI
- Use pure white or pure black anywhere
- Apply `border-radius: 9999px` to primary buttons
- Use font-weight 700+ (bold) in headings
- Mix status colours into backgrounds
- Leave list views without an empty state

---

*Last updated: 2026-05-05 · Dilitha Dinisuru — Property Maintenance App, COIT13232*
