#!/usr/bin/env node
/**
 * Synthetic-only staging seed for VIYO.
 *
 * Authority: T90 / SEC-10 Builder Execution Brief and Doc11 line 43.
 * This script must never be run against production. It inserts deterministic,
 * non-PII synthetic fixtures generated with @faker-js/faker.
 */
import { createHash } from 'node:crypto';
import postgres from 'postgres';
import { faker } from '@faker-js/faker';

const databaseUrl = process.env.DATABASE_URL;
const seedTarget = process.env.VIYO_SEED_TARGET;
const allowSeed = process.env.VIYO_ALLOW_STAGING_SEED;
const workspaceCount = Number.parseInt(process.env.VIYO_STAGING_WORKSPACE_COUNT ?? '3', 10);
const usersPerWorkspace = Number.parseInt(process.env.VIYO_STAGING_USERS_PER_WORKSPACE ?? '2', 10);

const productionMarkers = [
  'api.viyo.new',
  'app.viyo.new',
  'admin.viyo.new',
  'prod',
  'production',
];

function requireStagingTarget() {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required and must point to the dedicated staging Supabase project.');
  }

  if (seedTarget !== 'staging' || allowSeed !== 'true') {
    throw new Error('Refusing to seed: set VIYO_SEED_TARGET=staging and VIYO_ALLOW_STAGING_SEED=true.');
  }

  const normalizedUrl = databaseUrl.toLowerCase();
  const matchedMarker = productionMarkers.find((marker) => normalizedUrl.includes(marker));
  if (matchedMarker) {
    throw new Error(`Refusing to seed: DATABASE_URL contains production-like marker "${matchedMarker}".`);
  }

  if (!Number.isInteger(workspaceCount) || workspaceCount < 1 || workspaceCount > 25) {
    throw new Error('VIYO_STAGING_WORKSPACE_COUNT must be an integer from 1 to 25.');
  }

  if (!Number.isInteger(usersPerWorkspace) || usersPerWorkspace < 1 || usersPerWorkspace > 10) {
    throw new Error('VIYO_STAGING_USERS_PER_WORKSPACE must be an integer from 1 to 10.');
  }
}

function syntheticEmail(workspaceIndex, userIndex) {
  return `staging-user-${workspaceIndex + 1}-${userIndex + 1}@staging.example.test`;
}

function hashApiKey(label) {
  return createHash('sha256').update(`viyo-staging-${label}`).digest('hex');
}

function deterministicUuid(label) {
  const hex = createHash('md5').update(`viyo-staging-${label}`).digest('hex').split('');
  hex[12] = '4';
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20, 32).join('')}`;
}

async function main() {
  requireStagingTarget();
  faker.seed(90010);

  const sql = postgres(databaseUrl, {
    max: 1,
    ssl: 'require',
    idle_timeout: 20,
    connect_timeout: 30,
  });

  const summary = {
    target: 'staging',
    syntheticOnly: true,
    workspaces: 0,
    users: 0,
    workspaceMembers: 0,
    apiKeys: 0,
  };

  try {
    await sql.begin(async (tx) => {
      for (let workspaceIndex = 0; workspaceIndex < workspaceCount; workspaceIndex += 1) {
        const workspaceId = deterministicUuid(`workspace-${workspaceIndex + 1}`);
        const workspaceName = `VIYO Staging ${faker.company.buzzNoun()} ${workspaceIndex + 1}`;

        await tx`
          insert into workspaces (id, name, subscription_status, subscription_tier, onboarding_completed, settings)
          values (
            ${workspaceId},
            ${workspaceName},
            'free',
            'free',
            true,
            ${JSON.stringify({ seed: 't90-sec-10', syntheticOnly: true, source: 'faker' })}::jsonb
          )
          on conflict (id) do nothing
        `;
        summary.workspaces += 1;

        const apiKeyLabel = `staging-${workspaceIndex + 1}`;
        await tx`
          insert into api_keys (workspace_id, key_hash, key_prefix, label, scopes)
          values (
            ${workspaceId},
            ${hashApiKey(apiKeyLabel)},
            ${`stg${workspaceIndex + 1}`.padEnd(8, '0')},
            ${`Synthetic ${apiKeyLabel}`},
            ${['read', 'write']}
          )
          on conflict (key_hash) do nothing
        `;
        summary.apiKeys += 1;

        for (let userIndex = 0; userIndex < usersPerWorkspace; userIndex += 1) {
          const userId = deterministicUuid(`user-${workspaceIndex + 1}-${userIndex + 1}`);
          const email = syntheticEmail(workspaceIndex, userIndex);
          const role = userIndex === 0 ? 'owner' : 'member';
          const fullName = faker.person.fullName();
          const avatarUrl = faker.image.avatarGitHub();

          await tx`
            insert into auth.users (
              id,
              aud,
              role,
              email,
              email_confirmed_at,
              raw_app_meta_data,
              raw_user_meta_data,
              created_at,
              updated_at,
              is_sso_user,
              is_anonymous
            )
            values (
              ${userId},
              'authenticated',
              'authenticated',
              ${email},
              now(),
              ${JSON.stringify({ provider: 'email', providers: ['email'] })}::jsonb,
              ${JSON.stringify({ full_name: fullName, syntheticOnly: true, source: 'viyo-staging-seed' })}::jsonb,
              now(),
              now(),
              false,
              false
            )
            on conflict (id) do update set
              email = excluded.email,
              updated_at = now()
          `;

          await tx`
            insert into users (id, workspace_id, email, full_name, role, avatar_url)
            values (
              ${userId},
              ${workspaceId},
              ${email},
              ${fullName},
              ${role},
              ${avatarUrl}
            )
            on conflict (email) do update set
              workspace_id = excluded.workspace_id,
              full_name = excluded.full_name,
              role = excluded.role,
              avatar_url = excluded.avatar_url,
              updated_at = now()
          `;
          summary.users += 1;

          await tx`
            insert into workspace_members (workspace_id, user_id, role)
            values (${workspaceId}, ${userId}, ${role})
            on conflict (workspace_id, user_id) do nothing
          `;
          summary.workspaceMembers += 1;
        }
      }
    });
  } finally {
    await sql.end({ timeout: 5 });
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
