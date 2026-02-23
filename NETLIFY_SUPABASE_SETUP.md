# Netlify + Supabase Setup Guide

## ✅ Done: Frontend Configuration

Your frontend is now configured to use Supabase. Here's what was set up:

### 1. Environment Variables in Runtime Files
- **`public/env.js`** - Updated with Supabase URL and Anon Key
- **`build/env.js`** - Updated with Supabase URL and Anon Key

These files load environment variables **at runtime**, so you can change them on Netlify without rebuilding.

### 2. Supabase Client
- **`src/services/supabaseClient.js`** - Created Supabase client that uses the runtime variables

### 3. Your Supabase Credentials
```
Project URL: https://lhhoacasfrqzqdbygmnq.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoaG9hY2FzZnJxenFkYnlnbW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3Njc5NDQsImV4cCI6MjA4NzM0Mzk0NH0.YWSP8fvzFcLrYRwPT6lGGt-vCuLEmF7lgDiSMPNPX6k
```

## 📋 Netlify Deployment Steps

### Step 1: Add Environment Variables to Netlify
1. Go to your **Netlify Dashboard**
2. Select your site → **Site Settings** → **Build & Deploy** → **Environment**
3. Click **Add environment variable**
4. Add these variables:
   ```
   REACT_APP_SUPABASE_URL = https://lhhoacasfrqzqdbygmnq.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoaG9hY2FzZnJxenFkYnlnbW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3Njc5NDQsImV4cCI6MjA4NzM0Mzk0NH0.YWSP8fvzFcLrYRwPT6lGGt-vCuLEmF7lgDiSMPNPX6k
   ```

### Step 2: Install Supabase Package (if not already)
Make sure your frontend has the Supabase package:
```bash
npm install @supabase/supabase-js
```

### Step 3: Rebuild on Netlify
1. Go to **Deploys**
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the build to complete

## 🔧 Using Supabase in Your Components

### Example: Fetch Data
```javascript
import { supabase } from './services/supabaseClient';

// In your component
const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) console.error('Error fetching users:', error);
  return data;
};
```

### Example: Sign Up
```javascript
const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) console.error('Sign up error:', error);
  return data;
};
```

### Example: Login
```javascript
const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) console.error('Login error:', error);
  return data;
};
```

## 🔐 Security Best Practices

1. **Use Anon Key Only in Frontend** ✅ (Already using it)
2. **Enable Row Level Security (RLS)** in Supabase:
   - Go to your Supabase dashboard
   - Select your table
   - Click **Security** → **Edit RLS policies**
   - Create policies to restrict data access

3. **Never expose Service Role Key** in frontend code

## 🧪 Test Your Connection

Add this to a test component:
```javascript
import { supabase } from './services/supabaseClient';

useEffect(() => {
  const testConnection = async () => {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Connection error:', error);
    } else {
      console.log('✅ Supabase connected successfully!');
    }
  };
  
  testConnection();
}, []);
```

## 📚 Resources
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

---

**All set!** Your Netlify frontend is now connected to Supabase. Deploy and test! 🚀
