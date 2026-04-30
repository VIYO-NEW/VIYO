# Vercel Setup Runbook

**Projects:** `viyo-web`, `viyo-admin`
**Canonical domains:** `viyo.new`, `www.viyo.new`, `staging.viyo.new`, `app.viyo.new`, `app.staging.viyo.new`, `admin.viyo.new`, `admin.staging.viyo.new`
**Authority:** Uploaded VIYO Complete Domain Map, R21 §3, Doc4 §0.3

---

## Current Domain Model

VIYO uses Vercel for browser-facing surfaces and Render for API surfaces. The Vercel domain model is split by product surface so the public website, logged-in Brands app, and internal admin portal can each have production and staging hostnames.

| Surface | Vercel Project | Production Domain | Staging Domain | Vercel Environment / Branch |
|---|---|---|---|---|
| Public marketing website | `viyo-web` | `https://viyo.new`, `https://www.viyo.new` | `https://staging.viyo.new` | Production on `main`; Preview branch domain on `develop` |
| Logged-in Brands app | `viyo-web` | `https://app.viyo.new` | `https://app.staging.viyo.new` | Production on `main`; Preview branch domain on `develop` |
| Internal admin portal | `viyo-admin` | `https://admin.viyo.new` | `https://admin.staging.viyo.new` | Production on `main`; Preview branch domain on `develop` |

The API domains are intentionally **not** configured in Vercel. `api.viyo.new` and `api.staging.viyo.new` belong to Render and must be added to Cloudflare only after Render supplies the exact custom-domain target.

---

## Step 1: Connect GitHub for Auto-Deploy

The Vercel projects must be connected to the canonical repository so production and staging deploys are triggered from the correct branches.

1. Go to [viyo-web Git settings](https://vercel.com/viyo-ai/viyo-web/settings/git).
2. Connect the GitHub repository `viyo-ai/VIYO` if it is not already connected.
3. Set **Root Directory** to `apps/web`.
4. Go to [viyo-admin Git settings](https://vercel.com/viyo-ai/viyo-admin/settings/git).
5. Connect the GitHub repository `viyo-ai/VIYO` if it is not already connected.
6. Set **Root Directory** to `apps/admin`.

Production deploys are expected from `main`. Staging domains are configured as Preview branch domains for `develop`, matching the repository staging lane.

---

## Step 2: Configure Custom Domains

### `viyo-web` domains

Add or verify the following domains in [viyo-web Domains settings](https://vercel.com/viyo-ai/viyo-web/settings/domains).

| Domain | Environment | Branch | Redirect |
|---|---|---|---|
| `viyo.new` | Production | `main` | Vercel may link with `www.viyo.new` as the canonical pair |
| `www.viyo.new` | Production | `main` | Pair with `viyo.new` according to Vercel recommendation |
| `app.viyo.new` | Production | `main` | No redirect unless product routing requires it |
| `staging.viyo.new` | Preview / Pre-Production | `develop` | No redirect |
| `app.staging.viyo.new` | Preview / Pre-Production | `develop` | No redirect |

### `viyo-admin` domains

Add or verify the following domains in [viyo-admin Domains settings](https://vercel.com/viyo-ai/viyo-admin/settings/domains).

| Domain | Environment | Branch | Redirect |
|---|---|---|---|
| `admin.viyo.new` | Production | `main` | No redirect |
| `admin.staging.viyo.new` | Preview / Pre-Production | `develop` | No redirect |

---

## Step 3: Configure Cloudflare DNS for Vercel Domains

All Vercel-facing records must be **DNS-only** in Cloudflare. Do not proxy these records unless Vercel explicitly supports and validates the chosen mode.

| Hostname | Type | Target | Proxy Mode |
|---|---|---|---|
| `viyo.new` | A | `76.76.21.21` | DNS-only |
| `www.viyo.new` | CNAME | `cname.vercel-dns.com` | DNS-only |
| `staging.viyo.new` | CNAME | `cname.vercel-dns.com` | DNS-only |
| `app.viyo.new` | CNAME | `cname.vercel-dns.com` | DNS-only |
| `app.staging.viyo.new` | CNAME | `cname.vercel-dns.com` | DNS-only |
| `admin.viyo.new` | CNAME | `cname.vercel-dns.com` | DNS-only |
| `admin.staging.viyo.new` | CNAME | `cname.vercel-dns.com` | DNS-only |

The canonical staging API hostname is `api.staging.viyo.new`; do not create retired hyphenated staging API aliases.

---

## Step 4: Environment Variables

Configure production variables in the Vercel Production environment and staging variables in the Vercel Preview/Staging environment. Do not copy production Supabase, API, Inngest, Redis, Sentry, or vault values into staging.

| Variable | Production Web/Admin Value | Staging Web/Admin Value |
|---|---|---|
| `VITE_SUPABASE_URL` | Production Supabase project URL | Staging Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Production anon key | Staging anon key |
| `VITE_APP_URL` | `https://app.viyo.new` for web; `https://admin.viyo.new` for admin if admin needs its own base URL | `https://app.staging.viyo.new` for web; `https://admin.staging.viyo.new` for admin if admin needs its own base URL |
| `VITE_API_URL` | `https://api.viyo.new` | `https://api.staging.viyo.new` |
| `VITE_SENTRY_DSN_WEB` | Production web Sentry DSN | Staging web Sentry DSN |
| `VITE_SENTRY_DSN_ADMIN` | Production admin Sentry DSN | Staging admin Sentry DSN |

Vite exposes only variables with the `VITE_` prefix to browser bundles. Treat DSNs as public identifiers but continue to keep auth tokens, service-role keys, Redis tokens, and database URLs out of Vercel client-side variables.

---

## Step 5: Preview and Staging Deployments

Preview deployments are automatic when GitHub is connected. The canonical staging domains must be assigned as Preview branch domains for `develop` so they resolve to the same staging code path every time.

| Branch | Expected Vercel Behavior |
|---|---|
| `main` | Production deployments for `viyo.new`, `www.viyo.new`, `app.viyo.new`, and `admin.viyo.new` |
| `develop` | Staging/Preview deployments for `staging.viyo.new`, `app.staging.viyo.new`, and `admin.staging.viyo.new` |
| Pull request branches | Ephemeral preview URLs under Vercel-generated hostnames |

---

## Verify

Run these checks after Cloudflare propagation and Vercel SSL provisioning complete.

```bash
# Production web and admin
curl -I https://viyo.new
curl -I https://www.viyo.new
curl -I https://app.viyo.new
curl -I https://admin.viyo.new

# Staging web and admin
curl -I https://staging.viyo.new
curl -I https://app.staging.viyo.new
curl -I https://admin.staging.viyo.new

# DNS shape
for host in viyo.new www.viyo.new staging.viyo.new app.viyo.new app.staging.viyo.new admin.viyo.new admin.staging.viyo.new; do
  echo "=== ${host} ==="
  dig +short "${host}"
done
```

Passing evidence requires Vercel to show valid domain configuration, issued SSL certificates, and the correct environment/branch assignment for each hostname.
