import type { Workspace } from '@viyo/shared';
import { Button } from '@viyo/ui';

/**
 * VIYO Admin Portal — Root Component
 * Placeholder for Phase 0 scaffold validation.
 */
export function App() {
  // Type validation: ensure cross-package import works at build time
  void (0 as unknown as Workspace);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-8">
      <h1 className="mb-4 text-4xl font-bold text-viyo-700">VIYO Admin</h1>
      <p className="mb-6 text-lg text-gray-600">Internal Administration Portal</p>
      <Button variant="secondary" size="lg">
        Dashboard
      </Button>
      <p className="mt-8 text-sm text-gray-400">
        Phase 0 Scaffold — admin.viyo.new
      </p>
    </div>
  );
}
