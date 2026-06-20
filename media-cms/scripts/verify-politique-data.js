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

    // Check exact article data in DB
    const articles = await client.query(`
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.published_at,
        a.document_id,
        c.id as category_id,
        c.slug as category_slug,
        c.name as category_name
      FROM articles a
      LEFT JOIN articles_category_lnk acl ON acl.article_id = a.id
      LEFT JOIN categories c ON c.id = acl.category_id
      WHERE c.slug = 'category'
      ORDER BY a.published_at DESC
    `);

    console.log('==== Articles with category slug="category" ====');
    console.log(`Found: ${articles.rows.length} articles`);
    articles.rows.forEach(row => {
      console.log(`\n  ID: ${row.id}`);
      console.log(`  Title: ${row.title}`);
      console.log(`  Slug: ${row.slug}`);
      console.log(`  Document ID: ${row.document_id}`);
      console.log(`  Published At: ${row.published_at}`);
      console.log(`  Category: ${row.category_name} (slug: ${row.category_slug})`);
      console.log(`  Status: ${row.published_at ? '✅ PUBLISHED' : '❌ DRAFT'}`);
    });

    // What the API should return
    const published = articles.rows.filter(r => r.published_at !== null);
    console.log(`\n✅ Articles that should appear in API: ${published.length}`);
    published.forEach(row => {
      console.log(`   - ${row.title}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
})();
