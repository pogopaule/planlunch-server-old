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
        user: Joi.string().required()
      })
    }
  },
  handler: function(request, reply) {
    var user = request.payload.user;
    removeUserFromPlaces(user);
    addUserToPlace(user, request.params.name);

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
  var placeAttendedByUser = _.each(server.places, function(place) {
    if(place.users) {
      place.users = _.without(place.users, user);
    }
  });
}

function addUserToPlace(user, placeName) {
  var place = _.find(server.places, function(place) {
    return place.name === placeName
  });

  if(!place.users) {
    place.users = [];
  }

  place.users.push(user);
}


module.exports = server;
