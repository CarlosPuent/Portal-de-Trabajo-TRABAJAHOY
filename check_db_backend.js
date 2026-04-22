const { Client } = require('pg');
require('dotenv').config({path: 'C:\\www\\TRABAJAHOY-BACKEND\\.env'});

async function check() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'job_applications';
  `);
  console.log(res.rows);
  await client.end();
}

check().catch(console.log);
