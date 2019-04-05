'use strict';

// SERVER CONFIGURATION ---------------------------------------------------------------------------
require('dotenv').config();

const superagent = require('superagent');
const express = require('express');
const app = express();
const pg = require('pg');


// Use EJS for embedding JS in html
app.set('view engine', 'ejs');

// connection to database

const PORT = process.env.PORT;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

//create client connection to database
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// LISTEN ON PORT
app.listen(PORT, () => console.log(`Astro-Paranoid listening on ${PORT}`));

// ------------------------------------------------------------------------------------------------

// Route/endpoint handling

// Homepage, gets asteroids for today
app.get('/', getAsteroidDataFromAPI);

// more details page, shows asteroid scale, map, and info
app.get('/location/:id', getAsteroidComparison)

// about page, information about the developers
app.get('/about', (request, response) => {
  response.render('./pages/about');
});

// liked page, has all the liked asteroids by every user
app.get('/liked', getLikedAsteroids);

// all page, all the asteroids in the database
app.get('/all', getAllAsteroids);

// application info page, purpose/goal of the application
app.get('/info',(request,response)=>{
  response.render('./pages/info');
});

// adds asteroid to liked table in database
app.post('/likeAsteroid', addAsteroidToLiked);

// updates the name of the asteroid
app.post('/update/:id/:name', updateAsteroidName);

//error handler for invalid endpoint
app.use('*', (req, res) => res.render('./pages/error'));

// Gets all the liked asteroids from the database 
function getLikedAsteroids(request, response) {
  const sql = `SELECT DISTINCT asteroids.* FROM asteroids JOIN liked ON liked.asteroid_id=asteroids.id;`;
  client.query(sql)
    .then(sqlReturn => response.render('pages/liked', {asteroids : sqlReturn.rows}))
    .catch(error => handleError(error));
}

// gets all the asteroids in the asteroids table
function getAllAsteroids(request, response) {
  const sql = `SELECT DISTINCT * FROM asteroids ORDER BY diameter_feet_max DESC;`;
  client.query(sql)
    .then(sqlReturn => response.render('pages/all', {asteroids: sqlReturn.rows}))
    .catch(error => handleError(error));
}

// updates the name of asteroid, adds nickname to the front but keeps the original classifier name
function updateAsteroidName(request, response) {
  // the classifier name for the asteroid, in parenthesis
  let name = request.params.name.match(/\([a-z0-9\s]+\)/i);

  const updateSQL = `UPDATE asteroids SET name=$1 WHERE id=$2 RETURNING *;`;
  const values =[`${request.body.name} ${name}`, request.params.id];

  return client.query(updateSQL, values)
    .then(sqlReturn => {
      response.redirect(`/location/${request.params.id}`);
    })
    .catch(error => handleError(error));
}

// Error handler, outputs error to console and to front end if response argument passed in
function handleError(err, res, errorMessage){
  console.error(err);
  if (res) res.render('pages/error', {status : err.status, message : errorMessage});
}


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
function getAsteroidDataFromAPI(request, response) {
  // check database
  const selectSQL = `SELECT * FROM asteroids WHERE closest_date=$1 ORDER BY diameter_feet_max DESC`;
  // TODO: currently have a function to get today's date in YYYY-MM-DD format, make sure DATE() doesn't have a simple way of doing this
  const selectValues = [getTodayDate()];

  // check database for today's asteroids
  client.query(selectSQL, selectValues)
    .then(selectReturn => {
      if (!selectReturn.rowCount) {
        const asteroidUrl = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${process.env.ASTEROID_API}`;

        return superagent.get(asteroidUrl)
          .then( asteroidResults => {
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
                max = (asteroidObj.diameter_feet_max > max) ? asteroidObj.diameter_feet_max : max;
                // image for the asteroid, setting here so it's consistent across pages 
                // (8 is the current number of images we have drawn)
                asteroidObj.img = `/images/asteroid${idx%8}.png`;
                
                // insert obj into database
                const insertSQL = `INSERT INTO asteroids (neo_ref_id, name, hazardous, miss_distance_miles, diameter_feet_min, diameter_feet_max, velocity_mph, sentry_object, closest_date, img) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`;
                const insertValues = Object.values(asteroidObj).slice(0,10);

                client.query(insertSQL, insertValues)
                  .then(insertReturn => asteroidObj.id = insertReturn.rows[0].id)
                  .catch(error => handleError(error));

                // add asteroid to our asteroids for day array
                asteroidListForDay.push(asteroidObj);
              });

              // add's max for the day into a max table
              // TODO: likely a better way to do this through SQL MAX
              const maxInsert = `INSERT INTO daily_max_size (date, size) VALUES ($1, $2);`;
              const maxValues = [date, max];
              client.query(maxInsert, maxValues).catch(error => handleError(error));

              // add asteroids for day array to week array
              asteroidListForWeek.push({ asteroids: asteroidListForDay, maxSize: max });
            });
            // send back the first day's list of asteroids
            // TODO: bug with NASA's API returning days out of order, needs to be fixed
            response.render('pages/index', {asteroidList: asteroidListForWeek[0]});
          })
          .catch(error => handleError(error, response, 'Cannot connect to NASA asteroid API'));
      } else {
        // gets max for today
        const maxSelect = `SELECT size FROM daily_max_size WHERE date=$1`;

        client.query(maxSelect, selectValues)
          .then(maxSelectReturn => {
            // send asteroids for the day to frontend
            response.render('pages/index', {asteroidList: {asteroids : selectReturn.rows, maxSize: maxSelectReturn.rows[0].size}})
          })
          .catch(error => handleError(error));
      }
    })
    .catch(error => handleError(error));
}

// checks if asteroid exists in database
function getAsteroidComparison(request, response){
  let sql = `SELECT * FROM asteroids WHERE id=$1;`;
  let values = [request.params.id];

  return client.query(sql,values)
    .then(result => {
      return response.render('./pages/location',{asteroid: result.rows[0]});
    })
    .catch(error => handleError(error, response));
}

// add asteroid to liked table
function addAsteroidToLiked(request, response){
  if (request.body.id) {
    let sql = `INSERT INTO liked (asteroid_id) VALUES ($1);`;
    let liked = [request.body.id];
    return client.query(sql, liked)
      .catch(error => console.error(error));
  }
}


// Asteroid constructor
function Asteroid (asteroidData) {
  this.neo_ref_id = asteroidData.neo_reference_id;
  this.name = asteroidData.name;
  this.hazardous = asteroidData.is_potentially_hazardous_asteroid;
  this.miss_distance_miles = asteroidData.close_approach_data[0].miss_distance.miles;
  this.diameter_feet_min = asteroidData.estimated_diameter.feet.estimated_diameter_min;
  this.diameter_feet_max = asteroidData.estimated_diameter.feet.estimated_diameter_max;
  this.velocity_mph = asteroidData.close_approach_data[0].relative_velocity.miles_per_hour;
  this.sentry_object = asteroidData.is_sentry_object;
  this.closest_date = (asteroidData.close_approach_data[0].close_approach_date);
}

// today's date in YYYY-MM-DD format
function getTodayDate() {
  let d = new Date();
  let day = d.getDay();
  let month = d.getMonth() + 1;
  return `${d.getFullYear()}-${(month < 10) ? '0'+month: month}-${(day < 10) ? '0'+day:day}`;
}
