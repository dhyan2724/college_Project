-- ============================================================
-- Migration: Fix column name casing in issued_items table
--            and add any missing columns
-- ============================================================
-- PROBLEM:
--   PostgreSQL stored all column names in lowercase because
--   they were created without double-quotes. The application
--   code uses camelCase column names, so Supabase PostgREST
--   cannot find them in the schema cache.
--   Error seen: "Could not find the 'facultyInCharge' column
--   of 'issued_items' in the schema cache"
--
-- WHAT THIS SCRIPT DOES:
--   1. Adds any missing columns (e.g. facultyInCharge) that
--      may not have been created at all.
--   2. Renames all lowercase columns to camelCase using
--      double-quoted identifiers so PostgreSQL preserves case.
--   3. Reloads the PostgREST schema cache.
--
-- HOW TO RUN:
--   1. Go to https://app.supabase.com
--   2. Select your project
--   3. Click "SQL Editor" in the left sidebar
--   4. Paste this entire script and click "Run"
-- ============================================================


-- ============================================================
-- STEP 1: Add any completely missing columns
--         (safe to run even if they already exist)
-- ============================================================

ALTER TABLE issued_items
  ADD COLUMN IF NOT EXISTS facultyincharge VARCHAR(255);

ALTER TABLE issued_items
  ADD COLUMN IF NOT EXISTS issuedbyname VARCHAR(255);

ALTER TABLE issued_items
  ADD COLUMN IF NOT EXISTS issuedbyrole VARCHAR(255);

ALTER TABLE issued_items
  ADD COLUMN IF NOT EXISTS issuedbyrollno VARCHAR(255);

ALTER TABLE issued_items
  ADD COLUMN IF NOT EXISTS totalweightissued DECIMAL(10,2);

ALTER TABLE issued_items
  ADD COLUMN IF NOT EXISTS issuedate TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE issued_items
  ADD COLUMN IF NOT EXISTS returndate TIMESTAMP;

ALTER TABLE issued_items
  ADD COLUMN IF NOT EXISTS pendingrequestid INT;

ALTER TABLE issued_items
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE issued_items
  ADD COLUMN IF NOT EXISTS purpose TEXT;

ALTER TABLE issued_items
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'issued';


-- ============================================================
-- STEP 2: Drop any stale camelCase duplicates that might have
--         been added by a previous partial migration attempt
--         (safe — ignore errors if they do not exist)
-- ============================================================

ALTER TABLE issued_items DROP COLUMN IF EXISTS "itemType";
ALTER TABLE issued_items DROP COLUMN IF EXISTS "itemId";
ALTER TABLE issued_items DROP COLUMN IF EXISTS "issuedToId";
ALTER TABLE issued_items DROP COLUMN IF EXISTS "issuedByUserId";
ALTER TABLE issued_items DROP COLUMN IF EXISTS "issuedByName";
ALTER TABLE issued_items DROP COLUMN IF EXISTS "issuedByRole";
ALTER TABLE issued_items DROP COLUMN IF EXISTS "issuedByRollNo";
ALTER TABLE issued_items DROP COLUMN IF EXISTS "facultyInCharge";
ALTER TABLE issued_items DROP COLUMN IF EXISTS "totalWeightIssued";
ALTER TABLE issued_items DROP COLUMN IF EXISTS "issueDate";
ALTER TABLE issued_items DROP COLUMN IF EXISTS "returnDate";
ALTER TABLE issued_items DROP COLUMN IF EXISTS "pendingRequestId";


-- ============================================================
-- STEP 3: Rename lowercase columns to camelCase
-- ============================================================

ALTER TABLE issued_items RENAME COLUMN itemtype           TO "itemType";
ALTER TABLE issued_items RENAME COLUMN itemid             TO "itemId";
ALTER TABLE issued_items RENAME COLUMN issuedtoid         TO "issuedToId";
ALTER TABLE issued_items RENAME COLUMN issuedbyuserid     TO "issuedByUserId";
ALTER TABLE issued_items RENAME COLUMN issuedbyname       TO "issuedByName";
ALTER TABLE issued_items RENAME COLUMN issuedbyrole       TO "issuedByRole";
ALTER TABLE issued_items RENAME COLUMN issuedbyrollno     TO "issuedByRollNo";
ALTER TABLE issued_items RENAME COLUMN facultyincharge    TO "facultyInCharge";
ALTER TABLE issued_items RENAME COLUMN totalweightissued  TO "totalWeightIssued";
ALTER TABLE issued_items RENAME COLUMN issuedate          TO "issueDate";
ALTER TABLE issued_items RENAME COLUMN returndate         TO "returnDate";
ALTER TABLE issued_items RENAME COLUMN pendingrequestid   TO "pendingRequestId";


-- ============================================================
-- STEP 4: Fix the itemType CHECK constraint to match the
--         application's supported item types
-- ============================================================

ALTER TABLE issued_items
  DROP CONSTRAINT IF EXISTS issued_items_itemtype_check;

ALTER TABLE issued_items
  ADD CONSTRAINT issued_items_itemtype_check
  CHECK ("itemType" IN ('Chemical', 'Glassware', 'Plasticware', 'Instrument', 'Miscellaneous', 'Specimen', 'Slide'));


-- ============================================================
-- STEP 5: Fix the status CHECK constraint
-- ============================================================

ALTER TABLE issued_items
  DROP CONSTRAINT IF EXISTS issued_items_status_check;

ALTER TABLE issued_items
  ADD CONSTRAINT issued_items_status_check
  CHECK (status IN ('issued', 'returned'));


-- ============================================================
-- STEP 6: Reload PostgREST schema cache so all changes are
--         immediately visible to the Supabase API
-- ============================================================

NOTIFY pgrst, 'reload schema';


-- ============================================================
-- STEP 7: Verify — confirm all columns are correct
-- ============================================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'issued_items'
ORDER BY ordinal_position;
