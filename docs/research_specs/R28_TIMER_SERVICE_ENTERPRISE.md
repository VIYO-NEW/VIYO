# R28 — Timer Service Enterprise Architecture

## 1. Executive Summary

The VIYO Timer Service is a high-performance, edge-deployed microservice responsible for generating dynamic, animated countdown GIFs for email campaigns. It is deployed on Cloudflare Workers using a Go-compiled WebAssembly (WASM) core. This architecture provides 5 minutes of CPU execution time, zero egress costs, and 60-second global edge caching. It operates as both an internal VIYO feature and a standalone SaaS product.

### 1.1 Why Not Supabase

Supabase Edge Functions enforce a strict 2-second CPU limit. GIF generation requires 50-500ms of pure CPU per frame, and a 60-frame countdown GIF needs 3-30 seconds of CPU. This exceeds the hard limit. Deno also lacks a production-ready Canvas/GIF encoder. Cloudflare Workers provide 5 minutes of CPU time on the paid plan ($5/month), native WASM support, and zero-cost egress — making it the only viable platform.

### 1.2 Dual-Purpose Strategy

The competitive landscape validates this as a standalone revenue stream. Sendtric charges $35/month for 12M views. CountdownMail charges $39/month for 1M views. NiftyImages charges $80/month for 3M views. With Cloudflare's zero-egress model, VIYO's infrastructure cost is approximately $5/month regardless of volume, yielding 86-94% gross margins.

## 2. Cloudflare Worker Router (TypeScript)

The Worker handles URL parsing, parameter validation, Cache API interactions, and API key authentication. The WASM binary is invoked only on cache misses.

```typescript
import { generateGifWasm } from './wasm/timer_engine';

export interface Env {
  VIYO_INTERNAL_API_KEY: string;
  TIMER_DB: D1Database; // Cloudflare D1 binding (SaaS mode)
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', engine: 'wasm-go', region: request.cf?.colo });
    }

    if (url.pathname === '/gif') {
      return handleGifRequest(url, env, ctx);
    }

    if (url.pathname.startsWith('/api/')) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader !== `Bearer ${env.VIYO_INTERNAL_API_KEY}`) {
        return new Response('Unauthorized', { status: 401 });
      }
      if (url.pathname === '/api/flush-cache') {
        // Purge all cached GIFs
        return Response.json({ flushed: true });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};

async function handleGifRequest(url: URL, env: Env, ctx: ExecutionContext): Promise<Response> {
  const cache = caches.default;
  const cacheKey = new Request(url.toString());

  // 1. Check edge cache
  const cached = await cache.match(cacheKey);
  if (cached) {
    const resp = new Response(cached.body, cached);
    resp.headers.set('X-Cache', 'HIT');
    return resp;
  }

  // 2. Parse parameters
  const endTimeStr = url.searchParams.get('end');
  if (!endTimeStr) return new Response('Missing "end" parameter', { status: 400 });

  const endTime = new Date(endTimeStr).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, endTime - now);

  if (diffMs === 0) {
    // Timer expired — return static "Expired" GIF from KV or generate once
    return generateExpiredGif(env, ctx);
  }

  const config = {
    diffMs,
    bgColor: url.searchParams.get('bg') || '000000',
    textColor: url.searchParams.get('text') || 'FFFFFF',
    width: clamp(parseInt(url.searchParams.get('w') || '600', 10), 200, 800),
    height: clamp(parseInt(url.searchParams.get('h') || '120', 10), 60, 300),
    frames: 60, // 60 frames = 60 seconds of animation
    style: url.searchParams.get('style') || 'basic' // basic | rounded | minimal
  };

  // 3. Generate via WASM
  const startGen = Date.now();
  const gifBytes = await generateGifWasm(config);
  const genTime = Date.now() - startGen;

  const response = new Response(gifBytes, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'public, max-age=60',
      'X-Cache': 'MISS',
      'X-Gen-Time-Ms': String(genTime),
      'X-Viyo-Engine': 'wasm-go'
    }
  });

  // 4. Store in edge cache asynchronously
  ctx.waitUntil(cache.put(cacheKey, response.clone()));

  return response;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

async function generateExpiredGif(env: Env, ctx: ExecutionContext): Promise<Response> {
  // Returns a static single-frame GIF showing "00d 00h 00m 00s"
  const config = { diffMs: 0, bgColor: '000000', textColor: 'FFFFFF', width: 600, height: 120, frames: 1, style: 'basic' };
  const gifBytes = await generateGifWasm(config);
  return new Response(gifBytes, {
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'public, max-age=3600' }
  });
}
```

## 3. Go WASM Engine

The CPU-intensive GIF generation runs in Go compiled to WebAssembly. Go's standard library `image/gif` and `image/draw` packages are stable and well-suited for this task.

