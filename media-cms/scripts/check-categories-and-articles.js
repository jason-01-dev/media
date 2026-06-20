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

    // Get all categories
    const categories = await client.query(`
      SELECT id, name, slug FROM categories ORDER BY id
    `);
    
    console.log('📁 ALL CATEGORIES:');
    console.table(categories.rows);

    // Get count of published articles per category
    console.log('\n📊 PUBLISHED ARTICLES PER CATEGORY:\n');
    
    for (const cat of categories.rows) {
      const articles = await client.query(`
        SELECT 
          a.id, 
          a.title, 
          a.slug,
          a.published_at
        FROM articles a
        WHERE a.category_id = $1 AND a.published_at IS NOT NULL
        ORDER BY a.id
      `, [cat.id]);

      console.log(`✓ ${cat.name} (ID: ${cat.id}, Slug: ${cat.slug}) - ${articles.rowCount} published articles:`);
      if (articles.rowCount > 0) {
        console.table(articles.rows);
      } else {
        console.log('  ⚠️  No published articles\n');
      }
    }

    // Get total counts
    const allArticles = await client.query(`
      SELECT COUNT(*) as total, 
             COUNT(CASE WHEN published_at IS NOT NULL THEN 1 END) as published,
             COUNT(CASE WHEN published_at IS NULL THEN 1 END) as draft
      FROM articles
    `);
    
    console.log('\n📈 OVERALL STATISTICS:');
    console.table(allArticles.rows);

    // Check articles without categories
    const noCat = await client.query(`
      SELECT COUNT(*) as count FROM articles WHERE category_id IS NULL
    `);
    console.log(`\n⚠️  Articles without category: ${noCat.rows[0].count}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
})();
