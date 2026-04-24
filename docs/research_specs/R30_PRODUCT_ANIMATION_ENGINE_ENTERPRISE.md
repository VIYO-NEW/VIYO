# R30 — Product Animation Engine Enterprise Architecture

## 1. Executive Summary

The VIYO Product Animation Engine (PAE) transforms static product photography into high-converting, animated GIFs optimized for email. In DTC email marketing, motion significantly increases click-through rates, but creating animated assets is traditionally a manual, time-consuming process requiring specialized design software. The PAE automates this entirely. It operates as an asynchronous microservice that ingests a static product image, automatically removes the background using AI, applies physics-based CSS/Canvas transformations (e.g., bounce, spin, float, pulse), and encodes the result into a highly optimized, looping GIF that adheres to strict email file size constraints (<1MB).

## 2. Core Architecture

The PAE is built as a serverless worker pipeline (Cloudflare Workers / AWS Lambda) to handle the CPU-intensive tasks of image processing and GIF encoding without blocking the main API.

### 2.1 The Animation Pipeline

The pipeline consists of four distinct stages:

1. **Ingestion & Isolation:** The engine receives a static image URL. It uses an AI background removal service (e.g., `rembg` or an external API like Photoroom) to isolate the product, returning a transparent PNG.
2. **Physics Simulation (Canvas API):** The transparent PNG is loaded into a virtual HTML5 Canvas environment (via `canvas` for Node.js). Mathematical transformations are applied frame-by-frame to simulate physical motion.
3. **Frame Rendering:** The engine renders a specific number of frames (typically 30-60 frames, representing 1-2 seconds of animation at 30fps) to create a smooth loop.
4. **Optimization & Encoding:** The rendered frames are streamed through a quantization encoder (`gif-encoder-2`) with palette reduction to produce an optimized GIF that minimizes file size while maximizing visual fidelity.

### 2.2 Pipeline Orchestration (Inngest)

```typescript
import { inngest } from './client';
import { removeBackground } from './services/bg-removal';
import { generateAnimation } from './services/animation';
import { uploadToCdn } from './services/storage';
import { supabase } from './supabase';

export const processProductAnimation = inngest.createFunction(
  { id: 'pae/process-animation', retries: 2 },
  { event: 'product.animation.requested' },
  async ({ event, step }) => {
    const { productId, sourceImageUrl, preset, brandId } = event.data;

    // Step 1: Isolate Product
    const isolatedImageUrl = await step.run('isolate-product', async () => {
      return await removeBackground(sourceImageUrl);
    });

    // Step 2 & 3 & 4: Render and Encode
    const gifBuffer = await step.run('generate-gif', async () => {
      return await generateAnimation(isolatedImageUrl, preset);
    });

    // Step 5: Store and Update Registry
    const finalUrl = await step.run('store-and-update', async () => {
      const cdnUrl = await uploadToCdn(gifBuffer, `brands/${brandId}/products/${productId}_${preset}.gif`);
      
      await supabase.from('product_assets').insert({
        product_id: productId,
        brand_id: brandId,
        asset_type: 'animated_gif',
        url: cdnUrl,
        preset: preset
      });
      
      return cdnUrl;
    });

    return { status: 'completed', url: finalUrl };
  }
);
```

## 3. Animation Presets & Physics Engine

The engine supports predefined animation presets designed specifically for DTC products (e.g., supplements, apparel, cosmetics).

### 3.1 Preset Registry

```typescript
export type AnimationPresetType = 'bounce' | 'spin' | 'float' | 'pulse' | 'swing';

export interface AnimationConfig {
  frames: number;
  fps: number;
  width: number;
  height: number;
  quality: number; // 1-10 (lower is better quality but slower encoding)
}

export const PRESET_CONFIGS: Record<AnimationPresetType, AnimationConfig> = {
  bounce: { frames: 45, fps: 30, width: 400, height: 400, quality: 10 },
  spin: { frames: 60, fps: 30, width: 400, height: 400, quality: 10 },
  float: { frames: 60, fps: 30, width: 400, height: 400, quality: 10 },
  pulse: { frames: 30, fps: 30, width: 400, height: 400, quality: 10 },
  swing: { frames: 45, fps: 30, width: 400, height: 400, quality: 10 }
};
```

### 3.2 Physics Implementation

Each preset relies on a pure mathematical function to determine the translation, scale, or rotation of the product image at any given frame, ensuring a perfect, seamless loop.

