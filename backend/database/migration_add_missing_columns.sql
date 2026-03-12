-- ============================================================
-- Migration: Add missing columns to pending_requests table
-- ============================================================
-- Run this in your Supabase Dashboard:
--   1. Go to https://app.supabase.com
--   2. Select your project
--   3. Click "SQL Editor" in the left sidebar
--   4. Paste this entire script and click "Run"
-- ============================================================

-- Add desiredIssueTime column if it doesn't exist
ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS "desiredIssueTime" TIMESTAMP;

-- Add desiredReturnTime column if it doesn't exist
ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS "desiredReturnTime" TIMESTAMP;

-- Add requestedByName column if it doesn't exist
ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS "requestedByName" VARCHAR(255);

-- Add requestedByRole column if it doesn't exist
ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS "requestedByRole" VARCHAR(255);

-- Add requestedByRollNo column if it doesn't exist
ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS "requestedByRollNo" VARCHAR(255);

-- Add requestedByCollegeEmail column if it doesn't exist
ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS "requestedByCollegeEmail" VARCHAR(255);

-- Add notes column if it doesn't exist
ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Add purpose column if it doesn't exist
ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS "purpose" TEXT;

-- Add requestDate column if it doesn't exist
ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS "requestDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add status column if it doesn't exist
ALTER TABLE pending_requests
  ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT 'pending';

-- ============================================================
-- Fix pending_request_items itemType CHECK constraint
-- to include Miscellaneous, Specimen, and Slide item types
-- ============================================================

-- Drop old constraint (ignore error if it doesn't exist)
ALTER TABLE pending_request_items
  DROP CONSTRAINT IF EXISTS pending_request_items_itemtype_check;

-- Add updated constraint with all supported item types
ALTER TABLE pending_request_items
  ADD CONSTRAINT pending_request_items_itemtype_check
  CHECK ("itemType" IN ('Chemical', 'Glassware', 'Plasticware', 'Instrument', 'Miscellaneous', 'Specimen', 'Slide'));

-- ============================================================
-- Reload PostgREST schema cache so changes take effect
-- ============================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- Verification: Run this SELECT to confirm columns exist
-- ============================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pending_requests'
ORDER BY ordinal_position;
