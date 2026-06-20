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
    console.log('Connected to DB\n');

    // Get Politique category info
    const politicCat = await client.query(`
      SELECT id, name, slug FROM categories WHERE name = 'Politique'
    `);
    
    if (politicCat.rows.length === 0) {
      console.log('❌ Politique category not found!');
      return;
    }

    const cat = politicCat.rows[0];
    console.log(`✓ Found Politique category:`);
    console.log(`  ID: ${cat.id}`);
    console.log(`  Name: ${cat.name}`);
    console.log(`  Slug: "${cat.slug}"`);
    console.log();

    // Get articles linked to this category
    console.log(`=== Articles linked to Politique (ID=${cat.id}) ===`);
    const articles = await client.query(`
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.published_at,
        c.name as category_name,
        c.slug as category_slug
      FROM articles a
      JOIN articles_category_lnk acl ON acl.article_id = a.id
      JOIN categories c ON c.id = acl.category_id
      WHERE acl.category_id = $1
      ORDER BY a.published_at DESC
    `, [cat.id]);

    console.log(`Total linked: ${articles.rows.length}`);
    articles.rows.forEach(row => {
      const status = row.published_at ? '✅ PUBLISHED' : '❌ DRAFT';
      console.log(`${status} - "${row.title}" (slug: ${row.slug})`);
      console.log(`         Published at: ${row.published_at || 'null'}`);
    });

    // Check if the slug matches what's being filtered
    console.log(`\n=== Testing slug filter scenario ===`);
    console.log(`Frontend sends filter: category.slug = "${cat.slug}"`);
    
    // Simulate the filter that should work
    const filtered = await client.query(`
      SELECT 
        a.id,
        a.title,
        a.published_at,
        c.name,
        c.slug
      FROM articles a
      JOIN articles_category_lnk acl ON acl.article_id = a.id
      JOIN categories c ON c.id = acl.category_id
      WHERE c.slug = $1 AND a.published_at IS NOT NULL
      ORDER BY a.published_at DESC
    `, [cat.slug]);

    console.log(`Articles with slug="${cat.slug}" AND published: ${filtered.rows.length}`);
    filtered.rows.forEach(row => {
      console.log(`  ✓ "${row.title}"`);
    });

    // Double-check raw article count
    const allPub = await client.query(`
      SELECT COUNT(*) as cnt FROM articles WHERE published_at IS NOT NULL
    `);
    console.log(`\nTotal published articles in DB: ${allPub.rows[0].cnt}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
})();
