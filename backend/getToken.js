const https = require('https');

async function getAccessToken() {
  try {
    // For application permissions, we need to use client credentials flow
    const postData = new URLSearchParams({
      client_id: process.env.EMAIL_CLIENT_ID,
      client_secret: process.env.EMAIL_CLIENT_SECRET,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    }).toString();

    const options = {
      hostname: 'login.microsoftonline.com',
      port: 443,
      path: `/${process.env.EMAIL_TENANT_ID}/oauth2/v2.0/token`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const response = JSON.parse(data);
              console.log('Successfully obtained access token');
              resolve(response.access_token);
            } catch (error) {
              console.error('Error parsing response:', error);
              resolve(null);
            }
          } else {
            console.error('Token request failed:', res.statusCode, res.statusMessage, data);
            resolve(null);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error getting access token:', error);
        resolve(null);
      });

      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

module.exports = { getAccessToken };