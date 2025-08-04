// getToken.js
const { PublicClientApplication } = require('@azure/msal-node');

const config = {
  auth: {
    clientId: 'f157d3e1-f654-43ee-9a79-555b4e0976a6',
    authority: 'https://login.microsoftonline.com/d1b99a31-59dc-4039-b9c4-f6166b6bf0a4',
  }
};

const pca = new PublicClientApplication(config);

const deviceCodeRequest = {
  deviceCodeCallback: (response) => {
    console.log('\n' + response.message);
    console.log('\nPlease complete the authentication in your browser...');
    console.log('Make sure to log in with: soslabs@nuv.ac.in');
    console.log('\n⚠️  IMPORTANT: When you see the permissions screen, make sure to check ALL permissions including "Maintain access to data you have given it access to"');
  },
  scopes: ["Mail.Send", "offline_access", "User.Read", "openid", "profile"],
};

async function getToken() {
  try {
    console.log('Starting device code flow...');
    console.log('This may take a moment...\n');

    const response = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
    
    console.log('\n✅ Success! Here are your tokens:\n');
    
    console.log('=== ACCESS TOKEN ===');
    console.log(response.accessToken);
    
    if (response.refreshToken) {
      console.log('\n=== REFRESH TOKEN ===');
      console.log(response.refreshToken);
    } else {
      console.log('\n⚠️  No refresh token received!');
      console.log('This might be because:');
      console.log('1. The "offline_access" scope was not granted');
      console.log('2. Your Azure app is not configured for refresh tokens');
      console.log('3. You need to consent to "Maintain access to data you have given it access to"');
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
    
  } catch (error) {
    console.error('❌ Error getting token:', error);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure you completed the browser login');
    console.log('2. Check that you consented to ALL permissions');
    console.log('3. Try again in a few minutes');
  }
}

getToken();