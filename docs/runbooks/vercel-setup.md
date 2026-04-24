# Vercel Setup Runbook

**Projects:** viyo-web, viyo-admin
**Target URLs:** app.viyo.new, admin.viyo.new
**Authority:** R21 §3, Doc4 §0.3

---

## Current Status

Both Vercel projects are created and deployed:

| Project | Vercel URL | Custom Domain (pending) |
|---------|-----------|------------------------|
| viyo-web | https://viyo-web.vercel.app | app.viyo.new |
| viyo-admin | https://viyo-admin.vercel.app | admin.viyo.new |

---

## Step 1: Connect GitHub for Auto-Deploy

The projects were created via API without GitHub integration. To enable auto-deploy on push:

1. Go to [https://vercel.com/viyo-ai/viyo-web/settings/git](https://vercel.com/viyo-ai/viyo-web/settings/git)
2. Click **Connect Git Repository**
3. Select **GitHub** → authorize Vercel if prompted
4. Select repository: **viyo-ai/VIYO**
5. Set **Root Directory**: `apps/web`
6. Repeat for viyo-admin:
   - Go to [https://vercel.com/viyo-ai/viyo-admin/settings/git](https://vercel.com/viyo-ai/viyo-admin/settings/git)
   - Connect to **viyo-ai/VIYO**
   - Set **Root Directory**: `apps/admin`

After connecting, every push to `main` will auto-deploy both apps.

---

## Step 2: Configure Custom Domains

### For viyo-web (app.viyo.new):

1. Go to [https://vercel.com/viyo-ai/viyo-web/settings/domains](https://vercel.com/viyo-ai/viyo-web/settings/domains)
2. Add domain: `app.viyo.new`
3. Add DNS record at your domain registrar:
   - Type: **CNAME**
   - Name: `app`
   - Value: `cname.vercel-dns.com`

### For viyo-admin (admin.viyo.new):

1. Go to [https://vercel.com/viyo-ai/viyo-admin/settings/domains](https://vercel.com/viyo-ai/viyo-admin/settings/domains)
2. Add domain: `admin.viyo.new`
3. Add DNS record at your domain registrar:
   - Type: **CNAME**
   - Name: `admin`
   - Value: `cname.vercel-dns.com`

---

## Step 3: Environment Variables (when needed)

Currently the web and admin apps are static SPAs with no server-side env vars needed. When you add Supabase client-side auth:

1. Go to project → **Settings** → **Environment Variables**
2. Add:

```
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
VITE_API_URL=https://api.viyo.new
```

Note: Vite requires `VITE_` prefix for client-side env vars.

---

## Step 4: Preview Deployments

Preview deployments are automatic when GitHub is connected:
- Every PR gets a unique preview URL
- Preview URLs follow the pattern: `viyo-web-[hash]-viyo-ai.vercel.app`
- Comments are posted on the PR with the preview link

---

## Verify

```bash
# Check viyo-web
curl -s -o /dev/null -w "HTTP: %{http_code}\n" https://viyo-web.vercel.app
# Expected: 200

# Check viyo-admin
curl -s -o /dev/null -w "HTTP: %{http_code}\n" https://viyo-admin.vercel.app
# Expected: 200
```
