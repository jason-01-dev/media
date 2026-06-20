async function testCategoryFiltering() {
  try {
    // Get the Strapi base URL from environment or default
    const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
    
    console.log(`Testing API at: ${STRAPI_URL}\n`);

    // Test 1: Get all categories
    console.log('=== Test 1: Get all categories ===');
    let res = await fetch(`${STRAPI_URL}/api/categories?pagination[pageSize]=100`);
    let data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Categories found: ${data.data.length}`);
    data.data.forEach(c => console.log(`  - ID: ${c.id}, Name: ${c.name}, Slug: ${c.slug}`));

    // Test 2: Get articles with published filter
    console.log('\n=== Test 2: Get all published articles ===');
    res = await fetch(`${STRAPI_URL}/api/articles?pagination[pageSize]=100&populate=category&filters[publishedAt][$notNull]=true`);
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Published articles found: ${data.data.length}`);
    data.data.slice(0, 5).forEach(a => {
      console.log(`  - Title: ${a.title}, Category: ${a.category?.name} (slug: ${a.category?.slug}), Published: ${a.publishedAt}`);
    });

    // Test 3: Filter by Politique (category slug = "category")
    console.log('\n=== Test 3: Filter by Politique (slug="category") ===');
    res = await fetch(`${STRAPI_URL}/api/articles?pagination[pageSize]=100&populate=category,author&filters[category][slug][$eq]=category&filters[publishedAt][$notNull]=true`);
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Articles found: ${data.data.length}`);
    if (data.data.length === 0) {
      console.log('⚠️  NO ARTICLES FOUND with slug="category"');
    } else {
      data.data.forEach(a => console.log(`  - ${a.title}`));
    }

    // Test 4: Check what slug filter syntax works
    console.log('\n=== Test 4: Test different filter syntaxes ===');
    
    // Try with category ID instead
    console.log('  Trying filter by category ID = 1:');
    res = await fetch(`${STRAPI_URL}/api/articles?pagination[pageSize]=100&populate=category&filters[category][id][$eq]=1&filters[publishedAt][$notNull]=true`);
    data = await res.json();
    console.log(`    Found: ${data.data.length} articles`);
    
    // Try getting raw relationship table
    console.log('\n=== Test 5: Check category relationships ===');
    res = await fetch(`${STRAPI_URL}/api/categories/1?populate=articles`);
    data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Category: ${data.data.name}`);
    console.log(`Articles count: ${data.data.articles?.length || 0}`);
    if (data.data.articles && data.data.articles.length > 0) {
      data.data.articles.slice(0, 3).forEach(a => {
        console.log(`  - ${a.title} (published: ${a.publishedAt})`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testCategoryFiltering();
