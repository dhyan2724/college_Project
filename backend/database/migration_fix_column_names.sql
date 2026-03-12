-- ============================================================
-- Migration: Fix column name casing in pending_requests
--            and pending_request_items tables
-- ============================================================
-- PROBLEM:
--   PostgreSQL stored all column names in lowercase because
--   they were created without double-quotes. The application
--   code uses camelCase column names, so Supabase PostgREST
--   cannot find them in the schema cache.
--
-- WHAT THIS SCRIPT DOES:
--   1. Drops the duplicate camelCase columns added by the
--      previous migration (to avoid name conflicts).
--   2. Renames the original lowercase columns to camelCase
--      using double-quoted identifiers (PostgreSQL preserves
--      case when identifiers are double-quoted).
--   3. Does the same for pending_request_items.
--   4. Reloads the PostgREST schema cache.
--
-- HOW TO RUN:
--   1. Go to https://app.supabase.com
--   2. Select your project
--   3. Click "SQL Editor" in the left sidebar
--   4. Paste this entire script and click "Run"
-- ============================================================


-- ============================================================
-- STEP 1: Drop duplicate camelCase columns added by the
--         previous migration (safe — they are empty anyway)
-- ============================================================

ALTER TABLE pending_requests DROP COLUMN IF EXISTS "desiredIssueTime";
ALTER TABLE pending_requests DROP COLUMN IF EXISTS "desiredReturnTime";
ALTER TABLE pending_requests DROP COLUMN IF EXISTS "requestedByName";
ALTER TABLE pending_requests DROP COLUMN IF EXISTS "requestedByRole";
ALTER TABLE pending_requests DROP COLUMN IF EXISTS "requestedByRollNo";
ALTER TABLE pending_requests DROP COLUMN IF EXISTS "requestedByCollegeEmail";
ALTER TABLE pending_requests DROP COLUMN IF EXISTS "requestDate";
ALTER TABLE pending_requests DROP COLUMN IF EXISTS "status";
ALTER TABLE pending_requests DROP COLUMN IF EXISTS "notes";
ALTER TABLE pending_requests DROP COLUMN IF EXISTS "purpose";


-- ============================================================
-- STEP 2: Rename lowercase columns to camelCase in
--         pending_requests
-- ============================================================

ALTER TABLE pending_requests RENAME COLUMN facultyinchargeid      TO "facultyInChargeId";
ALTER TABLE pending_requests RENAME COLUMN requestedbyuserid      TO "requestedByUserId";
ALTER TABLE pending_requests RENAME COLUMN requestedbyname        TO "requestedByName";
ALTER TABLE pending_requests RENAME COLUMN requestedbyrole        TO "requestedByRole";
ALTER TABLE pending_requests RENAME COLUMN requestedbyrollno      TO "requestedByRollNo";
ALTER TABLE pending_requests RENAME COLUMN requestedbycollegeemail TO "requestedByCollegeEmail";
ALTER TABLE pending_requests RENAME COLUMN desiredissuetime       TO "desiredIssueTime";
ALTER TABLE pending_requests RENAME COLUMN desiredreturntime      TO "desiredReturnTime";
ALTER TABLE pending_requests RENAME COLUMN requestdate            TO "requestDate";


-- ============================================================
-- STEP 3: Fix pending_request_items column names
-- ============================================================

-- Drop any duplicate camelCase columns if they somehow exist
ALTER TABLE pending_request_items DROP COLUMN IF EXISTS "pendingRequestId";
ALTER TABLE pending_request_items DROP COLUMN IF EXISTS "itemType";
ALTER TABLE pending_request_items DROP COLUMN IF EXISTS "itemId";
ALTER TABLE pending_request_items DROP COLUMN IF EXISTS "totalWeightRequested";

-- Rename lowercase columns to camelCase
ALTER TABLE pending_request_items RENAME COLUMN pendingrequestid       TO "pendingRequestId";
ALTER TABLE pending_request_items RENAME COLUMN itemtype               TO "itemType";
ALTER TABLE pending_request_items RENAME COLUMN itemid                 TO "itemId";
ALTER TABLE pending_request_items RENAME COLUMN totalweightrequested   TO "totalWeightRequested";


-- ============================================================
-- STEP 4: Fix the itemType CHECK constraint to include all
--         supported item types (Miscellaneous, Specimen, Slide)
-- ============================================================

ALTER TABLE pending_request_items
  DROP CONSTRAINT IF EXISTS pending_request_items_itemtype_check;

ALTER TABLE pending_request_items
  ADD CONSTRAINT pending_request_items_itemtype_check
  CHECK ("itemType" IN ('Chemical', 'Glassware', 'Plasticware', 'Instrument', 'Miscellaneous', 'Specimen', 'Slide'));


-- ============================================================
-- STEP 5: Reload PostgREST schema cache so all changes
--         are immediately visible to the API
-- ============================================================

NOTIFY pgrst, 'reload schema';


-- ============================================================
-- STEP 6: Verify — run these SELECTs to confirm the fix
-- ============================================================

-- Should show camelCase column names for pending_requests
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pending_requests'
ORDER BY ordinal_position;

-- Should show camelCase column names for pending_request_items
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pending_request_items'
ORDER BY ordinal_position;
