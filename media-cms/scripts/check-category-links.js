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

    // Get articles_category_lnk structure
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'articles_category_lnk'
      ORDER BY ordinal_position
    `);
    console.log('articles_category_lnk table structure:');
    console.table(cols.rows);

    // Get actual links with published status
    const links = await client.query(`
      SELECT 
        acl.id,
        acl.article_id,
        acl.category_id,
        a.title,
        a.published_at,
        c.name as category_name
      FROM articles_category_lnk acl
      JOIN articles a ON a.id = acl.article_id
      JOIN categories c ON c.id = acl.category_id
      ORDER BY c.id, a.published_at DESC
    `);
    
    console.log('\nAll article-category links:');
    console.table(links.rows);

    // Check how many articles are linked to each category
    const summary = await client.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        COUNT(acl.id) as total_linked,
        COUNT(CASE WHEN a.published_at IS NOT NULL THEN 1 END) as published_count
      FROM categories c
      LEFT JOIN articles_category_lnk acl ON acl.category_id = c.id
      LEFT JOIN articles a ON a.id = acl.article_id
      GROUP BY c.id, c.name, c.slug
      ORDER BY c.id
    `);

    console.log('\nSummary - Articles per category:');
    console.table(summary.rows);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
})();
