require('dotenv').config();

const superagent = require('superagent');

const handleError = require('../../error/handle-error');
const client = require('../../database-connection/postgres-client');

/**
 * Outputs near earth asteroids for the day to frontend
 *
 * Logic:
 *    check database to see if asteroids for the day already saved
 *      if not in database, call nasa's API for the data, which returns the data for the next week
 *          add the retreived asteroids to the database and send to the frontend
 *      else
 *          send data in databse to frontend
 *    TODO: currently calculates max diameter of the asteroids through JS, change so it's done through SQL
 * @param {object} request
 * @param {object} response
 */
module.exports = (request, response) => {
  // check database
  const selectSQL = `SELECT * FROM asteroids WHERE closest_date=$1 ORDER BY diameter_feet_max DESC`;
  // TODO: currently have a function to get today's date in YYYY-MM-DD format, make sure DATE() doesn't have a simple way of doing this
  const selectValues = [getTodayDate()];

  // check database for today's asteroids
  client
    .query(selectSQL, selectValues)
    .then((selectReturn) => {
      if (!selectReturn.rowCount) {
        const asteroidUrl = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${process.env.ASTEROID_API}`;

        return superagent
          .get(asteroidUrl)
          .then((asteroidResults) => {
            const asteroidListForWeek = [];

            // loop through all the dates returned by the API
            Object.keys(asteroidResults.body.near_earth_objects).forEach((date) => {
              // asteroids for each day and the max size for that day
              let asteroidListForDay = [];
              let max = 0;

              // loop through all the asteroids
              asteroidResults.body.near_earth_objects[date].forEach((asteroid, idx) => {
                // convert data to our Asteroid objects
                let asteroidObj = new Asteroid(asteroid);
                // check if asteroid is the largest
                max = asteroidObj.diameter_feet_max > max ? asteroidObj.diameter_feet_max : max;
                // image for the asteroid, setting here so it's consistent across pages
                // (8 is the current number of images we have drawn)
                asteroidObj.img = `/images/asteroid${idx % 8}.png`;

                // insert obj into database
                const insertSQL = `INSERT INTO asteroids (neo_ref_id, name, hazardous, miss_distance_miles, diameter_feet_min, diameter_feet_max, velocity_mph, sentry_object, closest_date, img) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`;
                const insertValues = Object.values(asteroidObj).slice(0, 10);

                client
                  .query(insertSQL, insertValues)
                  .then((insertReturn) => (asteroidObj.id = insertReturn.rows[0].id))
                  .catch((error) => handleError(error));

                // add asteroid to our asteroids for day array
                asteroidListForDay.push(asteroidObj);
              });

              // add's max for the day into a max table
              // TODO: likely a better way to do this through SQL MAX
              const maxInsert = `INSERT INTO daily_max_size (date, size) VALUES ($1, $2);`;
              const maxValues = [date, max];
              client.query(maxInsert, maxValues).catch((error) => handleError(error));

              // add asteroids for day array to week array
              asteroidListForWeek.push({ asteroids: asteroidListForDay, maxSize: max });
            });
            // send back the first day's list of asteroids
            // TODO: bug with NASA's API returning days out of order, needs to be fixed
            response.render('pages/index', { asteroidList: asteroidListForWeek[0] });
          })
          .catch((error) => handleError(error, response, 'Cannot connect to NASA asteroid API'));
      } else {
        // gets max for today
        const maxSelect = `SELECT size FROM daily_max_size WHERE date=$1`;

        client
          .query(maxSelect, selectValues)
          .then((maxSelectReturn) => {
            // send asteroids for the day to frontend
            response.render('pages/index', {
              asteroidList: { asteroids: selectReturn.rows, maxSize: maxSelectReturn.rows[0].size },
            });
          })
          .catch((error) => handleError(error));
      }
    })
    .catch((error) => handleError(error));
};

// today's date in YYYY-MM-DD format
function getTodayDate() {
  let d = new Date();
  let day = d.getDay();
  let month = d.getMonth() + 1;
  return `${d.getFullYear()}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
}

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
