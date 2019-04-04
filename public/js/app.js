'use strict';
$(()=>{

  $('#images-container').on('click', () => {
    $('#astronaut-scale-image').css('transform',`scale(${personScale})`);
    $('#asteroid-scale-image').css('transform',`scale(${asteroidScale})`);
    $('#needle-scale-image').css('transform',`scale(${needleScale})`);

    $('#images-container').off('click');
    $('#images-container').css('cursor', 'default');
  });

  $(document).on('scroll', () => {
    $('.user-input').fadeIn(1000);
  });

  $('#rename-form-button').on('click', () => {
    $('#rename-form-button').hide();
    $('#rename-form').show();
  });

  $('.likedbutton').on('click', function() {
    $(this).hide().css({'color': 'red', 'zoom': '1.05'}).fadeIn(400);
    $.post('/likeAsteroid/', {id : this.id});
  });
});


let citymap = {
  seattle: {
    center: {lat: 47.6062, lng: -122.3321},
  },
};

// TODO: calculate crater size for asteroid
// let craterSize = {
//   min: calculatedCraterMin,
//   max: calculatedCraterMax,
// };

function initMap() {
  // Create the map.
  let map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: citymap[Object.keys(citymap)[0]].center,
    mapTypeId: 'hybrid',
    disableDefaultUI: true,
    zoomControl: true,

  });

  // Construct the circle for each value in citymap.
  for (let city in citymap) {
    // Add the circle for this city to the map.
    let minAsteroidCircle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#FF0000',
      fillOpacity: 0.15,
      map: map,
      center: citymap[city].center,
      radius: asteroidSize['min'],
    });

    let maxAsteroidCircle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#FF0000',
      fillOpacity: 0.25,
      map: map,
      center: citymap[city].center,
      radius: asteroidSize['max'],
    });

    // let minCraterCircle = new google.maps.Circle({
    //   strokeColor: '#FF0000',
    //   strokeOpacity: 0.5,
    //   strokeWeight: 1,
    //   fillColor: '#FF0000',
    //   fillOpacity: 0.15,
    //   map: map,
    //   center: citymap[city].center,
    //   radius: craterSize['min'],
    // });

    // let maxCraterCircle = new google.maps.Circle({
    //   strokeColor: '#FF0000',
    //   strokeOpacity: 0.5,
    //   strokeWeight: 1,
    //   fillColor: '#FF0000',
    //   fillOpacity: 0.25,
    //   map: map,
    //   center: citymap[city].center,
    //   radius: craterSize['max'],
    // });
  }
}
