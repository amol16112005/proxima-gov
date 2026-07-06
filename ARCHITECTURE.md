# Proxima Gov — System Architecture

This document describes how Proxima Gov is designed: layers, data flow, authentication, persistence, and the governance lifecycle engine.

See also: [README.md](README.md) · [SETUP.md](SETUP.md) · [CONSTRUCTION.md](CONSTRUCTION.md) · [LIFECYCLE.md](LIFECYCLE.md) · [API.md](API.md)

---

## High-Level Overview

Proxima Gov is a **monolithic Next.js 16 application** using the App Router. A single Node.js process serves:

- Server-rendered React pages (citizen, MP, transparency, FAQ)
- REST API routes under `/api/*`
- Edge middleware for session-based route protection

There is no separate microservice tier in this demo. Business logic lives in `backend/lib/`; UI in `frontend/`; routing glue in `app/`.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    Pages (SSR/RSC) + Client Components
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  app/          Next.js routes (pages + API route handlers)       │
│  middleware.ts Edge session checks on /citizen/* and /mp/*       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
  frontend/              backend/lib/            backend/data/
  components             lifecycleStore            constituencies
  styles                 auth, cloud, AI           seedIssues, faqs
        │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                    ┌───────────────────────┐
                    │  Storage abstraction   │
                    │  SQLite │ MongoDB │ RAM │
                    └───────────────────────┘
```

---

## Architectural Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Routing** | `app/` | URL → page or API handler; thin orchestration |
| **Presentation** | `frontend/components/`, `frontend/styles/` | React UI, forms, lifecycle visualisation |
| **Application** | `backend/lib/` | Issue lifecycle, triage, notifications, sessions |
| **Domain data** | `backend/data/` | Constituencies, types, seed content, FAQs |
| **Infrastructure** | `backend/lib/cloud/` | SQLite/MongoDB hydrate, persist, activity log |
| **Integration** | `backend/lib/datagovindia/`, `backend/lib/ai/` | External APIs (data.gov.in, Gemini) |
| **Cross-cutting** | `middleware.ts` | Auth gate for protected routes |

Next.js requires `app/` at the project root — pages and API routes cannot be moved without breaking the framework.

---

## Authentication Model

### Session cookie

- Cookie name: `proxima_session`
- Payload: HMAC-SHA256 signed JSON (`SessionUser` + expiry)
- Secret: `SESSION_SECRET` env var (32+ chars; **required** in production — throws if missing)
- Max age: 7 days

### Citizen auth

1. `POST /api/auth/send-otp` — validates phone, stores OTP in memory
2. `POST /api/auth/verify-otp` — verifies OTP; registers or logs in citizen
3. Session cookie set; redirects to dashboard

Demo mode may return OTP in the API response (no SMS).

### MP auth

1. `POST /api/auth/mp-login` — username + 6-digit PIN against `backend/data/mpRegistry.ts`
2. Session includes `role: "mp"`, `constituencyId`, `mpId`

### Portal isolation

- **One active session per browser** — citizen and MP roles are mutually exclusive at login UI level
- Middleware blocks cross-portal access to protected routes (`wrong_portal` redirect)
- Wrong-portal UX: `WrongPortalNotice` component with one-click logout

### Edge vs Node session parsing

- `backend/lib/auth/session-edge.ts` — middleware (Edge runtime)
- `backend/lib/auth/session.ts` — server components and API routes (Node)

---

## Internationalisation & Accessibility

### Locale (`frontend/i18n/`)

| Piece | Role |
|-------|------|
| `messages/en.ts`, `hi.ts` | ~470 UI strings per locale |
| `server.ts` | `getServerTranslator()` for RSC pages (reads `proxima_locale` cookie) |
| `AccessibilityContext` | Client locale + `translate()`; receives `initialLocale` from root layout |
| Cookie `proxima_locale` | Synced with `localStorage`; triggers `router.refresh()` on change |

Root layout (`app/layout.tsx`) sets `<html lang={cookieLocale}>` and passes `initialLocale` to `AccessibilityShell` to avoid Hindi/English hydration flash.

### Accessibility shell

`AccessibilityShell` wraps every page:

- `SkipLink`, `OfflineBanner`, `AccessibilityToolbar` (lazy-loaded)
- Toolbar: language, larger text, high contrast, read-aloud
- Offline detection: probes `GET /api/health` (not `navigator.onLine` alone)
- Hindi typography: `Noto_Sans_Devanagari` + `frontend/styles/hindi-locale.css`

FAQ content: English in `backend/data/faqs.ts`; Hindi lazy-imported from `faqsHi.ts` when locale is `hi`.

---

## AI Priority & Data Engine

Module: `backend/lib/priorityEngine.ts`

| Step | Function | Output |
|------|----------|--------|
| Theme extraction | `extractThemeCategory()` | water, roads, education, etc. |
| Hotspot extraction | `extractGeographicHotspot()` | ward, village, block |
| Urgency scoring | `computeUrgencyScore()` | 0–100 keyword analysis |
| Urgency boost | `computeUrgencyBoost()` | flat +20 / +15 / +0 |
| Data gap weight | `computeInfrastructureGapWeight()` | demographics + data.gov.in (or local fallback) |
| Clustering | `buildPriorityClusters()` | grouped demand hotspots |
| Ranking | `computeCompositePriorityScore()` | `(Demand×0.4) + (Gap×0.6) + Boost` |

MP dashboard consumes `getMpPriorityClusters()` and `getMpPendingApprovalsRanked()`.

### Multimodal ingestion (architecture — Phase 2 channels)

The engine operates on **normalized text + metadata**, not a specific UI widget:

```
WhatsApp / SMS / Voice note
    → channel adapter (Twilio / Meta Cloud API)
    → Speech-to-Text (Google Cloud STT / Whisper) if audio
    → { title, description, location, category, locale }
    → assessIssueScope() + priorityEngine enrichment
    → same clustering & MP ranked roadmap
```

Web form submissions already feed this pipeline. Adding WhatsApp or voice is an **adapter layer**, not a rewrite.

### data.gov.in fallback

`computeInfrastructureGapWeight()` never calls external APIs synchronously on the request path. If `DATAGOVINDIA_API_KEY` is unset, constituency demographic heuristics apply — no 500 errors on the MP dashboard.

---

## Storage Architecture

### Provider selection (`backend/lib/cloud/provider.ts`)

```
PROXIMA_STORAGE=off  →  memory (demo, no persistence)
MONGODB_URI set      →  mongodb
(default)            →  sqlite
```

### Hydration pattern

On first request after server start:

1. `ensureDataHydrated()` loads citizens, issues, grievances, notifications, activity from storage
2. In-memory global arrays (`global.__proximaIssues`, etc.) back runtime operations
3. Mutations call `persistIssue`, `persistCitizen`, etc. to write through to storage
4. `scheduleActivity()` appends audit log entries

### MongoDB schema

Database name: `proxima_gov` (configurable via `MONGODB_DB`)

| Collection | Content |
|------------|---------|
| `citizens` | Serialized `CitizenAccount` JSON |
| `issues` | Serialized `DevelopmentIssue` JSON |
| `grievances` | Serialized `Grievance` JSON |
| `notifications` | Serialized `Notification` JSON |
| `activity_log` | Audit trail entries |
| `meta` | Issue counter, hydration flags |

Progress photos are stored as **base64 data URLs** inside issue documents (demo constraint; production would use object storage).

### SQLite

Default path: `backend/data/proxima.sqlite`  
Override: `PROXIMA_DB_PATH` env var

---

## Issue Lifecycle Engine

Central module: `backend/lib/lifecycleStore.ts`

| Function | Purpose |
|----------|---------|
| `createIssue` | Citizen submission → AI triage → stage assignment |
| `mpApproveIssue` | MP approval with fund/budget |
| `mpAssignWork` | Contractor assignment |
| `mpReleaseTender` / `mpStartWork` | Execution phases |
| `updateProgress` | Sub-stage progress % |
| `addProgressImage` | Photo upload metadata + imageUrl |
| `citizenVerify` | Post-completion citizen vote |
| `mpReviewIssue` | Accountability decisions |
| `getMpPendingApprovals` | MP dashboard queue (eligible only) |
| `getMpDashboardIssues` | All MP-visible issues (excludes declined) |

State machine details: [LIFECYCLE.md](LIFECYCLE.md)

---

## AI Subsystems

### 1. Issue jurisdiction triage (`backend/lib/issueTriage.ts`)

Runs on every new issue **before** MP visibility:

- `assessIssueScope()` — keyword + constituency rules
- `applyTriageToAnalysis()` — merges into `AiAnalysis`
- Declined → `stage: "declined"`, notifications to citizen, excluded from MP queries

### 2. Priority analysis (`generateAiAnalysis`)

Heuristic scoring (title/description hash, category, location) for eligible issues.

### 3. Gemini grievance engine (`backend/lib/ai/geminiEngine.ts`)

Used by `POST /api/grievances` when API key is configured.

### 4. data.gov.in (`backend/lib/datagovindia/`)

Enriches citizen dashboard and MP reports with live scheme/MPLADS data.

---

## API Design

REST JSON under `app/api/`. Pattern:

- `GET` — read with session or public flag
- `POST` — create / auth actions
- `PATCH` — MP issue actions (single `action` field dispatch)

Full reference: [API.md](API.md)

---

## Frontend Architecture

### Server vs client components

- **Server components** — pages that fetch session, hydrate data, pass props
- **Client components** — forms, MP actions, OTP flow, FAQ accordion, photo upload

### Key client modules

| Component | Role |
|-----------|------|
| `OtpAuthFlow` | Citizen OTP register/login |
| `MpPinLogin` | MP credential form |
| `MpIssueActions` | MP PATCH actions + file upload |
| `LifecycleTracker` | Stage visualisation |
| `WrongPortalNotice` | Cross-portal session conflict |
| `FaqSection` | Expandable FAQ UI |

### Image upload flow

1. Hidden `<input type="file">` triggered by MP button
2. `frontend/lib/imageUpload.ts` compresses to JPEG/PNG data URL
3. `PATCH /api/issues/[id]` with `action: "addImage"` and `imageUrl`
4. Stored on issue document, rendered in `LifecycleTracker`

---

## Security Considerations (Demo vs Production)

| Area | Current demo | Production hardening |
|------|--------------|----------------------|
| OTP | In-memory, may echo in response | SMS gateway, rate limits |
| MP PIN | Plaintext in registry file | Hashed secrets, rotation |
| Session | HMAC cookie | `SESSION_SECRET` rotation, HTTPS-only, `Secure` flag |
| Photos | Base64 in DB | S3/GridFS, virus scan, size quotas |
| API | No rate limiting | WAF, throttling, CORS policy |

---

## Path Aliases

Defined in `tsconfig.json`:

```json
"@/components/*" → "./frontend/components/*"
"@/lib/*"        → "./backend/lib/*"
"@/data/*"       → "./backend/data/*"
"@/app/*"        → "./frontend/styles/*"   // CSS modules only
"@/*"            → "./*"
```

---

## Related Documents

- [CONSTRUCTION.md](CONSTRUCTION.md) — why folders are organised this way
- [SETUP.md](SETUP.md) — install and configure
- [DEPLOYMENT.md](DEPLOYMENT.md) — production deployment notes
- [LIFECYCLE.md](LIFECYCLE.md) — stage transitions and rules