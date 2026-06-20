const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'media_db',
  user: 'ariel',
  password: 'Tshibangu',
});

(async () => {
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('DB connection successful:', res.rows[0]);
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
})();
