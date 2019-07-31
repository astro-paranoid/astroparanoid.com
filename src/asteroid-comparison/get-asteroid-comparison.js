const client = require('../database-connection/postgres-client');
const handleError = require('../error/handle-error');

// checks if asteroid exists in database
module.exports = (request, response) => {
  let sql = `SELECT * FROM asteroids WHERE id=$1;`;
  let values = [request.params.id];

  return client
    .query(sql, values)
    .then((result) => {
      return response.render('./pages/location', { asteroid: result.rows[0] });
    })
    .catch((error) => handleError(error, response));
};
