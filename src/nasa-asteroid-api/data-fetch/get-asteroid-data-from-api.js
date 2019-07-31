require('dotenv').config();

const client = require('../../database-connection/postgres-client');
const handleError = require('../../error/handle-error');
const superagent = require('superagent');

const getAsteroidDataFromDB = require('../../database-methods/get-asteroid-data-from-db');

/**
 * Outputs near earth asteroids for the day to frontend
 *
 * Logic:
 *    check database to see if asteroids for the day already saved
 *      if not in database, call nasa's API for the data, which returns the data for the next week
 *          add the retreived asteroids to the database and send to the frontend
 *      else
 *          send data in databse to frontend
 * @param {object} request
 * @param {object} response
 */
module.exports = async (request, response) => {
  // check if data exists for today in database
  const dbResults = await getAsteroidDataFromDB(request, response);
  
  // database has asteroid data for today
  if (dbResults.length) {
    response.render('pages/index', {
      asteroidList: {
        asteroids: dbResults,
        maxSize: dbResults[0].diameter_feet_max,
      },
    });
  } else {
    // make request to NASA API
    const asteroidUrl = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${process.env.ASTEROID_API}`;

    return superagent
      .get(asteroidUrl)
      .then((APIResults) => {
        const asteroidListForWeek = {};

        Object.keys(APIResults.body.near_earth_objects).forEach((date) => {
          const asteroidListForDay = [];
          let max = 0;

          // format asteroid data and add to database
          APIResults.body.near_earth_objects[date].forEach((asteroid, idx) => {
            const asteroidObj = new Asteroid(asteroid);
            max = Math.max(asteroidObj.diameter_feet_max, max);
            asteroidObj.img = `/images/asteroid${idx % 8}.png`;

            addAsteroidToDatabase(asteroidObj);
            asteroidListForDay.push(asteroidObj);
          });

          asteroidListForWeek[date] = {
            asteroids: asteroidListForDay,
            maxSize: max,
          };
        });

        response.render('pages/index', {
          asteroidList: asteroidListForWeek[new Date().toISOString().split('T')[0]],
        });
      })
      .catch((error) => handleError(error, response, 'Cannot connect to NASA asteroid API'));
  }
};

// Asteroid constructor
function Asteroid(asteroidData) {
  this.neo_ref_id = asteroidData.neo_reference_id;
  this.name = asteroidData.name;
  this.hazardous = asteroidData.is_potentially_hazardous_asteroid;
  this.miss_distance_miles = asteroidData.close_approach_data[0].miss_distance.miles;
  this.diameter_feet_min = asteroidData.estimated_diameter.feet.estimated_diameter_min;
  this.diameter_feet_max = asteroidData.estimated_diameter.feet.estimated_diameter_max;
  this.velocity_mph = asteroidData.close_approach_data[0].relative_velocity.miles_per_hour;
  this.sentry_object = asteroidData.is_sentry_object;
  this.closest_date = asteroidData.close_approach_data[0].close_approach_date;
}

function addAsteroidToDatabase(asteroidObj) {
  const insertSQL = `INSERT INTO asteroids (neo_ref_id, name, hazardous, miss_distance_miles, diameter_feet_min, diameter_feet_max, velocity_mph, sentry_object, closest_date, img) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`;
  const insertValues = Object.values(asteroidObj).slice(0, 10);

  client
    .query(insertSQL, insertValues)
    .then((insertReturn) => (asteroidObj.id = insertReturn.rows[0].id))
    .catch((error) => handleError(error));
}
