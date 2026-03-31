-- =============================================================
-- Daily Engine — Supabase / PostgreSQL Schema
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Day Entries ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS day_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  tasks_json      JSONB NOT NULL DEFAULT '[]',
  notes_json      JSONB NOT NULL DEFAULT '{"blocked":"","worked":"","change":""}',
  completion_rate INT  NOT NULL DEFAULT 0,
  busy_day        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_day_entries_updated_at
  BEFORE UPDATE ON day_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for fast per-user history lookups
CREATE INDEX IF NOT EXISTS idx_day_entries_user_date
  ON day_entries(user_id, date DESC);
