const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing MySQL connection...');
  
  // Try different connection configurations
  const configs = [
    {
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306
    },
    {
      host: '127.0.0.1',
      user: 'root',
      password: '',
      port: 3306
    },
    {
      host: 'localhost',
      user: 'root',
      password: 'root',
      port: 3306
    },
    {
      host: 'localhost',
      user: 'root',
      password: 'password',
      port: 3306
    }
  ];

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    console.log(`\nTrying config ${i + 1}:`, { ...config, password: config.password ? '***' : '(empty)' });
    
    try {
      const connection = await mysql.createConnection(config);
      console.log(`✅ SUCCESS with config ${i + 1}!`);
      
      // Test if we can create/use the database
      try {
        await connection.query('CREATE DATABASE IF NOT EXISTS lab_inventory');
        await connection.query('USE lab_inventory');
        console.log('✅ Database lab_inventory accessible');
        
        // Test tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log('✅ Available tables:', tables.map(t => Object.values(t)[0]));
        
      } catch (dbError) {
        console.log('⚠️ Database access issue:', dbError.message);
      }
      
      await connection.end();
      return config;
      
    } catch (error) {
      console.log(`❌ Failed with config ${i + 1}:`, error.message);
    }
  }
  
  console.log('\n❌ All connection attempts failed');
  return null;
}

testConnection().then(config => {
  if (config) {
    console.log('\n🎉 Working configuration found!');
    console.log('Update your database config with these settings:');
    console.log(`DB_HOST=${config.host}`);
    console.log(`DB_USER=${config.user}`);
    console.log(`DB_PASSWORD=${config.password}`);
    console.log(`DB_PORT=${config.port}`);
  }
}).catch(console.error);
