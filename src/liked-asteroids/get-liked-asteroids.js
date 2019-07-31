const client = require('../database-connection/postgres-client');
const handleError = require('../error/handle-error');

// Gets all the liked asteroids from the database
module.exports = (request, response) => {
  const sql = `SELECT DISTINCT asteroids FROM asteroids JOIN liked ON liked.asteroid_id=asteroids.id;`;
  client
    .query(sql)
    .then((sqlReturn) => response.render('pages/liked', { asteroids: sqlReturn.rows }))
    .catch((error) => handleError(error));
};