```typescript
import { CanvasRenderingContext2D, Image } from 'canvas';

export class AnimationPhysics {
  
  /**
   * Applies a bouncing physics effect with a dynamic drop shadow.
   * Uses a sine wave for the easing curve.
   */
  static applyBounce(ctx: CanvasRenderingContext2D, image: Image, frame: number, totalFrames: number, width: number, height: number) {
    const progress = frame / totalFrames;
    // Sine wave creates the bounce arc. Multiplier controls height.
    const yOffset = Math.abs(Math.sin(progress * Math.PI * 2)) * -60; 
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw dynamic shadow (scales inversely with bounce height)
    const shadowWidth = 120 + (yOffset * 0.6);
    const shadowHeight = 25 + (yOffset * 0.15);
    const shadowAlpha = 0.3 + (yOffset * 0.003); // Fades as product goes up
    
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0, shadowAlpha)})`;
    ctx.beginPath();
    ctx.ellipse(width / 2, height - 40, Math.max(10, shadowWidth), Math.max(5, shadowHeight), 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw product image centered, applying the Y offset
    const imgWidth = 250;
    const imgHeight = 250;
    const xPos = (width - imgWidth) / 2;
    const yPos = (height - imgHeight) / 2 - 20 + yOffset;
    
    ctx.drawImage(image, xPos, yPos, imgWidth, imgHeight);
  }

  /**
   * Applies a smooth floating/hovering effect.
   */
  static applyFloat(ctx: CanvasRenderingContext2D, image: Image, frame: number, totalFrames: number, width: number, height: number) {
    const progress = frame / totalFrames;
    // Cosine wave for smooth up/down hovering
    const yOffset = Math.cos(progress * Math.PI * 2) * 15;
    
    ctx.clearRect(0, 0, width, height);
    
    // Static soft shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(width / 2, height - 40, 100, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    const imgWidth = 250;
    const imgHeight = 250;
    const xPos = (width - imgWidth) / 2;
    const yPos = (height - imgHeight) / 2 - 20 + yOffset;
    
    ctx.drawImage(image, xPos, yPos, imgWidth, imgHeight);
  }

  /**
   * Applies a pulsing (scale up/down) effect.
   */
  static applyPulse(ctx: CanvasRenderingContext2D, image: Image, frame: number, totalFrames: number, width: number, height: number) {
    const progress = frame / totalFrames;
    // Scale ranges from 1.0 to 1.15
    const scale = 1.0 + (Math.sin(progress * Math.PI * 2) + 1) / 2 * 0.15;
    
    ctx.clearRect(0, 0, width, height);
    
    const imgWidth = 250 * scale;
    const imgHeight = 250 * scale;
    const xPos = (width - imgWidth) / 2;
    const yPos = (height - imgHeight) / 2;
    
    ctx.drawImage(image, xPos, yPos, imgWidth, imgHeight);
  }
}
```

## 4. GIF Encoding and Optimization

The rendering engine orchestrates the canvas drawing and pipes the frames into the NeuQuant neural-net image quantization algorithm to produce the GIF.

```typescript
import GIFEncoder from 'gif-encoder-2';
import { createCanvas, loadImage } from 'canvas';

export async function generateAnimation(imageUrl: string, presetType: AnimationPresetType): Promise<Buffer> {
  const config = PRESET_CONFIGS[presetType];
  if (!config) throw new Error(`Invalid preset: ${presetType}`);

  // Initialize Encoder
  const encoder = new GIFEncoder(config.width, config.height, 'neuquant', true);
  encoder.start();
  encoder.setRepeat(0); // 0 = infinite loop
  encoder.setDelay(Math.round(1000 / config.fps));
  encoder.setQuality(config.quality);
  
  // Set transparency
  encoder.setTransparent(0x00000000);

  const canvas = createCanvas(config.width, config.height);
  const ctx = canvas.getContext('2d');
  
  // Load isolated image
  const image = await loadImage(imageUrl);
  
  // Render frames
  for (let i = 0; i < config.frames; i++) {
    switch (presetType) {
      case 'bounce':
        AnimationPhysics.applyBounce(ctx, image, i, config.frames, config.width, config.height);
        break;
      case 'float':
        AnimationPhysics.applyFloat(ctx, image, i, config.frames, config.width, config.height);
        break;
      case 'pulse':
        AnimationPhysics.applyPulse(ctx, image, i, config.frames, config.width, config.height);
        break;
      // Other presets fall back to static image for safety
      default:
        ctx.clearRect(0, 0, config.width, config.height);
        ctx.drawImage(image, (config.width - 250)/2, (config.height - 250)/2, 250, 250);
    }
    
    // Add rendered canvas frame to GIF
    encoder.addFrame(ctx as any);
  }
  
  encoder.finish();
  return encoder.out.getData();
}
```

## 5. UI/UX Integration (R17)

The Animation Engine integrates directly into the VIYO Email Canvas (R17).

### 5.1 The "Animate" Control

When a user selects a Product Block in the canvas, the properties panel displays an "Animation" section.
1. **Toggle:** "Enable Motion" (Default: Off)
2. **Preset Selector:** Dropdown containing "Bounce", "Float", "Pulse", etc.
3. **Preview:** A live preview of the generated GIF.

### 5.2 Component Implementation

```tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

