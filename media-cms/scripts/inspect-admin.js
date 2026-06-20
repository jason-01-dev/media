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
    const admins = await client.query("SELECT id, firstname, lastname, email, username, blocked, is_active, created_at FROM admin_users ORDER BY id");
    console.log('admin_users rows:', admins.rows);
    const upRoles = await client.query("SELECT id, name, description FROM up_roles ORDER BY id");
    console.log('users-permissions roles:', upRoles.rows);
    const upUsers = await client.query("SELECT id, username, email, confirmed, blocked FROM up_users ORDER BY id");
    console.log('users-permissions users:', upUsers.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
})();
