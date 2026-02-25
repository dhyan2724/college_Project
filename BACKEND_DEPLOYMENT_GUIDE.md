# Backend Deployment & CORS Fix Guide

## Problem Summary
- Your **frontend** is hosted on Netlify at `https://nuvsoslabs.in` (via Netlify's CDN)
- Your **backend** (Node.js + Supabase) is running locally on `http://localhost:5000`
- Browsers block cross-origin requests due to missing CORS headers
- The backend never receives requests because it's not publicly accessible

## Solution Overview
You need to **expose your backend server publicly** and configure the frontend to call it.

## Option 1: Quick Testing with ngrok (Recommended for Testing)

### Step 1: Start ngrok tunnel
```powershell
# Install ngrok if not already: https://ngrok.com/download
ngrok http 5000
```
You'll see output like:
```
Forwarding  https://abc123def456.ngrok.io -> http://localhost:5000
```
Keep this terminal running.

### Step 2: Update frontend to use ngrok URL
Edit `public/env.js` on your production server (Netlify) or locally before pushing:
```javascript
window._env_.REACT_APP_API_URL = 'https://abc123def456.ngrok.io/api';
```

### Step 3: Commit and push the change
```powershell
git add public/env.js
git commit -m "Point frontend to ngrok backend for testing"
git push
```
Netlify will auto-deploy.

### Step 4: Test login
- Open `https://nuvsoslabs.in` in your browser
- Open DevTools (F12) → Network tab
- Click Login and enter credentials
- You should see the POST request go to the ngrok URL and return 200 OK
- The CORS error should be gone

### Important Notes
- **ngrok free accounts** regenerate URLs on restart, so the URL changes each time
- Use ngrok only for **testing**
- For **production**, deploy to a permanent server (see Option 2)

---

## Option 2: Production Deployment

### A. Deploy to Railway (Easiest)
1. Go to https://railway.app
2. Create account / login
3. Create new project → GitHub → Select your repo
4. Set environment variables from `backend/.env` in Railway dashboard
5. Railway assigns a public URL (e.g., `https://your-app.up.railway.app`)
6. Update `public/env.js` with the Railway URL

### B. Deploy to Render
1. Go to https://render.com
2. Create new "Web Service" → GitHub → Select repo
3. Set runtime to "Node" and start command to `npm --prefix backend start`
4. Add environment variables from `backend/.env`
5. Render assigns a public URL
6. Update `public/env.js`

### C. Deploy to Your Own Server
1. SSH into your server (requires hosting setup)
2. Clone your repo and navigate to `backend/`
3. Install: `npm install`
4. Set up `backend/.env` on the server
5. Run: `node server.js` (or use a process manager like PM2)
6. Configure a reverse proxy (NGINX) to forward requests through HTTPS
7. Use a domain and SSL certificate
8. Update `public/env.js` with your server URL

---

## Files Modified

### 1. `backend/server.js` (already updated)
- Added CORS headers to allow frontend origins
- Added global OPTIONS handler for preflight requests

### 2. `public/env.js` (updated)
- Changed `REACT_APP_API_URL` default from `https://nuvsoslabs.in/api` to `http://localhost:5000/api`
- **YOU MUST UPDATE THIS** with your actual backend URL before deploying

### 3. `netlify.toml` (updated)
- Removed incorrect Supabase proxy redirect
- Kept SPA routing rule

---

## Verification Checklist

- [ ] Backend is running locally: `npm start` from `backend/` folder
- [ ] Backend CORS headers are enabled (`backend/server.js` has `app.use(cors(corsOptions))` and `app.options('*', cors(corsOptions))`)
- [ ] Frontend `public/env.js` has correct `REACT_APP_API_URL`
- [ ] ngrok OR production backend URL is publicly accessible
- [ ] Frontend is deployed with the updated `public/env.js` (via `git push` to Netlify)
- [ ] Browser DevTools Network tab shows POST request to the correct backend URL
- [ ] POST response includes `Access-Control-Allow-Origin` header

---

## Quick Testing Commands

### Test preflight (OPTIONS) — curl with insecure flag for testing
```powershell
curl.exe -i -k -X OPTIONS "https://nuvsoslabs.in/api/users/login" `
  -H "Origin: http://nuvsoslabs.in" `
  -H "Access-Control-Request-Method: POST"
```

### Test POST login — curl with insecure flag
```powershell
curl.exe -i -k -X POST "https://nuvsoslabs.in/api/users/login" `
  -H "Origin: http://nuvsoslabs.in" `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"pass"}'
```

Expected: HTTP 200 with `Access-Control-Allow-Origin` header in response.

---

## Troubleshooting

**CORS error still appears after deploying:**
- Check: Does `public/env.js` have the correct backend URL? (Check deployed version at `https://nuvsoslabs.in/env.js` or in DevTools)
- Check: Is the backend publicly accessible? (Try accessing it directly in your browser)
- Check: Does the backend respond with `Access-Control-Allow-Origin` header?

**502 Bad Gateway from Netlify:**
- Backend is not running or not publicly accessible
- Netlify proxy URL is wrong
- Check Netlify deploy logs for errors

**Backend not responding:**
- Verify: `npm start` from `backend/` folder succeeded
- Verify: Port 5000 is not blocked by firewall
- Verify: No errors in backend console output

**Stuck? Ask for help with:**
- Your backend public URL (ngrok, Railway, or server domain)
- Error messages from backend console
- Network tab errors from browser DevTools
