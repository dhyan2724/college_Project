// refreshToken.js - Get a new access token when the current one expires
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
  },
  scopes: ["Mail.Send", "User.Read"],
};

async function getNewToken() {
  try {
    console.log('Getting a new access token...\n');

    const response = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
    
    console.log('\n✅ New access token obtained!\n');
    
    console.log('=== NEW ACCESS TOKEN ===');
    console.log(response.accessToken);
    
    console.log('\n=== EXPIRES ON ===');
    console.log(response.expiresOn);
    
    console.log('\n📝 Update your .env file with this new access token:');
    console.log(`EMAIL_ACCESS_TOKEN=${response.accessToken}`);
    
  } catch (error) {
    console.error('❌ Error getting new token:', error);
  }
}

getNewToken(); 