/**
 * Credential Routes — T8, R22 §4, R29
 *
 * REST endpoints for workspace-scoped credential CRUD.
 * All responses return metadata ONLY — no plaintext API keys.
 *
 * Endpoints:
 *   POST   /api/v1/workspaces/:workspaceId/credentials       — Create
 *   GET    /api/v1/workspaces/:workspaceId/credentials        — List (metadata only)
 *   GET    /api/v1/workspaces/:workspaceId/credentials/:id    — Get (metadata only)
 *   PATCH  /api/v1/workspaces/:workspaceId/credentials/:id    — Update
 *   DELETE /api/v1/workspaces/:workspaceId/credentials/:id    — Soft-delete
 *   POST   /api/v1/workspaces/:workspaceId/credentials/:id/restore — Restore
 *
 * Authority: R22 §4, R29, ARCH_LOCK_V3 §3
 */
import { Hono } from 'hono';
import {
  createCredentialSchema,
  updateCredentialSchema,
  listCredentialsQuerySchema,
} from '@viyo/shared';
import {
  createCredential,
  listCredentials,
  getCredential,
  updateCredential,
  deleteCredential,
  restoreCredential,
} from '../../services/credential.service.js';

import type { AuthContext } from '@viyo/shared';

type RouteEnv = {
  Variables: {
    auth: AuthContext;
    validatedBody: unknown;
    validatedQuery: unknown;
    validatedParams: unknown;
    requestId: string;
  };
};

const credentials = new Hono<RouteEnv>();

/**
 * POST /api/v1/workspaces/:workspaceId/credentials
 * Create a new encrypted credential.
 */
credentials.post('/', async (c) => {
  const workspaceId = c.req.param('workspaceId')!;
  const body = await c.req.json();

  const parsed = createCredentialSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: 'Validation failed',
        details: parsed.error.issues,
        requestId: c.get('requestId'),
      },
      400,
    );
  }

  try {
    const credential = await createCredential({
      workspaceId,
      provider: parsed.data.provider,
      apiKey: parsed.data.apiKey,
      label: parsed.data.label,
      metadata: parsed.data.metadata,
    });

    return c.json(credential, 201);
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 503) {
      return c.json({ error: 'Database not available', requestId: c.get('requestId') }, 503);
    }
    if (error.message?.includes('VIYO_VAULT_KEY')) {
      return c.json({ error: 'Vault not configured', requestId: c.get('requestId') }, 503);
    }
    throw err;
  }
});

/**
 * GET /api/v1/workspaces/:workspaceId/credentials
 * List credentials — metadata only, NEVER plaintext.
 * Supports ?includeInactive=true for soft-delete recovery.
 */
credentials.get('/', async (c) => {
  const workspaceId = c.req.param('workspaceId')!;

  const queryParsed = listCredentialsQuerySchema.safeParse({
    includeInactive: c.req.query('includeInactive'),
  });

  const includeInactive = queryParsed.success ? queryParsed.data.includeInactive : false;

  try {
    const list = await listCredentials(workspaceId, { includeInactive });
    return c.json({ data: list, count: list.length });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 503) {
      return c.json({ error: 'Database not available', requestId: c.get('requestId') }, 503);
    }
    throw err;
  }
});

/**
 * GET /api/v1/workspaces/:workspaceId/credentials/:id
 * Get single credential — metadata only, NEVER plaintext.
 */
credentials.get('/:id', async (c) => {
  const workspaceId = c.req.param('workspaceId')!;
  const credentialId = c.req.param('id')!;

  try {
    const credential = await getCredential(workspaceId, credentialId);
    if (!credential) {
      return c.json({ error: 'Credential not found', requestId: c.get('requestId') }, 404);
    }
    return c.json(credential);
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 503) {
      return c.json({ error: 'Database not available', requestId: c.get('requestId') }, 503);
    }
    throw err;
  }
});

/**
 * PATCH /api/v1/workspaces/:workspaceId/credentials/:id
 * Update credential. If apiKey provided, it is re-encrypted.
 */
credentials.patch('/:id', async (c) => {
  const workspaceId = c.req.param('workspaceId')!;
  const credentialId = c.req.param('id')!;
  const body = await c.req.json();

  const parsed = updateCredentialSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: 'Validation failed',
        details: parsed.error.issues,
        requestId: c.get('requestId'),
      },
      400,
    );
  }

  try {
    const updated = await updateCredential(workspaceId, credentialId, {
      apiKey: parsed.data.apiKey,
      isActive: parsed.data.isActive,
      metadata: parsed.data.metadata,
    });

    if (!updated) {
      return c.json({ error: 'Credential not found', requestId: c.get('requestId') }, 404);
    }

    return c.json(updated);
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 503) {
      return c.json({ error: 'Database not available', requestId: c.get('requestId') }, 503);
    }
    if (error.message?.includes('VIYO_VAULT_KEY')) {
      return c.json({ error: 'Vault not configured', requestId: c.get('requestId') }, 503);
    }
    throw err;
  }
});

/**
 * DELETE /api/v1/workspaces/:workspaceId/credentials/:id
 * Soft-delete (isActive = false). Data preserved for recovery.
 */
credentials.delete('/:id', async (c) => {
  const workspaceId = c.req.param('workspaceId')!;
  const credentialId = c.req.param('id')!;

  try {
    const deleted = await deleteCredential(workspaceId, credentialId);
    if (!deleted) {
      return c.json({ error: 'Credential not found', requestId: c.get('requestId') }, 404);
    }
    return c.json({ message: 'Credential deactivated', id: credentialId });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 503) {
      return c.json({ error: 'Database not available', requestId: c.get('requestId') }, 503);
    }
    throw err;
  }
});

/**
 * POST /api/v1/workspaces/:workspaceId/credentials/:id/restore
 * Restore a soft-deleted credential (isActive = true).
 */
credentials.post('/:id/restore', async (c) => {
  const workspaceId = c.req.param('workspaceId')!;
  const credentialId = c.req.param('id')!;

  try {
    const restored = await restoreCredential(workspaceId, credentialId);
    if (!restored) {
      return c.json({ error: 'Credential not found', requestId: c.get('requestId') }, 404);
    }
    return c.json({ message: 'Credential restored', data: restored });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode === 503) {
      return c.json({ error: 'Database not available', requestId: c.get('requestId') }, 503);
    }
    throw err;
  }
});

export default credentials;
