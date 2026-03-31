const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:HOTCOFFEE%402006@db.gqngxhnsutnfynogxwrb.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('CONNECTED TO SUPABASE SUCCESSFULLY!');
    return client.end();
  })
  .catch(err => console.error('FAILED TO CONNECT:', err));
