var Hapi = require('hapi'),
    _ = require('underscore'),
    Joi = require('joi'),
    CronJob = require('cron').CronJob;



new CronJob('0 0 14 * * 1-5', function(){
  initPlaces();
}, null, true, 'Europe/Berlin');





var port = process.env.PORT || 8080;
var server = new Hapi.Server(port, {cors: true});

server.route({
  method: 'GET',
  path: '/places',
  handler: function(request, reply) {
    reply(server.places);
  }
});

server.route({
  method: 'POST',
  path: '/places',
  config: {
    validate: {
      payload: Joi.object().keys({
        attendee: Joi.string().required(),
        action: Joi.string().required()
      })
    }
  },
  handler: function(request, reply) {
    if(request.payload.action === 'withdraw') {
      removeAttendeeFromPlaces(request.payload.attendee);
    }
    reply();
  }
});

server.route({
  method: 'POST',
  path: '/places/{name}',
  config: {
    validate: {
      payload: Joi.object().keys({
        attendee: Joi.string().required()
      })
    }
  },
  handler: function(request, reply) {
    var attendee = request.payload.attendee;
    removeAttendeeFromPlaces(attendee);
    addAttendeeToPlace(attendee, request.params.name);

    reply();
  }
});

initPlaces();

if(!isTest()) {
  server.start(function() {
    console.log('server started', server.info.uri);
  });
}






function isTest() {
  return module.parent;
}

function removeAttendeeFromPlaces(attendee) {
  var placeAttendedByAttendee = _.each(server.places, function(place) {
    if(place.attendees) {
      place.attendees = _.without(place.attendees, attendee);
    }
  });
}

function addAttendeeToPlace(attendee, placeName) {
  var place = _.find(server.places, function(place) {
    return place.name === placeName
  });

  if(!place.attendees) {
    place.attendees = [];
  }

  place.attendees.push(attendee);
}

function initPlaces() {
  server.places = require('./places.js');
}

module.exports = server;
