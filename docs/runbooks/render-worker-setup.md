# Render Worker Setup Runbook

**Service:** viyo-worker
**Target URL:** api.viyo.new
**Authority:** R21 §5, Doc4 §2.2

---

## Step 1: Create the Render Web Service

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub account if not already connected
4. Select repository: **viyo-ai/VIYO**
5. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `viyo-worker` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | *(leave empty — Dockerfile is at `apps/worker/Dockerfile` but context is repo root)* |
| **Runtime** | Docker |
| **Dockerfile Path** | `apps/worker/Dockerfile` |
| **Docker Context** | `.` (repo root) |
| **Instance Type** | Starter ($7/mo) or Standard ($25/mo) |
| **Auto-Deploy** | Yes |

6. Click **Create Web Service**

---

## Step 2: Configure Health Check

1. Go to your service → **Settings** → **Health & Alerts**
2. Set:

| Setting | Value |
|---------|-------|
| **Health Check Path** | `/health` |
| **Health Check Timeout** | `5` seconds |
| **Health Check Interval** | `30` seconds |

---

## Step 3: Set Environment Variables

Go to your service → **Environment** → **Environment Variables** and add each of the following:

### Required Variables

```
NODE_ENV=production
PORT=3001
```

### Database (from Supabase Dashboard → Settings → Database)

```
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### Supabase Auth (from Supabase Dashboard → Settings → API)

```
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

### Credential Vault (generate with: `openssl rand -hex 32`)

```
VIYO_VAULT_KEY=[64-char hex string]
VIYO_VAULT_KEY_PREVIOUS=
```

### Inngest

```
INNGEST_EVENT_KEY=ve4MPukuTUZ1f7nYyMV-F0GJhIgwif0vQqiyLA9isvnKjS2KwS6MtftwF05qFrA1Jh0xuZsrFj6syCX1Bx2Xaw
INNGEST_SIGNING_KEY=signkey-prod-d29863204a1a84a108f02690429510cd7738a97a4314d5a59337e55bb76fa963
```

### Upstash Redis (for rate limiting)

```
UPSTASH_REDIS_REST_URL=https://evident-dory-67160.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAAQZYAAIgcDIzMjgxYTYyMzY4NTA0Y2FiOGQ1ZWMwZGZlNTYyNTgxNQ
```

### OpenTelemetry (optional — leave empty to disable)

```
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_SERVICE_NAME=viyo-worker
```

---

## Step 4: Get the Deploy Hook URL

1. Go to your service → **Settings** → **Build & Deploy**
2. Scroll to **Deploy Hook**
3. Click **Create Deploy Hook**
4. Name it: `github-actions`
5. Copy the URL (looks like: `https://api.render.com/deploy/srv-xxx?key=yyy`)

---

## Step 5: Add Deploy Hook to GitHub Secrets

1. Go to [https://github.com/viyo-ai/VIYO/settings/secrets/actions](https://github.com/viyo-ai/VIYO/settings/secrets/actions)
2. Click **New repository secret**
3. Name: `RENDER_DEPLOY_HOOK_URL`
4. Value: paste the deploy hook URL from Step 4
5. Click **Add secret**

---

## Step 6: Configure Custom Domain (api.viyo.new)

1. Go to your service → **Settings** → **Custom Domains**
2. Add domain: `api.viyo.new`
3. Render will provide DNS records to add:
   - Add a **CNAME** record: `api` → `[your-service].onrender.com`
4. Wait for SSL certificate provisioning (usually 5-10 minutes)

---

## Step 7: Configure Inngest

1. Go to [https://app.inngest.com](https://app.inngest.com)
2. Create a new app or select existing
3. Set the **Serve URL** to: `https://api.viyo.new/api/inngest`
4. The signing key is already configured in the env vars above

---

## Step 8: Verify Deployment

After the first deploy completes:

```bash
# Check health
curl https://api.viyo.new/health

# Expected response:
# {"status":"ok","timestamp":"...","version":"0.0.1","checks":{"database":{"status":"ok","latencyMs":...}}}

# Check Inngest endpoint
curl https://api.viyo.new/api/inngest

# Expected: Inngest SDK response (200)
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails: "pnpm not found" | Dockerfile uses `corepack enable` — ensure Docker build context is repo root |
| Health check fails | Check `PORT` env var is `3001` and health check path is `/health` |
| 503 on all routes | `DATABASE_URL` is likely missing or incorrect |
| Inngest returns 401 | `INNGEST_SIGNING_KEY` is missing or incorrect |
| Rate limiter returns 429 immediately | `UPSTASH_REDIS_REST_URL` is missing — falls back to in-memory store |

---

## GitHub Branch Protection (requires GitHub Pro)

Once you upgrade to GitHub Pro or make the repo public, run:

```bash
gh api repos/viyo-ai/VIYO/branches/main/protection -X PUT \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["quality-gate"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null
}
EOF
```

This enforces:
- All PRs must pass the CI quality-gate job before merge
- At least 1 approval required
- Stale approvals dismissed on new commits
- Branches must be up to date with main before merging