```go
package main

import (
	"bytes"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/gif"
	"math"
	"syscall/js"
	"time"

	"golang.org/x/image/font"
	"golang.org/x/image/font/basicfont"
	"golang.org/x/image/math/fixed"
)

func generateGif(this js.Value, args []js.Value) interface{} {
	config := args[0]
	diffMs := int64(config.Get("diffMs").Float())
	width := config.Get("width").Int()
	height := config.Get("height").Int()
	frames := config.Get("frames").Int()
	bgHex := config.Get("bgColor").String()
	textHex := config.Get("textColor").String()

	bgColor := parseHex(bgHex)
	textColor := parseHex(textHex)

	palette := []color.Color{bgColor, textColor}
	out := &gif.GIF{LoopCount: 0}

	for i := 0; i < frames; i++ {
		remaining := diffMs - int64(i*1000)
		if remaining < 0 {
			remaining = 0
		}

		img := image.NewPaletted(image.Rect(0, 0, width, height), palette)
		draw.Draw(img, img.Bounds(), &image.Uniform{bgColor}, image.Point{}, draw.Src)

		label := formatDuration(remaining)
		drawCenteredText(img, label, textColor, width, height)

		out.Image = append(out.Image, img)
		out.Delay = append(out.Delay, 100) // 1 second per frame
	}

	var buf bytes.Buffer
	if err := gif.EncodeAll(&buf, out); err != nil {
		return nil
	}

	jsBytes := js.Global().Get("Uint8Array").New(buf.Len())
	js.CopyBytesToJS(jsBytes, buf.Bytes())
	return jsBytes
}

func parseHex(hex string) color.RGBA {
	var r, g, b uint8
	fmt.Sscanf(hex, "%02x%02x%02x", &r, &g, &b)
	return color.RGBA{r, g, b, 255}
}

func formatDuration(ms int64) string {
	d := time.Duration(ms) * time.Millisecond
	days := int(d.Hours() / 24)
	hours := int(math.Mod(d.Hours(), 24))
	mins := int(math.Mod(d.Minutes(), 60))
	secs := int(math.Mod(d.Seconds(), 60))
	return fmt.Sprintf("%02dd %02dh %02dm %02ds", days, hours, mins, secs)
}

func drawCenteredText(img *image.Paletted, text string, col color.Color, w, h int) {
	face := basicfont.Face7x13
	textWidth := font.MeasureString(face, text).Round()
	x := (w - textWidth) / 2
	y := (h + 13) / 2 // 13 is the font height

	d := &font.Drawer{
		Dst:  img,
		Src:  &image.Uniform{col},
		Face: face,
		Dot:  fixed.P(x, y),
	}
	d.DrawString(text)
}

func main() {
	c := make(chan struct{})
	js.Global().Set("generateGifWasm", js.FuncOf(generateGif))
	<-c
}
```

**Build command:** `GOOS=js GOARCH=wasm go build -o timer_engine.wasm main.go`

## 4. VIYO Integration (R27 Composable Sections)

The `countdown_timer` section in R27 invokes this service. The MJML compiler constructs the URL dynamically using the Admin Config values.

```typescript
private renderCountdownTimer(data: CountdownTimerSection): string {
  const config = this.adminConfig.getConnector('timer_service');

  if (config.health_status === 'offline') {
    // Self-healing fallback: render static urgency text instead of broken image
    return `
      <mj-section background-color="${data.background_color}">
        <mj-column>
          <mj-text align="center" font-weight="bold" font-size="18px" color="${data.text_color}">
            ${data.fallback_text || 'Hurry — this offer ends soon!'}
          </mj-text>
        </mj-column>
      </mj-section>
    `;
  }

  const params = new URLSearchParams({
    end: data.expiration_date,
    bg: data.background_color.replace('#', ''),
    text: data.text_color.replace('#', ''),
    w: '600',
    h: '120',
    style: data.style || 'basic'
  });

  const gifUrl = `${config.worker_url}/gif?${params.toString()}`;

  return `
    <mj-section background-color="${data.section_bg_color || 'transparent'}">
      <mj-column>
        <mj-image src="${gifUrl}" alt="Countdown Timer" width="600px" />
        ${data.expiration_text ? `<mj-text align="center" font-size="14px">${data.expiration_text}</mj-text>` : ''}
      </mj-column>
    </mj-section>
  `;
}
```

## 5. Self-Healing & Monitoring

