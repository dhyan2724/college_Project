-- ============================================================
-- Migration: Restore accidentally dropped columns in
--            pending_requests table
-- ============================================================
-- PROBLEM:
--   The previous migration (migration_fix_column_names.sql)
--   accidentally dropped the original lowercase columns:
--     - notes
--     - status
--     - purpose
--   These were NOT duplicates — they were the real columns
--   used by the application code.
--
-- HOW TO RUN:
--   1. Go to https://app.supabase.com
--   2. Select your project
--   3. Click "SQL Editor" in the left sidebar
--   4. Paste this entire script and click "Run"
-- ============================================================


-- ============================================================
-- STEP 1: Restore dropped columns
-- ============================================================

ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS purpose TEXT;

ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS notes TEXT;


-- ============================================================
-- STEP 2: Reload PostgREST schema cache
-- ============================================================

NOTIFY pgrst, 'reload schema';


-- ============================================================
-- STEP 3: Verify — confirm all expected columns are present
-- ============================================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'pending_requests'
ORDER BY ordinal_position;
