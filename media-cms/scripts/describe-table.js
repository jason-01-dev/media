const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'media_db',
  user: 'ariel',
  password: 'Tshibangu',
});

const table = process.argv[2] || 'up_permissions';

(async () => {
  try {
    await client.connect();
    const res = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
      [table]
    );
    console.log('columns for', table, ':');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
})();
