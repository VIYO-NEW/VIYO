import type { Workspace } from '@viyo/shared';
import { Button } from '@viyo/ui';

/**
 * VIYO Web App — Root Component
 * Placeholder for Phase 0 scaffold validation.
 */
export function App() {
  // Type validation: ensure cross-package import works at build time
  void (0 as unknown as Workspace);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-8">
      <h1 className="mb-4 text-4xl font-bold text-viyo-700">VIYO</h1>
      <p className="mb-6 text-lg text-gray-600">AI-Powered Email Marketing Platform</p>
      <Button variant="default" size="lg">
        Get Started
      </Button>
      <p className="mt-8 text-sm text-gray-400">
        Phase 0 Scaffold — app.viyo.new
      </p>
    </div>
  );
}
