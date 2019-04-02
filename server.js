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

//TODO: comment out when route with function complete

app.post('/location', (request, response) => {
  response.render('pages/location');
});

//app.post('/location', getLocation);

//filter out null results

//error handler for invalid endpoint
app.use('*', (req, res) => res.send('Sorry, an asteroid hit this route and it no longer exists'));

//Error handler for 500 error
function handleError(err, res, errorMessage){
  console.error(err);
  if (res) res.render('pages/error', {status : err.status, message : errorMessage});
}


//function to call down asteroids from API

function getAsteroidDataFromAPI(request, response){
  const asteroidUrl = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${process.env.ASTEROID_API}`;

  return superagent.get(asteroidUrl)
    .then( asteroidResults => {

      const asteroidListForWeek = [];

      Object.keys(asteroidResults.body.near_earth_objects).forEach((date) => {

        let asteroidListForDay = [];

        asteroidResults.body.near_earth_objects[date].forEach((asteroid) => {
          asteroidListForDay.push(new Asteroid(asteroid));
        });

        asteroidListForWeek.push(asteroidListForDay);
      });

      response.render('pages/index', {asteroids: asteroidListForWeek});
    })
    .catch(error => handleError(error, response, 'Cannot connect to NASA asteroid API'));
}



// function getLocation(request, response){
//   console.log('you have hit the beginning of the location function');
//   const url=`https://www.google.com/maps/embed/v1/search?q=${request.query.data}&key=${process.env.GOOGLE_MAPS_API}`;
//   console.log('========= URL AT 88', url)
//   superagent.get(url)
//   //  .then(apiResponse => apiResponse.body)
//     .then(results=>{
//       console.log('==========results at 92', results)
//       response.render('pages/location', {searchResults: results});
//     })

//     .catch(error => handleError(error, response));
// }


// function Location(query, location){
//   this.search_query = query;
// }


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
  this.closest_date = asteroidData.close_approach_data[0].close_approach_date;
}
