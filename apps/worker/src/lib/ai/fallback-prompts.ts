/**
 * Zero-Shot Fallback Prompt Builder — T46
 *
 * Produces deterministic frontier prompts when cache scoring does not select an
 * approved image_prompt_patterns entry. This module intentionally does not write
 * curator records; T46 treats missing learning-loop tables as a logged gap, not
 * as permission to invent new schema.
 */
import type { RouteGenerationInput } from '@viyo/shared';

export interface FallbackPromptResult {
  prompt: string;
  category: string;
  layoutType: string;
  typographyStyle: string;
}

function inferLayout(aspectRatio: RouteGenerationInput['aspectRatio']): string {
  if (aspectRatio === '16:9') return 'landscape';
  if (aspectRatio === '9:16') return 'vertical_story';
  if (aspectRatio === '4:5' || aspectRatio === '3:4' || aspectRatio === '2:3') return 'portrait';
  return 'square';
}

export function buildZeroShotFallbackPrompt(input: RouteGenerationInput): FallbackPromptResult {
  const productType = input.productType ?? 'general';
  const layoutType = inferLayout(input.aspectRatio);
  const typographyStyle = input.typographyRequired ? 'typography-forward' : 'minimal-text';

  return {
    category: productType,
    layoutType,
    typographyStyle,
    prompt: [
      `Create a ${layoutType} ${productType} image in aspect ratio ${input.aspectRatio}.`,
      `Primary creative brief: ${input.prompt}`,
      input.typographyRequired
        ? 'Typography must be legible, brand-safe, and central to the composition.'
        : 'Avoid unnecessary text unless the visual brief explicitly requires it.',
      'Maintain product fidelity, commercial polish, clean composition, and reusable VIYO brand-safe styling.',
    ].join(' '),
  };
}
