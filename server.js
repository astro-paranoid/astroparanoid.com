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

// LISTEN ON PORT
app.listen(PORT, () => console.log(`Book app listening on ${PORT}`));

// ------------------------------------

// Route/endpoint handling

app.get('/test', (req, res) => {
  res.render('pages/index');
});


//Asteroid constructor
function Asteroid (asteroidData) {
  this.name = asteroidData.name;
  this.is_potentially_hazardous_asteroid = asteroidData.is_potentially_hazardous_asteroid;
  this.miss_distance = asteroidData.close_approach_data.miss_distance.miles;
  this.estimated_diameter_min = asteroidData.estimated_diameter.feet.estimated_diameter_min;
  this.estimated_diameter_max = asteroidData.estimated_diameter.feet.estimated_diameter_max;
}

