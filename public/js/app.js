'use strict';

$(()=>{
  //scales used on location page.
  $('#images-container').on('click', () => {
    $('#astronaut-scale-image').css('transform',`scale(${personScale})`);//eslint-disable-line
    $('#asteroid-scale-image').css('transform',`scale(${asteroidScale})`);//eslint-disable-line
    $('#needle-scale-image').css('transform',`scale(${needleScale})`);//eslint-disable-line

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

  let likedButtons = localStorage.getItem('likedAsteroid');

  $('.likedbutton').on('click', function() {
    likeAnimation(this);
    (this.id) ? $.post('/likeAsteroid/', {id : this.id}) : '';

    likedButtons = localStorage.getItem('likedAsteroid');
    if (!likedButtons || !likedButtons.includes(`_${this.id}_`)) {
      localStorage.setItem('likedAsteroid', `${(likedButtons) ? likedButtons:''}_${this.id}_`);
      $(this).off('click').on('click', function() {
        likeAnimation(this);
      });
    }
  });

  if (likedButtons) {
    Object.values($('.likedbutton')).forEach(button => {
      if (likedButtons.includes(`_${button.id}_`)) {
        likeAnimation($(button));
        $(button).off('click').on('click', function() {
          likeAnimation(this);
        });
      }
    })
  }

  function likeAnimation(button) {
    $(button).hide().css({'color': 'red', 'zoom': '1.05'}).fadeIn(400);
  }
});

//sets the coordinates for the google map to start in the downtwon Seattle
let citymap = {
  seattle: {
    center: {lat: 47.6062, lng: -122.3321},
  },
};

//initMap is called inside the API url on our location page.
//all portions of function are called and defined on ejs pages.
function initMap() {//eslint-disable-line
  // Create the map.
  let map = new google.maps.Map(document.getElementById('map'), {//eslint-disable-line
    zoom: 13,
    center: citymap[Object.keys(citymap)[0]].center,
    mapTypeId: 'hybrid',
    disableDefaultUI: true,
    zoomControl: true,

  });

  // Construct the circle for each value in citymap.
  for (let city in citymap) {
    // Add the circle for this city to the map.
    let minAsteroidCircle = new google.maps.Circle({//eslint-disable-line
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#FF0000',
      fillOpacity: 0.15,
      map: map,
      center: citymap[city].center,
      radius: asteroidSize['min'],//eslint-disable-line
    });

    let maxAsteroidCircle = new google.maps.Circle({//eslint-disable-line
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#FF0000',
      fillOpacity: 0.25,
      map: map,
      center: citymap[city].center,
      radius: asteroidSize['max'],//eslint-disable-line
    });
  }
}
