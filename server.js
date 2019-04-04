'use strict';

// SERVER CONFIGURATION ---------------
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

// ------------------------------------

// Route/endpoint handling

app.get('/', getAsteroidDataFromAPI);

//route to page with map
// TODO: delete this route
// app.get('/location', (request, response) => {
//   response.render('./pages/location');
// });

app.get('/location/:id', getAsteroidComparison)

app.get('/about', (request, response) => {
  response.render('./pages/about');
});


app.post('/update/:id/:name', updateAsteroidName);

function updateAsteroidName(request, response) {
  let name = request.params.name.match(/\([a-z0-9\s]+\)/i);

  const updateSQL = `UPDATE asteroids SET name=$1 WHERE id=$2 RETURNING *;`;
  const values =[`${request.body.name} ${name}`, request.params.id];

  return client.query(updateSQL, values)
    .then(sqlReturn => {
      response.redirect(`/location/${request.params.id}`);
    })
    .catch(error => handleError(error));
}

//TODO: put in a route for the asteroidFromAPI function here. Comment out when finished

//error handler for invalid endpoint
app.use('*', (req, res) => res.send('Sorry, an asteroid hit this route and it no longer exists'));

//Error handler for 500 error
function handleError(err, res, errorMessage){
  console.error(err);
  if (res) res.render('pages/error', {status : err.status, message : errorMessage});
}


//function to call down asteroids from API

function getAsteroidDataFromAPI(request, response) {

  const selectSQL = `SELECT * FROM asteroids WHERE closest_date=$1 ORDER BY id`;
  const selectValues = [getTodayDate()];

  client.query(selectSQL, selectValues)
    .then(selectReturn => {
      if (!selectReturn.rowCount) {
        const asteroidUrl = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${process.env.ASTEROID_API}`;

        return superagent.get(asteroidUrl)
          .then( asteroidResults => {
            const asteroidListForWeek = [];

            Object.keys(asteroidResults.body.near_earth_objects).forEach((date) => {

              let asteroidListForDay = [];
              let max = 0;
              asteroidResults.body.near_earth_objects[date].forEach((asteroid, idx) => {
                let asteroidObj = new Asteroid(asteroid);
                max = (asteroidObj.diameter_feet_max > max) ? asteroidObj.diameter_feet_max : max;
                asteroidObj.img = `/images/asteroid${idx%8}.png`;
                // insert obj into database

                const insertSQL = `INSERT INTO asteroids (neo_ref_id, name, hazardous, miss_distance_miles, diameter_feet_min, diameter_feet_max, velocity_mph, sentry_object, closest_date, img) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`;
                const insertValues = Object.values(asteroidObj).slice(0,10);

                client.query(insertSQL, insertValues)
                  .then(insertReturn => asteroidObj.id = insertReturn.rows[0].id)
                  .catch(error => handleError(error));

                asteroidListForDay.push(asteroidObj);
              });

              // TODO: add max to table
              const maxInsert = `INSERT INTO daily_max_size (date, size) VALUES ($1, $2);`;
              const maxValues = [date, max];
              client.query(maxInsert, maxValues).catch(error => handleError(error));

              asteroidListForWeek.push({ asteroids: asteroidListForDay, maxSize: max });
            });
            console.log(asteroidListForWeek);
            response.render('pages/index', {asteroidList: asteroidListForWeek[0]});
          })
          .catch(error => handleError(error, response, 'Cannot connect to NASA asteroid API'));
      } else {
        const maxSelect = `SELECT size FROM daily_max_size WHERE date=$1`;
        const maxValues = [getTodayDate()];
        client.query(maxSelect, maxValues)
          .then(maxSelectReturn => {
            response.render('pages/index', {asteroidList: {asteroids : selectReturn.rows, maxSize: maxSelectReturn.rows[0].size}})
          })
          .catch(error => handleError(error));
      }
    })
    .catch(error => handleError(error));
}

function getAsteroidComparison(request, response){
  let sql = `SELECT * FROM asteroids WHERE id=$1;`;
  let values = [request.params.id];

  return client.query(sql,values)
    .then(result => {
      return response.render('./pages/location',{asteroid: result.rows[0]});
    })
    .catch(error => handleError(error, response));
}

//Asteroid constructor
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
