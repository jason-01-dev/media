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
    console.log('Connected to DB');

    const arts = await client.query("SELECT id, title, slug, published_at FROM articles ORDER BY id DESC LIMIT 10");
    console.log('\nLast articles:');
    console.table(arts.rows);

    const roles = await client.query("SELECT id, document_id, name FROM up_roles ORDER BY id");
    console.log('\nup_roles:');
    console.table(roles.rows);

    const publicRole = roles.rows.find(r => r.name.toLowerCase() === 'public');
    if (!publicRole) {
      console.log('\nPublic role not found in up_roles');
      return;
    }

    const perms = await client.query('SELECT id, document_id, action FROM up_permissions WHERE document_id = $1 ORDER BY id', [publicRole.document_id]);
    console.log(`\nPermissions for Public (document_id=${publicRole.document_id}):`);
    console.table(perms.rows);

    const apiCheck = await client.query("SELECT 1 FROM information_schema.tables WHERE table_name='articles'");
    console.log('\narticles table exists:', apiCheck.rowCount>0);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
})();