-- VIYO Schema Migration 001 — Extensions
-- R20 §2: Required PostgreSQL extensions
-- Applied via Supabase MCP apply_migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
