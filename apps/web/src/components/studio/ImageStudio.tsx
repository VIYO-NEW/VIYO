import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  routeGenerationRequestSchema,
  type ArtDirectorAspectRatio,
  type ArtDirectorEditingTool,
  type ArtDirectorGenerationMode,
  type BrandVaultMention,
  type RouteGenerationInput,
  type RouteGenerationResponse,
} from '@viyo/shared/schemas/art-director';
import {
  isTypographySensitiveMode,
  studioAspectRatios,
  studioEditingToolDefinitions,
  studioModeDefinitions,
} from '../../lib/studio-contract.js';
import { routeStudioGeneration } from '../../lib/studio-api.js';

interface ImageStudioProps {
  brandId: string;
}

interface StudioCanvasAsset {
  id: string;
  traceId: string;
  assetId: string | null;
  assetUrl: string | null;
  savedToVault: boolean;
  mode: ArtDirectorGenerationMode;
  editingTool?: ArtDirectorEditingTool | null;
  prompt: string;
  selectedModel: string;
  providerTier: string;
  isCached: boolean;
  routeSource: RouteGenerationResponse['routingMetadata']['routeSource'];
  cacheStatus: RouteGenerationResponse['routingMetadata']['cacheStatus'];
  score: number;
  costTokens: number;
  tokenAction: string;
  fallbackReason?: string;
  evaluatedPatternCount: number;
  bestPatternScore?: number | null;
  bestPatternSimilarity?: number | null;
  bestPatternQualityScore?: number | null;
  bestPatternCostEfficiencyScore?: number | null;
  patternId?: string | null;
  patternCategory?: string | null;
  patternProductType?: string | null;
  patternLayoutType?: string | null;
  patternTypographyStyle?: string | null;
  palette: RouteGenerationResponse['palette'];
  resolvedMentions: BrandVaultMention[];
}

const defaultPrompt = 'Create an on-brand product hero image for a new lifecycle email campaign.';

function parseBrandVaultMentions(prompt: string): BrandVaultMention[] {
  const mentions = new Map<string, BrandVaultMention>();
  const matches = prompt.matchAll(/@([A-Za-z0-9][A-Za-z0-9._-]{0,119})/g);

  for (const match of matches) {
    const slug = match[1];
    const key = slug.toLowerCase();

    if (!mentions.has(key)) {
      mentions.set(key, {
        raw: `@${slug}`,
        slug,
      });
    }
  }

  return Array.from(mentions.values());
}

function parseDelimitedList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function resultToCanvasAsset(response: RouteGenerationResponse, prompt: string): StudioCanvasAsset {
  return {
    id: response.assetId ?? response.traceId,
    traceId: response.traceId,
    assetId: response.assetId ?? null,
    assetUrl: response.assetUrl,
    savedToVault: response.savedToVault,
    mode: response.routingMetadata.mode,
    editingTool: response.routingMetadata.editingTool ?? null,
    prompt,
    selectedModel: response.selectedModel,
    providerTier: response.providerTier,
    isCached: response.isCached,
    routeSource: response.routingMetadata.routeSource,
    cacheStatus: response.routingMetadata.cacheStatus,
    score: response.score,
    costTokens: response.costTokens,
    tokenAction: response.tokenAction,
    fallbackReason: response.fallbackReason,
    evaluatedPatternCount: response.routingMetadata.evaluatedPatternCount,
    bestPatternScore: response.routingMetadata.bestPatternScore ?? null,
    bestPatternSimilarity: response.routingMetadata.bestPatternSimilarity ?? null,
    bestPatternQualityScore: response.routingMetadata.bestPatternQualityScore ?? null,
    bestPatternCostEfficiencyScore: response.routingMetadata.bestPatternCostEfficiencyScore ?? null,
    patternId: response.routingMetadata.patternId ?? null,
    patternCategory: response.routingMetadata.patternCategory ?? null,
    patternProductType: response.routingMetadata.patternProductType ?? null,
    patternLayoutType: response.routingMetadata.patternLayoutType ?? null,
    patternTypographyStyle: response.routingMetadata.patternTypographyStyle ?? null,
    palette: response.palette,
    resolvedMentions: response.routingMetadata.resolvedMentions,
  };
}

function formatToolName(tool?: ArtDirectorEditingTool | null): string {
  if (!tool) {
    return 'Generation';
  }

  return studioEditingToolDefinitions.find((definition) => definition.id === tool)?.title ?? tool;
}

