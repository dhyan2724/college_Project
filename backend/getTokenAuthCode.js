// getTokenAuthCode.js - Alternative method for getting refresh tokens
const { PublicClientApplication } = require('@azure/msal-node');
const http = require('http');
const url = require('url');

const config = {
  auth: {
    clientId: 'f157d3e1-f654-43ee-9a79-555b4e0976a6',
    authority: 'https://login.microsoftonline.com/d1b99a31-59dc-4039-b9c4-f6166b6bf0a4',
    redirectUri: 'http://localhost:3000/callback'
  }
};

const pca = new PublicClientApplication(config);

// Create a simple server to handle the callback
const server = http.createServer(async (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  
  if (req.url.startsWith('/callback')) {
    try {
      const response = await pca.acquireTokenByCode({
        code: queryObject.code,
        scopes: ["Mail.Send", "offline_access", "User.Read", "openid", "profile"],
        redirectUri: 'http://localhost:3000/callback'
      });

      console.log('\n✅ Success! Here are your tokens:\n');
      
      console.log('=== ACCESS TOKEN ===');
      console.log(response.accessToken);
      
      if (response.refreshToken) {
        console.log('\n=== REFRESH TOKEN ===');
        console.log(response.refreshToken);
      } else {
        console.log('\n⚠️  No refresh token received!');
      }
      
      console.log('\n=== EXPIRES ON ===');
      console.log(response.expiresOn);
      
      console.log('\n📝 Copy these values to your .env file:');
      console.log(`EMAIL_ACCESS_TOKEN=${response.accessToken}`);
      if (response.refreshToken) {
        console.log(`EMAIL_REFRESH_TOKEN=${response.refreshToken}`);
      } else {
        console.log('EMAIL_REFRESH_TOKEN=NO_REFRESH_TOKEN_RECEIVED');
      }
      console.log(`EMAIL_TENANT_ID=d1b99a31-59dc-4039-b9c4-f6166b6bf0a4`);

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Authentication successful!</h1><p>You can close this window and check your terminal.</p>');
      
      // Close server after 5 seconds
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 5000);
      
    } catch (error) {
      console.error('❌ Error getting token:', error);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>Authentication failed!</h1><p>Check your terminal for details.</p>');
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

async function startAuth() {
  try {
    console.log('Starting authorization code flow...\n');
    
    // Start the server
    server.listen(3000, () => {
      console.log('Server running on http://localhost:3000');
    });

    // Generate the auth URL
    const authUrl = await pca.getAuthCodeUrl({
      scopes: ["Mail.Send", "offline_access", "User.Read", "openid", "profile"],
      redirectUri: 'http://localhost:3001/callback',
      prompt: 'consent' // Force consent screen
    });

    console.log('\n🌐 Open this URL in your browser:');
    console.log(authUrl);
    console.log('\n⚠️  IMPORTANT: Make sure to consent to ALL permissions including "Maintain access to data you have given it access to"');
    
  } catch (error) {
    console.error('❌ Error starting auth:', error);
  }
}

startAuth(); 