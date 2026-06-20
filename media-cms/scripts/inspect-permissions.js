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
    const res = await client.query('SELECT id, document_id, action FROM up_permissions ORDER BY id LIMIT 200');
    console.log('up_permissions rows:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
})();
