/**
 * Zero-Shot Fallback Prompt Builder — T46
 *
 * v6.1 requires cache misses to trigger the LLM Brain, Claude 3.5 Sonnet, for a
 * fresh MCoT prompt. This helper builds the Claude request, executes it when an
 * Anthropic-compatible key is configured, and returns explicit unavailable
 * evidence when the runtime cannot call Claude in local/test environments.
 */
import type { RouteGenerationInput } from '@viyo/shared';

export const ZERO_SHOT_FALLBACK_MODEL = 'claude-3-5-sonnet' as const;
const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL_ID = 'claude-3-5-sonnet-20241022';

export interface FallbackPromptResult {
  prompt: string;
  category: string;
  layoutType: string;
  typographyStyle: string;
  model: typeof ZERO_SHOT_FALLBACK_MODEL;
  providerModel: typeof CLAUDE_MODEL_ID;
  usedClaude: boolean;
  unavailableReason?: string;
}

export interface BuildZeroShotFallbackPromptOptions {
  apiKey?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

function inferLayout(aspectRatio: RouteGenerationInput['aspectRatio']): string {
  if (aspectRatio === '16:9') return 'landscape';
  if (aspectRatio === '9:16') return 'vertical_story';
  if (aspectRatio === '4:5' || aspectRatio === '3:4' || aspectRatio === '2:3') return 'portrait';
  return 'square';
}

function systemPrompt(): string {
  return [
    'You are VIYO Visual Engine V2 Art Director.',
    'Write a concise MCoT image-generation prompt for a commercial Shopify brand asset.',
    'Return only the final provider-ready prompt, without hidden reasoning, analysis headings, or markdown.',
    'Preserve product fidelity, make typography instructions explicit when required, and include brand-vault references as concrete visual inputs when provided.',
  ].join(' ');
}

function userPrompt(input: RouteGenerationInput, layoutType: string, typographyStyle: string): string {
  return JSON.stringify(
    {
      brief: input.prompt,
      mode: input.mode,
      aspectRatio: input.aspectRatio,
      productType: input.productType ?? 'general',
      typographyRequired: input.typographyRequired,
      typographyStyle,
      layoutType,
      sourceImageUrls: input.sourceImageUrls,
      mentionReferences: input.mentionReferences,
      targetRegionDescription: input.targetRegionDescription,
      metadata: input.metadata ?? {},
    },
    null,
    2,
  );
}

function deterministicSafetyPrompt(input: RouteGenerationInput, layoutType: string, typographyStyle: string): string {
  const productType = input.productType ?? 'general';
  const mentionUrls = input.mentionReferences
    .filter((mention) => mention.assetUrl)
    .map((mention) => `${mention.raw}=${mention.assetUrl}`)
    .join(', ');

  return [
    `Create a ${layoutType} ${productType} image in aspect ratio ${input.aspectRatio}.`,
    `Mode ${input.mode}: ${input.prompt}`,
    input.typographyRequired
      ? 'Typography must be legible, brand-safe, and central to the composition.'
      : 'Avoid unnecessary text unless the visual brief explicitly requires it.',
    mentionUrls ? `Use these Brand Vault visual references: ${mentionUrls}.` : '',
    `Style control: ${typographyStyle}. Maintain product fidelity, commercial polish, clean composition, and reusable VIYO brand-safe styling.`,
  ]
    .filter(Boolean)
    .join(' ');
}

function extractClaudeText(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const content = (payload as { content?: unknown }).content;
  if (!Array.isArray(content)) return null;
  const textParts = content
    .map((part) => {
      if (!part || typeof part !== 'object') return null;
      const maybeText = (part as { text?: unknown }).text;
      return typeof maybeText === 'string' ? maybeText.trim() : null;
    })
    .filter((part): part is string => Boolean(part));
  return textParts.join('\n').trim() || null;
}

export async function buildZeroShotFallbackPrompt(
  input: RouteGenerationInput,
  options: BuildZeroShotFallbackPromptOptions = {},
): Promise<FallbackPromptResult> {
  const category = input.productType ?? 'general';
  const layoutType = inferLayout(input.aspectRatio);
  const typographyStyle = input.typographyRequired ? 'typography-forward' : 'minimal-text';
  const safetyPrompt = deterministicSafetyPrompt(input, layoutType, typographyStyle);
  const apiKey = options.apiKey;

  if (!apiKey) {
    return {
      category,
      layoutType,
      typographyStyle,
      model: ZERO_SHOT_FALLBACK_MODEL,
      providerModel: CLAUDE_MODEL_ID,
      usedClaude: false,
      unavailableReason: 'ANTHROPIC_API_KEY or CLAUDE_API_KEY is not configured',
      prompt: safetyPrompt,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 30_000);

  try {
    const response = await (options.fetchImpl ?? fetch)(ANTHROPIC_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL_ID,
        max_tokens: 900,
        temperature: 0.4,
        system: systemPrompt(),
        messages: [
          {
            role: 'user',
            content: userPrompt(input, layoutType, typographyStyle),
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        category,
        layoutType,
        typographyStyle,
        model: ZERO_SHOT_FALLBACK_MODEL,
        providerModel: CLAUDE_MODEL_ID,
        usedClaude: false,
        unavailableReason: `Claude fallback returned HTTP ${response.status}`,
        prompt: safetyPrompt,
      };
    }

    const claudePrompt = extractClaudeText(await response.json());
    return {
      category,
      layoutType,
      typographyStyle,
      model: ZERO_SHOT_FALLBACK_MODEL,
      providerModel: CLAUDE_MODEL_ID,
      usedClaude: Boolean(claudePrompt),
      unavailableReason: claudePrompt ? undefined : 'Claude fallback response did not contain text content',
      prompt: claudePrompt ?? safetyPrompt,
    };
  } catch (error) {
    return {
      category,
      layoutType,
      typographyStyle,
      model: ZERO_SHOT_FALLBACK_MODEL,
      providerModel: CLAUDE_MODEL_ID,
      usedClaude: false,
      unavailableReason: error instanceof Error ? error.message : 'Claude fallback call failed',
      prompt: safetyPrompt,
    };
  } finally {
    clearTimeout(timeout);
  }
}
