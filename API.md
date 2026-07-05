# Proxima Gov — API Reference

REST JSON API served from `app/api/`. All paths relative to `http://localhost:3000`.

See also: [ARCHITECTURE.md](ARCHITECTURE.md) · [LIFECYCLE.md](LIFECYCLE.md)

---

## Authentication

Session cookie: `proxima_session` (set by auth endpoints, sent automatically by browser).

For programmatic testing, capture cookie from login response headers.

### Roles

| Role | How obtained |
|------|--------------|
| `citizen` | OTP verify/register |
| `mp` | MP PIN login |

---

## Auth Endpoints

### `POST /api/auth/send-otp`

Send OTP to mobile (demo may return OTP in body).

```json
{
  "phone": "9876543210",
  "role": "citizen",
  "purpose": "login" | "register"
}
```

**Response 200:**

```json
{
  "maskedPhone": "******3210",
  "demoOtp": "123456",
  "demoNote": "Demo mode — OTP shown for testing"
}
```

---

### `POST /api/auth/verify-otp`

```json
{
  "phone": "9876543210",
  "otp": "123456",
  "role": "citizen",
  "purpose": "register",
  "name": "Citizen Name",
  "email": "user@example.com",
  "constituencyId": "bangalore-south"
}
```

Login omits `name`, `email`, `constituencyId`.

**Response 200:** `{ "redirect": "/citizen/dashboard" }` + session cookie

---

### `POST /api/auth/mp-login`

```json
{
  "username": "mp.bangalore-south",
  "pin": "495830"
}
```

**Response 200:** `{ "redirect": "/mp/dashboard" }` + session cookie

---

### `POST /api/auth/logout`

Clears session cookie.

**Response 200:** `{ "success": true }`

---

### `GET /api/auth/me`

**Response 200:** `{ "user": SessionUser }` or `{ "user": null }`

---

## Issues

### `GET /api/issues`

| Query | Auth | Description |
|-------|------|-------------|
| `?public=true` | None | All issues (transparency) |
| (default) | Session | Citizen's issues or MP constituency issues |

**Response 200:** `{ "issues": DevelopmentIssue[] }`

MP list excludes `declined` issues.

---

### `POST /api/issues`

**Auth:** Citizen session required

```json
{
  "category": "infrastructure",
  "title": "Damaged road in Ward 12",
  "description": "Potholes affecting school route...",
  "location": "Kothrud, Pune City"
}
```

**Response 201:** `{ "issue": DevelopmentIssue }`

Issue may be `stage: "mp-approval"` or `stage: "declined"` based on AI triage.

---

### `GET /api/issues/[id]`

**Auth:** Session (citizen owner, constituency MP, or public rules)

**Response 200:** `{ "issue": DevelopmentIssue }`

---

### `PATCH /api/issues/[id]`

**Auth:** MP session, same constituency

```json
{
  "action": "approve",
  "fund": "MPLADS",
  "budget": 1000000
}
```

#### Actions

| `action` | Extra fields |
|----------|--------------|
| `approve` | `fund`, `budget` |
| `assign` | `contractor`, `officer`, `estimatedDays`, `deadline` |
| `tender` | — |
| `start` | — |
| `progress` | `subStage` |
| `addImage` | `label`, `caption`, `isCompletion`, `imageUrl` |
| `mpReview` | `decision`, `note?` |

**Response 200:** `{ "issue": DevelopmentIssue }`

**Error codes:** `PHOTOS_REQUIRED`, `IMAGE_REQUIRED`, `IMAGE_TOO_LARGE`, `COMPLETION_EXISTS`, `NOT_IN_REVIEW`

---

### `POST /api/issues/[id]/verify`

**Auth:** Citizen (issue owner)

```json
{ "vote": "yes" }
```

**Response 200:** `{ "issue": DevelopmentIssue }`

---

## Grievances

### `GET /api/grievances`

**Auth:** Session

**Response 200:** `{ "grievances": Grievance[] }`

---

### `POST /api/grievances`

**Auth:** Citizen session

```json
{
  "category": "water-sanitation",
  "subject": "Irregular supply",
  "description": "Water only 2 hours daily...",
  "location": "Ward 5"
}
```

**Response 201:** `{ "grievance": Grievance }` (may include AI `govResponse`)

---

## Notifications

### `GET /api/notifications`

**Auth:** Citizen

**Response 200:** `{ "notifications": Notification[] }`

---

### `POST /api/notifications`

```json
{ "action": "markAllRead" }
```

or

```json
{ "action": "markRead", "id": "notification-id" }
```

---

## History

### `GET /api/history`

**Auth:** Session

Query: `?limit=50`

**Response 200:**

```json
{
  "entries": ActivityEntry[],
  "scope": "citizen" | "constituency"
}
```

---

## Citizen Profile

### `PATCH /api/citizen/profile`

**Auth:** Citizen

```json
{ "constituencyId": "new-delhi" }
```

**Response 200:** Updated session + citizen record

---

## Cloud / Storage

### `GET /api/cloud/status`

**Response 200:**

```json
{
  "enabled": true,
  "provider": "mongodb",
  "message": "...",
  "connected": true,
  "location": "mongodb+srv://***@..."
}
```

---

## Open Data

### `GET /api/datagov/projects`

**Auth:** Session

**Response 200:** Live government projects for citizen's constituency

---

### `GET /api/datagov/mp-report`

**Auth:** Citizen (own constituency MP report)

**Response 200:** `MpTransparencyReport` JSON

---

## Error Format

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_CODE"
}
```

HTTP status: `400` validation, `401` unauthorized, `404` not found.