
var citymap = {
  chicago: {
    center: {lat: 41.878, lng: -87.629},
    population: 2714856
  },
  newyork: {
    center: {lat: 40.714, lng: -74.005},
    population: 8405837
  },
  losangeles: {
    center: {lat: 34.052, lng: -118.243},
    population: 3857799
  },
  vancouver: {
    center: {lat: 49.25, lng: -123.1},
    population: 603502
  }
};

function initMap() {
  // Create the map.
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: {lat: 37.090, lng: -95.712},
    mapTypeId: 'terrain'
  });

  // Construct the circle for each value in citymap.
  // Note: We scale the area of the circle based on the population.
  for (var city in citymap) {
    // Add the circle for this city to the map.
    var cityCircle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: citymap[city].center,
      radius: Math.sqrt(citymap[city].population) * 100
    });
  }
}






// console.log('we are connected');

// var cityMap = {
//   seattle: {
//     center: {lat: 47.6062, lng: -122.3321},
//     population: 724750
//   },
//   newYork: {
//     center: {lat: 40.714, lng: -74.005},
//     population: 8623000
//   },
//   london: {
//     center: {lat: 51.5074, lng: -0.1278},
//     population: 8787892
//   },
//   tokyo: {
//     center: {lat: 35.6895, lng: 139.69171},
//     population: 9273000
//   }
// };

// initMap();

// function initMap () {
//   var map = new google.maps.Map(document.getElementById('map'), {
//     zoom: 4,
//     center: {lat: 37.090, lng: -95.713},
//     mapTypeId: 'terrain'
//   });

//   console.log('hello from for');
//   for (var city in cityMap) {
//     var cityCircle = new google.maps.Circle({
//       strokeColor: '#FF0000',
//       strokeOpacity: 0.8,
//       strokeWeight: 2,
//       fillColor: '#FF0000',
//       fillOpacity: 0.35,
//       map: map,
//       center: cityMap[city].center,
//       radius: Math.sqrt(cityMap[city].population) * 100
//     });
//   }
// }



