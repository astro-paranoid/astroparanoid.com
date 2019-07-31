'use strict';

// SERVER CONFIGURATION ---------------------------------------------------------------------------
require('dotenv').config();

const express = require('express');
const app = express();

const addAsteroidToLiked = require('./src/like-asteroid/add-asteroid-to-liked');
const getAsteroidComparison = require('./src/asteroid-comparison/get-asteroid-comparison');
const getAsteroidDataFromAPI = require('./src/nasa-asteroid-api/data-fetch/get-asteroid-data-from-api');
const getLikedAsteroids = require('./src/liked-asteroids/get-liked-asteroids');
const getAllAsteroids = require('./src/all-asteroids/get-all-asteroids');
const updateAsteroidName = require('./src/update-asteroid/update-asteroid-name');

// Use EJS for embedding JS in html
app.set('view engine', 'ejs');

// connection to database

const PORT = process.env.PORT;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

app.listen(PORT, () => console.log(`Astro-Paranoid listening on ${PORT}`));

// ------------------------------------------------------------------------------------------------

// Route/endpoint handling

// Homepage, gets asteroids for today
app.get('/', getAsteroidDataFromAPI);

// more details page, shows asteroid scale, map, and info
app.get('/location/:id', getAsteroidComparison);

// liked page, has all the liked asteroids by every user
app.get('/liked', getLikedAsteroids);

// all page, all the asteroids in the database
app.get('/all', getAllAsteroids);

// adds asteroid to liked table in database
app.post('/likeAsteroid', addAsteroidToLiked);

// updates the name of the asteroid
app.post('/update/:id/:name', updateAsteroidName);

// Page directs ---------------------------------------------------------------

// about page, information about the developers
app.get('/about', (request, response) => {
  response.render('./pages/about');
});

// application info page, purpose/goal of the application
app.get('/info', (request, response) => {
  response.render('./pages/info');
});

//error handler for invalid endpoint
app.use('*', (req, res) => res.render('./pages/error'));
