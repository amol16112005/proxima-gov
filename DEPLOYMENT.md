# Proxima Gov — Deployment Guide

Notes for running Proxima Gov beyond local development: staging, demos, and production-oriented hosting.

See also: [SETUP.md](SETUP.md) · [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Quick pilot (Docker — 1 constituency in ~30 minutes)

```bash
cp .env.production.example .env.docker
# Edit SESSION_SECRET (32+ chars)

docker compose --env-file .env.docker up --build -d
curl http://localhost:3000/api/health
```

- App: `http://localhost:3000`
- Health check: `GET /api/health` (for load balancers / Render / Railway)
- Data: MongoDB volume `proxima_mongo_data` (persists across restarts)

**One-click cloud:** deploy `render.yaml` on Render, or connect GitHub to Railway with `MONGODB_URI` from Atlas.

---

## Build artifacts

```bash
npm run build
npm start
```

- Output: `.next/` production bundle
- Default port: `3000` (`PORT` env var overrides)
- Node 18+ required on host

---

## Hosting options

| Platform | Suitability | Notes |
|----------|-------------|-------|
| **Vercel** | Good for UI demo | Serverless; `better-sqlite3` **not** supported — use MongoDB |
| **Railway / Render / Fly.io** | Good full-stack | Persistent disk or MongoDB Atlas |
| **VPS (Ubuntu)** | Best control | PM2 + Nginx reverse proxy |
| **Docker** | Portable | `Dockerfile` + `docker-compose.yml` (app + MongoDB) |

---

## Required production configuration

```env
NODE_ENV=production
SESSION_SECRET=<64+ char random string>
MONGODB_URI=<atlas or self-hosted connection string>
MONGODB_DB=proxima_gov

# Optional integrations
NEXT_PUBLIC_GEMINI_API_KEY=<key>
DATAGOVINDIA_API_KEY=<key>
```

**Do not** rely on SQLite on ephemeral/serverless hosts — filesystem may reset.

---

## MongoDB Atlas (production)

1. Use **M10+** for real workloads (M0 is dev/demo only)
2. Restrict Network Access to deployment IP / VPC peering
3. Enable backup (not available on free tier)
4. Create application user with least privilege on `proxima_gov` DB
5. Rotate password periodically

Connection string format:

```
mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
```

---

## Environment checklist

| Item | Action |
|------|--------|
| `SESSION_SECRET` | Generate: `openssl rand -base64 48` |
| `.env.local` | Never commit; use host secret manager |
| MP PINs | Replace demo PINs; hash in registry |
| OTP | Integrate SMS provider (MSG91, Twilio, etc.) |
| HTTPS | Terminate TLS at load balancer or Nginx |
| Cookies | `Secure`, `SameSite=Lax`, production domain |

---

## VPS deployment sketch (Ubuntu)

```bash
# On server
git clone <repo> proxima-gov && cd proxima-gov
npm ci
npm run build

# Process manager
npm install -g pm2
pm2 start npm --name proxima-gov -- start
pm2 save
```

Nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name proxima.example.gov.in;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Add Certbot for HTTPS.

---

## Vercel deployment

1. Connect Git repository
2. Framework preset: **Next.js**
3. Environment variables: `MONGODB_URI`, `SESSION_SECRET`, API keys
4. **Remove** dependency on `better-sqlite3` or ensure `MONGODB_URI` is always set (Vercel cannot persist SQLite reliably)

Build command: `npm run build`  
Output: automatic

---

## Pre-deployment verification

```bash
npm run build
npm run verify:storage
```

Manual smoke tests on staging URL:

- Citizen register → issue submit (eligible + declined)
- MP login → approve → photo upload
- `/transparency`, `/faq`
- Logout / wrong-portal flow

---

## Monitoring recommendations

| Signal | Tool suggestion |
|--------|-----------------|
| Uptime | UptimeRobot, Pingdom |
| Errors | Sentry |
| Logs | Host platform logs or Datadog |
| DB | MongoDB Atlas metrics |
| Performance | Vercel Analytics or Lighthouse |

---

## Constituency rollout plan (weeks → national scale)

| Phase | Timeline | Scope | Infrastructure |
|-------|----------|-------|----------------|
| **Pilot** | Week 1–2 | 1 Lok Sabha seat | Docker compose or Render + MongoDB Atlas M0 |
| **District cluster** | Week 3–6 | 5–10 neighbouring seats | Single app instance, `constituencyId` row isolation |
| **State** | Month 2–3 | All seats in one state | Atlas M10, CDN for static assets, SMS OTP |
| **National** | Month 4+ | 543 constituencies | Horizontal app replicas + Atlas sharded cluster, object storage for photos |

Every record is keyed by `constituencyId` — no code fork per MP. Onboard a new seat by adding roster entry + MP credentials.

---

## Inclusivity & low-connectivity (built-in)

| Feature | Location |
|---------|----------|
| **Hindi UI** | ♿ toolbar → हिन्दी (home, FAQ, skip link) |
| **Large text / high contrast** | ♿ toolbar toggles |
| **Read aloud** | Browser TTS (`hi-IN` / `en-IN`) |
| **Offline notice** | Banner when `navigator.onLine` is false |
| **PWA manifest** | `public/manifest.json` — add-to-home-screen on mobile |
| **OTP-first** | No password literacy barrier |

Roadmap: SMS short-code issue filing, WhatsApp bot, full Kannada/Tamil locales.

---

## Scaling considerations

Current architecture is **single-node in-memory + DB write-through**. For high concurrency:

1. Replace global in-memory stores with DB-read per request (or Redis cache)
2. Move images to object storage (S3, Cloudflare R2)
3. Queue OTP SMS and AI calls
4. Rate limiting is enabled on `/api/auth/send-otp` and `/api/auth/mp-login`
5. Use `/api/health` behind a load balancer for multi-instance deploys

---

## Rollback

1. Keep previous deployment artifact or git tag
2. `pm2 restart` with prior build or redeploy prior Vercel deployment
3. MongoDB data is forward-compatible (JSON documents) — no migrations in demo

---

## Security before public launch

- [ ] Rotate all demo MP PINs
- [ ] Remove OTP from API responses
- [ ] Enable HTTPS only
- [ ] Set strong `SESSION_SECRET`
- [ ] Review Atlas IP whitelist
- [ ] Pen-test auth and IDOR on `/api/issues/[id]`
- [ ] Cap image upload size at reverse proxy level