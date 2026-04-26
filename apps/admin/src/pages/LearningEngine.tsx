/**
 * LearningEngine — Intelligence Layer Monitor
 *
 * Placeholder for: Ingestion Pipeline, Pattern DB Browser, Preference Model Control.
 * Implements: R17 §10.1A (R24, R25).
 * Wiring Layer: Layer 7 (UI)
 *
 * WHY placeholder cards instead of empty page:
 * Each card maps to a specific R17 feature, making it clear what needs
 * to be built and where the data will come from. This is the skeleton's
 * contract with future implementation tasks.
 */

export function LearningEngine() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Learning Engine</h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        R17 §10.1A — Ingestion pipeline, Pattern DB, and Preference Model control.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PlaceholderCard
          title="Ingestion Pipeline"
          description="Real-time view of emails being scraped, images extracted, and JSON schemas generated. Includes a failure queue for parsing errors."
          specRef="R24, R25"
        />
        <PlaceholderCard
          title="Pattern Database Browser"
          description="Searchable UI over the pgvector image_prompt_patterns table. View proven patterns, success rates, and DSPy optimizations."
          specRef="R24"
        />
        <PlaceholderCard
          title="Preference Model Control"
          description="Current accuracy of the VLM preference classifier. Manual override to force a new training epoch based on recent RLHF data."
          specRef="R24"
        />
      </div>
    </div>
  );
}

function PlaceholderCard({ title, description, specRef }: { title: string; description: string; specRef: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-dashed border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">Spec: {specRef}</p>
    </div>
  );
}