export function ImageStudio({ brandId }: ImageStudioProps) {
  const [selectedMode, setSelectedMode] = useState<ArtDirectorGenerationMode>('A1');
  const [selectedTool, setSelectedTool] = useState<ArtDirectorEditingTool | undefined>();
  const [aspectRatio, setAspectRatio] = useState<ArtDirectorAspectRatio>('1:1');
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [productType, setProductType] = useState('');
  const [targetRegionDescription, setTargetRegionDescription] = useState('');
  const [sourceAssetIds, setSourceAssetIds] = useState('');
  const [sourceImageUrls, setSourceImageUrls] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Ready to create with the v6.1 Art Director Router.');
  const [canvasAssets, setCanvasAssets] = useState<StudioCanvasAsset[]>([]);
  const [lastResponse, setLastResponse] = useState<RouteGenerationResponse | null>(null);

  const selectedModeDefinition = useMemo(
    () => studioModeDefinitions.find((mode) => mode.id === selectedMode) ?? studioModeDefinitions[0],
    [selectedMode],
  );
  const selectedToolDefinition = useMemo(
    () => studioEditingToolDefinitions.find((tool) => tool.id === selectedTool),
    [selectedTool],
  );
  const parsedMentions = useMemo(() => parseBrandVaultMentions(prompt), [prompt]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setStatusMessage('Routing request through Art Director v6.1…');

    try {
      const request: RouteGenerationInput = routeGenerationRequestSchema.parse({
        prompt,
        brandId,
        mode: selectedMode,
        editingTool: selectedTool,
        aspectRatio,
        productType: productType.trim() || undefined,
        typographyRequired: isTypographySensitiveMode(selectedMode),
        mentionReferences: parsedMentions,
        sourceAssetIds: parseDelimitedList(sourceAssetIds),
        sourceImageUrls: parseDelimitedList(sourceImageUrls),
        targetRegionDescription: targetRegionDescription.trim() || undefined,
        metadata: {
          surface: 'phase6_image_studio',
          selectedModeTitle: selectedModeDefinition.title,
          selectedEditingToolTitle: selectedToolDefinition?.title ?? null,
        },
      });

      const response = await routeStudioGeneration(request);
      setLastResponse(response);
      setCanvasAssets((currentAssets) => [resultToCanvasAsset(response, request.prompt), ...currentAssets]);
      setStatusMessage(
        response.assetUrl
          ? 'Image routed successfully and added to the canvas.'
          : 'Request routed successfully. The backend returned trace metadata without an image URL.',
      );
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Image Studio request failed.';
      setError(message);
      setStatusMessage('Request failed. Review the command panel details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/90 px-6 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Image Studio · Phase 6</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Art Director Studio</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Select any A1–A22 generation mode, optionally trigger a Visual Engine V2 editing tool, and inspect the returned R2 asset metadata from the repaired v6.1 router.
            </p>
          </div>
          <dl className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <dt className="text-slate-400">Brand scope</dt>
            <dd className="mt-1 font-mono text-xs text-cyan-100">{brandId}</dd>
          </dl>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-137px)] grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_380px]">
        <aside aria-labelledby="mode-picker-heading" className="border-b border-white/10 bg-slate-900/80 p-5 lg:border-b-0 lg:border-r">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Mode picker</p>
            <h2 id="mode-picker-heading" className="mt-2 text-xl font-semibold text-white">22 generation modes</h2>
            <p className="mt-2 text-sm text-slate-400">Modes are rendered from the repaired Art Director schema inventory.</p>
          </div>
          <div className="grid max-h-[72vh] gap-2 overflow-y-auto pr-1" data-testid="studio-mode-picker">
            {studioModeDefinitions.map((mode) => {
              const isSelected = mode.id === selectedMode;
              return (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-cyan-300 bg-cyan-300/15 shadow-lg shadow-cyan-950/40'
                      : 'border-white/10 bg-white/[0.03] hover:border-cyan-300/60 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm font-semibold text-cyan-100">{mode.id}</span>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                      {mode.category}
                    </span>
                  </span>
                  <span className="mt-2 block font-semibold text-white">{mode.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-400">{mode.description}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main aria-labelledby="canvas-heading" className="bg-slate-950 p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Freeform canvas</p>
              <h2 id="canvas-heading" className="mt-2 text-2xl font-semibold text-white">Generated and edited assets</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300" role="status" aria-live="polite">
              {statusMessage}
            </div>
          </div>

          {isSubmitting ? (
            <div className="mb-5 rounded-3xl border border-cyan-300/30 bg-cyan-300/10 p-5" data-testid="studio-generating-skeleton">
              <div className="h-4 w-52 animate-pulse rounded bg-cyan-200/40" />
              <div className="mt-4 h-64 animate-pulse rounded-2xl bg-white/10" />
            </div>
          ) : null}

          {canvasAssets.length === 0 && !isSubmitting ? (
            <section className="flex min-h-[520px] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
              <div className="max-w-md">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Canvas is empty</p>
                <h3 className="mt-3 text-2xl font-bold text-white">Create a first image from the command panel.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Results will appear here with R2 URLs, Brand Vault save state, router model metadata, trace IDs, and palette details when the backend returns them.
                </p>
              </div>
            </section>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2" data-testid="studio-canvas-assets">
              {canvasAssets.map((asset) => (
                <article key={`${asset.id}-${asset.traceId}`} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
                  {asset.assetUrl ? (
                    <img src={asset.assetUrl} alt={`Art Director output for ${asset.mode}`} className="h-80 w-full object-cover" />
                  ) : (
                    <div className="flex h-80 items-center justify-center bg-slate-900 p-8 text-center text-sm text-slate-400">
                      No image URL was returned. Trace metadata is preserved for debugging and retry.
                    </div>
                  )}
                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-semibold text-cyan-100">{asset.mode}</span>
                      <span className="rounded-full bg-violet-300/15 px-3 py-1 text-xs font-semibold text-violet-100">
                        {formatToolName(asset.editingTool)}
                      </span>
                      <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                        {asset.savedToVault ? 'Saved to Brand Vault' : 'Not saved to vault'}
                      </span>
                      <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold text-amber-100">
                        {asset.isCached ? 'Pattern DB cache hit' : asset.cacheStatus === 'below_threshold' ? 'Pattern below threshold' : 'Zero-shot route'}
                      </span>
                    </div>
                    <p className="line-clamp-3 text-sm leading-6 text-slate-300">{asset.prompt}</p>
                    <dl className="grid grid-cols-1 gap-3 text-xs text-slate-300 md:grid-cols-2">
                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <dt className="text-slate-500">R2 asset URL</dt>
                        <dd className="mt-1 break-all font-mono text-slate-200">{asset.assetUrl ?? 'None returned'}</dd>
                      </div>
                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <dt className="text-slate-500">Asset ID</dt>
                        <dd className="mt-1 break-all font-mono text-slate-200">{asset.assetId ?? 'Pending or unavailable'}</dd>
                      </div>
                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <dt className="text-slate-500">Model</dt>
                        <dd className="mt-1 font-mono text-slate-200">{asset.selectedModel}</dd>
                      </div>
                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <dt className="text-slate-500">Trace</dt>
                        <dd className="mt-1 break-all font-mono text-slate-200">{asset.traceId}</dd>
                      </div>
                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <dt className="text-slate-500">Route source</dt>
                        <dd className="mt-1 font-mono text-slate-200">{asset.routeSource}</dd>
                      </div>
                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <dt className="text-slate-500">Pattern DB score</dt>
                        <dd className="mt-1 font-mono text-slate-200">
                          {asset.bestPatternScore === null || asset.bestPatternScore === undefined ? 'No pattern evaluated' : `${asset.bestPatternScore} · ${asset.cacheStatus}`}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <dt className="text-slate-500">Patterns evaluated</dt>
                        <dd className="mt-1 font-mono text-slate-200">{asset.evaluatedPatternCount}</dd>
                      </div>
                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <dt className="text-slate-500">Pattern provenance</dt>
                        <dd className="mt-1 break-all font-mono text-slate-200">
                          {asset.patternId ? `${asset.patternCategory ?? 'pattern'} · ${asset.patternProductType ?? 'general'} · ${asset.patternLayoutType ?? 'layout'} · ${asset.patternTypographyStyle ?? 'typography'}` : 'Zero-shot generation'}
                        </dd>
                      </div>
                    </dl>
                    {asset.palette && asset.palette.length > 0 ? (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Palette</p>
                        <div className="flex flex-wrap gap-2">
                          {asset.palette.map((color) => (
                            <span key={`${asset.traceId}-${color.hex}-${color.name}`} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                              <span aria-hidden="true" className="h-3 w-3 rounded-full border border-white/40" style={{ backgroundColor: color.hex }} />
                              {color.name} · {color.hex}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        <aside aria-labelledby="command-panel-heading" className="border-t border-white/10 bg-slate-900/90 p-5 lg:border-l lg:border-t-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">AI command panel</p>
              <h2 id="command-panel-heading" className="mt-2 text-xl font-semibold text-white">Route a Studio request</h2>
              <p className="mt-2 text-sm text-slate-400">
                Current mode: <span className="font-semibold text-cyan-100">{selectedModeDefinition.id} · {selectedModeDefinition.title}</span>
              </p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-200">Prompt</span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={6}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-cyan-300/40 placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4"
                placeholder="Describe the image. Use @asset-slug to reference Brand Vault items."
                data-testid="studio-prompt-input"
              />
            </label>

            {parsedMentions.length > 0 ? (
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3" data-testid="studio-mention-chips">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Brand Vault mentions</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {parsedMentions.map((mention) => (
                    <span key={mention.slug} className="rounded-full bg-cyan-300/20 px-3 py-1 text-xs font-semibold text-cyan-50">
                      {mention.raw}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-200">Aspect ratio</span>
                <select
                  value={aspectRatio}
                  onChange={(event) => setAspectRatio(event.target.value as ArtDirectorAspectRatio)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-300"
                >
                  {studioAspectRatios.map((ratio) => (
                    <option key={ratio} value={ratio}>{ratio}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-200">Product type</span>
                <input
                  value={productType}
                  onChange={(event) => setProductType(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-300"
                  placeholder="Skincare, apparel…"
                />
              </label>
            </div>

            <div data-testid="studio-editing-tool-picker">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-200">Editing tool</span>
                <button
                  type="button"
                  onClick={() => setSelectedTool(undefined)}
                  className="text-xs font-semibold text-cyan-200 hover:text-cyan-100"
                >
                  Generation only
                </button>
              </div>
              <div className="grid max-h-56 gap-2 overflow-y-auto pr-1">
                {studioEditingToolDefinitions.map((tool) => {
                  const isSelected = selectedTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedTool(tool.id)}
                      className={`rounded-2xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-violet-300 bg-violet-300/15'
                          : 'border-white/10 bg-white/[0.03] hover:border-violet-300/60'
                      }`}
                    >
                      <span className="block text-sm font-semibold text-white">{tool.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-400">{tool.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-200">Target region or edit instruction</span>
              <input
                value={targetRegionDescription}
                onChange={(event) => setTargetRegionDescription(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-300"
                placeholder="Top-left label, product cap, background wall…"
                disabled={!selectedTool}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-200">Source asset IDs</span>
              <textarea
                value={sourceAssetIds}
                onChange={(event) => setSourceAssetIds(event.target.value)}
                rows={2}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-300"
                placeholder="Comma or line separated UUIDs"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-200">Source image URLs</span>
              <textarea
                value={sourceImageUrls}
                onChange={(event) => setSourceImageUrls(event.target.value)}
                rows={2}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-300"
                placeholder="Comma or line separated https:// URLs"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100" role="alert">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
              data-testid="studio-submit-button"
            >
              {isSubmitting ? 'Routing…' : selectedTool ? `Run ${selectedToolDefinition?.title ?? selectedTool}` : 'Generate image'}
            </button>
          </form>

          {lastResponse ? (
            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4" aria-labelledby="last-response-heading" data-testid="studio-r2-response">
              <h3 id="last-response-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-300">Latest R2 response</h3>
              <dl className="mt-3 space-y-3 text-xs text-slate-300">
                <div>
                  <dt className="text-slate-500">Asset URL</dt>
                  <dd className="mt-1 break-all font-mono text-slate-100">{lastResponse.assetUrl ?? 'None returned'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Asset ID</dt>
                  <dd className="mt-1 break-all font-mono text-slate-100">{lastResponse.assetId ?? 'Pending or unavailable'}</dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-slate-500">Saved</dt>
                    <dd className="mt-1 font-semibold text-slate-100">{lastResponse.savedToVault ? 'Yes' : 'No'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Tokens</dt>
                    <dd className="mt-1 font-semibold text-slate-100">{lastResponse.costTokens}</dd>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-slate-500">Route source</dt>
                    <dd className="mt-1 font-mono text-slate-100">{lastResponse.routingMetadata.routeSource}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Cache status</dt>
                    <dd className="mt-1 font-mono text-slate-100">{lastResponse.routingMetadata.cacheStatus}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-slate-500">Pattern DB score</dt>
                  <dd className="mt-1 font-mono text-slate-100">
                    {lastResponse.routingMetadata.bestPatternScore === null || lastResponse.routingMetadata.bestPatternScore === undefined
                      ? `No matching pattern · ${lastResponse.routingMetadata.evaluatedPatternCount} evaluated`
                      : `${lastResponse.routingMetadata.bestPatternScore} best · ${lastResponse.routingMetadata.evaluatedPatternCount} evaluated`}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Trace ID</dt>
                  <dd className="mt-1 break-all font-mono text-slate-100">{lastResponse.traceId}</dd>
                </div>
              </dl>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export { parseBrandVaultMentions, parseDelimitedList, resultToCanvasAsset };
export type { StudioCanvasAsset };
