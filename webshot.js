var webshot = require('webshot'),
    places = require('./places.js'),
    _ = require('underscore');

// pdf mit https://cloudconvert.org/page/api
_.each(places, function(place) {
  if(place.webshot) {
    place.webshot.windowSize = { width: 1280, height: 800 }
    webshot(place.website, place.name + '.png', place.webshot, function() {
      console.log(place.name);
    });
  }
});
