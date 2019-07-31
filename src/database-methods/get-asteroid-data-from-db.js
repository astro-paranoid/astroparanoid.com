const client = require('../database-connection/postgres-client');
const handleError = require('../error/handle-error');
const superagent = require('superagent');

module.exports = (request, response) => {
  const selectSQL = `SELECT * FROM asteroids WHERE closest_date=$1 ORDER BY diameter_feet_max DESC`;
  const selectValues = [new Date().toISOString().split('T')[0]];

  return client
    .query(selectSQL, selectValues)
    .then((response) => {
      if (!response.rowCount) {
        return [];
      }
      return response.rows;
    })
    .catch((error) => {
      handleError(error);
      return [];
    });
};
