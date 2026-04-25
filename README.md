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
├── db/
│   ├── schema.sql                  # Source of truth for the DB schema
│   ├── seed.sql                    # Sample data for development
│   └── README.md                   # How to run schema/seed against Neon
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── health/route.ts    # DB sanity-check endpoint
│   │   ├── layout.tsx              # Root layout (loads Bootstrap CSS)
│   │   └── page.tsx                # Home page
│   └── lib/
│       ├── db.ts                   # Neon Postgres client (use getSql())
│       └── types.ts                # TypeScript interfaces for DB rows
├── public/                         # Static assets
├── .env.example                    # Env template (commit this)
├── .env.local                      # Real secrets (gitignored)
└── package.json
```

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
