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
    
    // Get all tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('All tables in database:');
    console.log(tables.rows.map(r => r.table_name).join('\n'));

    // Get articles table structure
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'articles'
      ORDER BY ordinal_position
    `);
    console.log('\nArticles table columns:');
    console.table(cols.rows);

    // Check for relationship tables
    const relTables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%article%category%' OR table_name LIKE '%articles_%')
      ORDER BY table_name
    `);
    console.log('\nJoin/Relationship tables:');
    if (relTables.rowCount > 0) {
      console.log(relTables.rows.map(r => r.table_name).join('\n'));
    } else {
      console.log('No relationship tables found');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
})();
