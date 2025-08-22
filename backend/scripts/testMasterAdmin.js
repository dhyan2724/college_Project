require('dotenv').config();
const http = require('http');

const API_URL = 'http://172.168.2.130:5000/api';

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testMasterAdmin() {
  try {
    console.log('🧪 Testing Master Admin Functionality...\n');

    // 1. Test Login
    console.log('1. Testing Master Admin Login...');
    const loginResponse = await makeRequest('POST', '/users/login', {
      username: 'master_admin',
      password: 'MasterAdmin@2024'
    });

    if (loginResponse.status !== 200) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`   User: ${loginResponse.data.user.fullName} (${loginResponse.data.user.role})`);

    // 2. Test Statistics Endpoint
    console.log('\n2. Testing Statistics Endpoint...');
    const statsResponse = await makeRequest('GET', '/master-admin/statistics', null, token);

    if (statsResponse.status !== 200) {
      throw new Error('Statistics endpoint failed');
    }

    console.log('✅ Statistics endpoint working');
    console.log(`   Total Users: ${statsResponse.data.totalUsers}`);
    console.log(`   Admins: ${statsResponse.data.byRole.admin || 0}`);
    console.log(`   Faculty: ${statsResponse.data.byRole.faculty || 0}`);
    console.log(`   Students: ${statsResponse.data.byRole.student || 0}`);

    // 3. Test Users Endpoint
    console.log('\n3. Testing Users Endpoint...');
    const usersResponse = await makeRequest('GET', '/master-admin/users', null, token);

    if (usersResponse.status !== 200) {
      throw new Error('Users endpoint failed');
    }

    console.log('✅ Users endpoint working');
    console.log(`   Found ${usersResponse.data.length} users`);

    // 4. Test Create User Endpoint
    console.log('\n4. Testing Create User Endpoint...');
    const testUser = {
      username: 'test_user_' + Date.now(),
      password: 'TestPassword123',
      role: 'student',
      email: 'test.user@nuv.ac.in',
      fullName: 'Test User',
      rollNo: 'TEST001',
      category: 'UG/PG'
    };

    const createResponse = await makeRequest('POST', '/master-admin/create-user', testUser, token);

    if (createResponse.status !== 201) {
      throw new Error(`Create user failed: ${createResponse.data.message}`);
    }

    console.log('✅ Create user endpoint working');
    console.log(`   Created user: ${createResponse.data.user.fullName} (${createResponse.data.user.role})`);

    // 5. Test Change Password Endpoint
    console.log('\n5. Testing Change Password Endpoint...');
    const changePasswordResponse = await makeRequest('PATCH', `/master-admin/users/${createResponse.data.user.id}/change-password`, {
      newPassword: 'NewTestPassword123'
    }, token);

    if (changePasswordResponse.status !== 200) {
      throw new Error(`Change password failed: ${changePasswordResponse.data.message}`);
    }

    console.log('✅ Change password endpoint working');

    // 6. Test Delete User Endpoint
    console.log('\n6. Testing Delete User Endpoint...');
    const deleteResponse = await makeRequest('DELETE', `/master-admin/users/${createResponse.data.user.id}`, null, token);

    if (deleteResponse.status !== 200) {
      throw new Error(`Delete user failed: ${deleteResponse.data.message}`);
    }

    console.log('✅ Delete user endpoint working');

    console.log('\n🎉 All Master Admin functionality tests passed!');
    console.log('\n📋 Summary:');
    console.log('✅ Login authentication');
    console.log('✅ Statistics endpoint');
    console.log('✅ Users listing');
    console.log('✅ User creation');
    console.log('✅ Password change');
    console.log('✅ User deletion');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testMasterAdmin(); 