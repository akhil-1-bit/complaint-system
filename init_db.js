const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  console.log('Connecting to MySQL...');
  
  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log('Connected!');

    const sqlPath = path.join(__dirname, 'database', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running schema.sql...');
    await connection.query(sql);
    
    console.log('Database and tables created successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error during database setup:');
    console.error(error.message);
    console.log('\nTIP: Make sure your MySQL server is running and your .env credentials are correct.');
  }
}

initDB();
