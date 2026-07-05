# Proxima Gov — Deployment Guide

Notes for running Proxima Gov beyond local development: staging, demos, and production-oriented hosting.

See also: [SETUP.md](SETUP.md) · [ARCHITECTURE.md](ARCHITECTURE.md)

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
| **Docker** | Portable | Multi-stage Node image (not included in repo) |

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

## Scaling considerations

Current architecture is **single-node in-memory + DB write-through**. For high concurrency:

1. Replace global in-memory stores with DB-read per request (or Redis cache)
2. Move images to object storage (S3, Cloudflare R2)
3. Queue OTP SMS and AI calls
4. Add rate limiting on `/api/auth/*` and `/api/issues`

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