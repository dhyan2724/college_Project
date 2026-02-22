# Supabase Migration Guide

This guide will walk you through migrating your backend from MySQL to Supabase while maintaining the same database schema.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Set Up Supabase Project](#step-1-set-up-supabase-project)
3. [Step 2: Create Database Schema](#step-2-create-database-schema)
4. [Step 3: Install Dependencies](#step-3-install-dependencies)
5. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
6. [Step 5: Test the Connection](#step-5-test-the-connection)
7. [Step 6: Migrate Existing Data (Optional)](#step-6-migrate-existing-data-optional)
8. [Step 7: Update Frontend (if needed)](#step-7-update-frontend-if-needed)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- Your existing MySQL database (for data migration if needed)

---

## Step 1: Set Up Supabase Project

1. **Create a new Supabase project:**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Fill in your project details:
     - Name: `lab-inventory` (or your preferred name)
     - Database Password: Choose a strong password (save it!)
     - Region: Choose the closest region to your users
   - Click "Create new project"

2. **Wait for project initialization** (takes 1-2 minutes)

3. **Get your Supabase credentials:**
   - Go to Project Settings → API
   - Copy the following:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **Service Role Key** (for backend operations - keep this secret!)
     - **Anon Key** (for public operations)

---

## Step 2: Create Database Schema

1. **Open Supabase SQL Editor:**
   - In your Supabase dashboard, go to "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Run the schema file:**
   - Open the file `backend/database/schema_supabase.sql` in your project
   - Copy the entire contents
   - Paste it into the Supabase SQL Editor
   - Click "Run" (or press Ctrl+Enter)

3. **Verify tables were created:**
   - Go to "Table Editor" in the left sidebar
   - You should see all tables:
     - users
     - chemicals
     - glasswares
     - plasticwares
     - instruments
     - miscellaneous
     - pending_requests
     - pending_request_items
     - issued_items
     - activity_logs
     - lab_registers
     - faqs
     - specimens
     - slides

---

## Step 3: Install Dependencies

1. **Navigate to your backend directory:**
   ```bash
   cd college_Project/backend
   ```

2. **Install Supabase client:**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Remove MySQL dependency (optional, if you want to clean up):**
   ```bash
   npm uninstall mysql2
   ```

   **Note:** Keep `mysql2` if you plan to migrate data from MySQL later.

---

## Step 4: Configure Environment Variables

1. **Update your `.env` file:**
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   SUPABASE_ANON_KEY=your_anon_key_here  # Optional, for client-side if needed

   # Keep your existing environment variables
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret
   # ... other existing variables
   ```

2. **Important Security Notes:**
   - **Never commit** your `.env` file to version control
   - The **Service Role Key** bypasses Row Level Security (RLS) - keep it secret!
   - Use **Anon Key** for client-side operations if needed

---

## Step 5: Test the Connection

1. **Start your backend server:**
   ```bash
   npm start
   # or
   npm run dev
   ```

2. **Check the console output:**
   - You should see: `Connected to Supabase successfully`
   - If you see warnings, check your environment variables

3. **Test an API endpoint:**
   ```bash
   # Test users endpoint
   curl http://localhost:5000/api/users/teachers
   ```

---

## Step 6: Migrate Existing Data (Optional)

If you have existing data in MySQL that you want to migrate:

### Option A: Using Supabase Dashboard

1. **Export data from MySQL:**
   ```bash
   mysqldump -u root -p lab_inventory > mysql_backup.sql
   ```

2. **Convert MySQL data to PostgreSQL format** (you may need a conversion tool)

3. **Import into Supabase:**
   - Use Supabase SQL Editor or
   - Use Supabase CLI: `supabase db push`

### Option B: Using a Migration Script

1. **Create a migration script** (`backend/scripts/migrateToSupabase.js`):
   ```javascript
   const mysql = require('mysql2/promise');
   const { supabase } = require('../config/supabase');
   require('dotenv').config();

   async function migrate() {
     // Connect to MySQL
     const mysqlConn = await mysql.createConnection({
       host: process.env.DB_HOST,
       user: process.env.DB_USER,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_NAME
     });

     // Migrate users
     const [users] = await mysqlConn.execute('SELECT * FROM users');
     for (const user of users) {
       await supabase.from('users').insert(user);
     }

     // Repeat for other tables...
     // (Add similar code for chemicals, glasswares, etc.)

     await mysqlConn.end();
     console.log('Migration complete!');
   }

   migrate();
   ```

2. **Run the migration:**
   ```bash
   node scripts/migrateToSupabase.js
   ```

---

## Step 7: Update Frontend (if needed)

If your frontend directly connects to MySQL, you'll need to update it:

1. **For direct database connections:**
   - Update connection strings to use Supabase
   - Use Supabase client library: `@supabase/supabase-js`

2. **For API-based frontend:**
   - No changes needed! Your backend API remains the same
   - All endpoints work exactly as before

---

## Key Differences: MySQL vs Supabase

### Query Syntax Changes

| MySQL | Supabase |
|-------|----------|
| `SELECT * FROM users WHERE id = ?` | `supabase.from('users').select('*').eq('id', id)` |
| `INSERT INTO users (...) VALUES (...)` | `supabase.from('users').insert([{...}])` |
| `UPDATE users SET ... WHERE id = ?` | `supabase.from('users').update({...}).eq('id', id)` |
| `DELETE FROM users WHERE id = ?` | `supabase.from('users').delete().eq('id', id)` |

### Auto-increment IDs

- **MySQL:** `AUTO_INCREMENT`
- **Supabase:** `SERIAL` (PostgreSQL)

### ENUM Types

- **MySQL:** Native `ENUM` type
- **Supabase:** `VARCHAR` with `CHECK` constraints

### Timestamps

- **MySQL:** `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- **Supabase:** `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` (same, but uses triggers for `updated_at`)

---

## Troubleshooting

### Issue: "Could not connect to Supabase"

**Solution:**
- Check your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Ensure there are no extra spaces or quotes
- Verify your Supabase project is active

### Issue: "Table doesn't exist"

**Solution:**
- Run the schema file (`schema_supabase.sql`) in Supabase SQL Editor
- Check table names match exactly (case-sensitive in PostgreSQL)

### Issue: "Permission denied" or "RLS policy violation"

**Solution:**
- Ensure you're using `SUPABASE_SERVICE_ROLE_KEY` (not anon key) for backend
- Service role key bypasses Row Level Security

### Issue: "Column doesn't exist"

**Solution:**
- Verify column names match the schema
- PostgreSQL is case-sensitive for quoted identifiers
- Check for typos in column names

### Issue: Data migration errors

**Solution:**
- Ensure data types match between MySQL and PostgreSQL
- Convert MySQL `DATETIME` to PostgreSQL `TIMESTAMP`
- Handle NULL values properly
- Check foreign key constraints

---

## What's Changed in the Codebase

### Files Modified:
- ✅ `package.json` - Added `@supabase/supabase-js`, removed `mysql2`
- ✅ `config/supabase.js` - New Supabase configuration file
- ✅ `config/database.js` - Kept for reference (can be removed later)
- ✅ `server.js` - Updated to use Supabase config
- ✅ All model files (`models/*.js`) - Converted to use Supabase client

### Files Created:
- ✅ `database/schema_supabase.sql` - PostgreSQL schema for Supabase
- ✅ `SUPABASE_MIGRATION_GUIDE.md` - This guide

### Files Unchanged:
- ✅ All route files (`routes/*.js`) - No changes needed!
- ✅ Middleware files - No changes needed!
- ✅ Frontend code - No changes needed!

---

## Next Steps

1. ✅ Complete the migration steps above
2. ✅ Test all API endpoints
3. ✅ Migrate existing data (if applicable)
4. ✅ Update your deployment configuration
5. ✅ Monitor Supabase dashboard for usage and performance
6. ✅ Set up Row Level Security (RLS) policies if needed
7. ✅ Configure backups in Supabase dashboard

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Discord Community](https://discord.supabase.com)

---

## Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review Supabase logs in the dashboard
3. Check your backend server logs
4. Consult Supabase documentation or community

---

**Migration completed!** Your backend is now running on Supabase with the same database schema. 🎉