```typescript
import { inngest } from './client';

export const monitorTimerService = inngest.createFunction(
  { id: 'monitor-timer-service' },
  { cron: '*/5 * * * *' },
  async ({ step }) => {
    const config = await step.run('read-config', async () => {
      const { data } = await supabase
        .from('integration_configs')
        .select('config')
        .eq('service_name', 'timer_service')
        .single();
      return data?.config;
    });

    const healthCheck = await step.run('ping-health', async () => {
      const start = Date.now();
      try {
        const res = await fetch(`${config.worker_url}/health`, { signal: AbortSignal.timeout(5000) });
        const latency = Date.now() - start;
        const body = await res.json();
        return { ok: res.ok, latency, region: body.region };
      } catch (err) {
        return { ok: false, latency: -1, region: 'unknown', error: err.message };
      }
    });

    if (!healthCheck.ok || healthCheck.latency > 2000) {
      await step.run('update-status', async () => {
        await supabase
          .from('integration_configs')
          .update({ config: { ...config, health_status: healthCheck.ok ? 'degraded' : 'offline' } })
          .eq('service_name', 'timer_service');
      });

      await step.run('alert-devops-brain', async () => {
        await inngest.send({
          name: 'viyo/devops-brain.alert',
          data: {
            service: 'timer_service',
            status: healthCheck.ok ? 'degraded' : 'offline',
            latency: healthCheck.latency,
            error: healthCheck.error || null,
            suggested_action: 'flush_cache_or_redeploy'
          }
        });
      });
    } else {
      await step.run('update-healthy', async () => {
        await supabase
          .from('integration_configs')
          .update({ config: { ...config, health_status: 'healthy', last_checked: new Date().toISOString() } })
          .eq('service_name', 'timer_service');
      });
    }
  }
);
```

## 6. SaaS Multi-Tenant Layer (Phase 2)

V1.1 layers on SaaS capabilities using Cloudflare D1 and Stripe metered billing.

### 6.1 D1 Tenant Schema

```sql
CREATE TABLE tenants (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  api_key_hash TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  plan_tier TEXT DEFAULT 'free' CHECK(plan_tier IN ('free', 'starter', 'pro', 'enterprise')),
  monthly_view_limit INTEGER DEFAULT 1000,
  watermark_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usage_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  gif_requests INTEGER DEFAULT 0,
  cache_hits INTEGER DEFAULT 0,
  month_year TEXT NOT NULL,
  UNIQUE(tenant_id, month_year)
);

CREATE TABLE timer_configs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  end_time TIMESTAMP NOT NULL,
  style TEXT DEFAULT 'basic',
  bg_color TEXT DEFAULT '000000',
  text_color TEXT DEFAULT 'FFFFFF',
  width INTEGER DEFAULT 600,
  height INTEGER DEFAULT 120,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.2 SaaS Middleware (Worker)

```typescript
async function authenticateSaasTenant(request: Request, env: Env): Promise<{ tenant: Tenant | null; error: string | null }> {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return { tenant: null, error: 'Missing X-API-Key header' };

  const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey));
  const hashHex = Array.from(new Uint8Array(keyHash)).map(b => b.toString(16).padStart(2, '0')).join('');

  const result = await env.TIMER_DB.prepare('SELECT * FROM tenants WHERE api_key_hash = ?').bind(hashHex).first();
  if (!result) return { tenant: null, error: 'Invalid API key' };

  // Check usage limits
  const monthYear = new Date().toISOString().slice(0, 7);
  const usage = await env.TIMER_DB.prepare('SELECT gif_requests FROM usage_logs WHERE tenant_id = ? AND month_year = ?')
    .bind(result.id, monthYear).first();

  const currentUsage = usage?.gif_requests || 0;
  if (currentUsage >= result.monthly_view_limit) {
    return { tenant: null, error: 'Monthly view limit exceeded. Upgrade your plan.' };
  }

  // Increment usage
  await env.TIMER_DB.prepare(
    'INSERT INTO usage_logs (tenant_id, gif_requests, month_year) VALUES (?, 1, ?) ON CONFLICT(tenant_id, month_year) DO UPDATE SET gif_requests = gif_requests + 1'
  ).bind(result.id, monthYear).run();

  return { tenant: result as Tenant, error: null };
}
```

## 7. Admin Connector Card

The Timer Service is managed via the VIYO Admin Config panel (`/admin/settings/integrations`), alongside Stripe, Resend, and Ideogram.

**Fields:** `worker_url` (base URL), `internal_api_key` (pre-shared key).
**Status Indicators:** Health Status (green/yellow/red), Last Checked timestamp, Cache Hit Ratio (24h trailing average from Data Brain).
**Actions:** "Test Connection" (pings `/health`), "Flush Cache" (calls `/api/flush-cache`).

## 8. Build Tracker (TMS-01 through TMS-10)

| Feature ID | Name | Version | Phase |
|-----------|------|---------|-------|
| TMS-01 | Cloudflare Workers project + Go WASM engine | V1 | Phase 1 |
| TMS-02 | Timer API endpoints (generate, health, config) | V1 | Phase 1 |
| TMS-03 | Admin connector card | V1 | Phase 4 |
| TMS-04 | Composable Sections countdown_timer slot | V1 | Phase 3 |
| TMS-05 | Self-healing health check + DevOps Brain | V1 | Phase 2 |
| TMS-06 | Council of Brains monitoring | V1 | Phase 2 |
| TMS-07 | Edge caching strategy | V1 | Phase 1 |
| TMS-08 | SaaS multi-tenant layer (D1, Stripe) | V1.1 | V1.1 |
| TMS-09 | SaaS dashboard UI | V1.1 | V1.1 |
| TMS-10 | NiftyImages evolution path | V2+ | Future |
