# Proxima Gov — Governance Lifecycle

Detailed reference for how **Issues** move through the platform, including AI triage, MP actions, and citizen verification.

See also: [ARCHITECTURE.md](ARCHITECTURE.md) · [API.md](API.md)

---

## Issues vs Grievances

**Citizen-facing flow:** all new concerns are filed as **Issues** via `/citizen/issues/new`. Legacy URLs `/citizen/grievances` and `/citizen/grievances/new` redirect to the Issues list.

| | **Issues (primary)** | **Grievances (legacy/API)** |
|---|-----------|----------------|
| UI entry | Submit Issue | Redirects to Issues |
| Purpose | Full MPLADS-style development lifecycle | Historical audit labels + `/api/grievances` API |
| MP involvement | Required (approval → execution) | Not used in current MP dashboard UI |
| AI | Jurisdiction triage + priority score | Gemini response when API called directly |
| Stages | 12+ lifecycle stages | Status updates only |
| Photos | Mandatory progress + completion | Not required |
| Public transparency | Yes (active stages) | Limited |

Activity History may still show `grievance.created` / `grievance.status_changed` for older audit entries.

---

## Issue Stage State Machine

```
                    ┌─────────────┐
                    │  submitted  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ ai-analysis │  (jurisdiction scan)
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       mpEligible=true            mpEligible=false
              │                         │
       ┌──────▼──────┐            ┌─────▼─────┐
       │ mp-approval │            │  declined │  (terminal for MP)
       └──────┬──────┘            └───────────┘
              │
       ┌──────▼──────┐
       │  approved   │
       └──────┬──────┘
              │
       ┌──────▼──────────┐
       │ work-assigned   │
       └──────┬──────────┘
              │
       ┌──────▼──────────┐
       │ tender-released │
       └──────┬──────────┘
              │
       ┌──────▼──────────┐
       │  work-started   │
       └──────┬──────────┘
              │
       ┌──────▼──────────┐
       │   in-progress   │  ← progress photos, sub-stages
       └──────┬──────────┘
              │
       ┌──────▼────────────────┐
       │ citizen-verification  │  ← citizen yes/no vote
       └──────┬────────────────┘
              │
       ┌──────▼──────────┐
       │   mp-review     │  ← accountability actions
       └──────┬──────────┘
              │
       ┌──────▼──────────┐
       │   completed     │
       └──────┬──────────┘
              │
       ┌──────▼──────────────┐
       │  impact-analysis    │
       └─────────────────────┘
```

---

## Stage Reference

| Stage | Label | Who acts | MP dashboard? |
|-------|-------|----------|---------------|
| `submitted` | Submitted | Citizen | No |
| `ai-analysis` | AI Analysis | System | Only if eligible |
| `declined` | Not Taken Up | System (auto) | **Never** |
| `mp-approval` | Awaiting MP Approval | MP | Yes |
| `approved` | Approved | MP | Yes |
| `work-assigned` | Work Assigned | MP | Yes |
| `tender-released` | Tender Released | MP | Yes |
| `work-started` | Work Started | MP | Yes |
| `in-progress` | In Progress | MP | Yes |
| `citizen-verification` | Citizen Verification | Citizen | No (waiting) |
| `mp-review` | MP Review | MP | Yes |
| `completed` | Completed | MP | Yes |
| `impact-analysis` | Impact Analysis | System | Yes |

---

## AI Triage (at creation)

Module: `backend/lib/issueTriage.ts`

### Verdicts

| `scopeVerdict` | Trigger examples | Citizen outcome |
|----------------|------------------|-----------------|
| `eligible` | Local road/water/school in constituency | → `mp-approval` |
| `out-of-constituency` | Location names another seat | → `declined` + referral MP |
| `wrong-authority` | Police, electricity, municipal tax | → `declined` + state/local body |
| `not-mp-mandate` | Passport, tax, personal job | → `declined` + ministry/portal |

### Notifications sent

**Eligible:**

1. Issue submitted
2. AI scan complete (priority score)
3. Awaiting MP approval

**Declined:**

1. Issue submitted
2. AI scan complete
3. Outside MP mandate (guidance text)
4. Suggested authority contact

---

## MP Actions by Stage

API: `PATCH /api/issues/[id]` with `{ action: "..." }`

| Stage | Action | `action` value | Notes |
|-------|--------|----------------|-------|
| `ai-analysis` / `mp-approval` | Approve | `approve` | Requires `fund`, `budget` |
| `approved` | Assign contractor | `assign` | `contractor`, `officer`, `estimatedDays`, `deadline` |
| `work-assigned` | Release tender | `tender` | — |
| `tender-released` | Start work | `start` | — |
| `work-started` / `in-progress` | Update sub-stage | `progress` | `subStage` key |
| `work-started` / `in-progress` | Upload photo | `addImage` | `imageUrl` (base64), `isCompletion` |
| `in-progress` | Mark complete | `progress` + `subStage: "completed"` | Requires photos |
| `mp-review` | Review decision | `mpReview` | `decision`, optional `note` |

### MP review decisions

| `decision` | Effect |
|------------|--------|
| `approve-closure` | Close issue, publish impact |
| `reopen-contractor` | Send back to contractor |
| `escalate-officer` | Escalate supervising officer |
| `reject-reinspect` | Order quality re-inspection |

---

## Photo Requirements

Rules: `backend/lib/lifecycleRules.ts`

Before **Mark Work Complete**:

1. At least **one** progress photo (`isCompletion: false`)
2. At least **one** completion photo (`isCompletion: true`)

Photos stored on `issue.progressImages[]` with optional `imageUrl` (data URL).

---

## Citizen Verification

API: `POST /api/issues/[id]/verify` with `{ vote: "yes" | "no" }`

- Only the **submitting citizen** can verify
- Issue must be in `citizen-verification` stage
- Votes aggregated → `mpReview.citizenVerdict`: `approved` | `rejected` | `mixed`
- Moves issue to `mp-review` for MP accountability

---

## Progress Sub-Stages

| Key | Label | Progress % |
|-----|-------|-------------|
| `planning` | Planning | 20 |
| `material-procurement` | Material Procurement | 40 |
| `construction` | Construction | 65 |
| `quality-inspection` | Quality Inspection | 90 |
| `completed` | Completed | 100 |

---

## Delay Alerts

`checkDelayAlert()` in lifecycleStore sets `issue.delayAlert` when work stalls (28+ days, <70% progress). Surfaced on MP dashboard.

---

## Transparency Visibility

`getActiveTransparencyIssues()` includes stages from `approved` through `mp-review` — **excludes** `declined` and pre-approval stages.

Public detail: `/transparency/[id]`