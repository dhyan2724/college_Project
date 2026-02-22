Quick test: expose local backend with ngrok and deploy frontend to Netlify

Steps (Windows PowerShell)

1) Build frontend

```powershell
# from project root
npm install
npm install
```

2) Run backend locally (example assumes port 5000)

```powershell
# from backend folder
cd backend
npm install
node server.js
# or however you normally start your backend
```

3) Expose backend with ngrok

```powershell
# install ngrok and login/authorize per ngrok docs, then:
ngrok http 5000
# ngrok will print an HTTPS forwarding URL like https://abcd1234.ngrok.io
```

4) Update runtime env on the frontend host

- If you're using Netlify drag-and-drop, upload the built `build/` folder contents.
- After deploying, create or edit the file `env.js` at your site root (Netlify allows you to upload an additional file) so it's available at `https://nuvsoslabs.in/env.js`.

Example `env.js` content (replace with your ngrok URL):

```javascript
window._env_ = window._env_ || {};
window._env_.REACT_APP_API_URL = 'https://abcd1234.ngrok.io/api';
```

5) Point your domain (nuvsoslabs.in)

- If using Netlify, set the domain in the Netlify site settings and follow Netlify's DNS instructions (either point A records to Netlify or use Netlify's nameservers).

Notes
- ngrok free URLs change on restart. Use this only for quick testing.
- For production, host backend on a public server and use HTTPS with a stable domain.
