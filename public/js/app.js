'use strict';

let citymap = {
  seattle: {
    center: {lat: 47.6062, lng: -122.3321},
  },
};

let crater = {
  min: 800,
  max: 1000,
};

function initMap() {
  // Create the map.
  let map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: citymap[Object.keys(citymap)[0]].center, // {lat: 47.6062, lng: -122.3321},
    mapTypeId: 'hybrid',
    disableDefaultUI: true,
    zoomControl: true,

  });

  // Construct the circle for each value in citymap.
  for (let city in citymap) {
    // Add the circle for this city to the map.
    let minCraterCircle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#FF0000',
      fillOpacity: 0.15,
      map: map,
      center: citymap[city].center,
      radius: crater['min'],
    });

    let maxCraterCircle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#FF0000',
      fillOpacity: 0.25,
      map: map,
      center: citymap[city].center,
      radius: crater['max'],
    });
  }
}
