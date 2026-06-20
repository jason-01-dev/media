const { Client } = require('pg');
(async()=>{
  const client = new (require('pg').Client)({ host:'127.0.0.1', port:5432, database:'media_db', user:'ariel', password:'Tshibangu'});
  await client.connect();
  const r = await client.query("SELECT id, document_id, name FROM up_roles ORDER BY id");
  console.log(r.rows);
  await client.end();
})();
