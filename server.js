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

app.get('/test', (req, res) => {
  res.render('pages/index');
});

//TODO: put in a route for the asteroidFromAPI function here. Comment out when finished

//app.get('/asteroids', asteroidFromAPI);

//error handler for invalid endpoint
app.use('*', (req, res) => res.send('Sorry, an asteroid hit this route and it no longer exists'));

//Error handler for 500 error
function handleError(err, res){
  console.error(err);
  if (res) res.status(500).send('You messed something up fix it before the asteroids get here');
}

//function to call down asteroids from API

function asteroidFromAPI(request, response){
  const asteroidUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=2018-09-07&end_date=2018-09-08&api_key=${process.env.ASTEROID_API}`;

  return superagent.get(asteroidUrl)
    .then( asteroidResults => {
      const asteroidList = asteroidResults.body.near_earth_objects.start_date.map((asteroidData)=>{
        return new Asteroid(asteroidData);
      });
      response.send(asteroidList);
    })
    .catch(error => handleError(error))
}

//Asteroid constructor
function Asteroid (asteroidData) {
  this.name = asteroidData.name;
  this.is_potentially_hazardous_asteroid = asteroidData.is_potentially_hazardous_asteroid;
  this.miss_distance = asteroidData.close_approach_data.miss_distance.miles;
  this.estimated_diameter_min = asteroidData.estimated_diameter.feet.estimated_diameter_min;
  this.estimated_diameter_max = asteroidData.estimated_diameter.feet.estimated_diameter_max;
}


