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
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'up_roles' ORDER BY ordinal_position");
    console.log('columns for up_roles:');
    console.table(res.rows);
    const rows = await client.query('SELECT id, name, "_id" FROM up_roles');
    console.log('up_roles rows:', rows.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
})();
