const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

(async () => {
  try {
    console.log('Testing Strapi filter...\n');
    
    const url = 'http://127.0.0.1:1337/api/articles?filters[category][slug][$eq]=category';
    console.log(`URL: ${url}\n`);
    
    const response = await makeRequest(url);
    
    console.log(`Articles returned: ${response.data.length}`);
    console.log(`Total (from meta): ${response.meta.pagination.total}\n`);
    
    console.log('Articles:');
    response.data.forEach((a, i) => {
      console.log(`  ${i+1}. "${a.title}"`);
      console.log(`     publishedAt: ${a.publishedAt}`);
      console.log(`     slug: ${a.slug}`);
      console.log(`     category: ${a.category?.name || 'N/A'}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
})();
