# R25 — Video/IG Ingestion Module Enterprise Spec

## 1. Executive Summary
The Video/IG Ingestion Module allows VIYO to reverse-engineer competitor emails and video ads into reusable Composable Sections. It uses a hybrid architecture: an OpenClaw skill running locally extracts keyframes and audio, while the VIYO cloud backend (Gemini 1.5 Pro) performs the strategic extraction and maps the content to VIYO's section registry.

## 2. Hybrid Architecture Overview

### 2.1 Local Extraction (OpenClaw Skill)
The OpenClaw skill runs on the user's machine (or a worker node) to bypass bot-protection and DRM on platforms like Instagram and TikTok.

```python
import cv2
import whisper
import json
import requests
import os

def process_video(video_path, api_key):
    # 1. Extract keyframes (1 per second)
    vidcap = cv2.VideoCapture(video_path)
    success, image = vidcap.read()
    count = 0
    keyframes = []
    
    while success:
        if count % int(vidcap.get(cv2.CAP_PROP_FPS)) == 0:
            frame_path = f"/tmp/frame_{count}.jpg"
            cv2.imwrite(frame_path, image)
            keyframes.append(frame_path)
        success, image = vidcap.read()
        count += 1
        
    # 2. Extract and transcribe audio
    audio_path = "/tmp/audio.wav"
    os.system(f"ffmpeg -i {video_path} -q:a 0 -map a {audio_path} -y")
    
    model = whisper.load_model("base")
    result = model.transcribe(audio_path)
    transcript = result["text"]
    
    # 3. Send to VIYO Cloud
    payload = {
        "transcript": transcript,
        "video_duration": count / vidcap.get(cv2.CAP_PROP_FPS),
        "source": "instagram_reels"
    }
    
    files = [('keyframes', (os.path.basename(f), open(f, 'rb'), 'image/jpeg')) for f in keyframes]
    
    response = requests.post(
        "https://api.viyo.app/v1/ingest/video",
        headers={"Authorization": f"Bearer {api_key}"},
        data=payload,
        files=files
    )
    
    return response.json()
```

## 3. VIYO Cloud API Integration

### 3.1 Ingestion Endpoint (Next.js / FastAPI)
Receives the payload from the OpenClaw skill and triggers the asynchronous processing job.

```typescript
import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest';
import { supabase } from '@/lib/supabase';
import { uploadToStorage } from '@/lib/storage';

export async function POST(req: Request) {
  const formData = await req.formData();
  const transcript = formData.get('transcript') as string;
  const source = formData.get('source') as string;
  const orgId = req.headers.get('x-org-id') as string;
  
  // 1. Upload keyframes to secure storage
  const keyframes = formData.getAll('keyframes') as File[];
  const keyframeUrls = await Promise.all(
    keyframes.map(file => uploadToStorage(file, `ingest/${orgId}`))
  );
  
  // 2. Create ingestion record
  const { data: record } = await supabase.from('video_ingestions').insert({
    org_id: orgId,
    source,
    transcript,
    keyframe_urls: keyframeUrls,
    status: 'processing'
  }).select().single();
  
  // 3. Trigger Inngest job for Gemini analysis
  await inngest.send({
    name: 'video/process.intelligence',
    data: { ingestionId: record.id, orgId }
  });
  
  return NextResponse.json({ status: 'processing', ingestionId: record.id });
}
```

## 4. Top Brain Analysis Prompt (Gemini 1.5 Pro)
This prompt instructs Gemini to analyze the transcript and keyframes, mapping them to VIYO's 32 Composable Section types.

```typescript
const EXTRACTION_PROMPT = `
You are an expert Direct-to-Consumer (DTC) email marketer and copywriter.
Analyze the provided video transcript and sequence of keyframes.

Your goal is to reverse-engineer this video ad into a high-converting email structure using ONLY the following allowed section types:
[hero_standard, product_feature_highlight, educational_ingredients, benefit_icon_row, social_proof_text, testimonial_with_photo, promo_badge, countdown_timer, footer_standard]

For each section you identify:
1. Choose the appropriate section type.
2. Write the headline, body copy, and CTA text based on the video's messaging.
3. Describe the ideal image that should be generated for this section (be specific about lighting, product placement, and mood).

Return the result as a strict JSON array of section objects matching this schema:
{
  "sections": [
    {
      "type": "string",
      "headline": "string",
      "body": "string",
      "cta_text": "string",
      "image_prompt": "string"
    }
  ]
}
`;
```

## 5. Inngest Job: Process Video Intelligence
Orchestrates the Gemini API call and updates the database.

```typescript
import { inngest } from '@/lib/inngest';
import { supabase } from '@/lib/supabase';
import { generateContent } from '@/lib/gemini';

export const processVideoIntelligence = inngest.createFunction(
  { id: 'process-video-intelligence' },
  { event: 'video/process.intelligence' },
  async ({ event, step }) => {
    const { ingestionId, orgId } = event.data;
    
    // 1. Fetch ingestion data
    const { data: ingestion } = await supabase
      .from('video_ingestions')
      .select('*')
      .eq('id', ingestionId)
      .single();
      
    // 2. Call Gemini 1.5 Pro (Multimodal)
    const extractionResult = await step.run('gemini-extraction', async () => {
      return await generateContent({
        model: 'gemini-1.5-pro',
        prompt: EXTRACTION_PROMPT,
        text: ingestion.transcript,
        images: ingestion.keyframe_urls
      });
    });
    
    // 3. Save extracted sections
    await step.run('save-sections', async () => {
      await supabase.from('video_ingestions').update({
        status: 'completed',
        extracted_sections: JSON.parse(extractionResult),
        completed_at: new Date().toISOString()
      }).eq('id', ingestionId);
    });
    
    return { success: true, ingestionId };
  }
);
```
