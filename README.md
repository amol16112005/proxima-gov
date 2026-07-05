# Proxima Gov

**Bridging citizens and Lok Sabha representatives through transparent, accountable, AI-assisted digital governance.**

Proxima Gov is a citizen-first digital governance platform for **Lok Sabha constituencies** in India. It closes the loop between residents who report local development problems and Members of Parliament who approve, execute, and are held accountable for constituency work — especially projects funded through **MPLADS** (Members of Parliament Local Area Development Scheme) and related central/local channels.

The name **Proxima** reflects *proximity*: bringing government closer to the people through real-time visibility, structured workflows, and measurable outcomes — not a distant grievance box, but an end-to-end governance lifecycle.

---

## Documentation

| Document | Description |
|----------|-------------|
| **[README.md](README.md)** | Overview, quick start, features (this file) |
| **[SETUP.md](SETUP.md)** | Install, environment, MongoDB, troubleshooting |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design, auth, storage, layers |
| **[CONSTRUCTION.md](CONSTRUCTION.md)** | Folder layout, conventions, how to extend |
| **[LIFECYCLE.md](LIFECYCLE.md)** | Issue stages, MP actions, AI triage flow |
| **[API.md](API.md)** | REST API reference |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Production hosting and security checklist |
| **[DEVELOPER_MP_CREDENTIALS.md](DEVELOPER_MP_CREDENTIALS.md)** | Demo MP usernames & PINs |
| **[/faq](http://localhost:3000/faq)** | End-user FAQ (runtime page) |

---

## Table of Contents

- [Documentation](#documentation)
- [What Proxima Gov Stands For](#what-proxima-gov-stands-for)
- [Who It Is For](#who-it-is-for)
- [Core Capabilities](#core-capabilities)
- [Governance Lifecycle](#governance-lifecycle)
- [AI Issue Screening](#ai-issue-screening)
- [Portals Overview](#portals-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Data Persistence](#data-persistence)
- [Demo Credentials](#demo-credentials)
- [Scripts & Commands](#scripts--commands)
- [API Overview](#api-overview)
- [FAQs](#faqs)
- [Troubleshooting](#troubleshooting)
- [Disclaimer](#disclaimer)

---

## What Proxima Gov Stands For

| Principle | Meaning on this platform |
|-----------|--------------------------|
| **Transparency** | Budgets, timelines, progress photos, and stage updates are visible to citizens and the public. |
| **Accountability** | MPs act on citizen-verified work; disputed completions trigger review and contractor/officer accountability. |
| **Proximity** | Constituency-scoped access — citizens see *their* MP, *their* seat, and *their* local issues. |
| **Security** | OTP-based citizen auth; separate MP portal with constituency username + PIN. |
| **Intelligence** | AI triages issues for jurisdiction and priority before they reach an MP's desk. |

Proxima Gov is framed as a **Digital India / Lok Sabha** initiative demo (FY 2026–27) for hackathons, judging, and local development — not a production government deployment without further hardening.

---

## Who It Is For

### Citizens (residents of a Lok Sabha constituency)

- Register with mobile OTP and select a constituency
- Track MPLADS and government projects in their area
- Submit **community development issues** (roads, water, schools, health centres, etc.)
- Receive notifications and an activity audit trail
- Verify completed work and flag unsatisfactory outcomes

### Members of Parliament (Lok Sabha)

- Log in to a **constituency-scoped dashboard** (one seat = one account)
- Approve AI-triaged issues, assign contractors, release tenders
- Upload **mandatory progress and completion photos**
- Review citizen feedback and take accountability actions (closure, reopen, escalate, re-inspect)

### Public / researchers / judges

- Browse the **Transparency Dashboard** for cross-constituency project visibility
- Read **FAQs** at `/faq` for portal behaviour and common confusions

---

## Core Capabilities

### Citizen Portal (`/citizen/*`)

- Registration and OTP login
- Dashboard with constituency projects, MPLADS summaries, and MP profile
- Issue submission with AI jurisdiction scan
- Grievance filing with AI-assisted department routing
- Notifications, activity history, and profile (including constituency change)

### MP Portal (`/mp/*`)

- PIN-secured login per parliamentary seat
- Pending approvals queue (eligible issues only)
- Per-issue actions: approve → assign → tender → start work → progress → photos → citizen verification → MP review → impact
- Delay alerts and constituency-wide issue tracker

### Transparency (`/transparency`)

- Public view of active lifecycle issues and government project cards
- Constituency map with issue counts

### AI & Data Integrations

- **Issue triage** — constituency reach and MP mandate checks before MP dashboard
- **Gemini AI** — grievance acknowledgement and routing (when `NEXT_PUBLIC_GEMINI_API_KEY` is set)
- **data.gov.in** — live MPLADS / scheme project enrichment (when `DATAGOVINDIA_API_KEY` is set)

---

## Governance Lifecycle

Every eligible **Issue** follows a closed loop:

```
Submit → AI Analysis → MP Approval → Work Assigned → Tender Released
  → Work Started → In Progress (photos) → Citizen Verification
  → MP Review & Accountability → Completed → Impact Analysis
```

**Grievances** are a separate, faster channel: structured complaints with AI-assisted responses — they do not replace the full MPLADS execution tracker used by Issues.

---

## AI Issue Screening

When a citizen submits an issue, AI runs **before** the MP sees it:

| Verdict | Examples | What happens |
|---------|----------|--------------|
| **Eligible** | Local road, water, school infra in registered constituency | Forwarded to MP dashboard |
| **Out of constituency** | Location names another Lok Sabha seat | Declined; citizen told to contact that seat's MP |
| **Wrong authority** | Police FIR, electricity bill, municipal tax | Declined; referred to state/local body |
| **Not MP mandate** | Passport, income tax, personal job plea | Declined; referred to correct ministry/portal |

Declined issues:

- **Do not appear** on the MP dashboard
- Remain visible to the citizen under **My Issues** with status *Not Taken Up — Referred Elsewhere*
- Trigger **automated notifications** with explanation and suggested authority

---

## Portals Overview

| Portal | URL | Auth |
|--------|-----|------|
| Home | `/` | Public |
| FAQs | `/faq` | Public |
| Citizen Register | `/citizen/register` | OTP |
| Citizen Login | `/citizen/login` | OTP |
| Citizen Dashboard | `/citizen/dashboard` | Session |
| Submit Issue | `/citizen/issues/new` | Session |
| MP Login | `/mp/login` | Username + 6-digit PIN |
| MP Dashboard | `/mp/dashboard` | Session |
| Transparency | `/transparency` | Public |

**Important:** Citizen and MP portals use **separate sessions**. Only one can be active at a time — log out before switching portals.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI | React 19, CSS Modules |
| Language | TypeScript |
| Persistence | SQLite (default) or MongoDB Atlas |
| AI | Google Gemini (`@google/generative-ai`) |
| Open data | data.gov.in APIs |
| Auth | HMAC-signed session cookies; OTP (demo); MP PIN |

---

## Project Structure

```
proxima-gov/
├── app/                    # Next.js routes (pages + API entry points)
│   ├── citizen/            # Citizen portal pages
│   ├── mp/                 # MP portal pages
│   ├── transparency/       # Public transparency pages
│   ├── faq/                # FAQ page
│   └── api/                # REST API routes
├── frontend/
│   ├── components/         # React UI (auth, lifecycle, MP actions, FAQ)
│   ├── context/            # React context providers
│   ├── lib/                # Client utilities (e.g. image upload)
│   └── styles/             # Global and shared CSS modules
├── backend/
│   ├── data/               # Constituencies, seed issues, FAQs, types
│   └── lib/                # Business logic, auth, cloud storage, AI triage
├── public/                 # Static assets (MP portraits, icons)
├── devops/scripts/         # Storage verification script
├── secrets/                # Local secrets placeholder (.gitkeep)
├── middleware.ts           # Route protection (citizen / MP sessions)
├── .env.local              # Local environment (not committed)
└── DEVELOPER_MP_CREDENTIALS.md  # Demo MP usernames & PINs
```

Path aliases (see `tsconfig.json`): `@/components`, `@/lib`, `@/data`, `@/frontend`, `@/backend`.

---

## Getting Started

Quick start (full detail in **[SETUP.md](SETUP.md)**):

```bash
cd "proxima gov"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm start   # production
npm run verify:storage       # test SQLite / MongoDB
```

**Quick test:** Citizen register → submit issue → MP login (`DEVELOPER_MP_CREDENTIALS.md`) → approve on dashboard.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values (never commit `.env.local`):

```env
# Optional — Gemini AI for grievance responses
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key

# Optional — data.gov.in open data
DATAGOVINDIA_API_KEY=your_datagovindia_key

# Optional — MongoDB Atlas (cloud persistence)
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=proxima_gov

# Optional — disable all persistence (demo mode, data resets on restart)
# PROXIMA_STORAGE=off

# Optional — production session signing
# SESSION_SECRET=long-random-string
```

If `MONGODB_URI` is unset, data is stored in **`backend/data/proxima.sqlite`** automatically.

---

## Data Persistence

| Mode | Configuration | Behaviour |
|------|---------------|-----------|
| **SQLite** (default) | No `MONGODB_URI` | Local file `backend/data/proxima.sqlite`; survives restarts |
| **MongoDB Atlas** | `MONGODB_URI` + `MONGODB_DB` | Cloud document DB; one free M0 cluster per Atlas project |
| **Memory** | `PROXIMA_STORAGE=off` | Demo only — all data lost on server restart |

Verify storage:

```bash
npm run verify:storage
```

Collections used in MongoDB: `citizens`, `issues`, `grievances`, `notifications`, `activity_log`, `meta`.

---

## Demo Credentials

### MP Portal

Full table: **`DEVELOPER_MP_CREDENTIALS.md`**

Quick demo (Bangalore South):

```
Username: mp.bangalore-south
PIN:      495830
```

Usernames follow the pattern `mp.<constituency-id>` (e.g. `mp.new-delhi`, `mp.mumbai-south`).

### Citizen Portal

- Register any 10-digit mobile number
- In demo mode, the OTP may be shown on screen after requesting it (no SMS required)

---

## Scripts & Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | ESLint |
| `npm run verify:storage` | Test SQLite or MongoDB connection |

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP (citizen) |
| POST | `/api/auth/verify-otp` | Verify OTP / register / login |
| POST | `/api/auth/mp-login` | MP PIN login |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Current session |
| GET/POST | `/api/issues` | List / create issues |
| GET/PATCH | `/api/issues/[id]` | Issue detail / MP actions |
| POST | `/api/issues/[id]/verify` | Citizen verification vote |
| GET/POST | `/api/grievances` | Grievances |
| GET | `/api/notifications` | Citizen notifications |
| GET | `/api/history` | Activity log |
| GET | `/api/cloud/status` | Storage provider status |
| GET | `/api/datagov/projects` | Live scheme projects |
| GET | `/api/datagov/mp-report` | MP transparency report |

---

## FAQs

Common questions (wrong portal login, declined issues, photo uploads, MPLADS scope, storage) are answered at:

**[http://localhost:3000/faq](http://localhost:3000/faq)**

Source: `backend/data/faqs.ts`

---

## Troubleshooting

### Internal Server Error in development

Often caused by a **corrupted Turbopack cache** after many hot reloads or multiple `npm run dev` instances.

```powershell
# Windows PowerShell — stop servers on 3000/3001, clear cache, restart
Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Remove-Item -Recurse -Force .next
npm run dev
```

Then hard-refresh the browser: **Ctrl + Shift + R**.

### MP login does not open while citizen is logged in

Log out of the Citizen Portal first, or use the **Log out** button on the yellow notice banner.

### MongoDB connection fails

- Check username/password in `MONGODB_URI`
- Atlas → Network Access → allow `0.0.0.0/0` for local dev
- Run `npm run verify:storage`

### Photo upload does nothing

Ensure the issue is in **Work Started** or **In Progress**. Click **Upload Progress Photo** — a file picker should open. JPG/PNG/WebP supported.

---

## Constituencies Covered

The demo ships with **15 Lok Sabha constituencies** across Indian states (see `backend/data/constituencies.ts`), each with:

- MP profile and party
- Sample government projects
- Constituency-scoped MP dashboard and citizen registration

---

## Disclaimer

Proxima Gov is a **demonstration platform** for digital governance concepts (hackathons, academic projects, and stakeholder demos). It is inspired by Government of India / Lok Sabha / Digital India themes but is **not** an official government production system unless separately commissioned and deployed.

MP names and roster data reference the **18th Lok Sabha (2024)** for realism. Credentials in `DEVELOPER_MP_CREDENTIALS.md` are for **demo use only**.

---

## Related Files

| File | Purpose |
|------|---------|
| [SETUP.md](SETUP.md) | Full installation guide |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical architecture |
| [CONSTRUCTION.md](CONSTRUCTION.md) | Code organisation guide |
| [LIFECYCLE.md](LIFECYCLE.md) | Governance state machine |
| [API.md](API.md) | API endpoint reference |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Hosting guide |
| `DEVELOPER_MP_CREDENTIALS.md` | MP demo usernames and PINs |
| `backend/data/faqs.ts` | FAQ content source |
| `backend/lib/issueTriage.ts` | AI jurisdiction screening |
| `AGENTS.md` / `CLAUDE.md` | AI agent coding rules |

---

**Proxima Digital Governance Initiative · Lok Sabha Constituency Platform · FY 2026–27**