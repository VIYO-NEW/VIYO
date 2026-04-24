/**
 * LLM Council Domain — R20 §2, R19 Wiring
 * Tables: council_decisions
 * Tenant-scoped via workspace_id → workspaces.id
 */
import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  numeric,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { workspaces } from './identity';

/* ──────────────────────────────────────────────
 * COUNCIL_DECISIONS — Council of Brains decision log
 * R20: tenantScoped = true → workspace_id FK + RLS
 * R19 Wiring: 5-Brain Council votes + final decision
 * ────────────────────────────────────────────── */
export const councilDecisions = pgTable('council_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  decisionType: varchar('decision_type', { length: 50 }).notNull(),
  inputContext: jsonb('input_context').notNull(),
  brainVotes: jsonb('brain_votes').notNull(),
  finalDecision: jsonb('final_decision').notNull(),
  confidenceScore: numeric('confidence_score', { precision: 3, scale: 2 }),
  executionTimeMs: integer('execution_time_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
