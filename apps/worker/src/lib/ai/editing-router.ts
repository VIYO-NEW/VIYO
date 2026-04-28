/**
 * Art Director Editing Router — T46 v6.1
 *
 * Contract-only routing layer for the 10 Visual Engine V2 editing tools. The
 * actual provider adapters remain behind the image-router execution boundary;
 * this module supplies deterministic tool-to-model plans for synchronous worker
 * routing, tests, and future UI affordances.
 */
import type { ArtDirectorEditingTool, ArtDirectorModel } from '@viyo/shared';
import type { ArtDirectorRouterConfig } from './router-config.js';
import { listProviderDescriptors, type ProviderDescriptor } from './provider-registry.js';

export interface EditingToolPlan {
  tool: ArtDirectorEditingTool;
  description: string;
  primaryModels: ArtDirectorModel[];
  pipelineSteps: string[];
  localOnly: boolean;
}

export const ART_DIRECTOR_EDITING_TOOL_MODEL_MAP: Record<ArtDirectorEditingTool, EditingToolPlan> = {
  touch_edit: {
    tool: 'touch_edit',
    description: 'Click any region, describe the change in text, and modify only that area.',
    primaryModels: ['sam-2', 'sdxl-inpainting'],
    pipelineSteps: ['sam-2-mask', 'sdxl-inpainting-edit'],
    localOnly: false,
  },
  text_edit: {
    tool: 'text_edit',
    description: 'Change text in an image while preserving 3D effects and style.',
    primaryModels: ['gpt-image-2', 'ideogram-v3'],
    pipelineSteps: ['typography-aware-direct-edit'],
    localOnly: false,
  },
  layer_splitting: {
    tool: 'layer_splitting',
    description: 'Separate foreground and background into independent layers.',
    primaryModels: ['sam-2'],
    pipelineSteps: ['sam-2-segmentation'],
    localOnly: false,
  },
  background_swap: {
    tool: 'background_swap',
    description: 'Replace the background while preserving the subject.',
    primaryModels: ['rmbg', 'flux-2-pro'],
    pipelineSteps: ['rmbg-subject-cutout', 'tier-2-background-generation', 'sharp-composite'],
    localOnly: false,
  },
  object_removal: {
    tool: 'object_removal',
    description: 'Remove unwanted objects and fill the gap.',
    primaryModels: ['sdxl-inpainting'],
    pipelineSteps: ['sdxl-inpainting-object-removal'],
    localOnly: false,
  },
  canvas_expand: {
    tool: 'canvas_expand',
    description: 'Extend the image in any direction.',
    primaryModels: ['sdxl-outpainting'],
    pipelineSteps: ['sdxl-outpainting-canvas-expand'],
    localOnly: false,
  },
  upscale: {
    tool: 'upscale',
    description: 'Enhance resolution by 2x or 4x.',
    primaryModels: ['real-esrgan'],
    pipelineSteps: ['real-esrgan-upscale'],
    localOnly: false,
  },
  quick_edit: {
    tool: 'quick_edit',
    description: 'One-click brightness, contrast, saturation, and crop adjustments.',
    primaryModels: [],
    pipelineSteps: ['local-sharp-canvas-adjustment'],
    localOnly: true,
  },
  style_transfer: {
    tool: 'style_transfer',
    description: 'Apply the visual style of one image to another.',
    primaryModels: ['ip-adapter'],
    pipelineSteps: ['ip-adapter-style-conditioning'],
    localOnly: false,
  },
  material_swap: {
    tool: 'material_swap',
    description: 'Change material or texture of objects while preserving geometry.',
    primaryModels: ['controlnet', 'flux-2-pro'],
    pipelineSteps: ['controlnet-structure-lock', 'tier-2-generation-material-swap'],
    localOnly: false,
  },
};

export function getEditingToolPlan(tool: ArtDirectorEditingTool): EditingToolPlan {
  return ART_DIRECTOR_EDITING_TOOL_MODEL_MAP[tool];
}

export function selectEditingProviders(
  tool: ArtDirectorEditingTool,
  config: ArtDirectorRouterConfig,
): ProviderDescriptor[] {
  const plan = getEditingToolPlan(tool);
  const descriptors = listProviderDescriptors(config);

  return plan.primaryModels
    .map((model) => descriptors.find((provider) => provider.model === model))
    .filter((provider): provider is ProviderDescriptor => Boolean(provider));
}

export function selectPrimaryEditingProvider(
  tool: ArtDirectorEditingTool,
  config: ArtDirectorRouterConfig,
): ProviderDescriptor | null {
  const providers = selectEditingProviders(tool, config);
  return providers.find((provider) => provider.available) ?? providers[0] ?? null;
}
