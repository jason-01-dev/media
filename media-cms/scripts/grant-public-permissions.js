const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'media_db',
  user: 'ariel',
  password: 'Tshibangu',
});

// Permissions to grant for public role (id: 2 by default)
const permissions = [
  // articles
  'api::article.article.find',
  'api::article.article.findOne',
  // authors
  'api::author.author.find',
  'api::author.author.findOne',
  // categories
  'api::category.category.find',
  'api::category.category.findOne',
  // global
  'api::global.global.find',
  'api::global.global.findOne',
  // about
  'api::about.about.find',
  'api::about.about.findOne',
];

(async () => {
  try {
    await client.connect();

    // ensure public role exists
    const roleRes = await client.query("SELECT id FROM up_roles WHERE name='Public' LIMIT 1");
    if (roleRes.rowCount === 0) {
      console.error('Public role not found in up_roles');
      process.exit(2);
    }
    const roleId = roleRes.rows[0].id;

    // up_permissions.document_id links to up_roles.document_id
    const roleDocRes = await client.query('SELECT document_id FROM up_roles WHERE id=$1 LIMIT 1', [roleId]);
    const roleDocumentId = roleDocRes.rows[0].document_id;

    for (const action of permissions) {
      const exists = await client.query('SELECT id FROM up_permissions WHERE action=$1 AND document_id=$2 LIMIT 1', [action, roleDocumentId]);
      if (exists.rowCount === 0) {
        await client.query(
          `INSERT INTO up_permissions (document_id, action, created_at, updated_at) VALUES ($1, $2, now(), now())`,
          [roleDocumentId, action]
        );
        console.log('Inserted permission:', action);
      } else {
        console.log('Permission already exists:', action);
      }
    }

    const permRes = await client.query('SELECT action FROM up_permissions WHERE document_id=$1 ORDER BY action', [roleDocumentId]);
    console.log('Public role now has permissions count:', permRes.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
})();
