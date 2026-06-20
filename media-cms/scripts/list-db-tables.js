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
    const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
    console.log('tables:', res.rows.map(r => r.tablename).join(', '));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
})();
