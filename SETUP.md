# Proxima Gov — Setup Guide

Step-by-step instructions to install, configure, and verify Proxima Gov on your machine.

See also: [README.md](README.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ (20 recommended) | Includes npm |
| npm | 9+ | Bundled with Node |
| Git | Any recent | Optional, for cloning |
| MongoDB Atlas | Free M0 | Optional, for cloud persistence |
| Windows / macOS / Linux | — | `better-sqlite3` needs build tools on some systems |

### Windows note

If PowerShell blocks `npm`, use:

```powershell
npm.cmd run dev
```

Or set execution policy for the current user:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

---

## 1. Get the project

```bash
cd "proxima gov"
npm install
```

Installation pulls native modules (`better-sqlite3`). On failure, install [Windows Build Tools](https://github.com/nodejs/node-gyp#on-windows) or use Node LTS.

---

## 2. Environment configuration

Copy the example environment file:

```bash
cp .env.example .env.local
# Windows: copy .env.example .env.local
```

Edit `.env.local` with your keys. **Never commit `.env.local`** — it is gitignored.

### Minimal (SQLite, no external APIs)

No variables required. Data saves to `backend/data/proxima.sqlite`.

### Recommended for full demo

```env
# Gemini — AI grievance responses
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

# data.gov.in — live project enrichment
DATAGOVINDIA_API_KEY=your_key_here

# Session signing — required for production (32+ characters)
SESSION_SECRET=replace-with-long-random-string-min-32-chars
```

### MongoDB Atlas (cloud persistence)

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=proxima_gov
```

#### Atlas setup checklist

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **free M0 cluster** (one per Atlas project)
3. **Database Access** → create user + password
4. **Network Access** → Add IP → `0.0.0.0/0` for local dev
5. **Connect** → Drivers → copy connection string
6. Replace `<password>` in URI; set `MONGODB_DB=proxima_gov`

### Disable persistence (memory-only demo)

```env
PROXIMA_STORAGE=off
```

Data resets every server restart.

---

## 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Expected console output:

```
▲ Next.js 16.x (Turbopack)
- Local: http://localhost:3000
- Environments: .env.local
✓ Ready in ...
```

---

## 4. Verify storage

```bash
npm run verify:storage
```

**SQLite success:**

```
✅ SQLite storage ready
   Database: .../backend/data/proxima.sqlite
```

**MongoDB success:**

```
✅ MongoDB storage ready
   Database: proxima_gov
```

---

## 5. Smoke test

### Citizen flow

1. Go to `/citizen/register`
2. Fill name, email, constituency, mobile → request OTP
3. Enter OTP (shown on screen in demo mode)
4. Submit an issue at `/citizen/issues/new`
5. Check notifications and issue detail page

### MP flow

1. Open `DEVELOPER_MP_CREDENTIALS.md`
2. Log in at `/mp/login` (e.g. `mp.bangalore-south` / `495830`)
3. Approve a pending issue on `/mp/dashboard`
4. Advance through work stages; test photo upload

### Public

- `/transparency` — constituency project view
- `/faq` — help content (English; switch to Hindi via accessibility button)

### Accessibility & Hindi

1. Tap the **round blue–purple button** at bottom-left
2. Select **हिन्दी** — page refreshes with Hindi labels
3. Toggle **Larger text** / **High contrast** / **Read page aloud**
4. FAQ Hindi content: `/faq` with Hindi selected

---

## 6. Production build (local test)

```bash
npm run build        # or npm run build:clean to wipe .next first
npm start
```

Runs on port 3000 by default.

---

## Common setup issues

### Port 3000 already in use

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Internal Server Error after long dev session

Corrupted Turbopack cache:

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

Hard-refresh browser: **Ctrl + Shift + R**.

### MongoDB authentication failed

- URL-encode special characters in password (`@`, `#`, `%`)
- Confirm IP whitelist includes your machine
- Run `npm run verify:storage`

### Cannot switch Citizen → MP login

Log out first, or use the yellow **Log out of Citizen Portal** banner on MP login.

### `better-sqlite3` install fails

```bash
npm rebuild better-sqlite3
```

Or use MongoDB-only mode with `MONGODB_URI` set.

### False “You are offline” banner

Hard-refresh (**Ctrl + Shift + R**). On Vercel, redeploy **without build cache**. The app verifies `/api/health` before showing the offline banner.

### Vercel auth fails

Set `SESSION_SECRET` (32+ chars) in Vercel environment variables and redeploy. Check `/api/health` → `sessionSecretConfigured: true`.

---

## Environment variable reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | No | — | MongoDB connection string |
| `MONGODB_DB` | No | `proxima_gov` | Database name |
| `PROXIMA_DB_PATH` | No | `backend/data/proxima.sqlite` | SQLite file path |
| `PROXIMA_STORAGE` | No | enabled | Set `off` for memory-only |
| `SESSION_SECRET` | **Yes (production)** | dev fallback locally | HMAC session signing; **required** on Vercel (32+ chars) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | No | — | Gemini AI for grievances |
| `DATAGOVINDIA_API_KEY` | No | — | data.gov.in API key |

---

## Next steps

- [ARCHITECTURE.md](ARCHITECTURE.md) — how the system fits together
- [CONSTRUCTION.md](CONSTRUCTION.md) — code organisation and conventions
- [DEPLOYMENT.md](DEPLOYMENT.md) — hosting guidance
- [API.md](API.md) — REST endpoint reference