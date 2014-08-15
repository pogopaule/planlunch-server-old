var Hapi = require('hapi'),
    _ = require('underscore'),
    Joi = require('joi'),
    CronJob = require('cron').CronJob;


new CronJob('0 0 14 * * 1-5', function(){
  server.initPlaces();
}, null, true, 'Europe/Berlin');





var port = process.env.PORT || 8080;
var server = new Hapi.Server(port, {cors: true});

server.places = require('./places.js');
server.initPlaces = function() {
  _.each(server.places, function(place) {
    delete place.users;
  });
}

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
        user: Joi.string().required(),
        action: Joi.string().required()
      })
    }
  },
  handler: function(request, reply) {
    if(request.payload.action === 'withdraw') {
      removeUserFromPlaces(request.payload.user);
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
        user: Joi.string().required(),
        time_slot: Joi.valid('11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00')
      })
    }
  },
  handler: function(request, reply) {
    var user = request.payload.user;
    var timeSlot = request.payload.time_slot;
    removeUserFromPlaces(user);
    addUserToPlace(user, timeSlot, request.params.name);

    reply();
  }
});

if(!isTest()) {
  server.start(function() {
    console.log('server started', server.info.uri);
  });
}






function isTest() {
  return module.parent;
}

function removeUserFromPlaces(user) {
  _.each(server.places, function(place) {
    if(place.hasOwnProperty('time_slots')) {
      for(var timeSlot in place.time_slots){
        place.time_slots[timeSlot] = _.without(place.time_slots[timeSlot], user);
      }
    }
  });
}

function addUserToPlace(user, timeSlot, placeName) {
  var place = _.find(server.places, function(place) {
    return place.name === placeName
  });

  if(!place.time_slots) {
    place.time_slots = {};
  }
  if(!place.time_slots.hasOwnProperty(timeSlot)) {
    place.time_slots[timeSlot] = [];
  }

  place.time_slots[timeSlot].push(user);
}


module.exports = server;
