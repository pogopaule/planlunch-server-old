var Hapi = require('hapi'),
    _ = require('underscore'),
    Joi = require('joi'),
    Place = require('./place.js'),
    cron = require('./cronjobs.js');


var port = process.env.PORT || 8080,
    server = new Hapi.Server(port, {cors: true}),
    places = createPlaces(),

    userSchema = Joi.string().regex(/^[a-z]{3,4}$/).required(),
    timeSlotSchema = Joi.valid('11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00').required();


server.route({
  method: 'GET',
  path: '/places',
  handler: function(request, reply) {
    reply(places);
  }
});

server.route({
  method: 'POST',
  path: '/places',
  config: {
    validate: {
      payload: Joi.object().keys({
        user: userSchema,
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
        user: userSchema,
        time_slot: timeSlotSchema
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
    cron(function() {
      places = createPlaces();
    });
    console.log('server started', server.info.uri);
  });
}


function isTest() {
  return module.parent;
}

function removeUserFromPlaces(user) {
  _.each(places, function(place) {
    place.removeUser(user);
  });
}

function addUserToPlace(user, time, placeName) {
  var place = _.find(places, function(place) {
    return place.name === placeName
  });

  place.addUser(user, time);
}

function createPlaces() {
  return _.map(require('./places'), function(place) {
    return new Place(place.name, place.geo, place.website, place.tags, place.distance);
  });
}


module.exports = {
  server: server,
  places: places
};
