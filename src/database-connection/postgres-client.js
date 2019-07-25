const pg = require('pg');

//create client connection to database
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', (err) => console.error(err));

module.exports = client;