interface ProductAnimationControlsProps {
  productId: string;
  sourceImageUrl: string;
  currentAssetUrl?: string;
  onAssetUpdated: (url: string) => void;
}

export function ProductAnimationControls({ productId, sourceImageUrl, currentAssetUrl, onAssetUpdated }: ProductAnimationControlsProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('bounce');

  const generateMutation = useMutation({
    mutationFn: async (preset: string) => {
      const res = await fetch('/api/products/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, sourceImageUrl, preset })
      });
      if (!res.ok) throw new Error('Failed to generate animation');
      return res.json();
    },
    onSuccess: (data) => {
      // Polling or WebSocket would be used here in production to wait for the Inngest job
      // For simplicity, assuming immediate return of the URL or a placeholder
      onAssetUpdated(data.url);
    }
  });

  return (
    <div className="p-4 border rounded-md bg-gray-50 space-y-4">
      <h3 className="text-sm font-medium text-gray-900">Product Motion</h3>
      
      <div className="flex flex-col space-y-2">
        <label className="text-xs text-gray-600">Animation Style</label>
        <select 
          value={selectedPreset}
          onChange={(e) => setSelectedPreset(e.target.value)}
          className="text-sm border-gray-300 rounded-md"
        >
          <option value="bounce">Bounce</option>
          <option value="float">Float</option>
          <option value="pulse">Pulse</option>
        </select>
      </div>

      <button 
        onClick={() => generateMutation.mutate(selectedPreset)}
        disabled={generateMutation.isPending}
        className="w-full py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        {generateMutation.isPending ? 'Generating...' : 'Apply Animation'}
      </button>

      {currentAssetUrl && (
        <div className="mt-4 p-2 border bg-white rounded flex justify-center">
          <img src={currentAssetUrl} alt="Animated Product" className="max-h-32 object-contain" />
        </div>
      )}
    </div>
  );
}
```

## 6. Global Wiring Map (R18) & Dependencies

| Component | Dependency Direction | Description |
|-----------|----------------------|-------------|
| **R31 Product Data Extraction** | R31 -> R30 | R31 provides the raw `sourceImageUrl` that R30 ingests. |
| **R27 Composable Sections** | R30 -> R27 | R27 templates consume the output GIF URL via the `viyo.item.image_url` tag. |
| **R17 UI/UX Architecture** | R17 <-> R30 | R17 provides the interface to trigger R30, and displays the result. |

## 7. Self-Healing & Fallbacks

To ensure email deliverability is never compromised by an animation failure:

1. **Timeout Fallback:** If the Inngest job fails to produce a GIF within 45 seconds, the system automatically falls back to the static `sourceImageUrl`.
2. **Size Fallback:** If the generated GIF exceeds 1.5MB (the strict cutoff for email clients like Gmail before clipping occurs), the system will automatically re-run the encoder with a lower frame rate (e.g., 15fps) or lower quality setting to compress it further. If it still fails, it falls back to static.

## 8. Build Tracker (PAE-01 through PAE-05)

| Feature ID | Name | Version | Phase | Dependencies |
|-----------|------|---------|-------|-------------|
| PAE-01 | Background Isolation Service | V1 | Phase 1 | None |
| PAE-02 | Canvas Physics Engine (Bounce, Float, Pulse) | V1 | Phase 1 | None |
| PAE-03 | GIF Encoder & Optimization Pipeline | V1 | Phase 1 | PAE-02 |
| PAE-04 | Inngest Orchestration Worker | V1 | Phase 2 | PAE-01, PAE-03 |
| PAE-05 | R17 UI Controls & Preview Component | V1 | Phase 2 | PAE-04 |
