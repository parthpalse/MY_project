const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:HOTCOFFEE%402006@db.gqngxhnsutnfynogxwrb.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected to your Supabase Project!');
    
    // Read the schema.sql file
    const sql = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf-8');
    
    // Execute the SQL
    await client.query(sql);
    console.log('✅ Database tables created successfully!');
    
  } catch (err) {
    console.error('❌ Error setting up database:', err);
  } finally {
    await client.end();
  }
}

run();
