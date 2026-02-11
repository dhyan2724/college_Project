Quick steps: Local backend + ngrok + Netlify-hosted frontend

1) Start MySQL
- If using XAMPP, open XAMPP control panel and Start MySQL
- Or start the MySQL Windows service

2) Start backend (from project)
```powershell
cd D:\college_Project\backend
npm install
node server.js
```

3) If port 5000 is in use, stop the process or run on a different port (example to run on 5001):
```powershell
$env:PORT='5001'; node server.js
```

4) Start ngrok and copy HTTPS URL
```powershell
ngrok http 5000
# copy https://abcd1234.ngrok.io
```

5) Update runtime env on frontend
- If your Netlify site builds from Git: edit `public/env.js` to set the API URL to the ngrok URL + `/api`, commit & push
- If you deployed drag-and-drop: update `build/env.js` with the ngrok URL and re-upload the build folder

Example `public/env.js` content:
```javascript
window._env_ = window._env_ || {};
window._env_.REACT_APP_API_URL = 'https://abcd1234.ngrok.io/api';
```

6) Rebuild/redeploy frontend and test
- Netlify Git: push -> Netlify rebuilds
- Drag-and-drop: upload build folder

7) Verify login
- Open your Netlify site, open DevTools -> Network, login, and confirm the POST request goes to the ngrok URL and returns 200

Notes
- ngrok free domains change on restart. Use this only for testing.
- For production, deploy backend to a public server and use HTTPS with a proper domain and certificate.
