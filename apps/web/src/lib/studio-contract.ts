import {
  artDirectorAspectRatioSchema,
  artDirectorEditingToolSchema,
  artDirectorGenerationModeSchema,
  type ArtDirectorAspectRatio,
  type ArtDirectorEditingTool,
  type ArtDirectorGenerationMode,
} from '@viyo/shared/schemas/art-director';

export interface StudioModeDefinition {
  id: ArtDirectorGenerationMode;
  title: string;
  description: string;
  category: 'Product' | 'Campaign' | 'Brand' | 'Editorial' | 'Experimental';
}

export interface StudioEditingToolDefinition {
  id: ArtDirectorEditingTool;
  title: string;
  description: string;
  requiresSourceAsset: boolean;
}

const modeCopy: Record<ArtDirectorGenerationMode, Omit<StudioModeDefinition, 'id'>> = {
  A1: {
    title: 'Hero product render',
    description: 'Create a polished product-led hero image for email, web, or paid media placements.',
    category: 'Product',
  },
  A2: {
    title: 'Lifestyle scene',
    description: 'Place a product or offer into an aspirational lifestyle composition.',
    category: 'Campaign',
  },
  A3: {
    title: 'Brand concept pipeline',
    description: 'Run the concepting pipeline for a brand-aware creative direction.',
    category: 'Brand',
  },
  A4: {
    title: 'Campaign scene pipeline',
    description: 'Compose a multi-step campaign scene with routing metadata preserved.',
    category: 'Campaign',
  },
  A5: {
    title: 'Social square',
    description: 'Generate a square visual tuned for social reuse and fast iteration.',
    category: 'Campaign',
  },
  A6: {
    title: 'Email header',
    description: 'Create a lightweight header image for lifecycle, promo, or announcement emails.',
    category: 'Campaign',
  },
  A7: {
    title: 'Product detail',
    description: 'Render close-up product detail imagery with controlled composition.',
    category: 'Product',
  },
  A8: {
    title: 'Variant exploration pipeline',
    description: 'Explore multiple campaign variants while preserving router traceability.',
    category: 'Experimental',
  },
  A9: {
    title: 'Brand system pipeline',
    description: 'Create system-aligned brand visuals that can be reused across assets.',
    category: 'Brand',
  },
  A10: {
    title: 'Offer graphic',
    description: 'Generate offer-led marketing artwork with clear merchandising hierarchy.',
    category: 'Campaign',
  },
  A11: {
    title: 'Editorial product story',
    description: 'Create editorial-style imagery that pairs product context with narrative tone.',
    category: 'Editorial',
  },
  A12: {
    title: 'Seasonal campaign',
    description: 'Generate imagery for seasonal launches, drops, and event-driven moments.',
    category: 'Campaign',
  },
  A13: {
    title: 'Typography-safe pipeline',
    description: 'Route through typography-aware generation for text-sensitive creative.',
    category: 'Brand',
  },
  A14: {
    title: 'Text-first creative pipeline',
    description: 'Use the text-aware generation path for visuals that require strong lettering fidelity.',
    category: 'Brand',
  },
  A15: {
    title: 'Product composite pipeline',
    description: 'Combine product inputs and prompt direction into a routed composite image.',
    category: 'Product',
  },
  A16: {
    title: 'Creative remix pipeline',
    description: 'Remix source assets into a new brand-aligned concept with trace metadata.',
    category: 'Experimental',
  },
  A17: {
    title: 'Minimal studio shot',
    description: 'Create a clean, restrained studio image for catalog or product education use.',
    category: 'Product',
  },
  A18: {
    title: 'Premium brand visual',
    description: 'Generate elevated brand imagery for launches, hero surfaces, and flagship moments.',
    category: 'Brand',
  },
  A19: {
    title: 'UGC-style creative',
    description: 'Create approachable creator-style imagery for testing informal campaign angles.',
    category: 'Campaign',
  },
  A20: {
    title: 'Comparison visual',
    description: 'Generate before/after or comparison-oriented artwork for product education.',
    category: 'Editorial',
  },
  A21: {
    title: 'Retention creative',
    description: 'Create repeat-purchase, loyalty, or lifecycle visuals for existing customers.',
    category: 'Campaign',
  },
  A22: {
    title: 'Experimental art direction',
    description: 'Explore a novel creative direction while staying within the v6.1 router contract.',
    category: 'Experimental',
  },
};

const editingToolCopy: Record<ArtDirectorEditingTool, Omit<StudioEditingToolDefinition, 'id'>> = {
  touch_edit: {
    title: 'Touch Edit',
    description: 'Describe a localized change for a selected region or target detail.',
    requiresSourceAsset: true,
  },
  text_edit: {
    title: 'Text Edit',
    description: 'Adjust lettering, labels, captions, or typography-sensitive visual text.',
    requiresSourceAsset: true,
  },
  layer_splitting: {
    title: 'Layer Splitting',
    description: 'Separate foreground, background, and object layers for canvas composition.',
    requiresSourceAsset: true,
  },
  background_swap: {
    title: 'Background Swap',
    description: 'Replace or regenerate the background while preserving the subject.',
    requiresSourceAsset: true,
  },
  object_removal: {
    title: 'Object Removal',
    description: 'Remove an unwanted object and repair the surrounding region.',
    requiresSourceAsset: true,
  },
  canvas_expand: {
    title: 'Canvas Expand',
    description: 'Extend image bounds for new aspect ratios or layout space.',
    requiresSourceAsset: true,
  },
  upscale: {
    title: 'Upscale',
    description: 'Increase resolution and sharpen output for production-ready use.',
    requiresSourceAsset: true,
  },
  quick_edit: {
    title: 'Quick Edit',
    description: 'Apply a fast general-purpose image edit from a concise instruction.',
    requiresSourceAsset: true,
  },
  style_transfer: {
    title: 'Style Transfer',
    description: 'Apply a selected visual style or brand treatment to a source image.',
    requiresSourceAsset: true,
  },
  material_swap: {
    title: 'Material Swap',
    description: 'Change materials, finishes, textures, or product surface treatments.',
    requiresSourceAsset: true,
  },
};

export const studioModeDefinitions: StudioModeDefinition[] = artDirectorGenerationModeSchema.options.map((mode) => ({
  id: mode,
  ...modeCopy[mode],
}));

export const studioEditingToolDefinitions: StudioEditingToolDefinition[] = artDirectorEditingToolSchema.options.map((tool) => ({
  id: tool,
  ...editingToolCopy[tool],
}));

export const studioAspectRatios = artDirectorAspectRatioSchema.options satisfies ArtDirectorAspectRatio[];

export function isTypographySensitiveMode(mode: ArtDirectorGenerationMode): boolean {
  return mode === 'A13' || mode === 'A14';
}
