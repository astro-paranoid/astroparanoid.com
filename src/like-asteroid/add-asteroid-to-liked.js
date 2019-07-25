const client = require('../database-connection/postgres-client');

// add asteroid to liked table
module.exports = (request, response) => {
  if (request.body.id) {
    let sql = `INSERT INTO liked (asteroid_id) VALUES ($1);`;
    let liked = [request.body.id];
    return client.query(sql, liked).catch((error) => console.error(error));
  }
};
