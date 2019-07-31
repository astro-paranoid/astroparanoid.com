const client = require('../database-connection/postgres-client');
const handleError = require('../error/handle-error');

// gets all the asteroids in the asteroids table
module.exports = (request, response) => {
  const sql = `SELECT DISTINCT neo_ref_id, name, hazardous, miss_distance_miles, diameter_feet_min, diameter_feet_max, velocity_mph, sentry_object, closest_date, img FROM asteroids ORDER BY diameter_feet_max DESC;`;
  client
    .query(sql)
    .then((sqlReturn) => {
      response.render('pages/all', { asteroids: sqlReturn.rows });
    })
    .catch((error) => handleError(error));
};
