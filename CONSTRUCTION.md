# Proxima Gov — Project Construction Guide

How this codebase is organised, why it is structured this way, and how to extend it safely.

See also: [README.md](README.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [SETUP.md](SETUP.md)

---

## Design Goals

1. **Hackathon/demo clarity** — judges can navigate citizen vs MP flows quickly
2. **Next.js compatibility** — keep `app/` routing where the framework requires it
3. **Separation of concerns** — UI (`frontend/`), logic (`backend/`), routes (`app/`)
4. **Pluggable storage** — SQLite for zero-config; MongoDB for cloud demos
5. **Single deployable unit** — no separate API server to coordinate

---

## Folder Layout

```
proxima-gov/
├── app/                      # ROUTING LAYER (required by Next.js)
│   ├── layout.tsx            # Root layout, fonts, global CSS import
│   ├── page.tsx              # Marketing home page
│   ├── faq/page.tsx         # FAQ page
│   ├── citizen/**/page.tsx  # Citizen portal pages
│   ├── mp/**/page.tsx       # MP portal pages
│   ├── transparency/**      # Public transparency
│   └── api/**/route.ts      # REST API handlers (thin wrappers)
│
├── frontend/                 # PRESENTATION LAYER
│   ├── components/          # React components
│   │   ├── lifecycle/       # LifecycleTracker, MpIssueActions, etc.
│   │   └── ...
│   ├── context/             # React context (ProjectContext)
│   ├── lib/                 # Browser-only utilities (imageUpload)
│   └── styles/              # CSS modules (shared, page, globals)
│
├── backend/                  # APPLICATION LAYER
│   ├── data/                # Static/seed data & TypeScript types
│   │   ├── constituencies.ts
│   │   ├── lifecycleTypes.ts
│   │   ├── seedIssues.ts
│   │   ├── mpRegistry.ts
│   │   └── faqs.ts
│   └── lib/                 # Business logic
│       ├── lifecycleStore.ts    # Core issue state machine
│       ├── issueTriage.ts       # AI jurisdiction screening
│       ├── lifecycleRules.ts  # Photo completion rules
│       ├── store.ts             # Citizens, grievances
│       ├── notifications.ts
│       ├── auth/                # Session, OTP, access control
│       ├── cloud/               # Storage abstraction
│       ├── datagovindia/        # Open data integration
│       └── ai/                  # Gemini engine
│
├── public/                   # Static files (MP SVG portraits)
├── devops/scripts/           # verify-storage.mjs
├── middleware.ts             # Edge auth for citizen/mp routes
└── secrets/                  # Placeholder for local secrets (.gitkeep)
```

---

## Why `app/` stays separate

Next.js App Router resolves URLs from the `app/` directory only. Moving pages to `frontend/pages/` would break routing unless you duplicate re-exports.

**Convention:** `app/**/page.tsx` files are **thin** — they:

1. Call `getSession()` / `ensureDataHydrated()`
2. Fetch data from `@/lib/*`
3. Render `@/components/*`

Business logic never lives directly in page files beyond orchestration.

---

## Import conventions

| Import | Resolves to |
|--------|-------------|
| `@/components/PortalHeader` | `frontend/components/PortalHeader.tsx` |
| `@/lib/lifecycleStore` | `backend/lib/lifecycleStore.ts` |
| `@/data/constituencies` | `backend/data/constituencies.ts` |
| `@/app/shared.module.css` | `frontend/styles/shared.module.css` |
| `@/frontend/lib/imageUpload` | `frontend/lib/imageUpload.ts` |

Always use `@/` aliases — do not use deep relative paths across layers.

---

## Adding a new citizen page

1. Create `app/citizen/my-feature/page.tsx`
2. Add route to `middleware.ts` `CITIZEN_PROTECTED` if auth required
3. Build UI in `frontend/components/` if reusable
4. Add API route under `app/api/` if new mutations needed
5. Extend `backend/lib/` for logic; persist via `cloud/persist.ts`

---

## Adding a new MP action on an issue

1. Add action case in `app/api/issues/[id]/route.ts` `PATCH` switch
2. Implement handler in `backend/lib/lifecycleStore.ts`
3. Add button in `frontend/components/lifecycle/MpIssueActions.tsx`
4. Update `LIFECYCLE.md` stage documentation
5. Add FAQ entry in `backend/data/faqs.ts` if user-facing

---

## Adding a new constituency

1. Add entry to `backend/data/constituencies.ts` (`RAW_CONSTITUENCIES`)
2. Add MP roster row in `backend/data/lokSabhaRoster.ts`
3. Add MP profile in `backend/data/mpProfiles.ts`
4. Add credentials in `backend/data/mpRegistry.ts` and `DEVELOPER_MP_CREDENTIALS.md`
5. Add SVG portrait at `public/mp/<constituency-id>.svg`
6. Optional: seed issues in `backend/data/seedIssues.ts`

---

## Data mutation pattern

Runtime state uses **global in-memory caches** synchronised to storage:

```typescript
// Read
const issue = getIssueById(id);

// Mutate
issue.stage = "approved";
syncIssue(issue, "MP approved #123", "issue.mp_action");
// → persistIssue(issue) + scheduleActivity(...)
```

On server restart, `ensureDataHydrated()` reloads from SQLite/MongoDB.

---

## Client vs server boundaries

| Use server | Use client (`"use client"`) |
|------------|----------------------------|
| `getSession()`, `cookies()` | `useState`, `useRouter`, `onClick` |
| `ensureDataHydrated()` | `fetch()` from browser |
| Direct `lifecycleStore` reads | File input, image compression |

Never import `better-sqlite3` or Node `fs` in client components.

---

## Styling conventions

- **Portal pages** — `@/app/shared.module.css` (wide layouts use `pageWide` class)
- **Marketing home** — `@/app/page.module.css`
- **Lifecycle widgets** — `frontend/components/lifecycle/lifecycle.module.css`
- **FAQ** — `frontend/components/faq.module.css`

Colour palette: dark purple gradient backgrounds (`#0f0c29` → `#302b63`), accent violet `#a78bfa`, citizen blue-green gradients, MP red accents.

---

## Testing checklist (manual)

After significant changes:

```bash
npm run build          # TypeScript + compile
npm run verify:storage # DB connectivity
npm run dev            # Smoke test flows
```

Test matrix:

- [ ] Citizen register + login
- [ ] Issue submit (eligible + declined cases)
- [ ] MP login + approve + photo upload
- [ ] Citizen verification
- [ ] Wrong-portal logout notice
- [ ] `/faq` renders
- [ ] `/transparency` public view

---

## Git hygiene

**Do not commit:**

- `.env.local`
- `backend/data/proxima.sqlite` (if contains real test data)
- `.next/`
- `node_modules/`

**Safe to commit:**

- `backend/data/*.ts` seed files
- `DEVELOPER_MP_CREDENTIALS.md` (demo PINs only)
- Documentation (`*.md`)

---

## Documentation map

| File | Audience | Content |
|------|----------|---------|
| [README.md](README.md) | Everyone | Overview, quick start |
| [SETUP.md](SETUP.md) | Developers | Install, env, troubleshooting |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Developers | System design |
| [CONSTRUCTION.md](CONSTRUCTION.md) | Contributors | This file — how to extend |
| [LIFECYCLE.md](LIFECYCLE.md) | Product/tech | Issue state machine |
| [API.md](API.md) | Integrators | REST reference |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Ops | Hosting |
| `DEVELOPER_MP_CREDENTIALS.md` | Judges/demo | MP logins |
| `/faq` (runtime) | End users | Portal help |