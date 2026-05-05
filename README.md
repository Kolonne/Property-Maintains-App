# Property-Maintains-App

**COIT13232 Group Project — Rental Maintenance Management Application**

A web-based prototype for managing rental property inspections and maintenance requests, with role-based access for tenants, property managers, and landlords.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Database:** PostgreSQL (hosted on [Neon](https://neon.tech))
- **Styling:** Bootstrap 5
- **DB Driver:** `@neondatabase/serverless`
- **Linting:** ESLint

## Prerequisites

- **Node.js** 20 or newer (`node --version`)
- **npm** 10 or newer
- **Git**
- A **Neon** Postgres connection string (ask Dilitha)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Kolonne/Property-Maintains-App.git
cd Property-Maintains-App
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the template and paste in the real Neon connection string (shared by Dilitha in the team chat):

```bash
cp .env.example .env.local
```

Then edit `.env.local` and replace the placeholder `DATABASE_URL` with the real value.

> **Never commit `.env.local`.** It is gitignored. Only `.env.example` (the template) is tracked.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Verify the database connection

Visit [http://localhost:3000/api/health](http://localhost:3000/api/health). You should see:

```json
{ "ok": true, "now": "2026-04-26T..." }
```

If you see `"ok": false`, your `DATABASE_URL` is wrong or the network is blocked.

## Project Structure

```
.
├── db/                                  # Database files for the project
│   ├── schema.sql                       # Source of truth for the database schema
│   ├── seed.sql                         # Sample/mock data for development and testing
│   └── README.md                        # Instructions for applying schema/seed data to Neon
│
├── docs/                                # Project documentation and supporting files
│
├── public/                              # Static assets such as images, icons, and logos
│
├── scripts/                             # Helper scripts used for setup, seeding, or development tasks
│
├── src/
│   ├── app/                             # Next.js App Router pages and API routes
│   │   ├── (public)/                    # Public-facing pages; does not appear in the URL
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Login page: /login
│   │   │   ├── layout.tsx               # Layout/header used for public pages
│   │   │   └── page.tsx                 # Public home/landing page: /
│   │   │
│   │   ├── (protected)/                 # Logged-in app pages; does not appear in the URL
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx             # Role-based dashboard page: /dashboard
│   │   │   │
│   │   │   ├── maintenance/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx         # Individual maintenance request detail page: /maintenance/123
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx         # Create new maintenance request page: /maintenance/new
│   │   │   │   └── page.tsx             # Maintenance request list page: /maintenance
│   │   │   │
│   │   │   ├── properties/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx         # Individual property detail page: /properties/123
│   │   │   │   └── page.tsx             # Property list page: /properties
│   │   │   │
│   │   │   └── layout.tsx               # Layout/header used for logged-in pages
│   │   │
│   │   ├── api/
│   │   │   └── health/
│   │   │       └── route.ts             # Database/API health check endpoint: /api/health
│   │   │
│   │   ├── favicon.ico                  # Browser tab icon
│   │   ├── globals.css                  # Global styles used across the app
│   │   └── layout.tsx                   # Root layout; loads global styles/providers
│   │
│   ├── components/                      # Reusable UI components used by app pages
│   │   ├── dashboard/
│   │   │   ├── LandlordDashboard.tsx        # Dashboard view shown for landlord users
│   │   │   ├── PropertyManagerDashboard.tsx # Dashboard view shown for property manager users
│   │   │   └── TenantDashboard.tsx          # Dashboard view shown for tenant users
│   │   │
│   │   ├── layout/
│   │   │   ├── ProtectedAppNav.tsx       # Navigation/header used on logged-in app pages
│   │   │   └── PublicAppNav.tsx          # Navigation/header used on public pages
│   │   │
│   │   ├── maintenance/
│   │   │   ├── MaintenanceDetail.tsx     # Detail view for a single maintenance request. URL: /maintenance/123
│   │   │   ├── MaintenanceFilters.tsx    # Role-aware filters for the maintenance list
│   │   │   ├── MaintenanceForm.tsx       # Form for creating or editing maintenance requests
│   │   │   ├── MaintenanceList.tsx       # General list component for maintenance requests
│   │   │   ├── MaintenancePageClient.tsx # Main role-aware maintenance page UI and filter state
│   │   │   ├── MaintenanceRowActions.tsx # Role-specific row buttons, e.g. View, Assign, Approve, Reject
│   │   │   ├── MaintenanceTable.tsx      # Role-aware maintenance request table
│   │   │   ├── RequestDiscussion.tsx     # Role-aware discussion/notes section for a request
│   │   │   └── StatusBadge.tsx           # Reusable badge for request status labels
│   │   │
│   │   ├── properties/
│   │   │   ├── PropertyCard.tsx          # Summary card or row for one property
│   │   │   ├── PropertyDetail.tsx        # Detail view for one property
│   │   │   └── PropertyList.tsx          # List of properties visible to the current user
│   │   │
│   │   └── shared/
│   │       └── EmptyState.tsx            # Reusable message shown when no data is available
│   │
│   ├── context/
│   │   └── UserContext.tsx               # Temporary mock current-user provider and role switcher
│   │
│   └── lib/
│       ├── db.ts                        # Neon Postgres client helper
│       ├── permissions.ts               # Role/action permission rules
│       └── types.ts                     # Shared TypeScript types and database row interfaces
│
├── .env.example                         # Environment variable template; safe to commit
├── .env.local                           # Real local environment variables; must not be committed
├── .gitignore                           # Files/folders Git should ignore
├── README.md                            # Project setup, structure, and development notes
└── tsconfig.json                        # TypeScript configuration
```

### Routing Notes

This project uses the Next.js App Router. Folders inside `src/app` define website routes.

Folders wrapped in parentheses, such as `(public)` and `(protected)`, are route groups. They help organise pages and apply different layouts, but they do not appear in the URL.

For example:

- `src/app/(public)/page.tsx` becomes `/`
- `src/app/(public)/login/page.tsx` becomes `/login`
- `src/app/(protected)/dashboard/page.tsx` becomes `/dashboard`
- `src/app/(protected)/maintenance/new/page.tsx` becomes `/maintenance/new`
- `src/app/(protected)/maintenance/[id]/page.tsx` becomes `/maintenance/123`

The app uses feature-based routing rather than role-based routing. Tenants, property managers, and landlords all use the same core routes, such as `/dashboard`, `/maintenance`, and `/properties`. The page content changes depending on the current user's role.

### Current Authentication/Permission Notes

Authentication is currently mocked for prototype development and convenient role switching for quick testing. 

`UserContext.tsx` stores the active mock user and allows switching between tenant, property manager, and landlord views. This lets the team test role-based UI behaviour before real login/session handling is implemented.

Role permissions are defined in `lib/permissions.ts`. Pages and components should use these permission helpers to decide which actions a user can see or perform, such as viewing maintenance requests, creating a request, updating a status, or approving a repair.

## Database

See [`db/README.md`](db/README.md) for the schema, seed data, and how to apply them to Neon.

## Querying the Database

Import `getSql` from `@/lib/db` and use template-literal SQL:

```ts
import { getSql } from "@/lib/db";

const sql = getSql();
const users = await sql`SELECT id, email FROM users WHERE role = ${"tenant"}`;
```

Template literals automatically parameterize values — safe against SQL injection.

## Available Scripts

| Command         | Purpose                          |
| --------------- | -------------------------------- |
| `npm run dev`   | Start dev server with hot reload |
| `npm run build` | Build for production             |
| `npm run start` | Start the built production app   |
| `npm run lint`  | Run ESLint                       |

## Branch Workflow

- **`main`** — protected, only merged via PR after review
- **`feature/<short-description>`** — create one branch per task

```bash
git checkout -b feature/auth-login-page
# ...make changes...
git add .
git commit -m "feat: add login page"
git push -u origin feature/auth-login-page
# Then open a PR on GitHub
```

## Team

| Name                            | Role                                     |
| ------------------------------- | ---------------------------------------- |
| Rebekah Coleman                 | Project lead, deliverable coordination   |
| Isuri Amandhi                   | Front-end & UI/UX                        |
| Md Imam Hossan Hemel            | Front-end + back-end                     |
| Dilitha Dinisuru                | Database, back-end, QA, risk management  |

## Course Info

- **Unit:** COIT13232
- **Facilitator:** Dr. Ahsan Morshed
- **Institution:** CQUniversity
