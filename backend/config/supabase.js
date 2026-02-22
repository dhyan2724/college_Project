const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Supabase URL or Key not found in environment variables.');
  console.warn('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
}

// Create Supabase client
// Use service role key for backend operations (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test Supabase connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (expected on first run)
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Connected to Supabase successfully');
    return true;
  } catch (error) {
    console.error('Could not connect to Supabase:', error);
    return false;
  }
};

// Initialize database schema (run SQL from schema file)
// Note: This should be run manually via Supabase SQL Editor or using Supabase CLI
// For automated setup, you can use Supabase Management API or migrations
const initializeDatabase = async () => {
  try {
    // Note: Supabase doesn't support executing raw SQL files directly from Node.js
    // You should run the schema_supabase.sql file in the Supabase SQL Editor
    // or use Supabase migrations
    console.log('Database schema initialization:');
    console.log('Please run the schema_supabase.sql file in your Supabase SQL Editor');
    console.log('Or use Supabase migrations: https://supabase.com/docs/guides/cli/local-development');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  supabase,
  testConnection,
  initializeDatabase
};
