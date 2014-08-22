var Hapi = require('hapi'),
    _ = require('underscore'),
    Joi = require('joi'),
    CronJob = require('cron').CronJob;

Object.prototype.findTimeSlot = function(time) {
  return _.find(this.time_slots, function(timeSlot) {
     return timeSlot.time === time;
  });
}

new CronJob('0 0 14 * * 1-5', function(){
  server.initPlaces();
}, null, true, 'Europe/Berlin');





var port = process.env.PORT || 8080,
    server = new Hapi.Server(port, {cors: true});

server.places = require('./places.js');
server.initPlaces = function() {
  _.each(server.places, function(place) {
    delete place.time_slots;
  });
}

var bannedUserNames = ['sex', 'tits', 'ass', 'porn', 'fuck', 'poo', 'pee', 'dong', 'fick', 'gay'],
    userSchema = Joi.string().regex(/^[a-z]{3,4}$/).invalid(bannedUserNames).required();

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
        time_slot: Joi.valid('11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00').required()
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
      _.each(place.time_slots, function(timeSlot, index, timeSlots) {
        timeSlot.users = _.without(timeSlot.users, user);
        if(timeSlot.users.length == 0) {
          timeSlots.splice(index, 1);
        }
      });
    }
  });
}

function addUserToPlace(user, time, placeName) {
  var place = _.find(server.places, function(place) {
    return place.name === placeName
  });

  if(!place.time_slots) {
    place.time_slots = [];
  }

  if(!place.findTimeSlot(time)) {
    place.time_slots.push({time: time, users: []});
  }

  place.time_slots = _.sortBy(place.time_slots, function(timeSlot) {
    return timeSlot.time;
  })

  place.findTimeSlot(time).users.push(user);
}


module.exports = server;
