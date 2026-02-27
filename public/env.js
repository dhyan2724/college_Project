// Runtime environment variables for the static frontend.
// Edit this file on the server hosting nuvsoslabs.in to change the API URL without rebuilding.
window._env_ = window._env_ || {};

// ===== IMPORTANT: Configure your backend URL here =====
// Replace 'http://localhost:5000' with your actual backend server address.
// Examples:
//   - Local/ngrok: 'https://abcd1234.ngrok.io/api' (for testing via ngrok tunnel)
//   - Production API server: 'https://api.yourdomain.com/api'
//   - Self-hosted: 'http://192.168.1.100:5000/api'
// ===== Prefer runtime-configured API URL here in production. Edit this file on the
// CDN/server to change the frontend -> backend endpoint without rebuilding.
// For your deployed app, point to your live backend:
//   - Current production backend: https://college-project-7hup.vercel.app/api
window._env_.REACT_APP_API_URL = window._env_.REACT_APP_API_URL || 'https://college-project-7hup.vercel.app/api';

// Supabase Configuration (used by backend for database)
window._env_.REACT_APP_SUPABASE_URL = window._env_.REACT_APP_SUPABASE_URL || 'https://lhhoacasfrqzqdbygmnq.supabase.co';
window._env_.REACT_APP_SUPABASE_ANON_KEY = window._env_.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoaG9hY2FzZnJxenFkYnlnbW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3Njc5NDQsImV4cCI6MjA4NzM0Mzk0NH0.YWSP8fvzFcLrYRwPT6lGGt-vCuLEmF7lgDiSMPNPX6k';
