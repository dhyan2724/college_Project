const http = require('http');

const options = {
  hostname: '172.168.2.130',
  port: 5000,
  path: '/api/chemicals',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`✅ Server is running! Status: ${res.statusCode}`);
  console.log(`✅ Response headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log(`✅ Chemicals endpoint response:`, jsonData);
      console.log(`✅ Number of chemicals:`, Array.isArray(jsonData) ? jsonData.length : 'Not an array');
    } catch (e) {
      console.log(`⚠️ Response is not JSON:`, data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Server connection failed:`, e.message);
  console.log(`\nPossible issues:`);
  console.log(`1. Backend server is not running`);
  console.log(`2. Server is not listening on port 5000`);
  console.log(`3. Firewall blocking the connection`);
  console.log(`4. Server is running on a different port`);
});

req.end();

console.log('🔍 Checking if backend server is accessible...');
console.log('📍 Testing connection to: http://172.168.2.130:5000/api/chemicals');
